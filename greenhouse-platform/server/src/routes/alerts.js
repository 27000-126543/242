import express from 'express';
import { all, get, run } from '../models/db.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const { zoneId, resolved, level } = req.query;
    let sql = 'SELECT * FROM alerts WHERE 1=1';
    const params = [];
    if (zoneId) { sql += ' AND zoneId = ?'; params.push(zoneId); }
    if (resolved !== undefined) { sql += ' AND resolved = ?'; params.push(resolved === 'true' ? 1 : 0); }
    if (level) { sql += ' AND level = ?'; params.push(level); }
    sql += ' ORDER BY timestamp DESC';
    const alerts = await all(sql, params);
    res.json(alerts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { id, zoneId, sensorType, message, level } = req.body;
    const timestamp = new Date().toISOString();
    await run(
      'INSERT INTO alerts (id, zoneId, sensorType, message, level, timestamp, resolved, pushedToPhone) VALUES (?, ?, ?, ?, ?, ?, 0, 0)',
      [id, zoneId, sensorType, message, level, timestamp]
    );
    res.status(201).json({ id, zoneId, sensorType, message, level, timestamp, resolved: false, pushedToPhone: false });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id/resolve', async (req, res) => {
  try {
    const result = await run('UPDATE alerts SET resolved = 1 WHERE id = ?', [req.params.id]);
    if (result.changes === 0) return res.status(404).json({ error: '告警不存在' });
    res.json({ message: '告警已处理' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
