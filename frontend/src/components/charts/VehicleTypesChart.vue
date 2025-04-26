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
})

// Calculate total vehicles
const totalVehicles = computed(() => {
  return props.vehicleTypes.reduce((sum, type) => sum + type.value, 0)
})

// Chart data
const chartData = computed(() => {
  return {
    labels: props.vehicleTypes.map((type) => type.label),
    datasets: [
      {
        backgroundColor: ['#3b82f6', '#10b981', '#8b5cf6', '#f59e0b', '#ef4444', '#6366f1'],
        data: props.vehicleTypes.map((type) => type.value),
      },
    ],
  }
})

// Chart options
const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  indexAxis: 'y',
  plugins: {
    legend: {
      display: false,
    },
    title: {
      display: true,
      text: 'Vehicle Types Distribution',
    },
  },
}
</script>

<template>
  <div class="h-64 flex items-center justify-center">
    <Bar :data="chartData" :options="chartOptions" />
  </div>
  <div class="mt-4 grid grid-cols-3 gap-3 text-center">
    <div
      v-for="(type, index) in vehicleTypes.slice(0, 3)"
      :key="index"
      class="p-2 rounded bg-gray-50 overflow-hidden"
    >
      <div
        class="text-sm font-semibold truncate"
        :style="{
          color:
            chartData.datasets[0].backgroundColor[
              index % chartData.datasets[0].backgroundColor.length
            ],
        }"
      >
        {{ type.label }}
      </div>
      <div class="text-lg font-bold">{{ type.value }}</div>
      <div class="text-xs text-gray-500">{{ Math.round((type.value / totalVehicles) * 100) }}%</div>
    </div>
  </div>
</template>
