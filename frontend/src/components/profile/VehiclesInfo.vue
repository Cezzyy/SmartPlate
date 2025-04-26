<script setup>
import { defineProps, ref, computed } from 'vue'
import { useVehicleRegistrationStore } from '@/stores/vehicleRegistration'

defineProps({
  user: {
    type: Object,
    required: true,
  },
  isEditMode: {
    type: Boolean,
    default: false,
  },
  formData: {
    type: Object,
    required: true,
  },
  showEmptyState: {
    type: Boolean,
    default: false,
  },
})

// Get vehicle registration store
const vehicleStore = useVehicleRegistrationStore()

// Tabs for vehicles information sections
const activeTab = ref('vehicles')

// Get user's vehicles and plates from the store
const vehicles = computed(() => vehicleStore.userVehicles)
const plates = computed(() => vehicleStore.userPlates)

// Calculate days remaining until expiry
const getDaysRemaining = (expiryDateStr) => {
  const today = new Date()
  const expiryDate = new Date(expiryDateStr)
  const diffTime = expiryDate - today
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return diffDays
}

// Get status color based on days remaining
const getExpiryStatusColor = (expiryDateStr) => {
  const daysRemaining = getDaysRemaining(expiryDateStr)

  if (daysRemaining < 0) return 'bg-red-100 text-red-800' // Expired
  if (daysRemaining < 30) return 'bg-yellow-100 text-yellow-800' // Expiring soon
  return 'bg-green-100 text-green-800' // Valid
}

// Get expiry status text
const getExpiryStatusText = (expiryDateStr) => {
  const daysRemaining = getDaysRemaining(expiryDateStr)

  if (daysRemaining < 0) return 'Expired'
  if (daysRemaining < 30) return `Expires in ${daysRemaining} days`
  return 'Valid'
}
</script>

