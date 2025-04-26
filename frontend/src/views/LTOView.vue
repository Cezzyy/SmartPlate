<script setup lang="ts">
import { ref, computed, defineAsyncComponent, onMounted } from 'vue'
import { useUserStore } from '@/stores/user'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { useRouter } from 'vue-router'

const Dashboard = defineAsyncComponent(() => import('@/components/lto/LTODashboard.vue'))
const Registrations = defineAsyncComponent(() => import('@/components/lto/LTORegistrations.vue'))
const PendingPlates = defineAsyncComponent(() => import('@/components/lto/LTOPendingPlates.vue'))
const IssuedPlates = defineAsyncComponent(() => import('@/components/lto/LTOIssuedPlates.vue'))
const PlateLogs = defineAsyncComponent(() => import('@/components/lto/LTOPlateLogs.vue'))
const PlateScans = defineAsyncComponent(() => import('@/components/lto/LTOPlateScans.vue'))
const LogoutModal = defineAsyncComponent(() => import('@/components/modals/LogoutModal.vue'))

const userStore = useUserStore()
const router = useRouter()
const activeSection = ref('dashboard')
const registrationStatus = ref('pending')
const plateStatus = ref('pending')
const isRegistrationDropdownOpen = ref(false)
const isPlateDropdownOpen = ref(false)

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

// Sidebar state
const isSidebarOpen = ref(true)
const toggleSidebar = () => {
  isSidebarOpen.value = !isSidebarOpen.value
}

// Ensure authentication is checked when the component is mounted
onMounted(() => {
  console.log('LTOView mounted, checking authentication...')

  // Force authentication check
  const isAuthenticated = userStore.isAuthenticated || userStore.checkAuth()
  const userRole = userStore.userRole

  console.log('Authentication state:', { isAuthenticated, userRole })

  // If not authenticated or not an LTO Officer (except admin)
  if (!isAuthenticated) {
    console.log('Not authenticated, redirecting to login')
    router.push('/login')
    return
  }

  if (userRole !== 'LTO Officer' && userRole !== 'admin') {
    console.log('Not authorized as LTO Officer, redirecting to appropriate view')
    if (userRole === 'admin') {
      router.push('/admin')
    } else {
      router.push('/home')
    }
    return
  }

  console.log('Authentication check passed, user can access LTO View')
})

const componentMap: Record<
  string,
  | typeof Dashboard
  | typeof Registrations
  | typeof PendingPlates
  | typeof IssuedPlates
  | typeof PlateLogs
  | typeof PlateScans
> = {
  dashboard: Dashboard,
  'registrations-pending': Registrations,
  'registrations-processing': Registrations,
  'registrations-completed': Registrations,
  'plates-pending': PendingPlates,
  'plates-issued': IssuedPlates,
  'plate-logs': PlateLogs,
  'plate-scans': PlateScans,
}

const currentUser = computed(() => userStore.currentUser)

const navigateTo = (section: string, status?: string) => {
  if (section === 'registrations' && status) {
    registrationStatus.value = status
    activeSection.value = `registrations-${status}`
    isRegistrationDropdownOpen.value = false
  } else if (section === 'plates' && status) {
    plateStatus.value = status
    activeSection.value = `plates-${status}`
    isPlateDropdownOpen.value = false
  } else {
    activeSection.value = section
  }
}

const toggleRegistrationDropdown = () => {
  isRegistrationDropdownOpen.value = !isRegistrationDropdownOpen.value
  if (isRegistrationDropdownOpen.value) {
    isPlateDropdownOpen.value = false
  }
}

