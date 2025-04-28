<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed, defineAsyncComponent } from 'vue'
import { useUserStore } from '@/stores/user'

import type { User as UserType } from '@/types/user'

interface User extends Pick<UserType, 'email' | 'avatar' | 'firstName' | 'lastName'> {
  name: string
}

interface NotificationItem {
  id: number
  title: string
  message: string
  time: string
  read: boolean
}

interface MenuItem {
  name: string
  icon: string
  active: boolean
}

type ComponentMap = {
  [key: string]: ReturnType<typeof defineAsyncComponent>
}

const LogoutModal = defineAsyncComponent(() => import('@/components/modals/LogoutModal.vue'))
const DashboardContent = defineAsyncComponent(() => import('@/components/ui/DashboardContent.vue'))
const VehicleInformation = defineAsyncComponent(
  () => import('@/components/ui/VehicleInformation.vue'),
)
const PlateInformation = defineAsyncComponent(() => import('@/components/ui/PlateInformation.vue'))
const RegistrationContent = defineAsyncComponent(
  () => import('@/components/ui/RegistrationContent.vue'),
)

const userStore = useUserStore()

// Sidebar state
const isSidebarOpen = ref(false)
const toggleSidebar = () => {
  isSidebarOpen.value = !isSidebarOpen.value
}

// User profile data from store
const user = computed<User>(() => {
  const currentUser = userStore.currentUser
  
  // Make sure we handle the case where currentUser might be null or incomplete
  if (!currentUser) {
    console.warn('No current user found in store')
    return {
      name: 'Guest User',
      email: 'guest@example.com',
      avatar: '/Land_Transportation_Office.webp',
      firstName: 'Guest',
      lastName: 'User',
    }
  }
  
  // Use the formatted name from userStore fullName getter
  const formattedName = userStore.fullName || 'User'
  
  return {
    name: formattedName,
    email: currentUser.email || 'no-email@example.com',
    avatar: currentUser.avatar || '/Land_Transportation_Office.webp',
    firstName: currentUser.firstName || '',
    lastName: currentUser.lastName || '',
  }
})

// Format user's full name
const userName = computed(() => {
  // Simply use the fullName getter from the user store
  return userStore.fullName || 'Guest User'
})

// Notifications (mock data)
const notifications = ref<number>(3)
const notificationItems = ref<NotificationItem[]>([
  {
    id: 1,
    title: 'New plate available',
    message: 'Your new plate is ready for pickup',
    time: '2 hours ago',
    read: false,
  },
  {
    id: 2,
    title: 'Registration reminder',
    message: 'Your vehicle registration expires in 7 days',
    time: '1 day ago',
    read: false,
  },
  {
    id: 3,
    title: 'System maintenance',
    message: 'Scheduled maintenance on Saturday',
    time: '3 days ago',
    read: true,
  },
])

// Notification dropdown state
const isNotificationDropdownOpen = ref(false)

// Profile dropdown state
const isProfileDropdownOpen = ref(false)

// Logout confirmation modal state
const showLogoutModal = ref(false)

// Active content management
const activeMenuItem = ref('Dashboard')

// Sidebar menu items
const menuItems = ref<MenuItem[]>([
  { name: 'Dashboard', icon: 'home', active: true },
  { name: 'Vehicles', icon: 'car', active: false },
  { name: 'Plates', icon: 'id-card', active: false },
  { name: 'Registration', icon: 'file-contract', active: false },
])

// Set active menu item
const setActiveMenuItem = (itemName: string) => {
  menuItems.value.forEach((item) => {
    item.active = item.name === itemName
  })
  activeMenuItem.value = itemName
  // Close sidebar on mobile after selection
  if (window.innerWidth < 1024) {
    isSidebarOpen.value = false
  }
}

// Component mapping
const componentMap: ComponentMap = {
  Dashboard: DashboardContent,
  Vehicles: VehicleInformation,
  Plates: PlateInformation,
  Registration: RegistrationContent,
}

// Active component computed property
const activeComponent = computed(() => componentMap[activeMenuItem.value] || DashboardContent)

// Set active menu item directly (no warning needed since we're using router for form)
const handleNavigation = (itemName: string) => {
  setActiveMenuItem(itemName)
}

