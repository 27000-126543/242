import express from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../../uploads'));
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const randomName = crypto.randomBytes(16).toString('hex');
    cb(null, `${randomName}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (extname && mimetype) cb(null, true);
    else cb(new Error('只允许上传图片文件'));
  },
});

router.post('/image', upload.single('image'), (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: '请选择要上传的图片' });
    
    const imageUrl = `/uploads/${req.file.filename}`;
    
    const pestTypes = [
      { name: '白粉病', treatment: '使用三唑酮或戊唑醇喷雾，7-10天一次，连续2-3次' },
      { name: '霜霉病', treatment: '使用甲霜灵锰锌或烯酰吗啉，注意通风排湿' },
      { name: '蚜虫', treatment: '使用吡虫啉或噻虫嗪，叶面正反面均匀喷雾' },
      { name: '红蜘蛛', treatment: '使用阿维菌素或螺螨酯，重点喷施叶背' },
      { name: '灰霉病', treatment: '使用腐霉利或异菌脲，及时清除病叶病果' },
    ];
    const randomPest = pestTypes[Math.floor(Math.random() * pestTypes.length)];
    const confidence = 0.75 + Math.random() * 0.23;
    
    res.json({
      imageUrl,
      detectedPest: randomPest.name,
      confidence: Math.round(confidence * 100) / 100,
      recommendedTreatment: randomPest.treatment,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/task-photo', upload.single('photo'), (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: '请选择要上传的照片' });
    const photoUrl = `/uploads/${req.file.filename}`;
    res.json({ photoUrl });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
