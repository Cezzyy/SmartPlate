import { defineStore } from 'pinia'
import router from '@/router/index'
import type { User, UserState } from '@/types/user'

// Mock users data
const mockUsersData: User[] = [
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
    weight: 70,
    height: 175,
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
    ltoClientId: 'LTO-OFFICER-001',
    lastName: 'OFFICER',
    firstName: 'TESTER',
    middleName: '',
    role: 'LTO Officer',
    email: 'adminofficer@smartplate.com',
    password: 'officer123',
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
  persist: true,
  state: (): UserState => ({
    currentUser: null,
    users: mockUsersData,
    isAuthenticated: false,
    token: localStorage.getItem('token') || null,
    loading: false,
    error: null,
    isRegistering: false,
    registrationData: null,
    registrationCompleted: false,
    currentStep: 1,
    formDirty: false,
  }),

  getters: {
    fullName: (state): string => {
      if (!state.currentUser) return ''
      return `${state.currentUser.firstName} ${state.currentUser.middleName ? state.currentUser.middleName + ' ' : ''}${state.currentUser.lastName}`
    },

    userRole: (state): string => state.currentUser?.role || 'guest',

    isAdmin: (state): boolean => state.currentUser?.role === 'admin',
  },

  actions: {
    checkAuth(): boolean {
      const token = localStorage.getItem('token')
      console.log('Checking authentication with token:', token)

      if (token) {
        const tokenPrefix = token.startsWith('admin_') ? 'admin_' : 'user_'
        // Get userId from localStorage as a backup to ensure proper user identification
        const userId = localStorage.getItem('userId')
        console.log('Found userId in localStorage:', userId)

        // First try to find the user by userId (more specific)
        let user = userId ? this.users.find((u) => u.ltoClientId === userId) : null

        // If not found by userId, fall back to role-based search
        if (!user) {
          console.log('User not found by userId, searching by role with token prefix:', tokenPrefix)
          user = this.users.find((u) => {
            if (tokenPrefix === 'admin_') {
              // Ensure we match the exact role - either 'admin' OR 'LTO Officer'
              return u.role === 'admin' || u.role === 'LTO Officer'
            }
            return u.role === 'user'
          })
        }

        if (user) {
          console.log('Found user:', user.ltoClientId, 'with role:', user.role)
          const userWithoutPassword = { ...user }
          delete userWithoutPassword.password
          this.currentUser = userWithoutPassword
          this.isAuthenticated = true
          this.token = token

          // Ensure userId is set in localStorage when session is restored
          console.log('Restoring userId in localStorage:', user.ltoClientId)
          localStorage.setItem('userId', user.ltoClientId)

          return true
        } else {
          console.warn('No matching user found for token')
        }
      } else {
        console.warn('No token found in localStorage')
      }
      return false
    },
    async login(email: string, password: string, isAdminLogin: boolean = false): Promise<User> {
      this.loading = true
      this.error = null

      try {
        // Find user with matching email and password
        const foundUser = this.users.find((user) => {
          // For admin login, only match admin users
          if (isAdminLogin) {
            return (
              (user.role === 'admin' || user.role === 'LTO Officer') &&
              user.email === email &&
              user.password === password
            )
          }
          // For regular login, only match non-admin users
          return user.role === 'user' && user.email === email && user.password === password
        })

        if (foundUser) {
          // Set user data (without the password)
          const userWithoutPassword: User = { ...foundUser }
          delete userWithoutPassword.password
          this.currentUser = userWithoutPassword
          this.isAuthenticated = true

          // Generate token and store it
          const tokenPrefix = foundUser.role === 'user' ? 'user_' : 'admin_'
          const fakeToken = tokenPrefix + Math.random().toString(36).substring(2)
          this.token = fakeToken
          localStorage.setItem('token', fakeToken)

          // Store user ID in localStorage for form association
          localStorage.setItem('userId', foundUser.ltoClientId)
          console.log('Setting userId in localStorage on login:', foundUser.ltoClientId)

          this.loading = false
          return this.currentUser
        } else {
          this.error = 'Invalid email or password'
          this.loading = false
          throw new Error('Invalid email or password')
        }
      } catch (err) {
        this.loading = false
        this.error = err instanceof Error ? err.message : 'An error occurred during login'
        throw err
      }
    },

    startRegistration(initialData?: Partial<User>): void {
      this.isRegistering = true
      this.registrationData = initialData || {}
      this.registrationCompleted = false
      this.currentStep = 1
      this.formDirty = false
    },

    cancelRegistration(): void {
      this.isRegistering = false
      this.registrationData = null
      this.registrationCompleted = false
      this.currentStep = 1
      this.formDirty = false
    },

    setFormDirty(isDirty: boolean): void {
      this.formDirty = isDirty
    },

    updateCurrentStep(step: number): void {
      this.currentStep = step
      this.formDirty = true
    },

    async register(userData: Partial<User>): Promise<User> {
      this.loading = true
      this.error = null

      try {
        const newUser: User = {
          ...userData,
          role: 'user',
          status: 'active',
          ltoClientId: `LTO-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`,
        } as User

        // Add the new user to users array
        const password = this.registrationData?.password || 'defaultpassword'
        this.users.push({
          ...newUser,
          password,
        })

        // Set user data (without the password)
        const userWithoutPassword: User = { ...newUser }
        delete userWithoutPassword.password
        this.currentUser = userWithoutPassword
        this.isAuthenticated = true

        // Generate a fake token and store it
        const fakeToken = 'user_' + Math.random().toString(36).substring(2)
        this.token = fakeToken
        localStorage.setItem('token', fakeToken)

        // Clear registration state and set completion flag
        this.isRegistering = false
        this.registrationData = null
        this.registrationCompleted = true
        this.formDirty = false

        this.loading = false
        return this.currentUser
      } catch (err) {
        this.loading = false
        this.error = err instanceof Error ? err.message : 'An error occurred during registration'
        throw err
      }
    },

    logout(): void {
      // Save the current userId to log it
      const userId = this.currentUser?.ltoClientId

      // Clear the current user and auth state
      this.currentUser = null
      this.isAuthenticated = false
      this.token = null

      // Remove auth tokens
      localStorage.removeItem('token')
      console.log('Logging out user:', userId)

      // IMPORTANT: Remove userId from localStorage
      // This prevents forms from one account being shown in another
      localStorage.removeItem('userId')
      console.log('Removed userId from localStorage')

      // Navigate to login page
      router.push('/login')
    },
    async updateUserProfile(updatedData: Partial<User>): Promise<User | null> {
      if (!this.currentUser) return null

      this.currentUser = {
        ...this.currentUser,
        ...updatedData,
      }
      return Promise.resolve(this.currentUser)
    },

    // New action for updating any user (not just current user)
    async updateUser(userId: string, updatedData: Partial<User>): Promise<User | null> {
      try {
        // Find the user to update
        const userIndex = this.users.findIndex((u) => u.ltoClientId === userId)

        if (userIndex === -1) {
          throw new Error(`User with ID ${userId} not found`)
        }

        // In a real app, this would call an API
        // For example:
        // const response = await api.put(`/users/${userId}`, updatedData)

        // For demo purposes, we'll update the local store
        const updatedUser = {
          ...this.users[userIndex],
          ...updatedData,
        }

        // Update the user in the store
        this.users[userIndex] = updatedUser

        // If the updated user is the currently logged in user, update currentUser also
        if (this.currentUser && this.currentUser.ltoClientId === userId) {
          this.currentUser = {
            ...this.currentUser,
            ...updatedData,
          }
        }

        return updatedUser
      } catch (error) {
        console.error('Error updating user:', error)
        throw error
      }
    },
  },
})
