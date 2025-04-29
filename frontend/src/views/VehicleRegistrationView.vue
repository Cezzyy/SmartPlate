<script setup lang="ts">
import { ref, watch, onUnmounted } from 'vue'
import FormNavigationGuard from '../components/navigation/FormNavigationGuard.vue'
import { useRouter } from 'vue-router'
import { useVehicleRegistrationFormStore } from '../stores/vehicleRegistrationForm'
import { storeToRefs } from 'pinia'
import ConfirmNavigationModal from '../components/modals/ConfirmNavigationModal.vue'
import * as vehicleRegistrationService from '@/services/vehicleRegistrationService'

import type { VehicleDocuments } from '@/types/vehicleRegistration'

const router = useRouter()
const store = useVehicleRegistrationFormStore()
const showNavigationModal = ref<boolean>(false)
const totalSteps = 4
const isCheckingStatus = ref<boolean>(false)

// Use store's state and computed properties
const { formData, errors, currentStep } = storeToRefs(store)

// Use store's actions
const { validateVehicleInfo, validateDocuments, validateAppointment } = store

// Define helper functions first
// Generate appointment details
const generateAppointment = () => {
  // Generate date for tomorrow
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  formData.value.appointmentDate = tomorrow.toISOString().split('T')[0]

  // Generate time between 9am and 4pm
  const hour = Math.floor(Math.random() * 8) + 9
  formData.value.appointmentTime = `${hour}:00 ${hour >= 12 ? 'PM' : 'AM'}`

  // Generate unique verification codes if not set
  if (!formData.value.inspectionCode) {
    formData.value.inspectionCode =
      'INS-' + Math.random().toString(36).substring(2, 10).toUpperCase()
  }

  if (!formData.value.paymentCode) {
    formData.value.paymentCode = 'PAY-' + Math.random().toString(36).substring(2, 10).toUpperCase()
  }

  // Log to verify data is being set
  console.log('Generated appointment:', {
    date: formData.value.appointmentDate,
    time: formData.value.appointmentTime,
    inspectionCode: formData.value.inspectionCode,
  })
}

// Add function to proceed to step 4 after LTO approval
const goToPaymentStep = () => {
  if (currentStep.value === 3 && formData.value.status === 'approved') {
    currentStep.value = 4
  }
}

// Function to check if application status has been updated
const checkApplicationStatus = async () => {
  if (formData.value.id && formData.value.status === 'pending') {
    isCheckingStatus.value = true
    try {
      // First ensure the form exists in backend
      let updatedForm;
      try {
        // Try to get the form from backend
        updatedForm = await vehicleRegistrationService.getRegistrationById(formData.value.id);
      } catch (error) {
        console.log('Form not found in backend yet, submitting it first...');
        // Form doesn't exist in backend yet, submit it first
        await store.submitRegistration();
        // Then try to get it again
        try {
          updatedForm = await vehicleRegistrationService.getRegistrationById(formData.value.id);
        } catch (secondError) {
          console.error('Failed to retrieve form after submission:', secondError);
          return; // Exit if still can't find form
        }
      }
      
      // Cast the response to VehicleRegistrationForm
      updatedForm = updatedForm as unknown as typeof formData.value;
      
      if (updatedForm && updatedForm.status === 'approved') {
        // Update the current formData with the approved status
        formData.value.status = 'approved';

        // Only copy appointment details from backend if they exist and our local ones don't
        if (updatedForm.appointmentDate && !formData.value.appointmentDate) {
          formData.value.appointmentDate = updatedForm.appointmentDate;
        }

        if (updatedForm.appointmentTime && !formData.value.appointmentTime) {
          formData.value.appointmentTime = updatedForm.appointmentTime;
        }

        if (updatedForm.inspectionCode && !formData.value.inspectionCode) {
          formData.value.inspectionCode = updatedForm.inspectionCode;
        }

        // Make sure we have appointment details
        if (
          !formData.value.appointmentDate ||
          !formData.value.appointmentTime ||
          !formData.value.inspectionCode
        ) {
          generateAppointment();
        }

        // Save changes to backend
        await vehicleRegistrationService.updateRegistrationForm(formData.value.id, formData.value);
        
        // Save changes to store
        store.setUnsavedChanges(true);

        console.log('Application approved by LTO officer!');

        // Immediately proceed to step 4
        goToPaymentStep();
      }
    } finally {
      // Small delay to prevent flickering if status changes quickly
      setTimeout(() => {
        isCheckingStatus.value = false;
      }, 500);
    }
  }
}

