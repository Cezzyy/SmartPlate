<script setup>
import { defineProps, computed } from 'vue'
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

// Get plate details for the vehicle
const plateDetails = computed(() => {
  if (!props.vehicle || !props.vehicle.id) return null
  return store.getPlateByVehicleId(props.vehicle.id)
})

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

const getStatusDot = (status) => {
  switch (status?.toLowerCase()) {
    case 'active':
      return 'bg-green-500'
    case 'expired':
      return 'bg-red-500'
    case 'pending':
      return 'bg-yellow-500'
    default:
      return 'bg-gray-500'
  }
}

const formatDate = (dateString) => {
  if (!dateString) return 'N/A'

  try {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  } catch (e) {
    return dateString || 'N/A'
  }
}
</script>

<template>
  <div
    v-if="show"
    class="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4"
    @click.self="closeModal"
  >
    <div class="bg-white rounded-lg shadow-xl w-full max-w-4xl overflow-hidden">
      <!-- Modal Header with Gradient -->
      <div
        class="bg-gradient-to-r from-dark-blue to-blue-800 px-6 py-4 flex items-center justify-between"
      >
        <h3 class="text-xl font-bold text-white">Vehicle Details</h3>
        <button
          @click="closeModal"
          class="text-white hover:text-blue-200 transition-colors focus:outline-none"
        >
          <font-awesome-icon :icon="['fas', 'times']" class="w-5 h-5" />
        </button>
      </div>

      <!-- Modal Content -->
      <div class="px-6 py-4 max-h-[75vh] overflow-y-auto">
        <!-- Vehicle Profile Section -->
        <div class="mb-6">
          <div class="flex flex-col md:flex-row items-start md:items-center mb-6">
            <div
              class="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mr-4 mb-4 md:mb-0"
            >
              <font-awesome-icon :icon="['fas', 'car']" class="w-8 h-8 text-light-blue" />
            </div>
            <div>
              <h4 class="text-xl font-bold text-gray-900">
                {{ vehicle.vehicleMake }} {{ vehicle.vehicleSeries }}
              </h4>
              <div class="flex items-center mt-1">
                <span class="text-gray-600 mr-2">Plate No:</span>
                <span class="font-medium text-dark-blue">{{
                  plateDetails?.plate_number || 'Not Assigned'
                }}</span>
              </div>
              <div class="flex gap-2 mt-2">
                <span
                  :class="[
                    'px-3 py-1 rounded-full text-xs font-medium inline-flex items-center',
                    getStatusColor(plateDetails?.status),
                  ]"
                >
                  <span
                    :class="['w-2 h-2 rounded-full mr-2', getStatusDot(plateDetails?.status)]"
                  ></span>
                  {{
                    plateDetails?.status
                      ? plateDetails.status.charAt(0).toUpperCase() + plateDetails.status.slice(1)
                      : 'Unknown'
                  }}
                </span>
              </div>
            </div>
          </div>

          <!-- Main Info Grid -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- Registration Information -->
            <div class="bg-gray-50 rounded-lg shadow-sm overflow-hidden">
              <div class="bg-gray-100 px-4 py-3 border-b border-gray-200">
                <h5 class="font-medium text-gray-900 flex items-center">
                  <font-awesome-icon :icon="['fas', 'file-alt']" class="mr-2 text-light-blue" />
                  Registration Information
                </h5>
              </div>
              <div class="p-4">
                <div class="space-y-3">
                  <div class="flex justify-between items-center py-1 border-b border-gray-100">
                    <span class="text-gray-600">MV File Number</span>
                    <span class="font-medium text-gray-900">{{
                      vehicle.mvFileNumber || 'N/A'
                    }}</span>
                  </div>
                  <div class="flex justify-between items-center py-1 border-b border-gray-100">
                    <span class="text-gray-600">First Registration</span>
                    <span class="font-medium text-gray-900">{{
                      formatDate(vehicle.firstRegistrationDate)
                    }}</span>
                  </div>
                  <div class="flex justify-between items-center py-1 border-b border-gray-100">
                    <span class="text-gray-600">Last Renewal</span>
                    <span class="font-medium text-gray-900">{{
                      formatDate(vehicle.lastRenewalDate)
                    }}</span>
                  </div>
                  <div class="flex justify-between items-center py-1">
                    <span class="text-gray-600">Expiry Date</span>
                    <span class="font-medium text-gray-900">{{
                      formatDate(vehicle.registrationExpiryDate)
                    }}</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Owner Information -->
            <div class="bg-gray-50 rounded-lg shadow-sm overflow-hidden">
              <div class="bg-gray-100 px-4 py-3 border-b border-gray-200">
                <h5 class="font-medium text-gray-900 flex items-center">
                  <font-awesome-icon :icon="['fas', 'user']" class="mr-2 text-light-blue" />
                  Owner Information
                </h5>
              </div>
              <div class="p-4">
                <div class="space-y-3">
                  <div class="flex justify-between items-center py-1 border-b border-gray-100">
                    <span class="text-gray-600">Owner ID</span>
                    <span class="font-medium text-gray-900">{{ vehicle.ownerId || 'N/A' }}</span>
                  </div>
                  <div class="flex justify-between items-center py-1 border-b border-gray-100">
                    <span class="text-gray-600">Classification</span>
                    <span class="font-medium text-gray-900">{{
                      vehicle.classification || 'N/A'
                    }}</span>
                  </div>
                  <div class="flex justify-between items-center py-1">
                    <span class="text-gray-600">Usage</span>
                    <span class="font-medium text-gray-900">{{
                      vehicle.usageClassification || 'N/A'
                    }}</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Vehicle Information -->
            <div class="bg-gray-50 rounded-lg shadow-sm overflow-hidden">
              <div class="bg-gray-100 px-4 py-3 border-b border-gray-200">
                <h5 class="font-medium text-gray-900 flex items-center">
                  <font-awesome-icon :icon="['fas', 'info-circle']" class="mr-2 text-light-blue" />
                  Vehicle Information
                </h5>
              </div>
              <div class="p-4">
                <div class="grid grid-cols-2 gap-4">
                  <div class="space-y-3">
                    <div class="flex flex-col py-1">
                      <span class="text-gray-600 text-sm">Year Model</span>
                      <span class="font-medium text-gray-900">{{
                        vehicle.yearModel || 'N/A'
                      }}</span>
                    </div>
                    <div class="flex flex-col py-1">
                      <span class="text-gray-600 text-sm">Color</span>
                      <span class="font-medium text-gray-900">{{ vehicle.color || 'N/A' }}</span>
                    </div>
                    <div class="flex flex-col py-1">
                      <span class="text-gray-600 text-sm">Body Type</span>
                      <span class="font-medium text-gray-900">{{ vehicle.bodyType || 'N/A' }}</span>
                    </div>
                  </div>
                  <div class="space-y-3">
                    <div class="flex flex-col py-1">
                      <span class="text-gray-600 text-sm">Vehicle Type</span>
                      <span class="font-medium text-gray-900">{{
                        vehicle.vehicleType || 'N/A'
                      }}</span>
                    </div>
                    <div class="flex flex-col py-1">
                      <span class="text-gray-600 text-sm">Fuel Type</span>
                      <span class="font-medium text-gray-900">{{ vehicle.fuelType || 'N/A' }}</span>
                    </div>
                    <div class="flex flex-col py-1">
                      <span class="text-gray-600 text-sm">Vehicle Category</span>
                      <span class="font-medium text-gray-900">{{
                        vehicle.vehicleCategory || 'N/A'
                      }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Technical Specifications -->
            <div class="bg-gray-50 rounded-lg shadow-sm overflow-hidden">
              <div class="bg-gray-100 px-4 py-3 border-b border-gray-200">
                <h5 class="font-medium text-gray-900 flex items-center">
                  <font-awesome-icon :icon="['fas', 'cogs']" class="mr-2 text-light-blue" />
                  Technical Specifications
                </h5>
              </div>
              <div class="p-4">
                <div class="grid grid-cols-2 gap-4">
                  <div class="space-y-3">
                    <div class="flex flex-col py-1">
                      <span class="text-gray-600 text-sm">Engine Number</span>
                      <span class="font-medium text-gray-900">{{
                        vehicle.engineNumber || 'N/A'
                      }}</span>
                    </div>
                    <div class="flex flex-col py-1">
                      <span class="text-gray-600 text-sm">Chassis Number</span>
                      <span class="font-medium text-gray-900">{{
                        vehicle.chassisNumber || 'N/A'
                      }}</span>
                    </div>
                    <div class="flex flex-col py-1">
                      <span class="text-gray-600 text-sm">Conduction Sticker</span>
                      <span class="font-medium text-gray-900">{{
                        vehicle.conductionSticker || 'N/A'
                      }}</span>
                    </div>
                  </div>
                  <div class="space-y-3">
                    <div class="flex flex-col py-1">
                      <span class="text-gray-600 text-sm">Net Weight</span>
                      <span class="font-medium text-gray-900">{{
                        vehicle.netWeight ? `${vehicle.netWeight} kg` : 'N/A'
                      }}</span>
                    </div>
                    <div class="flex flex-col py-1">
                      <span class="text-gray-600 text-sm">Gross Weight</span>
                      <span class="font-medium text-gray-900">{{
                        vehicle.gvw ? `${vehicle.gvw} kg` : 'N/A'
                      }}</span>
                    </div>
                    <div class="flex flex-col py-1">
                      <span class="text-gray-600 text-sm">Piston Displacement</span>
                      <span class="font-medium text-gray-900">{{
                        vehicle.pistonDisplacement ? `${vehicle.pistonDisplacement} cc` : 'N/A'
                      }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div class="bg-gray-50 px-6 py-4 border-t border-gray-200 flex justify-end">
        <button
          @click="closeModal"
          class="inline-flex items-center px-4 py-2 bg-light-blue text-white hover:bg-blue-700 font-medium rounded-md transition-colors duration-200"
        >
          Close
        </button>
      </div>
    </div>
  </div>
</template>
