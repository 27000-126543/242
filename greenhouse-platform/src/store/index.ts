import { create } from 'zustand';
import { api, setAuthToken } from '../services/api';
import type { UserRole } from '../types';

interface AppState {
  currentUser: any;
  zones: any[];
  sensorData: any[];
  devices: any[];
  alerts: any[];
  users: any[];
  tasks: any[];
  pestDetections: any[];
  inventoryItems: any[];
  purchaseWarnings: any[];
  salesOrders: any[];
  yieldPredictions: any[];
  monthlyReports: any[];
  matchedOrders: any[];
  cropYieldMap: any;
  lastRefresh: string;
  loading: boolean;
  qrCode: string | null;
  attendanceRecords: any[];

  setCurrentUser: (user: any) => void;
  logout: () => void;
  loadAllData: () => Promise<void>;
  loadZones: () => Promise<void>;
  loadSensorData: () => Promise<void>;
  refreshSensorData: () => Promise<void>;
  loadDevices: () => Promise<void>;
  toggleDevice: (deviceId: string) => Promise<void>;
  toggleDeviceAutoControl: (deviceId: string) => Promise<void>;
  loadAlerts: () => Promise<void>;
  resolveAlert: (alertId: string) => Promise<void>;
  loadUsers: () => Promise<void>;
  loadTasks: (filters?: any) => Promise<void>;
  updateTaskStatus: (taskId: string, status: string, photoUrl?: string) => Promise<void>;
  escalateTask: (taskId: string) => Promise<void>;
  loadPestDetections: () => Promise<void>;
  addPestDetection: (detection: any) => Promise<void>;
  approvePestDetection: (pestId: string, technicianId: string) => Promise<void>;
  updatePestStatus: (pestId: string, status: string) => Promise<void>;
  loadInventory: () => Promise<void>;
  loadPurchaseWarnings: () => Promise<void>;
  approvePurchaseWarning: (warningId: string, supervisorId: string) => Promise<void>;
  loadOrders: () => Promise<void>;
  loadYieldPredictions: () => Promise<void>;
  loadMatchOrders: () => Promise<void>;
  loadMonthlyReports: () => Promise<void>;
  loadQRCode: (userId: string) => Promise<void>;
  checkIn: (data: any) => Promise<void>;
  loadAttendanceRecords: (userId?: string) => Promise<void>;
  exportEfficiency: () => void;
  exportIO: () => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  currentUser: null,
  zones: [],
  sensorData: [],
  devices: [],
  alerts: [],
  users: [],
  tasks: [],
  pestDetections: [],
  inventoryItems: [],
  purchaseWarnings: [],
  salesOrders: [],
  yieldPredictions: [],
  monthlyReports: [],
  matchedOrders: [],
  cropYieldMap: {},
  lastRefresh: '',
  loading: false,
  qrCode: null,
  attendanceRecords: [],

  setCurrentUser: (user) => set({ currentUser: user }),

  logout: () => {
    setAuthToken(null);
    set({ currentUser: null });
    window.location.href = '/login';
  },

  loadAllData: async () => {
    set({ loading: true });
    try {
      await Promise.all([
        get().loadZones(),
        get().loadSensorData(),
        get().loadDevices(),
        get().loadAlerts(),
        get().loadUsers(),
        get().loadTasks(),
        get().loadPestDetections(),
        get().loadInventory(),
        get().loadPurchaseWarnings(),
        get().loadOrders(),
        get().loadYieldPredictions(),
        get().loadMonthlyReports(),
      ]);
    } catch (err) {
      console.error('加载数据失败:', err);
    } finally {
      set({ loading: false, lastRefresh: new Date().toISOString() });
    }
  },

  loadZones: async () => {
    try {
      const zones = await api.zones.getAll();
      set({ zones });
    } catch (err) { console.error(err); }
  },

  loadSensorData: async () => {
    try {
      const sensorData = await api.sensors.getLatest();
      set({ sensorData });
    } catch (err) { console.error(err); }
  },

  refreshSensorData: async () => {
    try {
      await api.sensors.simulate();
      const sensorData = await api.sensors.getLatest();
      set({ sensorData, lastRefresh: new Date().toISOString() });
    } catch (err) { console.error(err); }
  },

  loadDevices: async () => {
    try {
      const devices = await api.devices.getAll();
      set({ devices });
    } catch (err) { console.error(err); }
  },

  toggleDevice: async (deviceId: string) => {
    try {
      await api.devices.toggle(deviceId);
      await get().loadDevices();
    } catch (err) { console.error(err); }
  },

