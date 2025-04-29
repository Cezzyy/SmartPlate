package ws

import (
    "context"
    "database/sql"
    "encoding/json"
    "log"
    "net/http"
    "time"

    "github.com/gorilla/websocket"
    "github.com/labstack/echo/v4"

    "smartplate-api/internal/models"
    "smartplate-api/internal/repository"
)

var Upgrader = websocket.Upgrader{
    ReadBufferSize:  1024,
    WriteBufferSize: 1024,
    CheckOrigin:     func(r *http.Request) bool { return true },
}

var scanLogRepo repository.ScanLogRepository

func SetScanLogRepository(repo repository.ScanLogRepository) {
    scanLogRepo = repo
}

type PlateCheckRequest struct {
    Plate     string `json:"plate"`
    Timestamp string `json:"timestamp"`
}

type PlateCheckResponse struct {
    Plate   string      `json:"plate"`
    Status  string      `json:"status"` // valid, expired, not_found, error
    Details *DetailPack `json:"details,omitempty"`
}

type DetailPack struct {
    RegistrationForm *models.RegistrationForm `json:"registration_form,omitempty"`
    Plates           []models.Plate           `json:"plates,omitempty"`
    User             *models.User             `json:"user_record,omitempty"`
}

func ScannerWS(
    plateRepo   repository.PlateRepository,
    regFormRepo repository.RegistrationFormRepository,
    userRepo    *repository.UserRepository,
    vehicleRepo repository.VehicleRepository,
) echo.HandlerFunc {
    return func(c echo.Context) error {
        ctx := c.Request().Context()
        ws, err := Upgrader.Upgrade(c.Response().Writer, c.Request(), nil)
        if err != nil {
            return err
        }
        defer ws.Close()

        for {
            // 1) Read message
            _, msg, err := ws.ReadMessage()
            if err != nil {
                log.Println("ws read error:", err)
                break
            }

            // 2) Unmarshal request
            var req PlateCheckRequest
            if err := json.Unmarshal(msg, &req); err != nil {
                log.Println("json unmarshal error:", err)
                ws.WriteJSON(PlateCheckResponse{Status: "bad_request"})
                continue
            }
            log.Printf("[DEBUG] Received request: %+v", req)

            // Prepare variables
            var (
                validity string
                details  *DetailPack
                rec      *models.Plate
                veh      *models.Vehicle
            )

            // 3a) Try plate lookup
            rec, err = plateRepo.GetByPlateNumber(ctx, req.Plate)
            if err != nil {
                log.Println("db lookup error:", err)
                validity = "error"

            } else if rec != nil {
                // Real plate found
                if rec.PLATE_EXPIRATION_DATE.Valid && rec.PLATE_EXPIRATION_DATE.Time.Before(time.Now()) {
                    validity = "expired"
                } else {
                    validity = "valid"
                }
                details = fetchDetails(ctx, rec.VEHICLE_ID, regFormRepo, plateRepo, userRepo)

            } else {
                // 3b) No plate → try MV-file lookup
                veh, err = vehicleRepo.GetByMVFileNumber(ctx, req.Plate)
                if err != nil {
                    log.Println("vehicle lookup error:", err)
                    validity = "error"

                } else if veh != nil {
                    validity = "valid"
                    details = fetchDetails(ctx, veh.VEHICLE_ID, regFormRepo, plateRepo, userRepo)

                    // Override with a single Temporary-plate record
                    temp := models.Plate{
                        VEHICLE_ID:            veh.VEHICLE_ID,
                        PLATE_NUMBER:          veh.MV_FILE_NUMBER,
                        PLATE_TYPE:            "Temporary",
                        PLATE_ISSUE_DATE:      sql.NullTime{},
                        PLATE_EXPIRATION_DATE: sql.NullTime{},
                        STATUS:                "Temporary",
                    }
                    details.Plates = []models.Plate{temp}

                } else {
                    // Neither plate nor MV-file
                    validity = "not_found"
                }
            }

            // 4) Send WS response
            resp := PlateCheckResponse{
                Plate:   req.Plate,
                Status:  validity,
                Details: details,
            }
            if err := ws.WriteJSON(resp); err != nil {
                log.Println("ws write error:", err)
                break
            }
            log.Printf("[DEBUG] Sent response: %+v", resp)

            // 5) Log the scan (only if a non-empty plate string was sent)
            if req.Plate != "" {
                logEntry := &models.ScanLog{
                    ScannedAt: time.Now(),
                }

                // If we found a real plate, record its ID
                if rec != nil {
                    logEntry.PlateID = sql.NullString{String: rec.PlateID, Valid: true}
                }

                // If a registration form exists (real or temp), record those IDs
                if details != nil && details.RegistrationForm != nil {
                    rf := details.RegistrationForm
                    logEntry.RegistrationID = sql.NullString{String: rf.RegistrationFormID, Valid: true}
                    logEntry.LTOClientID = sql.NullString{String: rf.LTOClientID, Valid: true}
                }

                if err := scanLogRepo.Create(ctx, logEntry); err != nil {
                    log.Printf("scan_log create error: %v", err)
                }
            }
        }

        return nil
    }
}

func fetchDetails(
    ctx context.Context,
    vehicleID string,
    regFormRepo repository.RegistrationFormRepository,
    plateRepo   repository.PlateRepository,
    userRepo    *repository.UserRepository,
) *DetailPack {
    rf, _  := regFormRepo.GetByVehicleID(ctx, vehicleID)
    pls, _ := plateRepo.GetPlatesByVehicleID(ctx, vehicleID)
    var usr *models.User
    if rf != nil {
        u, _ := userRepo.GetByLTOClientID(rf.LTOClientID)
        usr = &u
    }
    return &DetailPack{
        RegistrationForm: rf,
        Plates:           pls,
        User:             usr,
    }
}
