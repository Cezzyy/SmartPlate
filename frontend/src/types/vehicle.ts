export interface Vehicle {
  VEHICLE_ID: string
  VEHICLE_CATEGORY: string
  MV_FILE_NUMBER: string
  VEHICLE_MAKE: string
  VEHICLE_SERIES: string
  VEHICLE_TYPE: string
  BODY_TYPE: string
  YEAR_MODEL: string
  ENGINE_MODEL: string
  ENGINE_NUMBER: string
  CHASSIS_NUMBER: string
  PISTON_DISPLACEMENT: string
  NUMBER_OF_CYLINDERS: string
  FUEL_TYPE: string
  COLOR: string
  GVW: string
  NET_WEIGHT: string
  SHIPPING_WEIGHT: string
  USAGE_CLASSIFICATION: string
  FIRST_REGISTRATION_DATE: string
  LATE_RENEWAL_DATE: string
  REGISTRATION_EXPIRY_DATE: string
  LTO_OFFICE_CODE: string
  CLASSIFICATION: string
  DENOMINATION: string
  OR_NUMBER: string
  CR_NUMBER: string
  LTO_CLIENT_ID: string
}

export interface Plate {
  plate_id: string
  vehicle_id: string
  plate_number: string
  plate_type: string
  plate_issue_date: string | null
  plate_expiration_date: string | null
  status: string
}

export interface Registration {
  RegistrationFormID: string
  LTOClientID: string
  VehicleID: string
  SubmittedDate: string
  Status: string
  Region: string
  RegistrationType: string
  ExpiryDate?: string
}

export interface VehicleRegistrationState {
  vehicles: Vehicle[]
  plates: Plate[]
  loading: boolean
  error: string | null
}
