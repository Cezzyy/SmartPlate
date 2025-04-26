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
  errors: {
    type: Object,
    default: () => ({}),
  },
})

defineEmits(['update:formData'])
</script>

<template>
  <div class="space-y-4 bg-white">
    <!-- LTO Client ID -->
    <div class="flex flex-col space-y-1">
      <label class="text-sm text-gray-500">LTO Client ID</label>
      <div class="text-gray-800 font-medium">
        {{ user.ltoClientId }}
      </div>
      <p class="text-xs text-gray-500 italic">LTO Client ID cannot be changed</p>
    </div>

    <!-- Name Fields -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <!-- Last Name -->
      <div class="flex flex-col space-y-1">
        <label class="text-sm text-gray-500">Last Name <span class="text-red-500">*</span></label>
        <div v-if="!isEditMode" class="text-gray-800 font-medium">
          {{ user.lastName }}
        </div>
        <div v-else class="relative">
          <input
            :value="formData.lastName"
            @input="$emit('update:formData', { ...formData, lastName: $event.target.value })"
            type="text"
            class="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            :class="[errors?.lastName ? 'border-red-500' : '']"
          />
          <div v-if="errors?.lastName" class="text-red-500 text-xs mt-1">
            {{ errors.lastName }}
          </div>
        </div>
      </div>

      <!-- First Name -->
      <div class="flex flex-col space-y-1">
        <label class="text-sm text-gray-500">First Name <span class="text-red-500">*</span></label>
        <div v-if="!isEditMode" class="text-gray-800 font-medium">
          {{ user.firstName }}
        </div>
        <div v-else class="relative">
          <input
            :value="formData.firstName"
            @input="$emit('update:formData', { ...formData, firstName: $event.target.value })"
            type="text"
            class="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            :class="[errors?.firstName ? 'border-red-500' : '']"
          />
          <div v-if="errors?.firstName" class="text-red-500 text-xs mt-1">
            {{ errors.firstName }}
          </div>
        </div>
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
