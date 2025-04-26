<script setup>
import { ref, onMounted, onBeforeUnmount, defineProps, defineEmits } from 'vue'

const props = defineProps({
  id: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  message: {
    type: String,
    default: '',
  },
  type: {
    type: String,
    default: 'info',
    validator: (value) => ['success', 'error', 'warning', 'info'].includes(value),
  },
  duration: {
    type: Number,
    default: 5000, // 5 seconds
  },
  autoClose: {
    type: Boolean,
    default: true,
  },
})

const emit = defineEmits(['close'])

const isVisible = ref(false)
const progressWidth = ref('100%')
let animationFrame = null
let timeoutId = null
let startTime = null

const getTypeClasses = () => {
  switch (props.type) {
    case 'success':
      return {
        container: 'bg-green-50 border-green-500',
        icon: 'text-green-500',
        progress: 'bg-green-500',
        iconName: 'check-circle',
      }
    case 'error':
      return {
        container: 'bg-red-50 border-red-500',
        icon: 'text-red-500',
        progress: 'bg-red-500',
        iconName: 'exclamation-circle',
      }
    case 'warning':
      return {
        container: 'bg-yellow-50 border-yellow-500',
        icon: 'text-yellow-500',
        progress: 'bg-yellow-500',
        iconName: 'exclamation-triangle',
      }
    default:
      return {
        container: 'bg-blue-50 border-blue-500',
        icon: 'text-blue-500',
        progress: 'bg-blue-500',
        iconName: 'info-circle',
      }
  }
}

const close = () => {
  isVisible.value = false
  if (timeoutId) {
    clearTimeout(timeoutId)
    timeoutId = null
  }
  if (animationFrame) {
    cancelAnimationFrame(animationFrame)
    animationFrame = null
  }
  // Wait for exit animation to complete
  setTimeout(() => emit('close', props.id), 300)
}

const startTimer = () => {
  if (!props.autoClose) return

  startTime = Date.now()

  const updateProgress = () => {
    const elapsed = Date.now() - startTime
    const remaining = Math.max(0, props.duration - elapsed)
    progressWidth.value = `${(remaining / props.duration) * 100}%`

    if (remaining > 0) {
      animationFrame = requestAnimationFrame(updateProgress)
    }
  }

  updateProgress()
  timeoutId = setTimeout(close, props.duration)
}

const pauseTimer = () => {
  if (!props.autoClose || !timeoutId) return

  clearTimeout(timeoutId)
  timeoutId = null

  if (animationFrame) {
    cancelAnimationFrame(animationFrame)
    animationFrame = null
  }
}

const resumeTimer = () => {
  if (!props.autoClose || timeoutId) return

  const elapsed = Date.now() - startTime
  const remaining = Math.max(0, props.duration - elapsed)

  if (remaining > 0) {
    timeoutId = setTimeout(close, remaining)

    const updateProgress = () => {
      const newElapsed = Date.now() - startTime
      const newRemaining = Math.max(0, props.duration - newElapsed)
      progressWidth.value = `${(newRemaining / props.duration) * 100}%`

      if (newRemaining > 0) {
        animationFrame = requestAnimationFrame(updateProgress)
      }
    }

    animationFrame = requestAnimationFrame(updateProgress)
  } else {
    close()
  }
}

onMounted(() => {
  // Add a small delay to ensure the enter animation works
  setTimeout(() => {
    isVisible.value = true
    startTimer()
  }, 10)
})

onBeforeUnmount(() => {
  if (timeoutId) {
    clearTimeout(timeoutId)
  }
  if (animationFrame) {
    cancelAnimationFrame(animationFrame)
  }
})
</script>

<template>
  <div
    :class="[
      'fixed max-w-md w-full rounded-lg shadow-lg border-l-4 p-4 transform transition-all duration-300 ease-in-out',
      getTypeClasses().container,
      isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0',
    ]"
    @mouseenter="pauseTimer"
    @mouseleave="resumeTimer"
  >
    <div class="flex items-start">
      <!-- Icon -->
      <div class="flex-shrink-0">
        <font-awesome-icon
          :icon="['fas', getTypeClasses().iconName]"
          :class="[getTypeClasses().icon, 'h-5 w-5']"
        />
      </div>

      <!-- Content -->
      <div class="ml-3 flex-1">
        <div class="flex justify-between items-start">
          <p class="text-sm font-medium text-gray-900">{{ title }}</p>
          <button
            type="button"
            class="ml-auto -mx-1.5 -my-1.5 bg-transparent text-gray-400 hover:text-gray-900 rounded-lg p-1.5 inline-flex h-8 w-8 items-center justify-center"
            @click="close"
          >
            <font-awesome-icon :icon="['fas', 'times']" class="h-4 w-4" />
          </button>
        </div>
        <p class="mt-1 text-sm text-gray-600" v-if="message">{{ message }}</p>
      </div>
    </div>

    <!-- Progress bar -->
    <div
      v-if="autoClose"
      class="absolute bottom-0 left-0 right-0 h-1 bg-gray-200 rounded-b-lg overflow-hidden"
    >
      <div
        :class="[getTypeClasses().progress, 'h-full transition-none']"
        :style="{ width: progressWidth }"
      ></div>
    </div>
  </div>
</template>
