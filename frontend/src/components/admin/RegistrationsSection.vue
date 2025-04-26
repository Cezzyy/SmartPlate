<script setup>
import { ref, computed, defineAsyncComponent } from 'vue'
import { useVehicleRegistrationStore } from '@/stores/vehicleRegistration'

const RegistrationDetailsModal = defineAsyncComponent(
  () => import('@/components/modals/RegistrationDetailsModal.vue'),
)

const vehicleStore = useVehicleRegistrationStore()

// Modal state
const selectedRegistration = ref(null)
const showDetailsModal = ref(false)

const openDetailsModal = (registration) => {
  selectedRegistration.value = {
    ...registration,
    applicantName: registration.applicantName || 'Unknown',
    applicantEmail: registration.applicantEmail || 'No email',
    applicantPhone: registration.applicantPhone || 'Not provided',
    make: registration.make || registration.vehicleInfo?.split(' ')[0] || 'Unknown',
    model: registration.model || registration.vehicleInfo?.split(' ')[1] || 'Unknown',
    year: registration.year || registration.vehicleInfo?.split(' ')[2] || 'Unknown',
    color: registration.color || 'Unknown',
    engineNumber: registration.engineNumber || 'Unknown',
    chassisNumber: registration.chassisNumber || 'Unknown',
    plateNumber: registration.plateNumber || 'Pending',
    vehicleType: registration.vehicleType || 'Unknown',
    registrationType: registration.registrationType || 'Unknown',
    referenceCode: registration.referenceCode || 'Unknown',
    submissionDate: registration.submissionDate || 'Not specified',
    expiryDate: registration.expiryDate || 'Not applicable',
    inspectionStatus: registration.inspectionStatus || registration.status || 'pending',
    paymentStatus: registration.paymentStatus || 'pending',
    verificationStatus: registration.verificationStatus || 'pending',
    status: registration.status || 'pending',
  }
  showDetailsModal.value = true
}

const closeDetailsModal = () => {
  showDetailsModal.value = false
  selectedRegistration.value = null
}

// Get all registrations with details
const registrations = computed(() => vehicleStore.registrationsWithDetails)

// Status filters
const statusFilters = ref([
  { value: 'all', label: 'All Registrations', active: true },
  { value: 'Approved', label: 'Approved', active: false },
  { value: 'Pending', label: 'Pending', active: false },
  { value: 'expired', label: 'Expired', active: false },
])

// Type filters
const typeFilters = ref([
  { value: 'all', label: 'All Types', active: true },
  { value: 'New Registration', label: 'New Registration', active: false },
  { value: 'Renewal', label: 'Renewal', active: false },
])

// Search and filter state
const searchQuery = ref('')
const sortBy = ref('submissionDate')
const sortDesc = ref(false)
const currentPage = ref(1)
const itemsPerPage = ref(10)

// Active filters
const activeStatusFilter = computed(() => {
  const filter = statusFilters.value.find((f) => f.active === true)
  return filter ? filter.value : 'all'
})

const activeTypeFilter = computed(() => {
  const filter = typeFilters.value.find((f) => f.active === true)
  return filter ? filter.value : 'all'
})

// Apply status filter
const setStatusFilter = (value) => {
  statusFilters.value = statusFilters.value.map((filter) => ({
    ...filter,
    active: filter.value === value,
  }))
}

// Apply type filter
const setTypeFilter = (value) => {
  typeFilters.value = typeFilters.value.map((filter) => ({
    ...filter,
    active: filter.value === value,
  }))
}

