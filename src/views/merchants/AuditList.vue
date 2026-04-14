<template>
  <div>
    <h2>商户入驻审核</h2>
    <a-tabs v-model:activeKey="activeTab">
      <a-tab-pane key="pending" tab="待审核" />
      <a-tab-pane key="approved" tab="已通过" />
      <a-tab-pane key="rejected" tab="已拒绝" />
    </a-tabs>
    <a-table :columns="columns" :data-source="list" :loading="loading" row-key="id">
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'action' && record.status === 'pending'">
          <a-space>
            <a-button type="primary" size="small" @click="handleReview(record, 'approved')">通过</a-button>
            <a-button danger size="small" @click="handleReview(record, 'rejected')">拒绝</a-button>
          </a-space>
        </template>
        <template v-else-if="column.key === 'license'">
          <a-button type="link" @click="previewImage(record.business_license)">查看</a-button>
        </template>
      </template>
    </a-table>
    <a-modal v-model:visible="reviewModal.visible" title="审核意见" @ok="submitReview">
      <a-textarea v-model:value="reviewModal.comment" placeholder="请输入拒绝原因或备注" />
    </a-modal>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { getAuditList, reviewAudit } from '../../api/merchants'
import { message } from 'ant-design-vue'

const activeTab = ref('pending')
const list = ref([])
const loading = ref(false)
const reviewModal = ref({ visible: false, record: null, status: '', comment: '' })

const columns = [
  { title: '店铺名称', dataIndex: 'shop_name', key: 'shop_name' },
  { title: '联系人', dataIndex: 'contact_name' },
  { title: '联系电话', dataIndex: 'contact_phone' },
  { title: '营业执照', key: 'license' },
  { title: '位置', dataIndex: 'location_geo' },
  { title: '申请时间', dataIndex: 'created_at' },
  { title: '操作', key: 'action' }
]

const fetchData = async () => {
  loading.value = true
  try {
    const res = await getAuditList({ status: activeTab.value })
    list.value = res.data
  } finally {
    loading.value = false
  }
}

watch(activeTab, () => fetchData(), { immediate: true })

const handleReview = (record, status) => {
  if (status === 'rejected') {
    reviewModal.value = { visible: true, record, status, comment: '' }
  } else {
    doReview(record, status, '')
  }
}

const doReview = async (record, status, comment) => {
  try {
    await reviewAudit(record.id, { status, review_comment: comment })
    message.success('操作成功')
    fetchData()
  } catch (err) {
    // error handled
  }
}

const submitReview = () => {
  doReview(reviewModal.value.record, reviewModal.value.status, reviewModal.value.comment)
  reviewModal.value.visible = false
}

const previewImage = (url) => {
  window.open(url, '_blank')
}
</script>