package handlers

import (
	"fmt"
	"log"
	"math/rand"
	"net/http"
	"smartplate-api/internal/models"
	"smartplate-api/internal/repository"
	"strconv"
	"time"

	"github.com/labstack/echo/v4"
	"golang.org/x/crypto/bcrypt"
)

type UserHandler struct {
	repo *repository.UserRepository
}
func NewUserHandler(repo *repository.UserRepository) *UserHandler {
	rand.Seed(time.Now().UnixNano())
	return &UserHandler{repo: repo}
}

func (h *UserHandler) CreateUser(c echo.Context) error {
    var user models.User
    if err := c.Bind(&user); err != nil {
        log.Printf("CreateUser bind error: %v", err)
        return c.JSON(http.StatusBadRequest, map[string]string{
            "error": "Invalid request body",
            "details": err.Error(),
        })
    }
	hashed, err := bcrypt.GenerateFromPassword([]byte(user.PASSWORD), bcrypt.DefaultCost)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error":"couldn’t hash password"})
	}
	user.PASSWORD = string(hashed)

	// 2) Default role/status if empty
	if user.ROLE == "" {
		user.ROLE = "user"
	}
	if user.STATUS == "" {
		user.STATUS = "active"
	}

    // Validate required fields
    if user.LAST_NAME == "" || user.FIRST_NAME == "" || user.EMAIL == "" || user.PASSWORD == "" {
        return c.JSON(http.StatusBadRequest, map[string]string{
            "error": "Missing required fields: last_name, first_name, email, password",
        })
    }

    // Generate LTO ID if not provided
    if user.LTO_CLIENT_ID == "" {
        ltoID, err := h.generateUniqueLTOID()
        if err != nil {
            log.Printf("LTO ID generation failed: %v", err)
            return c.JSON(http.StatusInternalServerError, map[string]string{
                "error": "Failed to generate unique LTO ID",
            })
        }
        user.LTO_CLIENT_ID = ltoID
    }

    // Create user with transaction
    if err := h.repo.Create(&user); err != nil {
        log.Printf("CreateUser error: %v", err) // Detailed logging
        return c.JSON(http.StatusInternalServerError, map[string]string{
            "error": "Failed to create user",
            "details": err.Error(), // Return actual error to client
        })
    }

    // Clear sensitive data before response
    user.PASSWORD = ""
    return c.JSON(http.StatusCreated, user)
}


// GetAllUsers handles GET /users
func (h *UserHandler) GetAllUsers(c echo.Context) error {
	users, err := h.repo.GetAll()
	if err != nil {
		log.Printf("GetAllUsers error: %v", err)
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": "failed to fetch users"})
	}
	return c.JSON(http.StatusOK, users)
}

//GetUserByID handles GET /users/:id
func (h *UserHandler) GetUserByID(c echo.Context) error {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "Invalid user ID"})
	}

	user, err := h.repo.GetByID(id)
	if err != nil {
		return c.JSON(http.StatusNotFound, map[string]string{"error": "User not found"})
	}

	return c.JSON(http.StatusOK, user)
}

//GetUserByEmail handles GET /users/email/:email
func (h *UserHandler) GetUserByEmail(c echo.Context) error {
	email := c.Param("email")

	user, err := h.repo.GetByEmail(email)
	if err != nil {
		return c.JSON(http.StatusNotFound, map[string]string{"error": "User not found"})
	}

	return c.JSON(http.StatusOK, user)
}

// UpdateUser handles PUT /users/:id
func (h *UserHandler) UpdateUser(c echo.Context) error {
    id, err := strconv.Atoi(c.Param("id"))
    if err != nil {
        return c.JSON(http.StatusBadRequest, map[string]string{"error": "Invalid user ID"})
    }

    // Get existing user data
    existingUser, err := h.repo.GetByID(id)
    if err != nil {
        return c.JSON(http.StatusNotFound, map[string]string{"error": "User not found"})
    }

    // Bind incoming updates
    var updateData models.User
    if err := c.Bind(&updateData); err != nil {
        return c.JSON(http.StatusBadRequest, map[string]string{"error": "Invalid request body"})
    }

    // Merge updates with existing data
    updatedUser := mergeUserUpdates(&existingUser, updateData)
    
    // Perform the update
    if err := h.repo.Update(updatedUser); err != nil {
        log.Printf("UpdateUser error: %v", err)
        return c.JSON(http.StatusInternalServerError, map[string]string{
            "error": "Failed to update user: " + err.Error(),
        })
    }

    return c.JSON(http.StatusOK, updatedUser)
}

