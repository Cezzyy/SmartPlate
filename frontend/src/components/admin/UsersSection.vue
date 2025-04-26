<script setup>
import { ref, computed, defineAsyncComponent } from 'vue'
import { useUserStore } from '@/stores/user'

const UserDetailsModal = defineAsyncComponent(
  () => import('@/components/modals/UserDetailsModal.vue'),
)

const userStore = useUserStore()

// Search and filter state
const searchQuery = ref('')
const sortBy = ref('name')
const sortDesc = ref(false)
const currentPage = ref(1)
const itemsPerPage = ref(10)

// Get all users from the store
const users = computed(() => userStore.mockUsers)

// Table headers with sorting capability
const headers = [
  { text: 'LTO Client ID', value: 'ltoClientId', sortable: true },
  { text: 'Name', value: 'name', sortable: true },
  { text: 'Email', value: 'email', sortable: true },
  { text: 'Role', value: 'role', sortable: true },
  { text: 'Status', value: 'status', sortable: true },
  { text: 'Actions', value: 'actions', sortable: false },
]

// Status filters
const statusFilters = ref([
  { value: 'all', label: 'All Status', active: true },
  { value: 'active', label: 'Active', active: false },
  { value: 'pending', label: 'Pending', active: false },
  { value: 'inactive', label: 'Inactive', active: false },
])

// Role filters
const roleFilters = ref([
  { value: 'all', label: 'All Roles', active: true },
  { value: 'admin', label: 'Admin', active: false },
  { value: 'user', label: 'User', active: false },
])

// Active filters
const activeStatusFilter = computed(() => {
  const filter = statusFilters.value.find((f) => f.active === true)
  return filter ? filter.value : 'all'
})

const activeRoleFilter = computed(() => {
  const filter = roleFilters.value.find((f) => f.active === true)
  return filter ? filter.value : 'all'
})

// Apply status filter
const setStatusFilter = (value) => {
  statusFilters.value = statusFilters.value.map((filter) => ({
    ...filter,
    active: filter.value === value,
  }))
}

// Apply role filter
const setRoleFilter = (value) => {
  roleFilters.value = roleFilters.value.map((filter) => ({
    ...filter,
    active: filter.value === value,
  }))
}

// Format and filter users
const filteredUsers = computed(() => {
  return users.value
    .map((user) => ({
      ...user,
      name: `${user.firstName} ${user.lastName}`,
      role: user.role.charAt(0).toUpperCase() + user.role.slice(1),
      status: user.status.charAt(0).toUpperCase() + user.status.slice(1),
    }))
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
      if (a[sortBy.value] < b[sortBy.value]) return -1 * modifier
      if (a[sortBy.value] > b[sortBy.value]) return 1 * modifier
      return 0
    })
})

// Pagination
const totalPages = computed(() => Math.ceil(filteredUsers.value.length / itemsPerPage.value))
const paginatedUsers = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value
  const end = start + itemsPerPage.value
  return filteredUsers.value.slice(start, end)
})

