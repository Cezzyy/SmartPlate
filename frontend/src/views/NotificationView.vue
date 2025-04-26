<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useNotificationStore } from '@/stores/notification'

const router = useRouter()
const notificationStore = useNotificationStore()

// Fetch notifications on component mount
onMounted(() => {
  notificationStore.fetchNotifications()
})

// Filter states
const filterOptions = ref([
  { id: 'all', label: 'All Notifications', active: true, icon: 'bell' },
  { id: 'unread', label: 'Unread', active: false, icon: 'envelope' },
  { id: 'plate', label: 'Plates', active: false, icon: 'id-card' },
  { id: 'vehicle', label: 'Vehicles', active: false, icon: 'car' },
  { id: 'registration', label: 'Registration', active: false, icon: 'file-contract' },
  { id: 'system', label: 'System', active: false, icon: 'cog' },
  { id: 'payment', label: 'Payments', active: false, icon: 'credit-card' },
])

const activeFilter = ref('all')
const showSidebar = ref(window.innerWidth >= 768)
const searchQuery = ref('')

// Set active filter
const setActiveFilter = (filterId) => {
  activeFilter.value = filterId
  filterOptions.value.forEach((option) => {
    option.active = option.id === filterId
  })

  if (window.innerWidth < 768) {
    showSidebar.value = false
  }
}

// Toggle sidebar on mobile
const toggleSidebar = () => {
  showSidebar.value = !showSidebar.value
}

// Filtered notifications
const filteredNotifications = computed(() => {
  let filtered = notificationStore.allNotifications

  // Apply category filter
  if (activeFilter.value !== 'all') {
    if (activeFilter.value === 'unread') {
      filtered = filtered.filter((notification) => !notification.read)
    } else {
      filtered = filtered.filter((notification) => notification.type === activeFilter.value)
    }
  }

  // Apply search filter if query exists
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(
      (notification) =>
        notification.title.toLowerCase().includes(query) ||
        notification.message.toLowerCase().includes(query),
    )
  }

  return filtered
})

// Mark notification as read
const markAsRead = (notificationId) => {
  notificationStore.markAsRead(notificationId)
}

// Mark all as read
const markAllAsRead = () => {
  notificationStore.markAllAsRead()
}

// Delete notification
const deleteNotification = (notificationId) => {
  notificationStore.deleteNotification(notificationId)
}

// Count unread notifications
const unreadCount = computed(() => notificationStore.unreadCount)

// Get category count
const getCategoryCount = (categoryId) => {
  if (categoryId === 'all') {
    return notificationStore.notificationCount
  } else if (categoryId === 'unread') {
    return notificationStore.unreadCount
  } else {
    return notificationStore.getNotificationsByTypeCount(categoryId)
  }
}

// Get active filter label
const activeFilterLabel = computed(() => {
  const filter = filterOptions.value.find((option) => option.id === activeFilter.value)
  return filter ? filter.label : 'All Notifications'
})

// Format date
const formatDate = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

// Get notification icon
const getNotificationIcon = (type) => {
  switch (type) {
    case 'plate':
      return 'id-card'
    case 'vehicle':
      return 'car'
    case 'registration':
      return 'file-contract'
    case 'system':
      return 'cog'
    case 'payment':
      return 'credit-card'
    default:
      return 'bell'
  }
}

// Get notification color based on type
const getNotificationColor = (type, priority) => {
  // Base color on notification type, but adjust intensity based on priority
  const baseColors = {
    plate: {
      bg: 'bg-purple-100',
      border: 'border-purple-200',
      text: 'text-purple-700',
      icon: 'text-purple-600',
    },
    vehicle: {
      bg: 'bg-green-100',
      border: 'border-green-200',
      text: 'text-green-700',
      icon: 'text-green-600',
    },
    registration: {
      bg: 'bg-blue-100',
      border: 'border-blue-200',
      text: 'text-blue-700',
      icon: 'text-blue-600',
    },
    system: {
      bg: 'bg-yellow-100',
      border: 'border-yellow-200',
      text: 'text-yellow-700',
      icon: 'text-yellow-600',
    },
    payment: {
      bg: 'bg-emerald-100',
      border: 'border-emerald-200',
      text: 'text-emerald-700',
      icon: 'text-emerald-600',
    },
  }

  return (
    baseColors[type] || {
      bg: 'bg-gray-100',
      border: 'border-gray-200',
      text: 'text-gray-700',
      icon: 'text-gray-600',
    }
  )
}

