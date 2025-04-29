<script setup lang="ts">
import { ref, computed, defineAsyncComponent, onMounted } from 'vue'
import { useAdminDashboardStore } from '@/stores/adminDashboard'
import type { Plate, Vehicle } from '@/types/vehicle'

interface ExtendedVehicle extends Vehicle {
  id: number
}

interface PlateWithVehicle extends Plate {
  registrationDate: string
  expiryDate: string
  plateNumber: string
  type: string
  plateType: string
  vehicle: string
  status: string
  id: number
  vehicleId: number
  plate_issue_date: string
  plate_expiration_date: string
  plate_number: string
  plate_type: string
  [key: string]: string | number | undefined
}

interface Filter {
  value: string
  label: string
  active: boolean
}

interface TableHeader {
  text: string
  value: string
  sortable: boolean
}

const PlateDetailsModal = defineAsyncComponent(
  () => import('@/components/modals/PlateDetailsModal.vue'),
)

const PlateEditModal = defineAsyncComponent(() => import('@/components/modals/PlateEditModal.vue'))

const adminStore = useAdminDashboardStore()

// Search and filter state
const searchQuery = ref<string>('')
const sortBy = ref<string>('plateNumber')
const sortDesc = ref<boolean>(false)
const currentPage = ref<number>(1)
const itemsPerPage = ref<number>(10)

// Status filters
const statusFilters = ref<Filter[]>([
  { value: 'all', label: 'All Status', active: true },
  { value: 'Active', label: 'Active', active: false },
  { value: 'Expired', label: 'Expired', active: false },
  { value: 'Pending', label: 'Pending', active: false },
])

// Type filters
const typeFilters = ref<Filter[]>([
  { value: 'all', label: 'All Types', active: true },
  { value: 'Private', label: 'Private', active: false },
  { value: 'Regular', label: 'Regular', active: false },
  { value: 'Temporary', label: 'Temporary', active: false },
])

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
const setStatusFilter = (value: string) => {
  statusFilters.value = statusFilters.value.map((filter) => ({
    ...filter,
    active: filter.value === value,
  }))
}

// Apply type filter
const setTypeFilter = (value: string) => {
  typeFilters.value = typeFilters.value.map((filter) => ({
    ...filter,
    active: filter.value === value,
  }))
}

// Get all plates with vehicle information
const plates = computed((): PlateWithVehicle[] => {
  return adminStore.platesWithVehicleInfo.map((plate) => {
    const vehicle = adminStore.vehicles.find(
      (v): v is ExtendedVehicle => v.id === Number(plate.vehicleId),
    )

    const vehicleInfo = vehicle
      ? `${vehicle.vehicleMake} ${vehicle.vehicleSeries} ${vehicle.yearModel}`
      : 'N/A'

    return {
      ...plate,
      id: plate.plateId,
      registrationDate: plate.plate_issue_date,
      expiryDate: plate.plate_expiration_date,
      plateNumber: plate.plate_number,
      type: 'Private',
      plateType: plate.plate_type,
      vehicle: vehicleInfo,
      status: plate.status || 'Pending',
    }
  })
})

// Filtered and sorted plates
const filteredPlates = computed((): PlateWithVehicle[] => {
  let result = [...plates.value]

  // Apply status filter
  if (activeStatusFilter.value !== 'all') {
    result = result.filter((plate) => plate.status === activeStatusFilter.value)
  }

  // Apply type filter
  if (activeTypeFilter.value !== 'all') {
    result = result.filter((plate) => plate.plateType === activeTypeFilter.value)
  }

  // Apply search filter
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(
      (plate) =>
        plate.plateNumber.toLowerCase().includes(query) ||
        plate.vehicle.toLowerCase().includes(query),
    )
  }

  // Apply sorting
  return result.sort((a, b) => {
    const aValue = a[sortBy.value]
    const bValue = b[sortBy.value]

    // Handle null/undefined values
    if (!aValue && aValue !== 0) return sortDesc.value ? 1 : -1
    if (!bValue && bValue !== 0) return sortDesc.value ? -1 : 1
    if (aValue === bValue) return 0

    // Handle date fields
    if (sortBy.value === 'registrationDate' || sortBy.value === 'expiryDate') {
      const aDate = new Date(String(aValue)).getTime()
      const bDate = new Date(String(bValue)).getTime()
      return sortDesc.value ? bDate - aDate : aDate - bDate
    }

    // Handle numeric fields
    const aNum = Number(aValue)
    const bNum = Number(bValue)
    if (!isNaN(aNum) && !isNaN(bNum)) {
      return sortDesc.value ? bNum - aNum : aNum - bNum
    }

    // Handle string values
    const aString = String(aValue).toLowerCase()
    const bString = String(bValue).toLowerCase()
    return sortDesc.value ? bString.localeCompare(aString) : aString.localeCompare(bString)
  })
})

