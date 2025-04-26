<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue'
import { useVehicleRegistrationStore } from '@/stores/vehicleRegistration'
import type { Vehicle } from '@/types/vehicle'

const vehicleStore = useVehicleRegistrationStore()

// Props
const props = defineProps({
  show: {
    type: Boolean,
    required: true,
  },
  vehicle: {
    type: Object as () => Vehicle | null,
    required: true,
  },
})

// Emits
const emit = defineEmits(['close', 'update'])

// Form state
const formData = reactive({
  // Registration Info
  mvFileNumber: '',
  registrationExpiryDate: '',
  registrationType: '',
  conductionSticker: '',
  insuranceCompany: '',
  insurancePolicyNumber: '',
  insuranceExpiryDate: '',

  // Vehicle Details
  vehicleMake: '',
  vehicleSeries: '',
  yearModel: 0,
  color: '',
  vehicleType: '',
  bodyType: '',
  fuelType: '',
  vehicleCategory: '',

  // Technical Specs
  engineNumber: '',
  chassisNumber: '',
  grossWeight: '',
  netWeight: '',

  // Plate Info
  plateType: '',
  plateNumber: '',
  plateStatus: '',
})

// Navigation
const activeTab = ref('registration')
const tabs = [
  { id: 'registration', label: 'Registration Info' },
  { id: 'vehicle', label: 'Vehicle Details' },
  { id: 'technical', label: 'Technical Specs' },
  { id: 'plate', label: 'Plate Info' },
]

// Validation
const errors = reactive({
  mvFileNumber: '',
  vehicleMake: '',
  vehicleSeries: '',
  engineNumber: '',
  chassisNumber: '',
  yearModel: '',
  plateNumber: '',
})

// Status
const isLoading = ref(false)
const isSuccess = ref(false)
const generalError = ref('')

// Options
const vehicleTypeOptions = ['Sedan', 'SUV', 'Van', 'Pickup', 'Truck', 'Bus', 'Motorcycle', 'Others']

const bodyTypeOptions = [
  'Hatchback',
  'Sedan',
  'SUV',
  'MPV',
  'Crossover',
  'Coupe',
  'Convertible',
  'Wagon',
  'Van',
  'Pickup',
  'Truck',
]

const fuelTypeOptions = ['Gasoline', 'Diesel', 'Electric', 'Hybrid', 'LPG', 'CNG']

const vehicleCategoryOptions = ['Private', 'Public', 'Government', 'Diplomatic', 'For Hire']

const plateTypeOptions = ['Regular', 'Special', 'Diplomatic', 'Government', 'Personalized']

const statusOptions = ['Active', 'Pending', 'Expired']

// Initialize form with vehicle data
const initializeForm = () => {
  if (!props.vehicle) return

  // Copy vehicle properties to form
  Object.keys(formData).forEach((key) => {
    if (key in props.vehicle) {
      // @ts-ignore - we've checked that the key exists
      formData[key] = props.vehicle[key]
    }
  })

  // Get plate details if available
  const plateDetails = vehicleStore.getPlateByVehicleId(props.vehicle.id)
  if (plateDetails) {
    formData.plateNumber = plateDetails.plate_number || ''
    formData.plateType = plateDetails.plate_type || ''
    formData.plateStatus = plateDetails.status || ''
  }
}

// Methods
const closeModal = () => {
  resetForm()
  emit('close')
}

const resetForm = () => {
  // Reset validation errors
  Object.keys(errors).forEach((key) => {
    // @ts-ignore
    errors[key] = ''
  })
  generalError.value = ''
  isSuccess.value = false
}

const clearErrors = () => {
  Object.keys(errors).forEach((key) => {
    // @ts-ignore
    errors[key] = ''
  })
  generalError.value = ''
}

const validateForm = () => {
  let isValid = true
  clearErrors()

  // Validate required fields
  if (!formData.mvFileNumber.trim()) {
    errors.mvFileNumber = 'MV File Number is required'
    isValid = false
  }

  if (!formData.vehicleMake.trim()) {
    errors.vehicleMake = 'Vehicle Make is required'
    isValid = false
  }

  if (!formData.vehicleSeries.trim()) {
    errors.vehicleSeries = 'Vehicle Series is required'
    isValid = false
  }

  if (!formData.engineNumber.trim()) {
    errors.engineNumber = 'Engine Number is required'
    isValid = false
  }

  if (!formData.chassisNumber.trim()) {
    errors.chassisNumber = 'Chassis Number is required'
    isValid = false
  }

  if (!formData.yearModel) {
    errors.yearModel = 'Year Model is required'
    isValid = false
  }

  if (formData.yearModel < 1900 || formData.yearModel > new Date().getFullYear() + 1) {
    errors.yearModel = 'Invalid Year Model'
    isValid = false
  }

  if (formData.plateNumber && formData.plateNumber.trim().length < 5) {
    errors.plateNumber = 'Plate Number must be at least 5 characters'
    isValid = false
  }

  return isValid
}

