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
    default: '#4373e6', // blue from theme
  },
  labelColor: {
    type: String,
    default: '#8892b0', // gray from theme
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
  return !props.vehicleMakes || props.vehicleMakes.length === 0 || 
    props.vehicleMakes.every(make => make.value === 0)
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
  if (isEmpty.value) {
    return {
      labels: ['No Data'],
      datasets: [
        {
          label: 'No vehicle makes data available',
          data: [0],
          backgroundColor: '#f1f1f1',
          borderRadius: 6,
          borderWidth: 0,
        },
      ],
    }
  }
  
  return {
    labels: props.vehicleMakes.map((make) => make.label),
    datasets: [
      {
        label: 'Vehicle Makes',
        data: props.vehicleMakes.map((make) => make.value),
        backgroundColor: props.barColor,
        borderRadius: 6,
        borderWidth: 0,
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
        display: false,
      },
      title: {
        display: true,
        text: isEmpty.value ? 'No Vehicle Makes Data' : props.chartTitle,
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
        cornerRadius: 8,
        callbacks: {
          label: function (context) {
            if (isEmpty.value) return 'No data available'
            return `${context.raw} vehicles`
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
          text: 'Count',
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
            size: 12,
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

// Sort makes by number of vehicles (descending)
const sortedMakes = computed(() => {
  return [...props.vehicleMakes].sort((a, b) => b.value - a.value).slice(0, 5)
})
</script>

<template>
  <div class="h-full">
    <Bar :data="chartData" :options="chartOptions" />
  </div>
</template>
