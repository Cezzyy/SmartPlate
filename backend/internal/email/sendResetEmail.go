package email

import (
    "fmt"
    "os"
    "gopkg.in/gomail.v2"
)

// sendResetEmail sends the reset link containing the token.
func SendResetEmail(toEmail, token string) error {
    host := os.Getenv("SMTP_HOST")
    port := 587 // or parse os.Getenv("SMTP_PORT") as int
    user := os.Getenv("SMTP_USER")
    pass := os.Getenv("SMTP_PASS")
    base := os.Getenv("APP_BASE_URL")

    resetURL := fmt.Sprintf("%s/reset-password?token=%s", base, token)
    subject := "🔒 Your Password Reset Link"
    body := fmt.Sprintf(`<p>You requested a password reset. Click below:</p>
        <p><a href="%s">Reset your password</a></p>
        <p>If you didn’t ask for this, just ignore.</p>`, resetURL)

    m := gomail.NewMessage()
    m.SetHeader("From", user)
    m.SetHeader("To", toEmail)
    m.SetHeader("Subject", subject)
    m.SetBody("text/html", body)

    d := gomail.NewDialer(host, port, user, pass)
    // d.TLSConfig = &tls.Config{InsecureSkipVerify: true} // not recommended

    return d.DialAndSend(m)
}
