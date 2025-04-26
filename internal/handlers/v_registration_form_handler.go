package handlers

import (
	"encoding/json"
	"net/http"
	"smartplate-api/internal/models"
	"smartplate-api/internal/repository"
	"time"

	"github.com/labstack/echo/v4"
)

type RegistrationHandler struct {
    formRepo    repository.RegistrationFormRepository
    inspRepo    repository.RegistrationInspectionRepository
    payRepo     repository.RegistrationPaymentRepository
    docRepo     repository.RegistrationDocumentRepository
    vehicleRepo repository.VehicleRepository
}

func NewRegistrationHandler(
    fr repository.RegistrationFormRepository,
    ir repository.RegistrationInspectionRepository,
    pr repository.RegistrationPaymentRepository,
    dr repository.RegistrationDocumentRepository,
    vr repository.VehicleRepository,            // ← add vehicle repo
) *RegistrationHandler {
    return &RegistrationHandler{
        formRepo:    fr,
        inspRepo:    ir,
        payRepo:     pr,
        docRepo:     dr,
        vehicleRepo: vr,                        // ← store it
    }
}

// --- Form CRUD ---

func (h *RegistrationHandler) CreateForm(c echo.Context) error {
    var params models.CreateRegistrationFormParams
    if err := c.Bind(&params); err != nil {
        return c.JSON(http.StatusBadRequest, err.Error())
    }

    // Now pass ONLY the DTO to the repo
    full, err := h.formRepo.Create(c.Request().Context(), &params)
    if err != nil {
        return c.JSON(http.StatusInternalServerError, err.Error())
    }

    return c.JSON(http.StatusCreated, full)
}

func (h *RegistrationHandler) GetAllForms(c echo.Context) error {
    out, err := h.formRepo.GetAll(c.Request().Context())
    if err != nil {
        return c.JSON(http.StatusInternalServerError, err.Error())
    }
    return c.JSON(http.StatusOK, out)
}

func (h *RegistrationHandler) GetFormByID(c echo.Context) error {
    id := c.Param("id")
    f, err := h.formRepo.GetByID(c.Request().Context(), id)
    if err != nil {
        return c.JSON(http.StatusNotFound, err.Error())
    }
    return c.JSON(http.StatusOK, f)
}

func (h *RegistrationHandler) UpdateForm(c echo.Context) error {
    id := c.Param("id")

    // 1) load existing
    existing, err := h.formRepo.GetByID(c.Request().Context(), id)
    if err != nil {
        return c.JSON(http.StatusNotFound, err.Error())
    }

    // 2) bind only what was sent
    var patch struct {
        Status           *string `json:"status"`
        RegistrationType *string `json:"registration_type"`
        LTOClientID      *string `json:"lto_client_id"`
        VehicleID        *string `json:"vehicle_id"`
    }
    if err := c.Bind(&patch); err != nil {
        return c.JSON(http.StatusBadRequest, err.Error())
    }

    // overlay fields
    if patch.Status != nil {
        existing.Status = *patch.Status
    }
    if patch.RegistrationType != nil {
        existing.RegistrationType = *patch.RegistrationType
    }
    if patch.LTOClientID != nil {
        existing.LTOClientID = *patch.LTOClientID
    }
    if patch.VehicleID != nil {
        existing.VehicleID = *patch.VehicleID
    }

    // 3) save full object
    if err := h.formRepo.Update(c.Request().Context(), existing); err != nil {
        return c.JSON(http.StatusInternalServerError, err.Error())
    }
    return c.NoContent(http.StatusNoContent)
}


func (h *RegistrationHandler) DeleteForm(c echo.Context) error {
    id := c.Param("id")
    if err := h.formRepo.Delete(c.Request().Context(), id); err != nil {
        return c.JSON(http.StatusInternalServerError, err.Error())
    }
    return c.NoContent(http.StatusNoContent)
}

// --- Full GET ---

type FullRegistration struct {
    models.RegistrationForm
    Vehicle     *models.Vehicle             `json:"vehicle"`     // ← include vehicle
    Inspections []models.RegistrationInspection `json:"inspections"`
    Payments    []models.RegistrationPayment    `json:"payments"`
    Documents   []models.RegistrationDocument   `json:"documents"`
}

