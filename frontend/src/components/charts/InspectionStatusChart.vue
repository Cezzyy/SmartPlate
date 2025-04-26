<script setup>
import { computed } from 'vue'
import { Doughnut } from 'vue-chartjs'
import { Chart as ChartJS, Title, Tooltip, Legend, ArcElement, CategoryScale } from 'chart.js'

ChartJS.register(CategoryScale, Title, Tooltip, Legend, ArcElement)

const props = defineProps({
  pendingInspections: {
    type: Number,
    required: true,
  },
  approvedInspections: {
    type: Number,
    required: true,
  },
  rejectedInspections: {
    type: Number,
    required: true,
  },
  chartTitle: {
    type: String,
    default: 'Inspection Status',
  },
  primaryColor: {
    type: String,
    default: '#4373e6', // blue
  },
  secondaryColor: {
    type: String,
    default: '#45cbba', // teal
  },
  tertiaryColor: {
    type: String,
    default: '#e63946', // red
  },
  labelColor: {
    type: String,
    default: '#8892b0',
  },
  backgroundColor: {
    type: String,
    default: 'white',
  },
})

// Chart data
const chartData = computed(() => {
  return {
    labels: ['Approved', 'Pending', 'Rejected'],
    datasets: [
      {
        backgroundColor: [props.primaryColor, props.secondaryColor, props.tertiaryColor],
        data: [props.approvedInspections, props.pendingInspections, props.rejectedInspections],
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
        position: 'bottom',
        labels: {
          color: props.labelColor,
          font: {
            family: 'Inter, sans-serif',
            size: 12,
          },
          padding: 20,
          usePointStyle: true,
          pointStyle: 'circle',
        },
      },
      title: {
        display: true,
        text: props.chartTitle,
        font: {
          family: 'Inter, sans-serif',
          size: 16,
          weight: 'bold',
        },
        color: props.labelColor,
        padding: {
          bottom: 30,
        },
      },
      tooltip: {
        backgroundColor: '#172a45',
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
            const label = context.label || ''
            const value = context.raw || 0
            const total = context.dataset.data.reduce((a, b) => a + b, 0)
            const percentage = total ? Math.round((value / total) * 100) : 0
            return `${label}: ${value} (${percentage}%)`
          },
        },
      },
    },
    cutout: '65%',
    animation: {
      animateRotate: true,
      animateScale: true,
    },
  }
})

// Compute total inspections
const totalInspections = computed(() => {
  return props.approvedInspections + props.pendingInspections + props.rejectedInspections
})

// Calculate percentage
const calculatePercentage = (value) => {
  if (totalInspections.value === 0) return 0
  return Math.round((value / totalInspections.value) * 100)
}
</script>

<template>
  <div class="w-full h-full flex flex-col">
    <div class="flex-1 relative">
      <Doughnut :data="chartData" :options="chartOptions" />
      <div
        class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center"
      >
        <div class="text-3xl font-bold text-dark-blue">{{ totalInspections }}</div>
        <div class="text-sm text-gray">Total Inspections</div>
      </div>
    </div>

    <div class="mt-6 grid grid-cols-3 gap-4">
      <div class="p-4 rounded-lg shadow-sm" :style="`background-color: ${primaryColor}15`">
        <div class="text-sm font-medium" :style="`color: ${primaryColor}`">Approved</div>
        <div class="text-xl font-bold text-dark-blue mt-1">{{ props.approvedInspections }}</div>
        <div class="text-xs text-gray mt-1">
          {{ calculatePercentage(props.approvedInspections) }}% of total
        </div>
      </div>

      <div class="p-4 rounded-lg shadow-sm" :style="`background-color: ${secondaryColor}15`">
        <div class="text-sm font-medium" :style="`color: ${secondaryColor}`">Pending</div>
        <div class="text-xl font-bold text-dark-blue mt-1">{{ props.pendingInspections }}</div>
        <div class="text-xs text-gray mt-1">
          {{ calculatePercentage(props.pendingInspections) }}% of total
        </div>
      </div>

      <div class="p-4 rounded-lg shadow-sm" :style="`background-color: ${tertiaryColor}15`">
        <div class="text-sm font-medium" :style="`color: ${tertiaryColor}`">Rejected</div>
        <div class="text-xl font-bold text-dark-blue mt-1">{{ props.rejectedInspections }}</div>
        <div class="text-xs text-gray mt-1">
          {{ calculatePercentage(props.rejectedInspections) }}% of total
        </div>
      </div>
    </div>
  </div>
</template>
