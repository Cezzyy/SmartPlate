<script setup lang="ts">
import { ref, computed, defineAsyncComponent, onMounted } from 'vue'
import { useAdminDashboardStore } from '@/stores/adminDashboard'
import { useUserStore } from '@/stores/user'
import type {
  VehicleRegistrationForm,
  AdditionalVehicleData,
  RegistrationStatus,
} from '@/types/vehicleRegistration'

interface Registration {
  id: string
  submissionDate: string
  applicantName: string
  applicantEmail: string
  applicantPhone: string
  vehicleType: string
  plateNumber: string
  status: RegistrationStatus
  make: string
  model: string
  year: string
  color: string
  engineNumber: string
  chassisNumber: string
  registrationType: string
  expiryDate: string
  referenceCode: string
  inspectionStatus: string
  paymentStatus: string
  verificationStatus: string
  appointmentDate: string | null | undefined
  appointmentTime: string | null | undefined
  userId?: string
  isNewVehicle?: boolean
  documents?: any
  inspectionCode?: string
  paymentCode?: string
  vehicleInfo: string
}

// Load inspection and payment modals asynchronously
const RegistrationDetailsModal = defineAsyncComponent(
  () => import('@/components/modals/RegistrationDetailsModal.vue'),
)

const VehicleInspectionModal = defineAsyncComponent(
  () => import('@/components/modals/VehicleInspectionModal.vue'),
)

const PaymentProcessModal = defineAsyncComponent(
  () => import('@/components/modals/PaymentProcessModal.vue'),
)

// Pagination state
const currentPage = ref<number>(1)
const itemsPerPage = ref<number>(10)
const sortBy = ref<string>('submissionDate')
const sortDesc = ref<boolean>(true)

// Modal states - we use two separate refs for different modal types
const selectedRegistration = ref<Registration | null>(null)
const selectedVehicleForm = ref<VehicleRegistrationForm | null>(null)
const showDetailsModal = ref<boolean>(false)
const showInspectionModal = ref<boolean>(false)
const showPaymentModal = ref<boolean>(false)

const adminStore = useAdminDashboardStore()
const userStore = useUserStore()

// Load data when component mounts
onMounted(async () => {
  try {
    await adminStore.fetchAllData()
  } catch (error) {
    console.error('Error loading registration data:', error)
  }
})

// MODAL HANDLERS
const openDetailsModal = (registration: Registration): void => {
  // Create a compatible object for the modal
  const modalRegistration = {
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
    vehicleInfo: `${registration.make || 'Unknown'} ${registration.model || 'Unknown'}`,
  }
  
  // @ts-ignore - Handle type incompatibility between our Registration and the modal's expected type
  selectedRegistration.value = modalRegistration
  showDetailsModal.value = true
}

const closeDetailsModal = (): void => {
  showDetailsModal.value = false
  selectedRegistration.value = null
}

const openInspectionModal = (registration: Registration): void => {
  // Get the full vehicleRegistrationForm from the store to ensure all required properties are present
  const fullForm = adminStore.registrations.find((f) => f.id === registration.id)

  if (fullForm) {
    selectedVehicleForm.value = fullForm
  } else {
    console.error('Registration form not found in store:', registration.id)
  }

  showInspectionModal.value = true
}

const closeInspectionModal = (): void => {
  showInspectionModal.value = false
  selectedVehicleForm.value = null
}

const openPaymentModal = (registration: Registration): void => {
  // Get the full vehicleRegistrationForm from the store to ensure all required properties are present
  const fullForm = adminStore.registrations.find((f) => f.id === registration.id)

  if (fullForm) {
    selectedVehicleForm.value = fullForm
  } else {
    console.error('Registration form not found in store:', registration.id)
  }

  showPaymentModal.value = true
}

const closePaymentModal = (): void => {
  showPaymentModal.value = false
  selectedVehicleForm.value = null
}

