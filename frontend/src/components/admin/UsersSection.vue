<script setup lang="ts">
import { ref, computed, defineAsyncComponent, onMounted } from 'vue'
import { useUserStore } from '@/stores/user'
import type { User } from '@/types/user'

interface FilterOption {
  value: string
  label: string
  active: boolean
}

interface TableHeader {
  text: string
  value: keyof (User & { name: string; actions: string }) | 'actions'
  sortable: boolean
}

// Using a type instead of extending User to avoid type incompatibility
type ExtendedUser = User & {
  name: string
  displayRole: string
  displayStatus: string
}

const UserDetailsModal = defineAsyncComponent(
  () => import('@/components/modals/UserDetailsModal.vue'),
)
const UserEditModal = defineAsyncComponent(() => import('@/components/modals/UserEditModal.vue'))

const userStore = useUserStore()

// Loading state for initial data fetch
const isLoading = ref(false)

// Search and filter state
const searchQuery = ref<string>('')
const sortBy = ref<string>('name')
const sortDesc = ref<boolean>(false)
const currentPage = ref<number>(1)
const itemsPerPage = ref<number>(10)

// Fetch all users from the API when component is mounted
onMounted(async () => {
  try {
    isLoading.value = true
    await userStore.fetchAllUsers()
  } catch (error) {
    console.error('Error fetching users:', error)
  } finally {
    isLoading.value = false
  }
})

// Get all users from the store
const users = computed((): User[] => userStore.users || [])

// Table headers with sorting capability
const headers: TableHeader[] = [
  { text: 'LTO Client ID', value: 'ltoClientId', sortable: true },
  { text: 'Name', value: 'name', sortable: true },
  { text: 'Email', value: 'email', sortable: true },
  { text: 'Role', value: 'role', sortable: true },
  { text: 'Status', value: 'status', sortable: true },
  { text: 'Actions', value: 'actions', sortable: false },
]

// Status filters
const statusFilters = ref<FilterOption[]>([
  { value: 'all', label: 'All Status', active: true },
  { value: 'active', label: 'Active', active: false },
  { value: 'pending', label: 'Pending', active: false },
  { value: 'inactive', label: 'Inactive', active: false },
])

// Role filters
const roleFilters = ref<FilterOption[]>([
  { value: 'all', label: 'All Roles', active: true },
  { value: 'admin', label: 'Admin', active: false },
  { value: 'user', label: 'User', active: false },
  { value: 'lto officer', label: 'LTO Officer', active: false },
])

// Active filters
const activeStatusFilter = computed((): string => {
  const filter = statusFilters.value.find((f) => f.active === true)
  return filter ? filter.value : 'all'
})

const activeRoleFilter = computed((): string => {
  const filter = roleFilters.value.find((f) => f.active === true)
  return filter ? filter.value : 'all'
})

// Apply status filter
const setStatusFilter = (value: string): void => {
  statusFilters.value = statusFilters.value.map((filter) => ({
    ...filter,
    active: filter.value === value,
  }))
}

// Apply role filter
const setRoleFilter = (value: string): void => {
  roleFilters.value = roleFilters.value.map((filter) => ({
    ...filter,
    active: filter.value === value,
  }))
}

// Format and filter users
const filteredUsers = computed((): ExtendedUser[] => {
  return users.value
    .map((user) => {
      return {
        ...user,
        name: `${user.firstName} ${user.lastName}`,
        displayRole: user.role.charAt(0).toUpperCase() + user.role.slice(1),
        displayStatus: user.status.charAt(0).toUpperCase() + user.status.slice(1),
      } as ExtendedUser
    })
    .filter((user) => {
      const matchesSearch =
        searchQuery.value === '' ||
        user.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
        user.ltoClientId.toLowerCase().includes(searchQuery.value.toLowerCase())

      const matchesStatus =
        activeStatusFilter.value === 'all' || user.status.toLowerCase() === activeStatusFilter.value
      const matchesRole =
        activeRoleFilter.value === 'all' || user.role.toLowerCase() === activeRoleFilter.value

      return matchesSearch && matchesStatus && matchesRole
    })
    .sort((a, b) => {
      const modifier = sortDesc.value ? -1 : 1
      const aValue = a[sortBy.value as keyof ExtendedUser]
      const bValue = b[sortBy.value as keyof ExtendedUser]
      if (aValue !== undefined && bValue !== undefined && aValue < bValue) return -1 * modifier
      if (bValue !== undefined && aValue !== undefined && aValue > bValue) return 1 * modifier
      return 0
    })
})

