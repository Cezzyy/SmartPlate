<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import api from '@/services/api'

const router = useRouter()

// Form state
const email = ref('')
const isSubmitting = ref(false)
const requestSent = ref(false)

// Error handling
const errors = reactive({
  email: '',
  form: ''
})

// Clear all form errors
const clearErrors = () => {
  errors.email = ''
  errors.form = ''
}

// Handle form submission
const handleSubmit = async () => {
  clearErrors()

  // Basic validation
  if (!email.value) {
    errors.email = 'Email is required'
    return
  }

  // Email format validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email.value)) {
    errors.email = 'Please enter a valid email address'
    return
  }

  try {
    isSubmitting.value = true

    // Call the password reset API endpoint
    await api.post('/request-password-reset', { email: email.value })

    // Always show success even if email doesn't exist (security best practice)
    requestSent.value = true
  } catch (error) {
    console.error('Password reset request error:', error)
    // Don't expose if the email exists or not
    requestSent.value = true
  } finally {
    isSubmitting.value = false
  }
}

// Go back to login page
const goToLogin = () => {
  router.push('/login')
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
        <h1 class="text-4xl font-bold mb-6">Password Recovery</h1>
        <p class="text-lg mb-8">
          Don't worry, we'll help you get back into your account. Enter your email address and we'll send you instructions to reset your password.
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
        <div v-if="!requestSent">
          <div class="text-center mb-8">
            <h1 class="text-3xl font-bold text-dark-blue mb-2">Forgot Password</h1>
            <p class="text-gray text-base">Enter your email to receive a reset link</p>
          </div>

          <form @submit.prevent="handleSubmit" class="flex flex-col gap-5" novalidate>
            <!-- Email Field -->
            <div class="flex flex-col gap-2">
              <label for="email" class="text-sm font-semibold text-dark-blue">Email</label>
              <div class="relative">
                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <font-awesome-icon :icon="['fas', 'envelope']" class="h-5 w-5 text-gray" />
                </div>
                <input
                  type="email"
                  id="email"
                  v-model="email"
                  placeholder="Enter your email"
                  class="w-full pl-10 pr-3 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-dark-blue/20 transition-all"
                  :class="[errors.email ? 'border-red text-red' : 'border-gray-200']"
                  required
                />
              </div>
              <div v-if="errors.email" class="flex items-center gap-2 mt-1 text-red">
                <font-awesome-icon :icon="['fas', 'circle-exclamation']" class="h-4 w-4" />
                <p class="text-xs">{{ errors.email }}</p>
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
              <span v-else>Send Reset Link</span>
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
        <div v-if="requestSent">
          <div class="text-center mb-8">
            <div class="flex justify-center mb-6">
              <div class="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center">
                <font-awesome-icon :icon="['fas', 'envelope']" class="h-8 w-8 text-green-600" />
              </div>
            </div>
            <h1 class="text-3xl font-bold text-dark-blue mb-2">Check Your Email</h1>
            <p class="text-gray text-base">We've sent instructions to reset your password</p>
          </div>

          <div class="bg-green-50 border border-green-100 rounded-lg p-4 mb-6">
            <p class="text-sm text-green-800">
              If your email exists in our system, you'll receive a password reset link shortly. Please check your inbox and spam folder.
            </p>
          </div>

          <button
            @click="goToLogin"
            class="w-full bg-dark-blue text-white font-semibold py-3 px-4 rounded-lg hover:bg-light-blue transform hover:-translate-y-0.5 transition-all hover:shadow-lg active:translate-y-0"
          >
            Return to Login
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
