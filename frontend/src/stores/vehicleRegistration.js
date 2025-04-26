import { defineStore } from 'pinia'
import { useUserStore } from './user'

// Mock data for vehicles, plates, and registrations
const mockVehiclesData = [
  {
    id: 1,
    ownerId: 'LTO-2023-78945',
    vehicleCategory: '4 Wheels',
    mvFileNumber: 'MV-2024-10001',
    conductionSticker: 'CS-2024-001',
    vehicleMake: 'Toyota',
    vehicleSeries: 'Corolla Altis',
    vehicleType: 'Sedan',
    bodyType: 'Sedan',
    yearModel: 2022,
    engineNumber: 'ENG-2022-001',
    chassisNumber: 'CHS-2022-001',
    pistonDisplacement: 1800,
    numberOfCylinders: 4,
    fuelType: 'Gasoline',
    color: 'White',
    gvw: 1500,
    netWeight: 1200,
    shippingWeight: 1300,
    usageClassification: 'Private',
    firstRegistrationDate: '2022-01-15',
    lastRenewalDate: '2024-01-15',
    registrationExpiryDate: '2025-01-15',
    ltoOfficeCode: 'NCR-001',
    classification: 'Private',
    denomination: 'Car',
    orNumber: 'OR-2024-001',
    orDate: '2024-01-15',
  },
  {
    id: 2,
    ownerId: 'LTO-2023-78945',
    vehicleCategory: '2 Wheels',
    mvFileNumber: 'MV-2024-10002',
    conductionSticker: 'CS-2024-002',
    vehicleMake: 'Honda',
    vehicleSeries: 'CBR',
    vehicleType: 'Motorcycle',
    bodyType: 'Motorcycle',
    yearModel: 2021,
    engineNumber: 'ENG-2021-002',
    chassisNumber: 'CHS-2021-002',
    pistonDisplacement: 150,
    numberOfCylinders: 1,
    fuelType: 'Gasoline',
    color: 'Black',
    gvw: 300,
    netWeight: 250,
    shippingWeight: 270,
    usageClassification: 'Private',
    firstRegistrationDate: '2021-08-20',
    lastRenewalDate: '2024-08-20',
    registrationExpiryDate: '2025-08-20',
    ltoOfficeCode: 'NCR-002',
    classification: 'Private',
    denomination: 'Motorcycle',
    orNumber: 'OR-2024-002',
    orDate: '2024-08-20',
  },
  {
    id: 3,
    ownerId: 'LTO-2023-78945',
    vehicleCategory: '4 Wheels',
    mvFileNumber: 'MV-2025-10003',
    conductionSticker: 'CS-2025-003',
    vehicleMake: 'Ford',
    vehicleSeries: 'Mustang GT',
    vehicleType: 'Sports Car',
    bodyType: 'Coupe',
    yearModel: 2023,
    engineNumber: 'ENG-2023-003',
    chassisNumber: 'CHS-2023-003',
    pistonDisplacement: 5000,
    numberOfCylinders: 8,
    fuelType: 'Gasoline',
    color: 'Red',
    gvw: 1800,
    netWeight: 1600,
    shippingWeight: 1700,
    usageClassification: 'Private',
    firstRegistrationDate: '2023-01-05',
    lastRenewalDate: '2025-01-05',
    registrationExpiryDate: '2026-01-05',
    ltoOfficeCode: 'NCR-003',
    classification: 'Private',
    denomination: 'Car',
    orNumber: 'OR-2025-003',
    orDate: '2025-01-05',
  },
  {
    id: 4,
    ownerId: 'LTO-2023-12345',
    vehicleCategory: '4 Wheels',
    mvFileNumber: 'MV-2024-10004',
    conductionSticker: 'CS-2024-004',
    vehicleMake: 'Toyota',
    vehicleSeries: 'Vios',
    vehicleType: 'Sedan',
    bodyType: 'Sedan',
    yearModel: 2022,
    engineNumber: 'ENG-2022-004',
    chassisNumber: 'CHS-2022-004',
    pistonDisplacement: 1500,
    numberOfCylinders: 4,
    fuelType: 'Gasoline',
    color: 'Silver',
    gvw: 1400,
    netWeight: 1100,
    shippingWeight: 1200,
    usageClassification: 'Private',
    firstRegistrationDate: '2022-10-10',
    lastRenewalDate: '2024-10-10',
    registrationExpiryDate: '2025-10-10',
    ltoOfficeCode: 'NCR-004',
    classification: 'Private',
    denomination: 'Car',
    orNumber: 'OR-2024-004',
    orDate: '2024-10-10',
  },
  {
    id: 5,
    ownerId: 'LTO-2023-67890',
    vehicleCategory: '4 Wheels',
    mvFileNumber: 'MV-2024-10005',
    conductionSticker: 'CS-2024-005',
    vehicleMake: 'Mitsubishi',
    vehicleSeries: 'Montero Sport',
    vehicleType: 'SUV',
    bodyType: 'SUV',
    yearModel: 2023,
    engineNumber: 'ENG-2023-005',
    chassisNumber: 'CHS-2023-005',
    pistonDisplacement: 2400,
    numberOfCylinders: 4,
    fuelType: 'Diesel',
    color: 'Black',
    gvw: 2200,
    netWeight: 1900,
    shippingWeight: 2000,
    usageClassification: 'Private',
    firstRegistrationDate: '2023-09-15',
    lastRenewalDate: '2024-09-15',
    registrationExpiryDate: '2025-09-15',
    ltoOfficeCode: 'NCR-005',
    classification: 'Private',
    denomination: 'SUV',
    orNumber: 'OR-2024-005',
    orDate: '2024-09-15',
  },
]

