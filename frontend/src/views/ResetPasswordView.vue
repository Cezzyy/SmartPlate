<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import api from '@/services/api'

const router = useRouter()
const route = useRoute()

// Form state
const password = ref('')
const confirmPassword = ref('')
const token = ref('')
const isSubmitting = ref(false)
const resetComplete = ref(false)
const showPassword = ref(false)
const showConfirmPassword = ref(false)

// Error handling
const errors = reactive({
  token: '',
  password: '',
  confirmPassword: '',
  form: ''
})

// Get token from URL on component mount
onMounted(() => {
  token.value = route.query.token?.toString() || ''

  if (!token.value) {
    errors.token = 'Invalid or missing reset token'
  }
})

// Clear all form errors
const clearErrors = () => {
  errors.token = ''
  errors.password = ''
  errors.confirmPassword = ''
  errors.form = ''
}

// Handle form submission
const handleSubmit = async () => {
  clearErrors()

  // Basic validation
  let isValid = true

  if (!token.value) {
    errors.token = 'Invalid or missing reset token'
    isValid = false
  }

  if (!password.value) {
    errors.password = 'Password is required'
    isValid = false
  } else if (password.value.length < 8) {
    errors.password = 'Password must be at least 8 characters long'
    isValid = false
  }

  if (!confirmPassword.value) {
    errors.confirmPassword = 'Please confirm your password'
    isValid = false
  } else if (password.value !== confirmPassword.value) {
    errors.confirmPassword = 'Passwords do not match'
    isValid = false
  }

  if (!isValid) return

  try {
    isSubmitting.value = true

    // Call the reset password API endpoint
    await api.post('/reset-password-confirm', {
      token: token.value,
      password: password.value
    })

    resetComplete.value = true
  } catch (error) {
    console.error('Password reset error:', error)

    // Handle different error types
    if (error.response) {
      const status = error.response.status
      const errorMessage = error.response.data?.error || 'An error occurred'

      if (status === 400) {
        // Bad request - likely invalid token or validation error
        errors.form = errorMessage
      } else if (status === 404) {
        // Token not found
        errors.token = 'Invalid or expired reset token'
      } else {
        // Other errors
        errors.form = 'Failed to reset password. Please try again.'
      }
    } else {
      errors.form = 'Network error. Please check your connection and try again.'
    }
  } finally {
    isSubmitting.value = false
  }
}

// Go to login page
const goToLogin = () => {
  router.push('/login')
}

// Toggle password visibility
const togglePasswordVisibility = () => {
  showPassword.value = !showPassword.value
}

// Toggle confirm password visibility
const toggleConfirmPasswordVisibility = () => {
  showConfirmPassword.value = !showConfirmPassword.value
}
</script>

