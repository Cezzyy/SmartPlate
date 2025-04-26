<script setup lang="ts">
import { ref, computed } from 'vue'
import type { VehicleRegistrationForm } from '@/types/vehicleRegistration'
import { useVehicleRegistrationFormStore } from '@/stores/vehicleRegistrationForm'

const vehicleRegistrationFormStore = useVehicleRegistrationFormStore()

// Reactive variables
const sortBy = ref('registrationdate')
const sortOrder = ref('desc')

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

// Sort issued plates
const sortedIssuedPlates = computed(() => {
  return [...issuedPlates.value].sort((a, b) => {
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
      case 'platenumber':
        valA = a.plateNumber || ''
        valB = b.plateNumber || ''
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
</script>

<template>
  <div class="p-6">
    <!-- Issued Plates Table -->
    <h1 class="text-2xl font-semibold text-gray-900 mb-6">Issued Plates</h1>
    <div class="bg-white rounded-lg shadow overflow-hidden">
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th
                v-for="header in [
                  'Registration ID',
                  'Vehicle Details',
                  'Owner',
                  'Plate Number',
                  'Issue Date',
                  'Expiration Date',
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
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="registration in sortedIssuedPlates" :key="registration.id">
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
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                {{ registration.plateNumber }}
                <span
                  v-if="registration.plateType"
                  class="ml-2 px-2 py-0.5 text-xs rounded-full"
                  :class="{
                    'bg-blue-100 text-blue-700': registration.plateType === 'Private',
                    'bg-green-100 text-green-700':
                      registration.plateType === 'For Hire' ||
                      registration.plateType === 'PublicUtility',
                    'bg-red-100 text-red-700': registration.plateType === 'Government',
                    'bg-purple-100 text-purple-700': registration.plateType === 'Diplomatic',
                    'bg-teal-100 text-teal-700': registration.plateType === 'Electric',
                    'bg-indigo-100 text-indigo-700': registration.plateType === 'Hybrid',
                    'bg-yellow-100 text-yellow-700': registration.plateType === 'Trailer',
                    'bg-gray-100 text-gray-700': registration.plateType === 'Vintage',
                    'bg-orange-100 text-orange-700':
                      registration.plateType === 'Motorcycle' ||
                      registration.plateType === 'Tricycle',
                  }"
                >
                  {{ registration.plateType }}
                </span>
                <span
                  v-if="registration.plateRegion"
                  class="ml-2 px-2 py-0.5 text-xs rounded-full bg-gray-100 text-gray-700"
                >
                  {{ registration.plateRegion }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {{
                  registration.plateIssueDate
                    ? new Date(registration.plateIssueDate).toLocaleDateString()
                    : 'N/A'
                }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {{
                  registration.plateExpirationDate
                    ? new Date(registration.plateExpirationDate).toLocaleDateString()
                    : 'N/A'
                }}
              </td>
            </tr>
            <tr v-if="sortedIssuedPlates.length === 0">
              <td colspan="6" class="px-6 py-4 text-center text-sm text-gray-500">
                No plates have been issued
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>
