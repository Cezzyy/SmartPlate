import { defineStore } from 'pinia'
import type {
  VehicleRegistrationForm,
  VehicleRegistrationState,
  VehicleDocuments,
} from '@/types/vehicleRegistration'
import { registrationStatusMessages, type RegistrationStatus } from '@/types/vehicleRegistration'
import { useVehicleRegistrationStore } from './vehicleRegistration'
import { useUserStore } from './user'
import * as vehicleRegistrationService from '@/services/vehicleRegistrationService'

// Using imported registration status messages for status display
const statusMessages = registrationStatusMessages

// Helper function to check if status is final
const isFinalStatus = (status: RegistrationStatus): boolean => {
  return status === 'approved' || status === 'rejected'
}

const mockRegistrationForms: VehicleRegistrationForm[] = [
  {
    id: 'REG-2024-001',
    userId: 'LTO-2023-78945',
    isNewVehicle: true,
    vehicleType: 'Sedan',
    make: 'Toyota',
    model: 'Corolla Altis',
    year: '2024',
    engineNumber: 'ENG-2024-001',
    chassisNumber: 'CHS-2024-001',
    color: 'Pearl White',
    status: 'approved',
    submissionDate: '2024-01-15',
    registrationType: 'New Vehicle',
    documents: {
      csr: { name: 'csr.pdf', size: 1024 },
      salesInvoice: { name: 'invoice.pdf', size: 2048 },
      insurance: { name: 'insurance.pdf', size: 1536 },
      orCr: null,
      deedOfSale: null,
      pnpHpgClearance: null,
    },
    appointmentDate: '2024-02-15',
    appointmentTime: '10:00',
    referenceCode: 'SP-24-001',
    inspectionStatus: 'approved',
    inspectionCode: 'INS-2024-001',
    paymentCode: 'PAY-2024-001',
    paymentStatus: 'approved',
    verificationStatus: 'approved',
  },
  {
    id: 'REG-2024-002',
    userId: 'LTO-2023-12345',
    isNewVehicle: false,
    vehicleType: 'SUV',
    make: 'Honda',
    model: 'CR-V',
    year: '2020',
    engineNumber: 'ENG-2020-002',
    chassisNumber: 'CHS-2020-002',
    color: 'Cosmic Blue',
    status: 'pending',
    submissionDate: '2024-02-01',
    registrationType: 'Renewal',
    documents: {
      csr: null,
      salesInvoice: null,
      insurance: null,
      orCr: { name: 'or_cr.pdf', size: 2048 },
      deedOfSale: { name: 'deed.pdf', size: 1536 },
      pnpHpgClearance: { name: 'clearance.pdf', size: 1024 },
    },
    appointmentDate: '2024-02-20',
    appointmentTime: '14:30',
    referenceCode: 'SP-24-002',
    inspectionStatus: 'pending',
    inspectionCode: 'INS-2024-002',
    paymentStatus: 'pending',
    paymentCode: 'PAY-2024-002',
    verificationStatus: 'pending',
  },
  {
    id: 'REG-2024-003',
    userId: 'LTO-2023-67890',
    isNewVehicle: true,
    vehicleType: 'Motorcycle',
    make: 'Yamaha',
    model: 'MT-07',
    year: '2024',
    engineNumber: 'ENG-2024-003',
    chassisNumber: 'CHS-2024-003',
    color: 'Racing Blue',
    status: 'rejected',
    submissionDate: '2024-02-10',
    registrationType: 'New Vehicle',
    documents: {
      csr: { name: 'csr.pdf', size: 1024 },
      salesInvoice: { name: 'invoice.pdf', size: 2048 },
      insurance: null,
      orCr: null,
      deedOfSale: null,
      pnpHpgClearance: null,
    },
    appointmentDate: null,
    appointmentTime: null,
    referenceCode: '',
    inspectionStatus: 'rejected',
    inspectionCode: 'INS-2024-003',
    paymentCode: 'PAY-2024-003',
    paymentStatus: 'pending',
    verificationStatus: 'pending',
  },
]

