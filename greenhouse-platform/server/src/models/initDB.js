import { run } from './db.js';
import bcrypt from 'bcryptjs';

const createTables = async () => {
  try {
    await run(`CREATE TABLE IF NOT EXISTS zones (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      type TEXT NOT NULL,
      crop TEXT NOT NULL,
      cropStage TEXT NOT NULL,
      area REAL NOT NULL,
      plantedDate TEXT NOT NULL,
      expectedHarvestDate TEXT NOT NULL
    )`);

    await run(`CREATE TABLE IF NOT EXISTS sensors (
      id TEXT PRIMARY KEY,
      zoneId TEXT NOT NULL,
      type TEXT NOT NULL,
      value REAL NOT NULL,
      unit TEXT NOT NULL,
      minThreshold REAL NOT NULL,
      maxThreshold REAL NOT NULL,
      timestamp TEXT NOT NULL,
      isNormal INTEGER NOT NULL DEFAULT 1,
      FOREIGN KEY (zoneId) REFERENCES zones(id)
    )`);

    await run(`CREATE TABLE IF NOT EXISTS devices (
      id TEXT PRIMARY KEY,
      zoneId TEXT NOT NULL,
      type TEXT NOT NULL,
      name TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'off',
      autoControl INTEGER NOT NULL DEFAULT 1,
      lastActivated TEXT,
      FOREIGN KEY (zoneId) REFERENCES zones(id)
    )`);

    await run(`CREATE TABLE IF NOT EXISTS alerts (
      id TEXT PRIMARY KEY,
      zoneId TEXT NOT NULL,
      sensorType TEXT NOT NULL,
      message TEXT NOT NULL,
      level TEXT NOT NULL,
      timestamp TEXT NOT NULL,
      resolved INTEGER NOT NULL DEFAULT 0,
      pushedToPhone INTEGER NOT NULL DEFAULT 0,
      FOREIGN KEY (zoneId) REFERENCES zones(id)
    )`);

    await run(`CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      role TEXT NOT NULL,
      phone TEXT NOT NULL,
      avatar TEXT,
      password TEXT NOT NULL DEFAULT '123456'
    )`);

    await run(`CREATE TABLE IF NOT EXISTS user_zones (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId TEXT NOT NULL,
      zoneId TEXT NOT NULL,
      FOREIGN KEY (userId) REFERENCES users(id),
      FOREIGN KEY (zoneId) REFERENCES zones(id)
    )`);

    await run(`CREATE TABLE IF NOT EXISTS tasks (
      id TEXT PRIMARY KEY,
      zoneId TEXT NOT NULL,
      type TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      assignedTo TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending',
      createdAt TEXT NOT NULL,
      dueTime TEXT NOT NULL,
      completedAt TEXT,
      photoUrl TEXT,
      escalated INTEGER NOT NULL DEFAULT 0,
      FOREIGN KEY (zoneId) REFERENCES zones(id),
      FOREIGN KEY (assignedTo) REFERENCES users(id)
    )`);

    await run(`CREATE TABLE IF NOT EXISTS pest_detections (
      id TEXT PRIMARY KEY,
      zoneId TEXT NOT NULL,
      reportedBy TEXT NOT NULL,
      photoUrl TEXT NOT NULL,
      detectedPest TEXT NOT NULL,
      confidence REAL NOT NULL,
      recommendedTreatment TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'detected',
      reportedAt TEXT NOT NULL,
      approvedBy TEXT,
      approvedAt TEXT,
      harvestLocked INTEGER NOT NULL DEFAULT 0,
      FOREIGN KEY (zoneId) REFERENCES zones(id),
      FOREIGN KEY (reportedBy) REFERENCES users(id),
      FOREIGN KEY (approvedBy) REFERENCES users(id)
    )`);

    await run(`CREATE TABLE IF NOT EXISTS inventory_items (
      id TEXT PRIMARY KEY,
      type TEXT NOT NULL,
      name TEXT NOT NULL,
      batchNumber TEXT NOT NULL,
      quantity REAL NOT NULL,
      unit TEXT NOT NULL,
      safetyStock REAL NOT NULL,
      expiryDate TEXT NOT NULL,
      supplier TEXT NOT NULL
    )`);

    await run(`CREATE TABLE IF NOT EXISTS purchase_warnings (
      id TEXT PRIMARY KEY,
      itemId TEXT NOT NULL,
      itemName TEXT NOT NULL,
      currentStock REAL NOT NULL,
      safetyStock REAL NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending',
      createdAt TEXT NOT NULL,
      approvedBy TEXT,
      FOREIGN KEY (itemId) REFERENCES inventory_items(id),
      FOREIGN KEY (approvedBy) REFERENCES users(id)
    )`);

    await run(`CREATE TABLE IF NOT EXISTS sales_orders (
      id TEXT PRIMARY KEY,
      customer TEXT NOT NULL,
      crop TEXT NOT NULL,
      quantity REAL NOT NULL,
      unit TEXT NOT NULL,
      deliveryDate TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending'
    )`);

    await run(`CREATE TABLE IF NOT EXISTS yield_predictions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      zoneId TEXT NOT NULL,
      crop TEXT NOT NULL,
      predictedYield REAL NOT NULL,
      unit TEXT NOT NULL,
      confidence REAL NOT NULL,
      historicalYield REAL NOT NULL,
      currentGrowthRate REAL NOT NULL,
      forecastDate TEXT NOT NULL,
      FOREIGN KEY (zoneId) REFERENCES zones(id)
    )`);

    await run(`CREATE TABLE IF NOT EXISTS attendance_records (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId TEXT NOT NULL,
      checkInTime TEXT NOT NULL,
      qrCode TEXT NOT NULL,
      location TEXT,
      FOREIGN KEY (userId) REFERENCES users(id)
    )`);

    await run(`CREATE TABLE IF NOT EXISTS monthly_reports (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      month TEXT NOT NULL UNIQUE,
      plantingEfficiency REAL NOT NULL,
      inputCost REAL NOT NULL,
      outputRevenue REAL NOT NULL,
      roi REAL NOT NULL,
      yieldPerUnit REAL NOT NULL
    )`);

    console.log('所有表创建成功');
  } catch (err) {
    console.error('创建表失败:', err);
  }
};

