import express from 'express';
import { all, get, run } from '../models/db.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const { status, crop } = req.query;
    let sql = 'SELECT * FROM sales_orders WHERE 1=1';
    const params = [];
    if (status) { sql += ' AND status = ?'; params.push(status); }
    if (crop) { sql += ' AND crop LIKE ?'; params.push(`%${crop}%`); }
    sql += ' ORDER BY deliveryDate';
    const orders = await all(sql, params);
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { id, customer, crop, quantity, unit, deliveryDate } = req.body;
    await run(
      'INSERT INTO sales_orders (id, customer, crop, quantity, unit, deliveryDate, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [id, customer, crop, quantity, unit, deliveryDate, 'pending']
    );
    res.status(201).json({ id, customer, crop, quantity, unit, deliveryDate, status: 'pending' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const result = await run('UPDATE sales_orders SET status = ? WHERE id = ?', [status, req.params.id]);
    if (result.changes === 0) return res.status(404).json({ error: '订单不存在' });
    res.json({ message: '状态更新成功' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
