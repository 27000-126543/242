import express from 'express';
import { all, get, run } from '../models/db.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const { assignedTo, zoneId, status } = req.query;
    const user = req.user;
    let sql = 'SELECT * FROM tasks WHERE 1=1';
    const params = [];

    if (user.role === 'worker') {
      sql += ' AND assignedTo = ?';
      params.push(user.id);
    } else if (user.role === 'technician') {
      if (user.zoneIds && user.zoneIds.length > 0) {
        const placeholders = user.zoneIds.map(() => '?').join(',');
        sql += ` AND zoneId IN (${placeholders})`;
        params.push(...user.zoneIds);
      }
    }

    if (assignedTo) { sql += ' AND assignedTo = ?'; params.push(assignedTo); }
    if (zoneId) { sql += ' AND zoneId = ?'; params.push(zoneId); }
    if (status) { sql += ' AND status = ?'; params.push(status); }
    sql += ' ORDER BY createdAt DESC';
    const tasks = await all(sql, params);
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const task = await get('SELECT * FROM tasks WHERE id = ?', [req.params.id]);
    if (!task) return res.status(404).json({ error: '任务不存在' });
    res.json(task);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { id, zoneId, type, title, description, assignedTo } = req.body;
    const createdAt = new Date().toISOString();
    const dueTime = new Date(Date.now() + 86400000).toISOString();
    await run(
      'INSERT INTO tasks (id, zoneId, type, title, description, assignedTo, status, createdAt, dueTime, escalated) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 0)',
      [id, zoneId, type, title, description, assignedTo, 'pending', createdAt, dueTime]
    );
    res.status(201).json({ id, zoneId, type, title, description, assignedTo, status: 'pending', createdAt, dueTime, escalated: false });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id/status', async (req, res) => {
  try {
    const { status, photoUrl } = req.body;
    const completedAt = status === 'completed' ? new Date().toISOString() : null;
    const result = await run(
      'UPDATE tasks SET status = ?, completedAt = ?, photoUrl = ? WHERE id = ?',
      [status, completedAt, photoUrl || null, req.params.id]
    );
    if (result.changes === 0) return res.status(404).json({ error: '任务不存在' });
    res.json({ message: '状态更新成功' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id/escalate', async (req, res) => {
  try {
    const result = await run('UPDATE tasks SET escalated = 1 WHERE id = ?', [req.params.id]);
    if (result.changes === 0) return res.status(404).json({ error: '任务不存在' });
    res.json({ message: '任务已升级' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
