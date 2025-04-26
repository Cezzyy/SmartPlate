<script setup>
import { ref, computed } from 'vue'

// Mock notification data (in a real app, this would come from an API)
const notifications = ref([
  {
    id: 1,
    title: 'New plate available',
    message:
      'Your new plate is ready for pickup at the LTO office. Please bring your ID and receipt.',
    time: '2 hours ago',
    date: '2025-03-10',
    type: 'plate',
    read: false,
  },
  {
    id: 2,
    title: 'Registration reminder',
    message:
      'Your vehicle registration expires in 7 days. Please complete the renewal process to avoid penalties.',
    time: '1 day ago',
    date: '2025-03-09',
    type: 'registration',
    read: false,
  },
  {
    id: 3,
    title: 'System maintenance',
    message:
      'Scheduled maintenance on Saturday from 10 PM to 2 AM. Some services may be unavailable during this time.',
    time: '3 days ago',
    date: '2025-03-07',
    type: 'system',
    read: true,
  },
  {
    id: 4,
    title: 'Vehicle inspection due',
    message:
      'Your vehicle inspection is due next month. Schedule an appointment at your earliest convenience.',
    time: '1 week ago',
    date: '2025-03-03',
    type: 'vehicle',
    read: true,
  },
  {
    id: 5,
    title: 'Payment confirmation',
    message:
      'Your payment for vehicle registration has been received. Your receipt is available in the documents section.',
    time: '2 weeks ago',
    date: '2025-02-24',
    type: 'payment',
    read: true,
  },
])

// Filter states
const filterOptions = ref([
  { id: 'all', label: 'All Notifications', active: true },
  { id: 'unread', label: 'Unread', active: false },
  { id: 'plate', label: 'Plates', active: false },
  { id: 'vehicle', label: 'Vehicles', active: false },
  { id: 'registration', label: 'Registration', active: false },
  { id: 'system', label: 'System', active: false },
  { id: 'payment', label: 'Payments', active: false },
])

const activeFilter = ref('all')

// Set active filter
const setActiveFilter = (filterId) => {
  activeFilter.value = filterId
  filterOptions.value.forEach((option) => {
    option.active = option.id === filterId
  })
}

// Filtered notifications
const filteredNotifications = computed(() => {
  if (activeFilter.value === 'all') {
    return notifications.value
  } else if (activeFilter.value === 'unread') {
    return notifications.value.filter((notification) => !notification.read)
  } else {
    return notifications.value.filter((notification) => notification.type === activeFilter.value)
  }
})

// Mark notification as read
const markAsRead = (notificationId) => {
  const notification = notifications.value.find((n) => n.id === notificationId)
  if (notification) {
    notification.read = true
  }
}

// Mark all as read
const markAllAsRead = () => {
  notifications.value.forEach((notification) => {
    notification.read = true
  })
}

// Count unread notifications
const unreadCount = computed(() => {
  return notifications.value.filter((notification) => !notification.read).length
})
</script>

