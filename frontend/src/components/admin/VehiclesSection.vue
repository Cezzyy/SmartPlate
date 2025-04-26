<script setup>
import { ref, computed, defineAsyncComponent } from 'vue'
import { useVehicleRegistrationStore } from '@/stores/vehicleRegistration'

const VehicleDetailsModal = defineAsyncComponent(
  () => import('@/components/modals/VehicleDetailsModal.vue'),
)

const vehicleStore = useVehicleRegistrationStore()

// Get all vehicles with owner information
const vehicles = computed(() => {
  return vehicleStore.vehicles.map((vehicle) => {
    const plate = vehicleStore.platesWithVehicleInfo.find((p) => p.vehicleId === vehicle.id)
    return {
      id: vehicle.id,
      make: vehicle.vehicleMake,
      model: vehicle.vehicleSeries,
      year: vehicle.yearModel,
      plateNumber: plate ? plate.plate_number : 'N/A',
      color: vehicle.color,
      status: plate ? plate.status : 'N/A',
      owner: vehicle.ownerId,
    }
  })
})

// Status filters
const statusFilters = ref([
  { value: 'all', label: 'All Status', active: true },
  { value: 'Active', label: 'Active', active: false },
  { value: 'Pending', label: 'Pending', active: false },
  { value: 'Inactive', label: 'Inactive', active: false },
])

// Search and filter state
const searchQuery = ref('')
const sortBy = ref('make')
const sortDesc = ref(false)
const currentPage = ref(1)
const itemsPerPage = ref(10)

// Active filters
const activeStatusFilter = computed(() => {
  const filter = statusFilters.value.find((f) => f.active === true)
  return filter ? filter.value : 'all'
})

// Apply status filter
const setStatusFilter = (value) => {
  statusFilters.value = statusFilters.value.map((filter) => ({
    ...filter,
    active: filter.value === value,
  }))
}

// Filtered vehicles based on active filters and search query
const filteredVehicles = computed(() => {
  let result = vehicles.value

  // Apply status filter
  if (activeStatusFilter.value !== 'all') {
    result = result.filter((vehicle) => vehicle.status === activeStatusFilter.value)
  }

  // Apply search filter
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(
      (vehicle) =>
        vehicle.make.toLowerCase().includes(query) ||
        vehicle.model.toLowerCase().includes(query) ||
        vehicle.plateNumber?.toLowerCase().includes(query) ||
        vehicle.owner.toLowerCase().includes(query),
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

// Pagination
const totalPages = computed(() => Math.ceil(filteredVehicles.value.length / itemsPerPage.value))
const paginatedVehicles = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value
  const end = start + itemsPerPage.value
  return filteredVehicles.value.slice(start, end)
})

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

// Modal state
const showModal = ref(false)
const selectedVehicle = ref(null)

const openVehicleDetails = (vehicle) => {
  // Get the complete vehicle details from the store
  selectedVehicle.value = vehicleStore.vehicles.find((v) => v.id === vehicle.id)
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  selectedVehicle.value = null
}

// Table headers
const headers = [
  { text: 'Make', value: 'make', sortable: true },
  { text: 'Model', value: 'model', sortable: true },
  { text: 'Year', value: 'year', sortable: true },
  { text: 'Plate Number', value: 'plateNumber', sortable: true },
  { text: 'Color', value: 'color', sortable: true },
  { text: 'Status', value: 'status', sortable: true },
  { text: 'Owner', value: 'owner', sortable: true },
  { text: 'Actions', value: 'actions', sortable: false },
]
</script>

<template>
  <div class="p-6">
    <div class="flex justify-between items-center mb-6">
      <h2 class="text-2xl font-semibold text-gray-800">Vehicles Management</h2>
    </div>

    <!-- Filters and Search -->
    <div class="bg-white rounded-lg shadow-sm p-4 mb-6">
      <div class="space-y-4">
        <!-- Search Bar -->
        <div class="relative">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search by make, model, plate number, or owner..."
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
        </div>
      </div>
    </div>

    <!-- Vehicles Table -->
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
              v-for="vehicle in paginatedVehicles"
              :key="vehicle.id"
              class="hover:bg-gray-50 transition-colors"
            >
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {{ vehicle.make }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {{ vehicle.model }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {{ vehicle.year }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {{ vehicle.plateNumber }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {{ vehicle.color }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                <span
                  :class="{
                    'px-2 py-1 rounded-full text-xs font-medium': true,
                    'bg-green-100 text-green-800': vehicle.status === 'Active',
                    'bg-yellow-100 text-yellow-800': vehicle.status === 'Pending',
                    'bg-red-100 text-red-800': vehicle.status === 'Inactive',
                  }"
                >
                  {{ vehicle.status }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {{ vehicle.owner }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                <div class="flex items-center gap-3">
                  <button
                    class="text-blue-600 hover:text-blue-900 flex items-center gap-1"
                    @click="openVehicleDetails(vehicle)"
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
            {{ Math.min(currentPage * itemsPerPage, filteredVehicles.length) }} of
            {{ filteredVehicles.length }} entries
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

    <!-- Vehicle Details Modal -->
    <VehicleDetailsModal
      v-if="selectedVehicle"
      :show="showModal"
      :vehicle="selectedVehicle"
      @close="closeModal"
    />
  </div>
</template>
