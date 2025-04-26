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
})

// Calculate total vehicles
const totalVehicles = computed(() => {
  return props.vehicleMakes.reduce((sum, make) => sum + make.value, 0)
})

// Chart data
const chartData = computed(() => {
  return {
    labels: props.vehicleMakes.map((make) => make.label),
    datasets: [
      {
        label: 'Number of Vehicles',
        backgroundColor: ['#6366f1', '#14b8a6', '#f97316', '#ec4899', '#06b6d4'],
        data: props.vehicleMakes.map((make) => make.value),
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
      text: 'Top Vehicle Makes',
    },
  },
}
</script>

<template>
  <div class="h-64 flex items-center justify-center">
    <Bar :data="chartData" :options="chartOptions" />
  </div>
  <div class="mt-4 space-y-2">
    <div
      v-for="(make, index) in vehicleMakes"
      :key="index"
      class="flex justify-between items-center px-2 py-1 rounded"
    >
      <div class="flex items-center">
        <div
          class="w-3 h-3 rounded-full mr-2"
          :style="{
            backgroundColor:
              chartData.datasets[0].backgroundColor[
                index % chartData.datasets[0].backgroundColor.length
              ],
          }"
        ></div>
        <span class="text-sm font-medium">{{ make.label }}</span>
      </div>
      <div class="flex space-x-3">
        <span class="text-sm font-bold">{{ make.value }}</span>
        <span class="text-xs text-gray-500"
          >{{ Math.round((make.value / totalVehicles) * 100) }}%</span
        >
      </div>
    </div>
  </div>
</template>
