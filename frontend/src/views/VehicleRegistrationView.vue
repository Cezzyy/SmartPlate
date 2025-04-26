<script setup>
import { ref } from 'vue'
import FormNavigationGuard from '../components/navigation/FormNavigationGuard.vue'
import { useRouter } from 'vue-router'
import { useVehicleRegistrationFormStore } from '../stores/vehicleRegistrationForm'
import { storeToRefs } from 'pinia'
import ConfirmNavigationModal from '../components/modals/ConfirmNavigationModal.vue'

const router = useRouter()
const store = useVehicleRegistrationFormStore()
const showNavigationModal = ref(false)
const totalSteps = 4

// Use store's state and computed properties
const { formData, errors, currentStep } = storeToRefs(store)

// Use store's actions
const {
  validateVehicleInfo,
  validateDocuments,
  validateAppointment,
  validatePayment,
  submitRegistration,
} = store

const nextStep = () => {
  let isValid = false

  if (currentStep.value === 1) {
    isValid = validateVehicleInfo()
  } else if (currentStep.value === 2) {
    isValid = validateDocuments()
  } else if (currentStep.value === 3) {
    isValid = validateAppointment()
  } else if (currentStep.value === 4) {
    isValid = validatePayment()
  }

  if (isValid && currentStep.value < totalSteps) {
    currentStep.value++
  }
}

const prevStep = () => {
  if (currentStep.value > 1) {
    currentStep.value--
  }
}

// Back to dashboard
const backToDashboard = () => {
  showNavigationModal.value = true
}

const handleNavigationConfirm = () => {
  showNavigationModal.value = false
  router.push('/home')
}

const handleNavigationCancel = () => {
  showNavigationModal.value = false
}

// Generate appointment details
const generateAppointment = () => {
  // Generate tomorrow's date
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  formData.appointmentDate = tomorrow.toISOString().split('T')[0]

  // Generate random time between 9am and 4pm
  const hour = Math.floor(Math.random() * 8) + 9
  formData.appointmentTime = `${hour}:00 ${hour >= 12 ? 'PM' : 'AM'}`

  // Generate reference code
  formData.referenceCode = 'LTO-' + Math.random().toString(36).substring(2, 10).toUpperCase()
}

// Handle file uploads with validation
const handleFileUpload = (event, documentType) => {
  const file = event.target.files[0]
  if (file) {
    // Check file type
    const validTypes = ['application/pdf', 'image/jpeg', 'image/png']
    if (!validTypes.includes(file.type)) {
      errors.documents[documentType] = 'Only PDF, JPEG, and PNG files are allowed'
      return
    }

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      errors.documents[documentType] = 'File size must be less than 5MB'
      return
    }

    // Clear error and set file
    errors.documents[documentType] = ''
    formData.documents[documentType] = file
  }
}

