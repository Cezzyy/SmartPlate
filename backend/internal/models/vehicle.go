package models

import (
	"encoding/json"
	"time"
)

const dateLayout = "2006-01-02"

type Vehicle struct {
	VEHICLE_ID               string  `json:"vehicle_id,omitempty" db:"vehicle_id"`
	VEHICLE_CATEGORY         string           `json:"vehicle_category" db:"vehicle_category"`
	MV_FILE_NUMBER           string           `json:"mv_file_number" db:"mv_file_number"`
	VEHICLE_MAKE             string           `json:"vehicle_make" db:"vehicle_make"`
	VEHICLE_SERIES           string           `json:"vehicle_series" db:"vehicle_series"`
	VEHICLE_TYPE             string           `json:"vehicle_type" db:"vehicle_type"`
	BODY_TYPE                string           `json:"body_type" db:"body_type"`
	YEAR_MODEL               string           `json:"year_model" db:"year_model"`
	ENGINE_MODEL             string           `json:"engine_model" db:"engine_model"`
	ENGINE_NUMBER            string           `json:"engine_number" db:"engine_number"`
	CHASSIS_NUMBER           string           `json:"chassis_number" db:"chassis_number"`
	PISTON_DISPLACEMENT      string           `json:"piston_displacement" db:"piston_displacement"`
	NUMBER_OF_CYLINDERS      string           `json:"number_of_cylinders" db:"number_of_cylinders"`
	FUEL_TYPE                string           `json:"fuel_type" db:"fuel_type"`
	COLOR                    string           `json:"color" db:"color"`
	GVW                      string           `json:"gvw" db:"gvw"`
	NET_WEIGHT               string           `json:"net_weight" db:"net_weight"`
	SHIPPING_WEIGHT          string           `json:"shipping_weight" db:"shipping_weight"`
	USAGE_CLASSIFICATION     string           `json:"usage_classification" db:"usage_classification"`
	FIRST_REGISTRATION_DATE  string           `json:"first_registration_date" db:"first_registration_date"`
	LATE_RENEWAL_DATE        string           `json:"late_renewal_date" db:"late_renewal_date"`
	REGISTRATION_EXPIRY_DATE string           `json:"registration_expiry_date" db:"registration_expiry_date"`
	LTO_OFFICE_CODE          string           `json:"lto_office_code" db:"lto_office_code"`
	CLASSIFICATION           string           `json:"classification" db:"classification"`
	DENOMINATION             string           `json:"denomination" db:"denomination"`
	OR_NUMBER                string           `json:"or_number" db:"or_number"`
	CR_NUMBER                string           `json:"cr_number" db:"cr_number"`
	LTO_CLIENT_ID            string           `json:"lto_client_id,omitempty" db:"lto_client_id"`
}


type Plate struct {
    PlateID             string       `json:"plate_id"            db:"plate_id"`
    VEHICLE_ID          string    `json:"vehicle_id"          db:"vehicle_id"`          // now a UUID
    PLATE_NUMBER        string    `json:"plate_number"        db:"plate_number"`
    PLATE_TYPE          string    `json:"plate_type"          db:"plate_type"`
    PLATE_ISSUE_DATE    time.Time `json:"plate_issue_date"    db:"plate_issue_date"`
    PLATE_EXPIRATION_DATE time.Time `json:"plate_expiration_date" db:"plate_expiration_date"`
    STATUS              string    `json:"status"              db:"status"`
}

type RegistrationForm struct {
    RegistrationFormID string    `db:"registration_form_id" json:"registration_form_id"`
    LTOClientID        string    `db:"lto_client_id"         json:"lto_client_id"`
    VehicleID          string    `db:"vehicle_id"            json:"vehicle_id"`
    SubmittedDate      time.Time `db:"submitted_date"        json:"submitted_date"`
    Status             string    `db:"status"                json:"status"`
    Region             string    `db:"region"               json:"region"`
    RegistrationType   string    `db:"registration_type"     json:"registration_type"`
}
type RegistrationInspection struct {
    InspectionID        string    `db:"inspection_id"         json:"inspection_id"`
    RegistrationFormID  string    `db:"registration_form_id"  json:"registration_form_id"`
    InspectionStatus    string    `db:"inspection_status"     json:"inspection_status"`
    InspectionCode      string    `db:"inspection_code"       json:"inspection_code"`
    InspectionNotes     string    `db:"inspection_notes"      json:"inspection_notes"`
    InspectedAt         time.Time `db:"inspected_at"          json:"inspected_at"`
}

type RegistrationPayment struct {
    PaymentID           string          `db:"payment_id"            json:"payment_id"`
    RegistrationFormID  string          `db:"registration_form_id"  json:"registration_form_id"`
    PaymentStatus       string          `db:"payment_status"        json:"payment_status"`
    PaymentCode         string          `db:"payment_code"          json:"payment_code"`
    AmountPaid          *float64        `db:"amount_paid"           json:"amount_paid,omitempty"`
    PaymentMethod       *string         `db:"payment_method"        json:"payment_method,omitempty"`
    PaymentDate         *time.Time      `db:"payment_date"          json:"payment_date,omitempty"`
    PaymentNotes        *string         `db:"payment_notes"         json:"payment_notes,omitempty"`
    PaymentDetails      json.RawMessage `db:"payment_details"       json:"payment_details,omitempty"`
}


type RegistrationDocument struct {
    DocumentID           string    `db:"document_id"           json:"document_id"`
    RegistrationFormID   string    `db:"registration_form_id"  json:"registration_form_id"`
    DocType              string    `db:"doc_type"              json:"doc_type"`
    Filename             string    `db:"filename"              json:"filename"`
    FileSize             int       `db:"file_size"             json:"file_size"`
    UploadedAt           time.Time `db:"uploaded_at"           json:"uploaded_at"`
}

type CreateRegistrationFormParams struct {
    LTOClientID      string `json:"lto_client_id"      db:"lto_client_id"`
    VehicleID        string `json:"vehicle_id"         db:"vehicle_id"`
    Status           string `json:"status"             db:"status"`
    Region           string    `json:"region"         db:"region"`
    RegistrationType string `json:"registration_type"  db:"registration_type"`
}

type UpdateRegistrationFormParams struct {
    Status string `json:"status" db:"status"`
}