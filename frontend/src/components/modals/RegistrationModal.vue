<script setup>
import { defineProps, defineEmits } from 'vue'

defineProps({
  registration: {
    type: Object,
    default: null,
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

// Get status badge class
const getStatusBadgeClass = (status) => {
  switch (status) {
    case 'Approved':
      return 'bg-green-100 text-green-800'
    case 'Pending':
      return 'bg-yellow-100 text-yellow-800'
    case 'Rejected':
      return 'bg-red-100 text-red-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}
</script>

<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 overflow-y-auto">
    <div
      class="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0"
    >
      <!-- Background overlay with blur effect -->
      <div class="fixed inset-0 transition-opacity" @click="closeModal">
        <div class="absolute inset-0 bg-gray-700 opacity-60 backdrop-blur-sm"></div>
      </div>

      <!-- Modal panel -->
      <div
        class="inline-block align-bottom bg-white rounded-xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-5xl sm:w-full border border-gray-200"
      >
        <!-- Modal header with gradient background -->
        <div class="bg-gradient-to-r from-blue-600 to-dark-blue px-6 py-4 flex justify-between items-center">
          <h3 class="text-xl leading-6 font-semibold text-white">Registration Details</h3>
          <span
            v-if="registration"
            :class="[
              'px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full shadow-sm',
              getStatusBadgeClass(registration.status),
            ]"
          >
            {{ registration?.status }}
          </span>
        </div>

        <div class="bg-white px-6 py-5">
          <div v-if="registration">
            <!-- Two-column layout -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <!-- Left column -->
              <div class="space-y-6">
                <!-- Vehicle Info -->
                <div class="bg-gray-50 rounded-lg p-5 border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-300">
                  <div class="flex items-center mb-3">
                    <div class="bg-blue-100 rounded-full p-2 mr-3">
                      <font-awesome-icon :icon="['fas', 'car']" class="text-blue-600 w-5 h-5" />
                    </div>
                    <h4 class="text-lg font-medium text-gray-800">Vehicle Information</h4>
                  </div>
                  <div class="pl-2 border-l-4 border-blue-400">
                    <p class="text-base font-medium text-gray-800">
                      {{ registration.vehicleInfo }}
                    </p>
                    <p class="text-sm text-gray-600 mt-1">Plate: {{ registration.plateNumber }}</p>
                  </div>
                </div>

                <!-- Registration Details -->
                <div class="bg-gray-50 rounded-lg p-5 border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-300">
                  <div class="flex items-center mb-3">
                    <div class="bg-purple-100 rounded-full p-2 mr-3">
                      <font-awesome-icon :icon="['fas', 'clipboard-list']" class="text-purple-600 w-5 h-5" />
                    </div>
                    <h4 class="text-lg font-medium text-gray-800">Registration Details</h4>
                  </div>
                  <div class="grid grid-cols-2 gap-4">
                    <div class="bg-white p-3 rounded-md shadow-sm">
                      <p class="text-xs text-gray-500 uppercase tracking-wider">Type</p>
                      <p class="text-sm font-medium mt-1">
                        {{ registration.registrationType }}
                      </p>
                    </div>
                    <div class="bg-white p-3 rounded-md shadow-sm">
                      <p class="text-xs text-gray-500 uppercase tracking-wider">Submission Date</p>
                      <p class="text-sm font-medium mt-1">
                        {{ registration.submissionDate }}
                      </p>
                    </div>
                    <div class="bg-white p-3 rounded-md shadow-sm">
                      <p class="text-xs text-gray-500 uppercase tracking-wider">Expiry Date</p>
                      <p class="text-sm font-medium mt-1">{{ registration.expiryDate }}</p>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Right column -->
              <div class="space-y-6">
                <!-- Documents -->
                <div class="bg-gray-50 rounded-lg p-5 border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-300">
                  <div class="flex items-center mb-3">
                    <div class="bg-amber-100 rounded-full p-2 mr-3">
                      <font-awesome-icon :icon="['fas', 'file-alt']" class="text-amber-600 w-5 h-5" />
                    </div>
                    <h4 class="text-lg font-medium text-gray-800">Documents Submitted</h4>
                  </div>
                  <ul class="space-y-2">
                    <li
                      v-for="(doc, index) in registration.documents"
                      :key="index"
                      class="flex items-center text-sm bg-white p-3 rounded-md shadow-sm"
                    >
                      <font-awesome-icon
                        :icon="['fas', 'file-alt']"
                        class="mr-3 text-gray-400 w-4 h-4"
                      />
                      {{ doc }}
                    </li>
                  </ul>
                </div>

                <!-- Fees -->
                <div class="bg-gray-50 rounded-lg p-5 border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-300">
                  <div class="flex items-center mb-3">
                    <div class="bg-green-100 rounded-full p-2 mr-3">
                      <font-awesome-icon :icon="['fas', 'money-bill-wave']" class="text-green-600 w-5 h-5" />
                    </div>
                    <h4 class="text-lg font-medium text-gray-800">Fees</h4>
                  </div>
                  <div class="space-y-2">
                    <div
                      v-for="(value, key) in registration.fees"
                      :key="key"
                      class="flex justify-between items-center p-3 rounded-md"
                      :class="[
                        key === 'total' 
                          ? 'bg-green-50 border border-green-200' 
                          : 'bg-white shadow-sm'
                      ]"
                    >
                      <span 
                        class="text-sm" 
                        :class="{ 'text-green-800 font-semibold': key === 'total' }"
                      >
                        {{ key === 'total' ? 'Total' : key.replace(/([A-Z])/g, ' $1').trim() }}
                      </span>
                      <span 
                        class="text-sm font-medium" 
                        :class="{ 'text-green-800': key === 'total' }"
                      >
                        ₱{{ value.toLocaleString() }}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="bg-gray-50 px-6 py-4 sm:flex sm:flex-row-reverse border-t border-gray-100">
          <button
            v-if="registration && registration.status === 'Approved'"
            class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-gradient-to-r from-blue-600 to-dark-blue text-base font-medium text-white hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm transition-all duration-300"
          >
            <font-awesome-icon :icon="['fas', 'download']" class="mr-2" />
            Download Certificate
          </button>
          <button
            @click="closeModal"
            class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:w-auto sm:text-sm transition-all duration-300"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.backdrop-blur-sm {
  backdrop-filter: blur(4px);
}
</style>
