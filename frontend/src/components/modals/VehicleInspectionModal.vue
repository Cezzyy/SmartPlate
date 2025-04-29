<script setup lang="ts">
import type { VehicleRegistrationForm, AdditionalVehicleData } from '@/types/vehicleRegistration'
import { ref, defineProps, defineEmits, computed, watch } from 'vue'
import { useInspectionStore } from '@/stores/inspection'

const inspectionStore = useInspectionStore()
const props = defineProps<{
  isOpen: boolean
  registration: VehicleRegistrationForm | null
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (
    e: 'submit',
    data: {
      id: string
      inspectionStatus: 'approved' | 'rejected'
      inspectionNotes: string
      additionalVehicleData: AdditionalVehicleData
    },
  ): void
}>()

// Inspection data
const inspectionNotes = ref('')
const inspectionStatus = ref<'approved' | 'rejected'>('approved')

// Additional vehicle data for inspection
const additionalData = ref<AdditionalVehicleData>({
  mvFileNumber: '',
  conductionSticker: '',
  vehicleSeries: '',
  bodyType: '',
  pistonDisplacement: 0,
  numberOfCylinders: 0,
  fuelType: '',
  gvw: 0,
  netWeight: 0,
  shippingWeight: 0,
  usageClassification: '',
  firstRegistrationDate: '',
  ltoOfficeCode: '',
  classification: '',
  denomination: '',
  orNumber: '',
  orDate: '',
})

// Validation errors
const validationErrors = ref<Record<string, string>>({})

// Region selection for MV File Number generation
const selectedRegion = ref('NCR')

// Track last used regions to control regeneration
const lastMVFileRegion = ref('')
const hasGeneratedConductionSticker = ref(false)

// List of regions for region selection
const regions = computed(() => inspectionStore.getRegions)

// MV File Number generation
const generateMVFileNumber = () => {
  if (!props.registration) return ''

  // Only allow regeneration if region has changed
  if (lastMVFileRegion.value === selectedRegion.value && additionalData.value.mvFileNumber) {
    return additionalData.value.mvFileNumber
  }

  const mvFileNumber = inspectionStore.generateMVFileNumber(selectedRegion.value)

  // Record the region that was used
  lastMVFileRegion.value = selectedRegion.value

  return mvFileNumber
}

// Generate Conduction Sticker
const generateConductionSticker = () => {
  // Only allow generation once
  if (hasGeneratedConductionSticker.value && additionalData.value.conductionSticker) {
    return additionalData.value.conductionSticker
  }

  const conductionSticker = inspectionStore.generateConductionSticker()

  // Mark as generated
  hasGeneratedConductionSticker.value = true

  return conductionSticker
}

// Define resetForm before using it in watch
const resetForm = () => {
  additionalData.value = {
    mvFileNumber: '',
    conductionSticker: '',
    vehicleSeries: '',
    bodyType: '',
    pistonDisplacement: 0,
    numberOfCylinders: 0,
    fuelType: '',
    gvw: 0,
    netWeight: 0,
    shippingWeight: 0,
    usageClassification: '',
    firstRegistrationDate: '',
    ltoOfficeCode: '',
    classification: '',
    denomination: '',
    orNumber: '',
    orDate: '',
  }
  inspectionNotes.value = ''
  inspectionStatus.value = 'approved'
  validationErrors.value = {}
  lastMVFileRegion.value = ''
  hasGeneratedConductionSticker.value = false
}

// Function to auto-generate and fill the MV File Number and Conduction Sticker
const generateIdentifiers = () => {
  const identifiers = inspectionStore.generateIdentifiers(selectedRegion.value)
  additionalData.value.mvFileNumber = identifiers.mvFileNumber
  additionalData.value.conductionSticker = identifiers.conductionSticker
  lastMVFileRegion.value = selectedRegion.value
  hasGeneratedConductionSticker.value = true
}

