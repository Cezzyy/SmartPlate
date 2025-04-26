<script setup>
import { defineEmits } from 'vue'

const { plate, isOpen } = defineProps({
  plate: {
    type: Object,
    required: true,
  },
  isOpen: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['close'])

const closeModal = () => {
  emit('close')
}

// Calculate days remaining until expiry
const getDaysRemaining = (expiryDateStr) => {
  const today = new Date()
  const expiryDate = new Date(expiryDateStr)
  const diffTime = expiryDate - today
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return diffDays
}

// Get expiry status text
const getExpiryStatusText = (expiryDateStr) => {
  const daysRemaining = getDaysRemaining(expiryDateStr)

  if (daysRemaining < 0) return 'Expired'
  if (daysRemaining < 30) return `Expires in ${daysRemaining} days`
  return 'Valid'
}

// Get status color based on days remaining
const getExpiryStatusColor = (expiryDateStr) => {
  const daysRemaining = getDaysRemaining(expiryDateStr)

  if (daysRemaining < 0) return 'bg-red-100 text-red-800' // Expired
  if (daysRemaining < 30) return 'bg-yellow-100 text-yellow-800' // Expiring soon
  return 'bg-green-100 text-green-800' // Valid
}
</script>

<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 overflow-y-auto">
    <div
      class="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0"
    >
      <!-- Background overlay -->
      <div class="fixed inset-0 transition-opacity" @click="closeModal">
        <div class="absolute inset-0 bg-gray-900 opacity-75"></div>
      </div>

      <!-- Modal panel -->
      <div
        class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full"
        style="
          animation:
            fadeIn 0.3s ease-out,
            slideIn 0.3s ease-out;
        "
      >
        <!-- Header -->
        <div
          class="bg-gradient-to-r from-dark-blue to-blue-800 px-6 py-4 flex justify-between items-center"
        >
          <h3 class="text-xl font-bold text-white">Plate Details</h3>
          <button @click="closeModal" class="text-white hover:text-gray-200 focus:outline-none">
            <font-awesome-icon :icon="['fas', 'times']" class="w-5 h-5" />
          </button>
        </div>

        <div class="flex flex-col md:flex-row">
          <!-- Plate Banner - Left Side -->
          <div
            :class="[
              'md:w-1/3 h-auto relative overflow-hidden',
              plate.status === 'Active'
                ? 'bg-gradient-to-r from-blue-50 to-green-50'
                : 'bg-gradient-to-r from-amber-50 to-yellow-50',
            ]"
          >
            <div class="flex flex-col items-center justify-center py-12">
              <!-- License Plate Display -->
              <div
                class="bg-white border-4 border-gray-800 rounded-lg p-4 mb-6 shadow-lg w-48 text-center"
              >
                <div class="text-2xl font-bold tracking-wider">{{ plate.plateNumber }}</div>
                <div class="text-xs text-gray-500 mt-1">Vehicle License Plate</div>
              </div>

              <!-- Vehicle Icon -->
              <font-awesome-icon
                :icon="['fas', 'car']"
                class="w-16 h-16 text-gray-400 opacity-80"
              />

              <div class="mt-4 text-sm font-medium text-gray-700">
                {{ plate.vehicleMake }} {{ plate.vehicleModel }}
              </div>
            </div>

            <!-- Status Badge -->
            <div class="absolute top-4 right-4">
              <span
                :class="[
                  'px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full shadow-sm',
                  plate.status === 'Active'
                    ? 'bg-gradient-to-r from-green-100 to-green-200 text-green-800'
                    : 'bg-gradient-to-r from-yellow-100 to-amber-200 text-amber-800',
                ]"
              >
                {{ plate.status }}
              </span>
            </div>
          </div>

          <!-- Plate Information - Right Side -->
          <div class="md:w-2/3 px-6 py-5 overflow-y-auto max-h-[70vh]">
            <div class="mb-6">
              <h2 class="text-2xl font-bold text-gray-900 mb-1">Plate {{ plate.plateNumber }}</h2>
              <p class="text-sm text-gray-500">Owner: {{ plate.owner }}</p>
            </div>

            <!-- Details Grid -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <!-- Vehicle Information -->
              <div class="bg-gray-50 p-3 rounded-lg">
                <div class="text-xs text-gray-500 mb-1">Vehicle</div>
                <div class="flex items-center">
                  <font-awesome-icon :icon="['fas', 'car']" class="text-dark-blue mr-2" />
                  <span class="text-base font-medium"
                    >{{ plate.vehicleMake }} {{ plate.vehicleModel }}</span
                  >
                </div>
              </div>

              <!-- Type -->
              <div class="bg-gray-50 p-3 rounded-lg">
                <div class="text-xs text-gray-500 mb-1">Type</div>
                <div class="flex items-center">
                  <font-awesome-icon :icon="['fas', 'tag']" class="text-dark-blue mr-2" />
                  <span class="text-base font-medium">{{ plate.type }}</span>
                </div>
              </div>

              <!-- Plate Type -->
              <div class="bg-gray-50 p-3 rounded-lg">
                <div class="text-xs text-gray-500 mb-1">Plate Type</div>
                <div class="flex items-center">
                  <font-awesome-icon :icon="['fas', 'id-card']" class="text-dark-blue mr-2" />
                  <span
                    class="text-base font-medium px-2 py-0.5 rounded-full text-xs"
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

              <!-- MV File Number -->
              <div class="bg-gray-50 p-3 rounded-lg">
                <div class="text-xs text-gray-500 mb-1">MV File Number</div>
                <div class="flex items-center">
                  <font-awesome-icon :icon="['fas', 'file-alt']" class="text-dark-blue mr-2" />
                  <span class="text-base font-medium">{{ plate.mvFileNumber }}</span>
                </div>
              </div>

              <!-- Registration Date -->
              <div class="bg-gray-50 p-3 rounded-lg">
                <div class="text-xs text-gray-500 mb-1">Registration Date</div>
                <div class="flex items-center">
                  <font-awesome-icon
                    :icon="['fas', 'calendar-check']"
                    class="text-dark-blue mr-2"
                  />
                  <span class="text-base font-medium">{{ plate.registrationDate }}</span>
                </div>
              </div>

              <!-- Expiry Date -->
              <div class="bg-gray-50 p-3 rounded-lg">
                <div class="text-xs text-gray-500 mb-1">Expiry Date</div>
                <div class="flex items-center">
                  <font-awesome-icon
                    :icon="['fas', 'calendar-times']"
                    class="text-dark-blue mr-2"
                  />
                  <span class="text-base font-medium">{{ plate.expiryDate }}</span>
                </div>
              </div>
            </div>

            <!-- Expiry Status -->
            <div class="mb-6">
              <div :class="['p-4 rounded-lg border', getExpiryStatusColor(plate.expiryDate)]">
                <div class="flex items-start">
                  <div class="flex-shrink-0 mt-1">
                    <font-awesome-icon
                      :icon="[
                        'fas',
                        getDaysRemaining(plate.expiryDate) < 0
                          ? 'exclamation-circle'
                          : getDaysRemaining(plate.expiryDate) < 30
                            ? 'exclamation-triangle'
                            : 'check-circle',
                      ]"
                      :class="[
                        'w-5 h-5',
                        getDaysRemaining(plate.expiryDate) < 0
                          ? 'text-red-500'
                          : getDaysRemaining(plate.expiryDate) < 30
                            ? 'text-yellow-500'
                            : 'text-green-500',
                      ]"
                    />
                  </div>
                  <div class="ml-3">
                    <h4
                      :class="[
                        'text-sm font-medium',
                        getDaysRemaining(plate.expiryDate) < 0
                          ? 'text-red-800'
                          : getDaysRemaining(plate.expiryDate) < 30
                            ? 'text-yellow-800'
                            : 'text-green-800',
                      ]"
                    >
                      {{ getExpiryStatusText(plate.expiryDate) }}
                    </h4>
                    <p
                      :class="[
                        'text-sm mt-1',
                        getDaysRemaining(plate.expiryDate) < 0
                          ? 'text-red-700'
                          : getDaysRemaining(plate.expiryDate) < 30
                            ? 'text-yellow-700'
                            : 'text-green-700',
                      ]"
                    >
                      {{
                        getDaysRemaining(plate.expiryDate) < 0
                          ? 'Your plate registration has expired. Please renew as soon as possible.'
                          : getDaysRemaining(plate.expiryDate) < 30
                            ? 'Your plate registration will expire soon. Please plan to renew.'
                            : 'Your plate registration is valid and up to date.'
                      }}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Renewal Information -->
            <div class="border-t border-gray-200 pt-5 mt-5">
              <h3 class="text-lg font-semibold text-gray-800 mb-3">Renewal Information</h3>

              <div class="space-y-4">
                <div class="flex items-start">
                  <div
                    class="flex-shrink-0 h-5 w-5 rounded-full bg-blue-500 flex items-center justify-center"
                  >
                    <font-awesome-icon :icon="['fas', 'info']" class="text-white text-xs" />
                  </div>
                  <div class="ml-3">
                    <h4 class="text-sm font-medium text-gray-900">Renewal Fee</h4>
                    <p class="text-xs text-gray-500 mt-0.5">
                      The standard renewal fee is ₱750.00 for private vehicles.
                    </p>
                  </div>
                </div>

                <div class="flex items-start">
                  <div
                    class="flex-shrink-0 h-5 w-5 rounded-full bg-blue-500 flex items-center justify-center"
                  >
                    <font-awesome-icon :icon="['fas', 'info']" class="text-white text-xs" />
                  </div>
                  <div class="ml-3">
                    <h4 class="text-sm font-medium text-gray-900">Required Documents</h4>
                    <p class="text-xs text-gray-500 mt-0.5">
                      Vehicle registration, proof of insurance, and valid ID.
                    </p>
                  </div>
                </div>

                <div class="flex items-start">
                  <div
                    class="flex-shrink-0 h-5 w-5 rounded-full bg-blue-500 flex items-center justify-center"
                  >
                    <font-awesome-icon :icon="['fas', 'info']" class="text-white text-xs" />
                  </div>
                  <div class="ml-3">
                    <h4 class="text-sm font-medium text-gray-900">Renewal Process</h4>
                    <p class="text-xs text-gray-500 mt-0.5">
                      You can renew online or visit any DMV office with your documents.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div class="bg-gray-50 px-6 py-4 flex justify-end space-x-3">
          <button
            class="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
          >
            <font-awesome-icon :icon="['fas', 'print']" class="mr-2" />
            Print Details
          </button>
          <button
            @click="closeModal"
            class="bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded-lg transition-colors duration-200"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes slideIn {
  from {
    transform: translateY(10%);
  }
  to {
    transform: translateY(0);
  }
}
</style>
