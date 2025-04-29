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
    default: 'Registration Trends',
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
    default: '#8892b0', // gray
  },
  gridLineColor: {
    type: String,
    default: '#f1f5f9', // light gray
  },
  backgroundColor: {
    type: String,
    default: 'white',
  },
})

// Check if data is empty
const isEmpty = computed(() => {
  return !props.registrationTrends || 
    props.registrationTrends.length === 0 || 
    props.registrationTrends.every(trend => trend.new === 0 && trend.renewal === 0)
})

// Calculate total registrations
const totalRegistrations = computed(() => {
  if (isEmpty.value) return 0
  
  return props.registrationTrends.reduce(
    (total, item) => total + item.new + item.renewal,
    0
  )
})

// Calculate new registrations total
const totalNew = computed(() => {
  if (isEmpty.value) return 0
  return props.registrationTrends.reduce((total, item) => total + item.new, 0)
})

// Calculate renewal registrations total
const totalRenewal = computed(() => {
  if (isEmpty.value) return 0
  return props.registrationTrends.reduce((total, item) => total + item.renewal, 0)
})

// Chart data
const chartData = computed(() => {
  if (isEmpty.value) {
    return {
      labels: ['No Data'],
      datasets: [
        {
          label: 'No registration data available',
          data: [0],
          backgroundColor: '#f1f1f1',
          borderRadius: 6,
          borderWidth: 0,
        }
      ],
    }
  }
  
  return {
    labels: props.registrationTrends.map((trend) => trend.month),
    datasets: [
      {
        label: 'New Registrations',
        data: props.registrationTrends.map((trend) => trend.new),
        backgroundColor: props.primaryColor,
        borderRadius: 6,
        borderWidth: 0,
        maxBarThickness: 25,
      },
      {
        label: 'Renewals',
        data: props.registrationTrends.map((trend) => trend.renewal),
        backgroundColor: props.secondaryColor,
        borderRadius: 6,
        borderWidth: 0,
        maxBarThickness: 25,
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
          boxWidth: 12,
          boxHeight: 12,
          usePointStyle: true,
          pointStyle: 'circle',
          padding: 20,
          color: props.labelColor,
          font: {
            family: 'Inter, sans-serif',
            size: 12,
          },
        },
      },
      title: {
        display: true,
        text: isEmpty.value ? 'No Registration Data' : props.chartTitle,
        font: {
          family: 'Inter, sans-serif',
          size: 16,
          weight: 'bold',
        },
        color: props.labelColor,
        padding: {
          bottom: 20,
        },
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
        boxWidth: 10,
        boxHeight: 10,
        boxPadding: 3,
        cornerRadius: 8,
        callbacks: {
          label: function (context) {
            if (isEmpty.value) return 'No data available'
            
            let label = context.dataset.label || ''
            if (label) {
              label += ': '
            }
            label += context.parsed.y
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
        title: {
          display: true,
          text: 'Number of Registrations',
          color: props.labelColor,
          font: {
            family: 'Inter, sans-serif',
            size: 12,
            weight: 'normal',
          },
        },
      },
      x: {
        grid: {
          display: false,
          drawBorder: false,
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
</script>

<template>
  <div class="w-full h-full flex flex-col">
    <div class="flex-1">
      <Bar :data="chartData" :options="chartOptions" />
    </div>

    <div v-if="!isEmpty" class="mt-6 grid grid-cols-3 gap-4">
      <div class="p-4 rounded-lg bg-gray-50 shadow-sm">
        <div class="text-sm font-medium text-gray">Total Registrations</div>
        <div class="text-2xl font-bold text-dark-blue">{{ totalRegistrations }}</div>
        <div class="text-xs text-gray mt-1">Last 6 months</div>
      </div>

      <div class="p-4 rounded-lg shadow-sm" :style="`background-color: ${primaryColor}10`">
        <div class="flex items-center">
          <div class="w-3 h-3 rounded-full mr-2" :style="`background-color: ${primaryColor}`"></div>
          <div class="text-sm font-medium" :style="`color: ${primaryColor}`">New</div>
        </div>
        <div class="text-2xl font-bold text-dark-blue">{{ totalNew }}</div>
        <div class="text-xs text-gray mt-1">
          {{ totalRegistrations > 0 ? Math.round((totalNew / totalRegistrations) * 100) : 0 }}% of
          total
        </div>
      </div>

      <div class="p-4 rounded-lg shadow-sm" :style="`background-color: ${secondaryColor}10`">
        <div class="flex items-center">
          <div class="w-3 h-3 rounded-full mr-2" :style="`background-color: ${secondaryColor}`"></div>
          <div class="text-sm font-medium" :style="`color: ${secondaryColor}`">Renewals</div>
        </div>
        <div class="text-2xl font-bold text-dark-blue">{{ totalRenewal }}</div>
        <div class="text-xs text-gray mt-1">
          {{ totalRegistrations > 0 ? Math.round((totalRenewal / totalRegistrations) * 100) : 0 }}%
          of total
        </div>
      </div>
    </div>
  </div>
</template>
