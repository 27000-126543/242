import express from 'express';
import { all, get, run } from '../models/db.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const { zoneId, status } = req.query;
    let sql = 'SELECT * FROM pest_detections WHERE 1=1';
    const params = [];
    if (zoneId) { sql += ' AND zoneId = ?'; params.push(zoneId); }
    if (status) { sql += ' AND status = ?'; params.push(status); }
    sql += ' ORDER BY reportedAt DESC';
    const pests = await all(sql, params);
    res.json(pests);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const pest = await get('SELECT * FROM pest_detections WHERE id = ?', [req.params.id]);
    if (!pest) return res.status(404).json({ error: '检测记录不存在' });
    res.json(pest);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { id, zoneId, reportedBy, photoUrl, detectedPest, confidence, recommendedTreatment } = req.body;
    const reportedAt = new Date().toISOString();
    await run(
      'INSERT INTO pest_detections (id, zoneId, reportedBy, photoUrl, detectedPest, confidence, recommendedTreatment, status, reportedAt, harvestLocked) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 0)',
      [id, zoneId, reportedBy, photoUrl, detectedPest, confidence, recommendedTreatment, 'detected', reportedAt]
    );
    res.status(201).json({ id, zoneId, reportedBy, photoUrl, detectedPest, confidence, recommendedTreatment, status: 'detected', reportedAt, harvestLocked: false });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id/approve', async (req, res) => {
  try {
    const { approvedBy } = req.body;
    const approvedAt = new Date().toISOString();
    const result = await run(
      'UPDATE pest_detections SET status = ?, approvedBy = ?, approvedAt = ?, harvestLocked = 1 WHERE id = ?',
      ['approved', approvedBy, approvedAt, req.params.id]
    );
    if (result.changes === 0) return res.status(404).json({ error: '检测记录不存在' });
    res.json({ message: '审核通过，已锁定该区域采收' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const harvestLocked = status === 'resolved' ? 0 : status === 'approved' || status === 'treated' ? 1 : 0;
    const result = await run(
      'UPDATE pest_detections SET status = ?, harvestLocked = ? WHERE id = ?',
      [status, harvestLocked, req.params.id]
    );
    if (result.changes === 0) return res.status(404).json({ error: '检测记录不存在' });
    res.json({ message: '状态更新成功' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
