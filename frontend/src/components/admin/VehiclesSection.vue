<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useVehicleRegistrationStore } from '@/stores/vehicleRegistration'
import { useUserStore } from '@/stores/user'
import VehicleDetailsModal from '@/components/modals/VehicleDetailsModal.vue'
import VehicleEditModal from '@/components/modals/VehicleEditModal.vue'

// Define interfaces
interface VehicleDisplay {
  id: number
  mvFileNumber: string
  ownerName: string
  vehicleMake: string
  vehicleSeries: string
  vehicleType: string
  plateNumber: string
  status: string
}

interface StatusFilter {
  value: string
  label: string
  active: boolean
  count: number
}

interface TableHeader {
  text: string
  value: keyof VehicleDisplay | 'actions'
  sortable: boolean
}

// Initialize stores
const vehicleStore = useVehicleRegistrationStore()
const userStore = useUserStore()

// State
const searchQuery = ref('')
const currentPage = ref(1)
const itemsPerPage = ref(10)
const sortBy = ref<keyof VehicleDisplay>('mvFileNumber')
const sortDesc = ref(false)
const selectedVehicle = ref<any>(null)
const showDetailsModal = ref(false)
const showEditModal = ref(false)

// Status filters
const statusFilters = ref<StatusFilter[]>([
  { value: '', label: 'All Status', active: true, count: 0 },
  { value: 'Active', label: 'Active', active: false, count: 0 },
  { value: 'Pending', label: 'Pending', active: false, count: 0 },
  { value: 'Expired', label: 'Expired', active: false, count: 0 },
])

// Table headers
const headers: TableHeader[] = [
  { text: 'MV File #', value: 'mvFileNumber', sortable: true },
  { text: 'Owner', value: 'ownerName', sortable: true },
  { text: 'Make', value: 'vehicleMake', sortable: true },
  { text: 'Model', value: 'vehicleSeries', sortable: true },
  { text: 'Type', value: 'vehicleType', sortable: true },
  { text: 'Plate #', value: 'plateNumber', sortable: true },
  { text: 'Status', value: 'status', sortable: true },
  { text: 'Actions', value: 'actions', sortable: false },
]

// Load vehicles
onMounted(() => {
  loadVehicles()
})

const loadVehicles = () => {
  try {
    // In a real app, this would make an API call
    // For now, assume vehicles are already loaded in the store
    updateStatusCounts()
  } catch (error) {
    console.error('Error loading vehicles:', error)
  }
}

// Update status filter counts
const updateStatusCounts = () => {
  // Count vehicles by status
  const counts: Record<string, number> = {}

  vehicleStore.vehicles.forEach((vehicle) => {
    // Get registration status from registration records
    const registration = vehicleStore.getRegistrationByVehicleId(vehicle.id)
    const status = registration ? registration.status : 'Unknown'
    counts[status] = (counts[status] || 0) + 1
  })

  // Update filter counts
  statusFilters.value.forEach((filter) => {
    if (filter.value === '') {
      filter.count = vehicleStore.vehicles.length
    } else {
      filter.count = counts[filter.value] || 0
    }
  })
}

// Helper method to get owner name by ID
const getOwnerNameById = (ownerId: string) => {
  const owner = userStore.users.find((user) => user.ltoClientId === ownerId)
  return owner ? `${owner.firstName} ${owner.lastName}` : 'Unknown'
}

// Map vehicles to display format with owner names and plate numbers
const vehiclesWithDetails = computed(() => {
  return vehicleStore.vehicles.map((vehicle) => {
    const plateDetails = vehicleStore.plates.find((plate) => plate.vehicleId === vehicle.id)
    const registration = vehicleStore.getRegistrationByVehicleId(vehicle.id)

    return {
      id: vehicle.id,
      mvFileNumber: vehicle.mvFileNumber,
      ownerName: getOwnerNameById(vehicle.ownerId),
      vehicleMake: vehicle.vehicleMake,
      vehicleSeries: vehicle.vehicleSeries,
      vehicleType: vehicle.vehicleType || 'N/A',
      plateNumber: plateDetails?.plate_number || 'Not Assigned',
      status: registration ? registration.status : 'Unknown',
    } as VehicleDisplay
  })
})

// Filtered vehicles based on search and status filter
const filteredVehicles = computed(() => {
  // Get active status filter
  const activeFilter = statusFilters.value.find((filter) => filter.active)
  const statusFilter = activeFilter?.value || ''

  // Filter by search query and status
  return vehiclesWithDetails.value.filter((vehicle) => {
    // Check if vehicle matches search query
    const matchesSearch =
      searchQuery.value === '' ||
      Object.values(vehicle).some((value) =>
        String(value).toLowerCase().includes(searchQuery.value.toLowerCase()),
      )

    // Check if vehicle matches status filter
    const matchesStatus = statusFilter === '' || vehicle.status === statusFilter

    return matchesSearch && matchesStatus
  })
})

