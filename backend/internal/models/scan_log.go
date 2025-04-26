package models

import "time"

type ScanLog struct {
    LogID          string    `db:"log_id"`
    PlateID        string    `db:"plate_id"`
    RegistrationID string    `db:"registration_id"`
    LTOClientID    string    `db:"lto_client_id"`
    ScannedAt      time.Time `db:"scanned_at"`
}
