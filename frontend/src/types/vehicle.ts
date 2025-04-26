export interface Vehicle {
  id: number
  ownerId: string
  vehicleCategory: string
  mvFileNumber: string
  conductionSticker: string
  vehicleMake: string
  vehicleSeries: string
  vehicleType: string
  bodyType: string
  yearModel: number
  engineNumber: string
  chassisNumber: string
  pistonDisplacement: number
  numberOfCylinders: number
  fuelType: string
  color: string
  gvw: number
  netWeight: number
  shippingWeight: number
  usageClassification: string
  firstRegistrationDate: string
  lastRenewalDate: string
  registrationExpiryDate: string
  ltoOfficeCode: string
  classification: string
  denomination: string
  orNumber: string
  orDate: string
}

export interface Plate extends Vehicle {
  plateId: number
  vehicleId: number
  plate_number: string
  plate_type: string
  plate_issue_date: string
  plate_expiration_date: string
  status: string
  region?: string
}

export interface Registration {
  id: number
  vehicleId: number
  plateId: number
  registrationType: string
  submissionDate: string
  expiryDate: string
  status: string
  documents: string[]
  fees: {
    registrationFee: number
    plateIssuanceFee?: number
    computerFee: number
    total: number
  }
}

export interface VehicleRegistrationState {
  vehicles: Vehicle[]
  plates: Plate[]
  loading: boolean
  error: string | null
}
