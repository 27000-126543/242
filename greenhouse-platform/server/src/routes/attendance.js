import express from 'express';
import QRCode from 'qrcode';
import { all, get, run } from '../models/db.js';

const router = express.Router();

router.get('/qrcode/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;
    const user = await get('SELECT id, name FROM users WHERE id = ?', [userId]);
    if (!user) return res.status(404).json({ error: '用户不存在' });
    
    const qrData = JSON.stringify({
      userId: user.id,
      userName: user.name,
      timestamp: Date.now(),
      type: 'attendance',
    });
    
    const qrCodeDataURL = await QRCode.toDataURL(qrData);
    res.json({ qrCode: qrCodeDataURL, data: qrData });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/checkin', async (req, res) => {
  try {
    const { userId, qrCode, location } = req.body;
    const user = await get('SELECT id, name FROM users WHERE id = ?', [userId]);
    if (!user) return res.status(404).json({ error: '用户不存在' });
    
    const checkInTime = new Date().toISOString();
    const result = await run(
      'INSERT INTO attendance_records (userId, checkInTime, qrCode, location) VALUES (?, ?, ?, ?)',
      [userId, checkInTime, qrCode, location || '']
    );
    
    res.json({
      id: result.id,
      userId,
      userName: user.name,
      checkInTime,
      message: '打卡成功',
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/records', async (req, res) => {
  try {
    const { userId, startDate, endDate } = req.query;
    let sql = `
      SELECT ar.*, u.name as userName 
      FROM attendance_records ar 
      LEFT JOIN users u ON ar.userId = u.id 
      WHERE 1=1
    `;
    const params = [];
    if (userId) { sql += ' AND ar.userId = ?'; params.push(userId); }
    sql += ' ORDER BY ar.checkInTime DESC LIMIT 100';
    const records = await all(sql, params);
    res.json(records);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