// Get registrations from the admin store
const registrations = computed(() => {
  const forms = adminStore.registrations
  return forms.map((form) => ({
    id: form.id,
    submissionDate: form.appointmentDate || 'Not scheduled',
    applicantName:
      userStore.users.find((user) => user.ltoClientId === form.userId)?.firstName +
        ' ' +
        userStore.users.find((user) => user.ltoClientId === form.userId)?.lastName ||
      'Unknown User',
    applicantEmail:
      userStore.users.find((user) => user.ltoClientId === form.userId)?.email || 'No email',
    applicantPhone:
      userStore.users.find((user) => user.ltoClientId === form.userId)?.telephoneNumber ||
      'Not provided',
    vehicleType: form.vehicleType || 'car',
    plateNumber: 'Pending',
    status: form.status,
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
    userId: form.userId,
    isNewVehicle: form.isNewVehicle,
    documents: form.documents,
    inspectionCode: form.inspectionCode,
    paymentCode: form.paymentCode,
    vehicleInfo: `${form.make} ${form.model}`,
  }))
})

// Filter registrations by status
const pendingRegistrations = computed(() =>
  registrations.value.filter((reg) => reg.status === 'pending'),
)

const processingRegistrations = computed(() =>
  registrations.value.filter(
    (reg) =>
      reg.status === 'approved' &&
      (reg.inspectionStatus !== 'approved' || reg.paymentStatus !== 'approved'),
  ),
)

const completedRegistrations = computed(() =>
  registrations.value.filter(
    (reg) =>
      reg.status === 'approved' &&
      reg.inspectionStatus === 'approved' &&
      reg.paymentStatus === 'approved',
  ),
)

// Search functionality
const searchQuery = ref<string>('')
const activeTab = ref<'pending' | 'processing' | 'completed'>('pending')

const filteredRegistrations = computed(() => {
  let filtered: Registration[] = []
  switch (activeTab.value) {
    case 'pending':
      filtered = pendingRegistrations.value
      break
    case 'processing':
      filtered = processingRegistrations.value
      break
    case 'completed':
      filtered = completedRegistrations.value
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
      registration.vehicleType.toLowerCase().includes(query) ||
      (registration.make + ' ' + registration.model).toLowerCase().includes(query) ||
      registration.referenceCode.toLowerCase().includes(query),
  )
})

// Pagination
const paginatedRegistrations = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value
  const end = start + itemsPerPage.value
  return sortedRegistrations.value.slice(start, end)
})

const totalPages = computed(() =>
  Math.ceil(filteredRegistrations.value.length / itemsPerPage.value),
)

// Sorting
const sortedRegistrations = computed(() => {
  return [...filteredRegistrations.value].sort((a, b) => {
    const modifier = sortDesc.value ? -1 : 1

    if (sortBy.value === 'vehicleInfo') {
      const aValue = `${a.make} ${a.model}`.toLowerCase()
      const bValue = `${b.make} ${b.model}`.toLowerCase()
      return modifier * aValue.localeCompare(bValue)
    }

    if (sortBy.value === 'submissionDate') {
      // Handle date comparison
      const aDate = new Date(a.submissionDate).getTime()
      const bDate = new Date(b.submissionDate).getTime()
      return modifier * (aDate - bDate)
    }

    const aValue = a[sortBy.value as keyof Registration]?.toString().toLowerCase() || ''
    const bValue = b[sortBy.value as keyof Registration]?.toString().toLowerCase() || ''
    return modifier * aValue.localeCompare(bValue)
  })
})

const sort = (column: string) => {
  if (sortBy.value === column) {
    sortDesc.value = !sortDesc.value
  } else {
    sortBy.value = column
    sortDesc.value = true
  }
}

// Registration actions - updated to use admin store
const processRegistration = async (data: {
  registrationId: string
  action: 'approve' | 'reject'
}): Promise<void> => {
  try {
    const registrationData = {
      status: data.action === 'approve' ? 'approved' : 'rejected',
    }
    
    if (data.action === 'approve') {
      // Add inspection and payment related fields
      Object.assign(registrationData, {
        inspectionStatus: 'pending',
        paymentStatus: 'pending',
        inspectionCode: `INS-${Date.now().toString().slice(-6)}-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`,
        paymentCode: `PAY-${Date.now().toString().slice(-6)}-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`,
      })
    }
    
    // Update registration via API
    await adminStore.updateRegistration(data.registrationId, registrationData)
    
    // Refresh registrations data
    await adminStore.fetchAllRegistrations()
  } catch (error) {
    console.error('Error processing registration:', error)
  }
}