// Status badge color
const getStatusColor = (status) => {
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

const getRoleColor = (role) => {
  switch (role.toLowerCase()) {
    case 'admin':
      return 'bg-purple-100 text-purple-800'
    case 'user':
      return 'bg-blue-100 text-blue-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

// Modal state
const showUserModal = ref(false)
const selectedUser = ref(null)

// Modal handlers
const openUserModal = (user) => {
  selectedUser.value = user
  showUserModal.value = true
}

const closeUserModal = () => {
  showUserModal.value = false
  selectedUser.value = null
}

// Sorting handlers
const sort = (header) => {
  if (!header.sortable) return
  if (sortBy.value === header.value) {
    sortDesc.value = !sortDesc.value
  } else {
    sortBy.value = header.value
    sortDesc.value = false
  }
}
</script>

<template>
  <div class="p-6">
    <div class="flex justify-between items-center mb-6">
      <h2 class="text-2xl font-semibold text-gray-800">Users Management</h2>
    </div>

    <!-- Filters and Search -->
    <div class="bg-white rounded-lg shadow-sm p-4 mb-6">
      <div class="space-y-4">
        <!-- Search Bar -->
        <div class="relative">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search by name, email, or ID..."
            class="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-dark-blue/20 transition-all"
          />
          <div class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
            <i class="fas fa-search w-4 h-4"></i>
          </div>
        </div>

        <!-- Status and Role Filters -->
        <div class="flex flex-wrap gap-2">
          <!-- Status Filters -->
          <button
            v-for="filter in statusFilters"
            :key="filter.value"
            @click="setStatusFilter(filter.value)"
            :class="[
              'px-3 py-1 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-dark-blue',
              filter.active
                ? 'bg-dark-blue text-white rounded-md'
                : 'text-gray-700 hover:bg-gray-100 rounded-md',
            ]"
          >
            {{ filter.label }}
          </button>

          <!-- Role Filters -->
          <button
            v-for="filter in roleFilters"
            :key="filter.value"
            @click="setRoleFilter(filter.value)"
            :class="[
              'px-3 py-1 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-dark-blue',
              filter.active
                ? 'bg-dark-blue text-white rounded-md'
                : 'text-gray-700 hover:bg-gray-100 rounded-md',
            ]"
          >
            {{ filter.label }}
          </button>
        </div>
      </div>
    </div>

    <!-- Users Table -->
    <div class="bg-white rounded-lg shadow overflow-hidden">
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th
                v-for="header in headers"
                :key="header.value"
                @click="sort(header)"
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
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
            <tr
              v-for="user in paginatedUsers"
              :key="user.ltoClientId"
              class="hover:bg-gray-50 transition-colors"
            >
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {{ user.ltoClientId }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {{ user.name }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {{ user.email }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                <span
                  :class="['px-2 py-1 rounded-full text-xs font-medium', getRoleColor(user.role)]"
                >
                  {{ user.role }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                <span
                  :class="[
                    'px-2 py-1 rounded-full text-xs font-medium',
                    getStatusColor(user.status),
                  ]"
                >
                  {{ user.status }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                <div class="flex items-center gap-3">
                  <button
                    class="text-blue-600 hover:text-blue-900 flex items-center gap-1"
                    @click="openUserModal(user)"
                  >
                    <font-awesome-icon :icon="['fas', 'eye']" />
                    View
                  </button>
                  <button
                    class="text-indigo-600 hover:text-indigo-900 flex items-center gap-1"
                    @click="() => {}"
                  >
                    <font-awesome-icon :icon="['fas', 'edit']" />
                    Edit
                  </button>
                  <button
                    class="text-red-600 hover:text-red-900 flex items-center gap-1"
                    @click="() => {}"
                  >
                    <font-awesome-icon :icon="['fas', 'trash']" />
                    Delete
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div class="px-6 py-4 bg-gray-50 border-t border-gray-200">
        <div class="flex items-center justify-between">
          <div class="text-sm text-gray-700">
            Showing {{ (currentPage - 1) * itemsPerPage + 1 }} to
            {{ Math.min(currentPage * itemsPerPage, filteredUsers.length) }} of
            {{ filteredUsers.length }} entries
          </div>
          <div class="flex items-center gap-2">
            <button
              @click="currentPage--"
              :disabled="currentPage === 1"
              class="px-3 py-1 rounded border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
            >
              <font-awesome-icon :icon="['fas', 'chevron-left']" />
            </button>
            <span class="text-sm text-gray-700">Page {{ currentPage }} of {{ totalPages }}</span>
            <button
              @click="currentPage++"
              :disabled="currentPage === totalPages"
              class="px-3 py-1 rounded border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
            >
              <font-awesome-icon :icon="['fas', 'chevron-right']" />
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- User Details Modal -->
    <UserDetailsModal
      v-if="selectedUser"
      :show="showUserModal"
      :user="selectedUser"
      @close="closeUserModal"
    />
  </div>
</template>
