package main

import (
	"fmt"
	"log"
	"net/http"
	"os"
	"smartplate-api/internal/database"
	"smartplate-api/internal/handlers"
	"smartplate-api/internal/repository"
	"smartplate-api/internal/ws"

	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
	"github.com/rs/zerolog"
)

func main() {
	e := echo.New()
	// Initialize database connection
	db, err := database.Connect()
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}
	defer db.Close()


	// Middleware
	e.Use(middleware.Logger())
	e.Use(middleware.Recover())
	
	// Enhanced CORS configuration
	e.Use(middleware.CORSWithConfig(middleware.CORSConfig{
		AllowOrigins:     []string{"http://localhost:5173", "http://localhost:5174"},
		AllowMethods:     []string{http.MethodGet, http.MethodPost, http.MethodPut, http.MethodDelete, http.MethodOptions},
		AllowHeaders:     []string{echo.HeaderOrigin, echo.HeaderContentType, echo.HeaderAccept, echo.HeaderAuthorization},
		ExposeHeaders:    []string{"Content-Length", "Content-Type"},
		AllowCredentials: true,
		MaxAge:           3600,
	}))
	//security suggestion??
	e.Use(middleware.SecureWithConfig(middleware.SecureConfig{
		XSSProtection:         "1; mode=block",
		ContentTypeNosniff:    "nosniff",
		XFrameOptions:         "DENY",
		HSTSMaxAge:            31536000,
		ContentSecurityPolicy: "default-src 'self'",
	}))
	// Vehicle routes
	e.GET("/", func(c echo.Context) error {
		return c.String(http.StatusOK, "Server is running")
	})

	// Initialize repositories and handlers
	userRepo := repository.NewUserRepository(db)
	userHandler := handlers.NewUserHandler(userRepo)

	e.POST("/users", userHandler.CreateUser)//working
	e.GET("/users", userHandler.GetAllUsers)//working
	e.GET("/users/:id", userHandler.GetUserByID)//working
	e.GET("/users/email/:email", userHandler.GetUserByEmail)//working
	e.PUT("/users/:id", userHandler.UpdateUser)	//working
	e.DELETE("/users/:id", userHandler.DeleteUser)//working

	//for getting user by lto client id
	e.GET("/users/lto/:lto_client_id", userHandler.GetUserByLTOID)//working
	e.PUT("/users/by-lto/:lto_client_id", userHandler.UpdateUserByLTO)//working
	e.DELETE("/users/by-lto/:lto_client_id", userHandler.DeleteUserByLTO)//working
	//for generating lto client id
	// e.GET("/generate-lto-id", userHandler.GenerateLTOID)  

	//for Vehicle routes
	vh := handlers.NewVehicleHandler(repository.NewVehicleRepository(db))

	e.POST   ("/api/vehicles",       vh.CreateVehicle)//working
	e.GET    ("/api/vehicles",       vh.GetAllVehicles)//working

	e.GET    ("/api/vehicles/:id",   vh.GetVehicle)//working
	e.PUT    ("/api/vehicles/:id",   vh.UpdateVehicle) //working
	e.DELETE ("/api/vehicles/:id",   vh.DeleteVehicle)//working

	e.GET    ("/api/vehicles/lto/:lto_client_id", vh.GetByClientID)//working
	e.PUT    ("/api/vehicles/lto/:lto_client_id", vh.UpdateByClientID)//working
	e.DELETE ("/api/vehicles/lto/:lto_client_id", vh.DeleteByClientID)//working

	//for plates routes
	// plateRepo    := repository.NewPlateRepository(db)
	plateRepo := repository.NewPlateRepository(db)
	plateHandler := handlers.NewPlateHandler(plateRepo)
	
	p := e.Group("/api/vehicles/:vehicle_id/plates")
	p.POST   ("",               plateHandler.CreatePlate)//working
	p.GET    ("",               plateHandler.GetPlates)//working
	p.GET    ("/:plate_id",   plateHandler.GetPlateByID)//working
	p.PUT	 ("/:plate_id",   plateHandler.UpdatePlate)//working
	p.DELETE("/:plate_id",    plateHandler.DeletePlateByID)//working

	//registration routes
	rfRepo := repository.NewRegistrationFormRepository(db)
	riRepo := repository.NewRegistrationInspectionRepository(db)
	rpRepo := repository.NewRegistrationPaymentRepository(db)
	rdRepo := repository.NewRegistrationDocumentRepository(db)
	vRepo := repository.NewVehicleRepository(db)
	
	rh := handlers.NewRegistrationHandler(rfRepo, riRepo, rpRepo, rdRepo, vRepo)
	g := e.Group("/api/registration-form")
	g.POST("", rh.CreateForm)//working
	g.GET("", rh.GetAllForms)//working
	g.GET("/:id", rh.GetFormByID)//working
	g.PUT("/:id", rh.UpdateForm)//working
	g.DELETE("/:id", rh.DeleteForm)//working
	g.GET("/:id/full", rh.GetFull)

	// inspection
	g.POST("/:id/inspection", rh.CreateInspection)//working
	g.GET("/:id/inspection", rh.GetInspections)//working
	g.GET("/:id/inspection/:inspId", rh.GetInspection)//working
	g.PUT("/:id/inspection/:inspId", rh.UpdateInspection)//working
	g.DELETE("/:id/inspection/:inspId", rh.DeleteInspection)//working

	// payment
	g.POST("/:id/payment", rh.CreatePayment)//working
	g.GET("/:id/payment", rh.GetPayments)//working
	g.GET("/:id/payment/:payId", rh.GetPayment)//working
	g.PUT("/:id/payment/:payId", rh.UpdatePayment)//working
	g.DELETE("/:id/payment/:payId", rh.DeletePayment)//woriking

	// document
	g.POST("/:id/document", rh.CreateDocument)//working
	g.GET("/:id/document", rh.GetDocuments)//working
	g.GET("/:id/document/:docId", rh.GetDocument)//working
	g.PUT("/:id/document/:docId", rh.UpdateDocument)//working
	g.DELETE("/:id/document/:docId", rh.DeleteDocument)//working

	//websocket
	scanLogRepo := repository.NewScanLogRepository(db)
	ws.SetScanLogRepository(scanLogRepo)
	e.GET("/ws/scan", ws.ScannerWS(plateRepo, rfRepo, userRepo))

// scan-log endpoints
	scanLogHandler   := handlers.NewScanLogHandler(scanLogRepo)
	e.POST("/api/scan-log", scanLogHandler.Create)
	e.GET( "/api/scan-log", scanLogHandler.GetAll)
	e.GET( "/api/scan-log/:id", scanLogHandler.GetByID)

	// // Start server
	logger := zerolog.New(os.Stdout).With().Timestamp().Logger()
e.Use(middleware.RequestLoggerWithConfig(middleware.RequestLoggerConfig{
    LogStatus: true,
    LogURI:    true,
    LogMethod: true,
    LogValuesFunc: func(c echo.Context, v middleware.RequestLoggerValues) error {
        logger.Info().
            Str("URI", v.URI).
            Str("method", v.Method).
            Int("status", v.Status).
            Msg("request")
        return nil
    },
}))
fmt.Println("Registered routes:")
for _, route := range e.Routes() {
    fmt.Printf("%-6s %s\n", route.Method, route.Path)
}
// Then start the server
e.Logger.Fatal(e.Start(":8081"))
}

