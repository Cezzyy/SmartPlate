<script setup lang="ts">
import type { VehicleRegistrationForm, AdditionalVehicleData } from '@/types/vehicleRegistration'
import { useVehicleRegistrationFormStore } from '@/stores/vehicleRegistrationForm'
import { useUserStore } from '@/stores/user'
import { computed, ref, defineAsyncComponent } from 'vue'
import PendingRegistrations from './PendingRegistrations.vue'
import ProcessingRegistrations from './ProcessingRegistrations.vue'
import CompletedRegistrations from './CompletedRegistrations.vue'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

const props = defineProps<{
  registrationStatus: string
}>()

// Selected status for dropdown (now controlled by prop)
const selectedStatus = computed(() => props.registrationStatus)

// Loading state
const isLoading = ref(false)

const VehicleInspectionModal = defineAsyncComponent({
  loader: () => import('../modals/VehicleInspectionModal.vue'),
  onError(error, retry, fail, attempts) {
    console.error('Error loading VehicleInspectionModal:', error)
    if (attempts <= 3) {
      retry()
    } else {
      console.error('Failed to load VehicleInspectionModal after multiple attempts')
      fail()
    }
  },
})

const PaymentProcessModal = defineAsyncComponent({
  loader: () => import('../modals/PaymentProcessModal.vue'),
  onError(error, retry, fail, attempts) {
    console.error('Error loading PaymentProcessModal:', error)
    if (attempts <= 3) {
      retry()
    } else {
      console.error('Failed to load PaymentProcessModal after multiple attempts')
      fail()
    }
  },
})

const registrationFormStore = useVehicleRegistrationFormStore()
const userStore = useUserStore()

const activeRegistration = ref<VehicleRegistrationForm | null>(null)
const showInspectionModal = ref(false)
const showPaymentModal = ref(false)

// Function to get owner name from user ID
const getOwnerName = (userId: string): string => {
  const user = userStore.users.find((user) => user.ltoClientId === userId)
  if (user) {
    return `${user.firstName} ${user.lastName}`
  }
  return 'Unknown'
}

const pendingRegistrations = computed<VehicleRegistrationForm[]>(() => {
  return registrationFormStore.forms
    .filter((form) => form.status === 'pending')
    .map((form) => {
      return {
        ...form,
        applicantName: getOwnerName(form.userId),
      }
    })
})

const processingRegistrations = computed<VehicleRegistrationForm[]>(() => {
  return registrationFormStore.forms
    .filter(
      (form) =>
        form.status === 'approved' &&
        (form.inspectionStatus !== 'approved' || form.paymentStatus !== 'approved'),
    )
    .map((form) => {
      return {
        ...form,
        applicantName: getOwnerName(form.userId),
      }
    })
})

const completedRegistrations = computed<VehicleRegistrationForm[]>(() => {
  console.log('Computing completed registrations...')
  console.log('Total forms available:', registrationFormStore.forms.length)

  // Log all forms with their statuses for debugging
  registrationFormStore.forms.forEach((form, index) => {
    console.log(
      `Form ${index + 1}: ID=${form.id}, Status=${form.status}, InspectionStatus=${form.inspectionStatus}, PaymentStatus=${form.paymentStatus}`,
    )
  })

  // Get completed forms
  const completed = registrationFormStore.forms
    .filter((form) => {
      const isCompleted =
        form.status === 'approved' &&
        form.inspectionStatus === 'approved' &&
        form.paymentStatus === 'approved'

      if (isCompleted) {
        console.log(`Form ${form.id} is completed!`)
      }

      return isCompleted
    })
    .map((form) => {
      return {
        ...form,
        applicantName: getOwnerName(form.userId),
      }
    })

  console.log(`Found ${completed.length} completed forms`)
  return completed
})

// Process a registration - approve, reject, or update status
const processRegistration = async (data: {
  registrationId: string
  action: 'approve' | 'reject'
}) => {
  await registrationFormStore.$patch((state) => {
    const form = state.forms.find((f) => f.id === data.registrationId)
    if (form) {
      form.status = data.action === 'approve' ? 'approved' : 'rejected'

      // If approved, set initial processing state
      if (data.action === 'approve') {
        form.inspectionStatus = 'pending'
        form.paymentStatus = 'pending'

        // Generate inspection code if it doesn't exist
        if (!form.inspectionCode) {
          const timestamp = new Date().getTime().toString().slice(-6)
          const random = Math.floor(Math.random() * 10000)
            .toString()
            .padStart(4, '0')
          form.inspectionCode = `INS-${timestamp}-${random}`
        }

        // Generate payment code if it doesn't exist
        if (!form.paymentCode) {
          const timestamp = new Date().getTime().toString().slice(-6)
          const random = Math.floor(Math.random() * 10000)
            .toString()
            .padStart(4, '0')
          form.paymentCode = `PAY-${timestamp}-${random}`
        }
      }
    }
  })
}

// Open inspection modal for a registration
const openInspectionModal = (registration: VehicleRegistrationForm) => {
  activeRegistration.value = JSON.parse(JSON.stringify(registration)) // Deep copy
  showInspectionModal.value = true
}

