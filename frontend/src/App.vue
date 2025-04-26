<script setup>
import { RouterView } from 'vue-router'
import { onMounted } from 'vue'
import { useUserStore } from './stores/user'
import { useVehicleRegistrationFormStore } from './stores/vehicleRegistrationForm'
import { useNotificationStore } from './stores/notification'
import ToastContainer from './components/ToastContainer.vue'
import UserRegistrationGuard from './components/navigation/UserRegistrationGuard.vue'

const userStore = useUserStore()
const registrationFormStore = useVehicleRegistrationFormStore()
const notificationStore = useNotificationStore()

// On app startup, ensure we load all forms and restore user session
onMounted(() => {
  console.log('==== App mounted - initializing data ====')

  const isAuthenticated = userStore.checkAuth()
  console.log('User authenticated:', isAuthenticated)

  if (isAuthenticated && userStore.currentUser?.ltoClientId) {
    const userId = userStore.currentUser.ltoClientId
    console.log('Current authenticated user:', userId)

    // Log store state for debugging
    registrationFormStore.debugForms()
  } else {
    console.log('No authenticated user')
  }

  console.log('==== App initialization complete ====')

  // Test toast notification (remove this in production)
  setTimeout(() => {
    notificationStore.showToast({
      title: 'Toast Notification System',
      message: 'The toast notification system is working!',
      type: 'success',
    })
  }, 2000)
})
</script>

<template>
  <RouterView />
  <ToastContainer />
  <!-- We don't need to add the UserRegistrationGuard here since we add it specifically to the RegistrationView -->
</template>
