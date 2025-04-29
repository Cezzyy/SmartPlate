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
  redirectIfAdmin?: boolean
  requiresRegistering?: boolean
  requiredRole?: 'admin' | 'lto officer'
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
    path: '/forgot-password',
    name: 'forgotPassword',
    component: () => import('../views/ForgotPasswordView.vue'),
    meta: { requiresAuth: false, redirectIfAuth: true },
  },
  {
    path: '/reset-password',
    name: 'resetPassword',
    component: () => import('../views/ResetPasswordView.vue'),
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
    meta: { requiresAuth: true, requiredRole: 'lto officer' },
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

    // Check authentication status - force a fresh check
    const isAuthenticated = userStore.checkAuth()

    // More direct role checking with additional debugging
    let currentRole = localStorage.getItem('userRole') || '';
    let normalizedRole = '';

    // Try to get role from user state if not found in localStorage
    if (!currentRole && userStore.currentUser) {
      // Add debug output to understand the structure
      console.log('User state in navigation guard:', userStore.currentUser);

      // Try to extract role from various possible locations
      const roleValue = userStore.currentUser.role;

      if (roleValue !== undefined && roleValue !== null) {
        currentRole = typeof roleValue === 'string' ? roleValue : String(roleValue);
      }
    }

    normalizedRole = currentRole.toLowerCase();

    const isAdmin = normalizedRole === 'admin';
    const isLtoOfficer = normalizedRole === 'lto officer';
    const isAdminOrLtoOfficer = isAdmin || isLtoOfficer;

    // Keep track of our route history for debugging
    const routeHistory = JSON.parse(localStorage.getItem('routeHistory') || '[]');
    routeHistory.push({ from: from.path, to: to.path, time: new Date().toISOString() });
    if (routeHistory.length > 10) routeHistory.shift(); // Keep only last 10 navigations
    localStorage.setItem('routeHistory', JSON.stringify(routeHistory));

    console.log('Navigation guard:', {
      path: to.path,
      from: from.path,
      isAuthenticated,
      currentRole,
      normalizedRole,
      isAdmin,
      isLtoOfficer,
      requiredRole: to.meta.requiredRole,
    })

    // Handle admin area special routing
    const isAdminArea = to.path === '/admin' || to.path === '/lto-portal';
    const isAdminLoginPage = to.path === '/admin-portal';

    // If navigating to admin area without proper authentication
    if (isAdminArea) {
      // Log current user role for debugging
      const currentRole = userStore.currentUser?.role || 'none';

      if (!isAuthenticated) {
        // Not authenticated at all - go to admin login
        console.log('Accessing admin area without authentication, redirecting to admin login')
        next({ name: 'adminLogin' })
        return
      } else if (to.path === '/admin' && !isAdmin) {
        // Authenticated but not as admin
        if (isLtoOfficer) {
          // LTO officers should go to their own portal
          console.log('LTO Officer tried to access admin page, redirecting to LTO portal')
          next({ name: 'lto' })
        } else {
          // Regular users can't access admin area at all
          console.log('Regular user attempted to access admin page, redirecting to admin login')
          next({ name: 'adminLogin' })
        }
        return
      } else if (to.path === '/lto-portal' && !isLtoOfficer && !isAdmin) {
        // Not an LTO officer or admin, redirect to admin login
        console.log('User without rights tried to access LTO portal, redirecting to admin login')
        next({ name: 'adminLogin' })
        return
      }
    }

    // If route requires authentication and user is not authenticated
    if (to.meta.requiresAuth && !isAuthenticated) {
      console.log('Route requires auth but user is not authenticated, redirecting to login')

      // For admin pages, redirect to admin login instead
      if (to.meta.requiredRole === 'admin' || to.meta.requiredRole === 'lto officer') {
        next({ name: 'adminLogin' })
      } else {
        next({ name: 'login', query: { redirect: to.fullPath } })
      }
      return
    }

    // If route requires specific role and user doesn't have it
    if (to.meta.requiredRole) {
      // Check for admin role requirement
      if (to.meta.requiredRole === 'admin' && !isAdmin) {
        // Allow LTO Officers to access admin routes (they have lower permissions)
        if (isLtoOfficer) {
          console.log('Redirecting LTO Officer from admin page to LTO portal')
          next({ name: 'lto' })
        } else {
          console.log('Route requires admin role but user is not an admin')
          next({ name: 'adminLogin' })
        }
        return
      }

      // Check for LTO Officer role requirement
      if (to.meta.requiredRole === 'lto officer' && !isLtoOfficer) {
        // Allow admins to access LTO Officer routes (they have higher permissions)
        if (isAdmin) {
          console.log('Allowing admin to access LTO Officer page')
          next()
        } else {
          console.log('Route requires LTO Officer role but user is not an LTO Officer')
          next({ name: 'adminLogin' })
        }
        return
      }
    }

    // Redirect from admin login if already authenticated as admin or LTO Officer
    if (to.meta.redirectIfAdmin && isAdminOrLtoOfficer) {
      // Route to the appropriate dashboard based on role
      const targetRoute = isLtoOfficer && !isAdmin ? 'lto' : 'admin'
      console.log(`Already authenticated as admin/LTO Officer, redirecting to ${targetRoute}`)
      next({ name: targetRoute })
      return
    }

    // If route requires registration state and user is not in registration process
    if (to.meta.requiresRegistering && !userStore.isRegistering) {
      console.log('Route requires registration state but user is not registering')
      next({ name: 'login' })
      return
    }

    // If user is authenticated and route has redirectIfAuth flag
    if (isAuthenticated && to.meta.redirectIfAuth) {
      console.log('User is authenticated and route has redirectIfAuth flag, redirecting to home')

      // If user is admin or LTO officer, redirect to appropriate dashboard
      if (isAdminOrLtoOfficer && localStorage.getItem('loginType') === 'admin') {
        console.log('User is admin/LTO officer, redirecting to appropriate dashboard')
        const targetRoute = isLtoOfficer && !isAdmin ? 'lto' : 'admin'
        next({ name: targetRoute })
      } else {
        next({ name: 'home' })
      }
      return
    }

    next()
  },
)

export default router
