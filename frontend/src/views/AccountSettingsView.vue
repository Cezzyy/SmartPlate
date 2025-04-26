<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useUserStore } from '@/stores/user'
import { useRouter, useRoute } from 'vue-router'

const userStore = useUserStore()
const router = useRouter()
const route = useRoute()

// Check if user is authenticated
if (!userStore.isAuthenticated) {
  router.push('/login')
}

// Computed full name from the store
const fullName = computed(() => userStore.fullName)

// Form states
const securityForm = reactive({
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
})

// Password visibility toggles
const showCurrentPassword = ref(false)
const showNewPassword = ref(false)
const showConfirmPassword = ref(false)

// Form validation states
const formErrors = reactive({
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
  form: '',
})

// Success message state
const successMessage = ref('')

// Active tab state
const activeTab = ref('security')

// Check URL query parameters for tab
onMounted(() => {
  const tabParam = route.query.tab
  if (tabParam && (tabParam === 'security' || tabParam === 'notifications')) {
    activeTab.value = tabParam
  }
})

// Password validation rules
const validatePassword = (password) => {
  const errors = []

  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long')
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter')
  }

  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter')
  }

  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number')
  }

  return errors
}

const updatePassword = async () => {
  // Reset error and success messages
  formErrors.currentPassword = ''
  formErrors.newPassword = ''
  formErrors.confirmPassword = ''
  formErrors.form = ''
  successMessage.value = ''

  // Validate passwords
  let isValid = true

  // Current password check
  if (!securityForm.currentPassword) {
    formErrors.currentPassword = 'Current password is required'
    isValid = false
  } else {
    // In a real app, would verify the current password against the server
    const foundUser = userStore.users.find(
      (user) =>
        user.ltoClientId === userStore.currentUser?.ltoClientId &&
        user.password === securityForm.currentPassword,
    )

    if (!foundUser) {
      formErrors.currentPassword = 'Current password is incorrect'
      isValid = false
    }
  }

  // New password validation
  if (!securityForm.newPassword) {
    formErrors.newPassword = 'New password is required'
    isValid = false
  } else {
    const passwordErrors = validatePassword(securityForm.newPassword)
    if (passwordErrors.length > 0) {
      formErrors.newPassword = passwordErrors[0]
      isValid = false
    }
  }

  // Confirm password check
  if (!securityForm.confirmPassword) {
    formErrors.confirmPassword = 'Please confirm your new password'
    isValid = false
  } else if (securityForm.newPassword !== securityForm.confirmPassword) {
    formErrors.confirmPassword = 'Passwords do not match'
    isValid = false
  }

  if (!isValid) return

  try {
    // Find the user in the users array and update the password
    const userIndex = userStore.users.findIndex(
      (user) => user.ltoClientId === userStore.currentUser?.ltoClientId,
    )

    if (userIndex !== -1) {
      userStore.users[userIndex].password = securityForm.newPassword

      // Reset form fields
      securityForm.currentPassword = ''
      securityForm.newPassword = ''
      securityForm.confirmPassword = ''

      // Show success message
      successMessage.value = 'Password updated successfully!'
    } else {
      formErrors.form = 'An error occurred. User not found.'
    }
  } catch (error) {
    formErrors.form = 'An error occurred while updating your password.'
    console.error('Password update error:', error)
  }
}