<template>
  <div class="space-y-4 bg-white">
    <!-- Tabs for Vehicles Information -->
    <div class="border-b border-gray-200">
      <nav class="flex space-x-4" aria-label="Vehicles Information Tabs">
        <button
          @click="activeTab = 'vehicles'"
          :class="[
            'py-2 px-3 text-sm font-medium rounded-t-lg',
            activeTab === 'vehicles'
              ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-500'
              : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50',
          ]"
        >
          Vehicles
        </button>
        <button
          @click="activeTab = 'plates'"
          :class="[
            'py-2 px-3 text-sm font-medium rounded-t-lg',
            activeTab === 'plates'
              ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-500'
              : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50',
          ]"
        >
          Plates
        </button>
      </nav>
    </div>

    <!-- Vehicles Tab -->
    <div v-if="activeTab === 'vehicles'" class="space-y-4">
      <h3 class="text-lg font-medium text-gray-800">Your Vehicles</h3>

      <div v-if="vehicles.length === 0" class="text-center py-8 text-gray-500">
        <span v-if="showEmptyState">You don't have any registered vehicles yet.</span>
      </div>

      <!-- Vehicles Grid -->
      <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div
          v-for="vehicle in vehicles"
          :key="vehicle.id"
          class="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-200"
        >
          <div class="p-3 border-b bg-gradient-to-r from-blue-50 to-green-50">
            <div class="flex justify-between items-center">
              <h4 class="font-medium text-gray-800">
                {{ vehicle.vehicleMake }} {{ vehicle.vehicleSeries }}
              </h4>
              <span class="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                Active
              </span>
            </div>
            <p class="text-sm text-gray-600">{{ vehicle.yearModel }}</p>
          </div>

          <div class="p-3 space-y-2">
            <!-- Get plate number for this vehicle -->
            <div class="flex justify-between">
              <span class="text-sm text-gray-500">Plate Number:</span>
              <span class="text-sm font-medium">
                <template v-if="vehicleStore.getPlateByVehicleId(vehicle.id)?.plate_number">
                  {{ vehicleStore.getPlateByVehicleId(vehicle.id)?.plate_number }}
                </template>
                <span v-else class="text-gray-400 italic">Not assigned</span>
              </span>
            </div>
            <div class="flex justify-between">
              <span class="text-sm text-gray-500">Color:</span>
              <span class="text-sm">
                <template v-if="vehicle.color">{{ vehicle.color }}</template>
                <span v-else-if="showEmptyState" class="text-gray-400 italic">Not specified</span>
              </span>
            </div>
            <div class="flex justify-between">
              <span class="text-sm text-gray-500">Last Updated:</span>
              <span class="text-sm">
                <template v-if="vehicle.lastRenewalDate">{{ vehicle.lastRenewalDate }}</template>
                <span v-else-if="showEmptyState" class="text-gray-400 italic">Not available</span>
              </span>
            </div>
            <div class="flex justify-between">
              <span class="text-sm text-gray-500">Expiry Date:</span>
              <span class="text-sm">
                <template v-if="vehicle.registrationExpiryDate">{{ vehicle.registrationExpiryDate }}</template>
                <span v-else-if="showEmptyState" class="text-gray-400 italic">Not available</span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Plates Tab -->
    <div v-if="activeTab === 'plates'" class="space-y-4">
      <h3 class="text-lg font-medium text-gray-800">Your License Plates</h3>

      <div v-if="plates.length === 0" class="text-center py-8 text-gray-500">
        <span v-if="showEmptyState">You don't have any registered plates yet.</span>
      </div>

      <!-- Plates Grid -->
      <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div
          v-for="plate in plates"
          :key="plate.plateId"
          class="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-200"
        >
          <div class="p-3 border-b bg-gradient-to-r from-blue-50 to-green-50">
            <div class="flex justify-between items-center">
              <h4 class="font-medium text-gray-800">
                <template v-if="plate.plate_number">{{ plate.plate_number }}</template>
                <span v-else-if="showEmptyState" class="text-gray-400 italic">No plate number</span>
              </h4>
              <span class="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                {{ plate.status || 'Unknown' }}
              </span>
            </div>
            <p class="text-sm text-gray-600">
              <template v-if="plate.vehicleMake || plate.vehicleSeries">
                {{ plate.vehicleMake }} {{ plate.vehicleSeries }}
              </template>
              <span v-else-if="showEmptyState" class="text-gray-400 italic">Vehicle details not available</span>
            </p>
          </div>

          <div class="p-3 space-y-2">
            <div class="flex justify-between">
              <span class="text-sm text-gray-500">Registration Date:</span>
              <span class="text-sm">
                <template v-if="plate.plate_issue_date">{{ plate.plate_issue_date }}</template>
                <span v-else-if="showEmptyState" class="text-gray-400 italic">Not available</span>
              </span>
            </div>
            <div class="flex justify-between">
              <span class="text-sm text-gray-500">Expiry Date:</span>
              <span class="text-sm">
                <template v-if="plate.plate_expiration_date">{{ plate.plate_expiration_date }}</template>
                <span v-else-if="showEmptyState" class="text-gray-400 italic">Not available</span>
              </span>
            </div>
            <div class="flex justify-between">
              <span class="text-sm text-gray-500">Status:</span>
              <span v-if="plate.plate_expiration_date"
                :class="[
                  'text-sm px-2 py-0.5 rounded-full text-xs',
                  getExpiryStatusColor(plate.plate_expiration_date),
                ]"
              >
                {{ getExpiryStatusText(plate.plate_expiration_date) }}
              </span>
              <span v-else-if="showEmptyState" class="text-gray-400 italic">Not available</span>
            </div>
            <div class="flex justify-between">
              <span class="text-sm text-gray-500">Type:</span>
              <span class="text-sm">
                <template v-if="plate.plate_type">{{ plate.plate_type }}</template>
                <span v-else-if="showEmptyState" class="text-gray-400 italic">Not specified</span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
