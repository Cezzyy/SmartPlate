<script setup>
import { defineProps, ref } from 'vue'

defineProps({
  user: {
    type: Object,
    required: true,
  },
  isEditMode: {
    type: Boolean,
    default: false,
  },
  formData: {
    type: Object,
    required: true,
  },
})

// Tabs for vehicles information sections
const activeTab = ref('vehicles')

// Mock data for vehicles (would come from a store or API in a real app)
const vehicles = ref([
  {
    id: 1,
    make: 'Toyota',
    model: 'Corolla',
    year: 2022,
    plateNumber: 'ABC-123',
    color: 'White',
    status: 'Active',
    lastUpdated: '2025-02-15',
    owner: 'Stanleigh Morales',
  },
  {
    id: 2,
    make: 'Honda',
    model: 'Civic',
    year: 2021,
    plateNumber: 'XYZ-789',
    color: 'Black',
    status: 'Active',
    lastUpdated: '2025-01-20',
    owner: 'Stanleigh Morales',
  },
  {
    id: 3,
    make: 'Ford',
    model: 'Mustang',
    year: 2023,
    plateNumber: 'DEF-456',
    color: 'Red',
    status: 'Pending',
    lastUpdated: '2025-03-01',
    owner: 'Stanleigh Morales',
  },
])

// Mock data for plates
const plates = ref([
  {
    id: 1,
    plateNumber: 'ABC-123',
    vehicleMake: 'Toyota',
    vehicleModel: 'Corolla',
    registrationDate: '2024-10-15',
    expiryDate: '2025-10-15',
    status: 'Active',
    owner: 'Stanleigh Morales',
    type: 'Private'
  },
  {
    id: 2,
    plateNumber: 'XYZ-789',
    vehicleMake: 'Honda',
    vehicleModel: 'Civic',
    registrationDate: '2024-08-20',
    expiryDate: '2025-08-20',
    status: 'Active',
    owner: 'Stanleigh Morales',
    type: 'Private'
  },
  {
    id: 3,
    plateNumber: 'DEF-456',
    vehicleMake: 'Ford',
    vehicleModel: 'Mustang',
    registrationDate: '2025-01-05',
    expiryDate: '2026-01-05',
    status: 'Pending',
    owner: 'Stanleigh Morales',
    type: 'Private'
  }
])

// Calculate days remaining until expiry
const getDaysRemaining = (expiryDateStr) => {
  const today = new Date()
  const expiryDate = new Date(expiryDateStr)
  const diffTime = expiryDate - today
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return diffDays
}

// Get status color based on days remaining
const getExpiryStatusColor = (expiryDateStr) => {
  const daysRemaining = getDaysRemaining(expiryDateStr)
  
  if (daysRemaining < 0) return 'bg-red-100 text-red-800' // Expired
  if (daysRemaining < 30) return 'bg-yellow-100 text-yellow-800' // Expiring soon
  return 'bg-green-100 text-green-800' // Valid
}

// Get expiry status text
const getExpiryStatusText = (expiryDateStr) => {
  const daysRemaining = getDaysRemaining(expiryDateStr)
  
  if (daysRemaining < 0) return 'Expired'
  if (daysRemaining < 30) return `Expires in ${daysRemaining} days`
  return 'Valid'
}
</script>

<template>
  <div class="space-y-4 bg-white">
    <!-- Tabs for Vehicles Information -->
    <div class="border-b border-gray-200">
      <nav class="flex space-x-4" aria-label="Vehicles Information Tabs">
        <button
          @click="activeTab = 'vehicles'"
          :class="[
            'py-2 px-3 text-sm font-medium rounded-t-lg',
            activeTab === 'vehicles'
              ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-500'
              : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50',
          ]"
        >
          Vehicles
        </button>
        <button
          @click="activeTab = 'plates'"
          :class="[
            'py-2 px-3 text-sm font-medium rounded-t-lg',
            activeTab === 'plates'
              ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-500'
              : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50',
          ]"
        >
          Plates
        </button>
      </nav>
    </div>

    <!-- Vehicles Tab -->
    <div v-if="activeTab === 'vehicles'" class="space-y-4">
      <h3 class="text-lg font-medium text-gray-800">Your Vehicles</h3>
      
      <!-- Vehicles Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div 
          v-for="vehicle in vehicles" 
          :key="vehicle.id"
          class="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-200"
        >
          <div :class="[
            'p-3 border-b',
            vehicle.status === 'Active' ? 'bg-gradient-to-r from-blue-50 to-green-50' : 'bg-gradient-to-r from-amber-50 to-yellow-50'
          ]">
            <div class="flex justify-between items-center">
              <h4 class="font-medium text-gray-800">{{ vehicle.make }} {{ vehicle.model }}</h4>
              <span 
                :class="[
                  'px-2 py-1 text-xs font-medium rounded-full',
                  vehicle.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                ]"
              >
                {{ vehicle.status }}
              </span>
            </div>
            <p class="text-sm text-gray-600">{{ vehicle.year }}</p>
          </div>
          
          <div class="p-3 space-y-2">
            <div class="flex justify-between">
              <span class="text-sm text-gray-500">Plate Number:</span>
              <span class="text-sm font-medium">{{ vehicle.plateNumber }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-sm text-gray-500">Color:</span>
              <span class="text-sm">{{ vehicle.color }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-sm text-gray-500">Last Updated:</span>
              <span class="text-sm">{{ vehicle.lastUpdated }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Plates Tab -->
    <div v-if="activeTab === 'plates'" class="space-y-4">
      <h3 class="text-lg font-medium text-gray-800">Your License Plates</h3>
      
      <!-- Plates Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div 
          v-for="plate in plates" 
          :key="plate.id"
          class="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-200"
        >
          <div :class="[
            'p-3 border-b',
            plate.status === 'Active' ? 'bg-gradient-to-r from-blue-50 to-green-50' : 'bg-gradient-to-r from-amber-50 to-yellow-50'
          ]">
            <div class="flex justify-between items-center">
              <h4 class="font-medium text-gray-800">{{ plate.plateNumber }}</h4>
              <span 
                :class="[
                  'px-2 py-1 text-xs font-medium rounded-full',
                  plate.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                ]"
              >
                {{ plate.status }}
              </span>
            </div>
            <p class="text-sm text-gray-600">{{ plate.vehicleMake }} {{ plate.vehicleModel }}</p>
          </div>
          
          <div class="p-3 space-y-2">
            <div class="flex justify-between">
              <span class="text-sm text-gray-500">Registration Date:</span>
              <span class="text-sm">{{ plate.registrationDate }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-sm text-gray-500">Expiry Date:</span>
              <span class="text-sm">{{ plate.expiryDate }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-sm text-gray-500">Status:</span>
              <span :class="['text-sm px-2 py-0.5 rounded-full text-xs', getExpiryStatusColor(plate.expiryDate)]">
                {{ getExpiryStatusText(plate.expiryDate) }}
              </span>
            </div>
            <div class="flex justify-between">
              <span class="text-sm text-gray-500">Type:</span>
              <span class="text-sm">{{ plate.type }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>