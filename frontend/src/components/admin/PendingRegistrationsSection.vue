<script setup>
import { ref, computed, defineAsyncComponent } from 'vue'
import { useVehicleRegistrationFormStore } from '@/stores/vehicleRegistrationForm'
import { useUserStore } from '@/stores/user'

const RegistrationDetailsModal = defineAsyncComponent(
  () => import('@/components/modals/RegistrationDetailsModal.vue'),
)

// Modal state
const selectedRegistration = ref(null)
const showDetailsModal = ref(false)

const openDetailsModal = (registration) => {
  // Ensure all required properties are present in the registration object
  selectedRegistration.value = {
    ...registration,
    // Add any missing properties with default values
    applicantName: registration.applicantName || 'Unknown',
    applicantEmail: registration.applicantEmail || 'No email',
    applicantPhone: registration.applicantPhone || 'Not provided',
    make: registration.make || 'Unknown',
    model: registration.model || 'Unknown',
    year: registration.year || 'Unknown',
    color: registration.color || 'Unknown',
    engineNumber: registration.engineNumber || 'Unknown',
    chassisNumber: registration.chassisNumber || 'Unknown',
    plateNumber: registration.plateNumber || 'Pending',
    vehicleType: registration.vehicleType || 'Unknown',
    registrationType: registration.registrationType || 'Unknown',
    referenceCode: registration.referenceCode || 'Unknown',
    submissionDate: registration.submissionDate || 'Not specified',
    expiryDate: registration.expiryDate || 'Not applicable',
    inspectionStatus: registration.inspectionStatus || 'pending',
    paymentStatus: registration.paymentStatus || 'pending',
    verificationStatus: registration.verificationStatus || 'pending',
    status: registration.status || 'pending',
  }
  showDetailsModal.value = true
}

const closeDetailsModal = () => {
  showDetailsModal.value = false
  selectedRegistration.value = null
}

const vehicleRegistrationFormStore = useVehicleRegistrationFormStore()
const userStore = useUserStore()

// Get registrations from store
const registrations = computed(() => {
  const forms = vehicleRegistrationFormStore.forms
  return forms.map((form) => ({
    id: form.id,
    submissionDate: form.appointmentDate || 'Not scheduled',
    applicantName:
      userStore.mockUsers.find((user) => user.ltoClientId === form.userId)?.firstName +
        ' ' +
        userStore.mockUsers.find((user) => user.ltoClientId === form.userId)?.lastName ||
      'Unknown User',
    applicantEmail:
      userStore.mockUsers.find((user) => user.ltoClientId === form.userId)?.email || 'No email',
    applicantPhone:
      userStore.mockUsers.find((user) => user.ltoClientId === form.userId)?.phone || 'Not provided',
    vehicleType: form.vehicleType || 'car',
    plateNumber: 'Pending',
    status: form.inspectionStatus,
    make: form.make,
    model: form.model,
    year: form.year,
    color: form.color,
    engineNumber: form.engineNumber,
    chassisNumber: form.chassisNumber,
    registrationType: form.isNewVehicle ? 'New Vehicle' : 'Renewal',
    expiryDate: 'Not applicable',
    referenceCode: form.referenceCode,
    inspectionStatus: form.inspectionStatus,
    paymentStatus: form.paymentStatus,
    verificationStatus: form.verificationStatus,
    appointmentDate: form.appointmentDate,
    appointmentTime: form.appointmentTime,
  }))
})

// Filter registrations by status
const pendingRegistrations = computed(() =>
  registrations.value.filter((reg) => reg.status === 'pending'),
)

const approvedRegistrations = computed(() =>
  registrations.value.filter((reg) => reg.status === 'approved'),
)

const archivedRegistrations = computed(() =>
  registrations.value.filter((reg) => reg.status === 'rejected'),
)

// Search functionality
const searchQuery = ref('')
const activeTab = ref('pending')

const filteredRegistrations = computed(() => {
  let filtered
  switch (activeTab.value) {
    case 'pending':
      filtered = pendingRegistrations.value
      break
    case 'approved':
      filtered = approvedRegistrations.value
      break
    case 'archived':
      filtered = archivedRegistrations.value
      break
    default:
      filtered = []
  }

  if (!searchQuery.value) return filtered

  const query = searchQuery.value.toLowerCase()
  return filtered.filter(
    (registration) =>
      registration.applicantName.toLowerCase().includes(query) ||
      registration.plateNumber.toLowerCase().includes(query) ||
      registration.vehicleType.toLowerCase().includes(query),
  )
})

// Registration actions
const approveRegistration = (id) => {
  const registration = registrations.value.find((reg) => reg.id === id)
  if (registration) {
    registration.status = 'approved'
  }
}

const rejectRegistration = (id) => {
  const registration = registrations.value.find((reg) => reg.id === id)
  if (registration) {
    registration.status = 'archived'
  }
}
</script>

