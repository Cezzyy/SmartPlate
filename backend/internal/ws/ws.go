package ws

import (
    "net/http"
    "encoding/json"
    "log"
    "time"

    "github.com/gorilla/websocket"
    "github.com/labstack/echo/v4"

    "smartplate-api/internal/models"
    "smartplate-api/internal/repository"
)

// Upgrader configures the WebSocket upgrader
var Upgrader = websocket.Upgrader{
    ReadBufferSize:  1024,
    WriteBufferSize: 1024,
    CheckOrigin:     func(r *http.Request) bool { return true },
}

// scanLogRepo holds the scan-log repository; set in main
var scanLogRepo repository.ScanLogRepository

// SetScanLogRepository must be called in main to initialize logging
func SetScanLogRepository(repo repository.ScanLogRepository) {
    scanLogRepo = repo
}

// PlateCheckRequest is the incoming WS payload
type PlateCheckRequest struct {
    Plate     string `json:"plate"`
    Timestamp string `json:"timestamp"`
}

// PlateCheckResponse is the outgoing WS response
type PlateCheckResponse struct {
    Plate   string      `json:"plate"`
    Status  string      `json:"status"` // valid, not_found, expired, error
    Details *DetailPack `json:"details,omitempty"`
}

// DetailPack holds optional details for a valid plate
type DetailPack struct {
    RegistrationForm *models.RegistrationForm `json:"registration_form,omitempty"`
    Plates           []models.Plate           `json:"plates,omitempty"`
    User             *models.User             `json:"user_record,omitempty"`
}

// ScannerWS serves the WS endpoint; signature unchanged.
func ScannerWS(
    plateRepo   repository.PlateRepository,
    regFormRepo repository.RegistrationFormRepository,
    userRepo    *repository.UserRepository,
) echo.HandlerFunc {
    return func(c echo.Context) error {
        ws, err := Upgrader.Upgrade(c.Response().Writer, c.Request(), nil)
        if err != nil {
            return err
        }
        defer ws.Close()

        for {
            _, msg, err := ws.ReadMessage()
            if err != nil {
                log.Println("ws read error:", err)
                break
            }

            var req PlateCheckRequest
            if err := json.Unmarshal(msg, &req); err != nil {
                log.Println("json unmarshal error:", err)
                ws.WriteJSON(PlateCheckResponse{Status: "bad_request"})
                continue
            }

            log.Printf("[DEBUG] Received request: %+v", req)

            // 1) Plate lookup
            rec, err := plateRepo.GetByPlateNumber(c.Request().Context(), req.Plate)
            validity := "error"
            if err != nil {
                log.Println("db lookup error:", err)
            } else if rec == nil {
                validity = "not_found"
            } else if rec.PLATE_EXPIRATION_DATE.Before(time.Now()) {
                validity = "expired"
            } else {
                validity = "valid"
            }

            var details *DetailPack
            if rec != nil {
                // fetch related details
                regForm, _ := regFormRepo.GetByVehicleID(c.Request().Context(), rec.VEHICLE_ID)
                plates, _ := plateRepo.GetPlatesByVehicleID(c.Request().Context(), rec.VEHICLE_ID)
                var usr *models.User
                if regForm != nil {
                    u, _ := userRepo.GetByLTOClientID(regForm.LTOClientID)
                    usr = &u
                }
                details = &DetailPack{RegistrationForm: regForm, Plates: plates, User: usr}
            }

            resp := PlateCheckResponse{Plate: req.Plate, Status: validity, Details: details}

            // 2) Log scan event if repo set and details present
            if scanLogRepo != nil && rec != nil && details != nil && details.RegistrationForm != nil {
                plateID := rec.PlateID
                registrationID := details.RegistrationForm.RegistrationFormID
                vehicleID := rec.VEHICLE_ID
                ltoClientID := details.RegistrationForm.LTOClientID
                log.Printf("[DEBUG] Extracted IDs -> plate_id=%s, registration_id=%s, vehicle_id=%s, lto_client_id=%s", plateID, registrationID, vehicleID, ltoClientID)
                entry := &models.ScanLog{PlateID: plateID, RegistrationID: registrationID, LTOClientID: ltoClientID, ScannedAt: time.Now()}
                log.Printf("[DEBUG] Inserting scan_log entry: %+v", entry)
                if err := scanLogRepo.Create(c.Request().Context(), entry); err != nil {
                    log.Printf("[DEBUG] scan_log insert FAILED: %v", err)
                } else {
                    log.Printf("[DEBUG] scan_log insert SUCCESS")
                }
            } else {
                log.Println("[DEBUG] scanLogRepo missing or details incomplete; skipping scan_log")
            }

            log.Printf("[DEBUG] Sending WS response: %+v", resp)
            if err := ws.WriteJSON(resp); err != nil {
                log.Println("ws write error:", err)
                break
            }
        }
        return nil
    }
}