func mergeUserUpdates(existing *models.User, update models.User) *models.User {
    // Preserve critical identifiers
    update.USER_ID = existing.USER_ID
    update.LTO_CLIENT_ID = existing.LTO_CLIENT_ID
    update.EMAIL = existing.EMAIL

	if update.PASSWORD == "" {
        // client didn’t supply a new one → keep the old hash
        update.PASSWORD = existing.PASSWORD
    } else {
        // hash the new password
        hashed, err := bcrypt.GenerateFromPassword([]byte(update.PASSWORD), bcrypt.DefaultCost)
        if err != nil {
            // you might want to bubble this up instead of panic
            log.Printf("mergeUserUpdates bcrypt error: %v", err)
        } else {
            update.PASSWORD = string(hashed)
        }
    }
	// — ROLE & STATUS — defaults if empty
	if update.ROLE == "" {
		update.ROLE = existing.ROLE
	}
	if update.STATUS == "" {
		update.STATUS = existing.STATUS
	}
	
    // Preserve first name if not provided
    if update.FIRST_NAME == "" {
        update.FIRST_NAME = existing.FIRST_NAME
    }
    // Preserve last name if not provided
    if update.LAST_NAME == "" {
        update.LAST_NAME = existing.LAST_NAME
    }
    // Preserve middle name if not provided
    if update.MIDDLE_NAME == "" {
        update.MIDDLE_NAME = existing.MIDDLE_NAME
    }

    // Merge contact info if not provided in update
	update.Contact = mergeContact(existing.Contact, update.Contact)
    // Merge address if not provided in update
	update.Address = mergeAddress(existing.Address, update.Address)
    // Merge medical info if not provided in update
    update.MedicalInformation = mergeMedicalInformation(existing.MedicalInformation, update.MedicalInformation)
    
    // Merge people info if not provided in update
	update.People = mergePeople(existing.People, update.People)
    // Merge personal info if not provided in update
    update.PersonalInformation = mergePersonalInformation(existing.PersonalInformation, update.PersonalInformation)

    return &update
}


func mergeMedicalInformation(existing, update models.MedicalInformation) models.MedicalInformation {
	// Always preserve the critical identifiers
	update.MEDICAL_ID = existing.MEDICAL_ID
	update.LTO_CLIENT_ID = existing.LTO_CLIENT_ID

    if update.GENDER == nil {
        update.GENDER = existing.GENDER
    }
    if update.BLOOD_TYPE == nil {
        update.BLOOD_TYPE = existing.BLOOD_TYPE
    }
    if update.COMPLEXION == nil {
        update.COMPLEXION = existing.COMPLEXION
    }
    if update.EYE_COLOR == nil {
        update.EYE_COLOR = existing.EYE_COLOR
    }
    if update.HAIR_COLOR == nil {
        update.HAIR_COLOR = existing.HAIR_COLOR
    }
    if update.WEIGHT == nil {
        update.WEIGHT = existing.WEIGHT
    }
    if update.HEIGHT == nil {
        update.HEIGHT = existing.HEIGHT
    }
    if update.ORGAN_DONOR == nil {
        update.ORGAN_DONOR = existing.ORGAN_DONOR
    }
    if update.LTO_CLIENT_ID == nil {
        update.LTO_CLIENT_ID = existing.LTO_CLIENT_ID
    }
    return update
}

