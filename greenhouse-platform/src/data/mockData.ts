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
  MonthlyReport,
  HeatmapPoint,
} from '../types';

export const zones: Zone[] = [
  {
    id: 'zone-1',
    name: '育苗区A',
    type: 'seedling',
    crop: '番茄苗',
    cropStage: '幼苗期',
    area: 200,
    plantedDate: '2026-05-15',
    expectedHarvestDate: '2026-07-20',
  },
  {
    id: 'zone-2',
    name: '叶菜区B',
    type: 'leafy',
    crop: '生菜',
    cropStage: '生长期',
    area: 500,
    plantedDate: '2026-05-01',
    expectedHarvestDate: '2026-06-20',
  },
  {
    id: 'zone-3',
    name: '果菜区C',
    type: 'fruit',
    crop: '草莓',
    cropStage: '结果期',
    area: 400,
    plantedDate: '2026-04-10',
    expectedHarvestDate: '2026-06-15',
  },
  {
    id: 'zone-4',
    name: '育苗区D',
    type: 'seedling',
    crop: '黄瓜苗',
    cropStage: '发芽期',
    area: 150,
    plantedDate: '2026-06-01',
    expectedHarvestDate: '2026-08-10',
  },
  {
    id: 'zone-5',
    name: '叶菜区E',
    type: 'leafy',
    crop: '菠菜',
    cropStage: '成熟期',
    area: 350,
    plantedDate: '2026-04-25',
    expectedHarvestDate: '2026-06-10',
  },
  {
    id: 'zone-6',
    name: '果菜区F',
    type: 'fruit',
    crop: '番茄',
    cropStage: '开花期',
    area: 450,
    plantedDate: '2026-05-05',
    expectedHarvestDate: '2026-07-25',
  },
];

const now = new Date().toISOString();

export const generateSensorData = (): SensorData[] => {
  const sensorData: SensorData[] = [];
  const sensorTypes = [
    { type: 'temperature', unit: '°C', min: 15, max: 35 },
    { type: 'humidity', unit: '%', min: 40, max: 85 },
    { type: 'light', unit: 'lux', min: 5000, max: 50000 },
    { type: 'co2', unit: 'ppm', min: 300, max: 1500 },
    { type: 'soil', unit: '%', min: 20, max: 70 },
  ] as const;

  zones.forEach((zone) => {
    sensorTypes.forEach((st) => {
      const value = st.min + Math.random() * (st.max - st.min);
      const isNormal = value >= st.min && value <= st.max;
      sensorData.push({
        id: `${zone.id}-${st.type}`,
        zoneId: zone.id,
        type: st.type,
        value: Math.round(value * 10) / 10,
        unit: st.unit,
        minThreshold: st.min,
        maxThreshold: st.max,
        timestamp: now,
        isNormal,
      });
    });
  });

  return sensorData;
};

export const devices: Device[] = [
  { id: 'dev-1', zoneId: 'zone-1', type: 'curtain', name: '遮阳帘1', status: 'off', autoControl: true, lastActivated: '2026-06-06T08:00:00Z' },
  { id: 'dev-2', zoneId: 'zone-1', type: 'fan', name: '通风扇1', status: 'on', autoControl: true, lastActivated: now },
  { id: 'dev-3', zoneId: 'zone-1', type: 'sprinkler', name: '喷灌系统1', status: 'off', autoControl: true, lastActivated: '2026-06-06T06:00:00Z' },
  { id: 'dev-4', zoneId: 'zone-1', type: 'light', name: '补光灯1', status: 'off', autoControl: true, lastActivated: '2026-06-05T20:00:00Z' },
  { id: 'dev-5', zoneId: 'zone-2', type: 'curtain', name: '遮阳帘2', status: 'on', autoControl: true, lastActivated: now },
  { id: 'dev-6', zoneId: 'zone-2', type: 'fan', name: '通风扇2', status: 'off', autoControl: true, lastActivated: '2026-06-06T10:00:00Z' },
  { id: 'dev-7', zoneId: 'zone-2', type: 'sprinkler', name: '喷灌系统2', status: 'on', autoControl: true, lastActivated: now },
  { id: 'dev-8', zoneId: 'zone-2', type: 'light', name: '补光灯2', status: 'off', autoControl: true, lastActivated: '2026-06-05T19:30:00Z' },
  { id: 'dev-9', zoneId: 'zone-3', type: 'curtain', name: '遮阳帘3', status: 'off', autoControl: false, lastActivated: '2026-06-06T09:00:00Z' },
  { id: 'dev-10', zoneId: 'zone-3', type: 'fan', name: '通风扇3', status: 'on', autoControl: true, lastActivated: now },
  { id: 'dev-11', zoneId: 'zone-3', type: 'sprinkler', name: '喷灌系统3', status: 'off', autoControl: true, lastActivated: '2026-06-06T07:00:00Z' },
  { id: 'dev-12', zoneId: 'zone-3', type: 'light', name: '补光灯3', status: 'on', autoControl: true, lastActivated: now },
];

