import express from 'express';
import { all, get, run } from '../models/db.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const { role } = req.query;
    let sql = 'SELECT id, name, role, phone, avatar FROM users';
    const params = [];
    if (role) { sql += ' WHERE role = ?'; params.push(role); }
    const users = await all(sql, params);
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const user = await get('SELECT id, name, role, phone, avatar FROM users WHERE id = ?', [req.params.id]);
    if (!user) return res.status(404).json({ error: '用户不存在' });
    const zones = await all('SELECT zoneId FROM user_zones WHERE userId = ?', [req.params.id]);
    user.zoneIds = zones.map(z => z.zoneId);
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { id, name, role, phone, zoneIds = [] } = req.body;
    await run(
      'INSERT INTO users (id, name, role, phone, password) VALUES (?, ?, ?, ?, ?)',
      [id, name, role, phone, '123456']
    );
    for (const zoneId of zoneIds) {
      await run('INSERT INTO user_zones (userId, zoneId) VALUES (?, ?)', [id, zoneId]);
    }
    res.status(201).json({ id, name, role, phone, zoneIds });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { name, role, phone, zoneIds } = req.body;
    await run('UPDATE users SET name = ?, role = ?, phone = ? WHERE id = ?', [name, role, phone, req.params.id]);
    if (zoneIds) {
      await run('DELETE FROM user_zones WHERE userId = ?', [req.params.id]);
      for (const zoneId of zoneIds) {
        await run('INSERT INTO user_zones (userId, zoneId) VALUES (?, ?)', [req.params.id, zoneId]);
      }
    }
    res.json({ message: '更新成功' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
