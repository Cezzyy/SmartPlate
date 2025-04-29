import { defineStore } from 'pinia'
import { useUserStore } from './user'
import type { Vehicle, Plate, Registration, VehicleRegistrationState } from '@/types/vehicle'
import * as vehicleRegistrationService from '@/services/vehicleRegistrationService'

export interface VehicleRegistrationStoreState extends VehicleRegistrationState {
  registrations: Registration[]
  loading: boolean
  error: string | null
}

export const useVehicleRegistrationStore = defineStore('vehicleRegistration', {
  state: (): VehicleRegistrationStoreState => ({
    vehicles: [],
    plates: [],
    registrations: [],
    loading: false,
    error: null,
  }),

  // Getters
  getters: {
    // Get vehicles for the current user
    userVehicles(state): Vehicle[] {
      const userStore = useUserStore()
      
      if (!userStore.currentUser) return []
      
      return state.vehicles.filter(
        (vehicle) => vehicle.ownerId === userStore.currentUser?.ltoClientId,
      )
    },

    // Get plates for the current user's vehicles
    userPlates(state): Plate[] {
      const userStore = useUserStore()
      
      if (!userStore.currentUser) return []
      
      // Get vehicles owned by the current user
      const userVehicleIds = this.userVehicles.map((vehicle) => vehicle.id)
      
      // Filter plates that belong to the user's vehicles
      return state.plates.filter((plate) => userVehicleIds.includes(plate.vehicleId))
    },

    // Get registrations for the current user's vehicles
    userRegistrations(state): Registration[] {
      const userStore = useUserStore()
      
      if (!userStore.currentUser) return []
      
      // Get vehicles owned by the current user
      const userVehicleIds = this.userVehicles.map((vehicle) => vehicle.id)
      
      // Filter registrations that belong to the user's vehicles
      return state.registrations.filter((registration) =>
        userVehicleIds.includes(registration.vehicleId),
      )
    },

    getVehicleById:
      (state) =>
      async (id: number): Promise<Vehicle | null> => {
        try {
          // First check if we already have it in state
          const cachedVehicle = state.vehicles.find((v) => v.id === id)
          if (cachedVehicle) return cachedVehicle
          
          // If not, fetch it from the backend
          const vehicle = await vehicleRegistrationService.getVehicleById(id.toString())
          return vehicle
        } catch (error) {
          console.error(`Error fetching vehicle ${id}:`, error)
          return null
        }
      },

    getPlateById:
      (state) =>
      async (id: number): Promise<Plate | null> => {
        try {
          // First check if we already have it in state
          const cachedPlate = state.plates.find((p) => p.plateId === id)
          if (cachedPlate) return cachedPlate
          
          // If not, this is trickier since we need the vehicle ID
          // We could implement a different backend endpoint for this
          // For now, return null if not found in cache
          return null
        } catch (error) {
          console.error(`Error fetching plate ${id}:`, error)
          return null
        }
      },

    getRegistrationById:
      () =>
      async (id: number): Promise<any | null> => {
        try {
          // For registrations, we want the full details including related data
          const registration = await vehicleRegistrationService.getFullRegistrationById(id.toString())
          return registration
        } catch (error) {
          console.error(`Error fetching registration ${id}:`, error)
          return null
        }
      },

    getPlateByVehicleId:
      (state) =>
      (vehicleId: number): Plate | undefined => {
        return state.plates.find((plate) => plate.vehicleId === vehicleId)
      },

    getRegistrationByVehicleId:
      (state) =>
      (vehicleId: number): Registration | undefined => {
        return state.registrations.find((registration) => registration.vehicleId === vehicleId)
      },

    vehiclesWithOwnerInfo(state): (Vehicle & { owner: string; plateDetails: Plate | null })[] {
      const userStore = useUserStore()
      return state.vehicles.map((vehicle) => {
        const owner = userStore.users.find((user) => user.ltoClientId === vehicle.ownerId)

        // Get the plate for this vehicle
        const plate = state.plates.find((p) => p.vehicleId === vehicle.id)

        return {
          ...vehicle,
          owner: owner ? `${owner.firstName} ${owner.lastName}` : 'Unknown',
          plateDetails: plate || null,
        }
      }) as (Vehicle & { owner: string; plateDetails: Plate | null })[]
    },

    // Get plates with vehicle information
    platesWithVehicleInfo: (
      state,
    ): (Plate & {
      vehicle: string
      vehicleMake: string
      vehicleModel: string
      vehicleYear: number | string
      vehicleColor: string
    })[] => {
      return state.plates.map((plate) => {
        const vehicle = state.vehicles.find((v) => v.id === plate.vehicleId)
        return {
          ...plate,
          vehicle: vehicle
            ? `${vehicle.vehicleMake} ${vehicle.vehicleSeries} ${vehicle.yearModel}`
            : 'N/A',
          vehicleMake: vehicle?.vehicleMake || '',
          vehicleModel: vehicle?.vehicleSeries || '',
          vehicleYear: vehicle?.yearModel || '',
          vehicleColor: vehicle?.color || '',
        }
      }) as (Plate & {
        vehicle: string
        vehicleMake: string
        vehicleModel: string
        vehicleYear: number | string
        vehicleColor: string
      })[]
    },

    // Get registrations with vehicle and plate information
    registrationsWithDetails: (
      state,
    ): (Registration & { vehicleInfo: string; plateNumber: string })[] => {
      return state.registrations.map((registration) => {
        const vehicle = state.vehicles.find((v) => v.id === registration.vehicleId)
        const plate = state.plates.find((p) => p.vehicleId === registration.vehicleId)

        return {
          ...registration,
          vehicleInfo: vehicle
            ? `${vehicle.vehicleMake} ${vehicle.vehicleSeries} ${vehicle.yearModel}`
            : 'No vehicle information',
          plateNumber: plate?.plate_number || 'No plate assigned',
        }
      }) as (Registration & { vehicleInfo: string; plateNumber: string })[]
    },

    // Get active registrations
    activeRegistrations: (state): Registration[] => {
      return state.registrations.filter((reg) => reg.status === 'Approved')
    },

    // Get pending registrations
    pendingRegistrations: (state): Registration[] => {
      return state.registrations.filter((reg) => reg.status === 'Pending')
    },

    // Get expired registrations (where expiryDate is before today)
    expiredRegistrations: (state): Registration[] => {
      const today = new Date()
      return state.registrations.filter((reg) => {
        const expiryDate = new Date(reg.expiryDate)
        return expiryDate < today
      })
    },

    // Get soon to expire registrations (within 30 days)
    soonToExpireRegistrations: (state): Registration[] => {
      const today = new Date()
      const thirtyDaysFromNow = new Date()
      thirtyDaysFromNow.setDate(today.getDate() + 30)

      return state.registrations.filter((reg) => {
        const expiryDate = new Date(reg.expiryDate)
        return expiryDate >= today && expiryDate <= thirtyDaysFromNow
      })
    },
  },

  // Actions
  actions: {
    // Fetch vehicles from backend
    async fetchVehicles() {
      this.loading = true
      this.error = null
      
      try {
        const userStore = useUserStore();
        const userId = userStore.currentUser?.ltoClientId;
        
        if (userStore.isAdmin) {
          // Admin fetches all vehicles
          const vehicles = await vehicleRegistrationService.getAllVehicles()
          this.vehicles = vehicles || []
          console.log(`Admin: loaded ${this.vehicles.length} vehicles`)
        } else if (userId) {
          // User fetches only their vehicles
          console.log(`Fetching vehicles for user ID: ${userId}`)
          const vehicles = await vehicleRegistrationService.getVehiclesByUserId(userId)
          this.vehicles = vehicles || []
          console.log(`User: loaded ${this.vehicles.length} vehicles`)
        } else {
          console.warn('No client ID found for current user')
          this.vehicles = []
        }
      } catch (error: any) {
        console.error('Error fetching vehicles:', error)
        this.error = error.message || 'Failed to fetch vehicles'
        this.vehicles = []
      } finally {
        this.loading = false
      }
    },

    // Fetch plates from backend
    async fetchPlates() {
      this.loading = true
      this.error = null
      
      try {
        if (useUserStore().isAdmin) {
          // Admin fetches all plates
          const plates = await vehicleRegistrationService.getAllPlates()
          this.plates = plates || []
          console.log(`Admin: loaded ${this.plates.length} plates`)
        } else if (this.vehicles.length > 0) {
          // Regular user: fetch plates for each of their vehicles
          const plates: Plate[] = []
          
          // Try to fetch plates for each vehicle
          for (const vehicle of this.userVehicles) {
            try {
              const vehiclePlates = await vehicleRegistrationService.getPlatesByVehicleId(vehicle.id.toString())
              if (vehiclePlates && vehiclePlates.length > 0) {
                plates.push(...vehiclePlates)
              }
            } catch (err) {
              console.warn(`Couldn't fetch plates for vehicle ${vehicle.id}:`, err)
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

    // Fetch registrations from backend
    async fetchRegistrations() {
      this.loading = true
      this.error = null
      
      try {
        if (useUserStore().isAdmin) {
          // Admin fetches all registrations
          const registrations = await vehicleRegistrationService.getAllRegistrations()
          this.registrations = registrations || []
          console.log(`Admin: loaded ${this.registrations.length} registrations`)
        } else if (useUserStore().currentUser?.ltoClientId) {
          // User fetches only their registrations
          const userId = useUserStore().currentUser?.ltoClientId
          if (userId) {
            const registrations = await vehicleRegistrationService.getRegistrationsByUserId(userId)
            this.registrations = registrations || []
            console.log(`User: loaded ${this.registrations.length} registrations`)
          } else {
            console.warn('No client ID found for current user')
            this.registrations = []
          }
        }
      } catch (error: any) {
        console.error('Error fetching registrations:', error)
        this.error = error.message || 'Failed to fetch registrations'
        this.registrations = []
      } finally {
        this.loading = false
      }
    },

    // Fetch all data at once (useful for initial load)
    async fetchAllData() {
      this.loading = true
      this.error = null
      
      try {
        // Fetch vehicles first, then plates and registrations
        await this.fetchVehicles()
        
        // Attempt to fetch plates and registrations even if we don't have vehicles
        // as the API might still return data
        await Promise.all([
          this.fetchPlates(),
          this.fetchRegistrations()
        ])
      } catch (error: any) {
        console.error('Error fetching all data:', error)
        this.error = error.message || 'Failed to fetch data'
      } finally {
        this.loading = false
      }
    },

    // Calculate days remaining until expiry for a registration or plate
    getDaysRemaining(expiryDateStr: string): number {
      const today = new Date()
      const expiryDate = new Date(expiryDateStr)
      const diffTime: number = expiryDate.getTime() - today.getTime()
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      return diffDays
    },

    // Get expiry status (Expired, Expiring Soon, Valid)
    getExpiryStatus(expiryDateStr: string): 'Expired' | 'Expiring Soon' | 'Valid' {
      const daysRemaining = this.getDaysRemaining(expiryDateStr)

      if (daysRemaining < 0) return 'Expired'
      if (daysRemaining < 30) return 'Expiring Soon'
      return 'Valid'
    },
  },
})
