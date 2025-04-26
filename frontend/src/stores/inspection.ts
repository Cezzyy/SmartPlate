import { defineStore } from 'pinia'
import type { AdditionalVehicleData, RegistrationStatus } from '@/types/vehicleRegistration'
import { useVehicleRegistrationFormStore } from './vehicleRegistrationForm'
import { useNotificationStore } from './notification'

interface InspectionState {
  pendingInspections: string[] // IDs of forms with pending inspections
  completedInspections: string[] // IDs of forms with completed inspections
  rejectedInspections: string[] // IDs of forms with rejected inspections
  loading: boolean
  error: string | null
  // Storage for MV File Number generation
  mvFileNumbers: string[]
  conductionStickers: string[]
  // Region codes mapping for MV File Number generation
  regionCodes: Record<string, string>
}

export const useInspectionStore = defineStore('inspection', {
  state: (): InspectionState => ({
    pendingInspections: [],
    completedInspections: [],
    rejectedInspections: [],
    loading: false,
    error: null,
    mvFileNumbers: JSON.parse(localStorage.getItem('mv_file_numbers') || '[]'),
    conductionStickers: JSON.parse(localStorage.getItem('conduction_stickers') || '[]'),
    // Region codes mapping for MV File Number generation
    regionCodes: {
      NCR: '01',
      CALABARZON: '02',
      CENTRAL_LUZON: '03',
      WESTERN_VISAYAS: '04',
      CENTRAL_VISAYAS: '05',
      EASTERN_VISAYAS: '06',
      NORTHERN_MINDANAO: '07',
      SOUTHERN_MINDANAO: '08',
      CAR: '09',
      CARAGA: '10',
      BICOL: '11',
      ILOCOS: '12',
      MIMAROPA: '13',
      SOCCSKSARGEN: '14',
      ZAMBOANGA: '15',
      BARMM: '16',
    },
  }),

  getters: {
    // Get all pending inspections
    getPendingInspections() {
      const vehicleRegistrationFormStore = useVehicleRegistrationFormStore()
      return vehicleRegistrationFormStore.forms.filter(
        (form) => form.inspectionStatus === 'pending',
      )
    },

    // Get all completed inspections
    getCompletedInspections() {
      const vehicleRegistrationFormStore = useVehicleRegistrationFormStore()
      return vehicleRegistrationFormStore.forms.filter(
        (form) => form.inspectionStatus === 'approved',
      )
    },

    // Get all rejected inspections
    getRejectedInspections() {
      const vehicleRegistrationFormStore = useVehicleRegistrationFormStore()
      return vehicleRegistrationFormStore.forms.filter(
        (form) => form.inspectionStatus === 'rejected',
      )
    },

    // Get inspection by ID
    getInspectionById: () => (id: string) => {
      const vehicleRegistrationFormStore = useVehicleRegistrationFormStore()
      return vehicleRegistrationFormStore.forms.find((form) => form.id === id)
    },

    // Get regions for selection
    getRegions: () => [
      { code: 'NCR', name: 'National Capital Region' },
      { code: 'CALABARZON', name: 'CALABARZON (Region 4A)' },
      { code: 'CENTRAL_LUZON', name: 'Central Luzon (Region 3)' },
      { code: 'WESTERN_VISAYAS', name: 'Western Visayas (Region 6)' },
      { code: 'CENTRAL_VISAYAS', name: 'Central Visayas (Region 7)' },
      { code: 'EASTERN_VISAYAS', name: 'Eastern Visayas (Region 8)' },
      { code: 'NORTHERN_MINDANAO', name: 'Northern Mindanao (Region 10)' },
      { code: 'SOUTHERN_MINDANAO', name: 'Davao Region (Region 11)' },
      { code: 'CAR', name: 'Cordillera Administrative Region' },
      { code: 'CARAGA', name: 'CARAGA (Region 13)' },
      { code: 'BICOL', name: 'Bicol Region (Region 5)' },
      { code: 'ILOCOS', name: 'Ilocos Region (Region 1)' },
      { code: 'MIMAROPA', name: 'MIMAROPA (Region 4B)' },
      { code: 'SOCCSKSARGEN', name: 'SOCCSKSARGEN (Region 12)' },
      { code: 'ZAMBOANGA', name: 'Zamboanga Peninsula (Region 9)' },
      { code: 'BARMM', name: 'Bangsamoro Autonomous Region in Muslim Mindanao' },
    ],
  },

  actions: {
    // Generate MV File Number
    // Format: RR YY XXXXXX (RR: 2-digit region code, YY: last two digits of year, XXXXXX: 6-digit sequence)
    generateMVFileNumber(regionCode: string): string {
      // Get region code from the map
      const region = this.regionCodes[regionCode as keyof typeof this.regionCodes] || '01'

      // Get the last two digits of the current year
      const currentYear = new Date().getFullYear().toString().slice(-2)

      // Find the highest sequence number for this region and year
      const regionYearKey = `${region}${currentYear}`
      let highestSequence = 0

      this.mvFileNumbers.forEach((mvNumber: string) => {
        if (mvNumber.startsWith(regionYearKey)) {
          const sequence = parseInt(mvNumber.slice(4), 10)
          if (sequence > highestSequence) {
            highestSequence = sequence
          }
        }
      })

      // Increment the sequence
      const newSequence = highestSequence + 1

      // Zero-pad to 6 digits
      const sequencePadded = newSequence.toString().padStart(6, '0')

      // Construct the MV File Number
      const mvFileNumber = `${region} ${currentYear} ${sequencePadded}`

      // Store the new MV File Number
      this.mvFileNumbers.push(mvFileNumber)
      localStorage.setItem('mv_file_numbers', JSON.stringify(this.mvFileNumbers))

      return mvFileNumber
    },

    // Generate Conduction Sticker
    // Format: CS YY NNNN (CS: fixed prefix, YY: last two digits of year, NNNN: 4-digit sequence)
    generateConductionSticker(): string {
      // Get the last two digits of the current year
      const currentYear = new Date().getFullYear().toString().slice(-2)

      // Find the highest sequence number for this year
      let highestSequence = 0
      this.conductionStickers.forEach((sticker: string) => {
        if (sticker.startsWith(`CS ${currentYear}`)) {
          const sequence = parseInt(sticker.slice(5), 10)
          if (sequence > highestSequence) {
            highestSequence = sequence
          }
        }
      })

      // Increment the sequence
      const newSequence = highestSequence + 1

      // Zero-pad to 4 digits
      const sequencePadded = newSequence.toString().padStart(4, '0')

      // Construct the Conduction Sticker
      const conductionSticker = `CS ${currentYear} ${sequencePadded}`

      // Store the new Conduction Sticker
      this.conductionStickers.push(conductionSticker)
      localStorage.setItem('conduction_stickers', JSON.stringify(this.conductionStickers))

      return conductionSticker
    },

    // Generate both identifiers at once
    generateIdentifiers(regionCode: string): { mvFileNumber: string; conductionSticker: string } {
      return {
        mvFileNumber: this.generateMVFileNumber(regionCode),
        conductionSticker: this.generateConductionSticker(),
      }
    },

    // Submit inspection
    submitInspection(
      id: string,
      inspectionStatus: RegistrationStatus,
      inspectionNotes: string,
      additionalVehicleData: AdditionalVehicleData,
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

        // Update the form with inspection details
        form.inspectionStatus = inspectionStatus
        form.inspectionNotes = inspectionNotes
        form.additionalVehicleData = additionalVehicleData

        // Update the overall status if needed
        if (inspectionStatus === 'approved') {
          // If inspection approved, move to next step
          // Only update overall status if it's still pending
          if (form.status === 'pending') {
            form.status = 'approved'
          }

          // Add to completed inspections
          if (!this.completedInspections.includes(id)) {
            this.completedInspections.push(id)
          }

          // Remove from pending and rejected if present
          this.pendingInspections = this.pendingInspections.filter((pendingId) => pendingId !== id)
          this.rejectedInspections = this.rejectedInspections.filter(
            (rejectedId) => rejectedId !== id,
          )
        } else if (inspectionStatus === 'rejected') {
          // If inspection rejected, update overall status
          form.status = 'rejected'

          // Add to rejected inspections
          if (!this.rejectedInspections.includes(id)) {
            this.rejectedInspections.push(id)
          }

          // Remove from pending and completed if present
          this.pendingInspections = this.pendingInspections.filter((pendingId) => pendingId !== id)
          this.completedInspections = this.completedInspections.filter(
            (completedId) => completedId !== id,
          )
        }

        // Show notification
        if (inspectionStatus === 'approved' || inspectionStatus === 'rejected') {
          notificationStore.showVehicleInspectionNotification(inspectionStatus, {
            make: form.make,
            model: form.model,
          })
        }

        return true
      } catch (error) {
        this.error = error instanceof Error ? error.message : 'An unknown error occurred'
        return false
      } finally {
        this.loading = false
      }
    },

    // Reset inspection status
    resetInspection(id: string) {
      this.loading = true
      this.error = null

      try {
        const vehicleRegistrationFormStore = useVehicleRegistrationFormStore()

        // Find the registration form
        const form = vehicleRegistrationFormStore.forms.find((form) => form.id === id)

        if (!form) {
          throw new Error(`Registration form with ID ${id} not found`)
        }

        // Reset inspection status to pending
        form.inspectionStatus = 'pending'
        form.inspectionNotes = ''
        form.additionalVehicleData = undefined

        // Add to pending inspections
        if (!this.pendingInspections.includes(id)) {
          this.pendingInspections.push(id)
        }

        // Remove from completed and rejected if present
        this.completedInspections = this.completedInspections.filter(
          (completedId) => completedId !== id,
        )
        this.rejectedInspections = this.rejectedInspections.filter(
          (rejectedId) => rejectedId !== id,
        )

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
        this.pendingInspections = []
        this.completedInspections = []
        this.rejectedInspections = []

        // Categorize existing forms
        vehicleRegistrationFormStore.forms.forEach((form) => {
          if (form.inspectionStatus === 'pending') {
            this.pendingInspections.push(form.id)
          } else if (form.inspectionStatus === 'approved') {
            this.completedInspections.push(form.id)
          } else if (form.inspectionStatus === 'rejected') {
            this.rejectedInspections.push(form.id)
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
