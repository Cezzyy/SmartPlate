package repository

import (
	"context"

	"smartplate-api/internal/models"

	"github.com/jmoiron/sqlx"
)

type RegistrationInspectionRepository interface {
    Create(ctx context.Context, i *models.RegistrationInspection) error
    GetByFormID(ctx context.Context, formID string) ([]models.RegistrationInspection, error)
    GetByID(ctx context.Context, id string) (*models.RegistrationInspection, error)
    Update(ctx context.Context, i *models.RegistrationInspection) error
    Delete(ctx context.Context, id string) error
}

type registrationInspectionRepo struct {
    db *sqlx.DB
}

func NewRegistrationInspectionRepository(db *sqlx.DB) RegistrationInspectionRepository {
    return &registrationInspectionRepo{db: db}
}

func (r *registrationInspectionRepo) Create(ctx context.Context, i *models.RegistrationInspection) error {
    return r.db.QueryRowxContext(ctx, `
    INSERT INTO registration_inspection
      (registration_form_id, inspection_status, inspection_code, inspection_notes)
    VALUES ($1,$2,$3,$4)
    RETURNING inspection_id, inspected_at
  `, i.RegistrationFormID, i.InspectionStatus, i.InspectionCode, i.InspectionNotes).
    Scan(&i.InspectionID, &i.InspectedAt)
}

func (r *registrationInspectionRepo) GetByFormID(ctx context.Context, formID string) ([]models.RegistrationInspection, error) {
    var out []models.RegistrationInspection
    err := r.db.SelectContext(ctx, &out, `
        SELECT inspection_id,
               registration_form_id,
               inspection_status,
               inspection_code,
               inspection_notes,
               inspected_at
          FROM registration_inspection
         WHERE registration_form_id = $1
         ORDER BY inspected_at DESC
    `, formID)
    return out, err
}

func (r *registrationInspectionRepo) GetByID(ctx context.Context, id string) (*models.RegistrationInspection, error) {
    var i models.RegistrationInspection
    err := r.db.GetContext(ctx, &i, `
        SELECT inspection_id,
               registration_form_id,
               inspection_status,
               inspection_code,
               inspection_notes,
               inspected_at
          FROM registration_inspection
         WHERE inspection_id = $1
    `, id)
    if err != nil {
        return nil, err
    }
    return &i, nil
}

func (r *registrationInspectionRepo) Update(ctx context.Context, i *models.RegistrationInspection) error {
    _, err := r.db.NamedExecContext(ctx, `
        UPDATE registration_inspection SET
          inspection_status = :inspection_status,
          inspection_code   = :inspection_code,
          inspection_notes  = :inspection_notes
        WHERE inspection_id = :inspection_id
    `, i)
    return err
}

func (r *registrationInspectionRepo) Delete(ctx context.Context, id string) error {
    _, err := r.db.ExecContext(ctx, `
        DELETE FROM registration_inspection
         WHERE inspection_id = $1
    `, id)
    return err
}
