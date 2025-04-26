<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, defineAsyncComponent } from 'vue'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

// Type definitions
interface PlateData {
  id: string
  plateNumber: string
  plateType: string
  region: string
  issueDate: string
  expirationDate: string
  status: string
}

interface RegistrationData {
  id: string
  owner: string
  make: string
  model: string
  year: string
  vehicleType: string
  chassisNumber: string
  engineNumber: string
  color: string
  status: string
}

interface OwnerData {
  id: string
  name: string
  ltoClientNumber: string
  address: string
  contactNumber: string
}

interface ScanResult {
  scanId: string
  timestamp: string
  location: string
  scannerId: string
  plateData: PlateData
  registrationData: RegistrationData
  ownerData: OwnerData
}

// Lazy load the modal component
const LTOPlateScanModal = defineAsyncComponent(
  () => import('@/components/lto/LTOPlateScanModal.vue'),
)

// Component state
// const isScanning = ref(false)
const scanResults = ref<ScanResult[]>([])
const selectedScan = ref<ScanResult | null>(null)
// const socket = ref<WebSocket | null>(null)
const connectionStatus = ref('disconnected')
const scannerStatus = ref('offline')
const searchQuery = ref('')
const isResultModalOpen = ref(false)

// Mock a new scan with random data
const generateMockScan = (): ScanResult => {
  const plateNumber = `${String.fromCharCode(65 + Math.floor(Math.random() * 26))}${String.fromCharCode(65 + Math.floor(Math.random() * 26))}${String.fromCharCode(65 + Math.floor(Math.random() * 26))} ${Math.floor(1000 + Math.random() * 9000)}`

  const vehicleTypes = ['Sedan', 'SUV', 'Pickup', 'Motorcycle', 'Van', 'Truck']
  const vehicleColors = ['White', 'Black', 'Silver', 'Gray', 'Red', 'Blue']
  const vehicleMakes = ['Toyota', 'Honda', 'Ford', 'Hyundai', 'Mitsubishi', 'Suzuki', 'Nissan']

  const registrationId = `REG-${new Date().getFullYear()}${String(Math.floor(1000 + Math.random() * 9000))}`
  const regionCode = plateNumber.charAt(0)
  const regions: Record<string, string> = {
    A: 'NCR',
    B: 'CALABARZON',
    C: 'CENTRAL_LUZON',
    D: 'WESTERN_VISAYAS',
    E: 'CENTRAL_VISAYAS',
  }

  // Generate dates
  const today = new Date()
  const issueDate = new Date(today)
  issueDate.setMonth(today.getMonth() - Math.floor(Math.random() * 24)) // Random date within last 2 years

  const expirationDate = new Date(issueDate)
  expirationDate.setFullYear(issueDate.getFullYear() + 3) // Expiration 3 years after issue

  // Generate random status: Active, Expired, or Not Found
  const statusRandom = Math.random()
  let plateStatus = 'Active'
  if (statusRandom < 0.1) {
    plateStatus = 'Expired'
  } else if (statusRandom < 0.15) {
    plateStatus = 'Not Found'
  }

  return {
    scanId: `SCAN-${Math.floor(10000 + Math.random() * 90000)}`,
    timestamp: new Date().toISOString(),
    location: Math.random() > 0.5 ? 'Main Gate Entrance' : 'Exit Gate Checkpoint',
    scannerId: `SCANNER-${Math.floor(1 + Math.random() * 5)}`,
    plateData: {
      id: `PLATE-${Math.floor(10000 + Math.random() * 90000)}`,
      plateNumber: plateNumber,
      plateType: Math.random() > 0.2 ? 'Private' : 'For Hire',
      region: regions[regionCode] || 'NCR',
      issueDate: issueDate.toISOString().split('T')[0],
      expirationDate: expirationDate.toISOString().split('T')[0],
      status: plateStatus,
    },
    registrationData: {
      id: registrationId,
      owner: `Owner-${Math.floor(1000 + Math.random() * 9000)}`,
      make: vehicleMakes[Math.floor(Math.random() * vehicleMakes.length)],
      model: `Model-${String.fromCharCode(65 + Math.floor(Math.random() * 26))}${Math.floor(10 + Math.random() * 90)}`,
      year: String(2015 + Math.floor(Math.random() * 9)),
      vehicleType: vehicleTypes[Math.floor(Math.random() * vehicleTypes.length)],
      chassisNumber: `CHAS${Math.floor(100000 + Math.random() * 900000)}`,
      engineNumber: `ENG${Math.floor(100000 + Math.random() * 900000)}`,
      color: vehicleColors[Math.floor(Math.random() * vehicleColors.length)],
      status: Math.random() > 0.1 ? 'Active' : 'Expired',
    },
    ownerData: {
      id: `USER-${Math.floor(10000 + Math.random() * 90000)}`,
      name: `Juan Dela Cruz ${Math.floor(100 + Math.random() * 900)}`,
      ltoClientNumber: `LTO-CLIENT-${Math.floor(1000 + Math.random() * 9000)}`,
      address: '123 Sample St., Makati City, Metro Manila',
      contactNumber: `+63${Math.floor(9000000000 + Math.random() * 999999999)}`,
    },
  }
}