func (h *RegistrationHandler) GetFull(c echo.Context) error {
    ctx := c.Request().Context()
    id  := c.Param("id")

    // 1) Load the form
    form, err := h.formRepo.GetByID(ctx, id)
    if err != nil {
        return c.JSON(http.StatusNotFound, err.Error())
    }

    // 2) Load the vehicle
    veh, err := h.vehicleRepo.GetVehicleByID(ctx, form.VehicleID)
    if err != nil {
        // If you’d rather not fail the whole request, you could
        // set veh = nil and continue; here we return 404
        return c.JSON(http.StatusNotFound, "vehicle not found")
    }

    // 3) Load inspections
    insps, err := h.inspRepo.GetByFormID(ctx, id)
    if err != nil {
        return c.JSON(http.StatusInternalServerError, err.Error())
    }
    if insps == nil {
        insps = make([]models.RegistrationInspection, 0)
    }

    // 4) Load payments
    pays, err := h.payRepo.GetByFormID(ctx, id)
    if err != nil {
        return c.JSON(http.StatusInternalServerError, err.Error())
    }
    if pays == nil {
        pays = make([]models.RegistrationPayment, 0)
    }

    // 5) Load documents
    docs, err := h.docRepo.GetByFormID(ctx, id)
    if err != nil {
        return c.JSON(http.StatusInternalServerError, err.Error())
    }
    if docs == nil {
        docs = make([]models.RegistrationDocument, 0)
    }

    // 6) Assemble and return
    full := FullRegistration{
        RegistrationForm: *form,
        Vehicle:          veh,
        Inspections:      insps,
        Payments:         pays,
        Documents:        docs,
    }
    return c.JSON(http.StatusOK, full)
}

// --- Inspection CRUD ---

func (h *RegistrationHandler) CreateInspection(c echo.Context) error {
    formID := c.Param("id")
    var i models.RegistrationInspection
    if err := c.Bind(&i); err != nil {
        return c.JSON(http.StatusBadRequest, err.Error())
    }
    i.RegistrationFormID = formID
    if err := h.inspRepo.Create(c.Request().Context(), &i); err != nil {
        return c.JSON(http.StatusInternalServerError, err.Error())
    }
    return c.JSON(http.StatusCreated, i)
}

func (h *RegistrationHandler) GetInspections(c echo.Context) error {
    formID := c.Param("id")
    insps, err := h.inspRepo.GetByFormID(c.Request().Context(), formID)
    if err != nil {
        return c.JSON(http.StatusInternalServerError, err.Error())
    }
    return c.JSON(http.StatusOK, insps)
}

func (h *RegistrationHandler) GetInspection(c echo.Context) error {
    inspID := c.Param("inspId")
    insp, err := h.inspRepo.GetByID(c.Request().Context(), inspID)
    if err != nil {
        return c.JSON(http.StatusNotFound, err.Error())
    }
    return c.JSON(http.StatusOK, insp)
}

func (h *RegistrationHandler) UpdateInspection(c echo.Context) error {
    formID := c.Param("id")
    inspID := c.Param("inspId")
    var i models.RegistrationInspection
    if err := c.Bind(&i); err != nil {
        return c.JSON(http.StatusBadRequest, err.Error())
    }
    i.RegistrationFormID = formID
    i.InspectionID = inspID
    if err := h.inspRepo.Update(c.Request().Context(), &i); err != nil {
        return c.JSON(http.StatusInternalServerError, err.Error())
    }
    return c.NoContent(http.StatusNoContent)
}

func (h *RegistrationHandler) DeleteInspection(c echo.Context) error {
    inspID := c.Param("inspId")
    if err := h.inspRepo.Delete(c.Request().Context(), inspID); err != nil {
        return c.JSON(http.StatusInternalServerError, err.Error())
    }
    return c.NoContent(http.StatusNoContent)
}

// --- Payment CRUD ---

func (h *RegistrationHandler) CreatePayment(c echo.Context) error {
    // 1. grab the form ID from the URL
    formID := c.Param("id")

    // 2. bind the incoming JSON (with no registration_form_id in it)
    var p models.RegistrationPayment
    if err := c.Bind(&p); err != nil {
        return c.JSON(http.StatusBadRequest, err.Error())
    }

    // 3. *override* whatever was in p.RegistrationFormID so it's guaranteed valid
    p.RegistrationFormID = formID

    // (optional) check the form actually exists
    if _, err := h.formRepo.GetByID(c.Request().Context(), formID); err != nil {
        return c.JSON(http.StatusBadRequest, "registration form not found")
    }

    // 4. create the payment
    if err := h.payRepo.Create(c.Request().Context(), &p); err != nil {
        return c.JSON(http.StatusInternalServerError, err.Error())
    }
    return c.JSON(http.StatusCreated, p)
}


func (h *RegistrationHandler) GetPayments(c echo.Context) error {
    formID := c.Param("id")
    pays, err := h.payRepo.GetByFormID(c.Request().Context(), formID)
    if err != nil {
        return c.JSON(http.StatusInternalServerError, err.Error())
    }
    return c.JSON(http.StatusOK, pays)
}