export const alerts: Alert[] = [
  {
    id: 'alert-1',
    zoneId: 'zone-2',
    sensorType: 'temperature',
    message: '叶菜区B温度超过35°C，已自动启动通风扇',
    level: 'warning',
    timestamp: '2026-06-06T10:30:00Z',
    resolved: true,
    pushedToPhone: true,
  },
  {
    id: 'alert-2',
    zoneId: 'zone-3',
    sensorType: 'humidity',
    message: '果菜区C湿度过低，已自动启动喷灌系统',
    level: 'warning',
    timestamp: '2026-06-06T09:15:00Z',
    resolved: true,
    pushedToPhone: true,
  },
  {
    id: 'alert-3',
    zoneId: 'zone-1',
    sensorType: 'co2',
    message: '育苗区A CO₂浓度超标，请及时通风',
    level: 'critical',
    timestamp: now,
    resolved: false,
    pushedToPhone: true,
  },
  {
    id: 'alert-4',
    zoneId: 'zone-5',
    sensorType: 'soil',
    message: '叶菜区E土壤湿度过低，需要浇水',
    level: 'warning',
    timestamp: '2026-06-06T08:45:00Z',
    resolved: false,
    pushedToPhone: true,
  },
];

export const users: User[] = [
  { id: 'user-1', name: '张工人', role: 'worker', phone: '138****1001', zoneIds: ['zone-1', 'zone-2'] },
  { id: 'user-2', name: '李工人', role: 'worker', phone: '138****1002', zoneIds: ['zone-3', 'zone-4'] },
  { id: 'user-3', name: '王工人', role: 'worker', phone: '138****1003', zoneIds: ['zone-5', 'zone-6'] },
  { id: 'user-4', name: '赵技术员', role: 'technician', phone: '139****2001' },
  { id: 'user-5', name: '钱主管', role: 'supervisor', phone: '139****3001' },
  { id: 'user-6', name: '孙农场主', role: 'owner', phone: '139****4001' },
];

export const tasks: Task[] = [
  {
    id: 'task-1',
    zoneId: 'zone-2',
    type: 'watering',
    title: '叶菜区B浇水',
    description: '根据生长模型，叶菜区B今日需浇水30分钟',
    assignedTo: 'user-1',
    status: 'completed',
    createdAt: '2026-06-06T06:00:00Z',
    dueTime: '2026-06-06T10:00:00Z',
    completedAt: '2026-06-06T09:30:00Z',
    photoUrl: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400',
    escalated: false,
  },
  {
    id: 'task-2',
    zoneId: 'zone-3',
    type: 'fertilizing',
    title: '果菜区C施肥',
    description: '草莓结果期需追加有机肥50kg',
    assignedTo: 'user-2',
    status: 'in_progress',
    createdAt: '2026-06-06T06:00:00Z',
    dueTime: '2026-06-06T12:00:00Z',
    escalated: false,
  },
  {
    id: 'task-3',
    zoneId: 'zone-5',
    type: 'harvesting',
    title: '叶菜区E菠菜采收',
    description: '菠菜已成熟，预计采收200kg',
    assignedTo: 'user-3',
    status: 'pending',
    createdAt: '2026-06-06T06:00:00Z',
    dueTime: '2026-06-06T14:00:00Z',
    escalated: false,
  },
  {
    id: 'task-4',
    zoneId: 'zone-1',
    type: 'pruning',
    title: '育苗区A番茄苗疏叶',
    description: '摘除下部老叶，促进通风透光',
    assignedTo: 'user-1',
    status: 'pending',
    createdAt: '2026-06-06T06:00:00Z',
    dueTime: '2026-06-06T16:00:00Z',
    escalated: false,
  },
  {
    id: 'task-5',
    zoneId: 'zone-6',
    type: 'watering',
    title: '果菜区F番茄浇水',
    description: '开花期保持土壤湿润',
    assignedTo: 'user-3',
    status: 'overdue',
    createdAt: '2026-06-06T06:00:00Z',
    dueTime: '2026-06-06T08:00:00Z',
    escalated: true,
  },
];

export const pestDetections: PestDetection[] = [
  {
    id: 'pest-1',
    zoneId: 'zone-3',
    reportedBy: 'user-2',
    photoUrl: 'https://images.unsplash.com/photo-1592150621744-aca64f48394a?w=400',
    detectedPest: '白粉病',
    confidence: 92,
    recommendedTreatment: '使用三唑酮可湿性粉剂1000倍液喷雾，间隔7天一次，连续2-3次',
    status: 'approved',
    reportedAt: '2026-06-05T14:30:00Z',
    approvedBy: 'user-4',
    approvedAt: '2026-06-05T16:00:00Z',
    harvestLocked: true,
  },
  {
    id: 'pest-2',
    zoneId: 'zone-5',
    reportedBy: 'user-3',
    photoUrl: 'https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=400',
    detectedPest: '蚜虫',
    confidence: 87,
    recommendedTreatment: '使用吡虫啉2000倍液喷雾，重点喷施叶背',
    status: 'detected',
    reportedAt: '2026-06-06T09:00:00Z',
    harvestLocked: false,
  },
];

