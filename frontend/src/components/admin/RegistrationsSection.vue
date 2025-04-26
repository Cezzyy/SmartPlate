<script setup lang="ts">
import { ref, computed, defineAsyncComponent } from 'vue'
import { useRegistrationStore } from '../../stores/registration'
import type { Registration } from '../../types/registration'

interface StatusFilter {
  value: string
  label: string
  active: boolean
}

interface TypeFilter {
  value: string
  label: string
  active: boolean
}

interface TableHeader {
  text: string
  value: keyof Registration | 'actions'
  sortable: boolean
}

const RegistrationDetailsModal = defineAsyncComponent(
  () => import('@/components/modals/RegistrationDetailsModal.vue'),
)
const RegistrationEditModal = defineAsyncComponent(
  () => import('@/components/modals/RegistrationEditModal.vue'),
)

const registrationStore = useRegistrationStore()

// Search and filter state
const searchQuery = ref<string>('')
const sortBy = ref<keyof Registration | 'actions'>('submissionDate')
const sortDesc = ref<boolean>(true)
const currentPage = ref<number>(1)
const itemsPerPage = ref<number>(10)

// Get all registrations from the store
const registrations = computed((): Registration[] => registrationStore.registrations || [])

// Table headers with sorting capability
const headers: TableHeader[] = [
  { text: 'Reference Code', value: 'referenceCode', sortable: true },
  { text: 'Vehicle Info', value: 'vehicleInfo', sortable: true },
  { text: 'Type', value: 'registrationType', sortable: true },
  { text: 'Submission Date', value: 'submissionDate', sortable: true },
  { text: 'Status', value: 'status', sortable: true },
  { text: 'Actions', value: 'actions', sortable: false },
]

// Status filters
const statusFilters = ref<StatusFilter[]>([
  { value: 'all', label: 'All Status', active: true },
  { value: 'pending', label: 'Pending', active: false },
  { value: 'approved', label: 'Approved', active: false },
  { value: 'rejected', label: 'Rejected', active: false },
  { value: 'expired', label: 'Expired', active: false },
])

// Type filters
const typeFilters = ref<TypeFilter[]>([
  { value: 'all', label: 'All Types', active: true },
  { value: 'new', label: 'New Registration', active: false },
  { value: 'renewal', label: 'Renewal', active: false },
  { value: 'transfer', label: 'Transfer', active: false },
])

// Active filters
const activeStatusFilter = computed((): string => {
  const filter = statusFilters.value.find((f) => f.active === true)
  return filter ? filter.value : 'all'
})

const activeTypeFilter = computed((): string => {
  const filter = typeFilters.value.find((f) => f.active === true)
  return filter ? filter.value : 'all'
})

// Apply status filter
const setStatusFilter = (value: string): void => {
  statusFilters.value = statusFilters.value.map((filter) => ({
    ...filter,
    active: filter.value === value,
  }))
}

// Apply type filter
const setTypeFilter = (value: string): void => {
  typeFilters.value = typeFilters.value.map((filter) => ({
    ...filter,
    active: filter.value === value,
  }))
}

// Format and filter registrations
const filteredRegistrations = computed((): Registration[] => {
  return registrations.value
    .filter((registration) => {
      const matchesSearch =
        searchQuery.value === '' ||
        registration.referenceCode.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
        registration.vehicleInfo.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
        registration.plateNumber.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
        registration.applicantName.toLowerCase().includes(searchQuery.value.toLowerCase())

      const matchesStatus =
        activeStatusFilter.value === 'all' ||
        registration.status.toLowerCase() === activeStatusFilter.value.toLowerCase()
      const matchesType =
        activeTypeFilter.value === 'all' ||
        registration.registrationType.toLowerCase() === activeTypeFilter.value.toLowerCase()

      return matchesSearch && matchesStatus && matchesType
    })
    .sort((a, b) => {
      const modifier = sortDesc.value ? -1 : 1

      if (sortBy.value === 'actions') {
        return 0 // No sorting for actions column
      }

      const aValue = a[sortBy.value]
      const bValue = b[sortBy.value]

      if (sortBy.value === 'submissionDate') {
        return (
          modifier * (new Date(a.submissionDate).getTime() - new Date(b.submissionDate).getTime())
        )
      }

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return modifier * aValue.localeCompare(bValue)
      }

      if (aValue !== undefined && bValue !== undefined && aValue < bValue) return -1 * modifier
      if (bValue !== undefined && aValue !== undefined && aValue > bValue) return 1 * modifier
      return 0
    })
})

