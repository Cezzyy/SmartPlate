package models

import (
  "database/sql"
  "time"
)

type ScanLog struct {
  LogID          string         `db:"log_id"           json:"log_id"`
  PlateID        sql.NullString `db:"plate_id"         json:"plate_id"`
  RegistrationID sql.NullString `db:"registration_id"  json:"registration_id"`
  LTOClientID    sql.NullString `db:"lto_client_id"    json:"lto_client_id"`
  ScannedAt      time.Time      `db:"scanned_at"       json:"scanned_at"`
}