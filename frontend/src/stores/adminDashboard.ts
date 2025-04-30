import { defineStore } from 'pinia'
import adminService from '@/services/adminService'
import type { Vehicle, Plate, Registration } from '@/types/vehicle'
import { useUserStore } from '@/stores/user'

export interface AdminDashboardState {
  vehicles: Vehicle[]
  plates: Plate[]
  registrations: Registration[]
  loading: boolean
  error: string | null
}

export const useAdminDashboardStore = defineStore('adminDashboard', {
  state: (): AdminDashboardState => ({
    vehicles: [],
    plates: [],
    registrations: [],
    loading: false,
    error: null
  }),

  getters: {
    // Get plate by vehicle ID
    getPlateByVehicleId: (state) => (vehicleId: string): Plate | undefined => {
      return state.plates.find((p) => p.vehicle_id === vehicleId)
    },

    // Get vehicles with owner information
    vehiclesWithOwnerInfo(state): (Vehicle & { owner: string; plateDetails: Plate | null })[] {
      const userStore = useUserStore()
      return state.vehicles.map((vehicle) => {
        const owner = userStore.users.find((user) => user.ltoClientId === vehicle.LTO_CLIENT_ID)
        const plate = state.plates.find((p) => p.vehicle_id === vehicle.VEHICLE_ID)
        return {
          ...vehicle,
          owner: owner ? `${owner.firstName} ${owner.lastName}` : 'Unknown',
          plateDetails: plate || null,
        }
      })
    },

    // Get plates with vehicle information
    platesWithVehicleInfo: (state) => {
      return state.plates.map((plate) => {
        const vehicle = state.vehicles.find((v) => v.VEHICLE_ID === plate.vehicle_id) as Vehicle | undefined
        return {
          ...plate,
          vehicle: vehicle ? `${vehicle.VEHICLE_MAKE} ${vehicle.VEHICLE_SERIES}` : 'Unknown',
          vehicleMake: vehicle?.VEHICLE_MAKE || '',
          vehicleModel: vehicle?.VEHICLE_SERIES || '',
          vehicleYear: vehicle?.YEAR_MODEL || '',
          vehicleColor: vehicle?.COLOR || '',
        }
      })
    },

    // Get incomplete registrations (those that need admin attention)
    incompleteRegistrations(state): Registration[] {
      return state.registrations.filter(reg =>
        reg.Status !== 'completed' &&
        reg.Status !== 'payment_completed' &&
        reg.Status !== 'verified'
      );
    },

    // Get vehicles with incomplete data that need admin attention
    incompleteVehicles(state): Vehicle[] {
      return state.vehicles.filter(vehicle => {
        // Check for missing required fields that admin needs to fill
        return !vehicle.OR_NUMBER ||
               !vehicle.DENOMINATION ||
               !vehicle.LTO_OFFICE_CODE ||
               !vehicle.CLASSIFICATION ||
               !vehicle.FIRST_REGISTRATION_DATE ||
               !vehicle.REGISTRATION_EXPIRY_DATE
      })
    },

    // Get registrations that need vehicle data completion
    registrationsNeedingCompletion(state): Registration[] {
      return state.registrations.filter(reg => {
        const vehicle = state.vehicles.find(v => v.VEHICLE_ID === reg.VehicleID)
        return vehicle && this.isVehicleIncomplete(vehicle)
      })
    },

    // Check if vehicle data is incomplete
    isVehicleIncomplete: (state) => (vehicle: Vehicle): boolean => {
      const requiredFields = [
        'OR_NUMBER',
        'DENOMINATION',
        'LTO_OFFICE_CODE',
        'CLASSIFICATION',
        'FIRST_REGISTRATION_DATE',
        'REGISTRATION_EXPIRY_DATE'
      ]

      return requiredFields.some(field => !vehicle[field as keyof Vehicle])
    },

    // Get registrations with vehicle and plate information
    registrationsWithDetails: (state) => {
      const getPlateByVehicleId = (vehicleId: string): Plate | undefined => {
        return state.plates.find((p) => p.vehicle_id === vehicleId)
      }

      return state.registrations.map((registration) => {
        const vehicle = state.vehicles.find((v) => v.VEHICLE_ID === registration.VehicleID) as Vehicle | undefined
        if (!vehicle) {
          return {
            ...registration,
            vehicleInfo: 'Unknown Vehicle',
            plateNumber: 'No Plate',
          }
        }

        const plate = getPlateByVehicleId(vehicle.VEHICLE_ID)
        return {
          ...registration,
          vehicleInfo: `${vehicle.VEHICLE_MAKE} ${vehicle.VEHICLE_SERIES}`,
          plateNumber: plate?.plate_number || 'No Plate',
        }
      })
    },

    // Get registration by ID
    getRegistrationById: (state) => (registrationId: string) => {
      return state.registrations.find(reg => reg.RegistrationFormID === registrationId)
    },

    // Get registration by vehicle ID
    getRegistrationByVehicleId: (state) => (vehicleId: string) => {
      return state.registrations.find(reg => reg.VehicleID === vehicleId)
    },

    // Get all plates
    getAllPlates: (state) => {
      return state.plates
    },

    // Get active registrations
    activeRegistrations: (state): Registration[] => {
      return state.registrations.filter((reg) => reg.Status === 'Approved')
    },

    // Get pending registrations
    pendingRegistrations: (state): Registration[] => {
      return state.registrations.filter((reg) => reg.Status === 'Pending')
    },

    // Get expired registrations (where expiryDate is before today)
    expiredRegistrations: (state): Registration[] => {
      const today = new Date()
      return state.registrations.filter((reg) => {
        const expiryDate = new Date(reg.SubmittedDate)
        return expiryDate < today
      })
    },

    // Get soon to expire registrations (within 30 days)
    soonToExpireRegistrations: (state): Registration[] => {
      const today = new Date()
      const thirtyDaysFromNow = new Date()
      thirtyDaysFromNow.setDate(today.getDate() + 30)

      return state.registrations.filter((reg) => {
        const expiryDate = new Date(reg.SubmittedDate)
        return expiryDate >= today && expiryDate <= thirtyDaysFromNow
      })
    },

    // Get completed registrations
    getCompletedRegistrations: (state) => {
      return state.registrations.filter(reg => reg.Status === 'completed')
    },

    // Get verified registrations
    getVerifiedRegistrations: (state) => {
      return state.registrations.filter(reg => reg.Status === 'verified')
    },

    // Get payment completed registrations
    getPaymentCompletedRegistrations: (state) => {
      return state.registrations.filter(reg => reg.Status === 'payment_completed')
    }
  },

  actions: {
    // Fetch all vehicles for admin
    async fetchAllVehicles() {
      this.loading = true
      this.error = null

      try {
        const vehicles = await adminService.getAllVehicles()
        this.vehicles = vehicles
        console.log(`Admin: loaded ${this.vehicles.length} vehicles`)
      } catch (error: any) {
        console.error('Error fetching vehicles:', error)
        this.error = error.message || 'Failed to fetch vehicles'
        this.vehicles = []
      } finally {
        this.loading = false
      }
    },

    // Fetch a single vehicle by ID
    async fetchVehicleById(vehicleId: string) {
      this.loading = true
      this.error = null

      try {
        const vehicle = await adminService.getVehicleById(vehicleId)
        if (vehicle) {
          // Update the vehicle in the state if it exists
          const index = this.vehicles.findIndex(v => v.VEHICLE_ID === vehicle.VEHICLE_ID)
          if (index !== -1) {
            this.vehicles[index] = vehicle
          } else {
            this.vehicles.push(vehicle)
          }
        }
        return vehicle
      } catch (error: any) {
        console.error(`Error fetching vehicle ${vehicleId}:`, error)
        this.error = error.message || `Failed to fetch vehicle ${vehicleId}`
        return null
      } finally {
        this.loading = false
      }
    },

    // Update vehicle
    async updateVehicle(vehicleId: string, vehicleData: Partial<Vehicle>) {
      const updatedVehicle = await adminService.updateVehicle(vehicleId, vehicleData)
      if (updatedVehicle) {
        const index = this.vehicles.findIndex(v => v.VEHICLE_ID === updatedVehicle.VEHICLE_ID)
        if (index !== -1) {
          this.vehicles[index] = updatedVehicle
        }
      }
      return updatedVehicle
    },

    // Delete vehicle
    async deleteVehicle(vehicleId: string) {
      const success = await adminService.deleteVehicle(vehicleId)
      if (success) {
        this.vehicles = this.vehicles.filter(v => v.VEHICLE_ID !== vehicleId)
      }
      return success
    },

    // Fetch plates from backend
    async fetchPlates() {
      this.loading = true
      this.error = null

      try {
        if (useUserStore().isAdmin) {
          // Admin fetches all plates
          const plates = await adminService.getAllPlates()
          this.plates = plates || []
          console.log(`Admin: loaded ${this.plates.length} plates`)
        } else if (this.vehicles.length > 0) {
          // Regular user: fetch plates for each of their vehicles
          const plates: Plate[] = []

          // Try to fetch plates for each vehicle
          for (const vehicle of this.vehicles) {
            try {
              const vehiclePlates = await adminService.getPlatesByVehicleId(vehicle.VEHICLE_ID)
              if (vehiclePlates && vehiclePlates.length > 0) {
                plates.push(...vehiclePlates)
              }
            } catch (err) {
              console.warn(`Couldn't fetch plates for vehicle ${vehicle.VEHICLE_ID}:`, err)
            }
          }

          this.plates = plates
          console.log(`User: loaded ${this.plates.length} plates`)
        } else {
          console.warn('No vehicles found to fetch plates for')
          this.plates = []
        }
      } catch (error: any) {
        console.error('Error fetching plates:', error)
        this.error = error.message || 'Failed to fetch plates'
        this.plates = []
      } finally {
        this.loading = false
      }
    },

    // Update a plate
    async updatePlate(vehicleId: string, plateId: string, plateData: Partial<Plate>) {
      this.loading = true
      this.error = null

      try {
        const updatedPlate = await adminService.updatePlate(vehicleId, plateId, plateData)
        if (updatedPlate) {
          const index = this.plates.findIndex(p => p.plate_id === plateId)
          if (index !== -1) {
            this.plates[index] = updatedPlate
          }
        }
        return updatedPlate
      } catch (error: any) {
        console.error(`Error updating plate ${plateId}:`, error)
        this.error = error.message || `Failed to update plate ${plateId}`
        return null
      } finally {
        this.loading = false
      }
    },

    // Fetch all registrations
    async fetchAllRegistrations() {
      this.loading = true
      this.error = null

      try {
        const registrations = await adminService.getAllRegistrations()
        this.registrations = registrations
      } catch (error: any) {
        console.error('Error fetching registrations:', error)
        this.error = error.message || 'Failed to fetch registrations'
        this.registrations = []
      } finally {
        this.loading = false
      }
    },

    // Get registration by ID
    async fetchRegistrationById(registrationId: string, full = false) {
      this.loading = true
      this.error = null

      try {
        const registration = full
          ? await adminService.getFullRegistrationById(registrationId)
          : await adminService.getRegistrationById(registrationId)

        if (registration) {
          // Update the registration in the state if it exists
          const index = this.registrations.findIndex(r => r.RegistrationFormID === registration.RegistrationFormID)
          if (index !== -1) {
            this.registrations[index] = registration
          } else {
            this.registrations.push(registration)
          }
        }
        return registration
      } catch (error: any) {
        console.error(`Error fetching registration ${registrationId}:`, error)
        this.error = error.message || `Failed to fetch registration ${registrationId}`
        return null
      } finally {
        this.loading = false
      }
    },

    // Update registration status
    async updateRegistration(registrationId: string, status: string) {
      try {
        const updatedRegistration = await adminService.updateRegistration(registrationId, { Status: status })
        const index = this.registrations.findIndex(reg => reg.RegistrationFormID === registrationId)
        if (index !== -1) {
          this.registrations[index] = updatedRegistration
        }
      } catch (error) {
        console.error('Error updating registration:', error)
        throw error
      }
    },

    // Create and update inspections
    async createInspection(registrationId: string, inspectionData: any) {
      this.loading = true
      this.error = null

      try {
        const inspection = await adminService.createInspection(registrationId, inspectionData)
        // After creating an inspection, refresh the registration data
        if (inspection) {
          await this.fetchRegistrationById(registrationId, true)
        }
        return inspection
      } catch (error: any) {
        console.error(`Error creating inspection for registration ${registrationId}:`, error)
        this.error = error.message || `Failed to create inspection for registration ${registrationId}`
        return null
      } finally {
        this.loading = false
      }
    },

    async updateInspection(registrationId: string, inspectionId: string, inspectionData: any) {
      this.loading = true
      this.error = null

      try {
        const inspection = await adminService.updateInspection(registrationId, inspectionId, inspectionData)
        // After updating an inspection, refresh the registration data
        if (inspection) {
          await this.fetchRegistrationById(registrationId, true)
        }
        return inspection
      } catch (error: any) {
        console.error(`Error updating inspection ${inspectionId}:`, error)
        this.error = error.message || `Failed to update inspection ${inspectionId}`
        return null
      } finally {
        this.loading = false
      }
    },

    // Create and update payments
    async createPayment(registrationId: string, paymentData: any) {
      this.loading = true
      this.error = null

      try {
        const payment = await adminService.createPayment(registrationId, paymentData)
        // After creating a payment, refresh the registration data
        if (payment) {
          await this.fetchRegistrationById(registrationId, true)
        }
        return payment
      } catch (error: any) {
        console.error(`Error creating payment for registration ${registrationId}:`, error)
        this.error = error.message || `Failed to create payment for registration ${registrationId}`
        return null
      } finally {
        this.loading = false
      }
    },

    async updatePayment(registrationId: string, paymentId: string, paymentData: any) {
      try {
        const updatedPayment = await adminService.updatePayment(registrationId, paymentId, paymentData)
        return updatedPayment
      } catch (error: any) {
        console.error(`Error updating payment ${paymentId}:`, error)
        this.error = error.message || `Failed to update payment ${paymentId}`
        return null
      }
    },

    // Fetch all data at once
    async fetchAllData() {
      this.loading = true
      this.error = null

      try {
        await Promise.all([
          this.fetchAllVehicles(),
          this.fetchPlates(),
          this.fetchAllRegistrations()
        ])

        // Log incomplete registrations count
        const incompleteCount = this.incompleteVehicles.length
        console.log(`Admin: loaded ${incompleteCount} incomplete vehicle registrations`)

      } catch (error: any) {
        console.error('Error fetching admin dashboard data:', error)
        this.error = error.message || 'Failed to fetch data'
      } finally {
        this.loading = false
      }
    }
  }
})
