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
  vehicleMakes: {
    type: Array,
    required: true,
  },
  chartTitle: {
    type: String,
    default: 'Top Vehicle Makes',
  },
  barColor: {
    type: String,
    default: '#4373e6', // blue
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

// Calculate total vehicles
const totalVehicles = computed(() => {
  return props.vehicleMakes.reduce((sum, make) => sum + make.value, 0)
})

// Calculate percentage for each make
const percentages = computed(() => {
  return props.vehicleMakes.map((make) => Math.round((make.value / totalVehicles.value) * 100))
})

// Chart data
const chartData = computed(() => {
  return {
    labels: props.vehicleMakes.map((make) => make.label),
    datasets: [
      {
        backgroundColor: props.barColor,
        hoverBackgroundColor: '#172a45',
        borderRadius: 6,
        maxBarThickness: 35,
        data: props.vehicleMakes.map((make) => make.value),
      },
    ],
  }
})

// Chart options
const chartOptions = computed(() => {
  return {
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: 'y',
    layout: {
      padding: {
        right: 10,
      },
    },
    plugins: {
      legend: {
        display: false,
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
        displayColors: false,
        cornerRadius: 8,
        callbacks: {
          label: function (context) {
            const value = context.raw
            const percentage = Math.round((value / totalVehicles.value) * 100)
            return `${value} vehicles (${percentage}%)`
          },
        },
      },
    },
    scales: {
      y: {
        grid: {
          display: false,
          drawBorder: false,
        },
        ticks: {
          font: {
            family: 'Inter, sans-serif',
            weight: 500,
            size: 12,
          },
          color: props.labelColor,
        },
      },
      x: {
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
    },
    animation: {
      duration: 1000,
      easing: 'easeOutQuart',
    },
  }
})

// Sort makes by number of vehicles (descending)
const sortedMakes = computed(() => {
  return [...props.vehicleMakes].sort((a, b) => b.value - a.value).slice(0, 5)
})
</script>

<template>
  <div class="w-full h-full flex flex-col">
    <div class="flex-1">
      <Bar :data="chartData" :options="chartOptions" />
    </div>

    <div class="mt-6 grid grid-cols-1 gap-2">
      <div class="flex items-center justify-between p-3 rounded-lg bg-gray-50 shadow-sm">
        <div class="flex items-center">
          <div class="h-5 w-5 rounded-md" :style="`background-color: ${barColor}`"></div>
          <div class="ml-3">
            <div class="text-sm font-medium text-dark-blue">Most Popular</div>
            <div class="text-xs text-gray">
              {{ vehicleMakes.length > 0 ? vehicleMakes[0].label : 'N/A' }}
            </div>
          </div>
        </div>
        <div class="text-right">
          <div class="text-xl font-bold text-dark-blue">
            {{ vehicleMakes.length > 0 ? vehicleMakes[0].value : 0 }}
          </div>
          <div class="text-xs text-gray">
            {{
              vehicleMakes.length > 0 && totalVehicles > 0
                ? Math.round((vehicleMakes[0].value / totalVehicles) * 100)
                : 0
            }}% of total
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
