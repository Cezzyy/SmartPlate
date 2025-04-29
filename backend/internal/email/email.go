package email

import (
	"bytes"
	"fmt"
	"html/template"
	"log"
	"net/smtp"
	"os"
	"strings"

	"github.com/joho/godotenv"
)

// EmailConfig holds the configuration for sending emails
type EmailConfig struct {
	SMTPHost     string
	SMTPPort     string
	SMTPUsername string
	SMTPPassword string
	FromEmail    string
	FromName     string
	FrontendURL  string
}

// Global email configuration
var config EmailConfig

// Initialize email configuration from environment variables
func init() {
	_ = godotenv.Load("../.env")

	config = EmailConfig{
		SMTPHost:     getEnv("SMTP_HOST", "smtp.gmail.com"),
		SMTPPort:     getEnv("SMTP_PORT", "587"),
		SMTPUsername: getEnv("SMTP_USERNAME", ""),
		SMTPPassword: getEnv("SMTP_PASSWORD", ""),
		FromEmail:    getEnv("FROM_EMAIL", "noreply@smartplate.com"),
		FromName:     getEnv("FROM_NAME", "SmartPlate"),
		FrontendURL:  getEnv("FRONTEND_URL", "http://localhost:5173"),
	}

	// Log configuration status but don't expose sensitive data
	if config.SMTPUsername == "" || config.SMTPPassword == "" {
		log.Println("Warning: SMTP credentials not configured. Email sending will be simulated.")
	} else {
		log.Println("Email configuration loaded successfully.")
	}
}

// Helper function to get environment variable with fallback
func getEnv(key, fallback string) string {
	value, exists := os.LookupEnv(key)
	if !exists {
		return fallback
	}
	return value
}

// SendResetEmail sends a password reset email to the user
func SendResetEmail(recipientEmail string, token string) error {
	// Create the reset link using the configured frontend URL
	resetLink := fmt.Sprintf("%s/reset-password?token=%s", config.FrontendURL, token)

	// If SMTP credentials are not configured, just log the email (for development)
	if config.SMTPUsername == "" || config.SMTPPassword == "" {
		log.Printf("[DEV MODE] Password reset requested for %s", recipientEmail)
		log.Printf("[DEV MODE] Reset link: %s", resetLink)
		return nil
	}

	// Prepare email data
	emailData := map[string]string{
		"RecipientName": strings.Split(recipientEmail, "@")[0], // Simple name extraction
		"ResetLink":     resetLink,
		"CompanyName":   config.FromName,
		"SupportEmail":  config.FromEmail,
	}

	// Generate email content
	subject := "Password Reset Request"
	htmlBody, err := generateHTMLEmail(emailData)
	if err != nil {
		log.Printf("Failed to generate email: %v", err)
		return fmt.Errorf("failed to generate email: %w", err)
	}

	// For development/testing, we can skip actual sending
	if os.Getenv("SKIP_EMAIL_SENDING") == "true" {
		log.Printf("[SKIP EMAIL] Would have sent reset email to: %s", recipientEmail)
		log.Printf("[SKIP EMAIL] Reset link: %s", resetLink)
		return nil
	}

	// Send the email
	if err := sendEmail(recipientEmail, subject, htmlBody); err != nil {
		log.Printf("Failed to send email: %v", err)
		return err
	}

	log.Printf("Password reset email sent successfully to %s", recipientEmail)
	return nil
}

// sendEmail handles the actual sending of the email via SMTP
func sendEmail(to, subject, htmlBody string) error {
	// Set up authentication information
	auth := smtp.PlainAuth("", config.SMTPUsername, config.SMTPPassword, config.SMTPHost)

	// Construct email headers
	from := fmt.Sprintf("%s <%s>", config.FromName, config.FromEmail)
	mimeHeaders := "MIME-version: 1.0;\r\n" +
		"Content-Type: text/html; charset=UTF-8;\r\n" +
		"From: " + from + "\r\n" +
		"To: " + to + "\r\n" +
		"Subject: " + subject + "\r\n"

	// Combine headers and body
	message := []byte(mimeHeaders + "\r\n" + htmlBody)

	// Send the email
	smtpAddr := fmt.Sprintf("%s:%s", config.SMTPHost, config.SMTPPort)
	err := smtp.SendMail(smtpAddr, auth, config.FromEmail, []string{to}, message)
	if err != nil {
		return fmt.Errorf("failed to send email: %w", err)
	}

	log.Printf("Password reset email sent successfully to %s", to)
	return nil
}

// generateHTMLEmail creates the HTML content for the password reset email
func generateHTMLEmail(data map[string]string) (string, error) {
	// HTML template for the password reset email
	const emailTemplate = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Password Reset</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
        }
        .header {
            text-align: center;
            padding-bottom: 20px;
            border-bottom: 1px solid #eee;
        }
        .content {
            padding: 20px 0;
        }
        .button {
            display: inline-block;
            padding: 10px 20px;
            background-color: #4CAF50;
            color: white;
            text-decoration: none;
            border-radius: 4px;
            margin: 20px 0;
        }
        .footer {
            padding-top: 20px;
            border-top: 1px solid #eee;
            text-align: center;
            font-size: 0.8em;
            color: #777;
        }
    </style>
</head>
<body>
    <div class="header">
        <h2>Password Reset Request</h2>
    </div>
    <div class="content">
        <p>Hello {{.RecipientName}},</p>
        <p>We received a request to reset your password for your SmartPlate account. If you didn't make this request, you can safely ignore this email.</p>
        <p>To reset your password, click the button below:</p>
        <p style="text-align: center;">
            <a href="{{.ResetLink}}" class="button">Reset Password</a>
        </p>
        <p>Or copy and paste this link into your browser:</p>
        <p>{{.ResetLink}}</p>
        <p>This link will expire in 1 hour for security reasons.</p>
        <p>Thank you,<br>The {{.CompanyName}} Team</p>
    </div>
    <div class="footer">
        <p>If you need any assistance, please contact us at {{.SupportEmail}}</p>
        <p>&copy; {{.CompanyName}}. All rights reserved.</p>
    </div>
</body>
</html>
`

	// Parse the template
	tmpl, err := template.New("resetEmail").Parse(emailTemplate)
	if err != nil {
		return "", err
	}

	// Execute the template with the provided data
	var buf bytes.Buffer
	if err := tmpl.Execute(&buf, data); err != nil {
		return "", err
	}

	return buf.String(), nil
}
