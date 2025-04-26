<script setup>
import { computed, ref } from 'vue'
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
  Filler,
} from 'chart.js'

ChartJS.register(
  CategoryScale,
  LinearScale,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  Filler,
)

const props = defineProps({
  chartTitle: {
    type: String,
    default: 'Revenue Trends (Last 6 Months)',
  },
  lineColor: {
    type: String,
    default: '#0a192f', // dark-blue from theme
  },
  fillColor: {
    type: String,
    default: 'rgba(23, 42, 69, 0.1)', // light-blue with transparency
  },
  labelColor: {
    type: String,
    default: '#8892b0', // gray from theme
  },
  gridLineColor: {
    type: String,
    default: '#f1f5f9', // light gray for grid lines
  },
  pointColor: {
    type: String,
    default: '#e63946', // red from theme
  },
  backgroundColor: {
    type: String,
    default: 'white',
  },
  monthsData: {
    type: Array,
    default: () => ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
  },
  revenueData: {
    type: Array,
    default: () => [45000, 52000, 49000, 60000, 56000, 70000],
  },
})

// Chart data
const chartData = computed(() => {
  return {
    labels: props.monthsData,
    datasets: [
      {
        label: 'Revenue',
        backgroundColor: props.fillColor,
        borderColor: props.lineColor,
        borderWidth: 2,
        pointBackgroundColor: props.pointColor,
        pointBorderColor: 'white',
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 7,
        tension: 0.3,
        fill: true,
        data: props.revenueData,
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
        backgroundColor: props.lineColor,
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
        grid: {
          color: props.gridLineColor,
          drawBorder: false,
        },
        ticks: {
          callback: function (value) {
            return new Intl.NumberFormat('en-PH', {
              style: 'currency',
              currency: 'PHP',
              notation: 'compact',
            }).format(value)
          },
          font: {
            family: 'Inter, sans-serif',
            size: 11,
          },
          color: props.labelColor,
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

// Calculate statistics
const totalRevenue = computed(() => {
  return props.revenueData.reduce((sum, value) => sum + value, 0)
})

const averageMonthlyRevenue = computed(() => {
  return totalRevenue.value / props.revenueData.length
})

const highestMonthRevenue = computed(() => {
  return Math.max(...props.revenueData)
})

const growthRate = computed(() => {
  if (props.revenueData.length < 2) return 0
  const first = props.revenueData[0]
  const last = props.revenueData[props.revenueData.length - 1]

  // Handle division by zero when first month is 0
  if (first === 0) {
    return last > 0 ? 100 : 0 // If there was no revenue in first month but there is now, show 100% growth
  }

  return Math.round(((last - first) / first) * 100)
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
  <div class="w-full h-full flex flex-col">
    <div class="flex-1">
      <Line :data="chartData" :options="chartOptions" />
    </div>

    <div class="mt-6 grid grid-cols-2 lg:grid-cols-4 gap-4">
      <div class="p-4 rounded-lg shadow-sm" :style="`background-color: ${lineColor}08`">
        <div class="text-sm font-medium text-gray">Total Revenue</div>
        <div class="text-xl font-bold text-dark-blue mt-1">
          {{ formatCurrency(totalRevenue) }}
        </div>
        <div class="text-xs text-gray mt-1">All time</div>
      </div>

      <div class="p-4 rounded-lg shadow-sm" :style="`background-color: ${lineColor}08`">
        <div class="text-sm font-medium text-gray">Monthly Average</div>
        <div class="text-xl font-bold text-dark-blue mt-1">
          {{ formatCurrency(averageMonthlyRevenue) }}
        </div>
        <div class="text-xs text-gray mt-1">Per month</div>
      </div>

      <div class="p-4 rounded-lg shadow-sm" :style="`background-color: ${lineColor}08`">
        <div class="text-sm font-medium text-gray">Highest Revenue</div>
        <div class="text-xl font-bold text-dark-blue mt-1">
          {{ formatCurrency(highestMonthRevenue) }}
        </div>
        <div class="text-xs text-gray mt-1">Best month</div>
      </div>

      <div class="p-4 rounded-lg shadow-sm" :style="`background-color: ${lineColor}08`">
        <div class="text-sm font-medium text-gray">Growth Rate</div>
        <div class="text-xl font-bold text-dark-blue mt-1">
          <span :class="growthRate >= 0 ? 'text-green-600' : 'text-red'">
            {{ growthRate >= 0 ? '+' : '' }}{{ growthRate }}%
          </span>
        </div>
        <div class="text-xs text-gray mt-1">From first to last month</div>
      </div>
    </div>
  </div>
</template>