const saveChanges = async () => {
  if (!validateForm()) {
    // Scroll to the first error
    const firstErrorKey = Object.keys(errors).find((key) => errors[key as keyof typeof errors])
    if (firstErrorKey) {
      // Find which tab contains the error
      switch (firstErrorKey) {
        case 'mvFileNumber':
          activeTab.value = 'registration'
          break
        case 'vehicleMake':
        case 'vehicleSeries':
        case 'yearModel':
          activeTab.value = 'vehicle'
          break
        case 'engineNumber':
        case 'chassisNumber':
          activeTab.value = 'technical'
          break
        case 'plateNumber':
          activeTab.value = 'plate'
          break
      }
    }
    return
  }

  isLoading.value = true

  try {
    // Update vehicle
    if (props.vehicle) {
      // In a real app, we would call an API here
      const updatedVehicle: Vehicle = {
        ...props.vehicle,
        ...formData,
      }

      // Update plate details if available
      if (formData.plateNumber) {
        // For demo purposes, just log that we would update the plate
        console.log('Updating plate:', {
          vehicleId: updatedVehicle.id,
          plateNumber: formData.plateNumber,
          plateType: formData.plateType,
          status: formData.plateStatus,
        })
      }

      // For demo purposes, just display success
      setTimeout(() => {
        isLoading.value = false
        isSuccess.value = true

        // Emit update event
        emit('update', updatedVehicle)

        // Close modal after a delay
        setTimeout(() => {
          closeModal()
        }, 1000)
      }, 800)
    }
  } catch (error) {
    isLoading.value = false
    generalError.value = 'An error occurred while updating the vehicle'
    console.error('Error updating vehicle:', error)
  }
}

// Initialize form when modal opens
watch(
  () => props.show,
  (newVal) => {
    if (newVal && props.vehicle) {
      resetForm()
      initializeForm()
    }
  },
  { immediate: true },
)
</script>

