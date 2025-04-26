<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const userStore = useUserStore()

// Form data
const email = ref('')
const password = ref('')
const errors = ref({
  email: '',
  password: '',
  form: '',
})

// Validation functions
const validateEmail = () => {
  if (!email.value) {
    errors.value.email = 'Email is required'
    return false
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) {
    errors.value.email = 'Please enter a valid email address'
    return false
  }
  errors.value.email = ''
  return true
}

const validatePassword = () => {
  if (!password.value) {
    errors.value.password = 'Password is required'
    return false
  }
  if (password.value.length < 6) {
    errors.value.password = 'Password must be at least 6 characters long'
    return false
  }
  errors.value.password = ''
  return true
}

const handleAdminLogin = async () => {
  try {
    errors.value.form = ''

    // Call the login action from the user store with admin flag
    await userStore.login(email.value, password.value, true)

    if (userStore.isAdmin) {
      router.push('/admin')
    } else if (userStore.currentUser?.role === 'LTO Officer') {
      router.push('/lto-portal')
    } else {
      errors.value.form = 'Invalid credentials'
    }
  } catch (error) {
    errors.value.form = error.message || 'Login failed. Please try again.'
  }
}

const validateAndLogin = () => {
  errors.value.form = ''

  const isEmailValid = validateEmail()
  const isPasswordValid = validatePassword()

  if (isEmailValid && isPasswordValid) {
    handleAdminLogin()
  }
}
</script>

<template>
  <div
    class="min-h-screen bg-gradient-to-br from-dark-blue via-light-blue to-blue-400 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12"
  >
    <div
      class="max-w-md w-full bg-white/95 backdrop-blur-md p-8 rounded-xl shadow-2xl border border-white/30"
    >
      <!-- Logo and Header -->
      <div class="text-center mb-8">
        <div class="bg-dark-blue inline-flex rounded-full p-3 mb-4 shadow-md">
          <img class="h-16 w-auto" src="/Land_Transportation_Office.webp" alt="LTO Logo" />
        </div>
        <h2 class="text-3xl font-extrabold text-dark-blue">Admin Portal</h2>
        <p class="mt-2 text-sm text-gray-600">Secure access for administrators only</p>
      </div>

      <form @submit.prevent="validateAndLogin" class="space-y-6" novalidate>
        <!-- Email Field -->
        <div class="space-y-1">
          <label for="email" class="block text-sm font-medium text-gray-700">Email address</label>
          <div class="relative rounded-md shadow-sm">
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <font-awesome-icon :icon="['fas', 'envelope']" class="text-gray-400" />
            </div>
            <input
              id="email"
              v-model="email"
              name="email"
              type="email"
              autocomplete="email"
              required
              @blur="validateEmail"
              class="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-light-blue focus:border-light-blue transition-all text-base"
              :class="{ 'border-red-500 bg-red-50': errors.email }"
              placeholder="Admin Email"
            />
          </div>
          <p v-if="errors.email" class="mt-1 text-sm text-red-600 animate-appear font-medium pl-1">
            {{ errors.email }}
          </p>
        </div>

        <!-- Password Field -->
        <div class="space-y-1">
          <label for="password" class="block text-sm font-medium text-gray-700">Password</label>
          <div class="relative rounded-md shadow-sm">
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <font-awesome-icon :icon="['fas', 'lock']" class="text-gray-400" />
            </div>
            <input
              id="password"
              v-model="password"
              name="password"
              type="password"
              autocomplete="current-password"
              required
              @blur="validatePassword"
              class="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-light-blue focus:border-light-blue transition-all text-base"
              :class="{ 'border-red-500 bg-red-50': errors.password }"
              placeholder="Password"
            />
          </div>
          <p
            v-if="errors.password"
            class="mt-1 text-sm text-red-600 animate-appear font-medium pl-1"
          >
            {{ errors.password }}
          </p>
        </div>

        <!-- Form Error Message -->
        <div
          v-if="errors.form"
          class="rounded-lg bg-red-50 p-4 animate-appear border border-red-100 shadow-sm"
        >
          <div class="flex">
            <div class="flex-shrink-0">
              <font-awesome-icon
                :icon="['fas', 'exclamation-circle']"
                class="h-5 w-5 text-red-500"
              />
            </div>
            <div class="ml-3">
              <h3 class="text-sm font-medium text-red-800">{{ errors.form }}</h3>
            </div>
          </div>
        </div>

        <!-- Login Button -->
        <div class="pt-4">
          <button
            type="submit"
            class="group relative w-full flex justify-center py-3 px-4 border border-transparent text-base font-medium rounded-lg text-white bg-dark-blue hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-light-blue transition-all shadow-md"
          >
            <span class="absolute left-0 inset-y-0 flex items-center pl-3">
              <font-awesome-icon
                :icon="['fas', 'lock']"
                class="h-5 w-5 text-light-blue group-hover:text-blue-100"
              />
            </span>
            Sign in
          </button>
        </div>

        <!-- Return to Main Site Link -->
        <div class="text-center mt-6">
          <a
            href="/"
            class="inline-flex items-center text-sm font-medium text-light-blue hover:text-dark-blue transition-colors"
          >
            <font-awesome-icon :icon="['fas', 'arrow-left']" class="mr-2 h-4 w-4" />
            Return to main site
          </a>
        </div>
      </form>
    </div>
  </div>
</template>

<style scoped>
.animate-appear {
  animation: appear 0.3s ease-in-out;
}

@keyframes appear {
  from {
    opacity: 0;
    transform: translateY(-5px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
