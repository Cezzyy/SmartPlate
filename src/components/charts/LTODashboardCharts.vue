<script setup lang="ts">
import { useVehicleRegistrationStore } from '@/stores/vehicleRegistration'
import { useVehicleRegistrationFormStore } from '@/stores/vehicleRegistrationForm'
import { computed, onMounted, ref, watch } from 'vue'
import { Chart, registerables } from 'chart.js'

Chart.register(...registerables)

const vehicleRegistrationStore = useVehicleRegistrationStore()
const registrationFormStore = useVehicleRegistrationFormStore()

// Store chart instances for cleanup/updates
const registrationStatusChart = ref<Chart | null>(null)
const plateStatusChart = ref<Chart | null>(null)
const dailyRegistrationChart = ref<Chart | null>(null)

// Chart colors with consistent theme
const chartColors = {
  primary: '#3B82F6', // blue-500
  secondary: '#10B981', // green-500
  tertiary: '#EF4444', // red-500
  quaternary: '#8B5CF6', // purple-500
  background: 'white',
  text: '#1F2937', // gray-800
  grid: '#F3F4F6', // gray-100
  pending: '#FBBF24', // amber-400
  ready: '#3B82F6', // blue-500
  issued: '#10B981', // green-500
}

// Get registration status data
const registrationStatusData = computed(() => {
  const statuses = {
    pending: registrationFormStore.forms.filter((form) => form.status === 'pending').length,
    approved: registrationFormStore.forms.filter((form) => form.status === 'approved').length,
    rejected: registrationFormStore.forms.filter((form) => form.status === 'rejected').length,
    completed: registrationFormStore.forms.filter((form) => form.status === 'completed').length,
    processing: registrationFormStore.forms.filter(
      (form) =>
        form.status !== 'pending' &&
        form.status !== 'approved' &&
        form.status !== 'rejected' &&
        form.status !== 'completed',
    ).length,
  }

  return {
    labels: ['Pending', 'Approved', 'Rejected', 'Completed', 'Processing'],
    data: [
      statuses.pending,
      statuses.approved,
      statuses.rejected,
      statuses.completed,
      statuses.processing,
    ],
    colors: [
      chartColors.pending,
      chartColors.primary,
      chartColors.tertiary,
      chartColors.secondary,
      chartColors.quaternary,
    ],
  }
})

// Get plate status data
const plateStatusData = computed(() => {
  const statuses = {
    pending: vehicleRegistrationStore.registrations.filter((reg) => reg.status === 'pending')
      .length,
    ready: vehicleRegistrationStore.registrations.filter((reg) => reg.status === 'ready').length,
    issued: vehicleRegistrationStore.registrations.filter((reg) => reg.status === 'issued').length,
  }

  return {
    labels: ['Pending', 'Ready', 'Issued'],
    data: [statuses.pending, statuses.ready, statuses.issued],
    colors: [chartColors.pending, chartColors.ready, chartColors.issued],
  }
})

// Get daily registrations data for the last 7 days
const getDailyRegistrations = computed(() => {
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date()
    date.setDate(date.getDate() - i)
    return {
      date: date,
      dateString: date.toISOString().split('T')[0],
      label: date.toLocaleDateString('en-US', { weekday: 'short' }),
    }
  }).reverse()

  return {
    labels: last7Days.map((day) => day.label),
    data: last7Days.map(
      (day) =>
        registrationFormStore.forms.filter(
          (form) => form.submissionDate.split('T')[0] === day.dateString,
        ).length,
    ),
  }
})

// Vehicle Type Distribution
const vehicleTypeData = computed(() => {
  const types: Record<string, number> = {}

  vehicleRegistrationStore.vehicles.forEach((vehicle) => {
    const type = vehicle.vehicleType || 'Unknown'
    types[type] = (types[type] || 0) + 1
  })

  const sortedTypes = Object.entries(types)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)

  return {
    labels: sortedTypes.map(([type]) => type),
    data: sortedTypes.map(([_, count]) => count),
    colors: [
      chartColors.primary,
      chartColors.secondary,
      chartColors.tertiary,
      chartColors.quaternary,
      '#F59E0B', // amber-500
    ],
  }
})

