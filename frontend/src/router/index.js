import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '@/stores/user'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'LandingView',
      component: () => import('../views/LandingView.vue'),
      meta: { requiresAuth: false },
    },
    {
      path: '/about',
      name: 'about',
      component: () => import('../views/AboutView.vue'),
      meta: { requiresAuth: false },
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('../views/LoginView.vue'),
      meta: { requiresAuth: false, redirectIfAuth: true },
    },
    {
      path: '/home',
      name: 'home',
      component: () => import('../views/HomeView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/register',
      name: 'register',
      component: () => import('../views/RegistrationView.vue'),
      meta: { requiresAuth: false, requiresRegistering: true },
    },
    {
      path: '/profile',
      name: 'profile',
      component: () => import('../views/ProfileView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/account-settings',
      name: 'accountSettings',
      component: () => import('../views/AccountSettingsView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/notifications',
      name: 'notifications',
      component: () => import('../views/NotificationView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/vehicle-registration',
      name: 'vehicleRegistration',
      component: () => import('../views/VehicleRegistrationView.vue'),
      meta: { requiresAuth: true, requiresRegistering: false },
    },
    {
      path: '/admin-portal',
      name: 'adminLogin',
      component: () => import('../views/AdminLoginView.vue'),
      meta: { requiresAuth: false, redirectIfAdmin: true },
    },
    {
      path: '/admin',
      name: 'admin',
      component: () => import('../views/AdminView.vue'),
      meta: { requiresAuth: true, requiredRole: 'admin' },
    },
    {
      path: '/test',
      name: 'test',
      component: () => import('../views/testDisplay.vue'),
      meta: { requiresAuth: false, redirectIfAdmin: false },
    },
    {
      path: '/crud',
      name: 'crud',
      component: () => import('../views/testCrud.vue'),
      meta: { requiresAuth: false, redirectIfAdmin: false },
    },
    {
      path: '/testRegister',
      name: 'testRegister',
      component: () => import('../views/TestRegistrationView.vue'),
      meta: { requiresAuth: false, redirectIfAdmin: false },
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'NotFound',
      component: () => import('../views/NotFoundView.vue'),
      meta: { requiresAuth: false },
    },
  ],
})

// Navigation guard
router.beforeEach((to, from, next) => {
  const userStore = useUserStore()

  // Check authentication status
  const isAuthenticated = userStore.isAuthenticated || userStore.checkAuth()
  const userRole = userStore.userRole
  const isRegistering = userStore.isRegistering

  // If route requires authentication and user is not authenticated
  if (to.meta.requiresAuth && !isAuthenticated) {
    next({ name: 'login', query: { redirect: to.fullPath } })
    return
  }

  // If route requires specific role and user doesn't have it
  if (to.meta.requiredRole && to.meta.requiredRole !== userRole) {
    next({ name: 'adminLogin' })
    return
  }

  // Redirect from admin login if already authenticated as admin
  if (to.meta.redirectIfAdmin && userRole === 'admin') {
    next({ name: 'admin' })
    return
  }

  // If route requires registration state and user is not in registration process
  if (to.meta.requiresRegistering && !isRegistering) {
    next({ name: 'login' })
    return
  }

  // If user is authenticated and route has redirectIfAuth flag
  if (isAuthenticated && to.meta.redirectIfAuth) {
    next({ name: 'home' })
    return
  }

  next()
})

export default router