// Now define watchers after all functions are defined
// Add watcher for currentStep to check status when on step 3
watch(
  currentStep,
  (newStep) => {
    if (newStep === 3) {
      // Only check application status, don't generate appointment yet
      checkApplicationStatus()
    }
  },
  { immediate: true },
)

// Check status periodically when on step 3
let statusCheckInterval: number | null = null

watch(currentStep, (newStep) => {
  // Clear any existing interval
  if (statusCheckInterval) {
    clearInterval(statusCheckInterval)
    statusCheckInterval = null
  }

  // Set up periodic checking when on step 3
  if (newStep === 3 && formData.value.status === 'pending') {
    // Check less frequently (every 10 seconds) to reduce resource usage
    statusCheckInterval = setInterval(checkApplicationStatus, 10000) as unknown as number
  }
})

// Check for approval in the watcher
watch(
  () => formData.value.status,
  (newStatus) => {
    if (newStatus === 'approved' && currentStep.value === 3) {
      // Immediately go to payment step when approved
      goToPaymentStep()
    }
  },
)

// Also watch for inspection status changes
watch(
  () => formData.value.inspectionStatus,
  (newStatus) => {
    if (newStatus === 'approved' && currentStep.value === 3) {
      console.log('Inspection approved, advancing to payment step')
      currentStep.value = 4
    }
  },
)

// Clear interval on component unmount
onUnmounted(() => {
  if (statusCheckInterval) {
    clearInterval(statusCheckInterval)
  }
})

const nextStep = async (): Promise<void> => {
  let isValid = false

  if (currentStep.value === 1) {
    isValid = validateVehicleInfo()
  } else if (currentStep.value === 2) {
    isValid = validateDocuments()
  } else if (currentStep.value === 3) {
    // Always ensure we have appointment details for step 3
    if (
      !formData.value.appointmentDate ||
      !formData.value.appointmentTime ||
      !formData.value.inspectionCode
    ) {
      generateAppointment()
    }
    isValid = validateAppointment()
    
    // Submit to backend when going from step 3 to 4
    if (isValid) {
      // Hardcoded approval for demo purposes
      // In reality, this would be done by the LTO officer via admin panel
      formData.value.status = 'approved'
      
      // Save to backend
      const updated = await store.submitRegistration()
      
      if (!updated) {
        console.error('Failed to update status on backend')
        return
      }
    }
  } else if (currentStep.value === 4) {
    // Step 4 doesn't require validation anymore
    isValid = true
  }

  if (isValid && currentStep.value < totalSteps) {
    // Check if trying to move from step 3 to 4
    if (currentStep.value === 3) {
      // Only allow proceeding if status is approved
      if (formData.value.status === 'approved') {
        currentStep.value++
      }
    } else {
      currentStep.value++
    }
  }
}

const prevStep = () => {
  if (currentStep.value > 1) {
    currentStep.value--
  }
}

// Back to dashboard
const backToDashboard = () => {
  // Just show the navigation modal - don't generate an ID here
  // as that's already handled in submitRegistration
  showNavigationModal.value = true
}

const handleNavigationConfirm = async () => {
  showNavigationModal.value = false

  try {
    // Only save to backend if we already have a valid UUID (not a client-generated ID)
    if (formData.value.id && 
        !formData.value.id.startsWith('REG-') && 
        !formData.value.id.startsWith('REF-')) {
      console.log('Updating form with valid UUID before navigation:', formData.value.id);
      await store.submitRegistration();
    } else if (formData.value.id) {
      console.log('Form has client-generated ID, saving locally only:', formData.value.id);
      store.saveCurrentForm();
    } else {
      console.log('No form ID, generating reference code for local storage');
      formData.value.referenceCode = 'REF-' + new Date().getTime();
      store.saveCurrentForm();
    }
  } catch (error) {
    console.error('Error saving form before navigation:', error);
  }

  // Navigate back to home page
  router.push('/home');
}

const handleNavigationCancel = () => {
  showNavigationModal.value = false
}

// Handle file uploads with validation
const handleFileUpload = (event: Event, documentType: keyof VehicleDocuments): void => {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (file) {
    // Check file type
    const validTypes = ['application/pdf', 'image/jpeg', 'image/png']
    if (!validTypes.includes(file.type)) {
      errors.value.documents[documentType] = 'Only PDF, JPEG, and PNG files are allowed'
      return
    }

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      errors.value.documents[documentType] = 'File size must be less than 5MB'
      return
    }

    // Clear error and set file
    errors.value.documents[documentType] = ''
    formData.value.documents[documentType] = {
      name: file.name,
      size: file.size,
    }
  }
}

// Submit the registration - no longer needed as we removed the Submit button from step 4
const validateFinalStep = async (): Promise<void> => {
  router.push('/home')
}
</script>

