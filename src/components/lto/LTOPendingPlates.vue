<script setup lang="ts">
import { ref, computed, defineAsyncComponent, onMounted } from 'vue'
import type { VehicleRegistrationForm } from '@/types/vehicleRegistration'
import { useVehicleRegistrationFormStore } from '@/stores/vehicleRegistrationForm'
import { useUserStore } from '@/stores/user'
import { usePlateStore } from '@/stores/plate'

// Lazy load the PlateIssuanceModal component
const PlateIssuanceModal = defineAsyncComponent(
  () => import('@/components/modals/PlateIssuanceModal.vue'),
)

const vehicleRegistrationFormStore = useVehicleRegistrationFormStore()
const userStore = useUserStore()
const plateStore = usePlateStore()

// Load plates from localStorage on component mount
onMounted(() => {
  plateStore.loadPlatesFromStorage()
})

// Reactive variables
const sortBy = ref('registrationdate')
const sortOrder = ref('desc')
const activeRegistration = ref<VehicleRegistrationForm | null>(null)
const showPlateModal = ref(false)
const suggestedPlateNumber = ref('')
const lastSelectedRegion = ref('NCR') // Track the last region selected
const lastSelectedPlateType = ref('') // Track the last plate type selected
const searchQuery = ref('')

// Function to get owner name from user ID
const getOwnerName = (userId: string): string => {
  const user = userStore.users.find((user) => user.ltoClientId === userId)
  if (user) {
    return `${user.firstName} ${user.lastName}`
  }
  return 'Unknown'
}

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

// Filtered registrations
const filteredPendingPlateIssuance = computed(() => {
  if (!searchQuery.value) return pendingPlateIssuance.value

  const query = searchQuery.value.toLowerCase()
  return pendingPlateIssuance.value.filter(
    (reg) =>
      reg.id.toLowerCase().includes(query) ||
      `${reg.make} ${reg.model}`.toLowerCase().includes(query) ||
      getOwnerName(reg.userId).toLowerCase().includes(query),
  )
})

