package repository

import (
	"fmt"
	"smartplate-api/internal/models"

	"github.com/jmoiron/sqlx"
)

type UserRepository  struct{
	db *sqlx.DB
}

func NewUserRepository(db *sqlx.DB) *UserRepository {
	return &UserRepository{db: db}
}

//create a new user
func (r *UserRepository) Create(user *models.User) error {
    tx := r.db.MustBegin()

    // Insert user with explicit parameter binding
    err := tx.QueryRow(`
        INSERT INTO users (
            last_name, first_name, middle_name, email, 
            password, role, status, lto_client_id
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING user_id, created, updated
    `,
    user.LAST_NAME,
    user.FIRST_NAME,
    user.MIDDLE_NAME,
    user.EMAIL,
    user.PASSWORD,
    user.ROLE,
    user.STATUS,
    user.LTO_CLIENT_ID,
    ).Scan(&user.USER_ID, &user.CREATED, &user.UPDATED)
    
    if err != nil {
        tx.Rollback()
        return fmt.Errorf("user insertion failed: %w", err)
    }

    // Insert contact with proper null handling
    _, err = tx.NamedExec(`
        INSERT INTO contacts (
            lto_client_id, telephone_number, mobile_number,
            emergency_contact_number, emergency_contact_name,
            emergency_contact_relationship, emergency_contact_address
        ) VALUES (
            :lto_client_id, :telephone_number, :mobile_number,
            :emergency_contact_number, :emergency_contact_name,
            :emergency_contact_relationship, :emergency_contact_address
        )`,
        map[string]interface{}{
            "lto_client_id":                  user.LTO_CLIENT_ID,
            "telephone_number":               toNullString(user.Contact.TELEPHONE_NUMBER),
            "mobile_number":                 toNullString(user.Contact.MOBILE_NUMBER),
            "emergency_contact_number":      toNullString(user.Contact.EMERGENCY_CONTACT_NUMBER),
            "emergency_contact_name":        toNullString(user.Contact.EMERGENCY_CONTACT_NAME),
            "emergency_contact_relationship": toNullString(user.Contact.EMERGENCY_CONTACT_RELATIONSHIP),
            "emergency_contact_address":     toNullString(user.Contact.EMERGENCY_CONTACT_ADDRESS),
        })
        if err != nil {
            tx.Rollback()
            return fmt.Errorf("contacts insertion failed: %w", err)
        }
     // address
     _, err = tx.NamedExec(`
     INSERT INTO addresses (
         lto_client_id, house_no, street, province, 
         city_municipality, barangay, zip_code
     ) VALUES (
         :lto_client_id, :house_no, :street, :province, 
         :city_municipality, :barangay, :zip_code
     )`,
     map[string]interface{}{
         "lto_client_id":      user.LTO_CLIENT_ID,
         "house_no":          toNullString(user.Address.HOUSE_NO),
         "street":            toNullString(user.Address.STREET),
         "province":          toNullString(user.Address.PROVINCE),
         "city_municipality": toNullString(user.Address.CITY_MUNICIPALITY),
         "barangay":          toNullString(user.Address.BARANGAY),
         "zip_code":          toNullString(user.Address.ZIP_CODE),
     })
     if err != nil {
        tx.Rollback()
        return fmt.Errorf("address insertion failed: %w", err)
    }
     //medical informatio
    _, err = tx.NamedExec(`
    INSERT INTO medical_information(
        lto_client_id, gender, blood_type, complexion, eye_color, hair_color, weight, height, organ_donor)
        VALUES(:lto_client_id, :gender, :blood_type, :complexion, :eye_color, :hair_color, :weight, :height, :organ_donor

    )`,
    map[string]interface{}{
        "lto_client_id": user.LTO_CLIENT_ID,
        "gender": toNullString(user.MedicalInformation.GENDER),
        "blood_type": toNullString(user.MedicalInformation.BLOOD_TYPE),
        "complexion": toNullString(user.MedicalInformation.COMPLEXION),
        "eye_color": toNullString(user.MedicalInformation.EYE_COLOR),
        "hair_color": toNullString(user.MedicalInformation.HAIR_COLOR),
        "weight":       user.MedicalInformation.WEIGHT,
        "height":       user.MedicalInformation.HEIGHT,
        "organ_donor":  user.MedicalInformation.ORGAN_DONOR, 
    })
    if err != nil {
        tx.Rollback()
        return fmt.Errorf("contact insertion failed: %w", err)
    }
    //people
    _, err = tx.NamedExec(`
    INSERT INTO people (
        employer_name, employer_address, mother_first_name, 
        mother_maiden_name, mother_middle_name, father_first_name, 
        father_middle_name, father_last_name, address, lto_client_id
    ) VALUES (
        :employer_name, :employer_address, :mother_first_name, 
        :mother_maiden_name, :mother_middle_name, :father_first_name, 
        :father_middle_name, :father_last_name, :address, :lto_client_id
    )`,
    map[string]interface{}{
        "employer_name":        user.People.EMPLOYER_NAME,
        "employer_address":     user.People.EMPLOYER_ADDRESS,
        "mother_first_name":    user.People.MOTHER_FIRST_NAME,
        "mother_maiden_name":    user.People.MOTHER_MAIDEN_NAME,
        "mother_middle_name":   user.People.MOTHER_MIDDLE_NAME,
        "father_first_name":    user.People.FATHER_FIRST_NAME,
        "father_middle_name":   user.People.FATHER_MIDDLE_NAME,
        "father_last_name":     user.People.FATHER_LAST_NAME,
        "address":              user.People.ADDRESS,
        "lto_client_id":        user.LTO_CLIENT_ID,
    })
    if err != nil {
        tx.Rollback()
        return fmt.Errorf("people insertion failed: %w", err)
    }
    //personal information
    _, err = tx.NamedExec(
        `INSERT INTO personal_information (
        nationality, civil_status, date_of_birth, place_of_birth, educational_attainment,
        tin, lto_client_id
        )VALUES (
        :nationality, :civil_status, :date_of_birth, :place_of_birth, :educational_attainment,
        :tin, :lto_client_id
        )`,
        map[string] interface{}{
            "nationality": user.PersonalInformation.NATIONALITY,
            "civil_status": user.PersonalInformation.CIVIL_STATUS,
            "date_of_birth": user.PersonalInformation.DATE_OF_BIRTH,
            "place_of_birth": user.PersonalInformation.PLACE_OF_BIRTH,
            "educational_attainment": user.PersonalInformation.EDUCATIONAL_ATTAINMENT,
            "tin": user.PersonalInformation.TIN,
            "lto_client_id": user.LTO_CLIENT_ID,
        })
        if err != nil{
            tx.Rollback()
            return fmt.Errorf("personal information insertion failed: %w", err)
        }

    return tx.Commit()
}

