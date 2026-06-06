import express from 'express';
import bcrypt from 'bcryptjs';
import { get, all } from '../models/db.js';
import { generateToken } from '../middleware/auth.js';

const router = express.Router();

router.post('/login', async (req, res) => {
  try {
    const { phone, password } = req.body;

    if (!phone || !password) {
      return res.status(400).json({ error: '请输入手机号和密码' });
    }

    const user = await get('SELECT * FROM users WHERE phone = ?', [phone]);
    if (!user) {
      return res.status(401).json({ error: '用户不存在' });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: '密码错误' });
    }

    let zoneIds = [];
    if (user.role === 'owner' || user.role === 'supervisor') {
      const allZones = await all('SELECT id FROM zones');
      zoneIds = allZones.map(z => z.id);
    } else {
      const userZones = await all('SELECT DISTINCT zoneId FROM user_zones WHERE userId = ?', [user.id]);
      zoneIds = userZones.map(z => z.zoneId);
    }

    const token = generateToken({ ...user, zoneIds });

    const { password: _, ...userWithoutPassword } = user;
    res.json({
      token,
      user: { ...userWithoutPassword, zoneIds }
    });
  } catch (err) {
    console.error('登录失败:', err);
    res.status(500).json({ error: '登录失败' });
  }
});

router.post('/verify-token', async (req, res) => {
  res.json({ valid: true });
});

export default router;
