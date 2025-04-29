package handlers

import (
	"database/sql"
	"log"
	"net/http"
	"strings"
	"time"

	"github.com/golang-jwt/jwt"
	"github.com/labstack/echo/v4"
	"golang.org/x/crypto/bcrypt"

	"smartplate-api/internal/email"
	"smartplate-api/internal/models"
	"smartplate-api/internal/repository"
)

var jwtSecret = []byte("your-secret-key") // In production, use environment variable

type AuthHandler struct {
	userRepo  *repository.UserRepository
	tokenRepo repository.PasswordResetTokenRepository
}

func NewAuthHandler(
	userRepo *repository.UserRepository,
	tokenRepo repository.PasswordResetTokenRepository,
) *AuthHandler {
	return &AuthHandler{
		userRepo:  userRepo,
		tokenRepo: tokenRepo,
	}
}

// LoginRequest defines the structure for the login request
type LoginRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

// LoginResponse defines the structure for the login response
type LoginResponse struct {
	Token string      `json:"token"`
	User  models.User `json:"user"`
}

// Login handles user authentication and returns a JWT token
func (h *AuthHandler) Login(c echo.Context) error {
	// Parse request body
	var req LoginRequest
	if err := c.Bind(&req); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{
			"error": "Invalid request body",
		})
	}

	// Find user by email
	user, err := h.userRepo.GetByEmail(req.Email)
	if err != nil {
		if err == sql.ErrNoRows {
			return c.JSON(http.StatusUnauthorized, map[string]string{
				"error": "Invalid email or password",
			})
		}
		log.Printf("Login error - user lookup: %v", err)
		return c.JSON(http.StatusInternalServerError, map[string]string{
			"error": "Server error during authentication",
		})
	}

	// Verify password
	if err := bcrypt.CompareHashAndPassword([]byte(user.PASSWORD), []byte(req.Password)); err != nil {
		return c.JSON(http.StatusUnauthorized, map[string]string{
			"error": "Invalid email or password",
		})
	}

	// Generate JWT token
	token, err := generateJWTToken(user)
	if err != nil {
		log.Printf("Login error - token generation: %v", err)
		return c.JSON(http.StatusInternalServerError, map[string]string{
			"error": "Failed to generate authentication token",
		})
	}

	// Mask password before returning user data
	user.PASSWORD = ""

	// Return token and user data
	return c.JSON(http.StatusOK, LoginResponse{
		Token: token,
		User:  user,
	})
}

// AdminLogin handles authentication specifically for admin and LTO officer users
func (h *AuthHandler) AdminLogin(c echo.Context) error {
	// Parse request body
	var req LoginRequest
	if err := c.Bind(&req); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{
			"error": "Invalid request body",
		})
	}

	// Find user by email
	user, err := h.userRepo.GetByEmail(req.Email)
	if err != nil {
		if err == sql.ErrNoRows {
			return c.JSON(http.StatusUnauthorized, map[string]string{
				"error": "Invalid email or password",
			})
		}
		log.Printf("Admin login error - user lookup: %v", err)
		return c.JSON(http.StatusInternalServerError, map[string]string{
			"error": "Server error during authentication",
		})
	}

	// Verify password
	if err := bcrypt.CompareHashAndPassword([]byte(user.PASSWORD), []byte(req.Password)); err != nil {
		return c.JSON(http.StatusUnauthorized, map[string]string{
			"error": "Invalid email or password",
		})
	}

	// Check if the user has admin or LTO officer role
	userRole := strings.ToLower(user.ROLE)
	if userRole != "admin" && userRole != "lto officer" {
		return c.JSON(http.StatusForbidden, map[string]string{
			"error": "Unauthorized: This portal is only for Administrators and LTO Officers",
		})
	}

	// Generate JWT token with admin claims
	token, err := generateAdminJWTToken(user)
	if err != nil {
		log.Printf("Admin login error - token generation: %v", err)
		return c.JSON(http.StatusInternalServerError, map[string]string{
			"error": "Failed to generate authentication token",
		})
	}

	// Mask password before returning user data
	user.PASSWORD = ""

	// Return token and user data
	return c.JSON(http.StatusOK, LoginResponse{
		Token: token,
		User:  user,
	})
}