// Sorted vehicles based on sort key and direction
const sortedVehicles = computed(() => {
  return [...filteredVehicles.value].sort((a, b) => {
    const valueA = a[sortBy.value]
    const valueB = b[sortBy.value]

    if (typeof valueA === 'string' && typeof valueB === 'string') {
      return sortDesc.value ? valueB.localeCompare(valueA) : valueA.localeCompare(valueB)
    } else {
      // Sort numerically if values are numbers
      if (sortDesc.value) {
        return valueA < valueB ? 1 : -1
      } else {
        return valueA > valueB ? 1 : -1
      }
    }
  })
})

// Paginated vehicles
const paginatedVehicles = computed(() => {
  const startIndex = (currentPage.value - 1) * itemsPerPage.value
  const endIndex = startIndex + itemsPerPage.value
  return sortedVehicles.value.slice(startIndex, endIndex)
})

// Total pages
const totalPages = computed(() => {
  return Math.ceil(filteredVehicles.value.length / itemsPerPage.value)
})

// Methods
const sort = (header: TableHeader): void => {
  if (!header.sortable) return
  if (sortBy.value === header.value) {
    sortDesc.value = !sortDesc.value
  } else {
    sortBy.value = header.value as keyof VehicleDisplay
    sortDesc.value = false
  }
}

const setStatusFilter = (value: string) => {
  statusFilters.value = statusFilters.value.map((filter) => ({
    ...filter,
    active: filter.value === value,
  }))
}

const viewVehicleDetails = (vehicle: VehicleDisplay) => {
  // Find the full vehicle details
  selectedVehicle.value = vehicleStore.vehicles.find((v) => v.id === vehicle.id) || null
  showDetailsModal.value = true
}

const editVehicle = (vehicle: VehicleDisplay) => {
  // Find the full vehicle details
  selectedVehicle.value = vehicleStore.vehicles.find((v) => v.id === vehicle.id) || null
  showEditModal.value = true
}

const handleVehicleUpdated = (updatedVehicle: any) => {
  // In a real app, this would call an API
  // For demo, just reload vehicles
  console.log('Vehicle updated:', updatedVehicle.id)
  loadVehicles()
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'Active':
      return 'bg-green-100 text-green-800'
    case 'Pending':
      return 'bg-yellow-100 text-yellow-800'
    case 'Expired':
      return 'bg-red-100 text-red-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

const getStatusDot = (status: string) => {
  switch (status) {
    case 'Active':
      return 'bg-green-700'
    case 'Pending':
      return 'bg-yellow-700'
    case 'Expired':
      return 'bg-red-700'
    default:
      return 'bg-gray-700'
  }
}

// Pagination
const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++
  }
}

const prevPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--
  }
}

const goToPage = (page: number) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page
  }
}
</script>

