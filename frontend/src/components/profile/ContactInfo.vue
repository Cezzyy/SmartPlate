<script setup>
import { defineProps } from 'vue'

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
</script>

<template>
  <div class="space-y-4 bg-white">
    <!-- Email -->
    <div class="flex flex-col space-y-1">
      <label class="text-sm text-gray-500">Email Address</label>
      <div v-if="!isEditMode" class="text-gray-800 font-medium">{{ user.email }}</div>
      <input
        v-else
        :model-value="formData.email"
        @update:model-value="$emit('update:formData', { ...formData, email: $event })"
        type="email"
        class="border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
      />
    </div>

    <!-- Telephone Number -->
    <div class="flex flex-col space-y-1">
      <label class="text-sm text-gray-500">Telephone Number</label>
      <div v-if="!isEditMode" class="text-gray-800 font-medium">
        {{ user.telephoneNumber }}
      </div>
      <input
        v-else
        :model-value="formData.telephoneNumber"
        @update:model-value="$emit('update:formData', { ...formData, telephoneNumber: $event })"
        type="tel"
        class="border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
      />
    </div>

    <!-- International Area Code and Mobile Number -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <!-- International Area Code -->
      <div class="flex flex-col space-y-1">
        <label class="text-sm text-gray-500">International Area Code</label>
        <div v-if="!isEditMode" class="text-gray-800 font-medium">
          {{ user.intAreaCode }}
        </div>
        <input
          v-else
          :model-value="formData.intAreaCode"
          @update:model-value="$emit('update:formData', { ...formData, intAreaCode: $event })"
          type="text"
          class="border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
        />
      </div>

      <!-- Mobile Number -->
      <div class="flex flex-col space-y-1 md:col-span-2">
        <label class="text-sm text-gray-500">Mobile Number</label>
        <div v-if="!isEditMode" class="text-gray-800 font-medium">
          {{ user.mobileNumber }}
        </div>
        <input
          v-else
          :model-value="formData.mobileNumber"
          @update:model-value="$emit('update:formData', { ...formData, mobileNumber: $event })"
          type="tel"
          class="border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
        />
      </div>
    </div>
  </div>
</template>
