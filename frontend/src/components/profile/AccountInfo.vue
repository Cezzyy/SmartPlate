<script setup>
import { defineProps, defineEmits } from 'vue'

defineProps({
  user: {
    type: Object,
    required: true,
  },
  isEditMode: {
    type: Boolean,
    default: false,
  },
  formData: {
    type: Object,
    required: true,
  },
})

defineEmits(['update:formData'])
</script>

<template>
  <div class="space-y-4 bg-white">
    <!-- LTO Client ID -->
    <div class="flex flex-col space-y-1">
      <label class="text-sm text-gray-500">LTO Client ID</label>
      <div v-if="!isEditMode" class="text-gray-800 font-medium">
        {{ user.ltoClientId }}
      </div>
      <input
        v-else
        :value="formData.ltoClientId"
        @input="$emit('update:formData', { ...formData, ltoClientId: $event.target.value })"
        type="text"
        class="border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
      />
    </div>

    <!-- Name Fields -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <!-- Last Name -->
      <div class="flex flex-col space-y-1">
        <label class="text-sm text-gray-500">Last Name</label>
        <div v-if="!isEditMode" class="text-gray-800 font-medium">
          {{ user.lastName }}
        </div>
        <input
          v-else
          :value="formData.lastName"
          @input="$emit('update:formData', { ...formData, lastName: $event.target.value })"
          type="text"
          class="border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
        />
      </div>

      <!-- First Name -->
      <div class="flex flex-col space-y-1">
        <label class="text-sm text-gray-500">First Name</label>
        <div v-if="!isEditMode" class="text-gray-800 font-medium">
          {{ user.firstName }}
        </div>
        <input
          v-else
          :value="formData.firstName"
          @input="$emit('update:formData', { ...formData, firstName: $event.target.value })"
          type="text"
          class="border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
        />
      </div>

      <!-- Middle Name -->
      <div class="flex flex-col space-y-1">
        <label class="text-sm text-gray-500">Middle Name</label>
        <div v-if="!isEditMode" class="text-gray-800 font-medium">
          {{ user.middleName }}
        </div>
        <input
          v-else
          :value="formData.middleName"
          @input="$emit('update:formData', { ...formData, middleName: $event.target.value })"
          type="text"
          class="border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
        />
      </div>
    </div>
  </div>
</template>
