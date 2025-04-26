// internal/handlers/plate_handler.go
package handlers

import (
    "net/http"
    "smartplate-api/internal/models"
    "smartplate-api/internal/repository"

    "github.com/labstack/echo/v4"
)

type PlateHandler struct {
    repo repository.PlateRepository
}

func NewPlateHandler(pr repository.PlateRepository) *PlateHandler {
    return &PlateHandler{repo: pr}
}

// POST /api/vehicles/:vehicle_id/plates
func (h *PlateHandler) CreatePlate(c echo.Context) error {
    vehicleID := c.Param("vehicle_id")
    var p models.Plate
    if err := c.Bind(&p); err != nil {
        return c.JSON(http.StatusBadRequest, map[string]string{"error": err.Error()})
    }
    p.VEHICLE_ID = vehicleID
    created, err := h.repo.CreatePlate(c.Request().Context(), &p)
    if err != nil {
        return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
    }
    return c.JSON(http.StatusCreated, created)
}

// GET /api/vehicles/:vehicle_id/plates
func (h *PlateHandler) GetPlates(c echo.Context) error {
    vehicleID := c.Param("vehicle_id")
    list, err := h.repo.GetPlatesByVehicleID(c.Request().Context(), vehicleID)
    if err != nil {
        return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
    }
    return c.JSON(http.StatusOK, list)
}

// GET /api/vehicles/:vehicle_id/plates/:plate_id
func (h *PlateHandler) GetPlateByID(c echo.Context) error {
    vehicleID := c.Param("vehicle_id")
    plateID    := c.Param("plate_id")
    p, err := h.repo.GetPlateByID(c.Request().Context(), vehicleID, plateID)
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
    if err := h.repo.UpdatePlate(c.Request().Context(), vehicleID, plateID, fields); err != nil {
        return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
    }

    // return the fresh record
    updated, err := h.repo.GetPlateByID(c.Request().Context(), vehicleID, plateID)
    if err != nil {
        return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
    }
    return c.JSON(http.StatusOK, updated)
}

// DELETE /api/vehicles/:vehicle_id/plates/:plate_id
func (h *PlateHandler) DeletePlateByID(c echo.Context) error {
    vehicleID := c.Param("vehicle_id")
    plateID    := c.Param("plate_id")
    if err := h.repo.DeletePlateByID(c.Request().Context(), vehicleID, plateID); err != nil {
        return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
    }
    return c.NoContent(http.StatusNoContent)
}
