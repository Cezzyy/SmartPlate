<script setup>
import { defineProps, defineEmits } from 'vue'

defineProps({
  vehicle: {
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
          <h3 class="text-xl font-bold text-white">Vehicle Details</h3>
          <button @click="closeModal" class="text-white hover:text-gray-200 focus:outline-none">
            <font-awesome-icon :icon="['fas', 'times']" class="w-5 h-5" />
          </button>
        </div>

        <div class="flex flex-col md:flex-row">
          <!-- Vehicle Image Banner - Left Side -->
          <div
            :class="[
              'md:w-1/3 h-auto relative overflow-hidden',
              vehicle.status === 'Active'
                ? 'bg-gradient-to-r from-blue-50 to-green-50'
                : 'bg-gradient-to-r from-amber-50 to-yellow-50',
            ]"
          >
            <div class="flex items-center justify-center py-12">
              <font-awesome-icon
                :icon="['fas', 'car']"
                :class="[
                  'w-32 h-32 opacity-80',
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
            <!-- Status Badge -->
            <div class="absolute top-4 right-4">
              <span
                :class="[
                  'px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full shadow-sm',
                  vehicle.status === 'Active'
                    ? 'bg-gradient-to-r from-green-100 to-green-200 text-green-800'
                    : 'bg-gradient-to-r from-yellow-100 to-amber-200 text-amber-800',
                ]"
              >
                {{ vehicle.status }}
              </span>
            </div>
          </div>

          <!-- Vehicle Information - Right Side -->
          <div class="md:w-2/3 px-6 py-5 overflow-y-auto max-h-[70vh]">
            <div class="mb-6">
              <h2 class="text-2xl font-bold text-gray-900 mb-1">
                {{ vehicle.make }} {{ vehicle.model }}
                <span class="text-lg font-medium text-gray-600 ml-2">{{ vehicle.year }}</span>
              </h2>
              <p class="text-sm text-gray-500">Owner: {{ vehicle.owner }}</p>
            </div>

            <!-- Details Grid -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <!-- Plate Number -->
              <div class="bg-gray-50 p-3 rounded-lg">
                <div class="text-xs text-gray-500 mb-1">Plate Number</div>
                <div class="flex items-center">
                  <font-awesome-icon :icon="['fas', 'id-card']" class="text-dark-blue mr-2" />
                  <span class="text-base font-medium">{{ vehicle.plateNumber }}</span>
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
                      'bg-blue-100 text-blue-800': vehicle.plateType === 'Regular',
                      'bg-purple-100 text-purple-800': vehicle.plateType === 'Temporary',
                      'bg-orange-100 text-orange-800': vehicle.plateType === 'Improvised',
                    }"
                  >
                    {{ vehicle.plateType }}
                  </span>
                </div>
              </div>

              <!-- MV File Number -->
              <div class="bg-gray-50 p-3 rounded-lg">
                <div class="text-xs text-gray-500 mb-1">MV File Number</div>
                <div class="flex items-center">
                  <font-awesome-icon :icon="['fas', 'file-alt']" class="text-dark-blue mr-2" />
                  <span class="text-base font-medium">{{ vehicle.mvFileNumber }}</span>
                </div>
              </div>

              <!-- Color -->
              <div class="bg-gray-50 p-3 rounded-lg">
                <div class="text-xs text-gray-500 mb-1">Color</div>
                <div class="flex items-center">
                  <font-awesome-icon :icon="['fas', 'palette']" class="text-dark-blue mr-2" />
                  <span class="text-base font-medium">{{ vehicle.color }}</span>
                </div>
              </div>

              <!-- Status -->
              <div class="bg-gray-50 p-3 rounded-lg">
                <div class="text-xs text-gray-500 mb-1">Status</div>
                <div class="flex items-center">
                  <font-awesome-icon
                    :icon="['fas', vehicle.status === 'Active' ? 'check-circle' : 'clock']"
                    :class="[
                      'mr-2',
                      vehicle.status === 'Active' ? 'text-green-500' : 'text-amber-500',
                    ]"
                  />
                  <span class="text-base font-medium">{{ vehicle.status }}</span>
                </div>
              </div>

              <!-- Last Updated -->
              <div class="bg-gray-50 p-3 rounded-lg">
                <div class="text-xs text-gray-500 mb-1">Last Updated</div>
                <div class="flex items-center">
                  <font-awesome-icon :icon="['fas', 'calendar-alt']" class="text-dark-blue mr-2" />
                  <span class="text-base font-medium">{{ vehicle.lastUpdated }}</span>
                </div>
              </div>
            </div>

            <!-- Registration Information -->
            <div class="border-t border-gray-200 pt-5 mt-5">
              <h3 class="text-lg font-semibold text-gray-800 mb-3">Registration Information</h3>

              <div class="bg-blue-50 p-4 rounded-lg border border-blue-100 mb-4">
                <div class="flex items-start">
                  <div class="flex-shrink-0 mt-1">
                    <font-awesome-icon
                      :icon="['fas', 'info-circle']"
                      class="text-blue-500 w-5 h-5"
                    />
                  </div>
                  <div class="ml-3">
                    <h4 class="text-sm font-medium text-blue-800">Registration Status</h4>
                    <p class="text-sm text-blue-700 mt-1">
                      Your vehicle registration is valid until December 31, 2025.
                    </p>
                  </div>
                </div>
              </div>

              <!-- Registration Timeline -->
              <div class="space-y-4">
                <div class="flex items-start">
                  <div
                    class="flex-shrink-0 h-5 w-5 rounded-full bg-green-500 flex items-center justify-center"
                  >
                    <font-awesome-icon :icon="['fas', 'check']" class="text-white text-xs" />
                  </div>
                  <div class="ml-3">
                    <h4 class="text-sm font-medium text-gray-900">Initial Registration</h4>
                    <p class="text-xs text-gray-500 mt-0.5">January 15, 2023</p>
                  </div>
                </div>

                <div class="flex items-start">
                  <div
                    class="flex-shrink-0 h-5 w-5 rounded-full bg-green-500 flex items-center justify-center"
                  >
                    <font-awesome-icon :icon="['fas', 'check']" class="text-white text-xs" />
                  </div>
                  <div class="ml-3">
                    <h4 class="text-sm font-medium text-gray-900">Renewal</h4>
                    <p class="text-xs text-gray-500 mt-0.5">January 10, 2024</p>
                  </div>
                </div>

                <div class="flex items-start">
                  <div
                    class="flex-shrink-0 h-5 w-5 rounded-full bg-gray-300 flex items-center justify-center"
                  >
                    <font-awesome-icon :icon="['fas', 'clock']" class="text-white text-xs" />
                  </div>
                  <div class="ml-3">
                    <h4 class="text-sm font-medium text-gray-900">Next Renewal Due</h4>
                    <p class="text-xs text-gray-500 mt-0.5">January 2025</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div class="bg-gray-50 px-6 py-4 flex justify-end">
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
