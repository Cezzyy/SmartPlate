<script setup lang="ts">
import { ref, reactive, defineProps, defineEmits } from 'vue'
import { useUserStore } from '@/stores/user'
import type { User } from '@/types/user'

const props = defineProps({
  show: {
    type: Boolean,
    required: true,
  },
  user: {
    type: Object as () => User,
    required: true,
  },
})

const emit = defineEmits(['close', 'update'])

const userStore = useUserStore()

// Active tab for form sections
const activeTab = ref('basic')

// Loading state
const isLoading = ref(false)

// Form data for editing
const formData = reactive({ ...props.user })

// Error handling
const errors = reactive({
  lastName: '',
  firstName: '',
  email: '',
  mobileNumber: '',
  role: '',
  status: '',
  form: '',
  nationality: '',
  telephoneNumber: '',
  dateOfBirth: '',
  placeOfBirth: '',
  gender: '',
  bloodType: '',
  height: '',
  weight: '',
  eyeColor: '',
  hairColor: '',
  civilStatus: '',
  tin: '',
  houseNo: '',
  street: '',
  barangay: '',
  city: '',
  province: '',
  zipCode: '',
})

// Available roles
const availableRoles = [
  { value: 'user', label: 'User' },
  { value: 'admin', label: 'Admin' },
  { value: 'lto officer', label: 'LTO Officer' },
]

// Available statuses
const availableStatuses = [
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
  { value: 'pending', label: 'Pending' },
]

// Available genders
const availableGenders = [
  { value: 'Male', label: 'Male' },
  { value: 'Female', label: 'Female' },
  { value: 'Other', label: 'Other' },
]

// Available blood types
const availableBloodTypes = [
  { value: 'A+', label: 'A+' },
  { value: 'A-', label: 'A-' },
  { value: 'B+', label: 'B+' },
  { value: 'B-', label: 'B-' },
  { value: 'AB+', label: 'AB+' },
  { value: 'AB-', label: 'AB-' },
  { value: 'O+', label: 'O+' },
  { value: 'O-', label: 'O-' },
]

// Available civil statuses
const availableCivilStatuses = [
  { value: 'Single', label: 'Single' },
  { value: 'Married', label: 'Married' },
  { value: 'Divorced', label: 'Divorced' },
  { value: 'Widowed', label: 'Widowed' },
  { value: 'Separated', label: 'Separated' },
]

// Close modal and reset form
const closeModal = () => {
  clearErrors()
  emit('close')
}

// Clear all errors
const clearErrors = () => {
  Object.keys(errors).forEach((key) => {
    if (key in errors) {
      ;(errors as any)[key] = ''
    }
  })
}

// Validation functions
const validateUserForm = () => {
  let isValid = true
  clearErrors()

  // First Name validation
  if (!formData.firstName || formData.firstName.trim() === '') {
    errors.firstName = 'First name is required'
    isValid = false
  }

  // Last Name validation
  if (!formData.lastName || formData.lastName.trim() === '') {
    errors.lastName = 'Last name is required'
    isValid = false
  }

  // Email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!formData.email || formData.email.trim() === '') {
    errors.email = 'Email is required'
    isValid = false
  } else if (!emailRegex.test(formData.email)) {
    errors.email = 'Please enter a valid email address'
    isValid = false
  }

  // Role validation
  if (!formData.role || formData.role.trim() === '') {
    errors.role = 'Role is required'
    isValid = false
  }

  // Status validation
  if (!formData.status || formData.status.trim() === '') {
    errors.status = 'Status is required'
    isValid = false
  }

  return isValid
}

