<template>
  <div>
    <h2 class="text-lg font-semibold mb-4">Scan Logs</h2>

    <div class="mb-4 flex">
      <input
        id="search"
        name="search"
        v-model="searchQuery"
        placeholder="Search by Log ID or LTO Client ID"
        class="border rounded px-3 py-2 flex-1"
      />
    </div>

    <table class="min-w-full bg-white shadow rounded overflow-hidden">
      <thead class="bg-gray-100">
        <tr>
          <th class="px-4 py-2 text-left">Log ID</th>
          <th class="px-4 py-2 text-left">Plate ID</th>
          <th class="px-4 py-2 text-left">Registration ID</th>
          <th class="px-4 py-2 text-left">LTO Client ID</th>
          <th class="px-4 py-2 text-left">Scanned At</th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="rec in filteredLogs"
          :key="rec.log_id"
          class="border-t hover:bg-gray-50 cursor-pointer"
          @click="openModal(rec.log_id)"
        >
          <td class="px-4 py-2 truncate max-w-xs">{{ rec.log_id }}</td>
          <td class="px-4 py-2">{{ rec.plate_id ?? '-' }}</td>
          <td class="px-4 py-2">{{ rec.registration_id ?? '-' }}</td>
          <td class="px-4 py-2">{{ rec.lto_client_id ?? '-' }}</td>
          <td class="px-4 py-2">{{ new Date(rec.scanned_at).toLocaleString() }}</td>
        </tr>
        <tr v-if="!filteredLogs.length">
          <td colspan="5" class="px-4 py-2 text-center text-gray-500">No records found.</td>
        </tr>
      </tbody>
    </table>

    <!-- Detail Modal -->
    <div v-if="showModal" class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div class="bg-white rounded-lg shadow-lg w-3/4 max-w-xl p-6 overflow-auto max-h-[90vh]">
        <h3 class="text-xl font-semibold mb-4">Scan Log Details</h3>
        <div v-if="detailRaw">
          <section class="mb-4">
            <h4 class="font-semibold">Scan Log</h4>
            <div><strong>Log ID:</strong> {{ detailRaw.scan_log.log_id }}</div>
            <div><strong>Plate ID:</strong> {{ detailRaw.scan_log.plate_id }}</div>
            <div><strong>Registration ID:</strong> {{ detailRaw.scan_log.registration_id }}</div>
            <div><strong>LTO Client ID:</strong> {{ detailRaw.scan_log.lto_client_id }}</div>
            <div><strong>Scanned At:</strong> {{ new Date(detailRaw.scan_log.scanned_at).toLocaleString() }}</div>
          </section>
          <section>
            <h4 class="font-semibold">User</h4>
            <div><strong>Name:</strong> {{ detailRaw.user.first_name }} {{ detailRaw.user.last_name }}</div>
            <div><strong>Email:</strong> {{ detailRaw.user.email }}</div>
            <div><strong>LTO Client ID:</strong> {{ detailRaw.user.lto_client_id }}</div>
            <div class="mt-2 font-semibold">Address:</div>
            <div>{{ detailRaw.user.address.house_no }} {{ detailRaw.user.address.street }}</div>
            <div>{{ detailRaw.user.address.barangay }}, {{ detailRaw.user.address.city_municipality }}</div>
            <div>{{ detailRaw.user.address.province }} {{ detailRaw.user.address.zip_code }}</div>
            <div class="mt-2 font-semibold">Contact:</div>
            <div><strong>Mobile:</strong> {{ detailRaw.user.contact.mobile_number }}</div>
            <div><strong>Telephone:</strong> {{ detailRaw.user.contact.telephone_number }}</div>
          </section>
        </div>
        <div v-else class="text-gray-500">Loading details...</div>
        <div class="mt-4 text-right">
          <button @click="closeModal" class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">Close</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, computed } from 'vue'
import { getAllScanLogs, subscribeLiveScanLogs, ScanLogRecord } from '@/services/scanLogService'

interface ScanLog {
  log_id: string
  plate_id: string | null
  registration_id: string | null
  lto_client_id: string
  scanned_at: string
}

interface RawDetail { /* unchanged */ }

const logs = ref<ScanLog[]>([])
const searchQuery = ref('')
const showModal = ref(false)
const detailRaw = ref<RawDetail | null>(null)
let intervalId: number | null = null

// Load and filter logs exclusively via your service
async function loadLogs() {
  try {
    const records = await getAllScanLogs()
    logs.value = records.map(r => ({
      log_id:          r.scan_log.log_id,
      plate_id:        r.scan_log.plate_id,
      registration_id: r.scan_log.registration_id,
      lto_client_id:   r.scan_log.lto_client_id,
      scanned_at:      r.scan_log.scanned_at,
    }))
  } catch (e) {
    console.error('Failed to load scan logs', e)
  }
}

onMounted(() => {
  loadLogs()
  intervalId = window.setInterval(loadLogs, 5000)

  // Optional: live WS if you still have subscribeLiveScanLogs
  subscribeLiveScanLogs((r: ScanLogRecord) => {
    if (!logs.value.find(x => x.log_id === r.scan_log.log_id)) {
      logs.value.unshift({
        log_id:          r.scan_log.log_id,
        plate_id:        r.scan_log.plate_id,
        registration_id: r.scan_log.registration_id,
        lto_client_id:   r.scan_log.lto_client_id,
        scanned_at:      r.scan_log.scanned_at,
      })
    }
  })
})

onBeforeUnmount(() => {
  if (intervalId) clearInterval(intervalId)
})

const filteredLogs = computed(() => {
  if (!searchQuery.value) return logs.value
  const q = searchQuery.value.toLowerCase()
  return logs.value.filter(r =>
    r.log_id.toLowerCase().includes(q) ||
    r.lto_client_id.toLowerCase().includes(q)
  )
})

// openModal/closeModal unchanged...
</script>


<style scoped>
.cursor-pointer { cursor: pointer }
</style>
