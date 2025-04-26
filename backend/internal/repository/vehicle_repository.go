// internal/repository/vehicle_repository.go
package repository

import (
    "context"
    "fmt"
    "strings"
    "smartplate-api/internal/models"

    "github.com/jmoiron/sqlx"
)

type VehicleRepository interface {
    CreateVehicle(ctx context.Context, v *models.Vehicle) (*models.Vehicle, error)
    GetAllVehicles(ctx context.Context) ([]models.Vehicle, error)
    GetVehicleByID(ctx context.Context, id string) (*models.Vehicle, error)
    UpdateVehicle(ctx context.Context, id string, fields map[string]interface{}) error
    DeleteVehicle(ctx context.Context, id string) error

    GetVehicleByClientID(ctx context.Context, clientID string) (*models.Vehicle, error)
    UpdateVehicleByClientID(ctx context.Context, clientID string, fields map[string]interface{}) error
    DeleteVehicleByClientID(ctx context.Context, clientID string) error
}

type vehicleRepo struct {
    db *sqlx.DB
}

func NewVehicleRepository(db *sqlx.DB) VehicleRepository {
    return &vehicleRepo{db}
}

func (r *vehicleRepo) CreateVehicle(ctx context.Context, v *models.Vehicle) (*models.Vehicle, error) {
    query := `
    INSERT INTO vehicles (
        vehicle_category, mv_file_number, vehicle_make, vehicle_series, vehicle_type,
        body_type, year_model, engine_model, engine_number, chassis_number,
        piston_displacement, number_of_cylinders, fuel_type, color, gvw,
        net_weight, shipping_weight, usage_classification,
        first_registration_date, late_renewal_date, registration_expiry_date,
        lto_office_code, classification, denomination, or_number, cr_number,
        lto_client_id
    ) VALUES (
        :vehicle_category, :mv_file_number, :vehicle_make, :vehicle_series, :vehicle_type,
        :body_type, :year_model, :engine_model, :engine_number, :chassis_number,
        :piston_displacement, :number_of_cylinders, :fuel_type, :color, :gvw,
        :net_weight, :shipping_weight, :usage_classification,
        :first_registration_date, :late_renewal_date, :registration_expiry_date,
        :lto_office_code, :classification, :denomination, :or_number, :cr_number,
        :lto_client_id
    )
    RETURNING vehicle_id;
    `
    rows, err := r.db.NamedQueryContext(ctx, query, v)
    if err != nil {
        return nil, err
    }
    defer rows.Close()

    if rows.Next() {
        if err := rows.Scan(&v.VEHICLE_ID); err != nil {
            return nil, err
        }
    }
    return v, nil
}

func (r *vehicleRepo) GetAllVehicles(ctx context.Context) ([]models.Vehicle, error) {
    var list []models.Vehicle
    err := r.db.SelectContext(ctx, &list, "SELECT * FROM vehicles ORDER BY vehicle_id")
    return list, err
}

func (r *vehicleRepo) GetVehicleByID(ctx context.Context, id string) (*models.Vehicle, error) {
    var v models.Vehicle
    if err := r.db.GetContext(ctx, &v, "SELECT * FROM vehicles WHERE vehicle_id = $1", id); err != nil {
        return nil, fmt.Errorf("not found")
    }
    return &v, nil
}

func (r *vehicleRepo) UpdateVehicle(ctx context.Context, id string, fields map[string]interface{}) error {
    delete(fields, "id")
    delete(fields, "vehicle_id")

    if len(fields) == 0 {
        return nil
    }

    setClauses := make([]string, 0, len(fields))
    for col := range fields {
        setClauses = append(setClauses, fmt.Sprintf("%s = :%s", col, col))
    }
    fields["vehicle_id"] = id

    query := fmt.Sprintf(
        "UPDATE vehicles SET %s WHERE vehicle_id = :vehicle_id",
        strings.Join(setClauses, ", "),
    )

    _, err := r.db.NamedExecContext(ctx, query, fields)
    return err
}

func (r *vehicleRepo) DeleteVehicle(ctx context.Context, id string) error {
    _, err := r.db.ExecContext(ctx, "DELETE FROM vehicles WHERE vehicle_id = $1", id)
    return err
}

func (r *vehicleRepo) GetVehicleByClientID(ctx context.Context, clientID string) (*models.Vehicle, error) {
    var v models.Vehicle
    if err := r.db.GetContext(ctx, &v,
        "SELECT * FROM vehicles WHERE lto_client_id = $1", clientID,
    ); err != nil {
        return nil, fmt.Errorf("not found")
    }
    return &v, nil
}

func (r *vehicleRepo) UpdateVehicleByClientID(ctx context.Context, clientID string, fields map[string]interface{}) error {
    delete(fields, "lto_client_id")
    delete(fields, "vehicle_id")

    if len(fields) == 0 {
        return nil
    }

    setClauses := make([]string, 0, len(fields))
    for col := range fields {
        setClauses = append(setClauses, fmt.Sprintf("%s = :%s", col, col))
    }
    fields["lto_client_id"] = clientID

    query := fmt.Sprintf(
        "UPDATE vehicles SET %s WHERE lto_client_id = :lto_client_id",
        strings.Join(setClauses, ", "),
    )
    _, err := r.db.NamedExecContext(ctx, query, fields)
    return err
}

func (r *vehicleRepo) DeleteVehicleByClientID(ctx context.Context, clientID string) error {
    _, err := r.db.ExecContext(ctx,
        "DELETE FROM vehicles WHERE lto_client_id = $1", clientID,
    )
    return err
}

