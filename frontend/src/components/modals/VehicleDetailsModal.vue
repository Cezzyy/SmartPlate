<script setup>
import { defineProps } from 'vue'
import { useVehicleRegistrationStore } from '@/stores/vehicleRegistration'

const props = defineProps({
  show: {
    type: Boolean,
    required: true,
  },
  vehicle: {
    type: Object,
    required: true,
  },
})

const emit = defineEmits(['close'])
const store = useVehicleRegistrationStore()

const plateDetails = store.getPlateByVehicleId(props.vehicle.id)

const closeModal = () => {
  emit('close')
}

const getStatusColor = (status) => {
  switch (status?.toLowerCase()) {
    case 'active':
      return 'bg-green-100 text-green-800'
    case 'expired':
      return 'bg-red-100 text-red-800'
    case 'pending':
      return 'bg-yellow-100 text-yellow-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}
</script>

<template>
  <div
    v-if="show"
    class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
    @click.self="closeModal"
  >
    <div class="bg-white rounded-lg shadow-xl w-full max-w-4xl mx-4 overflow-hidden">
      <!-- Modal Header -->
      <div class="border-b px-6 py-4 flex items-center justify-between">
        <h3 class="text-xl font-semibold text-gray-900">Vehicle Details</h3>
        <button @click="closeModal" class="text-gray-400 hover:text-gray-500 focus:outline-none">
          <font-awesome-icon :icon="['fas', 'times']" class="w-5 h-5" />
        </button>
      </div>

      <!-- Modal Content -->
      <div class="px-6 py-4 max-h-[80vh] overflow-y-auto">
        <!-- Vehicle Profile Section -->
        <div class="mb-6">
          <div class="flex items-center mb-4">
            <div class="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mr-4">
              <font-awesome-icon :icon="['fas', 'car']" class="w-8 h-8 text-blue-600" />
            </div>
            <div>
              <h4 class="text-lg font-semibold text-gray-900">
                {{ vehicle.vehicleMake }} {{ vehicle.vehicleSeries }}
              </h4>
              <p class="text-gray-600">Plate No: {{ plateDetails?.plate_number || 'N/A' }}</p>
              <div class="flex gap-2 mt-1">
                <span
                  :class="[
                    'px-2 py-1 rounded-full text-xs font-medium',
                    getStatusColor(plateDetails?.status),
                  ]"
                >
                  {{
                    plateDetails?.status
                      ? plateDetails.status.charAt(0).toUpperCase() + plateDetails.status.slice(1)
                      : 'N/A'
                  }}
                </span>
              </div>
            </div>
          </div>

          <!-- Registration Information -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div class="bg-gray-50 rounded-lg p-4">
              <h5 class="font-medium text-gray-900 mb-3">Registration Information</h5>
              <div class="space-y-2">
                <div class="flex justify-between">
                  <span class="text-gray-600">MV File Number</span>
                  <span class="font-medium text-gray-900">{{ vehicle.mvFileNumber }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-600">First Registration</span>
                  <span class="font-medium text-gray-900">{{ vehicle.firstRegistrationDate }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-600">Last Renewal</span>
                  <span class="font-medium text-gray-900">{{ vehicle.lastRenewalDate }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-600">Expiry Date</span>
                  <span class="font-medium text-gray-900">{{
                    vehicle.registrationExpiryDate
                  }}</span>
                </div>
              </div>
            </div>

            <!-- Owner Information -->
            <div class="bg-gray-50 rounded-lg p-4">
              <h5 class="font-medium text-gray-900 mb-3">Owner Information</h5>
              <div class="space-y-2">
                <div class="flex justify-between">
                  <span class="text-gray-600">Owner ID</span>
                  <span class="font-medium text-gray-900">{{ vehicle.ownerId }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-600">Classification</span>
                  <span class="font-medium text-gray-900">{{ vehicle.classification }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-600">Usage</span>
                  <span class="font-medium text-gray-900">{{ vehicle.usageClassification }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Vehicle Information -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div class="bg-gray-50 rounded-lg p-4">
              <h5 class="font-medium text-gray-900 mb-3">Vehicle Information</h5>
              <div class="space-y-2">
                <div class="flex justify-between">
                  <span class="text-gray-600">Year Model</span>
                  <span class="font-medium text-gray-900">{{ vehicle.yearModel }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-600">Color</span>
                  <span class="font-medium text-gray-900">{{ vehicle.color }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-600">Body Type</span>
                  <span class="font-medium text-gray-900">{{ vehicle.bodyType }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-600">Vehicle Type</span>
                  <span class="font-medium text-gray-900">{{ vehicle.vehicleType }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-600">Fuel Type</span>
                  <span class="font-medium text-gray-900">{{ vehicle.fuelType }}</span>
                </div>
              </div>
            </div>

            <!-- Technical Specifications -->
            <div class="bg-gray-50 rounded-lg p-4">
              <h5 class="font-medium text-gray-900 mb-3">Technical Specifications</h5>
              <div class="space-y-2">
                <div class="flex justify-between">
                  <span class="text-gray-600">Engine Number</span>
                  <span class="font-medium text-gray-900">{{ vehicle.engineNumber }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-600">Chassis Number</span>
                  <span class="font-medium text-gray-900">{{ vehicle.chassisNumber }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-600">Conduction Sticker</span>
                  <span class="font-medium text-gray-900">{{ vehicle.conductionSticker }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-600">Vehicle Series</span>
                  <span class="font-medium text-gray-900">{{ vehicle.vehicleSeries }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-600">Piston Displacement</span>
                  <span class="font-medium text-gray-900">{{ vehicle.pistonDisplacement }} cc</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-600">Number of Cylinders</span>
                  <span class="font-medium text-gray-900">{{ vehicle.numberOfCylinders }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-600">Net Weight</span>
                  <span class="font-medium text-gray-900">{{ vehicle.netWeight }} kg</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-600">Shipping Weight</span>
                  <span class="font-medium text-gray-900">{{ vehicle.shippingWeight }} kg</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-600">Gross Weight</span>
                  <span class="font-medium text-gray-900">{{ vehicle.gvw }} kg</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
