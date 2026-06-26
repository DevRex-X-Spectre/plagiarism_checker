import api from './api.js';

export const projectService = {
  list: (params) => api.get('/projects', { params }),
  get: (id) => api.get(`/projects/${id}`),
  getMine: () => api.get('/projects/my/list'),
  upload: (formData) => api.post('/projects/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  confirmUpload: (data) => api.post('/projects/confirm', data),
  delete: (id) => api.delete(`/projects/${id}`),
};

export const departmentService = {
  listActive: () => api.get('/departments'),
  listAll: () => api.get('/departments/all'),
  create: (data) => api.post('/departments', data),
  update: (id, data) => api.patch(`/departments/${id}`, data),
  delete: (id) => api.delete(`/departments/${id}`),
};

export const similarityService = {
  check: (data) => api.post('/similarity/check', data),
  history: (params) => api.get('/similarity/history', { params }),
  get: (id) => api.get(`/similarity/${id}`),
};
