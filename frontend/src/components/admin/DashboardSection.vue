<script setup>
import { computed, defineAsyncComponent } from 'vue'
import { useVehicleRegistrationStore } from '@/stores/vehicleRegistration'
import { useUserStore } from '@/stores/user'

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

const vehicleStore = useVehicleRegistrationStore()
const userStore = useUserStore()

// Get data for statistics
const totalUsers = computed(
  () => userStore.mockUsers.filter((user) => user.role !== 'admin').length,
)
const totalVehicles = computed(() => vehicleStore.vehicles.length)
const totalRegistrations = computed(() => vehicleStore.registrations.length)
const pendingRegistrations = computed(() => vehicleStore.pendingRegistrations.length)
const approvedRegistrations = computed(
  () => vehicleStore.registrations.filter((reg) => reg.status === 'Approved').length,
)

// Vehicle types distribution for pie chart
const vehicleTypes = computed(() => {
  const types = {}
  vehicleStore.vehicles.forEach((vehicle) => {
    const type = vehicle.vehicleType || 'Unknown'
    types[type] = (types[type] || 0) + 1
  })
  return Object.entries(types).map(([label, value]) => ({ label, value }))
})

// Vehicle makes distribution for bar chart
const vehicleMakes = computed(() => {
  const makes = {}
  vehicleStore.vehicles.forEach((vehicle) => {
    const make = vehicle.vehicleMake || 'Unknown'
    makes[make] = (makes[make] || 0) + 1
  })
  return Object.entries(makes)
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 5) // Top 5 makes
})

