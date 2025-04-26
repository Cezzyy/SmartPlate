<script setup lang="ts">
import { onBeforeUnmount, onMounted } from 'vue'
import { useVehicleRegistrationFormStore } from '@/stores/vehicleRegistrationForm'

const store = useVehicleRegistrationFormStore()

const handleBeforeUnload = (e: BeforeUnloadEvent): void => {
  if (store.hasUnsavedChanges) {
    e.preventDefault()
    e.returnValue = ''
  }
}

onMounted(() => {
  window.addEventListener('beforeunload', handleBeforeUnload)
})

onBeforeUnmount(() => {
  window.removeEventListener('beforeunload', handleBeforeUnload)
})
</script>

<template>
  <div style="display: none"></div>
</template>
