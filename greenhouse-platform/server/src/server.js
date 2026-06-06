import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import './models/db.js';

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
app.use('/api/zones', zonesRouter);
app.use('/api/sensors', sensorsRouter);
app.use('/api/devices', devicesRouter);
app.use('/api/alerts', alertsRouter);
app.use('/api/users', usersRouter);
app.use('/api/tasks', tasksRouter);
app.use('/api/pests', pestsRouter);
app.use('/api/inventory', inventoryRouter);
app.use('/api/orders', ordersRouter);
app.use('/api/yield', yieldRouter);
app.use('/api/reports', reportsRouter);
app.use('/api/attendance', attendanceRouter);
app.use('/api/upload', uploadRouter);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`服务器运行在 http://localhost:${PORT}`);
});
