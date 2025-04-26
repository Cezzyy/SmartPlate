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
})

// Chart data
const chartData = computed(() => {
  return {
    labels: props.registrationTrends.map((item) => item.month),
    datasets: [
      {
        label: 'New Registration',
        backgroundColor: '#3b82f6',
        data: props.registrationTrends.map((item) => item.new),
      },
      {
        label: 'Renewal',
        backgroundColor: '#10b981',
        data: props.registrationTrends.map((item) => item.renewal),
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
      position: 'bottom',
    },
    title: {
      display: true,
      text: 'Registration Trends (Last 6 Months)',
    },
  },
}
</script>

<template>
  <div class="h-64">
    <Bar :data="chartData" :options="chartOptions" />
  </div>
  <div class="mt-4 grid grid-cols-2 gap-6 text-center">
    <div class="p-4 rounded bg-blue-50 overflow-hidden shadow-sm">
      <div class="text-sm font-semibold text-blue-600 mb-1">New Registrations</div>
      <div class="text-xl font-bold">
        {{ registrationTrends.reduce((sum, item) => sum + item.new, 0) }}
      </div>
    </div>
    <div class="p-4 rounded bg-green-50 overflow-hidden shadow-sm">
      <div class="text-sm font-semibold text-green-600 mb-1">Renewals</div>
      <div class="text-xl font-bold">
        {{ registrationTrends.reduce((sum, item) => sum + item.renewal, 0) }}
      </div>
    </div>
  </div>
</template>