// Handle inspection submission - updated to use admin store
const handleInspectionSubmit = async (data: {
  id: string
  inspectionStatus: 'approved' | 'rejected'
  inspectionNotes: string
  additionalVehicleData: AdditionalVehicleData
}): Promise<void> => {
  try {
    // Create the inspection record
    await adminStore.createInspection(data.id, {
      status: data.inspectionStatus,
      notes: data.inspectionNotes,
      vehicleData: data.additionalVehicleData
    })
    
    // Update the registration status if needed
    if (data.inspectionStatus === 'rejected') {
      await adminStore.updateRegistration(data.id, { status: 'rejected' })
    } else if (data.inspectionStatus === 'approved') {
      // Set default appointment if not already scheduled
      const registration = adminStore.registrations.find(r => r.id === data.id)
      if (registration && (!registration.appointmentDate || !registration.appointmentTime)) {
        // Set date to 7 days from now
        const appointmentDate = new Date()
        appointmentDate.setDate(appointmentDate.getDate() + 7)
        
        await adminStore.updateRegistration(data.id, {
          appointmentDate: appointmentDate.toISOString().split('T')[0],
          appointmentTime: '10:00'
        })
      }
    }
    
    // Refresh registrations data
    await adminStore.fetchAllRegistrations()
    
    showInspectionModal.value = false
    selectedRegistration.value = null
  } catch (error) {
    console.error('Error submitting inspection:', error)
  }
}

// Handle payment submission - updated to use admin store
const handlePaymentSubmit = async (data: {
  id: string
  paymentStatus: 'approved' | 'rejected'
  paymentNotes: string
  paymentDetails: {
    amountPaid: number
    paymentDate: string
    paymentMethod: string
    receiptNumber: string
    referenceNumber: string
  }
}): Promise<void> => {
  try {
    // Create the payment record
    await adminStore.createPayment(data.id, {
      status: data.paymentStatus,
      notes: data.paymentNotes,
      ...data.paymentDetails
    })
    
    // Update the registration status
    if (data.paymentStatus === 'approved') {
      await adminStore.updateRegistration(data.id, { 
        status: 'payment_completed',
        paymentConfirmationCode: `CONF-${Date.now().toString().slice(-6)}-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`
      })
    } else if (data.paymentStatus === 'rejected') {
      await adminStore.updateRegistration(data.id, { status: 'rejected' })
    }
    
    // Refresh registrations data
    await adminStore.fetchAllRegistrations()
    
    showPaymentModal.value = false
    selectedRegistration.value = null
  } catch (error) {
    console.error('Error submitting payment:', error)
  }
}

