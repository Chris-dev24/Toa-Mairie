import apiClient from './api';

export const authService = {
  register: async (data) => {
    const response = await apiClient.post('/auth/register', data);
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  login: async (email, password) => {
    const response = await apiClient.post('/auth/login', { email, password });
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  verify: async () => {
    const response = await apiClient.get('/auth/verify');
    return response.data;
  },

  changePassword: async (currentPassword, newPassword) => {
    const response = await apiClient.post('/auth/change-password', {
      currentPassword,
      newPassword
    });
    return response.data;
  }
};

export const projectService = {
  getAll: async (params) => {
    const response = await apiClient.get('/projects', { params });
    return response.data;
  },

  getById: async (id) => {
    const response = await apiClient.get(`/projects/${id}`);
    return response.data;
  },

  create: async (data) => {
    const response = await apiClient.post('/projects', data);
    return response.data;
  },

  update: async (id, data) => {
    const response = await apiClient.put(`/projects/${id}`, data);
    return response.data;
  },

  delete: async (id) => {
    const response = await apiClient.delete(`/projects/${id}`);
    return response.data;
  }
};

export const taskService = {
  getAll: async (params) => {
    const response = await apiClient.get('/tasks', { params });
    return response.data;
  },

  getById: async (id) => {
    const response = await apiClient.get(`/tasks/${id}`);
    return response.data;
  },

  create: async (data) => {
    const response = await apiClient.post('/tasks', data);
    return response.data;
  },

  update: async (id, data) => {
    const response = await apiClient.put(`/tasks/${id}`, data);
    return response.data;
  },

  delete: async (id) => {
    const response = await apiClient.delete(`/tasks/${id}`);
    return response.data;
  }
};

export const formService = {
  getAll: async (params) => {
    const response = await apiClient.get('/forms', { params });
    return response.data;
  },

  getById: async (id) => {
    const response = await apiClient.get(`/forms/${id}`);
    return response.data;
  },

  create: async (data) => {
    const response = await apiClient.post('/forms', data);
    return response.data;
  },

  submit: async (id, data) => {
    const response = await apiClient.post(`/forms/${id}/submit`, data);
    return response.data;
  },

  getSubmissions: async (id, params) => {
    const response = await apiClient.get(`/forms/${id}/submissions`, { params });
    return response.data;
  },

  syncOffline: async (submissions) => {
    const response = await apiClient.post('/forms/sync/offline', { submissions });
    return response.data;
  }
};

export const userService = {
  getAll: async (params) => {
    const response = await apiClient.get('/users', { params });
    return response.data;
  },

  getById: async (id) => {
    const response = await apiClient.get(`/users/${id}`);
    return response.data;
  },

  update: async (id, data) => {
    const response = await apiClient.put(`/users/${id}`, data);
    return response.data;
  },

  getByRole: async (role) => {
    const response = await apiClient.get(`/users/role/${role}`);
    return response.data;
  }
};

export const dashboardService = {
  getDirector: async () => {
    const response = await apiClient.get('/dashboard/director');
    return response.data;
  },

  getServiceHead: async () => {
    const response = await apiClient.get('/dashboard/service-head');
    return response.data;
  },

  getFieldAgent: async () => {
    const response = await apiClient.get('/dashboard/field-agent');
    return response.data;
  },

  getCommunication: async () => {
    const response = await apiClient.get('/dashboard/communication');
    return response.data;
  }
};

export const messagingService = {
  sendMessage: async (payload) => {
    const response = await apiClient.post('/messaging', payload);
    return response.data;
  },

  getMessages: async (params) => {
    const response = await apiClient.get('/messaging', { params });
    return response.data;
  },

  getConversations: async () => {
    const response = await apiClient.get('/messaging/conversations');
    return response.data;
  },

  markAsRead: async (messageId) => {
    const response = await apiClient.post('/messaging/read', { messageId });
    return response.data;
  }
};

export const offlineService = {
  queueSubmission: async (payload) => {
    const { addSubmission } = await import('../utils/idb');
    return addSubmission(payload);
  },

  getQueued: async () => {
    const { getAllSubmissions } = await import('../utils/idb');
    return getAllSubmissions();
  },

  deleteQueued: async (id) => {
    const { deleteSubmission } = await import('../utils/idb');
    return deleteSubmission(id);
  }
};
