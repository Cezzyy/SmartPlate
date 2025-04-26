<script setup>
import { defineProps } from 'vue'

defineProps({
  show: {
    type: Boolean,
    required: true,
  },
  registration: {
    type: Object,
    required: true,
  },
})

const emit = defineEmits(['close'])

const closeModal = () => {
  emit('close')
}

const getStatusColor = (status) => {
  switch (status?.toLowerCase()) {
    case 'approved':
      return 'bg-green-100 text-green-800'
    case 'pending':
      return 'bg-yellow-100 text-yellow-800'
    case 'rejected':
      return 'bg-red-100 text-red-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

const getStatusIcon = (status) => {
  switch (status?.toLowerCase()) {
    case 'approved':
      return ['fas', 'check-circle']
    case 'pending':
      return ['fas', 'clock']
    case 'rejected':
      return ['fas', 'times-circle']
    default:
      return ['fas', 'question-circle']
  }
}
</script>

<template>
  <div v-if="show" class="fixed inset-0 z-50 overflow-y-auto">
    <div
      class="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0"
    >
      <!-- Background overlay with blur effect -->
      <div class="fixed inset-0 transition-opacity" @click="closeModal">
        <div class="absolute inset-0 bg-gray-700 opacity-60 backdrop-blur-sm"></div>
      </div>
      <!-- Modal panel -->
      <div
        class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full"
      >
        <!-- Modal Header -->
        <div class="border-b px-6 py-4 flex items-center justify-between">
          <div class="flex items-center space-x-3">
            <font-awesome-icon
              :icon="getStatusIcon(registration.status)"
              :class="[getStatusColor(registration.status), 'w-6 h-6']"
            />
            <h3 class="text-xl font-semibold text-gray-900">Registration Details</h3>
          </div>
          <button @click="closeModal" class="text-gray-400 hover:text-gray-500 focus:outline-none">
            <font-awesome-icon :icon="['fas', 'times']" class="w-5 h-5" />
          </button>
        </div>

        <!-- Modal Content -->
        <div class="px-6 py-4 max-h-[80vh] overflow-y-auto">
          <!-- Vehicle Information -->
          <div class="mb-6">
            <h4 class="text-lg font-semibold text-gray-900 mb-4">Vehicle Information</h4>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div class="bg-gray-50 rounded-lg p-4">
                <div class="space-y-3">
                  <div class="flex justify-between">
                    <span class="text-gray-600">Make</span>
                    <span class="font-medium">{{ registration.make }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-gray-600">Model</span>
                    <span class="font-medium">{{ registration.model }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-gray-600">Year</span>
                    <span class="font-medium">{{ registration.year }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-gray-600">Color</span>
                    <span class="font-medium">{{ registration.color }}</span>
                  </div>
                </div>
              </div>
              <div class="bg-gray-50 rounded-lg p-4">
                <div class="space-y-3">
                  <div class="flex justify-between">
                    <span class="text-gray-600">Engine Number</span>
                    <span class="font-medium">{{ registration.engineNumber }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-gray-600">Chassis Number</span>
                    <span class="font-medium">{{ registration.chassisNumber }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-gray-600">Plate Number</span>
                    <span class="font-medium">{{ registration.plateNumber }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-gray-600">Vehicle Type</span>
                    <span class="font-medium">{{ registration.vehicleType }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Applicant Information -->
          <div class="mb-6">
            <h4 class="text-lg font-semibold text-gray-900 mb-4">Applicant Information</h4>
            <div class="bg-gray-50 rounded-lg p-4">
              <div class="space-y-3">
                <div class="flex justify-between">
                  <span class="text-gray-600">Name</span>
                  <span class="font-medium">{{ registration.applicantName }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-600">Email</span>
                  <span class="font-medium">{{ registration.applicantEmail }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-600">Phone</span>
                  <span class="font-medium">{{ registration.applicantPhone }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Registration Details -->
          <div class="mb-6">
            <h4 class="text-lg font-semibold text-gray-900 mb-4">Registration Details</h4>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div class="bg-gray-50 rounded-lg p-4">
                <div class="space-y-3">
                  <div class="flex justify-between">
                    <span class="text-gray-600">Registration Type</span>
                    <span class="font-medium">{{ registration.registrationType }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-gray-600">Reference Code</span>
                    <span class="font-medium">{{ registration.referenceCode }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-gray-600">Submission Date</span>
                    <span class="font-medium">{{ registration.submissionDate }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-gray-600">Expiry Date</span>
                    <span class="font-medium">{{ registration.expiryDate }}</span>
                  </div>
                </div>
              </div>
              <div class="bg-gray-50 rounded-lg p-4">
                <div class="space-y-3">
                  <div class="flex justify-between">
                    <span class="text-gray-600">Inspection Status</span>
                    <span
                      :class="[
                        'px-2 py-1 rounded-full text-xs font-medium',
                        getStatusColor(registration.inspectionStatus),
                      ]"
                    >
                      {{ registration.inspectionStatus }}
                    </span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-gray-600">Payment Status</span>
                    <span
                      :class="[
                        'px-2 py-1 rounded-full text-xs font-medium',
                        getStatusColor(registration.paymentStatus),
                      ]"
                    >
                      {{ registration.paymentStatus }}
                    </span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-gray-600">Verification Status</span>
                    <span
                      :class="[
                        'px-2 py-1 rounded-full text-xs font-medium',
                        getStatusColor(registration.verificationStatus),
                      ]"
                    >
                      {{ registration.verificationStatus }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Appointment Details -->
          <div class="mb-6">
            <h4 class="text-lg font-semibold text-gray-900 mb-4">Appointment Details</h4>
            <div class="bg-gray-50 rounded-lg p-4">
              <div class="space-y-3">
                <div class="flex justify-between">
                  <span class="text-gray-600">Date</span>
                  <span class="font-medium">{{
                    registration.appointmentDate || 'Not scheduled'
                  }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-600">Time</span>
                  <span class="font-medium">{{
                    registration.appointmentTime || 'Not scheduled'
                  }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Modal Footer -->
        <div class="bg-gray-50 px-6 py-4 border-t flex justify-end space-x-3">
          <button
            @click="closeModal"
            class="px-4 py-2 border border-gray-300 text-gray-700 bg-white rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
