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
    } else {
      errors.value.form = 'Invalid admin credentials'
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
    class="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-700 flex items-center justify-center px-4 sm:px-6 lg:px-8"
  >
    <div
      class="max-w-md w-full space-y-8 bg-white/90 backdrop-blur-sm p-8 rounded-xl shadow-2xl border border-white/20"
    >
      <div>
        <img class="mx-auto h-16 w-auto" src="/Land_Transportation_Office.webp" alt="LTO Logo" />
        <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">Admin Portal</h2>
        <p class="mt-2 text-center text-sm text-gray-600">Secure access for administrators only</p>
      </div>

      <form @submit.prevent="validateAndLogin" class="mt-8 space-y-6" novalidate>
        <div class="rounded-md shadow-sm -space-y-px">
          <div>
            <label for="email" class="sr-only">Email address</label>
            <input
              id="email"
              v-model="email"
              name="email"
              type="email"
              autocomplete="email"
              required
              @blur="validateEmail"
              class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
              :class="{ 'border-red-500': errors.email }"
              placeholder="Admin Email"
            />
            <p
              v-if="errors.email"
              class="mt-1 text-sm text-red-600 animate-appear font-medium pl-1"
            >
              {{ errors.email }}
            </p>
          </div>

          <div>
            <label for="password" class="sr-only">Password</label>
            <input
              id="password"
              v-model="password"
              name="password"
              type="password"
              autocomplete="current-password"
              required
              @blur="validatePassword"
              class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
              :class="{ 'border-red-500': errors.password }"
              placeholder="Password"
            />
            <p
              v-if="errors.password"
              class="mt-1 text-sm text-red-600 animate-appear font-medium pl-1"
            >
              {{ errors.password }}
            </p>
          </div>
        </div>

        <div
          v-if="errors.form"
          class="rounded-md bg-red-50 p-4 animate-appear border border-red-100 shadow-sm"
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

        <div>
          <button
            type="submit"
            class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <span class="absolute left-0 inset-y-0 flex items-center pl-3">
              <font-awesome-icon
                :icon="['fas', 'lock']"
                class="h-5 w-5 text-blue-500 group-hover:text-blue-400"
              />
            </span>
            Sign in
          </button>
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
