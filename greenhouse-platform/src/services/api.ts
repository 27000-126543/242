const API_BASE = 'http://localhost:3003/api';

let authToken: string | null = localStorage.getItem('token');

export const setAuthToken = (token: string | null) => {
  authToken = token;
  if (token) {
    localStorage.setItem('token', token);
  } else {
    localStorage.removeItem('token');
  }
};

const request = async <T>(url: string, options?: RequestInit): Promise<T> => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...options?.headers,
  };
  
  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }

  const response = await fetch(`${API_BASE}${url}`, {
    ...options,
    headers,
  });
  
  if (response.status === 401) {
    setAuthToken(null);
    window.location.href = '/login';
    throw new Error('未授权，请重新登录');
  }
  
  if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
  return response.json();
};

export const api = {
  auth: {
    login: (phone: string, password: string) =>
      request<any>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ phone, password }),
      }),
  },
  zones: {
    getAll: () => request<any[]>('/zones'),
    getById: (id: string) => request<any>(`/zones/${id}`),
  },
  sensors: {
    getAll: (params?: { zoneId?: string; type?: string }) => {
      const query = new URLSearchParams(params as any).toString();
      return request<any[]>(`/sensors${query ? `?${query}` : ''}`);
    },
    getLatest: () => request<any[]>('/sensors/latest'),
    simulate: () => request<any>('/sensors/simulate', { method: 'POST' }),
  },
  devices: {
    getAll: (params?: { zoneId?: string }) => {
      const query = new URLSearchParams(params as any).toString();
      return request<any[]>(`/devices${query ? `?${query}` : ''}`);
    },
    toggle: (id: string) => request<any>(`/devices/${id}/toggle`, { method: 'PUT' }),
    toggleAuto: (id: string) => request<any>(`/devices/${id}/auto-control`, { method: 'PUT' }),
  },
  alerts: {
    getAll: (params?: { zoneId?: string; resolved?: boolean; level?: string }) => {
      const query = new URLSearchParams(params as any).toString();
      return request<any[]>(`/alerts${query ? `?${query}` : ''}`);
    },
    resolve: (id: string) => request<any>(`/alerts/${id}/resolve`, { method: 'PUT' }),
  },
  users: {
    getAll: (params?: { role?: string }) => {
      const query = new URLSearchParams(params as any).toString();
      return request<any[]>(`/users${query ? `?${query}` : ''}`);
    },
    getById: (id: string) => request<any>(`/users/${id}`),
  },
  tasks: {
    getAll: (params?: { assignedTo?: string; zoneId?: string; status?: string }) => {
      const query = new URLSearchParams(params as any).toString();
      return request<any[]>(`/tasks${query ? `?${query}` : ''}`);
    },
    updateStatus: (id: string, status: string, photoUrl?: string) =>
      request<any>(`/tasks/${id}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status, photoUrl }),
      }),
    escalate: (id: string) => request<any>(`/tasks/${id}/escalate`, { method: 'PUT' }),
  },
  pests: {
    getAll: (params?: { zoneId?: string; status?: string }) => {
      const query = new URLSearchParams(params as any).toString();
      return request<any[]>(`/pests${query ? `?${query}` : ''}`);
    },
    create: (data: any) =>
      request<any>('/pests', { method: 'POST', body: JSON.stringify(data) }),
    approve: (id: string, approvedBy: string) =>
      request<any>(`/pests/${id}/approve`, {
        method: 'PUT',
        body: JSON.stringify({ approvedBy }),
      }),
    updateStatus: (id: string, status: string) =>
      request<any>(`/pests/${id}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status }),
      }),
  },
  inventory: {
    getItems: (params?: { type?: string }) => {
      const query = new URLSearchParams(params as any).toString();
      return request<any[]>(`/inventory/items${query ? `?${query}` : ''}`);
    },
    updateQuantity: (id: string, quantity: number) =>
      request<any>(`/inventory/items/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ quantity }),
      }),
    getWarnings: (params?: { status?: string }) => {
      const query = new URLSearchParams(params as any).toString();
      return request<any[]>(`/inventory/warnings${query ? `?${query}` : ''}`);
    },
    approveWarning: (id: string, approvedBy: string) =>
      request<any>(`/inventory/warnings/${id}/approve`, {
        method: 'PUT',
        body: JSON.stringify({ approvedBy }),
      }),
  },
  orders: {
    getAll: (params?: { status?: string; crop?: string }) => {
      const query = new URLSearchParams(params as any).toString();
      return request<any[]>(`/orders${query ? `?${query}` : ''}`);
    },
    updateStatus: (id: string, status: string) =>
      request<any>(`/orders/${id}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status }),
      }),
  },
  yield: {
    getPredictions: (params?: { zoneId?: string }) => {
      const query = new URLSearchParams(params as any).toString();
      return request<any[]>(`/yield/predictions${query ? `?${query}` : ''}`);
    },
    matchOrders: () => request<any>('/yield/match-orders'),
  },
  reports: {
    getMonthly: (params?: { month?: string; zoneId?: string }) => {
      const query = new URLSearchParams(params as any).toString();
      return request<any[]>(`/reports/monthly${query ? `?${query}` : ''}`);
    },
    getEfficiency: () => request<any>('/reports/efficiency'),
    exportEfficiency: () => `${API_BASE}/reports/export/efficiency`,
    exportIO: () => `${API_BASE}/reports/export/io`,
  },
  attendance: {
    getQRCode: (userId: string) => request<any>(`/attendance/qrcode/${userId}`),
    checkIn: (data: { userId: string; qrCode: string; location?: string }) =>
      request<any>('/attendance/checkin', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    getRecords: (params?: { userId?: string }) => {
      const query = new URLSearchParams(params as any).toString();
      return request<any[]>(`/attendance/records${query ? `?${query}` : ''}`);
    },
  },
  upload: {
    pestImage: async (file: File) => {
      const formData = new FormData();
      formData.append('image', file);
      const headers: Record<string, string> = {};
      if (authToken) {
        headers['Authorization'] = `Bearer ${authToken}`;
      }
      const res = await fetch(`${API_BASE}/upload/image`, {
        method: 'POST',
        body: formData,
        headers,
      });
      if (res.status === 401) {
        setAuthToken(null);
        window.location.href = '/login';
        throw new Error('未授权，请重新登录');
      }
      if (!res.ok) throw new Error('Upload failed');
      return res.json();
    },
    taskPhoto: async (taskId: string, file: File) => {
      const formData = new FormData();
      formData.append('taskId', taskId);
      formData.append('photo', file);
      const headers: Record<string, string> = {};
      if (authToken) {
        headers['Authorization'] = `Bearer ${authToken}`;
      }
      const res = await fetch(`${API_BASE}/upload/task-photo`, {
        method: 'POST',
        body: formData,
        headers,
      });
      if (res.status === 401) {
        setAuthToken(null);
        window.location.href = '/login';
        throw new Error('未授权，请重新登录');
      }
      if (!res.ok) throw new Error('Upload failed');
      return res.json();
    },
  },
};