<template>
  <div class="bg-gray-50 min-h-screen">
    <!-- Header -->
    <header class="bg-white shadow-sm sticky top-0 z-10">
      <div class="container mx-auto px-4 py-4 flex items-center justify-between">
        <div class="flex items-center space-x-4">
          <router-link to="/home" class="flex items-center space-x-2">
            <font-awesome-icon :icon="['fas', 'chevron-left']" class="text-gray-600" />
            <span class="text-gray-600">Back to Dashboard</span>
          </router-link>
        </div>
        <h1 class="text-xl font-bold text-gray-800">Notifications</h1>
        <div class="w-24"></div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="container mx-auto px-4 py-6">
      <!-- Notification Header -->
      <div class="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div class="mb-4 md:mb-0">
          <h2 class="text-2xl font-bold text-gray-800">All Notifications</h2>
          <p class="text-gray-500 mt-1">
            You have <span class="font-medium text-blue-600">{{ unreadCount }}</span> unread
            notification{{ unreadCount !== 1 ? 's' : '' }}
          </p>
        </div>
        <div class="flex space-x-2">
          <button
            @click="markAllAsRead"
            class="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors duration-200"
          >
            <font-awesome-icon :icon="['fas', 'check-double']" class="mr-2" />
            Mark all as read
          </button>
        </div>
      </div>

      <!-- Filter Tabs -->
      <div class="mb-6 overflow-x-auto">
        <div class="flex space-x-2 pb-2">
          <button
            v-for="option in filterOptions"
            :key="option.id"
            @click="setActiveFilter(option.id)"
            :class="[
              'px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors duration-200',
              option.active
                ? 'bg-blue-600 text-white'
                : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50',
            ]"
          >
            {{ option.label }}
            <span
              v-if="option.id === 'unread' && unreadCount > 0"
              class="ml-2 bg-red text-white text-xs rounded-full px-2 py-0.5"
            >
              {{ unreadCount }}
            </span>
          </button>
        </div>
      </div>

      <!-- Notifications List -->
      <div class="bg-white rounded-xl shadow-sm overflow-hidden">
        <div v-if="filteredNotifications.length === 0" class="p-8 text-center">
          <div class="flex flex-col items-center justify-center">
            <font-awesome-icon :icon="['fas', 'bell-slash']" class="text-gray-400 text-5xl mb-4" />
            <h3 class="text-lg font-medium text-gray-800">No notifications found</h3>
            <p class="text-gray-500 mt-1">
              There are no notifications matching your current filter.
            </p>
          </div>
        </div>

        <ul v-else>
          <li
            v-for="notification in filteredNotifications"
            :key="notification.id"
            :class="[
              'border-b border-gray-100 last:border-none transition-colors duration-200 hover:bg-gray-50',
              !notification.read ? 'bg-blue-50' : '',
            ]"
          >
            <div class="p-4 sm:p-6">
              <div class="flex items-start">
                <!-- Notification Icon -->
                <div
                  :class="[
                    'w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 mr-4',
                    notification.type === 'plate'
                      ? 'bg-purple-100 text-purple-600'
                      : notification.type === 'vehicle'
                        ? 'bg-green-100 text-green-600'
                        : notification.type === 'registration'
                          ? 'bg-blue-100 text-blue-600'
                          : notification.type === 'system'
                            ? 'bg-yellow-100 text-yellow-600'
                            : notification.type === 'payment'
                              ? 'bg-emerald-100 text-emerald-600'
                              : 'bg-gray-100 text-gray-600',
                  ]"
                >
                  <font-awesome-icon
                    :icon="[
                      'fas',
                      notification.type === 'plate'
                        ? 'id-card'
                        : notification.type === 'vehicle'
                          ? 'car'
                          : notification.type === 'registration'
                            ? 'file-contract'
                            : notification.type === 'system'
                              ? 'cog'
                              : notification.type === 'payment'
                                ? 'credit-card'
                                : 'bell',
                    ]"
                    class="w-5 h-5"
                  />
                </div>

                <!-- Notification Content -->
                <div class="flex-1">
                  <div class="flex items-start justify-between">
                    <h3 class="font-semibold text-gray-800">
                      {{ notification.title }}
                      <span
                        v-if="!notification.read"
                        class="inline-block ml-2 w-2 h-2 bg-blue-600 rounded-full"
                      ></span>
                    </h3>
                    <div class="flex items-center space-x-2 ml-4">
                      <span class="text-sm text-gray-500">{{ notification.time }}</span>
                      <button
                        v-if="!notification.read"
                        @click="markAsRead(notification.id)"
                        class="text-blue-600 hover:text-blue-800"
                        title="Mark as read"
                      >
                        <font-awesome-icon :icon="['fas', 'check']" class="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <p class="mt-1 text-gray-600">{{ notification.message }}</p>

                  <!-- Action Buttons -->
                  <div class="mt-3 flex items-center space-x-3">
                    <button
                      class="text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center"
                    >
                      <font-awesome-icon :icon="['fas', 'eye']" class="w-3.5 h-3.5 mr-1.5" />
                      View Details
                    </button>
                    <button class="text-sm text-gray-500 hover:text-gray-700 flex items-center">
                      <font-awesome-icon :icon="['fas', 'trash-alt']" class="w-3.5 h-3.5 mr-1.5" />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </li>
        </ul>
      </div>
    </main>
  </div>
</template>

<style scoped>
/* Custom scrollbar for the filter tabs */
.overflow-x-auto::-webkit-scrollbar {
  height: 4px;
}

.overflow-x-auto::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 10px;
}

.overflow-x-auto::-webkit-scrollbar-thumb {
  background: #ddd;
  border-radius: 10px;
}

.overflow-x-auto::-webkit-scrollbar-thumb:hover {
  background: #ccc;
}

/* Animation for new notifications */
@keyframes pulse {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
  100% {
    transform: scale(1);
  }
}

.bg-blue-50 {
  animation: pulse 2s ease-in-out 1;
}
</style>