const initCharts = () => {
  // Destroy old charts if they exist
  if (registrationStatusChart.value) registrationStatusChart.value.destroy()
  if (plateStatusChart.value) plateStatusChart.value.destroy()
  if (dailyRegistrationChart.value) dailyRegistrationChart.value.destroy()

  // Registration Status Pie Chart
  registrationStatusChart.value = new Chart(
    document.getElementById('registrationStatusChart') as HTMLCanvasElement,
    {
      type: 'doughnut',
      data: {
        labels: registrationStatusData.value.labels,
        datasets: [
          {
            data: registrationStatusData.value.data,
            backgroundColor: registrationStatusData.value.colors,
            borderWidth: 1,
            borderColor: '#fff',
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '60%',
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              padding: 20,
              usePointStyle: true,
              pointStyle: 'circle',
              font: {
                size: 11,
              },
            },
          },
          tooltip: {
            callbacks: {
              label: function (context) {
                return `${context.label}: ${context.raw} (${Math.round((Number(context.raw) / context.dataset.data.reduce((a, b) => Number(a) + Number(b), 0)) * 100)}%)`
              },
            },
          },
        },
        animation: {
          animateScale: true,
          animateRotate: true,
        },
      },
    },
  )

  // Plate Status Bar Chart
  plateStatusChart.value = new Chart(
    document.getElementById('plateStatusChart') as HTMLCanvasElement,
    {
      type: 'bar',
      data: {
        labels: plateStatusData.value.labels,
        datasets: [
          {
            label: 'Number of Plates',
            data: plateStatusData.value.data,
            backgroundColor: plateStatusData.value.colors,
            borderRadius: 4,
            barThickness: 20,
            maxBarThickness: 35,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false,
          },
        },
        scales: {
          y: {
            beginAtZero: true,
            grid: {
              color: chartColors.grid,
            },
            ticks: {
              precision: 0,
            },
          },
          x: {
            grid: {
              display: false,
            },
          },
        },
      },
    },
  )

  // Daily Registration Line Chart
  dailyRegistrationChart.value = new Chart(
    document.getElementById('dailyRegistrationChart') as HTMLCanvasElement,
    {
      type: 'line',
      data: {
        labels: getDailyRegistrations.value.labels,
        datasets: [
          {
            label: 'Registrations',
            data: getDailyRegistrations.value.data,
            borderColor: chartColors.primary,
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            tension: 0.4,
            fill: true,
            borderWidth: 2,
            pointBackgroundColor: chartColors.primary,
            pointRadius: 4,
            pointHoverRadius: 6,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false,
          },
        },
        scales: {
          y: {
            beginAtZero: true,
            grid: {
              color: chartColors.grid,
            },
            ticks: {
              precision: 0,
            },
          },
          x: {
            grid: {
              display: false,
            },
          },
        },
      },
    },
  )
}

// Vehicle Types Chart
const initVehicleTypeChart = () => {
  // Vehicle Types Pie Chart
  new Chart(document.getElementById('vehicleTypeChart') as HTMLCanvasElement, {
    type: 'pie',
    data: {
      labels: vehicleTypeData.value.labels,
      datasets: [
        {
          data: vehicleTypeData.value.data,
          backgroundColor: vehicleTypeData.value.colors,
          borderWidth: 1,
          borderColor: '#fff',
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            padding: 20,
            usePointStyle: true,
            pointStyle: 'circle',
            font: {
              size: 11,
            },
          },
        },
        tooltip: {
          callbacks: {
            label: function (context) {
              return `${context.label}: ${context.raw} (${Math.round((Number(context.raw) / context.dataset.data.reduce((a, b) => Number(a) + Number(b), 0)) * 100)}%)`
            },
          },
        },
      },
      animation: {
        animateScale: true,
        animateRotate: true,
      },
    },
  })
}

// Watch for data changes and reinitialize charts
watch(
  [registrationStatusData, plateStatusData, getDailyRegistrations, vehicleTypeData],
  () => {
    // Wait for the next tick to ensure DOM is updated
    setTimeout(() => {
      initCharts()
      initVehicleTypeChart()
    }, 100)
  },
  { deep: true },
)

onMounted(() => {
  // Initialize charts
  initCharts()
  initVehicleTypeChart()
})
</script>

<template>
  <div class="mt-6">
    <!-- Charts Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
      <!-- Registration Status Chart -->
      <div
        class="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200 transition-all duration-300 hover:shadow-lg"
      >
        <div class="flex justify-between items-center p-6 border-b border-gray-100">
          <h3 class="text-lg font-semibold text-dark-blue">Registration Status</h3>
          <div
            class="bg-light-blue bg-opacity-10 text-light-blue px-3 py-1 rounded-full text-xs font-medium"
          >
            Distribution
          </div>
        </div>
        <div class="p-4 md:p-6 h-80">
          <canvas id="registrationStatusChart"></canvas>
        </div>
      </div>

      <!-- Vehicle Types Chart -->
      <div
        class="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200 transition-all duration-300 hover:shadow-lg"
      >
        <div class="flex justify-between items-center p-6 border-b border-gray-100">
          <h3 class="text-lg font-semibold text-dark-blue">Vehicle Types</h3>
          <div
            class="bg-light-blue bg-opacity-10 text-light-blue px-3 py-1 rounded-full text-xs font-medium"
          >
            Distribution
          </div>
        </div>
        <div class="p-4 md:p-6 h-80">
          <canvas id="vehicleTypeChart"></canvas>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <!-- Plate Status Chart -->
      <div
        class="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200 transition-all duration-300 hover:shadow-lg"
      >
        <div class="flex justify-between items-center p-6 border-b border-gray-100">
          <h3 class="text-lg font-semibold text-dark-blue">Plate Status</h3>
          <div
            class="bg-light-blue bg-opacity-10 text-light-blue px-3 py-1 rounded-full text-xs font-medium"
          >
            Current State
          </div>
        </div>
        <div class="p-4 md:p-6 h-80">
          <canvas id="plateStatusChart"></canvas>
        </div>
      </div>

      <!-- Daily Registrations Chart -->
      <div
        class="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200 transition-all duration-300 hover:shadow-lg"
      >
        <div class="flex justify-between items-center p-6 border-b border-gray-100">
          <h3 class="text-lg font-semibold text-dark-blue">Daily Registrations</h3>
          <div
            class="bg-light-blue bg-opacity-10 text-light-blue px-3 py-1 rounded-full text-xs font-medium"
          >
            Last 7 Days
          </div>
        </div>
        <div class="p-4 md:p-6 h-80">
          <canvas id="dailyRegistrationChart"></canvas>
        </div>
      </div>
    </div>
  </div>
</template>
