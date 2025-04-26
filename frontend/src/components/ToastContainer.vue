<script setup>
import { ref, onMounted } from 'vue'
import { useNotificationStore } from '@/stores/notification'
import ToastNotification from './ToastNotification.vue'

const notificationStore = useNotificationStore()

const toasts = ref([])
const MAX_TOASTS = 5

// Get existing toast notifications on mount
onMounted(() => {
  toasts.value = notificationStore.toastNotifications.slice(0, MAX_TOASTS)
})

// Subscribe to notification store changes
notificationStore.$subscribe((mutation, state) => {
  // When toast notifications change, update our local state
  if (state.toastNotifications) {
    toasts.value = state.toastNotifications.slice(0, MAX_TOASTS)
  }
})

// Remove a toast notification
const removeToast = (id) => {
  notificationStore.removeToastNotification(id)
}
</script>

<template>
  <div
    class="fixed top-0 right-0 z-50 p-4 space-y-4 max-h-screen overflow-hidden pointer-events-none"
  >
    <template v-for="(toast, index) in toasts" :key="toast.id">
      <div
        class="pointer-events-auto transform transition-all duration-300"
        :style="{ zIndex: 100 - index }"
      >
        <ToastNotification
          :id="toast.id"
          :title="toast.title"
          :message="toast.message"
          :type="toast.type"
          :duration="toast.duration"
          :auto-close="toast.autoClose"
          @close="removeToast"
        />
      </div>
    </template>
  </div>
</template>
