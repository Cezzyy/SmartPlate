import api from './api';
import type { Vehicle, Plate, Registration } from '@/types/vehicle';
import type {
  VehicleRegistrationForm,
  RegistrationInspection,
  RegistrationPayment
} from '@/types/vehicleRegistration';

// Vehicle API endpoints
const getVehiclesByUserId = async (userId: string): Promise<Vehicle[]> => {
  try {
    // Use the users/lto endpoint which is working according to main.go line 114
    console.log('Fetching vehicles for user ID:', userId);
    const response = await api.get(`/users/lto/${userId}`);

    // If user data is returned, extract vehicles if available
    if (response.data) {
      console.log('User data returned:', response.data);

      // Check if response contains vehicles info
      if (response.data.vehicles && Array.isArray(response.data.vehicles)) {
        return response.data.vehicles;
      }

      // If the response is already an array, return it directly
      if (Array.isArray(response.data)) {
        return response.data;
      }
    }

    console.log('No vehicles found for user');
    return [];
  } catch (error) {
    console.error('Error fetching user vehicles:', error);
    return [];
  }
};

const getVehicleById = async (vehicleId: string): Promise<Vehicle | null> => {
  try {
    const response = await api.get(`/api/vehicles/${vehicleId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching vehicle ${vehicleId}:`, error);
    return null;
  }
};

const getAllVehicles = async (): Promise<Vehicle[]> => {
  try {
    const response = await api.get(`/api/vehicles`);
    return response.data;
  } catch (error) {
    console.error('Error fetching all vehicles:', error);
    return [];
  }
};

// Plate API endpoints - Using the correct path
const getPlatesByVehicleId = async (vehicleId: string): Promise<Plate[]> => {
  try {
    console.log(`Fetching plates for vehicle ${vehicleId}`);
    const response = await api.get(`/api/vehicles/${vehicleId}/plates`);

    if (Array.isArray(response.data)) {
      return response.data;
    } else if (response.data && response.data.plates && Array.isArray(response.data.plates)) {
      return response.data.plates;
    }

    console.log(`No plates found for vehicle ${vehicleId}`);
    return [];
  } catch (error) {
    console.error(`Error fetching plates for vehicle ${vehicleId}:`, error);
    return [];
  }
};

// Use the correct plates endpoint structure
const getAllPlates = async (): Promise<Plate[]> => {
  try {
    // There's no direct endpoint for all plates, we need to get all vehicles first
    const vehicles = await getAllVehicles();

    if (!vehicles || vehicles.length === 0) {
      return [];
    }

    // Then get plates for each vehicle
    const plates: Plate[] = [];
    for (const vehicle of vehicles) {
      try {
        const vehiclePlates = await getPlatesByVehicleId(vehicle.VEHICLE_ID);
        if (vehiclePlates && vehiclePlates.length > 0) {
          plates.push(...vehiclePlates);
        }
      } catch (err) {
        console.warn(`Couldn't get plates for vehicle ${vehicle.VEHICLE_ID}:`, err);
      }
    }

    return plates;
  } catch (error) {
    console.error('Error fetching all plates:', error);
    return [];
  }
};

// Registration API endpoints
const getRegistrationsByUserId = async (userId: string): Promise<Registration[]> => {
  try {
    // There's no direct user endpoint, so we'll fetch all registrations and filter
    console.log(`Fetching registrations for user ${userId}`);
    const allRegistrations = await getAllRegistrations();

    if (!allRegistrations || allRegistrations.length === 0) {
      return [];
    }

    // Get user vehicles to filter registrations
    const userVehicles = await getVehiclesByUserId(userId);

    if (!userVehicles || userVehicles.length === 0) {
      return [];
    }

    // Filter registrations for user's vehicles
    const userVehicleIds = userVehicles.map(v => v.VEHICLE_ID);
    return allRegistrations.filter(reg =>
      userVehicleIds.includes(reg.VehicleID)
    );
  } catch (error) {
    console.error(`Error fetching registrations for user ${userId}:`, error);
    return [];
  }
};

const getRegistrationById = async (registrationId: string): Promise<Registration | null> => {
  try {
    // Skip API call for client-generated IDs which start with 'REG-' or 'REF-'
    if (registrationId.startsWith('REG-') || registrationId.startsWith('REF-')) {
      console.log(`Skipping API call for client-generated ID: ${registrationId}`);
      return null;
    }

    // Only make API call for backend-generated UUIDs
    console.log(`Fetching registration with UUID: ${registrationId}`);
    const response = await api.get(`/api/registration-form/${registrationId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching registration ${registrationId}:`, error);
    return null;
  }
};

