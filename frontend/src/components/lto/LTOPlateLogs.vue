<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

// Mock data for development
const mockLogs = [
  {
    logId: 'LOG-001',
    plateId: 'ABC-1234',
    registrationId: 'REG-20240501-001',
    ltoClientId: 'LTO-CLIENT-45643',
    scannedAt: new Date('2024-05-10T09:30:00').toISOString(),
  },
  {
    logId: 'LOG-002',
    plateId: 'DEF-5678',
    registrationId: 'REG-20240502-003',
    ltoClientId: 'LTO-CLIENT-45643',
    scannedAt: new Date('2024-05-10T10:15:00').toISOString(),
  },
  {
    logId: 'LOG-003',
    plateId: 'GHI-9012',
    registrationId: 'REG-20240503-002',
    ltoClientId: 'LTO-CLIENT-45643',
    scannedAt: new Date('2024-05-10T11:05:00').toISOString(),
  },
]

const logs = ref(mockLogs)
const isLoading = ref(true)
const searchQuery = ref('')
// const socket = ref(null)
const connectionStatus = ref('disconnected')

// Pagination
const currentPage = ref(1)
const itemsPerPage = ref(10)
const totalPages = computed(() => Math.ceil(filteredLogs.value.length / itemsPerPage.value))

// Filtering logs based on search query
const filteredLogs = computed(() => {
  const query = searchQuery.value.toLowerCase()
  if (!query) return logs.value

  return logs.value.filter(
    (log) =>
      log.logId.toLowerCase().includes(query) ||
      log.plateId.toLowerCase().includes(query) ||
      log.registrationId.toLowerCase().includes(query) ||
      log.ltoClientId.toLowerCase().includes(query),
  )
})

// Get current page items
const paginatedLogs = computed(() => {
  const startIndex = (currentPage.value - 1) * itemsPerPage.value
  return filteredLogs.value.slice(startIndex, startIndex + itemsPerPage.value)
})

// Change page
const goToPage = (page: number) => {
  if (page < 1 || page > totalPages.value) return
  currentPage.value = page
}

// Navigate to previous page
const previousPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--
  }
}

// Navigate to next page
const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++
  }
}

// When search query changes, reset to first page
const resetPagination = () => {
  currentPage.value = 1
}

// Watch for search changes
watch(searchQuery, resetPagination)

// Format timestamp
const formatDate = (dateString: string): string => {
  const date = new Date(dateString)
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
}

// WebSocket connection for real-time logs
const initWebSocket = () => {
  // This would connect to your actual backend in production
  // socket.value = new WebSocket('ws://your-backend-url/plate-logs')

  connectionStatus.value = 'connecting'

  // Simulate successful connection
  setTimeout(() => {
    connectionStatus.value = 'connected'
    isLoading.value = false
  }, 1500)

  // In a real implementation, you would handle WebSocket events:
  /*
  socket.value.onopen = () => {
    connectionStatus.value = 'connected'
    console.log('WebSocket connection established')
  }
  
  socket.value.onmessage = (event) => {
    const newLog = JSON.parse(event.data)
    logs.value.unshift(newLog) // Add new log to the beginning of the array
  }
  
  socket.value.onclose = () => {
    connectionStatus.value = 'disconnected'
    console.log('WebSocket connection closed')
  }
  
  socket.value.onerror = (error) => {
    connectionStatus.value = 'error'
    console.error('WebSocket error:', error)
  }
  */
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
})

// Clean up on component unmount
onUnmounted(() => {
  clearWebSocket()
})