// Get priority badge
const getPriorityBadge = (priority) => {
  switch (priority) {
    case 'high':
      return { class: 'bg-red-100 text-red-800 border-red-200', text: 'High' }
    case 'medium':
      return { class: 'bg-orange-100 text-orange-800 border-orange-200', text: 'Medium' }
    case 'low':
      return { class: 'bg-green-100 text-green-800 border-green-200', text: 'Low' }
    default:
      return { class: 'bg-gray-100 text-gray-800 border-gray-200', text: 'Normal' }
  }
}

// Show loading state
const isLoading = computed(() => notificationStore.loading)
</script>

<template>
  <div class="bg-gray-50 min-h-screen flex flex-col">
    <!-- Header -->
    <header class="bg-dark-blue text-white shadow-md sticky top-0 z-10">
      <div class="container mx-auto px-4 py-3 flex items-center justify-between">
        <div class="flex items-center space-x-4">
          <button
            @click="toggleSidebar"
            class="md:hidden text-white hover:text-light-gray transition-colors"
          >
            <font-awesome-icon :icon="['fas', 'bars']" class="w-5 h-5" />
          </button>
          <router-link
            to="/home"
            class="flex items-center space-x-2 ml-1 text-white hover:text-light-gray transition-colors"
          >
            <font-awesome-icon :icon="['fas', 'chevron-left']" />
            <span class="font-medium hidden sm:inline">Back to Dashboard</span>
          </router-link>
        </div>
        <h1 class="text-xl font-bold text-white">Notification Center</h1>
        <div class="relative">
          <span
            class="absolute -top-1 -right-1 bg-red text-white text-xs rounded-full h-5 w-5 flex items-center justify-center"
            v-if="unreadCount > 0"
          >
            {{ unreadCount }}
          </span>
          <font-awesome-icon :icon="['fas', 'bell']" class="w-5 h-5 text-white" />
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <div class="flex-1 flex flex-col md:flex-row">
      <!-- Sidebar / Filter Panel -->
      <aside
        :class="[
          'bg-light-blue text-white w-full md:w-64 lg:w-72 flex-shrink-0 transition-all duration-300 ease-in-out transform',
          showSidebar ? 'translate-x-0' : '-translate-x-full md:translate-x-0',
          'fixed md:static top-16 bottom-0 left-0 z-20 md:z-0 overflow-y-auto',
        ]"
      >
        <!-- Search -->
        <div class="p-4 border-b border-gray-700">
          <div class="relative">
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Search notifications..."
              class="w-full bg-dark-blue text-white placeholder-gray-400 border border-gray-700 rounded-lg py-2 pl-10 pr-4 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            <font-awesome-icon
              :icon="['fas', 'search']"
              class="absolute left-3 top-3 text-gray-400 w-4 h-4"
            />
          </div>
        </div>

        <!-- Category List -->
        <div class="p-4">
          <h3 class="text-light-gray text-xs font-semibold uppercase tracking-wider mb-4">
            Categories
          </h3>
          <ul class="space-y-1">
            <li v-for="option in filterOptions" :key="option.id">
              <button
                @click="setActiveFilter(option.id)"
                :class="[
                  'w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                  option.active
                    ? 'bg-blue-600 text-white'
                    : 'text-light-gray hover:bg-gray-700 hover:text-white',
                ]"
              >
                <div class="flex items-center">
                  <font-awesome-icon :icon="['fas', option.icon]" class="w-4 h-4 mr-3" />
                  <span>{{ option.label }}</span>
                </div>
                <span
                  :class="[
                    'text-xs px-2 py-0.5 rounded-full',
                    option.active ? 'bg-white bg-opacity-20' : 'bg-dark-blue',
                  ]"
                >
                  {{ getCategoryCount(option.id) }}
                </span>
              </button>
            </li>
          </ul>
        </div>

        <!-- Additional Options -->
        <div class="p-4 mt-2">
          <h3 class="text-light-gray text-xs font-semibold uppercase tracking-wider mb-4">
            Actions
          </h3>
          <ul class="space-y-1">
            <li>
              <button
                @click="markAllAsRead"
                class="w-full flex items-center px-3 py-2.5 rounded-lg text-sm font-medium text-light-gray hover:bg-gray-700 hover:text-white transition-colors"
              >
                <font-awesome-icon :icon="['fas', 'check-double']" class="w-4 h-4 mr-3" />
                <span>Mark all as read</span>
              </button>
            </li>
            <li>
              <button
                @click="router.push('/account-settings?tab=notifications')"
                class="w-full flex items-center px-3 py-2.5 rounded-lg text-sm font-medium text-light-gray hover:bg-gray-700 hover:text-white transition-colors"
              >
                <font-awesome-icon :icon="['fas', 'cog']" class="w-4 h-4 mr-3" />
                <span>Notification Settings</span>
              </button>
            </li>
          </ul>
        </div>
      </aside>

      <!-- Overlay for mobile sidebar -->
      <div
        v-if="showSidebar"
        @click="toggleSidebar"
        class="fixed inset-0 bg-black bg-opacity-50 z-10 md:hidden"
      ></div>

      <!-- Content Area -->
      <main class="flex-1 p-4 md:p-6">
        <!-- Content Header -->
        <div class="mb-6">
          <div class="flex flex-col md:flex-row md:items-center md:justify-between">
            <div class="mb-4 md:mb-0">
              <h2 class="text-2xl font-bold text-dark-blue">{{ activeFilterLabel }}</h2>
              <p class="text-gray mt-1">
                Showing {{ filteredNotifications.length }} notification{{
                  filteredNotifications.length !== 1 ? 's' : ''
                }}
                <span v-if="activeFilter === 'all' && unreadCount > 0">
                  ({{ unreadCount }} unread)
                </span>
              </p>
            </div>
            <div class="flex space-x-3">
              <button
                @click="markAllAsRead"
                class="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors flex items-center"
                v-if="unreadCount > 0"
              >
                <font-awesome-icon :icon="['fas', 'check-double']" class="mr-2 h-4 w-4" />
                Mark all as read
              </button>
              <button
                @click="router.push('/account-settings?tab=notifications')"
                class="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors flex items-center"
                title="Notification Settings"
              >
                <font-awesome-icon :icon="['fas', 'cog']" class="mr-2 h-4 w-4" />
                Settings
              </button>
              <button
                @click="toggleSidebar"
                class="px-4 py-2 bg-dark-blue border border-dark-blue rounded-lg text-sm font-medium text-white hover:bg-light-blue transition-colors md:hidden flex items-center"
              >
                <font-awesome-icon :icon="['fas', 'filter']" class="mr-2 h-4 w-4" />
                Filters
              </button>
            </div>
          </div>
        </div>

        <!-- Loading State -->
        <div v-if="isLoading" class="flex justify-center items-center py-16">
          <div class="flex flex-col items-center">
            <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-dark-blue mb-4"></div>
            <p class="text-gray">Loading notifications...</p>
          </div>
        </div>

        <!-- No Notifications Message -->
        <div
          v-else-if="filteredNotifications.length === 0"
          class="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200 p-8 text-center"
        >
          <div class="flex flex-col items-center justify-center py-6">
            <div class="bg-gray-100 p-5 rounded-full mb-4">
              <font-awesome-icon :icon="['fas', 'bell-slash']" class="text-gray-400 text-4xl" />
            </div>
            <h3 class="text-xl font-medium text-dark-blue">No notifications found</h3>
            <p class="text-gray mt-2 max-w-md mx-auto">
              There are no notifications matching your current filter. Try changing your filter or
              check back later for new notifications.
            </p>
            <button
              @click="setActiveFilter('all')"
              class="mt-4 px-4 py-2 bg-dark-blue text-white rounded-lg hover:bg-light-blue transition-colors"
            >
              View all notifications
            </button>
          </div>
        </div>

        <!-- Notifications List -->
        <div v-else class="space-y-4">
          <div
            v-for="notification in filteredNotifications"
            :key="notification.id"
            :class="[
              'bg-white border rounded-xl shadow-sm overflow-hidden transition-all duration-200 hover:shadow-md',
              !notification.read
                ? 'border-l-4 border-blue-500 border-t border-r border-b'
                : 'border border-gray-200',
            ]"
          >
            <div class="p-5">
              <div class="flex items-start gap-4">
                <!-- Notification Icon -->
                <div
                  :class="[
                    'w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0',
                    getNotificationColor(notification.type, notification.priority).bg,
                  ]"
                >
                  <font-awesome-icon
                    :icon="['fas', getNotificationIcon(notification.type)]"
                    :class="[
                      'w-5 h-5',
                      getNotificationColor(notification.type, notification.priority).icon,
                    ]"
                  />
                </div>

                <!-- Notification Content -->
                <div class="flex-1">
                  <!-- Header -->
                  <div class="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <h3 class="font-bold text-dark-blue flex items-center">
                        {{ notification.title }}
                        <span
                          v-if="!notification.read"
                          class="inline-block ml-2 w-2 h-2 bg-blue-600 rounded-full"
                          title="Unread"
                        ></span>
                      </h3>
                      <div class="flex items-center mt-1 space-x-2">
                        <span class="text-sm text-gray">{{ notification.time }}</span>
                        <span class="text-gray">•</span>
                        <span class="text-sm text-gray">{{ formatDate(notification.date) }}</span>
                        <span
                          :class="[
                            'text-xs px-2 py-0.5 rounded-full border',
                            getPriorityBadge(notification.priority).class,
                          ]"
                          v-if="notification.priority"
                        >
                          {{ getPriorityBadge(notification.priority).text }}
                        </span>
                      </div>
                    </div>
                    <div class="flex items-center space-x-2">
                      <button
                        v-if="!notification.read"
                        @click="markAsRead(notification.id)"
                        class="p-1.5 bg-blue-50 text-blue-600 rounded-full hover:bg-blue-100 transition-colors"
                        title="Mark as read"
                      >
                        <font-awesome-icon :icon="['fas', 'check']" class="w-4 h-4" />
                      </button>
                      <button
                        @click="deleteNotification(notification.id)"
                        class="p-1.5 bg-gray-50 text-gray-500 rounded-full hover:bg-gray-100 hover:text-red transition-colors"
                        title="Delete notification"
                      >
                        <font-awesome-icon :icon="['fas', 'trash-alt']" class="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <!-- Message -->
                  <p class="mt-2 text-gray-600">{{ notification.message }}</p>

                  <!-- Action Buttons -->
                  <div class="mt-4 flex flex-wrap items-center gap-3">
                    <button
                      class="px-3 py-1.5 bg-dark-blue text-white text-sm font-medium rounded-lg hover:bg-light-blue transition-colors flex items-center"
                    >
                      <font-awesome-icon
                        :icon="['fas', 'arrow-right']"
                        class="w-3.5 h-3.5 mr-1.5"
                      />
                      Take Action
                    </button>
                    <button
                      class="px-3 py-1.5 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors flex items-center"
                    >
                      <font-awesome-icon :icon="['fas', 'eye']" class="w-3.5 h-3.5 mr-1.5" />
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<style scoped>
/* Custom scrollbar */
::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.1);
}

::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.2);
  border-radius: 3px;
}

::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 0, 0, 0.3);
}

/* Animation for new notifications */
@keyframes pulse {
  0% {
    box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.3);
  }
  70% {
    box-shadow: 0 0 0 10px rgba(59, 130, 246, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(59, 130, 246, 0);
  }
}

.border-blue-500 {
  animation: pulse 2s ease-in-out 1;
}

/* Focus styles */
button:focus,
a:focus {
  outline: 2px solid transparent;
  outline-offset: 2px;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.5);
}

input:focus {
  outline: none;
}

/* Responsive sidebar */
@media (min-width: 768px) {
  .md\:translate-x-0 {
    transform: translateX(0);
  }
}
</style>
