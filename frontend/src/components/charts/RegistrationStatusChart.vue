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
  approvedRegistrations: {
    type: Number,
    required: true,
  },
  pendingRegistrations: {
    type: Number,
    required: true,
  },
  totalRegistrations: {
    type: Number,
    required: true,
  },
})

// Chart data
const chartData = computed(() => {
  return {
    labels: ['Last Month', 'Current'],
    datasets: [
      {
        label: 'Approved',
        backgroundColor: 'rgba(16, 185, 129, 0.2)',
        borderColor: '#10b981',
        borderWidth: 2,
        tension: 0.4,
        fill: true,
        data: [props.totalRegistrations - props.approvedRegistrations, props.approvedRegistrations],
      },
      {
        label: 'Pending',
        backgroundColor: 'rgba(245, 158, 11, 0.2)',
        borderColor: '#f59e0b',
        borderWidth: 2,
        tension: 0.4,
        fill: true,
        data: [0, props.pendingRegistrations],
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
      },
      title: {
        display: true,
        text: 'Registration Status Trends',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Number of Registrations',
        },
      },
    },
  }
})
</script>

<template>
  <div class="h-64 flex items-center justify-center">
    <Line :data="chartData" :options="chartOptions" />
  </div>
  <div class="mt-4 grid grid-cols-3 gap-2 text-center">
    <div class="p-1 rounded">
      <div class="text-sm font-semibold text-gray-700">Total</div>
      <div class="text-lg font-bold">{{ totalRegistrations }}</div>
      <div class="text-xs text-gray-500">100%</div>
    </div>
    <div class="p-1 rounded">
      <div class="text-sm font-semibold text-green-600">Approved</div>
      <div class="text-lg font-bold">{{ approvedRegistrations }}</div>
      <div class="text-xs text-gray-500">
        {{ Math.round((approvedRegistrations / totalRegistrations) * 100) || 0 }}%
      </div>
    </div>
    <div class="p-1 rounded">
      <div class="text-sm font-semibold text-yellow-600">Pending</div>
      <div class="text-lg font-bold">{{ pendingRegistrations }}</div>
      <div class="text-xs text-gray-500">
        {{ Math.round((pendingRegistrations / totalRegistrations) * 100) || 0 }}%
      </div>
    </div>
  </div>
</template>
