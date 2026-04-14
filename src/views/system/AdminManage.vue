<template>
  <a-card title="管理员账号管理">
    <template #extra>
      <a-button type="primary" @click="showAddModal">新增管理员</a-button>
    </template>
    <a-table :columns="columns" :data-source="list" :loading="loading" :pagination="pagination" @change="handleTableChange">
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'status'">
          <a-badge :status="record.status === 1 ? 'success' : 'error'" :text="record.status === 1 ? '启用' : '禁用'" />
        </template>
        <template v-else-if="column.key === 'action'">
          <a-space>
            <a-button size="small" @click="showEditModal(record)">编辑</a-button>
            <a-button size="small" @click="showResetPwdModal(record)">重置密码</a-button>
            <a-popconfirm title="确定删除该管理员？" @confirm="handleDelete(record.id)">
              <a-button size="small" danger>删除</a-button>
            </a-popconfirm>
          </a-space>
        </template>
      </template>
    </a-table>

    <!-- 新增/编辑弹窗 -->
    <a-modal v-model:visible="modalVisible" :title="modalTitle" @ok="handleSave" :confirm-loading="saveLoading">
      <a-form :model="form" :label-col="{ span: 6 }" :wrapper-col="{ span: 16 }">
        <a-form-item label="用户名" v-if="!form.id" required>
          <a-input v-model:value="form.username" />
        </a-form-item>
        <a-form-item label="密码" v-if="!form.id" required>
          <a-input-password v-model:value="form.password" />
        </a-form-item>
        <a-form-item label="真实姓名">
          <a-input v-model:value="form.real_name" />
        </a-form-item>
        <a-form-item label="邮箱">
          <a-input v-model:value="form.email" />
        </a-form-item>
        <a-form-item label="角色" required>
          <a-select v-model:value="form.role_id">
            <a-select-option v-for="role in roles" :key="role.id" :value="role.id">{{ role.name }}</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="状态">
          <a-radio-group v-model:value="form.status">
            <a-radio :value="1">启用</a-radio>
            <a-radio :value="0">禁用</a-radio>
          </a-radio-group>
        </a-form-item>
      </a-form>
    </a-modal>

    <!-- 重置密码弹窗 -->
    <a-modal v-model:visible="resetModalVisible" title="重置密码" @ok="handleResetPassword" :confirm-loading="resetLoading">
      <a-form>
        <a-form-item label="新密码" required>
          <a-input-password v-model:value="newPassword" placeholder="至少6位" />
        </a-form-item>
      </a-form>
    </a-modal>
  </a-card>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { message } from 'ant-design-vue';
import { getAdmins, createAdmin, updateAdmin, deleteAdmin, resetAdminPassword, getRoles } from '@/api/platform';

const list = ref([]);
const roles = ref([]);
const loading = ref(false);
const pagination = reactive({ current: 1, pageSize: 10, total: 0 });
const modalVisible = ref(false);
const modalTitle = ref('');
const saveLoading = ref(false);
const resetModalVisible = ref(false);
const resetLoading = ref(false);
const currentAdminId = ref(null);
const newPassword = ref('');
const form = reactive({ id: null, username: '', password: '', real_name: '', email: '', role_id: null, status: 1 });

const columns = [
  { title: 'ID', dataIndex: 'id', key: 'id', width: 80 },
  { title: '用户名', dataIndex: 'username', key: 'username' },
  { title: '真实姓名', dataIndex: 'real_name', key: 'real_name' },
  { title: '邮箱', dataIndex: 'email', key: 'email' },
  { title: '角色', dataIndex: 'role_name', key: 'role_name' },
  { title: '状态', key: 'status' },
  { title: '最后登录时间', dataIndex: 'last_login_time', key: 'last_login_time' },
  { title: '最后登录IP', dataIndex: 'last_login_ip', key: 'last_login_ip' },
  { title: '操作', key: 'action', width: 220 }
];

const fetchAdmins = async () => {
  loading.value = true;
  try {
    console.log('=== fetchAdmins 开始 ===');
    console.log('请求参数:', { page: pagination.current, limit: pagination.pageSize });
    const res = await getAdmins({ page: pagination.current, limit: pagination.pageSize });
    console.log('getAdmins 原始响应:', res);
    console.log('res 的类型:', typeof res, '是否为数组?', Array.isArray(res));
    console.log('res.list 是否存在?', !!res.list);
    list.value = res.list;
    pagination.total = res.total;
    console.log('数据赋值成功');
  } catch (err) {
    console.error('fetchAdmins 捕获错误:', err);
    message.error('获取管理员列表失败');
  } finally {
    loading.value = false;
  }
};

const fetchRoles = async () => {
  try {
    roles.value = await getRoles();
  } catch (err) {
    message.error('获取角色列表失败');
  }
};

const showAddModal = () => {
  modalTitle.value = '新增管理员';
  form.id = null;
  form.username = '';
  form.password = '';
  form.real_name = '';
  form.email = '';
  form.role_id = roles.value[0]?.id || null;
  form.status = 1;
  modalVisible.value = true;
};

const showEditModal = (record) => {
  modalTitle.value = '编辑管理员';
  form.id = record.id;
  form.username = record.username;
  form.password = '';
  form.real_name = record.real_name;
  form.email = record.email;
  form.role_id = record.role_id;
  form.status = record.status;
  modalVisible.value = true;
};

const showResetPwdModal = (record) => {
  currentAdminId.value = record.id;
  newPassword.value = '';
  resetModalVisible.value = true;
};

const handleSave = async () => {
  if (!form.id && (!form.username || !form.password)) {
    message.warning('请填写用户名和密码');
    return;
  }
  if (!form.role_id) {
    message.warning('请选择角色');
    return;
  }
  saveLoading.value = true;
  try {
    if (form.id) {
      await updateAdmin(form.id, { real_name: form.real_name, email: form.email, role_id: form.role_id, status: form.status });
      message.success('更新成功');
    } else {
      await createAdmin({ username: form.username, password: form.password, real_name: form.real_name, email: form.email, role_id: form.role_id, status: form.status });
      message.success('创建成功');
    }
    modalVisible.value = false;
    fetchAdmins();
  } catch (err) {
    message.error(form.id ? '更新失败' : '创建失败');
  } finally {
    saveLoading.value = false;
  }
};

const handleDelete = async (id) => {
  try {
    await deleteAdmin(id);
    message.success('删除成功');
    fetchAdmins();
  } catch (err) {
    message.error(err.response?.data?.error || '删除失败');
  }
};

const handleResetPassword = async () => {
  if (!newPassword.value || newPassword.value.length < 6) {
    message.warning('密码长度至少6位');
    return;
  }
  resetLoading.value = true;
  try {
    await resetAdminPassword(currentAdminId.value, newPassword.value);
    message.success('密码重置成功');
    resetModalVisible.value = false;
  } catch (err) {
    message.error('重置失败');
  } finally {
    resetLoading.value = false;
  }
};

const handleTableChange = (pag) => {
  pagination.current = pag.current;
  pagination.pageSize = pag.pageSize;
  fetchAdmins();
};

onMounted(() => {
  fetchRoles();
  fetchAdmins();
});
</script>