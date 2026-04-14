<template>
  <div>
    <h2>平台数据总览</h2>
    <a-row :gutter="16">
      <a-col :span="6">
        <a-card>
          <a-statistic title="入驻商户" :value="stats.merchants" />
        </a-card>
      </a-col>
      <a-col :span="6">
        <a-card>
          <a-statistic title="月活用户" :value="stats.mau" />
        </a-card>
      </a-col>
      <a-col :span="6">
        <a-card>
          <a-statistic title="今日订单" :value="stats.todayOrders" />
        </a-card>
      </a-col>
      <a-col :span="6">
        <a-card>
          <a-statistic title="平台收入(月)" :value="stats.monthRevenue" prefix="¥" />
        </a-card>
      </a-col>
    </a-row>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import request from '../api/request'

const stats = ref({
  merchants: 0,
  mau: 0,
  todayOrders: 0,
  monthRevenue: 0
})

onMounted(async () => {
  try {
    const res = await request.get('/platform/dashboard/stats')
    stats.value = res
  } catch (err) {
    console.error(err)
  }
})
</script>