// Logout functions
const confirmLogout = () => {
  showLogoutModal.value = true
  isProfileDropdownOpen.value = false
}

const handleLogout = () => {
  userStore.logout()
  showLogoutModal.value = false
}

const cancelLogout = () => {
  showLogoutModal.value = false
}

// Close sidebar on escape key
const handleEscKey = (event: KeyboardEvent) => {
  if (event.key === 'Escape') {
    if (isSidebarOpen.value) {
      isSidebarOpen.value = false
    }
    if (isProfileDropdownOpen.value) {
      isProfileDropdownOpen.value = false
    }
    if (isNotificationDropdownOpen.value) {
      isNotificationDropdownOpen.value = false
    }
    if (showLogoutModal.value) {
      showLogoutModal.value = false
    }
  }
}

// Close sidebar and dropdown on outside click
const handleOutsideClick = (event: MouseEvent) => {
  const target = event.target as HTMLElement
  // Handle sidebar outside click
  if (isSidebarOpen.value && !target.closest('#sidebar') && !target.closest('#sidebar-toggle')) {
    isSidebarOpen.value = false
  }

  // Handle profile dropdown outside click
  if (
    isProfileDropdownOpen.value &&
    !target.closest('#profile-dropdown') &&
    !target.closest('#profile-toggle')
  ) {
    isProfileDropdownOpen.value = false
  }

  // Handle notification dropdown outside click
  if (
    isNotificationDropdownOpen.value &&
    !target.closest('#notification-dropdown') &&
    !target.closest('#notification-toggle')
  ) {
    isNotificationDropdownOpen.value = false
  }
}

