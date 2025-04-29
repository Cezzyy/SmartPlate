import api from './api';
import type { Vehicle, Plate } from '@/types/vehicle';

// Admin Vehicle Management
const getAllVehicles = async (): Promise<Vehicle[]> => {
  try {
    const response = await api.get('/api/vehicles');
    return response.data || [];
  } catch (error) {
    console.error('Error fetching all vehicles:', error);
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

const updateVehicle = async (vehicleId: string, vehicleData: Partial<Vehicle>): Promise<Vehicle | null> => {
  try {
    const response = await api.put(`/api/vehicles/${vehicleId}`, vehicleData);
    return response.data;
  } catch (error) {
    console.error(`Error updating vehicle ${vehicleId}:`, error);
    return null;
  }
};

const deleteVehicle = async (vehicleId: string): Promise<boolean> => {
  try {
    await api.delete(`/api/vehicles/${vehicleId}`);
    return true;
  } catch (error) {
    console.error(`Error deleting vehicle ${vehicleId}:`, error);
    return false;
  }
};

// Admin Plate Management
const getPlatesByVehicleId = async (vehicleId: string): Promise<Plate[]> => {
  try {
    const response = await api.get(`/api/vehicles/${vehicleId}/plates`);
    return response.data || [];
  } catch (error) {
    console.error(`Error fetching plates for vehicle ${vehicleId}:`, error);
    return [];
  }
};

const getPlateById = async (vehicleId: string, plateId: string): Promise<Plate | null> => {
  try {
    const response = await api.get(`/api/vehicles/${vehicleId}/plates/${plateId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching plate ${plateId}:`, error);
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

const deletePlate = async (vehicleId: string, plateId: string): Promise<boolean> => {
  try {
    await api.delete(`/api/vehicles/${vehicleId}/plates/${plateId}`);
    return true;
  } catch (error) {
    console.error(`Error deleting plate ${plateId}:`, error);
    return false;
  }
};

// Admin Registration Management
const getAllRegistrations = async (): Promise<any[]> => {
  try {
    const response = await api.get('/api/registration-form');
    return response.data || [];
  } catch (error) {
    console.error('Error fetching all registrations:', error);
    return [];
  }
};

const getRegistrationById = async (registrationId: string): Promise<any | null> => {
  try {
    const response = await api.get(`/api/registration-form/${registrationId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching registration ${registrationId}:`, error);
    return null;
  }
};

const getFullRegistrationById = async (registrationId: string): Promise<any | null> => {
  try {
    const response = await api.get(`/api/registration-form/${registrationId}/full`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching full registration ${registrationId}:`, error);
    return null;
  }
};

const updateRegistration = async (registrationId: string, registrationData: any): Promise<any | null> => {
  try {
    const response = await api.put(`/api/registration-form/${registrationId}`, registrationData);
    return response.data;
  } catch (error) {
    console.error(`Error updating registration ${registrationId}:`, error);
    return null;
  }
};

const deleteRegistration = async (registrationId: string): Promise<boolean> => {
  try {
    await api.delete(`/api/registration-form/${registrationId}`);
    return true;
  } catch (error) {
    console.error(`Error deleting registration ${registrationId}:`, error);
    return false;
  }
};

// Registration inspection endpoints
const getInspections = async (registrationId: string): Promise<any[]> => {
  try {
    const response = await api.get(`/api/registration-form/${registrationId}/inspection`);
    return response.data || [];
  } catch (error) {
    console.error(`Error fetching inspections for registration ${registrationId}:`, error);
    return [];
  }
};

const createInspection = async (registrationId: string, inspectionData: any): Promise<any | null> => {
  try {
    const response = await api.post(`/api/registration-form/${registrationId}/inspection`, inspectionData);
    return response.data;
  } catch (error) {
    console.error(`Error creating inspection for registration ${registrationId}:`, error);
    return null;
  }
};

const updateInspection = async (registrationId: string, inspectionId: string, inspectionData: any): Promise<any | null> => {
  try {
    const response = await api.put(`/api/registration-form/${registrationId}/inspection/${inspectionId}`, inspectionData);
    return response.data;
  } catch (error) {
    console.error(`Error updating inspection ${inspectionId}:`, error);
    return null;
  }
};

// Registration payment endpoints
const getPayments = async (registrationId: string): Promise<any[]> => {
  try {
    const response = await api.get(`/api/registration-form/${registrationId}/payment`);
    return response.data || [];
  } catch (error) {
    console.error(`Error fetching payments for registration ${registrationId}:`, error);
    return [];
  }
};

const createPayment = async (registrationId: string, paymentData: any): Promise<any | null> => {
  try {
    const response = await api.post(`/api/registration-form/${registrationId}/payment`, paymentData);
    return response.data;
  } catch (error) {
    console.error(`Error creating payment for registration ${registrationId}:`, error);
    return null;
  }
};

const updatePayment = async (registrationId: string, paymentId: string, paymentData: any): Promise<any | null> => {
  try {
    const response = await api.put(`/api/registration-form/${registrationId}/payment/${paymentId}`, paymentData);
    return response.data;
  } catch (error) {
    console.error(`Error updating payment ${paymentId}:`, error);
    return null;
  }
};

export default {
  // Vehicle methods
  getAllVehicles,
  getVehicleById,
  updateVehicle,
  deleteVehicle,
  
  // Plate methods
  getPlatesByVehicleId,
  getPlateById,
  updatePlate,
  deletePlate,
  
  // Registration methods
  getAllRegistrations,
  getRegistrationById,
  getFullRegistrationById,
  updateRegistration,
  deleteRegistration,
  
  // Inspection methods
  getInspections,
  createInspection,
  updateInspection,
  
  // Payment methods
  getPayments,
  createPayment,
  updatePayment
}; 