<template>
  <div>
    <div class="flex justify-between items-center mb-8">
      <div>
        <h2 class="text-2xl font-bold text-dark-blue">Vehicle Registrations</h2>
        <p class="text-gray mt-1">Manage and monitor all vehicle registrations</p>
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
            placeholder="Search by file number, owner, make or model..."
            class="w-full pl-10 pr-4 py-3 rounded-lg bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-light-blue focus:border-transparent transition-all"
          />
          <font-awesome-icon
            :icon="['fas', 'search']"
            class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray"
          />
        </div>

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
              <span
                v-if="filter.count > 0"
                class="ml-1.5 px-2 py-0.5 rounded-full text-xs"
                :class="[
                  filter.active ? 'bg-white bg-opacity-20 text-white' : 'bg-gray-200 text-gray-700',
                ]"
              >
                {{ filter.count }}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Vehicles Table -->
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
            <tr v-if="paginatedVehicles.length === 0">
              <td colspan="8" class="px-6 py-10 text-center text-gray">
                <div class="flex flex-col items-center justify-center space-y-3">
                  <div class="bg-light-blue bg-opacity-10 p-4 rounded-full">
                    <font-awesome-icon :icon="['fas', 'car']" class="text-3xl text-light-blue" />
                  </div>
                  <p class="text-lg font-medium text-dark-blue">No vehicles found</p>
                  <p class="text-sm text-gray">Try adjusting your search or filter criteria</p>
                </div>
              </td>
            </tr>
            <tr
              v-else
              v-for="vehicle in paginatedVehicles"
              :key="vehicle.id"
              class="hover:bg-gray-50 transition-colors"
            >
              <td class="px-6 py-4 whitespace-nowrap">
                <span class="text-sm font-medium text-dark-blue">{{ vehicle.mvFileNumber }}</span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                  <div
                    class="flex-shrink-0 h-10 w-10 bg-light-blue bg-opacity-10 rounded-full flex items-center justify-center"
                  >
                    <font-awesome-icon :icon="['fas', 'user']" class="text-light-blue" />
                  </div>
                  <div class="ml-4">
                    <div class="text-sm font-medium text-dark-blue">{{ vehicle.ownerName }}</div>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-700">{{ vehicle.vehicleMake }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-700">{{ vehicle.vehicleSeries }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-700">{{ vehicle.vehicleType }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-700">{{ vehicle.plateNumber }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span
                  :class="[
                    'px-3 py-1 rounded-full text-xs font-medium inline-flex items-center',
                    getStatusColor(vehicle.status),
                  ]"
                >
                  <span
                    class="h-1.5 w-1.5 rounded-full mr-1.5"
                    :class="getStatusDot(vehicle.status)"
                  ></span>
                  {{ vehicle.status }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center gap-3">
                  <button
                    class="text-light-blue hover:text-dark-blue transition-colors flex items-center gap-1 text-sm"
                    @click="viewVehicleDetails(vehicle)"
                  >
                    <font-awesome-icon :icon="['fas', 'eye']" />
                    <span>View</span>
                  </button>
                  <button
                    class="text-light-blue hover:text-dark-blue transition-colors flex items-center gap-1 text-sm"
                    @click="editVehicle(vehicle)"
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
            Showing {{ filteredVehicles.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0 }} to
            {{ Math.min(currentPage * itemsPerPage, filteredVehicles.length) }} of
            {{ filteredVehicles.length }} vehicles
          </div>
          <div class="flex items-center gap-2">
            <button
              @click="prevPage"
              :disabled="currentPage === 1 || filteredVehicles.length === 0"
              class="p-2 rounded-lg border border-gray-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 transition-colors"
            >
              <font-awesome-icon :icon="['fas', 'chevron-left']" />
            </button>

            <!-- Page number buttons -->
            <div v-if="totalPages <= 5" class="flex gap-1">
              <button
                v-for="page in totalPages"
                :key="page"
                @click="goToPage(page)"
                class="w-8 h-8 rounded-lg flex items-center justify-center border text-sm transition-colors"
                :class="
                  page === currentPage
                    ? 'bg-dark-blue text-white'
                    : 'border-gray-200 hover:bg-gray-100'
                "
              >
                {{ page }}
              </button>
            </div>
            <div v-else class="flex gap-1">
              <button
                v-if="currentPage > 2"
                @click="goToPage(1)"
                class="w-8 h-8 rounded-lg flex items-center justify-center border border-gray-200 hover:bg-gray-100 text-sm"
              >
                1
              </button>
              <span
                v-if="currentPage > 3"
                class="w-8 h-8 flex items-center justify-center text-gray"
                >...</span
              >

              <button
                v-if="currentPage > 1"
                @click="goToPage(currentPage - 1)"
                class="w-8 h-8 rounded-lg flex items-center justify-center border border-gray-200 hover:bg-gray-100 text-sm"
              >
                {{ currentPage - 1 }}
              </button>

              <button
                class="w-8 h-8 rounded-lg flex items-center justify-center border bg-dark-blue text-white text-sm"
              >
                {{ currentPage }}
              </button>

              <button
                v-if="currentPage < totalPages"
                @click="goToPage(currentPage + 1)"
                class="w-8 h-8 rounded-lg flex items-center justify-center border border-gray-200 hover:bg-gray-100 text-sm"
              >
                {{ currentPage + 1 }}
              </button>

              <span
                v-if="currentPage < totalPages - 2"
                class="w-8 h-8 flex items-center justify-center text-gray"
                >...</span
              >
              <button
                v-if="currentPage < totalPages - 1"
                @click="goToPage(totalPages)"
                class="w-8 h-8 rounded-lg flex items-center justify-center border border-gray-200 hover:bg-gray-100 text-sm"
              >
                {{ totalPages }}
              </button>
            </div>

            <span class="text-sm text-gray font-medium mx-1">
              Page {{ filteredVehicles.length > 0 ? currentPage : 0 }} of {{ totalPages }}
            </span>
            <button
              @click="nextPage"
              :disabled="currentPage === totalPages || filteredVehicles.length === 0"
              class="p-2 rounded-lg border border-gray-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 transition-colors"
            >
              <font-awesome-icon :icon="['fas', 'chevron-right']" />
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modals -->
    <VehicleDetailsModal
      :show="showDetailsModal"
      :vehicle="selectedVehicle"
      @close="showDetailsModal = false"
    />

    <VehicleEditModal
      :show="showEditModal"
      :vehicle="selectedVehicle"
      @close="showEditModal = false"
      @update="handleVehicleUpdated"
    />
  </div>
</template>
