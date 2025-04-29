package handlers

import (
	"database/sql"
	"log"
	"net/http"
	"time"

	"github.com/labstack/echo/v4"
	"golang.org/x/crypto/bcrypt"
)

// ResetPasswordRequest defines the structure for the reset password request
type ResetPasswordRequest struct {
	Token    string `json:"token"`
	Password string `json:"password"`
}

// ResetPassword handles the password reset process
func (h *AuthHandler) ResetPassword(c echo.Context) error {
	// Parse request body
	var req ResetPasswordRequest
	if err := c.Bind(&req); err != nil {
		log.Printf("Reset password error - invalid request body: %v", err)
		return c.JSON(http.StatusBadRequest, map[string]string{
			"error": "Invalid request body",
		})
	}

	log.Printf("Processing password reset request with token: %s", req.Token)

	// Validate input
	if req.Token == "" || req.Password == "" {
		log.Printf("Reset password error - missing token or password")
		return c.JSON(http.StatusBadRequest, map[string]string{
			"error": "Token and password are required",
		})
	}

	// Validate password length
	if len(req.Password) < 8 {
		log.Printf("Reset password error - password too short")
		return c.JSON(http.StatusBadRequest, map[string]string{
			"error": "Password must be at least 8 characters long",
		})
	}

	// Find token in database
	token, err := h.tokenRepo.GetByToken(req.Token)
	if err != nil {
		if err == sql.ErrNoRows {
			log.Printf("Reset password error - token not found: %s", req.Token)
			return c.JSON(http.StatusNotFound, map[string]string{
				"error": "Invalid or expired token",
			})
		}
		log.Printf("Reset password error - database error when verifying token: %v", err)
		return c.JSON(http.StatusInternalServerError, map[string]string{
			"error": "Failed to verify token",
		})
	}

	// Check if token is expired
	if token.ExpiresAt.Before(time.Now()) {
		log.Printf("Reset password error - token expired: %s", req.Token)
		return c.JSON(http.StatusBadRequest, map[string]string{
			"error": "Token has expired",
		})
	}

	log.Printf("Token verified successfully, updating password for user: %s", token.LTOClientID)

	// Hash the new password
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		log.Printf("Reset password error - failed to hash password: %v", err)
		return c.JSON(http.StatusInternalServerError, map[string]string{
			"error": "Failed to process password",
		})
	}

	// Update user's password
	user, err := h.userRepo.GetByLTOClientID(token.LTOClientID)
	if err != nil {
		log.Printf("Reset password error - failed to find user: %s, error: %v", token.LTOClientID, err)
		return c.JSON(http.StatusInternalServerError, map[string]string{
			"error": "Failed to find user account",
		})
	}

	// Update the password
	user.PASSWORD = string(hashedPassword)
	if err := h.userRepo.Update(&user); err != nil {
		log.Printf("Reset password error - failed to update password: %v", err)
		return c.JSON(http.StatusInternalServerError, map[string]string{
			"error": "Failed to update password",
		})
	}

	// Mark the token as used
	// Instead of deleting, we should update the used_at field
	if err := h.tokenRepo.MarkTokenAsUsed(req.Token); err != nil {
		log.Printf("Reset password warning - failed to mark token as used: %v", err)
		// Continue despite this error
	}

	log.Printf("Password reset successful for user: %s", token.LTOClientID)

	// Return success response
	return c.JSON(http.StatusOK, map[string]string{
		"message": "Password has been reset successfully",
	})
}