<template>
  <div
    v-if="show"
    class="fixed inset-0 z-50 overflow-y-auto"
    aria-labelledby="modal-title"
    role="dialog"
    aria-modal="true"
  >
    <!-- Background overlay -->
    <div
      class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0"
    >
      <div
        class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
        aria-hidden="true"
        @click="closeModal"
      ></div>

      <!-- Modal panel -->
      <div
        class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-5xl sm:w-full"
      >
        <!-- Header -->
        <div class="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-dark-blue to-blue-900">
          <div class="flex items-center justify-between">
            <h3 class="text-lg leading-6 font-medium text-white" id="modal-title">
              Edit Vehicle - {{ vehicle?.mvFileNumber }}
            </h3>
            <button @click="closeModal" class="text-gray-200 hover:text-white focus:outline-none">
              <font-awesome-icon :icon="['fas', 'times']" class="text-xl" />
            </button>
          </div>
        </div>

        <div
          v-if="generalError"
          class="bg-red-50 border border-red-300 text-red-800 px-4 py-3 mt-4 mx-6 rounded-md"
        >
          {{ generalError }}
        </div>

        <div
          v-if="isSuccess"
          class="bg-green-50 border border-green-300 text-green-800 px-4 py-3 mt-4 mx-6 rounded-md"
        >
          Vehicle updated successfully!
        </div>

        <!-- Tabs -->
        <div class="border-b border-gray-200">
          <nav class="flex -mb-px px-6 pt-2 overflow-x-auto" aria-label="Tabs">
            <button
              v-for="tab in tabs"
              :key="tab.id"
              @click="activeTab = tab.id"
              :class="[
                activeTab === tab.id
                  ? 'border-light-blue text-light-blue font-medium'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
                'whitespace-nowrap py-3 px-5 border-b-2 text-sm',
              ]"
            >
              {{ tab.label }}
            </button>
          </nav>
        </div>

        <!-- Form -->
        <div class="max-h-[70vh] overflow-y-auto">
          <div class="px-6 py-4 bg-gray-50">
            <!-- Registration Info Tab -->
            <div v-if="activeTab === 'registration'" class="space-y-4">
              <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label class="block text-sm font-medium text-gray-700">MV File Number</label>
                  <input
                    v-model="formData.mvFileNumber"
                    type="text"
                    class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-light-blue focus:ring-light-blue text-base py-2.5"
                    :class="{ 'border-red-300': errors.mvFileNumber }"
                  />
                  <p v-if="errors.mvFileNumber" class="mt-1 text-sm text-red-600">
                    {{ errors.mvFileNumber }}
                  </p>
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700">Registration Type</label>
                  <select
                    v-model="formData.registrationType"
                    class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-light-blue focus:ring-light-blue text-base py-2.5"
                  >
                    <option value="">Select a type</option>
                    <option value="New">New</option>
                    <option value="Renewal">Renewal</option>
                    <option value="Transfer">Transfer</option>
                  </select>
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700"
                    >Registration Expiry Date</label
                  >
                  <input
                    v-model="formData.registrationExpiryDate"
                    type="date"
                    class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-light-blue focus:ring-light-blue text-base py-2.5"
                  />
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700">Conduction Sticker</label>
                  <input
                    v-model="formData.conductionSticker"
                    type="text"
                    class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-light-blue focus:ring-light-blue text-base py-2.5"
                  />
                </div>
              </div>

              <div class="border-t border-gray-200 pt-4">
                <h4 class="text-sm font-medium text-gray-700">Insurance Information</h4>
                <div class="grid grid-cols-1 gap-4 md:grid-cols-3 mt-2">
                  <div>
                    <label class="block text-sm font-medium text-gray-700">Insurance Company</label>
                    <input
                      v-model="formData.insuranceCompany"
                      type="text"
                      class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-light-blue focus:ring-light-blue text-base py-2.5"
                    />
                  </div>

                  <div>
                    <label class="block text-sm font-medium text-gray-700">Policy Number</label>
                    <input
                      v-model="formData.insurancePolicyNumber"
                      type="text"
                      class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-light-blue focus:ring-light-blue text-base py-2.5"
                    />
                  </div>

                  <div>
                    <label class="block text-sm font-medium text-gray-700">Expiry Date</label>
                    <input
                      v-model="formData.insuranceExpiryDate"
                      type="date"
                      class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-light-blue focus:ring-light-blue text-base py-2.5"
                    />
                  </div>
                </div>
              </div>
            </div>

            <!-- Vehicle Details Tab -->
            <div v-if="activeTab === 'vehicle'" class="space-y-4">
              <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label class="block text-sm font-medium text-gray-700">Make</label>
                  <input
                    v-model="formData.vehicleMake"
                    type="text"
                    class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-light-blue focus:ring-light-blue text-base py-2.5"
                    :class="{ 'border-red-300': errors.vehicleMake }"
                  />
                  <p v-if="errors.vehicleMake" class="mt-1 text-sm text-red-600">
                    {{ errors.vehicleMake }}
                  </p>
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700">Series/Model</label>
                  <input
                    v-model="formData.vehicleSeries"
                    type="text"
                    class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-light-blue focus:ring-light-blue text-base py-2.5"
                    :class="{ 'border-red-300': errors.vehicleSeries }"
                  />
                  <p v-if="errors.vehicleSeries" class="mt-1 text-sm text-red-600">
                    {{ errors.vehicleSeries }}
                  </p>
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700">Year Model</label>
                  <input
                    v-model.number="formData.yearModel"
                    type="number"
                    min="1900"
                    :max="new Date().getFullYear() + 1"
                    class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-light-blue focus:ring-light-blue text-base py-2.5"
                    :class="{ 'border-red-300': errors.yearModel }"
                  />
                  <p v-if="errors.yearModel" class="mt-1 text-sm text-red-600">
                    {{ errors.yearModel }}
                  </p>
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700">Color</label>
                  <input
                    v-model="formData.color"
                    type="text"
                    class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-light-blue focus:ring-light-blue text-base py-2.5"
                  />
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700">Vehicle Type</label>
                  <select
                    v-model="formData.vehicleType"
                    class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-light-blue focus:ring-light-blue text-base py-2.5"
                  >
                    <option value="">Select a type</option>
                    <option v-for="option in vehicleTypeOptions" :key="option" :value="option">
                      {{ option }}
                    </option>
                  </select>
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700">Body Type</label>
                  <select
                    v-model="formData.bodyType"
                    class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-light-blue focus:ring-light-blue text-base py-2.5"
                  >
                    <option value="">Select a body type</option>
                    <option v-for="option in bodyTypeOptions" :key="option" :value="option">
                      {{ option }}
                    </option>
                  </select>
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700">Fuel Type</label>
                  <select
                    v-model="formData.fuelType"
                    class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-light-blue focus:ring-light-blue text-base py-2.5"
                  >
                    <option value="">Select a fuel type</option>
                    <option v-for="option in fuelTypeOptions" :key="option" :value="option">
                      {{ option }}
                    </option>
                  </select>
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700">Vehicle Category</label>
                  <select
                    v-model="formData.vehicleCategory"
                    class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-light-blue focus:ring-light-blue text-base py-2.5"
                  >
                    <option value="">Select a category</option>
                    <option v-for="option in vehicleCategoryOptions" :key="option" :value="option">
                      {{ option }}
                    </option>
                  </select>
                </div>
              </div>
            </div>

            <!-- Technical Specs Tab -->
            <div v-if="activeTab === 'technical'" class="space-y-4">
              <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label class="block text-sm font-medium text-gray-700">Engine Number</label>
                  <input
                    v-model="formData.engineNumber"
                    type="text"
                    class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-light-blue focus:ring-light-blue text-base py-2.5"
                    :class="{ 'border-red-300': errors.engineNumber }"
                  />
                  <p v-if="errors.engineNumber" class="mt-1 text-sm text-red-600">
                    {{ errors.engineNumber }}
                  </p>
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700">Chassis Number</label>
                  <input
                    v-model="formData.chassisNumber"
                    type="text"
                    class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-light-blue focus:ring-light-blue text-base py-2.5"
                    :class="{ 'border-red-300': errors.chassisNumber }"
                  />
                  <p v-if="errors.chassisNumber" class="mt-1 text-sm text-red-600">
                    {{ errors.chassisNumber }}
                  </p>
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700">Gross Weight (kg)</label>
                  <input
                    v-model="formData.grossWeight"
                    type="text"
                    class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-light-blue focus:ring-light-blue text-base py-2.5"
                  />
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700">Net Weight (kg)</label>
                  <input
                    v-model="formData.netWeight"
                    type="text"
                    class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-light-blue focus:ring-light-blue text-base py-2.5"
                  />
                </div>
              </div>
            </div>

            <!-- Plate Info Tab -->
            <div v-if="activeTab === 'plate'" class="space-y-4">
              <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label class="block text-sm font-medium text-gray-700">Plate Type</label>
                  <select
                    v-model="formData.plateType"
                    class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-light-blue focus:ring-light-blue text-base py-2.5"
                  >
                    <option value="">Select a plate type</option>
                    <option v-for="option in plateTypeOptions" :key="option" :value="option">
                      {{ option }}
                    </option>
                  </select>
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700">Plate Number</label>
                  <input
                    v-model="formData.plateNumber"
                    type="text"
                    class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-light-blue focus:ring-light-blue text-base py-2.5"
                    :class="{ 'border-red-300': errors.plateNumber }"
                  />
                  <p v-if="errors.plateNumber" class="mt-1 text-sm text-red-600">
                    {{ errors.plateNumber }}
                  </p>
                </div>

                <div>
                  <label class="block text-sm font-medium text-gray-700">Plate Status</label>
                  <select
                    v-model="formData.plateStatus"
                    class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-light-blue focus:ring-light-blue text-base py-2.5"
                  >
                    <option value="">Select a status</option>
                    <option v-for="option in statusOptions" :key="option" :value="option">
                      {{ option }}
                    </option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div class="px-6 py-4 bg-gray-50 border-t border-gray-200 flex flex-row-reverse">
          <button
            type="button"
            @click="saveChanges"
            class="ml-3 inline-flex justify-center py-2.5 px-5 border border-transparent shadow-sm text-base font-medium rounded-md text-white bg-light-blue hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-light-blue"
            :disabled="isLoading"
          >
            <span v-if="isLoading" class="flex items-center">
              <svg
                class="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  class="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  stroke-width="4"
                ></circle>
                <path
                  class="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Saving...
            </span>
            <span v-else>Save Changes</span>
          </button>
          <button
            type="button"
            @click="closeModal"
            class="py-2.5 px-5 border border-gray-300 rounded-md shadow-sm text-base font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
