// internal/repository/plate_repository.go
package repository

import (
    "context"
    "fmt"
	"strings"
    "database/sql"
    "smartplate-api/internal/models"

    "github.com/jmoiron/sqlx"
)

type PlateRepository interface {
    CreatePlate(ctx context.Context, p *models.Plate) (*models.Plate, error)
    GetPlateByID(ctx context.Context, vehicleID, plateID string) (*models.Plate, error)
    UpdatePlate(ctx context.Context, vehicleID, plateID string, fields map[string]interface{}) error
    DeletePlateByID(ctx context.Context, vehicleID, plateID string) error
  
    GetByPlateNumber(ctx context.Context, plateNumber string) (*models.Plate, error)
    GetPlatesByVehicleID(ctx context.Context, vehicleID string) ([]models.Plate, error)
  }
  

type plateRepo struct {
    db *sqlx.DB
}

func NewPlateRepository(db *sqlx.DB) PlateRepository {
    return &plateRepo{db}
}
//for the checker
func (r *plateRepo) GetByPlateNumber(ctx context.Context, plateNumber string) (*models.Plate, error) {
    var p models.Plate
    const q = `
        SELECT plate_id, vehicle_id, plate_number, plate_type,
               plate_issue_date, plate_expiration_date, status
          FROM plates
         WHERE plate_number = $1
    `
    err := r.db.GetContext(ctx, &p, q, plateNumber)
    if err == sql.ErrNoRows {
        return nil, nil
    }
    if err != nil {
        return nil, err
    }
    return &p, nil
}


func (r *plateRepo) CreatePlate(ctx context.Context, p *models.Plate) (*models.Plate, error) {
    const q = `
    INSERT INTO plates (
      plate_id, vehicle_id, plate_number, plate_type,
      plate_issue_date, plate_expiration_date, status
    ) VALUES (
      gen_random_uuid(), :vehicle_id, :plate_number, :plate_type,
      :plate_issue_date, :plate_expiration_date, :status
    )
    RETURNING plate_id;
    `
    rows, err := r.db.NamedQueryContext(ctx, q, p)
    if err != nil {
        return nil, err
    }
    defer rows.Close()
    if rows.Next() {
        if err := rows.Scan(&p.PlateID); err != nil {
            return nil, err
        }
    }
    return p, nil
}

func (r *plateRepo) GetPlatesByVehicleID(ctx context.Context, vehicleID string) ([]models.Plate, error) {
    var list []models.Plate
    const q = `
      SELECT plate_id, vehicle_id, plate_number, plate_type,
             plate_issue_date, plate_expiration_date, status
        FROM plates
       WHERE vehicle_id = $1
       ORDER BY plate_issue_date DESC
    `
    if err := r.db.SelectContext(ctx, &list, q, vehicleID); err != nil {
        return nil, err
    }
    return list, nil
}

func (r *plateRepo) GetPlateByID(ctx context.Context, vehicleID, plateID string) (*models.Plate, error) {
    var p models.Plate
    const q = `
      SELECT plate_id, vehicle_id, plate_number, plate_type,
             plate_issue_date, plate_expiration_date, status
        FROM plates
       WHERE vehicle_id = $1
         AND plate_id   = $2
    `
    if err := r.db.GetContext(ctx, &p, q, vehicleID, plateID); err != nil {
        return nil, fmt.Errorf("not found")
    }
    return &p, nil
}

func (r *plateRepo) UpdatePlate(
    ctx context.Context,
    vehicleID, plateID string,
    fields map[string]interface{},
) error {
    // remove PK fields so client can't overwrite them
    delete(fields, "vehicle_id")
    delete(fields, "plate_id")

    if len(fields) == 0 {
        return nil
    }

    // build SET clause
    setClauses := make([]string, 0, len(fields))
    for col := range fields {
        setClauses = append(setClauses, fmt.Sprintf("%s = :%s", col, col))
    }

    // bind PKs for WHERE
    fields["vehicle_id"] = vehicleID
    fields["plate_id"]   = plateID

    query := fmt.Sprintf(
        "UPDATE plates SET %s WHERE vehicle_id = :vehicle_id AND plate_id = :plate_id",
        strings.Join(setClauses, ", "),
    )
    _, err := r.db.NamedExecContext(ctx, query, fields)
    return err
}

func (r *plateRepo) DeletePlateByID(ctx context.Context, vehicleID, plateID string) error {
    const q = `
      DELETE FROM plates
       WHERE vehicle_id = $1
         AND plate_id   = $2
    `
    _, err := r.db.ExecContext(ctx, q, vehicleID, plateID)
    return err
}