export const inventoryItems: InventoryItem[] = [
  { id: 'inv-1', type: 'pesticide', name: '三唑酮可湿性粉剂', batchNumber: 'P20260501', quantity: 25, unit: 'kg', safetyStock: 20, expiryDate: '2027-05-01', supplier: '农药供应商A' },
  { id: 'inv-2', type: 'pesticide', name: '吡虫啉', batchNumber: 'P20260415', quantity: 8, unit: 'L', safetyStock: 15, expiryDate: '2027-04-15', supplier: '农药供应商A' },
  { id: 'inv-3', type: 'fertilizer', name: '有机肥', batchNumber: 'F20260510', quantity: 200, unit: 'kg', safetyStock: 100, expiryDate: '2026-11-10', supplier: '肥料供应商B' },
  { id: 'inv-4', type: 'fertilizer', name: '复合肥', batchNumber: 'F20260520', quantity: 150, unit: 'kg', safetyStock: 80, expiryDate: '2027-05-20', supplier: '肥料供应商B' },
  { id: 'inv-5', type: 'pesticide', name: '多菌灵', batchNumber: 'P20260301', quantity: 12, unit: 'kg', safetyStock: 10, expiryDate: '2027-03-01', supplier: '农药供应商C' },
];

export const purchaseWarnings: PurchaseWarning[] = [
  {
    id: 'pw-1',
    itemId: 'inv-2',
    itemName: '吡虫啉',
    currentStock: 8,
    safetyStock: 15,
    status: 'pending',
    createdAt: '2026-06-05T10:00:00Z',
  },
];

export const salesOrders: SalesOrder[] = [
  { id: 'order-1', customer: '超市A', crop: '生菜', quantity: 500, unit: 'kg', deliveryDate: '2026-06-25', status: 'matched' },
  { id: 'order-2', customer: '餐厅B', crop: '草莓', quantity: 200, unit: 'kg', deliveryDate: '2026-06-20', status: 'matched' },
  { id: 'order-3', customer: '批发市场C', crop: '菠菜', quantity: 300, unit: 'kg', deliveryDate: '2026-06-15', status: 'shortage' },
  { id: 'order-4', customer: '电商平台D', crop: '番茄', quantity: 800, unit: 'kg', deliveryDate: '2026-08-01', status: 'pending' },
];

export const yieldPredictions: YieldPrediction[] = [
  { zoneId: 'zone-2', crop: '生菜', predictedYield: 600, unit: 'kg', confidence: 85, historicalYield: 550, currentGrowthRate: 1.08 },
  { zoneId: 'zone-3', crop: '草莓', predictedYield: 250, unit: 'kg', confidence: 90, historicalYield: 220, currentGrowthRate: 1.12 },
  { zoneId: 'zone-5', crop: '菠菜', predictedYield: 280, unit: 'kg', confidence: 88, historicalYield: 300, currentGrowthRate: 0.93 },
  { zoneId: 'zone-6', crop: '番茄', predictedYield: 900, unit: 'kg', confidence: 82, historicalYield: 850, currentGrowthRate: 1.05 },
];

export const monthlyReports: MonthlyReport[] = [
  { month: '2026-01', plantingEfficiency: 85, inputCost: 50000, outputRevenue: 120000, roi: 1.4, yieldPerUnit: 2.5 },
  { month: '2026-02', plantingEfficiency: 88, inputCost: 48000, outputRevenue: 135000, roi: 1.81, yieldPerUnit: 2.7 },
  { month: '2026-03', plantingEfficiency: 82, inputCost: 55000, outputRevenue: 110000, roi: 1.0, yieldPerUnit: 2.3 },
  { month: '2026-04', plantingEfficiency: 90, inputCost: 52000, outputRevenue: 150000, roi: 1.88, yieldPerUnit: 2.9 },
  { month: '2026-05', plantingEfficiency: 87, inputCost: 54000, outputRevenue: 140000, roi: 1.59, yieldPerUnit: 2.6 },
  { month: '2026-06', plantingEfficiency: 89, inputCost: 51000, outputRevenue: 145000, roi: 1.84, yieldPerUnit: 2.8 },
];

export const heatmapPoints: HeatmapPoint[] = [
  { zoneId: 'zone-3', x: 2, y: 1, intensity: 0.8, type: 'pest' },
  { zoneId: 'zone-5', x: 1, y: 2, intensity: 0.6, type: 'pest' },
  { zoneId: 'zone-1', x: 0, y: 0, intensity: 0.3, type: 'env' },
  { zoneId: 'zone-2', x: 1, y: 0, intensity: 0.5, type: 'env' },
  { zoneId: 'zone-4', x: 0, y: 1, intensity: 0.2, type: 'pest' },
  { zoneId: 'zone-6', x: 2, y: 2, intensity: 0.4, type: 'env' },
];
