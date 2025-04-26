<script setup lang="ts">
import { defineProps, ref } from 'vue'
import { useRegistrationStore } from '../../stores/registration'
import type { Registration } from '../../types/registration'

const props = defineProps({
  show: {
    type: Boolean,
    required: true,
  },
  registration: {
    type: Object as () => Registration,
    required: true,
  },
})

const emit = defineEmits(['close', 'update'])
const registrationStore = useRegistrationStore()

// Create form data with initial values from registration
const form = ref({
  applicantName: props.registration.applicantName || '',
  applicantEmail: props.registration.applicantEmail || '',
  applicantPhone: props.registration.applicantPhone || '',
  make: props.registration.make || '',
  model: props.registration.model || '',
  year: props.registration.year || '',
  color: props.registration.color || '',
  engineNumber: props.registration.engineNumber || '',
  chassisNumber: props.registration.chassisNumber || '',
  plateNumber: props.registration.plateNumber || '',
  vehicleType: props.registration.vehicleType || '',
  registrationType: props.registration.registrationType || 'New Registration',
  submissionDate: props.registration.submissionDate || '',
  expiryDate: props.registration.expiryDate || '',
  status: props.registration.status || 'Pending',
  inspectionStatus: props.registration.inspectionStatus || 'Pending',
  paymentStatus: props.registration.paymentStatus || 'Pending',
  verificationStatus: props.registration.verificationStatus || 'Pending',
})

// Status options
const statusOptions = [
  { value: 'Approved', label: 'Approved' },
  { value: 'Pending', label: 'Pending' },
  { value: 'Rejected', label: 'Rejected' },
  { value: 'Expired', label: 'Expired' },
]

// Registration type options
const registrationTypeOptions = [
  { value: 'New', label: 'New Registration' },
  { value: 'Renewal', label: 'Renewal' },
  { value: 'Transfer', label: 'Transfer' },
]

// Vehicle type options
const vehicleTypeOptions = [
  { value: 'Sedan', label: 'Sedan' },
  { value: 'SUV', label: 'SUV' },
  { value: 'Truck', label: 'Truck' },
  { value: 'Van', label: 'Van' },
  { value: 'Motorcycle', label: 'Motorcycle' },
]

const closeModal = (): void => {
  emit('close')
}