onMounted(() => {
  document.addEventListener('keydown', handleEscKey)
  document.addEventListener('click', handleOutsideClick)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleEscKey)
  document.removeEventListener('click', handleOutsideClick)
})
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Overlay for mobile when sidebar is open -->
    <div
      v-if="isSidebarOpen"
      class="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden transition-opacity duration-300 ease-in-out"
      @click="toggleSidebar"
    ></div>

    <!-- Sidebar -->
    <aside
      id="sidebar"
      :class="[
        'fixed top-0 left-0 z-30 h-screen bg-gradient-to-b from-dark-blue to-blue-900 text-white w-64 transition-all duration-300 ease-in-out transform',
        isSidebarOpen ? 'translate-x-0' : '-translate-x-full',
      ]"
    >
      <!-- Sidebar Header -->
      <div class="flex items-center justify-between p-4 border-b border-blue-800">
        <div class="flex items-center space-x-3">
          <div class="w-10 h-10 rounded-full bg-red flex items-center justify-center">
            <span class="text-white font-bold text-xl">SP</span>
          </div>
          <h1 class="text-xl font-bold">SmartPlate</h1>
        </div>
        <button
          class="lg:hidden text-white hover:text-red transition-colors duration-200"
          @click="toggleSidebar"
        >
          <font-awesome-icon :icon="['fas', 'xmark']" class="w-5 h-5" />
        </button>
      </div>

      <!-- Sidebar Menu -->
      <nav class="mt-6 px-4">
        <ul class="space-y-2">
          <li v-for="(item, index) in menuItems" :key="index">
            <a
              href="#"
              :class="[
                'flex items-center p-3 rounded-lg transition-all duration-200 group hover:bg-blue-800',
                item.active ? 'bg-blue-800' : '',
              ]"
              @click.prevent="handleNavigation(item.name)"
            >
              <div
                class="w-8 h-8 flex items-center justify-center text-blue-300 group-hover:text-white transition-colors duration-200"
              >
                <font-awesome-icon :icon="['fas', item.icon]" class="w-5 h-5" />
              </div>
              <span
                class="ml-3 font-medium group-hover:text-white transition-colors duration-200"
                >{{ item.name }}</span
              >
              <span
                class="ml-auto transform transition-transform duration-200 group-hover:translate-x-1"
              >
                <font-awesome-icon
                  :icon="['fas', 'chevron-right']"
                  class="w-3 h-3 opacity-0 group-hover:opacity-100"
                />
              </span>
            </a>
          </li>
        </ul>
      </nav>

      <!-- Sidebar Footer -->
      <div class="absolute bottom-0 left-0 right-0 p-4 border-t border-blue-800">
        <div class="flex items-center space-x-3">
          <img
            :src="user.avatar"
            alt="User Avatar"
            class="w-10 h-10 rounded-full border-2 border-light-blue"
          />
          <div class="overflow-hidden">
            <h4 class="text-sm font-semibold truncate">{{ userName }}</h4>
            <p class="text-xs text-blue-300 truncate">{{ user.email }}</p>
          </div>
        </div>
      </div>
    </aside>

    <!-- Main Content -->
    <main :class="['transition-all duration-300 ease-in-out', isSidebarOpen ? 'lg:ml-64' : 'ml-0']">
      <!-- Header -->
      <header class="bg-white shadow-sm sticky top-0 z-10">
        <div class="flex items-center justify-between px-4 py-3">
          <!-- Left: Menu Toggle -->
          <div class="flex items-center">
            <button
              id="sidebar-toggle"
              class="p-2 rounded-lg text-gray-600 hover:bg-gray-100 focus:outline-none"
              @click="toggleSidebar"
            >
              <font-awesome-icon :icon="['fas', 'bars']" class="w-5 h-5" />
            </button>
            <h2 class="ml-4 text-lg font-semibold text-gray-800">
              {{
                activeMenuItem === 'VehicleRegistrationForm'
                  ? 'SmartPlate Vehicle Registration'
                  : activeMenuItem
              }}
            </h2>
          </div>

          <!-- Right: Notifications and Profile -->
          <div class="flex items-center space-x-4">
            <!-- Notifications -->
            <div class="relative">
              <button
                id="notification-toggle"
                class="p-2 rounded-lg text-gray-600 hover:bg-gray-100 focus:outline-none relative"
                @click="isNotificationDropdownOpen = !isNotificationDropdownOpen"
              >
                <font-awesome-icon :icon="['fas', 'bell']" class="w-5 h-5" />
                <span
                  v-if="notifications > 0"
                  class="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-red-100 transform translate-x-1/2 -translate-y-1/2 bg-red rounded-full"
                  >{{ notifications }}</span
                >
              </button>

              <!-- Notification Dropdown -->
              <transition
                enter-active-class="transition ease-out duration-200"
                enter-from-class="transform opacity-0 scale-95"
                enter-to-class="transform opacity-100 scale-100"
                leave-active-class="transition ease-in duration-150"
                leave-from-class="transform opacity-100 scale-100"
                leave-to-class="transform opacity-0 scale-95"
              >
                <div
                  id="notification-dropdown"
                  v-if="isNotificationDropdownOpen"
                  class="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg py-2 z-50 border border-gray-100"
                >
                  <!-- Notification Header -->
                  <div class="px-4 py-2 border-b border-gray-100">
                    <div class="flex justify-between items-center">
                      <h4 class="text-sm font-semibold text-gray-800">Notifications</h4>
                      <span
                        v-if="notifications > 0"
                        class="px-2 py-1 text-xs font-bold text-white bg-red rounded-full"
                        >{{ notifications }}</span
                      >
                    </div>
                  </div>

                  <!-- Notification Items -->
                  <div class="max-h-60 overflow-y-auto">
                    <div
                      v-for="item in notificationItems"
                      :key="item.id"
                      :class="[
                        'px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-0',
                        !item.read ? 'bg-blue-50' : '',
                      ]"
                    >
                      <div class="flex items-start">
                        <div
                          class="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center"
                        >
                          <font-awesome-icon
                            :icon="['fas', 'bell']"
                            class="w-4 h-4 text-blue-500"
                          />
                        </div>
                        <div class="ml-3 flex-1">
                          <p class="text-sm font-medium text-gray-800">{{ item.title }}</p>
                          <p class="text-xs text-gray-500">{{ item.message }}</p>
                          <p class="text-xs text-gray-400 mt-1">{{ item.time }}</p>
                        </div>
                        <div v-if="!item.read" class="w-2 h-2 bg-red rounded-full"></div>
                      </div>
                    </div>
                  </div>

                  <!-- View All Link -->
                  <div class="px-4 py-2 border-t border-gray-100">
                    <router-link
                      to="/notifications"
                      class="block text-center text-sm font-medium text-blue-600 hover:text-blue-700"
                      @click="isNotificationDropdownOpen = false"
                    >
                      View all notifications
                    </router-link>
                  </div>
                </div>
              </transition>
            </div>

            <!-- Profile -->
            <div class="relative">
              <button
                id="profile-toggle"
                class="flex items-center space-x-2 focus:outline-none"
                @click="isProfileDropdownOpen = !isProfileDropdownOpen"
              >
                <img
                  :src="user.avatar"
                  alt="User Avatar"
                  class="w-8 h-8 rounded-full border-2 border-light-blue"
                />
                <span class="hidden md:block text-sm font-medium">{{
                  userName.split(' ')[0]
                }}</span>
                <font-awesome-icon :icon="['fas', 'chevron-down']" class="w-3 h-3 text-gray" />
              </button>

              <!-- Profile Dropdown -->
              <transition
                enter-active-class="transition ease-out duration-200"
                enter-from-class="transform opacity-0 scale-95"
                enter-to-class="transform opacity-100 scale-100"
                leave-active-class="transition ease-in duration-150"
                leave-from-class="transform opacity-100 scale-100"
                leave-to-class="transform opacity-0 scale-95"
              >
                <div
                  id="profile-dropdown"
                  v-if="isProfileDropdownOpen"
                  class="absolute right-0 mt-2 w-60 bg-white rounded-lg shadow-lg py-2 z-50 border border-gray-100"
                >
                  <!-- Profile Header -->
                  <div class="px-4 py-3 border-b border-gray-100">
                    <div class="flex items-center space-x-3">
                      <img
                        :src="user.avatar"
                        alt="User Avatar"
                        class="w-10 h-10 rounded-full border-2 border-light-blue"
                      />
                      <div>
                        <h4 class="text-sm font-semibold text-gray-800">{{ userName }}</h4>
                        <p class="text-xs text-gray-500">{{ user.email }}</p>
                      </div>
                    </div>
                  </div>

                  <!-- Dropdown Menu Items -->
                  <div class="py-1">
                    <router-link
                      to="/profile"
                      class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                      @click="isProfileDropdownOpen = false"
                    >
                      <div class="flex items-center">
                        <font-awesome-icon
                          :icon="['fas', 'user']"
                          class="w-4 h-4 mr-3 text-gray-400"
                        />
                        <span>My Profile</span>
                      </div>
                    </router-link>
                    <router-link
                      to="/account-settings"
                      class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                    >
                      <div class="flex items-center">
                        <font-awesome-icon
                          :icon="['fas', 'gear']"
                          class="w-4 h-4 mr-3 text-gray-400"
                        />
                        <span>Account Settings</span>
                      </div>
                    </router-link>
                  </div>

                  <!-- Divider -->
                  <div class="border-t border-gray-100 my-1"></div>

                  <!-- Logout Option -->
                  <a
                    href="#"
                    class="block px-4 py-2 text-sm text-red hover:bg-red hover:bg-opacity-10 transition-colors"
                    @click.prevent="confirmLogout"
                  >
                    <div class="flex items-center">
                      <font-awesome-icon :icon="['fas', 'sign-out-alt']" class="w-4 h-4 mr-3" />
                      <span>Log Out</span>
                    </div>
                  </a>
                </div>
              </transition>
            </div>
          </div>
        </div>
      </header>

      <!-- Dynamic Content Component -->
      <component :is="activeComponent" @navigate="setActiveMenuItem" />
    </main>

    <!-- Logout Modal Component -->
    <LogoutModal :show="showLogoutModal" @confirm="handleLogout" @cancel="cancelLogout" />
  </div>
</template>

<style scoped>
/* Additional animations and transitions */
@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.fade-in {
  animation: fadeIn 0.3s ease-in-out;
}

/* Scrollbar styling */
::-webkit-scrollbar {
  width: 6px;
}

::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 10px;
}

::-webkit-scrollbar-thumb {
  background: #c5c5c5;
  border-radius: 10px;
}

::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

/* For Firefox */
* {
  scrollbar-width: thin;
  scrollbar-color: #c5c5c5 #f1f1f1;
}
</style>
