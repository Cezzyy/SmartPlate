<script setup>
import { defineProps, ref } from 'vue'
import { useVehicleRegistrationStore } from '@/stores/vehicleRegistration'

const props = defineProps({
  show: {
    type: Boolean,
    required: true,
  },
  plate: {
    type: Object,
    required: true,
  },
})

const emit = defineEmits(['close', 'update'])
const store = useVehicleRegistrationStore()

const vehicle = store.getVehicleById(props.plate.vehicleId)

// Create form data with initial values from plate
const form = ref({
  plate_number: props.plate.plate_number || '',
  plate_type: props.plate.plate_type || '',
  plate_issue_date: props.plate.plate_issue_date || '',
  plate_expiration_date: props.plate.plate_expiration_date || '',
  status: props.plate.status || 'Pending',
  region: props.plate.region || '',
  serial_number: props.plate.serial_number || '',
  notes: props.plate.notes || '',
})

// Status options
const statusOptions = [
  { value: 'Active', label: 'Active' },
  { value: 'Pending', label: 'Pending' },
  { value: 'Expired', label: 'Expired' },
]

// Plate type options
const plateTypeOptions = [
  { value: 'Regular', label: 'Regular' },
  { value: 'Temporary', label: 'Temporary' },
]

const closeModal = () => {
  emit('close')
}

const handleSubmit = () => {
  // Create updated plate object
  const updatedPlate = {
    ...props.plate,
    ...form.value,
  }

  // Here you would typically call an API to update the plate
  // For now, we'll just simulate a successful update
  setTimeout(() => {
    emit('update', updatedPlate)
    emit('close')
  }, 500)
}

