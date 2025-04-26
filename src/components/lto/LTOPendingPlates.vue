<script setup lang="ts">
import { ref, computed, defineAsyncComponent } from 'vue'
import type { VehicleRegistrationForm } from '@/types/vehicleRegistration'
import type { Plate } from '@/types/vehicle'
import { useVehicleRegistrationFormStore } from '@/stores/vehicleRegistrationForm'

// Lazy load the PlateIssuanceModal component
const PlateIssuanceModal = defineAsyncComponent(
  () => import('@/components/modals/PlateIssuanceModal.vue'),
)

const vehicleRegistrationFormStore = useVehicleRegistrationFormStore()

// Reactive variables
const sortBy = ref('registrationdate')
const sortOrder = ref('desc')
const activeRegistration = ref<VehicleRegistrationForm | null>(null)
const showPlateModal = ref(false)
const suggestedPlateNumber = ref('')
const lastSelectedRegion = ref('NCR') // Track the last region selected
const lastSelectedPlateType = ref('') // Track the last plate type selected

// Toggle sort order
const toggleSort = (field: string) => {
  if (sortBy.value === field) {
    sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortBy.value = field
    sortOrder.value = 'asc'
  }
}

// Get pending plate issuance registrations (status = 'payment_completed')
const pendingPlateIssuance = computed(() => {
  return vehicleRegistrationFormStore.forms.filter(
    (registration) => registration.status === ('payment_completed' as any),
  )
})

// Sort registrations based on current sort settings
const sortedPendingPlateIssuance = computed(() => {
  return [...pendingPlateIssuance.value].sort((a, b) => {
    let valA: string | number, valB: string | number

    switch (sortBy.value) {
      case 'id':
        valA = a.id
        valB = b.id
        break
      case 'vehicledetails':
        valA = `${a.make} ${a.model}`
        valB = `${b.make} ${b.model}`
        break
      case 'owner':
        valA = a.applicantName || ''
        valB = b.applicantName || ''
        break
      case 'registrationdate':
      default:
        valA = new Date(a.submissionDate).getTime()
        valB = new Date(b.submissionDate).getTime()
        break
    }

    // Handle string comparison
    if (typeof valA === 'string' && typeof valB === 'string') {
      return sortOrder.value === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA)
    }

    // Handle numeric comparison (ensure they are numbers)
    const numA = typeof valA === 'number' ? valA : 0
    const numB = typeof valB === 'number' ? valB : 0
    return sortOrder.value === 'asc' ? numA - numB : numB - numA
  })
})