<template>
  <div class="flex min-h-screen relative">
    <!-- Back Button -->
    <button
      @click="router.push('/login')"
      class="absolute top-4 left-4 text-white hover:text-red transition-colors focus:outline-none z-10"
    >
      <font-awesome-icon :icon="['fas', 'arrow-left']" class="h-5 w-5" />
    </button>

    <!-- Left Column - Welcome Text -->
    <div
      class="hidden md:flex md:w-1/2 bg-gradient-to-br from-dark-blue to-black p-8 text-white flex-col justify-center items-center"
    >
      <div class="max-w-md mx-auto">
        <h1 class="text-4xl font-bold mb-6">Reset Your Password</h1>
        <p class="text-lg mb-8">
          Create a new secure password for your SmartPlate account. Make sure to use a strong password that you don't use on other sites.
        </p>
        <div class="border-t border-white/20 w-24 mx-auto my-8"></div>
        <p class="mb-6">Remember your password?</p>
        <a
          href="#"
          @click.prevent="goToLogin"
          class="inline-block bg-red text-white font-semibold py-3 px-6 rounded-lg hover:bg-opacity-90 transition-all transform hover:-translate-y-0.5 hover:shadow-lg"
        >
          Back to Login
        </a>
      </div>
    </div>

    <!-- Right Column - Form -->
    <div
      class="w-full md:w-1/2 bg-gradient-to-br from-light-blue/10 to-white p-5 flex items-center justify-center"
    >
      <div class="w-full max-w-md bg-white rounded-xl shadow-lg p-8 md:p-10 relative">
        <!-- Token error message -->
        <div v-if="errors.token && !resetComplete" class="rounded-md bg-red-50 p-4 mb-6">
          <div class="flex items-center">
            <font-awesome-icon :icon="['fas', 'triangle-exclamation']" class="h-5 w-5 text-red mr-3" />
            <div>
              <h3 class="text-sm font-medium text-red-800">Error</h3>
              <p class="text-sm text-red-700 mt-1">{{ errors.token }}</p>
            </div>
          </div>
        </div>

        <!-- Reset Password Form -->
        <div v-if="!resetComplete && !errors.token">
          <div class="text-center mb-8">
            <h1 class="text-3xl font-bold text-dark-blue mb-2">Reset Password</h1>
            <p class="text-gray text-base">Enter your new password below</p>
          </div>

          <form @submit.prevent="handleSubmit" class="flex flex-col gap-5" novalidate>
            <!-- Password Field -->
            <div class="flex flex-col gap-2">
              <label for="password" class="text-sm font-semibold text-dark-blue">New Password</label>
              <div class="relative">
                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <font-awesome-icon :icon="['fas', 'lock']" class="h-5 w-5 text-gray" />
                </div>
                <input
                  :type="showPassword ? 'text' : 'password'"
                  id="password"
                  v-model="password"
                  placeholder="Enter new password"
                  class="w-full pl-10 pr-10 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-dark-blue/20 transition-all"
                  :class="[errors.password ? 'border-red text-red' : 'border-gray-200']"
                  required
                />
                <div class="absolute inset-y-0 right-0 pr-3 flex items-center">
                  <button
                    type="button"
                    @click="togglePasswordVisibility"
                    class="text-gray hover:text-dark-blue focus:outline-none"
                  >
                    <font-awesome-icon
                      :icon="['fas', showPassword ? 'eye-slash' : 'eye']"
                      class="h-5 w-5"
                    />
                  </button>
                </div>
              </div>
              <div v-if="errors.password" class="flex items-center gap-2 mt-1 text-red">
                <font-awesome-icon :icon="['fas', 'circle-exclamation']" class="h-4 w-4" />
                <p class="text-xs">{{ errors.password }}</p>
              </div>
            </div>

            <!-- Confirm Password Field -->
            <div class="flex flex-col gap-2">
              <label for="confirmPassword" class="text-sm font-semibold text-dark-blue">Confirm Password</label>
              <div class="relative">
                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <font-awesome-icon :icon="['fas', 'lock']" class="h-5 w-5 text-gray" />
                </div>
                <input
                  :type="showConfirmPassword ? 'text' : 'password'"
                  id="confirmPassword"
                  v-model="confirmPassword"
                  placeholder="Confirm new password"
                  class="w-full pl-10 pr-10 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-dark-blue/20 transition-all"
                  :class="[errors.confirmPassword ? 'border-red text-red' : 'border-gray-200']"
                  required
                />
                <div class="absolute inset-y-0 right-0 pr-3 flex items-center">
                  <button
                    type="button"
                    @click="toggleConfirmPasswordVisibility"
                    class="text-gray hover:text-dark-blue focus:outline-none"
                  >
                    <font-awesome-icon
                      :icon="['fas', showConfirmPassword ? 'eye-slash' : 'eye']"
                      class="h-5 w-5"
                    />
                  </button>
                </div>
              </div>
              <div v-if="errors.confirmPassword" class="flex items-center gap-2 mt-1 text-red">
                <font-awesome-icon :icon="['fas', 'circle-exclamation']" class="h-4 w-4" />
                <p class="text-xs">{{ errors.confirmPassword }}</p>
              </div>
            </div>

            <div
              v-if="errors.form"
              class="flex items-center justify-center gap-2 mt-1 text-red bg-red/5 p-3 rounded-lg"
            >
              <font-awesome-icon :icon="['fas', 'triangle-exclamation']" class="h-4 w-4" />
              <p class="text-sm">{{ errors.form }}</p>
            </div>

            <button
              type="submit"
              :disabled="isSubmitting"
              class="bg-dark-blue text-white font-semibold py-3 px-4 rounded-lg mt-2 hover:bg-light-blue transform hover:-translate-y-0.5 transition-all hover:shadow-lg active:translate-y-0 disabled:opacity-70 disabled:transform-none disabled:hover:shadow-none"
            >
              <span v-if="isSubmitting">Processing...</span>
              <span v-else>Reset Password</span>
            </button>
          </form>

          <!-- Mobile-only login button -->
          <div class="md:hidden text-center mt-8">
            <p class="text-gray mb-4">Remember your password?</p>
            <a
              href="#"
              @click.prevent="goToLogin"
              class="inline-block bg-red text-white font-semibold py-3 px-6 rounded-lg w-full hover:bg-opacity-90 transition-all"
            >
              Back to Login
            </a>
          </div>
        </div>

        <!-- Success message -->
        <div v-if="resetComplete">
          <div class="text-center mb-8">
            <div class="flex justify-center mb-6">
              <div class="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center">
                <font-awesome-icon :icon="['fas', 'check']" class="h-8 w-8 text-green-600" />
              </div>
            </div>
            <h1 class="text-3xl font-bold text-dark-blue mb-2">Password Reset Complete</h1>
            <p class="text-gray text-base">Your password has been successfully reset</p>
          </div>

          <div class="bg-green-50 border border-green-100 rounded-lg p-4 mb-6">
            <p class="text-sm text-green-800">
              Your password has been updated. You can now log in with your new password.
            </p>
          </div>

          <button
            @click="goToLogin"
            class="w-full bg-dark-blue text-white font-semibold py-3 px-4 rounded-lg hover:bg-light-blue transform hover:-translate-y-0.5 transition-all hover:shadow-lg active:translate-y-0"
          >
            Go to Login
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
