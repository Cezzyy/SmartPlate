import { defineStore } from 'pinia'

// Create a simplified plate interface for the store
interface PlateRecord {
  plateId: number
  vehicleId: number
  plate_number: string
  plate_type: string
  plate_issue_date: string
  plate_expiration_date: string
  region: string
  status: string
}

// Validation errors interface
interface ValidationErrors {
  plateNumber?: string
  plateType?: string
  region?: string
  plateIssueDate?: string
  plateExpirationDate?: string
}

// Region mapping data
const REGION_PREFIXES: Record<string, string> = {
  NCR: 'A',
  CALABARZON: 'B',
  CENTRAL_LUZON: 'C',
  WESTERN_VISAYAS: 'D',
  CENTRAL_VISAYAS: 'E',
  EASTERN_VISAYAS: 'F',
  NORTHERN_MINDANAO: 'G',
  SOUTHERN_MINDANAO: 'H',
  CAR: 'J',
  CARAGA: 'K',
  BICOL: 'L',
  ILOCOS: 'M',
  MIMAROPA: 'N',
  SOCCSKSARGEN: 'P',
  ZAMBOANGA: 'R',
  BARMM: 'S',
}

// Region mapping data (reverse)
const REGION_MAPPING: Record<string, string> = {
  A: 'NCR',
  B: 'CALABARZON',
  C: 'CENTRAL_LUZON',
  D: 'WESTERN_VISAYAS',
  E: 'CENTRAL_VISAYAS',
  F: 'EASTERN_VISAYAS',
  G: 'NORTHERN_MINDANAO',
  H: 'SOUTHERN_MINDANAO',
  J: 'CAR',
  K: 'CARAGA',
  L: 'BICOL',
  M: 'ILOCOS',
  N: 'MIMAROPA',
  P: 'SOCCSKSARGEN',
  R: 'ZAMBOANGA',
  S: 'BARMM',
}

// Plate types mapping by vehicle type
const PLATE_TYPES_BY_VEHICLE: Record<string, string[]> = {
  '2-Wheel': ['Motorcycle', 'Tricycle'],
  Electric: ['Private', 'For Hire', 'Government', 'Diplomatic', 'Electric'],
  Hybrid: ['Private', 'For Hire', 'Government', 'Diplomatic', 'Hybrid'],
  Trailer: ['Private', 'For Hire', 'Government', 'Diplomatic', 'Trailer'],
  Vintage: ['Private', 'For Hire', 'Government', 'Diplomatic', 'Vintage'],
  default: [
    'Private',
    'For Hire',
    'Government',
    'Diplomatic',
    'Electric',
    'Hybrid',
    'Trailer',
    'Vintage',
  ],
}

interface PlateState {
  plates: PlateRecord[]
}

