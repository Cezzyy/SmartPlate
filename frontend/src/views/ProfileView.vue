<script setup>
import { ref, reactive, computed, defineAsyncComponent } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'

const AccountInfo = defineAsyncComponent(() => import('@/components/profile/AccountInfo.vue'))
const ContactInfo = defineAsyncComponent(() => import('@/components/profile/ContactInfo.vue'))
const PersonalInfo = defineAsyncComponent(() => import('@/components/profile/PersonalInfo.vue'))
const PeopleInfo = defineAsyncComponent(() => import('@/components/profile/PeopleInfo.vue'))
const AddressInfo = defineAsyncComponent(() => import('@/components/profile/AddressInfo.vue'))
const VehiclesInfo = defineAsyncComponent(() => import('@/components/profile/VehiclesInfo.vue'))

const router = useRouter()
const userStore = useUserStore()

// Check if user is authenticated
if (!userStore.isAuthenticated) {
  router.push('/login')
}

// User profile data from store
const user = reactive({
  ...(userStore.currentUser || {
    ltoClientId: 'Not assigned',
    firstName: '',
    lastName: '',
    middleName: '',
    email: '',
    mobileNumber: '',
    role: 'user'
  })
})

// Computed full name - use the store getter
const fullName = computed(() => userStore.fullName || 'User')

// Edit mode state
const isEditMode = ref(false)

// Active tab for profile sections
const activeTab = ref('account')

// Form data for editing
const formData = reactive({ ...user })

// Update formData when child components change values
const updateFormData = (newData) => {
  Object.assign(formData, newData)
}

// Default avatar image
const defaultAvatar = '/Land_Transportation_Office.webp'

// Computed avatar - use the user's avatar if available, otherwise use the default LTO logo
const userAvatar = computed(() => user.avatar || defaultAvatar)

// Error handling
const errors = reactive({
  // Account Information
  lastName: '',
  firstName: '',
  email: '',

  // Contact Information
  mobileNumber: '',

  // Address fields
  houseNo: '',
  street: '',
  province: '',
  city: '',
  barangay: '',

  // General error
  form: '',
})

// Toggle edit mode
const toggleEditMode = () => {
  if (isEditMode.value) {
    // If we're exiting edit mode, reset form data
    Object.assign(formData, user)
    // Clear errors
    clearErrors()
  }
  isEditMode.value = !isEditMode.value
}

// Clear all errors
const clearErrors = () => {
  Object.keys(errors).forEach((key) => {
    errors[key] = ''
  })
}

// Validation functions
const validateProfile = () => {
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

  // Mobile Number validation
  if (!formData.mobileNumber || formData.mobileNumber.trim() === '') {
    errors.mobileNumber = 'Mobile number is required'
    isValid = false
  }

  // Address validation - required fields
  if (!formData.houseNo || formData.houseNo.trim() === '') {
    errors.houseNo = 'House No. is required'
    isValid = false
  }

  if (!formData.street || formData.street.trim() === '') {
    errors.street = 'Street is required'
    isValid = false
  }

  if (!formData.province || formData.province.trim() === '') {
    errors.province = 'Province is required'
    isValid = false
  }

  if (!formData.city || formData.city.trim() === '') {
    errors.city = 'City is required'
    isValid = false
  }

  return isValid
}

// Save profile changes
const saveChanges = async () => {
  // Validate form data
  if (!validateProfile()) {
    errors.form = 'Please fix the errors above before saving'
    return
  }

  try {
    errors.form = ''

    // Create a copy of formData to send (avoids reactive issues)
    const dataToUpdate = { ...formData }

    console.log('Sending profile update data:', dataToUpdate)

    // Update the user data in the store
    const updatedUser = await userStore.updateUserProfile(dataToUpdate)

    // Update local reactive object with the latest user data
    if (updatedUser) {
      // Create a fresh copy of the updated user to ensure all nested properties are reactive
      Object.keys(user).forEach(key => {
        delete user[key]
      })
      // Copy all properties from updatedUser to user
      Object.assign(user, JSON.parse(JSON.stringify(updatedUser)))

      // Also update the formData to match the updated user data
      Object.keys(formData).forEach(key => {
        delete formData[key]
      })
      Object.assign(formData, JSON.parse(JSON.stringify(updatedUser)))

      // Exit edit mode
      isEditMode.value = false
      // Show success message
      errors.form = 'Profile updated successfully!'
      setTimeout(() => {
        errors.form = ''
      }, 3000)
    } else {
      console.error('Failed to update user profile: No user data returned')
      errors.form = 'Failed to update profile. Please try again.'
    }
  } catch (error) {
    console.error('Error updating profile:', error)

    // Show specific error message if available
    if (error && typeof error === 'object' && 'message' in error) {
      errors.form = `Update failed: ${error.message}`
    } else {
      errors.form = 'Failed to update profile. Please try again.'
    }
  }
}

