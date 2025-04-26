export interface User {
  ltoClientId: string
  lastName: string
  firstName: string
  middleName: string
  role: 'user' | 'admin' | 'LTO Officer'
  password?: string
  status: 'active' | 'inactive' | 'pending'
  email: string
  telephoneNumber?: string
  intAreaCode?: string
  mobileNumber?: string
  nationality?: string
  civilStatus?: string
  dateOfBirth?: string
  placeOfBirth?: string
  educationalAttainment?: string
  tin?: string
  gender?: string
  bloodType?: string
  complexion?: string
  bodyType?: string
  eyeColor?: string
  hairColor?: string
  weight?: number
  height?: number
  organDonor?: boolean
  emergencyContactName?: string
  emergencyContactNumber?: string
  emergencyContactAddress?: string
  employerName?: string
  employerAddress?: string
  motherLastName?: string
  motherFirstName?: string
  motherMiddleName?: string
  fatherLastName?: string
  fatherFirstName?: string
  fatherMiddleName?: string
  houseNo?: string
  street?: string
  province?: string
  city?: string
  barangay?: string
  zipCode?: string
  avatar?: string
}

export interface UserState {
  currentUser: User | null
  users: User[]
  isAuthenticated: boolean
  token: string | null
  loading: boolean
  error: string | null
  isRegistering: boolean
  registrationData: Partial<User> | null
  registrationCompleted: boolean
  currentStep: number
  formDirty: boolean
}
