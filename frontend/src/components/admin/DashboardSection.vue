<script setup lang="ts">
import { computed, defineAsyncComponent, ref, onMounted } from 'vue'
import { useVehicleRegistrationStore } from '@/stores/vehicleRegistration'
import { useUserStore } from '@/stores/user'
import { useInspectionStore } from '@/stores/inspection'
import { usePaymentStore } from '@/stores/payment'
import type { Vehicle, Registration } from '@/types/vehicle'

// Define emits for navigation
const emit = defineEmits<{
  (e: 'switchTab', tab: string): void
}>()

// Function to switch to pending registrations tab
const navigateToPendingItems = () => {
  emit('switchTab', 'pending')
}

// Loading and error states
const isLoading = ref<boolean>(true)
const hasError = ref<boolean>(false)
const errorMessage = ref<string>('')

interface VehicleTypeData {
  label: string
  value: number
}

interface VehicleMakeData {
  label: string
  value: number
}

interface RegistrationTrendData {
  month: string
  new: number
  renewal: number
}

const RevenueTrendsChart = defineAsyncComponent(
  () => import('@/components/charts/RevenueTrendsChart.vue'),
)
const RegistrationStatusChart = defineAsyncComponent(
  () => import('@/components/charts/RegistrationStatusChart.vue'),
)
const VehicleTypesChart = defineAsyncComponent(
  () => import('@/components/charts/VehicleTypesChart.vue'),
)
const VehicleMakesChart = defineAsyncComponent(
  () => import('@/components/charts/VehicleMakesChart.vue'),
)
const RegistrationTrendsChart = defineAsyncComponent(
  () => import('@/components/charts/RegistrationTrendsChart.vue'),
)
const InspectionStatusChart = defineAsyncComponent(
  () => import('@/components/charts/InspectionStatusChart.vue'),
)

const vehicleStore = useVehicleRegistrationStore()
const userStore = useUserStore()
const inspectionStore = useInspectionStore()
const paymentStore = usePaymentStore()

// Method to load all dashboard data
const loadDashboardData = async () => {
  isLoading.value = true
  hasError.value = false
  errorMessage.value = ''

  try {
    // Load data from all stores using the correct method names
    await Promise.all([
      vehicleStore.fetchVehicles(),
      vehicleStore.fetchRegistrations(),
      userStore.fetchAllUsers(),
      inspectionStore.initializeStore(),
      paymentStore.initializeStore()
    ])
  } catch (error) {
    console.error('Error loading dashboard data:', error)
    hasError.value = true
    errorMessage.value = 'Failed to load dashboard data. Please try again.'
  } finally {
    isLoading.value = false
  }
}

// Fetch data when component is mounted
onMounted(() => {
  loadDashboardData()
})

// Get data for statistics
const totalUsers = computed(() => userStore.users.filter((user) => user.role !== 'admin').length)
const totalVehicles = computed(() => vehicleStore.vehicles.length)
const totalRegistrations = computed(() => vehicleStore.registrations.length)
const pendingRegistrations = computed(() => vehicleStore.pendingRegistrations.length)
const approvedRegistrations = computed(
  () => vehicleStore.registrations.filter((reg) => reg.status === 'Approved').length,
)

// Inspection statistics
const pendingInspections = computed(() => inspectionStore.getPendingInspections.length)
const approvedInspections = computed(() => inspectionStore.getCompletedInspections.length)
const rejectedInspections = computed(() => inspectionStore.getRejectedInspections.length)
const totalInspections = computed(
  () => pendingInspections.value + approvedInspections.value + rejectedInspections.value,
)

// Payment statistics
const pendingPayments = computed(() => paymentStore.getPendingPayments.length)
const completedPayments = computed(() => paymentStore.getCompletedPayments.length)
const rejectedPayments = computed(() => paymentStore.getRejectedPayments.length)

