<script setup lang="ts">
import { ref, computed, defineAsyncComponent } from 'vue'
import { useVehicleRegistrationStore } from '@/stores/vehicleRegistration'
import { useUserStore } from '@/stores/user'
import type { Vehicle } from '@/types/vehicle'

const PlateModal = defineAsyncComponent(() => import('@/components/modals/PlateModal.vue'))

// Get stores
const vehicleRegistrationStore = useVehicleRegistrationStore()
const userStore = useUserStore()

interface PlateDisplay {
  id: number
  plateNumber: string
  plateType: string
  registrationDate: string
  expiryDate: string
  type: string
  status: string
  vehicleMake: string
  vehicleModel: string
  vehicleYear: number | string
  owner: string
  vehicleId: number
}

// Get plates with relevant information
const plates = computed<PlateDisplay[]>(() => {
  if (userStore.isAdmin) {
    return vehicleRegistrationStore.platesWithVehicleInfo.map((plate) => {
      const vehicle = vehicleRegistrationStore.getVehicleById(plate.vehicleId)
      return {
        id: plate.plateId,
        plateNumber: plate.plate_number,
        plateType: plate.plate_type,
        registrationDate: plate.plate_issue_date,
        expiryDate: plate.plate_expiration_date,
        type: 'Standard',
        status: plate.status,
        vehicleMake: vehicle?.vehicleMake || '',
        vehicleModel: vehicle?.vehicleSeries || '',
        vehicleYear: vehicle?.yearModel || '',
        owner: 'Admin View',
        vehicleId: plate.vehicleId,
      }
    })
  } else {
    return vehicleRegistrationStore.userPlates.map((plate) => {
      const vehicle = vehicleRegistrationStore.getVehicleById(plate.vehicleId)
      return {
        id: plate.plateId,
        plateNumber: plate.plate_number,
        plateType: plate.plate_type,
        registrationDate: plate.plate_issue_date,
        expiryDate: plate.plate_expiration_date,
        type: 'Standard',
        status: plate.status,
        vehicleMake: vehicle?.vehicleMake || '',
        vehicleModel: vehicle?.vehicleSeries || '',
        vehicleYear: vehicle?.yearModel || '',
        owner: userStore.fullName,
        vehicleId: plate.vehicleId,
      }
    })
  }
})

// Search functionality
const searchQuery = ref('')
const filteredPlates = computed(() => {
  if (!searchQuery.value) return plates.value

  const query = searchQuery.value.toLowerCase()
  return plates.value.filter(
    (plate) =>
      plate.plateNumber.toLowerCase().includes(query) ||
      plate.vehicleMake.toLowerCase().includes(query) ||
      plate.vehicleModel.toLowerCase().includes(query),
  )
})

// Calculate days remaining until expiry
const getDaysRemaining = (expiryDateStr: string): number => {
  const today = new Date()
  const expiryDate = new Date(expiryDateStr)
  const diffTime = expiryDate.getTime() - today.getTime()
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
}

// Get status color based on days remaining
const getExpiryStatusColor = (expiryDateStr: string): string => {
  const daysRemaining = getDaysRemaining(expiryDateStr)

  if (daysRemaining < 0) return 'bg-red-100 text-red-800' // Expired
  if (daysRemaining < 30) return 'bg-yellow-100 text-yellow-800' // Expiring soon
  return 'bg-green-100 text-green-800' // Valid
}

// Get expiry status text
const getExpiryStatusText = (expiryDateStr: string): string => {
  const daysRemaining = getDaysRemaining(expiryDateStr)

  if (daysRemaining < 0) return 'Expired'
  if (daysRemaining < 30) return `Expires in ${daysRemaining} days`
  return 'Valid'
}

// Plate details modal
const isPlateModalOpen = ref(false)
interface PlateDetails extends Omit<Vehicle, 'id'> {
  plateId: number
  vehicleId: number
  plate_number: string
  plate_type: string
  plate_issue_date: string
  plate_expiration_date: string
  status: string
  owner: string
  type: string
}

const selectedPlate = ref<PlateDetails | null>(null)

