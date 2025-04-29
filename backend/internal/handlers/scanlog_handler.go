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
