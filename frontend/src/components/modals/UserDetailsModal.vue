<script setup>
import { defineProps } from 'vue'

const props = defineProps({
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

const getStatusDot = (status) => {
  switch (status.toLowerCase()) {
    case 'active':
      return 'bg-green-500'
    case 'pending':
      return 'bg-yellow-500'
    case 'inactive':
      return 'bg-red-500'
    default:
      return 'bg-gray-500'
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

const formatDate = (dateString) => {
  if (!dateString) return 'N/A'

  try {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  } catch (e) {
    return dateString || 'N/A'
  }
}
</script>

<template>
  <div
    v-if="show"
    class="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4"
    @click.self="closeModal"
  >
    <div class="bg-white rounded-lg shadow-xl w-full max-w-4xl overflow-hidden">
      <!-- Modal Header with Gradient -->
      <div
        class="bg-gradient-to-r from-dark-blue to-blue-800 px-6 py-4 flex items-center justify-between"
      >
        <h3 class="text-xl font-bold text-white">User Details</h3>
        <button
          @click="closeModal"
          class="text-white hover:text-blue-200 transition-colors focus:outline-none"
        >
          <font-awesome-icon :icon="['fas', 'times']" class="w-5 h-5" />
        </button>
      </div>

      <!-- Modal Content -->
      <div class="px-6 py-4 max-h-[75vh] overflow-y-auto">
        <!-- User Profile Section -->
        <div class="mb-6">
          <div class="flex flex-col md:flex-row items-start md:items-center mb-6">
            <div
              class="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mr-4 mb-4 md:mb-0"
            >
              <img
                v-if="user.avatar"
                :src="user.avatar"
                :alt="user.firstName"
                class="w-16 h-16 rounded-full object-cover"
              />
              <font-awesome-icon v-else :icon="['fas', 'user']" class="w-8 h-8 text-light-blue" />
            </div>
            <div>
              <h4 class="text-xl font-bold text-gray-900">
                {{ user.firstName }} {{ user.middleName }} {{ user.lastName }}
              </h4>
              <div class="flex items-center mt-1">
                <span class="text-gray-600 mr-2">Email:</span>
                <span class="font-medium text-dark-blue">{{ user.email }}</span>
              </div>
              <div class="flex gap-2 mt-2">
                <span
                  :class="[
                    'px-3 py-1 rounded-full text-xs font-medium inline-flex items-center',
                    getRoleColor(user.role),
                  ]"
                >
                  {{ user.role.charAt(0).toUpperCase() + user.role.slice(1) }}
                </span>
                <span
                  :class="[
                    'px-3 py-1 rounded-full text-xs font-medium inline-flex items-center',
                    getStatusColor(user.status),
                  ]"
                >
                  <span :class="['w-2 h-2 rounded-full mr-2', getStatusDot(user.status)]"></span>
                  {{ user.status.charAt(0).toUpperCase() + user.status.slice(1) }}
                </span>
              </div>
            </div>
          </div>

          <!-- Main Info Grid -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- Basic Information -->
            <div class="bg-gray-50 rounded-lg shadow-sm overflow-hidden">
              <div class="bg-gray-100 px-4 py-3 border-b border-gray-200">
                <h5 class="font-medium text-gray-900 flex items-center">
                  <font-awesome-icon :icon="['fas', 'id-card']" class="mr-2 text-light-blue" />
                  Basic Information
                </h5>
              </div>
              <div class="p-4">
                <div class="space-y-3">
                  <div class="flex justify-between items-center py-1 border-b border-gray-100">
                    <span class="text-gray-600">LTO Client ID</span>
                    <span class="font-medium text-gray-900">{{ user.ltoClientId || 'N/A' }}</span>
                  </div>
                  <div class="flex justify-between items-center py-1 border-b border-gray-100">
                    <span class="text-gray-600">Nationality</span>
                    <span class="font-medium text-gray-900">{{ user.nationality || 'N/A' }}</span>
                  </div>
                  <div class="flex justify-between items-center py-1 border-b border-gray-100">
                    <span class="text-gray-600">Civil Status</span>
                    <span class="font-medium text-gray-900">{{ user.civilStatus || 'N/A' }}</span>
                  </div>
                  <div class="flex justify-between items-center py-1">
                    <span class="text-gray-600">TIN</span>
                    <span class="font-medium text-gray-900">{{ user.tin || 'N/A' }}</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Contact Information -->
            <div class="bg-gray-50 rounded-lg shadow-sm overflow-hidden">
              <div class="bg-gray-100 px-4 py-3 border-b border-gray-200">
                <h5 class="font-medium text-gray-900 flex items-center">
                  <font-awesome-icon :icon="['fas', 'phone-alt']" class="mr-2 text-light-blue" />
                  Contact Information
                </h5>
              </div>
              <div class="p-4">
                <div class="space-y-3">
                  <div class="flex justify-between items-center py-1 border-b border-gray-100">
                    <span class="text-gray-600">Telephone</span>
                    <span class="font-medium text-gray-900">{{
                      user.telephoneNumber || 'N/A'
                    }}</span>
                  </div>
                  <div class="flex justify-between items-center py-1 border-b border-gray-100">
                    <span class="text-gray-600">Mobile</span>
                    <span class="font-medium text-gray-900">
                      {{ user.intAreaCode || '' }} {{ user.mobileNumber || 'N/A' }}
                    </span>
                  </div>
                  <div class="flex justify-between items-center py-1">
                    <span class="text-gray-600">Email</span>
                    <span class="font-medium text-gray-900">{{ user.email || 'N/A' }}</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Personal Information -->
            <div class="bg-gray-50 rounded-lg shadow-sm overflow-hidden">
              <div class="bg-gray-100 px-4 py-3 border-b border-gray-200">
                <h5 class="font-medium text-gray-900 flex items-center">
                  <font-awesome-icon :icon="['fas', 'user-circle']" class="mr-2 text-light-blue" />
                  Personal Information
                </h5>
              </div>
              <div class="p-4">
                <div class="grid grid-cols-2 gap-4">
                  <div class="space-y-3">
                    <div class="flex flex-col py-1">
                      <span class="text-gray-600 text-sm">Date of Birth</span>
                      <span class="font-medium text-gray-900">{{
                        formatDate(user.dateOfBirth)
                      }}</span>
                    </div>
                    <div class="flex flex-col py-1">
                      <span class="text-gray-600 text-sm">Place of Birth</span>
                      <span class="font-medium text-gray-900">{{
                        user.placeOfBirth || 'N/A'
                      }}</span>
                    </div>
                  </div>
                  <div class="space-y-3">
                    <div class="flex flex-col py-1">
                      <span class="text-gray-600 text-sm">Gender</span>
                      <span class="font-medium text-gray-900">{{ user.gender || 'N/A' }}</span>
                    </div>
                    <div class="flex flex-col py-1">
                      <span class="text-gray-600 text-sm">Blood Type</span>
                      <span class="font-medium text-gray-900">{{ user.bloodType || 'N/A' }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Physical Characteristics -->
            <div class="bg-gray-50 rounded-lg shadow-sm overflow-hidden">
              <div class="bg-gray-100 px-4 py-3 border-b border-gray-200">
                <h5 class="font-medium text-gray-900 flex items-center">
                  <font-awesome-icon :icon="['fas', 'ruler']" class="mr-2 text-light-blue" />
                  Physical Characteristics
                </h5>
              </div>
              <div class="p-4">
                <div class="grid grid-cols-2 gap-4">
                  <div class="space-y-3">
                    <div class="flex flex-col py-1">
                      <span class="text-gray-600 text-sm">Height</span>
                      <span class="font-medium text-gray-900">{{
                        user.height ? `${user.height} cm` : 'N/A'
                      }}</span>
                    </div>
                    <div class="flex flex-col py-1">
                      <span class="text-gray-600 text-sm">Weight</span>
                      <span class="font-medium text-gray-900">{{
                        user.weight ? `${user.weight} kg` : 'N/A'
                      }}</span>
                    </div>
                  </div>
                  <div class="space-y-3">
                    <div class="flex flex-col py-1">
                      <span class="text-gray-600 text-sm">Eye Color</span>
                      <span class="font-medium text-gray-900">{{ user.eyeColor || 'N/A' }}</span>
                    </div>
                    <div class="flex flex-col py-1">
                      <span class="text-gray-600 text-sm">Hair Color</span>
                      <span class="font-medium text-gray-900">{{ user.hairColor || 'N/A' }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Address Information -->
            <div class="bg-gray-50 rounded-lg shadow-sm overflow-hidden md:col-span-2">
              <div class="bg-gray-100 px-4 py-3 border-b border-gray-200">
                <h5 class="font-medium text-gray-900 flex items-center">
                  <font-awesome-icon
                    :icon="['fas', 'map-marker-alt']"
                    class="mr-2 text-light-blue"
                  />
                  Address Information
                </h5>
              </div>
              <div class="p-4">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div class="space-y-3">
                    <div class="flex flex-col py-1">
                      <span class="text-gray-600 text-sm">House No.</span>
                      <span class="font-medium text-gray-900">{{ user.houseNo || 'N/A' }}</span>
                    </div>
                    <div class="flex flex-col py-1">
                      <span class="text-gray-600 text-sm">Street</span>
                      <span class="font-medium text-gray-900">{{ user.street || 'N/A' }}</span>
                    </div>
                    <div class="flex flex-col py-1">
                      <span class="text-gray-600 text-sm">Barangay</span>
                      <span class="font-medium text-gray-900">{{ user.barangay || 'N/A' }}</span>
                    </div>
                  </div>
                  <div class="space-y-3">
                    <div class="flex flex-col py-1">
                      <span class="text-gray-600 text-sm">City</span>
                      <span class="font-medium text-gray-900">{{ user.city || 'N/A' }}</span>
                    </div>
                    <div class="flex flex-col py-1">
                      <span class="text-gray-600 text-sm">Province</span>
                      <span class="font-medium text-gray-900">{{ user.province || 'N/A' }}</span>
                    </div>
                    <div class="flex flex-col py-1">
                      <span class="text-gray-600 text-sm">Zip Code</span>
                      <span class="font-medium text-gray-900">{{ user.zipCode || 'N/A' }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div class="bg-gray-50 px-6 py-4 border-t border-gray-200 flex justify-end">
        <button
          @click="closeModal"
          class="inline-flex items-center px-4 py-2 bg-light-blue text-white hover:bg-blue-700 font-medium rounded-md transition-colors duration-200"
        >
          Close
        </button>
      </div>
    </div>
  </div>
</template>
