<script setup lang="ts">
import { onBeforeUnmount, onMounted } from 'vue'
import { useRouter, RouteLocationNormalized, NavigationGuardNext } from 'vue-router'
import { useVehicleRegistrationFormStore } from '@/stores/vehicleRegistrationForm'

const store = useVehicleRegistrationFormStore()
const router = useRouter()

// Handle browser refresh/navigation
const handleBeforeUnload = (e: BeforeUnloadEvent): string | undefined => {
  if (store.hasUnsavedChanges) {
    const message = 'You have unsaved changes. Are you sure you want to leave?'
    e.preventDefault()
    e.returnValue = message
    return message
  }
}

// Handle Vue Router navigation
let removeRouterGuard: (() => void) | null = null

const handleBeforeRouteLeave = (
  to: RouteLocationNormalized,
  from: RouteLocationNormalized,
  next: NavigationGuardNext,
): void => {
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
