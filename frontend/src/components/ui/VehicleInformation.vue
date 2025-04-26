<script setup>
import { ref, computed, defineAsyncComponent } from 'vue'
import { useVehicleRegistrationStore } from '@/stores/vehicleRegistration'
import { useUserStore } from '@/stores/user'

const VehicleModal = defineAsyncComponent(() => import('@/components/modals/VehicleModal.vue'))

// Get stores
const vehicleRegistrationStore = useVehicleRegistrationStore()
const userStore = useUserStore()

// Get vehicles with owner information
const vehicles = computed(() => {
  if (userStore.isAdmin) {
    return vehicleRegistrationStore.vehiclesWithOwnerInfo.map((vehicle) => {
      const plate = vehicleRegistrationStore.getPlateByVehicleId(vehicle.id)
      return {
        id: vehicle.id,
        make: vehicle.vehicleMake,
        model: vehicle.vehicleSeries,
        year: vehicle.yearModel,
        color: vehicle.color,
        mvFileNumber: vehicle.mvFileNumber,
        plateNumber: plate?.plate_number || 'No Plate',
        plateType: plate?.plate_type || 'N/A',
        status: plate?.status || 'Pending',
        lastUpdated: vehicle.lastRenewalDate || 'N/A',
        owner: vehicle.owner,
      }
    })
  } else {
    return vehicleRegistrationStore.userVehicles.map((vehicle) => {
      const plate = vehicleRegistrationStore.getPlateByVehicleId(vehicle.id)
      return {
        id: vehicle.id,
        make: vehicle.vehicleMake,
        model: vehicle.vehicleSeries,
        year: vehicle.yearModel,
        color: vehicle.color,
        mvFileNumber: vehicle.mvFileNumber,
        plateNumber: plate?.plate_number || 'No Plate',
        plateType: plate?.plate_type || 'N/A',
        status: plate?.status || 'Pending',
        lastUpdated: vehicle.lastRenewalDate || 'N/A',
        owner: userStore.fullName,
      }
    })
  }
})

// Search functionality
const searchQuery = ref('')
const filteredVehicles = computed(() => {
  if (!searchQuery.value) return vehicles.value

  const query = searchQuery.value.toLowerCase()
  return vehicles.value.filter(
    (vehicle) =>
      vehicle.make.toLowerCase().includes(query) ||
      vehicle.model.toLowerCase().includes(query) ||
      vehicle.plateNumber?.toLowerCase().includes(query),
  )
})

// Vehicle details modal
const isVehicleModalOpen = ref(false)
const selectedVehicle = ref(null)

const openVehicleModal = (vehicle) => {
  selectedVehicle.value = vehicle
  isVehicleModalOpen.value = true
}

const closeVehicleModal = () => {
  isVehicleModalOpen.value = false
}
</script>

