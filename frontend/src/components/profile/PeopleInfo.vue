<script setup>
import { defineProps, defineEmits, ref } from 'vue'

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
  showEmptyState: {
    type: Boolean,
    default: false,
  },
})

defineEmits(['update:formData'])

// Tabs for people information sections
const activeTab = ref('emergency')
</script>

<template>
  <div class="space-y-4 bg-white">
    <!-- Tabs for People Information -->
    <div class="border-b border-gray-200">
      <nav class="flex flex-wrap space-x-2" aria-label="People Information Tabs">
        <button
          @click="activeTab = 'emergency'"
          :class="[
            'py-2 px-3 text-sm font-medium rounded-t-lg',
            activeTab === 'emergency'
              ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-500'
              : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50',
          ]"
        >
          Emergency Contact
        </button>
        <button
          @click="activeTab = 'employer'"
          :class="[
            'py-2 px-3 text-sm font-medium rounded-t-lg',
            activeTab === 'employer'
              ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-500'
              : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50',
          ]"
        >
          Employer
        </button>
        <button
          @click="activeTab = 'family'"
          :class="[
            'py-2 px-3 text-sm font-medium rounded-t-lg',
            activeTab === 'family'
              ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-500'
              : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50',
          ]"
        >
          Family
        </button>
      </nav>
    </div>

    <!-- Emergency Contact Tab -->
    <div v-if="activeTab === 'emergency'" class="space-y-4">
      <!-- Emergency Contact Name -->
      <div class="flex flex-col space-y-1">
        <label class="text-sm text-gray-500">Emergency Contact Name</label>
        <div v-if="!isEditMode" class="text-gray-800 font-medium">
          <template v-if="user.emergencyContactName">{{ user.emergencyContactName }}</template>
          <span v-else-if="showEmptyState" class="text-gray-400 italic">No emergency contact name provided</span>
        </div>
        <input
          v-else
          :value="formData.emergencyContactName"
          @input="
            $emit('update:formData', { ...formData, emergencyContactName: $event.target.value })
          "
          type="text"
          class="border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
        />
      </div>

      <!-- Emergency Contact Number -->
      <div class="flex flex-col space-y-1">
        <label class="text-sm text-gray-500">Emergency Contact Number</label>
        <div v-if="!isEditMode" class="text-gray-800 font-medium">
          <template v-if="user.emergencyContactNumber">{{ user.emergencyContactNumber }}</template>
          <span v-else-if="showEmptyState" class="text-gray-400 italic">No emergency contact number provided</span>
        </div>
        <input
          v-else
          :value="formData.emergencyContactNumber"
          @input="
            $emit('update:formData', { ...formData, emergencyContactNumber: $event.target.value })
          "
          type="tel"
          class="border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
        />
      </div>

      <!-- Emergency Contact Address -->
      <div class="flex flex-col space-y-1">
        <label class="text-sm text-gray-500">Emergency Contact Address</label>
        <div v-if="!isEditMode" class="text-gray-800 font-medium">
          <template v-if="user.emergencyContactAddress">{{ user.emergencyContactAddress }}</template>
          <span v-else-if="showEmptyState" class="text-gray-400 italic">No emergency contact address provided</span>
        </div>
        <textarea
          v-else
          :value="formData.emergencyContactAddress"
          @input="
            $emit('update:formData', { ...formData, emergencyContactAddress: $event.target.value })
          "
          rows="2"
          class="border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
        ></textarea>
      </div>
    </div>

    <!-- Employer Tab -->
    <div v-if="activeTab === 'employer'" class="space-y-4">
      <!-- Employer Name -->
      <div class="flex flex-col space-y-1">
        <label class="text-sm text-gray-500">Employer Name</label>
        <div v-if="!isEditMode" class="text-gray-800 font-medium">
          <template v-if="user.employerName">{{ user.employerName }}</template>
          <span v-else-if="showEmptyState" class="text-gray-400 italic">No employer name provided</span>
        </div>
        <input
          v-else
          :value="formData.employerName"
          @input="$emit('update:formData', { ...formData, employerName: $event.target.value })"
          type="text"
          class="border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
        />
      </div>

      <!-- Employer Address -->
      <div class="flex flex-col space-y-1">
        <label class="text-sm text-gray-500">Employer Address</label>
        <div v-if="!isEditMode" class="text-gray-800 font-medium">
          <template v-if="user.employerAddress">{{ user.employerAddress }}</template>
          <span v-else-if="showEmptyState" class="text-gray-400 italic">No employer address provided</span>
        </div>
        <textarea
          v-else
          :value="formData.employerAddress"
          @input="$emit('update:formData', { ...formData, employerAddress: $event.target.value })"
          rows="2"
          class="border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
        ></textarea>
      </div>
    </div>

    <!-- Family Tab -->
    <div v-if="activeTab === 'family'" class="space-y-6">
      <!-- Mother's Information -->
      <div>
        <h4 class="text-md font-medium text-gray-700 mb-2">Mother's Maiden Name</h4>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <!-- Mother's Last Name -->
          <div class="flex flex-col space-y-1">
            <label class="text-sm text-gray-500">Last Name</label>
            <div v-if="!isEditMode" class="text-gray-800 font-medium">
              <template v-if="user.motherLastName">{{ user.motherLastName }}</template>
              <span v-else-if="showEmptyState" class="text-gray-400 italic">Not provided</span>
            </div>
            <input
              v-else
              :value="formData.motherLastName"
              @input="
                $emit('update:formData', { ...formData, motherLastName: $event.target.value })
              "
              type="text"
              class="border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
          </div>

          <!-- Mother's First Name -->
          <div class="flex flex-col space-y-1">
            <label class="text-sm text-gray-500">First Name</label>
            <div v-if="!isEditMode" class="text-gray-800 font-medium">
              <template v-if="user.motherFirstName">{{ user.motherFirstName }}</template>
              <span v-else-if="showEmptyState" class="text-gray-400 italic">Not provided</span>
            </div>
            <input
              v-else
              :value="formData.motherFirstName"
              @input="
                $emit('update:formData', { ...formData, motherFirstName: $event.target.value })
              "
              type="text"
              class="border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
          </div>

          <!-- Mother's Middle Name -->
          <div class="flex flex-col space-y-1">
            <label class="text-sm text-gray-500">Middle Name</label>
            <div v-if="!isEditMode" class="text-gray-800 font-medium">
              <template v-if="user.motherMiddleName">{{ user.motherMiddleName }}</template>
              <span v-else-if="showEmptyState" class="text-gray-400 italic">Not provided</span>
            </div>
            <input
              v-else
              :value="formData.motherMiddleName"
              @input="
                $emit('update:formData', { ...formData, motherMiddleName: $event.target.value })
              "
              type="text"
              class="border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
          </div>
        </div>
      </div>

      <!-- Father's Information -->
      <div>
        <h4 class="text-md font-medium text-gray-700 mb-2">Father's Name</h4>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <!-- Father's Last Name -->
          <div class="flex flex-col space-y-1">
            <label class="text-sm text-gray-500">Last Name</label>
            <div v-if="!isEditMode" class="text-gray-800 font-medium">
              <template v-if="user.fatherLastName">{{ user.fatherLastName }}</template>
              <span v-else-if="showEmptyState" class="text-gray-400 italic">Not provided</span>
            </div>
            <input
              v-else
              :value="formData.fatherLastName"
              @input="
                $emit('update:formData', { ...formData, fatherLastName: $event.target.value })
              "
              type="text"
              class="border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
          </div>

          <!-- Father's First Name -->
          <div class="flex flex-col space-y-1">
            <label class="text-sm text-gray-500">First Name</label>
            <div v-if="!isEditMode" class="text-gray-800 font-medium">
              <template v-if="user.fatherFirstName">{{ user.fatherFirstName }}</template>
              <span v-else-if="showEmptyState" class="text-gray-400 italic">Not provided</span>
            </div>
            <input
              v-else
              :value="formData.fatherFirstName"
              @input="
                $emit('update:formData', { ...formData, fatherFirstName: $event.target.value })
              "
              type="text"
              class="border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
          </div>

          <!-- Father's Middle Name -->
          <div class="flex flex-col space-y-1">
            <label class="text-sm text-gray-500">Middle Name</label>
            <div v-if="!isEditMode" class="text-gray-800 font-medium">
              <template v-if="user.fatherMiddleName">{{ user.fatherMiddleName }}</template>
              <span v-else-if="showEmptyState" class="text-gray-400 italic">Not provided</span>
            </div>
            <input
              v-else
              :value="formData.fatherMiddleName"
              @input="
                $emit('update:formData', { ...formData, fatherMiddleName: $event.target.value })
              "
              type="text"
              class="border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