<template>
  <div class="p-6 max-w-4xl mx-auto">
    <FormNavigationGuard />
    <ConfirmNavigationModal
      :is-open="showNavigationModal"
      @confirm="handleNavigationConfirm"
      @cancel="handleNavigationCancel"
    />
    <div class="bg-white rounded-xl shadow-md overflow-hidden">
      <!-- Header -->
      <div class="bg-gradient-to-r from-dark-blue to-light-blue p-6 text-white">
        <div class="flex justify-between items-center">
          <div>
            <h1 class="text-2xl font-bold">SmartPlate Vehicle Registration</h1>
            <p class="mt-2 text-blue-100">Complete all steps to register your vehicle with LTO</p>
          </div>
          <button
            @click="backToDashboard"
            class="bg-white text-dark-blue px-4 py-2 rounded-lg font-medium hover:bg-blue-50 transition-colors shadow-md flex items-center"
          >
            <font-awesome-icon :icon="['fas', 'arrow-left']" class="mr-2" />
            Back to Dashboard
          </button>
        </div>

        <!-- Progress bar -->
        <div class="mt-6 bg-blue-200 bg-opacity-30 h-2 rounded-full">
          <div
            class="bg-white h-full rounded-full transition-all duration-500"
            :style="`width: ${(currentStep / totalSteps) * 100}%`"
          ></div>
        </div>

        <!-- Step indicators -->
        <div class="flex justify-between mt-4">
          <div v-for="step in totalSteps" :key="step" class="text-center">
            <div
              class="w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-2 transition-all duration-300"
              :class="[
                currentStep === step
                  ? 'bg-white text-dark-blue'
                  : currentStep > step
                    ? 'bg-green-400 text-white'
                    : 'bg-blue-200 bg-opacity-30 text-white',
              ]"
            >
              <font-awesome-icon
                v-if="currentStep > step"
                :icon="['fas', 'check']"
                class="w-5 h-5"
              />
              <span v-else>{{ step }}</span>
            </div>
            <span class="text-xs text-blue-100">
              {{
                step === 1
                  ? 'Vehicle Info'
                  : step === 2
                    ? 'Documents'
                    : step === 3
                      ? 'Inspection'
                      : 'Payment'
              }}
            </span>
          </div>
        </div>
      </div>

      <!-- Form content -->
      <div class="p-6">
        <!-- Step 1: Vehicle Information -->
        <div v-if="currentStep === 1" class="fade-in">
          <h2 class="text-xl font-bold text-gray-800 mb-6 flex items-center">
            <div
              class="w-8 h-8 rounded-full bg-dark-blue text-white flex items-center justify-center mr-3"
            >
              1
            </div>
            Vehicle Information
          </h2>

          <div class="space-y-6">
            <div class="mb-4">
              <label class="block text-gray-700 font-medium mb-2 required-field"
                >Vehicle Type</label
              >
              <div class="flex space-x-4">
                <label class="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    v-model="formData.vehicleType"
                    value="2-Wheel"
                    class="form-radio h-5 w-5 text-dark-blue focus:ring-dark-blue"
                  />
                  <span class="ml-2">2-Wheel</span>
                </label>
                <label class="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    v-model="formData.vehicleType"
                    value="4-Wheel"
                    class="form-radio h-5 w-5 text-dark-blue focus:ring-dark-blue"
                  />
                  <span class="ml-2">4-Wheel</span>
                </label>
              </div>
              <p v-if="errors.vehicleType" class="error-message">{{ errors.vehicleType }}</p>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label class="block text-gray-700 font-medium mb-2 required-field">Make</label>
                <input
                  type="text"
                  v-model="formData.make"
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-dark-blue focus:border-transparent"
                  :class="{ 'input-error': errors.make }"
                  placeholder="e.g. Toyota"
                />
                <p v-if="errors.make" class="error-message">{{ errors.make }}</p>
              </div>

              <div>
                <label class="block text-gray-700 font-medium mb-2 required-field">Model</label>
                <input
                  type="text"
                  v-model="formData.model"
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-dark-blue focus:border-transparent"
                  :class="{ 'input-error': errors.model }"
                  placeholder="e.g. Corolla"
                />
                <p v-if="errors.model" class="error-message">{{ errors.model }}</p>
              </div>

              <div>
                <label class="block text-gray-700 font-medium mb-2 required-field">Year</label>
                <input
                  type="number"
                  v-model="formData.year"
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-dark-blue focus:border-transparent"
                  :class="{ 'input-error': errors.year }"
                  placeholder="e.g. 2023"
                  min="1900"
                  :max="new Date().getFullYear() + 1"
                />
                <p v-if="errors.year" class="error-message">{{ errors.year }}</p>
              </div>

              <div>
                <label class="block text-gray-700 font-medium mb-2 required-field">Color</label>
                <input
                  type="text"
                  v-model="formData.color"
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-dark-blue focus:border-transparent"
                  :class="{ 'input-error': errors.color }"
                  placeholder="e.g. White"
                />
                <p v-if="errors.color" class="error-message">{{ errors.color }}</p>
              </div>

              <div>
                <label class="block text-gray-700 font-medium mb-2 required-field"
                  >Engine Number</label
                >
                <input
                  type="text"
                  v-model="formData.engineNumber"
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-dark-blue focus:border-transparent"
                  :class="{ 'input-error': errors.engineNumber }"
                  placeholder="Enter engine number"
                />
                <p v-if="errors.engineNumber" class="error-message">{{ errors.engineNumber }}</p>
              </div>

              <div>
                <label class="block text-gray-700 font-medium mb-2 required-field"
                  >Chassis Number</label
                >
                <input
                  type="text"
                  v-model="formData.chassisNumber"
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-dark-blue focus:border-transparent"
                  :class="{ 'input-error': errors.chassisNumber }"
                  placeholder="Enter chassis number"
                />
                <p v-if="errors.chassisNumber" class="error-message">{{ errors.chassisNumber }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Step 2: Ownership Documents -->
        <div v-if="currentStep === 2" class="fade-in">
          <h2 class="text-xl font-bold text-gray-800 mb-6 flex items-center">
            <div
              class="w-8 h-8 rounded-full bg-dark-blue text-white flex items-center justify-center mr-3"
            >
              2
            </div>
            Ownership Documents
          </h2>

          <div class="mb-6">
            <label class="block text-gray-700 font-medium mb-2">Vehicle Status</label>
            <div class="flex space-x-4">
              <label class="flex items-center cursor-pointer">
                <input
                  type="radio"
                  v-model="formData.isNewVehicle"
                  :value="true"
                  class="form-radio h-5 w-5 text-dark-blue focus:ring-dark-blue"
                />
                <span class="ml-2">New Vehicle</span>
              </label>
              <label class="flex items-center cursor-pointer">
                <input
                  type="radio"
                  v-model="formData.isNewVehicle"
                  :value="false"
                  class="form-radio h-5 w-5 text-dark-blue focus:ring-dark-blue"
                />
                <span class="ml-2">Used Vehicle</span>
              </label>
            </div>
          </div>

          <div class="bg-blue-50 p-4 rounded-lg mb-6">
            <h3 class="text-lg font-medium text-gray-800 mb-2">Required Documents</h3>
            <p class="text-gray-600 mb-4">
              {{
                formData.isNewVehicle
                  ? 'For new vehicles, please upload the following documents:'
                  : 'For used vehicles, please upload the following documents:'
              }}
            </p>
            <ul class="list-disc pl-5 text-gray-700 space-y-1">
              <li v-if="formData.isNewVehicle">Certificate of Stock Report (CSR)</li>
              <li v-if="formData.isNewVehicle">Sales Invoice</li>
              <li v-if="formData.isNewVehicle">Insurance Certificate</li>
              <li v-if="!formData.isNewVehicle">
                Official Receipt/Certificate of Registration (OR/CR)
              </li>
              <li v-if="!formData.isNewVehicle">Deed of Sale</li>
              <li v-if="!formData.isNewVehicle">PNP-HPG Clearance</li>
            </ul>
          </div>

          <div class="space-y-6">
            <!-- New Vehicle Documents -->
            <div v-if="formData.isNewVehicle">
              <div class="mb-4">
                <label class="block text-gray-700 font-medium mb-2 required-field"
                  >Certificate of Stock Report (CSR)</label
                >
                <div
                  class="border-2 border-dashed rounded-lg p-6 transition-all duration-300"
                  :class="{
                    'border-red-500 bg-red-50': errors.documents.csr,
                    'border-gray-300 hover:border-dark-blue hover:bg-blue-50':
                      !errors.documents.csr,
                    'border-dark-blue bg-blue-50': formData.documents.csr,
                  }"
                >
                  <input
                    type="file"
                    @change="(e) => handleFileUpload(e, 'csr')"
                    class="hidden"
                    id="csr-upload"
                    accept=".pdf,.jpg,.jpeg,.png"
                  />
                  <label
                    for="csr-upload"
                    class="flex flex-col items-center justify-center cursor-pointer space-y-3"
                  >
                    <div
                      class="w-12 h-12 rounded-full flex items-center justify-center"
                      :class="{
                        'bg-red-100 text-red-500': errors.documents.csr,
                        'bg-gray-100 text-gray-500':
                          !formData.documents.csr && !errors.documents.csr,
                        'bg-blue-100 text-dark-blue': formData.documents.csr,
                      }"
                    >
                      <font-awesome-icon
                        :icon="['fas', formData.documents.csr ? 'check' : 'upload']"
                        class="text-xl"
                      />
                    </div>
                    <div class="text-center">
                      <p class="text-sm font-medium">
                        {{
                          formData.documents.csr
                            ? formData.documents.csr.name
                            : 'Drop your file here or click to browse'
                        }}
                      </p>
                      <p class="text-xs text-gray-500 mt-1">PDF, JPEG, or PNG (max. 5MB)</p>
                    </div>
                  </label>
                </div>
                <p v-if="errors.documents.csr" class="mt-2 text-sm text-red-600 flex items-center">
                  <font-awesome-icon :icon="['fas', 'exclamation-circle']" class="mr-2" />
                  {{ errors.documents.csr }}
                </p>
              </div>

              <div class="mb-4">
                <label class="block text-gray-700 font-medium mb-2 required-field"
                  >Sales Invoice</label
                >
                <div
                  class="border-2 border-dashed rounded-lg p-6 transition-all duration-300"
                  :class="{
                    'border-red-500 bg-red-50': errors.documents.salesInvoice,
                    'border-gray-300 hover:border-dark-blue hover:bg-blue-50':
                      !errors.documents.salesInvoice,
                    'border-dark-blue bg-blue-50': formData.documents.salesInvoice,
                  }"
                >
                  <input
                    type="file"
                    @change="(e) => handleFileUpload(e, 'salesInvoice')"
                    class="hidden"
                    id="sales-invoice-upload"
                    accept=".pdf,.jpg,.jpeg,.png"
                  />
                  <label
                    for="sales-invoice-upload"
                    class="flex flex-col items-center justify-center cursor-pointer space-y-3"
                  >
                    <div
                      class="w-12 h-12 rounded-full flex items-center justify-center"
                      :class="{
                        'bg-red-100 text-red-500': errors.documents.salesInvoice,
                        'bg-gray-100 text-gray-500':
                          !formData.documents.salesInvoice && !errors.documents.salesInvoice,
                        'bg-blue-100 text-dark-blue': formData.documents.salesInvoice,
                      }"
                    >
                      <font-awesome-icon
                        :icon="['fas', formData.documents.salesInvoice ? 'check' : 'upload']"
                        class="text-xl"
                      />
                    </div>
                    <div class="text-center">
                      <p class="text-sm font-medium">
                        {{
                          formData.documents.salesInvoice
                            ? formData.documents.salesInvoice.name
                            : 'Drop your file here or click to browse'
                        }}
                      </p>
                      <p class="text-xs text-gray-500 mt-1">PDF, JPEG, or PNG (max. 5MB)</p>
                    </div>
                  </label>
                </div>
                <p
                  v-if="errors.documents.salesInvoice"
                  class="mt-2 text-sm text-red-600 flex items-center"
                >
                  <font-awesome-icon :icon="['fas', 'exclamation-circle']" class="mr-2" />
                  {{ errors.documents.salesInvoice }}
                </p>
              </div>

              <div class="mb-4">
                <label class="block text-gray-700 font-medium mb-2 required-field"
                  >Insurance Certificate</label
                >
                <div
                  class="border-2 border-dashed rounded-lg p-6 transition-all duration-300"
                  :class="{
                    'border-red-500 bg-red-50': errors.documents.insurance,
                    'border-gray-300 hover:border-dark-blue hover:bg-blue-50':
                      !errors.documents.insurance,
                    'border-dark-blue bg-blue-50': formData.documents.insurance,
                  }"
                >
                  <input
                    type="file"
                    @change="(e) => handleFileUpload(e, 'insurance')"
                    class="hidden"
                    id="insurance-upload"
                    accept=".pdf,.jpg,.jpeg,.png"
                  />
                  <label
                    for="insurance-upload"
                    class="flex flex-col items-center justify-center cursor-pointer space-y-3"
                  >
                    <div
                      class="w-12 h-12 rounded-full flex items-center justify-center"
                      :class="{
                        'bg-red-100 text-red-500': errors.documents.insurance,
                        'bg-gray-100 text-gray-500':
                          !formData.documents.insurance && !errors.documents.insurance,
                        'bg-blue-100 text-dark-blue': formData.documents.insurance,
                      }"
                    >
                      <font-awesome-icon
                        :icon="['fas', formData.documents.insurance ? 'check' : 'upload']"
                        class="text-xl"
                      />
                    </div>
                    <div class="text-center">
                      <p class="text-sm font-medium">
                        {{
                          formData.documents.insurance
                            ? formData.documents.insurance.name
                            : 'Drop your file here or click to browse'
                        }}
                      </p>
                      <p class="text-xs text-gray-500 mt-1">PDF, JPEG, or PNG (max. 5MB)</p>
                    </div>
                  </label>
                </div>
                <p
                  v-if="errors.documents.insurance"
                  class="mt-2 text-sm text-red-600 flex items-center"
                >
                  <font-awesome-icon :icon="['fas', 'exclamation-circle']" class="mr-2" />
                  {{ errors.documents.insurance }}
                </p>
              </div>
            </div>

            <!-- Used Vehicle Documents -->
            <div v-else>
              <div class="mb-4">
                <label class="block text-gray-700 font-medium mb-2 required-field"
                  >Official Receipt/Certificate of Registration (OR/CR)</label
                >
                <div class="flex items-center">
                  <input
                    type="file"
                    @change="(e) => handleFileUpload(e, 'orCr')"
                    class="hidden"
                    id="orcr-upload"
                    accept=".pdf,.jpg,.jpeg,.png"
                  />
                  <label
                    for="orcr-upload"
                    class="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg cursor-pointer hover:bg-gray-200 transition-colors flex items-center"
                    :class="{ 'border-red-500 border': errors.documents.orCr }"
                  >
                    <font-awesome-icon :icon="['fas', 'upload']" class="mr-2" />
                    {{ formData.documents.orCr ? formData.documents.orCr.name : 'Choose file' }}
                  </label>
                </div>
                <p v-if="errors.documents.orCr" class="error-message">
                  {{ errors.documents.orCr }}
                </p>
                <p v-else class="mt-1 text-xs text-gray-500">PDF, JPEG, or PNG (max. 5MB)</p>
              </div>

              <div class="mb-4">
                <label class="block text-gray-700 font-medium mb-2 required-field"
                  >Deed of Sale</label
                >
                <div class="flex items-center">
                  <input
                    type="file"
                    @change="(e) => handleFileUpload(e, 'deedOfSale')"
                    class="hidden"
                    id="deed-of-sale-upload"
                    accept=".pdf,.jpg,.jpeg,.png"
                  />
                  <label
                    for="deed-of-sale-upload"
                    class="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg cursor-pointer hover:bg-gray-200 transition-colors flex items-center"
                    :class="{ 'border-red-500 border': errors.documents.deedOfSale }"
                  >
                    <font-awesome-icon :icon="['fas', 'upload']" class="mr-2" />
                    {{
                      formData.documents.deedOfSale
                        ? formData.documents.deedOfSale.name
                        : 'Choose file'
                    }}
                  </label>
                </div>
                <p v-if="errors.documents.deedOfSale" class="error-message">
                  {{ errors.documents.deedOfSale }}
                </p>
                <p v-else class="mt-1 text-xs text-gray-500">PDF, JPEG, or PNG (max. 5MB)</p>
              </div>

              <div class="mb-4">
                <label class="block text-gray-700 font-medium mb-2 required-field"
                  >PNP-HPG Clearance</label
                >
                <div class="flex items-center">
                  <input
                    type="file"
                    @change="(e) => handleFileUpload(e, 'pnpHpgClearance')"
                    class="hidden"
                    id="pnp-hpg-clearance-upload"
                    accept=".pdf,.jpg,.jpeg,.png"
                  />
                  <label
                    for="pnp-hpg-clearance-upload"
                    class="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg cursor-pointer hover:bg-gray-200 transition-colors flex items-center"
                    :class="{ 'border-red-500 border': errors.documents.pnpHpgClearance }"
                  >
                    <font-awesome-icon :icon="['fas', 'upload']" class="mr-2" />
                    {{
                      formData.documents.pnpHpgClearance
                        ? formData.documents.pnpHpgClearance.name
                        : 'Choose file'
                    }}
                  </label>
                </div>
                <p v-if="errors.documents.pnpHpgClearance" class="error-message">
                  {{ errors.documents.pnpHpgClearance }}
                </p>
                <p v-else class="mt-1 text-xs text-gray-500">PDF, JPEG, or PNG (max. 5MB)</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Step 3: Inspection & Verification -->
        <div v-if="currentStep === 3" class="fade-in">
          <h2 class="text-xl font-bold text-gray-800 mb-6 flex items-center">
            <div
              class="w-8 h-8 rounded-full bg-dark-blue text-white flex items-center justify-center mr-3"
            >
              3
            </div>
            Inspection & Verification
          </h2>

          <!-- Show inspection schedule always in step 3 -->
          <div class="bg-green-50 p-6 rounded-lg mb-6 border border-green-200">
            <h3 class="text-lg font-semibold text-green-800 mb-4">Your Inspection Schedule</h3>
            <div class="space-y-4">
              <div class="flex items-center">
                <font-awesome-icon :icon="['fa', 'calendar']" class="text-green-600 w-5 h-5 mr-3" />
                <div>
                  <p class="text-green-600">Date</p>
                  <p class="font-medium text-green-800">
                    {{ formData.appointmentDate || 'Not scheduled' }}
                  </p>
                </div>
              </div>
              <div class="flex items-center">
                <font-awesome-icon :icon="['fa', 'clock']" class="text-green-600 w-5 h-5 mr-3" />
                <div>
                  <p class="text-green-600">Time</p>
                  <p class="font-medium text-green-800">
                    {{ formData.appointmentTime || 'Not scheduled' }}
                  </p>
                </div>
              </div>
              <div class="flex items-center">
                <font-awesome-icon
                  :icon="['fas', 'location-dot']"
                  class="text-green-600 w-5 h-5 mr-3"
                />
                <div>
                  <p class="text-green-600">Location</p>
                  <p class="font-medium text-green-800">Nearest LTO Office</p>
                </div>
              </div>
              <div class="flex items-center">
                <font-awesome-icon :icon="['fas', 'qrcode']" class="text-green-600 w-5 h-5 mr-3" />
                <div>
                  <p class="text-green-600">Verification Code</p>
                  <p class="font-medium text-green-800">
                    {{ formData.inspectionCode || 'Not generated' }}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <!-- Application status section - only show when status is pending -->
          <div
            v-if="formData.status === 'pending'"
            class="bg-blue-50 p-6 rounded-lg mb-6 border border-blue-200"
          >
            <h3 class="text-lg font-semibold text-blue-800 mb-4 flex items-center">
              <font-awesome-icon :icon="['fas', 'info-circle']" class="text-blue-600 mr-2" />
              Application Status
            </h3>
            <p class="text-blue-700 mb-3">
              Your application has been submitted and is now awaiting review by an LTO officer. This
              page will automatically update when your application is approved.
            </p>
            <div class="bg-white p-3 rounded border border-blue-200">
              <div class="flex items-center">
                <font-awesome-icon
                  :icon="['fas', 'check-circle']"
                  class="text-green-500 w-5 h-5 mr-3"
                />
                <span class="text-sm text-gray-700">Application submitted</span>
              </div>
              <div class="ml-5 border-l border-dashed border-gray-300 pl-3 my-2">
                <div class="flex items-center">
                  <font-awesome-icon
                    :icon="['fas', 'clock']"
                    class="text-yellow-500 w-5 h-5 mr-3"
                  />
                  <span class="text-sm text-gray-700">Awaiting LTO officer review</span>
                </div>
              </div>
              <div class="flex items-center opacity-40">
                <font-awesome-icon :icon="['fas', 'calendar']" class="text-gray-500 w-5 h-5 mr-3" />
                <span class="text-sm text-gray-700"
                  >Inspection appointment will be scheduled upon approval</span
                >
              </div>
            </div>
          </div>

          <!-- Approval notice - show when inspection is approved -->
          <div
            v-if="formData.inspectionStatus === 'approved'"
            class="bg-green-50 p-6 rounded-lg mb-6 border border-green-300"
          >
            <h3 class="text-lg font-semibold text-green-800 mb-4 flex items-center">
              <font-awesome-icon :icon="['fas', 'check-circle']" class="text-green-600 mr-2" />
              Inspection Approved
            </h3>
            <p class="text-green-700 mb-3">
              Your inspection has been approved. You will be redirected to the payment page.
            </p>
            <div class="flex justify-center mt-4">
              <button
                @click="currentStep = 4"
                class="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center"
              >
                <font-awesome-icon :icon="['fas', 'arrow-right']" class="mr-2" />
                Proceed to Payment
              </button>
            </div>
          </div>

          <!-- Important information section -->
          <div class="bg-yellow-50 p-6 rounded-lg">
            <h3 class="text-lg font-medium text-gray-800 mb-4 flex items-center">
              <font-awesome-icon :icon="['fas', 'info-circle']" class="text-yellow-500 mr-2" />
              Important Information
            </h3>
            <ul class="list-disc pl-5 text-gray-700 space-y-2">
              <li>Bring your original documents for verification</li>
              <li>Arrive at least 15 minutes before your scheduled appointment</li>
              <li>Make sure your vehicle is in good working condition</li>
              <li>The inspection process typically takes 30-45 minutes</li>
              <li>You'll receive a verification slip after successful inspection</li>
            </ul>
          </div>
        </div>

        <!-- Step 4: Payment & Processing -->
        <div v-if="currentStep === 4" class="fade-in">
          <h2 class="text-xl font-bold text-gray-800 mb-6 flex items-center">
            <div
              class="w-8 h-8 rounded-full bg-dark-blue text-white flex items-center justify-center mr-3"
            >
              4
            </div>
            Payment Instructions
          </h2>

          <div class="bg-blue-50 p-6 rounded-lg mb-6">
            <h3 class="text-lg font-semibold text-gray-800 mb-4">Payment Instructions</h3>
            <div class="space-y-4">
              <div class="bg-white p-6 rounded-lg border border-gray-200">
                <div class="flex items-center mb-4">
                  <font-awesome-icon
                    :icon="['fas', 'info-circle']"
                    class="text-dark-blue mr-3 text-xl"
                  />
                  <p class="text-gray-800 font-medium">Important Notice</p>
                </div>
                <p class="text-gray-600 mb-4">
                  Please proceed to the LTO Officer Cashier for payment processing. You will need to
                  present this unique verification code to complete your transaction.
                </p>
                <div class="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <div class="flex items-center justify-between">
                    <div>
                      <p class="text-sm text-gray-500">Your Verification Code</p>
                      <p class="font-bold text-xl text-dark-blue">
                        {{ formData.paymentCode || 'Not generated' }}
                      </p>
                    </div>
                    <font-awesome-icon :icon="['fas', 'qrcode']" class="text-dark-blue text-3xl" />
                  </div>
                </div>
              </div>

              <div class="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                <h4 class="font-medium text-gray-800 mb-2 flex items-center">
                  <font-awesome-icon
                    :icon="['fas', 'exclamation-triangle']"
                    class="text-yellow-500 mr-2"
                  />
                  Reminder
                </h4>
                <ul class="list-disc pl-5 text-gray-600 space-y-1">
                  <li>Payment must be made in person at the LTO office</li>
                  <li>Keep your verification code safe and confidential</li>
                  <li>Bring a valid government-issued ID for verification</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <!-- Navigation buttons -->
        <div class="flex justify-between mt-8">
          <!-- Previous button - hide when in step 3 or 4 -->
          <div v-if="currentStep !== 3 && currentStep !== 4">
            <button
              @click="prevStep"
              class="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center"
              :disabled="currentStep === 1"
              :class="{ 'opacity-50 cursor-not-allowed': currentStep === 1 }"
            >
              <font-awesome-icon :icon="['fas', 'arrow-left']" class="mr-2" />
              Previous
            </button>
          </div>

          <!-- Next/Submit button - hide when in step 3 or 4 -->
          <div v-if="currentStep !== 3 && currentStep !== 4">
            <button
              v-if="currentStep < totalSteps"
              @click="nextStep"
              class="px-6 py-2 bg-dark-blue text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
            >
              Next
              <font-awesome-icon :icon="['fas', 'arrow-right']" class="ml-2" />
            </button>

            <button
              v-else
              @click="validateFinalStep"
              class="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center"
            >
              <font-awesome-icon :icon="['fas', 'check']" class="mr-2" />
              Submit Registration
            </button>
          </div>

          <!-- When in step 3, show info text instead of buttons -->
          <div v-if="currentStep === 3" class="w-full">
            <div class="bg-yellow-50 p-4 rounded-lg border border-yellow-200 text-center">
              <font-awesome-icon
                :icon="['fas', 'exclamation-circle']"
                class="text-yellow-500 mr-2"
              />
              <span class="text-gray-700">
                {{
                  formData.status === 'pending'
                    ? 'Please wait for LTO officer to process your inspection request. Once approved, you will automatically proceed to payment.'
                    : 'Your inspection has been approved. You will be redirected to the payment page.'
                }}
              </span>
            </div>
          </div>

          <!-- When in step 4, show payment completion info text -->
          <div v-if="currentStep === 4" class="w-full">
            <div class="bg-yellow-50 p-4 rounded-lg border border-yellow-200 text-center">
              <font-awesome-icon
                :icon="['fas', 'exclamation-circle']"
                class="text-yellow-500 mr-2"
              />
              <span class="text-gray-700">
                Payment processing can only be completed by an LTO Officer. Please visit your
                nearest LTO office with your payment code to complete this transaction.
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Error styling */
.error-message {
  color: #ef4444;
  font-size: 0.875rem;
  margin-top: 0.25rem;
}

.input-error {
  border-color: #ef4444 !important;
}

.required-field::after {
  content: ' *';
  color: #ef4444;
}
</style>
