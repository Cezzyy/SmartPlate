export interface VehicleDocument {
  name: string
  size: number
}

export interface VehicleDocuments {
  csr: VehicleDocument | null
  salesInvoice: VehicleDocument | null
  insurance: VehicleDocument | null
  orCr: VehicleDocument | null
  deedOfSale: VehicleDocument | null
  pnpHpgClearance: VehicleDocument | null
}

export interface DocumentErrors {
  csr: string
  salesInvoice: string
  insurance: string
  orCr: string
  deedOfSale: string
  pnpHpgClearance: string
}

export interface VehicleRegistrationErrors {
  vehicleType: string
  make: string
  model: string
  year: string
  engineNumber: string
  chassisNumber: string
  color: string
  documents: DocumentErrors
  referenceSlip: string
  ownershipDocument: string
  insuranceDocument: string
  emissionTest: string
  vehicleInspection: string
  submission: string
}

// Additional vehicle data collected during inspection
export interface AdditionalVehicleData {
  mvFileNumber: string
  conductionSticker: string
  vehicleSeries: string
  bodyType: string
  pistonDisplacement: number
  numberOfCylinders: number
  fuelType: string
  gvw: number
  netWeight: number
  shippingWeight: number
  usageClassification: string
  firstRegistrationDate: string
  ltoOfficeCode: string
  classification: string
  denomination: string
  orNumber: string
  orDate: string
}

// Payment details for registration
export interface PaymentDetails {
  amountPaid: number
  paymentDate: string
  paymentMethod: string
  receiptNumber: string
}

export interface VehicleRegistrationForm {
  id: string
  userId: string
  vehicleId?: string
  plateId?: string
  isNewVehicle: boolean
  vehicleType: string
  make: string
  model: string
  year: string
  engineNumber: string
  chassisNumber: string
  color: string
  documents: VehicleDocuments
  appointmentDate: string | null
  appointmentTime: string | null
  referenceCode: string
  inspectionStatus: RegistrationStatus
  inspectionCode: string
  inspectionNotes?: string
  additionalVehicleData?: AdditionalVehicleData
  paymentStatus: RegistrationStatus
  paymentCode: string
  paymentNotes?: string
  paymentDetails?: PaymentDetails
  verificationStatus: RegistrationStatus
  status: RegistrationStatus
  submissionDate: string
  expiryDate?: string
  plateNumber?: string
  plateType?: string
  plateIssueDate?: string
  plateExpirationDate?: string
  plateIssuanceNotes?: string
  plateRegion?: string
  registrationType: 'New Vehicle' | 'Renewal'
  applicantName?: string
  applicantEmail?: string
  applicantPhone?: string
  ownershipDocument: File | null
  insuranceDocument: File | null
  emissionTest: File | null
  vehicleInspection: File | null
  referenceNumber: string
}

export interface VehicleRegistrationState {
  hasUnsavedChanges: boolean
  forms: VehicleRegistrationForm[]
  formData: VehicleRegistrationForm
  errors: VehicleRegistrationErrors
  isSubmitting: boolean
  currentStep: number
}

export type RegistrationStatus = 'pending' | 'approved' | 'rejected' | 'payment_completed' | 'completed'

export interface RegistrationStatusMessages {
  pending: string
  approved: string
  rejected: string
  payment_completed?: string
  completed?: string
}

export const registrationStatusMessages: RegistrationStatusMessages = {
  pending: 'Waiting for LTO officer approval',
  approved: 'Registration approved by LTO officer',
  rejected: 'Registration rejected by LTO officer',
  payment_completed: 'Payment completed, awaiting plate issuance',
  completed: 'Registration process completed',
} as const

// Inspection model for API
export interface RegistrationInspection {
  inspectionID: string
  registrationFormID: string
  inspectorID: string
  inspectionDate: string
  status: RegistrationStatus
  notes: string
  vehicle_condition: string
  emission_test_passed: boolean
  created_at?: string
  updated_at?: string
}

// Payment model for API
export interface RegistrationPayment {
  paymentID: string
  registrationFormID: string
  amount: number
  paymentMethod: string
  paymentDate: string
  status: RegistrationStatus
  receiptNumber: string
  transactionID: string
  notes: string
  created_at?: string
  updated_at?: string
}
