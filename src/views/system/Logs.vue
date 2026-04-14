<template>
  <a-card title="操作日志">
    <a-form layout="inline" :model="filters" style="margin-bottom: 16px">
      <a-form-item label="管理员ID">
        <a-input v-model:value="filters.admin_id" placeholder="管理员ID" />
      </a-form-item>
      <a-form-item label="操作类型">
        <a-input v-model:value="filters.action" placeholder="操作类型" />
      </a-form-item>
      <a-form-item label="开始时间">
        <a-date-picker v-model:value="filters.start_date" format="YYYY-MM-DD" />
      </a-form-item>
      <a-form-item label="结束时间">
        <a-date-picker v-model:value="filters.end_date" format="YYYY-MM-DD" />
      </a-form-item>
      <a-form-item>
        <a-button type="primary" @click="search">查询</a-button>
        <a-button style="margin-left: 8px" @click="resetFilters">重置</a-button>
      </a-form-item>
    </a-form>

    <a-table :columns="columns" :data-source="list" :loading="loading" :pagination="pagination" @change="handleTableChange">
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'created_at'">
          {{ dayjs(record.created_at).format('YYYY-MM-DD HH:mm:ss') }}
        </template>
      </template>
    </a-table>
  </a-card>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import dayjs from 'dayjs';
import { getLogs } from '@/api/platform';
import { message } from 'ant-design-vue';

const list = ref([]);
const loading = ref(false);
const pagination = reactive({ current: 1, pageSize: 20, total: 0 });
const filters = reactive({
  admin_id: '',
  action: '',
  start_date: null,
  end_date: null
});

const columns = [
  { title: 'ID', dataIndex: 'id', key: 'id', width: 80 },
  { title: '管理员', dataIndex: 'username', key: 'username' },
  { title: '操作类型', dataIndex: 'action', key: 'action' },
  { title: '描述', dataIndex: 'description', key: 'description' },
  { title: 'IP地址', dataIndex: 'ip', key: 'ip' },
  { title: '请求方法', dataIndex: 'request_method', key: 'request_method' },
  { title: '请求URL', dataIndex: 'request_url', key: 'request_url' },
  { title: '操作时间', key: 'created_at' }
];

const fetchLogs = async () => {
  loading.value = true;
  try {
    const params = {
      page: pagination.current,
      limit: pagination.pageSize,
      admin_id: filters.admin_id || undefined,
      action: filters.action || undefined,
      start_date: filters.start_date ? filters.start_date.format('YYYY-MM-DD') : undefined,
      end_date: filters.end_date ? filters.end_date.format('YYYY-MM-DD') : undefined
    };
    const res = await getLogs(params);
    list.value = res.list;
    pagination.total = res.total;
  } catch (err) {
    message.error('获取日志失败');
  } finally {
    loading.value = false;
  }
};

const search = () => {
  pagination.current = 1;
  fetchLogs();
};

const resetFilters = () => {
  filters.admin_id = '';
  filters.action = '';
  filters.start_date = null;
  filters.end_date = null;
  search();
};

const handleTableChange = (pag) => {
  pagination.current = pag.current;
  pagination.pageSize = pag.pageSize;
  fetchLogs();
};

onMounted(() => {
  fetchLogs();
});
</script>