// Open payment modal for a registration
const openPaymentModal = (registration: VehicleRegistrationForm) => {
  activeRegistration.value = JSON.parse(JSON.stringify(registration)) // Deep copy
  showPaymentModal.value = true
}

// Close inspection modal
const closeInspectionModal = () => {
  showInspectionModal.value = false
  activeRegistration.value = null
}

// Close payment modal
const closePaymentModal = () => {
  showPaymentModal.value = false
  activeRegistration.value = null
}

// Handle inspection submission
const handleInspectionSubmit = async (data: {
  id: string
  inspectionStatus: 'approved' | 'rejected'
  inspectionNotes: string
  additionalVehicleData: AdditionalVehicleData
}) => {
  await registrationFormStore.$patch((state) => {
    const form = state.forms.find((f) => f.id === data.id)
    if (form) {
      form.inspectionStatus = data.inspectionStatus
      form.inspectionNotes = data.inspectionNotes
      form.additionalVehicleData = data.additionalVehicleData

      // Status updates
      if (data.inspectionStatus === 'rejected') {
        form.status = 'rejected'
      } else if (data.inspectionStatus === 'approved') {
        // Set default appointment date and time if not already scheduled
        if (!form.appointmentDate || !form.appointmentTime) {
          // Set date to 7 days from now
          const appointmentDate = new Date()
          appointmentDate.setDate(appointmentDate.getDate() + 7)

          // Format the date as YYYY-MM-DD
          form.appointmentDate = appointmentDate.toISOString().split('T')[0]

          // Set a default appointment time (10:00 AM)
          form.appointmentTime = '10:00'
        }
      }
    }
  })

  // Force the store to save the updated form to localStorage
  registrationFormStore.saveFormsToStorage()

  // If inspection was approved, we need to explicitly mark the form for advancement
  if (data.inspectionStatus === 'approved') {
    // Find the form in the store and update its step directly in localStorage
    const forms = registrationFormStore.forms
    const formIndex = forms.findIndex((f) => f.id === data.id)

    if (formIndex !== -1) {
      // Mark the form as approved in our copy
      forms[formIndex].inspectionStatus = 'approved'

      // Force save the forms again to ensure the changes persist
      registrationFormStore.saveFormsToStorage()
    }
  }

  showInspectionModal.value = false
  activeRegistration.value = null
}

// Handle payment submission
const handlePaymentSubmit = async (data: {
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
}) => {
  console.log(`Processing payment submission for form ${data.id}, status: ${data.paymentStatus}`)

  await registrationFormStore.$patch((state) => {
    const form = state.forms.find((f) => f.id === data.id)
    if (form) {
      form.paymentStatus = data.paymentStatus
      form.paymentNotes = data.paymentNotes
      form.paymentDetails = data.paymentDetails

      if (data.paymentStatus === 'approved') {
        // Update status to payment_completed to show in pending plate issuance
        form.status = 'payment_completed' as any // Using type assertion to bypass type checking
        console.log(`Payment approved for form ${data.id}, status updated to payment_completed`)

        if (!(form as any).paymentConfirmationCode) {
          const timestamp = new Date().getTime().toString().slice(-6)
          const random = Math.floor(Math.random() * 10000)
            .toString()
            .padStart(4, '0')
          ;(form as any).paymentConfirmationCode = `CONF-${timestamp}-${random}`
          console.log(
            `Generated payment confirmation code: ${(form as any).paymentConfirmationCode}`,
          )
        }
      } else if (data.paymentStatus === 'rejected') {
        form.status = 'rejected'
        console.log(`Payment rejected for form ${data.id}`)
      }

      console.log(`Updated form status: ${form.status}, paymentStatus: ${form.paymentStatus}`)
    } else {
      console.warn(`Form ${data.id} not found in store`)
    }
  })

  // Force the store to save the updated form to localStorage
  registrationFormStore.saveFormsToStorage()
  console.log('Forms saved to localStorage after payment processing')

  // Debug: Check if the form appears in the completed registrations now
  const completedForms = registrationFormStore.forms.filter(
    (form) =>
      form.status === 'approved' &&
      form.inspectionStatus === 'approved' &&
      form.paymentStatus === 'approved',
  )
  console.log(`Number of completed forms after payment: ${completedForms.length}`)
  if (completedForms.length > 0) {
    completedForms.forEach((form) => {
      console.log(
        `Completed form: ID=${form.id}, Status=${form.status}, InspectionStatus=${form.inspectionStatus}, PaymentStatus=${form.paymentStatus}`,
      )
    })
  }

  // Debug: Check how many forms are ready for plate issuance
  const plateIssuanceForms = registrationFormStore.forms.filter(
    (form) => form.status === ('payment_completed' as any),
  )
  console.log(`Number of forms ready for plate issuance: ${plateIssuanceForms.length}`)
  if (plateIssuanceForms.length > 0) {
    plateIssuanceForms.forEach((form) => {
      console.log(`Plate issuance form: ID=${form.id}, Status=${form.status}`)
    })
  }

  // If payment was approved, transfer the registration to the vehicleRegistration store
  // so it appears in the user's Vehicles section even before a plate is issued
  if (data.paymentStatus === 'approved') {
    registrationFormStore.transferToVehicleRegistration(data.id)
    console.log(
      `Transferred registration ${data.id} to vehicle registration store after payment approval`,
    )
  }

  showPaymentModal.value = false
  activeRegistration.value = null
}

