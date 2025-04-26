import { defineStore } from 'pinia'
import router from '@/router'

// Mock users data
const mockUsersData = [
  {
    // Account Information
    ltoClientId: 'LTO-2023-78945',
    lastName: 'Morales',
    firstName: 'Stanleigh',
    middleName: 'Garcia',
    role: 'user',
    password: 'password123',
    status: 'active',

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
  },
  {
    ltoClientId: 'LTO-ADMIN-001',
    lastName: 'Admin',
    firstName: 'System',
    middleName: '',
    role: 'admin',
    email: 'admin@smartplate.com',
    password: 'admin123',
    status: 'active',
    avatar: '/Land_Transportation_Office.webp',
  },
  {
    ltoClientId: 'LTO-2023-12345',
    lastName: 'Santos',
    firstName: 'Maria',
    middleName: 'Cruz',
    role: 'user',
    email: 'maria.santos@gmail.com',
    password: 'maria123',
    status: 'active',
    avatar: '/Land_Transportation_Office.webp',
  },
  {
    ltoClientId: 'LTO-2023-67890',
    lastName: 'Reyes',
    firstName: 'Juan',
    middleName: 'Dela',
    role: 'user',
    email: 'juan.reyes@gmail.com',
    password: 'juan123',
    status: 'active',
    avatar: '/Land_Transportation_Office.webp',
  },
]

export const useUserStore = defineStore('user', {
  // State
  state: () => ({
    user: null,
    isAuthenticated: false,
    token: localStorage.getItem('token') || null,
    loading: false,
    error: null,
    isRegistering: false,
    registrationData: null,
    mockUsers: [...mockUsersData],
  }),

  // Getters
  getters: {
    fullName: (state) => {
      if (!state.user) return ''
      return `${state.user.firstName} ${state.user.middleName ? state.user.middleName + ' ' : ''}${state.user.lastName}`
    },

    userRole: (state) => state.user?.role || 'guest',

    isAdmin: (state) => state.user?.role === 'admin',
  },

  // Actions
  actions: {
    login(email, password, isAdminLogin = false) {
      this.loading = true
      this.error = null

      try {
        // this should be an API call
        // For demo purposes, we'll simulate an API call with a timeout
        return new Promise((resolve, reject) => {
          setTimeout(() => {
            // Find user with matching email and password
            const foundUser = this.mockUsers.find((user) => {
              // For admin login, only match admin users
              if (isAdminLogin) {
                return user.role === 'admin' && user.email === email && user.password === password
              }
              // For regular login, only match non-admin users
              return user.role !== 'admin' && user.email === email && user.password === password
            })

            if (foundUser) {
              // Set user data (without the password)
              const userWithoutPassword = { ...foundUser }
              delete userWithoutPassword.password
              this.user = userWithoutPassword
              this.isAuthenticated = true

              // Generate token and store it
              const tokenPrefix = foundUser.role === 'admin' ? 'admin_' : 'user_'
              const fakeToken = tokenPrefix + Math.random().toString(36).substring(2)
              this.token = fakeToken
              localStorage.setItem('token', fakeToken)

              this.loading = false
              resolve(this.user)
            } else {
              this.error = 'Invalid email or password'
              this.loading = false
              reject(new Error('Invalid email or password'))
            }
          }, 800)
        })
      } catch (err) {
        this.loading = false
        this.error = err.message || 'An error occurred during login'
        throw err
      }
    },

    startRegistration(initialData) {
      // Set registration state
      this.isRegistering = true
      this.registrationData = initialData || {}
    },

    cancelRegistration() {
      // Clear registration state
      this.isRegistering = false
      this.registrationData = null
      router.push('/login')
    },

    register(userData) {
      this.loading = true
      this.error = null

      try {
        // this should be an API call
        // For demo purposes, we'll simulate an API call with a timeout
        return new Promise((resolve) => {
          setTimeout(() => {
            // Create a new user with the provided data and default role
            const newUser = {
              ...userData,
              role: 'user',
              ltoClientId:
                'LTO-' + new Date().getFullYear() + '-' + Math.floor(10000 + Math.random() * 90000),
            }

            // Add the new user to mock users (this should be saved to DB)
            const password = this.registrationData?.password || 'defaultpassword'
            this.mockUsers.push({
              ...newUser,
              password,
            })

            // Set user data (without the password)
            const userWithoutPassword = { ...newUser }
            this.user = userWithoutPassword
            this.isAuthenticated = true

            // Generate a fake token and store it
            const fakeToken = 'user_' + Math.random().toString(36).substring(2)
            this.token = fakeToken
            localStorage.setItem('token', fakeToken)

            // Clear registration state
            this.isRegistering = false
            this.registrationData = null

            this.loading = false
            resolve(this.user)
          }, 1000)
        })
      } catch (err) {
        this.loading = false
        this.error = err.message || 'An error occurred during registration'
        throw err
      }
    },

    logout() {
      // Clear user data and token
      this.user = null
      this.isAuthenticated = false
      this.token = null
      localStorage.removeItem('token')

      router.push('/login')
    },

    checkAuth() {
      const storedToken = localStorage.getItem('token')

      if (storedToken) {
        // validate the token with the server
        // For demo purposes, check if it exists and set the user data

        if (storedToken.startsWith('admin_')) {
          // Find an admin user
          const adminUser = this.mockUsers.find((user) => user.role === 'admin')
          if (adminUser) {
            const userWithoutPassword = { ...adminUser }
            delete userWithoutPassword.password
            this.user = userWithoutPassword
          }
        } else {
          // Find a regular user (first one)
          const regularUser = this.mockUsers.find((user) => user.role === 'user')
          if (regularUser) {
            const userWithoutPassword = { ...regularUser }
            delete userWithoutPassword.password
            this.user = userWithoutPassword
          }
        }

        this.isAuthenticated = true
        this.token = storedToken
        return true
      }

      return false
    },

    updateUserProfile(updatedData) {
      if (!this.user) return

      // Update user data
      this.user = {
        ...this.user,
        ...updatedData,
      }
      return Promise.resolve(this.user)
    },
  },
})
