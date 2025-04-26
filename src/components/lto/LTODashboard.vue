<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useVehicleRegistrationStore } from '@/stores/vehicleRegistration'
import { useVehicleRegistrationFormStore } from '@/stores/vehicleRegistrationForm'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import LTODashboardCharts from '@/components/charts/LTODashboardCharts.vue'

const vehicleRegistrationStore = useVehicleRegistrationStore()
const registrationFormStore = useVehicleRegistrationFormStore()

// Define emits
const emit = defineEmits<{
  (e: 'navigate', section: string, status?: string): void
}>()

// Ensure data is loaded
onMounted(async () => {
  // No need to fetch data if the stores are already reactive
})

// Calculate KPI metrics
const totalVehicles = computed(() => {
  return vehicleRegistrationStore.vehicles.length
})

const totalPlates = computed(() => {
  return vehicleRegistrationStore.registrations.filter((reg) => reg.plateId).length
})

const pendingRegistrations = computed(
  () => registrationFormStore.forms.filter((form) => form.status === 'pending').length,
)

const platesForIssuance = computed(
  () =>
    vehicleRegistrationStore.registrations.filter(
      (reg) => reg.status === 'pending' || reg.status === 'ready',
    ).length,
)

// Navigation functions
const navigateToRegistrations = (status: string) => {
  emit('navigate', 'registrations', status)
}

const navigateToPlates = () => {
  emit('navigate', 'plates', 'pending')
}

// KPI percentage changes (for demonstration - normally would compare to previous period)
const vehiclePercentChange = ref(12.8)
const platePercentChange = ref(8.5)
const pendingPercentChange = ref(-5.2)
const issuancePercentChange = ref(15.3)

// Format large numbers with commas
const formatNumber = (num: number): string => {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}
</script>

