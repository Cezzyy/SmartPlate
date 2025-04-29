package models

import "time"

// PasswordResetToken represents a token for resetting a user's password
type PasswordResetToken struct {
	ID          string     `json:"id" db:"password_reset_token_id"`
	LTOClientID string     `json:"lto_client_id" db:"lto_client_id"`
	Token       string     `json:"token" db:"token"`
	ExpiresAt   time.Time  `json:"expires_at" db:"expires_at"`
	UsedAt      *time.Time `json:"used_at" db:"used_at"`
	CreatedAt   time.Time  `json:"created_at" db:"created_at"`
}
