import api from './api';

// Define user types
export interface User {
  user_id?: number;
  lto_client_id?: string;
  first_name?: string;
  middle_name?: string;
  last_name?: string;
  email?: string;
  role?: string;
  status?: string;
  password?: string;
  
  // Nested objects
  contact?: {
    contact_id?: number;
    lto_client_id?: string;
    telephone_number?: string;
    int_area_code?: string;
    mobile_number?: string;
    emergency_contact_number?: string;
    emergency_contact_name?: string;
    emergency_contact_relationship?: string;
    emergency_contact_address?: string;
  };
  
  address?: {
    address_id?: number;
    lto_client_id?: string;
    house_no?: string;
    street?: string;
    province?: string;
    city_municipality?: string;
    barangay?: string;
    zip_code?: string;
  };
  
  medical_information?: {
    medical_id?: number;
    lto_client_id?: string;
    gender?: string;
    blood_type?: string;
    complexion?: string;
    eye_color?: string;
    hair_color?: string;
    weight?: number;
    height?: number;
    organ_donor?: boolean;
  };
  
  people?: {
    people_id?: number;
    lto_client_id?: string;
    employer_name?: string;
    employer_address?: string;
    mother_first_name?: string;
    mother_maiden_name?: string;
    mother_middle_name?: string;
    father_first_name?: string;
    father_middle_name?: string;
    father_last_name?: string;
    address?: string;
  };
  
  personal_information?: {
    personal_id?: number;
    lto_client_id?: string;
    nationality?: string;
    civil_status?: string;
    date_of_birth?: string;
    place_of_birth?: string;
    educational_attainment?: string;
    tin?: string;
  };
}

// For backward compatibility, also support uppercase field names
export interface LegacyUser {
  USER_ID?: number;
  LTO_CLIENT_ID?: string;
  FIRST_NAME?: string;
  MIDDLE_NAME?: string;
  LAST_NAME?: string;
  EMAIL?: string;
  ROLE?: string;
  STATUS?: string;
  PASSWORD?: string;
}

export type AnyUser = User | LegacyUser;

export interface LoginCredentials {
  email: string;
  password: string;
  isAdminLogin?: boolean;
}

export interface LoginResponse {
  token: string;
  user: AnyUser;
}

export interface RegisterData {
  first_name: string;
  middle_name?: string;
  last_name: string;
  email: string;
  password: string;
  role?: string;
  status?: string;
}

// Legacy RegisterData format (for backward compatibility)
export interface LegacyRegisterData {
  FIRST_NAME: string;
  MIDDLE_NAME?: string;
  LAST_NAME: string;
  EMAIL: string;
  PASSWORD: string;
  ROLE?: string;
  STATUS?: string;
}

/**
 * User authentication service
 */
