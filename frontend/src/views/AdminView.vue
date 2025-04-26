<script setup>
import { ref, onMounted, watch, defineAsyncComponent } from 'vue'
import { useUserStore } from '@/stores/user'
import { useRouter } from 'vue-router'

const LogoutModal = defineAsyncComponent(() => import('@/components/modals/LogoutModal.vue'))
const DashboardSection = defineAsyncComponent(
  () => import('@/components/admin/DashboardSection.vue'),
)
const UsersSection = defineAsyncComponent(() => import('@/components/admin/UsersSection.vue'))
const VehiclesSection = defineAsyncComponent(() => import('@/components/admin/VehiclesSection.vue'))
const PlatesSection = defineAsyncComponent(() => import('@/components/admin/PlatesSection.vue'))
const RegistrationsSection = defineAsyncComponent(
  () => import('@/components/admin/RegistrationsSection.vue'),
)
const PendingRegistrationsSection = defineAsyncComponent(
  () => import('@/components/admin/PendingRegistrationsSection.vue'),
)

const userStore = useUserStore()
const router = useRouter()

// Logout modal state
const showLogoutModal = ref(false)

const confirmLogout = () => {
  showLogoutModal.value = true
}

const handleLogout = () => {
  userStore.logout()
  showLogoutModal.value = false
}

const cancelLogout = () => {
  showLogoutModal.value = false
}

// Check if user is admin
onMounted(() => {
  if (!userStore.isAdmin) {
    router.push('/home')
  }
})

// Sidebar state
const isSidebarOpen = ref(true)
const toggleSidebar = () => {
  isSidebarOpen.value = !isSidebarOpen.value
}

// Active section management
const activeSection = ref('dashboard')

// Function to handle tab switching from DashboardSection
const handleSwitchTab = (tab) => {
  if (tab === 'pending') {
    activeSection.value = 'pending-registrations'
  }
}

// Mock user list
const users = ref([
  {
    id: 1,
    name: 'Stanleigh Morales',
    email: 'stanleighmorales@gmail.com',
    role: 'user',
    status: 'active',
    registrationDate: '2023-05-15',
    vehicles: 2,
  },
  {
    id: 2,
    name: 'Maria Santos',
    email: 'maria.santos@example.com',
    role: 'user',
    status: 'pending',
    registrationDate: '2023-06-22',
    vehicles: 1,
  },
  {
    id: 3,
    name: 'Juan Dela Cruz',
    email: 'juan.delacruz@example.com',
    role: 'user',
    status: 'active',
    registrationDate: '2023-04-10',
    vehicles: 3,
  },
  {
    id: 4,
    name: 'Ana Reyes',
    email: 'ana.reyes@example.com',
    role: 'user',
    status: 'inactive',
    registrationDate: '2023-03-05',
    vehicles: 0,
  },
  {
    id: 5,
    name: 'System Admin',
    email: 'admin@smartplate.com',
    role: 'admin',
    status: 'active',
    registrationDate: '2023-01-01',
    vehicles: 1,
  },
])

// Search functionality
const searchQuery = ref('')
const filteredUsers = ref([...users.value])

const searchUsers = () => {
  if (!searchQuery.value) {
    filteredUsers.value = [...users.value]
    return
  }

  const query = searchQuery.value.toLowerCase()
  filteredUsers.value = users.value.filter(
    (user) => user.name.toLowerCase().includes(query) || user.email.toLowerCase().includes(query),
  )
}

// Add watch effect to trigger search
watch(searchQuery, () => {
  searchUsers()
})
</script>

