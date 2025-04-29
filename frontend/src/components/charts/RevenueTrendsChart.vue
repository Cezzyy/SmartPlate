<script setup>
import { computed } from 'vue'
import { Line } from 'vue-chartjs'
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  LineElement,
  LinearScale,
  PointElement,
  CategoryScale,
} from 'chart.js'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend)

const props = defineProps({
  monthsData: {
    type: Array,
    required: true,
  },
  revenueData: {
    type: Array,
    required: true,
  },
  chartTitle: {
    type: String,
    default: 'Revenue Trends',
  },
  lineColor: {
    type: String,
    default: '#0a192f', // dark blue
  },
  fillColor: {
    type: String,
    default: 'rgba(23, 42, 69, 0.1)', // transparent dark blue
  },
  labelColor: {
    type: String,
    default: '#8892b0', // grey
  },
  gridLineColor: {
    type: String,
    default: '#f1f5f9', // light grey
  },
  pointColor: {
    type: String,
    default: '#e63946', // red
  },
  backgroundColor: {
    type: String,
    default: 'white',
  },
})

// Check if data is empty
const isEmpty = computed(() => {
  return !props.revenueData || 
    props.revenueData.length === 0 || 
    props.revenueData.every(value => value === 0)
})

// Calculate total revenue
const totalRevenue = computed(() => {
  if (isEmpty.value) return 0
  return props.revenueData.reduce((sum, val) => sum + val, 0)
})

// Find average monthly revenue
const averageRevenue = computed(() => {
  if (isEmpty.value || props.revenueData.length === 0) return 0
  return totalRevenue.value / props.revenueData.length
})

// Format currency
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
  }).format(amount)
}

// Chart data
const chartData = computed(() => {
  if (isEmpty.value) {
    return {
      labels: ['No Data'],
      datasets: [
        {
          label: 'No revenue data available',
          data: [0],
          borderColor: '#f1f1f1',
          backgroundColor: '#f9f9f9',
          tension: 0.4,
          pointBackgroundColor: '#e2e2e2',
          pointBorderColor: '#ffffff',
          pointRadius: 4,
          pointHoverRadius: 6,
          fill: true,
        },
      ],
    }
  }
  
  return {
    labels: props.monthsData,
    datasets: [
      {
        label: 'Revenue',
        data: props.revenueData,
        borderColor: props.lineColor,
        backgroundColor: props.fillColor,
        tension: 0.4,
        pointBackgroundColor: props.pointColor,
        pointBorderColor: '#ffffff',
        pointRadius: 4,
        pointHoverRadius: 6,
        fill: true,
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
        text: isEmpty.value ? 'No Revenue Data' : props.chartTitle,
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
        displayColors: false,
        callbacks: {
          label: function (context) {
            if (isEmpty.value) return 'No data available'
            return formatCurrency(context.raw)
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
          callback: function (value) {
            return formatCurrency(value)
          },
        },
        title: {
          display: true,
          text: 'Revenue',
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
          color: props.gridLineColor,
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
      <Line :data="chartData" :options="chartOptions" />
    </div>

    <div v-if="!isEmpty" class="mt-6 grid grid-cols-2 gap-4">
      <div class="p-4 rounded-lg shadow-sm" :style="`background-color: ${lineColor}10`">
        <div class="text-sm font-medium text-gray">Total Revenue</div>
        <div class="text-2xl font-bold text-dark-blue">{{ formatCurrency(totalRevenue) }}</div>
        <div class="text-xs text-gray mt-1">Last 6 months</div>
      </div>

      <div class="p-4 rounded-lg shadow-sm bg-light-blue bg-opacity-5">
        <div class="text-sm font-medium text-gray">Monthly Average</div>
        <div class="text-2xl font-bold text-dark-blue">{{ formatCurrency(averageRevenue) }}</div>
        <div class="text-xs text-gray mt-1">Per month</div>
      </div>
    </div>
  </div>
</template>