<template>
  <div class="space-y-6 p-6">
    <!-- Page Header -->
    <div class="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
      <div>
        <h1 class="text-2xl font-bold text-gray-800">Registration Management</h1>
        <p class="text-gray-600 mt-1">Review and manage vehicle registration requests</p>
      </div>
    </div>

    <!-- Search and Filter Bar -->
    <div class="bg-white rounded-lg shadow-sm p-4 mb-6">
      <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div class="relative flex-grow">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search by name, plate number, or vehicle type..."
            class="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-dark-blue/20 transition-all"
          />
          <div class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
            <font-awesome-icon :icon="['fas', 'search']" class="w-4 h-4" />
          </div>
        </div>
      </div>
    </div>

    <!-- Status Tabs -->
    <div class="border-b border-gray-200 mb-6">
      <nav class="-mb-px flex space-x-8">
        <button
          @click="activeTab = 'pending'"
          :class="[
            'py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap',
            activeTab === 'pending'
              ? 'border-dark-blue text-dark-blue'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
          ]"
        >
          Pending
          <span class="ml-2 py-0.5 px-2 text-xs rounded-full bg-yellow-100 text-yellow-800">{{
            pendingRegistrations.length
          }}</span>
        </button>

        <button
          @click="activeTab = 'approved'"
          :class="[
            'py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap',
            activeTab === 'approved'
              ? 'border-dark-blue text-dark-blue'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
          ]"
        >
          Approved
          <span class="ml-2 py-0.5 px-2 text-xs rounded-full bg-green-100 text-green-800">{{
            approvedRegistrations.length
          }}</span>
        </button>

        <button
          @click="activeTab = 'archived'"
          :class="[
            'py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap',
            activeTab === 'archived'
              ? 'border-dark-blue text-dark-blue'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
          ]"
        >
          Archived
          <span class="ml-2 py-0.5 px-2 text-xs rounded-full bg-gray-100 text-gray-800">{{
            archivedRegistrations.length
          }}</span>
        </button>
      </nav>
    </div>

    <!-- Registration Cards Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div
        v-for="registration in filteredRegistrations"
        :key="registration.id"
        class="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300"
      >
        <!-- Vehicle Image Section -->
        <div
          :class="[
            'h-48 relative overflow-hidden',
            registration.status === 'pending'
              ? 'bg-gradient-to-br from-yellow-50 via-orange-50 to-amber-100'
              : registration.status === 'approved'
                ? 'bg-gradient-to-br from-green-50 via-emerald-50 to-teal-100'
                : 'bg-gradient-to-br from-gray-50 via-slate-50 to-zinc-100',
          ]"
        >
          <div class="absolute inset-0 flex items-center justify-center">
            <font-awesome-icon
              :icon="
                (registration.vehicleType || 'car').toLowerCase() === 'motorcycle'
                  ? ['fas', 'motorcycle']
                  : ['fas', 'car']
              "
              class="w-24 h-24 opacity-80"
              :class="[
                registration.color.toLowerCase() === 'white'
                  ? 'text-gray-300'
                  : registration.color.toLowerCase() === 'black'
                    ? 'text-gray-700'
                    : registration.color.toLowerCase() === 'red'
                      ? 'text-red-400'
                      : registration.color.toLowerCase() === 'blue'
                        ? 'text-blue-400'
                        : 'text-gray-300',
              ]"
            />
          </div>
          <div class="absolute top-4 right-4">
            <span
              :class="[
                'px-2 py-1 text-xs font-semibold rounded-full shadow-sm',
                registration.status === 'pending'
                  ? 'bg-yellow-100 text-yellow-800'
                  : registration.status === 'approved'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-gray-100 text-gray-800',
              ]"
            >
              {{ registration.status.charAt(0).toUpperCase() + registration.status.slice(1) }}
            </span>
          </div>
        </div>

        <!-- Registration Details -->
        <div class="p-6">
          <div class="flex justify-between items-center mb-3">
            <h3 class="text-lg font-bold text-gray-800">
              {{ registration.make }} {{ registration.model }}
            </h3>
            <span class="text-sm text-gray-500">{{ registration.year }}</span>
          </div>

          <div class="space-y-3 mb-4">
            <div class="flex items-center text-sm">
              <font-awesome-icon :icon="['fas', 'user']" class="w-4 h-4 text-gray-400 mr-2" />
              <div>
                <span class="font-medium text-gray-700">{{ registration.applicantName }}</span>
                <span class="text-gray-500 block text-xs">{{ registration.applicantEmail }}</span>
              </div>
            </div>
            <div class="flex items-center text-sm">
              <font-awesome-icon :icon="['fas', 'id-card']" class="w-4 h-4 text-gray-400 mr-2" />
              <span class="text-gray-600">{{ registration.plateNumber }}</span>
            </div>
            <div class="flex items-center text-sm">
              <font-awesome-icon :icon="['fas', 'calendar']" class="w-4 h-4 text-gray-400 mr-2" />
              <span class="text-gray-600">Submitted: {{ registration.submissionDate }}</span>
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="flex justify-end space-x-2 mt-4 pt-4 border-t border-gray-100">
            <button
              class="px-4 py-2 bg-dark-blue text-white rounded-md hover:bg-blue-700 transition-colors"
              @click="openDetailsModal(registration)"
            >
              View Details
            </button>
            <template v-if="registration.status === 'pending'">
              <button
                @click="approveRegistration(registration.id)"
                class="px-4 py-2 bg-green-100 text-green-700 rounded-md hover:bg-green-200 transition-colors"
              >
                Approve
              </button>
              <button
                @click="rejectRegistration(registration.id)"
                class="px-4 py-2 bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors"
              >
                Reject
              </button>
            </template>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div
        v-if="filteredRegistrations.length === 0"
        class="col-span-full py-12 flex flex-col items-center justify-center bg-white rounded-lg shadow-sm"
      >
        <div class="bg-gray-100 rounded-full p-4 mb-4">
          <font-awesome-icon :icon="['fas', 'clipboard-list']" class="text-gray-400 w-8 h-8" />
        </div>
        <h3 class="text-lg font-medium text-gray-900 mb-1">No registrations found</h3>
        <p class="text-gray-500">Try adjusting your search criteria</p>
      </div>
    </div>

    <!-- Registration Details Modal -->
    <RegistrationDetailsModal
      v-if="selectedRegistration"
      :show="showDetailsModal"
      :registration="selectedRegistration"
      @close="closeDetailsModal"
    />
  </div>
</template>
