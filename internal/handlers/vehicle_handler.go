// internal/handlers/vehicle_handler.go
package handlers

import (
    "net/http"
    "smartplate-api/internal/models"
    "smartplate-api/internal/repository"

    "github.com/labstack/echo/v4"
)

type VehicleHandler struct {
    repo repository.VehicleRepository
}

func NewVehicleHandler(repo repository.VehicleRepository) *VehicleHandler {
    return &VehicleHandler{repo}
}

func (h *VehicleHandler) CreateVehicle(c echo.Context) error {
    var v models.Vehicle
    if err := c.Bind(&v); err != nil {
        return c.JSON(http.StatusBadRequest, map[string]string{"error": err.Error()})
    }
    created, err := h.repo.CreateVehicle(c.Request().Context(), &v)
    if err != nil {
        return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
    }
    return c.JSON(http.StatusCreated, created)
}

func (h *VehicleHandler) GetAllVehicles(c echo.Context) error {
    list, err := h.repo.GetAllVehicles(c.Request().Context())
    if err != nil {
        return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
    }
    return c.JSON(http.StatusOK, list)
}

func (h *VehicleHandler) GetVehicle(c echo.Context) error {
    id := c.Param("id")
    v, err := h.repo.GetVehicleByID(c.Request().Context(), id)
    if err != nil {
        return c.JSON(http.StatusNotFound, map[string]string{"error": "not found"})
    }
    return c.JSON(http.StatusOK, v)
}

func (h *VehicleHandler) UpdateVehicle(c echo.Context) error {
    id := c.Param("id")
    var fields map[string]interface{}
    if err := c.Bind(&fields); err != nil {
        return c.JSON(http.StatusBadRequest, map[string]string{"error": err.Error()})
    }
    if err := h.repo.UpdateVehicle(c.Request().Context(), id, fields); err != nil {
        return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
    }
    updated, err := h.repo.GetVehicleByID(c.Request().Context(), id)
    if err != nil {
        return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
    }
    return c.JSON(http.StatusOK, updated)
}

func (h *VehicleHandler) DeleteVehicle(c echo.Context) error {
    id := c.Param("id")
    if err := h.repo.DeleteVehicle(c.Request().Context(), id); err != nil {
        return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
    }
    return c.NoContent(http.StatusNoContent)
}

func (h *VehicleHandler) GetByClientID(c echo.Context) error {
    client := c.Param("lto_client_id")
    v, err := h.repo.GetVehicleByClientID(c.Request().Context(), client)
    if err != nil {
        return c.JSON(http.StatusNotFound, map[string]string{"error": "not found"})
    }
    return c.JSON(http.StatusOK, v)
}

func (h *VehicleHandler) UpdateByClientID(c echo.Context) error {
    client := c.Param("lto_client_id")
    var fields map[string]interface{}
    if err := c.Bind(&fields); err != nil {
        return c.JSON(http.StatusBadRequest, map[string]string{"error": err.Error()})
    }
    if err := h.repo.UpdateVehicleByClientID(c.Request().Context(), client, fields); err != nil {
        return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
    }
    updated, _ := h.repo.GetVehicleByClientID(c.Request().Context(), client)
    return c.JSON(http.StatusOK, updated)
}

func (h *VehicleHandler) DeleteByClientID(c echo.Context) error {
    client := c.Param("lto_client_id")
    if err := h.repo.DeleteVehicleByClientID(c.Request().Context(), client); err != nil {
        return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
    }
    return c.NoContent(http.StatusNoContent)
}