const userService = {
  /**
   * Log in a user
   * @param credentials User email and password
   * @returns Promise with user data and token
   */
  login: async (credentials: LoginCredentials): Promise<LoginResponse> => {
    try {
      // Use different endpoints for admin login vs regular login
      const endpoint = credentials.isAdminLogin ? '/admin/login' : '/login';
      
      // Remove isAdminLogin from credentials before sending to backend
      const { isAdminLogin, ...loginData } = credentials;
      
      console.log(`Attempting ${isAdminLogin ? 'admin' : 'regular'} login with endpoint: ${endpoint}`);
      
      const response = await api.post<LoginResponse>(endpoint, loginData);
      console.log(`${isAdminLogin ? 'Admin' : 'User'} login API response:`, response.data);
      
      // Normalize the user data role field
      const userData = response.data.user as any;
      let role = '';
      
      // Extract role from the user data
      if (userData.role) {
        role = userData.role.toLowerCase();
      } else if (userData.ROLE) {
        role = userData.ROLE.toLowerCase();
      }
      
      // If this is an admin login, verify role
      if (isAdminLogin) {
        // Check if user has admin or LTO officer role
        if (role !== 'admin' && role !== 'lto officer') {
          throw new Error('Unauthorized: This portal is only for Administrators and LTO Officers');
        }
      }
      
      // Standardize the role format in the response
      if (userData.role !== undefined) {
        userData.role = role === 'admin' ? 'admin' : role === 'lto officer' ? 'LTO Officer' : 'user';
      } else if (userData.ROLE !== undefined) {
        userData.ROLE = role === 'admin' ? 'admin' : role === 'lto officer' ? 'LTO Officer' : 'user';
      }
      
      // Store token in localStorage
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        
        // For admin login, mark the login type
        if (isAdminLogin) {
          localStorage.setItem('loginType', 'admin');
        } else {
          localStorage.removeItem('loginType');
        }
      }
      
      // We'll let the Pinia store handle mapping and storing the user data
      return response.data;
    } catch (error) {
      console.error('Login error:', error);
      
      // Add additional context for admin login errors
      if (credentials.isAdminLogin && (error as any).response?.status === 404) {
        const enhancedError = new Error('Admin login service is currently unavailable');
        (enhancedError as any).response = (error as any).response;
        throw enhancedError;
      }
      
      throw error;
    }
  },

  /**
   * Check if an email already exists in the system
   * @param email The email to check
   * @returns Promise that resolves if the email doesn't exist, rejects if it does
   */
  checkEmailExists: async (email: string): Promise<void> => {
    try {
      // Try to get a user with this email
      await api.get(`/users/email/${email}`);
      
      // If we get here, the email exists - reject with an appropriate error
      const error = new Error('Email already exists');
      (error as any).response = {
        status: 409,
        data: { error: 'Email already exists', field: 'email' }
      };
      throw error;
    } catch (error: any) {
      // If we get a 404, the email doesn't exist (which is what we want)
      if (error.response && error.response.status === 404) {
        return; // Email doesn't exist, so it's available
      }
      
      // For any other error, rethrow
      throw error;
    }
  },

  /**
   * Log out the current user
   */
  logout: (): void => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('userId');
    localStorage.removeItem('userRole');
    localStorage.removeItem('loginType');
    localStorage.removeItem('routeHistory');
  },

  /**
   * Check if user is logged in
   * @returns boolean indicating if user is authenticated
   */
  isAuthenticated: (): boolean => {
    return !!localStorage.getItem('token');
  },

  /**
   * Get the current user data
   * @returns Current user data or null if not logged in
   */
  getCurrentUser: (): AnyUser | null => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch (e) {
        console.error('Error parsing user from localStorage:', e);
        return null;
      }
    }
    return null;
  },

  /**
   * Register a new user
   * @param userData User registration data
   * @returns Promise with created user data
   */
  register: async (userData: RegisterData | LegacyRegisterData | any): Promise<AnyUser> => {
    try {
      // Check if we're using the legacy format (uppercase fields)
      const isLegacyFormat = 'FIRST_NAME' in userData;
      
      let data;
      if (isLegacyFormat) {
        // Use legacy format (uppercase fields)
        data = userData; // Use as-is since it already has uppercase fields and nested objects
      } else {
        // Use new format (lowercase fields)
        const newData = userData as RegisterData;
        data = {
          ...newData,
          role: newData.role || 'user',
          status: newData.status || 'active'
        };
      }
      
      console.log('Sending registration data to server:', data);
      const response = await api.post<AnyUser>('/users', data);
      console.log('Registration API response:', response.data);
      
      return response.data;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  },

  /**
   * Update user profile
   * @param userId User ID or LTO Client ID
   * @param userData Updated user data
   * @returns Promise with updated user data
   */
  updateProfile: async (userId: string | number, userData: Partial<User | LegacyUser>): Promise<AnyUser> => {
    try {
      const response = await api.put<AnyUser>(`/users/${userId}`, userData);
      return response.data;
    } catch (error) {
      console.error('Update profile error:', error);
      throw error;
    }
  },

  /**
   * Request password reset
   * @param email User email
   */
  requestPasswordReset: async (email: string): Promise<void> => {
    try {
      await api.post('/request-password-reset', { email });
    } catch (error) {
      console.error('Password reset request error:', error);
      throw error;
    }
  }
};

export default userService; 