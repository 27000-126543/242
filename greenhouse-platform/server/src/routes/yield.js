import express from 'express';
import { all, get, run } from '../models/db.js';

const router = express.Router();

router.get('/predictions', async (req, res) => {
  try {
    const { zoneId } = req.query;
    let sql = 'SELECT * FROM yield_predictions WHERE forecastDate = (SELECT MAX(forecastDate) FROM yield_predictions)';
    const params = [];
    if (zoneId) { sql += ' AND zoneId = ?'; params.push(zoneId); }
    const predictions = await all(sql, params);
    res.json(predictions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/match-orders', async (req, res) => {
  try {
    const predictions = await all('SELECT crop, SUM(predictedYield) as totalYield, unit FROM yield_predictions WHERE forecastDate = (SELECT MAX(forecastDate) FROM yield_predictions) GROUP BY crop, unit');
    const orders = await all("SELECT * FROM sales_orders WHERE status IN ('pending', 'matched', 'shortage', 'surplus')");
    
    const cropYieldMap = {};
    predictions.forEach(p => {
      cropYieldMap[p.crop] = { totalYield: p.totalYield, unit: p.unit, allocated: 0 };
    });
    
    const matchedOrders = orders.map(order => {
      const cropData = cropYieldMap[order.crop];
      if (!cropData) {
        return { ...order, matchStatus: 'no_data', gap: 0, surplus: 0 };
      }
      const remaining = cropData.totalYield - cropData.allocated;
      const gap = Math.max(0, order.quantity - remaining);
      const canFulfill = remaining >= order.quantity;
      
      if (canFulfill) {
        cropData.allocated += order.quantity;
      }
      
      return {
        ...order,
        matchStatus: gap > 0 ? 'shortage' : 'matched',
        gap: gap,
        surplus: canFulfill ? remaining - order.quantity : 0,
        totalAvailable: cropData.totalYield,
      };
    });
    
    res.json({ predictions, orders: matchedOrders, cropYieldMap });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/predict', async (req, res) => {
  try {
    const zones = await all('SELECT id, crop FROM zones');
    const forecastDate = new Date().toISOString().split('T')[0];
    
    for (const zone of zones) {
      const historical = 500 + Math.random() * 4000;
      const growthRate = 0.95 + Math.random() * 0.15;
      const predicted = Math.round(historical * growthRate);
      const confidence = 0.75 + Math.random() * 0.2;
      
      await run(
        'INSERT INTO yield_predictions (zoneId, crop, predictedYield, unit, confidence, historicalYield, currentGrowthRate, forecastDate) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [zone.id, zone.crop, predicted, 'kg', confidence, Math.round(historical), growthRate, forecastDate]
      );
    }
    res.json({ message: '产量预测生成成功', forecastDate });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
