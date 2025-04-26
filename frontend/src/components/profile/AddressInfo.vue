<script setup>
import { defineProps, computed } from 'vue'

const props = defineProps({
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

// Computed full address
const fullAddress = computed(() => {
  return `${props.user.houseNo} ${props.user.street}, ${props.user.barangay}, ${props.user.city}, ${props.user.province} ${props.user.zipCode}`
})
</script>

<template>
  <div class="space-y-4 bg-white">
    <!-- Full Address Display -->
    <div v-if="!isEditMode" class="mb-4 p-3 bg-gray-50 rounded-lg">
      <p class="text-gray-800">{{ fullAddress }}</p>
    </div>

    <!-- House Number and Street -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <!-- House Number -->
      <div class="flex flex-col space-y-1">
        <label class="text-sm text-gray-500">House/Unit Number</label>
        <div v-if="!isEditMode" class="text-gray-800 font-medium">
          {{ user.houseNo }}
        </div>
        <input
          v-else
          :value="formData.houseNo"
          @input="$emit('update:formData', { ...formData, houseNo: $event.target.value })"
          type="text"
          class="border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
        />
      </div>

      <!-- Street -->
      <div class="flex flex-col space-y-1 md:col-span-2">
        <label class="text-sm text-gray-500">Street</label>
        <div v-if="!isEditMode" class="text-gray-800 font-medium">
          {{ user.street }}
        </div>
        <input
          v-else
          :value="formData.street"
          @input="$emit('update:formData', { ...formData, street: $event.target.value })"
          type="text"
          class="border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
        />
      </div>
    </div>

    <!-- Barangay, City, Province -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <!-- Barangay -->
      <div class="flex flex-col space-y-1">
        <label class="text-sm text-gray-500">Barangay</label>
        <div v-if="!isEditMode" class="text-gray-800 font-medium">
          {{ user.barangay }}
        </div>
        <input
          v-else
          :value="formData.barangay"
          @input="$emit('update:formData', { ...formData, barangay: $event.target.value })"
          type="text"
          class="border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
        />
      </div>

      <!-- City -->
      <div class="flex flex-col space-y-1">
        <label class="text-sm text-gray-500">City/Municipality</label>
        <div v-if="!isEditMode" class="text-gray-800 font-medium">
          {{ user.city }}
        </div>
        <input
          v-else
          :value="formData.city"
          @input="$emit('update:formData', { ...formData, city: $event.target.value })"
          type="text"
          class="border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
        />
      </div>

      <!-- Province -->
      <div class="flex flex-col space-y-1">
        <label class="text-sm text-gray-500">Province</label>
        <div v-if="!isEditMode" class="text-gray-800 font-medium">
          {{ user.province }}
        </div>
        <input
          v-else
          :value="formData.province"
          @input="$emit('update:formData', { ...formData, province: $event.target.value })"
          type="text"
          class="border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
        />
      </div>
    </div>

    <!-- Zip Code -->
    <div class="flex flex-col space-y-1 max-w-xs">
      <label class="text-sm text-gray-500">Zip Code</label>
      <div v-if="!isEditMode" class="text-gray-800 font-medium">
        {{ user.zipCode }}
      </div>
      <input
        v-else
        :value="formData.zipCode"
        @input="$emit('update:formData', { ...formData, zipCode: $event.target.value })"
        type="text"
        class="border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
      />
    </div>
  </div>
</template>
