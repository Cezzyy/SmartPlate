<script setup>
import { computed } from 'vue'
import { Line } from 'vue-chartjs'
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
} from 'chart.js'

ChartJS.register(CategoryScale, LinearScale, LineElement, PointElement, Title, Tooltip, Legend)

const props = defineProps({
  registrationTrends: {
    type: Array,
    required: true,
  },
})

// Calculate revenue data from registration trends
const revenueData = computed(() => {
  return props.registrationTrends.map((item) => ({
    month: item.month,
    revenue: item.new * 5000 + item.renewal * 3000,
  }))
})

// Chart data
const chartData = computed(() => {
  return {
    labels: revenueData.value.map((item) => item.month),
    datasets: [
      {
        label: 'Revenue',
        backgroundColor: 'rgba(245, 158, 11, 0.2)',
        borderColor: '#f59e0b',
        borderWidth: 2,
        pointBackgroundColor: '#f59e0b',
        tension: 0.4,
        fill: true,
        data: revenueData.value.map((item) => item.revenue),
      },
    ],
  }
})

// Chart options
const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'top',
    },
    title: {
      display: true,
      text: 'Revenue Trends (Last 6 Months)',
    },
    tooltip: {
      callbacks: {
        label: function (context) {
          let label = context.dataset.label || ''
          if (label) {
            label += ': '
          }
          if (context.parsed.y !== null) {
            label += new Intl.NumberFormat('en-PH', {
              style: 'currency',
              currency: 'PHP',
            }).format(context.parsed.y)
          }
          return label
        },
      },
    },
  },
  scales: {
    y: {
      beginAtZero: true,
      ticks: {
        callback: function (value) {
          return new Intl.NumberFormat('en-PH', {
            style: 'currency',
            currency: 'PHP',
            notation: 'compact',
          }).format(value)
        },
      },
    },
  },
}
// Calculate total and average revenue
const totalRevenue = computed(() => {
  return revenueData.value.reduce((sum, item) => sum + item.revenue, 0)
})

const averageMonthlyRevenue = computed(() => {
  return totalRevenue.value / revenueData.value.length
})

// Format currency
const formatCurrency = (value) => {
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
  }).format(value)
}
</script>

<template>
  <div class="h-64">
    <Line :data="chartData" :options="chartOptions" />
  </div>
  <div class="mt-4 grid grid-cols-2 gap-4 text-center">
    <div class="p-3 rounded bg-yellow-50 overflow-hidden">
      <div class="text-sm font-semibold text-yellow-600">Total Revenue</div>
      <div class="text-lg font-bold truncate">
        {{ formatCurrency(totalRevenue) }}
      </div>
    </div>
    <div class="p-3 rounded bg-yellow-50 overflow-hidden">
      <div class="text-sm font-semibold text-yellow-600">Monthly Average</div>
      <div class="text-lg font-bold truncate">
        {{ formatCurrency(averageMonthlyRevenue) }}
      </div>
    </div>
  </div>
</template>
