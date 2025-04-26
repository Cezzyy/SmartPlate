<script setup>
import { ref, reactive, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

// Reactive variables for login form
const email = ref('')
const password = ref('')
const rememberMe = ref(false)
const showPassword = ref(false)

// Reactive variables for registration form
const showRegisterPassword = ref(false)
const showConfirmPassword = ref(false)
const registerData = reactive({
  email: '',
  password: '',
  confirmPassword: '',
  acceptTerms: false,
})

// Error handling
const errors = reactive({
  email: '',
  password: '',
  form: '',
  registerEmail: '',
  registerPassword: '',
  confirmPassword: '',
  terms: '',
  registerForm: '',
})

// Check for redirect query parameter
watch(() => route.query.redirect, (newRedirect) => {
  if (newRedirect) {
    errors.form = 'Please log in to access that page'
  }
}, { immediate: true })

// Toggle between login and registration forms
const isLogin = ref(true)
const toggleForm = () => {
  // Clear all errors when switching forms
  clearErrors()
  // Toggle between login and registration forms
  isLogin.value = !isLogin.value
}

// Handle registration form submission
const handleRegistration = () => {
  clearErrors()

  // Basic validation
  let isValid = true

  if (!registerData.email) {
    errors.registerEmail = 'Email is required'
    isValid = false
  }

  if (!registerData.password) {
    errors.registerPassword = 'Password is required'
    isValid = false
  }

  if (!registerData.confirmPassword) {
    errors.confirmPassword = 'Please confirm your password'
    isValid = false
  }

  if (registerData.password !== registerData.confirmPassword) {
    errors.confirmPassword = 'Passwords do not match'
    isValid = false
  }

  if (!registerData.acceptTerms) {
    errors.terms = 'You must accept the terms and conditions'
    isValid = false
  }

  if (isValid) {
    // Start the registration process in the user store
    userStore.startRegistration({
      email: registerData.email,
      password: registerData.password
    })
    
    // Redirect to the full registration form
    router.push('/register')
  }
}

const clearErrors = () => {
  Object.keys(errors).forEach((key) => {
    errors[key] = ''
  })
}

// Password visibility toggles
const togglePasswordVisibility = () => {
  showPassword.value = !showPassword.value
}

const toggleRegisterPasswordVisibility = () => {
  showRegisterPassword.value = !showRegisterPassword.value
}

const toggleConfirmPasswordVisibility = () => {
  showConfirmPassword.value = !showConfirmPassword.value
}

// Validation functions for login form
const validateLoginEmail = () => {
  errors.email = ''
  if (!email.value) {
    errors.email = 'Email is required'
    return false
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email.value)) {
    errors.email = 'Please enter a valid email address'
    return false
  }

  return true
}

const validateLoginPassword = () => {
  errors.password = ''
  if (!password.value) {
    errors.password = 'Password is required'
    return false
  }

  if (password.value.length < 6) {
    errors.password = 'Password must be at least 6 characters'
    return false
  }

  return true
}

// Validation functions for registration form
const validateRegisterEmail = () => {
  errors.registerEmail = ''
  if (!registerData.email) {
    errors.registerEmail = 'Email is required'
    return false
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(registerData.email)) {
    errors.registerEmail = 'Please enter a valid email address'
    return false
  }

  return true
}

const validateRegisterPassword = () => {
  errors.registerPassword = ''
  if (!registerData.password) {
    errors.registerPassword = 'Password is required'
    return false
  }

  if (registerData.password.length < 8) {
    errors.registerPassword = 'Password must be at least 8 characters'
    return false
  }

  // Check for password strength
  const hasUpperCase = /[A-Z]/.test(registerData.password)
  const hasLowerCase = /[a-z]/.test(registerData.password)
  const hasNumbers = /\d/.test(registerData.password)
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(registerData.password)

  if (!(hasUpperCase && hasLowerCase && hasNumbers)) {
    errors.registerPassword = 'Password must contain uppercase, lowercase, and numbers'
    return false
  }

  if (!hasSpecialChar) {
    errors.registerPassword = 'Password must contain at least one special character'
    return false
  }

  return true
}

const validateConfirmPassword = () => {
  errors.confirmPassword = ''
  if (!registerData.confirmPassword) {
    errors.confirmPassword = 'Please confirm your password'
    return false
  }

  if (registerData.password !== registerData.confirmPassword) {
    errors.confirmPassword = 'Passwords do not match'
    return false
  }

  return true
}

const validatePasswordMatch = () => {
  if (registerData.confirmPassword && registerData.password !== registerData.confirmPassword) {
    errors.confirmPassword = 'Passwords do not match'
    return false
  }
  return true
}

const validateTerms = () => {
  errors.terms = ''
  if (!registerData.acceptTerms) {
    errors.terms = 'You must accept the terms and conditions'
    return false
  }
  return true
}

// Form submission handlers with validation
const validateAndLogin = () => {
  clearErrors()
  
  const isEmailValid = validateLoginEmail()
  const isPasswordValid = validateLoginPassword()
  
  if (isEmailValid && isPasswordValid) {
    handleLogin()
  }
}

