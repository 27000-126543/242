import React, { useEffect, useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  Legend,
} from 'recharts';
import {
  Thermometer,
  Droplets,
  Sun,
  Wind,
  Sprout,
  CheckCircle,
  Clock,
  AlertTriangle,
  TrendingUp,
  RefreshCw,
  Filter,
  Download,
} from 'lucide-react';
import { useAppStore } from '../store';
import {
  formatDateTime,
  getZoneName,
  getSensorTypeName,
  getTaskStatusName,
  getTaskStatusColor,
  getZoneTypeColor,
} from '../utils';
import { heatmapPoints, monthlyReports } from '../data/mockData';

const Dashboard: React.FC = () => {
  const {
    zones,
    sensorData,
    tasks,
    alerts,
    pestDetections,
    yieldPredictions,
    refreshSensorData,
    lastRefresh,
  } = useAppStore();

  const [selectedZone, setSelectedZone] = useState<string>('all');
  const [selectedDate, setSelectedDate] = useState<string>('today');
  const [selectedCrop, setSelectedCrop] = useState<string>('all');

  useEffect(() => {
    const interval = setInterval(() => {
      refreshSensorData();
    }, 5000);
    return () => clearInterval(interval);
  }, [refreshSensorData]);

  const calculateEnvCompliance = () => {
    const zoneRates: Record<string, number> = {};
    zones.forEach((zone) => {
      const zoneSensors = sensorData.filter((s) => s.zoneId === zone.id);
      const normalCount = zoneSensors.filter((s) => s.isNormal).length;
      zoneRates[zone.type] = zoneRates[zone.type] || 0;
      const rate = zoneSensors.length > 0 ? (normalCount / zoneSensors.length) * 100 : 0;
      zoneRates[zone.type] = Math.max(zoneRates[zone.type], rate);
    });
    return zoneRates;
  };

  const envCompliance = calculateEnvCompliance();
  const overallCompliance = Object.values(envCompliance).length > 0
    ? Object.values(envCompliance).reduce((a, b) => a + b, 0) / Object.values(envCompliance).length
    : 0;

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.status === 'completed').length;
  const inProgressTasks = tasks.filter((t) => t.status === 'in_progress').length;
  const pendingTasks = tasks.filter((t) => t.status === 'pending').length;
  const overdueTasks = tasks.filter((t) => t.status === 'overdue' || t.status === 'escalated').length;
  const taskCompletionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  const activeAlerts = alerts.filter((a) => !a.resolved).length;
  const activePests = pestDetections.filter((p) => p.status !== 'resolved').length;

  const yieldComparisonData = yieldPredictions.map((yp) => ({
    name: yp.crop,
    预测产量: yp.predictedYield,
    历史产量: yp.historicalYield,
  }));

  const taskTrendData = [
    { time: '06:00', 完成: 0, 待处理: 5 },
    { time: '08:00', 完成: 1, 待处理: 4 },
    { time: '10:00', 完成: 1, 待处理: 4 },
    { time: '12:00', 完成: 2, 待处理: 3 },
    { time: '14:00', 完成: 2, 待处理: 3 },
    { time: '16:00', 完成: 3, 待处理: 2 },
  ];

  const zoneTypeData = [
    { name: '育苗区', value: zones.filter((z) => z.type === 'seedling').length, color: '#10b981' },
    { name: '叶菜区', value: zones.filter((z) => z.type === 'leafy').length, color: '#22c55e' },
    { name: '果菜区', value: zones.filter((z) => z.type === 'fruit').length, color: '#f97316' },
  ];

  const getHeatmapColor = (intensity: number, type: string) => {
    if (type === 'pest') {
      if (intensity > 0.7) return 'bg-red-500';
      if (intensity > 0.4) return 'bg-orange-500';
      return 'bg-yellow-500';
    } else {
      if (intensity > 0.7) return 'bg-red-500';
      if (intensity > 0.4) return 'bg-yellow-500';
      return 'bg-green-500';
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">智慧温室数据大屏</h2>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-white rounded-lg px-3 py-2 border border-gray-200">
            <Filter size={16} className="text-gray-500" />
            <select
              value={selectedZone}
              onChange={(e) => setSelectedZone(e.target.value)}
              className="text-sm border-none outline-none bg-transparent"
            >
              <option value="all">全部区域</option>
              {zones.map((z) => (
                <option key={z.id} value={z.id}>{z.name}</option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2 bg-white rounded-lg px-3 py-2 border border-gray-200">
            <select
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="text-sm border-none outline-none bg-transparent"
            >
              <option value="today">今日</option>
              <option value="week">本周</option>
              <option value="month">本月</option>
            </select>
          </div>
          <div className="flex items-center gap-2 bg-white rounded-lg px-3 py-2 border border-gray-200">
            <select
              value={selectedCrop}
              onChange={(e) => setSelectedCrop(e.target.value)}
              className="text-sm border-none outline-none bg-transparent"
            >
              <option value="all">全部作物</option>
              <option value="番茄">番茄</option>
              <option value="生菜">生菜</option>
              <option value="草莓">草莓</option>
              <option value="菠菜">菠菜</option>
            </select>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm">
            <Download size={16} />
            导出报告
          </button>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <span className="text-gray-500 text-sm">环境达标率</span>
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle size={20} className="text-green-600" />
            </div>
          </div>
          <div className="text-3xl font-bold text-gray-800 mb-1">
            {overallCompliance.toFixed(1)}%
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-green-600">↑ 2.3%</span>
            <span className="text-gray-400">较昨日</span>
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <span className="text-gray-500 text-sm">今日任务完成</span>
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Clock size={20} className="text-blue-600" />
            </div>
          </div>
          <div className="text-3xl font-bold text-gray-800 mb-1">
            {completedTasks}/{totalTasks}
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-500 h-2 rounded-full transition-all"
              style={{ width: `${taskCompletionRate}%` }}
            />
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <span className="text-gray-500 text-sm">活跃告警</span>
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              <AlertTriangle size={20} className="text-red-600" />
            </div>
          </div>
          <div className="text-3xl font-bold text-gray-800 mb-1">
            {activeAlerts + activePests}
          </div>
          <div className="flex items-center gap-3 text-sm">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 bg-red-500 rounded-full" />
              环境 {activeAlerts}
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 bg-orange-500 rounded-full" />
              病虫害 {activePests}
            </span>
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <span className="text-gray-500 text-sm">预计总产量</span>
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <TrendingUp size={20} className="text-purple-600" />
            </div>
          </div>
          <div className="text-3xl font-bold text-gray-800 mb-1">
            {yieldPredictions.reduce((a, b) => a + b.predictedYield, 0)} kg
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-purple-600">↑ 8.5%</span>
            <span className="text-gray-400">较上月</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-8 bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">各区域环境达标率</h3>
          <div className="grid grid-cols-3 gap-4 mb-6">
            {Object.entries(envCompliance).map(([type, rate]) => (
              <div key={type} className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-gray-800">{rate.toFixed(1)}%</div>
                <div className="text-sm text-gray-500 mt-1">
                  {type === 'seedling' ? '育苗区' : type === 'leafy' ? '叶菜区' : '果菜区'}
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                  <div
                    className={`h-2 rounded-full ${rate > 80 ? 'bg-green-500' : rate > 60 ? 'bg-yellow-500' : 'bg-red-500'}`}
                    style={{ width: `${rate}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={taskTrendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="time" fontSize={12} />
              <YAxis fontSize={12} />
              <Tooltip />
              <Area type="monotone" dataKey="完成" stackId="1" stroke="#22c55e" fill="#22c55e" fillOpacity={0.3} />
              <Area type="monotone" dataKey="待处理" stackId="2" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.3} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="col-span-4 bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">实时传感器数据</h3>
          <div className="space-y-3">
            {sensorData.slice(0, 6).map((sensor) => (
              <div key={sensor.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    sensor.type === 'temperature' ? 'bg-red-100 text-red-600' :
                    sensor.type === 'humidity' ? 'bg-blue-100 text-blue-600' :
                    sensor.type === 'light' ? 'bg-yellow-100 text-yellow-600' :
                    sensor.type === 'co2' ? 'bg-gray-100 text-gray-600' :
                    'bg-green-100 text-green-600'
                  }`}>
                    {sensor.type === 'temperature' && <Thermometer size={18} />}
                    {sensor.type === 'humidity' && <Droplets size={18} />}
                    {sensor.type === 'light' && <Sun size={18} />}
                    {sensor.type === 'co2' && <Wind size={18} />}
                    {sensor.type === 'soil' && <Sprout size={18} />}
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-800">{getZoneName(sensor.zoneId)}</div>
                    <div className="text-xs text-gray-500">{getSensorTypeName(sensor.type)}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`font-bold ${sensor.isNormal ? 'text-gray-800' : 'text-red-600'}`}>
                    {sensor.value} {sensor.unit}
                  </div>
                  <div className={`text-xs ${sensor.isNormal ? 'text-green-600' : 'text-red-600'}`}>
                    {sensor.isNormal ? '正常' : '异常'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-5 bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">病虫害告警热力图</h3>
          <div className="grid grid-cols-3 gap-2">
            {heatmapPoints.map((point, idx) => (
              <div
                key={idx}
                className={`aspect-square rounded-lg flex items-center justify-center text-white text-sm font-medium ${getHeatmapColor(point.intensity, point.type)}`}
              >
                <div className="text-center">
                  <div>{getZoneName(point.zoneId)}</div>
                  <div className="text-xs opacity-80">{(point.intensity * 100).toFixed(0)}%</div>
                </div>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-center gap-6 mt-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded" />
              <span className="text-gray-600">正常</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-yellow-500 rounded" />
              <span className="text-gray-600">注意</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-orange-500 rounded" />
              <span className="text-gray-600">警告</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded" />
              <span className="text-gray-600">严重</span>
            </div>
          </div>
        </div>

        <div className="col-span-4 bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">产量预测对比</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={yieldComparisonData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" fontSize={12} />
              <YAxis fontSize={12} />
              <Tooltip />
              <Legend />
              <Bar dataKey="预测产量" fill="#22c55e" radius={[4, 4, 0, 0]} />
              <Bar dataKey="历史产量" fill="#94a3b8" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="col-span-3 bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">区域分布</h3>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie
                data={zoneTypeData}
                cx="50%"
                cy="50%"
                innerRadius={40}
                outerRadius={70}
                dataKey="value"
              >
                {zoneTypeData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-2 mt-2">
            {zoneTypeData.map((item) => (
              <div key={item.name} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded ${item.color.replace('bg-', '')}`} style={{ backgroundColor: item.color }} />
                  <span className="text-gray-600">{item.name}</span>
                </div>
                <span className="font-medium text-gray-800">{item.value} 个</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">今日任务进度</h3>
          <div className="space-y-3">
            {tasks.map((task) => (
              <div key={task.id} className="flex items-center justify-between p-3 border border-gray-100 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${
                    task.status === 'completed' ? 'bg-green-500' :
                    task.status === 'in_progress' ? 'bg-blue-500' :
                    task.status === 'overdue' || task.status === 'escalated' ? 'bg-red-500' :
                    'bg-gray-400'
                  }`} />
                  <div>
                    <div className="text-sm font-medium text-gray-800">{task.title}</div>
                    <div className="text-xs text-gray-500">{getZoneName(task.zoneId)}</div>
                  </div>
                </div>
                <span className={`px-2 py-1 text-xs rounded-full ${getTaskStatusColor(task.status)}`}>
                  {getTaskStatusName(task.status)}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">月度种植效率趋势</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={monthlyReports}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" fontSize={12} tickFormatter={(v) => v.slice(5)} />
              <YAxis fontSize={12} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="plantingEfficiency" name="效率(%)" stroke="#22c55e" strokeWidth={2} dot={{ fill: '#22c55e' }} />
              <Line type="monotone" dataKey="roi" name="ROI" stroke="#8b5cf6" strokeWidth={2} dot={{ fill: '#8b5cf6' }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
