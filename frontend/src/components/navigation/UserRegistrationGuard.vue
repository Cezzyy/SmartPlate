<script setup>
import { onBeforeUnmount, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()
const router = useRouter()

// Handle browser refresh/navigation
const handleBeforeUnload = (e) => {
  if (userStore.isRegistering) {
    const message = 'Your registration is incomplete. If you leave now, your progress will be lost.'
    e.preventDefault()
    e.returnValue = message
    return message
  }
}

// Handle Vue Router navigation
let removeRouterGuard = null

const handleBeforeRouteLeave = (to, from, next) => {
  // If user is in registration process and trying to leave registration page
  if (userStore.isRegistering && from.path === '/register' && to.path !== '/register') {
    // Don't show warning if going to login or home after successful registration
    if (to.path === '/login' && !userStore.registrationCompleted) {
      const confirmed = window.confirm(
        'Your registration is incomplete. If you leave now, all your progress will be lost. Are you sure you want to leave?',
      )
      if (confirmed) {
        userStore.cancelRegistration()
        next()
      } else {
        next(false)
      }
    } else {
      next()
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