const mockPlatesData = [
  {
    plateId: 1,
    vehicleId: 1,
    plate_number: 'ABC-123',
    plate_type: 'Regular',
    plate_issue_date: '2024-10-15',
    plate_expiration_date: '2025-10-15',
    status: 'Active',
  },
  {
    plateId: 2,
    vehicleId: 2,
    plate_number: 'XYZ-789',
    plate_type: 'Temporary',
    plate_issue_date: '2024-08-20',
    plate_expiration_date: '2025-08-20',
    status: 'Active',
  },
  {
    plateId: 3,
    vehicleId: 3,
    plate_number: 'DEF-456',
    plate_type: 'Improvised',
    plate_issue_date: '2025-01-05',
    plate_expiration_date: '2026-01-05',
    status: 'Pending',
  },
  {
    plateId: 4,
    vehicleId: 4,
    plate_number: 'GHI-789',
    plate_type: 'Regular',
    plate_issue_date: '2024-10-10',
    plate_expiration_date: '2025-10-10',
    status: 'Active',
  },
  {
    plateId: 5,
    vehicleId: 5,
    plate_number: 'JKL-012',
    plate_type: 'Regular',
    plate_issue_date: '2024-09-15',
    plate_expiration_date: '2025-09-15',
    status: 'Active',
  },
]

const mockRegistrationsData = [
  {
    id: 1,
    vehicleId: 1,
    plateId: 1,
    registrationType: 'New Registration',
    submissionDate: '2024-10-05',
    expiryDate: '2025-10-05',
    status: 'Approved',
    documents: ['Proof of Ownership', 'Insurance Certificate', 'Emission Test'],
    fees: {
      registrationFee: 1500,
      plateIssuanceFee: 450,
      computerFee: 170,
      total: 2120,
    },
  },
  {
    id: 2,
    vehicleId: 2,
    plateId: 2,
    registrationType: 'Renewal',
    submissionDate: '2024-08-10',
    expiryDate: '2025-08-10',
    status: 'Approved',
    documents: ['Insurance Certificate', 'Emission Test'],
    fees: {
      registrationFee: 1500,
      computerFee: 170,
      total: 1670,
    },
  },
  {
    id: 3,
    vehicleId: 3,
    plateId: 3,
    registrationType: 'New Registration',
    submissionDate: '2025-01-05',
    expiryDate: '2026-01-05',
    status: 'Pending',
    documents: ['Proof of Ownership', 'Insurance Certificate', 'Emission Test'],
    fees: {
      registrationFee: 1500,
      plateIssuanceFee: 450,
      computerFee: 170,
      total: 2120,
    },
  },
  {
    id: 4,
    vehicleId: 4,
    plateId: 4,
    registrationType: 'New Registration',
    submissionDate: '2024-10-10',
    expiryDate: '2025-10-10',
    status: 'Approved',
    documents: ['Proof of Ownership', 'Insurance Certificate', 'Emission Test'],
    fees: {
      registrationFee: 1500,
      plateIssuanceFee: 450,
      computerFee: 170,
      total: 2120,
    },
  },
  {
    id: 5,
    vehicleId: 5,
    plateId: 5,
    registrationType: 'New Registration',
    submissionDate: '2024-09-15',
    expiryDate: '2025-09-15',
    status: 'Approved',
    documents: ['Proof of Ownership', 'Insurance Certificate', 'Emission Test'],
    fees: {
      registrationFee: 1500,
      plateIssuanceFee: 450,
      computerFee: 170,
      total: 2120,
    },
  },
]