// Helper function to handle null strings
func toNullString(s *string) interface{} {
    if s == nil || *s == "" {
        return nil
    }
    return *s
}


func (r *UserRepository) GetAll() ([]models.User, error) {
    const query = `
    SELECT 
        u.*,
        c.contact_id AS "contact.contact_id",
        c.lto_client_id AS "contact.lto_client_id",
        c.telephone_number AS "contact.telephone_number",
        c.int_area_code AS "contact.int_area_code",
        c.mobile_number AS "contact.mobile_number",
        c.emergency_contact_number AS "contact.emergency_contact_number",
        c.emergency_contact_name AS "contact.emergency_contact_name",
        c.emergency_contact_relationship AS "contact.emergency_contact_relationship",
        c.emergency_contact_address AS "contact.emergency_contact_address",
        a.address_id AS "address.address_id",
        a.house_no AS "address.house_no",
        a.street AS "address.street",
        a.province AS "address.province",
        a.city_municipality AS "address.city_municipality",
        a.barangay AS "address.barangay",
        a.zip_code AS "address.zip_code",
        a.lto_client_id AS "address.lto_client_id",
        m.medical_id AS "medical_information.medical_id",
        m.lto_client_id AS "medical_information.lto_client_id",
        m.gender AS "medical_information.gender",
        m.blood_type AS "medical_information.blood_type",
        m.complexion AS "medical_information.complexion",
        m.eye_color AS "medical_information.eye_color",
        m.hair_color AS "medical_information.hair_color",
        m.weight AS "medical_information.weight",
        m.height AS "medical_information.height",
        m.organ_donor AS "medical_information.organ_donor", -- Comma added here
        p.people_id AS "people.people_id",
        p.employer_name AS "people.employer_name",
        p.employer_address AS "people.employer_address",
        p.mother_first_name AS "people.mother_first_name",
        p.mother_maiden_name AS "people.mother_maiden_name",
        p.mother_middle_name AS "people.mother_middle_name",
        p.father_first_name AS "people.father_first_name",
        p.father_middle_name AS "people.father_middle_name",
        p.father_last_name AS "people.father_last_name",
        p.address AS "people.address",
        p.lto_client_id AS "people.lto_client_id",
        pi.personal_id AS "personal_information.personal_id",
        pi.nationality AS "personal_information.nationality",
        pi.civil_status AS "personal_information.civil_status",
        pi.date_of_birth AS "personal_information.date_of_birth",
        pi.place_of_birth AS "personal_information.place_of_birth",
        pi.educational_attainment AS "personal_information.educational_attainment",
        pi.tin AS "personal_information.tin",
        pi.lto_client_id AS "personal_information.lto_client_id"
    FROM users u
    LEFT JOIN contacts c ON u.lto_client_id = c.lto_client_id
    LEFT JOIN addresses a ON u.lto_client_id = a.lto_client_id
    LEFT JOIN medical_information m ON u.lto_client_id = m.lto_client_id
    LEFT JOIN people p ON u.lto_client_id = p.lto_client_id
    LEFT JOIN personal_information pi ON u.lto_client_id = pi.lto_client_id
    ORDER BY u.user_id
`
    var users []models.User
    err := r.db.Select(&users, query)
    return users, err
}