func mergeContact(existing, update models.Contact) models.Contact{

	
	update.CONTACT_ID = existing.CONTACT_ID
	update.LTO_CLIENT_ID = existing.LTO_CLIENT_ID
	
	if update.TELEPHONE_NUMBER == nil{
		update.TELEPHONE_NUMBER = existing.TELEPHONE_NUMBER
	}
	if update.INT_AREA_CODE == nil{
		update.INT_AREA_CODE = existing.INT_AREA_CODE
	}
	if update.MOBILE_NUMBER == nil{
		update.MOBILE_NUMBER = existing.MOBILE_NUMBER
	}
	if update.EMERGENCY_CONTACT_NUMBER == nil{
		update.EMERGENCY_CONTACT_NUMBER = existing.EMERGENCY_CONTACT_NUMBER
	}
	
	if update.EMERGENCY_CONTACT_NAME == nil{
		update.EMERGENCY_CONTACT_NAME = existing.EMERGENCY_CONTACT_NAME
	}
	if update.EMERGENCY_CONTACT_RELATIONSHIP == nil{
		update.EMERGENCY_CONTACT_RELATIONSHIP = existing.EMERGENCY_CONTACT_RELATIONSHIP
	}
	if update.EMERGENCY_CONTACT_ADDRESS == nil{
		update.EMERGENCY_CONTACT_ADDRESS = existing.EMERGENCY_CONTACT_ADDRESS
	}
	return update
	
}
func mergeAddress(existing, update models.Address) models.Address {
		
	update.ADDRESS_ID = existing.ADDRESS_ID
	update.LTO_CLIENT_ID = existing.LTO_CLIENT_ID

	if update.HOUSE_NO == nil {
		update.HOUSE_NO = existing.HOUSE_NO
	}
	if update.STREET == nil {
		update.STREET = existing.STREET
	}
	if update.PROVINCE == nil {
		update.PROVINCE = existing.PROVINCE
	}
	if update.CITY_MUNICIPALITY == nil {
		update.CITY_MUNICIPALITY = existing.CITY_MUNICIPALITY
	}
	if update.BARANGAY == nil {
		update.BARANGAY = existing.BARANGAY
	}
	if update.ZIP_CODE == nil {
		update.ZIP_CODE = existing.ZIP_CODE
	}


	return update
}
func mergePeople(existing, update models.People) models.People {
	// Always preserve the critical identifiers from the existing record,
	// preventing them from becoming null if not provided in the update.
	update.PEOPLE_ID = existing.PEOPLE_ID
	update.LTO_CLIENT_ID = existing.LTO_CLIENT_ID

	// For other fields, use the existing value only if the update value is nil.
	if update.EMPLOYER_NAME == nil {
		update.EMPLOYER_NAME = existing.EMPLOYER_NAME
	}
	if update.EMPLOYER_ADDRESS == nil {
		update.EMPLOYER_ADDRESS = existing.EMPLOYER_ADDRESS
	}
	if update.MOTHER_FIRST_NAME == nil {
		update.MOTHER_FIRST_NAME = existing.MOTHER_FIRST_NAME
	}
	if update.MOTHER_MAIDEN_NAME == nil {
		update.MOTHER_MAIDEN_NAME = existing.MOTHER_MAIDEN_NAME
	}
	if update.MOTHER_MIDDLE_NAME == nil {
		update.MOTHER_MIDDLE_NAME = existing.MOTHER_MIDDLE_NAME
	}
	if update.FATHER_FIRST_NAME == nil {
		update.FATHER_FIRST_NAME = existing.FATHER_FIRST_NAME
	}
	if update.FATHER_MIDDLE_NAME == nil {
		update.FATHER_MIDDLE_NAME = existing.FATHER_MIDDLE_NAME
	}
	if update.FATHER_LAST_NAME == nil {
		update.FATHER_LAST_NAME = existing.FATHER_LAST_NAME
	}
	if update.ADDRESS == nil {
		update.ADDRESS = existing.ADDRESS
	}

	return update
}


func mergePersonalInformation(existing, update models.PersonalInformation) models.PersonalInformation {
	// Always preserve the critical identifiers from the existing record,
	// preventing them from becoming null if not provided in the update.
	update.PERSONAL_ID = existing.PERSONAL_ID
	update.LTO_CLIENT_ID = existing.LTO_CLIENT_ID

	// For other fields, use the existing value only if the update value is nil.
	if update.NATIONALITY == nil {
		update.NATIONALITY = existing.NATIONALITY
	}
	if update.CIVIL_STATUS == nil {
		update.CIVIL_STATUS = existing.CIVIL_STATUS
	}
	if update.DATE_OF_BIRTH == nil {
		update.DATE_OF_BIRTH = existing.DATE_OF_BIRTH
	}
	if update.PLACE_OF_BIRTH == nil {
		update.PLACE_OF_BIRTH = existing.PLACE_OF_BIRTH
	}
	if update.EDUCATIONAL_ATTAINMENT == nil {
		update.EDUCATIONAL_ATTAINMENT = existing.EDUCATIONAL_ATTAINMENT
	}
	if update.TIN == nil {
		update.TIN = existing.TIN
	}

	return update
}
	

