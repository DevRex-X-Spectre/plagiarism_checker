import api from './api.js';

export const adminService = {
  stats: () => api.get('/admin/stats'),
  users: (params) => api.get('/admin/users', { params }),
  updateUser: (id, data) => api.patch(`/admin/users/${id}`, data),
  deactivateUser: (id) => api.delete(`/admin/users/${id}`),
  projects: (params) => api.get('/admin/projects', { params }),
  deleteProject: (id) => api.delete(`/admin/projects/${id}`),
  similarityLogs: (params) => api.get('/admin/similarity-logs', { params }),
  createDepartment: (data) => api.post('/admin/departments', data),
  updateDepartment: (id, data) => api.patch(`/admin/departments/${id}`, data),
};