// GetByID
func (r *UserRepository) GetByID(user_id int) (models.User, error) {
    var user models.User
    query := `
    SELECT 
        u.*,
        c.contact_id AS "contact.contact_id",
        c.lto_client_id AS "contact.lto_client_id",
        c.telephone_number AS "contact.telephone_number",
        c.int_area_code AS "contact.int_area_code",
        c.mobile_number AS "contact.mobile_number",
        c.emergency_contact_number AS "contact.emergency_contact_number",
        c.emergency_contact_name AS "contact.emergency_contact_name",
        c.emergency_contact_relationship AS "contact.emergency_contact_relationship",
        c.emergency_contact_address AS "contact.emergency_contact_address",
        a.address_id AS "address.address_id",
        a.house_no AS "address.house_no",
        a.street AS "address.street",
        a.province AS "address.province",
        a.city_municipality AS "address.city_municipality",
        a.barangay AS "address.barangay",
        a.zip_code AS "address.zip_code",
        a.lto_client_id AS "address.lto_client_id",
        m.medical_id AS "medical_information.medical_id",
        m.gender AS "medical_information.gender",
        m.blood_type AS "medical_information.blood_type",
        m.complexion AS "medical_information.complexion",
        m.eye_color AS "medical_information.eye_color",
        m.hair_color AS "medical_information.hair_color",
        m.weight AS "medical_information.weight",
        m.height AS "medical_information.height",
        m.organ_donor AS "medical_information.organ_donor",
        p.people_id AS "people.people_id",
        p.employer_name AS "people.employer_name",
        p.employer_address AS "people.employer_address",
        p.mother_first_name AS "people.mother_first_name",
        p.mother_maiden_name AS "people.mother_maiden_name",
        p.mother_middle_name AS "people.mother_middle_name",
        p.father_first_name AS "people.father_first_name",
        p.father_middle_name AS "people.father_middle_name",
        p.father_last_name AS "people.father_last_name",
        p.address AS "people.address",
        p.lto_client_id AS "people.lto_client_id",  -- Comma added here
        pi.personal_id AS "personal_information.personal_id",
        pi.nationality AS "personal_information.nationality",
        pi.civil_status AS "personal_information.civil_status",
        pi.date_of_birth AS "personal_information.date_of_birth",
        pi.place_of_birth AS "personal_information.place_of_birth",
        pi.educational_attainment AS "personal_information.educational_attainment",
        pi.tin AS "personal_information.tin",
        pi.lto_client_id AS "personal_information.lto_client_id"
    FROM users u
    LEFT JOIN contacts c ON u.lto_client_id = c.lto_client_id
    LEFT JOIN addresses a ON u.lto_client_id = a.lto_client_id
    LEFT JOIN medical_information m ON u.lto_client_id = m.lto_client_id
    LEFT JOIN people p ON u.lto_client_id = p.lto_client_id
    LEFT JOIN personal_information pi ON u.lto_client_id = pi.lto_client_id
    WHERE u.user_id = $1
    
`
    err := r.db.Get(&user, query, user_id)
    return user, err
}

