import express from 'express';
import { all, get, run } from '../models/db.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const zones = await all('SELECT * FROM zones');
    res.json(zones);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const zone = await get('SELECT * FROM zones WHERE id = ?', [req.params.id]);
    if (!zone) return res.status(404).json({ error: '区域不存在' });
    res.json(zone);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { id, name, type, crop, cropStage, area, plantedDate, expectedHarvestDate } = req.body;
    await run(
      'INSERT INTO zones (id, name, type, crop, cropStage, area, plantedDate, expectedHarvestDate) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [id, name, type, crop, cropStage, area, plantedDate, expectedHarvestDate]
    );
    res.status(201).json({ id, name, type, crop, cropStage, area, plantedDate, expectedHarvestDate });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { name, type, crop, cropStage, area, plantedDate, expectedHarvestDate } = req.body;
    const result = await run(
      'UPDATE zones SET name = ?, type = ?, crop = ?, cropStage = ?, area = ?, plantedDate = ?, expectedHarvestDate = ? WHERE id = ?',
      [name, type, crop, cropStage, area, plantedDate, expectedHarvestDate, req.params.id]
    );
    if (result.changes === 0) return res.status(404).json({ error: '区域不存在' });
    res.json({ message: '更新成功' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const result = await run('DELETE FROM zones WHERE id = ?', [req.params.id]);
    if (result.changes === 0) return res.status(404).json({ error: '区域不存在' });
    res.json({ message: '删除成功' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
