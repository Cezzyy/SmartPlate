package models

import (
	"time"
)

type User struct {
	USER_ID             int                 `json:"user_id" db:"user_id"`
	LAST_NAME           string              `json:"last_name" db:"last_name"`
	FIRST_NAME          string              `json:"first_name" db:"first_name"`
	MIDDLE_NAME         string              `json:"middle_name,omitempty" db:"middle_name"`
	EMAIL               string              `json:"email" db:"email"`
	PASSWORD            string              `json:"password" db:"password" binding:"required"`
	ROLE                string              `json:"role" db:"role"`
	STATUS              string              `json:"status" db:"status"`
	LTO_CLIENT_ID       string              `json:"lto_client_id" db:"lto_client_id"`
	CREATED             time.Time           `json:"-" db:"created"`
	UPDATED             time.Time           `json:"-" db:"updated"`
	Contact             Contact             `json:"contact" db:"contact"`
	Address             Address             `json:"address" db:"address"`
	MedicalInformation  MedicalInformation  `json:"medical_information" db:"medical_information"`
	People              People              `json:"people" db:"people"`
	PersonalInformation PersonalInformation `json:"personal_information" db:"personal_information"`
}

type Contact struct {
	CONTACT_ID                     *int    `json:"contact_id,omitempty" db:"contact_id"`
	LTO_CLIENT_ID                  *string `json:"lto_client_id,omitempty" db:"lto_client_id"`
	TELEPHONE_NUMBER               *string `json:"telephone_number,omitempty" db:"telephone_number"`
	INT_AREA_CODE                  *string `json:"int_area_code,omitempty" db:"int_area_code"`
	MOBILE_NUMBER                  *string `json:"mobile_number,omitempty" db:"mobile_number"`
	EMERGENCY_CONTACT_NUMBER       *string `json:"emergency_contact_number,omitempty" db:"emergency_contact_number"`
	EMERGENCY_CONTACT_NAME         *string `json:"emergency_contact_name,omitempty" db:"emergency_contact_name"`
	EMERGENCY_CONTACT_RELATIONSHIP *string `json:"emergency_contact_relationship,omitempty" db:"emergency_contact_relationship"`
	EMERGENCY_CONTACT_ADDRESS      *string `json:"emergency_contact_address,omitempty" db:"emergency_contact_address"`
}
type Address struct {
	ADDRESS_ID        *int    `json:"address_id,omitempty" db:"address_id"`
	HOUSE_NO          *string `json:"house_no,omitempty" db:"house_no"`
	STREET            *string `json:"street,omitempty" db:"street"`
	PROVINCE          *string `json:"province,omitempty" db:"province"`
	CITY_MUNICIPALITY *string `json:"city_municipality,omitempty" db:"city_municipality"`
	BARANGAY          *string `json:"barangay,omitempty" db:"barangay"`
	ZIP_CODE          *string `json:"zip_code,omitempty" db:"zip_code"`
	LTO_CLIENT_ID     *string `json:"lto_client_id,omitempty" db:"lto_client_id"`
}

type MedicalInformation struct {
	MEDICAL_ID    *int    `json:"medical_id" db:"medical_id"`
	GENDER        *string `json:"gender" db:"gender"`
	BLOOD_TYPE    *string `json:"blood_type" db:"blood_type"`
	COMPLEXION    *string `json:"complexion" db:"complexion"`
	EYE_COLOR     *string `json:"eye_color" db:"eye_color"`
	HAIR_COLOR    *string `json:"hair_color" db:"hair_color"`
	WEIGHT        *int    `json:"weight" db:"weight"`
	HEIGHT        *int    `json:"height" db:"height"`
	ORGAN_DONOR   *bool   `json:"organ_donor" db:"organ_donor"`
	LTO_CLIENT_ID *string `json:"lto_client_id" db:"lto_client_id"`
}

type People struct {
	PEOPLE_ID          *int    `json:"people_id" db:"people_id"`
	EMPLOYER_NAME      *string `json:"employer_name" db:"employer_name"`
	EMPLOYER_ADDRESS   *string `json:"employer_address" db:"employer_address"`
	MOTHER_FIRST_NAME  *string `json:"mother_first_name" db:"mother_first_name"`
	MOTHER_MAIDEN_NAME *string `json:"mother_maiden_name" db:"mother_maiden_name"`
	MOTHER_MIDDLE_NAME *string `json:"mother_middle_name" db:"mother_middle_name"`
	FATHER_FIRST_NAME  *string `json:"father_first_name" db:"father_first_name"`
	FATHER_MIDDLE_NAME *string `json:"father_middle_name" db:"father_middle_name"`
	FATHER_LAST_NAME   *string `json:"father_last_name" db:"father_last_name"`
	ADDRESS            *string `json:"address" db:"address"`
	LTO_CLIENT_ID      *string `json:"lto_client_id" db:"lto_client_id"`
}

type PersonalInformation struct {
	PERSONAL_ID            *int    `json:"personal_id" db:"personal_id"`
	NATIONALITY            *string `json:"nationality" db:"nationality"`
	CIVIL_STATUS           *string `json:"civil_status" db:"civil_status"`
	DATE_OF_BIRTH          *string `json:"date_of_birth" db:"date_of_birth"`
	PLACE_OF_BIRTH         *string `json:"place_of_birth" db:"place_of_birth"`
	EDUCATIONAL_ATTAINMENT *string `json:"educational_attainment" db:"educational_attainment"`
	TIN                    *string `json:"tin" db:"tin"`
	LTO_CLIENT_ID          *string `json:"lto_client_id" db:"lto_client_id"`
}
