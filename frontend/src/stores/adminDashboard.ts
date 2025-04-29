import { defineStore } from 'pinia'
import adminService from '@/services/adminService'
import type { Vehicle, Plate } from '@/types/vehicle'

export interface AdminDashboardState {
  vehicles: Vehicle[]
  plates: Plate[]
  registrations: any[]
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
    // Get plates with their associated vehicle information
    platesWithVehicleInfo: (state) => {
      return state.plates.map(plate => {
        const vehicle = state.vehicles.find(v => v.id === Number(plate.vehicleId))
        return {
          ...plate,
          vehicleMake: vehicle?.vehicleMake || '',
          vehicleModel: vehicle?.vehicleSeries || '',
          vehicleYear: vehicle?.yearModel || '',
          vehicleColor: vehicle?.color || ''
        }
      })
    },

    // Get registrations with vehicle information
    registrationsWithVehicleInfo: (state) => {
      return state.registrations.map(registration => {
        const vehicle = state.vehicles.find(v => v.id === Number(registration.vehicleId))
        return {
          ...registration,
          vehicleMake: vehicle?.vehicleMake || '',
          vehicleModel: vehicle?.vehicleSeries || '',
          vehicleYear: vehicle?.yearModel || '',
          vehicleColor: vehicle?.color || ''
        }
      })
    },

    // Get registration by vehicle ID
    getRegistrationByVehicleId: (state) => (vehicleId: number) => {
      return state.registrations.find(reg => Number(reg.vehicleId) === vehicleId)
    },

    // Filter registrations by status
    pendingRegistrations: (state) => {
      return state.registrations.filter(reg => reg.status === 'pending')
    },

    approvedRegistrations: (state) => {
      return state.registrations.filter(reg => reg.status === 'approved')
    },

    rejectedRegistrations: (state) => {
      return state.registrations.filter(reg => reg.status === 'rejected')
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
          const index = this.vehicles.findIndex(v => v.id === Number(vehicle.id))
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

    // Update a vehicle
    async updateVehicle(vehicleId: string, vehicleData: Partial<Vehicle>) {
      this.loading = true
      this.error = null
      
      try {
        const updatedVehicle = await adminService.updateVehicle(vehicleId, vehicleData)
        if (updatedVehicle) {
          const index = this.vehicles.findIndex(v => v.id === Number(updatedVehicle.id))
          if (index !== -1) {
            this.vehicles[index] = updatedVehicle
          }
        }
        return updatedVehicle
      } catch (error: any) {
        console.error(`Error updating vehicle ${vehicleId}:`, error)
        this.error = error.message || `Failed to update vehicle ${vehicleId}`
        return null
      } finally {
        this.loading = false
      }
    },

    // Delete a vehicle
    async deleteVehicle(vehicleId: string) {
      this.loading = true
      this.error = null
      
      try {
        const success = await adminService.deleteVehicle(vehicleId)
        if (success) {
          this.vehicles = this.vehicles.filter(v => v.id !== Number(vehicleId))
        }
        return success
      } catch (error: any) {
        console.error(`Error deleting vehicle ${vehicleId}:`, error)
        this.error = error.message || `Failed to delete vehicle ${vehicleId}`
        return false
      } finally {
        this.loading = false
      }
    },

    // Fetch all plates (by getting plates for each vehicle)
    async fetchAllPlates() {
      this.loading = true
      this.error = null
      
      try {
        // Make sure we have vehicles first
        if (this.vehicles.length === 0) {
          await this.fetchAllVehicles()
        }
        
        // Fetch plates for each vehicle
        const allPlates: Plate[] = []
        for (const vehicle of this.vehicles) {
          const plates = await adminService.getPlatesByVehicleId(vehicle.id.toString())
          allPlates.push(...plates)
        }
        
        this.plates = allPlates
        console.log(`Admin: loaded ${this.plates.length} plates`)
        return this.plates
      } catch (error: any) {
        console.error('Error fetching all plates:', error)
        this.error = error.message || 'Failed to fetch plates'
        return []
      } finally {
        this.loading = false
      }
    },

    // Fetch plates for a specific vehicle
    async fetchPlatesByVehicleId(vehicleId: string) {
      this.loading = true
      this.error = null
      
      try {
        const plates = await adminService.getPlatesByVehicleId(vehicleId)
        
        // Update only the plates for this vehicle, keeping others
        this.plates = [
          ...this.plates.filter(p => Number(p.vehicleId) !== Number(vehicleId)),
          ...plates
        ]
        
        return plates
      } catch (error: any) {
        console.error(`Error fetching plates for vehicle ${vehicleId}:`, error)
        this.error = error.message || `Failed to fetch plates for vehicle ${vehicleId}`
        return []
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
          const index = this.plates.findIndex(p => p.plateId === Number(plateId))
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
        console.log(`Admin: loaded ${this.registrations.length} registrations`)
        return this.registrations
      } catch (error: any) {
        console.error('Error fetching registrations:', error)
        this.error = error.message || 'Failed to fetch registrations'
        return []
      } finally {
        this.loading = false
      }
    },

    // Fetch registration by ID with full details
    async fetchRegistrationById(registrationId: string, full = false) {
      this.loading = true
      this.error = null
      
      try {
        const registration = full
          ? await adminService.getFullRegistrationById(registrationId)
          : await adminService.getRegistrationById(registrationId)
          
        if (registration) {
          // Update the registration in the state if it exists
          const index = this.registrations.findIndex(r => r.id === registration.id)
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

    // Update a registration
    async updateRegistration(registrationId: string, registrationData: any) {
      this.loading = true
      this.error = null
      
      try {
        const updatedRegistration = await adminService.updateRegistration(registrationId, registrationData)
        if (updatedRegistration) {
          const index = this.registrations.findIndex(r => r.id === registrationId)
          if (index !== -1) {
            this.registrations[index] = updatedRegistration
          }
        }
        return updatedRegistration
      } catch (error: any) {
        console.error(`Error updating registration ${registrationId}:`, error)
        this.error = error.message || `Failed to update registration ${registrationId}`
        return null
      } finally {
        this.loading = false
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
      this.loading = true
      this.error = null
      
      try {
        const payment = await adminService.updatePayment(registrationId, paymentId, paymentData)
        // After updating a payment, refresh the registration data
        if (payment) {
          await this.fetchRegistrationById(registrationId, true)
        }
        return payment
      } catch (error: any) {
        console.error(`Error updating payment ${paymentId}:`, error)
        this.error = error.message || `Failed to update payment ${paymentId}`
        return null
      } finally {
        this.loading = false
      }
    },

    // Fetch all data at once (useful for initial load)
    async fetchAllData() {
      this.loading = true
      this.error = null
      
      try {
        // Fetch vehicles first
        await this.fetchAllVehicles()
        
        // Then fetch plates and registrations in parallel
        await Promise.all([
          this.fetchAllPlates(),
          this.fetchAllRegistrations()
        ])
        
        console.log('Admin dashboard data loaded successfully')
      } catch (error: any) {
        console.error('Error fetching all admin data:', error)
        this.error = error.message || 'Failed to fetch admin dashboard data'
      } finally {
        this.loading = false
      }
    }
  }
}) 