const togglePlateDropdown = () => {
  isPlateDropdownOpen.value = !isPlateDropdownOpen.value
  if (isPlateDropdownOpen.value) {
    isRegistrationDropdownOpen.value = false
  }
}
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
            <img
              v-if="!isSidebarOpen"
              src="/Land_Transportation_Office.webp"
              alt="LTO Logo"
              class="h-8 w-8 rounded-lg shadow-lg"
            />
            <div v-if="isSidebarOpen" class="flex items-center space-x-2">
              <img
                src="/Land_Transportation_Office.webp"
                alt="LTO Logo"
                class="h-8 w-8 rounded-lg shadow-lg"
              />
              <span class="text-xl font-bold">LTO Portal</span>
            </div>
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
            @click="navigateTo('dashboard')"
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

          <!-- Registration Dropdown -->
          <div class="relative">
            <button
              @click="toggleRegistrationDropdown"
              :class="[
                'w-full flex items-center justify-between p-3 rounded-lg transition-colors text-left',
                activeSection.includes('registrations')
                  ? 'bg-light-blue text-white'
                  : 'hover:bg-light-blue hover:bg-opacity-50',
              ]"
            >
              <div class="flex items-center">
                <font-awesome-icon :icon="['fas', 'file-alt']" class="w-5 h-5" />
                <span v-if="isSidebarOpen" class="ml-3 truncate">Vehicle Registrations</span>
              </div>
              <font-awesome-icon
                v-if="isSidebarOpen"
                :icon="isRegistrationDropdownOpen ? 'chevron-up' : 'chevron-down'"
                class="h-4 w-4 transform transition-transform duration-200"
              />
            </button>
            <transition
              enter-active-class="transition ease-out duration-200"
              enter-from-class="transform opacity-0 -translate-y-2"
              enter-to-class="transform opacity-100 translate-y-0"
              leave-active-class="transition ease-in duration-150"
              leave-from-class="transform opacity-100 translate-y-0"
              leave-to-class="transform opacity-0 -translate-y-2"
            >
              <div v-if="isSidebarOpen && isRegistrationDropdownOpen" class="pl-8 mt-1 space-y-1">
                <button
                  v-for="status in ['pending', 'processing', 'completed']"
                  :key="status"
                  @click="navigateTo('registrations', status)"
                  :class="[
                    'w-full flex items-center py-2 px-4 rounded text-sm transition duration-200',
                    activeSection === `registrations-${status}`
                      ? 'bg-light-blue'
                      : 'hover:bg-light-blue hover:bg-opacity-50',
                  ]"
                >
                  {{ status.charAt(0).toUpperCase() + status.slice(1) }}
                </button>
              </div>
            </transition>
          </div>

          <!-- Plates Dropdown -->
          <div class="relative">
            <button
              @click="togglePlateDropdown"
              :class="[
                'w-full flex items-center justify-between p-3 rounded-lg transition-colors text-left',
                activeSection.includes('plates')
                  ? 'bg-light-blue text-white'
                  : 'hover:bg-light-blue hover:bg-opacity-50',
              ]"
            >
              <div class="flex items-center">
                <font-awesome-icon :icon="['fas', 'id-card']" class="w-5 h-5" />
                <span v-if="isSidebarOpen" class="ml-3 truncate">License Plates</span>
              </div>
              <font-awesome-icon
                v-if="isSidebarOpen"
                :icon="isPlateDropdownOpen ? 'chevron-up' : 'chevron-down'"
                class="h-4 w-4 transform transition-transform duration-200"
              />
            </button>
            <transition
              enter-active-class="transition ease-out duration-200"
              enter-from-class="transform opacity-0 -translate-y-2"
              enter-to-class="transform opacity-100 translate-y-0"
              leave-active-class="transition ease-in duration-150"
              leave-from-class="transform opacity-100 translate-y-0"
              leave-to-class="transform opacity-0 -translate-y-2"
            >
              <div v-if="isSidebarOpen && isPlateDropdownOpen" class="pl-8 mt-1 space-y-1">
                <button
                  v-for="status in ['pending', 'issued']"
                  :key="status"
                  @click="navigateTo('plates', status)"
                  :class="[
                    'w-full flex items-center py-2 px-4 rounded text-sm transition duration-200',
                    activeSection === `plates-${status}`
                      ? 'bg-light-blue'
                      : 'hover:bg-light-blue hover:bg-opacity-50',
                  ]"
                >
                  {{ status.charAt(0).toUpperCase() + status.slice(1) }}
                </button>
              </div>
            </transition>
          </div>

          <!-- Logs Button -->
          <button
            @click="navigateTo('plate-logs')"
            :class="[
              'w-full flex items-center p-3 rounded-lg transition-colors text-left',
              activeSection === 'plate-logs'
                ? 'bg-light-blue text-white'
                : 'hover:bg-light-blue hover:bg-opacity-50',
            ]"
          >
            <font-awesome-icon :icon="['fas', 'history']" class="w-5 h-5" />
            <span v-if="isSidebarOpen" class="ml-3 truncate">Plate Logs</span>
          </button>

          <!-- Scans Button -->
          <button
            @click="navigateTo('plate-scans')"
            :class="[
              'w-full flex items-center p-3 rounded-lg transition-colors text-left',
              activeSection === 'plate-scans'
                ? 'bg-light-blue text-white'
                : 'hover:bg-light-blue hover:bg-opacity-50',
            ]"
          >
            <font-awesome-icon :icon="['fas', 'qrcode']" class="w-5 h-5" />
            <span v-if="isSidebarOpen" class="ml-3 truncate">Plate Scans</span>
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
              <p class="font-medium text-sm">
                {{ currentUser?.firstName }} {{ currentUser?.lastName }}
              </p>
              <p class="text-xs opacity-70">{{ currentUser?.role }}</p>
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
                    ? 'LTO Dashboard'
                    : activeSection === 'plates-pending'
                      ? 'Pending Plates'
                      : activeSection === 'plates-issued'
                        ? 'Issued Plates'
                        : activeSection === 'plate-logs'
                          ? 'Plate Logs'
                          : activeSection === 'plate-scans'
                            ? 'Plate Scans'
                            : activeSection.includes('registrations')
                              ? `${registrationStatus.charAt(0).toUpperCase() + registrationStatus.slice(1)} Registrations`
                              : 'LTO Portal'
                }}
              </h1>
            </div>
            <div class="flex items-center">
              <span class="text-sm text-gray"
                >Welcome, {{ currentUser?.firstName }} {{ currentUser?.lastName }}</span
              >
            </div>
          </div>
        </div>
      </header>

      <!-- Main Content Area -->
      <main class="flex-1 overflow-y-auto bg-gray-50 p-6">
        <div class="container mx-auto">
          <component
            :is="componentMap[activeSection]"
            :registration-status="registrationStatus"
            @navigate="navigateTo"
            v-if="componentMap[activeSection]"
          />
        </div>
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
