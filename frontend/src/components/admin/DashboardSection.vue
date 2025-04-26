<script setup lang="ts">
import { computed, defineAsyncComponent } from 'vue'
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

interface PreviodPeriodStats {
  users: number
  vehicles: number
  registrations: number
  revenue: number
  inspections: number
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

// Initialize stores
inspectionStore.initializeStore()
paymentStore.initializeStore()

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
  if (previous === 0) return 100
  return Math.round(((current - previous) / previous) * 100)
}

// Mock previous period data for comparison
const previousPeriodStats: PreviodPeriodStats = {
  users: totalUsers.value - 2,
  vehicles: totalVehicles.value - 5,
  registrations: totalRegistrations.value - 8,
  revenue: totalRevenue.value - 10000,
  inspections: totalInspections.value - 3,
}

// Calculate growth percentages
const userGrowth = computed(() => getPercentageChange(totalUsers.value, previousPeriodStats.users))
const vehicleGrowth = computed(() =>
  getPercentageChange(totalVehicles.value, previousPeriodStats.vehicles),
)
const registrationGrowth = computed(() =>
  getPercentageChange(totalRegistrations.value, previousPeriodStats.registrations),
)
const revenueGrowth = computed(() =>
  getPercentageChange(totalRevenue.value, previousPeriodStats.revenue),
)
const inspectionGrowth = computed(() =>
  getPercentageChange(totalInspections.value, previousPeriodStats.inspections),
)
</script>

<template>
  <div>
    <!-- Dashboard Header -->
    <div class="flex justify-between items-center mb-8">
      <div>
        <h2 class="text-2xl font-bold text-dark-blue">Dashboard Overview</h2>
        <p class="text-gray mt-1">Monitor key metrics and performance indicators</p>
      </div>
      <div class="text-sm text-gray bg-light-gray bg-opacity-20 px-4 py-2 rounded-lg">
        Last updated: {{ new Date().toLocaleString() }}
      </div>
    </div>

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
          <RegistrationStatusChart
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
          <VehicleTypesChart
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
          <InspectionStatusChart
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
          <RegistrationTrendsChart
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
          <VehicleMakesChart
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
        <RevenueTrendsChart
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
  </div>
</template>
