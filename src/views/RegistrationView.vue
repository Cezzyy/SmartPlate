<script setup>
import { ref, reactive, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import UserRegistrationGuard from '@/components/navigation/UserRegistrationGuard.vue'

const router = useRouter()
const userStore = useUserStore()

// Check if user is in registration process
onMounted(() => {
  if (!userStore.isRegistering) {
    // If not in registration process, redirect to login
    router.push('/login')
  } else if (userStore.registrationData) {
    // If registration data exists, pre-fill the email
    formData.email = userStore.registrationData.email || ''
  }

  // Set current step from store
  if (userStore.currentStep > 1) {
    currentStep.value = userStore.currentStep
  }
})

// Current step in registration process
const currentStep = ref(1)
const totalSteps = 5

// Watch for step changes to update store
watch(currentStep, (newValue) => {
  userStore.updateCurrentStep(newValue)
})

// Form data for registration
const formData = reactive({
  // Initialize with empty values
  email: '',
  // Account Information
  lastName: '',
  firstName: '',
  middleName: '',

  // Contact Information
  telephoneNumber: '',
  intAreaCode: '+63',
  mobileNumber: '',

  // Personal Information - General
  nationality: 'Filipino',
  civilStatus: 'Single',
  dateOfBirth: '',
  placeOfBirth: '',
  educationalAttainment: '',
  tin: '',

  // Personal Information - Medical
  gender: 'Male',
  bloodType: '',
  complexion: '',
  bodyType: '',
  eyeColor: '',
  hairColor: '',
  weight: null, // kg
  height: null, // cm
  organDonor: false,

  // People - Emergency Contact
  emergencyContactName: '',
  emergencyContactNumber: '',
  emergencyContactAddress: '',

  // People - Employer
  employerName: '',
  employerAddress: '',

  // People - Mother's Maiden Name
  motherLastName: '',
  motherFirstName: '',
  motherMiddleName: '',

  // People - Father
  fatherLastName: '',
  fatherFirstName: '',
  fatherMiddleName: '',

  // Address
  houseNo: '',
  street: '',
  province: '',
  city: '',
  barangay: '',
  zipCode: '',
})

// Watch for form changes to mark as dirty
watch(
  formData,
  () => {
    userStore.setFormDirty(true)
  },
  { deep: true },
)

// Error handling
const errors = reactive({
  // Account Information
  lastName: '',
  firstName: '',
  email: '',

  // Contact Information
  mobileNumber: '',

  // Personal Information
  dateOfBirth: '',

  // Form
  form: '',
})

// Loading state
const isSubmitting = ref(false)

// Computed properties
const isStepComplete = computed(() => {
  switch (currentStep.value) {
    case 1: // Account Information
      return (
        formData.firstName.trim() !== '' &&
        formData.lastName.trim() !== '' &&
        formData.email.trim() !== ''
      )
    case 2: // Contact Information
      return formData.mobileNumber.trim() !== ''
    case 3: // Personal Information
      return formData.dateOfBirth !== ''
    case 4: // People Information
      return true // Optional fields
    case 5: // Address Information
      return (
        formData.houseNo.trim() !== '' &&
        formData.street.trim() !== '' &&
        formData.city.trim() !== '' &&
        formData.province.trim() !== ''
      )
    default:
      return false
  }
})

// Progress percentage
const progressPercentage = computed(() => {
  return ((currentStep.value - 1) / totalSteps) * 100
})

// Step navigation
const nextStep = () => {
  if (validateCurrentStep()) {
    if (currentStep.value < totalSteps) {
      currentStep.value++
    } else {
      submitRegistration()
    }
  }
}

const prevStep = () => {
  if (currentStep.value > 1) {
    currentStep.value--
  }
}

// Cancel registration and return to login
const cancelRegistration = () => {
  userStore.cancelRegistration()
  router.push('/login')
}

// Validation functions
const validateCurrentStep = () => {
  errors.form = ''

  switch (currentStep.value) {
    case 1: // Account Information
      return validateAccountInfo()
    case 2: // Contact Information
      return validateContactInfo()
    case 3: // Personal Information
      return validatePersonalInfo()
    case 4: // People Information
      return true // Optional fields
    case 5: // Address and Terms
      return validateAddress()
    default:
      return false
  }
}

const validateAccountInfo = () => {
  let isValid = true

  // First Name validation
  if (formData.firstName.trim() === '') {
    errors.firstName = 'First name is required'
    isValid = false
  } else {
    errors.firstName = ''
  }

  // Last Name validation
  if (formData.lastName.trim() === '') {
    errors.lastName = 'Last name is required'
    isValid = false
  } else {
    errors.lastName = ''
  }

  // Email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (formData.email.trim() === '') {
    errors.email = 'Email is required'
    isValid = false
  } else if (!emailRegex.test(formData.email)) {
    errors.email = 'Please enter a valid email address'
    isValid = false
  } else {
    errors.email = ''
  }

  return isValid
}

