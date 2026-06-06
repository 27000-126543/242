import express from 'express';
import ExcelJS from 'exceljs';
import { all, get } from '../models/db.js';

const router = express.Router();

router.get('/monthly', async (req, res) => {
  try {
    const { month, zoneId } = req.query;
    let sql = 'SELECT * FROM monthly_reports';
    const params = [];
    if (month) { sql += ' WHERE month = ?'; params.push(month); }
    sql += ' ORDER BY month';
    const reports = await all(sql, params);
    res.json(reports);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/efficiency', async (req, res) => {
  try {
    const { zoneId, startDate, endDate } = req.query;
    
    const tasks = await all('SELECT status, COUNT(*) as count FROM tasks GROUP BY status');
    const sensors = await all('SELECT isNormal, COUNT(*) as count FROM sensors GROUP BY isNormal');
    const totalTasks = tasks.reduce((sum, t) => sum + t.count, 0);
    const completedTasks = tasks.find(t => t.status === 'completed')?.count || 0;
    const taskCompletionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
    const totalSensors = sensors.reduce((sum, s) => sum + s.count, 0);
    const normalSensors = sensors.find(s => s.isNormal === 1)?.count || 0;
    const envComplianceRate = totalSensors > 0 ? Math.round((normalSensors / totalSensors) * 100) : 0;
    
    res.json({
      taskCompletionRate,
      envComplianceRate,
      totalTasks,
      completedTasks,
      totalSensors,
      normalSensors,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/export/efficiency', async (req, res) => {
  try {
    const reports = await all('SELECT * FROM monthly_reports ORDER BY month');
    
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('种植效率分析');
    
    worksheet.columns = [
      { header: '月份', key: 'month', width: 15 },
      { header: '种植效率(%)', key: 'plantingEfficiency', width: 15 },
      { header: '投入成本(元)', key: 'inputCost', width: 15 },
      { header: '产出收入(元)', key: 'outputRevenue', width: 15 },
      { header: 'ROI', key: 'roi', width: 10 },
      { header: '单位面积产量(kg/㎡)', key: 'yieldPerUnit', width: 20 },
    ];
    
    worksheet.getRow(1).font = { bold: true, size: 12 };
    worksheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE2EFDA' } };
    
    reports.forEach(r => worksheet.addRow(r));
    
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=种植效率分析报告.xlsx');
    
    await workbook.xlsx.write(res);
    res.end();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/export/io', async (req, res) => {
  try {
    const reports = await all('SELECT * FROM monthly_reports ORDER BY month');
    const inventory = await all('SELECT * FROM inventory_items');
    
    const workbook = new ExcelJS.Workbook();
    
    const ws1 = workbook.addWorksheet('投入产出明细');
    ws1.columns = [
      { header: '月份', key: 'month', width: 15 },
      { header: '投入成本(元)', key: 'inputCost', width: 15 },
      { header: '产出收入(元)', key: 'outputRevenue', width: 15 },
      { header: '利润(元)', key: 'profit', width: 15 },
      { header: 'ROI', key: 'roi', width: 10 },
    ];
    ws1.getRow(1).font = { bold: true, size: 12 };
    ws1.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFDDEBF7' } };
    reports.forEach(r => ws1.addRow({ ...r, profit: r.outputRevenue - r.inputCost }));
    
    const ws2 = workbook.addWorksheet('库存明细');
    ws2.columns = [
      { header: '类型', key: 'type', width: 12 },
      { header: '名称', key: 'name', width: 20 },
      { header: '批次号', key: 'batchNumber', width: 15 },
      { header: '库存', key: 'quantity', width: 10 },
      { header: '单位', key: 'unit', width: 8 },
      { header: '安全库存', key: 'safetyStock', width: 12 },
      { header: '有效期', key: 'expiryDate', width: 15 },
      { header: '供应商', key: 'supplier', width: 20 },
    ];
    ws2.getRow(1).font = { bold: true, size: 12 };
    ws2.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFF2CC' } };
    inventory.forEach(item => ws2.addRow(item));
    
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=投入产出明细.xlsx');
    
    await workbook.xlsx.write(res);
    res.end();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
