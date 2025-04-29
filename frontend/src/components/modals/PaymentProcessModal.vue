<script setup lang="ts">
import type { VehicleRegistrationForm } from '../../types/vehicleRegistration'
import { ref, defineProps, defineEmits, computed, watch } from 'vue'
import { usePaymentStore } from '../../stores/payment'
import type { ExtendedPaymentDetails } from '../../stores/payment'

const paymentStore = usePaymentStore()
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
      paymentStatus: 'approved' | 'rejected'
      paymentNotes: string
      paymentDetails: {
        amountPaid: number
        paymentDate: string
        paymentMethod: string
        receiptNumber: string
        referenceNumber: string
      }
    },
  ): void
}>()

// Payment data
const paymentNotes = ref('')
const paymentStatus = ref<'approved' | 'rejected'>('approved')
const paymentDetails = ref({
  amountPaid: 0,
  paymentDate: new Date().toISOString().split('T')[0],
  paymentMethod: 'Cash', // Default to Cash
  receiptNumber: '',
  referenceNumber: '',
})

// Generate payment reference and receipt numbers using the store
const generateReferenceNumber = (): string => {
  return paymentStore.generateReferenceNumber()
}

const generateReceiptNumber = (): string => {
  return paymentStore.generateReceiptNumber()
}

// Validation errors
const validationErrors = ref<Record<string, string>>({})

// Get registration fee based on vehicle type
const registrationFee = computed(() => {
  if (!props.registration) return 0

  if (props.registration.vehicleType === '4-Wheel') {
    return 1620.0
  } else if (props.registration.vehicleType === '2-Wheel') {
    return 820.0
  }
  return 1000.0 // Default fee
})

// Calculate computer fee
const computerFee = computed(() => 169.0) // Fixed fee

// Calculate total fee
const totalFee = computed(() => {
  if (!props.registration) return '0.00'

  return paymentStore
    .getTotalFee(props.registration.vehicleType, props.registration.isNewVehicle)
    .toFixed(2)
})

// Define resetForm
const resetForm = () => {
  paymentNotes.value = ''
  paymentStatus.value = 'approved'

  // Set default payment date to today
  paymentDetails.value = {
    amountPaid: parseFloat(totalFee.value),
    paymentDate: new Date().toISOString().split('T')[0],
    paymentMethod: 'Cash', // Default to Cash
    receiptNumber: generateReceiptNumber(), // Generate receipt number automatically
    referenceNumber: generateReferenceNumber(),
  }

  validationErrors.value = {}
}

// Reset form when registration changes
watch(
  () => props.registration,
  () => {
    if (props.registration) {
      resetForm()
    }
  },
  { immediate: true },
)

// Validate form
const validateForm = (): boolean => {
  validationErrors.value = {}
  let isValid = true

  // Check if amount paid matches total fee
  if (paymentDetails.value.amountPaid <= 0) {
    validationErrors.value.amountPaid = 'Payment amount is required'
    isValid = false
  } else if (paymentDetails.value.amountPaid < parseFloat(totalFee.value)) {
    validationErrors.value.amountPaid = `Amount must be at least ₱${totalFee.value}`
    isValid = false
  }

  // Check payment date
  if (!paymentDetails.value.paymentDate) {
    validationErrors.value.paymentDate = 'Payment date is required'
    isValid = false
  }

  // If rejecting, require notes
  if (paymentStatus.value === 'rejected' && !paymentNotes.value.trim()) {
    validationErrors.value.paymentNotes = 'Notes are required when rejecting a payment'
    isValid = false
  }

  return isValid
}

// Submit payment
const submitPayment = () => {
  if (!props.registration) return

  if (validateForm()) {
    // Ensure reference number is generated if not already present
    if (!paymentDetails.value.referenceNumber) {
      paymentDetails.value.referenceNumber = generateReferenceNumber()
    }

    const result = {
      id: props.registration.id,
      paymentStatus: paymentStatus.value,
      paymentNotes: paymentNotes.value,
      paymentDetails: { ...paymentDetails.value },
    }

    // Process payment using the store
    paymentStore.processPayment(props.registration.id, paymentStatus.value, paymentNotes.value, {
      ...paymentDetails.value,
    } as ExtendedPaymentDetails)

    emit('submit', result)
    emit('close')
  }
}

