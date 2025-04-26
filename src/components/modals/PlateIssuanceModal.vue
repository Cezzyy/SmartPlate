<script setup lang="ts">
import type { VehicleRegistrationForm } from '@/types/vehicleRegistration'
import { ref, defineProps, defineEmits, watch } from 'vue'
import { useNotificationStore } from '@/stores/notification'
import { usePlateStore } from '@/stores/plate'

const notificationStore = useNotificationStore()
const plateStore = usePlateStore()

const props = defineProps<{
  isOpen: boolean
  registration: VehicleRegistrationForm | null
  suggestedPlateNumber: string
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (
    e: 'submit',
    data: {
      id: string
      plateNumber: string
      plateType: string
      plateIssueDate: string
      plateExpirationDate: string
      issuanceNotes: string
    },
  ): void
  (e: 'regenerate', vehicleType: string, plateType: string, region: string): string
}>()

// Plate issuance data
const plateNumber = ref('')
const plateType = ref('')
const issuanceNotes = ref('')
const selectedRegion = ref('NCR') // Default region
const lastRegenerationRegion = ref('') // Track the last region used for regeneration
const regenerationError = ref('') // Error message for regeneration

// Get regions list from the store
const regions = plateStore.getRegions

// Calculate issue date (today) and expiration date (3 years from today)
const today = new Date()
const defaultExpirationDate = new Date(today)
defaultExpirationDate.setFullYear(today.getFullYear() + 3)

const plateIssueDate = ref(today.toISOString().split('T')[0])
const plateExpirationDate = ref(defaultExpirationDate.toISOString().split('T')[0])

// Validation errors
const validationErrors = ref<Record<string, string>>({})

// Get plate types based on vehicle type using the store
const getPlateTypes = (vehicleType: string): string[] => {
  return plateStore.getPlateTypesByVehicle(vehicleType, props.registration?.year)
}

// Generate a plate number based on selected parameters
const regeneratePlateNumber = () => {
  if (!props.registration) return

  // Clear any previous error
  regenerationError.value = ''

  // Only allow regeneration if region has changed since last regeneration
  if (lastRegenerationRegion.value === selectedRegion.value) {
    regenerationError.value = 'Please select a different region to regenerate a new plate number'
    return
  }

  // Generate new plate number from the store
  const newPlateNumber = plateStore.generatePlateNumber(
    props.registration.vehicleType,
    plateType.value,
    selectedRegion.value,
  )

  // Update plate number
  plateNumber.value = newPlateNumber

  // Record the region used for this regeneration
  lastRegenerationRegion.value = selectedRegion.value

  // Also emit the regenerate event to inform parent component
  emit('regenerate', props.registration.vehicleType, plateType.value, selectedRegion.value)
}

// Watch for region changes to clear error message
watch(
  () => selectedRegion.value,
  () => {
    regenerationError.value = ''
  },
)

// Initialize form with suggested plate number when registration changes
watch(
  () => [props.registration, props.suggestedPlateNumber],
  () => {
    if (props.registration && props.suggestedPlateNumber) {
      // Keep the current selectedRegion and plateType if they exist
      const currentRegion = selectedRegion.value || 'NCR'
      const currentPlateType = plateType.value || ''

      resetForm()

      // Restore the region selection
      selectedRegion.value = currentRegion
      plateNumber.value = props.suggestedPlateNumber

      // Only set default plate type if it wasn't already set
      if (currentPlateType) {
        // Ensure the plate type is valid for this vehicle
        const validTypes = getPlateTypes(props.registration.vehicleType)
        if (validTypes.includes(currentPlateType)) {
          plateType.value = currentPlateType
        } else {
          // If previous type isn't valid for this vehicle, set default
          setDefaultPlateType(props.registration.vehicleType)
        }
      } else {
        setDefaultPlateType(props.registration.vehicleType)
      }

      // Set the initial regeneration region to track changes
      lastRegenerationRegion.value = currentRegion
    }
  },
  { immediate: true },
)

// Helper function to set default plate type based on vehicle type
const setDefaultPlateType = (vehicleType: string) => {
  plateType.value = plateStore.getDefaultPlateType(vehicleType)
}

// Reset form to default values
const resetForm = () => {
  plateNumber.value = props.suggestedPlateNumber || ''
  issuanceNotes.value = ''
  plateIssueDate.value = today.toISOString().split('T')[0]
  plateExpirationDate.value = defaultExpirationDate.toISOString().split('T')[0]
  validationErrors.value = {}
}