<template>
  <div class="flex h-screen bg-gray-50 overflow-hidden">
    <!-- Sidebar -->
    <aside
      :class="[
        'bg-dark-blue text-light-gray shadow-xl transition-all duration-300 ease-in-out z-10',
        isSidebarOpen ? 'w-64' : 'w-20',
      ]"
    >
      <div class="h-full flex flex-col">
        <!-- Logo & Toggle -->
        <div class="px-5 py-6 flex items-center justify-between">
          <div class="flex items-center space-x-2">
            <font-awesome-icon icon="car" class="text-xl text-light-gray" v-if="!isSidebarOpen" />
            <span v-if="isSidebarOpen" class="text-xl font-bold">SmartPlate</span>
          </div>
          <button
            @click="toggleSidebar"
            class="p-2 rounded-lg text-light-gray hover:bg-light-blue transition-colors"
          >
            <font-awesome-icon :icon="isSidebarOpen ? 'chevron-left' : 'chevron-right'" />
          </button>
        </div>

        <div class="border-b border-light-blue opacity-30 mx-4"></div>

        <!-- Navigation Menu -->
        <nav class="flex-1 overflow-y-auto px-4 py-6 space-y-3">
          <button
            @click="activeSection = 'dashboard'"
            :class="[
              'w-full flex items-center p-3 rounded-lg transition-colors text-left',
              activeSection === 'dashboard'
                ? 'bg-light-blue text-white'
                : 'hover:bg-light-blue hover:bg-opacity-50',
            ]"
          >
            <font-awesome-icon :icon="['fas', 'tachometer-alt']" class="w-5 h-5" />
            <span v-if="isSidebarOpen" class="ml-3 truncate">Dashboard</span>
          </button>

          <button
            @click="activeSection = 'users'"
            :class="[
              'w-full flex items-center p-3 rounded-lg transition-colors text-left',
              activeSection === 'users'
                ? 'bg-light-blue text-white'
                : 'hover:bg-light-blue hover:bg-opacity-50',
            ]"
          >
            <font-awesome-icon :icon="['fas', 'users']" class="w-5 h-5" />
            <span v-if="isSidebarOpen" class="ml-3 truncate">Users</span>
          </button>

          <button
            @click="activeSection = 'vehicles'"
            :class="[
              'w-full flex items-center p-3 rounded-lg transition-colors text-left',
              activeSection === 'vehicles'
                ? 'bg-light-blue text-white'
                : 'hover:bg-light-blue hover:bg-opacity-50',
            ]"
          >
            <font-awesome-icon :icon="['fas', 'car']" class="w-5 h-5" />
            <span v-if="isSidebarOpen" class="ml-3 truncate">Vehicles</span>
          </button>

          <button
            @click="activeSection = 'plates'"
            :class="[
              'w-full flex items-center p-3 rounded-lg transition-colors text-left',
              activeSection === 'plates'
                ? 'bg-light-blue text-white'
                : 'hover:bg-light-blue hover:bg-opacity-50',
            ]"
          >
            <font-awesome-icon :icon="['fas', 'id-card']" class="w-5 h-5" />
            <span v-if="isSidebarOpen" class="ml-3 truncate">Plates</span>
          </button>

          <button
            @click="activeSection = 'registrations'"
            :class="[
              'w-full flex items-center p-3 rounded-lg transition-colors text-left',
              activeSection === 'registrations'
                ? 'bg-light-blue text-white'
                : 'hover:bg-light-blue hover:bg-opacity-50',
            ]"
          >
            <font-awesome-icon :icon="['fas', 'clipboard-list']" class="w-5 h-5" />
            <span v-if="isSidebarOpen" class="ml-3 truncate">Registrations</span>
          </button>

          <button
            @click="activeSection = 'pending-registrations'"
            :class="[
              'w-full flex items-center p-3 rounded-lg transition-colors text-left',
              activeSection === 'pending-registrations'
                ? 'bg-light-blue text-white'
                : 'hover:bg-light-blue hover:bg-opacity-50',
            ]"
          >
            <font-awesome-icon :icon="['fas', 'clock']" class="w-5 h-5" />
            <span v-if="isSidebarOpen" class="ml-3 truncate">Pending Registrations</span>
          </button>
        </nav>

        <div class="border-t border-light-blue opacity-30 mx-4"></div>

        <!-- User Info & Logout -->
        <div class="p-4">
          <div v-if="isSidebarOpen" class="flex items-center space-x-3 mb-4">
            <div class="w-10 h-10 rounded-full bg-light-blue flex items-center justify-center">
              <font-awesome-icon :icon="['fas', 'user']" class="text-white" />
            </div>
            <div>
              <p class="font-medium text-sm">{{ userStore.fullName }}</p>
              <p class="text-xs opacity-70">Administrator</p>
            </div>
          </div>

          <!-- Logout Button -->
          <button
            @click="confirmLogout"
            class="w-full flex items-center p-3 rounded-lg text-red hover:bg-red-900 hover:bg-opacity-10 transition-colors"
          >
            <font-awesome-icon :icon="['fas', 'sign-out-alt']" class="w-5 h-5" />
            <span v-if="isSidebarOpen" class="ml-3">Log Out</span>
          </button>
        </div>
      </div>
    </aside>

    <!-- Logout Modal -->
    <LogoutModal :show="showLogoutModal" @confirm="handleLogout" @cancel="cancelLogout" />

    <!-- Main Content -->
    <div class="flex-1 flex flex-col overflow-hidden">
      <!-- Header -->
      <header class="bg-white shadow-sm z-10">
        <div class="px-6 py-4">
          <div class="flex items-center justify-between">
            <div class="flex items-center space-x-3">
              <h1 class="text-xl font-bold text-dark-blue">
                {{
                  activeSection === 'dashboard'
                    ? 'Dashboard'
                    : activeSection === 'users'
                      ? 'User Management'
                      : activeSection === 'vehicles'
                        ? 'Vehicle Database'
                        : activeSection === 'plates'
                          ? 'License Plates'
                          : activeSection === 'registrations'
                            ? 'Registration Records'
                            : 'Pending Registration Requests'
                }}
              </h1>
            </div>
            <div class="flex items-center">
              <span class="text-sm text-gray">Welcome, {{ userStore.fullName }}</span>
            </div>
          </div>
        </div>
      </header>

      <!-- Dashboard Content -->
      <main class="flex-1 overflow-y-auto bg-gray-50 p-6">
        <component
          v-if="activeSection === 'dashboard'"
          :is="DashboardSection"
          @switch-tab="handleSwitchTab"
        />
        <component v-else-if="activeSection === 'users'" :is="UsersSection" />
        <component v-else-if="activeSection === 'vehicles'" :is="VehiclesSection" />
        <component v-else-if="activeSection === 'plates'" :is="PlatesSection" />
        <component v-else-if="activeSection === 'registrations'" :is="RegistrationsSection" />
        <component
          v-else-if="activeSection === 'pending-registrations'"
          :is="PendingRegistrationsSection"
        />
      </main>

      <!-- Footer -->
      <footer class="bg-white border-t border-gray-200 py-3 px-6">
        <div class="flex justify-between items-center">
          <p class="text-sm text-gray">© 2025 SmartPlate System. All rights reserved.</p>
          <p class="text-sm text-gray">Version Beta</p>
        </div>
      </footer>
    </div>
  </div>
</template>