const handleSubmit = (): void => {
  // Create updated registration object
  const updatedRegistration: Registration = {
    ...props.registration,
    ...form.value,
    // Ensure vehicleInfo is properly updated based on make and model
    vehicleInfo: `${form.value.make} ${form.value.model} ${form.value.year}`.trim(),
  }

  // Update the registration in the store
  const success = registrationStore.updateRegistration(updatedRegistration)

  if (success) {
    // Emit update event to trigger notification
    emit('update', updatedRegistration)
    // Close the modal
    emit('close')
  } else {
    // Handle potential errors - in a real app, you might want to show an error notification
    console.error('Failed to update registration')
  }
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
        <h3 class="text-xl font-bold text-white">Edit Registration</h3>
        <button
          @click="closeModal"
          class="text-white hover:text-blue-200 transition-colors focus:outline-none"
        >
          <font-awesome-icon :icon="['fas', 'times']" class="w-5 h-5" />
        </button>
      </div>

      <!-- Modal Content -->
      <form @submit.prevent="handleSubmit" class="max-h-[75vh] overflow-y-auto">
        <div class="px-6 py-4">
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
                  Edit Registration {{ registration.referenceCode }}
                </h4>
                <p class="text-gray-600">{{ registration.vehicleInfo }}</p>
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
                  <div class="space-y-4">
                    <div>
                      <label for="make" class="block text-sm font-medium text-gray-700 mb-1"
                        >Make</label
                      >
                      <input
                        id="make"
                        v-model="form.make"
                        type="text"
                        class="w-full rounded-md border-gray-300 shadow-sm focus:border-light-blue focus:ring focus:ring-light-blue focus:ring-opacity-20"
                      />
                    </div>
                    <div>
                      <label for="model" class="block text-sm font-medium text-gray-700 mb-1"
                        >Model</label
                      >
                      <input
                        id="model"
                        v-model="form.model"
                        type="text"
                        class="w-full rounded-md border-gray-300 shadow-sm focus:border-light-blue focus:ring focus:ring-light-blue focus:ring-opacity-20"
                      />
                    </div>
                    <div>
                      <label for="year" class="block text-sm font-medium text-gray-700 mb-1"
                        >Year</label
                      >
                      <input
                        id="year"
                        v-model="form.year"
                        type="text"
                        class="w-full rounded-md border-gray-300 shadow-sm focus:border-light-blue focus:ring focus:ring-light-blue focus:ring-opacity-20"
                      />
                    </div>
                    <div>
                      <label for="color" class="block text-sm font-medium text-gray-700 mb-1"
                        >Color</label
                      >
                      <input
                        id="color"
                        v-model="form.color"
                        type="text"
                        class="w-full rounded-md border-gray-300 shadow-sm focus:border-light-blue focus:ring focus:ring-light-blue focus:ring-opacity-20"
                      />
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
                  <div class="space-y-4">
                    <div>
                      <label for="engineNumber" class="block text-sm font-medium text-gray-700 mb-1"
                        >Engine Number</label
                      >
                      <input
                        id="engineNumber"
                        v-model="form.engineNumber"
                        type="text"
                        class="w-full rounded-md border-gray-300 shadow-sm focus:border-light-blue focus:ring focus:ring-light-blue focus:ring-opacity-20"
                      />
                    </div>
                    <div>
                      <label
                        for="chassisNumber"
                        class="block text-sm font-medium text-gray-700 mb-1"
                        >Chassis Number</label
                      >
                      <input
                        id="chassisNumber"
                        v-model="form.chassisNumber"
                        type="text"
                        class="w-full rounded-md border-gray-300 shadow-sm focus:border-light-blue focus:ring focus:ring-light-blue focus:ring-opacity-20"
                      />
                    </div>
                    <div>
                      <label for="plateNumber" class="block text-sm font-medium text-gray-700 mb-1"
                        >Plate Number</label
                      >
                      <input
                        id="plateNumber"
                        v-model="form.plateNumber"
                        type="text"
                        class="w-full rounded-md border-gray-300 shadow-sm focus:border-light-blue focus:ring focus:ring-light-blue focus:ring-opacity-20"
                      />
                    </div>
                    <div>
                      <label for="vehicleType" class="block text-sm font-medium text-gray-700 mb-1"
                        >Vehicle Type</label
                      >
                      <select
                        id="vehicleType"
                        v-model="form.vehicleType"
                        class="w-full rounded-md border-gray-300 shadow-sm focus:border-light-blue focus:ring focus:ring-light-blue focus:ring-opacity-20"
                      >
                        <option
                          v-for="option in vehicleTypeOptions"
                          :key="option.value"
                          :value="option.value"
                        >
                          {{ option.label }}
                        </option>
                      </select>
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
                  <div class="space-y-4">
                    <div>
                      <label
                        for="applicantName"
                        class="block text-sm font-medium text-gray-700 mb-1"
                        >Name</label
                      >
                      <input
                        id="applicantName"
                        v-model="form.applicantName"
                        type="text"
                        class="w-full rounded-md border-gray-300 shadow-sm focus:border-light-blue focus:ring focus:ring-light-blue focus:ring-opacity-20"
                      />
                    </div>
                    <div>
                      <label
                        for="applicantEmail"
                        class="block text-sm font-medium text-gray-700 mb-1"
                        >Email</label
                      >
                      <input
                        id="applicantEmail"
                        v-model="form.applicantEmail"
                        type="email"
                        class="w-full rounded-md border-gray-300 shadow-sm focus:border-light-blue focus:ring focus:ring-light-blue focus:ring-opacity-20"
                      />
                    </div>
                    <div>
                      <label
                        for="applicantPhone"
                        class="block text-sm font-medium text-gray-700 mb-1"
                        >Phone</label
                      >
                      <input
                        id="applicantPhone"
                        v-model="form.applicantPhone"
                        type="text"
                        class="w-full rounded-md border-gray-300 shadow-sm focus:border-light-blue focus:ring focus:ring-light-blue focus:ring-opacity-20"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <!-- Registration Details -->
              <div class="bg-gray-50 rounded-lg shadow-sm overflow-hidden">
                <div class="bg-gray-100 px-4 py-3 border-b border-gray-200">
                  <h5 class="font-medium text-gray-900 flex items-center">
                    <font-awesome-icon
                      :icon="['fas', 'calendar-alt']"
                      class="mr-2 text-light-blue"
                    />
                    Registration Details
                  </h5>
                </div>
                <div class="p-4">
                  <div class="space-y-4">
                    <div>
                      <label
                        for="registrationType"
                        class="block text-sm font-medium text-gray-700 mb-1"
                        >Registration Type</label
                      >
                      <select
                        id="registrationType"
                        v-model="form.registrationType"
                        class="w-full rounded-md border-gray-300 shadow-sm focus:border-light-blue focus:ring focus:ring-light-blue focus:ring-opacity-20"
                      >
                        <option
                          v-for="option in registrationTypeOptions"
                          :key="option.value"
                          :value="option.value"
                        >
                          {{ option.label }}
                        </option>
                      </select>
                    </div>
                    <div>
                      <label
                        for="submissionDate"
                        class="block text-sm font-medium text-gray-700 mb-1"
                        >Submission Date</label
                      >
                      <input
                        id="submissionDate"
                        v-model="form.submissionDate"
                        type="date"
                        class="w-full rounded-md border-gray-300 shadow-sm focus:border-light-blue focus:ring focus:ring-light-blue focus:ring-opacity-20"
                      />
                    </div>
                    <div>
                      <label for="expiryDate" class="block text-sm font-medium text-gray-700 mb-1"
                        >Expiry Date</label
                      >
                      <input
                        id="expiryDate"
                        v-model="form.expiryDate"
                        type="date"
                        class="w-full rounded-md border-gray-300 shadow-sm focus:border-light-blue focus:ring focus:ring-light-blue focus:ring-opacity-20"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <!-- Status Information -->
              <div class="bg-gray-50 rounded-lg shadow-sm overflow-hidden md:col-span-2">
                <div class="bg-gray-100 px-4 py-3 border-b border-gray-200">
                  <h5 class="font-medium text-gray-900 flex items-center">
                    <font-awesome-icon
                      :icon="['fas', 'info-circle']"
                      class="mr-2 text-light-blue"
                    />
                    Status Information
                  </h5>
                </div>
                <div class="p-4">
                  <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <label for="status" class="block text-sm font-medium text-gray-700 mb-1"
                        >Registration Status</label
                      >
                      <select
                        id="status"
                        v-model="form.status"
                        class="w-full rounded-md border-gray-300 shadow-sm focus:border-light-blue focus:ring focus:ring-light-blue focus:ring-opacity-20"
                      >
                        <option
                          v-for="option in statusOptions"
                          :key="option.value"
                          :value="option.value"
                        >
                          {{ option.label }}
                        </option>
                      </select>
                    </div>
                    <div>
                      <label
                        for="inspectionStatus"
                        class="block text-sm font-medium text-gray-700 mb-1"
                        >Inspection Status</label
                      >
                      <select
                        id="inspectionStatus"
                        v-model="form.inspectionStatus"
                        class="w-full rounded-md border-gray-300 shadow-sm focus:border-light-blue focus:ring focus:ring-light-blue focus:ring-opacity-20"
                      >
                        <option
                          v-for="option in statusOptions"
                          :key="option.value"
                          :value="option.value"
                        >
                          {{ option.label }}
                        </option>
                      </select>
                    </div>
                    <div>
                      <label
                        for="paymentStatus"
                        class="block text-sm font-medium text-gray-700 mb-1"
                        >Payment Status</label
                      >
                      <select
                        id="paymentStatus"
                        v-model="form.paymentStatus"
                        class="w-full rounded-md border-gray-300 shadow-sm focus:border-light-blue focus:ring focus:ring-light-blue focus:ring-opacity-20"
                      >
                        <option
                          v-for="option in statusOptions"
                          :key="option.value"
                          :value="option.value"
                        >
                          {{ option.label }}
                        </option>
                      </select>
                    </div>
                    <div>
                      <label
                        for="verificationStatus"
                        class="block text-sm font-medium text-gray-700 mb-1"
                        >Verification Status</label
                      >
                      <select
                        id="verificationStatus"
                        v-model="form.verificationStatus"
                        class="w-full rounded-md border-gray-300 shadow-sm focus:border-light-blue focus:ring focus:ring-light-blue focus:ring-opacity-20"
                      >
                        <option
                          v-for="option in statusOptions"
                          :key="option.value"
                          :value="option.value"
                        >
                          {{ option.label }}
                        </option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div class="bg-gray-50 px-6 py-4 border-t border-gray-200 flex justify-end space-x-2">
          <button
            type="button"
            @click="closeModal"
            class="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors duration-200"
          >
            Cancel
          </button>
          <button
            type="submit"
            class="px-4 py-2 bg-light-blue text-white rounded-md hover:bg-blue-700 transition-colors duration-200"
          >
            Save Changes
          </button>
        </div>
      </form>
    </div>
  </div>
</template>