  toggleDeviceAutoControl: async (deviceId: string) => {
    try {
      await api.devices.toggleAuto(deviceId);
      await get().loadDevices();
    } catch (err) { console.error(err); }
  },

  loadAlerts: async () => {
    try {
      const alerts = await api.alerts.getAll();
      set({ alerts });
    } catch (err) { console.error(err); }
  },

  resolveAlert: async (alertId: string) => {
    try {
      await api.alerts.resolve(alertId);
      await get().loadAlerts();
    } catch (err) { console.error(err); }
  },

  loadUsers: async () => {
    try {
      const users = await api.users.getAll();
      set({ users });
    } catch (err) { console.error(err); }
  },

  loadTasks: async (filters?: any) => {
    try {
      const params: any = { ...filters };
      const user = get().currentUser;
      if (user && user.role === 'worker') {
        params.assignedTo = user.id;
      }
      const tasks = await api.tasks.getAll(params);
      set({ tasks });
    } catch (err) { console.error(err); }
  },

  updateTaskStatus: async (taskId: string, status: string, photoUrl?: string) => {
    try {
      await api.tasks.updateStatus(taskId, status, photoUrl);
      await get().loadTasks();
    } catch (err) { console.error(err); }
  },

  escalateTask: async (taskId: string) => {
    try {
      await api.tasks.escalate(taskId);
      await get().loadTasks();
    } catch (err) { console.error(err); }
  },

  loadPestDetections: async () => {
    try {
      const pestDetections = await api.pests.getAll();
      set({ pestDetections });
    } catch (err) { console.error(err); }
  },

  addPestDetection: async (detection: any) => {
    try {
      await api.pests.create(detection);
      await get().loadPestDetections();
    } catch (err) { console.error(err); }
  },

  approvePestDetection: async (pestId: string, technicianId: string) => {
    try {
      await api.pests.approve(pestId, technicianId);
      await get().loadPestDetections();
    } catch (err) { console.error(err); }
  },

  updatePestStatus: async (pestId: string, status: string) => {
    try {
      await api.pests.updateStatus(pestId, status);
      await get().loadPestDetections();
    } catch (err) { console.error(err); }
  },

  loadInventory: async () => {
    try {
      const inventoryItems = await api.inventory.getItems();
      set({ inventoryItems });
    } catch (err) { console.error(err); }
  },

  loadPurchaseWarnings: async () => {
    try {
      const purchaseWarnings = await api.inventory.getWarnings();
      set({ purchaseWarnings });
    } catch (err) { console.error(err); }
  },

  approvePurchaseWarning: async (warningId: string, supervisorId: string) => {
    try {
      await api.inventory.approveWarning(warningId, supervisorId);
      await get().loadPurchaseWarnings();
    } catch (err) { console.error(err); }
  },

  loadOrders: async () => {
    try {
      const salesOrders = await api.orders.getAll();
      set({ salesOrders });
    } catch (err) { console.error(err); }
  },

  loadYieldPredictions: async () => {
    try {
      const yieldPredictions = await api.yield.getPredictions();
      set({ yieldPredictions });
    } catch (err) { console.error(err); }
  },

  loadMatchOrders: async () => {
    try {
      const data = await api.yield.matchOrders();
      set({ matchedOrders: data.orders, cropYieldMap: data.cropYieldMap, yieldPredictions: data.predictions });
    } catch (err) { console.error(err); }
  },

  loadMonthlyReports: async () => {
    try {
      const monthlyReports = await api.reports.getMonthly();
      set({ monthlyReports });
    } catch (err) { console.error(err); }
  },

  loadQRCode: async (userId: string) => {
    try {
      const data = await api.attendance.getQRCode(userId);
      set({ qrCode: data.qrCode });
    } catch (err) { console.error(err); }
  },

  checkIn: async (data: any) => {
    try {
      await api.attendance.checkIn(data);
      await get().loadAttendanceRecords(data.userId);
    } catch (err) { console.error(err); }
  },

  loadAttendanceRecords: async (userId?: string) => {
    try {
      const records = await api.attendance.getRecords(userId ? { userId } : undefined);
      set({ attendanceRecords: records });
    } catch (err) { console.error(err); }
  },

  exportEfficiency: () => {
    window.open(api.reports.exportEfficiency(), '_blank');
  },

  exportIO: () => {
    window.open(api.reports.exportIO(), '_blank');
  },
}));

export const hasPermission = (userRole: UserRole, requiredRole: UserRole): boolean => {
  const roleHierarchy: Record<UserRole, number> = {
    worker: 1,
    technician: 2,
    supervisor: 3,
    owner: 4,
  };
  return roleHierarchy[userRole] >= roleHierarchy[requiredRole];
};
