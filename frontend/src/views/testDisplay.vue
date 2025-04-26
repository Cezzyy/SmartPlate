<script setup>
import { ref, onMounted } from 'vue'

const users = ref([])
const loading = ref(true)
const error = ref(null)
const loadingDots = ref('')
const tableHeaders = [
  'USER_ID',
  'LAST_NAME',
  'FIRST_NAME',
  'MIDDLE_NAME',
  'EMAIL',
  'ROLE',
  'STATUS',
  'LTO_CLIENT_ID',
  'Created',
  'Updated',
]
const formatAddress = (address) => {
  if (!address) return 'N/A'
  const parts = []
  if (address.house_no) parts.push(address.house_no)
  if (address.street) parts.push(address.street)
  if (address.barangay) parts.push(address.barangay)
  if (address.city_municipality) parts.push(address.city_municipality)
  if (address.province) parts.push(address.province)
  if (address.zip_code) parts.push(`ZIP: ${address.zip_code}`)
  return parts.join(', ') || 'N/A'
}

const formatMedicalInfo = (medical) => {
  if (!medical) return 'N/A'
  const info = []
  if (medical.blood_type) info.push(`Blood: ${medical.blood_type}`)
  if (medical.height) info.push(`H: ${medical.height}cm`)
  if (medical.weight) info.push(`W: ${medical.weight}kg`)
  if (medical.gender) info.push(`Gender: ${medical.gender}`)
  return info.join(' · ') || 'N/A'
}

const formatPersonalInfo = (personal) => {
  if (!personal) return 'N/A'
  const info = []
  if (personal.nationality) info.push(personal.nationality)
  if (personal.civil_status) info.push(personal.civil_status)
  if (personal.date_of_birth) info.push(`DOB: ${formatDate(personal.date_of_birth)}`)
  if (personal.tin) info.push(`TIN: ${personal.tin}`)
  return info.join(' · ') || 'N/A'
}

const formatFamilyInfo = (people) => {
  if (!people) return 'N/A'
  const info = []
  if (people.employer_name) info.push(`Employer: ${people.employer_name}`)
  if (people.employer_address) info.push(`Addr: ${people.employer_address}`)
  if (people.father_first_name || people.father_middle_name || people.father_last_name) {
    info.push(
      `Father: ${people.father_first_name} ${people.father_middle_name} ${people.father_last_name}`.trim(),
    )
  }
  if (people.mother_first_name || people.mother_middle_name || people.mother_maiden_name) {
    info.push(
      `Mother: ${people.mother_first_name} ${people.mother_middle_name} ${people.mother_maiden_name}`.trim(),
    )
  }
  return info.join(' | ') || 'N/A'
}

// Animate loading dots
let interval = null

const formatDate = (dateString) => {
  try {
    const options = {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }
    return new Date(dateString).toLocaleDateString(undefined, options)
  } catch (e) {
    console.error('Date formatting error:', e)
    return 'Invalid date'
  }
}

const startLoadingAnimation = () => {
  interval = setInterval(() => {
    loadingDots.value = '.'.repeat((Date.now() % 3) + 1)
  }, 500)
}

const fetchData = async () => {
  try {
    loading.value = true
    error.value = null
    startLoadingAnimation()

    console.log('Starting data fetch...')
    const response = await fetch('http://localhost:8081/users')
    console.log('Received response status:', response.status)

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`HTTP ${response.status}: ${errorText || 'Unknown error'}`)
    }

    const data = await response.json()
    console.log('API response data:', data)

    // Handle different response formats
    if (Array.isArray(data)) {
      users.value = data
    } else if (data.items && Array.isArray(data.items)) {
      users.value = data.items
    } else {
      throw new Error('Unexpected response format. Expected array or items array')
    }

    console.log('Processed Users:', users.value)
  } catch (err) {
    error.value = `Failed to load: ${err.message}`
    console.error('Fetch error:', err)
  } finally {
    loading.value = false
    clearInterval(interval)
  }
}

const retryFetch = () => {
  fetchData()
}

