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
    <!-- Email -->
    <div class="flex flex-col space-y-1">
      <label class="text-sm text-gray-500">Email Address <span class="text-red-500">*</span></label>
      <div v-if="!isEditMode" class="text-gray-800 font-medium">{{ user.email }}</div>
      <div v-else class="relative">
        <input
          :value="formData.email"
          @input="$emit('update:formData', { ...formData, email: $event.target.value })"
          type="email"
          class="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          :class="[errors?.email ? 'border-red-500' : '']"
        />
        <div v-if="errors?.email" class="text-red-500 text-xs mt-1">
          {{ errors.email }}
        </div>
      </div>
    </div>

    <!-- Telephone Number -->
    <div class="flex flex-col space-y-1">
      <label class="text-sm text-gray-500">Telephone Number</label>
      <div v-if="!isEditMode" class="text-gray-800 font-medium">
        {{ user.telephoneNumber }}
      </div>
      <input
        v-else
        :value="formData.telephoneNumber"
        @input="$emit('update:formData', { ...formData, telephoneNumber: $event.target.value })"
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
          :value="formData.intAreaCode"
          @input="$emit('update:formData', { ...formData, intAreaCode: $event.target.value })"
          type="text"
          class="border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
        />
      </div>

      <!-- Mobile Number -->
      <div class="flex flex-col space-y-1 md:col-span-2">
        <label class="text-sm text-gray-500"
          >Mobile Number <span class="text-red-500">*</span></label
        >
        <div v-if="!isEditMode" class="text-gray-800 font-medium">
          {{ user.mobileNumber }}
        </div>
        <div v-else class="relative">
          <input
            :value="formData.mobileNumber"
            @input="$emit('update:formData', { ...formData, mobileNumber: $event.target.value })"
            type="tel"
            class="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            :class="[errors?.mobileNumber ? 'border-red-500' : '']"
          />
          <div v-if="errors?.mobileNumber" class="text-red-500 text-xs mt-1">
            {{ errors.mobileNumber }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