// Generate JWT token for authenticated user
func generateJWTToken(user models.User) (string, error) {
	// Create token with claims
	token := jwt.New(jwt.SigningMethodHS256)
	claims := token.Claims.(jwt.MapClaims)
	claims["sub"] = user.LTO_CLIENT_ID // Subject (user ID)
	claims["name"] = user.FIRST_NAME + " " + user.LAST_NAME
	claims["email"] = user.EMAIL
	claims["role"] = user.ROLE
	claims["exp"] = time.Now().Add(time.Hour * 24 * 7).Unix() // 7 days expiration
	claims["iat"] = time.Now().Unix()                         // Issued at

	// Sign the token with our secret
	tokenString, err := token.SignedString(jwtSecret)
	if err != nil {
		return "", err
	}

	return tokenString, nil
}

// Generate JWT token specifically for admin or LTO officer users
func generateAdminJWTToken(user models.User) (string, error) {
	// Create token with claims
	token := jwt.New(jwt.SigningMethodHS256)
	claims := token.Claims.(jwt.MapClaims)
	claims["sub"] = user.LTO_CLIENT_ID // Subject (user ID)
	claims["name"] = user.FIRST_NAME + " " + user.LAST_NAME
	claims["email"] = user.EMAIL
	claims["role"] = user.ROLE
	claims["isAdmin"] = strings.ToLower(user.ROLE) == "admin"
	claims["isLtoOfficer"] = strings.ToLower(user.ROLE) == "lto officer"
	claims["exp"] = time.Now().Add(time.Hour * 12).Unix() // 12 hours expiration for admin tokens
	claims["iat"] = time.Now().Unix()                     // Issued at

	// Sign the token with our secret
	tokenString, err := token.SignedString(jwtSecret)
	if err != nil {
		return "", err
	}

	return tokenString, nil
}

func (h *AuthHandler) RequestPasswordReset(c echo.Context) error {
	// 1) bind input (e.g. JSON with { "email": "user@example.com" })
	var req struct {
		Email string `json:"email"`
	}
	if err := c.Bind(&req); err != nil {
		log.Printf("Password reset error - invalid payload: %v", err)
		return echo.NewHTTPError(http.StatusBadRequest, "invalid payload")
	}

	log.Printf("Received password reset request for email: %s", req.Email)

	// 2) look up user by email
	user, err := h.userRepo.GetByEmail(req.Email)
	if err == sql.ErrNoRows {
		log.Printf("Password reset requested for non-existent email: %s", req.Email)
		// Don't expose if email exists or not - security best practice
		return c.NoContent(http.StatusAccepted)
	} else if err != nil {
		log.Printf("Password reset error - user lookup: %v", err)
		return c.JSON(http.StatusInternalServerError, map[string]string{
			"error": "Server error during password reset",
		})
	}

	// 3) create a token row in password_reset_token
	token := generateSecureToken()
	expires := time.Now().Add(1 * time.Hour)

	// Log before attempting to create token
	log.Printf("Creating password reset token for user ID: %s", user.LTO_CLIENT_ID)

	resetToken := &models.PasswordResetToken{
		LTOClientID: user.LTO_CLIENT_ID,
		Token:       token,
		ExpiresAt:   expires,
	}

	if err := h.tokenRepo.Create(resetToken); err != nil {
		log.Printf("Password reset error - token creation: %v", err)
		return c.JSON(http.StatusInternalServerError, map[string]string{
			"error": "Server error during password reset",
		})
	}

	// 4) send the email (now handled synchronously to catch errors)
	log.Printf("Sending password reset email to: %s", user.EMAIL)
	if err := email.SendResetEmail(user.EMAIL, token); err != nil {
		log.Printf("Email error during password reset: %v", err)
		// Continue despite email error - we'll still return success
	}

	log.Printf("Password reset request completed successfully for: %s", req.Email)

	// 5) always respond "accepted" so attackers can't enumerate
	return c.NoContent(http.StatusAccepted)
}

// Simple secure token generator
func generateSecureToken() string {
	return "reset-" + time.Now().Format("20060102150405")
}