// Pagination
const totalPages = computed(() => Math.ceil(filteredPlates.value.length / itemsPerPage.value))
const paginatedPlates = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value
  const end = start + itemsPerPage.value
  return filteredPlates.value.slice(start, end)
})

// Status badge color
const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case 'active':
      return 'bg-green-100 text-green-800'
    case 'pending':
      return 'bg-yellow-100 text-yellow-800'
    case 'expired':
      return 'bg-red-100 text-red-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

const getStatusDot = (status: string) => {
  switch (status.toLowerCase()) {
    case 'active':
      return 'bg-green-700'
    case 'pending':
      return 'bg-yellow-700'
    case 'expired':
      return 'bg-red-700'
    default:
      return 'bg-gray-700'
  }
}

// Add a function to get plate type color
const getPlateTypeColor = (type: string) => {
  switch (type.toLowerCase()) {
    case 'private':
      return 'bg-indigo-100 text-indigo-800'
    case 'regular':
      return 'bg-blue-100 text-blue-800'
    case 'temporary':
      return 'bg-purple-100 text-purple-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

const getPlateTypeDot = (type: string) => {
  switch (type.toLowerCase()) {
    case 'private':
      return 'bg-indigo-700'
    case 'regular':
      return 'bg-blue-700'
    case 'temporary':
      return 'bg-purple-700'
    default:
      return 'bg-gray-700'
  }
}

// Sort handler
const sort = (header: TableHeader) => {
  if (!header.sortable) return
  if (sortBy.value === header.value) {
    sortDesc.value = !sortDesc.value
  } else {
    sortBy.value = header.value
    sortDesc.value = false
  }
}

// Modal state
const selectedPlate = ref<PlateWithVehicle | null>(null)
const showPlateModal = ref<boolean>(false)
const showEditModal = ref<boolean>(false)

// Notification state
const showNotification = ref<boolean>(false)
const notificationMessage = ref<string>('')
const notificationType = ref<'success' | 'error'>('success')
const notificationProgress = ref<number>(0)

// Modal handlers
const openPlateModal = (plate: PlateWithVehicle & { id: number }) => {
  selectedPlate.value = plate
  showPlateModal.value = true
}

const closePlateModal = () => {
  selectedPlate.value = null
  showPlateModal.value = false
}

const openEditModal = (plate: PlateWithVehicle & { id: number }) => {
  selectedPlate.value = plate
  showEditModal.value = true
}

const closeEditModal = () => {
  showEditModal.value = false
  selectedPlate.value = null
}

const handlePlateUpdate = async (updatedPlate: Plate) => {
  try {
    // Find the associated vehicle
    const vehicleId = updatedPlate.vehicleId.toString()
    
    // Call the update function from the admin store
    await adminStore.updatePlate(vehicleId, updatedPlate.plateId.toString(), updatedPlate)
    
    // Reset and show notification
    notificationProgress.value = 100
    notificationMessage.value = `Plate ${updatedPlate.plate_number} updated successfully`
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
  } catch (error) {
    console.error('Error updating plate:', error)
    
    // Show error notification
    notificationProgress.value = 100
    notificationMessage.value = 'Error updating plate'
    notificationType.value = 'error'
    showNotification.value = true
    
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

const headers: TableHeader[] = [
  { text: 'Plate Number', value: 'plateNumber', sortable: true },
  { text: 'Vehicle', value: 'vehicle', sortable: true },
  { text: 'Registration Date', value: 'registrationDate', sortable: true },
  { text: 'Expiry Date', value: 'expiryDate', sortable: true },
  { text: 'Status', value: 'status', sortable: true },
  { text: 'Type', value: 'type', sortable: true },
  { text: 'Actions', value: 'actions', sortable: false },
]

// Add onMounted hook to load data
onMounted(async () => {
  try {
    await adminStore.fetchAllData()
  } catch (error) {
    console.error('Error loading plate data:', error)
  }
})
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
        <h2 class="text-2xl font-bold text-dark-blue">Plates Management</h2>
        <p class="text-gray mt-1">Manage vehicle plates and registration</p>
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
            placeholder="Search by plate number or vehicle..."
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

    <!-- Plates Table -->
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
            <tr v-if="paginatedPlates.length === 0" class="hover:bg-gray-50">
              <td colspan="7" class="px-6 py-10 text-center text-gray">
                <div class="flex flex-col items-center justify-center space-y-3">
                  <div class="bg-light-blue bg-opacity-10 p-4 rounded-full">
                    <font-awesome-icon :icon="['fas', 'car']" class="text-3xl text-light-blue" />
                  </div>
                  <p class="text-lg font-medium text-dark-blue">No plates found</p>
                  <p class="text-sm text-gray">Try adjusting your search or filter criteria</p>
                </div>
              </td>
            </tr>
            <tr
              v-else
              v-for="plate in paginatedPlates"
              :key="plate.id"
              class="hover:bg-gray-50 transition-colors"
            >
              <td class="px-6 py-4 whitespace-nowrap">
                <span class="text-sm font-medium text-dark-blue">{{ plate.plateNumber }}</span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-700">{{ plate.vehicle }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-700">{{ plate.registrationDate }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-700">{{ plate.expiryDate }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span
                  :class="[
                    'px-3 py-1 rounded-full text-xs font-medium inline-flex items-center',
                    getStatusColor(plate.status),
                  ]"
                >
                  <span
                    class="h-1.5 w-1.5 rounded-full mr-1.5"
                    :class="[getStatusDot(plate.status)]"
                  ></span>
                  {{ plate.status }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span
                  :class="[
                    'px-3 py-1 rounded-full text-xs font-medium inline-flex items-center',
                    getPlateTypeColor(plate.type),
                  ]"
                >
                  <span
                    class="h-1.5 w-1.5 rounded-full mr-1.5"
                    :class="[getPlateTypeDot(plate.type)]"
                  ></span>
                  {{ plate.type }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center gap-3">
                  <button
                    class="text-light-blue hover:text-dark-blue transition-colors flex items-center gap-1 text-sm"
                    @click="openPlateModal(plate)"
                  >
                    <font-awesome-icon :icon="['fas', 'eye']" />
                    <span>View</span>
                  </button>
                  <button
                    class="text-light-blue hover:text-dark-blue transition-colors flex items-center gap-1 text-sm"
                    @click="openEditModal(plate)"
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
            Showing {{ filteredPlates.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0 }} to
            {{ Math.min(currentPage * itemsPerPage, filteredPlates.length) }} of
            {{ filteredPlates.length }} plates
          </div>
          <div class="flex items-center gap-2">
            <button
              @click="currentPage--"
              :disabled="currentPage === 1 || filteredPlates.length === 0"
              class="p-2 rounded-lg border border-gray-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 transition-colors"
            >
              <font-awesome-icon :icon="['fas', 'chevron-left']" />
            </button>
            <span class="text-sm text-gray font-medium px-4">
              Page {{ filteredPlates.length > 0 ? currentPage : 0 }} of {{ totalPages }}
            </span>
            <button
              @click="currentPage++"
              :disabled="currentPage === totalPages || filteredPlates.length === 0"
              class="p-2 rounded-lg border border-gray-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 transition-colors"
            >
              <font-awesome-icon :icon="['fas', 'chevron-right']" />
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Plate Details Modal -->
    <PlateDetailsModal
      v-if="selectedPlate && showPlateModal"
      :show="showPlateModal"
      :plate="selectedPlate"
      @close="closePlateModal"
    />

    <!-- Plate Edit Modal -->
    <PlateEditModal
      v-if="selectedPlate && showEditModal"
      :show="showEditModal"
      :plate="selectedPlate"
      @close="closeEditModal"
      @update="handlePlateUpdate"
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