// Watch for region changes to enable regeneration of MV File Number
watch(
  () => selectedRegion.value,
  (newRegion, oldRegion) => {
    if (newRegion !== oldRegion) {
      // Allow regeneration when region changes
      lastMVFileRegion.value = ''
    }
  },
)

// Reset data when registration changes
watch(
  () => props.registration,
  () => {
    // Initialize with existing data if available
    if (props.registration?.additionalVehicleData) {
      additionalData.value = { ...props.registration.additionalVehicleData }
      inspectionNotes.value = props.registration.inspectionNotes || ''
    } else {
      // Reset to defaults otherwise
      resetForm()

      // Auto-generate MV File Number and Conduction Sticker
      if (props.registration) {
        generateIdentifiers()
      }
    }
  },
  { immediate: true },
)

// Determine required fields based on vehicle type
const requiredFields = computed(() => {
  const baseFields = ['mvFileNumber', 'bodyType', 'fuelType', 'usageClassification']

  // Add fields specific to vehicle type
  if (props.registration?.vehicleType === '4-Wheel') {
    return [...baseFields, 'pistonDisplacement', 'numberOfCylinders', 'gvw', 'netWeight']
  } else if (props.registration?.vehicleType === '2-Wheel') {
    return [...baseFields, 'pistonDisplacement']
  }

  return baseFields
})

// Validate the form
const validateForm = (): boolean => {
  validationErrors.value = {}
  let isValid = true

  // Validate required fields
  requiredFields.value.forEach((field) => {
    const value = additionalData.value[field as keyof AdditionalVehicleData]
    if (!value || (typeof value === 'string' && value.trim() === '')) {
      validationErrors.value[field] = 'This field is required'
      isValid = false
    }
  })

  // Additional validations
  if (additionalData.value.pistonDisplacement < 0) {
    validationErrors.value.pistonDisplacement = 'Must be a positive number'
    isValid = false
  }

  if (additionalData.value.numberOfCylinders < 0) {
    validationErrors.value.numberOfCylinders = 'Must be a positive number'
    isValid = false
  }

  if (additionalData.value.gvw < 0) {
    validationErrors.value.gvw = 'Must be a positive number'
    isValid = false
  }

  if (additionalData.value.netWeight < 0) {
    validationErrors.value.netWeight = 'Must be a positive number'
    isValid = false
  }

  // Require notes if inspection is rejected
  if (inspectionStatus.value === 'rejected' && !inspectionNotes.value.trim()) {
    validationErrors.value.inspectionNotes = 'Notes are required when rejecting an inspection'
    isValid = false
  }

  return isValid
}

// Submit form
const submitForm = () => {
  if (!props.registration) return

  // Perform validation
  validateForm()

  // Only proceed if there are no validation errors
  if (Object.keys(validationErrors.value).length === 0) {
    const result = {
      id: props.registration.id,
      inspectionStatus: inspectionStatus.value,
      inspectionNotes: inspectionNotes.value,
      additionalVehicleData: { ...additionalData.value },
    }

    // Submit the inspection using the store
    inspectionStore.submitInspection(
      props.registration.id,
      inspectionStatus.value,
      inspectionNotes.value,
      { ...additionalData.value },
    )

    emit('submit', result)
    emit('close')
  }
}

// Cancel inspection
const cancelInspection = () => {
  emit('close')
}

// MV File Number section - Fix UI structure and linter errors
const canGenerateMVFileNumber = computed(() => {
  return !(
    lastMVFileRegion.value === selectedRegion.value && additionalData.value.mvFileNumber !== ''
  )
})

// Conduction Sticker section - Fix linter errors
const canGenerateConductionSticker = computed(() => {
  return !(hasGeneratedConductionSticker.value && additionalData.value.conductionSticker !== '')
})
</script>

