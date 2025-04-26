import { ref } from 'vue'
import { defineStore } from 'pinia'
import type { Registration } from '../types/registration'

export const useRegistrationStore = defineStore('registration', () => {
  const registrations = ref<Registration[]>([
    {
      id: '1',
      referenceCode: 'REG-001',
      vehicleInfo: 'Toyota Camry 2021',
      plateNumber: 'ABC-123',
      registrationType: 'New',
      submissionDate: '2023-01-15',
      expiryDate: '2024-01-15',
      status: 'Approved',
      applicantName: 'John Doe',
      applicantEmail: 'john.doe@example.com',
      applicantPhone: '+1234567890',
      make: 'Toyota',
      model: 'Camry',
      year: '2021',
      color: 'Black',
      engineNumber: 'ENG123456',
      chassisNumber: 'CHS123456',
      vehicleType: 'Sedan',
      inspectionStatus: 'Approved',
      paymentStatus: 'Approved',
      verificationStatus: 'Approved',
      appointmentDate: '2023-01-10',
      appointmentTime: '10:30 AM',
    },
    {
      id: '2',
      referenceCode: 'REG-002',
      vehicleInfo: 'Honda Civic 2020',
      plateNumber: 'XYZ-789',
      registrationType: 'Renewal',
      submissionDate: '2023-02-20',
      expiryDate: '2024-02-20',
      status: 'Pending',
      applicantName: 'Jane Smith',
      applicantEmail: 'jane.smith@example.com',
      applicantPhone: '+0987654321',
      make: 'Honda',
      model: 'Civic',
      year: '2020',
      color: 'Silver',
      engineNumber: 'ENG654321',
      chassisNumber: 'CHS654321',
      vehicleType: 'Sedan',
      inspectionStatus: 'Pending',
      paymentStatus: 'Pending',
      verificationStatus: 'Pending',
      appointmentDate: '2023-03-15',
      appointmentTime: '2:00 PM',
    },
  ])

  const getRegistrationById = (id: string): Registration | undefined => {
    return registrations.value.find((registration) => registration.id === id)
  }

  const updateRegistration = (updatedRegistration: Registration): boolean => {
    const index = registrations.value.findIndex((r) => r.id === updatedRegistration.id)
    if (index !== -1) {
      registrations.value[index] = { ...updatedRegistration }
      return true
    }
    return false
  }

  return {
    registrations,
    getRegistrationById,
    updateRegistration,
  }
})
