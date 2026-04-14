<template>
  <div>
    <a-card title="运营活动管理" :bordered="false">
      <template #extra>
        <a-button type="primary" @click="handleAdd">新建活动</a-button>
      </template>
      <a-table :columns="columns" :data-source="list" :loading="loading" :pagination="pagination" @change="handleTableChange">
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'status'">
            <a-tag :color="record.status === 'published' ? 'green' : record.status === 'ended' ? 'default' : 'orange'">
              {{ record.status === 'draft' ? '草稿' : record.status === 'published' ? '已发布' : '已结束' }}
            </a-tag>
          </template>
          <template v-else-if="column.key === 'action'">
            <a-space>
              <a-button size="small" @click="handleEdit(record)">编辑</a-button>
              <a-button size="small" v-if="record.status === 'draft'" @click="handlePublish(record)">发布</a-button>
              <a-popconfirm title="确定删除此活动吗？" @confirm="handleDelete(record.id)">
                <a-button size="small" danger>删除</a-button>
              </a-popconfirm>
            </a-space>
          </template>
          <template v-else-if="column.key === 'config'">
            <a-tooltip :title="JSON.stringify(record.config)">
              <span>{{ record.config.discount_rate ? `${record.config.discount_rate * 10}折` : '规则详情' }}</span>
            </a-tooltip>
          </template>
        </template>
      </a-table>
    </a-card>

    <!-- 新建/编辑弹窗 -->
    <a-modal v-model:visible="modalVisible" :title="modalTitle" @ok="handleSubmit" :confirm-loading="submitLoading">
      <a-form :model="form" :label-col="{ span: 6 }" :wrapper-col="{ span: 16 }">
        <a-form-item label="活动标题" required>
          <a-input v-model:value="form.title" placeholder="请输入标题" />
        </a-form-item>
        <a-form-item label="活动类型" required>
          <a-select v-model:value="form.type">
            <a-select-option value="discount">折扣活动</a-select-option>
            <a-select-option value="cashback">满减返现</a-select-option>
            <a-select-option value="festival">节日活动</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="开始时间" required>
          <a-date-picker show-time v-model:value="form.start_time" format="YYYY-MM-DD HH:mm:ss" style="width: 100%" />
        </a-form-item>
        <a-form-item label="结束时间" required>
          <a-date-picker show-time v-model:value="form.end_time" format="YYYY-MM-DD HH:mm:ss" style="width: 100%" />
        </a-form-item>
        <a-form-item label="活动规则(JSON)">
          <a-textarea v-model:value="form.configStr" :rows="3" placeholder='例如：{"discount_rate":0.8, "min_amount":100}' />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { message } from 'ant-design-vue';
import dayjs from 'dayjs';
import { getCampaigns, createCampaign, updateCampaign, deleteCampaign } from '@/api/platform';

const list = ref([]);
const loading = ref(false);
const pagination = reactive({ current: 1, pageSize: 10, total: 0 });
const modalVisible = ref(false);
const modalTitle = ref('');
const submitLoading = ref(false);
const form = reactive({
  id: null,
  title: '',
  type: 'discount',
  start_time: null,
  end_time: null,
  configStr: '{}'
});

const columns = [
  { title: 'ID', dataIndex: 'id', key: 'id', width: 80 },
  { title: '标题', dataIndex: 'title', key: 'title' },
  { title: '类型', dataIndex: 'type', key: 'type', customRender: ({ text }) => ({ discount: '折扣', cashback: '满减', festival: '节日' }[text] || text) },
  { title: '开始时间', dataIndex: 'start_time', key: 'start_time' },
  { title: '结束时间', dataIndex: 'end_time', key: 'end_time' },
  { title: '状态', key: 'status' },
  { title: '规则', key: 'config' },
  { title: '操作', key: 'action', width: 180 }
];

const fetchData = async () => {
  loading.value = true;
  try {
    const res = await getCampaigns({ page: pagination.current, limit: pagination.pageSize });
    list.value = res.list;
    pagination.total = res.total;
  } catch (err) {
    message.error('获取活动列表失败');
  } finally {
    loading.value = false;
  }
};

const handleTableChange = (pag) => {
  pagination.current = pag.current;
  pagination.pageSize = pag.pageSize;
  fetchData();
};

const handleAdd = () => {
  modalTitle.value = '新建活动';
  form.id = null;
  form.title = '';
  form.type = 'discount';
  form.start_time = null;
  form.end_time = null;
  form.configStr = '{}';
  modalVisible.value = true;
};

const handleEdit = (record) => {
  modalTitle.value = '编辑活动';
  form.id = record.id;
  form.title = record.title;
  form.type = record.type;
  form.start_time = dayjs(record.start_time);
  form.end_time = dayjs(record.end_time);
  form.configStr = JSON.stringify(record.config, null, 2);
  modalVisible.value = true;
};

const handlePublish = async (record) => {
  try {
    await updateCampaign(record.id, { status: 'published' });
    message.success('发布成功');
    fetchData();
  } catch (err) {
    message.error('发布失败');
  }
};

const handleDelete = async (id) => {
  try {
    await deleteCampaign(id);
    message.success('删除成功');
    fetchData();
  } catch (err) {
    message.error('删除失败');
  }
};

const handleSubmit = async () => {
  if (!form.title || !form.type || !form.start_time || !form.end_time) {
    message.warning('请填写完整信息');
    return;
  }
  let config = {};
  try {
    config = JSON.parse(form.configStr);
  } catch (e) {
    message.error('规则 JSON 格式错误');
    return;
  }
  submitLoading.value = true;
  try {
    const data = {
      title: form.title,
      type: form.type,
      start_time: form.start_time.format('YYYY-MM-DD HH:mm:ss'),
      end_time: form.end_time.format('YYYY-MM-DD HH:mm:ss'),
      config
    };
    if (form.id) {
      await updateCampaign(form.id, data);
      message.success('更新成功');
    } else {
      await createCampaign(data);
      message.success('创建成功');
    }
    modalVisible.value = false;
    fetchData();
  } catch (err) {
    message.error(form.id ? '更新失败' : '创建失败');
  } finally {
    submitLoading.value = false;
  }
};

onMounted(() => {
  fetchData();
});
</script>