func (h *RegistrationHandler) GetPayment(c echo.Context) error {
    payID := c.Param("payId")
    pay, err := h.payRepo.GetByID(c.Request().Context(), payID)
    if err != nil {
        return c.JSON(http.StatusNotFound, err.Error())
    }
    return c.JSON(http.StatusOK, pay)
}

func (h *RegistrationHandler) UpdatePayment(c echo.Context) error {
    payID := c.Param("payId")

    // 1) load the existing row
    existing, err := h.payRepo.GetByID(c.Request().Context(), payID)
    if err != nil {
        return c.JSON(http.StatusNotFound, err.Error())
    }

    // 2) bind only the updatable fields into a small struct
    var patch struct {
        PaymentStatus  *string           `json:"payment_status"`
        PaymentCode    *string           `json:"payment_code"`
        AmountPaid     *float64          `json:"amount_paid"`
        PaymentMethod  *string           `json:"payment_method"`
        PaymentDate    *time.Time        `json:"payment_date"`
        PaymentNotes   *string           `json:"payment_notes"`
        PaymentDetails *json.RawMessage  `json:"payment_details"`
    }
    if err := c.Bind(&patch); err != nil {
        return c.JSON(http.StatusBadRequest, err.Error())
    }

    // 3) overlay only the fields that were non-nil
    if patch.PaymentStatus != nil {
        existing.PaymentStatus = *patch.PaymentStatus
    }
    if patch.PaymentCode != nil {
        existing.PaymentCode = *patch.PaymentCode
    }
    if patch.AmountPaid != nil {
        existing.AmountPaid = patch.AmountPaid
    }
    if patch.PaymentMethod != nil {
        existing.PaymentMethod = patch.PaymentMethod
    }
    if patch.PaymentDate != nil {
        existing.PaymentDate = patch.PaymentDate
    }
    if patch.PaymentNotes != nil {
        existing.PaymentNotes = patch.PaymentNotes
    }
    if patch.PaymentDetails != nil {
        existing.PaymentDetails = *patch.PaymentDetails
    }

    // 4) persist the merged object
    if err := h.payRepo.Update(c.Request().Context(), existing); err != nil {
        return c.JSON(http.StatusInternalServerError, err.Error())
    }
    return c.NoContent(http.StatusNoContent)
}

func (h *RegistrationHandler) DeletePayment(c echo.Context) error {
    payID := c.Param("payId")
    if err := h.payRepo.Delete(c.Request().Context(), payID); err != nil {
        return c.JSON(http.StatusInternalServerError, err.Error())
    }
    return c.NoContent(http.StatusNoContent)
}

// --- Document CRUD ---

func (h *RegistrationHandler) CreateDocument(c echo.Context) error {
    formID := c.Param("id")
    var d models.RegistrationDocument
    if err := c.Bind(&d); err != nil {
        return c.JSON(http.StatusBadRequest, err.Error())
    }
    d.RegistrationFormID = formID
    if err := h.docRepo.Create(c.Request().Context(), &d); err != nil {
        return c.JSON(http.StatusInternalServerError, err.Error())
    }
    return c.JSON(http.StatusCreated, d)
}

func (h *RegistrationHandler) GetDocuments(c echo.Context) error {
    formID := c.Param("id")
    docs, err := h.docRepo.GetByFormID(c.Request().Context(), formID)
    if err != nil {
        return c.JSON(http.StatusInternalServerError, err.Error())
    }
    return c.JSON(http.StatusOK, docs)
}

func (h *RegistrationHandler) GetDocument(c echo.Context) error {
    docID := c.Param("docId")
    doc, err := h.docRepo.GetByID(c.Request().Context(), docID)
    if err != nil {
        return c.JSON(http.StatusNotFound, err.Error())
    }
    return c.JSON(http.StatusOK, doc)
}

func (h *RegistrationHandler) UpdateDocument(c echo.Context) error {
    formID := c.Param("id")
    docID := c.Param("docId")
    var d models.RegistrationDocument
    if err := c.Bind(&d); err != nil {
        return c.JSON(http.StatusBadRequest, err.Error())
    }
    d.RegistrationFormID = formID
    d.DocumentID = docID
    if err := h.docRepo.Update(c.Request().Context(), &d); err != nil {
        return c.JSON(http.StatusInternalServerError, err.Error())
    }
    return c.NoContent(http.StatusNoContent)
}

func (h *RegistrationHandler) DeleteDocument(c echo.Context) error {
    docID := c.Param("docId")
    if err := h.docRepo.Delete(c.Request().Context(), docID); err != nil {
        return c.JSON(http.StatusInternalServerError, err.Error())
    }
    return c.NoContent(http.StatusNoContent)
}
