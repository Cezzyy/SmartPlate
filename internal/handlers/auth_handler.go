package handlers

import (
    "database/sql"
    "net/http"
    "time"
    "log"

    "github.com/labstack/echo/v4"

    "smartplate-api/internal/email"
    "smartplate-api/internal/models"
    "smartplate-api/internal/repository"
)

type AuthHandler struct {
    userRepo  repository.UserRepository
    tokenRepo repository.PasswordResetTokenRepository
}

func NewAuthHandler(
    userRepo repository.UserRepository,
    tokenRepo repository.PasswordResetTokenRepository,
) *AuthHandler {
    return &AuthHandler{
        userRepo:  userRepo,
        tokenRepo: tokenRepo,
    }
}

func (h *AuthHandler) RequestPasswordReset(c echo.Context) error {
    // 1) bind input (e.g. JSON with { "email": "user@example.com" })
    var req struct { Email string `json:"email"` }
    if err := c.Bind(&req); err != nil {
        return echo.NewHTTPError(http.StatusBadRequest, "invalid payload")
    }

    // 2) look up user by email
    user, err := h.userRepo.GetByEmail(req.Email)
    if err == sql.ErrNoRows {
        // for security, don’t reveal whether email exists
        return c.NoContent(http.StatusAccepted)
    } else if err != nil {
        return err
    }

    // 3) create a token row in password_reset_token
    token := generateSecureToken() // e.g. crypto/rand → hex
    expires := time.Now().Add(1 * time.Hour)
    if err := h.tokenRepo.Create(&models.PasswordResetToken{
        LTOClientID: user.LTOClientID, // or user.ID
        Token:       token,
        ExpiresAt:   expires,
    }); err != nil {
        return err
    }

    // 4) send the email (fire-and-forget or handle error)
    go func() {
        if err := email.SendResetEmail(user.Email, token); err != nil {
            log.Printf("email error: %v", err)
        }
    }()

    // 5) always respond “accepted” so attackers can’t enumerate
    return c.NoContent(http.StatusAccepted)
}