// Cancel payment
const cancelPayment = () => {
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
        <h3 class="text-xl font-bold">Payment Processing - {{ registration?.id }}</h3>
        <button @click="cancelPayment" class="text-white hover:text-gray-200 transition-colors">
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
          <!-- Payment Verification Code Banner -->
          <div class="bg-light-blue bg-opacity-10 p-4 rounded-lg mb-6 border border-light-blue">
            <div class="flex items-center justify-between">
              <div>
                <h4 class="text-md font-bold text-dark-blue mb-1">Payment Verification Code</h4>
                <p
                  v-if="registration.paymentCode"
                  class="text-lg text-light-blue font-mono font-bold tracking-wide"
                >
                  {{ registration.paymentCode }}
                </p>
                <p v-else class="text-sm text-red-600 font-medium">
                  No payment code available. Please contact system administrator.
                </p>
              </div>
              <div class="bg-dark-blue text-white px-4 py-2 rounded-lg text-xs font-bold">
                VERIFY BEFORE PAYMENT
              </div>
            </div>
          </div>

          <!-- Registration Details Section -->
          <div class="bg-gray-50 p-5 rounded-xl mb-6 shadow-sm">
            <h4 class="text-lg font-bold text-dark-blue mb-3">Registration Details</h4>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <p class="text-sm font-medium text-gray-500">Vehicle</p>
                <p class="text-base font-medium text-dark-blue">
                  {{ registration.make }} {{ registration.model }} ({{ registration.year }})
                </p>
              </div>
              <div>
                <p class="text-sm font-medium text-gray-500">Registration Type</p>
                <p class="text-base font-medium text-dark-blue">
                  {{ registration.registrationType }}
                </p>
              </div>
              <div>
                <p class="text-sm font-medium text-gray-500">Owner</p>
                <p class="text-base font-medium text-dark-blue">
                  {{ registration.applicantName || 'Not specified' }}
                </p>
              </div>
            </div>

            <!-- Fee Breakdown -->
            <div class="mt-5 border-t border-gray-200 pt-4">
              <h5 class="text-md font-bold text-dark-blue mb-3">Fee Breakdown</h5>
              <div class="space-y-2">
                <div class="flex justify-between">
                  <span class="text-sm text-gray-600">Registration Fee</span>
                  <span class="text-sm font-medium text-dark-blue"
                    >₱{{ registrationFee.toFixed(2) }}</span
                  >
                </div>
                <div class="flex justify-between">
                  <span class="text-sm text-gray-600">Computer Fee</span>
                  <span class="text-sm font-medium text-dark-blue"
                    >₱{{ computerFee.toFixed(2) }}</span
                  >
                </div>
                <div v-if="registration.isNewVehicle" class="flex justify-between">
                  <span class="text-sm text-gray-600">Plate Issuance Fee</span>
                  <span class="text-sm font-medium text-dark-blue">₱450.00</span>
                </div>
                <div class="flex justify-between font-bold border-t border-gray-300 pt-2 mt-2">
                  <span class="text-base text-dark-blue">Total</span>
                  <span class="text-base text-dark-blue">₱{{ totalFee }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Payment Processing Section -->
          <div class="mb-6">
            <h4 class="text-lg font-bold text-dark-blue mb-4">Payment Processing</h4>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div class="mb-4">
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Amount Paid (₱) <span class="text-red-600">*</span>
                </label>
                <input
                  v-model.number="paymentDetails.amountPaid"
                  type="number"
                  min="0"
                  step="0.01"
                  class="w-full px-4 py-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-light-blue focus:border-light-blue text-base transition-colors"
                  :class="{
                    'border-red-500 bg-red-50': validationErrors.amountPaid,
                    'border-gray-300': !validationErrors.amountPaid,
                  }"
                />
                <p v-if="validationErrors.amountPaid" class="mt-1 text-sm text-red-600 font-medium">
                  {{ validationErrors.amountPaid }}
                </p>
              </div>

              <div class="mb-4">
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Payment Reference Number
                </label>
                <input
                  v-model="paymentDetails.referenceNumber"
                  type="text"
                  readonly
                  class="w-full px-4 py-3 border border-gray-300 bg-gray-50 rounded-lg shadow-sm text-base font-mono tracking-wide"
                />
                <p class="mt-1 text-xs text-gray-500">Automatically generated payment reference</p>
              </div>

              <div class="mb-4">
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Payment Date <span class="text-red-600">*</span>
                </label>
                <input
                  v-model="paymentDetails.paymentDate"
                  type="date"
                  class="w-full px-4 py-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-light-blue focus:border-light-blue text-base transition-colors"
                  :class="{
                    'border-red-500 bg-red-50': validationErrors.paymentDate,
                    'border-gray-300': !validationErrors.paymentDate,
                  }"
                />
                <p
                  v-if="validationErrors.paymentDate"
                  class="mt-1 text-sm text-red-600 font-medium"
                >
                  {{ validationErrors.paymentDate }}
                </p>
              </div>

              <div class="mb-4">
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Payment Method <span class="text-red-600">*</span>
                </label>
                <input
                  v-model="paymentDetails.paymentMethod"
                  type="text"
                  readonly
                  class="w-full px-4 py-3 border border-gray-300 bg-gray-50 rounded-lg shadow-sm text-base"
                />
                <p class="mt-1 text-xs text-gray-500">Fixed to Cash payment only</p>
              </div>

              <div class="mb-4">
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Receipt Number <span class="text-red-600">*</span>
                </label>
                <input
                  v-model="paymentDetails.receiptNumber"
                  type="text"
                  readonly
                  class="w-full px-4 py-3 border border-gray-300 bg-gray-50 rounded-lg shadow-sm text-base font-mono tracking-wide"
                />
                <p class="mt-1 text-xs text-gray-500">Automatically generated receipt number</p>
              </div>
            </div>

            <!-- Payment Notes -->
            <div class="mt-5">
              <h4 class="text-md font-bold text-dark-blue mb-2">
                Payment Notes
                <span v-if="paymentStatus === 'rejected'" class="text-red-600">*</span>
              </h4>
              <textarea
                v-model="paymentNotes"
                rows="3"
                class="w-full px-4 py-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-light-blue focus:border-light-blue text-base transition-colors"
                :class="{
                  'border-red-500 bg-red-50': validationErrors.paymentNotes,
                  'border-gray-300': !validationErrors.paymentNotes,
                }"
                placeholder="Enter payment notes or reasons for rejection..."
              ></textarea>
              <p v-if="validationErrors.paymentNotes" class="mt-1 text-sm text-red-600 font-medium">
                {{ validationErrors.paymentNotes }}
              </p>
            </div>

            <!-- Payment Status -->
            <div class="mt-5 bg-gray-50 p-4 rounded-lg">
              <h4 class="text-md font-bold text-dark-blue mb-3">Payment Status</h4>
              <div class="flex space-x-6">
                <label class="inline-flex items-center">
                  <input
                    v-model="paymentStatus"
                    type="radio"
                    class="form-radio h-5 w-5 text-dark-blue"
                    name="paymentStatus"
                    value="approved"
                  />
                  <span class="ml-2 text-base text-gray-700">Approved</span>
                </label>
                <label class="inline-flex items-center">
                  <input
                    v-model="paymentStatus"
                    type="radio"
                    class="form-radio h-5 w-5 text-red-600"
                    name="paymentStatus"
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
            @click="cancelPayment"
            class="px-5 py-2.5 bg-gray-100 border border-gray-300 rounded-lg shadow-sm text-base font-medium text-gray-700 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400 transition-colors"
          >
            Cancel
          </button>
          <button
            @click="submitPayment"
            class="px-5 py-2.5 bg-dark-blue border border-transparent rounded-lg shadow-sm text-base font-medium text-white hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-light-blue transition-colors"
          >
            Process Payment
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