export const useVehicleRegistrationFormStore = defineStore('vehicleRegistrationForm', {
  persist: true,
  state: (): VehicleRegistrationState => ({
    hasUnsavedChanges: false,
    forms: [...mockRegistrationForms],
    formData: {
      id: '',
      userId: '',
      isNewVehicle: true,
      vehicleType: '',
      make: '',
      model: '',
      year: '',
      engineNumber: '',
      chassisNumber: '',
      color: '',
      status: 'pending',
      submissionDate: new Date().toISOString().split('T')[0],
      registrationType: 'New Vehicle',
      documents: {
        csr: null,
        salesInvoice: null,
        insurance: null,
        orCr: null,
        deedOfSale: null,
        pnpHpgClearance: null,
      },
      appointmentDate: null,
      appointmentTime: null,
      referenceCode: '',
      inspectionStatus: 'pending',
      inspectionCode: '',
      paymentCode: '',
      paymentStatus: 'pending',
      verificationStatus: 'pending',
    },
    errors: {
      vehicleType: '',
      make: '',
      model: '',
      year: '',
      engineNumber: '',
      chassisNumber: '',
      color: '',
      documents: {
        csr: '',
        salesInvoice: '',
        insurance: '',
        orCr: '',
        deedOfSale: '',
        pnpHpgClearance: '',
      },
      referenceSlip: '',
    },
    isSubmitting: false,
    currentStep: 1,
  }),

  getters: {
    requiredDocuments: (state): Array<keyof VehicleDocuments> => {
      if (state.formData.isNewVehicle) {
        return ['csr', 'salesInvoice', 'insurance']
      } else {
        return ['orCr', 'deedOfSale', 'pnpHpgClearance']
      }
    },
    isFormComplete: (state): boolean => {
      return (
        state.formData.vehicleType !== '' &&
        state.formData.make !== '' &&
        state.formData.model !== '' &&
        state.formData.year !== '' &&
        state.formData.engineNumber !== '' &&
        state.formData.chassisNumber !== '' &&
        state.formData.color !== ''
      )
    },
    hasValidationErrors: (state): boolean => {
      return Object.values(state.errors).some((error) => error !== '')
    },
    pendingForms: (state): VehicleRegistrationForm[] => {
      return state.forms.filter((form) => form.inspectionStatus === 'pending')
    },
    approvedForms: (state): VehicleRegistrationForm[] => {
      return state.forms.filter((form) => form.inspectionStatus === 'approved')
    },
    rejectedForms: (state): VehicleRegistrationForm[] => {
      return state.forms.filter((form) => form.inspectionStatus === 'rejected')
    },
    getUserRegistrations: (state): ((userId: string) => VehicleRegistrationForm[]) => {
      return (userId: string): VehicleRegistrationForm[] => {
        if (!userId) {
          console.warn('getUserRegistrations called with empty userId')
          return []
        }

        console.log(`Getting registrations for user: "${userId}"`)
        console.log('Total forms in store:', state.forms.length)

        // Ensure we're doing exact string comparisons for userId
        const userForms = state.forms.filter((form: VehicleRegistrationForm) => {
          // Trim whitespace if any
          const trimmedFormUserId = form.userId ? form.userId.trim() : ''
          const trimmedUserId = userId.trim()

          // Check exact equality
          const isMatch = trimmedFormUserId === trimmedUserId

          if (isMatch) {
            console.log(`MATCH: Form "${form.id}" belongs to user "${userId}"`)
          } else if (form.userId) {
            console.log(
              `NO MATCH: Form "${form.id}" belongs to user "${form.userId}" not "${userId}"`,
            )
          }

          return isMatch
        })

        console.log(`Found ${userForms.length} forms for user "${userId}"`)
        return userForms
      }
    },
  },

  actions: {
    validateVehicleInfo(): boolean {
      let isValid = true

      // Reset errors
      this.errors.vehicleType = ''
      this.errors.make = ''
      this.errors.model = ''
      this.errors.year = ''
      this.errors.engineNumber = ''
      this.errors.chassisNumber = ''
      this.errors.color = ''

      // Vehicle type validation
      if (!this.formData.vehicleType) {
        this.errors.vehicleType = 'Please select a vehicle type'
        isValid = false
      }

      // Make validation
      if (!this.formData.make) {
        this.errors.make = 'Vehicle make is required'
        isValid = false
      } else if (this.formData.make.length < 2) {
        this.errors.make = 'Vehicle make must be at least 2 characters'
        isValid = false
      }

      // Model validation
      if (!this.formData.model) {
        this.errors.model = 'Vehicle model is required'
        isValid = false
      } else if (this.formData.model.length < 2) {
        this.errors.model = 'Vehicle model must be at least 2 characters'
        isValid = false
      }

      // Year validation
      const currentYear = new Date().getFullYear()
      const yearValue = Number(this.formData.year)
      if (!this.formData.year) {
        this.errors.year = 'Vehicle year is required'
        isValid = false
      } else if (isNaN(yearValue) || yearValue < 1900 || yearValue > currentYear + 1) {
        this.errors.year = `Year must be between 1900 and ${currentYear + 1}`
        isValid = false
      }

      // Engine number validation
      if (!this.formData.engineNumber) {
        this.errors.engineNumber = 'Engine number is required'
        isValid = false
      }

      // Chassis number validation
      if (!this.formData.chassisNumber) {
        this.errors.chassisNumber = 'Chassis number is required'
        isValid = false
      }

      // Color validation
      if (!this.formData.color) {
        this.errors.color = 'Vehicle color is required'
        isValid = false
      } else if (this.formData.color.length < 2) {
        this.errors.color = 'Vehicle color must be at least 2 characters'
        isValid = false
      }

      return isValid
    },

    setUnsavedChanges(value: boolean): void {
      this.hasUnsavedChanges = value
    },

    async submitRegistration(): Promise<boolean> {
      this.isSubmitting = true;
      try {
        console.log('Starting form submission process...');
        
        // Make sure the userId is set
        const userStore = useUserStore();
        this.formData.userId = userStore.currentUser?.ltoClientId || this.formData.userId;
        console.log(`Using userId: ${this.formData.userId}`);
        
        // Generate a reference code for tracking
        if (!this.formData.referenceCode) {
          this.formData.referenceCode = 'REF-' + new Date().getTime();
          console.log(`Generated reference code: ${this.formData.referenceCode}`);
        }
        
        // Set submission date if not already set
        if (!this.formData.submissionDate) {
          this.formData.submissionDate = new Date().toISOString().split('T')[0];
        }
        
        // Set default status if not set
        if (!this.formData.status) {
          this.formData.status = 'pending';
        }
        
        // Store original ID to check if it's a client-generated ID or UUID
        const originalId = this.formData.id;
        let savedForm;
        
        // Check if we're updating an existing form with a valid UUID
        if (originalId && 
            !originalId.startsWith('REG-') && 
            !originalId.startsWith('REF-')) {
          // This is a valid backend-generated UUID, update the form
          console.log(`Updating existing form with UUID: ${originalId}`);
          savedForm = await vehicleRegistrationService.updateRegistrationForm(
            originalId,
            this.formData
          );
        } else {
          // This is a new form or has a client-generated ID
          console.log('Creating new registration form');
          savedForm = await vehicleRegistrationService.createRegistrationForm(this.formData);
        }
        
        if (savedForm) {
          console.log('Form saved successfully to backend:', savedForm);
          
          // Update form with backend-generated UUID
          if (savedForm.id) {
            console.log(`Received backend UUID: ${savedForm.id}`);
            this.formData.id = savedForm.id as string;
          } else if ((savedForm as any).registration_form_id) {
            // Some backend responses use registration_form_id instead of id
            console.log(`Received backend UUID as registration_form_id: ${(savedForm as any).registration_form_id}`);
            this.formData.id = (savedForm as any).registration_form_id as string;
          }
          
          // Save to local forms array with the backend UUID
          this.saveCurrentForm();
          
          // Save to localStorage
          this.saveFormsToStorage();
          
          console.log('Registration form submitted successfully with ID:', this.formData.id);
          return true;
        } else {
          console.error('No response received from form submission API');
          return false;
        }
      } catch (error) {
        console.error('Error submitting registration form:', error);
        return false;
      } finally {
        this.isSubmitting = false;
      }
    },

    resetForm(): void {
      this.hasUnsavedChanges = false
      this.formData = {
        id: '',
        userId: '',
        isNewVehicle: true,
        vehicleType: '',
        make: '',
        model: '',
        year: '',
        engineNumber: '',
        chassisNumber: '',
        color: '',
        status: 'pending',
        submissionDate: new Date().toISOString().split('T')[0],
        registrationType: 'New Vehicle',
        documents: {
          csr: null,
          salesInvoice: null,
          insurance: null,
          orCr: null,
          deedOfSale: null,
          pnpHpgClearance: null,
        },
        appointmentDate: null,
        appointmentTime: null,
        referenceCode: '',
        inspectionStatus: 'pending',
        inspectionCode: '',
        paymentStatus: 'pending',
        paymentCode: '',
        verificationStatus: 'pending',
      } as VehicleRegistrationForm
      this.errors = {
        vehicleType: '',
        make: '',
        model: '',
        year: '',
        engineNumber: '',
        chassisNumber: '',
        color: '',
        documents: {
          csr: '',
          salesInvoice: '',
          insurance: '',
          orCr: '',
          deedOfSale: '',
          pnpHpgClearance: '',
        },
        referenceSlip: '',
      }
      this.currentStep = 1
      this.isSubmitting = false
    },

    validateDocuments(): boolean {
      let isValid = true

      // Reset document errors
      Object.keys(this.formData.documents).forEach((doc) => {
        this.errors.documents[doc as keyof typeof this.errors.documents] = ''
      })

      // Check required documents
      this.requiredDocuments.forEach((docType) => {
        if (!this.formData.documents[docType as keyof typeof this.formData.documents]) {
          this.errors.documents[docType as keyof typeof this.errors.documents] =
            'This document is required'
          isValid = false
        }
      })

      return isValid
    },

    validateAppointment(): boolean {
      let isValid = true

      if (!this.formData.appointmentDate || !this.formData.appointmentTime) {
        alert('Please schedule an appointment first')
        isValid = false
      }

      return isValid
    },

    getStatusMessage(status: RegistrationStatus): string {
      return statusMessages[status] || status;
    },

    updateRegistrationStatus(newStatus: RegistrationStatus): void {
      // Update the form status
      this.formData.status = newStatus

      // Update inspection status to match main status for consistency
      if (newStatus === 'approved') {
        this.formData.inspectionStatus = 'approved'

        // Generate inspection code if not already present
        if (!this.formData.inspectionCode) {
          this.formData.inspectionCode = this.generateUniqueCode('INS')
          console.log('Generated inspection code on status update:', this.formData.inspectionCode)
        }

        // Generate payment code if not already present
        if (!this.formData.paymentCode) {
          this.formData.paymentCode = this.generateUniqueCode('PAY')
          console.log('Generated payment code on status update:', this.formData.paymentCode)
        }

        // Set default appointment date and time if not already scheduled
        if (!this.formData.appointmentDate || !this.formData.appointmentTime) {
          // Set date to 7 days from now
          const appointmentDate = new Date()
          appointmentDate.setDate(appointmentDate.getDate() + 7)

          // Format the date as YYYY-MM-DD
          this.formData.appointmentDate = appointmentDate.toISOString().split('T')[0]

          // Set a default appointment time (10:00 AM)
          this.formData.appointmentTime = '10:00'

          console.log('Set default appointment date:', this.formData.appointmentDate)
          console.log('Set default appointment time:', this.formData.appointmentTime)
        }

        // Advance to step 4 when approval happens
        this.currentStep = 4
        console.log('Advanced to step 4 (Payment) due to approved status')
      }

      this.hasUnsavedChanges = true

      // Save the form immediately after status update
      this.saveCurrentForm()
    },

    // Update the current step in the registration process
    updateCurrentStep(step: number): void {
      if (step >= 1 && step <= 4) {
        this.currentStep = step
        console.log(`Updated current step to ${step}`)
      } else {
        console.error(`Invalid step number: ${step}. Must be between 1 and 4.`)
      }
    },

    canUpdateStatus(): boolean {
      return !isFinalStatus(this.formData.status)
    },

    // Generate a unique code for inspection or payment
    generateUniqueCode(prefix: string): string {
      const timestamp = new Date().getTime().toString().slice(-6)
      const random = Math.floor(Math.random() * 10000)
        .toString()
        .padStart(4, '0')
      return `${prefix}-${timestamp}-${random}`
    },

    loadFormsFromStorage(): void {
      console.log('Using Pinia persistence - no manual loading needed')
      console.log('Current forms in store:', this.forms.length)

      // Log the current user's forms
      const currentUserId = localStorage.getItem('userId')
      console.log('Current userId:', currentUserId)

      if (currentUserId) {
        const userForms = this.forms.filter((form) => form.userId === currentUserId)
        console.log(`Forms for current user (${currentUserId}):`, userForms.length)

        userForms.forEach((form) => {
          console.log(`User form: ID=${form.id}, Status=${form.status}, Make=${form.make}`)
        })
      }
    },

    saveFormsToStorage(): void {
      console.log('Using Pinia persistence - no manual saving needed')
      // Pinia will automatically save the state
    },

    saveCurrentForm(): void {
      // Generate an ID if none exists (temporary client-side ID)
      if (!this.formData.id) {
        this.formData.id = 'REG-' + new Date().getTime()
        console.log(`Generated temporary client ID: ${this.formData.id}`)
      }

      // Make sure we have the current user ID
      if (!this.formData.userId || this.formData.userId.trim() === '') {
        const storeUserId = localStorage.getItem('userId')
        if (storeUserId && storeUserId.trim() !== '') {
          this.formData.userId = storeUserId.trim()
          console.log(`Setting userId from localStorage: "${storeUserId}"`)
        } else {
          console.warn('No userId found, cannot save form')
          return
        }
      }

      // Always generate codes for approved forms
      if (this.formData.status === 'approved') {
        // For inspection code
        if (!this.formData.inspectionCode) {
          this.formData.inspectionCode = this.generateUniqueCode('INS')
          console.log('Generated inspection code:', this.formData.inspectionCode)
        }

        // For payment code
        if (!this.formData.paymentCode) {
          this.formData.paymentCode = this.generateUniqueCode('PAY')
          console.log('Generated payment code:', this.formData.paymentCode)
        }

        // Set default appointment date and time if not already scheduled
        if (!this.formData.appointmentDate || !this.formData.appointmentTime) {
          // Set date to 7 days from now
          const appointmentDate = new Date()
          appointmentDate.setDate(appointmentDate.getDate() + 7)

          // Format the date as YYYY-MM-DD
          this.formData.appointmentDate = appointmentDate.toISOString().split('T')[0]

          // Set a default appointment time (10:00 AM)
          this.formData.appointmentTime = '10:00'

          console.log('Set default appointment date:', this.formData.appointmentDate)
          console.log('Set default appointment time:', this.formData.appointmentTime)
        }
      }

      // Find existing form index
      const existingFormIndex = this.forms.findIndex((form) => form.id === this.formData.id)

      // Create a deep copy to ensure no reference issues
      const formToSave = JSON.parse(JSON.stringify(this.formData))

      console.log('Saving form:', {
        id: formToSave.id,
        userId: formToSave.userId,
        make: formToSave.make,
        model: formToSave.model,
        status: formToSave.status,
        inspectionCode: formToSave.inspectionCode,
        paymentCode: formToSave.paymentCode,
        appointmentDate: formToSave.appointmentDate,
        appointmentTime: formToSave.appointmentTime,
      })

      // Save to forms array
      if (existingFormIndex === -1) {
        this.forms.push(formToSave)
      } else {
        this.forms[existingFormIndex] = formToSave
      }

      this.hasUnsavedChanges = false

      // Pinia will automatically persist the state
      console.log(`Form saved, store now has ${this.forms.length} forms`)
    },

    // Debug function to view forms in store
    debugForms(): void {
      console.log('--- DEBUG FORMS IN STORE ---')
      console.log('Total forms:', this.forms.length)

      const userCounts: Record<string, number> = {}
      this.forms.forEach((form) => {
        const userId = form.userId || 'unknown'
        userCounts[userId] = (userCounts[userId] || 0) + 1
      })

      console.log('Forms by user:')
      Object.entries(userCounts).forEach(([userId, count]) => {
        console.log(`User "${userId}": ${count} forms`)
      })

      // Current user's forms
      const currentUserId = localStorage.getItem('userId')
      if (currentUserId) {
        const userForms = this.forms.filter((form) => form.userId === currentUserId)
        console.log(`\nForms for current user (${currentUserId}):`, userForms.length)

        userForms.forEach((form, index) => {
          console.log(
            `[${index + 1}] ID=${form.id}, Status=${form.status}, Make=${form.make}, Model=${form.model}`,
          )
        })
      }

      console.log('--- END DEBUG ---')
    },

    loadForm(formId: string): boolean {
      // First ensure the form has appointment and codes if needed
      this.ensureFormHasAppointmentAndCodes(formId)

      // Then load it into formData
      const form = this.forms.find((f) => f.id === formId)
      if (form) {
        this.formData = { ...form }

        // Automatically move to step 4 if inspection is approved
        if (form.inspectionStatus === 'approved' && this.currentStep < 4) {
          console.log(`Form ${formId} has approved inspection - advancing to payment step`)
          this.currentStep = 4
        }

        return true
      }
      return false
    },

    // Ensure that appointment and codes are set for a given form ID
    ensureFormHasAppointmentAndCodes(formId: string): void {
      // Find the form in the store
      const formIndex = this.forms.findIndex((form) => form.id === formId)

      if (formIndex === -1) {
        console.warn(`Form with ID ${formId} not found`)
        return
      }

      const form = this.forms[formIndex]
      let updated = false

      // Check if form needs appointment details
      if (form.status === 'approved' && (!form.appointmentDate || !form.appointmentTime)) {
        // Set date to 7 days from now
        const appointmentDate = new Date()
        appointmentDate.setDate(appointmentDate.getDate() + 7)

        // Format the date as YYYY-MM-DD
        form.appointmentDate = appointmentDate.toISOString().split('T')[0]

        // Set a default appointment time (10:00 AM)
        form.appointmentTime = '10:00'

        console.log(
          `Set appointment for form ${formId}:`,
          form.appointmentDate,
          form.appointmentTime,
        )
        updated = true
      }

      // Check if form needs codes
      if (form.status === 'approved' || form.inspectionStatus === 'approved') {
        // Ensure inspection code exists
        if (!form.inspectionCode) {
          form.inspectionCode = this.generateUniqueCode('INS')
          console.log(`Generated inspection code for form ${formId}:`, form.inspectionCode)
          updated = true
        }

        // Ensure payment code exists
        if (!form.paymentCode) {
          form.paymentCode = this.generateUniqueCode('PAY')
          console.log(`Generated payment code for form ${formId}:`, form.paymentCode)
          updated = true
        }
      }

      // Update the form in the store if changes were made
      if (updated) {
        console.log(`Updating form ${formId} with appointment and codes`)
        this.forms[formIndex] = { ...form }
      }
    },

    // Transfer completed registration to vehicle registration store
    transferToVehicleRegistration(formId: string): boolean {
      const formIndex = this.forms.findIndex((form) => form.id === formId)
      if (formIndex === -1) {
        console.error(`Form ${formId} not found for transfer`)
        return false
      }

      try {
        // Get form data
        const form = this.forms[formIndex]
        
        // Only transfer if all required steps are completed
        if (form.status !== 'approved' && form.status !== 'payment_completed' && form.status !== 'completed') {
          console.warn(`Form ${formId} status is not approved, payment_completed, or completed. Current status: ${form.status}`)
          console.log('All statuses must be approved before transferring to vehicle registration')
          return false
        }

        // Use the registration store to access the vehicle registration API
        const vehicleStore = useVehicleRegistrationStore()
        
        // Create a vehicle record from the form data
        const vehicleData = {
          make: form.make,
          model: form.model,
          year: parseInt(form.year),
          engineNumber: form.engineNumber,
          chassisNumber: form.chassisNumber,
          color: form.color,
          type: form.vehicleType,
          userId: form.userId,
          plateNumber: form.plateNumber || '',
          status: 'Active',
        }
        
        // Send API request to create vehicle and store the response
        vehicleRegistrationService.createVehicle(vehicleData)
          .then(async (newVehicle) => {
            if (!newVehicle) {
              console.error('Failed to create vehicle record from registration form')
              return false
            }
            
            console.log('Vehicle created successfully:', newVehicle)
            
            // Update form with vehicle ID - handle string or number using type assertion
            const vehicleId = ((newVehicle as any).id || (newVehicle as any).vehicleId || '').toString()
            form.vehicleId = vehicleId || ''
            
            // If plate number exists, create plate record
            if (form.plateNumber) {
              const plateData = {
                vehicleId: parseInt(vehicleId) || 0, // Convert to number for API
                plateNumber: form.plateNumber,
                plateType: form.plateType || 'Private',
                issueDate: form.plateIssueDate || new Date().toISOString().split('T')[0],
                expirationDate: form.plateExpirationDate || '',
                region: form.plateRegion || 'NCR',
                status: 'Active'
              }
              
              const newPlate = await vehicleRegistrationService.createPlate(vehicleId, plateData)
              if (newPlate) {
                console.log('Plate created successfully:', newPlate)
                // Store plate ID as string with default empty string
                form.plateId = ((newPlate as any).id || (newPlate as any).plateId || '').toString()
              }
            }
            
            // Update registration in backend
            await vehicleRegistrationService.updateRegistrationForm(form.id, form)
            
            // Update form status to 'completed' if it's not already
            if (form.status !== 'completed') {
              form.status = 'completed'
              this.saveCurrentForm()
            }
            
            // Refresh vehicle list in store
            vehicleStore.fetchVehicles()
            
            return true
          })
          .catch((error) => {
            console.error('Error transferring registration to vehicle:', error)
            return false
          })
        
        // Return true to indicate success
        return true
      } catch (error) {
        console.error('Error in transferToVehicleRegistration:', error)
        return false
      }
    },
  },
})
