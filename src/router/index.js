import { createRouter, createWebHistory } from 'vue-router'
import LoginView from '../views/LoginView.vue'
import MainLayout from '../layouts/MainLayout.vue'
import DashboardView from '../views/DashboardView.vue'

const routes = [
  { path: '/login', component: LoginView, meta: { requiresAuth: false } },
  {
    path: '/',
    component: MainLayout,
    meta: { requiresAuth: true },
    children: [
      { path: '', name: 'Dashboard', component: DashboardView },
      { path: 'merchants/audit', name: 'MerchantAudit', component: () => import('../views/merchants/AuditList.vue') },
      { path: 'users/analysis', name: 'UserAnalysis', component: () => import('../views/users/UserAnalysis.vue') },
      { path: 'agents/config', name: 'AgentConfig', component: () => import('../views/agents/AgentConfig.vue') },
      { path: 'operations/activities', name: 'Activities', component: () => import('../views/operations/ActivityManage.vue') },
      { path: 'system/admins', name: 'AdminManage', component: () => import('../views/system/AdminManage.vue') },
      { path: 'system/logs', name: 'OperationLogs', component: () => import('../views/system/Logs.vue') },
      { path: 'system/config', name: 'SystemConfig', component: () => import('../views/system/Config.vue') },
      { path: 'finance/settlement', name: 'Settlement', component: () => import('../views/finance/Settlement.vue') },
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from) => {
  // 统一使用 platform_token（与 axios 拦截器一致）
  const token = localStorage.getItem('platform_token')
  if (to.meta.requiresAuth && !token) {
    return '/login'
  }
  if (to.path === '/login' && token) {
    // 跳转到根路径（Dashboard）
    return '/'
  }
  return true
})

export default router