// Pagination
const totalPages = computed((): number =>
  Math.ceil(filteredRegistrations.value.length / itemsPerPage.value),
)
const paginatedRegistrations = computed((): Registration[] => {
  const start = (currentPage.value - 1) * itemsPerPage.value
  const end = start + itemsPerPage.value
  return filteredRegistrations.value.slice(start, end)
})

// Status badge color
const getStatusColor = (status: string): string => {
  switch (status.toLowerCase()) {
    case 'approved':
      return 'bg-green-100 text-green-800'
    case 'pending':
      return 'bg-yellow-100 text-yellow-800'
    case 'rejected':
    case 'expired':
      return 'bg-red-100 text-red-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

const getTypeColor = (type: string): string => {
  switch (type.toLowerCase()) {
    case 'new':
      return 'bg-blue-100 text-blue-800'
    case 'renewal':
      return 'bg-purple-100 text-purple-800'
    case 'transfer':
      return 'bg-cyan-100 text-cyan-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

// Modal state
const showDetailsModal = ref<boolean>(false)
const showEditModal = ref<boolean>(false)
const selectedRegistration = ref<Registration | null>(null)

// Notification state
const showNotification = ref<boolean>(false)
const notificationMessage = ref<string>('')
const notificationType = ref<'success' | 'error'>('success')
const notificationProgress = ref<number>(0)

// Modal handlers
const openDetailsModal = (registration: Registration): void => {
  selectedRegistration.value = registration
  showDetailsModal.value = true
}

const closeDetailsModal = (): void => {
  showDetailsModal.value = false
  selectedRegistration.value = null
}

const openEditModal = (registration: Registration): void => {
  selectedRegistration.value = registration
  showEditModal.value = true
}

const closeEditModal = (): void => {
  showEditModal.value = false
  selectedRegistration.value = null
}

const handleRegistrationUpdate = (updatedRegistration: Registration): void => {
  // Reset and show notification
  notificationProgress.value = 100
  notificationMessage.value = `Registration ${updatedRegistration.referenceCode} updated successfully`
  notificationType.value = 'success'
  showNotification.value = true

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

// Format date for display
const formatDate = (dateString: string): string => {
  if (!dateString) return 'Not specified'
  try {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  } catch (e) {
    return dateString
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
              notificationType === 'success' ? 'bg-green-500' : 'bg-red-500',
            ]"
          ></div>
          <div class="flex items-center p-3 pr-4">
            <div
              :class="[
                'flex items-center justify-center w-8 h-8 rounded-full mr-3',
                notificationType === 'success' ? 'bg-green-100' : 'bg-red-100',
              ]"
            >
              <font-awesome-icon
                :icon="['fas', notificationType === 'success' ? 'check' : 'exclamation']"
                :class="notificationType === 'success' ? 'text-green-500' : 'text-red-500'"
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
              notificationType === 'success' ? 'bg-green-500' : 'bg-red-500',
            ]"
            :style="{ width: notificationProgress + '%' }"
          ></div>
        </div>
      </div>
    </transition>

    <div class="flex justify-between items-center mb-8">
      <div>
        <h2 class="text-2xl font-bold text-dark-blue">Registration Management</h2>
        <p class="text-gray mt-1">Manage vehicle registrations and applications</p>
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
            placeholder="Search by reference code, vehicle info, plate number, or applicant name..."
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

          <!-- Type Filters -->
          <div>
            <h3 class="text-sm font-medium text-gray mb-2">Filter by Type</h3>
            <div class="flex flex-wrap gap-2">
              <button
                v-for="filter in typeFilters"
                :key="filter.value"
                @click="setTypeFilter(filter.value)"
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

    <!-- Registrations Table -->
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
            <tr v-if="paginatedRegistrations.length === 0" class="hover:bg-gray-50">
              <td colspan="6" class="px-6 py-10 text-center text-gray">
                <div class="flex flex-col items-center justify-center space-y-3">
                  <div class="bg-light-blue bg-opacity-10 p-4 rounded-full">
                    <font-awesome-icon
                      :icon="['fas', 'file-alt']"
                      class="text-3xl text-light-blue"
                    />
                  </div>
                  <p class="text-lg font-medium text-dark-blue">No registrations found</p>
                  <p class="text-sm text-gray">Try adjusting your search or filter criteria</p>
                </div>
              </td>
            </tr>
            <tr
              v-else
              v-for="registration in paginatedRegistrations"
              :key="registration.referenceCode"
              class="hover:bg-gray-50 transition-colors"
            >
              <td class="px-6 py-4 whitespace-nowrap">
                <span class="text-sm font-medium text-dark-blue">{{
                  registration.referenceCode
                }}</span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                  <div
                    class="flex-shrink-0 h-10 w-10 bg-light-blue bg-opacity-10 rounded-full flex items-center justify-center"
                  >
                    <font-awesome-icon :icon="['fas', 'car']" class="text-light-blue" />
                  </div>
                  <div class="ml-4">
                    <div class="text-sm font-medium text-dark-blue">
                      {{ registration.vehicleInfo }}
                    </div>
                    <div class="text-xs text-gray">
                      {{ registration.make }} {{ registration.model }}
                    </div>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span
                  :class="[
                    'px-3 py-1 rounded-full text-xs font-medium inline-flex items-center',
                    getTypeColor(registration.registrationType),
                  ]"
                >
                  <span
                    class="h-1.5 w-1.5 rounded-full mr-1.5"
                    :class="[
                      registration.registrationType.toLowerCase() === 'new'
                        ? 'bg-blue-700'
                        : registration.registrationType.toLowerCase() === 'renewal'
                          ? 'bg-purple-700'
                          : 'bg-cyan-700',
                    ]"
                  ></span>
                  {{ registration.registrationType }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-700">
                  {{ formatDate(registration.submissionDate) }}
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span
                  :class="[
                    'px-3 py-1 rounded-full text-xs font-medium inline-flex items-center',
                    getStatusColor(registration.status),
                  ]"
                >
                  <span
                    class="h-1.5 w-1.5 rounded-full mr-1.5"
                    :class="[
                      registration.status.toLowerCase() === 'approved'
                        ? 'bg-green-700'
                        : registration.status.toLowerCase() === 'pending'
                          ? 'bg-yellow-700'
                          : 'bg-red-700',
                    ]"
                  ></span>
                  {{ registration.status }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center gap-3">
                  <button
                    class="text-light-blue hover:text-dark-blue transition-colors flex items-center gap-1 text-sm"
                    @click="openDetailsModal(registration)"
                  >
                    <font-awesome-icon :icon="['fas', 'eye']" />
                    <span>View</span>
                  </button>
                  <button
                    class="text-light-blue hover:text-dark-blue transition-colors flex items-center gap-1 text-sm"
                    @click="openEditModal(registration)"
                  >
                    <font-awesome-icon :icon="['fas', 'edit']" />
                    <span>Edit</span>
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
            Showing
            {{ filteredRegistrations.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0 }} to
            {{ Math.min(currentPage * itemsPerPage, filteredRegistrations.length) }} of
            {{ filteredRegistrations.length }} registrations
          </div>
          <div class="flex items-center gap-2">
            <button
              @click="currentPage--"
              :disabled="currentPage === 1 || filteredRegistrations.length === 0"
              class="p-2 rounded-lg border border-gray-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 transition-colors"
            >
              <font-awesome-icon :icon="['fas', 'chevron-left']" />
            </button>
            <span class="text-sm text-gray font-medium px-4">
              Page {{ filteredRegistrations.length > 0 ? currentPage : 0 }} of {{ totalPages }}
            </span>
            <button
              @click="currentPage++"
              :disabled="currentPage === totalPages || filteredRegistrations.length === 0"
              class="p-2 rounded-lg border border-gray-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 transition-colors"
            >
              <font-awesome-icon :icon="['fas', 'chevron-right']" />
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Registration Details Modal -->
    <RegistrationDetailsModal
      v-if="selectedRegistration && showDetailsModal"
      :show="showDetailsModal"
      :registration="selectedRegistration"
      @close="closeDetailsModal"
    />

    <!-- Registration Edit Modal -->
    <RegistrationEditModal
      v-if="selectedRegistration && showEditModal"
      :show="showEditModal"
      :registration="selectedRegistration"
      @close="closeEditModal"
      @update="handleRegistrationUpdate"
    />
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
