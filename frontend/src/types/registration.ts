export interface Registration {
  id: string
  referenceCode: string
  vehicleInfo: string
  plateNumber: string
  registrationType: string
  submissionDate: string
  expiryDate: string
  status: string
  applicantName: string
  applicantEmail: string
  applicantPhone: string
  make: string
  model: string
  year: string
  color: string
  engineNumber: string
  chassisNumber: string
  vehicleType: string
  inspectionStatus: string
  paymentStatus: string
  verificationStatus: string
  appointmentDate?: string
  appointmentTime?: string
}
