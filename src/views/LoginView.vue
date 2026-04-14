<template>
  <div class="login-container">
    <a-card title="MetroGo 运营平台登录" class="login-card">
      <a-form :model="form" @finish="handleLogin">
        <a-form-item label="用户名" name="username" :rules="[{ required: true, message: '请输入用户名' }]">
          <a-input v-model:value="form.username" placeholder="admin" />
        </a-form-item>
        <a-form-item label="密码" name="password" :rules="[{ required: true, message: '请输入密码' }]">
          <a-input-password v-model:value="form.password" />
        </a-form-item>
        <a-form-item>
          <a-button type="primary" html-type="submit" :loading="loading" block>登录</a-button>
        </a-form-item>
      </a-form>
    </a-card>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { message } from 'ant-design-vue'
import { useUserStore } from '../stores/user'
import request from '../api/request'

const router = useRouter()
const userStore = useUserStore()
const form = ref({ username: '', password: '' })
const loading = ref(false)

const handleLogin = async () => {
  console.log('登录按钮被点击，用户名：', form.value.username);
  loading.value = true;
  try {
    const res = await request.post('/auth/platform/login', form.value);
    console.log('登录响应：', res);
    
    if (res.token && res.admin) {
      const { token, admin } = res;
      if (admin.role_name !== 'super_admin' && admin.role_name !== 'platform_admin') {
        message.error('无平台管理权限');
        return;
      }
      userStore.setToken(token);
      userStore.setUser(admin);
      message.success('登录成功');
      router.push('/');
    } else {
      message.error(res.error || '登录失败');
    }
  } catch (err) {
    console.error('登录请求失败：', err);
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: #f0f2f5;
}
.login-card {
  width: 400px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}
</style>