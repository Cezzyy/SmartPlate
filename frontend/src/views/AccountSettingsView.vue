<script setup>
import { ref, reactive, computed } from 'vue'

// User profile data (mock data) - copied from ProfileView.vue
const user = reactive({
  // Account Information
  ltoClientId: 'LTO-2023-78945',
  lastName: 'Morales',
  firstName: 'Stanleigh',
  middleName: 'Garcia',
  email: 'stanleighmorales@gmail.com',
  telephoneNumber: '(02) 8123-4567',
  intAreaCode: '+63',
  mobileNumber: '912 345 6789',

  // Personal Information
  nationality: 'Filipino',
  civilStatus: 'Single',
  dateOfBirth: '1990-05-15',
  placeOfBirth: 'Manila, Philippines',
  gender: 'Male',

  // Other
  avatar: '/Land_Transportation_Office.webp',
  joinDate: 'January 2023',
})

// Computed full name
const fullName = computed(() => {
  return `${user.firstName} ${user.middleName ? user.middleName + ' ' : ''}${user.lastName}`
})

// Form states
const securityForm = reactive({
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
})

// Form validation states
const formErrors = reactive({
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
})

// Active tab state
const activeTab = ref('security')

const updatePassword = () => {
  // Reset errors
  formErrors.currentPassword = ''
  formErrors.newPassword = ''
  formErrors.confirmPassword = ''

  // Validate passwords
  let isValid = true

  if (!securityForm.currentPassword) {
    formErrors.currentPassword = 'Current password is required'
    isValid = false
  }

  if (!securityForm.newPassword) {
    formErrors.newPassword = 'New password is required'
    isValid = false
  } else if (securityForm.newPassword.length < 8) {
    formErrors.newPassword = 'Password must be at least 8 characters long'
    isValid = false
  }

  if (!securityForm.confirmPassword) {
    formErrors.confirmPassword = 'Please confirm your new password'
    isValid = false
  } else if (securityForm.newPassword !== securityForm.confirmPassword) {
    formErrors.confirmPassword = 'Passwords do not match'
    isValid = false
  }

  if (!isValid) return

  // In a real app, this would make an API call
  securityForm.currentPassword = ''
  securityForm.newPassword = ''
  securityForm.confirmPassword = ''

  alert('Password updated successfully!')
}

// File upload handling
const selectedFile = ref(null)
const previewUrl = ref(null)

const handleFileUpload = (event) => {
  const file = event.target.files[0]
  if (file) {
    selectedFile.value = file
    previewUrl.value = URL.createObjectURL(file)
  }
}

const uploadAvatar = () => {
  if (selectedFile.value) {
    // In a real app, this would upload the file to a server
    user.avatar = previewUrl.value
    alert('Profile picture updated successfully!')
  } else {
    alert('Please select an image first!')
  }
}

// Notification settings
const notificationSettings = reactive({
  email: true,
  sms: false,
  browser: true,
})

const saveNotificationPreferences = () => {
  // In a real app, this would make an API call
  alert('Notification preferences saved!')
}
</script>