func (r *UserRepository) GetByLTOClientID(ltoClientID string) (models.User, error) {
    var user models.User
    fmt.Printf("Executing query with LTO ID: %s\n", ltoClientID)
    query := `
        SELECT 
            u.*,
            c.contact_id AS "contact.contact_id",
            c.lto_client_id AS "contact.lto_client_id",
            c.telephone_number AS "contact.telephone_number",
            c.int_area_code AS "contact.int_area_code",
            c.mobile_number AS "contact.mobile_number",
            c.emergency_contact_number AS "contact.emergency_contact_number",
            c.emergency_contact_name AS "contact.emergency_contact_name",
            c.emergency_contact_relationship AS "contact.emergency_contact_relationship",
            c.emergency_contact_address AS "contact.emergency_contact_address",
            a.address_id AS "address.address_id",
            a.house_no AS "address.house_no",
            a.street AS "address.street",
            a.province AS "address.province",
            a.city_municipality AS "address.city_municipality",
            a.barangay AS "address.barangay",
            a.zip_code AS "address.zip_code",
            a.lto_client_id AS "address.lto_client_id",
            m.medical_id AS "medical_information.medical_id",
            m.gender AS "medical_information.gender",
            m.blood_type AS "medical_information.blood_type",
            m.complexion AS "medical_information.complexion",
            m.eye_color AS "medical_information.eye_color",
            m.hair_color AS "medical_information.hair_color",
            m.weight AS "medical_information.weight",
            m.height AS "medical_information.height",
            m.organ_donor AS "medical_information.organ_donor",
            p.people_id AS "people.people_id",
            p.employer_name AS "people.employer_name",
        p.employer_address AS "people.employer_address",
        p.mother_first_name AS "people.mother_first_name",
        p.mother_maiden_name AS "people.mother_maiden_name",
        p.mother_middle_name AS "people.mother_middle_name",
        p.father_first_name AS "people.father_first_name",
        p.father_middle_name AS "people.father_middle_name",
        p.father_last_name AS "people.father_last_name",
        p.address AS "people.address",
        p.lto_client_id AS "people.lto_client_id",
        pi.personal_id AS "personal_information.personal_id",
        pi.nationality AS "personal_information.nationality",
        pi.civil_status AS "personal_information.civil_status",
        pi.date_of_birth AS "personal_information.date_of_birth",
        pi.place_of_birth AS "personal_information.place_of_birth",
        pi.educational_attainment AS "personal_information.educational_attainment",
        pi.tin AS "personal_information.tin",
        pi.lto_client_id AS "personal_information.lto_client_id"
        FROM users u
        LEFT JOIN contacts c ON u.lto_client_id = c.lto_client_id
        LEFT JOIN addresses a ON u.lto_client_id = a.lto_client_id
        LEFT JOIN medical_information m ON u.lto_client_id = m.lto_client_id
        LEFT JOIN people p ON u.lto_client_id = p.lto_client_id
        LEFT JOIN personal_information pi ON u.lto_client_id = pi.lto_client_id
        WHERE u.lto_client_id = $1
    `
    err := r.db.Get(&user, query, ltoClientID)
    return user, err
}
//get user by email.l
func (r *UserRepository) GetByEmail(email string) (models.User, error){
	var user models.User
	err := r.db.Get(&user, "SELECT * FROM users WHERE email = $1", email)
	return user, err
}