const seedData = async () => {
  try {
    const zonesData = [
      { id: 'zone-1', name: '育苗区A', type: 'seedling', crop: '番茄苗', cropStage: '幼苗期', area: 200, plantedDate: '2026-05-01', expectedHarvestDate: '2026-06-15' },
      { id: 'zone-2', name: '育苗区B', type: 'seedling', crop: '黄瓜苗', cropStage: '成苗期', area: 200, plantedDate: '2026-04-20', expectedHarvestDate: '2026-06-05' },
      { id: 'zone-3', name: '叶菜区A', type: 'leafy', crop: '生菜', cropStage: '生长期', area: 500, plantedDate: '2026-05-10', expectedHarvestDate: '2026-06-20' },
      { id: 'zone-4', name: '叶菜区B', type: 'leafy', crop: '菠菜', cropStage: '采收期', area: 500, plantedDate: '2026-04-15', expectedHarvestDate: '2026-06-10' },
      { id: 'zone-5', name: '果菜区A', type: 'fruit', crop: '番茄', cropStage: '结果期', area: 800, plantedDate: '2026-03-01', expectedHarvestDate: '2026-06-30' },
      { id: 'zone-6', name: '果菜区B', type: 'fruit', crop: '黄瓜', cropStage: '盛果期', area: 800, plantedDate: '2026-03-15', expectedHarvestDate: '2026-07-15' },
    ];

    for (const zone of zonesData) {
      await run(
        'INSERT OR IGNORE INTO zones (id, name, type, crop, cropStage, area, plantedDate, expectedHarvestDate) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [zone.id, zone.name, zone.type, zone.crop, zone.cropStage, zone.area, zone.plantedDate, zone.expectedHarvestDate]
      );
    }

    const sensorTypes = [
      { type: 'temperature', unit: '°C', min: 15, max: 35 },
      { type: 'humidity', unit: '%', min: 40, max: 85 },
      { type: 'light', unit: 'lux', min: 5000, max: 50000 },
      { type: 'co2', unit: 'ppm', min: 300, max: 1500 },
      { type: 'soil', unit: '%', min: 20, max: 70 },
    ];

    let sensorId = 1;
    for (const zone of zonesData) {
      for (const st of sensorTypes) {
        const value = st.min + Math.random() * (st.max - st.min);
        const isNormal = value >= st.min && value <= st.max ? 1 : 0;
        await run(
          'INSERT OR IGNORE INTO sensors (id, zoneId, type, value, unit, minThreshold, maxThreshold, timestamp, isNormal) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
          [`sensor-${sensorId}`, zone.id, st.type, Math.round(value * 10) / 10, st.unit, st.min, st.max, new Date().toISOString(), isNormal]
        );
        sensorId++;
      }
    }

    const deviceTypes = [
      { type: 'curtain', name: '电动卷帘' },
      { type: 'fan', name: '通风风机' },
      { type: 'sprinkler', name: '喷灌系统' },
      { type: 'light', name: 'LED补光灯' },
    ];

    let deviceId = 1;
    for (const zone of zonesData) {
      for (const dt of deviceTypes) {
        await run(
          'INSERT OR IGNORE INTO devices (id, zoneId, type, name, status, autoControl, lastActivated) VALUES (?, ?, ?, ?, ?, ?, ?)',
          [`device-${deviceId}`, zone.id, dt.type, `${dt.name}-${zone.name}`, 'off', 1, null]
        );
        deviceId++;
      }
    }

    const hashedPassword = await bcrypt.hash('123456', 10);
    const usersData = [
      { id: 'user-1', name: '张农场主', role: 'owner', phone: '13800138001' },
      { id: 'user-2', name: '李主管', role: 'supervisor', phone: '13800138002' },
      { id: 'user-3', name: '王技术员', role: 'technician', phone: '13800138003' },
      { id: 'user-4', name: '刘工人', role: 'worker', phone: '13800138004' },
      { id: 'user-5', name: '陈工人', role: 'worker', phone: '13800138005' },
    ];

    for (const user of usersData) {
      await run(
        'INSERT OR IGNORE INTO users (id, name, role, phone, password) VALUES (?, ?, ?, ?, ?)',
        [user.id, user.name, user.role, user.phone, hashedPassword]
      );
    }

    const userZonesData = [
      { userId: 'user-4', zoneId: 'zone-3' },
      { userId: 'user-4', zoneId: 'zone-4' },
      { userId: 'user-5', zoneId: 'zone-5' },
      { userId: 'user-5', zoneId: 'zone-6' },
    ];

    for (const uz of userZonesData) {
      await run(
        'INSERT OR IGNORE INTO user_zones (userId, zoneId) VALUES (?, ?)',
        [uz.userId, uz.zoneId]
      );
    }

    const tasksData = [
      { id: 'task-1', zoneId: 'zone-3', type: 'watering', title: '浇水灌溉', description: '叶菜区A生菜浇水，确保土壤湿度达到60%', assignedTo: 'user-4', status: 'pending', createdAt: new Date().toISOString(), dueTime: new Date(Date.now() + 3600000).toISOString() },
      { id: 'task-2', zoneId: 'zone-4', type: 'harvesting', title: '采收菠菜', description: '叶菜区B菠菜达到采收标准，及时采收', assignedTo: 'user-4', status: 'in_progress', createdAt: new Date(Date.now() - 7200000).toISOString(), dueTime: new Date(Date.now() + 1800000).toISOString() },
      { id: 'task-3', zoneId: 'zone-5', type: 'fertilizing', title: '施肥作业', description: '果菜区A番茄追施钾肥，促进果实膨大', assignedTo: 'user-5', status: 'pending', createdAt: new Date().toISOString(), dueTime: new Date(Date.now() + 7200000).toISOString() },
      { id: 'task-4', zoneId: 'zone-6', type: 'pruning', title: '整枝疏叶', description: '果菜区B黄瓜整枝，去除老叶病叶', assignedTo: 'user-5', status: 'completed', createdAt: new Date(Date.now() - 86400000).toISOString(), dueTime: new Date(Date.now() - 43200000).toISOString(), completedAt: new Date(Date.now() - 50000000).toISOString() },
    ];

    for (const task of tasksData) {
      await run(
        'INSERT OR IGNORE INTO tasks (id, zoneId, type, title, description, assignedTo, status, createdAt, dueTime, completedAt, escalated) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [task.id, task.zoneId, task.type, task.title, task.description, task.assignedTo, task.status, task.createdAt, task.dueTime, task.completedAt || null, 0]
      );
    }

    const inventoryData = [
      { id: 'inv-1', type: 'pesticide', name: '多菌灵', batchNumber: 'P20260501', quantity: 50, unit: 'kg', safetyStock: 20, expiryDate: '2027-05-01', supplier: '农业科技公司' },
      { id: 'inv-2', type: 'pesticide', name: '吡虫啉', batchNumber: 'P20260415', quantity: 15, unit: 'kg', safetyStock: 20, expiryDate: '2027-04-15', supplier: '农业科技公司' },
      { id: 'inv-3', type: 'fertilizer', name: '复合肥(NPK)', batchNumber: 'F20260510', quantity: 200, unit: 'kg', safetyStock: 100, expiryDate: '2028-05-10', supplier: '化肥厂' },
      { id: 'inv-4', type: 'fertilizer', name: '磷酸二氢钾', batchNumber: 'F20260420', quantity: 80, unit: 'kg', safetyStock: 50, expiryDate: '2028-04-20', supplier: '化肥厂' },
    ];

    for (const item of inventoryData) {
      await run(
        'INSERT OR IGNORE INTO inventory_items (id, type, name, batchNumber, quantity, unit, safetyStock, expiryDate, supplier) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [item.id, item.type, item.name, item.batchNumber, item.quantity, item.unit, item.safetyStock, item.expiryDate, item.supplier]
      );
    }

    const ordersData = [
      { id: 'order-1', customer: '永辉超市', crop: '番茄', quantity: 500, unit: 'kg', deliveryDate: '2026-06-25', status: 'pending' },
      { id: 'order-2', customer: '盒马鲜生', crop: '黄瓜', quantity: 300, unit: 'kg', deliveryDate: '2026-06-20', status: 'pending' },
      { id: 'order-3', customer: '沃尔玛', crop: '生菜', quantity: 200, unit: 'kg', deliveryDate: '2026-06-15', status: 'pending' },
    ];

    for (const order of ordersData) {
      await run(
        'INSERT OR IGNORE INTO sales_orders (id, customer, crop, quantity, unit, deliveryDate, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [order.id, order.customer, order.crop, order.quantity, order.unit, order.deliveryDate, order.status]
      );
    }

    const yieldData = [
      { zoneId: 'zone-3', crop: '生菜', predictedYield: 800, unit: 'kg', confidence: 0.85, historicalYield: 750, currentGrowthRate: 1.05 },
      { zoneId: 'zone-4', crop: '菠菜', predictedYield: 600, unit: 'kg', confidence: 0.9, historicalYield: 580, currentGrowthRate: 1.02 },
      { zoneId: 'zone-5', crop: '番茄', predictedYield: 3000, unit: 'kg', confidence: 0.8, historicalYield: 2800, currentGrowthRate: 1.08 },
      { zoneId: 'zone-6', crop: '黄瓜', predictedYield: 4000, unit: 'kg', confidence: 0.88, historicalYield: 3800, currentGrowthRate: 1.06 },
    ];

    for (const yp of yieldData) {
      await run(
        'INSERT OR IGNORE INTO yield_predictions (zoneId, crop, predictedYield, unit, confidence, historicalYield, currentGrowthRate, forecastDate) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [yp.zoneId, yp.crop, yp.predictedYield, yp.unit, yp.confidence, yp.historicalYield, yp.currentGrowthRate, new Date().toISOString().split('T')[0]]
      );
    }

    const reportData = [
      { month: '2026-01', plantingEfficiency: 85.5, inputCost: 50000, outputRevenue: 120000, roi: 1.4, yieldPerUnit: 12.5 },
      { month: '2026-02', plantingEfficiency: 87.2, inputCost: 52000, outputRevenue: 125000, roi: 1.4, yieldPerUnit: 13.0 },
      { month: '2026-03', plantingEfficiency: 88.0, inputCost: 55000, outputRevenue: 135000, roi: 1.45, yieldPerUnit: 13.5 },
      { month: '2026-04', plantingEfficiency: 89.5, inputCost: 58000, outputRevenue: 145000, roi: 1.5, yieldPerUnit: 14.2 },
      { month: '2026-05', plantingEfficiency: 91.0, inputCost: 60000, outputRevenue: 155000, roi: 1.58, yieldPerUnit: 15.0 },
    ];

    for (const report of reportData) {
      await run(
        'INSERT OR IGNORE INTO monthly_reports (month, plantingEfficiency, inputCost, outputRevenue, roi, yieldPerUnit) VALUES (?, ?, ?, ?, ?, ?)',
        [report.month, report.plantingEfficiency, report.inputCost, report.outputRevenue, report.roi, report.yieldPerUnit]
      );
    }

    console.log('初始数据插入成功');
  } catch (err) {
    console.error('插入初始数据失败:', err);
  }
};

const init = async () => {
  await createTables();
  await seedData();
  process.exit(0);
};

init();