// Filtered registrations based on active filters and search query
const filteredRegistrations = computed(() => {
  let result = registrations.value

  // Apply status filter
  if (activeStatusFilter.value !== 'all') {
    if (activeStatusFilter.value === 'expired') {
      // Filter for expired registrations
      result = result.filter((reg) => {
        const expiryDate = new Date(reg.expiryDate)
        return expiryDate < new Date()
      })
    } else {
      // Filter by status
      result = result.filter((reg) => reg.status === activeStatusFilter.value)
    }
  }

  // Apply type filter
  if (activeTypeFilter.value !== 'all') {
    result = result.filter((reg) => reg.registrationType === activeTypeFilter.value)
  }

  // Apply search query
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(
      (reg) =>
        reg.vehicleInfo.toLowerCase().includes(query) ||
        reg.plateNumber.toLowerCase().includes(query),
    )
  }

  // Apply sorting
  return result.sort((a, b) => {
    const modifier = sortDesc.value ? -1 : 1
    if (a[sortBy.value] < b[sortBy.value]) return -1 * modifier
    if (a[sortBy.value] > b[sortBy.value]) return 1 * modifier
    return 0
  })
})

// Table headers
const headers = [
  { text: 'Vehicle', value: 'vehicleInfo', sortable: true },
  { text: 'Plate Number', value: 'plateNumber', sortable: true },
  { text: 'Registration Type', value: 'registrationType', sortable: true },
  { text: 'Submission Date', value: 'submissionDate', sortable: true },
  { text: 'Expiry Date', value: 'expiryDate', sortable: true },
  { text: 'Status', value: 'status', sortable: true },
  { text: 'Actions', value: 'actions', sortable: false },
]

// Pagination
const totalPages = computed(() =>
  Math.ceil(filteredRegistrations.value.length / itemsPerPage.value),
)
const paginatedRegistrations = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value
  const end = start + itemsPerPage.value
  return filteredRegistrations.value.slice(start, end)
})

// Status badge color
const getStatusColor = (status) => {
  switch (status.toLowerCase()) {
    case 'approved':
      return 'bg-green-100 text-green-800'
    case 'pending':
      return 'bg-yellow-100 text-yellow-800'
    case 'expired':
      return 'bg-red-100 text-red-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

// Sort handler
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
      <h2 class="text-2xl font-semibold text-gray-800">Registrations Management</h2>
    </div>

    <!-- Filters and Search -->
    <div class="bg-white rounded-lg shadow-sm p-4 mb-6">
      <div class="space-y-4">
        <!-- Search Bar -->
        <div class="relative">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search by vehicle or plate number..."
            class="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-dark-blue/20 transition-all"
          />
          <div class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
            <i class="fas fa-search w-4 h-4"></i>
          </div>
        </div>

        <!-- Filter Options -->
        <div class="flex flex-wrap gap-2">
          <div class="mr-4">
            <span class="text-sm font-medium text-gray-700 mr-2">Status:</span>
            <div class="inline-flex rounded-md shadow-sm mt-1">
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
            </div>
          </div>

          <div>
            <span class="text-sm font-medium text-gray-700 mr-2">Type:</span>
            <div class="inline-flex rounded-md shadow-sm mt-1">
              <button
                v-for="filter in typeFilters"
                :key="filter.value"
                @click="setTypeFilter(filter.value)"
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
      </div>
    </div>

    <!-- Registrations Table -->
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
              v-for="registration in paginatedRegistrations"
              :key="registration.id"
              class="hover:bg-gray-50 transition-colors"
            >
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {{ registration.vehicleInfo }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {{ registration.plateNumber }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {{ registration.registrationType }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {{ registration.submissionDate }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {{ registration.expiryDate }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                <span
                  :class="[
                    'px-2 py-1 rounded-full text-xs font-medium',
                    getStatusColor(registration.status),
                  ]"
                >
                  {{ registration.status }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                <div class="flex items-center gap-3">
                  <button
                    class="text-blue-600 hover:text-blue-900 flex items-center gap-1"
                    @click="openDetailsModal(registration)"
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
            {{ Math.min(currentPage * itemsPerPage, filteredRegistrations.length) }} of
            {{ filteredRegistrations.length }} entries
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

    <!-- Registration Details Modal -->
    <RegistrationDetailsModal
      :show="showDetailsModal"
      :registration="selectedRegistration"
      @close="closeDetailsModal"
    />
  </div>
</template>
