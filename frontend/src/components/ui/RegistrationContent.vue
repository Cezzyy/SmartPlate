<script setup>
import { ref, computed, defineAsyncComponent, onMounted } from 'vue'
import { useVehicleRegistrationStore } from '@/stores/vehicleRegistration'
import { useUserStore } from '@/stores/user'

const RegistrationModal = defineAsyncComponent(
  () => import('@/components/modals/RegistrationModal.vue'),
)

// Get stores
const vehicleRegistrationStore = useVehicleRegistrationStore()
const userStore = useUserStore()

// Add loading state to show loading indicator
const isLoading = ref(false)
const loadError = ref<Error | null>(null)

// Load data when component is mounted
onMounted(async () => {
  isLoading.value = true
  try {
    // Check if we have the data already
    if (vehicleRegistrationStore.registrations.length === 0) {
      await vehicleRegistrationStore.fetchAllData()
    }
  } catch (error) {
    console.error('Error loading registration data:', error)
    loadError.value = error instanceof Error ? error : new Error('Unknown error')
  } finally {
    isLoading.value = false
  }
})

// Get registrations with detailed information
const registrations = computed(() => {
  if (userStore.isAdmin) {
    return vehicleRegistrationStore.registrationsWithDetails
  } else {
    return vehicleRegistrationStore.userRegistrations.map((registration) => {
      const vehicle = vehicleRegistrationStore.vehicles.find(v => v.id === registration.vehicleId)
      const plate = vehicleRegistrationStore.plates.find(p => p.vehicleId === registration.vehicleId)

      return {
        ...registration,
        vehicleInfo: vehicle
          ? `${vehicle.vehicleMake} ${vehicle.vehicleSeries} ${vehicle.yearModel}`
          : '',
        plateNumber: plate?.plate_number || '',
        owner: userStore.fullName,
      }
    })
  }
})

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

// Search query
const searchQuery = ref('')

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

  return result
})

// Get status color based on status
const getStatusColor = (status) => {
  switch (status) {
    case 'Approved':
      return 'bg-green-100 text-green-800'
    case 'Pending':
      return 'bg-yellow-100 text-yellow-800'
    case 'Rejected':
      return 'bg-red-100 text-red-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

// Get color based on days remaining
const getExpiryStatusColor = (expiryDateStr) => {
  const daysRemaining = vehicleRegistrationStore.getDaysRemaining(expiryDateStr)

  if (daysRemaining < 0) return 'bg-red-100 text-red-800' // Expired
  if (daysRemaining < 30) return 'bg-yellow-100 text-yellow-800' // Expiring soon
  return 'bg-green-100 text-green-800' // Valid
}

// Registration modal
const isRegistrationModalOpen = ref(false)
const selectedRegistration = ref(null)

const openRegistrationModal = (registration) => {
  selectedRegistration.value = registration
  isRegistrationModalOpen.value = true
}

const closeRegistrationModal = () => {
  isRegistrationModalOpen.value = false
}
</script>

<template>
  <div class="p-6 fade-in">
    <!-- Page Header -->
    <div class="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
      <div>
        <h1 class="text-2xl font-bold text-gray-800">Registration Management</h1>
        <p class="text-gray-600 mt-1">Track and manage your vehicle registrations</p>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="flex justify-center items-center py-12">
      <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-dark-blue"></div>
    </div>

    <!-- Error State -->
    <div v-else-if="loadError" class="bg-red-50 text-red-700 p-4 rounded-lg mb-6">
      <h3 class="font-medium">Error loading data</h3>
      <p>{{ loadError.message }}</p>
      <button 
        @click="vehicleRegistrationStore.fetchAllData()" 
        class="mt-2 px-3 py-1 bg-red-100 hover:bg-red-200 rounded-md text-sm font-medium">
        Try Again
      </button>
    </div>

    <template v-else>
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
              <font-awesome-icon :icon="['fas', 'search']" class="w-4 h-4" />
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

      <!-- Registration Cards -->
      <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        <div
          v-for="registration in filteredRegistrations"
          :key="registration.id"
          class="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
        >
          <!-- Registration Header -->
          <div class="p-4 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50">
            <div class="flex justify-between items-center">
              <h3 class="text-lg font-bold text-gray-800">{{ registration.vehicleInfo }}</h3>
              <span
                :class="[
                  'px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full shadow-sm',
                  getStatusColor(registration.status),
                ]"
              >
                {{ registration.status }}
              </span>
            </div>
            <p class="text-sm text-gray-600 mt-1">Plate: {{ registration.plateNumber }}</p>
          </div>

          <!-- Registration Details -->
          <div class="p-4">
            <div class="space-y-3">
              <div class="flex justify-between">
                <span class="text-sm text-gray-500">Registration Type</span>
                <span class="text-sm font-medium">{{ registration.registrationType }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-sm text-gray-500">Submission Date</span>
                <span class="text-sm font-medium">{{ registration.submissionDate }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-sm text-gray-500">Expiry Date</span>
                <span class="text-sm font-medium">{{ registration.expiryDate }}</span>
              </div>
              <div
                class="flex justify-between items-center px-3 py-2 rounded-md mt-2"
                :class="getExpiryStatusColor(registration.expiryDate)"
              >
                <span class="text-xs font-medium">
                  {{ vehicleRegistrationStore.getExpiryStatus(registration.expiryDate) }}
                </span>
                <span class="text-xs">
                  {{ vehicleRegistrationStore.getDaysRemaining(registration.expiryDate) }} days
                </span>
              </div>
            </div>

            <!-- Documents & Fees Overview -->
            <div class="mt-4 space-y-2">
              <div>
                <span class="text-sm font-medium text-gray-700">Documents:</span>
                <div class="flex flex-wrap gap-1 mt-1">
                  <span
                    v-for="(doc, index) in registration.documents"
                    :key="index"
                    class="text-xs bg-blue-50 text-blue-700 rounded-full px-2 py-1"
                  >
                    {{ doc }}
                  </span>
                </div>
              </div>
              <div v-if="registration.fees">
                <span class="text-sm font-medium text-gray-700">Fees:</span>
                <div class="text-sm text-gray-600 mt-1">
                  Total: ₱{{ registration.fees.total.toLocaleString() }}
                </div>
              </div>
            </div>

            <!-- Footer -->
            <div class="flex justify-between items-center mt-4">
              <span class="text-sm text-gray-500">{{ registration.owner }}</span>
              <button
                @click.prevent="openRegistrationModal(registration)"
                class="px-3 py-1 text-sm text-blue-600 hover:text-blue-800 font-medium rounded-md hover:bg-blue-50 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-300"
              >
                View Details
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div
        v-if="filteredRegistrations.length === 0"
        class="bg-white rounded-lg shadow-sm p-12 flex flex-col items-center justify-center"
      >
        <div class="bg-gray-100 rounded-full p-4 mb-4">
          <font-awesome-icon :icon="['fas', 'file-alt']" class="text-gray-400 w-8 h-8" />
        </div>
        <h3 class="text-lg font-medium text-gray-900 mb-1">No registrations found</h3>
        <p class="text-gray-500 mb-4">Try adjusting your search or filter criteria</p>
      </div>
    </template>

    <!-- Registration Modal -->
    <RegistrationModal
      :registration="selectedRegistration"
      :isOpen="isRegistrationModalOpen && selectedRegistration"
      @close="closeRegistrationModal"
    />
  </div>
</template>

<style scoped>
.fade-in {
  animation: fadeIn 0.5s ease-in-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
