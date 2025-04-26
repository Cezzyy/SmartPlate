package repository

import (
    "context"
    "database/sql"
    "fmt"
    "smartplate-api/internal/models"

    "github.com/jmoiron/sqlx"
)

// ScanLogRepository defines methods for scan_log operations.
type ScanLogRepository interface {
    Create(ctx context.Context, log *models.ScanLog) error
    GetAll(ctx context.Context) ([]models.ScanLog, error)
    GetByID(ctx context.Context, id string) (*models.ScanLog, error)
}

type scanLogRepo struct {
    db *sqlx.DB
}

// NewScanLogRepository returns a new ScanLogRepository backed by sqlx.DB.
func NewScanLogRepository(db *sqlx.DB) ScanLogRepository {
    return &scanLogRepo{db: db}
}

// Create inserts a new scan log entry into the database.
func (r *scanLogRepo) Create(ctx context.Context, logEntry *models.ScanLog) error {
    const q = `
    INSERT INTO scan_log (
      log_id, plate_id, registration_id, lto_client_id, scanned_at
    ) VALUES (
      gen_random_uuid(), $1, $2, $3, $4
    )`
    if _, err := r.db.ExecContext(ctx, q,
        logEntry.PlateID,
        logEntry.RegistrationID,
        logEntry.LTOClientID,
        logEntry.ScannedAt,
    ); err != nil {
        return fmt.Errorf("insert scan_log: %w", err)
    }
    return nil
}

// GetAll retrieves all scan log entries, ordered by scanned_at descending.
func (r *scanLogRepo) GetAll(ctx context.Context) ([]models.ScanLog, error) {
    var logs []models.ScanLog
    const q = `
    SELECT
      log_id, plate_id, registration_id, lto_client_id, scanned_at
    FROM scan_log
    ORDER BY scanned_at DESC` 
    if err := r.db.SelectContext(ctx, &logs, q); err != nil {
        return nil, fmt.Errorf("select all scan_log: %w", err)
    }
    return logs, nil
}

// GetByID retrieves a single scan log entry by its log_id.
func (r *scanLogRepo) GetByID(ctx context.Context, id string) (*models.ScanLog, error) {
    var entry models.ScanLog
    const q = `
    SELECT
      log_id, plate_id, registration_id, lto_client_id, scanned_at
    FROM scan_log
    WHERE log_id = $1` 
    err := r.db.GetContext(ctx, &entry, q, id)
    if err == sql.ErrNoRows {
        return nil, nil
    }
    if err != nil {
        return nil, fmt.Errorf("select scan_log by id: %w", err)
    }
    return &entry, nil
}