//delete by id use
func (r *UserRepository) Delete(user_id int) error {
    tx, err := r.db.Beginx()
    if err != nil {
        return fmt.Errorf("failed to begin transaction: %w", err)
    }

    // 1) Fetch the LTO ID for this user_id
    var ltoID string
    if err := tx.Get(
        &ltoID,
        `SELECT lto_client_id FROM users WHERE user_id = $1`,
        user_id,
    ); err != nil {
        tx.Rollback()
        return fmt.Errorf("failed to lookup lto_client_id: %w", err)
    }

    // 2) Delete all dependent records by lto_client_id
    for _, tbl := range []string{
        "personal_information",
        "people",
        "medical_information",
        "addresses",
        "contacts",
    } {
        if _, err := tx.Exec(
            fmt.Sprintf("DELETE FROM %s WHERE lto_client_id = $1", tbl),
            ltoID,
        ); err != nil {
            tx.Rollback()
            return fmt.Errorf("failed to delete %s: %w", tbl, err)
        }
    }

    // 3) Now delete the user row itself
    if _, err := tx.Exec(
        "DELETE FROM users WHERE user_id = $1",
        user_id,
    ); err != nil {
        tx.Rollback()
        return fmt.Errorf("failed to delete user: %w", err)
    }

    return tx.Commit()
}

//delete user by lto_client_id
func (r *UserRepository) DeleteByLTOClientID(ltoID string) error {
    tx, err := r.db.Beginx()
    if err != nil {
        return err
    }
    // Delete all dependents
    for _, tbl := range []string{
        "personal_information",
        "people",
        "medical_information",
        "addresses",
        "contacts",
    } {
        if _, err := tx.Exec(
            fmt.Sprintf("DELETE FROM %s WHERE lto_client_id = $1", tbl),
            ltoID,
        ); err != nil {
            tx.Rollback()
            return fmt.Errorf("failed to delete %s: %w", tbl, err)
        }
    }

    // Now delete the user by LTO rather than user_id
    if _, err := tx.Exec(
        "DELETE FROM users WHERE lto_client_id = $1",
        ltoID,
    ); err != nil {
        tx.Rollback()
        return fmt.Errorf("failed to delete user: %w", err)
    }

    return tx.Commit()
}


