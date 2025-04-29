// internal/handlers/plate_handler.go
package handlers

import (
    "database/sql"
    "net/http"
    "time"

    "github.com/labstack/echo/v4"
    "smartplate-api/internal/models"
    "smartplate-api/internal/repository"
)

// Only the fields you POST in the body—vehicle comes from the URL
type CreatePlateRequest struct {
    PlateNumber         string  `json:"plate_number"          binding:"required"`
    PlateType           string  `json:"plate_type"`
    PlateIssueDate      *string `json:"plate_issue_date"`       // YYYY-MM-DD or empty
    PlateExpirationDate *string `json:"plate_expiration_date"`  // YYYY-MM-DD or empty
    Status              string  `json:"status"                binding:"required"`
}

type PlateHandler struct {
    Repo repository.PlateRepository
}

func NewPlateHandler(repo repository.PlateRepository) *PlateHandler {
    return &PlateHandler{Repo: repo}
}

func (h *PlateHandler) CreatePlate(c echo.Context) error {
    // 1) Vehicle ID from URL
    vehicleID := c.Param("vehicle_id")

    // 2) Bind JSON body
    var req CreatePlateRequest
    if err := c.Bind(&req); err != nil {
        return c.JSON(http.StatusBadRequest, map[string]string{"error": err.Error()})
    }

    // 3) Convert *string → sql.NullTime
    toNullTime := func(s *string) (sql.NullTime, error) {
        if s == nil || *s == "" {
            return sql.NullTime{}, nil
        }
        t, err := time.Parse("2006-01-02", *s)
        if err != nil {
            return sql.NullTime{}, err
        }
        return sql.NullTime{Time: t, Valid: true}, nil
    }
    issueDate, err := toNullTime(req.PlateIssueDate)
    if err != nil {
        return c.JSON(http.StatusBadRequest, map[string]string{"error": "invalid issue date"})
    }
    expDate, err := toNullTime(req.PlateExpirationDate)
    if err != nil {
        return c.JSON(http.StatusBadRequest, map[string]string{"error": "invalid expiration date"})
    }

    // 4) Build your Plate model, using vehicleID from URL
    plate := &models.Plate{
        VEHICLE_ID:            vehicleID,
        PLATE_NUMBER:          req.PlateNumber,
        PLATE_TYPE:            req.PlateType,
        PLATE_ISSUE_DATE:      issueDate,
        PLATE_EXPIRATION_DATE: expDate,
        STATUS:                req.Status,
    }

    // 5) Call into the repo
    created, err := h.Repo.CreatePlate(c.Request().Context(), plate)
    if err != nil {
        return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
    }
    return c.JSON(http.StatusCreated, created)
}


// GET /api/vehicles/:vehicle_id/plates
func (h *PlateHandler) GetPlates(c echo.Context) error {
    vehicleID := c.Param("vehicle_id")
    list, err := h.Repo.GetPlatesByVehicleID(c.Request().Context(), vehicleID)
    if err != nil {
        return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
    }
    return c.JSON(http.StatusOK, list)
}

// GET /api/vehicles/:vehicle_id/plates/:plate_id
func (h *PlateHandler) GetPlateByID(c echo.Context) error {
    vehicleID := c.Param("vehicle_id")
    plateID    := c.Param("plate_id")
    p, err := h.Repo.GetPlateByID(c.Request().Context(), vehicleID, plateID)
    if err != nil {
        return c.JSON(http.StatusNotFound, map[string]string{"error": "not found"})
    }
    return c.JSON(http.StatusOK, p)
}

// PUT /api/vehicles/:vehicle_id/plates/:plate_id
func (h *PlateHandler) UpdatePlate(c echo.Context) error {
    vehicleID := c.Param("vehicle_id")
    plateID   := c.Param("plate_id")

    // bind into a map so we only update what's sent
    var fields map[string]interface{}
    if err := c.Bind(&fields); err != nil {
        return c.JSON(http.StatusBadRequest, map[string]string{"error": err.Error()})
    }

    // perform dynamic update
    if err := h.Repo.UpdatePlate(c.Request().Context(), vehicleID, plateID, fields); err != nil {
        return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
    }

    // return the fresh record
    updated, err := h.Repo.GetPlateByID(c.Request().Context(), vehicleID, plateID)
    if err != nil {
        return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
    }
    return c.JSON(http.StatusOK, updated)
}

// DELETE /api/vehicles/:vehicle_id/plates/:plate_id
func (h *PlateHandler) DeletePlateByID(c echo.Context) error {
    vehicleID := c.Param("vehicle_id")
    plateID    := c.Param("plate_id")
    if err := h.Repo.DeletePlateByID(c.Request().Context(), vehicleID, plateID); err != nil {
        return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
    }
    return c.NoContent(http.StatusNoContent)
}