// Pagination
const totalPages = computed((): number =>
  Math.ceil(filteredUsers.value.length / itemsPerPage.value),
)
const paginatedUsers = computed((): ExtendedUser[] => {
  const start = (currentPage.value - 1) * itemsPerPage.value
  const end = start + itemsPerPage.value
  return filteredUsers.value.slice(start, end)
})

// Status badge color
const getStatusColor = (status: string): string => {
  switch (status.toLowerCase()) {
    case 'active':
      return 'bg-green-100 text-green-800'
    case 'pending':
      return 'bg-yellow-100 text-yellow-800'
    case 'inactive':
      return 'bg-red-100 text-red-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

const getRoleColor = (role: string): string => {
  switch (role.toLowerCase()) {
    case 'admin':
      return 'bg-purple-100 text-purple-800'
    case 'user':
      return 'bg-blue-100 text-blue-800'
    case 'lto officer':
      return 'bg-cyan-100 text-cyan-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

// Modal state
const showUserModal = ref<boolean>(false)
const showEditModal = ref<boolean>(false)
const showConfirmModal = ref<boolean>(false)
const selectedUser = ref<ExtendedUser | null>(null)
const confirmAction = ref<string>('')

// Notification state
const showNotification = ref<boolean>(false)
const notificationMessage = ref<string>('')
const notificationType = ref<'success' | 'error' | 'info'>('success')
const notificationProgress = ref<number>(0)

// Modal handlers
const openUserModal = (user: ExtendedUser): void => {
  selectedUser.value = user
  showUserModal.value = true
}

const closeUserModal = (): void => {
  showUserModal.value = false
  selectedUser.value = null
}

const openEditModal = (user: ExtendedUser): void => {
  selectedUser.value = user
  showEditModal.value = true
}

const closeEditModal = (): void => {
  showEditModal.value = false
  selectedUser.value = null
}

const handleUserUpdate = async (updatedUser: User): Promise<void> => {
  try {
    // Reset and show notification
    notificationProgress.value = 100
    notificationMessage.value = `Updating user ${updatedUser.firstName} ${updatedUser.lastName}...`
    notificationType.value = 'info'
    showNotification.value = true
    
    // Refresh the users list to ensure we have the most up-to-date data
    await userStore.fetchAllUsers()
    
    // Show success notification
    notificationMessage.value = `User ${updatedUser.firstName} ${updatedUser.lastName} updated successfully`
    notificationType.value = 'success'
    
    // Animate progress bar
    let timeLeft = 100
    const interval = setInterval(() => {
      timeLeft -= 2
      notificationProgress.value = timeLeft

      if (timeLeft <= 0) {
        clearInterval(interval)
        showNotification.value = false
      }
    }, 100)
    
    // Close the edit modal
    closeEditModal()
  } catch (error) {
    console.error('Error refreshing user list after update:', error)
    
    // Show error notification
    notificationMessage.value = 'Failed to refresh user data. Please reload the page.'
    notificationType.value = 'error'
    
    // Animate progress bar
    let timeLeft = 100
    const interval = setInterval(() => {
      timeLeft -= 2
      notificationProgress.value = timeLeft

      if (timeLeft <= 0) {
        clearInterval(interval)
        showNotification.value = false
      }
    }, 100)
  }
}

// Sorting handlers
const sort = (header: TableHeader): void => {
  if (!header.sortable) return
  if (sortBy.value === header.value) {
    sortDesc.value = !sortDesc.value
  } else {
    sortBy.value = header.value
    sortDesc.value = false
  }
}

// Toggle User Status with confirmation
const initiateStatusToggle = (user: ExtendedUser): void => {
  selectedUser.value = user
  confirmAction.value = user.status.toLowerCase() === 'active' ? 'deactivate' : 'activate'
  showConfirmModal.value = true
}

const cancelStatusToggle = (): void => {
  showConfirmModal.value = false
  selectedUser.value = null
}

const confirmStatusToggle = async (): Promise<void> => {
  if (!selectedUser.value) return
  
  try {
    // Set notification to loading state
    notificationProgress.value = 100
    notificationMessage.value = `Updating status for ${selectedUser.value.name}...`
    notificationType.value = 'info'
    showNotification.value = true
    
    // Prepare update data
    const newStatus = selectedUser.value.status.toLowerCase() === 'active' ? 'inactive' : 'active'
    const userId = selectedUser.value.ltoClientId
    
    // Update the user status
    await userStore.updateUser(userId, { status: newStatus })
    
    // Refresh the users list
    await userStore.fetchAllUsers()
    
    // Close the confirmation modal
    showConfirmModal.value = false
    selectedUser.value = null
    
    // Show success notification
    notificationMessage.value = `User ${newStatus === 'active' ? 'activated' : 'deactivated'} successfully`
    notificationType.value = 'success'
    
    // Animate progress bar
    let timeLeft = 100
    const interval = setInterval(() => {
      timeLeft -= 2
      notificationProgress.value = timeLeft
      
      if (timeLeft <= 0) {
        clearInterval(interval)
        showNotification.value = false
      }
    }, 100)
  } catch (error) {
    console.error('Error updating user status:', error)
    
    // Show error notification
    notificationMessage.value = `Error updating user status: ${error}`
    notificationType.value = 'error'
    
    // Animate progress bar
    let timeLeft = 100
    const interval = setInterval(() => {
      timeLeft -= 2
      notificationProgress.value = timeLeft
      
      if (timeLeft <= 0) {
        clearInterval(interval)
        showNotification.value = false
      }
    }, 100)
  }
}
</script>

<template>
  <div>
    <!-- Success/Error Notification -->
    <transition name="slide-notification">
      <div
        v-if="showNotification"
        class="fixed top-6 left-1/2 transform -translate-x-1/2 z-50 shadow-lg rounded-md overflow-hidden max-w-md"
      >
        <div class="flex items-center bg-white">
          <div
            :class="[
              'w-2 h-full mr-3',
              notificationType === 'success' ? 'bg-green-500' : notificationType === 'info' ? 'bg-blue-500' : 'bg-red-500',
            ]"
          ></div>
          <div class="flex items-center p-3 pr-4">
            <div
              :class="[
                'flex items-center justify-center w-8 h-8 rounded-full mr-3',
                notificationType === 'success' ? 'bg-green-100' : notificationType === 'info' ? 'bg-blue-100' : 'bg-red-100',
              ]"
            >
              <font-awesome-icon
                :icon="['fas', notificationType === 'success' ? 'check' : notificationType === 'info' ? 'info' : 'exclamation']"
                :class="notificationType === 'success' ? 'text-green-500' : notificationType === 'info' ? 'text-blue-500' : 'text-red-500'"
                class="text-sm"
              />
            </div>
            <div>
              <p class="font-medium text-gray-800">{{ notificationMessage }}</p>
            </div>
            <button
              @click="showNotification = false"
              class="ml-4 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <font-awesome-icon :icon="['fas', 'times']" />
            </button>
          </div>
        </div>
        <!-- Progress bar -->
        <div class="bg-gray-100 h-1 w-full">
          <div
            :class="[
              'h-full transition-all duration-300 ease-linear',
              notificationType === 'success' ? 'bg-green-500' : notificationType === 'info' ? 'bg-blue-500' : 'bg-red-500',
            ]"
            :style="{ width: notificationProgress + '%' }"
          ></div>
        </div>
      </div>
    </transition>

    <div class="flex justify-between items-center mb-8">
      <div>
        <h2 class="text-2xl font-bold text-dark-blue">User Management</h2>
        <p class="text-gray mt-1">Manage user accounts and permissions</p>
      </div>
    </div>

    <!-- Filters and Search -->
    <div class="bg-white rounded-xl shadow-md border border-light-gray border-opacity-20 p-6 mb-8">
      <div class="space-y-5">
        <!-- Search Bar -->
        <div class="relative">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search by name, email, or ID..."
            class="w-full pl-10 pr-4 py-3 rounded-lg bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-light-blue focus:border-transparent transition-all"
          />
          <font-awesome-icon
            :icon="['fas', 'search']"
            class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray"
          />
        </div>

        <div class="flex flex-col md:flex-row md:justify-between gap-4">
          <!-- Status Filters -->
          <div>
            <h3 class="text-sm font-medium text-gray mb-2">Filter by Status</h3>
            <div class="flex flex-wrap gap-2">
              <button
                v-for="filter in statusFilters"
                :key="filter.value"
                @click="setStatusFilter(filter.value)"
                :class="[
                  'px-4 py-2 text-sm font-medium rounded-lg transition-colors duration-200',
                  filter.active
                    ? 'bg-dark-blue text-white shadow-sm'
                    : 'bg-gray-50 text-gray hover:bg-light-blue hover:bg-opacity-10',
                ]"
              >
                {{ filter.label }}
              </button>
            </div>
          </div>

          <!-- Role Filters -->
          <div>
            <h3 class="text-sm font-medium text-gray mb-2">Filter by Role</h3>
            <div class="flex flex-wrap gap-2">
              <button
                v-for="filter in roleFilters"
                :key="filter.value"
                @click="setRoleFilter(filter.value)"
                :class="[
                  'px-4 py-2 text-sm font-medium rounded-lg transition-colors duration-200',
                  filter.active
                    ? 'bg-dark-blue text-white shadow-sm'
                    : 'bg-gray-50 text-gray hover:bg-light-blue hover:bg-opacity-10',
                ]"
              >
                {{ filter.label }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Users Table -->
    <div
      class="bg-white rounded-xl shadow-md border border-light-gray border-opacity-20 overflow-hidden mb-6"
    >
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th
                v-for="header in headers"
                :key="header.value"
                @click="sort(header)"
                class="px-6 py-4 text-left text-xs font-medium text-gray uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                :class="{ 'cursor-default': !header.sortable }"
              >
                <div class="flex items-center gap-2">
                  {{ header.text }}
                  <span v-if="header.sortable" class="text-gray-400">
                    <font-awesome-icon
                      v-if="sortBy === header.value"
                      :icon="['fas', sortDesc ? 'sort-down' : 'sort-up']"
                    />
                    <font-awesome-icon v-else :icon="['fas', 'sort']" />
                  </span>
                </div>
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <!-- Loading state -->
            <tr v-if="isLoading" class="hover:bg-gray-50">
              <td colspan="6" class="px-6 py-10 text-center text-gray">
                <div class="flex flex-col items-center justify-center space-y-3">
                  <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-light-blue mb-4"></div>
                  <p class="text-gray-600">Loading users...</p>
                </div>
              </td>
            </tr>
            <!-- No data state -->
            <tr v-else-if="paginatedUsers.length === 0" class="hover:bg-gray-50">
              <td colspan="6" class="px-6 py-10 text-center text-gray">
                <div class="flex flex-col items-center justify-center space-y-3">
                  <font-awesome-icon :icon="['fas', 'users-slash']" class="text-4xl text-gray-400 mb-2" />
                  <p class="text-gray-600 font-medium">No users found</p>
                  <p class="text-gray-500">
                    {{ filteredUsers.length === 0 ? 'No users exist yet' : 'Try adjusting your filters' }}
                  </p>
                </div>
              </td>
            </tr>
            <tr
              v-else
              v-for="user in paginatedUsers"
              :key="user.ltoClientId"
              class="hover:bg-gray-50 transition-colors"
            >
              <td class="px-6 py-4 whitespace-nowrap">
                <span class="text-sm font-medium text-dark-blue">{{ user.ltoClientId }}</span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                  <div
                    class="flex-shrink-0 h-10 w-10 bg-light-blue bg-opacity-10 rounded-full flex items-center justify-center"
                  >
                    <font-awesome-icon :icon="['fas', 'user']" class="text-light-blue" />
                  </div>
                  <div class="ml-4">
                    <div class="text-sm font-medium text-dark-blue">{{ user.name }}</div>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-700">{{ user.email }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span
                  :class="[
                    'px-3 py-1 rounded-full text-xs font-medium inline-flex items-center',
                    getRoleColor(user.displayRole),
                  ]"
                >
                  <span
                    class="h-1.5 w-1.5 rounded-full mr-1.5"
                    :class="
                      user.role.toLowerCase() === 'admin'
                        ? 'bg-purple-700'
                        : user.role.toLowerCase() === 'user'
                          ? 'bg-blue-700'
                          : user.role.toLowerCase() === 'lto officer'
                            ? 'bg-cyan-700'
                            : 'bg-gray-700'
                    "
                  ></span>
                  {{ user.displayRole }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span
                  :class="[
                    'px-3 py-1 rounded-full text-xs font-medium inline-flex items-center',
                    getStatusColor(user.displayStatus),
                  ]"
                >
                  <span
                    class="h-1.5 w-1.5 rounded-full mr-1.5"
                    :class="[
                      user.status.toLowerCase() === 'active'
                        ? 'bg-green-700'
                        : user.status.toLowerCase() === 'pending'
                          ? 'bg-yellow-700'
                          : 'bg-red-700',
                    ]"
                  ></span>
                  {{ user.displayStatus }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center gap-3">
                  <button
                    class="text-light-blue hover:text-dark-blue transition-colors flex items-center gap-1 text-sm"
                    @click="openUserModal(user)"
                  >
                    <font-awesome-icon :icon="['fas', 'eye']" />
                    <span>View</span>
                  </button>
                  <button
                    class="text-light-blue hover:text-dark-blue transition-colors flex items-center gap-1 text-sm"
                    @click="openEditModal(user)"
                  >
                    <font-awesome-icon :icon="['fas', 'edit']" />
                    <span>Edit</span>
                  </button>
                  <button
                    :class="[
                      'transition-colors flex items-center gap-1 text-sm',
                      user.status.toLowerCase() === 'active'
                        ? 'text-red hover:text-red-700'
                        : 'text-green-600 hover:text-green-800',
                    ]"
                    @click="initiateStatusToggle(user)"
                  >
                    <font-awesome-icon
                      :icon="[
                        'fas',
                        user.status.toLowerCase() === 'active' ? 'ban' : 'check-circle',
                      ]"
                    />
                    <span>{{
                      user.status.toLowerCase() === 'active' ? 'Deactivate' : 'Activate'
                    }}</span>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div class="px-6 py-4 bg-gray-50 border-t border-gray-200">
        <div class="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div class="text-sm text-gray">
            Showing {{ filteredUsers.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0 }} to
            {{ Math.min(currentPage * itemsPerPage, filteredUsers.length) }} of
            {{ filteredUsers.length }} users
          </div>
          <div class="flex items-center gap-2">
            <button
              @click="currentPage--"
              :disabled="currentPage === 1 || filteredUsers.length === 0"
              class="p-2 rounded-lg border border-gray-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 transition-colors"
            >
              <font-awesome-icon :icon="['fas', 'chevron-left']" />
            </button>
            <span class="text-sm text-gray font-medium px-4">
              Page {{ filteredUsers.length > 0 ? currentPage : 0 }} of {{ totalPages }}
            </span>
            <button
              @click="currentPage++"
              :disabled="currentPage === totalPages || filteredUsers.length === 0"
              class="p-2 rounded-lg border border-gray-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 transition-colors"
            >
              <font-awesome-icon :icon="['fas', 'chevron-right']" />
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- User Details Modal -->
    <UserDetailsModal
      v-if="selectedUser && showUserModal"
      :show="showUserModal"
      :user="selectedUser"
      @close="closeUserModal"
    />

    <!-- User Edit Modal -->
    <UserEditModal
      v-if="selectedUser && showEditModal"
      :show="showEditModal"
      :user="selectedUser"
      @close="closeEditModal"
      @update="handleUserUpdate"
    />

    <!-- Status Toggle Confirmation Modal -->
    <div
      v-if="showConfirmModal"
      class="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4"
      @click.self="cancelStatusToggle"
    >
      <div class="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden">
        <div class="bg-gradient-to-r from-dark-blue to-blue-800 px-6 py-4">
          <h3 class="text-xl font-bold text-white">
            {{ confirmAction === 'deactivate' ? 'Deactivate User' : 'Activate User' }}
          </h3>
        </div>
        <div class="p-6">
          <div class="mb-4">
            <font-awesome-icon
              :icon="confirmAction === 'deactivate' ? ['fas', 'user-slash'] : ['fas', 'user-check']"
              class="text-3xl mb-2"
              :class="confirmAction === 'deactivate' ? 'text-red-500' : 'text-green-500'"
            />
            <p class="text-gray-700">
              Are you sure you want to
              <span
                class="font-semibold"
                :class="confirmAction === 'deactivate' ? 'text-red-600' : 'text-green-600'"
              >
                {{ confirmAction }}
              </span>
              this user?
            </p>
            <p v-if="confirmAction === 'deactivate'" class="mt-2 text-sm text-gray-600">
              <font-awesome-icon :icon="['fas', 'exclamation-triangle']" class="text-yellow-500 mr-1" />
              Deactivated users will no longer be able to log in to the system.
            </p>
          </div>
          <div class="bg-gray-50 p-4 rounded-lg mb-4" v-if="selectedUser">
            <div class="flex items-center">
              <div
                class="w-10 h-10 rounded-full bg-light-blue bg-opacity-10 flex items-center justify-center mr-3"
              >
                <font-awesome-icon :icon="['fas', 'user']" class="text-light-blue" />
              </div>
              <div>
                <div class="font-medium text-gray-800">{{ selectedUser.name }}</div>
                <div class="text-sm text-gray-500">{{ selectedUser.email }}</div>
              </div>
            </div>
          </div>
          <div class="flex justify-end space-x-3">
            <button
              @click="cancelStatusToggle"
              class="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none transition-colors"
            >
              Cancel
            </button>
            <button
              @click="confirmStatusToggle"
              class="px-4 py-2 rounded-md shadow-sm text-sm font-medium text-white focus:outline-none transition-colors"
              :class="
                confirmAction === 'deactivate'
                  ? 'bg-red-600 hover:bg-red-700'
                  : 'bg-green-600 hover:bg-green-700'
              "
            >
              {{ confirmAction === 'deactivate' ? 'Deactivate' : 'Activate' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.slide-notification-enter-active,
.slide-notification-leave-active {
  transition: all 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}
.slide-notification-enter-from {
  transform: translate(-50%, -100px);
  opacity: 0;
}
.slide-notification-leave-to {
  transform: translate(-50%, -100px);
  opacity: 0;
}
</style>