// Generate a random plate number
const generatePlateNumber = (
  vehicleType: string,
  plateType = 'Private',
  region = 'NCR',
): string => {
  // Region prefixes mapping
  const regionPrefixes: Record<string, string> = {
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

  const regionPrefix = regionPrefixes[region] || 'A' // Default to NCR if region not found

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
}

// Open the plate issuance modal
const openPlateModal = (registration: VehicleRegistrationForm) => {
  activeRegistration.value = registration

  // Determine the plate type based on vehicle information or last selection
  let plateTypeForGeneration = lastSelectedPlateType.value || 'Private'

  // If no plate type is remembered, determine a default based on vehicle information
  if (!lastSelectedPlateType.value) {
    if (
      registration.applicantName?.includes('Government') ||
      registration.applicantName?.includes('Gov') ||
      registration.applicantName?.includes('Department')
    ) {
      plateTypeForGeneration = 'Government'
    } else if (registration.vehicleType === 'Electric') {
      plateTypeForGeneration = 'Electric'
    } else if (registration.vehicleType === 'Hybrid') {
      plateTypeForGeneration = 'Hybrid'
    }
  }

  // Use the stored region or default to NCR
  const region = lastSelectedRegion.value

  suggestedPlateNumber.value = generatePlateNumber(
    registration.vehicleType,
    plateTypeForGeneration,
    region,
  )

  showPlateModal.value = true
}

// Regenerate a plate number with specified parameters
const regeneratePlate = (vehicleType: string, plateType: string, region: string) => {
  if (!activeRegistration.value) return

  // Store the region and plate type for future use
  lastSelectedRegion.value = region
  lastSelectedPlateType.value = plateType

  suggestedPlateNumber.value = generatePlateNumber(vehicleType, plateType, region)

  return suggestedPlateNumber.value
}

// Close the plate issuance modal
const closePlateModal = () => {
  showPlateModal.value = false
  activeRegistration.value = null
}

// Handle plate issuance submission
const handlePlateIssuance = (data: {
  id: string
  plateNumber: string
  plateType: string
  plateIssueDate: string
  plateExpirationDate: string
  issuanceNotes: string
}) => {
  if (!activeRegistration.value) return

  // Extract region prefix from first letter of plate number
  let regionCode = 'NCR'

  // Determine region code from plate number (assuming the first letter is the region code)
  if (data.plateNumber.match(/^[A-Z]/)) {
    const firstLetter = data.plateNumber.charAt(0)
    // Reverse mapping
    const regionMapping: Record<string, string> = {
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
    regionCode = regionMapping[firstLetter] || 'NCR'
  }

  // Update the registration with plate information
  const updatedRegistration = {
    ...activeRegistration.value,
    plateNumber: data.plateNumber,
    plateType: data.plateType,
    plateIssueDate: data.plateIssueDate,
    plateExpirationDate: data.plateExpirationDate,
    plateRegion: regionCode, // Store the region
    issuanceNotes: data.issuanceNotes,
    status: 'completed' as any, // Mark the registration as completed
  }

  // Update the registration in the store
  vehicleRegistrationFormStore.forms = vehicleRegistrationFormStore.forms.map((reg) =>
    reg.id === updatedRegistration.id ? (updatedRegistration as VehicleRegistrationForm) : reg,
  )

  // Save to local storage to persist the changes
  localStorage.setItem(
    'vehicle_registration_forms',
    JSON.stringify(vehicleRegistrationFormStore.forms),
  )

  // Create a new plate record
  const newPlate: Partial<Plate> = {
    plateId: parseInt(activeRegistration.value.id.replace(/\D/g, '')), // Remove non-digits and convert to number
    vehicleId: activeRegistration.value.vehicleId
      ? parseInt(activeRegistration.value.vehicleId)
      : 0,
    plate_number: data.plateNumber,
    plate_type: data.plateType,
    plate_issue_date: data.plateIssueDate,
    plate_expiration_date: data.plateExpirationDate,
    region: regionCode, // Add region to plate record
    status: 'Active',
  }

  // In a real application, you would save the plate to a database
  console.log('New plate created:', newPlate)

  // Also save plates to local storage for persistence
  const existingPlates = JSON.parse(localStorage.getItem('vehicle_plates') || '[]')
  existingPlates.push(newPlate)
  localStorage.setItem('vehicle_plates', JSON.stringify(existingPlates))

  // Transfer the completed registration to the vehicleRegistration store
  // so it appears in the user's Vehicles and Registrations sections
  vehicleRegistrationFormStore.transferToVehicleRegistration(activeRegistration.value.id)

  // Close the modal
  closePlateModal()
}
</script>

<template>
  <div class="p-6">
    <!-- Pending Plate Issuance Table -->
    <h1 class="text-2xl font-semibold text-gray-900 mb-6">Pending Plate Issuance</h1>
    <div class="bg-white rounded-lg shadow overflow-hidden mb-8">
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th
                v-for="header in [
                  'Registration ID',
                  'Vehicle Details',
                  'Owner',
                  'Registration Date',
                ]"
                :key="header"
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                @click="toggleSort(header.toLowerCase().replace(' ', ''))"
              >
                {{ header }}
                <span v-if="sortBy === header.toLowerCase().replace(' ', '')">{{
                  sortOrder === 'asc' ? '↑' : '↓'
                }}</span>
              </th>
              <th
                class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Actions
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="registration in sortedPendingPlateIssuance" :key="registration.id">
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                {{ registration.id }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {{ `${registration.make} ${registration.model} (${registration.year})` }}
                <span class="ml-2 px-2 py-0.5 text-xs rounded-full bg-blue-100 text-blue-700">{{
                  registration.vehicleType
                }}</span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {{ registration.applicantName || 'Unknown' }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {{ new Date(registration.submissionDate).toLocaleDateString() }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                <button
                  @click="openPlateModal(registration)"
                  class="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Issue Plate
                </button>
              </td>
            </tr>
            <tr v-if="sortedPendingPlateIssuance.length === 0">
              <td colspan="5" class="px-6 py-4 text-center text-sm text-gray-500">
                No vehicles pending plate issuance
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Plate Issuance Modal -->
    <PlateIssuanceModal
      :is-open="showPlateModal"
      :registration="activeRegistration"
      :suggested-plate-number="suggestedPlateNumber"
      @close="closePlateModal"
      @submit="handlePlateIssuance"
      @regenerate="regeneratePlate"
    />
  </div>
</template>