// Sort registrations based on current sort settings
const sortedPendingPlateIssuance = computed(() => {
  return [...filteredPendingPlateIssuance.value].sort((a, b) => {
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
        valA = getOwnerName(a.userId)
        valB = getOwnerName(b.userId)
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

// Open the plate issuance modal
const openPlateModal = (registration: VehicleRegistrationForm) => {
  activeRegistration.value = registration

  // Determine the plate type based on vehicle information or last selection
  let plateTypeForGeneration = lastSelectedPlateType.value || 'Private'

  // If no plate type is remembered, determine a default based on vehicle information
  if (!lastSelectedPlateType.value) {
    const ownerName = getOwnerName(registration.userId)
    if (
      ownerName.toLowerCase().includes('government') ||
      ownerName.toLowerCase().includes('gov') ||
      ownerName.toLowerCase().includes('department')
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

  // Use the plate store to generate a plate number
  suggestedPlateNumber.value = plateStore.generatePlateNumber(
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

  // Use the plate store to generate a plate number
  suggestedPlateNumber.value = plateStore.generatePlateNumber(vehicleType, plateType, region)

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

  // Get region code from plate store
  const regionCode = plateStore.getRegionFromPlate(data.plateNumber)

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

  // Create a new plate record using the plate store
  const plateId = parseInt(activeRegistration.value.id.replace(/\D/g, '')) || Date.now()
  const vehicleId = activeRegistration.value.vehicleId
    ? parseInt(activeRegistration.value.vehicleId)
    : 0

  plateStore.issuePlate({
    plateId,
    vehicleId,
    plate_number: data.plateNumber,
    plate_type: data.plateType,
    plate_issue_date: data.plateIssueDate,
    plate_expiration_date: data.plateExpirationDate,
    region: regionCode,
    status: 'Active',
  })

  // Transfer the completed registration to the vehicleRegistration store
  // so it appears in the user's Vehicles and Registrations sections
  vehicleRegistrationFormStore.transferToVehicleRegistration(activeRegistration.value.id)

  // Close the modal
  closePlateModal()
}
</script>

<template>
  <div>
    <div class="flex justify-between items-center mb-8">
      <div>
        <h2 class="text-2xl font-bold text-dark-blue">Pending Plate Issuance</h2>
        <p class="text-gray mt-1">Process and issue new license plates for registered vehicles</p>
      </div>
    </div>

    <!-- Search and Filters -->
    <div class="bg-white rounded-xl shadow-md border border-light-gray border-opacity-20 p-6 mb-8">
      <div class="relative">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search by ID, vehicle details, or owner..."
          class="w-full pl-10 pr-4 py-3 rounded-lg bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-light-blue focus:border-transparent transition-all"
        />
        <font-awesome-icon
          :icon="['fas', 'search']"
          class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray"
        />
      </div>
    </div>

    <!-- Pending Plates Table -->
    <div
      class="bg-white rounded-xl shadow-md border border-light-gray border-opacity-20 overflow-hidden mb-6"
    >
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th
                v-for="header in [
                  { text: 'Registration ID', value: 'id', sortable: true },
                  { text: 'Vehicle Details', value: 'vehicledetails', sortable: true },
                  { text: 'Owner', value: 'owner', sortable: true },
                  { text: 'Registration Date', value: 'registrationdate', sortable: true },
                  { text: 'Actions', value: 'actions', sortable: false },
                ]"
                :key="header.value"
                @click="header.sortable && toggleSort(header.value)"
                class="px-6 py-4 text-left text-xs font-medium text-gray uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                :class="{ 'cursor-default': !header.sortable }"
              >
                <div class="flex items-center gap-2">
                  {{ header.text }}
                  <span v-if="header.sortable" class="text-gray-400">
                    <font-awesome-icon
                      v-if="sortBy === header.value"
                      :icon="['fas', sortOrder === 'asc' ? 'sort-up' : 'sort-down']"
                    />
                    <font-awesome-icon v-else :icon="['fas', 'sort']" />
                  </span>
                </div>
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <!-- Empty state -->
            <tr v-if="sortedPendingPlateIssuance.length === 0" class="hover:bg-gray-50">
              <td colspan="5" class="px-6 py-10 text-center text-gray">
                <div class="flex flex-col items-center justify-center space-y-3">
                  <div class="bg-light-blue bg-opacity-10 p-4 rounded-full">
                    <font-awesome-icon :icon="['fas', 'car']" class="text-3xl text-light-blue" />
                  </div>
                  <p class="text-lg font-medium text-dark-blue">No pending plate issuance</p>
                  <p class="text-sm text-gray">
                    All vehicles have been processed or no registrations have been completed
                  </p>
                </div>
              </td>
            </tr>

            <!-- Table rows -->
            <tr
              v-for="registration in sortedPendingPlateIssuance"
              :key="registration.id"
              class="hover:bg-gray-50 transition-colors"
            >
              <td class="px-6 py-4 whitespace-nowrap">
                <span class="text-sm font-medium text-dark-blue">{{ registration.id }}</span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                  <div
                    class="flex-shrink-0 h-10 w-10 bg-light-blue bg-opacity-10 rounded-full flex items-center justify-center"
                  >
                    <font-awesome-icon :icon="['fas', 'car']" class="text-light-blue" />
                  </div>
                  <div class="ml-4">
                    <div class="text-sm font-medium text-dark-blue">
                      {{ `${registration.make} ${registration.model}` }}
                    </div>
                    <div class="text-sm text-gray">
                      {{ registration.year }} ·
                      <span
                        class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800"
                      >
                        {{ registration.vehicleType }}
                      </span>
                    </div>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-700">{{ getOwnerName(registration.userId) }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span
                  class="px-3 py-1 inline-flex text-xs leading-5 font-medium rounded-full bg-yellow-100 text-yellow-800"
                >
                  <span class="h-1.5 w-1.5 rounded-full bg-yellow-600 mr-1.5 self-center"></span>
                  {{
                    new Date(registration.submissionDate).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })
                  }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <button
                  @click="openPlateModal(registration)"
                  class="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-light-blue hover:bg-dark-blue focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-light-blue transition-all"
                >
                  <font-awesome-icon :icon="['fas', 'id-card']" class="mr-2" />
                  Issue Plate
                </button>
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
