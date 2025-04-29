package repository

import (
	"database/sql"
	"log"
	"time"

	"github.com/jmoiron/sqlx"

	"smartplate-api/internal/models"
)

// PasswordResetTokenRepository interface defines methods for password reset tokens
type PasswordResetTokenRepository interface {
	Create(token *models.PasswordResetToken) error
	GetByToken(token string) (*models.PasswordResetToken, error)
	DeleteExpired() error
	MarkTokenAsUsed(token string) error
}

// SQLPasswordResetTokenRepository implements PasswordResetTokenRepository with SQL DB
type SQLPasswordResetTokenRepository struct {
	db *sqlx.DB
}

// NewPasswordResetTokenRepository creates a new repository for password reset tokens
func NewPasswordResetTokenRepository(db *sqlx.DB) PasswordResetTokenRepository {
	return &SQLPasswordResetTokenRepository{db: db}
}

// Create inserts a new password reset token in the database
func (r *SQLPasswordResetTokenRepository) Create(token *models.PasswordResetToken) error {
	query := `
		INSERT INTO password_reset_token (lto_client_id, token, expires_at, used_at)
		VALUES ($1, $2, $3, NULL)
	`

	log.Printf("Inserting password reset token for LTO client ID: %s, Token: %s", token.LTOClientID, token.Token)

	result, err := r.db.Exec(query, token.LTOClientID, token.Token, token.ExpiresAt)
	if err != nil {
		log.Printf("Error inserting password reset token: %v", err)
		return err
	}

	rows, _ := result.RowsAffected()
	log.Printf("Password reset token inserted successfully. Rows affected: %d", rows)

	return nil
}

// GetByToken retrieves a password reset token by its token string
func (r *SQLPasswordResetTokenRepository) GetByToken(token string) (*models.PasswordResetToken, error) {
	query := `
		SELECT password_reset_token_id, lto_client_id, token, expires_at, used_at, created_at 
		FROM password_reset_token
		WHERE token = $1 AND expires_at > $2 AND used_at IS NULL
	`

	log.Printf("Looking up token: %s", token)

	var resetToken models.PasswordResetToken
	var usedAt sql.NullTime

	err := r.db.QueryRow(query, token, time.Now()).Scan(
		&resetToken.ID,
		&resetToken.LTOClientID,
		&resetToken.Token,
		&resetToken.ExpiresAt,
		&usedAt,
		&resetToken.CreatedAt,
	)

	if err != nil {
		log.Printf("Error retrieving token: %v", err)
		return nil, err
	}

	if usedAt.Valid {
		resetToken.UsedAt = &usedAt.Time
		log.Printf("Token found but has been used at: %v", usedAt.Time)
	} else {
		log.Printf("Token found and is valid: %s, expires: %v", token, resetToken.ExpiresAt)
	}

	return &resetToken, nil
}

// DeleteExpired removes expired tokens from the database
func (r *SQLPasswordResetTokenRepository) DeleteExpired() error {
	query := `DELETE FROM password_reset_token WHERE expires_at <= $1`
	_, err := r.db.Exec(query, time.Now())
	return err
}

// MarkTokenAsUsed marks a token as used by setting its used_at timestamp
func (r *SQLPasswordResetTokenRepository) MarkTokenAsUsed(token string) error {
	query := `UPDATE password_reset_token SET used_at = $1 WHERE token = $2`

	log.Printf("Marking token as used: %s", token)

	result, err := r.db.Exec(query, time.Now(), token)
	if err != nil {
		log.Printf("Error marking token as used: %v", err)
		return err
	}

	rows, _ := result.RowsAffected()
	log.Printf("Token marked as used. Rows affected: %d", rows)

	return nil
}
