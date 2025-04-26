import { defineStore } from 'pinia'
import type { Notification, NotificationState, ToastNotification } from '@/types/notification'
import { v4 as uuidv4 } from 'uuid'

// Mock notification data
const mockNotificationsData: Notification[] = [
  {
    id: 1,
    title: 'New plate available',
    message:
      'Your new plate is ready for pickup at the LTO office. Please bring your ID and receipt.',
    time: '2 hours ago',
    date: '2025-03-10',
    type: 'plate',
    read: false,
    priority: 'high',
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
    priority: 'medium',
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
    priority: 'low',
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
    priority: 'medium',
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
    priority: 'low',
  },
]

export const useNotificationStore = defineStore('notification', {
  persist: true,
  state: (): NotificationState => ({
    notifications: mockNotificationsData,
    toastNotifications: [],
    loading: false,
    error: null,
    lastUpdated: new Date().toISOString(),
    userNotifications: {}, // Map of userId -> array of notifications
  }),

  getters: {
    // Get all notifications
    allNotifications: (state) => state.notifications,

    // Get unread notifications
    unreadNotifications: (state) =>
      state.notifications.filter((notification) => !notification.read),

    // Get notification count
    notificationCount: (state) => state.notifications.length,

    // Get unread notification count
    unreadCount: (state) => state.notifications.filter((notification) => !notification.read).length,

    // Get notifications by type
    getNotificationsByType: (state) => (type: Notification['type']) => {
      return state.notifications.filter((notification) => notification.type === type)
    },

    // Get notifications by type count
    getNotificationsByTypeCount: (state) => (type: Notification['type']) => {
      return state.notifications.filter((notification) => notification.type === type).length
    },

    // Get notifications by priority
    getNotificationsByPriority: (state) => (priority: Notification['priority']) => {
      return state.notifications.filter((notification) => notification.priority === priority)
    },

    // Get filtered notifications
    getFilteredNotifications: (state) => (filter: string) => {
      if (filter === 'all') {
        return state.notifications
      } else if (filter === 'unread') {
        return state.notifications.filter((notification) => !notification.read)
      } else {
        return state.notifications.filter((notification) => notification.type === filter)
      }
    },

    // Get toast notifications
    getToastNotifications: (state) => state.toastNotifications,

    // Get notifications for a specific user
    getUserNotifications: (state) => (userId: string) => {
      return state.userNotifications[userId] || []
    },

    // Get unread notifications for a specific user
    getUnreadUserNotifications: (state) => (userId: string) => {
      return (state.userNotifications[userId] || []).filter((notification) => !notification.read)
    },
  },

  actions: {
    // Fetch notifications from server (mock)
    async fetchNotifications(): Promise<void> {
      this.loading = true
      this.error = null

      try {
        // In a real app, this would be an API call
        // Simulate API delay
        await new Promise((resolve) => setTimeout(resolve, 1000))

        // Update the lastUpdated timestamp
        this.lastUpdated = new Date().toISOString()
      } catch (error) {
        this.error = (error as Error).message
        console.error('Error fetching notifications:', error)
      } finally {
        this.loading = false
      }
    },

    // Mark a notification as read
    markAsRead(notificationId: number): void {
      const notification = this.notifications.find((n) => n.id === notificationId)
      if (notification) {
        notification.read = true
        this.lastUpdated = new Date().toISOString()
      }

      // Also mark as read in user notifications
      Object.keys(this.userNotifications).forEach((userId) => {
        const userNotification = this.userNotifications[userId].find((n) => n.id === notificationId)
        if (userNotification) {
          userNotification.read = true
        }
      })
    },

    // Mark all notifications as read
    markAllAsRead(): void {
      this.notifications.forEach((notification) => {
        notification.read = true
      })

      // Mark all user notifications as read
      Object.keys(this.userNotifications).forEach((userId) => {
        this.userNotifications[userId].forEach((notification) => {
          notification.read = true
        })
      })

      this.lastUpdated = new Date().toISOString()
    },

    // Delete a notification
    deleteNotification(notificationId: number): void {
      const index = this.notifications.findIndex((n) => n.id === notificationId)
      if (index !== -1) {
        this.notifications.splice(index, 1)
        this.lastUpdated = new Date().toISOString()
      }
    },

    // Add a new notification
    addNotification(notification: Omit<Notification, 'id'>): void {
      // Generate a new ID
      const newId =
        this.notifications.length > 0 ? Math.max(...this.notifications.map((n) => n.id)) + 1 : 1

      this.notifications.unshift({
        ...notification,
        id: newId,
      })
      this.lastUpdated = new Date().toISOString()
    },

    // Search notifications
    searchNotifications(query: string): Notification[] {
      const searchTerm = query.toLowerCase()
      return this.notifications.filter(
        (notification) =>
          notification.title.toLowerCase().includes(searchTerm) ||
          notification.message.toLowerCase().includes(searchTerm),
      )
    },

    // Reset notification state
    resetState(): void {
      this.notifications = []
      this.toastNotifications = []
      this.loading = false
      this.error = null
      this.lastUpdated = new Date().toISOString()
    },

    // Toast notification methods

    // Show a toast notification
    showToast(toast: Omit<ToastNotification, 'id' | 'createdAt'>): string {
      const id = uuidv4()

      this.toastNotifications.unshift({
        ...toast,
        id,
        createdAt: new Date().toISOString(),
        duration: toast.duration || 5000,
        autoClose: toast.autoClose !== false,
      })

      // Limit the number of toast notifications (keep most recent)
      if (this.toastNotifications.length > 10) {
        this.toastNotifications = this.toastNotifications.slice(0, 10)
      }

      return id
    },

    // Add a notification for a specific user
    addNotificationForUser(userId: string, notification: Omit<Notification, 'id'>): void {
      // Generate a new ID
      const newId =
        this.notifications.length > 0 ? Math.max(...this.notifications.map((n) => n.id)) + 1 : 1

      const newNotification = {
        ...notification,
        id: newId,
      }

      // Initialize user's notification array if it doesn't exist
      if (!this.userNotifications[userId]) {
        this.userNotifications[userId] = []
      }

      // Add to user's notifications
      this.userNotifications[userId].unshift(newNotification)

      // Also add to global notifications if it's the current user
      this.notifications.unshift(newNotification)

      this.lastUpdated = new Date().toISOString()
    },

    // For vehicle registration process

    // Vehicle inspection notification - Enhanced version
    showVehicleInspectionNotification(
      status: 'approved' | 'rejected',
      vehicleDetails: { plateNumber?: string; make: string; model: string; userId?: string },
    ): string {
      const title =
        status === 'approved' ? 'Vehicle Inspection Approved' : 'Vehicle Inspection Rejected'

      const message =
        status === 'approved'
          ? `Your ${vehicleDetails.make} ${vehicleDetails.model} has passed the inspection.`
          : `Your ${vehicleDetails.make} ${vehicleDetails.model} did not pass the inspection. Please check the details and try again.`

      const toastType: ToastNotification['type'] = status === 'approved' ? 'success' : 'error'
      const toastId = this.showToast({
        title,
        message,
        type: toastType,
      })

      const notificationData = {
        title,
        message,
        time: 'Just now',
        date: new Date().toISOString().split('T')[0],
        type: 'vehicle' as Notification['type'],
        read: false,
        priority:
          status === 'approved'
            ? ('medium' as Notification['priority'])
            : ('high' as Notification['priority']),
      }

      // Add to regular notifications for current user
      this.addNotification(notificationData)

      // If userId is provided, add notification for that user too
      if (vehicleDetails.userId) {
        this.addNotificationForUser(vehicleDetails.userId, notificationData)
      }

      return toastId
    },

    // Payment process notification - Enhanced version
    showPaymentNotification(
      status: 'success' | 'failed',
      paymentDetails: { amount: number; reference: string; userId?: string },
    ): string {
      const title = status === 'success' ? 'Payment Successful' : 'Payment Failed'

      const message =
        status === 'success'
          ? `Your payment of ₱${paymentDetails.amount.toFixed(2)} with reference ${paymentDetails.reference} was successful.`
          : `Your payment of ₱${paymentDetails.amount.toFixed(2)} failed. Please try again or use a different payment method.`

      const toastType: ToastNotification['type'] = status === 'success' ? 'success' : 'error'
      const toastId = this.showToast({
        title,
        message,
        type: toastType,
      })

      const notificationData = {
        title,
        message,
        time: 'Just now',
        date: new Date().toISOString().split('T')[0],
        type: 'payment' as Notification['type'],
        read: false,
        priority:
          status === 'success'
            ? ('medium' as Notification['priority'])
            : ('high' as Notification['priority']),
      }

      // Add to regular notifications for current user
      this.addNotification(notificationData)

      // If userId is provided, add notification for that user too
      if (paymentDetails.userId) {
        this.addNotificationForUser(paymentDetails.userId, notificationData)
      }

      return toastId
    },

    // Plate issuance notification - Enhanced version
    showPlateIssuanceNotification(
      status: 'issued' | 'pending' | 'rejected',
      plateDetails: { plateNumber: string; vehicle: string; userId?: string },
    ): string {
      let title = ''
      let message = ''
      let toastType: ToastNotification['type'] = 'info'
      let priority: Notification['priority'] = 'medium'

      switch (status) {
        case 'issued':
          title = 'License Plate Issued'
          message = `Your license plate ${plateDetails.plateNumber} for ${plateDetails.vehicle} has been issued and is ready for pickup.`
          toastType = 'success'
          priority = 'high'
          break
        case 'pending':
          title = 'License Plate Pending'
          message = `Your license plate ${plateDetails.plateNumber} for ${plateDetails.vehicle} is being processed.`
          toastType = 'info'
          priority = 'medium'
          break
        case 'rejected':
          title = 'License Plate Application Rejected'
          message = `Your license plate application for ${plateDetails.vehicle} has been rejected. Please contact LTO for more details.`
          toastType = 'error'
          priority = 'high'
          break
      }

      const toastId = this.showToast({
        title,
        message,
        type: toastType,
      })

      const notificationData = {
        title,
        message,
        time: 'Just now',
        date: new Date().toISOString().split('T')[0],
        type: 'plate' as Notification['type'],
        read: false,
        priority,
      }

      // Add to regular notifications for current user
      this.addNotification(notificationData)

      // If userId is provided, add notification for that user too
      if (plateDetails.userId) {
        this.addNotificationForUser(plateDetails.userId, notificationData)
      }

      return toastId
    },

    // Remove a toast notification
    removeToastNotification(id: string): void {
      const index = this.toastNotifications.findIndex((toast) => toast.id === id)
      if (index !== -1) {
        this.toastNotifications.splice(index, 1)
      }
    },

    // Clear all toast notifications
    clearAllToastNotifications(): void {
      this.toastNotifications = []
    },

    // Get notifications for a specific user
    getNotificationsForUser(userId: string): Notification[] {
      return this.userNotifications[userId] || []
    },

    // Clear all notifications
    clearAllNotifications() {
      this.notifications = []
      this.userNotifications = {}
      this.lastUpdated = new Date().toISOString()
    },

    // Clear notifications for a specific user
    clearUserNotifications(userId: string) {
      if (this.userNotifications[userId]) {
        // Remove this user's notifications from global notifications
        const userNotificationIds = this.userNotifications[userId].map((n) => n.id)
        this.notifications = this.notifications.filter((n) => !userNotificationIds.includes(n.id))
        // Clear the user's notifications
        this.userNotifications[userId] = []
        this.lastUpdated = new Date().toISOString()
      }
    },
  },
})