export const useVehicleRegistrationStore = defineStore('vehicleRegistration', {
  // State
  state: () => ({
    vehicles: [...mockVehiclesData],
    plates: [...mockPlatesData],
    registrations: [...mockRegistrationsData],
    loading: false,
    error: null,
  }),

  // Getters
  getters: {
    // Get vehicles for the current user
    userVehicles: (state) => {
      const userStore = useUserStore()
      if (!userStore.user) return []

      return state.vehicles.filter((vehicle) => vehicle.ownerId === userStore.user.ltoClientId)
    },

    // Get plates for the current user's vehicles
    userPlates: (state) => {
      const userVehicleIds = state.userVehicles.map((vehicle) => vehicle.id)
      return state.plates.filter((plate) => userVehicleIds.includes(plate.vehicleId))
    },

    // Get registrations for the current user's vehicles
    userRegistrations: (state) => {
      const userVehicleIds = state.userVehicles.map((vehicle) => vehicle.id)
      return state.registrations.filter((registration) =>
        userVehicleIds.includes(registration.vehicleId),
      )
    },

    getVehicleById: (state) => (id) => {
      return state.vehicles.find((vehicle) => vehicle.id === id)
    },

    getPlateById: (state) => (id) => {
      return state.plates.find((plate) => plate.id === id)
    },

    getRegistrationById: (state) => (id) => {
      return state.registrations.find((registration) => registration.id === id)
    },

    getPlateByVehicleId: (state) => (vehicleId) => {
      return state.plates.find((plate) => plate.vehicleId === vehicleId)
    },

    getRegistrationByVehicleId: (state) => (vehicleId) => {
      return state.registrations.find((registration) => registration.vehicleId === vehicleId)
    },

    vehiclesWithOwnerInfo: (state) => {
      const userStore = useUserStore()
      return state.vehicles.map((vehicle) => {
        const owner = userStore.mockUsers.find((user) => user.ltoClientId === vehicle.ownerId)

        // Get the plate for this vehicle
        const plate = state.plates.find((p) => p.vehicleId === vehicle.id)

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
      })
    },

    // Get registrations with vehicle and plate information
    registrationsWithDetails: (state) => {
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
      })
    },

    // Get active registrations
    activeRegistrations: (state) => {
      return state.registrations.filter((reg) => reg.status === 'Approved')
    },

    // Get pending registrations
    pendingRegistrations: (state) => {
      return state.registrations.filter((reg) => reg.status === 'Pending')
    },

    // Get expired registrations (where expiryDate is before today)
    expiredRegistrations: (state) => {
      const today = new Date()
      return state.registrations.filter((reg) => {
        const expiryDate = new Date(reg.expiryDate)
        return expiryDate < today
      })
    },

    // Get soon to expire registrations (within 30 days)
    soonToExpireRegistrations: (state) => {
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
    // Calculate days remaining until expiry for a registration or plate
    getDaysRemaining(expiryDateStr) {
      const today = new Date()
      const expiryDate = new Date(expiryDateStr)
      const diffTime = expiryDate - today
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      return diffDays
    },

    // Get expiry status (Expired, Expiring Soon, Valid)
    getExpiryStatus(expiryDateStr) {
      const daysRemaining = this.getDaysRemaining(expiryDateStr)

      if (daysRemaining < 0) return 'Expired'
      if (daysRemaining < 30) return 'Expiring Soon'
      return 'Valid'
    },
  },
})
