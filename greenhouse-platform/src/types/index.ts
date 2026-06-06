export type ZoneType = 'seedling' | 'leafy' | 'fruit';

export type UserRole = 'worker' | 'technician' | 'supervisor' | 'owner';

export type SensorType = 'temperature' | 'humidity' | 'light' | 'co2' | 'soil';

export type DeviceType = 'curtain' | 'fan' | 'sprinkler' | 'light';

export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'overdue' | 'escalated';

export type TaskType = 'watering' | 'fertilizing' | 'pruning' | 'harvesting';

export type PestStatus = 'detected' | 'approved' | 'treated' | 'resolved';

export type InventoryType = 'pesticide' | 'fertilizer';

export interface Zone {
  id: string;
  name: string;
  type: ZoneType;
  crop: string;
  cropStage: string;
  area: number;
  plantedDate: string;
  expectedHarvestDate: string;
}

export interface SensorData {
  id: string;
  zoneId: string;
  type: SensorType;
  value: number;
  unit: string;
  minThreshold: number;
  maxThreshold: number;
  timestamp: string;
  isNormal: boolean;
}

export interface Device {
  id: string;
  zoneId: string;
  type: DeviceType;
  name: string;
  status: 'on' | 'off';
  autoControl: boolean;
  lastActivated: string;
}

export interface Alert {
  id: string;
  zoneId: string;
  sensorType: SensorType;
  message: string;
  level: 'warning' | 'critical';
  timestamp: string;
  resolved: boolean;
  pushedToPhone: boolean;
}

export interface User {
  id: string;
  name: string;
  role: UserRole;
  phone: string;
  avatar?: string;
  zoneIds?: string[];
}

export interface Task {
  id: string;
  zoneId: string;
  type: TaskType;
  title: string;
  description: string;
  assignedTo: string;
  status: TaskStatus;
  createdAt: string;
  dueTime: string;
  completedAt?: string;
  photoUrl?: string;
  escalated: boolean;
}

export interface PestDetection {
  id: string;
  zoneId: string;
  reportedBy: string;
  photoUrl: string;
  detectedPest: string;
  confidence: number;
  recommendedTreatment: string;
  status: PestStatus;
  reportedAt: string;
  approvedBy?: string;
  approvedAt?: string;
  harvestLocked: boolean;
}

export interface InventoryItem {
  id: string;
  type: InventoryType;
  name: string;
  batchNumber: string;
  quantity: number;
  unit: string;
  safetyStock: number;
  expiryDate: string;
  supplier: string;
}

export interface PurchaseWarning {
  id: string;
  itemId: string;
  itemName: string;
  currentStock: number;
  safetyStock: number;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  approvedBy?: string;
}

export interface SalesOrder {
  id: string;
  customer: string;
  crop: string;
  quantity: number;
  unit: string;
  deliveryDate: string;
  status: 'pending' | 'matched' | 'shortage' | 'surplus';
}

export interface YieldPrediction {
  zoneId: string;
  crop: string;
  predictedYield: number;
  unit: string;
  confidence: number;
  historicalYield: number;
  currentGrowthRate: number;
}

export interface DashboardStats {
  envComplianceRate: Record<ZoneType, number>;
  taskCompletionRate: number;
  totalTasks: number;
  completedTasks: number;
  pestAlerts: number;
  activeAlerts: number;
}

export interface HeatmapPoint {
  zoneId: string;
  x: number;
  y: number;
  intensity: number;
  type: 'pest' | 'env';
}

export interface MonthlyReport {
  month: string;
  plantingEfficiency: number;
  inputCost: number;
  outputRevenue: number;
  roi: number;
  yieldPerUnit: number;
}
