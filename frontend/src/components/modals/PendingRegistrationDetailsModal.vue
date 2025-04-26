<script setup>
import { defineProps } from 'vue'

defineProps({
  registration: {
    type: Object,
    required: true,
  },
  show: {
    type: Boolean,
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
    case 'expired':
      return 'bg-red-100 text-red-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}
</script>

<template>
  <div v-if="show" class="fixed inset-0 z-50 overflow-y-auto">
    <div class="fixed inset-0 bg-black bg-opacity-50 z-40" @click.self="closeModal"></div>
    <div class="flex items-center justify-center min-h-screen px-4 py-6">
      <div
        class="bg-white rounded-lg shadow-xl w-full max-w-4xl mx-4 overflow-hidden relative z-50"
      >
        <!-- Modal Header -->
        <div class="border-b px-6 py-4 flex items-center justify-between">
          <h3 class="text-xl font-semibold text-gray-900">Registration Details</h3>
          <button @click="closeModal" class="text-gray-400 hover:text-gray-500 focus:outline-none">
            <font-awesome-icon :icon="['fas', 'times']" class="w-5 h-5" />
          </button>
        </div>

        <!-- Modal Content -->
        <div class="px-6 py-4 max-h-[80vh] overflow-y-auto">
          <!-- Registration Status Section -->
          <div class="mb-6">
            <div class="flex items-center mb-4">
              <div class="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                <font-awesome-icon
                  :icon="['fas', 'clipboard-list']"
                  class="w-8 h-8 text-blue-600"
                />
              </div>
              <div>
                <h4 class="text-lg font-semibold text-gray-900">
                  {{ registration.make }} {{ registration.model }}
                </h4>
                <p class="text-gray-600">Plate No: {{ registration.plateNumber }}</p>
                <div class="flex gap-2 mt-1">
                  <span
                    :class="[
                      'px-2 py-1 rounded-full text-xs font-medium',
                      getStatusColor(registration.status),
                    ]"
                  >
                    {{ registration.status.charAt(0).toUpperCase() + registration.status.slice(1) }}
                  </span>
                </div>
              </div>
            </div>

            <!-- Registration Information -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div class="bg-gray-50 rounded-lg p-4">
                <h5 class="font-medium text-gray-900 mb-3">Vehicle Details</h5>
                <div class="space-y-2">
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
                  <div class="flex justify-between">
                    <span class="text-gray-600">Vehicle Type</span>
                    <span class="font-medium">{{ registration.vehicleType }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-gray-600">Engine Number</span>
                    <span class="font-medium">{{ registration.engineNumber }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-gray-600">Chassis Number</span>
                    <span class="font-medium">{{ registration.chassisNumber }}</span>
                  </div>
                </div>
              </div>

              <div class="bg-gray-50 rounded-lg p-4">
                <h5 class="font-medium text-gray-900 mb-3">Registration Details</h5>
                <div class="space-y-2">
                  <div class="flex justify-between">
                    <span class="text-gray-600">Type</span>
                    <span class="font-medium">{{
                      registration.registrationType || 'Not specified'
                    }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-gray-600">Submission Date</span>
                    <span class="font-medium">{{
                      registration.submissionDate || 'Not specified'
                    }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-gray-600">Expiry Date</span>
                    <span class="font-medium">{{
                      registration.expiryDate || 'Not specified'
                    }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-gray-600">Reference Code</span>
                    <span class="font-medium">{{
                      registration.referenceCode || 'Not specified'
                    }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-gray-600">Inspection Status</span>
                    <span
                      class="font-medium"
                      :class="getStatusColor(registration.inspectionStatus)"
                      >{{ registration.inspectionStatus || 'Not specified' }}</span
                    >
                  </div>
                  <div class="flex justify-between">
                    <span class="text-gray-600">Payment Status</span>
                    <span class="font-medium" :class="getStatusColor(registration.paymentStatus)">{{
                      registration.paymentStatus || 'Not specified'
                    }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-gray-600">Verification Status</span>
                    <span
                      class="font-medium"
                      :class="getStatusColor(registration.verificationStatus)"
                      >{{ registration.verificationStatus || 'Not specified' }}</span
                    >
                  </div>
                  <div class="flex justify-between">
                    <span class="text-gray-600">Appointment Date</span>
                    <span class="font-medium">{{
                      registration.appointmentDate || 'Not scheduled'
                    }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-gray-600">Appointment Time</span>
                    <span class="font-medium">{{
                      registration.appointmentTime || 'Not scheduled'
                    }}</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Applicant Information -->
            <div class="bg-gray-50 rounded-lg p-4 mb-6">
              <h5 class="font-medium text-gray-900 mb-3">Applicant Information</h5>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="space-y-2">
                  <div class="flex justify-between">
                    <span class="text-gray-600">Name</span>
                    <span class="font-medium">{{ registration.applicantName }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-gray-600">Email</span>
                    <span class="font-medium">{{ registration.applicantEmail }}</span>
                  </div>
                </div>
                <div class="space-y-2">
                  <div class="flex justify-between">
                    <span class="text-gray-600">Phone</span>
                    <span class="font-medium">{{ registration.applicantPhone }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-gray-600">Address</span>
                    <span class="font-medium">{{ registration.applicantAddress }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Documents Section -->
          <div class="bg-gray-50 rounded-lg p-4">
            <h5 class="font-medium text-gray-900 mb-3">Required Documents</h5>
            <div class="grid grid-cols-1 gap-2">
              <div
                v-for="(doc, docType) in registration.documents"
                :key="docType"
                class="flex items-center justify-between bg-white p-3 rounded-lg"
              >
                <div class="flex items-center">
                  <font-awesome-icon :icon="['fas', 'file-alt']" class="text-gray-400 mr-3" />
                  <div>
                    <span class="font-medium">{{
                      docType.charAt(0).toUpperCase() + docType.slice(1).replace(/([A-Z])/g, ' $1')
                    }}</span>
                    <p v-if="doc" class="text-sm text-gray-500">
                      {{ doc.name }} ({{ (doc.size / 1024).toFixed(1) }} KB)
                    </p>
                    <p v-else class="text-sm text-gray-500">Not uploaded</p>
                  </div>
                </div>
                <span
                  :class="[
                    'px-2 py-1 text-xs font-medium rounded-full',
                    doc ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800',
                  ]"
                >
                  {{ doc ? 'Uploaded' : 'Pending' }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Modal Footer -->
        <div class="bg-gray-50 px-6 py-4 border-t flex justify-end space-x-3">
          <button
            @click="closeModal"
            class="inline-flex items-center px-4 py-2 border border-gray-300 text-gray-700 bg-white rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
