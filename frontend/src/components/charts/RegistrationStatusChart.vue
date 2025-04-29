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
  approvedRegistrations: {
    type: Number,
    required: true,
  },
  pendingRegistrations: {
    type: Number,
    required: true,
  },
  chartTitle: {
    type: String,
    default: 'Registration Status',
  },
  primaryColor: {
    type: String,
    default: '#172a45', // light-blue from theme
  },
  secondaryColor: {
    type: String,
    default: '#e63946', // red from theme
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
  return props.approvedRegistrations === 0 && props.pendingRegistrations === 0
})

// Calculate total registrations
const totalRegistrations = computed(() => props.approvedRegistrations + props.pendingRegistrations)

// Chart data
const chartData = computed(() => {
  if (isEmpty.value) {
    return {
      labels: ['No Data'],
      datasets: [
        {
          data: [1],
          backgroundColor: ['#f1f1f1'],
          borderRadius: 6,
          borderWidth: 0,
          maxBarThickness: 50,
        },
      ],
    }
  }
  
  return {
    labels: ['Approved', 'Pending'],
    datasets: [
      {
        data: [props.approvedRegistrations, props.pendingRegistrations],
        backgroundColor: [props.primaryColor, props.secondaryColor],
        borderRadius: 6,
        borderWidth: 0,
        maxBarThickness: 50,
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
            if (isEmpty.value) return 'No data available'
            const value = context.raw
            const percentage = Math.round((value / totalRegistrations.value) * 100)
            return `${value} (${percentage}%)`
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: '#f1f5f990',
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
            size: 12,
            weight: 500,
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

// Calculate percentages
const approvedPercentage = computed(() => {
  return totalRegistrations.value > 0
    ? Math.round((props.approvedRegistrations / totalRegistrations.value) * 100)
    : 0
})

const pendingPercentage = computed(() => {
  return totalRegistrations.value > 0
    ? Math.round((props.pendingRegistrations / totalRegistrations.value) * 100)
    : 0
})
</script>

<template>
  <div class="w-full h-full flex flex-col">
    <div class="flex-1">
      <Bar :data="chartData" :options="chartOptions" />
    </div>

    <div v-if="!isEmpty" class="mt-6 grid grid-cols-3 gap-4">
      <div class="p-4 rounded-lg bg-gray-50 shadow-sm">
        <div class="text-sm font-medium text-gray">Total</div>
        <div class="text-2xl font-bold text-dark-blue">{{ totalRegistrations }}</div>
        <div class="text-xs text-gray mt-1">100%</div>
      </div>

      <div class="p-4 rounded-lg shadow-sm" :style="`background-color: ${primaryColor}10`">
        <div class="flex items-center">
          <div class="w-3 h-3 rounded-sm mr-2" :style="`background-color: ${primaryColor}`"></div>
          <div class="text-sm font-medium" :style="`color: ${primaryColor}`">Approved</div>
        </div>
        <div class="text-2xl font-bold text-dark-blue">{{ approvedRegistrations }}</div>
        <div class="text-xs text-gray mt-1">{{ approvedPercentage }}%</div>
      </div>

      <div class="p-4 rounded-lg shadow-sm" :style="`background-color: ${secondaryColor}10`">
        <div class="flex items-center">
          <div class="w-3 h-3 rounded-sm mr-2" :style="`background-color: ${secondaryColor}`"></div>
          <div class="text-sm font-medium" :style="`color: ${secondaryColor}`">Pending</div>
        </div>
        <div class="text-2xl font-bold text-dark-blue">{{ pendingRegistrations }}</div>
        <div class="text-xs text-gray mt-1">{{ pendingPercentage }}%</div>
      </div>
    </div>
  </div>
</template>
