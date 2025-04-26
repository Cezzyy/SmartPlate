package repository

import (
	"context"

	"smartplate-api/internal/models"

	"github.com/jmoiron/sqlx"
)

type RegistrationDocumentRepository interface {
    Create(ctx context.Context, d *models.RegistrationDocument) error
    GetByFormID(ctx context.Context, formID string) ([]models.RegistrationDocument, error)
    GetByID(ctx context.Context, id string) (*models.RegistrationDocument, error)
    Update(ctx context.Context, d *models.RegistrationDocument) error
    Delete(ctx context.Context, id string) error
}

type registrationDocumentRepo struct {
    db *sqlx.DB
}

func NewRegistrationDocumentRepository(db *sqlx.DB) RegistrationDocumentRepository {
    return &registrationDocumentRepo{db: db}
}

func (r *registrationDocumentRepo) Create(ctx context.Context, d *models.RegistrationDocument) error {
    return r.db.QueryRowxContext(ctx, `
        INSERT INTO registration_document
          (registration_form_id, doc_type, filename, file_size)
        VALUES ($1, $2, $3, $4)
        RETURNING document_id, uploaded_at
    `, d.RegistrationFormID, d.DocType, d.Filename, d.FileSize).
        Scan(&d.DocumentID, &d.UploadedAt)
}

func (r *registrationDocumentRepo) GetByFormID(ctx context.Context, formID string) ([]models.RegistrationDocument, error) {
    var out []models.RegistrationDocument
    err := r.db.SelectContext(ctx, &out, `
        SELECT document_id,
               registration_form_id,
               doc_type,
               filename,
               file_size,
               uploaded_at
          FROM registration_document
         WHERE registration_form_id = $1
         ORDER BY uploaded_at DESC
    `, formID)
    return out, err
}

func (r *registrationDocumentRepo) GetByID(ctx context.Context, id string) (*models.RegistrationDocument, error) {
    var d models.RegistrationDocument
    err := r.db.GetContext(ctx, &d, `
        SELECT document_id,
               registration_form_id,
               doc_type,
               filename,
               file_size,
               uploaded_at
          FROM registration_document
         WHERE document_id = $1
    `, id)
    if err != nil {
        return nil, err
    }
    return &d, nil
}

func (r *registrationDocumentRepo) Update(ctx context.Context, d *models.RegistrationDocument) error {
    _, err := r.db.NamedExecContext(ctx, `
        UPDATE registration_document SET
          doc_type  = :doc_type,
          filename  = :filename,
          file_size = :file_size
        WHERE document_id = :document_id
    `, d)
    return err
}

func (r *registrationDocumentRepo) Delete(ctx context.Context, id string) error {
    _, err := r.db.ExecContext(ctx, `
        DELETE FROM registration_document
         WHERE document_id = $1
    `, id)
    return err
}
