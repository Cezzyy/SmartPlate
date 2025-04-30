import {
  VehicleRegistrationForm,
  VehicleRegistrationErrors,
  RegistrationStatus as RegStatus,
  VehicleDocuments
} from './vehicleRegistration'

export interface VehicleRegistrationState {
  hasUnsavedChanges: boolean
  forms: VehicleRegistrationForm[]
  formData: VehicleRegistrationForm
  errors: VehicleRegistrationErrors
  isSubmitting: boolean
  currentStep: number
  isLoading: boolean
  error: string | null
}