//update user
func (r *UserRepository) Update(user *models.User) error {
    tx, err := r.db.Beginx()
    if err != nil {
        return fmt.Errorf("failed to begin transaction: %w", err)
    }

    // Update user
    userQuery := `
        UPDATE users SET
            last_name = :last_name,
            first_name = :first_name,
            middle_name = :middle_name,
            email = :email,
            password = :password,
            role = :role,
            status = :status,
            lto_client_id = :lto_client_id,
            updated = NOW()
        WHERE user_id = :user_id
    `
    if _, err = tx.NamedExec(userQuery, user); err != nil {
        tx.Rollback()
        return fmt.Errorf("user update failed: %w", err)
    }

    // Upsert contact
    contactQuery := `
        INSERT INTO contacts (
            lto_client_id, telephone_number, int_area_code, mobile_number,
            emergency_contact_number, emergency_contact_name, emergency_contact_relationship, emergency_contact_address
        ) VALUES (
            :lto_client_id, :telephone_number, :int_area_code, :mobile_number,
            :emergency_contact_number, :emergency_contact_name, :emergency_contact_relationship, :emergency_contact_address
        )
        ON CONFLICT (lto_client_id) DO UPDATE SET
            telephone_number = EXCLUDED.telephone_number,
            int_area_code = EXCLUDED.int_area_code,
            mobile_number = EXCLUDED.mobile_number,
            emergency_contact_number = EXCLUDED.emergency_contact_number,
            emergency_contact_name = EXCLUDED.emergency_contact_name,
            emergency_contact_relationship = EXCLUDED.emergency_contact_relationship,
            emergency_contact_address = EXCLUDED.emergency_contact_address
    `
    contactData := map[string]interface{}{
        "lto_client_id":                  user.LTO_CLIENT_ID,
        "telephone_number":               user.Contact.TELEPHONE_NUMBER,
        "int_area_code":                  user.Contact.INT_AREA_CODE,
        "mobile_number":                  user.Contact.MOBILE_NUMBER,
        "emergency_contact_number":       user.Contact.EMERGENCY_CONTACT_NUMBER,
        "emergency_contact_name":         user.Contact.EMERGENCY_CONTACT_NAME,
        "emergency_contact_relationship": user.Contact.EMERGENCY_CONTACT_RELATIONSHIP,
        "emergency_contact_address":      user.Contact.EMERGENCY_CONTACT_ADDRESS,
    }
    if _, err := tx.NamedExec(contactQuery, contactData); err != nil {
        tx.Rollback()
        return fmt.Errorf("contact upsert failed: %w", err)
    }
    addressQuery := `
        INSERT INTO addresses (
            lto_client_id, house_no, street, province, 
            city_municipality, barangay, zip_code
        ) VALUES (
            :lto_client_id, :house_no, :street, :province, 
            :city_municipality, :barangay, :zip_code
        )
        ON CONFLICT (lto_client_id) DO UPDATE SET
            house_no = EXCLUDED.house_no,
            street = EXCLUDED.street,
            province = EXCLUDED.province,
            city_municipality = EXCLUDED.city_municipality,
            barangay = EXCLUDED.barangay,
            zip_code = EXCLUDED.zip_code
    `
    _, err = tx.NamedExec(addressQuery, map[string]interface{}{
        "lto_client_id":      user.LTO_CLIENT_ID,
        "house_no":          toNullString(user.Address.HOUSE_NO),
        "street":            toNullString(user.Address.STREET),
        "province":          toNullString(user.Address.PROVINCE),
        "city_municipality": toNullString(user.Address.CITY_MUNICIPALITY),
        "barangay":          toNullString(user.Address.BARANGAY),
        "zip_code":          toNullString(user.Address.ZIP_CODE),
    })
    if err != nil {
        tx.Rollback()
        return fmt.Errorf("address upsert failed: %w", err)
    }
    // In Update function
    medicalQuery := `
    INSERT INTO medical_information (
        lto_client_id, gender, blood_type, complexion, 
        eye_color, hair_color, weight, height, organ_donor
    ) VALUES (
        :lto_client_id, :gender, :blood_type, :complexion,
        :eye_color, :hair_color, :weight, :height, :organ_donor
    )
    ON CONFLICT (lto_client_id) DO UPDATE SET
        gender = EXCLUDED.gender,
        blood_type = EXCLUDED.blood_type,
        complexion = EXCLUDED.complexion,
        eye_color = EXCLUDED.eye_color,
        hair_color = EXCLUDED.hair_color,
        weight = EXCLUDED.weight,
        height = EXCLUDED.height,
        organ_donor = EXCLUDED.organ_donor
    `

    // Prepare data for medical information
    medicalData := map[string]interface{}{
        "lto_client_id": user.LTO_CLIENT_ID,
        "gender":        toNullString(user.MedicalInformation.GENDER),
        "blood_type":    toNullString(user.MedicalInformation.BLOOD_TYPE),
        "complexion":    toNullString(user.MedicalInformation.COMPLEXION),
        "eye_color":     toNullString(user.MedicalInformation.EYE_COLOR),
        "hair_color":    toNullString(user.MedicalInformation.HAIR_COLOR),
        "weight":        user.MedicalInformation.WEIGHT,
        "height":        user.MedicalInformation.HEIGHT,
        "organ_donor":   user.MedicalInformation.ORGAN_DONOR,
    }

    // Execute the query
    _, err = tx.NamedExec(medicalQuery, medicalData)
    if err != nil {
        tx.Rollback()
        return fmt.Errorf("medical info upsert failed: %w", err)
    }
 // Upsert People
 peopleQuery := `
 INSERT INTO people (
     lto_client_id, employer_name, employer_address, mother_first_name, 
     mother_maiden_name, mother_middle_name, father_first_name, 
     father_middle_name, father_last_name, address
 ) VALUES (
     :lto_client_id, :employer_name, :employer_address, :mother_first_name, 
     :mother_maiden_name, :mother_middle_name, :father_first_name, 
     :father_middle_name, :father_last_name, :address
 )
 ON CONFLICT (lto_client_id) DO UPDATE SET
     employer_name = EXCLUDED.employer_name,
     employer_address = EXCLUDED.employer_address,
     mother_first_name = EXCLUDED.mother_first_name,
     mother_maiden_name = EXCLUDED.mother_maiden_name,
     mother_middle_name = EXCLUDED.mother_middle_name,
     father_first_name = EXCLUDED.father_first_name,
     father_middle_name = EXCLUDED.father_middle_name,
     father_last_name = EXCLUDED.father_last_name,
     address = EXCLUDED.address
`
_, err = tx.NamedExec(peopleQuery, map[string]interface{}{
 "lto_client_id":        user.LTO_CLIENT_ID,
 "employer_name":        user.People.EMPLOYER_NAME,
 "employer_address":     user.People.EMPLOYER_ADDRESS,
 "mother_first_name":    user.People.MOTHER_FIRST_NAME,
 "mother_maiden_name":    user.People.MOTHER_MAIDEN_NAME,
 "mother_middle_name":   user.People.MOTHER_MIDDLE_NAME,
 "father_first_name":    user.People.FATHER_FIRST_NAME,
 "father_middle_name":   user.People.FATHER_MIDDLE_NAME,
 "father_last_name":     user.People.FATHER_LAST_NAME,
 "address":              user.People.ADDRESS,
})
if err != nil {
 tx.Rollback()
 return fmt.Errorf("people upsert failed: %w", err)

}

personalQuery := `
    INSERT INTO personal_information (
        lto_client_id, nationality, civil_status, date_of_birth, 
        place_of_birth, educational_attainment, tin
    ) VALUES (
        :lto_client_id, :nationality, :civil_status, :date_of_birth, 
        :place_of_birth, :educational_attainment, :tin
    )
    ON CONFLICT (lto_client_id) DO UPDATE SET
        nationality = EXCLUDED.nationality,
        civil_status = EXCLUDED.civil_status,
        date_of_birth = EXCLUDED.date_of_birth,
        place_of_birth = EXCLUDED.place_of_birth,
        educational_attainment = EXCLUDED.educational_attainment,
        tin = EXCLUDED.tin
`
_, err = tx.NamedExec(personalQuery, map[string]interface{}{
    "lto_client_id":           user.LTO_CLIENT_ID,
    "nationality":             user.PersonalInformation.NATIONALITY,
    "civil_status":            user.PersonalInformation.CIVIL_STATUS,
    "date_of_birth":           user.PersonalInformation.DATE_OF_BIRTH,
    "place_of_birth":          user.PersonalInformation.PLACE_OF_BIRTH,
    "educational_attainment":  user.PersonalInformation.EDUCATIONAL_ATTAINMENT,
    "tin":                     user.PersonalInformation.TIN,
})
if err != nil {
    tx.Rollback()
    return fmt.Errorf("personal info upsert failed: %w", err)
}

    return tx.Commit()
}