// Save changes
const saveChanges = async () => {
  // Validate form data
  if (!validateUserForm()) {
    errors.form = 'Please fix the errors above before saving'
    return
  }

  try {
    errors.form = ''
    // Set loading state
    isLoading.value = true

    // Prepare the updated user data
    const updatedData: Partial<User> = {
      // Basic Information
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      role: formData.role as 'user' | 'admin' | 'LTO Officer',
      status: formData.status as 'active' | 'inactive' | 'pending',

      // Contact Information
      mobileNumber: formData.mobileNumber,
      telephoneNumber: formData.telephoneNumber,

      // Personal Information
      nationality: formData.nationality,
      civilStatus: formData.civilStatus,
      dateOfBirth: formData.dateOfBirth,
      placeOfBirth: formData.placeOfBirth,
      gender: formData.gender,
      bloodType: formData.bloodType,
      tin: formData.tin,

      // Physical Characteristics
      height: formData.height ? Number(formData.height) : undefined,
      weight: formData.weight ? Number(formData.weight) : undefined,
      eyeColor: formData.eyeColor,
      hairColor: formData.hairColor,

      // Address Information
      houseNo: formData.houseNo,
      street: formData.street,
      barangay: formData.barangay,
      city: formData.city,
      province: formData.province,
      zipCode: formData.zipCode,
    }

    // Call the store action to update the user with refreshAllUsers set to true
    const updatedUser = await userStore.updateUser(props.user.ltoClientId, updatedData, true)

    // Success handling
    if (updatedUser) {
      // Emit event to parent component with the updated user
      emit('update', updatedUser)

      // Log for debugging only
      console.log('User updated successfully:', updatedUser)

      // Close modal
      closeModal()
    } else {
      throw new Error('Failed to update user')
    }
  } catch (error) {
    console.error('Error updating user:', error)
    errors.form =
      error instanceof Error ? error.message : 'Failed to update user. Please try again.'
  } finally {
    // Always reset loading state
    isLoading.value = false
  }
}
</script>