// Submit the registration
const validateFinalStep = async () => {
  if (validatePayment()) {
    const success = await submitRegistration()
    if (success) {
      router.push('/home')
    }
  }
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
                <div class="flex items-center">
                  <input
                    type="file"
                    @change="(e) => handleFileUpload(e, 'csr')"
                    class="hidden"
                    id="csr-upload"
                    accept=".pdf,.jpg,.jpeg,.png"
                  />
                  <label
                    for="csr-upload"
                    class="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg cursor-pointer hover:bg-gray-200 transition-colors flex items-center"
                    :class="{ 'border-red-500 border': errors.documents.csr }"
                  >
                    <font-awesome-icon :icon="['fas', 'upload']" class="mr-2" />
                    {{ formData.documents.csr ? formData.documents.csr.name : 'Choose file' }}
                  </label>
                </div>
                <p v-if="errors.documents.csr" class="error-message">{{ errors.documents.csr }}</p>
                <p v-else class="mt-1 text-xs text-gray-500">PDF, JPEG, or PNG (max. 5MB)</p>
              </div>

              <div class="mb-4">
                <label class="block text-gray-700 font-medium mb-2 required-field"
                  >Sales Invoice</label
                >
                <div class="flex items-center">
                  <input
                    type="file"
                    @change="(e) => handleFileUpload(e, 'salesInvoice')"
                    class="hidden"
                    id="sales-invoice-upload"
                    accept=".pdf,.jpg,.jpeg,.png"
                  />
                  <label
                    for="sales-invoice-upload"
                    class="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg cursor-pointer hover:bg-gray-200 transition-colors flex items-center"
                    :class="{ 'border-red-500 border': errors.documents.salesInvoice }"
                  >
                    <font-awesome-icon :icon="['fas', 'upload']" class="mr-2" />
                    {{
                      formData.documents.salesInvoice
                        ? formData.documents.salesInvoice.name
                        : 'Choose file'
                    }}
                  </label>
                </div>
                <p v-if="errors.documents.salesInvoice" class="error-message">
                  {{ errors.documents.salesInvoice }}
                </p>
                <p v-else class="mt-1 text-xs text-gray-500">PDF, JPEG, or PNG (max. 5MB)</p>
              </div>

              <div class="mb-4">
                <label class="block text-gray-700 font-medium mb-2 required-field"
                  >Insurance Certificate</label
                >
                <div class="flex items-center">
                  <input
                    type="file"
                    @change="(e) => handleFileUpload(e, 'insurance')"
                    class="hidden"
                    id="insurance-upload"
                    accept=".pdf,.jpg,.jpeg,.png"
                  />
                  <label
                    for="insurance-upload"
                    class="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg cursor-pointer hover:bg-gray-200 transition-colors flex items-center"
                    :class="{ 'border-red-500 border': errors.documents.insurance }"
                  >
                    <font-awesome-icon :icon="['fas', 'upload']" class="mr-2" />
                    {{
                      formData.documents.insurance
                        ? formData.documents.insurance.name
                        : 'Choose file'
                    }}
                  </label>
                </div>
                <p v-if="errors.documents.insurance" class="error-message">
                  {{ errors.documents.insurance }}
                </p>
                <p v-else class="mt-1 text-xs text-gray-500">PDF, JPEG, or PNG (max. 5MB)</p>
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

          <div class="bg-blue-50 p-6 rounded-lg mb-6">
            <h3 class="text-lg font-medium text-gray-800 mb-4">Schedule Inspection</h3>
            <p class="text-gray-600 mb-6">
              Your vehicle needs to be physically inspected by an LTO officer. Please schedule an
              appointment for the inspection.
            </p>

            <div class="mb-6">
              <button
                @click="generateAppointment"
                class="px-6 py-3 bg-dark-blue text-white rounded-lg hover:bg-blue-700 transition-colors shadow-md flex items-center justify-center"
              >
                <font-awesome-icon :icon="['fas', 'calendar-alt']" class="mr-2" />
                Generate Appointment Schedule
              </button>
            </div>

            <div
              v-if="formData.appointmentDate && formData.appointmentTime"
              class="border border-green-200 bg-green-50 p-4 rounded-lg"
            >
              <h4 class="text-lg font-medium text-gray-800 mb-2 flex items-center">
                <font-awesome-icon :icon="['fas', 'check-circle']" class="text-green-500 mr-2" />
                Appointment Scheduled
              </h4>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p class="text-sm text-gray-500">Date</p>
                  <p class="text-gray-800 font-medium">{{ formData.appointmentDate }}</p>
                </div>
                <div>
                  <p class="text-sm text-gray-500">Time</p>
                  <p class="text-gray-800 font-medium">{{ formData.appointmentTime }}</p>
                </div>
                <div class="md:col-span-2">
                  <p class="text-sm text-gray-500">Reference Code</p>
                  <p class="text-gray-800 font-medium">{{ formData.referenceCode }}</p>
                </div>
              </div>
              <div class="mt-4 text-sm text-gray-600">
                <p>
                  Please bring your vehicle and all original documents to the LTO office at the
                  scheduled time.
                </p>
                <p class="mt-2">Address: LTO Central Office, East Avenue, Quezon City</p>
              </div>
            </div>
          </div>

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
            Payment & Processing
          </h2>

          <div class="bg-blue-50 p-6 rounded-lg mb-6">
            <h3 class="text-lg font-medium text-gray-800 mb-4">Payment Details</h3>
            <p class="text-gray-600 mb-4">
              Please complete the payment for your vehicle registration using any of the methods
              below:
            </p>

            <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div class="border border-gray-200 bg-white p-4 rounded-lg">
                <h4 class="font-medium text-gray-800 mb-2">Bank Transfer</h4>
                <p class="text-sm text-gray-600">
                  Bank: Land Bank of the Philippines<br />
                  Account Name: Land Transportation Office<br />
                  Account Number: 1234-5678-90
                </p>
              </div>

              <div class="border border-gray-200 bg-white p-4 rounded-lg">
                <h4 class="font-medium text-gray-800 mb-2">GCash</h4>
                <p class="text-sm text-gray-600">
                  Account Name: Land Transportation Office<br />
                  Mobile Number: 09123456789<br />
                  Reference: Your Reference Code
                </p>
              </div>

              <div class="border border-gray-200 bg-white p-4 rounded-lg">
                <h4 class="font-medium text-gray-800 mb-2">Payment Centers</h4>
                <p class="text-sm text-gray-600">
                  Visit any of the following:<br />
                  - Bayad Center<br />
                  - 7-Eleven<br />
                  - SM Business Centers
                </p>
              </div>
            </div>

            <div class="mb-6">
              <label class="block text-gray-700 font-medium mb-2 required-field"
                >Upload Payment Reference Slip</label
              >
              <div class="flex items-center">
                <input
                  type="file"
                  @change="(e) => (formData.referenceSlip = e.target.files[0])"
                  class="hidden"
                  id="payment-slip-upload"
                  accept=".pdf,.jpg,.jpeg,.png"
                />
                <label
                  for="payment-slip-upload"
                  class="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg cursor-pointer hover:bg-gray-200 transition-colors flex items-center"
                  :class="{ 'border-red-500 border': errors.referenceSlip }"
                >
                  <font-awesome-icon :icon="['fas', 'upload']" class="mr-2" />
                  {{ formData.referenceSlip ? formData.referenceSlip.name : 'Choose file' }}
                </label>
              </div>
              <p v-if="errors.referenceSlip" class="error-message">{{ errors.referenceSlip }}</p>
              <p v-else class="mt-1 text-xs text-gray-500">PDF, JPEG, or PNG (max. 5MB)</p>
            </div>
          </div>

          <div class="space-y-4 mb-6">
            <div class="flex items-start">
              <div class="flex items-center h-5">
                <input
                  id="privacy-consent"
                  type="checkbox"
                  v-model="formData.privacyConsent"
                  class="focus:ring-dark-blue h-4 w-4 text-dark-blue border-gray-300 rounded"
                  :class="{ 'border-red-500': errors.privacyConsent }"
                />
              </div>
              <div class="ml-3 text-sm">
                <label for="privacy-consent" class="font-medium text-gray-700 required-field"
                  >Privacy Consent</label
                >
                <p class="text-gray-500">
                  I consent to the collection and processing of my personal data in accordance with
                  the Data Privacy Act of 2012.
                </p>
                <p v-if="errors.privacyConsent" class="mt-1 text-sm error-message">
                  {{ errors.privacyConsent }}
                </p>
              </div>
            </div>

            <div class="flex items-start">
              <div class="flex items-center h-5">
                <input
                  id="declaration-consent"
                  type="checkbox"
                  v-model="formData.declarationConsent"
                  class="focus:ring-dark-blue h-4 w-4 text-dark-blue border-gray-300 rounded"
                  :class="{ 'border-red-500': errors.declarationConsent }"
                />
              </div>
              <div class="ml-3 text-sm">
                <label for="declaration-consent" class="font-medium text-gray-700 required-field"
                  >Declaration</label
                >
                <p class="text-gray-500">
                  I declare that all information provided is true and correct to the best of my
                  knowledge.
                </p>
                <p v-if="errors.declarationConsent" class="mt-1 text-sm error-message">
                  {{ errors.declarationConsent }}
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Navigation buttons -->
        <div class="flex justify-between mt-8">
          <button
            @click="prevStep"
            class="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center"
            :disabled="currentStep === 1"
            :class="{ 'opacity-50 cursor-not-allowed': currentStep === 1 }"
          >
            <font-awesome-icon :icon="['fas', 'arrow-left']" class="mr-2" />
            Previous
          </button>

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