const getStatusColor = (status) => {
  switch (status?.toLowerCase()) {
    case 'active':
      return 'bg-green-100 text-green-800'
    case 'expired':
      return 'bg-red-100 text-red-800'
    case 'pending':
      return 'bg-yellow-100 text-yellow-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}
</script>

<template>
  <div
    v-if="show"
    class="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4"
    @click.self="closeModal"
  >
    <div class="bg-white rounded-lg shadow-xl w-full max-w-4xl overflow-hidden">
      <!-- Modal Header with Gradient -->
      <div
        class="bg-gradient-to-r from-dark-blue to-blue-800 px-6 py-4 flex items-center justify-between"
      >
        <h3 class="text-xl font-bold text-white">Edit Plate</h3>
        <button
          @click="closeModal"
          class="text-white hover:text-blue-200 transition-colors focus:outline-none"
        >
          <font-awesome-icon :icon="['fas', 'times']" class="w-5 h-5" />
        </button>
      </div>

      <!-- Modal Content -->
      <form @submit.prevent="handleSubmit" class="max-h-[75vh] overflow-y-auto">
        <div class="px-6 py-4">
          <!-- Plate Profile Section -->
          <div class="mb-6">
            <div class="flex flex-col md:flex-row items-start md:items-center mb-6">
              <div
                class="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mr-4 mb-4 md:mb-0"
              >
                <font-awesome-icon :icon="['fas', 'car-side']" class="w-8 h-8 text-light-blue" />
              </div>
              <div>
                <h4 class="text-xl font-bold text-gray-900">Edit {{ props.plate.plate_number }}</h4>
                <div class="flex items-center mt-1">
                  <span class="text-gray-600 mr-2">Vehicle:</span>
                  <span class="font-medium text-dark-blue">{{
                    vehicle ? `${vehicle.vehicleMake} ${vehicle.vehicleSeries}` : 'Not Assigned'
                  }}</span>
                </div>
              </div>
            </div>

            <!-- Main Info Grid -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <!-- Plate Information -->
              <div class="bg-gray-50 rounded-lg shadow-sm overflow-hidden">
                <div class="bg-gray-100 px-4 py-3 border-b border-gray-200">
                  <h5 class="font-medium text-gray-900 flex items-center">
                    <font-awesome-icon :icon="['fas', 'id-card']" class="mr-2 text-light-blue" />
                    Plate Information
                  </h5>
                </div>
                <div class="p-4">
                  <div class="space-y-4">
                    <div>
                      <label for="plate_number" class="block text-sm font-medium text-gray-700 mb-1"
                        >Plate Number</label
                      >
                      <input
                        id="plate_number"
                        v-model="form.plate_number"
                        type="text"
                        class="w-full rounded-md border-gray-300 shadow-sm focus:border-light-blue focus:ring focus:ring-light-blue focus:ring-opacity-20"
                      />
                    </div>
                    <div>
                      <label for="plate_type" class="block text-sm font-medium text-gray-700 mb-1"
                        >Plate Type</label
                      >
                      <select
                        id="plate_type"
                        v-model="form.plate_type"
                        class="w-full rounded-md border-gray-300 shadow-sm focus:border-light-blue focus:ring focus:ring-light-blue focus:ring-opacity-20"
                      >
                        <option
                          v-for="option in plateTypeOptions"
                          :key="option.value"
                          :value="option.value"
                        >
                          {{ option.label }}
                        </option>
                      </select>
                    </div>
                    <div>
                      <label
                        for="plate_issue_date"
                        class="block text-sm font-medium text-gray-700 mb-1"
                        >Issue Date</label
                      >
                      <input
                        id="plate_issue_date"
                        v-model="form.plate_issue_date"
                        type="date"
                        class="w-full rounded-md border-gray-300 shadow-sm focus:border-light-blue focus:ring focus:ring-light-blue focus:ring-opacity-20"
                      />
                    </div>
                    <div>
                      <label
                        for="plate_expiration_date"
                        class="block text-sm font-medium text-gray-700 mb-1"
                        >Expiration Date</label
                      >
                      <input
                        id="plate_expiration_date"
                        v-model="form.plate_expiration_date"
                        type="date"
                        class="w-full rounded-md border-gray-300 shadow-sm focus:border-light-blue focus:ring focus:ring-light-blue focus:ring-opacity-20"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <!-- Registration Information -->
              <div class="bg-gray-50 rounded-lg shadow-sm overflow-hidden">
                <div class="bg-gray-100 px-4 py-3 border-b border-gray-200">
                  <h5 class="font-medium text-gray-900 flex items-center">
                    <font-awesome-icon :icon="['fas', 'file-alt']" class="mr-2 text-light-blue" />
                    Registration Information
                  </h5>
                </div>
                <div class="p-4">
                  <div class="space-y-4">
                    <div>
                      <label for="status" class="block text-sm font-medium text-gray-700 mb-1"
                        >Status</label
                      >
                      <select
                        id="status"
                        v-model="form.status"
                        class="w-full rounded-md border-gray-300 shadow-sm focus:border-light-blue focus:ring focus:ring-light-blue focus:ring-opacity-20"
                      >
                        <option
                          v-for="option in statusOptions"
                          :key="option.value"
                          :value="option.value"
                        >
                          {{ option.label }}
                        </option>
                      </select>
                    </div>
                    <div>
                      <label for="region" class="block text-sm font-medium text-gray-700 mb-1"
                        >Region</label
                      >
                      <input
                        id="region"
                        v-model="form.region"
                        type="text"
                        class="w-full rounded-md border-gray-300 shadow-sm focus:border-light-blue focus:ring focus:ring-light-blue focus:ring-opacity-20"
                      />
                    </div>
                    <div>
                      <label
                        for="serial_number"
                        class="block text-sm font-medium text-gray-700 mb-1"
                        >Serial Number</label
                      >
                      <input
                        id="serial_number"
                        v-model="form.serial_number"
                        type="text"
                        class="w-full rounded-md border-gray-300 shadow-sm focus:border-light-blue focus:ring focus:ring-light-blue focus:ring-opacity-20"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <!-- Additional Information -->
              <div class="bg-gray-50 rounded-lg shadow-sm overflow-hidden md:col-span-2">
                <div class="bg-gray-100 px-4 py-3 border-b border-gray-200">
                  <h5 class="font-medium text-gray-900 flex items-center">
                    <font-awesome-icon
                      :icon="['fas', 'info-circle']"
                      class="mr-2 text-light-blue"
                    />
                    Additional Information
                  </h5>
                </div>
                <div class="p-4">
                  <div>
                    <label for="notes" class="block text-sm font-medium text-gray-700 mb-1"
                      >Notes</label
                    >
                    <textarea
                      id="notes"
                      v-model="form.notes"
                      rows="3"
                      class="w-full rounded-md border-gray-300 shadow-sm focus:border-light-blue focus:ring focus:ring-light-blue focus:ring-opacity-20"
                    ></textarea>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div class="bg-gray-50 px-6 py-4 border-t border-gray-200 flex justify-end space-x-2">
          <button
            type="button"
            @click="closeModal"
            class="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors duration-200"
          >
            Cancel
          </button>
          <button
            type="submit"
            class="px-4 py-2 bg-light-blue text-white rounded-md hover:bg-blue-700 transition-colors duration-200"
          >
            Save Changes
          </button>
        </div>
      </form>
    </div>
  </div>
</template>
