// src/api/platform.js
import request from './request';

// ========== 运营活动 ==========
export const getCampaigns = (params) => request.get('/platform/campaigns', { params });
export const createCampaign = (data) => request.post('/platform/campaigns', data);
export const updateCampaign = (id, data) => request.put(`/platform/campaigns/${id}`, data);
export const deleteCampaign = (id) => request.delete(`/platform/campaigns/${id}`);

// ========== 管理员管理 ==========
export const getAdmins = (params) => request.get('/platform/admins', { params });
export const createAdmin = (data) => request.post('/platform/admins', data);
export const updateAdmin = (id, data) => request.put(`/platform/admins/${id}`, data);
export const deleteAdmin = (id) => request.delete(`/platform/admins/${id}`);
export const resetAdminPassword = (id, newPassword) => request.post(`/platform/admins/${id}/reset-password`, { newPassword });

// ========== 角色管理 ==========
export const getRoles = () => request.get('/platform/roles');
export const createRole = (data) => request.post('/platform/roles', data);
export const updateRole = (id, data) => request.put(`/platform/roles/${id}`, data);
export const deleteRole = (id) => request.delete(`/platform/roles/${id}`);

// ========== 操作日志 ==========
export const getLogs = (params) => request.get('/platform/logs', { params });