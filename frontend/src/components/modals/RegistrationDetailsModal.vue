<script setup lang="ts">
import { defineProps, defineEmits } from 'vue'
import type { Registration } from '../../types/registration'

defineProps({
  show: {
    type: Boolean,
    required: true,
  },
  registration: {
    type: Object as () => Registration,
    required: true,
  },
})

const emit = defineEmits(['close'])

const closeModal = (): void => {
  emit('close')
}

const getStatusColor = (status: string | undefined): string => {
  switch (status?.toLowerCase()) {
    case 'approved':
      return 'bg-green-100 text-green-800'
    case 'pending':
      return 'bg-yellow-100 text-yellow-800'
    case 'rejected':
    case 'expired':
      return 'bg-red-100 text-red-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

const getStatusDot = (status: string | undefined): string => {
  switch (status?.toLowerCase()) {
    case 'approved':
      return 'bg-green-500'
    case 'pending':
      return 'bg-yellow-500'
    case 'rejected':
    case 'expired':
      return 'bg-red-500'
    default:
      return 'bg-gray-500'
  }
}

const formatDate = (dateString: string | undefined): string => {
  if (!dateString || dateString === 'Not specified' || dateString === 'Not applicable')
    return dateString || 'Not specified'

  try {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  } catch (e) {
    return dateString
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
        <h3 class="text-xl font-bold text-white">Registration Details</h3>
        <button
          @click="closeModal"
          class="text-white hover:text-blue-200 transition-colors focus:outline-none"
        >
          <font-awesome-icon :icon="['fas', 'times']" class="w-5 h-5" />
        </button>
      </div>

      <!-- Modal Content -->
      <div class="px-6 py-4 max-h-[75vh] overflow-y-auto">
        <!-- Registration Profile Section -->
        <div class="mb-6">
          <div class="flex flex-col md:flex-row items-start md:items-center mb-6">
            <div
              class="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mr-4 mb-4 md:mb-0"
            >
              <font-awesome-icon :icon="['fas', 'file-alt']" class="w-8 h-8 text-light-blue" />
            </div>
            <div>
              <h4 class="text-xl font-bold text-gray-900">
                {{ registration.vehicleInfo }}
              </h4>
              <div class="flex items-center mt-1">
                <span class="text-gray-600 mr-2">Reference:</span>
                <span class="font-medium text-dark-blue">{{ registration.referenceCode }}</span>
              </div>
              <div class="flex gap-2 mt-2">
                <span
                  :class="[
                    'px-3 py-1 rounded-full text-xs font-medium inline-flex items-center',
                    getStatusColor(registration.status),
                  ]"
                >
                  <span
                    :class="['w-2 h-2 rounded-full mr-2', getStatusDot(registration.status)]"
                  ></span>
                  {{ registration.status }}
                </span>
                <span class="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  {{ registration.registrationType }}
                </span>
              </div>
            </div>
          </div>

          <!-- Main Info Grid -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- Vehicle Information -->
            <div class="bg-gray-50 rounded-lg shadow-sm overflow-hidden">
              <div class="bg-gray-100 px-4 py-3 border-b border-gray-200">
                <h5 class="font-medium text-gray-900 flex items-center">
                  <font-awesome-icon :icon="['fas', 'car']" class="mr-2 text-light-blue" />
                  Vehicle Information
                </h5>
              </div>
              <div class="p-4">
                <div class="space-y-3">
                  <div class="flex justify-between items-center py-1 border-b border-gray-100">
                    <span class="text-gray-600">Make</span>
                    <span class="font-medium text-gray-900">{{ registration.make }}</span>
                  </div>
                  <div class="flex justify-between items-center py-1 border-b border-gray-100">
                    <span class="text-gray-600">Model</span>
                    <span class="font-medium text-gray-900">{{ registration.model }}</span>
                  </div>
                  <div class="flex justify-between items-center py-1 border-b border-gray-100">
                    <span class="text-gray-600">Year</span>
                    <span class="font-medium text-gray-900">{{ registration.year }}</span>
                  </div>
                  <div class="flex justify-between items-center py-1">
                    <span class="text-gray-600">Color</span>
                    <span class="font-medium text-gray-900">{{ registration.color }}</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Technical Information -->
            <div class="bg-gray-50 rounded-lg shadow-sm overflow-hidden">
              <div class="bg-gray-100 px-4 py-3 border-b border-gray-200">
                <h5 class="font-medium text-gray-900 flex items-center">
                  <font-awesome-icon :icon="['fas', 'cogs']" class="mr-2 text-light-blue" />
                  Technical Information
                </h5>
              </div>
              <div class="p-4">
                <div class="space-y-3">
                  <div class="flex justify-between items-center py-1 border-b border-gray-100">
                    <span class="text-gray-600">Engine Number</span>
                    <span class="font-medium text-gray-900">{{ registration.engineNumber }}</span>
                  </div>
                  <div class="flex justify-between items-center py-1 border-b border-gray-100">
                    <span class="text-gray-600">Chassis Number</span>
                    <span class="font-medium text-gray-900">{{ registration.chassisNumber }}</span>
                  </div>
                  <div class="flex justify-between items-center py-1 border-b border-gray-100">
                    <span class="text-gray-600">Plate Number</span>
                    <span class="font-medium text-gray-900">{{ registration.plateNumber }}</span>
                  </div>
                  <div class="flex justify-between items-center py-1">
                    <span class="text-gray-600">Vehicle Type</span>
                    <span class="font-medium text-gray-900">{{ registration.vehicleType }}</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Applicant Information -->
            <div class="bg-gray-50 rounded-lg shadow-sm overflow-hidden">
              <div class="bg-gray-100 px-4 py-3 border-b border-gray-200">
                <h5 class="font-medium text-gray-900 flex items-center">
                  <font-awesome-icon :icon="['fas', 'user']" class="mr-2 text-light-blue" />
                  Applicant Information
                </h5>
              </div>
              <div class="p-4">
                <div class="space-y-3">
                  <div class="flex justify-between items-center py-1 border-b border-gray-100">
                    <span class="text-gray-600">Name</span>
                    <span class="font-medium text-gray-900">{{ registration.applicantName }}</span>
                  </div>
                  <div class="flex justify-between items-center py-1 border-b border-gray-100">
                    <span class="text-gray-600">Email</span>
                    <span class="font-medium text-gray-900">{{ registration.applicantEmail }}</span>
                  </div>
                  <div class="flex justify-between items-center py-1">
                    <span class="text-gray-600">Phone</span>
                    <span class="font-medium text-gray-900">{{ registration.applicantPhone }}</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Registration Details -->
            <div class="bg-gray-50 rounded-lg shadow-sm overflow-hidden">
              <div class="bg-gray-100 px-4 py-3 border-b border-gray-200">
                <h5 class="font-medium text-gray-900 flex items-center">
                  <font-awesome-icon :icon="['fas', 'calendar-alt']" class="mr-2 text-light-blue" />
                  Registration Details
                </h5>
              </div>
              <div class="p-4">
                <div class="space-y-3">
                  <div class="flex justify-between items-center py-1 border-b border-gray-100">
                    <span class="text-gray-600">Registration Type</span>
                    <span class="font-medium text-gray-900">{{
                      registration.registrationType
                    }}</span>
                  </div>
                  <div class="flex justify-between items-center py-1 border-b border-gray-100">
                    <span class="text-gray-600">Submission Date</span>
                    <span class="font-medium text-gray-900">{{
                      formatDate(registration.submissionDate)
                    }}</span>
                  </div>
                  <div class="flex justify-between items-center py-1">
                    <span class="text-gray-600">Expiry Date</span>
                    <span class="font-medium text-gray-900">{{
                      formatDate(registration.expiryDate)
                    }}</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Status Information -->
            <div class="bg-gray-50 rounded-lg shadow-sm overflow-hidden md:col-span-2">
              <div class="bg-gray-100 px-4 py-3 border-b border-gray-200">
                <h5 class="font-medium text-gray-900 flex items-center">
                  <font-awesome-icon :icon="['fas', 'info-circle']" class="mr-2 text-light-blue" />
                  Status Information
                </h5>
              </div>
              <div class="p-4">
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div class="space-y-2">
                    <div>
                      <span class="text-gray-600 text-sm block">Inspection Status</span>
                      <span
                        :class="[
                          'px-2 py-1 mt-1 rounded-full text-xs font-medium inline-flex items-center',
                          getStatusColor(registration.inspectionStatus),
                        ]"
                      >
                        <span
                          :class="[
                            'w-1.5 h-1.5 rounded-full mr-1.5',
                            getStatusDot(registration.inspectionStatus),
                          ]"
                        ></span>
                        {{ registration.inspectionStatus }}
                      </span>
                    </div>
                  </div>
                  <div class="space-y-2">
                    <div>
                      <span class="text-gray-600 text-sm block">Payment Status</span>
                      <span
                        :class="[
                          'px-2 py-1 mt-1 rounded-full text-xs font-medium inline-flex items-center',
                          getStatusColor(registration.paymentStatus),
                        ]"
                      >
                        <span
                          :class="[
                            'w-1.5 h-1.5 rounded-full mr-1.5',
                            getStatusDot(registration.paymentStatus),
                          ]"
                        ></span>
                        {{ registration.paymentStatus }}
                      </span>
                    </div>
                  </div>
                  <div class="space-y-2">
                    <div>
                      <span class="text-gray-600 text-sm block">Verification Status</span>
                      <span
                        :class="[
                          'px-2 py-1 mt-1 rounded-full text-xs font-medium inline-flex items-center',
                          getStatusColor(registration.verificationStatus),
                        ]"
                      >
                        <span
                          :class="[
                            'w-1.5 h-1.5 rounded-full mr-1.5',
                            getStatusDot(registration.verificationStatus),
                          ]"
                        ></span>
                        {{ registration.verificationStatus }}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Appointment Information -->
            <div class="bg-gray-50 rounded-lg shadow-sm overflow-hidden md:col-span-2">
              <div class="bg-gray-100 px-4 py-3 border-b border-gray-200">
                <h5 class="font-medium text-gray-900 flex items-center">
                  <font-awesome-icon :icon="['fas', 'clock']" class="mr-2 text-light-blue" />
                  Appointment Information
                </h5>
              </div>
              <div class="p-4">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div class="space-y-3">
                    <div class="flex justify-between items-center py-1">
                      <span class="text-gray-600">Date</span>
                      <span class="font-medium text-gray-900">{{
                        registration.appointmentDate || 'Not scheduled'
                      }}</span>
                    </div>
                  </div>
                  <div class="space-y-3">
                    <div class="flex justify-between items-center py-1">
                      <span class="text-gray-600">Time</span>
                      <span class="font-medium text-gray-900">{{
                        registration.appointmentTime || 'Not scheduled'
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
