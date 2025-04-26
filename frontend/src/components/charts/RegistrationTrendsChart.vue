<script setup>
import { computed } from 'vue'
import { Bar } from 'vue-chartjs'
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale,
} from 'chart.js'

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

const props = defineProps({
  registrationTrends: {
    type: Array,
    required: true,
  },
  chartTitle: {
    type: String,
    default: 'Registration Trends (Last 6 Months)',
  },
  primaryColor: {
    type: String,
    default: '#4373e6', // blue
  },
  secondaryColor: {
    type: String,
    default: '#45cbba', // teal
  },
  labelColor: {
    type: String,
    default: '#8892b0', // gray from theme
  },
  gridLineColor: {
    type: String,
    default: '#f1f5f9', // light gray for grid lines
  },
  backgroundColor: {
    type: String,
    default: 'white',
  },
})

// Chart data
const chartData = computed(() => {
  return {
    labels: props.registrationTrends.map((item) => item.month),
    datasets: [
      {
        label: 'New Registration',
        backgroundColor: props.primaryColor,
        borderRadius: 4,
        maxBarThickness: 22,
        data: props.registrationTrends.map((item) => item.new),
      },
      {
        label: 'Renewal',
        backgroundColor: props.secondaryColor,
        borderRadius: 4,
        maxBarThickness: 22,
        data: props.registrationTrends.map((item) => item.renewal),
      },
    ],
  }
})

// Chart options
const chartOptions = computed(() => {
  return {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        align: 'end',
        labels: {
          usePointStyle: true,
          pointStyle: 'rectRounded',
          boxWidth: 10,
          boxHeight: 10,
          padding: 20,
          font: {
            family: 'Inter, sans-serif',
            size: 12,
          },
          color: props.labelColor,
        },
      },
      title: {
        display: false,
      },
      tooltip: {
        backgroundColor: '#0a192f',
        titleColor: 'white',
        bodyColor: 'white',
        bodyFont: {
          family: 'Inter, sans-serif',
          size: 13,
        },
        titleFont: {
          family: 'Inter, sans-serif',
          size: 14,
          weight: 'bold',
        },
        padding: 12,
        displayColors: true,
        boxWidth: 8,
        boxHeight: 8,
        cornerRadius: 8,
        callbacks: {
          label: function (context) {
            let label = context.dataset.label || ''
            if (label) {
              label += ': '
            }
            label += context.raw || '0'
            return label
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: props.gridLineColor,
          drawBorder: false,
        },
        ticks: {
          font: {
            family: 'Inter, sans-serif',
            size: 11,
          },
          color: props.labelColor,
          precision: 0,
        },
      },
      x: {
        grid: {
          display: false,
        },
        ticks: {
          font: {
            family: 'Inter, sans-serif',
            size: 11,
          },
          color: props.labelColor,
        },
      },
    },
    animation: {
      duration: 1000,
      easing: 'easeOutQuart',
    },
  }
})

// Calculate totals
const totalNew = computed(() => {
  return props.registrationTrends.reduce((sum, item) => sum + item.new, 0)
})

const totalRenewal = computed(() => {
  return props.registrationTrends.reduce((sum, item) => sum + item.renewal, 0)
})

const totalRegistrations = computed(() => {
  return totalNew.value + totalRenewal.value
})
</script>

<template>
  <div class="w-full h-full flex flex-col">
    <div class="flex-1">
      <Bar :data="chartData" :options="chartOptions" />
    </div>

    <div class="mt-6 grid grid-cols-3 gap-4">
      <div class="p-4 rounded-lg bg-gray-50 shadow-sm">
        <div class="text-sm font-medium text-gray">Total</div>
        <div class="text-2xl font-bold text-dark-blue">{{ totalRegistrations }}</div>
        <div class="text-xs text-gray mt-1">All registrations</div>
      </div>

      <div class="p-4 rounded-lg shadow-sm" :style="`background-color: ${primaryColor}10`">
        <div class="text-sm font-medium" :style="`color: ${primaryColor}`">New</div>
        <div class="text-2xl font-bold text-dark-blue">{{ totalNew }}</div>
        <div class="text-xs text-gray mt-1">
          {{ totalRegistrations ? Math.round((totalNew / totalRegistrations) * 100) : 0 }}% of total
        </div>
      </div>

      <div class="p-4 rounded-lg shadow-sm" :style="`background-color: ${secondaryColor}10`">
        <div class="text-sm font-medium" :style="`color: ${secondaryColor}`">Renewal</div>
        <div class="text-2xl font-bold text-dark-blue">{{ totalRenewal }}</div>
        <div class="text-xs text-gray mt-1">
          {{ totalRegistrations ? Math.round((totalRenewal / totalRegistrations) * 100) : 0 }}% of
          total
        </div>
      </div>
    </div>
  </div>
</template>