<template>
  <div
    v-if="isOpen"
    class="fixed inset-0 bg-gray-800 bg-opacity-75 overflow-y-auto h-full w-full flex items-center justify-center z-50"
  >
    <div
      class="relative mx-auto p-0 w-full max-w-4xl shadow-xl rounded-xl bg-white max-h-[90vh] overflow-y-auto"
    >
      <!-- Header -->
      <div class="bg-dark-blue text-white px-6 py-4 rounded-t-xl flex justify-between items-center">
        <h3 class="text-xl font-bold">Vehicle Inspection Process - {{ registration?.id }}</h3>
        <button @click="cancelInspection" class="text-white hover:text-gray-200 transition-colors">
          <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M6 18L18 6M6 6l12 12"
            ></path>
          </svg>
        </button>
      </div>

      <div class="p-6">
        <div v-if="registration" class="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
          <!-- Verification Code Banner -->
          <div
            class="col-span-2 bg-light-blue bg-opacity-10 p-4 rounded-lg mb-4 border border-light-blue"
          >
            <div class="flex items-center justify-between">
              <div>
                <h4 class="text-md font-bold text-dark-blue mb-1">Inspection Verification Code</h4>
                <p
                  v-if="registration.inspectionCode"
                  class="text-lg text-light-blue font-mono font-bold tracking-wide"
                >
                  {{ registration.inspectionCode }}
                </p>
                <p v-else class="text-sm text-red-600 font-medium">
                  No inspection code available. Please contact system administrator.
                </p>
              </div>
              <div class="bg-dark-blue text-white px-4 py-2 rounded-lg text-xs font-bold">
                VERIFY BEFORE INSPECTION
              </div>
            </div>
          </div>

          <!-- Current Vehicle Information Section -->
          <div class="col-span-2 bg-gray-50 p-5 rounded-xl mb-5 shadow-sm">
            <h4 class="text-lg font-bold text-dark-blue mb-3">Current Vehicle Information</h4>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div>
                <p class="text-sm font-medium text-gray-500">Make</p>
                <p class="text-base font-medium text-dark-blue">{{ registration.make }}</p>
              </div>
              <div>
                <p class="text-sm font-medium text-gray-500">Model</p>
                <p class="text-base font-medium text-dark-blue">{{ registration.model }}</p>
              </div>
              <div>
                <p class="text-sm font-medium text-gray-500">Year</p>
                <p class="text-base font-medium text-dark-blue">{{ registration.year }}</p>
              </div>
              <div>
                <p class="text-sm font-medium text-gray-500">Engine Number</p>
                <p class="text-base font-medium text-dark-blue">{{ registration.engineNumber }}</p>
              </div>
              <div>
                <p class="text-sm font-medium text-gray-500">Chassis Number</p>
                <p class="text-base font-medium text-dark-blue">{{ registration.chassisNumber }}</p>
              </div>
              <div>
                <p class="text-sm font-medium text-gray-500">Color</p>
                <p class="text-base font-medium text-dark-blue">{{ registration.color }}</p>
              </div>
              <div>
                <p class="text-sm font-medium text-gray-500">Vehicle Type</p>
                <p class="text-base font-medium text-dark-blue">{{ registration.vehicleType }}</p>
              </div>
              <div>
                <p class="text-sm font-medium text-gray-500">Registration Type</p>
                <p class="text-base font-medium text-dark-blue">
                  {{ registration.registrationType }}
                </p>
              </div>
            </div>
          </div>

          <!-- Additional Vehicle Information Section -->
          <div class="col-span-2">
            <h4 class="text-lg font-bold text-dark-blue mb-4">Complete Vehicle Information</h4>
            
            <!-- MV File Number and Region section -->
            <div class="mb-5 border-b pb-5">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    MV File Number
                    <span v-if="requiredFields.includes('mvFileNumber')" class="text-red-600">*</span>
                  </label>
                  
                  <!-- Region selector -->
                  <div class="mb-2">
                    <label class="block text-xs font-medium text-gray-500 mb-1">
                      Region for MV File Number
                    </label>
                    <select
                      v-model="selectedRegion"
                      class="w-full px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-light-blue focus:border-light-blue text-base"
                    >
                      <option v-for="region in regions" :key="region.code" :value="region.code">
                        {{ region.name }}
                      </option>
                    </select>
                  </div>
                  
                  <!-- MV File Number with generate button -->
                  <div class="flex items-center gap-2">
                    <input
                      v-model="additionalData.mvFileNumber"
                      type="text"
                      class="flex-grow px-4 py-2.5 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-light-blue focus:border-light-blue text-base transition-colors"
                      :class="{
                        'border-red-500 bg-red-50': validationErrors.mvFileNumber,
                        'border-gray-300': !validationErrors.mvFileNumber,
                      }"
                    />
                    <button
                      @click="additionalData.mvFileNumber = generateMVFileNumber()"
                      class="whitespace-nowrap px-4 py-2.5 border border-gray-300 text-sm font-medium rounded-lg shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-light-blue transition-colors"
                      :disabled="!canGenerateMVFileNumber"
                      :class="{
                        'opacity-50 cursor-not-allowed': !canGenerateMVFileNumber,
                      }"
                      :title="
                        !canGenerateMVFileNumber
                          ? 'Change region to regenerate'
                          : 'Generate MV File Number'
                      "
                    >
                      Generate
                    </button>
                  </div>
                  
                  <p
                    v-if="validationErrors.mvFileNumber"
                    class="mt-1 text-sm text-red-600 font-medium"
                  >
                    {{ validationErrors.mvFileNumber }}
                  </p>
                  <p class="mt-1 text-xs text-gray-500">Format: RR YY XXXXXX</p>
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    Conduction Sticker
                  </label>
                  <div class="flex items-center gap-2">
                    <input
                      v-model="additionalData.conductionSticker"
                      type="text"
                      class="flex-grow px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-light-blue focus:border-light-blue text-base transition-colors"
                    />
                    <button
                      @click="additionalData.conductionSticker = generateConductionSticker()"
                      class="whitespace-nowrap px-4 py-2.5 border border-gray-300 text-sm font-medium rounded-lg shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-light-blue transition-colors"
                      :disabled="!canGenerateConductionSticker"
                      :class="{
                        'opacity-50 cursor-not-allowed': !canGenerateConductionSticker,
                      }"
                      :title="
                        !canGenerateConductionSticker
                          ? 'Can only generate once'
                          : 'Generate Conduction Sticker'
                      "
                    >
                      Generate
                    </button>
                  </div>
                  <p class="mt-1 text-xs text-gray-500">Format: CS YY NNNN</p>
                </div>
              </div>
            </div>
            
            <!-- Vehicle details fields -->
            <h5 class="text-md font-semibold text-gray-700 mb-4">Vehicle Details</h5>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div class="mb-4">
                <label class="block text-sm font-medium text-gray-700 mb-2"> Vehicle Series </label>
                <input
                  v-model="additionalData.vehicleSeries"
                  type="text"
                  class="w-full px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-light-blue focus:border-light-blue text-base transition-colors"
                />
              </div>

              <div class="mb-4">
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Body Type
                  <span v-if="requiredFields.includes('bodyType')" class="text-red-600">*</span>
                </label>
                <input
                  v-model="additionalData.bodyType"
                  type="text"
                  class="w-full px-4 py-2.5 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-light-blue focus:border-light-blue text-base transition-colors"
                  :class="{
                    'border-red-500 bg-red-50': validationErrors.bodyType,
                    'border-gray-300': !validationErrors.bodyType,
                  }"
                />
                <p v-if="validationErrors.bodyType" class="mt-1 text-sm text-red-600 font-medium">
                  {{ validationErrors.bodyType }}
                </p>
              </div>

              <div class="mb-4">
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Fuel Type
                  <span v-if="requiredFields.includes('fuelType')" class="text-red-600">*</span>
                </label>
                <select
                  v-model="additionalData.fuelType"
                  class="w-full px-4 py-2.5 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-light-blue focus:border-light-blue text-base transition-colors"
                  :class="{
                    'border-red-500 bg-red-50': validationErrors.fuelType,
                    'border-gray-300': !validationErrors.fuelType,
                  }"
                >
                  <option value="">Select Fuel Type</option>
                  <option value="Gasoline">Gasoline</option>
                  <option value="Diesel">Diesel</option>
                  <option value="Electric">Electric</option>
                  <option value="Hybrid">Hybrid</option>
                </select>
                <p v-if="validationErrors.fuelType" class="mt-1 text-sm text-red-600 font-medium">
                  {{ validationErrors.fuelType }}
                </p>
              </div>
            </div>
            
            <!-- Technical specifications -->
            <h5 class="text-md font-semibold text-gray-700 my-4">Technical Specifications</h5>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div class="mb-4">
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Piston Displacement (cc)
                  <span v-if="requiredFields.includes('pistonDisplacement')" class="text-red-600"
                    >*</span
                  >
                </label>
                <input
                  v-model.number="additionalData.pistonDisplacement"
                  type="number"
                  class="w-full px-4 py-2.5 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-light-blue focus:border-light-blue text-base transition-colors"
                  :class="{
                    'border-red-500 bg-red-50': validationErrors.pistonDisplacement,
                    'border-gray-300': !validationErrors.pistonDisplacement,
                  }"
                />
                <p
                  v-if="validationErrors.pistonDisplacement"
                  class="mt-1 text-sm text-red-600 font-medium"
                >
                  {{ validationErrors.pistonDisplacement }}
                </p>
              </div>

              <div class="mb-4">
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Number of Cylinders
                  <span v-if="requiredFields.includes('numberOfCylinders')" class="text-red-600"
                    >*</span
                  >
                </label>
                <input
                  v-model.number="additionalData.numberOfCylinders"
                  type="number"
                  class="w-full px-4 py-2.5 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-light-blue focus:border-light-blue text-base transition-colors"
                  :class="{
                    'border-red-500 bg-red-50': validationErrors.numberOfCylinders,
                    'border-gray-300': !validationErrors.numberOfCylinders,
                  }"
                />
                <p
                  v-if="validationErrors.numberOfCylinders"
                  class="mt-1 text-sm text-red-600 font-medium"
                >
                  {{ validationErrors.numberOfCylinders }}
                </p>
              </div>
            </div>
            
            <!-- Weight specifications -->
            <h5 class="text-md font-semibold text-gray-700 my-4">Weight Information</h5>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div class="mb-4">
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Gross Vehicle Weight (kg)
                  <span v-if="requiredFields.includes('gvw')" class="text-red-600">*</span>
                </label>
                <input
                  v-model.number="additionalData.gvw"
                  type="number"
                  class="w-full px-4 py-2.5 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-light-blue focus:border-light-blue text-base transition-colors"
                  :class="{
                    'border-red-500 bg-red-50': validationErrors.gvw,
                    'border-gray-300': !validationErrors.gvw,
                  }"
                />
                <p v-if="validationErrors.gvw" class="mt-1 text-sm text-red-600 font-medium">
                  {{ validationErrors.gvw }}
                </p>
              </div>

              <div class="mb-4">
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Net Weight (kg)
                  <span v-if="requiredFields.includes('netWeight')" class="text-red-600">*</span>
                </label>
                <input
                  v-model.number="additionalData.netWeight"
                  type="number"
                  class="w-full px-4 py-2.5 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-light-blue focus:border-light-blue text-base transition-colors"
                  :class="{
                    'border-red-500 bg-red-50': validationErrors.netWeight,
                    'border-gray-300': !validationErrors.netWeight,
                  }"
                />
                <p v-if="validationErrors.netWeight" class="mt-1 text-sm text-red-600 font-medium">
                  {{ validationErrors.netWeight }}
                </p>
              </div>

              <div class="mb-4">
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Shipping Weight (kg)
                </label>
                <input
                  v-model.number="additionalData.shippingWeight"
                  type="number"
                  class="w-full px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-light-blue focus:border-light-blue text-base transition-colors"
                />
              </div>
            </div>
            
            <!-- Classification and registration information -->
            <h5 class="text-md font-semibold text-gray-700 my-4">Classification & Registration</h5>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div class="mb-4">
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Usage Classification
                  <span v-if="requiredFields.includes('usageClassification')" class="text-red-600"
                    >*</span
                  >
                </label>
                <select
                  v-model="additionalData.usageClassification"
                  class="w-full px-4 py-2.5 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-light-blue focus:border-light-blue text-base transition-colors"
                  :class="{
                    'border-red-500 bg-red-50': validationErrors.usageClassification,
                    'border-gray-300': !validationErrors.usageClassification,
                  }"
                >
                  <option value="">Select Classification</option>
                  <option value="Private">Private</option>
                  <option value="For Hire">For Hire</option>
                  <option value="Government">Government</option>
                  <option value="Diplomatic">Diplomatic</option>
                </select>
                <p
                  v-if="validationErrors.usageClassification"
                  class="mt-1 text-sm text-red-600 font-medium"
                >
                  {{ validationErrors.usageClassification }}
                </p>
              </div>

              <div class="mb-4">
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  First Registration Date
                </label>
                <input
                  v-model="additionalData.firstRegistrationDate"
                  type="date"
                  class="w-full px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-light-blue focus:border-light-blue text-base transition-colors"
                />
              </div>
            </div>
          </div>

          <!-- Inspection Findings -->
          <div class="col-span-2 mt-5 bg-gray-50 p-5 rounded-xl">
            <h4 class="text-lg font-bold text-dark-blue mb-3">
              Inspection Findings & Notes
              <span v-if="inspectionStatus === 'rejected'" class="text-red-600">*</span>
            </h4>
            <textarea
              v-model="inspectionNotes"
              rows="4"
              class="w-full px-4 py-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-light-blue focus:border-light-blue text-base transition-colors"
              :class="{
                'border-red-500 bg-red-50': validationErrors.inspectionNotes,
                'border-gray-300': !validationErrors.inspectionNotes,
              }"
              placeholder="Enter inspection notes, findings, and recommendations..."
            ></textarea>
            <p
              v-if="validationErrors.inspectionNotes"
              class="mt-1 text-sm text-red-600 font-medium"
            >
              {{ validationErrors.inspectionNotes }}
            </p>

            <!-- Inspection Status -->
            <div class="mt-5">
              <h4 class="text-md font-bold text-dark-blue mb-3">Inspection Result</h4>
              <div class="flex space-x-6">
                <label class="inline-flex items-center">
                  <input
                    v-model="inspectionStatus"
                    type="radio"
                    class="form-radio h-5 w-5 text-dark-blue"
                    name="inspectionStatus"
                    value="approved"
                  />
                  <span class="ml-2 text-base text-gray-700">Approved</span>
                </label>
                <label class="inline-flex items-center">
                  <input
                    v-model="inspectionStatus"
                    type="radio"
                    class="form-radio h-5 w-5 text-red-600"
                    name="inspectionStatus"
                    value="rejected"
                  />
                  <span class="ml-2 text-base text-gray-700">Rejected</span>
                </label>
              </div>
            </div>
          </div>
        </div>

        <div class="flex justify-end space-x-4 mt-6 pt-4 border-t">
          <button
            @click="cancelInspection"
            class="px-5 py-2.5 bg-gray-100 border border-gray-300 rounded-lg shadow-sm text-base font-medium text-gray-700 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400 transition-colors"
          >
            Cancel
          </button>
          <button
            @click="submitForm"
            class="px-5 py-2.5 bg-dark-blue border border-transparent rounded-lg shadow-sm text-base font-medium text-white hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-light-blue transition-colors"
          >
            Submit Inspection
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
