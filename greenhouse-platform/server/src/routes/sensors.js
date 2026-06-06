import express from 'express';
import { all, get, run } from '../models/db.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const { zoneId, type } = req.query;
    let sql = 'SELECT * FROM sensors WHERE 1=1';
    const params = [];
    if (zoneId) { sql += ' AND zoneId = ?'; params.push(zoneId); }
    if (type) { sql += ' AND type = ?'; params.push(type); }
    sql += ' ORDER BY timestamp DESC';
    const sensors = await all(sql, params);
    res.json(sensors);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/latest', async (req, res) => {
  try {
    const sensors = await all(`
      SELECT s.* FROM sensors s
      INNER JOIN (
        SELECT zoneId, type, MAX(timestamp) as max_ts
        FROM sensors
        GROUP BY zoneId, type
      ) grp ON s.zoneId = grp.zoneId AND s.type = grp.type AND s.timestamp = grp.max_ts
    `);
    res.json(sensors);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { id, zoneId, type, value, unit, minThreshold, maxThreshold } = req.body;
    const timestamp = new Date().toISOString();
    const isNormal = value >= minThreshold && value <= maxThreshold ? 1 : 0;
    await run(
      'INSERT INTO sensors (id, zoneId, type, value, unit, minThreshold, maxThreshold, timestamp, isNormal) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [id, zoneId, type, value, unit, minThreshold, maxThreshold, timestamp, isNormal]
    );
    res.status(201).json({ id, zoneId, type, value, unit, minThreshold, maxThreshold, timestamp, isNormal });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { value, minThreshold, maxThreshold } = req.body;
    const isNormal = value >= minThreshold && value <= maxThreshold ? 1 : 0;
    const result = await run(
      'UPDATE sensors SET value = ?, minThreshold = ?, maxThreshold = ?, timestamp = ?, isNormal = ? WHERE id = ?',
      [value, minThreshold, maxThreshold, new Date().toISOString(), isNormal, req.params.id]
    );
    if (result.changes === 0) return res.status(404).json({ error: '传感器不存在' });
    res.json({ message: '更新成功' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/simulate', async (req, res) => {
  try {
    const sensorTypes = [
      { type: 'temperature', unit: '°C', min: 15, max: 35 },
      { type: 'humidity', unit: '%', min: 40, max: 85 },
      { type: 'light', unit: 'lux', min: 5000, max: 50000 },
      { type: 'co2', unit: 'ppm', min: 300, max: 1500 },
      { type: 'soil', unit: '%', min: 20, max: 70 },
    ];
    const zones = await all('SELECT id FROM zones');
    const timestamp = new Date().toISOString();
    
    for (const zone of zones) {
      for (const st of sensorTypes) {
        const sensor = await get('SELECT id, minThreshold, maxThreshold FROM sensors WHERE zoneId = ? AND type = ?', [zone.id, st.type]);
        if (sensor) {
          const value = st.min + Math.random() * (st.max - st.min);
          const roundedValue = Math.round(value * 10) / 10;
          const isNormal = roundedValue >= sensor.minThreshold && roundedValue <= sensor.maxThreshold ? 1 : 0;
          await run(
            'UPDATE sensors SET value = ?, timestamp = ?, isNormal = ? WHERE id = ?',
            [roundedValue, timestamp, isNormal, sensor.id]
          );
        }
      }
    }
    res.json({ message: '传感器数据模拟更新成功', timestamp });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