// Simulate receiving a new log periodically (for demo purposes)
let logInterval: number | undefined
onMounted(() => {
  logInterval = window.setInterval(() => {
    if (connectionStatus.value === 'connected') {
      const newLog = {
        logId: `LOG-${Math.floor(1000 + Math.random() * 9000)}`,
        plateId: `${String.fromCharCode(65 + Math.floor(Math.random() * 26))}${String.fromCharCode(65 + Math.floor(Math.random() * 26))}${String.fromCharCode(65 + Math.floor(Math.random() * 26))}-${Math.floor(1000 + Math.random() * 9000)}`,
        registrationId: `REG-${new Date().toISOString().split('T')[0]}-${Math.floor(100 + Math.random() * 900)}`,
        ltoClientId: `LTO-CLIENT-${Math.floor(1 + Math.random() * 5)}`,
        scannedAt: new Date().toISOString(),
      }
      logs.value.unshift(newLog)
    }
  }, 15000) // Add a new log every 15 seconds
})

onUnmounted(() => {
  if (logInterval) {
    clearInterval(logInterval)
  }
})
</script>

<template>
  <div>
    <!-- Connection Status Bar -->
    <div
      class="mb-6 p-3 rounded-lg flex items-center justify-between"
      :class="{
        'bg-green-100 text-green-800': connectionStatus === 'connected',
        'bg-yellow-100 text-yellow-800': connectionStatus === 'connecting',
        'bg-red-100 text-red-800':
          connectionStatus === 'disconnected' || connectionStatus === 'error',
      }"
    >
      <div class="flex items-center">
        <font-awesome-icon
          :icon="[
            'fas',
            connectionStatus === 'connected'
              ? 'check-circle'
              : connectionStatus === 'connecting'
                ? 'spinner'
                : 'exclamation-circle',
          ]"
          class="mr-2"
          :class="{ 'fa-spin': connectionStatus === 'connecting' }"
        />
        <span class="font-medium">
          {{
            connectionStatus === 'connected'
              ? 'Connected to scanner network'
              : connectionStatus === 'connecting'
                ? 'Connecting to scanner network...'
                : 'Disconnected from scanner network'
          }}
        </span>
      </div>
      <button
        @click="initWebSocket"
        class="px-3 py-1.5 text-sm font-medium rounded-md"
        :class="{
          'bg-green-200 hover:bg-green-300': connectionStatus === 'connected',
          'bg-yellow-200 hover:bg-yellow-300 opacity-50 cursor-not-allowed':
            connectionStatus === 'connecting',
          'bg-red-200 hover:bg-red-300':
            connectionStatus === 'disconnected' || connectionStatus === 'error',
        }"
        :disabled="connectionStatus === 'connecting'"
      >
        {{ connectionStatus === 'connected' ? 'Reconnect' : 'Connect' }}
      </button>
    </div>

    <!-- Search and Filter -->
    <div class="bg-white rounded-xl shadow-md border border-light-gray border-opacity-20 p-6 mb-8">
      <div class="relative">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search logs by ID, plate number, registration ID..."
          class="w-full pl-10 pr-4 py-3 rounded-lg bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-light-blue focus:border-transparent transition-all"
        />
        <font-awesome-icon
          :icon="['fas', 'search']"
          class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray"
        />
      </div>
    </div>

    <!-- Logs Table -->
    <div
      class="bg-white rounded-xl shadow-md border border-light-gray border-opacity-20 overflow-hidden"
    >
      <!-- Loading State -->
      <div v-if="isLoading" class="p-12 flex flex-col items-center justify-center">
        <div class="flex justify-center items-center mb-4">
          <div class="relative w-20 h-20">
            <div class="absolute top-0 left-0 right-0 bottom-0 w-20 h-20">
              <div
                class="border-4 border-light-blue border-opacity-50 opacity-75 rounded-full w-20 h-20 animate-spin border-t-dark-blue"
              ></div>
            </div>
          </div>
        </div>
        <div class="text-center">
          <p class="text-lg font-medium text-gray-700 mb-1">Loading Plate Logs</p>
          <p class="text-sm text-gray-500">
            Please wait while we connect to the scanner network...
          </p>
        </div>
      </div>

      <!-- Content -->
      <div v-else>
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th
                  v-for="header in [
                    { text: 'Log ID', value: 'logId' },
                    { text: 'Plate Number', value: 'plateId' },
                    { text: 'Registration ID', value: 'registrationId' },
                    { text: 'LTO Client ID', value: 'ltoClientId' },
                    { text: 'Scanned At', value: 'scannedAt' },
                  ]"
                  :key="header.value"
                  class="px-6 py-4 text-left text-xs font-medium text-gray uppercase tracking-wider"
                >
                  {{ header.text }}
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <!-- Empty state -->
              <tr v-if="filteredLogs.length === 0" class="hover:bg-gray-50">
                <td colspan="6" class="px-6 py-10 text-center text-gray">
                  <div class="flex flex-col items-center justify-center space-y-3">
                    <div class="bg-light-blue bg-opacity-10 p-4 rounded-full">
                      <font-awesome-icon
                        :icon="['fas', 'history']"
                        class="text-3xl text-light-blue"
                      />
                    </div>
                    <p class="text-lg font-medium text-dark-blue">No logs found</p>
                    <p class="text-sm text-gray">
                      Try adjusting your search criteria or wait for new scans
                    </p>
                  </div>
                </td>
              </tr>

              <!-- Table rows -->
              <tr
                v-for="log in paginatedLogs"
                :key="log.logId"
                class="hover:bg-gray-50 transition-colors"
              >
                <td class="px-6 py-4 whitespace-nowrap">
                  <span class="text-sm font-medium text-dark-blue">{{ log.logId }}</span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span
                    class="inline-flex items-center px-2.5 py-1.5 rounded-md text-sm font-medium bg-blue-100 text-blue-800"
                  >
                    <font-awesome-icon :icon="['fas', 'id-card']" class="mr-2" />
                    {{ log.plateId }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span class="text-sm text-gray-700">{{ log.registrationId }}</span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span class="text-sm text-gray-700">{{ log.ltoClientId }}</span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span
                    class="px-3 py-1 inline-flex text-xs leading-5 font-medium rounded-full bg-green-100 text-green-800"
                  >
                    <span class="h-1.5 w-1.5 rounded-full bg-green-600 mr-1.5 self-center"></span>
                    {{ formatDate(log.scannedAt) }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div
          class="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-between items-center"
        >
          <div class="flex items-center">
            <span class="text-sm text-gray-700">
              Showing {{ paginatedLogs.length ? (currentPage - 1) * itemsPerPage + 1 : 0 }} to
              {{ Math.min(currentPage * itemsPerPage, filteredLogs.length) }} of
              {{ filteredLogs.length }} logs
            </span>
          </div>
          <div class="flex justify-center items-center space-x-2">
            <button
              @click="previousPage"
              class="p-2 rounded-md bg-gray-200 text-gray-700 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
              :disabled="currentPage === 1"
            >
              <font-awesome-icon :icon="['fas', 'chevron-left']" />
            </button>
            <div class="flex space-x-1">
              <button
                v-for="page in totalPages"
                :key="page"
                @click="goToPage(page)"
                class="px-3 py-1 rounded-md"
                :class="
                  page === currentPage
                    ? 'bg-light-blue text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                "
              >
                {{ page }}
              </button>
            </div>
            <button
              @click="nextPage"
              class="p-2 rounded-md bg-gray-200 text-gray-700 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
              :disabled="currentPage === totalPages"
            >
              <font-awesome-icon :icon="['fas', 'chevron-right']" />
            </button>
          </div>
        </div>

        <!-- Live Indicator -->
        <div
          class="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-between items-center"
        >
          <div class="flex items-center">
            <span class="relative flex h-3 w-3 mr-2">
              <span
                class="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"
              ></span>
              <span class="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
            </span>
            <span class="text-sm text-gray-700">Live updates enabled</span>
          </div>
          <div class="text-sm text-gray-500">
            Last updated: {{ new Date().toLocaleTimeString() }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