const goBack = () => {
  router.push('/home')
}
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <header class="bg-gradient-to-r from-dark-blue to-blue-900 text-white shadow-md">
      <div class="container mx-auto px-4 py-4">
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-3">
            <button
              @click="goBack"
              class="p-2 rounded-full hover:bg-blue-800 transition-colors duration-200"
            >
              <font-awesome-icon :icon="['fas', 'arrow-left']" class="w-5 h-5" />
            </button>
            <h1 class="text-xl font-bold">My Profile</h1>
          </div>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="container mx-auto px-4 py-8">
      <div class="max-w-3xl mx-auto bg-white rounded-xl shadow-md overflow-hidden">
        <!-- Profile Header -->
        <div class="bg-gradient-to-r from-dark-blue to-blue-900 p-6 text-white">
          <div class="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-4">
            <div class="flex-shrink-0">
              <img
                :src="userAvatar"
                alt="User Avatar"
                class="w-24 h-24 rounded-full border-4 border-white object-cover"
              />
            </div>
            <div class="text-center md:text-left flex-grow">
              <h2 class="text-2xl font-bold">{{ fullName }}</h2>
              <p class="text-blue-200">Vehicle Owner</p>
              <p class="text-blue-200 text-sm">LTO Client ID: {{ user.ltoClientId }}</p>
            </div>
            <div class="flex-shrink-0 w-full md:w-auto flex justify-center md:justify-end">
              <button
                v-if="!isEditMode"
                @click="toggleEditMode"
                class="bg-white text-dark-blue hover:bg-blue-50 font-medium py-2 px-4 rounded-lg transition-colors duration-200 flex items-center space-x-2 w-full md:w-auto"
              >
                <font-awesome-icon :icon="['fas', 'edit']" class="w-4 h-4" />
                <span>Edit Profile</span>
              </button>
              <div
                v-else
                class="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-2 w-full md:w-auto"
              >
                <button
                  @click="saveChanges"
                  class="bg-green-500 hover:bg-green-600 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
                >
                  <font-awesome-icon :icon="['fas', 'check']" class="w-4 h-4" />
                  <span>Save</span>
                </button>
                <button
                  @click="toggleEditMode"
                  class="bg-black text-white hover:bg-gray-100 font-medium py-2 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
                >
                  <font-awesome-icon :icon="['fas', 'times']" class="w-4 h-4" />
                  <span>Cancel</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Error message if any -->
        <div v-if="errors.form" class="bg-red-50 text-red-700 p-3 border-b border-red-200 text-sm">
          {{ errors.form }}
        </div>

        <!-- Profile Navigation Tabs -->
        <div class="bg-gray-50 border-b border-gray-200">
          <nav class="flex overflow-x-auto">
            <button
              @click="activeTab = 'account'"
              :class="[
                'px-4 py-3 text-sm font-medium whitespace-nowrap',
                activeTab === 'account'
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700 hover:border-gray-300',
              ]"
            >
              <font-awesome-icon :icon="['fas', 'user-circle']" class="mr-2" />
              Account
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
              @click="activeTab = 'people'"
              :class="[
                'px-4 py-3 text-sm font-medium whitespace-nowrap',
                activeTab === 'people'
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700 hover:border-gray-300',
              ]"
            >
              <font-awesome-icon :icon="['fas', 'users']" class="mr-2" />
              People
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

        <!-- Profile Content -->
        <div class="p-6">
          <!-- Account Information -->
          <AccountInfo
            v-if="activeTab === 'account'"
            :user="user"
            :is-edit-mode="isEditMode"
            :form-data="formData"
            :errors="errors"
            :show-empty-state="true"
            @update:form-data="updateFormData"
          />

          <!-- Contact Information -->
          <ContactInfo
            v-if="activeTab === 'contact'"
            :user="user"
            :is-edit-mode="isEditMode"
            :form-data="formData"
            :errors="errors"
            :show-empty-state="true"
            @update:form-data="updateFormData"
          />

          <!-- Personal Information -->
          <PersonalInfo
            v-if="activeTab === 'personal'"
            :user="user"
            :is-edit-mode="isEditMode"
            :form-data="formData"
            :errors="errors"
            :show-empty-state="true"
            @update:form-data="updateFormData"
          />

          <!-- People Information -->
          <PeopleInfo
            v-if="activeTab === 'people'"
            :user="user"
            :is-edit-mode="isEditMode"
            :form-data="formData"
            :errors="errors"
            :show-empty-state="true"
            @update:form-data="updateFormData"
          />

          <!-- Address Information -->
          <AddressInfo
            v-if="activeTab === 'address'"
            :user="user"
            :is-edit-mode="isEditMode"
            :form-data="formData"
            :errors="errors"
            :show-empty-state="true"
            @update:form-data="updateFormData"
          />
        </div>
      </div>

      <!-- Vehicles and Plates Section -->
      <div class="max-w-3xl mx-auto bg-white rounded-xl shadow-md overflow-hidden mt-8">
        <div class="bg-gradient-to-r from-dark-blue to-blue-900 p-4 text-white">
          <div class="flex items-center space-x-3">
            <font-awesome-icon :icon="['fas', 'car']" class="w-5 h-5" />
            <h2 class="text-xl font-bold">Vehicles & Plates</h2>
          </div>
        </div>
        <div class="p-6">
          <VehiclesInfo
            :user="user"
            :is-edit-mode="isEditMode"
            :form-data="formData"
            :errors="errors"
            :show-empty-state="true"
            @update:form-data="updateFormData"
          />
        </div>
      </div>
    </main>
  </div>
</template>
