<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useVehicleRegistrationFormStore } from '@/stores/vehicleRegistrationForm'
import { useUserStore } from '@/stores/user'
import { usePlateStore } from '@/stores/plate'

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

// Get issued plates (registrations with status = 'completed')
const issuedPlates = computed(() => {
  return vehicleRegistrationFormStore.forms.filter(
    (registration) => registration.status === ('completed' as any),
  )
})

// Filtered plates by search query
const filteredIssuedPlates = computed(() => {
  if (!searchQuery.value) return issuedPlates.value

  const query = searchQuery.value.toLowerCase()
  return issuedPlates.value.filter(
    (reg) =>
      reg.id.toLowerCase().includes(query) ||
      `${reg.make} ${reg.model}`.toLowerCase().includes(query) ||
      getOwnerName(reg.userId).toLowerCase().includes(query) ||
      (reg.plateNumber || '').toLowerCase().includes(query),
  )
})

// Sort issued plates
const sortedIssuedPlates = computed(() => {
  return [...filteredIssuedPlates.value].sort((a, b) => {
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
      case 'platenumber':
        valA = a.plateNumber || ''
        valB = b.plateNumber || ''
        break
      case 'issuedate':
        valA = a.plateIssueDate ? new Date(a.plateIssueDate).getTime() : 0
        valB = b.plateIssueDate ? new Date(b.plateIssueDate).getTime() : 0
        break
      case 'expirationdate':
        valA = a.plateExpirationDate ? new Date(a.plateExpirationDate).getTime() : 0
        valB = b.plateExpirationDate ? new Date(b.plateExpirationDate).getTime() : 0
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

// Get plate type color
const getPlateTypeColor = (plateType: string): string => {
  if (!plateType) return 'bg-gray-100 text-gray-800'

  switch (plateType.toLowerCase()) {
    case 'private':
      return 'bg-blue-100 text-blue-800'
    case 'for hire':
    case 'publicutility':
      return 'bg-green-100 text-green-800'
    case 'government':
      return 'bg-red-100 text-red-800'
    case 'diplomatic':
      return 'bg-purple-100 text-purple-800'
    case 'electric':
      return 'bg-teal-100 text-teal-800'
    case 'hybrid':
      return 'bg-indigo-100 text-indigo-800'
    case 'trailer':
      return 'bg-yellow-100 text-yellow-800'
    case 'vintage':
      return 'bg-gray-100 text-gray-800'
    case 'motorcycle':
    case 'tricycle':
      return 'bg-orange-100 text-orange-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}
</script>

<template>
  <div>
    <div class="flex justify-between items-center mb-8">
      <div>
        <h2 class="text-2xl font-bold text-dark-blue">Issued Plates</h2>
        <p class="text-gray mt-1">View all license plates that have been issued to vehicles</p>
      </div>
    </div>

    <!-- Search and Filters -->
    <div class="bg-white rounded-xl shadow-md border border-light-gray border-opacity-20 p-6 mb-8">
      <div class="relative">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search by ID, plate number, vehicle details, or owner..."
          class="w-full pl-10 pr-4 py-3 rounded-lg bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-light-blue focus:border-transparent transition-all"
        />
        <font-awesome-icon
          :icon="['fas', 'search']"
          class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray"
        />
      </div>
    </div>

    <!-- Issued Plates Table -->
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
                  { text: 'Plate Number', value: 'platenumber', sortable: true },
                  { text: 'Issue Date', value: 'issuedate', sortable: true },
                  { text: 'Expiration Date', value: 'expirationdate', sortable: true },
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
            <tr v-if="sortedIssuedPlates.length === 0" class="hover:bg-gray-50">
              <td colspan="6" class="px-6 py-10 text-center text-gray">
                <div class="flex flex-col items-center justify-center space-y-3">
                  <div class="bg-light-blue bg-opacity-10 p-4 rounded-full">
                    <font-awesome-icon
                      :icon="['fas', 'id-card']"
                      class="text-3xl text-light-blue"
                    />
                  </div>
                  <p class="text-lg font-medium text-dark-blue">No plates issued yet</p>
                  <p class="text-sm text-gray">
                    There are no completed vehicle registrations with issued plates
                  </p>
                </div>
              </td>
            </tr>

            <!-- Table rows -->
            <tr
              v-for="registration in sortedIssuedPlates"
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
                <div class="text-sm font-medium text-dark-blue">{{ registration.plateNumber }}</div>
                <div class="flex items-center space-x-2 mt-1">
                  <span
                    v-if="registration.plateType"
                    class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium"
                    :class="getPlateTypeColor(registration.plateType)"
                  >
                    <span
                      class="h-1.5 w-1.5 rounded-full mr-1.5 self-center bg-current opacity-70"
                    ></span>
                    {{ registration.plateType }}
                  </span>
                  <span
                    v-if="registration.plateRegion"
                    class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800"
                  >
                    {{ registration.plateRegion }}
                  </span>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-700">
                  <span class="inline-flex items-center">
                    <font-awesome-icon
                      :icon="['fas', 'calendar-check']"
                      class="text-green-500 mr-2"
                      v-if="registration.plateIssueDate"
                    />
                    {{
                      registration.plateIssueDate
                        ? new Date(registration.plateIssueDate).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })
                        : 'N/A'
                    }}
                  </span>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-700">
                  <span
                    v-if="registration.plateExpirationDate"
                    class="px-3 py-1 inline-flex text-xs leading-5 font-medium rounded-full"
                    :class="
                      new Date(registration.plateExpirationDate) > new Date()
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    "
                  >
                    <span
                      class="h-1.5 w-1.5 rounded-full mr-1.5 self-center"
                      :class="
                        new Date(registration.plateExpirationDate) > new Date()
                          ? 'bg-green-600'
                          : 'bg-red-600'
                      "
                    ></span>
                    {{
                      new Date(registration.plateExpirationDate).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })
                    }}
                  </span>
                  <span v-else class="text-gray-500">N/A</span>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>