const validateAndRegister = () => {
  clearErrors()
  
  const isEmailValid = validateRegisterEmail()
  const isPasswordValid = validateRegisterPassword()
  const isConfirmPasswordValid = validateConfirmPassword()
  const isTermsValid = validateTerms()
  
  if (isEmailValid && isPasswordValid && isConfirmPasswordValid && isTermsValid) {
    handleRegistration()
  }
}

// Form submission handlers
const handleLogin = async () => {
  try {
    // Show loading state
    errors.form = 'Logging in...'
    
    // Call the login action from the user store
    await userStore.login(email.value, password.value)
    
    // Check for redirect query parameter
    const redirectPath = route.query.redirect || '/home'
    router.push(redirectPath)
  } catch {
    // Display error message
    errors.form = userStore.error || 'Login failed. Please try again.'
  }
}
</script>

<template>
  <div class="flex min-h-screen">
    <!-- Left Column - Welcome Text and Registration -->
    <div
      class="hidden md:flex md:w-1/2 bg-gradient-to-br from-dark-blue to-black p-8 text-white flex-col justify-center items-center"
    >
      <div class="max-w-md mx-auto">
        <h1 class="text-4xl font-bold mb-6">Welcome to SmartPlate</h1>
        <p class="text-lg mb-8">
          The advanced vehicle plate detection system designed to improve identification, prevent
          fraud, and ensure compliance with registration regulations.
        </p>
        <div class="border-t border-white/20 w-24 mx-auto my-8"></div>
        <p class="mb-6">Don't have an account yet?</p>
        <a
          href="#"
          @click.prevent="toggleForm"
          class="inline-block bg-red text-white font-semibold py-3 px-6 rounded-lg hover:bg-opacity-90 transition-all transform hover:-translate-y-0.5 hover:shadow-lg"
        >
          {{ isLogin ? 'Create Account' : 'Back to Login' }}
        </a>
      </div>
    </div>

    <!-- Right Column - Login/Register Form -->
    <div
      class="w-full md:w-1/2 bg-gradient-to-br from-light-blue/10 to-white p-5 flex items-center justify-center"
    >
      <div class="w-full max-w-md bg-white rounded-xl shadow-lg p-8 md:p-10">
        <!-- Login Form -->
        <div v-if="isLogin">
          <div class="text-center mb-8">
            <h1 class="text-3xl font-bold text-dark-blue mb-2">SmartPlate</h1>
            <p class="text-gray text-base">Sign in to access into your account!</p>
          </div>
          <form @submit.prevent="validateAndLogin" class="flex flex-col gap-5" novalidate>
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
                  @blur="validateLoginEmail"
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
            <div class="flex flex-col gap-2">
              <label for="password" class="text-sm font-semibold text-dark-blue">Password</label>
              <div class="relative">
                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <font-awesome-icon :icon="['fas', 'lock']" class="h-5 w-5 text-gray" />
                </div>
                <input
                  :type="showPassword ? 'text' : 'password'"
                  id="password"
                  v-model="password"
                  @blur="validateLoginPassword"
                  placeholder="Enter your password"
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
            <div
              class="flex justify-between items-center text-sm md:flex-row flex-col gap-3 md:gap-0"
            >
              <div class="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="remember"
                  v-model="rememberMe"
                  class="w-4 h-4 accent-dark-blue"
                />
                <label for="remember" class="text-gray cursor-pointer">Remember me</label>
              </div>
              <a href="#" class="text-dark-blue font-semibold hover:text-red transition-colors"
                >Forgot password?</a
              >
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
              class="bg-dark-blue text-white font-semibold py-3 px-4 rounded-lg mt-2 hover:bg-light-blue transform hover:-translate-y-0.5 transition-all hover:shadow-lg active:translate-y-0"
            >
              Sign In
            </button>
            <div class="relative flex items-center py-2">
              <div class="flex-grow border-t border-gray-200"></div>
              <span class="flex-shrink mx-4 text-gray text-sm">or</span>
              <div class="flex-grow border-t border-gray-200"></div>
            </div>
            <div class="flex flex-col gap-3">
              <button
                type="button"
                class="flex items-center justify-center gap-2 py-3 px-4 border border-gray-200 rounded-lg font-semibold text-sm transform hover:-translate-y-0.5 transition-all hover:shadow-lg active:translate-y-0"
              >
                <font-awesome-icon :icon="['fab', 'google']" class="w-5 h-5 text-[#4285F4]" />
                Sign in with Google
              </button>
            </div>
          </form>

          <!-- Mobile-only registration button -->
          <div class="md:hidden text-center mt-8">
            <p class="text-gray mb-4">Don't have an account yet?</p>
            <a
              href="#"
              @click.prevent="toggleForm"
              class="inline-block bg-red text-white font-semibold py-3 px-6 rounded-lg w-full hover:bg-opacity-90 transition-all"
            >
              Create Account
            </a>
          </div>
        </div>

        <!-- Registration Form -->
        <div v-else>
          <div class="text-center mb-8">
            <h1 class="text-3xl font-bold text-dark-blue mb-2">Create Account</h1>
            <p class="text-gray text-base">Join SmartPlate now!</p>
          </div>
          <form @submit.prevent="validateAndRegister" class="flex flex-col gap-5" novalidate>
            <!-- Email Field -->
            <div class="flex flex-col gap-2">
              <label for="registerEmail" class="text-sm font-semibold text-dark-blue">Email</label>
              <div class="relative">
                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <font-awesome-icon :icon="['fas', 'envelope']" class="h-5 w-5 text-gray" />
                </div>
                <input
                  type="email"
                  id="registerEmail"
                  v-model="registerData.email"
                  @blur="validateRegisterEmail"
                  placeholder="Enter your email"
                  class="w-full pl-10 pr-3 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-dark-blue/20 transition-all"
                  :class="[errors.registerEmail ? 'border-red text-red' : 'border-gray-200']"
                  required
                />
              </div>
              <div v-if="errors.registerEmail" class="flex items-center gap-2 mt-1 text-red">
                <font-awesome-icon :icon="['fas', 'circle-exclamation']" class="h-4 w-4" />
                <p class="text-xs">{{ errors.registerEmail }}</p>
              </div>
            </div>

            <!-- Password Field -->
            <div class="flex flex-col gap-2">
              <label for="registerPassword" class="text-sm font-semibold text-dark-blue"
                >Password</label
              >
              <div class="relative">
                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <font-awesome-icon :icon="['fas', 'lock']" class="h-5 w-5 text-gray" />
                </div>
                <input
                  :type="showRegisterPassword ? 'text' : 'password'"
                  id="registerPassword"
                  v-model="registerData.password"
                  @blur="validateRegisterPassword"
                  @input="validatePasswordMatch"
                  placeholder="Create a password"
                  class="w-full pl-10 pr-10 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-dark-blue/20 transition-all"
                  :class="[errors.registerPassword ? 'border-red text-red' : 'border-gray-200']"
                  required
                />
                <div class="absolute inset-y-0 right-0 pr-3 flex items-center">
                  <button
                    type="button"
                    @click="toggleRegisterPasswordVisibility"
                    class="text-gray hover:text-dark-blue focus:outline-none"
                  >
                    <font-awesome-icon
                      :icon="['fas', showRegisterPassword ? 'eye-slash' : 'eye']"
                      class="h-5 w-5"
                    />
                  </button>
                </div>
              </div>
              <div v-if="errors.registerPassword" class="flex items-center gap-2 mt-1 text-red">
                <font-awesome-icon :icon="['fas', 'circle-exclamation']" class="h-4 w-4" />
                <p class="text-xs">{{ errors.registerPassword }}</p>
              </div>
            </div>

            <!-- Confirm Password Field -->
            <div class="flex flex-col gap-2">
              <label for="confirmPassword" class="text-sm font-semibold text-dark-blue"
                >Confirm Password</label
              >
              <div class="relative">
                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <font-awesome-icon :icon="['fas', 'lock']" class="h-5 w-5 text-gray" />
                </div>
                <input
                  :type="showConfirmPassword ? 'text' : 'password'"
                  id="confirmPassword"
                  v-model="registerData.confirmPassword"
                  @blur="validateConfirmPassword"
                  @input="validatePasswordMatch"
                  placeholder="Confirm your password"
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

            <!-- Terms and Conditions -->
            <div class="flex items-start gap-2">
              <input
                type="checkbox"
                id="terms"
                v-model="registerData.acceptTerms"
                @change="validateTerms"
                class="mt-1 w-4 h-4 accent-dark-blue"
                required
              />
              <label for="terms" class="text-sm text-gray"
                >I agree to the
                <a href="#" class="text-dark-blue font-semibold hover:text-red transition-colors"
                  >Terms and Conditions</a
                >
                and
                <a href="#" class="text-dark-blue font-semibold hover:text-red transition-colors"
                  >Privacy Policy</a
                ></label
              >
            </div>
            <div v-if="errors.terms" class="flex items-center gap-2 mt-1 text-red">
              <font-awesome-icon :icon="['fas', 'circle-exclamation']" class="h-4 w-4" />
              <p class="text-xs">{{ errors.terms }}</p>
            </div>
            <div
              v-if="errors.registerForm"
              class="flex items-center justify-center gap-2 mt-1 text-red bg-red/5 p-3 rounded-lg"
            >
              <font-awesome-icon :icon="['fas', 'triangle-exclamation']" class="h-4 w-4" />
              <p class="text-sm">{{ errors.registerForm }}</p>
            </div>

            <button
              type="submit"
              class="bg-dark-blue text-white font-semibold py-3 px-4 rounded-lg mt-2 hover:bg-light-blue transform hover:-translate-y-0.5 transition-all hover:shadow-lg active:translate-y-0"
            >
              Create Account
            </button>
          </form>

          <!-- Mobile-only login button -->
          <div class="md:hidden text-center mt-8">
            <p class="text-gray mb-4">Already have an account?</p>
            <a
              href="#"
              @click.prevent="toggleForm"
              class="inline-block bg-red text-white font-semibold py-3 px-6 rounded-lg w-full hover:bg-opacity-90 transition-all"
            >
              Sign In
            </a>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