// Empty state computed properties
const getEmptyStateIcon = computed(() => {
  switch (selectedStatus.value) {
    case 'pending':
      return 'inbox'
    case 'processing':
      return 'cogs'
    case 'completed':
      return 'check-circle'
    default:
      return 'folder-open'
  }
})

const getEmptyStateTitle = computed(() => {
  switch (selectedStatus.value) {
    case 'pending':
      return 'No Pending Registrations'
    case 'processing':
      return 'No Processing Registrations'
    case 'completed':
      return 'No Completed Registrations'
    default:
      return 'No Registrations Found'
  }
})

const getEmptyStateMessage = computed(() => {
  switch (selectedStatus.value) {
    case 'pending':
      return 'There are currently no vehicle registrations waiting for approval. New registrations will appear here.'
    case 'processing':
      return 'No registrations are currently being processed. Approved registrations pending inspection or payment will appear here.'
    case 'completed':
      return 'No registrations have been completed yet. Successfully processed registrations will be listed here.'
    default:
      return 'No registrations found in this category.'
  }
})

// Page titles and descriptions
const pageTitle = computed(() => {
  switch (selectedStatus.value) {
    case 'pending':
      return 'Pending Registrations'
    case 'processing':
      return 'Processing Registrations'
    case 'completed':
      return 'Completed Registrations'
    default:
      return 'Vehicle Registrations'
  }
})

const pageDescription = computed(() => {
  switch (selectedStatus.value) {
    case 'pending':
      return 'Review and approve new vehicle registration applications'
    case 'processing':
      return 'Manage registrations that are undergoing inspection and payment processing'
    case 'completed':
      return 'View successfully completed vehicle registrations'
    default:
      return 'Manage vehicle registration applications and approvals'
  }
})
</script>

<template>
  <div>
    <div class="flex justify-between items-center mb-8">
      <div>
        <h2 class="text-2xl font-bold text-dark-blue">{{ pageTitle }}</h2>
        <p class="text-gray mt-1">{{ pageDescription }}</p>
      </div>
    </div>

    <!-- Loading State -->
    <div
      v-if="isLoading"
      class="bg-white rounded-xl shadow-md border border-light-gray border-opacity-20 p-12 flex flex-col items-center justify-center"
    >
      <div class="relative">
        <div class="w-16 h-16 border-4 border-blue-200 rounded-full animate-spin"></div>
        <div
          class="absolute top-0 left-0 w-16 h-16 border-t-4 border-blue-600 rounded-full animate-spin"
        ></div>
      </div>
      <p class="mt-4 text-lg text-gray-600">Loading registrations...</p>
    </div>

    <!-- Empty State -->
    <div
      v-else-if="
        (selectedStatus === 'pending' && !pendingRegistrations.length) ||
        (selectedStatus === 'processing' && !processingRegistrations.length) ||
        (selectedStatus === 'completed' && !completedRegistrations.length)
      "
      class="bg-white rounded-xl shadow-md border border-light-gray border-opacity-20 p-12 flex flex-col items-center justify-center"
    >
      <div class="bg-light-blue bg-opacity-10 rounded-full p-6 mb-4">
        <font-awesome-icon :icon="getEmptyStateIcon" class="h-16 w-16 text-light-blue" />
      </div>
      <h3 class="text-xl font-semibold text-gray-800 mb-2">
        {{ getEmptyStateTitle }}
      </h3>
      <p class="text-gray-500 text-center max-w-md">
        {{ getEmptyStateMessage }}
      </p>
    </div>

    <!-- Registration Components -->
    <div v-else>
      <PendingRegistrations
        v-if="selectedStatus === 'pending'"
        :registrations="pendingRegistrations"
        @process="processRegistration"
      />

      <ProcessingRegistrations
        v-if="selectedStatus === 'processing'"
        :registrations="processingRegistrations"
        @inspection-process="openInspectionModal"
        @payment-process="openPaymentModal"
      />

      <CompletedRegistrations
        v-if="selectedStatus === 'completed'"
        :registrations="completedRegistrations"
      />
    </div>

    <!-- Lazy-loaded modals -->
    <VehicleInspectionModal
      v-if="showInspectionModal"
      :is-open="showInspectionModal"
      :registration="activeRegistration"
      @close="closeInspectionModal"
      @submit="handleInspectionSubmit"
    />

    <PaymentProcessModal
      v-if="showPaymentModal"
      :is-open="showPaymentModal"
      :registration="activeRegistration"
      @close="closePaymentModal"
      @submit="handlePaymentSubmit"
    />
  </div>
</template>
