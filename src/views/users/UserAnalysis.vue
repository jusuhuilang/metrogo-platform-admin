<template>
  <div class="page-container">
    <h2>用户分析</h2>
    <a-row :gutter="16">
      <a-col :span="8">
        <a-card title="总用户数">
          <div class="stat-number">{{ overview.totalUsers }}</div>
        </a-card>
      </a-col>
      <a-col :span="8">
        <a-card title="今日新增">
          <div class="stat-number">{{ overview.todayNewUsers }}</div>
        </a-card>
      </a-col>
      <a-col :span="8">
        <a-card title="月活用户(近30天)">
          <div class="stat-number">{{ overview.monthlyActiveUsers }}</div>
        </a-card>
      </a-col>
    </a-row>
    <a-row :gutter="16" style="margin-top: 24px">
      <a-col :span="12">
        <a-card title="用户注册趋势(近7天)">
          <div ref="trendChart" style="height: 400px"></div>
        </a-card>
      </a-col>
      <a-col :span="12">
        <a-card title="用户活跃度(近7天)">
          <div ref="activityChart" style="height: 400px"></div>
        </a-card>
      </a-col>
    </a-row>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import * as echarts from 'echarts'
import api from '@/api/request'

const overview = ref({ totalUsers: 0, todayNewUsers: 0, monthlyActiveUsers: 0 })
const trendChart = ref(null)
const activityChart = ref(null)

const fetchOverview = async () => {
  try {
    const res = await api.get('/platform/user-stats/overview')
    if (res.data.code === 200) {
      overview.value = res.data.data
    }
  } catch (error) {
    console.error('获取概览失败:', error)
  }
}

const drawTrendChart = async () => {
  try {
    const res = await api.get('/platform/user-stats/trend')
    if (res.data.code === 200 && res.data.data.length) {
      const data = res.data.data
      const chart = echarts.init(trendChart.value)
      chart.setOption({
        tooltip: { trigger: 'axis' },
        xAxis: { type: 'category', data: data.map(item => item.date) },
        yAxis: { type: 'value' },
        series: [{ type: 'line', data: data.map(item => item.count), smooth: true, areaStyle: {} }]
      })
    } else {
      // 无数据时显示提示
      const chart = echarts.init(trendChart.value)
      chart.setOption({
        title: { show: true, text: '暂无数据', left: 'center', top: 'center' }
      })
    }
  } catch (error) {
    console.error('绘制注册趋势失败:', error)
  }
}

const drawActivityChart = async () => {
  try {
    const res = await api.get('/platform/user-stats/activity')
    if (res.data.code === 200 && res.data.data.length) {
      const data = res.data.data
      const chart = echarts.init(activityChart.value)
      chart.setOption({
        tooltip: { trigger: 'axis' },
        xAxis: { type: 'category', data: data.map(item => item.date) },
        yAxis: { type: 'value' },
        series: [{ type: 'bar', data: data.map(item => item.active_users) }]
      })
    } else {
      const chart = echarts.init(activityChart.value)
      chart.setOption({
        title: { show: true, text: '暂无数据', left: 'center', top: 'center' }
      })
    }
  } catch (error) {
    console.error('绘制活跃度失败:', error)
  }
}

onMounted(() => {
  fetchOverview()
  drawTrendChart()
  drawActivityChart()
})
</script>

<style scoped>
.page-container { padding: 24px; }
.stat-number { font-size: 32px; font-weight: bold; color: #1890ff; text-align: center; }
</style>