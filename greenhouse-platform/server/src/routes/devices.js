import express from 'express';
import { all, get, run } from '../models/db.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const { zoneId } = req.query;
    let sql = 'SELECT * FROM devices';
    const params = [];
    if (zoneId) { sql += ' WHERE zoneId = ?'; params.push(zoneId); }
    const devices = await all(sql, params);
    res.json(devices);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const device = await get('SELECT * FROM devices WHERE id = ?', [req.params.id]);
    if (!device) return res.status(404).json({ error: '设备不存在' });
    res.json(device);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id/toggle', async (req, res) => {
  try {
    const device = await get('SELECT * FROM devices WHERE id = ?', [req.params.id]);
    if (!device) return res.status(404).json({ error: '设备不存在' });
    const newStatus = device.status === 'on' ? 'off' : 'on';
    const lastActivated = newStatus === 'on' ? new Date().toISOString() : device.lastActivated;
    await run('UPDATE devices SET status = ?, lastActivated = ? WHERE id = ?', [newStatus, lastActivated, req.params.id]);
    res.json({ ...device, status: newStatus, lastActivated });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id/auto-control', async (req, res) => {
  try {
    const device = await get('SELECT * FROM devices WHERE id = ?', [req.params.id]);
    if (!device) return res.status(404).json({ error: '设备不存在' });
    const newAutoControl = device.autoControl ? 0 : 1;
    await run('UPDATE devices SET autoControl = ? WHERE id = ?', [newAutoControl, req.params.id]);
    res.json({ ...device, autoControl: newAutoControl });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
