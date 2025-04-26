<script setup>
import { defineProps, defineEmits, computed } from 'vue'

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
  errors: {
    type: Object,
    default: () => ({}),
  },
  showEmptyState: {
    type: Boolean,
    default: false,
  },
})

defineEmits(['update:formData'])

// Computed full address
const fullAddress = computed(() => {
  if (!props.user.houseNo && !props.user.street && !props.user.barangay && 
      !props.user.city && !props.user.province && !props.user.zipCode) {
    return props.showEmptyState ? 'No address information provided' : ''
  }
  
  return `${props.user.houseNo || ''} ${props.user.street || ''}, ${props.user.barangay || ''}, ${props.user.city || ''}, ${props.user.province || ''} ${props.user.zipCode || ''}`
})
</script>

<template>
  <div class="space-y-4 bg-white">
    <!-- Full Address Display -->
    <div v-if="!isEditMode" class="mb-4 p-3 bg-gray-50 rounded-lg">
      <p v-if="fullAddress" class="text-gray-800">{{ fullAddress }}</p>
      <p v-else-if="showEmptyState" class="text-gray-400 italic">No address information provided</p>
    </div>

    <!-- House Number and Street -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <!-- House Number -->
      <div class="flex flex-col space-y-1">
        <label class="text-sm text-gray-500"
          >House/Unit Number <span class="text-red-500">*</span></label
        >
        <div v-if="!isEditMode" class="text-gray-800 font-medium">
          <template v-if="user.houseNo">{{ user.houseNo }}</template>
          <span v-else-if="showEmptyState" class="text-gray-400 italic">No house number provided</span>
        </div>
        <div v-else class="relative">
          <input
            :value="formData.houseNo"
            @input="$emit('update:formData', { ...formData, houseNo: $event.target.value })"
            type="text"
            class="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            :class="[errors?.houseNo ? 'border-red-500' : '']"
          />
          <div v-if="errors?.houseNo" class="text-red-500 text-xs mt-1">
            {{ errors.houseNo }}
          </div>
        </div>
      </div>

      <!-- Street -->
      <div class="flex flex-col space-y-1 md:col-span-2">
        <label class="text-sm text-gray-500">Street <span class="text-red-500">*</span></label>
        <div v-if="!isEditMode" class="text-gray-800 font-medium">
          <template v-if="user.street">{{ user.street }}</template>
          <span v-else-if="showEmptyState" class="text-gray-400 italic">No street provided</span>
        </div>
        <div v-else class="relative">
          <input
            :value="formData.street"
            @input="$emit('update:formData', { ...formData, street: $event.target.value })"
            type="text"
            class="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            :class="[errors?.street ? 'border-red-500' : '']"
          />
          <div v-if="errors?.street" class="text-red-500 text-xs mt-1">
            {{ errors.street }}
          </div>
        </div>
      </div>
    </div>

    <!-- Barangay, City, Province -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <!-- Barangay -->
      <div class="flex flex-col space-y-1">
        <label class="text-sm text-gray-500">Barangay <span class="text-red-500">*</span></label>
        <div v-if="!isEditMode" class="text-gray-800 font-medium">
          <template v-if="user.barangay">{{ user.barangay }}</template>
          <span v-else-if="showEmptyState" class="text-gray-400 italic">No barangay provided</span>
        </div>
        <div v-else class="relative">
          <input
            :value="formData.barangay"
            @input="$emit('update:formData', { ...formData, barangay: $event.target.value })"
            type="text"
            class="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            :class="[errors?.barangay ? 'border-red-500' : '']"
          />
          <div v-if="errors?.barangay" class="text-red-500 text-xs mt-1">
            {{ errors.barangay }}
          </div>
        </div>
      </div>

      <!-- City -->
      <div class="flex flex-col space-y-1">
        <label class="text-sm text-gray-500"
          >City/Municipality <span class="text-red-500">*</span></label
        >
        <div v-if="!isEditMode" class="text-gray-800 font-medium">
          <template v-if="user.city">{{ user.city }}</template>
          <span v-else-if="showEmptyState" class="text-gray-400 italic">No city provided</span>
        </div>
        <div v-else class="relative">
          <input
            :value="formData.city"
            @input="$emit('update:formData', { ...formData, city: $event.target.value })"
            type="text"
            class="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            :class="[errors?.city ? 'border-red-500' : '']"
          />
          <div v-if="errors?.city" class="text-red-500 text-xs mt-1">
            {{ errors.city }}
          </div>
        </div>
      </div>

      <!-- Province -->
      <div class="flex flex-col space-y-1">
        <label class="text-sm text-gray-500">Province <span class="text-red-500">*</span></label>
        <div v-if="!isEditMode" class="text-gray-800 font-medium">
          <template v-if="user.province">{{ user.province }}</template>
          <span v-else-if="showEmptyState" class="text-gray-400 italic">No province provided</span>
        </div>
        <div v-else class="relative">
          <input
            :value="formData.province"
            @input="$emit('update:formData', { ...formData, province: $event.target.value })"
            type="text"
            class="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            :class="[errors?.province ? 'border-red-500' : '']"
          />
          <div v-if="errors?.province" class="text-red-500 text-xs mt-1">
            {{ errors.province }}
          </div>
        </div>
      </div>
    </div>

    <!-- Zip Code -->
    <div class="flex flex-col space-y-1 max-w-xs">
      <label class="text-sm text-gray-500">Zip Code</label>
      <div v-if="!isEditMode" class="text-gray-800 font-medium">
        <template v-if="user.zipCode">{{ user.zipCode }}</template>
        <span v-else-if="showEmptyState" class="text-gray-400 italic">No zip code provided</span>
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