// Validate form using the plate store validation
const validateForm = (): boolean => {
  if (!props.registration) return false

  const plateData = {
    plateNumber: plateNumber.value,
    plateType: plateType.value,
    region: selectedRegion.value,
    plateIssueDate: plateIssueDate.value,
    plateExpirationDate: plateExpirationDate.value,
  }

  const validation = plateStore.validatePlate(plateData, props.registration.vehicleType)
  validationErrors.value = validation.errors as Record<string, string>
  return validation.isValid
}

// Submit plate issuance
const submitIssuance = () => {
  if (!props.registration) return

  if (validateForm()) {
    const result = {
      id: props.registration.id,
      plateNumber: plateNumber.value,
      plateType: plateType.value,
      plateIssueDate: plateIssueDate.value,
      plateExpirationDate: plateExpirationDate.value,
      issuanceNotes: issuanceNotes.value,
    }

    // Show toast notification
    notificationStore.showPlateIssuanceNotification('issued', {
      plateNumber: plateNumber.value,
      vehicle: `${props.registration.make || ''} ${props.registration.model || ''}`.trim(),
    })

    emit('submit', result)
    emit('close')
  }
}

// Cancel plate issuance
const cancelPlateIssuance = () => {
  emit('close')
}
</script>

<template>
  <div
    v-if="isOpen"
    class="fixed inset-0 bg-gray-800 bg-opacity-75 overflow-y-auto h-full w-full flex items-center justify-center z-50"
  >
    <div
      class="relative mx-auto p-0 w-full max-w-2xl shadow-xl rounded-xl bg-white max-h-[90vh] overflow-y-auto"
    >
      <!-- Header -->
      <div class="bg-dark-blue text-white px-6 py-4 rounded-t-xl flex justify-between items-center">
        <h3 class="text-xl font-bold">Plate Issuance - {{ registration?.id }}</h3>
        <button
          @click="cancelPlateIssuance"
          class="text-white hover:text-gray-200 transition-colors"
        >
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
        <div v-if="registration">
          <!-- Vehicle Information Section -->
          <div class="bg-gray-50 p-5 rounded-xl mb-6 shadow-sm">
            <h4 class="text-lg font-bold text-dark-blue mb-3">Vehicle Information</h4>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <p class="text-sm font-medium text-gray-500">Vehicle</p>
                <p class="text-base font-medium text-dark-blue">
                  {{ registration.make }} {{ registration.model }} ({{ registration.year }})
                </p>
              </div>
              <div>
                <p class="text-sm font-medium text-gray-500">Type</p>
                <p class="text-base font-medium text-dark-blue">{{ registration.vehicleType }}</p>
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
                <p class="text-sm font-medium text-gray-500">Owner</p>
                <p class="text-base font-medium text-dark-blue">
                  {{ registration.applicantName || 'Not specified' }}
                </p>
              </div>
              <div>
                <p class="text-sm font-medium text-gray-500">Registration Type</p>
                <p class="text-base font-medium text-dark-blue">
                  {{ registration.registrationType }}
                </p>
              </div>
            </div>
          </div>

          <!-- Plate Issuance Section -->
          <div class="mb-6">
            <h4 class="text-lg font-bold text-dark-blue mb-4">Plate Assignment</h4>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div class="mb-4">
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Region <span class="text-red-600">*</span>
                </label>
                <select
                  v-model="selectedRegion"
                  class="w-full px-4 py-2.5 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-light-blue focus:border-light-blue text-base transition-colors"
                  :class="{
                    'border-red-500 bg-red-50': validationErrors.region,
                    'border-gray-300': !validationErrors.region,
                  }"
                >
                  <option v-for="region in regions" :key="region.code" :value="region.code">
                    {{ region.name }}
                  </option>
                </select>
                <p v-if="validationErrors.region" class="mt-1 text-sm text-red-600 font-medium">
                  {{ validationErrors.region }}
                </p>
              </div>

              <div class="mb-4">
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Plate Type <span class="text-red-600">*</span>
                </label>
                <select
                  v-model="plateType"
                  class="w-full px-4 py-2.5 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-light-blue focus:border-light-blue text-base transition-colors"
                  :class="{
                    'border-red-500 bg-red-50': validationErrors.plateType,
                    'border-gray-300': !validationErrors.plateType,
                  }"
                >
                  <option value="">Select Plate Type</option>
                  <option
                    v-for="type in getPlateTypes(registration.vehicleType)"
                    :key="type"
                    :value="type"
                  >
                    {{ type }}
                  </option>
                </select>
                <p v-if="validationErrors.plateType" class="mt-1 text-sm text-red-600 font-medium">
                  {{ validationErrors.plateType }}
                </p>
              </div>

              <div class="mb-4 col-span-2">
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Plate Number <span class="text-red-600">*</span>
                </label>
                <div class="flex flex-col sm:flex-row gap-3">
                  <div class="relative flex-grow">
                    <input
                      v-model="plateNumber"
                      type="text"
                      class="w-full px-4 py-2.5 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-light-blue focus:border-light-blue text-base font-mono tracking-wide transition-colors"
                      :class="{
                        'border-red-500 bg-red-50': validationErrors.plateNumber,
                        'border-gray-300': !validationErrors.plateNumber,
                      }"
                    />
                  </div>
                  <div class="flex gap-2">
                    <button
                      @click="plateNumber = suggestedPlateNumber"
                      type="button"
                      class="px-4 py-2.5 border border-gray-300 text-sm font-medium rounded-lg shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400 transition-colors"
                    >
                      Reset
                    </button>
                    <button
                      @click="regeneratePlateNumber"
                      type="button"
                      class="px-4 py-2.5 border border-gray-300 text-sm font-medium rounded-lg shadow-sm transition-colors"
                      :class="{
                        'text-gray-700 bg-white hover:bg-gray-50 focus:ring-light-blue':
                          lastRegenerationRegion !== selectedRegion,
                        'opacity-50 cursor-not-allowed text-gray-500 bg-gray-100':
                          lastRegenerationRegion === selectedRegion,
                      }"
                      :title="
                        lastRegenerationRegion === selectedRegion
                          ? 'Change region to generate a new plate'
                          : 'Generate new plate with selected region'
                      "
                    >
                      Regenerate
                    </button>
                  </div>
                </div>
                <p
                  v-if="validationErrors.plateNumber"
                  class="mt-1 text-sm text-red-600 font-medium"
                >
                  {{ validationErrors.plateNumber }}
                </p>
                <p v-if="regenerationError" class="mt-1 text-sm text-amber-600 font-medium">
                  {{ regenerationError }}
                </p>
                <p class="mt-1 text-xs text-gray-500">
                  <template v-if="registration.vehicleType === '2-Wheel'">
                    Format: X-NNN or XX-NNNNN
                  </template>
                  <template v-else-if="plateType === 'Diplomatic'"> Format: DDD-NNNN </template>
                  <template v-else>
                    Format: LLL NNNN (Region + Vehicle Type + Sequential)
                  </template>
                </p>
              </div>

              <div class="mb-4">
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Issue Date <span class="text-red-600">*</span>
                </label>
                <input
                  v-model="plateIssueDate"
                  type="date"
                  class="w-full px-4 py-2.5 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-light-blue focus:border-light-blue text-base transition-colors"
                  :class="{
                    'border-red-500 bg-red-50': validationErrors.plateIssueDate,
                    'border-gray-300': !validationErrors.plateIssueDate,
                  }"
                />
                <p
                  v-if="validationErrors.plateIssueDate"
                  class="mt-1 text-sm text-red-600 font-medium"
                >
                  {{ validationErrors.plateIssueDate }}
                </p>
              </div>

              <div class="mb-4">
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Expiration Date <span class="text-red-600">*</span>
                </label>
                <input
                  v-model="plateExpirationDate"
                  type="date"
                  class="w-full px-4 py-2.5 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-light-blue focus:border-light-blue text-base transition-colors"
                  :class="{
                    'border-red-500 bg-red-50': validationErrors.plateExpirationDate,
                    'border-gray-300': !validationErrors.plateExpirationDate,
                  }"
                />
                <p
                  v-if="validationErrors.plateExpirationDate"
                  class="mt-1 text-sm text-red-600 font-medium"
                >
                  {{ validationErrors.plateExpirationDate }}
                </p>
              </div>
            </div>

            <!-- Issuance Notes -->
            <div class="mt-5 bg-gray-50 p-5 rounded-xl">
              <h4 class="text-md font-bold text-dark-blue mb-3">Issuance Notes</h4>
              <textarea
                v-model="issuanceNotes"
                rows="3"
                class="w-full px-4 py-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-light-blue focus:border-light-blue text-base transition-colors border-gray-300"
                placeholder="Enter any notes regarding this plate issuance..."
              ></textarea>
            </div>
          </div>
        </div>

        <div class="flex justify-end space-x-4 mt-6 pt-4 border-t">
          <button
            @click="cancelPlateIssuance"
            class="px-5 py-2.5 bg-gray-100 border border-gray-300 rounded-lg shadow-sm text-base font-medium text-gray-700 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400 transition-colors"
          >
            Cancel
          </button>
          <button
            @click="submitIssuance"
            class="px-5 py-2.5 bg-dark-blue border border-transparent rounded-lg shadow-sm text-base font-medium text-white hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-light-blue transition-colors"
          >
            Issue Plate
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
