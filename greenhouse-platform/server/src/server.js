import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import './models/db.js';
import { authenticateToken } from './middleware/auth.js';

import authRouter from './routes/auth.js';
import zonesRouter from './routes/zones.js';
import sensorsRouter from './routes/sensors.js';
import devicesRouter from './routes/devices.js';
import alertsRouter from './routes/alerts.js';
import usersRouter from './routes/users.js';
import tasksRouter from './routes/tasks.js';
import pestsRouter from './routes/pests.js';
import inventoryRouter from './routes/inventory.js';
import ordersRouter from './routes/orders.js';
import yieldRouter from './routes/yield.js';
import reportsRouter from './routes/reports.js';
import attendanceRouter from './routes/attendance.js';
import uploadRouter from './routes/upload.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3003;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.use('/api/auth', authRouter);
app.use('/api/zones', authenticateToken, zonesRouter);
app.use('/api/sensors', authenticateToken, sensorsRouter);
app.use('/api/devices', authenticateToken, devicesRouter);
app.use('/api/alerts', authenticateToken, alertsRouter);
app.use('/api/users', authenticateToken, usersRouter);
app.use('/api/tasks', authenticateToken, tasksRouter);
app.use('/api/pests', authenticateToken, pestsRouter);
app.use('/api/inventory', authenticateToken, inventoryRouter);
app.use('/api/orders', authenticateToken, ordersRouter);
app.use('/api/yield', authenticateToken, yieldRouter);
app.use('/api/reports', authenticateToken, reportsRouter);
app.use('/api/attendance', authenticateToken, attendanceRouter);
app.use('/api/upload', authenticateToken, uploadRouter);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`服务器运行在 http://localhost:${PORT}`);
});