// Registration trends by month (last 6 months)
const registrationTrends = computed(() => {
  const trends = {}
  const now = new Date()

  // Initialize last 6 months
  for (let i = 5; i >= 0; i--) {
    const month = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const monthLabel = month.toLocaleString('default', { month: 'short' })
    trends[monthLabel] = { new: 0, renewal: 0 }
  }

  // Fill with data
  vehicleStore.registrations.forEach((reg) => {
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

// Calculate revenue from registrations
const totalRevenue = computed(() => {
  return vehicleStore.registrations.reduce((total, reg) => {
    return total + (reg.fees?.total || 0)
  }, 0)
})

// Format currency
const formatCurrency = (value) => {
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
  }).format(value)
}

// Calculate percentage change
const getPercentageChange = (current, previous) => {
  if (previous === 0) return 100
  return Math.round(((current - previous) / previous) * 100)
}

// Mock previous period data for comparison
const previousPeriodStats = {
  users: totalUsers.value - 2,
  vehicles: totalVehicles.value - 5,
  registrations: totalRegistrations.value - 8,
  revenue: totalRevenue.value - 10000,
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
</script>

<template>
  <div class="p-6">
    <div class="flex justify-between items-center mb-6">
      <h2 class="text-2xl font-semibold text-gray-800">Dashboard Overview</h2>
      <div class="text-sm text-gray-500">Last updated: {{ new Date().toLocaleString() }}</div>
    </div>

    <!-- Stats Cards -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <!-- Total Users -->
      <div class="bg-white rounded-xl shadow-md p-6 transition-all hover:shadow-lg">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-gray-500 text-sm">Total Users</p>
            <h3 class="text-2xl font-bold text-gray-900">{{ totalUsers }}</h3>
            <p class="text-sm mt-2" :class="userGrowth >= 0 ? 'text-green-600' : 'text-red-600'">
              <font-awesome-icon :icon="['fas', userGrowth >= 0 ? 'arrow-up' : 'arrow-down']" />
              {{ Math.abs(userGrowth) }}% from last period
            </p>
          </div>
          <div class="bg-blue-100 p-3 rounded-full">
            <font-awesome-icon :icon="['fas', 'users']" class="w-6 h-6 text-blue-600" />
          </div>
        </div>
      </div>

      <!-- Total Vehicles -->
      <div class="bg-white rounded-xl shadow-md p-6 transition-all hover:shadow-lg">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-gray-500 text-sm">Total Vehicles</p>
            <h3 class="text-2xl font-bold text-gray-900">{{ totalVehicles }}</h3>
            <p class="text-sm mt-2" :class="vehicleGrowth >= 0 ? 'text-green-600' : 'text-red-600'">
              <font-awesome-icon :icon="['fas', vehicleGrowth >= 0 ? 'arrow-up' : 'arrow-down']" />
              {{ Math.abs(vehicleGrowth) }}% from last period
            </p>
          </div>
          <div class="bg-green-100 p-3 rounded-full">
            <font-awesome-icon :icon="['fas', 'car']" class="w-6 h-6 text-green-600" />
          </div>
        </div>
      </div>

      <!-- Total Registrations -->
      <div class="bg-white rounded-xl shadow-md p-6 transition-all hover:shadow-lg">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-gray-500 text-sm">Total Registrations</p>
            <h3 class="text-2xl font-bold text-gray-900">{{ totalRegistrations }}</h3>
            <p
              class="text-sm mt-2"
              :class="registrationGrowth >= 0 ? 'text-green-600' : 'text-red-600'"
            >
              <font-awesome-icon
                :icon="['fas', registrationGrowth >= 0 ? 'arrow-up' : 'arrow-down']"
              />
              {{ Math.abs(registrationGrowth) }}% from last period
            </p>
          </div>
          <div class="bg-purple-100 p-3 rounded-full">
            <font-awesome-icon :icon="['fas', 'clipboard-list']" class="w-6 h-6 text-purple-600" />
          </div>
        </div>
      </div>

      <!-- Total Revenue -->
      <div class="bg-white rounded-xl shadow-md p-6 transition-all hover:shadow-lg">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-gray-500 text-sm">Total Revenue</p>
            <h3 class="text-2xl font-bold text-gray-900">{{ formatCurrency(totalRevenue) }}</h3>
            <p class="text-sm mt-2" :class="revenueGrowth >= 0 ? 'text-green-600' : 'text-red-600'">
              <font-awesome-icon :icon="['fas', revenueGrowth >= 0 ? 'arrow-up' : 'arrow-down']" />
              {{ Math.abs(revenueGrowth) }}% from last period
            </p>
          </div>
          <div class="bg-yellow-100 p-3 rounded-full">
            <font-awesome-icon :icon="['fas', 'money-bill-wave']" class="w-6 h-6 text-yellow-600" />
          </div>
        </div>
      </div>
    </div>

    <!-- Charts Overview - 1x1 Grid Layout -->
    <div class="grid grid-cols-1 gap-8 mb-10">
      <!-- Registration Status Card -->
      <div
        class="bg-white rounded-xl shadow-lg p-8 transform transition-all duration-300 hover:shadow-xl hover:scale-[1.01]"
      >
        <h3 class="text-xl font-semibold text-gray-800 mb-6">Registration Status</h3>
        <div class="h-96">
          <RegistrationStatusChart
            :approvedRegistrations="approvedRegistrations"
            :pendingRegistrations="pendingRegistrations"
            :totalRegistrations="totalRegistrations"
          />
        </div>
      </div>

      <!-- Vehicle Types Distribution -->
      <div
        class="bg-white rounded-xl shadow-lg p-8 transform transition-all duration-300 hover:shadow-xl hover:scale-[1.01]"
      >
        <h3 class="text-xl font-semibold text-gray-800 mb-6">Vehicle Types</h3>
        <div class="h-96">
          <VehicleTypesChart :vehicleTypes="vehicleTypes" />
        </div>
      </div>

      <!-- Registration Trends Chart -->
      <div
        class="bg-white rounded-xl shadow-lg p-8 transform transition-all duration-300 hover:shadow-xl hover:scale-[1.01]"
      >
        <h3 class="text-xl font-semibold text-gray-800 mb-6">
          Registration Trends (Last 6 Months)
        </h3>
        <div class="h-96">
          <RegistrationTrendsChart :registrationTrends="registrationTrends" />
        </div>
      </div>

      <!-- Top Vehicle Makes -->
      <div
        class="bg-white rounded-xl shadow-lg p-8 transform transition-all duration-300 hover:shadow-xl hover:scale-[1.01]"
      >
        <h3 class="text-xl font-semibold text-gray-800 mb-6">Top Vehicle Makes</h3>
        <div class="h-96">
          <VehicleMakesChart :vehicleMakes="vehicleMakes" />
        </div>
      </div>
    </div>

    <!-- Revenue Trends Chart -->
    <div
      class="bg-white rounded-xl shadow-lg p-8 mb-10 transform transition-all duration-300 hover:shadow-xl hover:scale-[1.01]"
    >
      <h3 class="text-xl font-semibold text-gray-800 mb-6">Revenue Trends (Last 6 Months)</h3>
      <div class="h-96">
        <RevenueTrendsChart :registrationTrends="registrationTrends" />
      </div>
    </div>

    <!-- Recent Activity and Quick Actions -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Recent Registrations -->
      <div class="bg-white rounded-xl shadow-md p-6 lg:col-span-2">
        <h3 class="text-lg font-semibold text-gray-800 mb-4">Recent Registrations</h3>
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th
                  class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Vehicle
                </th>
                <th
                  class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Type
                </th>
                <th
                  class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Date
                </th>
                <th
                  class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Status
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr
                v-for="(reg, index) in vehicleStore.registrationsWithDetails.slice(0, 5)"
                :key="index"
                class="hover:bg-gray-50"
              >
                <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                  {{ reg.vehicleInfo }}
                </td>
                <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                  {{ reg.registrationType }}
                </td>
                <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                  {{ reg.submissionDate }}
                </td>
                <td class="px-4 py-3 whitespace-nowrap text-sm">
                  <span
                    :class="[
                      'px-2 py-1 rounded-full text-xs font-medium',
                      reg.status === 'Approved'
                        ? 'bg-green-100 text-green-800'
                        : reg.status === 'Pending'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-gray-100 text-gray-800',
                    ]"
                  >
                    {{ reg.status }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="bg-white rounded-xl shadow-md p-6">
        <h3 class="text-lg font-semibold text-gray-800 mb-4">Quick Navigation</h3>
        <div class="space-y-3">
          <button
            @click="$emit('change-section', 'users')"
            class="w-full flex items-center justify-between p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
          >
            <span class="flex items-center">
              <font-awesome-icon :icon="['fas', 'users']" class="w-5 h-5 text-blue-600 mr-3" />
              <span class="text-sm font-medium text-gray-700">Manage Users</span>
            </span>
            <font-awesome-icon :icon="['fas', 'chevron-right']" class="w-4 h-4 text-gray-400" />
          </button>

          <button
            @click="$emit('change-section', 'vehicles')"
            class="w-full flex items-center justify-between p-3 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
          >
            <span class="flex items-center">
              <font-awesome-icon :icon="['fas', 'car']" class="w-5 h-5 text-green-600 mr-3" />
              <span class="text-sm font-medium text-gray-700">Manage Vehicles</span>
            </span>
            <font-awesome-icon :icon="['fas', 'chevron-right']" class="w-4 h-4 text-gray-400" />
          </button>

          <button
            @click="$emit('change-section', 'plates')"
            class="w-full flex items-center justify-between p-3 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
          >
            <span class="flex items-center">
              <font-awesome-icon :icon="['fas', 'id-card']" class="w-5 h-5 text-purple-600 mr-3" />
              <span class="text-sm font-medium text-gray-700">Manage Plates</span>
            </span>
            <font-awesome-icon :icon="['fas', 'chevron-right']" class="w-4 h-4 text-gray-400" />
          </button>

          <button
            @click="$emit('change-section', 'registrations')"
            class="w-full flex items-center justify-between p-3 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
          >
            <span class="flex items-center">
              <font-awesome-icon
                :icon="['fas', 'clipboard-list']"
                class="w-5 h-5 text-red-600 mr-3"
              />
              <span class="text-sm font-medium text-gray-700">Registrations</span>
            </span>
            <font-awesome-icon :icon="['fas', 'chevron-right']" class="w-4 h-4 text-gray-400" />
          </button>

          <button
            @click="$emit('change-section', 'pending-registrations')"
            class="w-full flex items-center justify-between p-3 bg-yellow-50 rounded-lg hover:bg-yellow-100 transition-colors"
          >
            <span class="flex items-center">
              <font-awesome-icon :icon="['fas', 'clock']" class="w-5 h-5 text-yellow-600 mr-3" />
              <span class="text-sm font-medium text-gray-700">Pending Registrations</span>
            </span>
            <font-awesome-icon :icon="['fas', 'chevron-right']" class="w-4 h-4 text-gray-400" />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
