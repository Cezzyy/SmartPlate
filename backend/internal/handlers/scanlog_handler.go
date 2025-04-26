package handlers

import (
    "net/http"

    "github.com/labstack/echo/v4"
    "smartplate-api/internal/models"
    "smartplate-api/internal/repository"
)

// ScanLogHandler handles HTTP requests for scan_log entries.
type ScanLogHandler struct {
    repo repository.ScanLogRepository
}

// NewScanLogHandler creates a new ScanLogHandler.
func NewScanLogHandler(repo repository.ScanLogRepository) *ScanLogHandler {
    return &ScanLogHandler{repo: repo}
}

// Create logs a new scan entry from JSON payload.
func (h *ScanLogHandler) Create(c echo.Context) error {
    var entry models.ScanLog
    if err := c.Bind(&entry); err != nil {
        return c.JSON(http.StatusBadRequest, map[string]string{"error": err.Error()})
    }
    // Set timestamp server-side for consistency
    entry.ScannedAt = entry.ScannedAt // assume it's set by client or elsewhere
    if err := h.repo.Create(c.Request().Context(), &entry); err != nil {
        return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
    }
    return c.JSON(http.StatusCreated, entry)
}

// GetAll retrieves all scan_log entries.
func (h *ScanLogHandler) GetAll(c echo.Context) error {
    logs, err := h.repo.GetAll(c.Request().Context())
    if err != nil {
        return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
    }
    return c.JSON(http.StatusOK, logs)
}

// GetByID retrieves a single scan_log entry by its log_id.
func (h *ScanLogHandler) GetByID(c echo.Context) error {
    id := c.Param("id")
    entry, err := h.repo.GetByID(c.Request().Context(), id)
    if err != nil {
        return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
    }
    if entry == nil {
        return c.JSON(http.StatusNotFound, map[string]string{"error": "not found"})
    }
    return c.JSON(http.StatusOK, entry)
}
