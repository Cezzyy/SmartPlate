package repository

import (
	"context"

	"smartplate-api/internal/models"

	"github.com/jmoiron/sqlx"
)

type RegistrationPaymentRepository interface {
    Create(ctx context.Context, p *models.RegistrationPayment) error
    GetByFormID(ctx context.Context, formID string) ([]models.RegistrationPayment, error)
    GetByID(ctx context.Context, id string) (*models.RegistrationPayment, error)
    Update(ctx context.Context, p *models.RegistrationPayment) error
    Delete(ctx context.Context, id string) error
}

type registrationPaymentRepo struct {
    db *sqlx.DB
}

func NewRegistrationPaymentRepository(db *sqlx.DB) RegistrationPaymentRepository {
    return &registrationPaymentRepo{db: db}
}

func (r *registrationPaymentRepo) Create(
    ctx context.Context,
    p *models.RegistrationPayment,
) error {
    return r.db.
        QueryRowxContext(ctx, `
            INSERT INTO registration_payment
              (registration_form_id, payment_status, payment_code,
               amount_paid, payment_method, payment_date, payment_notes, payment_details)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            RETURNING payment_id
        `,
            p.RegistrationFormID,
            p.PaymentStatus,
            p.PaymentCode,
            p.AmountPaid,
            p.PaymentMethod,
            p.PaymentDate,
            p.PaymentNotes,
            p.PaymentDetails,
        ).
        Scan(&p.PaymentID)
}


func (r *registrationPaymentRepo) GetByFormID(ctx context.Context, formID string) ([]models.RegistrationPayment, error) {
    out := make([]models.RegistrationPayment, 0)
    err := r.db.SelectContext(ctx, &out, `
        SELECT payment_id,
               registration_form_id,
               payment_status,
               payment_code,
               amount_paid,
               payment_method,
               payment_date,
               payment_notes,
               payment_details
          FROM registration_payment
         WHERE registration_form_id = $1
         ORDER BY payment_date DESC
    `, formID)
    return out, err
}

func (r *registrationPaymentRepo) GetByID(ctx context.Context, id string) (*models.RegistrationPayment, error) {
    var p models.RegistrationPayment
    err := r.db.GetContext(ctx, &p, `
        SELECT payment_id,
               registration_form_id,
               payment_status,
               payment_code,
               amount_paid,
               payment_method,
               payment_date,
               payment_notes,
               payment_details
          FROM registration_payment
         WHERE payment_id = $1
    `, id)
    if err != nil {
        return nil, err
    }
    return &p, nil
}

func (r *registrationPaymentRepo) Update(ctx context.Context, p *models.RegistrationPayment) error {
    _, err := r.db.NamedExecContext(ctx, `
        UPDATE registration_payment SET
          payment_status  = :payment_status,
          payment_code    = :payment_code,
          amount_paid     = :amount_paid,
          payment_method  = :payment_method,
          payment_date    = :payment_date,
          payment_notes   = :payment_notes,
          payment_details = :payment_details
        WHERE payment_id = :payment_id
    `, p)
    return err
}

func (r *registrationPaymentRepo) Delete(ctx context.Context, id string) error {
    _, err := r.db.ExecContext(ctx, `
        DELETE FROM registration_payment
         WHERE payment_id = $1
    `, id)
    return err
}
