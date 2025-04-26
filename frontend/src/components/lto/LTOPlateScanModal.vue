<script setup lang="ts">
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { defineProps } from 'vue'

// Type definitions
interface PlateData {
  id: string
  plateNumber: string
  plateType: string
  region: string
  issueDate: string
  expirationDate: string
  status: string
}

interface RegistrationData {
  id: string
  owner: string
  make: string
  model: string
  year: string
  vehicleType: string
  chassisNumber: string
  engineNumber: string
  color: string
  status: string
}

interface OwnerData {
  id: string
  name: string
  ltoClientNumber: string
  address: string
  contactNumber: string
}

interface ScanResult {
  scanId: string
  timestamp: string
  location: string
  scannerId: string
  plateData: PlateData
  registrationData: RegistrationData
  ownerData: OwnerData
}

defineProps({
  scan: {
    type: Object as () => ScanResult | null,
    required: true,
  },
  formatDate: {
    type: Function,
    required: true,
  },
  formatDateOnly: {
    type: Function,
    required: true,
  },
})

const emit = defineEmits(['close'])

const closeModal = () => {
  emit('close')
}
</script>

<template>
  <div
    v-if="scan"
    class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
    @click.self="closeModal"
  >
    <div class="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
      <!-- Header -->
      <div class="bg-dark-blue text-white p-4 rounded-t-xl flex justify-between items-center">
        <h3 class="text-xl font-bold flex items-center">
          <font-awesome-icon :icon="['fas', 'id-card']" class="mr-2" />
          Plate Details: {{ scan.plateData.plateNumber }}
        </h3>
        <button @click="closeModal" class="text-white hover:text-gray-200">
          <font-awesome-icon :icon="['fas', 'times']" class="text-xl" />
        </button>
      </div>

      <!-- Content -->
      <div class="p-6">
        <!-- Scan Info -->
        <div class="mb-6 flex justify-between items-start">
          <div>
            <span class="text-sm text-gray-500">Scan ID: {{ scan.scanId }}</span>
            <h4 class="text-lg font-bold">{{ formatDate(scan.timestamp) }}</h4>
          </div>
          <span
            class="px-3 py-1.5 rounded-lg text-sm font-medium"
            :class="{
              'bg-green-100 text-green-800': scan.plateData.status === 'Active',
              'bg-red-100 text-red-800': scan.plateData.status === 'Expired',
              'bg-yellow-100 text-yellow-800': scan.plateData.status === 'Not Found',
            }"
          >
            {{ scan.plateData.status.toUpperCase() }}
          </span>
        </div>

        <!-- Plate Information -->
        <div class="bg-gray-50 p-4 rounded-lg mb-6">
          <h4 class="text-md font-bold text-dark-blue mb-3">Plate Information</h4>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p class="text-xs text-gray-500">Plate Number</p>
              <p class="text-sm font-bold">{{ scan.plateData.plateNumber }}</p>
            </div>
            <div>
              <p class="text-xs text-gray-500">Plate Type</p>
              <p class="text-sm">{{ scan.plateData.plateType }}</p>
            </div>
            <div>
              <p class="text-xs text-gray-500">Region</p>
              <p class="text-sm">{{ scan.plateData.region }}</p>
            </div>
            <div>
              <p class="text-xs text-gray-500">Issue Date</p>
              <p class="text-sm">{{ formatDateOnly(scan.plateData.issueDate) }}</p>
            </div>
            <div>
              <p class="text-xs text-gray-500">Expiration Date</p>
              <p class="text-sm">{{ formatDateOnly(scan.plateData.expirationDate) }}</p>
            </div>
          </div>
        </div>

        <!-- Vehicle Information -->
        <div class="bg-gray-50 p-4 rounded-lg mb-6">
          <h4 class="text-md font-bold text-dark-blue mb-3">Vehicle Information</h4>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p class="text-xs text-gray-500">Registration ID</p>
              <p class="text-sm font-bold">{{ scan.registrationData.id }}</p>
            </div>
            <div>
              <p class="text-xs text-gray-500">Status</p>
              <p class="text-sm">{{ scan.registrationData.status }}</p>
            </div>
            <div>
              <p class="text-xs text-gray-500">Make & Model</p>
              <p class="text-sm">
                {{ scan.registrationData.make }} {{ scan.registrationData.model }}
              </p>
            </div>
            <div>
              <p class="text-xs text-gray-500">Year</p>
              <p class="text-sm">{{ scan.registrationData.year }}</p>
            </div>
            <div>
              <p class="text-xs text-gray-500">Type</p>
              <p class="text-sm">{{ scan.registrationData.vehicleType }}</p>
            </div>
            <div>
              <p class="text-xs text-gray-500">Color</p>
              <p class="text-sm">{{ scan.registrationData.color }}</p>
            </div>
            <div>
              <p class="text-xs text-gray-500">Chassis Number</p>
              <p class="text-sm font-mono">{{ scan.registrationData.chassisNumber }}</p>
            </div>
            <div>
              <p class="text-xs text-gray-500">Engine Number</p>
              <p class="text-sm font-mono">{{ scan.registrationData.engineNumber }}</p>
            </div>
          </div>
        </div>

        <!-- Owner Information -->
        <div class="bg-gray-50 p-4 rounded-lg">
          <h4 class="text-md font-bold text-dark-blue mb-3">Owner Information</h4>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p class="text-xs text-gray-500">Name</p>
              <p class="text-sm font-bold">{{ scan.ownerData.name }}</p>
            </div>
            <div>
              <p class="text-xs text-gray-500">LTO Client Number</p>
              <p class="text-sm">{{ scan.ownerData.ltoClientNumber }}</p>
            </div>
            <div class="md:col-span-2">
              <p class="text-xs text-gray-500">Address</p>
              <p class="text-sm">{{ scan.ownerData.address }}</p>
            </div>
            <div>
              <p class="text-xs text-gray-500">Contact Number</p>
              <p class="text-sm">{{ scan.ownerData.contactNumber }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div class="border-t border-gray-200 p-4 flex justify-end">
        <button
          @click="closeModal"
          class="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors font-medium"
        >
          Close
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Add any component-specific styles here */
</style>