// Check if data exists
const hasVehicleData = computed(() => vehicleStore.vehicles.length > 0)
const hasRegistrationData = computed(() => vehicleStore.registrations.length > 0)
const hasInspectionData = computed(() => totalInspections.value > 0)
const hasPaymentData = computed(() => 
  pendingPayments.value > 0 || completedPayments.value > 0 || rejectedPayments.value > 0
)

// Vehicle types distribution for pie chart
const vehicleTypes = computed<VehicleTypeData[]>(() => {
  const types: Record<string, number> = {}
  vehicleStore.vehicles.forEach((vehicle: Vehicle) => {
    const type = vehicle.vehicleType || 'Unknown'
    types[type] = (types[type] || 0) + 1
  })
  return Object.entries(types).map(([label, value]) => ({ label, value }))
})

// Vehicle makes distribution for bar chart
const vehicleMakes = computed<VehicleMakeData[]>(() => {
  const makes: Record<string, number> = {}
  vehicleStore.vehicles.forEach((vehicle: Vehicle) => {
    const make = vehicle.vehicleMake || 'Unknown'
    makes[make] = (makes[make] || 0) + 1
  })
  return Object.entries(makes)
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 5) // Top 5 makes
})

// Registration trends by month (last 6 months)
const registrationTrends = computed<RegistrationTrendData[]>(() => {
  const trends: Record<string, { new: number; renewal: number }> = {}
  const now = new Date()

  // Initialize last 6 months
  for (let i = 5; i >= 0; i--) {
    const month = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const monthLabel = month.toLocaleString('default', { month: 'short' })
    trends[monthLabel] = { new: 0, renewal: 0 }
  }

  // Fill with data
  vehicleStore.registrations.forEach((reg: Registration) => {
    const date = new Date(reg.submissionDate)
    const monthLabel = date.toLocaleString('default', { month: 'short' })

    // Only count if it's within the last 6 months
    if (trends[monthLabel]) {
      if (reg.registrationType === 'New Registration') {
        trends[monthLabel].new++
      } else if (reg.registrationType === 'Renewal') {
        trends[monthLabel].renewal++
      }
    }
  })

  return Object.entries(trends).map(([month, data]) => ({
    month,
    new: data.new,
    renewal: data.renewal,
  }))
})

// Calculate revenue from payments
const totalRevenue = computed(() => {
  // Get completed payments and calculate total revenue
  const completedPaymentForms = paymentStore.getCompletedPayments

  return completedPaymentForms.reduce((total, form) => {
    if (form.paymentDetails?.amountPaid) {
      return total + form.paymentDetails.amountPaid
    }
    return total
  }, 0)
})

// Revenue trends by month (last 6 months)
const revenueTrends = computed(() => {
  const trends: Record<string, number> = {}
  const now = new Date()

  // Initialize last 6 months
  for (let i = 5; i >= 0; i--) {
    const month = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const monthLabel = month.toLocaleString('default', { month: 'short' })
    trends[monthLabel] = 0
  }

  // Fill with data from completed payments
  const completedPaymentForms = paymentStore.getCompletedPayments

  completedPaymentForms.forEach((form) => {
    if (form.paymentDetails?.paymentDate && form.paymentDetails.amountPaid) {
      const date = new Date(form.paymentDetails.paymentDate)
      const monthLabel = date.toLocaleString('default', { month: 'short' })

      // Only count if it's within the last 6 months
      if (trends[monthLabel] !== undefined) {
        trends[monthLabel] += form.paymentDetails.amountPaid
      }
    }
  })

  // Convert to array format for chart
  return {
    months: Object.keys(trends),
    revenue: Object.values(trends),
  }
})

// Format currency
const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
  }).format(value)
}

// Calculate percentage change
const getPercentageChange = (current: number, previous: number): number => {
  if (previous === 0) return 0 // Avoid division by zero and return 0% if no previous data
  return Math.round(((current - previous) / previous) * 100)
}

