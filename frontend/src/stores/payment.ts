import { defineStore } from 'pinia'
import type { PaymentDetails, RegistrationStatus } from '@/types/vehicleRegistration'
import { useVehicleRegistrationFormStore } from './vehicleRegistrationForm'
import { useNotificationStore } from './notification'

interface PaymentState {
  pendingPayments: string[] // IDs of forms with pending payments
  completedPayments: string[] // IDs of forms with completed payments
  rejectedPayments: string[] // IDs of forms with rejected payments
  loading: boolean
  error: string | null
}

export interface ExtendedPaymentDetails extends PaymentDetails {
  referenceNumber: string
}

export const usePaymentStore = defineStore('payment', {
  state: (): PaymentState => ({
    pendingPayments: [],
    completedPayments: [],
    rejectedPayments: [],
    loading: false,
    error: null,
  }),

  getters: {
    // Get all pending payments
    getPendingPayments() {
      const vehicleRegistrationFormStore = useVehicleRegistrationFormStore()
      return vehicleRegistrationFormStore.forms.filter(
        (form) => form.paymentStatus === 'pending' && form.inspectionStatus === 'approved',
      )
    },

    // Get all completed payments
    getCompletedPayments() {
      const vehicleRegistrationFormStore = useVehicleRegistrationFormStore()
      return vehicleRegistrationFormStore.forms.filter((form) => form.paymentStatus === 'approved')
    },

    // Get all rejected payments
    getRejectedPayments() {
      const vehicleRegistrationFormStore = useVehicleRegistrationFormStore()
      return vehicleRegistrationFormStore.forms.filter((form) => form.paymentStatus === 'rejected')
    },

    // Get payment by ID
    getPaymentById: () => (id: string) => {
      const vehicleRegistrationFormStore = useVehicleRegistrationFormStore()
      return vehicleRegistrationFormStore.forms.find((form) => form.id === id)
    },

    // Calculate registration fee based on vehicle type
    getRegistrationFee: () => (vehicleType: string, isNewVehicle: boolean) => {
      // Base fee depends on vehicle type
      let baseFee = 1000.0 // Default fee

      if (vehicleType === '4-Wheel') {
        baseFee = 1620.0
      } else if (vehicleType === '2-Wheel') {
        baseFee = 820.0
      }

      // Apply new vehicle surcharge if applicable
      if (isNewVehicle) {
        baseFee += 100.0 // Add surcharge for new vehicle registration
      }

      return baseFee
    },

    // Calculate computer fee (fixed)
    getComputerFee: () => 169.0,

    // Calculate total fee
    getTotalFee: () => (vehicleType: string, isNewVehicle: boolean) => {
      // Calculate base registration fee based on vehicle type
      let baseFee = 1000.0 // Default fee

      if (vehicleType === '4-Wheel') {
        baseFee = 1620.0
      } else if (vehicleType === '2-Wheel') {
        baseFee = 820.0
      }

      // Apply new vehicle surcharge
      if (isNewVehicle) {
        baseFee += 100.0 // Add surcharge for new vehicle registration
      }

      // Fixed computer fee
      const computerFee = 169.0

      let total = baseFee + computerFee

      // Add plate issuance fee for new registrations
      if (isNewVehicle) {
        total += 450.0
      }

      return total
    },
  },

  actions: {
    // Process payment
    processPayment(
      id: string,
      paymentStatus: RegistrationStatus,
      paymentNotes: string,
      paymentDetails: ExtendedPaymentDetails,
    ) {
      this.loading = true
      this.error = null

      try {
        const vehicleRegistrationFormStore = useVehicleRegistrationFormStore()
        const notificationStore = useNotificationStore()

        // Find the registration form
        const form = vehicleRegistrationFormStore.forms.find((form) => form.id === id)

        if (!form) {
          throw new Error(`Registration form with ID ${id} not found`)
        }

        // Ensure inspection is approved before processing payment
        if (form.inspectionStatus !== 'approved') {
          throw new Error('Vehicle inspection must be approved before processing payment')
        }

        // Update the form with payment details
        form.paymentStatus = paymentStatus
        form.paymentNotes = paymentNotes
        form.paymentDetails = {
          amountPaid: paymentDetails.amountPaid,
          paymentDate: paymentDetails.paymentDate,
          paymentMethod: paymentDetails.paymentMethod,
          receiptNumber: paymentDetails.receiptNumber,
        }

        // Update the overall status if needed
        if (paymentStatus === 'approved') {
          // If payment approved, complete the registration process
          form.status = 'approved'

          // Add to completed payments
          if (!this.completedPayments.includes(id)) {
            this.completedPayments.push(id)
          }

          // Remove from pending and rejected if present
          this.pendingPayments = this.pendingPayments.filter((pendingId) => pendingId !== id)
          this.rejectedPayments = this.rejectedPayments.filter((rejectedId) => rejectedId !== id)
        } else if (paymentStatus === 'rejected') {
          // If payment rejected, update overall status
          form.status = 'rejected'

          // Add to rejected payments
          if (!this.rejectedPayments.includes(id)) {
            this.rejectedPayments.push(id)
          }

          // Remove from pending and completed if present
          this.pendingPayments = this.pendingPayments.filter((pendingId) => pendingId !== id)
          this.completedPayments = this.completedPayments.filter(
            (completedId) => completedId !== id,
          )
        }

        // Show notification
        notificationStore.showPaymentNotification(
          paymentStatus === 'approved' ? 'success' : 'failed',
          {
            amount: paymentDetails.amountPaid,
            reference: paymentDetails.referenceNumber,
          },
        )

        return true
      } catch (error) {
        this.error = error instanceof Error ? error.message : 'An unknown error occurred'
        return false
      } finally {
        this.loading = false
      }
    },

    // Generate payment reference number
    generateReferenceNumber(): string {
      const timestamp = new Date().getTime().toString().slice(-6)
      const random = Math.floor(Math.random() * 10000)
        .toString()
        .padStart(4, '0')
      return `PAY-${timestamp}-${random}`
    },

    // Generate receipt number
    generateReceiptNumber(): string {
      const timestamp = new Date().getTime().toString().slice(-6)
      const random = Math.floor(Math.random() * 10000)
        .toString()
        .padStart(4, '0')
      return `RCT-${timestamp}-${random}`
    },

    // Reset payment status
    resetPayment(id: string) {
      this.loading = true
      this.error = null

      try {
        const vehicleRegistrationFormStore = useVehicleRegistrationFormStore()

        // Find the registration form
        const form = vehicleRegistrationFormStore.forms.find((form) => form.id === id)

        if (!form) {
          throw new Error(`Registration form with ID ${id} not found`)
        }

        // Reset payment status to pending
        form.paymentStatus = 'pending'
        form.paymentNotes = ''
        form.paymentDetails = undefined

        // Add to pending payments
        if (!this.pendingPayments.includes(id)) {
          this.pendingPayments.push(id)
        }

        // Remove from completed and rejected if present
        this.completedPayments = this.completedPayments.filter((completedId) => completedId !== id)
        this.rejectedPayments = this.rejectedPayments.filter((rejectedId) => rejectedId !== id)

        return true
      } catch (error) {
        this.error = error instanceof Error ? error.message : 'An unknown error occurred'
        return false
      } finally {
        this.loading = false
      }
    },

    // Initialize store by categorizing existing forms
    initializeStore() {
      this.loading = true

      try {
        const vehicleRegistrationFormStore = useVehicleRegistrationFormStore()

        // Reset arrays
        this.pendingPayments = []
        this.completedPayments = []
        this.rejectedPayments = []

        // Categorize existing forms
        vehicleRegistrationFormStore.forms.forEach((form) => {
          if (form.paymentStatus === 'pending') {
            this.pendingPayments.push(form.id)
          } else if (form.paymentStatus === 'approved') {
            this.completedPayments.push(form.id)
          } else if (form.paymentStatus === 'rejected') {
            this.rejectedPayments.push(form.id)
          }
        })
      } catch (error) {
        this.error = error instanceof Error ? error.message : 'An unknown error occurred'
      } finally {
        this.loading = false
      }
    },
  },
})