<template>
  <div
    :class="[
      'bg-gray-50 min-h-screen py-8 px-4 sm:px-6 lg:px-8 fade-in',
      { 'dark-theme': isDarkMode },
    ]"
  >
    <!-- Page Header -->
    <div class="max-w-4xl mx-auto mb-8">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">Account Settings</h1>
          <p class="mt-1 text-sm text-gray-500">
            Manage your security and notification preferences
          </p>
        </div>
        <div class="flex items-center space-x-4">
          <!-- Theme Toggle -->
          <button
            @click="toggleTheme"
            class="p-2 rounded-full bg-gray-200 hover:bg-gray-300 transition-colors"
            :title="isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'"
          >
            <font-awesome-icon
              :icon="['fas', isDarkMode ? 'sun' : 'moon']"
              class="h-5 w-5 text-gray-700"
            />
          </button>

          <router-link
            to="/home"
            class="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <font-awesome-icon :icon="['fas', 'arrow-left']" class="mr-2 -ml-1 h-4 w-4" />
            Back to Home
          </router-link>
        </div>
      </div>
    </div>

    <div class="max-w-4xl mx-auto">
      <div class="bg-white shadow overflow-hidden sm:rounded-lg">
        <!-- Profile Header -->
        <div class="bg-gradient-to-r from-blue-600 to-indigo-700 px-6 py-8">
          <div class="flex flex-col md:flex-row items-center space-y-4 md:space-y-0">
            <div class="relative">
              <div
                class="h-28 w-28 rounded-full overflow-hidden bg-gray-200 border-4 border-white shadow-lg"
              >
                <img
                  :src="
                    previewUrl ||
                    user.avatar ||
                    'https://ui-avatars.com/api/?name=' +
                      encodeURIComponent(fullName) +
                      '&background=0D8ABC&color=fff'
                  "
                  alt="Profile"
                  class="h-full w-full object-cover"
                />
              </div>
              <label
                class="absolute bottom-0 right-0 bg-white rounded-full p-2 shadow-md cursor-pointer hover:bg-gray-100 transition-colors"
              >
                <input type="file" accept="image/*" class="hidden" @change="handleFileUpload" />
                <font-awesome-icon :icon="['fas', 'camera']" class="h-4 w-4 text-gray-600" />
              </label>
            </div>
            <div class="md:ml-8 text-center md:text-left">
              <h2 class="text-2xl font-bold text-white">{{ fullName }}</h2>
              <p class="text-blue-100">{{ user.email }}</p>
              <p class="text-blue-200 text-sm mt-1">Member since {{ user.joinDate }}</p>
              <button
                v-if="selectedFile"
                @click="uploadAvatar"
                class="mt-3 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-800 hover:bg-blue-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <font-awesome-icon :icon="['fas', 'save']" class="mr-2 -ml-1 h-4 w-4" />
                Save New Photo
              </button>
            </div>
          </div>
        </div>

        <!-- Tabs -->
        <div class="border-b border-gray-200">
          <nav class="flex -mb-px overflow-x-auto">
            <button
              @click="activeTab = 'security'"
              :class="[
                'py-4 px-6 text-center border-b-2 font-medium text-sm flex items-center',
                activeTab === 'security'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
              ]"
            >
              <font-awesome-icon :icon="['fas', 'lock']" class="mr-2 h-4 w-4" />
              Security
            </button>
            <button
              @click="activeTab = 'notifications'"
              :class="[
                'py-4 px-6 text-center border-b-2 font-medium text-sm flex items-center',
                activeTab === 'notifications'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
              ]"
            >
              <font-awesome-icon :icon="['fas', 'bell']" class="mr-2 h-4 w-4" />
              Notifications
            </button>
          </nav>
        </div>

        <!-- Tab Content -->
        <div class="p-6">
          <!-- Security Tab -->
          <div v-if="activeTab === 'security'">
            <h3 class="text-lg font-medium text-gray-900">Security Settings</h3>
            <p class="mt-1 text-sm text-gray-500">Update your password and security preferences</p>

            <form @submit.prevent="updatePassword" class="mt-6">
              <div class="space-y-6">
                <div>
                  <label for="current-password" class="block text-sm font-medium text-gray-700">
                    Current Password
                  </label>
                  <div class="mt-1">
                    <input
                      type="password"
                      id="current-password"
                      v-model="securityForm.currentPassword"
                      class="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      :class="{
                        'border-red-300 focus:ring-red-500 focus:border-red-500':
                          formErrors.currentPassword,
                      }"
                    />
                    <p v-if="formErrors.currentPassword" class="mt-1 text-sm text-red-600">
                      {{ formErrors.currentPassword }}
                    </p>
                  </div>
                </div>

                <div>
                  <label for="new-password" class="block text-sm font-medium text-gray-700">
                    New Password
                  </label>
                  <div class="mt-1">
                    <input
                      type="password"
                      id="new-password"
                      v-model="securityForm.newPassword"
                      class="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      :class="{
                        'border-red-300 focus:ring-red-500 focus:border-red-500':
                          formErrors.newPassword,
                      }"
                    />
                    <p v-if="formErrors.newPassword" class="mt-1 text-sm text-red-600">
                      {{ formErrors.newPassword }}
                    </p>
                  </div>
                </div>

                <div>
                  <label for="confirm-password" class="block text-sm font-medium text-gray-700">
                    Confirm New Password
                  </label>
                  <div class="mt-1">
                    <input
                      type="password"
                      id="confirm-password"
                      v-model="securityForm.confirmPassword"
                      class="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      :class="{
                        'border-red-300 focus:ring-red-500 focus:border-red-500':
                          formErrors.confirmPassword,
                      }"
                    />
                    <p v-if="formErrors.confirmPassword" class="mt-1 text-sm text-red-600">
                      {{ formErrors.confirmPassword }}
                    </p>
                  </div>
                </div>
              </div>

              <div class="pt-5">
                <div class="flex justify-end">
                  <button
                    type="submit"
                    class="inline-flex justify-center items-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                  >
                    <font-awesome-icon :icon="['fas', 'key']" class="mr-2 -ml-1 h-4 w-4" />
                    Update Password
                  </button>
                </div>
              </div>
            </form>

            <div class="mt-10 border-t border-gray-200 pt-6">
              <h4 class="text-base font-medium text-gray-900">Additional Security Options</h4>

              <div class="mt-4 flex items-center justify-between">
                <div class="flex items-center">
                  <div class="bg-gray-100 p-2 rounded-md">
                    <font-awesome-icon
                      :icon="['fas', 'shield-alt']"
                      class="h-5 w-5 text-gray-500"
                    />
                  </div>
                  <div class="ml-3">
                    <h5 class="text-sm font-medium text-gray-900">Two-Factor Authentication</h5>
                    <p class="text-xs text-gray-500">
                      Add an extra layer of security to your account
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  class="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                >
                  <font-awesome-icon :icon="['fas', 'shield-alt']" class="mr-2 -ml-1 h-4 w-4" />
                  Enable
                </button>
              </div>
            </div>
          </div>

          <!-- Notifications Tab -->
          <div v-if="activeTab === 'notifications'">
            <h3 class="text-lg font-medium text-gray-900">Notification Preferences</h3>
            <p class="mt-1 text-sm text-gray-500">
              Choose how you want to receive notifications from SmartPlate
            </p>

            <div class="space-y-6">
              <div class="bg-gray-50 p-4 rounded-md hover:bg-gray-100 transition-colors">
                <div class="flex items-start">
                  <div class="flex items-center h-5">
                    <input
                      id="email-notifications"
                      type="checkbox"
                      v-model="notificationSettings.email"
                      class="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                    />
                  </div>
                  <div class="ml-3 text-sm">
                    <label for="email-notifications" class="font-medium text-gray-700">
                      Email Notifications
                    </label>
                    <p class="text-gray-500">Receive updates via email</p>
                  </div>
                </div>
              </div>

              <div class="bg-gray-50 p-4 rounded-md hover:bg-gray-100 transition-colors">
                <div class="flex items-start">
                  <div class="flex items-center h-5">
                    <input
                      id="sms-notifications"
                      type="checkbox"
                      v-model="notificationSettings.sms"
                      class="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                    />
                  </div>
                  <div class="ml-3 text-sm">
                    <label for="sms-notifications" class="font-medium text-gray-700">
                      SMS Notifications
                    </label>
                    <p class="text-gray-500">Receive updates via text message</p>
                  </div>
                </div>
              </div>

              <div class="bg-gray-50 p-4 rounded-md hover:bg-gray-100 transition-colors">
                <div class="flex items-start">
                  <div class="flex items-center h-5">
                    <input
                      id="browser-notifications"
                      type="checkbox"
                      v-model="notificationSettings.browser"
                      class="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                    />
                  </div>
                  <div class="ml-3 text-sm">
                    <label for="browser-notifications" class="font-medium text-gray-700">
                      Browser Notifications
                    </label>
                    <p class="text-gray-500">Receive push notifications in your browser</p>
                  </div>
                </div>
              </div>

              <div class="flex justify-end">
                <button
                  type="button"
                  @click="saveNotificationPreferences"
                  class="inline-flex justify-center items-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                >
                  <font-awesome-icon :icon="['fas', 'save']" class="mr-2 -ml-1 h-4 w-4" />
                  Save Preferences
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style>
.fade-in {
  animation: fadeIn 0.3s ease-in-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
