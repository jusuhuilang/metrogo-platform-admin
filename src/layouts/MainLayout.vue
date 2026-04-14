<template>
  <a-layout style="min-height: 100vh">
    <a-layout-sider collapsible v-model:collapsed="collapsed">
      <div class="logo">MetroGo 运营平台</div>
      <a-menu theme="dark" mode="inline" :selectedKeys="selectedKeys" @click="handleMenuClick">
        <a-menu-item key="/">
          <dashboard-outlined />
          <span>仪表盘</span>
        </a-menu-item>
        <a-sub-menu key="merchant-sub">
          <template #title>
            <shop-outlined />
            <span>商户管理</span>
          </template>
          <a-menu-item key="/merchants/audit">入驻审核</a-menu-item>
        </a-sub-menu>
        <a-menu-item key="/users/analysis">
          <user-outlined />
          <span>用户分析</span>
        </a-menu-item>
        <a-menu-item key="/agents/config">
          <robot-outlined />
          <span>智能体配置</span>
        </a-menu-item>
        <a-menu-item key="/operations/activities">
          <gift-outlined />
          <span>运营活动</span>
        </a-menu-item>
        <a-sub-menu key="system-sub">
          <template #title>
            <setting-outlined />
            <span>系统管理</span>
          </template>
          <a-menu-item key="/system/admins">管理员</a-menu-item>
          <a-menu-item key="/system/logs">操作日志</a-menu-item>
          <a-menu-item key="/system/config">系统参数</a-menu-item>
        </a-sub-menu>
        <a-menu-item key="/finance/settlement">
          <dollar-outlined />
          <span>财务结算</span>
        </a-menu-item>
      </a-menu>
    </a-layout-sider>
    <a-layout>
      <a-layout-header style="background: #fff; padding: 0 20px; display: flex; justify-content: space-between">
        <span>欢迎，{{ userStore.user?.name || '管理员' }}</span>
        <a-button type="link" @click="logout">退出登录</a-button>
      </a-layout-header>
      <a-layout-content style="margin: 16px">
        <router-view />
      </a-layout-content>
    </a-layout>
  </a-layout>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useUserStore } from '../stores/user'
import {
  DashboardOutlined,
  ShopOutlined,
  UserOutlined,
  RobotOutlined,
  GiftOutlined,
  SettingOutlined,
  DollarOutlined
} from '@ant-design/icons-vue'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()
const collapsed = ref(false)

const selectedKeys = computed(() => [route.path])

const handleMenuClick = ({ key }) => {
  router.push(key)
}

const logout = () => {
  localStorage.removeItem('platform_token')
  userStore.clearUser()
  router.push('/login')
}
</script>

<style scoped>
.logo {
  height: 32px;
  margin: 16px;
  color: white;
  text-align: center;
  font-weight: bold;
}
</style>