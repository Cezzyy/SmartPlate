<template>
  <div class="crud-container">
    <!-- Create/Edit Form -->
    <div class="form-section">
      <h2>{{ editing ? 'Edit User' : 'Create User' }}</h2>
      <div class="lto-generator">
        <div class="prefix-display">
          <span>LTO ID Prefix: </span>
          <strong>25</strong>
        </div>
        <button @click="generateLtoId" :disabled="editing">Generate LTO ID</button>
        <input v-model="form.lto_client_id" placeholder="LTO Client ID" readonly />
      </div>

      <input v-model="form.first_name" placeholder="First Name" />
      <input v-model="form.last_name" placeholder="Last Name" />
      <input v-model="form.middle_name" placeholder="Middle Name" />
      <input v-model="form.email" placeholder="Email" type="email" />
      <input v-model="form.password" placeholder="Password" type="password" />
      <input v-model="form.contact.telephone_number" placeholder="Telephone Number" />
      <input v-model="form.contact.mobile_number" placeholder="Mobile Number" />
      <input
        v-model="form.contact.emergency_contact_number"
        placeholder="Emergency Contact Number"
      />
      <input v-model="form.contact.emergency_contact_name" placeholder="Emergency Contact Name" />
      <input
        v-model="form.contact.emergency_contact_relationship"
        placeholder="Emergency Relationship"
      />
      <input v-model="form.contact.emergency_contact_address" placeholder="Emergency Address" />
      <select v-model="form.role">
        <option value="user">User</option>
        <option value="admin">Admin</option>
      </select>
      <select v-model="form.status">
        <option value="active">Active</option>
        <option value="inactive">Inactive</option>
      </select>

      <div class="form-actions">
        <button v-if="!editing" @click="createUser">Create</button>
        <button v-if="editing" @click="updateUser">Update</button>
        <button v-if="editing" @click="cancelEdit">Cancel</button>
      </div>
    </div>

    <!-- User Table -->
    <div class="table-section">
      <table>
        <thead>
          <tr>
            <th>LTO ID</th>
            <th>Name</th>
            <th>Email</th>
            <th>Role</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="user in users" :key="user.lto_client_id">
            <td>{{ user.lto_client_id }}</td>
            <td>{{ user.last_name }}, {{ user.first_name }}</td>
            <td>{{ user.email }}</td>
            <td>{{ user.role }}</td>
            <td>{{ user.status }}</td>
            <td>
              <button @click="editUser(user)">Edit</button>
              <button @click="deleteUser(user.lto_client_id)">Delete</button>
            </td>
          </tr>
        </tbody>
      </table>
      <table>
        <thead>
          <tr>
            <th>Mobile</th>
            <th>Emergency Contact</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="user in users" :key="user.lto_client_id">
            <td>{{ user.contact.mobile_number }}</td>
            <td>
              {{ user.contact.emergency_contact_name }} ({{
                user.contact.emergency_contact_number
              }})
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import axios from 'axios'

// Reactive state
const users = ref([])
const form = reactive({
  lto_client_id: '',
  first_name: '',
  last_name: '',
  middle_name: '',
  email: '',
  password: '',
  role: 'user',
  status: 'active',
  contact: {
    telephone_number: '',
    mobile_number: '',
    emergency_contact_number: '',
    emergency_contact_name: '',
    emergency_contact_relationship: '',
    emergency_contact_address: '',
  },
})
const ltoPrefix = ref('LTO')
const editing = ref(false)

// Lifecycle hook
onMounted(fetchUsers)

// Methods
async function generateLtoId() {
  try {
    const response = await axios.get('http://localhost:8081/generate-lto-id')
    form.lto_client_id = response.data.lto_client_id
  } catch (error) {
    alert('Error generating LTO ID: ' + error.response?.data?.error)
  }
}

async function fetchUsers() {
  try {
    const response = await axios.get('http://localhost:8081/users')
    users.value = response.data
  } catch (error) {
    alert('Error fetching users')
  }
}

async function createUser() {
  if (!validateForm()) return

  try {
    const payload = {
      ...this.form,
      last_name: this.form.last_name, // Explicit mapping if needed
      first_name: this.form.first_name,
      password: this.form.password,
    }
    await axios.post('http://localhost:8081/users', payload)
  } catch (error) {
    alert('Error creating user!')
  }
}

function editUser(user) {
  Object.assign(form, user)
  editing.value = true
  ltoPrefix.value = user.lto_client_id.substring(0, 3)
}

async function updateUser() {
  if (!validateForm()) return

  try {
    await axios.put(`http://localhost:8081/users/by-lto/${form.lto_client_id}`, form)
    await fetchUsers()
    cancelEdit()
  } catch (error) {
    alert('Error updating user!')
  }
}

async function deleteUser(ltoId) {
  if (confirm('Are you sure you want to delete this user?')) {
    try {
      await axios.delete(`http://localhost:8081/users/by-lto/${ltoId}`)
      await fetchUsers()
    } catch (error) {
      alert('Error deleting user!')
    }
  }
}

function validateForm() {
  if (!form.lto_client_id) {
    alert('Please generate an LTO Client ID')
    return false
  }
  if (!form.email.includes('@')) {
    alert('Please enter a valid email address')
    return false
  }
  if (form.password.length < 6) {
    alert('Password must be at least 6 characters')
    return false
  }
  if (!form.contact.mobile_number) {
    alert('Mobile number is required')
    return false
  }
  return true
}

function resetForm() {
  Object.assign(form, {
    lto_client_id: '',
    first_name: '',
    last_name: '',
    middle_name: '',
    email: '',
    password: '',
    role: 'user',
    status: 'active',
  })
}

function cancelEdit() {
  resetForm()
  editing.value = false
}
</script>

<style scoped>
.prefix-display {
  margin-right: 10px;
  padding: 8px;
  background: #f0f0f0;
  border-radius: 4px;
}

.crud-container {
  padding: 20px;
  max-width: 1000px;
  margin: 0 auto;
}

.form-section {
  margin-bottom: 30px;
  padding: 20px;
  border: 1px solid #ddd;
  border-radius: 5px;
}

input,
select,
button {
  margin: 5px;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

button {
  cursor: pointer;
  background-color: #4caf50;
  color: white;
  border: none;
}

button:hover {
  opacity: 0.8;
}

table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 20px;
}

th,
td {
  border: 1px solid #ddd;
  padding: 8px;
  text-align: left;
}

th {
  background-color: #f2f2f2;
}

.lto-generator {
  display: flex;
  gap: 10px;
  margin-bottom: 15px;
}
</style>
