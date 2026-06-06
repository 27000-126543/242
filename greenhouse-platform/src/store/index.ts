import { create } from 'zustand';
import type {
  Zone,
  SensorData,
  Device,
  Alert,
  User,
  Task,
  PestDetection,
  InventoryItem,
  PurchaseWarning,
  SalesOrder,
  YieldPrediction,
  UserRole,
} from '../types';
import {
  zones,
  generateSensorData,
  devices as initialDevices,
  alerts as initialAlerts,
  users,
  tasks as initialTasks,
  pestDetections as initialPestDetections,
  inventoryItems as initialInventoryItems,
  purchaseWarnings as initialPurchaseWarnings,
  salesOrders as initialSalesOrders,
  yieldPredictions as initialYieldPredictions,
} from '../data/mockData';

interface AppState {
  currentUser: User;
  zones: Zone[];
  sensorData: SensorData[];
  devices: Device[];
  alerts: Alert[];
  users: User[];
  tasks: Task[];
  pestDetections: PestDetection[];
  inventoryItems: InventoryItem[];
  purchaseWarnings: PurchaseWarning[];
  salesOrders: SalesOrder[];
  yieldPredictions: YieldPrediction[];
  lastRefresh: string;
  
  setCurrentUser: (user: User) => void;
  refreshSensorData: () => void;
  toggleDevice: (deviceId: string) => void;
  toggleDeviceAutoControl: (deviceId: string) => void;
  resolveAlert: (alertId: string) => void;
  updateTaskStatus: (taskId: string, status: Task['status'], photoUrl?: string) => void;
  approvePestDetection: (pestId: string, technicianId: string) => void;
  updateInventory: (itemId: string, quantity: number) => void;
  approvePurchaseWarning: (warningId: string, supervisorId: string) => void;
  addPestDetection: (detection: Omit<PestDetection, 'id' | 'reportedAt'>) => void;
}

const initialUser = users[0];

export const useAppStore = create<AppState>((set) => ({
  currentUser: initialUser,
  zones,
  sensorData: generateSensorData(),
  devices: initialDevices,
  alerts: initialAlerts,
  users,
  tasks: initialTasks,
  pestDetections: initialPestDetections,
  inventoryItems: initialInventoryItems,
  purchaseWarnings: initialPurchaseWarnings,
  salesOrders: initialSalesOrders,
  yieldPredictions: initialYieldPredictions,
  lastRefresh: new Date().toISOString(),

  setCurrentUser: (user) => set({ currentUser: user }),

  refreshSensorData: () => set({ 
    sensorData: generateSensorData(),
    lastRefresh: new Date().toISOString(),
  }),

  toggleDevice: (deviceId) => set((state) => ({
    devices: state.devices.map((d) =>
      d.id === deviceId ? { ...d, status: d.status === 'on' ? 'off' : 'on', lastActivated: new Date().toISOString() } : d
    ),
  })),

  toggleDeviceAutoControl: (deviceId) => set((state) => ({
    devices: state.devices.map((d) =>
      d.id === deviceId ? { ...d, autoControl: !d.autoControl } : d
    ),
  })),

  resolveAlert: (alertId) => set((state) => ({
    alerts: state.alerts.map((a) =>
      a.id === alertId ? { ...a, resolved: true } : a
    ),
  })),

  updateTaskStatus: (taskId, status, photoUrl) => set((state) => ({
    tasks: state.tasks.map((t) =>
      t.id === taskId
        ? { 
            ...t, 
            status, 
            completedAt: status === 'completed' ? new Date().toISOString() : undefined,
            photoUrl: photoUrl || t.photoUrl,
          }
        : t
    ),
  })),

  approvePestDetection: (pestId, technicianId) => set((state) => ({
    pestDetections: state.pestDetections.map((p) =>
      p.id === pestId
        ? { 
            ...p, 
            status: 'approved', 
            approvedBy: technicianId, 
            approvedAt: new Date().toISOString(),
            harvestLocked: true,
          }
        : p
    ),
  })),

  updateInventory: (itemId, quantity) => set((state) => ({
    inventoryItems: state.inventoryItems.map((item) =>
      item.id === itemId ? { ...item, quantity } : item
    ),
  })),

  approvePurchaseWarning: (warningId, supervisorId) => set((state) => ({
    purchaseWarnings: state.purchaseWarnings.map((pw) =>
      pw.id === warningId
        ? { ...pw, status: 'approved', approvedBy: supervisorId }
        : pw
    ),
  })),

  addPestDetection: (detection) => set((state) => ({
    pestDetections: [
      {
        ...detection,
        id: `pest-${Date.now()}`,
        reportedAt: new Date().toISOString(),
      },
      ...state.pestDetections,
    ],
  })),
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