// Filtered results based on search
const filteredResults = computed(() => {
  const query = searchQuery.value.toLowerCase()
  if (!query) return scanResults.value

  return scanResults.value.filter(
    (scan) =>
      scan.plateData.plateNumber.toLowerCase().includes(query) ||
      scan.registrationData.id.toLowerCase().includes(query) ||
      scan.registrationData.owner.toLowerCase().includes(query) ||
      scan.ownerData.name.toLowerCase().includes(query),
  )
})

// Format date for display
const formatDate = (dateString: string): string => {
  const date = new Date(dateString)
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

// Format date for display (without time)
const formatDateOnly = (dateString: string): string => {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

// WebSocket connection setup
const initWebSocket = () => {
  // This would connect to your actual backend in production
  // socket.value = new WebSocket('ws://your-backend-url/plate-scanner')

  connectionStatus.value = 'connecting'

  // Simulate successful connection
  setTimeout(() => {
    connectionStatus.value = 'connected'
    scannerStatus.value = 'ready'
  }, 1500)

  // In a real implementation, you would handle WebSocket events:
  /*
  socket.value.onopen = () => {
    connectionStatus.value = 'connected'
    console.log('WebSocket connection established')
  }
  
  socket.value.onmessage = (event) => {
    const data = JSON.parse(event.data)
    
    if (data.type === 'scanner_status') {
      scannerStatus.value = data.status
    } else if (data.type === 'scan_result') {
      handleScanResult(data.result)
    }
  }
  
  socket.value.onclose = () => {
    connectionStatus.value = 'disconnected'
    scannerStatus.value = 'offline'
    console.log('WebSocket connection closed')
  }
  
  socket.value.onerror = (error) => {
    connectionStatus.value = 'error'
    scannerStatus.value = 'error'
    console.error('WebSocket error:', error)
  }
  */
}

// // Handle scan result
// const handleScanResult = (result: ScanResult) => {
//   scanResults.value.unshift(result)
//   selectedScan.value = result
//   isResultModalOpen.value = true
// }

// Close the scan result modal
const closeResultModal = () => {
  isResultModalOpen.value = false
  selectedScan.value = null
}

// Clear WebSocket connection on component unmount
const clearWebSocket = () => {
  /*
  if (socket.value && socket.value.readyState === WebSocket.OPEN) {
    socket.value.close()
  }
  */
}

// Initialize connection on component mount
onMounted(() => {
  initWebSocket()

  // For demo purposes: Add some initial mock data
  for (let i = 0; i < 5; i++) {
    const mockScan = generateMockScan()
    // Adjust timestamps to be in the past
    const pastDate = new Date()
    pastDate.setMinutes(pastDate.getMinutes() - (i + 1) * 15)
    mockScan.timestamp = pastDate.toISOString()
    scanResults.value.push(mockScan)
  }
})

// Clean up on component unmount
onUnmounted(() => {
  clearWebSocket()
})

// Add a computed property to get the most recent scan
const mostRecentScan = computed(() => {
  return scanResults.value.length > 0 ? scanResults.value[0] : null
})

// Status label based on the plate status
const statusLabel = computed(() => {
  if (!mostRecentScan.value) return { text: 'Not Found', color: 'yellow' }

  const status = mostRecentScan.value.plateData.status
  if (status === 'Active') return { text: 'Valid', color: 'green' }
  if (status === 'Expired') return { text: 'Expired', color: 'red' }
  if (status === 'Not Found') return { text: 'Not Found', color: 'yellow' }
  return { text: 'Unknown', color: 'gray' }
})
</script>

<template>
  <div>
    <!-- Scanner Status Bar -->
    <div
      class="mb-6 p-4 rounded-lg flex items-center justify-between"
      :class="{
        'bg-green-100 text-green-800': scannerStatus === 'ready',
        'bg-yellow-100 text-yellow-800':
          scannerStatus === 'busy' || connectionStatus === 'connecting',
        'bg-red-100 text-red-800': scannerStatus === 'offline' || scannerStatus === 'error',
      }"
    >
      <div class="flex items-center">
        <div
          class="p-3 rounded-full mr-4"
          :class="{
            'bg-green-200': scannerStatus === 'ready',
            'bg-yellow-200': scannerStatus === 'busy' || connectionStatus === 'connecting',
            'bg-red-200': scannerStatus === 'offline' || scannerStatus === 'error',
          }"
        >
          <font-awesome-icon
            :icon="[
              'fas',
              scannerStatus === 'ready'
                ? 'check-circle'
                : scannerStatus === 'busy'
                  ? 'spinner'
                  : 'exclamation-circle',
            ]"
            class="text-xl"
            :class="{ 'fa-spin': scannerStatus === 'busy' || connectionStatus === 'connecting' }"
          />
        </div>
        <div>
          <h3 class="font-bold text-lg">Plate Scanner</h3>
          <p class="text-sm">
            {{
              connectionStatus === 'connected'
                ? scannerStatus === 'ready'
                  ? 'Scanner ready for viewing'
                  : scannerStatus === 'busy'
                    ? 'Scanner is busy'
                    : 'Scanner error'
                : connectionStatus === 'connecting'
                  ? 'Connecting to scanner...'
                  : 'Scanner offline'
            }}
          </p>
        </div>
      </div>
      <div>
        <span class="text-sm">
          <font-awesome-icon :icon="['fas', 'circle-info']" class="mr-1" />
          View-only mode
        </span>
      </div>
    </div>

    <!-- Latest Scan Result Display -->
    <div
      v-if="mostRecentScan"
      class="bg-white rounded-xl shadow-md border border-light-gray border-opacity-20 p-6 mb-8"
    >
      <h2 class="text-lg font-bold text-dark-blue mb-4">Latest Scan Result</h2>
      <div class="flex flex-col md:flex-row">
        <!-- Plate Box -->
        <div class="mb-4 md:mb-0 md:mr-6">
          <div
            class="bg-gray-100 border-4 border-gray-700 rounded-lg p-2 w-48 h-24 flex items-center justify-center"
          >
            <span class="text-2xl font-bold tracking-wider">{{
              mostRecentScan.plateData.plateNumber
            }}</span>
          </div>
          <div class="mt-2 text-center text-sm text-gray-600">
            Scanned at {{ formatDate(mostRecentScan.timestamp) }}
          </div>
        </div>

        <!-- Plate Details -->
        <div class="flex-1">
          <!-- Status Badge -->
          <div class="mb-4">
            <span
              class="px-4 py-2 rounded-md text-sm font-bold"
              :class="{
                'bg-green-100 text-green-800': statusLabel.color === 'green',
                'bg-red-100 text-red-800': statusLabel.color === 'red',
                'bg-yellow-100 text-yellow-800': statusLabel.color === 'yellow',
              }"
            >
              <font-awesome-icon
                :icon="[
                  'fas',
                  statusLabel.color === 'green'
                    ? 'check-circle'
                    : statusLabel.color === 'red'
                      ? 'exclamation-circle'
                      : 'question-circle',
                ]"
                class="mr-2"
              />
              {{ statusLabel.text }}
            </span>
          </div>

          <!-- Quick Info -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <h4 class="text-xs text-gray-500 uppercase mb-1">Vehicle</h4>
              <p class="text-sm font-medium">
                {{ mostRecentScan.registrationData.make }}
                {{ mostRecentScan.registrationData.model }} ({{
                  mostRecentScan.registrationData.year
                }})
              </p>
              <p class="text-xs text-gray-500">
                {{ mostRecentScan.registrationData.color }}
                {{ mostRecentScan.registrationData.vehicleType }}
              </p>
            </div>
            <div>
              <h4 class="text-xs text-gray-500 uppercase mb-1">Registration</h4>
              <p class="text-sm font-medium">{{ mostRecentScan.registrationData.id }}</p>
              <p class="text-xs text-gray-500">
                Exp: {{ formatDateOnly(mostRecentScan.plateData.expirationDate) }}
              </p>
            </div>
            <div>
              <h4 class="text-xs text-gray-500 uppercase mb-1">Owner</h4>
              <p class="text-sm font-medium">{{ mostRecentScan.ownerData.name }}</p>
              <p class="text-xs text-gray-500">{{ mostRecentScan.ownerData.ltoClientNumber }}</p>
            </div>
          </div>

          <!-- View Details Button -->
          <div class="mt-4">
            <button
              @click="((selectedScan = mostRecentScan), (isResultModalOpen = true))"
              class="px-3 py-1.5 text-sm bg-light-blue text-white rounded-md hover:bg-opacity-90 transition-colors"
            >
              <font-awesome-icon :icon="['fas', 'eye']" class="mr-2" />
              View Full Details
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty Latest Scan State -->
    <div
      v-else
      class="bg-white rounded-xl shadow-md border border-light-gray border-opacity-20 p-6 mb-8"
    >
      <h2 class="text-lg font-bold text-dark-blue mb-4">Latest Scan Result</h2>
      <div class="flex flex-col items-center justify-center p-6">
        <div class="bg-gray-100 text-gray-400 p-4 rounded-full mb-4">
          <font-awesome-icon :icon="['fas', 'id-card']" class="text-3xl" />
        </div>
        <p class="text-gray-500 text-center">
          No plate scans available. Scanner is in view-only mode.
        </p>
      </div>
    </div>

    <!-- Search Bar -->
    <div class="bg-white rounded-xl shadow-md border border-light-gray border-opacity-20 p-6 mb-8">
      <div class="relative">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search by plate number, registration ID, or owner name..."
          class="w-full pl-10 pr-4 py-3 rounded-lg bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-light-blue focus:border-transparent transition-all"
        />
        <font-awesome-icon
          :icon="['fas', 'search']"
          class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray"
        />
      </div>
    </div>

    <!-- Scan Results List -->
    <div
      class="bg-white rounded-xl shadow-md border border-light-gray border-opacity-20 overflow-hidden"
    >
      <div class="px-6 py-4 bg-gray-50 border-b border-gray-200">
        <h2 class="text-lg font-bold text-dark-blue">Recent Plate Scans</h2>
      </div>

      <!-- Empty State -->
      <div
        v-if="filteredResults.length === 0"
        class="p-12 flex flex-col items-center justify-center"
      >
        <div class="bg-light-blue bg-opacity-10 p-6 rounded-full mb-4">
          <font-awesome-icon :icon="['fas', 'camera']" class="text-4xl text-light-blue" />
        </div>
        <p class="text-lg font-medium text-dark-blue mb-2">No scan results found</p>
        <p class="text-sm text-gray text-center max-w-md">
          Use the scanner to capture license plates or try different search criteria
        </p>
      </div>

      <!-- Scan Results -->
      <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-4 p-6">
        <div
          v-for="scan in filteredResults"
          :key="scan.scanId"
          class="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
          @click="((selectedScan = scan), (isResultModalOpen = true))"
        >
          <div class="flex justify-between items-start mb-3">
            <span
              class="inline-flex items-center px-2.5 py-1 rounded-md text-sm font-medium bg-blue-100 text-blue-800"
            >
              <font-awesome-icon :icon="['fas', 'id-card']" class="mr-2" />
              {{ scan.plateData.plateNumber }}
            </span>
            <span class="text-xs text-gray-500">{{ formatDate(scan.timestamp) }}</span>
          </div>

          <div class="grid grid-cols-2 gap-2 mb-3">
            <div>
              <p class="text-xs text-gray-500">Vehicle</p>
              <p class="text-sm font-medium">
                {{ scan.registrationData.make }} {{ scan.registrationData.model }}
              </p>
            </div>
            <div>
              <p class="text-xs text-gray-500">Owner</p>
              <p class="text-sm font-medium truncate">{{ scan.ownerData.name }}</p>
            </div>
          </div>

          <div class="flex justify-between items-center">
            <span
              class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium"
              :class="{
                'bg-green-100 text-green-800': scan.plateData.status === 'Active',
                'bg-red-100 text-red-800': scan.plateData.status === 'Expired',
                'bg-yellow-100 text-yellow-800': scan.plateData.status === 'Not Found',
              }"
            >
              {{ scan.plateData.status }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Scan Result Modal -->
    <LTOPlateScanModal
      v-if="isResultModalOpen"
      :scan="selectedScan"
      @close="closeResultModal"
      :format-date="formatDate"
      :format-date-only="formatDateOnly"
    />
  </div>
</template>

<style scoped>
/* Add any component-specific styles here */
</style>
