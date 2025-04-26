import {
  createRouter,
  createWebHistory,
  RouteRecordRaw,
  NavigationGuardNext,
  RouteLocationNormalized,
} from 'vue-router'
import { useUserStore } from '@/stores/user'

interface RouteMeta {
  requiresAuth: boolean
  redirectIfAuth?: boolean
  requiresRegistering?: boolean
  requiredRole?: 'admin' | 'LTO Officer'
}

const routes: Array<RouteRecordRaw & { meta: RouteMeta }> = [
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
    path: '/lto-portal',
    name: 'lto',
    component: () => import('../views/LTOView.vue'),
    meta: { requiresAuth: true, requiredRole: 'LTO Officer' },
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('../views/NotFoundView.vue'),
    meta: { requiresAuth: false },
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

// Navigation guard
router.beforeEach(
  (to: RouteLocationNormalized, from: RouteLocationNormalized, next: NavigationGuardNext) => {
    const userStore = useUserStore()

    // Check authentication status
    const isAuthenticated = userStore.isAuthenticated || userStore.checkAuth()
    const userRole = userStore.userRole
    const isRegistering = userStore.isRegistering

    console.log('Navigation guard:', {
      path: to.path,
      isAuthenticated,
      userRole,
      requiredRole: to.meta.requiredRole,
    })

    // If route requires authentication and user is not authenticated
    if (to.meta.requiresAuth && !isAuthenticated) {
      console.log('Route requires auth but user is not authenticated, redirecting to login')
      next({ name: 'login', query: { redirect: to.fullPath } })
      return
    }

    // If route requires specific role and user doesn't have it
    if (to.meta.requiredRole && to.meta.requiredRole !== userRole) {
      console.log(`Route requires role ${to.meta.requiredRole} but user has role ${userRole}`)

      // Special handling for LTO Officer and admin routes
      if (to.meta.requiredRole === 'LTO Officer' && userRole === 'admin') {
        // Allow admins to access LTO Officer pages
        console.log('Allowing admin to access LTO Officer page')
        next()
        return
      } else if (to.meta.requiredRole === 'admin' && userRole === 'LTO Officer') {
        // Redirect LTO Officers trying to access admin pages to LTO portal
        console.log('Redirecting LTO Officer to LTO portal')
        next({ name: 'lto' })
        return
      }

      // Otherwise redirect to admin login
      next({ name: 'adminLogin' })
      return
    }

    // Redirect from admin login if already authenticated as admin
    if (to.meta.redirectIfAdmin && (userRole === 'admin' || userRole === 'LTO Officer')) {
      // Route to the appropriate dashboard based on role
      const targetRoute = userRole === 'LTO Officer' ? 'lto' : 'admin'
      console.log(`Already authenticated as ${userRole}, redirecting to ${targetRoute}`)
      next({ name: targetRoute })
      return
    }

    // If route requires registration state and user is not in registration process
    if (to.meta.requiresRegistering && !isRegistering) {
      console.log('Route requires registration state but user is not registering')
      next({ name: 'login' })
      return
    }

    // If user is authenticated and route has redirectIfAuth flag
    if (isAuthenticated && to.meta.redirectIfAuth) {
      console.log('User is authenticated and route has redirectIfAuth flag, redirecting to home')
      next({ name: 'home' })
      return
    }

    next()
  },
)

export default router