const openPlateModal = (plate: PlateDisplay) => {
  const vehicle = vehicleRegistrationStore.getVehicleById(plate.vehicleId)
  if (!vehicle) return

  selectedPlate.value = {
    ...vehicle,
    plateId: plate.id,
    vehicleId: plate.vehicleId,
    plate_number: plate.plateNumber,
    plate_type: plate.plateType,
    plate_issue_date: plate.registrationDate,
    plate_expiration_date: plate.expiryDate,
    status: plate.status,
    owner: plate.owner || (userStore.isAdmin ? 'Admin View' : userStore.fullName),
    type: plate.type || 'Standard',
  }
  isPlateModalOpen.value = true
}

const closePlateModal = () => {
  isPlateModalOpen.value = false
  selectedPlate.value = null
}
</script>

<template>
  <div class="p-6 fade-in">
    <!-- Page Header -->
    <div class="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
      <div>
        <h1 class="text-2xl font-bold text-gray-800">Plate Information</h1>
        <p class="text-gray-600 mt-1">Manage your vehicle license plates</p>
      </div>
    </div>

    <!-- Search and Filter Bar -->
    <div class="bg-white rounded-lg shadow-sm p-4 mb-6">
      <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div class="relative flex-grow">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search plates by number, vehicle make or model..."
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

    <!-- Plates Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div
        v-for="plate in filteredPlates"
        :key="plate.id"
        class="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
      >
        <!-- Plate Header -->
        <div
          :class="[
            'p-4 border-b border-gray-100',
            plate.status === 'Active'
              ? 'bg-gradient-to-r from-blue-50 to-green-50'
              : 'bg-gradient-to-r from-amber-50 to-yellow-50',
          ]"
        >
          <div class="flex justify-between items-center">
            <h3 class="text-lg font-bold text-gray-800">{{ plate.plateNumber }}</h3>
            <span
              :class="[
                'px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full shadow-sm',
                plate.status === 'Active'
                  ? 'bg-gradient-to-r from-green-100 to-green-200 text-green-800'
                  : 'bg-gradient-to-r from-yellow-100 to-amber-200 text-yellow-800',
              ]"
            >
              {{ plate.status }}
            </span>
          </div>
          <p class="text-sm text-gray-600 mt-1">{{ plate.vehicleMake }} {{ plate.vehicleModel }}</p>
        </div>

        <!-- Plate Details -->
        <div class="p-4">
          <div class="space-y-3">
            <div class="flex justify-between">
              <span class="text-sm text-gray-500">Registration Date</span>
              <span class="text-sm font-medium">{{ plate.registrationDate }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-sm text-gray-500">Expiry Date</span>
              <span class="text-sm font-medium">{{ plate.expiryDate }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-sm text-gray-500">Type</span>
              <span class="text-sm font-medium">{{ plate.type }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-sm text-gray-500">Plate Type</span>
              <span
                class="text-sm font-medium px-2 py-0.5 rounded-full text-xs"
                :class="{
                  'bg-blue-100 text-blue-800': plate.plateType === 'Regular',
                  'bg-purple-100 text-purple-800': plate.plateType === 'Temporary',
                  'bg-orange-100 text-orange-800': plate.plateType === 'Improvised',
                }"
              >
                {{ plate.plateType }}
              </span>
            </div>
          </div>

          <!-- Status Badge -->
          <div class="mt-4">
            <div
              class="flex justify-between items-center px-3 py-2 rounded-md"
              :class="getExpiryStatusColor(plate.expiryDate)"
            >
              <span class="text-xs font-medium">{{ getExpiryStatusText(plate.expiryDate) }}</span>
              <font-awesome-icon :icon="['fas', 'clock']" class="w-4 h-4" />
            </div>
          </div>

          <!-- Footer -->
          <div class="flex justify-between items-center mt-4">
            <span class="text-sm text-gray-500">{{ plate.owner }}</span>
            <button
              @click="openPlateModal(plate)"
              class="px-3 py-1 text-sm text-blue-600 hover:text-blue-800 font-medium rounded-md hover:bg-blue-50 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-300"
            >
              View Details
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Plate Modal -->
    <PlateModal
      :plate="selectedPlate"
      :isOpen="isPlateModalOpen && selectedPlate"
      @close="closePlateModal"
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
