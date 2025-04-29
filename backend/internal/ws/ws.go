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

type PlateCheckRequest struct {
	Plate     string `json:"plate"`
	Timestamp string `json:"timestamp"`
}

type PlateCheckResponse struct {
	Plate   string      `json:"plate"`
	Status  string      `json:"status"` // valid, expired, not_issued, not_found, error
	Details *DetailPack `json:"details,omitempty"`
}

type DetailPack struct {
	RegistrationForm *models.RegistrationForm `json:"registration_form,omitempty"`
	Plates           []models.Plate           `json:"plates,omitempty"`
	User             *models.User             `json:"user_record,omitempty"`
}

func ScannerWS(
	plateRepo repository.PlateRepository,
	regFormRepo repository.RegistrationFormRepository,
	userRepo *repository.UserRepository,
	vehicleRepo repository.VehicleRepository, // ← new
) echo.HandlerFunc {
	return func(c echo.Context) error {
		ctx := c.Request().Context()
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

			var (
				validity string
				details  *DetailPack
			)

			rec, err := plateRepo.GetByPlateNumber(ctx, req.Plate)
			if err != nil {
				log.Println("db lookup error:", err)
				validity = "error"

			} else if rec != nil {
				// Plate exists
				if rec.PLATE_EXPIRATION_DATE.Valid && rec.PLATE_EXPIRATION_DATE.Time.Before(time.Now()) {
					validity = "expired"
				} else {
					validity = "valid"
				}
				details = fetchDetails(ctx, rec.VEHICLE_ID, regFormRepo, plateRepo, userRepo)

			} else {
				// --- 2) No plate → try MV file lookup ---
				veh, err := vehicleRepo.GetByMVFileNumber(ctx, req.Plate)
				if err != nil {
					log.Println("vehicle lookup error:", err)
					validity = "error"

				} else if veh != nil {
					// treat MV‐file scans as a valid temporary plate
					validity = "valid"
					details = fetchDetails(ctx, veh.VEHICLE_ID, regFormRepo, plateRepo, userRepo)

					temp := models.Plate{
						VEHICLE_ID:            veh.VEHICLE_ID,
						PLATE_NUMBER:          veh.MV_FILE_NUMBER,
						PLATE_TYPE:            "Temporary",
						PLATE_ISSUE_DATE:      sql.NullTime{}, // null
						PLATE_EXPIRATION_DATE: sql.NullTime{}, // null
						STATUS:                "Temporary",
					}
					details.Plates = []models.Plate{temp}

				} else {
					// --- 3) Neither a plate nor MV file matches ---
					validity = "not_found"
				}
			}

			resp := PlateCheckResponse{
				Plate:   req.Plate,
				Status:  validity,
				Details: details,
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

func fetchDetails(
	ctx context.Context,
	vehicleID string,
	regFormRepo repository.RegistrationFormRepository,
	plateRepo repository.PlateRepository,
	userRepo *repository.UserRepository,
) *DetailPack {
	rf, _ := regFormRepo.GetByVehicleID(ctx, vehicleID)
	pls, _ := plateRepo.GetPlatesByVehicleID(ctx, vehicleID)
	var usr *models.User
	if rf != nil {
		u, _ := userRepo.GetByLTOClientID(rf.LTOClientID)
		usr = &u
	}
	return &DetailPack{RegistrationForm: rf, Plates: pls, User: usr}
}
