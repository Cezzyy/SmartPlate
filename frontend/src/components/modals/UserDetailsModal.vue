<script setup>
import { defineProps } from 'vue'

defineProps({
  show: {
    type: Boolean,
    required: true,
  },
  user: {
    type: Object,
    required: true,
  },
})

const emit = defineEmits(['close'])

const closeModal = () => {
  emit('close')
}

const getStatusColor = (status) => {
  switch (status.toLowerCase()) {
    case 'active':
      return 'bg-green-100 text-green-800'
    case 'pending':
      return 'bg-yellow-100 text-yellow-800'
    case 'inactive':
      return 'bg-red-100 text-red-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

const getRoleColor = (role) => {
  switch (role.toLowerCase()) {
    case 'admin':
      return 'bg-purple-100 text-purple-800'
    case 'user':
      return 'bg-blue-100 text-blue-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}
</script>

<template>
  <div
    v-if="show"
    class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
    @click.self="closeModal"
  >
    <div class="bg-white rounded-lg shadow-xl w-full max-w-4xl mx-4 overflow-hidden">
      <!-- Modal Header -->
      <div class="border-b px-6 py-4 flex items-center justify-between">
        <h3 class="text-xl font-semibold text-gray-900">User Details</h3>
        <button @click="closeModal" class="text-gray-400 hover:text-gray-500 focus:outline-none">
          <font-awesome-icon :icon="['fas', 'times']" class="w-5 h-5" />
        </button>
      </div>

      <!-- Modal Content -->
      <div class="px-6 py-4 max-h-[80vh] overflow-y-auto">
        <!-- User Profile Section -->
        <div class="mb-6">
          <div class="flex items-center mb-4">
            <div class="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mr-4">
              <img
                v-if="user.avatar"
                :src="user.avatar"
                :alt="user.firstName"
                class="w-16 h-16 rounded-full object-cover"
              />
              <font-awesome-icon v-else :icon="['fas', 'user']" class="w-8 h-8 text-blue-600" />
            </div>
            <div>
              <h4 class="text-lg font-semibold text-gray-900">
                {{ user.firstName }} {{ user.middleName }} {{ user.lastName }}
              </h4>
              <p class="text-gray-600">{{ user.email }}</p>
              <div class="flex gap-2 mt-1">
                <span
                  :class="['px-2 py-1 rounded-full text-xs font-medium', getRoleColor(user.role)]"
                >
                  {{ user.role.charAt(0).toUpperCase() + user.role.slice(1) }}
                </span>
                <span
                  :class="[
                    'px-2 py-1 rounded-full text-xs font-medium',
                    getStatusColor(user.status),
                  ]"
                >
                  {{ user.status.charAt(0).toUpperCase() + user.status.slice(1) }}
                </span>
              </div>
            </div>
          </div>

          <!-- Basic Information -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div class="bg-gray-50 rounded-lg p-4">
              <h5 class="font-medium text-gray-900 mb-3">Basic Information</h5>
              <div class="space-y-2">
                <div class="flex justify-between">
                  <span class="text-gray-600">LTO Client ID</span>
                  <span class="font-medium text-gray-900">{{ user.ltoClientId }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-600">Nationality</span>
                  <span class="font-medium text-gray-900">{{ user.nationality }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-600">Civil Status</span>
                  <span class="font-medium text-gray-900">{{ user.civilStatus }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-600">TIN</span>
                  <span class="font-medium text-gray-900">{{ user.tin }}</span>
                </div>
              </div>
            </div>

            <!-- Contact Information -->
            <div class="bg-gray-50 rounded-lg p-4">
              <h5 class="font-medium text-gray-900 mb-3">Contact Information</h5>
              <div class="space-y-2">
                <div class="flex justify-between">
                  <span class="text-gray-600">Telephone</span>
                  <span class="font-medium text-gray-900">{{ user.telephoneNumber }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-600">Mobile</span>
                  <span class="font-medium text-gray-900">
                    {{ user.intAreaCode }} {{ user.mobileNumber }}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <!-- Personal Information -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div class="bg-gray-50 rounded-lg p-4">
              <h5 class="font-medium text-gray-900 mb-3">Personal Information</h5>
              <div class="space-y-2">
                <div class="flex justify-between">
                  <span class="text-gray-600">Date of Birth</span>
                  <span class="font-medium text-gray-900">{{ user.dateOfBirth }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-600">Place of Birth</span>
                  <span class="font-medium text-gray-900">{{ user.placeOfBirth }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-600">Gender</span>
                  <span class="font-medium text-gray-900">{{ user.gender }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-600">Blood Type</span>
                  <span class="font-medium text-gray-900">{{ user.bloodType }}</span>
                </div>
              </div>
            </div>

            <!-- Physical Characteristics -->
            <div class="bg-gray-50 rounded-lg p-4">
              <h5 class="font-medium text-gray-900 mb-3">Physical Characteristics</h5>
              <div class="space-y-2">
                <div class="flex justify-between">
                  <span class="text-gray-600">Height</span>
                  <span class="font-medium text-gray-900">{{ user.height }} cm</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-600">Weight</span>
                  <span class="font-medium text-gray-900">{{ user.weight }} kg</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-600">Eye Color</span>
                  <span class="font-medium text-gray-900">{{ user.eyeColor }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-600">Hair Color</span>
                  <span class="font-medium text-gray-900">{{ user.hairColor }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Address Information -->
          <div class="bg-gray-50 rounded-lg p-4 mb-6">
            <h5 class="font-medium text-gray-900 mb-3">Address</h5>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div class="space-y-2">
                <div class="flex justify-between">
                  <span class="text-gray-600">House No.</span>
                  <span class="font-medium text-gray-900">{{ user.houseNo }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-600">Street</span>
                  <span class="font-medium text-gray-900">{{ user.street }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-600">Barangay</span>
                  <span class="font-medium text-gray-900">{{ user.barangay }}</span>
                </div>
              </div>
              <div class="space-y-2">
                <div class="flex justify-between">
                  <span class="text-gray-600">City</span>
                  <span class="font-medium text-gray-900">{{ user.city }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-600">Province</span>
                  <span class="font-medium text-gray-900">{{ user.province }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-600">Zip Code</span>
                  <span class="font-medium text-gray-900">{{ user.zipCode }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
