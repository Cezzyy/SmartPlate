import api from './api';
import type { Vehicle, Plate, Registration } from '@/types/vehicle';

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

const getPlateById = async (vehicleId: string, plateId: string): Promise<Plate | null> => {
  try {
    const response = await api.get(`/api/vehicles/${vehicleId}/plates/${plateId}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching plate ${plateId}:`, error);
    return null;
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
        const vehiclePlates = await getPlatesByVehicleId(vehicle.id.toString());
        if (vehiclePlates && vehiclePlates.length > 0) {
          plates.push(...vehiclePlates);
        }
      } catch (err) {
        console.warn(`Couldn't get plates for vehicle ${vehicle.id}:`, err);
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
    const userVehicleIds = userVehicles.map(v => v.id);
    return allRegistrations.filter(reg => 
      userVehicleIds.includes(reg.vehicleId)
    );
  } catch (error) {
    console.error(`Error fetching registrations for user ${userId}:`, error);
    return [];
  }
};

const getRegistrationById = async (registrationId: string): Promise<Registration | null> => {
  try {
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
    const response = await api.get(`/api/registration-form`);
    
    // Handle null response
    if (response.data === null) {
      console.warn('Registration endpoint returned null data, returning empty array');
      return [];
    }
    
    // Check if we received valid data
    if (response.data && Array.isArray(response.data)) {
      return response.data;
    } else if (typeof response.data === 'object' && response.data !== null) {
      // Try to extract registrations from response
      console.log('Trying to extract registrations from object:', response.data);
      if (response.data.registrations && Array.isArray(response.data.registrations)) {
        return response.data.registrations;
      }
    }
    
    console.warn('Registration endpoint returned unexpected data format:', response.data);
    return [];
  } catch (error) {
    console.error('Error fetching all registrations:', error);
    return [];
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

export default {
  // Vehicle methods
  getVehiclesByUserId,
  getVehicleById,
  getAllVehicles,
  
  // Plate methods
  getPlatesByVehicleId,
  getPlateById,
  getAllPlates,
  
  // Registration methods
  getRegistrationsByUserId,
  getRegistrationById,
  getAllRegistrations,
  getFullRegistrationById,
}; 