// DeleteUser handles DELETE /users/:id
func (h *UserHandler) DeleteUser(c echo.Context) error {
    id, err := strconv.Atoi(c.Param("id"))
    if err != nil {
        return c.JSON(http.StatusBadRequest, map[string]string{"error": "invalid user ID"})
    }
    if err := h.repo.Delete(id); err != nil {
        log.Printf("DeleteUser error: %v", err)
        return c.JSON(http.StatusInternalServerError, map[string]string{"error": "failed to delete user"})
    }
    return c.NoContent(http.StatusNoContent)
}



// PUT /users/by-lto/:lto_client_id
func (h *UserHandler) UpdateUserByLTO(c echo.Context) error {
    ltoID := c.Param("lto_client_id")

    // 1) bind incoming JSON
    var payload models.User
    if err := c.Bind(&payload); err != nil {
        return c.JSON(http.StatusBadRequest, map[string]string{
            "error":   "Invalid request body",
            "details": err.Error(),
        })
    }

    // 2) fetch existing by LTO
    existing, err := h.repo.GetByLTOClientID(ltoID)
    if err != nil {
        return c.JSON(http.StatusNotFound, map[string]string{
            "error": "User not found",
        })
    }

    // 3) merge fields (preserves any nil/empty fields)
    merged := mergeUserUpdates(&existing, payload)

    // 4) perform update
    if err := h.repo.Update(merged); err != nil {
        log.Printf("UpdateUserByLTO error: %v", err)
        return c.JSON(http.StatusInternalServerError, map[string]string{
            "error":   "Failed to update user",
            "details": err.Error(),
        })
    }

    // 5) clear sensitive data
    merged.PASSWORD = ""
    return c.JSON(http.StatusOK, merged)
}



// DeleteUserByLTO handles DELETE /users/by-lto/:lto_client_id
func (h *UserHandler) DeleteUserByLTO(c echo.Context) error {
    ltoID := c.Param("lto_client_id")
    if err := h.repo.DeleteByLTOClientID(ltoID); err != nil {
        log.Printf("DeleteUserByLTO error: %v", err)
        return c.JSON(http.StatusInternalServerError, map[string]string{
            "error": "Failed to delete user",
            "details": err.Error(),
        })
    }
    return c.NoContent(http.StatusNoContent)
}
//get user by lto client id
func (h *UserHandler) GetUserByLTOID(c echo.Context) error {
    ltoID := c.Param("lto_client_id")
    user, err := h.repo.GetByLTOClientID(ltoID)
    if err != nil {
        return c.JSON(http.StatusNotFound, map[string]string{"error": "User not found"})
    }
    return c.JSON(http.StatusOK, user)
}

// GenerateLTOID handles GET /generate-lto-id
//23-041120-3925000
func (h *UserHandler) GenerateLTOID(c echo.Context) error {
	ltoID, err := h.generateUniqueLTOID()
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{
			"error": err.Error(),
		})
	}
	return c.JSON(http.StatusOK, map[string]string{
		"lto_client_id": ltoID,
	})
}

//15-digit generation
func (h *UserHandler) generateUniqueLTOID() (string, error) {
	const (
		prefix      = "25" // 2-digit prefix 25 for 2025
		totalLength = 15
		maxAttempts = 10
	)
	remainingDigits := totalLength - len(prefix)

	for i := 0; i < maxAttempts; i++ {
		// Generate random numbers with leading zeros
		randomPart := fmt.Sprintf("%0*d", remainingDigits, rand.Intn(1e13))
		generatedID := prefix + randomPart

		// Check uniqueness
		_, err := h.repo.GetByLTOClientID(generatedID)
		if err != nil {
			// If not found, return the unique ID
			return generatedID, nil
		}
	}
	return "", fmt.Errorf("failed to generate unique LTO ID after %d attempts", maxAttempts)
}