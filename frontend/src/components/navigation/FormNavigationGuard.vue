<script setup>
import { onBeforeUnmount, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useVehicleRegistrationFormStore } from '@/stores/vehicleRegistrationForm'

const store = useVehicleRegistrationFormStore()
const router = useRouter()

// Handle browser refresh/navigation
const handleBeforeUnload = (e) => {
  if (store.hasUnsavedChanges) {
    const message = 'You have unsaved changes. Are you sure you want to leave?'
    e.preventDefault()
    e.returnValue = message
    return message
  }
}

// Handle Vue Router navigation
let removeRouterGuard = null

const handleBeforeRouteLeave = (to, from, next) => {
  if (store.hasUnsavedChanges) {
    const confirmed = window.confirm('You have unsaved changes. Are you sure you want to leave?')
    if (confirmed) {
      store.setUnsavedChanges(false)
      next()
    } else {
      next(false)
    }
  } else {
    next()
  }
}

onMounted(() => {
  window.addEventListener('beforeunload', handleBeforeUnload)
  removeRouterGuard = router.beforeEach(handleBeforeRouteLeave)
})

onBeforeUnmount(() => {
  window.removeEventListener('beforeunload', handleBeforeUnload)
  if (removeRouterGuard) {
    removeRouterGuard()
  }
})
</script>

<template>
  <!-- This is an invisible component that only handles navigation events -->
  <div style="display: none"></div>
</template>