<template>
  <div class="p-6 fade-in">
    <!-- Page Header -->
    <div class="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
      <div>
        <h1 class="text-2xl font-bold text-gray-800">Vehicle Information</h1>
        <p class="text-gray-600 mt-1">Manage your registered vehicles</p>
      </div>
    </div>

    <!-- Search and Filter Bar -->
    <div class="bg-white rounded-lg shadow-sm p-4 mb-6">
      <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div class="relative flex-grow">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search vehicles by make, model, or plate number..."
            class="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-dark-blue/20 transition-all"
          />
          <div class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
            <font-awesome-icon :icon="['fas', 'search']" class="w-4 h-4" />
          </div>
        </div>
        <div class="flex items-center space-x-2">
          <button
            class="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-lg flex items-center transition-colors"
          >
            <font-awesome-icon :icon="['fas', 'filter']" class="mr-2 text-gray-500" />
            Filter
          </button>
          <button
            class="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-lg flex items-center transition-colors"
          >
            <font-awesome-icon :icon="['fas', 'sort']" class="mr-2 text-gray-500" />
            Sort
          </button>
        </div>
      </div>
    </div>

    <!-- Vehicles Grid Layout -->
    <div class="mb-6">
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <!-- Vehicle Card -->
        <div
          v-for="vehicle in filteredVehicles"
          :key="vehicle.id"
          class="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
        >
          <!-- Vehicle Image -->
          <div
            :class="[
              'h-48 relative overflow-hidden',
              vehicle.status === 'Active'
                ? 'bg-gradient-to-r from-blue-50 to-green-50'
                : 'bg-gradient-to-r from-amber-50 to-yellow-50',
            ]"
          >
            <div class="absolute inset-0 flex items-center justify-center">
              <font-awesome-icon
                :icon="['fas', 'car']"
                :class="[
                  'w-24 h-24 opacity-80',
                  vehicle.color.toLowerCase() === 'white'
                    ? 'text-gray-300'
                    : vehicle.color.toLowerCase() === 'black'
                      ? 'text-gray-700'
                      : vehicle.color.toLowerCase() === 'red'
                        ? 'text-red-400'
                        : vehicle.color.toLowerCase() === 'blue'
                          ? 'text-blue-400'
                          : vehicle.color.toLowerCase() === 'green'
                            ? 'text-green-400'
                            : 'text-gray-300',
                ]"
              />
            </div>
            <div class="absolute top-4 right-4">
              <span
                :class="[
                  'px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full shadow-sm',
                  vehicle.status === 'Active'
                    ? 'bg-gradient-to-r from-green-100 to-green-200 text-green-800'
                    : 'bg-gradient-to-r from-yellow-100 to-amber-200 text-yellow-800',
                ]"
              >
                {{ vehicle.status }}
              </span>
            </div>
          </div>

          <!-- Vehicle Details -->
          <div class="p-4">
            <div class="flex justify-between items-center mb-2">
              <h3 class="text-lg font-bold text-gray-800">
                {{ vehicle.make }} {{ vehicle.model }}
              </h3>
              <span class="text-sm text-gray-500">{{ vehicle.year }}</span>
            </div>

            <div class="space-y-2 mb-4">
              <div class="flex items-center text-sm">
                <font-awesome-icon :icon="['fas', 'id-card']" class="w-4 h-4 text-gray-400 mr-2" />
                <span class="text-gray-600">{{ vehicle.plateNumber }}</span>
              </div>
              <div class="flex items-center text-sm">
                <font-awesome-icon :icon="['fas', 'tag']" class="w-4 h-4 text-gray-400 mr-2" />
                <span class="text-gray-600">{{ vehicle.plateType }}</span>
              </div>
              <div class="flex items-center text-sm">
                <font-awesome-icon :icon="['fas', 'file']" class="w-4 h-4 text-gray-400 mr-2" />
                <span class="text-gray-600">{{ vehicle.mvFileNumber }}</span>
              </div>
              <div class="flex items-center text-sm">
                <font-awesome-icon :icon="['fas', 'calendar']" class="w-4 h-4 text-gray-400 mr-2" />
                <span class="text-gray-600">Last Updated: {{ vehicle.lastUpdated }}</span>
              </div>
            </div>

            <div class="flex justify-between items-center">
              <span class="text-sm text-gray-500">{{ vehicle.owner }}</span>
              <button
                @click.prevent="openVehicleModal(vehicle)"
                class="px-3 py-1 text-sm text-blue-600 hover:text-blue-800 font-medium rounded-md hover:bg-blue-50 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-300"
              >
                View Details
              </button>
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div
          v-if="filteredVehicles.length === 0"
          class="col-span-full py-12 flex flex-col items-center justify-center bg-white rounded-lg shadow-sm"
        >
          <div class="bg-gray-100 rounded-full p-4 mb-4">
            <font-awesome-icon :icon="['fas', 'car']" class="text-gray-400 w-8 h-8" />
          </div>
          <h3 class="text-lg font-medium text-gray-900 mb-1">No vehicles found</h3>
          <p class="text-gray-500">Try adjusting your search criteria</p>
        </div>
      </div>
    </div>

    <!-- Vehicle Modal -->
    <VehicleModal
      :vehicle="selectedVehicle"
      :isOpen="isVehicleModalOpen && selectedVehicle"
      @close="closeVehicleModal"
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
