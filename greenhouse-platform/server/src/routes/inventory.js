import express from 'express';
import { all, get, run } from '../models/db.js';

const router = express.Router();

router.get('/items', async (req, res) => {
  try {
    const { type } = req.query;
    let sql = 'SELECT * FROM inventory_items';
    const params = [];
    if (type) { sql += ' WHERE type = ?'; params.push(type); }
    const items = await all(sql, params);
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/items', async (req, res) => {
  try {
    const { id, type, name, batchNumber, quantity, unit, safetyStock, expiryDate, supplier } = req.body;
    await run(
      'INSERT INTO inventory_items (id, type, name, batchNumber, quantity, unit, safetyStock, expiryDate, supplier) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [id, type, name, batchNumber, quantity, unit, safetyStock, expiryDate, supplier]
    );
    res.status(201).json({ id, type, name, batchNumber, quantity, unit, safetyStock, expiryDate, supplier });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/items/:id', async (req, res) => {
  try {
    const { quantity } = req.body;
    const result = await run('UPDATE inventory_items SET quantity = ? WHERE id = ?', [quantity, req.params.id]);
    if (result.changes === 0) return res.status(404).json({ error: '库存物品不存在' });
    res.json({ message: '库存更新成功' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/warnings', async (req, res) => {
  try {
    const { status } = req.query;
    let sql = 'SELECT * FROM purchase_warnings';
    const params = [];
    if (status) { sql += ' WHERE status = ?'; params.push(status); }
    sql += ' ORDER BY createdAt DESC';
    const warnings = await all(sql, params);
    res.json(warnings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/warnings', async (req, res) => {
  try {
    const { id, itemId, itemName, currentStock, safetyStock } = req.body;
    const createdAt = new Date().toISOString();
    await run(
      'INSERT INTO purchase_warnings (id, itemId, itemName, currentStock, safetyStock, status, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [id, itemId, itemName, currentStock, safetyStock, 'pending', createdAt]
    );
    res.status(201).json({ id, itemId, itemName, currentStock, safetyStock, status: 'pending', createdAt });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/warnings/:id/approve', async (req, res) => {
  try {
    const { approvedBy } = req.body;
    const result = await run(
      'UPDATE purchase_warnings SET status = ?, approvedBy = ? WHERE id = ?',
      ['approved', approvedBy, req.params.id]
    );
    if (result.changes === 0) return res.status(404).json({ error: '预警不存在' });
    res.json({ message: '审批通过' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