// Toggle password visibility
const togglePasswordVisibility = (field) => {
  if (field === 'current') {
    showCurrentPassword.value = !showCurrentPassword.value
  } else if (field === 'new') {
    showNewPassword.value = !showNewPassword.value
  } else if (field === 'confirm') {
    showConfirmPassword.value = !showConfirmPassword.value
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
  successMessage.value = 'Notification preferences saved!'
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
                    userStore.currentUser?.avatar ||
                    'https://ui-avatars.com/api/?name=' +
                      encodeURIComponent(fullName) +
                      '&background=0D8ABC&color=fff'
                  "
                  alt="Profile"
                  class="h-full w-full object-cover"
                />
              </div>
            </div>
            <div class="md:ml-8 text-center md:text-left">
              <h2 class="text-2xl font-bold text-white">{{ fullName }}</h2>
              <p class="text-blue-100">{{ userStore.currentUser?.email }}</p>
              <p class="text-blue-200 text-sm mt-1">
                LTO Client ID: {{ userStore.currentUser?.ltoClientId }}
              </p>
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
          <!-- Success Message -->
          <div
            v-if="successMessage"
            class="mb-6 p-4 bg-green-50 rounded-md border border-green-200"
          >
            <div class="flex">
              <div class="flex-shrink-0">
                <font-awesome-icon :icon="['fas', 'check-circle']" class="h-5 w-5 text-green-400" />
              </div>
              <div class="ml-3">
                <p class="text-sm font-medium text-green-800">{{ successMessage }}</p>
              </div>
              <div class="ml-auto pl-3">
                <div class="-mx-1.5 -my-1.5">
                  <button
                    @click="successMessage = ''"
                    class="inline-flex rounded-md p-1.5 text-green-500 hover:bg-green-100 focus:outline-none"
                  >
                    <font-awesome-icon :icon="['fas', 'times']" class="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Error Message -->
          <div v-if="formErrors.form" class="mb-6 p-4 bg-red-50 rounded-md border border-red-200">
            <div class="flex">
              <div class="flex-shrink-0">
                <font-awesome-icon
                  :icon="['fas', 'exclamation-circle']"
                  class="h-5 w-5 text-red-400"
                />
              </div>
              <div class="ml-3">
                <p class="text-sm font-medium text-red-800">{{ formErrors.form }}</p>
              </div>
              <div class="ml-auto pl-3">
                <div class="-mx-1.5 -my-1.5">
                  <button
                    @click="formErrors.form = ''"
                    class="inline-flex rounded-md p-1.5 text-red-500 hover:bg-red-100 focus:outline-none"
                  >
                    <font-awesome-icon :icon="['fas', 'times']" class="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Security Tab -->
          <div v-if="activeTab === 'security'">
            <h3 class="text-lg font-medium text-gray-900">Security Settings</h3>
            <p class="mt-1 text-sm text-gray-500">Update your password and security preferences</p>

            <form @submit.prevent="updatePassword" class="mt-6">
              <div class="space-y-6">
                <!-- Current Password -->
                <div>
                  <label for="current-password" class="block text-sm font-medium text-gray-700">
                    Current Password <span class="text-red-500">*</span>
                  </label>
                  <div class="mt-1 relative rounded-md shadow-sm">
                    <input
                      :type="showCurrentPassword ? 'text' : 'password'"
                      id="current-password"
                      v-model="securityForm.currentPassword"
                      class="pr-10 py-3 text-base shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full border-gray-300 rounded-md"
                      :class="{
                        'border-red-300 focus:ring-red-500 focus:border-red-500':
                          formErrors.currentPassword,
                      }"
                    />
                    <button
                      type="button"
                      class="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-500"
                      @click="togglePasswordVisibility('current')"
                    >
                      <font-awesome-icon
                        :icon="['fas', showCurrentPassword ? 'eye-slash' : 'eye']"
                        class="h-5 w-5"
                      />
                    </button>
                    <p v-if="formErrors.currentPassword" class="mt-1 text-sm text-red-600">
                      {{ formErrors.currentPassword }}
                    </p>
                  </div>
                </div>

                <!-- New Password -->
                <div>
                  <label for="new-password" class="block text-sm font-medium text-gray-700">
                    New Password <span class="text-red-500">*</span>
                  </label>
                  <div class="mt-1 relative rounded-md shadow-sm">
                    <input
                      :type="showNewPassword ? 'text' : 'password'"
                      id="new-password"
                      v-model="securityForm.newPassword"
                      class="pr-10 py-3 text-base shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full border-gray-300 rounded-md"
                      :class="{
                        'border-red-300 focus:ring-red-500 focus:border-red-500':
                          formErrors.newPassword,
                      }"
                    />
                    <button
                      type="button"
                      class="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-500"
                      @click="togglePasswordVisibility('new')"
                    >
                      <font-awesome-icon
                        :icon="['fas', showNewPassword ? 'eye-slash' : 'eye']"
                        class="h-5 w-5"
                      />
                    </button>
                    <p v-if="formErrors.newPassword" class="mt-1 text-sm text-red-600">
                      {{ formErrors.newPassword }}
                    </p>
                  </div>
                  <div class="mt-1 text-xs text-gray-500">
                    <p>Password must:</p>
                    <ul class="list-disc pl-5 mt-1 space-y-1">
                      <li>Be at least 8 characters long</li>
                      <li>Include at least one uppercase letter</li>
                      <li>Include at least one lowercase letter</li>
                      <li>Include at least one number</li>
                    </ul>
                  </div>
                </div>

                <!-- Confirm New Password -->
                <div>
                  <label for="confirm-password" class="block text-sm font-medium text-gray-700">
                    Confirm New Password <span class="text-red-500">*</span>
                  </label>
                  <div class="mt-1 relative rounded-md shadow-sm">
                    <input
                      :type="showConfirmPassword ? 'text' : 'password'"
                      id="confirm-password"
                      v-model="securityForm.confirmPassword"
                      class="pr-10 py-3 text-base shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full border-gray-300 rounded-md"
                      :class="{
                        'border-red-300 focus:ring-red-500 focus:border-red-500':
                          formErrors.confirmPassword,
                      }"
                    />
                    <button
                      type="button"
                      class="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-500"
                      @click="togglePasswordVisibility('confirm')"
                    >
                      <font-awesome-icon
                        :icon="['fas', showConfirmPassword ? 'eye-slash' : 'eye']"
                        class="h-5 w-5"
                      />
                    </button>
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

              <div class="flex justify-between">
                <router-link
                  to="/notifications"
                  class="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <font-awesome-icon :icon="['fas', 'arrow-left']" class="mr-2 -ml-1 h-4 w-4" />
                  Return to Notifications
                </router-link>
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