<template>
  <div class="space-y-6">
    <!-- Page Title -->
    <div class="flex justify-between items-center">
      <h1 class="text-2xl font-bold text-dark-blue">LTO Officer Dashboard</h1>
      <div class="text-sm text-gray-500">
        <span>Last updated: {{ new Date().toLocaleString() }}</span>
      </div>
    </div>

    <!-- KPI Cards -->
    <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
      <!-- Total Vehicles -->
      <div class="bg-white rounded-lg shadow p-6 border-l-4 border-blue-600">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-500">Total Vehicles</p>
            <h3 class="text-2xl font-bold mt-1">{{ formatNumber(totalVehicles) }}</h3>
            <div class="flex items-center mt-2">
              <span
                class="text-sm"
                :class="vehiclePercentChange >= 0 ? 'text-green-600' : 'text-red-600'"
              >
                <font-awesome-icon
                  :icon="vehiclePercentChange >= 0 ? 'arrow-up' : 'arrow-down'"
                  class="mr-1"
                />
                {{ Math.abs(vehiclePercentChange).toFixed(1) }}%
              </span>
              <span class="ml-1 text-xs text-gray-500">from last month</span>
            </div>
          </div>
          <div class="h-12 w-12 rounded-lg bg-blue-100 flex items-center justify-center">
            <font-awesome-icon icon="car" class="h-6 w-6 text-blue-600" />
          </div>
        </div>
      </div>

      <!-- Total Plates -->
      <div class="bg-white rounded-lg shadow p-6 border-l-4 border-purple-600">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-500">Total Plates</p>
            <h3 class="text-2xl font-bold mt-1">{{ formatNumber(totalPlates) }}</h3>
            <div class="flex items-center mt-2">
              <span
                class="text-sm"
                :class="platePercentChange >= 0 ? 'text-green-600' : 'text-red-600'"
              >
                <font-awesome-icon
                  :icon="platePercentChange >= 0 ? 'arrow-up' : 'arrow-down'"
                  class="mr-1"
                />
                {{ Math.abs(platePercentChange).toFixed(1) }}%
              </span>
              <span class="ml-1 text-xs text-gray-500">from last month</span>
            </div>
          </div>
          <div class="h-12 w-12 rounded-lg bg-purple-100 flex items-center justify-center">
            <font-awesome-icon icon="id-card" class="h-6 w-6 text-purple-600" />
          </div>
        </div>
      </div>

      <!-- Pending Registrations -->
      <div class="bg-white rounded-lg shadow p-6 border-l-4 border-yellow-600">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-500">Pending Registrations</p>
            <h3 class="text-2xl font-bold mt-1">{{ formatNumber(pendingRegistrations) }}</h3>
            <div class="flex items-center mt-2">
              <span
                class="text-sm"
                :class="pendingPercentChange >= 0 ? 'text-red-600' : 'text-green-600'"
              >
                <font-awesome-icon
                  :icon="pendingPercentChange >= 0 ? 'arrow-up' : 'arrow-down'"
                  class="mr-1"
                />
                {{ Math.abs(pendingPercentChange).toFixed(1) }}%
              </span>
              <span class="ml-1 text-xs text-gray-500">from last month</span>
            </div>
          </div>
          <div class="h-12 w-12 rounded-lg bg-yellow-100 flex items-center justify-center">
            <font-awesome-icon icon="clipboard-list" class="h-6 w-6 text-yellow-600" />
          </div>
        </div>
      </div>

      <!-- Plates Ready for Issuance -->
      <div class="bg-white rounded-lg shadow p-6 border-l-4 border-green-600">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-500">Plates for Issuance</p>
            <h3 class="text-2xl font-bold mt-1">{{ formatNumber(platesForIssuance) }}</h3>
            <div class="flex items-center mt-2">
              <span
                class="text-sm"
                :class="issuancePercentChange >= 0 ? 'text-green-600' : 'text-red-600'"
              >
                <font-awesome-icon
                  :icon="issuancePercentChange >= 0 ? 'arrow-up' : 'arrow-down'"
                  class="mr-1"
                />
                {{ Math.abs(issuancePercentChange).toFixed(1) }}%
              </span>
              <span class="ml-1 text-xs text-gray-500">from last month</span>
            </div>
          </div>
          <div class="h-12 w-12 rounded-lg bg-green-100 flex items-center justify-center">
            <font-awesome-icon icon="check-circle" class="h-6 w-6 text-green-600" />
          </div>
        </div>
      </div>
    </div>

    <!-- Action Buttons -->
    <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
      <button
        @click="navigateToRegistrations('pending')"
        class="bg-white shadow rounded-lg p-6 flex flex-col items-center hover:shadow-md transition-shadow text-left"
      >
        <div class="h-14 w-14 rounded-full bg-blue-100 flex items-center justify-center mb-4">
          <font-awesome-icon icon="file-alt" class="h-7 w-7 text-blue-600" />
        </div>
        <h3 class="text-lg font-semibold text-dark-blue mb-2">View Pending Registrations</h3>
        <p class="text-sm text-gray-500 text-center mb-4">
          Review and process pending vehicle registration applications
        </p>
        <span class="text-blue-600 font-medium text-sm flex items-center">
          Process Now
          <font-awesome-icon icon="arrow-right" class="ml-1" />
        </span>
      </button>

      <button
        @click="navigateToPlates"
        class="bg-white shadow rounded-lg p-6 flex flex-col items-center hover:shadow-md transition-shadow text-left"
      >
        <div class="h-14 w-14 rounded-full bg-purple-100 flex items-center justify-center mb-4">
          <font-awesome-icon icon="id-card" class="h-7 w-7 text-purple-600" />
        </div>
        <h3 class="text-lg font-semibold text-dark-blue mb-2">Manage Plate Issuance</h3>
        <p class="text-sm text-gray-500 text-center mb-4">
          Issue license plates to completed and approved vehicle registrations
        </p>
        <span class="text-purple-600 font-medium text-sm flex items-center">
          Manage Plates
          <font-awesome-icon icon="arrow-right" class="ml-1" />
        </span>
      </button>

      <button
        @click="navigateToRegistrations('processing')"
        class="bg-white shadow rounded-lg p-6 flex flex-col items-center hover:shadow-md transition-shadow text-left"
      >
        <div class="h-14 w-14 rounded-full bg-yellow-100 flex items-center justify-center mb-4">
          <font-awesome-icon icon="clipboard-list" class="h-7 w-7 text-yellow-600" />
        </div>
        <h3 class="text-lg font-semibold text-dark-blue mb-2">Track Processing Status</h3>
        <p class="text-sm text-gray-500 text-center mb-4">
          Monitor registrations currently in progress through the approval workflow
        </p>
        <span class="text-yellow-600 font-medium text-sm flex items-center">
          Check Status
          <font-awesome-icon icon="arrow-right" class="ml-1" />
        </span>
      </button>

      <button
        @click="navigateToRegistrations('completed')"
        class="bg-white shadow rounded-lg p-6 flex flex-col items-center hover:shadow-md transition-shadow text-left"
      >
        <div class="h-14 w-14 rounded-full bg-green-100 flex items-center justify-center mb-4">
          <font-awesome-icon icon="check-double" class="h-7 w-7 text-green-600" />
        </div>
        <h3 class="text-lg font-semibold text-dark-blue mb-2">View Completed Registrations</h3>
        <p class="text-sm text-gray-500 text-center mb-4">
          Access completed registration records and plate assignments
        </p>
        <span class="text-green-600 font-medium text-sm flex items-center">
          View Records
          <font-awesome-icon icon="arrow-right" class="ml-1" />
        </span>
      </button>
    </div>

    <!-- Charts Section -->
    <div class="mt-6">
      <LTODashboardCharts />
    </div>
  </div>
</template>
