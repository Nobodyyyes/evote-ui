import { createRouter, createWebHistory } from 'vue-router'
import type { Role } from '../types'
import { authState, hasRole } from '../store/auth'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', name: 'home', component: () => import('../views/HomeView.vue') },
    { path: '/login', name: 'login', component: () => import('../views/LoginView.vue') },
    { path: '/register', name: 'register', component: () => import('../views/RegisterView.vue') },
    { path: '/dashboard', name: 'dashboard', component: () => import('../views/DashboardView.vue'), meta: { requiresAuth: true } },
    { path: '/elections', name: 'elections', component: () => import('../views/ElectionsView.vue'), meta: { requiresAuth: true } },
    { path: '/elections/:id', name: 'election-details', component: () => import('../views/ElectionDetailsView.vue'), meta: { requiresAuth: true } },
    { path: '/elections/:id/vote', name: 'vote', component: () => import('../views/VoteView.vue'), meta: { requiresAuth: true, roles: ['USER', 'ADMIN'] satisfies Role[] } },
    { path: '/elections/:id/results', name: 'results', component: () => import('../views/ResultsView.vue'), meta: { requiresAuth: true } },
    { path: '/profile', name: 'profile', component: () => import('../views/ProfileView.vue'), meta: { requiresAuth: true } },
    { path: '/admin', name: 'admin-dashboard', component: () => import('../views/admin/AdminDashboardView.vue'), meta: { requiresAuth: true, roles: ['ADMIN'] satisfies Role[] } },
    { path: '/admin/elections', name: 'admin-elections', component: () => import('../views/admin/AdminElectionsView.vue'), meta: { requiresAuth: true, roles: ['ADMIN'] satisfies Role[] } },
    { path: '/admin/elections/create', name: 'election-create', component: () => import('../views/admin/ElectionFormView.vue'), meta: { requiresAuth: true, roles: ['ADMIN'] satisfies Role[] } },
    { path: '/admin/users', name: 'admin-users', component: () => import('../views/admin/UsersView.vue'), meta: { requiresAuth: true, roles: ['ADMIN'] satisfies Role[] } },
    { path: '/admin/audit', name: 'admin-audit', component: () => import('../views/admin/AuditView.vue'), meta: { requiresAuth: true, roles: ['ADMIN', 'AUDITOR'] satisfies Role[] } },
    { path: '/admin/integrity', name: 'integrity', component: () => import('../views/admin/IntegrityView.vue'), meta: { requiresAuth: true, roles: ['ADMIN', 'AUDITOR'] satisfies Role[] } },
    { path: '/admin/blockchain', name: 'blockchain', component: () => import('../views/admin/BlockchainView.vue'), meta: { requiresAuth: true, roles: ['ADMIN', 'AUDITOR'] satisfies Role[] } },
    { path: '/access-denied', name: 'access-denied', component: () => import('../views/AccessDeniedView.vue') },
    { path: '/:pathMatch(.*)*', name: 'not-found', component: () => import('../views/NotFoundView.vue') }
  ]
})

router.beforeEach((to) => {
  const requiresAuth = Boolean(to.meta.requiresAuth)
  const roles = to.meta.roles as Role[] | undefined

  if (requiresAuth && !authState.user) {
    return { name: 'login' }
  }

  if (requiresAuth && !hasRole(roles)) {
    return { name: 'access-denied' }
  }

  return true
})

export default router