<template>
  <div
    v-if="show"
    class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
    @click.self="closeModal"
  >
    <div class="bg-white rounded-lg shadow-xl w-full max-w-3xl mx-4 overflow-hidden">
      <!-- Modal Header -->
      <div
        class="border-b px-6 py-4 flex items-center justify-between bg-gradient-to-r from-dark-blue to-blue-900 text-white"
      >
        <h3 class="text-xl font-semibold">Edit User</h3>
        <button @click="closeModal" class="text-white hover:text-gray-200 focus:outline-none">
          <font-awesome-icon :icon="['fas', 'times']" class="w-5 h-5" />
        </button>
      </div>

      <!-- Error message if any -->
      <div v-if="errors.form" class="bg-red-50 text-red-700 p-3 border-b border-red-200 text-sm">
        {{ errors.form }}
      </div>

      <!-- Navigation Tabs -->
      <div class="bg-gray-50 border-b border-gray-200">
        <nav class="flex overflow-x-auto">
          <button
            @click="activeTab = 'basic'"
            :class="[
              'px-4 py-3 text-sm font-medium whitespace-nowrap',
              activeTab === 'basic'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-500 hover:text-gray-700 hover:border-gray-300',
            ]"
          >
            <font-awesome-icon :icon="['fas', 'user-circle']" class="mr-2" />
            Basic Info
          </button>
          <button
            @click="activeTab = 'contact'"
            :class="[
              'px-4 py-3 text-sm font-medium whitespace-nowrap',
              activeTab === 'contact'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-500 hover:text-gray-700 hover:border-gray-300',
            ]"
          >
            <font-awesome-icon :icon="['fas', 'address-book']" class="mr-2" />
            Contact
          </button>
          <button
            @click="activeTab = 'personal'"
            :class="[
              'px-4 py-3 text-sm font-medium whitespace-nowrap',
              activeTab === 'personal'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-500 hover:text-gray-700 hover:border-gray-300',
            ]"
          >
            <font-awesome-icon :icon="['fas', 'info-circle']" class="mr-2" />
            Personal
          </button>
          <button
            @click="activeTab = 'physical'"
            :class="[
              'px-4 py-3 text-sm font-medium whitespace-nowrap',
              activeTab === 'physical'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-500 hover:text-gray-700 hover:border-gray-300',
            ]"
          >
            <font-awesome-icon :icon="['fas', 'id-card']" class="mr-2" />
            Physical
          </button>
          <button
            @click="activeTab = 'address'"
            :class="[
              'px-4 py-3 text-sm font-medium whitespace-nowrap',
              activeTab === 'address'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-500 hover:text-gray-700 hover:border-gray-300',
            ]"
          >
            <font-awesome-icon :icon="['fas', 'map-marker-alt']" class="mr-2" />
            Address
          </button>
        </nav>
      </div>

      <!-- Modal Content -->
      <div class="px-6 py-4 max-h-[70vh] overflow-y-auto">
        <form @submit.prevent="saveChanges" class="space-y-6">
          <!-- Basic Information Tab -->
          <div v-if="activeTab === 'basic'">
            <h4 class="text-lg font-medium text-gray-900 mb-4">Basic Information</h4>
            <div class="space-y-4">
              <!-- User ID (Read-only) -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">LTO Client ID</label>
                <input
                  type="text"
                  :value="user.ltoClientId"
                  disabled
                  class="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md text-gray-700 cursor-not-allowed"
                />
              </div>

              <!-- First Name -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  First Name <span class="text-red-600">*</span>
                </label>
                <input
                  v-model="formData.firstName"
                  type="text"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-light-blue"
                  :class="{ 'border-red-300 ring-1 ring-red-300': errors.firstName }"
                />
                <p v-if="errors.firstName" class="mt-1 text-sm text-red-600">
                  {{ errors.firstName }}
                </p>
              </div>

              <!-- Last Name -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  Last Name <span class="text-red-600">*</span>
                </label>
                <input
                  v-model="formData.lastName"
                  type="text"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-light-blue"
                  :class="{ 'border-red-300 ring-1 ring-red-300': errors.lastName }"
                />
                <p v-if="errors.lastName" class="mt-1 text-sm text-red-600">
                  {{ errors.lastName }}
                </p>
              </div>

              <!-- Role -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  Role <span class="text-red-600">*</span>
                </label>
                <select
                  v-model="formData.role"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-light-blue"
                  :class="{ 'border-red-300 ring-1 ring-red-300': errors.role }"
                >
                  <option v-for="role in availableRoles" :key="role.value" :value="role.value">
                    {{ role.label }}
                  </option>
                </select>
                <p v-if="errors.role" class="mt-1 text-sm text-red-600">{{ errors.role }}</p>
              </div>

              <!-- Status -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  Status <span class="text-red-600">*</span>
                </label>
                <select
                  v-model="formData.status"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-light-blue"
                  :class="{ 'border-red-300 ring-1 ring-red-300': errors.status }"
                >
                  <option
                    v-for="status in availableStatuses"
                    :key="status.value"
                    :value="status.value"
                  >
                    {{ status.label }}
                  </option>
                </select>
                <p v-if="errors.status" class="mt-1 text-sm text-red-600">{{ errors.status }}</p>
              </div>
            </div>
          </div>

          <!-- Contact Information Tab -->
          <div v-if="activeTab === 'contact'">
            <h4 class="text-lg font-medium text-gray-900 mb-4">Contact Information</h4>
            <div class="space-y-4">
              <!-- Email -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">
                  Email <span class="text-red-600">*</span>
                </label>
                <input
                  v-model="formData.email"
                  type="email"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-light-blue"
                  :class="{ 'border-red-300 ring-1 ring-red-300': errors.email }"
                />
                <p v-if="errors.email" class="mt-1 text-sm text-red-600">{{ errors.email }}</p>
              </div>

              <!-- Mobile Number -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Mobile Number</label>
                <input
                  v-model="formData.mobileNumber"
                  type="text"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-light-blue"
                  :class="{ 'border-red-300 ring-1 ring-red-300': errors.mobileNumber }"
                />
                <p v-if="errors.mobileNumber" class="mt-1 text-sm text-red-600">
                  {{ errors.mobileNumber }}
                </p>
              </div>

              <!-- Telephone Number -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Telephone Number</label>
                <input
                  v-model="formData.telephoneNumber"
                  type="text"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-light-blue"
                  :class="{ 'border-red-300 ring-1 ring-red-300': errors.telephoneNumber }"
                />
                <p v-if="errors.telephoneNumber" class="mt-1 text-sm text-red-600">
                  {{ errors.telephoneNumber }}
                </p>
              </div>
            </div>
          </div>

          <!-- Personal Information Tab -->
          <div v-if="activeTab === 'personal'">
            <h4 class="text-lg font-medium text-gray-900 mb-4">Personal Information</h4>
            <div class="space-y-4">
              <!-- Nationality -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Nationality</label>
                <input
                  v-model="formData.nationality"
                  type="text"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-light-blue"
                  :class="{ 'border-red-300 ring-1 ring-red-300': errors.nationality }"
                />
                <p v-if="errors.nationality" class="mt-1 text-sm text-red-600">
                  {{ errors.nationality }}
                </p>
              </div>

              <!-- Civil Status -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Civil Status</label>
                <select
                  v-model="formData.civilStatus"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-light-blue"
                  :class="{ 'border-red-300 ring-1 ring-red-300': errors.civilStatus }"
                >
                  <option
                    v-for="status in availableCivilStatuses"
                    :key="status.value"
                    :value="status.value"
                  >
                    {{ status.label }}
                  </option>
                </select>
                <p v-if="errors.civilStatus" class="mt-1 text-sm text-red-600">
                  {{ errors.civilStatus }}
                </p>
              </div>

              <!-- Date of Birth -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
                <input
                  v-model="formData.dateOfBirth"
                  type="date"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-light-blue"
                  :class="{ 'border-red-300 ring-1 ring-red-300': errors.dateOfBirth }"
                />
                <p v-if="errors.dateOfBirth" class="mt-1 text-sm text-red-600">
                  {{ errors.dateOfBirth }}
                </p>
              </div>

              <!-- Place of Birth -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Place of Birth</label>
                <input
                  v-model="formData.placeOfBirth"
                  type="text"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-light-blue"
                  :class="{ 'border-red-300 ring-1 ring-red-300': errors.placeOfBirth }"
                />
                <p v-if="errors.placeOfBirth" class="mt-1 text-sm text-red-600">
                  {{ errors.placeOfBirth }}
                </p>
              </div>

              <!-- Gender -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                <select
                  v-model="formData.gender"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-light-blue"
                  :class="{ 'border-red-300 ring-1 ring-red-300': errors.gender }"
                >
                  <option
                    v-for="gender in availableGenders"
                    :key="gender.value"
                    :value="gender.value"
                  >
                    {{ gender.label }}
                  </option>
                </select>
                <p v-if="errors.gender" class="mt-1 text-sm text-red-600">{{ errors.gender }}</p>
              </div>

              <!-- TIN -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">TIN</label>
                <input
                  v-model="formData.tin"
                  type="text"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-light-blue"
                  :class="{ 'border-red-300 ring-1 ring-red-300': errors.tin }"
                />
                <p v-if="errors.tin" class="mt-1 text-sm text-red-600">
                  {{ errors.tin }}
                </p>
              </div>
            </div>
          </div>

          <!-- Physical Characteristics Tab -->
          <div v-if="activeTab === 'physical'">
            <h4 class="text-lg font-medium text-gray-900 mb-4">Physical Characteristics</h4>
            <div class="space-y-4">
              <!-- Blood Type -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Blood Type</label>
                <select
                  v-model="formData.bloodType"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-light-blue"
                  :class="{ 'border-red-300 ring-1 ring-red-300': errors.bloodType }"
                >
                  <option
                    v-for="bloodType in availableBloodTypes"
                    :key="bloodType.value"
                    :value="bloodType.value"
                  >
                    {{ bloodType.label }}
                  </option>
                </select>
                <p v-if="errors.bloodType" class="mt-1 text-sm text-red-600">
                  {{ errors.bloodType }}
                </p>
              </div>

              <!-- Height -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Height (cm)</label>
                <input
                  v-model="formData.height"
                  type="number"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-light-blue"
                  :class="{ 'border-red-300 ring-1 ring-red-300': errors.height }"
                />
                <p v-if="errors.height" class="mt-1 text-sm text-red-600">
                  {{ errors.height }}
                </p>
              </div>

              <!-- Weight -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Weight (kg)</label>
                <input
                  v-model="formData.weight"
                  type="number"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-light-blue"
                  :class="{ 'border-red-300 ring-1 ring-red-300': errors.weight }"
                />
                <p v-if="errors.weight" class="mt-1 text-sm text-red-600">
                  {{ errors.weight }}
                </p>
              </div>

              <!-- Eye Color -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Eye Color</label>
                <input
                  v-model="formData.eyeColor"
                  type="text"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-light-blue"
                  :class="{ 'border-red-300 ring-1 ring-red-300': errors.eyeColor }"
                />
                <p v-if="errors.eyeColor" class="mt-1 text-sm text-red-600">
                  {{ errors.eyeColor }}
                </p>
              </div>

              <!-- Hair Color -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Hair Color</label>
                <input
                  v-model="formData.hairColor"
                  type="text"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-light-blue"
                  :class="{ 'border-red-300 ring-1 ring-red-300': errors.hairColor }"
                />
                <p v-if="errors.hairColor" class="mt-1 text-sm text-red-600">
                  {{ errors.hairColor }}
                </p>
              </div>
            </div>
          </div>

          <!-- Address Information Tab -->
          <div v-if="activeTab === 'address'">
            <h4 class="text-lg font-medium text-gray-900 mb-4">Address Information</h4>
            <div class="space-y-4">
              <!-- House No -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">House No</label>
                <input
                  v-model="formData.houseNo"
                  type="text"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-light-blue"
                  :class="{ 'border-red-300 ring-1 ring-red-300': errors.houseNo }"
                />
                <p v-if="errors.houseNo" class="mt-1 text-sm text-red-600">
                  {{ errors.houseNo }}
                </p>
              </div>

              <!-- Street -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Street</label>
                <input
                  v-model="formData.street"
                  type="text"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-light-blue"
                  :class="{ 'border-red-300 ring-1 ring-red-300': errors.street }"
                />
                <p v-if="errors.street" class="mt-1 text-sm text-red-600">
                  {{ errors.street }}
                </p>
              </div>

              <!-- Barangay -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Barangay</label>
                <input
                  v-model="formData.barangay"
                  type="text"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-light-blue"
                  :class="{ 'border-red-300 ring-1 ring-red-300': errors.barangay }"
                />
                <p v-if="errors.barangay" class="mt-1 text-sm text-red-600">
                  {{ errors.barangay }}
                </p>
              </div>

              <!-- City -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">City</label>
                <input
                  v-model="formData.city"
                  type="text"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-light-blue"
                  :class="{ 'border-red-300 ring-1 ring-red-300': errors.city }"
                />
                <p v-if="errors.city" class="mt-1 text-sm text-red-600">
                  {{ errors.city }}
                </p>
              </div>

              <!-- Province -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Province</label>
                <input
                  v-model="formData.province"
                  type="text"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-light-blue"
                  :class="{ 'border-red-300 ring-1 ring-red-300': errors.province }"
                />
                <p v-if="errors.province" class="mt-1 text-sm text-red-600">
                  {{ errors.province }}
                </p>
              </div>

              <!-- Zip Code -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Zip Code</label>
                <input
                  v-model="formData.zipCode"
                  type="text"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-light-blue"
                  :class="{ 'border-red-300 ring-1 ring-red-300': errors.zipCode }"
                />
                <p v-if="errors.zipCode" class="mt-1 text-sm text-red-600">
                  {{ errors.zipCode }}
                </p>
              </div>
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="flex justify-end space-x-3 pt-4 border-t">
            <button
              type="button"
              @click="closeModal"
              :disabled="isLoading"
              class="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              type="submit"
              :disabled="isLoading"
              class="px-4 py-2 bg-dark-blue text-white rounded-md hover:bg-light-blue focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              <font-awesome-icon v-if="isLoading" :icon="['fas', 'spinner']" class="animate-spin" />
              <span>{{ isLoading ? 'Saving...' : 'Save Changes' }}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>
