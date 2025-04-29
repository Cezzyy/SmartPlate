// internal/handlers/scan_log_handler.go
package handlers

import (
    "net/http"
    "strconv"

    "github.com/labstack/echo/v4"
    "smartplate-api/internal/models"
    "smartplate-api/internal/repository"
)

// ScanLogHandler handles HTTP requests for scan_log entries.
type ScanLogHandler struct {
    scanRepo    repository.ScanLogRepository
    plateRepo   repository.PlateRepository
    regFormRepo repository.RegistrationFormRepository
    userRepo    *repository.UserRepository
    vehicleRepo repository.VehicleRepository
}

// NewScanLogHandler creates a ScanLogHandler that can serve both List & Detail.
func NewScanLogHandler(
    scanRepo repository.ScanLogRepository,
    plateRepo repository.PlateRepository,
    regFormRepo repository.RegistrationFormRepository,
    userRepo *repository.UserRepository,
    vehicleRepo repository.VehicleRepository,
) *ScanLogHandler {
    return &ScanLogHandler{
        scanRepo:    scanRepo,
        plateRepo:   plateRepo,
        regFormRepo: regFormRepo,
        userRepo:    userRepo,
        vehicleRepo: vehicleRepo,
    }
}

// Create logs a new scan entry from JSON payload.
func (h *ScanLogHandler) Create(c echo.Context) error {
    var entry models.ScanLog
    if err := c.Bind(&entry); err != nil {
        return c.JSON(http.StatusBadRequest, map[string]string{"error": err.Error()})
    }
    entry.ScannedAt = entry.ScannedAt
    if err := h.scanRepo.Create(c.Request().Context(), &entry); err != nil {
        return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
    }
    return c.JSON(http.StatusCreated, entry)
}

// GetAll retrieves all scan_log entries.
func (h *ScanLogHandler) GetAll(c echo.Context) error {
    logs, err := h.scanRepo.GetAll(c.Request().Context())
    if err != nil {
        return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
    }
    return c.JSON(http.StatusOK, logs)
}

// GetByID retrieves a single scan_log entry by its log_id.
func (h *ScanLogHandler) GetByID(c echo.Context) error {
    id := c.Param("id")
    entry, err := h.scanRepo.GetByID(c.Request().Context(), id)
    if err != nil {
        return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
    }
    if entry == nil {
        return c.JSON(http.StatusNotFound, map[string]string{"error": "not found"})
    }
    return c.JSON(http.StatusOK, entry)
}
//datailes
func (h *ScanLogHandler) Detail(c echo.Context) error {
    ctx := c.Request().Context()
    logID := c.Param("id")

    // 1) Fetch the scan_log row
    scanEntry, err := h.scanRepo.GetByID(ctx, logID)
    if err != nil {
        return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
    }
    if scanEntry == nil {
        return c.JSON(http.StatusNotFound, map[string]string{"error": "not found"})
    }

    // 2) Unwrap the NullString fields safely
    var ltoID string
    if scanEntry.LTOClientID.Valid {
        ltoID = scanEntry.LTOClientID.String
    } else {
        // if you expect it always to be set, you could return an error here
        return c.JSON(http.StatusInternalServerError, map[string]string{"error": "missing lto_client_id"})
    }

    var regID string
    if scanEntry.RegistrationID.Valid {
        regID = scanEntry.RegistrationID.String
    } else {
        // temporary plates might not have a registration_id
        regID = ""
    }

    // 3) Pull the user record via unwrapped LTO client ID
    user, err := h.userRepo.GetByLTOClientID(ltoID)
    if err != nil {
        return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
    }

    // 4) Assemble and return just the fields needed
    return c.JSON(http.StatusOK, map[string]interface{}{
        "scan_log": map[string]interface{}{
            "log_id":          scanEntry.LogID,
            "registration_id": regID,
            "lto_client_id":   ltoID,
            "scanned_at":      scanEntry.ScannedAt,
        },
        "user": map[string]interface{}{
            "lto_client_id": user.LTO_CLIENT_ID,
            "first_name":    user.FIRST_NAME,
            "last_name":     user.LAST_NAME,
            "email":         user.EMAIL,
            // if you only need contact and address subfields:
            "contact": map[string]interface{}{
                "mobile_number":    user.Contact.MOBILE_NUMBER,
                "telephone_number": user.Contact.TELEPHONE_NUMBER,
            },
            "address": map[string]interface{}{
                "house_no":          user.Address.HOUSE_NO,
                "street":            user.Address.STREET,
                "barangay":          user.Address.BARANGAY,
                "city_municipality": user.Address.CITY_MUNICIPALITY,
                "province":          user.Address.PROVINCE,
                "zip_code":          user.Address.ZIP_CODE,
            },
        },
    })
}

// List returns a paginated list of scan_log entries.
func (h *ScanLogHandler) List(c echo.Context) error {
    ctx := c.Request().Context()

    page, err := strconv.Atoi(c.QueryParam("page"))
    if err != nil || page < 1 {
        page = 1
    }
    limit, err := strconv.Atoi(c.QueryParam("limit"))
    if err != nil || limit < 1 {
        limit = 10
    }
    offset := (page - 1) * limit

    items, err := h.scanRepo.List(ctx, limit, offset)
    if err != nil {
        return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
    }

    total, err := h.scanRepo.Count(ctx)
    if err != nil {
        return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
    }
    pages := (total + limit - 1) / limit

    return c.JSON(http.StatusOK, map[string]interface{}{
        "items": items,
        "total": total,
        "page":  page,
        "pages": pages,
    })
}
