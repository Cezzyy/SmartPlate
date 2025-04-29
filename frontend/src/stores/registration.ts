import { ref } from 'vue'
import { defineStore } from 'pinia'
import type { Registration } from '../types/registration'
import vehicleRegistrationService from '../services/vehicleRegistrationService'

// Extended type for API response
interface ApiRegistration {
  id: number
  vehicleId: number
  plateId: number
  registrationType: string
  submissionDate: string
  expiryDate: string
  status: string
  vehicle?: {
    vehicleMake?: string
    vehicleSeries?: string
    yearModel?: number
    color?: string
    engineNumber?: string
    chassisNumber?: string
    vehicleType?: string
    ownerName?: string
    ownerEmail?: string
    ownerPhone?: string
  }
  plate?: {
    plate_number?: string
  }
  inspectionStatus?: string
  paymentStatus?: string
  verificationStatus?: string
}

export const useRegistrationStore = defineStore('registration', () => {
  const registrations = ref<Registration[]>([])
  const loading = ref<boolean>(false)
  const error = ref<string | null>(null)

  const fetchRegistrations = async () => {
    loading.value = true
    error.value = null
    try {
      const data = await vehicleRegistrationService.getAllRegistrations() as ApiRegistration[]
      
      // Transform the data from API Response to the local Registration type
      const transformedData: Registration[] = data.map(reg => {
        // Get vehicle details if available to construct vehicleInfo
        const vehicle = reg.vehicle || {}
        const vehicleInfo = `${vehicle.vehicleMake || ''} ${vehicle.vehicleSeries || ''} ${vehicle.yearModel || ''}`.trim()
        
        return {
          id: reg.id.toString(),
          referenceCode: `REG-${reg.id}`,
          vehicleInfo: vehicleInfo || 'Unknown Vehicle',
          plateNumber: reg.plate?.plate_number || 'No Plate',
          registrationType: reg.registrationType || 'Unknown',
          submissionDate: reg.submissionDate || new Date().toISOString(),
          expiryDate: reg.expiryDate || '',
          status: reg.status || 'Pending',
          applicantName: vehicle.ownerName || 'Unknown',
          applicantEmail: vehicle.ownerEmail || '',
          applicantPhone: vehicle.ownerPhone || '',
          make: vehicle.vehicleMake || '',
          model: vehicle.vehicleSeries || '',
          year: vehicle.yearModel?.toString() || '',
          color: vehicle.color || '',
          engineNumber: vehicle.engineNumber || '',
          chassisNumber: vehicle.chassisNumber || '',
          vehicleType: vehicle.vehicleType || '',
          inspectionStatus: reg.inspectionStatus || 'Pending',
          paymentStatus: reg.paymentStatus || 'Pending',
          verificationStatus: reg.verificationStatus || 'Pending',
        }
      })
      
      registrations.value = transformedData
    } catch (err) {
      console.error('Error fetching registrations:', err)
      error.value = 'Failed to fetch registrations'
    } finally {
      loading.value = false
    }
  }

  const getRegistrationById = (id: string): Registration | undefined => {
    return registrations.value.find((registration) => registration.id === id)
  }

  const updateRegistration = async (updatedRegistration: Registration): Promise<boolean> => {
    try {
      // In a real implementation, you would call the API here
      // For now, update the local state
      const index = registrations.value.findIndex((r) => r.id === updatedRegistration.id)
      if (index !== -1) {
        registrations.value[index] = { ...updatedRegistration }
        return true
      }
      return false
    } catch (err) {
      console.error('Error updating registration:', err)
      return false
    }
  }

  // Fetch registrations when store is initialized
  // Note: This will be called when the store is first used
  fetchRegistrations()

  return {
    registrations,
    loading,
    error,
    fetchRegistrations,
    getRegistrationById,
    updateRegistration,
  }
})