onMounted(() => {
  startLoadingAnimation()
  fetchData()
})
</script>
<template>
  <div class="container">
    <h1>User List</h1>
    <!-- Changed from Vehicle List to User List -->
    <div v-if="loading" class="status-message loading">Loading...</div>
    <div v-else-if="error" class="status-message error">
      Error: {{ error }}
      <button @click="retryFetch" class="retry-btn">Retry</button>
    </div>
    <div v-else>
      <div v-if="users.length === 0" class="status-message info">No users found</div>
      <div v-else class="table-container">
        <table class="user-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
              <th>Address</th>
              <th>Health Info</th>
              <th>Personal Details</th>
              <th>Employer/Family</th>
              <th>Contact Info</th>
              <th>Emergency Contact</th>
              <th>Created</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="user in users" :key="user.user_id">
              <td>{{ user.user_id }}</td>
              <td>
                {{ user.first_name }}
                {{ user.middle_name }}
                {{ user.last_name }}
              </td>
              <td>{{ user.email }}</td>
              <td>{{ user.role }}</td>
              <td class="status-cell">
                <span :class="user.status.toLowerCase()">{{ user.status }}</span>
              </td>
              <td>{{ formatAddress(user.address) }}</td>
              <td>{{ formatMedicalInfo(user.medical_information) }}</td>
              <td>{{ formatPersonalInfo(user.personal_information) }}</td>
              <td>{{ formatFamilyInfo(user.people) }}</td>
              <td>
                <div v-if="user.contact">
                  <div>📞 {{ user.contact.mobile_number || 'N/A' }}</div>
                  <div>☎️ {{ user.contact.telephone_number || 'N/A' }}</div>
                </div>
                <div v-else>N/A</div>
              </td>
              <td>
                <div v-if="user.contact?.emergency_contact_name">
                  {{ user.contact.emergency_contact_name }}<br />
                  {{ user.contact.emergency_contact_number }}<br />
                  ({{ user.contact.emergency_contact_relationship }})
                </div>
                <div v-else>N/A</div>
              </td>
              <td>{{ formatDate(user.created) }}</td>
            </tr>
          </tbody>
        </table>
        <div class="table-footer">Showing {{ users.length }} users</div>
      </div>
    </div>
  </div>
  <div></div>
</template>

<style scoped>
.table-container {
  overflow-x: auto;
}

.user-table {
  min-width: 1200px;
  width: 100%;
  border-collapse: collapse;
  margin: 1rem 0;
}

.user-table th,
.user-table td {
  padding: 0.75rem;
  border: 1px solid #ddd;
  white-space: nowrap;
}

.user-table th {
  background-color: #f5f5f5;
  font-weight: 600;
}

.status-cell span {
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.875rem;
}

.status-cell .active {
  background-color: #e6f4ea;
  color: #137333;
}
.status-cell .inactive {
  background-color: #fce8e6;
  color: #c5221f;
}

.container {
  padding: 1rem;
  max-width: 1200px;
  margin: 0 auto;
}

.status-message {
  padding: 1rem;
  border-radius: 4px;
  margin: 1rem 0;
  text-align: center;
}

.loading {
  background: #e9f5ff;
  color: #004085;
  border: 1px solid #b8daff;
}

.error {
  background: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
}

.info {
  background: #d4edda;
  color: #155724;
  border: 1px solid #c3e6cb;
}

.retry-btn {
  margin-left: 1rem;
  padding: 0.25rem 1rem;
  background: #dc3545;
  color: white;
  border: none;
  border-radius: 3px;
  cursor: pointer;
  transition: opacity 0.2s;
}

.retry-btn:hover {
  opacity: 0.8;
}

.table-container {
  border: 1px solid #eee;
  border-radius: 8px;
  overflow-x: auto;
}

.user-table {
  width: 100%;
  border-collapse: collapse;
  min-width: 800px;
}

.user-table th,
.user-table td {
  padding: 12px 15px;
  text-align: left;
  border-bottom: 1px solid #eee;
}

.user-table th {
  background-color: #f8f9fa;
  font-weight: 600;
}

.user-table tr:hover {
  background-color: #f8f9fa;
}

.status-cell span {
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 0.85em;
}

.active {
  background: #d4edda;
  color: #155724;
}

.inactive {
  background: #fff3cd;
  color: #856404;
}

.table-footer {
  padding: 12px;
  background: #f8f9fa;
  color: #666;
  font-size: 0.9em;
  text-align: center;
  border-top: 1px solid #eee;
}
</style>
