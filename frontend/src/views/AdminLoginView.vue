<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const userStore = useUserStore()

// Form data
const email = ref('')
const password = ref('')
const isLoading = ref(false)
const errors = ref({
  email: '',
  password: '',
  form: '',
})

// Check if user is already authenticated with correct role on mount
onMounted(() => {
  console.log('AdminLoginView mounted. Checking authentication state...');
  // Check if user is authenticated and has the right role
  if (userStore.checkAuth()) {
    const userRole = userStore.currentUser?.role?.toLowerCase() || ''
    console.log('User already authenticated with role:', userRole);
    if (userRole === 'admin') {
      router.push('/admin')
    } else if (userRole === 'lto officer') {
      router.push('/lto-portal')
    }
  }
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

const handleAdminLogin = async (e) => {
  // If event is passed, prevent default behavior
  if (e) e.preventDefault()
  
  try {
    errors.value.form = ''
    isLoading.value = true
    
    console.log(`Attempting admin login with email: ${email.value}`);
    
    // Call the login action from the user store with admin flag
    const user = await userStore.login(email.value, password.value, true)
    
    console.log('Login successful, user data:', user);
    
    // Normalize role for case-insensitive comparison
    const userRole = user.role?.toLowerCase() || ''
    console.log('User role (normalized):', userRole);
    
    // Check if user has the correct role and only route if authorized
    if (userRole === 'admin') {
      console.log('Admin login successful, redirecting to admin portal')
      router.push('/admin')
    } else if (userRole === 'lto officer') {
      console.log('LTO Officer login successful, redirecting to LTO portal')
      router.push('/lto-portal')
    } else {
      console.warn('User has invalid role for admin portal:', userRole);
      // User doesn't have admin or LTO officer role
      await userStore.logout() // Log them out since they shouldn't access this portal
      errors.value.form = 'Unauthorized: This portal is only for Administrators and LTO Officers'
    }
  } catch (error) {
    console.error('Login error:', error);
    
    // Check for specific account deactivation error message
    if (error.message && error.message.includes('Account is deactivated')) {
      errors.value.form = 'Your account has been deactivated. Please contact an administrator for assistance.'
    } else {
      // Check if error is axios error with response data
      let errorMessage = '';
      if (error.response) {
        if (error.response.status === 404) {
          errorMessage = 'The admin login service is currently unavailable. Please try again later.';
        } else if (error.response.status === 401) {
          errorMessage = 'Invalid email or password. Please check your credentials.';
        } else if (error.response.data && error.response.data.error) {
          errorMessage = error.response.data.error;
        } else {
          errorMessage = `Server error (${error.response.status}). Please try again later.`;
        }
      } else if (error.message) {
        errorMessage = error.message;
      } else {
        errorMessage = 'Login failed. Please check your credentials and try again.';
      }
      
      errors.value.form = errorMessage;
    }
    
    // Clear the password field after a failed login attempt
    password.value = '';
  } finally {
    isLoading.value = false
  }
  
  // Prevent form submission
  return false
}

const validateAndLogin = (e) => {
  // If event is passed, prevent default behavior
  if (e) e.preventDefault()
  
  errors.value.form = ''

  const isEmailValid = validateEmail()
  const isPasswordValid = validatePassword()

  if (isEmailValid && isPasswordValid) {
    handleAdminLogin()
  }
  
  // Prevent form submission
  return false
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
        <p class="mt-2 text-sm text-gray-600">Secure access for administrators and LTO officers</p>
      </div>

      <form 
        @submit="(e) => { e.preventDefault(); return false; }" 
        class="space-y-6" 
        novalidate
      >
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
              @keydown.enter.prevent="validateAndLogin"
              :disabled="isLoading"
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
              @keydown.enter.prevent="validateAndLogin"
              :disabled="isLoading"
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
            type="button"
            @click="(e) => { e.preventDefault(); validateAndLogin(); }"
            :disabled="isLoading"
            class="group relative w-full flex justify-center py-3 px-4 border border-transparent text-base font-medium rounded-lg text-white bg-dark-blue hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-light-blue transition-all shadow-md disabled:opacity-70"
          >
            <span class="absolute left-0 inset-y-0 flex items-center pl-3">
              <font-awesome-icon
                :icon="['fas', 'lock']"
                class="h-5 w-5 text-light-blue group-hover:text-blue-100"
              />
            </span>
            <span v-if="isLoading">
              <font-awesome-icon :icon="['fas', 'circle-notch']" class="animate-spin mr-2" />
              Signing in...
            </span>
            <span v-else>Sign in</span>
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
