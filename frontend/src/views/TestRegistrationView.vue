<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useTestUserStore } from '@/stores/testUser'

const router = useRouter()
const userStore = useTestUserStore()

// Check if user is in registration process
// onMounted(() => {
//   if (!userStore.isRegistering) {
//     // If not in registration process, redirect to login
//     router.push('/login')
//   } else if (userStore.registrationData) {
//     // If registration data exists, pre-fill the email
//     formData.email = userStore.registrationData.email || ''
//   }
// })

// Current step in registration process
const currentStep = ref(1)
const totalSteps = 5

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

  // Terms and conditions
  acceptTerms: false,
})

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

  // Terms
  terms: '',

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
      return validateAddressAndTerms()
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

const validateAddressAndTerms = () => {
  let isValid = true

  // Terms validation
  if (!formData.acceptTerms) {
    errors.terms = 'You must accept the terms and conditions'
    isValid = false
  } else {
    errors.terms = ''
  }

  return isValid
}

// Form submission
const submitRegistration = async () => {
  if (!validateAddressAndTerms()) {
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
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <header class="bg-gradient-to-r from-dark-blue to-blue-900 text-white shadow-md">
      <div class="container mx-auto px-4 py-4">
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-3">
            <h1 class="text-xl font-bold">Create Account</h1>
          </div>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="container mx-auto px-4 py-8">
      <div
        class="max-w-3xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden transform transition-all duration-300 hover:shadow-xl"
      >
        <!-- Progress Bar -->
        <div class="w-full bg-gray-200 h-3">
          <div
            class="bg-gradient-to-r from-blue-500 to-blue-600 h-3 transition-all duration-500 ease-in-out rounded-r-full"
            :style="{ width: `${progressPercentage}%` }"
          ></div>
        </div>

        <!-- Step Indicator -->
        <div class="bg-gradient-to-r from-gray-50 to-blue-50 p-5 border-b border-gray-200">
          <div class="flex justify-between items-center">
            <div class="text-sm font-semibold text-dark-blue flex items-center">
              <span
                class="bg-blue-600 text-white rounded-full w-7 h-7 flex items-center justify-center mr-2"
                >{{ currentStep }}</span
              >
              <span>Step {{ currentStep }} of {{ totalSteps }}</span>
            </div>
            <div class="text-sm font-medium text-blue-600">
              {{ Math.round(progressPercentage) }}% Complete
            </div>
          </div>

          <!-- Step Titles -->
          <div class="flex justify-between mt-4 px-2">
            <div
              v-for="step in totalSteps"
              :key="step"
              class="text-xs font-medium transition-all duration-300"
              :class="{
                'text-blue-600': currentStep === step,
                'text-gray-400': currentStep !== step,
              }"
            >
              {{
                step === 1
                  ? 'Account'
                  : step === 2
                    ? 'Contact'
                    : step === 3
                      ? 'Personal'
                      : step === 4
                        ? 'People'
                        : 'Address'
              }}
            </div>
          </div>
        </div>

        <!-- Form Content -->
        <div class="p-8">
          <!-- Step 1: Account Information -->
          <div v-if="currentStep === 1" class="space-y-6">
            <h2 class="text-xl font-bold text-dark-blue">Account Information</h2>
            <p class="text-gray-600">Please provide your basic account details</p>

            <!-- Name Fields -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <!-- First Name -->
              <div class="flex flex-col space-y-1">
                <label for="firstName" class="text-sm font-medium text-gray-700"
                  >First Name <span class="text-red-500">*</span></label
                >
                <input
                  id="firstName"
                  v-model="formData.firstName"
                  type="text"
                  class="border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200 hover:border-blue-300"
                  :class="[errors.firstName ? 'border-red-500' : '']"
                  placeholder="Enter your first name"
                />
                <div v-if="errors.firstName" class="text-red-500 text-xs mt-1">
                  {{ errors.firstName }}
                </div>
              </div>

              <!-- Middle Name -->
              <div class="flex flex-col space-y-1">
                <label for="middleName" class="text-sm font-medium text-gray-700"
                  >Middle Name</label
                >
                <input
                  id="middleName"
                  v-model="formData.middleName"
                  type="text"
                  placeholder="Optional"
                  class="border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200 hover:border-blue-300"
                />
              </div>

              <!-- Last Name -->
              <div class="flex flex-col space-y-1">
                <label for="lastName" class="text-sm font-medium text-gray-700"
                  >Last Name <span class="text-red-500">*</span></label
                >
                <input
                  id="lastName"
                  v-model="formData.lastName"
                  type="text"
                  placeholder="Enter your last name"
                  class="border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200 hover:border-blue-300"
                  :class="[errors.lastName ? 'border-red-500' : '']"
                />
                <div v-if="errors.lastName" class="text-red-500 text-xs mt-1">
                  {{ errors.lastName }}
                </div>
              </div>
            </div>

            <!-- Email -->
            <div class="flex flex-col space-y-1">
              <label for="email" class="text-sm font-medium text-gray-700"
                >Email <span class="text-red-500">*</span></label
              >
              <input
                id="email"
                v-model="formData.email"
                type="email"
                readonly
                disabled
                :placeholder="$route.query.email || 'your.email@example.com'"
                class="border border-gray-300 rounded-lg p-2 bg-gray-100 cursor-not-allowed"
                :class="[errors.email ? 'border-red-500' : '']"
              />
              <div v-if="errors.email" class="text-red-500 text-xs mt-1">
                {{ errors.email }}
              </div>
            </div>
          </div>

          <!-- Step 2: Contact Information -->
          <div v-if="currentStep === 2" class="space-y-6">
            <h2 class="text-xl font-bold text-dark-blue">Contact Information</h2>
            <p class="text-gray-600">How can we reach you?</p>

            <div class="bg-blue-50 p-4 rounded-lg mb-6 border-l-4 border-blue-500">
              <p class="text-sm text-blue-800">
                Your contact information will be used for important notifications about your vehicle
                registration.
              </p>
            </div>

            <!-- Telephone Number -->
            <div class="flex flex-col space-y-1">
              <label for="telephoneNumber" class="text-sm font-medium text-gray-700"
                >Telephone Number</label
              >
              <input
                id="telephoneNumber"
                v-model="formData.telephoneNumber"
                type="tel"
                placeholder="(02) XXXX-XXXX"
                class="border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200 hover:border-blue-300"
              />
            </div>

            <!-- Mobile Number with Area Code -->
            <div class="flex flex-col space-y-1">
              <label for="mobileNumber" class="text-sm font-medium text-gray-700"
                >Mobile Number <span class="text-red-500">*</span></label
              >
              <div class="flex space-x-2">
                <select
                  v-model="formData.intAreaCode"
                  class="border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none w-24 transition-all duration-200 hover:border-blue-300"
                >
                  <option value="+63">+63</option>
                  <option value="+1">+1</option>
                  <option value="+44">+44</option>
                  <option value="+61">+61</option>
                </select>
                <input
                  id="mobileNumber"
                  v-model="formData.mobileNumber"
                  type="tel"
                  placeholder="9XX XXX XXXX"
                  class="border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none flex-1 transition-all duration-200 hover:border-blue-300"
                  :class="[errors.mobileNumber ? 'border-red-500' : '']"
                />
              </div>
              <div v-if="errors.mobileNumber" class="text-red-500 text-xs mt-1">
                {{ errors.mobileNumber }}
              </div>
            </div>
          </div>

          <!-- Step 3: Personal Information -->
          <div v-if="currentStep === 3" class="space-y-6">
            <h2 class="text-xl font-bold text-dark-blue">Personal Information</h2>
            <p class="text-gray-600">Tell us more about yourself</p>

            <div class="bg-blue-50 p-4 rounded-lg mb-6 border-l-4 border-blue-500">
              <p class="text-sm text-blue-800">
                This information will be used for your official vehicle registration documents.
              </p>
            </div>

            <!-- General Information -->
            <div class="space-y-4">
              <h3 class="text-lg font-semibold text-dark-blue">General Information</h3>

              <!-- Nationality and Civil Status -->
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="flex flex-col space-y-1">
                  <label for="nationality" class="text-sm font-medium text-gray-700"
                    >Nationality</label
                  >
                  <input
                    id="nationality"
                    v-model="formData.nationality"
                    type="text"
                    class="border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  />
                </div>
                <div class="flex flex-col space-y-1">
                  <label for="civilStatus" class="text-sm font-medium text-gray-700"
                    >Civil Status</label
                  >
                  <select
                    id="civilStatus"
                    v-model="formData.civilStatus"
                    class="border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  >
                    <option value="Single">Single</option>
                    <option value="Married">Married</option>
                    <option value="Divorced">Divorced</option>
                    <option value="Widowed">Widowed</option>
                  </select>
                </div>
              </div>

              <!-- Date of Birth and Place of Birth -->
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="flex flex-col space-y-1">
                  <label for="dateOfBirth" class="text-sm font-medium text-gray-700"
                    >Date of Birth <span class="text-red-500">*</span></label
                  >
                  <input
                    id="dateOfBirth"
                    v-model="formData.dateOfBirth"
                    type="date"
                    class="border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    :class="[errors.dateOfBirth ? 'border-red-500' : '']"
                  />
                  <div v-if="errors.dateOfBirth" class="text-red-500 text-xs mt-1">
                    {{ errors.dateOfBirth }}
                  </div>
                </div>
                <div class="flex flex-col space-y-1">
                  <label for="placeOfBirth" class="text-sm font-medium text-gray-700"
                    >Place of Birth</label
                  >
                  <input
                    id="placeOfBirth"
                    v-model="formData.placeOfBirth"
                    type="text"
                    class="border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  />
                </div>
              </div>

              <!-- Educational Attainment and TIN -->
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="flex flex-col space-y-1">
                  <label for="educationalAttainment" class="text-sm font-medium text-gray-700"
                    >Educational Attainment</label
                  >
                  <select
                    id="educationalAttainment"
                    v-model="formData.educationalAttainment"
                    class="border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  >
                    <option value="">Select Education Level</option>
                    <option value="Elementary">Elementary</option>
                    <option value="High School">High School</option>
                    <option value="College Graduate">College Graduate</option>
                    <option value="Post Graduate">Post Graduate</option>
                  </select>
                </div>
                <div class="flex flex-col space-y-1">
                  <label for="tin" class="text-sm font-medium text-gray-700">TIN</label>
                  <input
                    id="tin"
                    v-model="formData.tin"
                    type="text"
                    class="border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  />
                </div>
              </div>
            </div>

            <!-- Medical Information -->
            <div class="space-y-4 mt-8">
              <h3 class="text-lg font-semibold text-dark-blue">Medical Information</h3>

              <!-- Gender and Blood Type -->
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="flex flex-col space-y-1">
                  <label for="gender" class="text-sm font-medium text-gray-700">Gender</label>
                  <select
                    id="gender"
                    v-model="formData.gender"
                    class="border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div class="flex flex-col space-y-1">
                  <label for="bloodType" class="text-sm font-medium text-gray-700"
                    >Blood Type</label
                  >
                  <select
                    id="bloodType"
                    v-model="formData.bloodType"
                    class="border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  >
                    <option value="">Select Blood Type</option>
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                  </select>
                </div>
              </div>

              <!-- Height and Weight -->
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="flex flex-col space-y-1">
                  <label for="height" class="text-sm font-medium text-gray-700">Height (cm)</label>
                  <input
                    id="height"
                    v-model="formData.height"
                    type="number"
                    class="border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  />
                </div>
                <div class="flex flex-col space-y-1">
                  <label for="weight" class="text-sm font-medium text-gray-700">Weight (kg)</label>
                  <input
                    id="weight"
                    v-model="formData.weight"
                    type="number"
                    class="border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  />
                </div>
              </div>

              <!-- Organ Donor -->
              <div class="flex items-center space-x-2 mt-4">
                <input
                  id="organDonor"
                  v-model="formData.organDonor"
                  type="checkbox"
                  class="w-4 h-4 accent-blue-500"
                />
                <label for="organDonor" class="text-sm font-medium text-gray-700"
                  >I want to be an organ donor</label
                >
              </div>
            </div>
          </div>

          <!-- Step 4: People Information -->
          <div v-if="currentStep === 4" class="space-y-6">
            <h2 class="text-xl font-bold text-dark-blue">People Information</h2>
            <p class="text-gray-600">Information about people related to you</p>

            <div class="bg-blue-50 p-4 rounded-lg mb-6 border-l-4 border-blue-500">
              <p class="text-sm text-blue-800">
                These details are optional but helpful for verification purposes.
              </p>
            </div>

            <!-- Emergency Contact -->
            <div class="space-y-4">
              <h3 class="text-lg font-semibold text-dark-blue">Emergency Contact</h3>

              <div class="flex flex-col space-y-1">
                <label for="emergencyContactName" class="text-sm font-medium text-gray-700"
                  >Name</label
                >
                <input
                  id="emergencyContactName"
                  v-model="formData.emergencyContactName"
                  type="text"
                  class="border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
              </div>

              <div class="flex flex-col space-y-1">
                <label for="emergencyContactNumber" class="text-sm font-medium text-gray-700"
                  >Contact Number</label
                >
                <input
                  id="emergencyContactNumber"
                  v-model="formData.emergencyContactNumber"
                  type="tel"
                  class="border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
              </div>

              <div class="flex flex-col space-y-1">
                <label for="emergencyContactAddress" class="text-sm font-medium text-gray-700"
                  >Address</label
                >
                <input
                  id="emergencyContactAddress"
                  v-model="formData.emergencyContactAddress"
                  type="text"
                  class="border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
              </div>
            </div>

            <!-- Employer Information -->
            <div class="space-y-4 mt-8">
              <h3 class="text-lg font-semibold text-dark-blue">Employer Information</h3>

              <div class="flex flex-col space-y-1">
                <label for="employerName" class="text-sm font-medium text-gray-700"
                  >Employer Name</label
                >
                <input
                  id="employerName"
                  v-model="formData.employerName"
                  type="text"
                  class="border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
              </div>

              <div class="flex flex-col space-y-1">
                <label for="employerAddress" class="text-sm font-medium text-gray-700"
                  >Employer Address</label
                >
                <input
                  id="employerAddress"
                  v-model="formData.employerAddress"
                  type="text"
                  class="border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
              </div>
            </div>

            <!-- Parent Information -->
            <div class="space-y-4 mt-8">
              <h3 class="text-lg font-semibold text-dark-blue">Mother's Maiden Name</h3>

              <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div class="flex flex-col space-y-1">
                  <label for="motherFirstName" class="text-sm font-medium text-gray-700"
                    >First Name</label
                  >
                  <input
                    id="motherFirstName"
                    v-model="formData.motherFirstName"
                    type="text"
                    class="border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  />
                </div>

                <div class="flex flex-col space-y-1">
                  <label for="motherMiddleName" class="text-sm font-medium text-gray-700"
                    >Middle Name</label
                  >
                  <input
                    id="motherMiddleName"
                    v-model="formData.motherMiddleName"
                    type="text"
                    class="border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  />
                </div>

                <div class="flex flex-col space-y-1">
                  <label for="motherLastName" class="text-sm font-medium text-gray-700"
                    >Last Name</label
                  >
                  <input
                    id="motherLastName"
                    v-model="formData.motherLastName"
                    type="text"
                    class="border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  />
                </div>
              </div>
            </div>

            <div class="space-y-4 mt-8">
              <h3 class="text-lg font-semibold text-dark-blue">Father's Information</h3>

              <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div class="flex flex-col space-y-1">
                  <label for="fatherFirstName" class="text-sm font-medium text-gray-700"
                    >First Name</label
                  >
                  <input
                    id="fatherFirstName"
                    v-model="formData.fatherFirstName"
                    type="text"
                    class="border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  />
                </div>

                <div class="flex flex-col space-y-1">
                  <label for="fatherMiddleName" class="text-sm font-medium text-gray-700"
                    >Middle Name</label
                  >
                  <input
                    id="fatherMiddleName"
                    v-model="formData.fatherMiddleName"
                    type="text"
                    class="border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  />
                </div>

                <div class="flex flex-col space-y-1">
                  <label for="fatherLastName" class="text-sm font-medium text-gray-700"
                    >Last Name</label
                  >
                  <input
                    id="fatherLastName"
                    v-model="formData.fatherLastName"
                    type="text"
                    class="border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  />
                </div>
              </div>
            </div>
          </div>

          <!-- Step 5: Address Information -->
          <div v-if="currentStep === 5" class="space-y-6">
            <h2 class="text-xl font-bold text-dark-blue">Address Information</h2>
            <p class="text-gray-600">Where do you live?</p>

            <div class="bg-blue-50 p-4 rounded-lg mb-6 border-l-4 border-blue-500">
              <p class="text-sm text-blue-800">
                Your address will be used for official correspondence and vehicle registration
                documents.
              </p>
            </div>

            <!-- House Number and Street -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div class="flex flex-col space-y-1">
                <label for="houseNo" class="text-sm font-medium text-gray-700"
                  >House/Unit Number <span class="text-red-500">*</span></label
                >
                <input
                  id="houseNo"
                  v-model="formData.houseNo"
                  type="text"
                  class="border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
              </div>

              <div class="flex flex-col space-y-1 md:col-span-2">
                <label for="street" class="text-sm font-medium text-gray-700"
                  >Street <span class="text-red-500">*</span></label
                >
                <input
                  id="street"
                  v-model="formData.street"
                  type="text"
                  class="border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
              </div>
            </div>

            <!-- Barangay, City, Province -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div class="flex flex-col space-y-1">
                <label for="barangay" class="text-sm font-medium text-gray-700">Barangay</label>
                <input
                  id="barangay"
                  v-model="formData.barangay"
                  type="text"
                  class="border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
              </div>

              <div class="flex flex-col space-y-1">
                <label for="city" class="text-sm font-medium text-gray-700"
                  >City <span class="text-red-500">*</span></label
                >
                <input
                  id="city"
                  v-model="formData.city"
                  type="text"
                  class="border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
              </div>

              <div class="flex flex-col space-y-1">
                <label for="province" class="text-sm font-medium text-gray-700"
                  >Province <span class="text-red-500">*</span></label
                >
                <input
                  id="province"
                  v-model="formData.province"
                  type="text"
                  class="border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
              </div>
            </div>

            <!-- Zip Code -->
            <div class="flex flex-col space-y-1 max-w-xs">
              <label for="zipCode" class="text-sm font-medium text-gray-700">Zip Code</label>
              <input
                id="zipCode"
                v-model="formData.zipCode"
                type="text"
                class="border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />
            </div>

            <!-- Terms and Conditions -->
            <div class="mt-8 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div class="flex items-center space-x-3">
                <input
                  id="acceptTerms"
                  v-model="formData.acceptTerms"
                  type="checkbox"
                  class="w-5 h-5 accent-blue-500 cursor-pointer"
                  :class="[errors.terms ? 'border-red-500' : '']"
                />
                <label for="acceptTerms" class="text-sm text-gray-700 cursor-pointer">
                  I accept the
                  <a href="#" class="text-blue-600 hover:underline font-medium"
                    >Terms and Conditions</a
                  >
                  and
                  <a href="#" class="text-blue-600 hover:underline font-medium">Privacy Policy</a>
                </label>
              </div>
              <div v-if="errors.terms" class="text-red-500 text-xs mt-2 ml-8">
                {{ errors.terms }}
              </div>
            </div>
          </div>

          <!-- Form Error Message -->
          <div
            v-if="errors.form"
            class="mt-4 p-4 bg-red-50 text-red-600 rounded-lg text-sm border-l-4 border-red-500 flex items-center"
          >
            <font-awesome-icon :icon="['fas', 'exclamation-circle']" class="mr-2 text-red-500" />
            {{ errors.form }}
          </div>

          <!-- Navigation Buttons -->
          <div class="flex justify-between mt-10">
            <button
              v-if="currentStep > 1"
              @click="prevStep"
              type="button"
              class="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-md flex items-center font-medium"
            >
              <font-awesome-icon :icon="['fas', 'arrow-left']" class="mr-2" />
              Previous
            </button>
            <div v-else></div>

            <button
              v-if="currentStep < totalSteps"
              @click="nextStep"
              type="button"
              class="px-8 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-md flex items-center font-medium"
              :disabled="!isStepComplete"
              :class="[!isStepComplete ? 'opacity-50 cursor-not-allowed' : '']"
            >
              Next
              <font-awesome-icon :icon="['fas', 'arrow-right']" class="ml-2" />
            </button>
            <button
              v-else
              @click="submitRegistration"
              type="button"
              class="px-8 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-md flex items-center font-medium"
              :disabled="!isStepComplete"
              :class="[!isStepComplete ? 'opacity-50 cursor-not-allowed' : '']"
            >
              Complete Registration
              <font-awesome-icon :icon="['fas', 'check']" class="ml-2" />
            </button>
            <button
              @click="cancelRegistration"
              type="button"
              class="px-8 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-md flex items-center font-medium"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>
