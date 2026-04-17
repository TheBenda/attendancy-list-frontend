import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import { userAuthStore } from '@/stores/userAuth'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('../views/LoginView.vue'),
    },
    {
      path: '/about',
      name: 'about',
      // route level code-splitting
      // this generates a separate chunk (About.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import('../views/AboutView.vue'),
      meta: {
        requiresAuth: true,
        roles: [
          'Admin',
          'Team',
        ] as import('@/stores/api/apiclient').components['schemas']['UserRole'][],
      },
    },
    {
      path: '/unauthorized',
      name: 'unauthorized',
      component: () => import('../views/UnauthorizedView.vue'),
    },
    {
      path: '/users/by-role',
      name: 'users-by-role',
      component: () => import('../views/users/UsersByRoles.vue'),
      meta: {
        requiresAuth: true,
        roles: [
          'Admin',
          'CoAdmin',
        ] as import('@/stores/api/apiclient').components['schemas']['UserRole'][],
      },
    },
    {
      path: '/users/create',
      name: 'user-create',
      component: () => import('../views/users/CreateUser.vue'),
      meta: {
        requiresAuth: true,
        roles: [
          'Admin',
        ] as import('@/stores/api/apiclient').components['schemas']['UserRole'][],
      },
    },
    {
      path: '/groups',
      name: 'groups',
      component: () => import('../views/groups/GroupManagement.vue'),
      meta: {
        requiresAuth: true,
        roles: [
          'Admin',
        ] as import('@/stores/api/apiclient').components['schemas']['UserRole'][],
      },
    },
    {
      path: '/children',
      name: 'children',
      component: () => import('../views/children/ChildrenManagement.vue'),
      meta: {
        requiresAuth: true,
        roles: [
          'Admin',
          'CoAdmin',
          'Team'
        ] as import('@/stores/api/apiclient').components['schemas']['UserRole'][],
      },
    },
    {
      path: '/groups/allowed-groupnames',
      name: 'allowed-groupnames',
      component: () => import('../views/groups/AllowedGroupnamesManagement.vue'),
      meta: {
        requiresAuth: true,
        roles: [
          'Admin',
        ] as import('@/stores/api/apiclient').components['schemas']['UserRole'][],
      },
    },
  ],
})

router.beforeEach((to, from, next) => {
  const authStore = userAuthStore()
  const requiresAuth = to.meta.requiresAuth
  const allowedRoles = to.meta.roles as
    | import('@/stores/api/apiclient').components['schemas']['UserRole'][]
    | undefined

  if (requiresAuth && !authStore.isAuthenticated) {
    // Redirect to login if page requires auth and user is not authenticated
    next({ name: 'login', query: { redirect: to.fullPath } })
  } else if (requiresAuth && allowedRoles && !authStore.hasAnyRole(allowedRoles)) {
    // Redirect to unauthorized if user doesn't have required roles
    next({ name: 'unauthorized' })
  } else {
    next()
  }
})

export default router