// Status color utilities
const getStatusColor = (status: string): string => {
  switch (status?.toLowerCase()) {
    case 'approved':
      return 'bg-green-100 text-green-800'
    case 'pending':
      return 'bg-yellow-100 text-yellow-800'
    case 'rejected':
      return 'bg-red-100 text-red-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

const getStatusDot = (status: string): string => {
  switch (status?.toLowerCase()) {
    case 'approved':
      return 'bg-green-500'
    case 'pending':
      return 'bg-yellow-500'
    case 'rejected':
      return 'bg-red-500'
    default:
      return 'bg-gray-500'
  }
}

// Format date
const formatDate = (dateString: string): string => {
  if (!dateString || dateString === 'Not scheduled' || dateString === 'Not specified')
    return dateString

  try {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  } catch (e) {
    return dateString
  }
}

// Determine if registration is eligible for inspection
const canProcessInspection = (registration: Registration): boolean => {
  return registration.status === 'approved' && registration.inspectionStatus === 'pending'
}

// Determine if registration is eligible for payment
const canProcessPayment = (registration: Registration): boolean => {
  return (
    registration.status === 'approved' &&
    registration.inspectionStatus === 'approved' &&
    registration.paymentStatus === 'pending'
  )
}
</script>

<template>
  <div>
    <!-- Page Header -->
    <div class="flex justify-between items-center mb-8">
      <div>
        <h2 class="text-2xl font-bold text-dark-blue">Registration Applications</h2>
        <p class="text-gray mt-1">Manage vehicle registration applications and requests</p>
      </div>
    </div>

    <!-- Filters and Search -->
    <div class="bg-white rounded-xl shadow-md border border-light-gray border-opacity-20 p-6 mb-8">
      <div class="space-y-5">
        <!-- Search Bar -->
        <div class="relative">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Search by name, reference code, vehicle info..."
            class="w-full pl-10 pr-4 py-3 rounded-lg bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-light-blue focus:border-transparent transition-all"
          />
          <font-awesome-icon
            :icon="['fas', 'search']"
            class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray"
          />
        </div>

        <!-- Status Tabs -->
        <div class="border-b border-gray-200">
          <nav class="-mb-px flex space-x-8">
            <button
              @click="activeTab = 'pending'"
              :class="[
                'whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm',
                activeTab === 'pending'
                  ? 'border-dark-blue text-dark-blue'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
              ]"
            >
              Pending Approval
              <span class="ml-2 py-0.5 px-2 text-xs rounded-full bg-yellow-100 text-yellow-800">
                {{ pendingRegistrations.length }}
              </span>
            </button>

            <button
              @click="activeTab = 'processing'"
              :class="[
                'whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm',
                activeTab === 'processing'
                  ? 'border-dark-blue text-dark-blue'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
              ]"
            >
              Processing
              <span class="ml-2 py-0.5 px-2 text-xs rounded-full bg-blue-100 text-blue-800">
                {{ processingRegistrations.length }}
              </span>
            </button>

            <button
              @click="activeTab = 'completed'"
              :class="[
                'whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm',
                activeTab === 'completed'
                  ? 'border-dark-blue text-dark-blue'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
              ]"
            >
              Completed
              <span class="ml-2 py-0.5 px-2 text-xs rounded-full bg-green-100 text-green-800">
                {{ completedRegistrations.length }}
              </span>
            </button>
          </nav>
        </div>
      </div>
    </div>

    <!-- Table View for Registrations -->
    <div
      class="bg-white rounded-xl shadow-md border border-light-gray border-opacity-20 overflow-hidden mb-6"
    >
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th
                @click="sort('referenceCode')"
                class="px-6 py-4 text-left text-xs font-medium text-gray uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
              >
                <div class="flex items-center gap-2">
                  Reference Code
                  <span class="text-gray-400">
                    <font-awesome-icon
                      v-if="sortBy === 'referenceCode'"
                      :icon="['fas', sortDesc ? 'sort-down' : 'sort-up']"
                    />
                    <font-awesome-icon v-else :icon="['fas', 'sort']" />
                  </span>
                </div>
              </th>
              <th
                @click="sort('vehicleInfo')"
                class="px-6 py-4 text-left text-xs font-medium text-gray uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
              >
                <div class="flex items-center gap-2">
                  Vehicle Info
                  <span class="text-gray-400">
                    <font-awesome-icon
                      v-if="sortBy === 'vehicleInfo'"
                      :icon="['fas', sortDesc ? 'sort-down' : 'sort-up']"
                    />
                    <font-awesome-icon v-else :icon="['fas', 'sort']" />
                  </span>
                </div>
              </th>
              <th
                @click="sort('applicantName')"
                class="px-6 py-4 text-left text-xs font-medium text-gray uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
              >
                <div class="flex items-center gap-2">
                  Applicant
                  <span class="text-gray-400">
                    <font-awesome-icon
                      v-if="sortBy === 'applicantName'"
                      :icon="['fas', sortDesc ? 'sort-down' : 'sort-up']"
                    />
                    <font-awesome-icon v-else :icon="['fas', 'sort']" />
                  </span>
                </div>
              </th>
              <th
                @click="sort('registrationType')"
                class="px-6 py-4 text-left text-xs font-medium text-gray uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
              >
                <div class="flex items-center gap-2">
                  Type
                  <span class="text-gray-400">
                    <font-awesome-icon
                      v-if="sortBy === 'registrationType'"
                      :icon="['fas', sortDesc ? 'sort-down' : 'sort-up']"
                    />
                    <font-awesome-icon v-else :icon="['fas', 'sort']" />
                  </span>
                </div>
              </th>
              <th
                @click="sort('submissionDate')"
                class="px-6 py-4 text-left text-xs font-medium text-gray uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
              >
                <div class="flex items-center gap-2">
                  Submission Date
                  <span class="text-gray-400">
                    <font-awesome-icon
                      v-if="sortBy === 'submissionDate'"
                      :icon="['fas', sortDesc ? 'sort-down' : 'sort-up']"
                    />
                    <font-awesome-icon v-else :icon="['fas', 'sort']" />
                  </span>
                </div>
              </th>
              <th
                v-if="activeTab !== 'pending'"
                class="px-6 py-4 text-left text-xs font-medium text-gray uppercase tracking-wider"
              >
                <div class="flex items-center gap-2">Process Status</div>
              </th>
              <th
                class="px-6 py-4 text-right text-xs font-medium text-gray uppercase tracking-wider"
              >
                Actions
              </th>
            </tr>
          </thead>
          <tbody v-if="paginatedRegistrations.length > 0" class="bg-white divide-y divide-gray-200">
            <tr
              v-for="registration in paginatedRegistrations"
              :key="registration.id"
              class="hover:bg-gray-50 transition-colors"
            >
              <td class="px-6 py-4 whitespace-nowrap">
                <span class="font-medium text-dark-blue">{{ registration.referenceCode }}</span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                  <div
                    class="flex-shrink-0 h-10 w-10 bg-light-blue bg-opacity-10 rounded-full flex items-center justify-center"
                  >
                    <font-awesome-icon
                      :icon="[
                        'fas',
                        registration.vehicleType.toLowerCase() === 'motorcycle'
                          ? 'motorcycle'
                          : 'car',
                      ]"
                      class="text-light-blue"
                    />
                  </div>
                  <div class="ml-4">
                    <div class="text-sm font-medium text-dark-blue">
                      {{ registration.make }} {{ registration.model }}
                    </div>
                    <div class="text-xs text-gray">
                      {{ registration.year }} • {{ registration.color }}
                    </div>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm font-medium text-gray-900">
                  {{ registration.applicantName }}
                </div>
                <div class="text-xs text-gray-500">{{ registration.applicantEmail }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span
                  class="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800"
                >
                  {{ registration.registrationType }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {{ formatDate(registration.submissionDate) }}
              </td>

              <!-- Process Status column - only for Processing and Completed tabs -->
              <td v-if="activeTab !== 'pending'" class="px-6 py-4 whitespace-nowrap">
                <div class="flex flex-col space-y-1">
                  <div class="flex items-center">
                    <span class="text-xs font-medium text-gray-500 w-20">Inspection:</span>
                    <span
                      :class="[
                        'px-2 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full items-center',
                        getStatusColor(registration.inspectionStatus),
                      ]"
                    >
                      <span
                        :class="[
                          'w-1.5 h-1.5 rounded-full mr-1.5',
                          getStatusDot(registration.inspectionStatus),
                        ]"
                      ></span>
                      {{
                        registration.inspectionStatus.charAt(0).toUpperCase() +
                        registration.inspectionStatus.slice(1)
                      }}
                    </span>
                  </div>
                  <div class="flex items-center">
                    <span class="text-xs font-medium text-gray-500 w-20">Payment:</span>
                    <span
                      :class="[
                        'px-2 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full items-center',
                        getStatusColor(registration.paymentStatus),
                      ]"
                    >
                      <span
                        :class="[
                          'w-1.5 h-1.5 rounded-full mr-1.5',
                          getStatusDot(registration.paymentStatus),
                        ]"
                      ></span>
                      {{
                        registration.paymentStatus.charAt(0).toUpperCase() +
                        registration.paymentStatus.slice(1)
                      }}
                    </span>
                  </div>
                </div>
              </td>

              <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div class="flex items-center justify-end space-x-2">
                  <button
                    @click="openDetailsModal(registration)"
                    class="text-light-blue hover:text-dark-blue transition-colors"
                    title="View Details"
                  >
                    <font-awesome-icon :icon="['fas', 'eye']" />
                  </button>

                  <!-- Pending tab buttons -->
                  <template v-if="activeTab === 'pending'">
                    <button
                      @click="
                        processRegistration({ registrationId: registration.id, action: 'approve' })
                      "
                      class="text-green-600 hover:text-green-800 transition-colors"
                      title="Approve"
                    >
                      <font-awesome-icon :icon="['fas', 'check']" />
                    </button>
                    <button
                      @click="
                        processRegistration({ registrationId: registration.id, action: 'reject' })
                      "
                      class="text-red-600 hover:text-red-800 transition-colors"
                      title="Reject"
                    >
                      <font-awesome-icon :icon="['fas', 'times']" />
                    </button>
                  </template>

                  <!-- Processing tab buttons -->
                  <template v-if="activeTab === 'processing'">
                    <button
                      v-if="canProcessInspection(registration)"
                      @click="openInspectionModal(registration)"
                      class="text-blue-600 hover:text-blue-800 transition-colors"
                      title="Process Inspection"
                    >
                      <font-awesome-icon :icon="['fas', 'clipboard-check']" />
                    </button>
                    <button
                      v-if="canProcessPayment(registration)"
                      @click="openPaymentModal(registration)"
                      class="text-green-600 hover:text-green-800 transition-colors"
                      title="Process Payment"
                    >
                      <font-awesome-icon :icon="['fas', 'money-bill']" />
                    </button>
                  </template>
                </div>
              </td>
            </tr>
          </tbody>
          <tbody v-else>
            <tr>
              <td
                :colspan="activeTab !== 'pending' ? 7 : 6"
                class="px-6 py-10 text-center text-gray"
              >
                <div class="flex flex-col items-center justify-center space-y-3">
                  <div class="bg-light-blue bg-opacity-10 p-4 rounded-full">
                    <font-awesome-icon
                      :icon="['fas', 'file-alt']"
                      class="text-3xl text-light-blue"
                    />
                  </div>
                  <p class="text-lg font-medium text-dark-blue">No registrations found</p>
                  <p class="text-sm text-gray">Try adjusting your search or filter criteria</p>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div class="px-6 py-4 bg-gray-50 border-t border-gray-200">
        <div class="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div class="text-sm text-gray">
            Showing
            {{ filteredRegistrations.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0 }} to
            {{ Math.min(currentPage * itemsPerPage, filteredRegistrations.length) }} of
            {{ filteredRegistrations.length }} registrations
          </div>
          <div class="flex items-center gap-2">
            <button
              @click="currentPage--"
              :disabled="currentPage === 1 || filteredRegistrations.length === 0"
              class="p-2 rounded-lg border border-gray-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 transition-colors"
            >
              <font-awesome-icon :icon="['fas', 'chevron-left']" />
            </button>
            <span class="text-sm text-gray font-medium px-4">
              Page {{ filteredRegistrations.length > 0 ? currentPage : 0 }} of {{ totalPages }}
            </span>
            <button
              @click="currentPage++"
              :disabled="currentPage === totalPages || filteredRegistrations.length === 0"
              class="p-2 rounded-lg border border-gray-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 transition-colors"
            >
              <font-awesome-icon :icon="['fas', 'chevron-right']" />
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modals -->
    <RegistrationDetailsModal
      v-if="selectedRegistration && showDetailsModal"
      :show="showDetailsModal"
      :registration="selectedRegistration as any"
      @close="closeDetailsModal"
    />

    <VehicleInspectionModal
      v-if="selectedVehicleForm && showInspectionModal"
      :is-open="showInspectionModal"
      :registration="selectedVehicleForm"
      @close="closeInspectionModal"
      @submit="handleInspectionSubmit"
    />

    <PaymentProcessModal
      v-if="selectedVehicleForm && showPaymentModal"
      :is-open="showPaymentModal"
      :registration="selectedVehicleForm"
      @close="closePaymentModal"
      @submit="handlePaymentSubmit"
    />
  </div>
</template>
