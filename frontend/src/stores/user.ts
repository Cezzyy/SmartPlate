import { defineStore } from 'pinia'
import router from '@/router/index'
import type { User, UserState } from '@/types/user'
import userService, { LoginCredentials } from '@/services/userService'


export const useUserStore = defineStore('user', {
  persist: true,
  state: (): UserState => ({
    currentUser: null,
    users: [],
    isAuthenticated: false,
    token: localStorage.getItem('token') || null,
    loading: false,
    error: null,
    isRegistering: false,
    registrationData: null,
    registrationCompleted: false,
    currentStep: 1,
    formDirty: false,
  }),

  getters: {
    isAdmin(): boolean {
      const role = this.currentUser?.role;
      if (!role) return false;
      
      // Handle both string format and object format (from JSON parsing)
      const roleValue = typeof role === 'string' ? role.toLowerCase() : String(role).toLowerCase();
      return roleValue === 'admin';
    },
    isLtoOfficer(): boolean {
      const role = this.currentUser?.role;
      if (!role) return false;
      
      // Handle both string format and object format (from JSON parsing)
      const roleValue = typeof role === 'string' ? role.toLowerCase() : String(role).toLowerCase();
      return roleValue === 'lto officer';
    },
    isAdminOrLtoOfficer(): boolean {
      return this.isAdmin || this.isLtoOfficer;
    },
    fullName(): string {
      if (!this.currentUser) return '';
      
      const firstName = this.currentUser.firstName || '';
      const lastName = this.currentUser.lastName || '';
      const middleName = this.currentUser.middleName || '';
      
      if (!firstName && !lastName) return 'User';
      
      // Format as "FirstName M. LastName" if middle name exists, otherwise "FirstName LastName"
      const middleInitial = middleName ? `${middleName.charAt(0)}. ` : '';
      
      return `${firstName} ${middleInitial}${lastName}`.trim();
    },

    userRole: (state): string => state.currentUser?.role || 'guest',
  },

  actions: {
    checkAuth(): boolean {
      // Check if token exists in localStorage using userService
      if (userService.isAuthenticated()) {
        // Try to get the stored user from localStorage
        const userJson = localStorage.getItem('user');
        const storedUser = userJson ? JSON.parse(userJson) : null;
        
        if (storedUser) {
          console.log('Found authenticated user in localStorage:', storedUser);
          
          // Check if storedUser is already in the correct format or needs mapping
          if (storedUser.currentUser) {
            // This is the store state format, extract the currentUser directly
            this.currentUser = storedUser.currentUser;
            this.isAuthenticated = true;
            this.token = localStorage.getItem('token');
            
            console.log('User data from persisted store:', this.currentUser);
          } else {
            // Map the stored user to ensure proper format
            this.currentUser = this.mapBackendUser(storedUser);
            this.isAuthenticated = true;
            this.token = localStorage.getItem('token');
            
            console.log('User data after mapping:', this.currentUser);
          }
          
          // Verify the token is still valid by checking expiration
          try {
            const token = this.token;
            if (token) {
              // JWT tokens consist of three parts separated by dots
              const parts = token.split('.');
              if (parts.length === 3) {
                // The payload is the second part
                const payload = JSON.parse(atob(parts[1]));
                // Check if token is expired
                if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
                  console.warn('Token has expired, logging out user');
                  this.logout();
                  return false;
                }
              }
            }
          } catch (error) {
            console.error('Error validating token:', error);
            // On error, we'll still consider the user authenticated
            // but log a warning
            console.warn('Token validation failed, but proceeding with stored credentials');
          }
          
          return true;
        }
        
        // Fall back to getting user from userService if localStorage doesn't have user data
        const backendUser = userService.getCurrentUser();
        if (backendUser) {
          console.log('Retrieved user from userService:', backendUser);
          // Convert backend user format to frontend format
          this.currentUser = this.mapBackendUser(backendUser);
          this.isAuthenticated = true;
          this.token = localStorage.getItem('token');
          
          // Update localStorage with mapped user
          localStorage.setItem('user', JSON.stringify(this.currentUser));
          
          console.log('User data after mapping from userService:', this.currentUser);
          
          return true;
        }
      }
      
      return false;
    },
    
    // Maps backend user structure to frontend user structure
    mapBackendUser(backendUser: any): User {
      console.log('Backend user data received for mapping:', backendUser);
      
      // Unwrap response objects to get to the user data
      let dataToMap = { ...backendUser };
      
      // Check for common API response formats and extract actual user data
      if (backendUser.user) {
        dataToMap = { ...dataToMap, ...backendUser.user };
      }
      
      if (backendUser.data) {
        dataToMap = { ...dataToMap, ...backendUser.data };
      }
      
      // Extract basic user information with proper fallbacks
      const ltoClientId = dataToMap.LTO_CLIENT_ID || dataToMap.lto_client_id || '';
      const firstName = dataToMap.FIRST_NAME || dataToMap.first_name || '';
      const lastName = dataToMap.LAST_NAME || dataToMap.last_name || '';
      const middleName = dataToMap.MIDDLE_NAME || dataToMap.middle_name || '';
      const email = dataToMap.EMAIL || dataToMap.email || '';
      const role = (dataToMap.ROLE || dataToMap.role || 'user').toLowerCase();
      const status = dataToMap.STATUS || dataToMap.status || 'active';
      
      // Extract nested objects
      const contact = dataToMap.contact || dataToMap.CONTACT || {};
      const address = dataToMap.address || dataToMap.ADDRESS || {};
      const medicalInfo = dataToMap.medical_information || dataToMap.MEDICAL_INFORMATION || {};
      const people = dataToMap.people || dataToMap.PEOPLE || {};
      const personalInfo = dataToMap.personal_information || dataToMap.PERSONAL_INFORMATION || {};
      
      // Log the extracted data for debugging
      console.log('Extracted data:', {
        basic: { ltoClientId, firstName, lastName, email, role },
        nested: { contact, address, medicalInfo, people, personalInfo }
      });
      
      // Create the mapped user object
      const mappedUser: User = {
        // Basic user information
        ltoClientId,
        firstName,
        lastName,
        middleName,
        email,
        role: role === 'admin' ? 'admin' : role === 'lto officer' ? 'LTO Officer' : 'user',
        status,
        
        // Contact information
        telephoneNumber: contact.TELEPHONE_NUMBER || contact.telephone_number || '',
        intAreaCode: contact.INT_AREA_CODE || contact.int_area_code || '',
        mobileNumber: contact.MOBILE_NUMBER || contact.mobile_number || '',
        emergencyContactName: contact.EMERGENCY_CONTACT_NAME || contact.emergency_contact_name || '',
        emergencyContactNumber: contact.EMERGENCY_CONTACT_NUMBER || contact.emergency_contact_number || '',
        emergencyContactAddress: contact.EMERGENCY_CONTACT_ADDRESS || contact.emergency_contact_address || '',
        
        // Address information
        houseNo: address.HOUSE_NO || address.house_no || '',
        street: address.STREET || address.street || '',
        province: address.PROVINCE || address.province || '',
        city: address.CITY_MUNICIPALITY || address.city_municipality || '',
        barangay: address.BARANGAY || address.barangay || '',
        zipCode: address.ZIP_CODE || address.zip_code || '',
        
        // Medical information
        gender: medicalInfo.GENDER || medicalInfo.gender || '',
        bloodType: medicalInfo.BLOOD_TYPE || medicalInfo.blood_type || '',
        complexion: medicalInfo.COMPLEXION || medicalInfo.complexion || '',
        eyeColor: medicalInfo.EYE_COLOR || medicalInfo.eye_color || '',
        hairColor: medicalInfo.HAIR_COLOR || medicalInfo.hair_color || '',
        weight: medicalInfo.WEIGHT || medicalInfo.weight || undefined,
        height: medicalInfo.HEIGHT || medicalInfo.height || undefined,
        organDonor: medicalInfo.ORGAN_DONOR || medicalInfo.organ_donor || false,
        
        // People information
        employerName: people.EMPLOYER_NAME || people.employer_name || '',
        employerAddress: people.EMPLOYER_ADDRESS || people.employer_address || '',
        motherFirstName: people.MOTHER_FIRST_NAME || people.mother_first_name || '',
        motherLastName: people.MOTHER_MAIDEN_NAME || people.mother_maiden_name || '',
        motherMiddleName: people.MOTHER_MIDDLE_NAME || people.mother_middle_name || '',
        fatherFirstName: people.FATHER_FIRST_NAME || people.father_first_name || '',
        fatherLastName: people.FATHER_LAST_NAME || people.father_last_name || '',
        fatherMiddleName: people.FATHER_MIDDLE_NAME || people.father_middle_name || '',
        
        // Personal information
        nationality: personalInfo.NATIONALITY || personalInfo.nationality || '',
        civilStatus: personalInfo.CIVIL_STATUS || personalInfo.civil_status || '',
        dateOfBirth: personalInfo.DATE_OF_BIRTH || personalInfo.date_of_birth || '',
        placeOfBirth: personalInfo.PLACE_OF_BIRTH || personalInfo.place_of_birth || '',
        educationalAttainment: personalInfo.EDUCATIONAL_ATTAINMENT || personalInfo.educational_attainment || '',
        tin: personalInfo.TIN || personalInfo.tin || ''
      };
      
      console.log('Mapped user data:', mappedUser);
      return mappedUser;
    },
    
    async login(email: string, password: string, isAdminLogin: boolean = false): Promise<User> {
      this.loading = true;
      this.error = null;

      try {
        // Authenticate using the backend API
        const credentials: LoginCredentials = { email, password, isAdminLogin };
        
        // Use the userService for backend authentication
        const response = await userService.login(credentials);
        
        // Map the user from backend format to frontend format
        const mappedUser = this.mapBackendUser(response);
        console.log('Mapped user data after login:', mappedUser);
        
        // Store the mapped user data
        this.currentUser = mappedUser;
        this.isAuthenticated = true;
        this.token = response.token;
        
        // Store the properly mapped user data in localStorage for persistence
        localStorage.setItem('token', this.token);
        localStorage.setItem('user', JSON.stringify(mappedUser));
        localStorage.setItem('userRole', mappedUser.role);
        
        // Store the userId consistently
        if (mappedUser.ltoClientId) {
          localStorage.setItem('userId', mappedUser.ltoClientId);
        }
        
        console.log('Successfully authenticated with backend, user data:', mappedUser);
        console.log('User state after login:', { 
          currentUser: this.currentUser,
          role: this.currentUser?.role,
          isAdmin: this.isAdmin,
          fullName: this.fullName
        });
        
        this.loading = false;
        return mappedUser;
      } catch (error: any) {
        this.error = error.message || 'Failed to login';
        this.loading = false;
        throw error;
      }
    },

    startRegistration(initialData?: Partial<User>): Promise<void> {
      this.isRegistering = true
      this.registrationData = initialData || {}
      this.registrationCompleted = false
      this.currentStep = 1
      this.formDirty = false
      
      // If initialData contains email, check if it exists
      if (initialData && initialData.email) {
        return new Promise((resolve, reject) => {
          userService.checkEmailExists(initialData.email as string)
            .then(() => {
              // Email is available, resolve
              resolve()
            })
            .catch((error: any) => {
              // Email exists or other error occurred
              reject(error)
            })
        })
      }
      
      return Promise.resolve()
    },

    cancelRegistration(): void {
      this.isRegistering = false
      this.registrationData = null
      this.registrationCompleted = false
      this.currentStep = 1
      this.formDirty = false
    },

    setFormDirty(isDirty: boolean): void {
      this.formDirty = isDirty
    },

    updateCurrentStep(step: number): void {
      this.currentStep = step
      this.formDirty = true
    },

    async register(userData: Partial<User>): Promise<User> {
      this.loading = true;
      this.error = null;

      try {
        // Create registration data with all fields
        const registerData: any = {
          // Basic user information
          FIRST_NAME: userData.firstName || '',
          MIDDLE_NAME: userData.middleName || '',
          LAST_NAME: userData.lastName || '',
          EMAIL: userData.email || '',
          PASSWORD: userData.password || '',
          ROLE: 'user',
          STATUS: 'active',
          
          // Nested objects for extended information
          contact: {
            telephone_number: userData.telephoneNumber || null,
            int_area_code: userData.intAreaCode || null,
            mobile_number: userData.mobileNumber || null,
            emergency_contact_name: userData.emergencyContactName || null,
            emergency_contact_number: userData.emergencyContactNumber || null,
            emergency_contact_address: userData.emergencyContactAddress || null
          },
          
          address: {
            house_no: userData.houseNo || null,
            street: userData.street || null,
            province: userData.province || null,
            city_municipality: userData.cityMunicipality || null,
            barangay: userData.barangay || null,
            zip_code: userData.zipCode || null
          },
          
          medical_information: {
            gender: userData.gender || null,
            blood_type: userData.bloodType || null,
            complexion: userData.complexion || null,
            eye_color: userData.eyeColor || null,
            hair_color: userData.hairColor || null,
            weight: userData.weight || null,
            height: userData.height || null,
            organ_donor: userData.organDonor || false
          },
          
          people: {
            employer_name: userData.employerName || null,
            employer_address: userData.employerAddress || null,
            mother_first_name: userData.motherFirstName || null,
            mother_maiden_name: userData.motherLastName || null,
            mother_middle_name: userData.motherMiddleName || null,
            father_first_name: userData.fatherFirstName || null,
            father_middle_name: userData.fatherMiddleName || null,
            father_last_name: userData.fatherLastName || null
          },
          
          personal_information: {
            nationality: userData.nationality || null,
            civil_status: userData.civilStatus || null,
            date_of_birth: userData.dateOfBirth || null,
            place_of_birth: userData.placeOfBirth || null,
            educational_attainment: userData.educationalAttainment || null,
            tin: userData.tin || null
          }
        };

        console.log('Sending complete registration data to server:', registerData);
        
        // Use userService for registration
        const response = await userService.register(registerData);
        console.log('Backend registration successful, response:', response);
        
        // Map the backend response to our format
        const mappedUser = this.mapBackendUser(response);
        console.log('Mapped user after registration:', mappedUser);
        
        // Add the user to our local users array
        this.users.push(mappedUser);
        
        // Store in localStorage for persistence
        localStorage.setItem('user', JSON.stringify(mappedUser));
        const responseAny = response as any;
        if (responseAny && responseAny.LTO_CLIENT_ID) {
          localStorage.setItem('userId', responseAny.LTO_CLIENT_ID);
        } else if (mappedUser.ltoClientId) {
          localStorage.setItem('userId', mappedUser.ltoClientId);
        }
        
        // Set registration as completed and reset registration state
        this.registrationCompleted = true;
        this.isRegistering = false;
        this.registrationData = null;
        
        this.loading = false;
        return mappedUser;
      } catch (error: any) {
        this.error = error.message || 'Failed to register';
        this.loading = false;
        throw error;
      }
    },

    logout(): void {
      // Clear local store state first
      this.currentUser = null;
      this.isAuthenticated = false;
      this.token = null;
      
      // Use the userService to handle clearing localStorage, but don't call the API
      // as it seems to not exist on the backend
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('userId'); 
      localStorage.removeItem('userRole');
      localStorage.removeItem('loginType');
      localStorage.removeItem('routeHistory');
      
      // Handle router navigation here
      router.push('/login');
    },
    
    async updateUserProfile(updatedData: Partial<User>): Promise<User | null> {
      if (!this.currentUser) return null;

      try {
        console.log('Updating user profile with data:', updatedData);
        
        // Call the backend API to update the user profile
        const response = await userService.updateProfile(this.currentUser.ltoClientId, updatedData);
        
        // Map the response to our format
        const updatedUser = this.mapBackendUser(response);
        
        // Update the local store
        this.currentUser = updatedUser;
        
        // Update localStorage with the updated user
        localStorage.setItem('user', JSON.stringify(updatedUser));
        
        console.log('Profile updated successfully:', updatedUser);
        return updatedUser;
      } catch (error) {
        console.error('Error updating profile:', error);
        return null;
      }
    },

    // Action for updating any user (not just current user)
    async updateUser(userId: string, updatedData: Partial<User>): Promise<User | null> {
      try {
        // Call the backend API to update the user
        const response = await userService.updateProfile(userId, updatedData);
        
        // Map the response to our format
        const updatedUser = this.mapBackendUser(response);
        
        // If the updated user is the currently logged in user, update currentUser also
        if (this.currentUser && this.currentUser.ltoClientId === userId) {
          this.currentUser = updatedUser;
          localStorage.setItem('user', JSON.stringify(updatedUser));
        }

        return updatedUser;
      } catch (error) {
        console.error('Error updating user:', error);
        throw error;
      }
    },
  },
})
