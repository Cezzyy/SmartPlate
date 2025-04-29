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
  vehicleTypes: {
    type: Array,
    required: true,
  },
  chartTitle: {
    type: String,
    default: 'Vehicle Types Distribution',
  },
  chartColors: {
    type: Array,
    default: () => ['#4373e6', '#45cbba', '#9c5bff', '#ffa726', '#e63946', '#0a192f'],
  },
  labelColor: {
    type: String,
    default: '#8892b0', // gray from theme
  },
  backgroundColor: {
    type: String,
    default: 'white',
  },
})

// Check if data is empty
const isEmpty = computed(() => {
  return !props.vehicleTypes || props.vehicleTypes.length === 0 || 
    props.vehicleTypes.every(type => type.value === 0)
})

// Calculate total vehicles
const totalVehicles = computed(() => {
  if (isEmpty.value) return 0
  return props.vehicleTypes.reduce((sum, type) => sum + type.value, 0)
})

// Chart data
const chartData = computed(() => {
  if (isEmpty.value) {
    // Return empty data structure for empty state
    return {
      labels: ['No Data'],
      datasets: [
        {
          backgroundColor: '#f1f1f1',
          borderRadius: 6,
          borderWidth: 0,
          maxBarThickness: 30,
          data: [0],
        },
      ],
    }
  }
  
  return {
    labels: props.vehicleTypes.map((type) => type.label),
    datasets: [
      {
        backgroundColor: props.chartColors,
        borderRadius: 6,
        borderWidth: 0,
        maxBarThickness: 30,
        data: props.vehicleTypes.map((type) => type.value),
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
        left: 10,
        right: 25,
        top: 0,
        bottom: 0,
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
        displayColors: true,
        boxWidth: 10,
        boxHeight: 10,
        boxPadding: 3,
        cornerRadius: 8,
        callbacks: {
          label: function (context) {
            const value = context.raw
            if (isEmpty.value || totalVehicles.value === 0) return 'No data'
            const percentage = Math.round((value / totalVehicles.value) * 100)
            return `${value} (${percentage}%)`
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
            size: 12,
          },
          color: props.labelColor,
        },
      },
      x: {
        grid: {
          color: '#f1f5f950',
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
</script>

<template>
  <div class="w-full h-full flex flex-col">
    <div class="flex-1 relative">
      <Bar :data="chartData" :options="chartOptions" />
    </div>

    <div v-if="!isEmpty" class="mt-6 grid grid-cols-4 gap-2">
      <div
        v-for="(type, index) in vehicleTypes.slice(0, 4)"
        :key="index"
        class="p-3 rounded-lg shadow-sm transition-all duration-300 hover:shadow"
        :style="`background-color: ${chartColors[index % chartColors.length]}10`"
      >
        <div class="flex justify-between items-center mb-1">
          <div
            class="text-sm font-medium truncate"
            :style="`color: ${chartColors[index % chartColors.length]}`"
          >
            {{ type.label }}
          </div>
          <div
            class="w-3 h-3 rounded-full"
            :style="`background-color: ${chartColors[index % chartColors.length]}`"
          ></div>
        </div>
        <div class="text-xl font-bold text-dark-blue">{{ type.value }}</div>
        <div class="text-xs text-gray mt-1">
          {{ Math.round((type.value / totalVehicles) * 100) }}%
        </div>
      </div>
    </div>
  </div>
</template>