export const usePlateStore = defineStore('plate', {
  state: (): PlateState => ({
    plates: [],
  }),

  getters: {
    getIssuedPlates: (state) => state.plates.filter((plate) => plate.status === 'Active'),
    getPlateByVehicleId: (state) => (vehicleId: number) => {
      return state.plates.find((plate) => plate.vehicleId === vehicleId)
    },

    // Get all regions with their names for dropdown
    getRegions: () => {
      return [
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
      ]
    },

    // Get available plate types for a vehicle type
    getPlateTypesByVehicle:
      () =>
      (vehicleType: string, year?: string): string[] => {
        // For vintage vehicles (based on year)
        if (year && parseInt(year) < 1980) {
          return PLATE_TYPES_BY_VEHICLE['Vintage'] || PLATE_TYPES_BY_VEHICLE['default']
        }

        return PLATE_TYPES_BY_VEHICLE[vehicleType] || PLATE_TYPES_BY_VEHICLE['default']
      },
  },

  actions: {
    // Load plates from localStorage (initialization)
    loadPlatesFromStorage() {
      const storedPlates = localStorage.getItem('vehicle_plates')
      if (storedPlates) {
        this.plates = JSON.parse(storedPlates)
      }
    },

    // Save plates to localStorage
    savePlates() {
      localStorage.setItem('vehicle_plates', JSON.stringify(this.plates))
    },

    // Add a new plate
    issuePlate(plateData: Partial<PlateRecord>) {
      const newPlate: PlateRecord = {
        plateId: plateData.plateId || Date.now(),
        vehicleId: plateData.vehicleId || 0,
        plate_number: plateData.plate_number || '',
        plate_type: plateData.plate_type || 'Private',
        plate_issue_date: plateData.plate_issue_date || new Date().toISOString().split('T')[0],
        plate_expiration_date: plateData.plate_expiration_date || '',
        region: plateData.region || 'NCR',
        status: plateData.status || 'Active',
      }

      this.plates.push(newPlate)
      this.savePlates()
      return newPlate
    },

    // Set default plate type for vehicle
    getDefaultPlateType(vehicleType: string): string {
      if (vehicleType === '2-Wheel') {
        return 'Motorcycle'
      } else {
        return 'Private'
      }
    },

    // Generate a plate number
    generatePlateNumber(vehicleType: string, plateType = 'Private', region = 'NCR'): string {
      const regionPrefix = REGION_PREFIXES[region] || 'A' // Default to NCR if region not found

      // Letters pool (excluding I, O, Q for readability)
      const lettersPool = 'ABCDEFGHJKLMNPRSTUVWXYZ'

      // Special case for motorcycle
      if (vehicleType === '2-Wheel') {
        // Motorcycle format: L-NNN or LL-NNNNN
        const sequentialNumber = Math.floor(1000 + Math.random() * 9000) // 1000-9999
        if (Math.random() > 0.5) {
          // L-NNN format
          return `${regionPrefix}-${sequentialNumber.toString().substring(0, 3)}`
        } else {
          // LL-NNNNN format
          const secondLetter = lettersPool.charAt(Math.floor(Math.random() * lettersPool.length))
          const fiveDigitNumber = Math.floor(10000 + Math.random() * 90000) // 10000-99999
          return `${regionPrefix}${secondLetter}-${fiveDigitNumber}`
        }
      }

      // Handle different plate types for 4-wheeled vehicles
      let secondLetter = ''
      let thirdLetter = ''

      switch (plateType) {
        case 'Diplomatic':
          // Diplomatic format: DDD-NNNN (3-digit country code + 4-digit seq)
          const countryCodes = ['USA', 'JPN', 'KOR', 'CHN', 'GBR', 'AUS']
          const countryCode = countryCodes[Math.floor(Math.random() * countryCodes.length)]
          const sequentialNumber = Math.floor(1000 + Math.random() * 9000) // 1000-9999
          return `${countryCode}-${sequentialNumber}`

        case 'Government':
          // Government: fixed prefix S + two arbitrary letters
          secondLetter = 'S'
          thirdLetter = lettersPool.charAt(Math.floor(Math.random() * lettersPool.length))
          break

        case 'Electric':
          // Electric: second letter A–M, third letter V/W/X/Y/Z
          secondLetter = 'ABCDEFGHJKLM'.charAt(Math.floor(Math.random() * 12))
          thirdLetter = 'VWXYZ'.charAt(Math.floor(Math.random() * 5))
          break

        case 'Hybrid':
          // Hybrid: second letter N–Z, third letter V/W/X/Y/Z
          secondLetter = 'NPRSTUVWXYZ'.charAt(Math.floor(Math.random() * 11))
          thirdLetter = 'VWXYZ'.charAt(Math.floor(Math.random() * 5))
          break

        case 'Trailer':
          // Trailer: second letter U, third letter any A–Z
          secondLetter = 'U'
          thirdLetter = lettersPool.charAt(Math.floor(Math.random() * lettersPool.length))
          break

        case 'Vintage':
          // Vintage: suffix TX/TY/TZ after two arbitrary letters
          secondLetter = lettersPool.charAt(Math.floor(Math.random() * lettersPool.length))
          thirdLetter = ['TX', 'TY', 'TZ'][Math.floor(Math.random() * 3)]
          break

        case 'For Hire':
        case 'PublicUtility':
          // Public Utility: any A–Z but track separately
          secondLetter = lettersPool.charAt(Math.floor(Math.random() * lettersPool.length))
          thirdLetter = lettersPool.charAt(Math.floor(Math.random() * lettersPool.length))
          break

        case 'Private':
        default:
          // Private: any A–Z (except I, O, Q)
          secondLetter = lettersPool.charAt(Math.floor(Math.random() * lettersPool.length))
          thirdLetter = lettersPool.charAt(Math.floor(Math.random() * lettersPool.length))
          break
      }

      // Generate 4-digit sequential number
      const sequentialNumber = Math.floor(1000 + Math.random() * 9000) // 1000-9999

      // Special case for Vintage type
      if (plateType === 'Vintage') {
        return `${regionPrefix}${secondLetter}${thirdLetter} ${sequentialNumber}`
      }

      // Standard format: LLL NNNN
      return `${regionPrefix}${secondLetter}${thirdLetter} ${sequentialNumber}`
    },

    // Get region code from plate number
    getRegionFromPlate(plateNumber: string): string {
      if (!plateNumber.match(/^[A-Z]/)) {
        return 'NCR'
      }

      const firstLetter = plateNumber.charAt(0)
      return REGION_MAPPING[firstLetter] || 'NCR'
    },

    // Validate a plate number and related fields
    validatePlate(
      plateData: {
        plateNumber: string
        plateType: string
        region: string
        plateIssueDate: string
        plateExpirationDate: string
      },
      vehicleType: string,
    ): { isValid: boolean; errors: ValidationErrors } {
      const errors: ValidationErrors = {}
      let isValid = true

      // Validate plate number - the format depends on the selected plate type
      if (!plateData.plateNumber) {
        errors.plateNumber = 'Plate number is required'
        isValid = false
      } else if (vehicleType === '2-Wheel') {
        // Motorcycle format validation
        // Format can be X-NNN or XX-NNNNN
        if (!/^[A-Z]-\d{3}$|^[A-Z]{2}-\d{5}$/.test(plateData.plateNumber)) {
          errors.plateNumber = 'Motorcycle plate numbers must follow the format: X-NNN or XX-NNNNN'
          isValid = false
        }
      } else if (plateData.plateType === 'Diplomatic') {
        // Diplomatic format: DDD-NNNN
        if (!/^[A-Z]{3}-\d{4}$/.test(plateData.plateNumber)) {
          errors.plateNumber = 'Diplomatic plates must follow the format DDD-NNNN'
          isValid = false
        }
      } else {
        // Standard format: LLL NNNN (3 letters followed by 4 digits)
        if (!/^[A-Z]{3}\s\d{4}$/.test(plateData.plateNumber)) {
          errors.plateNumber = 'Plate numbers must follow the format LLL NNNN'
          isValid = false
        }
      }

      // Validate plate type
      if (!plateData.plateType) {
        errors.plateType = 'Plate type is required'
        isValid = false
      }

      // Validate selected region
      if (!plateData.region) {
        errors.region = 'Region is required'
        isValid = false
      }

      // Validate issue date
      if (!plateData.plateIssueDate) {
        errors.plateIssueDate = 'Issue date is required'
        isValid = false
      }

      // Validate expiration date
      if (!plateData.plateExpirationDate) {
        errors.plateExpirationDate = 'Expiration date is required'
        isValid = false
      } else {
        const issueDate = new Date(plateData.plateIssueDate)
        const expirationDate = new Date(plateData.plateExpirationDate)

        if (expirationDate <= issueDate) {
          errors.plateExpirationDate = 'Expiration date must be after issue date'
          isValid = false
        }
      }

      return { isValid, errors }
    },
  },

  persist: true,
})
