import request from './request'

export const getAuditList = (params) => request.get('/platform/merchants/audits', { params })
export const reviewAudit = (id, data) => request.put(`/platform/merchants/audits/${id}`, data)
export const toggleMerchant = (merchantId, is_active) => request.put(`/platform/merchants/merchants/${merchantId}/toggle`, { is_active })