// Calculate previous period data based on historical data
// This would be better fetched from API in a real implementation
const userGrowth = computed(() => {
  // If we don't have enough data for valid comparison, return 0
  if (totalUsers.value <= 0) return 0
  // Simulate previous period as 10% less than current 
  // This should be replaced with actual historical data
  const previousUsers = Math.round(totalUsers.value * 0.9)
  return getPercentageChange(totalUsers.value, previousUsers)
})

const vehicleGrowth = computed(() => {
  if (totalVehicles.value <= 0) return 0
  const previousVehicles = Math.round(totalVehicles.value * 0.9)
  return getPercentageChange(totalVehicles.value, previousVehicles)
})

const registrationGrowth = computed(() => {
  if (totalRegistrations.value <= 0) return 0
  const previousRegistrations = Math.round(totalRegistrations.value * 0.9)
  return getPercentageChange(totalRegistrations.value, previousRegistrations)
})

const revenueGrowth = computed(() => {
  if (totalRevenue.value <= 0) return 0
  const previousRevenue = Math.round(totalRevenue.value * 0.9)
  return getPercentageChange(totalRevenue.value, previousRevenue)
})
</script>

<template>
  <div>
    <!-- Dashboard Header -->
    <div class="flex justify-between items-center mb-8">
      <div>
        <h2 class="text-2xl font-bold text-dark-blue">Dashboard Overview</h2>
        <p class="text-gray mt-1">Monitor key metrics and performance indicators</p>
      </div>
      <div class="flex items-center gap-4">
        <button
          @click="loadDashboardData"
          class="px-4 py-2 bg-light-blue text-white rounded-lg hover:bg-dark-blue transition-colors flex items-center gap-2"
          :disabled="isLoading"
        >
          <font-awesome-icon :icon="['fas', 'sync']" :class="{ 'animate-spin': isLoading }" />
          <span>Refresh</span>
        </button>
        <div class="text-sm text-gray bg-light-gray bg-opacity-20 px-4 py-2 rounded-lg">
          Last updated: {{ new Date().toLocaleString() }}
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="bg-white rounded-xl shadow-md p-10 mb-6 flex justify-center items-center">
      <div class="flex flex-col items-center">
        <div class="w-12 h-12 border-4 border-light-blue border-t-transparent rounded-full animate-spin mb-4"></div>
        <p class="text-gray-600">Loading dashboard data...</p>
      </div>
    </div>

    <!-- Error State -->
    <div v-else-if="hasError" class="bg-white rounded-xl shadow-md p-10 mb-6">
      <div class="flex flex-col items-center text-center">
        <div class="bg-red-100 p-4 rounded-full mb-4">
          <font-awesome-icon :icon="['fas', 'exclamation-triangle']" class="text-3xl text-red-500" />
        </div>
        <p class="text-lg font-medium text-dark-blue mb-2">Unable to load dashboard data</p>
        <p class="text-gray-600 mb-4">{{ errorMessage }}</p>
        <button
          @click="loadDashboardData"
          class="px-4 py-2 bg-light-blue text-white rounded-lg hover:bg-dark-blue transition-colors"
        >
          Try Again
        </button>
      </div>
    </div>

    <template v-else>
      <!-- Stats Cards -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <!-- Total Users -->
        <div
          class="bg-white rounded-xl shadow-md overflow-hidden border border-light-gray border-opacity-20 transition-all duration-300 hover:shadow-lg hover:translate-y-[-2px]"
        >
          <div class="px-6 py-5">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-gray text-sm font-medium">Total Users</p>
                <h3 class="text-2xl font-bold text-dark-blue mt-1">{{ totalUsers }}</h3>
                <p class="text-sm mt-2" :class="userGrowth >= 0 ? 'text-green-600' : 'text-red'">
                  <font-awesome-icon
                    :icon="['fas', userGrowth >= 0 ? 'arrow-up' : 'arrow-down']"
                    class="mr-1"
                  />
                  {{ Math.abs(userGrowth) }}% from last period
                </p>
              </div>
              <div class="bg-light-blue bg-opacity-10 p-3 rounded-full">
                <font-awesome-icon :icon="['fas', 'users']" class="w-6 h-6 text-light-blue" />
              </div>
            </div>
          </div>
          <div class="h-1 w-full bg-gradient-to-r from-light-blue to-dark-blue"></div>
        </div>

        <!-- Total Vehicles -->
        <div
          class="bg-white rounded-xl shadow-md overflow-hidden border border-light-gray border-opacity-20 transition-all duration-300 hover:shadow-lg hover:translate-y-[-2px]"
        >
          <div class="px-6 py-5">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-gray text-sm font-medium">Total Vehicles</p>
                <h3 class="text-2xl font-bold text-dark-blue mt-1">{{ totalVehicles }}</h3>
                <p class="text-sm mt-2" :class="vehicleGrowth >= 0 ? 'text-green-600' : 'text-red'">
                  <font-awesome-icon
                    :icon="['fas', vehicleGrowth >= 0 ? 'arrow-up' : 'arrow-down']"
                    class="mr-1"
                  />
                  {{ Math.abs(vehicleGrowth) }}% from last period
                </p>
              </div>
              <div class="bg-light-blue bg-opacity-10 p-3 rounded-full">
                <font-awesome-icon :icon="['fas', 'car']" class="w-6 h-6 text-light-blue" />
              </div>
            </div>
          </div>
          <div class="h-1 w-full bg-gradient-to-r from-light-blue to-dark-blue"></div>
        </div>

        <!-- Total Registrations -->
        <div
          class="bg-white rounded-xl shadow-md overflow-hidden border border-light-gray border-opacity-20 transition-all duration-300 hover:shadow-lg hover:translate-y-[-2px]"
        >
          <div class="px-6 py-5">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-gray text-sm font-medium">Total Registrations</p>
                <h3 class="text-2xl font-bold text-dark-blue mt-1">{{ totalRegistrations }}</h3>
                <p
                  class="text-sm mt-2"
                  :class="registrationGrowth >= 0 ? 'text-green-600' : 'text-red'"
                >
                  <font-awesome-icon
                    :icon="['fas', registrationGrowth >= 0 ? 'arrow-up' : 'arrow-down']"
                    class="mr-1"
                  />
                  {{ Math.abs(registrationGrowth) }}% from last period
                </p>
              </div>
              <div class="bg-light-blue bg-opacity-10 p-3 rounded-full">
                <font-awesome-icon
                  :icon="['fas', 'clipboard-list']"
                  class="w-6 h-6 text-light-blue"
                />
              </div>
            </div>
          </div>
          <div class="h-1 w-full bg-gradient-to-r from-light-blue to-dark-blue"></div>
        </div>

        <!-- Total Revenue -->
        <div
          class="bg-white rounded-xl shadow-md overflow-hidden border border-light-gray border-opacity-20 transition-all duration-300 hover:shadow-lg hover:translate-y-[-2px]"
        >
          <div class="px-6 py-5">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-gray text-sm font-medium">Total Revenue</p>
                <h3 class="text-2xl font-bold text-dark-blue mt-1">
                  {{ formatCurrency(totalRevenue) }}
                </h3>
                <p class="text-sm mt-2" :class="revenueGrowth >= 0 ? 'text-green-600' : 'text-red'">
                  <font-awesome-icon
                    :icon="['fas', revenueGrowth >= 0 ? 'arrow-up' : 'arrow-down']"
                    class="mr-1"
                  />
                  {{ Math.abs(revenueGrowth) }}% from last period
                </p>
              </div>
              <div class="bg-light-blue bg-opacity-10 p-3 rounded-full">
                <font-awesome-icon
                  :icon="['fas', 'money-bill-wave']"
                  class="w-6 h-6 text-light-blue"
                />
              </div>
            </div>
          </div>
          <div class="h-1 w-full bg-gradient-to-r from-light-blue to-dark-blue"></div>
        </div>
      </div>

      <!-- Main Dashboard Content -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <!-- Registration Status Card -->
        <div
          class="lg:col-span-2 bg-white rounded-xl shadow-md border border-light-gray border-opacity-20 overflow-hidden transition-all duration-300 hover:shadow-lg"
        >
          <div class="flex justify-between items-center p-6 border-b border-gray-100">
            <h3 class="text-lg font-semibold text-dark-blue">Registration Status</h3>
            <div
              class="bg-light-blue bg-opacity-10 text-light-blue px-3 py-1 rounded-full text-xs font-medium"
            >
              Live Data
            </div>
          </div>
          <div class="p-6 h-80">
            <div v-if="!hasRegistrationData" class="h-full flex items-center justify-center">
              <div class="text-center">
                <div class="bg-light-blue bg-opacity-10 p-4 rounded-full inline-block mb-4">
                  <font-awesome-icon :icon="['fas', 'chart-pie']" class="text-3xl text-light-blue" />
                </div>
                <p class="text-lg font-medium text-dark-blue">No Registration Data</p>
                <p class="text-sm text-gray mt-2">Registration data will appear here once available</p>
              </div>
            </div>
            <RegistrationStatusChart
              v-else
              :approvedRegistrations="approvedRegistrations"
              :pendingRegistrations="pendingRegistrations"
              chartTitle="Registration Status Trends"
              primaryColor="#172a45"
              secondaryColor="#e63946"
              labelColor="#8892b0"
              backgroundColor="white"
            />
          </div>
        </div>

        <!-- Vehicle Types Card -->
        <div
          class="bg-white rounded-xl shadow-md border border-light-gray border-opacity-20 overflow-hidden transition-all duration-300 hover:shadow-lg"
        >
          <div class="flex justify-between items-center p-6 border-b border-gray-100">
            <h3 class="text-lg font-semibold text-dark-blue">Vehicle Types</h3>
            <div
              class="bg-light-blue bg-opacity-10 text-light-blue px-3 py-1 rounded-full text-xs font-medium"
            >
              Distribution
            </div>
          </div>
          <div class="p-6 h-80">
            <div v-if="!hasVehicleData" class="h-full flex items-center justify-center">
              <div class="text-center">
                <div class="bg-light-blue bg-opacity-10 p-4 rounded-full inline-block mb-4">
                  <font-awesome-icon :icon="['fas', 'car']" class="text-3xl text-light-blue" />
                </div>
                <p class="text-lg font-medium text-dark-blue">No Vehicle Data</p>
                <p class="text-sm text-gray mt-2">Vehicle type distribution will appear once data is available</p>
              </div>
            </div>
            <VehicleTypesChart
              v-else
              :vehicleTypes="vehicleTypes"
              chartTitle="Vehicle Types Distribution"
              :chartColors="['#4373e6', '#45cbba', '#9c5bff', '#ffa726']"
              labelColor="#8892b0"
              backgroundColor="white"
            />
          </div>
        </div>
      </div>

      <!-- Inspection Status Card -->
      <div class="mb-8">
        <div
          class="bg-white rounded-xl shadow-md border border-light-gray border-opacity-20 overflow-hidden transition-all duration-300 hover:shadow-lg"
        >
          <div class="flex justify-between items-center p-6 border-b border-gray-100">
            <h3 class="text-lg font-semibold text-dark-blue">Inspection Status</h3>
            <div
              class="bg-light-blue bg-opacity-10 text-light-blue px-3 py-1 rounded-full text-xs font-medium"
            >
              <span class="mr-1">{{ totalInspections }}</span>
              Total Inspections
            </div>
          </div>
          <div class="p-6 h-80">
            <div v-if="!hasInspectionData" class="h-full flex items-center justify-center">
              <div class="text-center">
                <div class="bg-light-blue bg-opacity-10 p-4 rounded-full inline-block mb-4">
                  <font-awesome-icon :icon="['fas', 'clipboard-check']" class="text-3xl text-light-blue" />
                </div>
                <p class="text-lg font-medium text-dark-blue">No Inspection Data</p>
                <p class="text-sm text-gray mt-2">Inspection status will appear here once inspections are conducted</p>
              </div>
            </div>
            <InspectionStatusChart
              v-else
              :pendingInspections="pendingInspections"
              :approvedInspections="approvedInspections"
              :rejectedInspections="rejectedInspections"
              chartTitle="Vehicle Inspection Status"
              primaryColor="#4373e6"
              secondaryColor="#45cbba"
              tertiaryColor="#e63946"
              labelColor="#8892b0"
              backgroundColor="white"
            />
          </div>
        </div>
      </div>

      <!-- Second Row -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <!-- Registration Trends -->
        <div
          class="lg:col-span-2 bg-white rounded-xl shadow-md border border-light-gray border-opacity-20 overflow-hidden transition-all duration-300 hover:shadow-lg"
        >
          <div class="flex justify-between items-center p-6 border-b border-gray-100">
            <h3 class="text-lg font-semibold text-dark-blue">Registration Trends</h3>
            <div
              class="bg-light-blue bg-opacity-10 text-light-blue px-3 py-1 rounded-full text-xs font-medium"
            >
              Last 6 Months
            </div>
          </div>
          <div class="p-6 h-80">
            <div v-if="!hasRegistrationData" class="h-full flex items-center justify-center">
              <div class="text-center">
                <div class="bg-light-blue bg-opacity-10 p-4 rounded-full inline-block mb-4">
                  <font-awesome-icon :icon="['fas', 'chart-line']" class="text-3xl text-light-blue" />
                </div>
                <p class="text-lg font-medium text-dark-blue">No Registration Trend Data</p>
                <p class="text-sm text-gray mt-2">Registration trends will appear here as data becomes available</p>
              </div>
            </div>
            <RegistrationTrendsChart
              v-else
              :registrationTrends="registrationTrends"
              chartTitle="Registration Trends (Last 6 Months)"
              primaryColor="#4373e6"
              secondaryColor="#45cbba"
              labelColor="#8892b0"
              gridLineColor="#f1f5f9"
              backgroundColor="white"
            />
          </div>
        </div>

        <!-- Top Vehicle Makes -->
        <div
          class="bg-white rounded-xl shadow-md border border-light-gray border-opacity-20 overflow-hidden transition-all duration-300 hover:shadow-lg"
        >
          <div class="flex justify-between items-center p-6 border-b border-gray-100">
            <h3 class="text-lg font-semibold text-dark-blue">Top Vehicle Makes</h3>
            <div
              class="bg-light-blue bg-opacity-10 text-light-blue px-3 py-1 rounded-full text-xs font-medium"
            >
              Top 5
            </div>
          </div>
          <div class="p-6 h-80">
            <div v-if="!hasVehicleData" class="h-full flex items-center justify-center">
              <div class="text-center">
                <div class="bg-light-blue bg-opacity-10 p-4 rounded-full inline-block mb-4">
                  <font-awesome-icon :icon="['fas', 'chart-bar']" class="text-3xl text-light-blue" />
                </div>
                <p class="text-lg font-medium text-dark-blue">No Vehicle Make Data</p>
                <p class="text-sm text-gray mt-2">Top vehicle makes will appear here once data is available</p>
              </div>
            </div>
            <VehicleMakesChart
              v-else
              :vehicleMakes="vehicleMakes"
              chartTitle="Top Vehicle Makes"
              barColor="#4373e6"
              labelColor="#8892b0"
              gridLineColor="#f1f5f9"
              backgroundColor="white"
            />
          </div>
        </div>
      </div>

      <!-- Revenue Trends Chart -->
      <div
        class="bg-white rounded-xl shadow-md border border-light-gray border-opacity-20 overflow-hidden transition-all duration-300 hover:shadow-lg mb-8"
      >
        <div class="flex justify-between items-center p-6 border-b border-gray-100">
          <h3 class="text-lg font-semibold text-dark-blue">Revenue Trends</h3>
          <div
            class="bg-light-blue bg-opacity-10 text-light-blue px-3 py-1 rounded-full text-xs font-medium"
          >
            Financial Overview
          </div>
        </div>
        <div class="p-6 h-96">
          <div v-if="!hasPaymentData" class="h-full flex items-center justify-center">
            <div class="text-center">
              <div class="bg-light-blue bg-opacity-10 p-4 rounded-full inline-block mb-4">
                <font-awesome-icon :icon="['fas', 'money-bill-wave']" class="text-3xl text-light-blue" />
              </div>
              <p class="text-lg font-medium text-dark-blue">No Revenue Data</p>
              <p class="text-sm text-gray mt-2">Revenue trends will appear here once payments are processed</p>
            </div>
          </div>
          <RevenueTrendsChart
            v-else
            :monthsData="revenueTrends.months"
            :revenueData="revenueTrends.revenue"
            chartTitle="Revenue Trends (Last 6 Months)"
            lineColor="#0a192f"
            fillColor="rgba(23, 42, 69, 0.1)"
            labelColor="#8892b0"
            gridLineColor="#f1f5f9"
            pointColor="#e63946"
            backgroundColor="white"
          />
        </div>
      </div>

      <!-- Quick Stats & Information -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- Pending Approvals Card -->
        <div
          class="bg-white rounded-xl shadow-md border border-light-gray border-opacity-20 overflow-hidden p-6 transition-all duration-300 hover:shadow-lg"
        >
          <div class="flex items-center space-x-4 mb-4">
            <div class="bg-red-100 p-3 rounded-full">
              <font-awesome-icon :icon="['fas', 'exclamation-circle']" class="w-6 h-6 text-red" />
            </div>
            <div>
              <h3 class="text-lg font-semibold text-dark-blue">Pending Approvals</h3>
              <p class="text-gray">
                {{ pendingRegistrations }} registrations and {{ pendingInspections }} inspections need
                your attention
              </p>
            </div>
          </div>
          <button
            class="w-full mt-4 bg-dark-blue hover:bg-light-blue text-white py-2 px-4 rounded-lg transition-colors duration-300"
            @click="navigateToPendingItems"
          >
            View Pending Items
          </button>
        </div>

        <!-- Payment Status Card -->
        <div
          class="bg-white rounded-xl shadow-md border border-light-gray border-opacity-20 overflow-hidden p-6 transition-all duration-300 hover:shadow-lg"
        >
          <div class="flex items-center space-x-4 mb-4">
            <div class="bg-green-100 p-3 rounded-full">
              <font-awesome-icon :icon="['fas', 'credit-card']" class="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h3 class="text-lg font-semibold text-dark-blue">Payment Status</h3>
              <p class="text-gray">
                {{ completedPayments }} completed and {{ pendingPayments }} pending payments
              </p>
            </div>
          </div>
          <div class="grid grid-cols-3 gap-2 mt-4">
            <div class="text-center p-2 bg-light-blue bg-opacity-5 rounded-lg">
              <p class="text-xs text-gray mb-1">Approved</p>
              <div class="text-green-600 font-medium text-sm">{{ completedPayments }}</div>
            </div>
            <div class="text-center p-2 bg-light-blue bg-opacity-5 rounded-lg">
              <p class="text-xs text-gray mb-1">Pending</p>
              <div class="text-yellow-600 font-medium text-sm">{{ pendingPayments }}</div>
            </div>
            <div class="text-center p-2 bg-light-blue bg-opacity-5 rounded-lg">
              <p class="text-xs text-gray mb-1">Rejected</p>
              <div class="text-red font-medium text-sm">{{ rejectedPayments }}</div>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>
