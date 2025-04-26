<script setup>
import { ref, reactive, computed, defineAsyncComponent } from 'vue'
import { useRouter } from 'vue-router'

const AccountInfo = defineAsyncComponent(() => import('@/components/profile/AccountInfo.vue'))
const ContactInfo = defineAsyncComponent(() => import('@/components/profile/ContactInfo.vue'))
const PersonalInfo = defineAsyncComponent(() => import('@/components/profile/PersonalInfo.vue'))
const PeopleInfo = defineAsyncComponent(() => import('@/components/profile/PeopleInfo.vue'))
const AddressInfo = defineAsyncComponent(() => import('@/components/profile/AddressInfo.vue'))
const VehiclesInfo = defineAsyncComponent(() => import('@/components/profile/VehiclesInfo.vue'))

const router = useRouter()

// User profile data (mock data)
const user = reactive({
  // Account Information
  ltoClientId: 'LTO-2023-78945',
  lastName: 'Morales',
  firstName: 'Stanleigh',
  middleName: 'Garcia',

  // Contact Information
  email: 'stanleighmorales@gmail.com',
  telephoneNumber: '(02) 8123-4567',
  intAreaCode: '+63',
  mobileNumber: '912 345 6789',

  // Personal Information - General
  nationality: 'Filipino',
  civilStatus: 'Single',
  dateOfBirth: '1990-05-15',
  placeOfBirth: 'Manila, Philippines',
  educationalAttainment: 'College Graduate',
  tin: '123-456-789-000',

  // Personal Information - Medical
  gender: 'Male',
  bloodType: 'O+',
  complexion: 'Fair',
  bodyType: 'Medium',
  eyeColor: 'Brown',
  hairColor: 'Black',
  weight: 70, // kg
  height: 175, // cm
  organDonor: false,

  // People - Emergency Contact
  emergencyContactName: 'Maria Morales',
  emergencyContactNumber: '+63 917 123 4567',
  emergencyContactAddress: '123 Main Street, Quezon City',

  // People - Employer
  employerName: 'ABC Corporation',
  employerAddress: '789 Corporate Ave, Makati City',

  // People - Mother's Maiden Name
  motherLastName: 'Santos',
  motherFirstName: 'Elena',
  motherMiddleName: 'Cruz',

  // People - Father
  fatherLastName: 'Morales',
  fatherFirstName: 'Roberto',
  fatherMiddleName: 'Reyes',

  // Address
  houseNo: '123',
  street: 'Main Street',
  province: 'Metro Manila',
  city: 'Quezon City',
  barangay: 'Barangay 123',
  zipCode: '1100',

  // Other
  avatar: '/Land_Transportation_Office.webp',
})

// Computed full name
const fullName = computed(() => {
  return `${user.firstName} ${user.middleName ? user.middleName + ' ' : ''}${user.lastName}`
})

// Edit mode state
const isEditMode = ref(false)

// Active tab for profile sections
const activeTab = ref('account')

// Form data for editing
const formData = reactive({ ...user })

// Toggle edit mode
const toggleEditMode = () => {
  if (isEditMode.value) {
    // If we're exiting edit mode, reset form data
    Object.assign(formData, user)
  }
  isEditMode.value = !isEditMode.value
}

// Save profile changes
const saveChanges = () => {
  Object.assign(user, formData)

  // Exit edit mode
  isEditMode.value = false
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
            <div class="relative flex-shrink-0">
              <img
                :src="user.avatar"
                alt="User Avatar"
                class="w-24 h-24 rounded-full border-4 border-white object-cover"
              />
              <div
                class="absolute bottom-0 right-0 bg-red text-white rounded-full w-8 h-8 flex items-center justify-center border-2 border-white"
              >
                <font-awesome-icon :icon="['fas', 'camera']" class="w-4 h-4" />
              </div>
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
          />

          <!-- Contact Information -->
          <ContactInfo
            v-if="activeTab === 'contact'"
            :user="user"
            :is-edit-mode="isEditMode"
            :form-data="formData"
          />

          <!-- Personal Information -->
          <PersonalInfo
            v-if="activeTab === 'personal'"
            :user="user"
            :is-edit-mode="isEditMode"
            :form-data="formData"
          />

          <!-- People Information -->
          <PeopleInfo
            v-if="activeTab === 'people'"
            :user="user"
            :is-edit-mode="isEditMode"
            :form-data="formData"
          />

          <!-- Address Information -->
          <AddressInfo
            v-if="activeTab === 'address'"
            :user="user"
            :is-edit-mode="isEditMode"
            :form-data="formData"
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
          <VehiclesInfo :user="user" :is-edit-mode="isEditMode" :form-data="formData" />
        </div>
      </div>
    </main>
  </div>
</template>