const getAllRegistrations = async (): Promise<Registration[]> => {
  try {
    console.log('Fetching all registrations from registration-form endpoint');
    const response = await api.get('/api/registration-form');

    if (!response || !response.data) {
      console.warn('No response data received from registration endpoint');
      return [];
    }

    // Check if we received valid data
    if (Array.isArray(response.data)) {
      console.log(`Received ${response.data.length} registrations from API`);
      return response.data;
    }

    console.warn('Registration endpoint returned unexpected data format:', response.data);
    return [];
  } catch (error) {
    console.error('Error fetching all registrations:', error);
    throw error; // Propagate the error for proper handling in the store
  }
};

// Get full registration details including vehicle, payments, inspections, and documents
const getFullRegistrationById = async (registrationId: string): Promise<any> => {
  try {
    const response = await api.get(`/api/registration-form/${registrationId}/full`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching full registration ${registrationId}:`, error);
    return null;
  }
};

// Vehicle endpoints
const createVehicle = async (vehicleData: Partial<Vehicle>): Promise<Vehicle | null> => {
  try {
    const response = await api.post('/api/vehicles', vehicleData);
    return response.data;
  } catch (error) {
    console.error('Error creating vehicle:', error);
    return null;
  }
};

const getVehiclesByClientId = async (clientId: string): Promise<Vehicle[]> => {
  try {
    const response = await api.get(`/api/vehicles/lto/${clientId}`);
    return response.data || [];
  } catch (error) {
    console.error(`Error fetching vehicles for client ${clientId}:`, error);
    return [];
  }
};

const updateVehicle = async (vehicleId: string, vehicleData: Partial<Vehicle>): Promise<Vehicle | null> => {
  try {
    const response = await api.put(`/api/vehicles/${vehicleId}`, vehicleData);
    return response.data;
  } catch (error) {
    console.error(`Error updating vehicle ${vehicleId}:`, error);
    return null;
  }
};

// Plate endpoints
const createPlate = async (vehicleId: string, plateData: Partial<Plate>): Promise<Plate | null> => {
  try {
    const response = await api.post(`/api/vehicles/${vehicleId}/plates`, plateData);
    return response.data;
  } catch (error) {
    console.error(`Error creating plate for vehicle ${vehicleId}:`, error);
    return null;
  }
};

const updatePlate = async (vehicleId: string, plateId: string, plateData: Partial<Plate>): Promise<Plate | null> => {
  try {
    const response = await api.put(`/api/vehicles/${vehicleId}/plates/${plateId}`, plateData);
    return response.data;
  } catch (error) {
    console.error(`Error updating plate ${plateId}:`, error);
    return null;
  }
};

const generatePlateNumber = async (vehicleType: string, plateType: string = 'Private', region: string = 'NCR'): Promise<string | null> => {
  try {
    const response = await api.get(`/api/generate-plate/${vehicleType}?plateType=${plateType}&region=${region}`);
    return response.data.plate;
  } catch (error) {
    console.error('Error generating plate number:', error);
    return null;
  }
};

// Registration form endpoints
const createRegistrationForm = async (formData: Partial<VehicleRegistrationForm>): Promise<VehicleRegistrationForm | null> => {
  try {
    console.log(`Creating registration form for user: ${formData.userId}`);

    // Create backend CreateRegistrationFormParams structure
    const payload = {
      lto_client_id: formData.userId || '', // Required field
      vehicle_id: formData.vehicleId || '', // This may be empty for new vehicles
      status: formData.status || 'pending',
      region: formData.plateRegion || 'NCR', // Default to NCR
      registration_type: formData.registrationType || 'New Vehicle'
    };

    console.log('Sending registration form payload to backend:', payload);

    const response = await api.post('/api/registration-form', payload);
    console.log('Registration form creation response:', response.data);

    if (!response.data) {
      console.error('Empty response from registration form creation');
      return null;
    }

    // Create a merged object with frontend data + backend response
    const createdForm = {
      ...formData,
      id: response.data.registration_form_id || response.data.id || '',
      status: response.data.status || formData.status || 'pending',
      submissionDate: response.data.submitted_date || formData.submissionDate || new Date().toISOString().split('T')[0]
    };

    console.log('Merged form data:', createdForm);
    return createdForm as VehicleRegistrationForm;
  } catch (error: any) {
    console.error('Error creating registration form:', error);
    if (error.response) {
      console.error('Server response:', error.response.status, error.response.data);
    }
    return null;
  }
};

const getAllRegistrationForms = async (): Promise<VehicleRegistrationForm[]> => {
  try {
    const response = await api.get('/api/registration-form');
    return response.data || [];
  } catch (error) {
    console.error('Error fetching all registration forms:', error);
    return [];
  }
};

const updateRegistrationForm = async (
  registrationId: string,
  formData: Partial<VehicleRegistrationForm>
): Promise<VehicleRegistrationForm | null> => {
  try {
    console.log(`Updating registration form with ID: ${registrationId}`);

    // Map frontend fields to backend expected format
    const payload = {
      status: formData.status,
      registration_type: formData.registrationType,
      lto_client_id: formData.userId,
      vehicle_id: formData.vehicleId,
      region: formData.plateRegion
    };

    // Remove undefined fields
    Object.keys(payload).forEach(key => {
      if (payload[key as keyof typeof payload] === undefined) {
        delete payload[key as keyof typeof payload];
      }
    });

    console.log(`Sending update payload:`, payload);

    await api.put(`/api/registration-form/${registrationId}`, payload);
    console.log('Registration form updated successfully');

    // Return merged form data
    return {
      ...formData,
      id: registrationId // Ensure the ID remains the same
    } as VehicleRegistrationForm;
  } catch (error: any) {
    console.error(`Error updating registration form ${registrationId}:`, error);
    if (error.response) {
      console.error('Server response:', error.response.status, error.response.data);
    }
    return null;
  }
};

// Document endpoints
const uploadDocument = async (registrationId: string, documentType: string, file: File): Promise<any> => {
  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('documentType', documentType);

    const response = await api.post(`/api/registration-form/${registrationId}/document`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  } catch (error) {
    console.error(`Error uploading document for registration ${registrationId}:`, error);
    return null;
  }
};

const getDocuments = async (registrationId: string): Promise<any[]> => {
  try {
    const response = await api.get(`/api/registration-form/${registrationId}/document`);
    return response.data || [];
  } catch (error) {
    console.error(`Error fetching documents for registration ${registrationId}:`, error);
    return [];
  }
};

// Inspection endpoints
const createInspection = async (registrationId: string, inspectionData: Partial<RegistrationInspection>): Promise<RegistrationInspection | null> => {
  try {
    const response = await api.post(`/api/registration-form/${registrationId}/inspection`, inspectionData);
    return response.data;
  } catch (error) {
    console.error(`Error creating inspection for registration ${registrationId}:`, error);
    return null;
  }
};

const getInspections = async (registrationId: string): Promise<RegistrationInspection[]> => {
  try {
    const response = await api.get(`/api/registration-form/${registrationId}/inspection`);
    return response.data || [];
  } catch (error) {
    console.error(`Error fetching inspections for registration ${registrationId}:`, error);
    return [];
  }
};

const updateInspection = async (registrationId: string, inspectionId: string, inspectionData: Partial<RegistrationInspection>): Promise<RegistrationInspection | null> => {
  try {
    const response = await api.put(`/api/registration-form/${registrationId}/inspection/${inspectionId}`, inspectionData);
    return response.data;
  } catch (error) {
    console.error(`Error updating inspection ${inspectionId}:`, error);
    return null;
  }
};

// Payment endpoints
const createPayment = async (registrationId: string, paymentData: Partial<RegistrationPayment>): Promise<RegistrationPayment | null> => {
  try {
    const response = await api.post(`/api/registration-form/${registrationId}/payment`, paymentData);
    return response.data;
  } catch (error) {
    console.error(`Error creating payment for registration ${registrationId}:`, error);
    return null;
  }
};

const getPayments = async (registrationId: string): Promise<RegistrationPayment[]> => {
  try {
    const response = await api.get(`/api/registration-form/${registrationId}/payment`);
    return response.data || [];
  } catch (error) {
    console.error(`Error fetching payments for registration ${registrationId}:`, error);
    return [];
  }
};

const updatePayment = async (registrationId: string, paymentId: string, paymentData: Partial<RegistrationPayment>): Promise<RegistrationPayment | null> => {
  try {
    const response = await api.put(`/api/registration-form/${registrationId}/payment/${paymentId}`, paymentData);
    return response.data;
  } catch (error) {
    console.error(`Error updating payment ${paymentId}:`, error);
    return null;
  }
};

export {
  // Vehicle functions
  getVehiclesByUserId,
  createVehicle,
  getVehiclesByClientId,
  getVehicleById,
  getAllVehicles,
  updateVehicle,

  // Plate functions
  getPlatesByVehicleId,
  getAllPlates,
  createPlate,
  updatePlate,
  generatePlateNumber,

  // Registration form functions
  getRegistrationsByUserId,
  createRegistrationForm,
  getAllRegistrationForms,
  getRegistrationById,
  updateRegistrationForm,
  getFullRegistrationById,
  getAllRegistrations,

  // Document functions
  uploadDocument,
  getDocuments,

  // Inspection functions
  createInspection,
  getInspections,
  updateInspection,

  // Payment functions
  createPayment,
  getPayments,
  updatePayment
};
