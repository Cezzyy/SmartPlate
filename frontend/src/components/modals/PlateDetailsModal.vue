<script setup>
import { defineProps } from 'vue'
import { useVehicleRegistrationStore } from '@/stores/vehicleRegistration'

const props = defineProps({
  show: {
    type: Boolean,
    required: true,
  },
  plate: {
    type: Object,
    required: true,
  },
})

const emit = defineEmits(['close'])
const store = useVehicleRegistrationStore()

const vehicle = store.getVehicleById(props.plate.vehicleId)

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
        <h3 class="text-xl font-semibold text-gray-900">Plate Details</h3>
        <button @click="closeModal" class="text-gray-400 hover:text-gray-500 focus:outline-none">
          <font-awesome-icon :icon="['fas', 'times']" class="w-5 h-5" />
        </button>
      </div>

      <!-- Modal Content -->
      <div class="px-6 py-4 max-h-[80vh] overflow-y-auto">
        <!-- Plate Profile Section -->
        <div class="mb-6">
          <div class="flex items-center mb-4">
            <div class="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mr-4">
              <font-awesome-icon :icon="['fas', 'car-side']" class="w-8 h-8 text-blue-600" />
            </div>
            <div>
              <h4 class="text-lg font-semibold text-gray-900">
                {{ plate.plate_number }}
              </h4>
              <p class="text-gray-600">{{ vehicle?.vehicleMake }} {{ vehicle?.vehicleSeries }}</p>
              <div class="flex gap-2 mt-1">
                <span
                  :class="[
                    'px-2 py-1 rounded-full text-xs font-medium',
                    getStatusColor(plate.status),
                  ]"
                >
                  {{
                    plate.status
                      ? plate.status.charAt(0).toUpperCase() + plate.status.slice(1)
                      : 'N/A'
                  }}
                </span>
              </div>
            </div>
          </div>

          <!-- Plate Information -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div class="bg-gray-50 rounded-lg p-4">
              <h5 class="font-medium text-gray-900 mb-3">Plate Information</h5>
              <div class="space-y-2">
                <div class="flex justify-between">
                  <span class="text-gray-600">Plate Number</span>
                  <span class="font-medium text-gray-900">{{ plate.plate_number }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-600">Issue Date</span>
                  <span class="font-medium text-gray-900">{{ plate.plate_issue_date }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-600">Expiration Date</span>
                  <span class="font-medium text-gray-900">{{ plate.plate_expiration_date }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-600">Plate Type</span>
                  <span class="font-medium text-gray-900">{{ plate.plate_type }}</span>
                </div>
              </div>
            </div>

            <!-- Vehicle Information -->
            <div class="bg-gray-50 rounded-lg p-4">
              <h5 class="font-medium text-gray-900 mb-3">Vehicle Information</h5>
              <div class="space-y-2">
                <div class="flex justify-between">
                  <span class="text-gray-600">Make</span>
                  <span class="font-medium text-gray-900">{{ vehicle?.vehicleMake || 'N/A' }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-600">Series</span>
                  <span class="font-medium text-gray-900">{{
                    vehicle?.vehicleSeries || 'N/A'
                  }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-600">Year Model</span>
                  <span class="font-medium text-gray-900">{{ vehicle?.yearModel || 'N/A' }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-600">Body Type</span>
                  <span class="font-medium text-gray-900">{{ vehicle?.bodyType || 'N/A' }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Additional Information -->
          <div class="bg-gray-50 rounded-lg p-4">
            <h5 class="font-medium text-gray-900 mb-3">Additional Information</h5>
            <div class="space-y-2">
              <div class="flex justify-between">
                <span class="text-gray-600">Registration Status</span>
                <span class="font-medium text-gray-900">{{ plate.status }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">Last Updated</span>
                <span class="font-medium text-gray-900">{{ plate.last_updated || 'N/A' }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">Notes</span>
                <span class="font-medium text-gray-900">{{
                  plate.notes || 'No additional notes'
                }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