const validateContactInfo = () => {
  let isValid = true

  // Mobile Number validation
  if (formData.mobileNumber.trim() === '') {
    errors.mobileNumber = 'Mobile number is required'
    isValid = false
  } else {
    errors.mobileNumber = ''
  }

  return isValid
}

const validatePersonalInfo = () => {
  let isValid = true

  // Date of Birth validation
  if (formData.dateOfBirth === '') {
    errors.dateOfBirth = 'Date of birth is required'
    isValid = false
  } else {
    errors.dateOfBirth = ''
  }

  return isValid
}

const validateAddress = () => {
  // Address validation logic here if needed
  return true
}

// Form submission
const submitRegistration = async () => {
  if (!validateAddress()) {
    return
  }

  try {
    isSubmitting.value = true
    errors.form = 'Creating your account...'

    // Register the user using the Pinia store
    await userStore.register(formData)

    // Redirect to home page after successful registration
    router.push('/home')
  } catch {
    errors.form = userStore.error || 'Registration failed. Please try again.'
    isSubmitting.value = false
  }
}
</script>

<template>
  <div>
    <!-- Navigation Guard Component -->
    <UserRegistrationGuard />

    <div class="min-h-screen flex">
      <!-- Left Column - Welcome Text -->
      <div
        class="hidden md:flex md:w-1/3 bg-gradient-to-br from-dark-blue to-black p-8 text-white flex-col justify-center items-center relative overflow-hidden"
      >
        <!-- Abstract background elements -->
        <div class="absolute top-0 right-0 w-64 h-64 bg-light-blue/10 rounded-full blur-3xl"></div>
        <div class="absolute bottom-0 left-0 w-72 h-72 bg-red/10 rounded-full blur-3xl"></div>

        <div class="max-w-md mx-auto z-10">
          <div class="mb-8 p-3 bg-white/10 inline-block rounded-lg backdrop-blur-sm">
            <img src="/Land_Transportation_Office.webp" alt="SmartPlate Logo" class="h-12" />
          </div>
          <h1 class="text-4xl font-bold mb-6">Complete Your Registration</h1>
          <p class="text-lg mb-8 text-white/80">
            Please provide additional details to complete your SmartPlate account setup.
          </p>
          <div class="border-t border-white/20 w-24 mx-auto my-8"></div>
          <p class="mb-6 text-white/80">Already registered? Sign in to your account.</p>
          <a
            href="#"
            @click.prevent="cancelRegistration"
            class="inline-block bg-red text-white font-semibold py-3 px-6 rounded-lg hover:bg-opacity-90 transition-all transform hover:-translate-y-0.5 hover:shadow-lg"
          >
            Back to Login
          </a>
        </div>

        <!-- Bottom decorative element -->
        <div class="absolute bottom-8 left-8 right-8 flex justify-between text-white/30 text-xs">
          <span>© 2025 SmartPlate</span>
        </div>
      </div>

      <!-- Right Column - Registration Form -->
      <div class="w-full md:w-2/3 bg-gradient-to-br from-light-blue/5 to-white p-5 flex flex-col">
        <!-- Header with Back Button -->
        <div class="flex items-center mb-6">
          <button
            @click="cancelRegistration"
            class="text-dark-blue hover:text-red transition-colors focus:outline-none mr-4 group"
          >
            <font-awesome-icon
              :icon="['fas', 'arrow-left']"
              class="h-5 w-5 group-hover:-translate-x-1 transition-transform"
            />
          </button>
          <h1 class="text-2xl font-bold text-dark-blue">Create Account</h1>
        </div>

        <!-- Progress Bar and Steps -->
        <div class="mb-8 max-w-4xl mx-auto w-full">
          <div class="flex justify-between items-center mb-2">
            <div class="text-sm font-semibold text-dark-blue">
              <span
                class="bg-dark-blue text-white w-6 h-6 inline-flex items-center justify-center rounded-full mr-2"
                >{{ currentStep }}</span
              >
              Step {{ currentStep }} of {{ totalSteps }}
            </div>
            <div class="text-sm text-blue-600 font-medium">
              {{ Math.round(progressPercentage) }}% Complete
            </div>
          </div>
          <div class="w-full bg-gray-200 h-2 rounded-full">
            <div
              class="bg-gradient-to-r from-dark-blue to-light-blue h-2 rounded-full transition-all duration-500 ease-in-out"
              :style="{ width: `${progressPercentage}%` }"
            ></div>
          </div>
          <!-- Step Indicators -->
          <div class="flex justify-between mt-4">
            <div
              v-for="step in totalSteps"
              :key="step"
              class="text-xs font-medium transition-all duration-300 flex flex-col items-center"
              :class="{
                'text-dark-blue': currentStep >= step,
                'text-gray-400': currentStep < step,
              }"
            >
              <div
                class="w-10 h-10 rounded-full flex items-center justify-center mb-2 transition-all shadow-sm"
                :class="{
                  'bg-dark-blue text-white shadow-md shadow-dark-blue/20': currentStep === step,
                  'bg-light-blue/20 text-dark-blue': currentStep > step,
                  'bg-gray-100 text-gray-400': currentStep < step,
                }"
              >
                <span v-if="currentStep > step">
                  <font-awesome-icon :icon="['fas', 'check']" class="h-4 w-4" />
                </span>
                <span v-else class="text-sm">{{ step }}</span>
              </div>
              <span>{{
                step === 1
                  ? 'Account'
                  : step === 2
                    ? 'Contact'
                    : step === 3
                      ? 'Personal'
                      : step === 4
                        ? 'People'
                        : 'Address'
              }}</span>
            </div>
          </div>
        </div>

        <!-- Form Content -->
        <div class="flex-grow overflow-y-auto">
          <div
            class="max-w-4xl mx-auto bg-white rounded-xl shadow-lg p-8 mb-8 transition-all duration-300 hover:shadow-xl"
          >
            <!-- Step 1: Account Information -->
            <div v-if="currentStep === 1" class="space-y-6">
              <h2 class="text-xl font-bold text-dark-blue flex items-center">
                <font-awesome-icon :icon="['fas', 'user-circle']" class="mr-3 text-blue-500" />
                Account Information
              </h2>
              <p class="text-gray-600 mb-8">Please provide your basic account details</p>

              <!-- Name Fields -->
              <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                <!-- First Name -->
                <div class="relative group">
                  <div class="relative">
                    <div
                      class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"
                    >
                      <font-awesome-icon
                        :icon="['fas', 'user']"
                        class="h-5 w-5 text-gray group-focus-within:text-dark-blue transition-colors"
                      />
                    </div>
                    <input
                      id="firstName"
                      v-model="formData.firstName"
                      type="text"
                      class="peer w-full pl-10 pr-3 py-3.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-dark-blue/20 transition-all bg-gray-50 focus:bg-white"
                      :class="[errors.firstName ? 'border-red text-red' : 'border-gray-300']"
                      placeholder=" "
                    />
                    <label
                      for="firstName"
                      class="absolute left-10 top-3.5 text-gray-500 transition-all duration-200 transform -translate-y-7 scale-75 opacity-0 peer-placeholder-shown:opacity-100 peer-placeholder-shown:translate-y-0 peer-placeholder-shown:scale-100 peer-focus:-translate-y-7 peer-focus:scale-75 peer-focus:opacity-0 cursor-text"
                    >
                      First Name
                    </label>
                  </div>
                  <label
                    for="firstName"
                    class="text-sm font-medium text-dark-blue absolute left-0 -top-6"
                  >
                    First Name <span class="text-red">*</span>
                  </label>
                  <div v-if="errors.firstName" class="flex items-center gap-2 mt-1 text-red">
                    <font-awesome-icon :icon="['fas', 'circle-exclamation']" class="h-4 w-4" />
                    <p class="text-xs">{{ errors.firstName }}</p>
                  </div>
                </div>

                <!-- Middle Name -->
                <div class="relative group">
                  <div class="relative">
                    <div
                      class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"
                    >
                      <font-awesome-icon
                        :icon="['fas', 'user']"
                        class="h-5 w-5 text-gray group-focus-within:text-dark-blue transition-colors"
                      />
                    </div>
                    <input
                      id="middleName"
                      v-model="formData.middleName"
                      type="text"
                      class="peer w-full pl-10 pr-3 py-3.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-dark-blue/20 transition-all bg-gray-50 focus:bg-white"
                      placeholder=" "
                    />
                    <label
                      for="middleName"
                      class="absolute left-10 top-3.5 text-gray-500 transition-all duration-200 transform -translate-y-7 scale-75 opacity-0 peer-placeholder-shown:opacity-100 peer-placeholder-shown:translate-y-0 peer-placeholder-shown:scale-100 peer-focus:-translate-y-7 peer-focus:scale-75 peer-focus:opacity-0 cursor-text"
                    >
                      Middle Name (Optional)
                    </label>
                  </div>
                  <label
                    for="middleName"
                    class="text-sm font-medium text-dark-blue absolute left-0 -top-6"
                  >
                    Middle Name
                  </label>
                </div>

                <!-- Last Name -->
                <div class="relative group">
                  <div class="relative">
                    <div
                      class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"
                    >
                      <font-awesome-icon
                        :icon="['fas', 'user']"
                        class="h-5 w-5 text-gray group-focus-within:text-dark-blue transition-colors"
                      />
                    </div>
                    <input
                      id="lastName"
                      v-model="formData.lastName"
                      type="text"
                      class="peer w-full pl-10 pr-3 py-3.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-dark-blue/20 transition-all bg-gray-50 focus:bg-white"
                      :class="[errors.lastName ? 'border-red text-red' : 'border-gray-300']"
                      placeholder=" "
                    />
                    <label
                      for="lastName"
                      class="absolute left-10 top-3.5 text-gray-500 transition-all duration-200 transform -translate-y-7 scale-75 opacity-0 peer-placeholder-shown:opacity-100 peer-placeholder-shown:translate-y-0 peer-placeholder-shown:scale-100 peer-focus:-translate-y-7 peer-focus:scale-75 peer-focus:opacity-0 cursor-text"
                    >
                      Last Name
                    </label>
                  </div>
                  <label
                    for="lastName"
                    class="text-sm font-medium text-dark-blue absolute left-0 -top-6"
                  >
                    Last Name <span class="text-red">*</span>
                  </label>
                  <div v-if="errors.lastName" class="flex items-center gap-2 mt-1 text-red">
                    <font-awesome-icon :icon="['fas', 'circle-exclamation']" class="h-4 w-4" />
                    <p class="text-xs">{{ errors.lastName }}</p>
                  </div>
                </div>
              </div>

              <!-- Email -->
              <div class="relative group mt-8">
                <div class="relative">
                  <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <font-awesome-icon :icon="['fas', 'envelope']" class="h-5 w-5 text-gray" />
                  </div>
                  <input
                    id="email"
                    v-model="formData.email"
                    type="email"
                    readonly
                    disabled
                    class="w-full pl-10 pr-3 py-3.5 border rounded-lg bg-gray-100 cursor-not-allowed border-gray-300"
                  />
                </div>
                <label
                  for="email"
                  class="text-sm font-medium text-dark-blue absolute left-0 -top-6"
                >
                  Email <span class="text-red">*</span>
                </label>
                <div v-if="errors.email" class="flex items-center gap-2 mt-1 text-red">
                  <font-awesome-icon :icon="['fas', 'circle-exclamation']" class="h-4 w-4" />
                  <p class="text-xs">{{ errors.email }}</p>
                </div>
              </div>
            </div>

            <!-- Step 2: Contact Information -->
            <div v-if="currentStep === 2" class="space-y-6">
              <h2 class="text-xl font-bold text-dark-blue flex items-center">
                <font-awesome-icon :icon="['fas', 'address-book']" class="mr-3 text-blue-500" />
                Contact Information
              </h2>
              <p class="text-gray-600 mb-8">How can we reach you?</p>

              <!-- Telephone Number -->
              <div class="relative group mb-8">
                <div class="relative">
                  <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <font-awesome-icon
                      :icon="['fas', 'phone']"
                      class="h-5 w-5 text-gray group-focus-within:text-dark-blue transition-colors"
                    />
                  </div>
                  <input
                    id="telephoneNumber"
                    v-model="formData.telephoneNumber"
                    type="tel"
                    class="peer w-full pl-10 pr-3 py-3.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-dark-blue/20 transition-all bg-gray-50 focus:bg-white"
                    placeholder=" "
                  />
                  <label
                    for="telephoneNumber"
                    class="absolute left-10 top-3.5 text-gray-500 transition-all duration-200 transform -translate-y-7 scale-75 opacity-0 peer-placeholder-shown:opacity-100 peer-placeholder-shown:translate-y-0 peer-placeholder-shown:scale-100 peer-focus:-translate-y-7 peer-focus:scale-75 peer-focus:opacity-0 cursor-text"
                  >
                    (02) XXXX-XXXX
                  </label>
                </div>
                <label
                  for="telephoneNumber"
                  class="text-sm font-medium text-dark-blue absolute left-0 -top-6"
                >
                  Telephone Number
                </label>
              </div>

              <!-- Mobile Number with Area Code -->
              <div class="relative group">
                <label for="mobileNumber" class="text-sm font-medium text-dark-blue mb-1 block">
                  Mobile Number <span class="text-red">*</span>
                </label>
                <div class="flex space-x-2">
                  <div class="relative w-28">
                    <div
                      class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"
                    >
                      <font-awesome-icon :icon="['fas', 'globe']" class="h-5 w-5 text-gray" />
                    </div>
                    <select
                      v-model="formData.intAreaCode"
                      class="w-full pl-10 pr-3 py-3.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-dark-blue/20 transition-all bg-gray-50 focus:bg-white appearance-none"
                    >
                      <option value="+63">+63</option>
                      <option value="+1">+1</option>
                      <option value="+44">+44</option>
                      <option value="+61">+61</option>
                    </select>
                    <div
                      class="absolute inset-y-0 right-0 pr-2 flex items-center pointer-events-none"
                    >
                      <font-awesome-icon
                        :icon="['fas', 'chevron-down']"
                        class="h-4 w-4 text-gray"
                      />
                    </div>
                  </div>
                  <div class="relative flex-1">
                    <div
                      class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"
                    >
                      <font-awesome-icon
                        :icon="['fas', 'mobile-alt']"
                        class="h-5 w-5 text-gray group-focus-within:text-dark-blue transition-colors"
                      />
                    </div>
                    <input
                      id="mobileNumber"
                      v-model="formData.mobileNumber"
                      type="tel"
                      class="peer w-full pl-10 pr-3 py-3.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-dark-blue/20 transition-all bg-gray-50 focus:bg-white"
                      :class="[errors.mobileNumber ? 'border-red text-red' : 'border-gray-300']"
                      placeholder=" "
                    />
                    <label
                      for="mobileNumber"
                      class="absolute left-10 top-3.5 text-gray-500 transition-all duration-200 transform -translate-y-7 scale-75 opacity-0 peer-placeholder-shown:opacity-100 peer-placeholder-shown:translate-y-0 peer-placeholder-shown:scale-100 peer-focus:-translate-y-7 peer-focus:scale-75 peer-focus:opacity-0 cursor-text"
                    >
                      9XX XXX XXXX
                    </label>
                  </div>
                </div>
                <div v-if="errors.mobileNumber" class="flex items-center gap-2 mt-1 text-red">
                  <font-awesome-icon :icon="['fas', 'circle-exclamation']" class="h-4 w-4" />
                  <p class="text-xs">{{ errors.mobileNumber }}</p>
                </div>
              </div>
            </div>

            <!-- Step 3: Personal Information -->
            <div v-if="currentStep === 3" class="space-y-6">
              <h2 class="text-xl font-bold text-dark-blue flex items-center">
                <font-awesome-icon :icon="['fas', 'id-card']" class="mr-3 text-blue-500" />
                Personal Information
              </h2>
              <p class="text-gray-600 mb-8">Tell us more about yourself</p>

              <!-- General Information -->
              <div class="space-y-8">
                <h3 class="text-lg font-semibold text-dark-blue flex items-center">
                  <font-awesome-icon
                    :icon="['fas', 'user-tag']"
                    class="mr-2 text-blue-400 h-4 w-4"
                  />
                  General Information
                </h3>

                <!-- Nationality and Civil Status -->
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div class="relative group">
                    <div class="relative">
                      <div
                        class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"
                      >
                        <font-awesome-icon
                          :icon="['fas', 'flag']"
                          class="h-5 w-5 text-gray group-focus-within:text-dark-blue transition-colors"
                        />
                      </div>
                      <input
                        id="nationality"
                        v-model="formData.nationality"
                        type="text"
                        class="peer w-full pl-10 pr-3 py-3.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-dark-blue/20 transition-all bg-gray-50 focus:bg-white"
                        placeholder=" "
                      />
                      <label
                        for="nationality"
                        class="absolute left-10 top-3.5 text-gray-500 transition-all duration-200 transform -translate-y-7 scale-75 opacity-0 peer-placeholder-shown:opacity-100 peer-placeholder-shown:translate-y-0 peer-placeholder-shown:scale-100 peer-focus:-translate-y-7 peer-focus:scale-75 peer-focus:opacity-0 cursor-text"
                      >
                        Your nationality
                      </label>
                    </div>
                    <label
                      for="nationality"
                      class="text-sm font-medium text-dark-blue absolute left-0 -top-6"
                    >
                      Nationality
                    </label>
                  </div>

                  <div class="relative group">
                    <label for="civilStatus" class="text-sm font-medium text-dark-blue mb-1 block">
                      Civil Status
                    </label>
                    <div class="relative">
                      <div
                        class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"
                      >
                        <font-awesome-icon :icon="['fas', 'heart']" class="h-5 w-5 text-gray" />
                      </div>
                      <select
                        id="civilStatus"
                        v-model="formData.civilStatus"
                        class="w-full pl-10 pr-3 py-3.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-dark-blue/20 transition-all bg-gray-50 focus:bg-white appearance-none"
                      >
                        <option value="Single">Single</option>
                        <option value="Married">Married</option>
                        <option value="Divorced">Divorced</option>
                        <option value="Widowed">Widowed</option>
                      </select>
                      <div
                        class="absolute inset-y-0 right-0 pr-2 flex items-center pointer-events-none"
                      >
                        <font-awesome-icon
                          :icon="['fas', 'chevron-down']"
                          class="h-4 w-4 text-gray"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Date of Birth and Place of Birth -->
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div class="relative group">
                    <div class="relative">
                      <div
                        class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"
                      >
                        <font-awesome-icon
                          :icon="['fas', 'calendar']"
                          class="h-5 w-5 text-gray group-focus-within:text-dark-blue transition-colors"
                        />
                      </div>
                      <input
                        id="dateOfBirth"
                        v-model="formData.dateOfBirth"
                        type="date"
                        class="w-full pl-10 pr-3 py-3.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-dark-blue/20 transition-all bg-gray-50 focus:bg-white"
                        :class="[errors.dateOfBirth ? 'border-red text-red' : 'border-gray-300']"
                      />
                    </div>
                    <label
                      for="dateOfBirth"
                      class="text-sm font-medium text-dark-blue absolute left-0 -top-6"
                    >
                      Date of Birth <span class="text-red">*</span>
                    </label>
                    <div v-if="errors.dateOfBirth" class="flex items-center gap-2 mt-1 text-red">
                      <font-awesome-icon :icon="['fas', 'circle-exclamation']" class="h-4 w-4" />
                      <p class="text-xs">{{ errors.dateOfBirth }}</p>
                    </div>
                  </div>

                  <div class="relative group">
                    <div class="relative">
                      <div
                        class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"
                      >
                        <font-awesome-icon
                          :icon="['fas', 'map-marker-alt']"
                          class="h-5 w-5 text-gray group-focus-within:text-dark-blue transition-colors"
                        />
                      </div>
                      <input
                        id="placeOfBirth"
                        v-model="formData.placeOfBirth"
                        type="text"
                        class="peer w-full pl-10 pr-3 py-3.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-dark-blue/20 transition-all bg-gray-50 focus:bg-white"
                        placeholder=" "
                      />
                      <label
                        for="placeOfBirth"
                        class="absolute left-10 top-3.5 text-gray-500 transition-all duration-200 transform -translate-y-7 scale-75 opacity-0 peer-placeholder-shown:opacity-100 peer-placeholder-shown:translate-y-0 peer-placeholder-shown:scale-100 peer-focus:-translate-y-7 peer-focus:scale-75 peer-focus:opacity-0 cursor-text"
                      >
                        City, Country
                      </label>
                    </div>
                    <label
                      for="placeOfBirth"
                      class="text-sm font-medium text-dark-blue absolute left-0 -top-6"
                    >
                      Place of Birth
                    </label>
                  </div>
                </div>

                <!-- Medical Information (Simplified) -->
                <div class="mt-6">
                  <h3 class="text-lg font-semibold text-dark-blue flex items-center mb-4">
                    <font-awesome-icon
                      :icon="['fas', 'heartbeat']"
                      class="mr-2 text-blue-400 h-4 w-4"
                    />
                    Basic Medical Information
                  </h3>

                  <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <!-- Gender -->
                    <div class="relative group">
                      <label for="gender" class="text-sm font-medium text-dark-blue mb-1 block">
                        Gender
                      </label>
                      <div class="relative">
                        <div
                          class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"
                        >
                          <font-awesome-icon
                            :icon="['fas', 'venus-mars']"
                            class="h-5 w-5 text-gray"
                          />
                        </div>
                        <select
                          id="gender"
                          v-model="formData.gender"
                          class="w-full pl-10 pr-3 py-3.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-dark-blue/20 transition-all bg-gray-50 focus:bg-white appearance-none"
                        >
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                          <option value="Other">Other</option>
                        </select>
                        <div
                          class="absolute inset-y-0 right-0 pr-2 flex items-center pointer-events-none"
                        >
                          <font-awesome-icon
                            :icon="['fas', 'chevron-down']"
                            class="h-4 w-4 text-gray"
                          />
                        </div>
                      </div>
                    </div>

                    <!-- Organ Donor Option with Toggle Switch -->
                    <div class="col-span-2 flex items-center p-4 bg-gray-50 rounded-lg">
                      <div class="flex-1">
                        <h4 class="text-sm font-medium text-dark-blue">Organ Donor</h4>
                        <p class="text-xs text-gray-500 mt-1">Register as an organ donor</p>
                      </div>
                      <label class="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" v-model="formData.organDonor" class="sr-only peer" />
                        <div
                          class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-dark-blue/20 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"
                        ></div>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Step 4: People Information -->
            <div v-if="currentStep === 4" class="space-y-6">
              <h2 class="text-xl font-bold text-dark-blue flex items-center">
                <font-awesome-icon :icon="['fas', 'users']" class="mr-3 text-blue-500" />
                People Information
              </h2>
              <p class="text-gray-600 mb-8">Information about people related to you</p>

              <!-- Emergency Contact -->
              <div class="space-y-8 mb-10">
                <h3 class="text-lg font-semibold text-dark-blue flex items-center">
                  <font-awesome-icon
                    :icon="['fas', 'phone-alt']"
                    class="mr-2 text-blue-400 h-4 w-4"
                  />
                  Emergency Contact
                </h3>

                <div
                  class="p-5 border border-gray-200 rounded-lg bg-white shadow-sm hover:shadow-md transition-all"
                >
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div class="relative group">
                      <div class="relative">
                        <div
                          class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"
                        >
                          <font-awesome-icon
                            :icon="['fas', 'user']"
                            class="h-5 w-5 text-gray group-focus-within:text-dark-blue transition-colors"
                          />
                        </div>
                        <input
                          id="emergencyContactName"
                          v-model="formData.emergencyContactName"
                          type="text"
                          class="peer w-full pl-10 pr-3 py-3.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-dark-blue/20 transition-all bg-gray-50 focus:bg-white"
                          placeholder=" "
                        />
                        <label
                          for="emergencyContactName"
                          class="absolute left-10 top-3.5 text-gray-500 transition-all duration-200 transform -translate-y-7 scale-75 opacity-0 peer-placeholder-shown:opacity-100 peer-placeholder-shown:translate-y-0 peer-placeholder-shown:scale-100 peer-focus:-translate-y-7 peer-focus:scale-75 peer-focus:opacity-0 cursor-text"
                        >
                          Full name
                        </label>
                      </div>
                      <label
                        for="emergencyContactName"
                        class="text-sm font-medium text-dark-blue absolute left-0 -top-6"
                      >
                        Name
                      </label>
                    </div>

                    <div class="relative group">
                      <div class="relative">
                        <div
                          class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"
                        >
                          <font-awesome-icon
                            :icon="['fas', 'phone']"
                            class="h-5 w-5 text-gray group-focus-within:text-dark-blue transition-colors"
                          />
                        </div>
                        <input
                          id="emergencyContactNumber"
                          v-model="formData.emergencyContactNumber"
                          type="tel"
                          class="peer w-full pl-10 pr-3 py-3.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-dark-blue/20 transition-all bg-gray-50 focus:bg-white"
                          placeholder=" "
                        />
                        <label
                          for="emergencyContactNumber"
                          class="absolute left-10 top-3.5 text-gray-500 transition-all duration-200 transform -translate-y-7 scale-75 opacity-0 peer-placeholder-shown:opacity-100 peer-placeholder-shown:translate-y-0 peer-placeholder-shown:scale-100 peer-focus:-translate-y-7 peer-focus:scale-75 peer-focus:opacity-0 cursor-text"
                        >
                          Phone number
                        </label>
                      </div>
                      <label
                        for="emergencyContactNumber"
                        class="text-sm font-medium text-dark-blue absolute left-0 -top-6"
                      >
                        Contact Number
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Step 5: Address Information -->
            <div v-if="currentStep === 5" class="space-y-6">
              <h2 class="text-xl font-bold text-dark-blue flex items-center">
                <font-awesome-icon :icon="['fas', 'map-marked-alt']" class="mr-3 text-blue-500" />
                Address Information
              </h2>
              <p class="text-gray-600 mb-8">Where do you live?</p>

              <!-- House Number and Street -->
              <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div class="relative group">
                  <div class="relative">
                    <div
                      class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"
                    >
                      <font-awesome-icon
                        :icon="['fas', 'home']"
                        class="h-5 w-5 text-gray group-focus-within:text-dark-blue transition-colors"
                      />
                    </div>
                    <input
                      id="houseNo"
                      v-model="formData.houseNo"
                      type="text"
                      class="peer w-full pl-10 pr-3 py-3.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-dark-blue/20 transition-all bg-gray-50 focus:bg-white"
                      placeholder=" "
                    />
                    <label
                      for="houseNo"
                      class="absolute left-10 top-3.5 text-gray-500 transition-all duration-200 transform -translate-y-7 scale-75 opacity-0 peer-placeholder-shown:opacity-100 peer-placeholder-shown:translate-y-0 peer-placeholder-shown:scale-100 peer-focus:-translate-y-7 peer-focus:scale-75 peer-focus:opacity-0 cursor-text"
                    >
                      123
                    </label>
                  </div>
                  <label
                    for="houseNo"
                    class="text-sm font-medium text-dark-blue absolute left-0 -top-6"
                  >
                    House/Unit Number <span class="text-red">*</span>
                  </label>
                </div>

                <div class="relative group md:col-span-2">
                  <div class="relative">
                    <div
                      class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"
                    >
                      <font-awesome-icon
                        :icon="['fas', 'road']"
                        class="h-5 w-5 text-gray group-focus-within:text-dark-blue transition-colors"
                      />
                    </div>
                    <input
                      id="street"
                      v-model="formData.street"
                      type="text"
                      class="peer w-full pl-10 pr-3 py-3.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-dark-blue/20 transition-all bg-gray-50 focus:bg-white"
                      placeholder=" "
                    />
                    <label
                      for="street"
                      class="absolute left-10 top-3.5 text-gray-500 transition-all duration-200 transform -translate-y-7 scale-75 opacity-0 peer-placeholder-shown:opacity-100 peer-placeholder-shown:translate-y-0 peer-placeholder-shown:scale-100 peer-focus:-translate-y-7 peer-focus:scale-75 peer-focus:opacity-0 cursor-text"
                    >
                      Main Street
                    </label>
                  </div>
                  <label
                    for="street"
                    class="text-sm font-medium text-dark-blue absolute left-0 -top-6"
                  >
                    Street <span class="text-red">*</span>
                  </label>
                </div>
              </div>

              <!-- City, Province, Zip Code -->
              <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                <div class="relative group">
                  <div class="relative">
                    <div
                      class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"
                    >
                      <font-awesome-icon
                        :icon="['fas', 'city']"
                        class="h-5 w-5 text-gray group-focus-within:text-dark-blue transition-colors"
                      />
                    </div>
                    <input
                      id="city"
                      v-model="formData.city"
                      type="text"
                      class="peer w-full pl-10 pr-3 py-3.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-dark-blue/20 transition-all bg-gray-50 focus:bg-white"
                      placeholder=" "
                    />
                    <label
                      for="city"
                      class="absolute left-10 top-3.5 text-gray-500 transition-all duration-200 transform -translate-y-7 scale-75 opacity-0 peer-placeholder-shown:opacity-100 peer-placeholder-shown:translate-y-0 peer-placeholder-shown:scale-100 peer-focus:-translate-y-7 peer-focus:scale-75 peer-focus:opacity-0 cursor-text"
                    >
                      City
                    </label>
                  </div>
                  <label
                    for="city"
                    class="text-sm font-medium text-dark-blue absolute left-0 -top-6"
                  >
                    City <span class="text-red">*</span>
                  </label>
                </div>

                <div class="relative group">
                  <div class="relative">
                    <div
                      class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"
                    >
                      <font-awesome-icon
                        :icon="['fas', 'map']"
                        class="h-5 w-5 text-gray group-focus-within:text-dark-blue transition-colors"
                      />
                    </div>
                    <input
                      id="province"
                      v-model="formData.province"
                      type="text"
                      class="peer w-full pl-10 pr-3 py-3.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-dark-blue/20 transition-all bg-gray-50 focus:bg-white"
                      placeholder=" "
                    />
                    <label
                      for="province"
                      class="absolute left-10 top-3.5 text-gray-500 transition-all duration-200 transform -translate-y-7 scale-75 opacity-0 peer-placeholder-shown:opacity-100 peer-placeholder-shown:translate-y-0 peer-placeholder-shown:scale-100 peer-focus:-translate-y-7 peer-focus:scale-75 peer-focus:opacity-0 cursor-text"
                    >
                      Province
                    </label>
                  </div>
                  <label
                    for="province"
                    class="text-sm font-medium text-dark-blue absolute left-0 -top-6"
                  >
                    Province <span class="text-red">*</span>
                  </label>
                </div>

                <div class="relative group">
                  <div class="relative">
                    <div
                      class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"
                    >
                      <font-awesome-icon
                        :icon="['fas', 'mailbox']"
                        class="h-5 w-5 text-gray group-focus-within:text-dark-blue transition-colors"
                      />
                    </div>
                    <input
                      id="zipCode"
                      v-model="formData.zipCode"
                      type="text"
                      class="peer w-full pl-10 pr-3 py-3.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-dark-blue/20 transition-all bg-gray-50 focus:bg-white"
                      placeholder=" "
                    />
                    <label
                      for="zipCode"
                      class="absolute left-10 top-3.5 text-gray-500 transition-all duration-200 transform -translate-y-7 scale-75 opacity-0 peer-placeholder-shown:opacity-100 peer-placeholder-shown:translate-y-0 peer-placeholder-shown:scale-100 peer-focus:-translate-y-7 peer-focus:scale-75 peer-focus:opacity-0 cursor-text"
                    >
                      123456
                    </label>
                  </div>
                  <label
                    for="zipCode"
                    class="text-sm font-medium text-dark-blue absolute left-0 -top-6"
                  >
                    Zip Code
                  </label>
                </div>
              </div>
            </div>

            <!-- Form Error Message -->
            <div
              v-if="errors.form"
              class="mt-6 p-4 bg-red/5 text-red rounded-lg text-sm border-l-4 border-red flex items-center animate-pulse"
            >
              <font-awesome-icon :icon="['fas', 'exclamation-circle']" class="mr-2 h-5 w-5" />
              {{ errors.form }}
            </div>

            <!-- Navigation Buttons -->
            <div class="flex justify-between mt-10">
              <button
                v-if="currentStep > 1"
                @click="prevStep"
                type="button"
                class="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all transform hover:-translate-y-0.5 hover:shadow-md flex items-center font-medium"
              >
                <font-awesome-icon :icon="['fas', 'arrow-left']" class="mr-2" />
                Previous
              </button>
              <div v-else></div>

              <div class="flex space-x-3">
                <button
                  @click="cancelRegistration"
                  type="button"
                  class="px-6 py-3 border border-red text-red rounded-lg hover:bg-red/5 transition-all transform hover:-translate-y-0.5 hover:shadow-md flex items-center font-medium"
                >
                  Cancel
                </button>

                <button
                  v-if="currentStep < totalSteps"
                  @click="nextStep"
                  type="button"
                  class="px-8 py-3 bg-dark-blue text-white rounded-lg hover:bg-light-blue transition-all transform hover:-translate-y-0.5 hover:shadow-md flex items-center font-medium relative overflow-hidden group"
                  :disabled="!isStepComplete"
                  :class="[!isStepComplete ? 'opacity-50 cursor-not-allowed' : '']"
                >
                  <span
                    class="absolute top-0 left-0 w-full h-full bg-white/10 transform -translate-x-full group-hover:translate-x-0 transition-transform duration-300"
                  ></span>
                  Next
                  <font-awesome-icon
                    :icon="['fas', 'arrow-right']"
                    class="ml-2 group-hover:translate-x-1 transition-transform"
                  />
                </button>
                <button
                  v-else
                  @click="submitRegistration"
                  type="button"
                  class="px-8 py-3 bg-dark-blue text-white rounded-lg hover:bg-light-blue transition-all transform hover:-translate-y-0.5 hover:shadow-md flex items-center font-medium relative overflow-hidden group"
                  :disabled="!isStepComplete || isSubmitting"
                  :class="[!isStepComplete || isSubmitting ? 'opacity-50 cursor-not-allowed' : '']"
                >
                  <span
                    class="absolute top-0 left-0 w-full h-full bg-white/10 transform -translate-x-full group-hover:translate-x-0 transition-transform duration-300"
                  ></span>
                  <span v-if="isSubmitting" class="flex items-center">
                    <svg
                      class="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        class="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        stroke-width="4"
                      ></circle>
                      <path
                        class="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Processing...
                  </span>
                  <span v-else>
                    Complete Registration
                    <font-awesome-icon :icon="['fas', 'check']" class="ml-2" />
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
