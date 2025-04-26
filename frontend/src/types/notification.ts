export interface Notification {
  id: number
  title: string
  message: string
  time: string
  date: string
  type: 'plate' | 'vehicle' | 'registration' | 'system' | 'payment'
  read: boolean
  priority: 'high' | 'medium' | 'low'
}

export interface ToastNotification {
  id: string
  title: string
  message: string
  type: 'success' | 'error' | 'warning' | 'info'
  duration?: number
  autoClose?: boolean
  createdAt: string
}

export interface NotificationState {
  notifications: Notification[]
  toastNotifications: ToastNotification[]
  loading: boolean
  error: string | null
  lastUpdated: string | null
  userNotifications: Record<string, Notification[]> // Map of userId -> array of notifications
}
