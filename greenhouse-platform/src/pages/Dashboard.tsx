import React, { useEffect, useState, useMemo } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area, Legend,
} from 'recharts';
import {
  Thermometer, Droplets, Sun, Wind, Sprout, CheckCircle, Clock,
  AlertTriangle, TrendingUp, RefreshCw, Filter,
} from 'lucide-react';
import { useAppStore } from '../store';
import {
  formatDateTime, getZoneName, getSensorTypeName, getTaskStatusName,
  getTaskStatusColor, getZoneTypeColor,
} from '../utils';

const COLORS = ['#22c55e', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

const Dashboard: React.FC = () => {
  const {
    zones, sensorData, tasks, alerts, pestDetections, yieldPredictions,
    monthlyReports, refreshSensorData, lastRefresh, loadAllData, loading,
  } = useAppStore();

  const [selectedZone, setSelectedZone] = useState<string>('all');
  const [selectedDate, setSelectedDate] = useState<string>('today');
  const [selectedCrop, setSelectedCrop] = useState<string>('all');

  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  useEffect(() => {
    const interval = setInterval(() => {
      refreshSensorData();
    }, 5000);
    return () => clearInterval(interval);
  }, [refreshSensorData]);

  const filteredZones = useMemo(() => {
    return zones.filter(z => {
      if (selectedZone !== 'all' && z.id !== selectedZone) return false;
      if (selectedCrop !== 'all' && !z.crop.includes(selectedCrop)) return false;
      return true;
    });
  }, [zones, selectedZone, selectedCrop]);

  const filteredSensorData = useMemo(() => {
    return sensorData.filter(s => {
      if (selectedZone !== 'all' && s.zoneId !== selectedZone) return false;
      const zone = zones.find(z => z.id === s.zoneId);
      if (selectedCrop !== 'all' && zone && !zone.crop.includes(selectedCrop)) return false;
      return true;
    });
  }, [sensorData, zones, selectedZone, selectedCrop]);

  const filteredTasks = useMemo(() => {
    return tasks.filter(t => {
      if (selectedZone !== 'all' && t.zoneId !== selectedZone) return false;
      const zone = zones.find(z => z.id === t.zoneId);
      if (selectedCrop !== 'all' && zone && !zone.crop.includes(selectedCrop)) return false;
      return true;
    });
  }, [tasks, zones, selectedZone, selectedCrop]);

  const filteredPests = useMemo(() => {
    return pestDetections.filter(p => {
      if (selectedZone !== 'all' && p.zoneId !== selectedZone) return false;
      const zone = zones.find(z => z.id === p.zoneId);
      if (selectedCrop !== 'all' && zone && !zone.crop.includes(selectedCrop)) return false;
      return true;
    });
  }, [pestDetections, zones, selectedZone, selectedCrop]);

  const calculateEnvCompliance = () => {
    const zoneRates: Record<string, number> = {};
    filteredZones.forEach((zone) => {
      const zoneSensors = filteredSensorData.filter((s) => s.zoneId === zone.id);
      const normalCount = zoneSensors.filter((s) => s.isNormal).length;
      zoneRates[zone.type] = zoneRates[zone.type] || 0;
      const rate = zoneSensors.length > 0 ? (normalCount / zoneSensors.length) * 100 : 0;
      zoneRates[zone.type] = Math.max(zoneRates[zone.type], Math.round(rate));
    });
    return zoneRates;
  };

  const envCompliance = calculateEnvCompliance();
  const overallCompliance = Object.values(envCompliance).length > 0
    ? Math.round(Object.values(envCompliance).reduce((a, b) => a + b, 0) / Object.values(envCompliance).length)
    : 0;

  const totalTasks = filteredTasks.length;
  const completedTasks = filteredTasks.filter(t => t.status === 'completed').length;
  const taskCompletionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const activeAlerts = alerts.filter(a => !a.resolved).length;
  const totalYield = yieldPredictions.reduce((sum, y) => sum + y.predictedYield, 0);

  const envTrendData = useMemo(() => {
    const hours = Array.from({ length: 24 }, (_, i) => i);
    return hours.map(h => ({
      hour: `${h}:00`,
      temperature: 18 + Math.random() * 12,
      humidity: 50 + Math.random() * 30,
      light: 1000 + Math.random() * 40000,
    }));
  }, []);

  const zoneDistribution = useMemo(() => {
    const typeCount: Record<string, number> = {};
    filteredZones.forEach(z => { typeCount[z.type] = (typeCount[z.type] || 0) + z.area; });
    return Object.entries(typeCount).map(([name, value]) => ({ name, value }));
  }, [filteredZones]);

  const yieldComparisonData = useMemo(() => {
    return yieldPredictions.map(y => ({
      name: getZoneName(y.zoneId, zones),
      预计产量: y.predictedYield,
      历史产量: y.historicalYield,
    }));
  }, [yieldPredictions, zones]);

  const heatmapPoints = useMemo(() => {
    return filteredPests.map(p => ({
      zoneId: p.zoneId,
      x: Math.random() * 100,
      y: Math.random() * 100,
      intensity: p.status === 'detected' ? 0.9 : p.status === 'approved' ? 0.6 : 0.3,
      type: 'pest' as const,
    }));
  }, [filteredPests]);

  const sensorCards = [
    { type: 'temperature', icon: Thermometer, label: '温度', color: 'red' },
    { type: 'humidity', icon: Droplets, label: '湿度', color: 'blue' },
    { type: 'light', icon: Sun, label: '光照', color: 'yellow' },
    { type: 'co2', icon: Wind, label: 'CO₂', color: 'gray' },
    { type: 'soil', icon: Sprout, label: '土壤湿度', color: 'green' },
  ];

  const getLatestSensorValue = (type: string) => {
    const sensors = filteredSensorData.filter(s => s.type === type);
    if (sensors.length === 0) return '--';
    const avg = sensors.reduce((sum, s) => sum + s.value, 0) / sensors.length;
    return `${Math.round(avg * 10) / 10} ${sensors[0].unit}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <RefreshCw className="w-12 h-12 text-primary-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-500">数据加载中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h2 className="text-2xl font-bold text-gray-800">数据大屏</h2>
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2 bg-white rounded-lg px-3 py-2 border border-gray-200">
            <Filter size={16} className="text-gray-500" />
            <select value={selectedZone} onChange={e => setSelectedZone(e.target.value)}
              className="text-sm border-none outline-none bg-transparent">
              <option value="all">全部区域</option>
              {zones.map(z => <option key={z.id} value={z.id}>{z.name}</option>)}
            </select>
          </div>
          <div className="flex items-center gap-2 bg-white rounded-lg px-3 py-2 border border-gray-200">
            <select value={selectedCrop} onChange={e => setSelectedCrop(e.target.value)}
              className="text-sm border-none outline-none bg-transparent">
              <option value="all">全部作物</option>
              <option value="番茄">番茄</option>
              <option value="黄瓜">黄瓜</option>
              <option value="生菜">生菜</option>
              <option value="菠菜">菠菜</option>
            </select>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <RefreshCw size={14} />
            <span>更新于 {lastRefresh ? formatDateTime(lastRefresh) : '--'}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-5 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm">环境达标率</p>
              <p className="text-3xl font-bold mt-1">{overallCompliance}%</p>
            </div>
            <CheckCircle size={40} className="text-green-200" />
          </div>
        </div>
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-5 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm">今日任务完成</p>
              <p className="text-3xl font-bold mt-1">{completedTasks}/{totalTasks}</p>
            </div>
            <Clock size={40} className="text-blue-200" />
          </div>
        </div>
        <div className="bg-gradient-to-r from-red-500 to-red-600 rounded-xl p-5 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-100 text-sm">活跃告警</p>
              <p className="text-3xl font-bold mt-1">{activeAlerts}</p>
            </div>
            <AlertTriangle size={40} className="text-red-200" />
          </div>
        </div>
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl p-5 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm">预计总产量</p>
              <p className="text-3xl font-bold mt-1">{totalYield.toLocaleString()} kg</p>
            </div>
            <TrendingUp size={40} className="text-purple-200" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-5 gap-3">
        {sensorCards.map(sc => (
          <div key={sc.type} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 mb-2">
              <div className={`p-2 rounded-lg bg-${sc.color}-50`}>
                <sc.icon size={20} className={`text-${sc.color}-600`} />
              </div>
              <span className="text-sm text-gray-600">{sc.label}</span>
            </div>
            <p className="text-2xl font-bold text-gray-800">{getLatestSensorValue(sc.type)}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">24小时环境趋势</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={envTrendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="hour" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Legend />
              <Area type="monotone" dataKey="temperature" stroke="#ef4444" fill="#fecaca" name="温度(°C)" />
              <Area type="monotone" dataKey="humidity" stroke="#3b82f6" fill="#bfdbfe" name="湿度(%)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">区域分布</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={zoneDistribution} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                {zoneDistribution.map((_, idx) => (
                  <Cell key={`cell-${idx}`} fill={COLORS[idx % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">各区域环境达标率</h3>
          <div className="space-y-4">
            {Object.entries(envCompliance).map(([type, rate]) => (
              <div key={type}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-gray-600">
                    {type === 'seedling' ? '育苗区' : type === 'leafy' ? '叶菜区' : '果菜区'}
                  </span>
                  <span className="text-sm font-medium text-gray-800">{rate}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div
                    className={`h-2.5 rounded-full ${rate >= 90 ? 'bg-green-500' : rate >= 70 ? 'bg-yellow-500' : 'bg-red-500'}`}
                    style={{ width: `${rate}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">今日任务进度</h3>
          <div className="space-y-3">
            {filteredTasks.slice(0, 5).map(task => (
              <div key={task.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <span className={`px-2 py-0.5 text-xs rounded ${getTaskStatusColor(task.status)}`}>
                    {getTaskStatusName(task.status)}
                  </span>
                  <span className="text-sm text-gray-800">{task.title}</span>
                </div>
                <span className="text-xs text-gray-500">{getZoneName(task.zoneId, zones)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">产量预测对比</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={yieldComparisonData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Legend />
              <Bar dataKey="预计产量" fill="#22c55e" />
              <Bar dataKey="历史产量" fill="#94a3b8" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">病虫害告警热力图</h3>
          <div className="relative w-full h-64 bg-gradient-to-br from-green-50 to-green-100 rounded-lg overflow-hidden">
            {heatmapPoints.map((point, idx) => (
              <div
                key={idx}
                className="absolute w-6 h-6 rounded-full bg-red-500 animate-pulse"
                style={{
                  left: `${point.x}%`,
                  top: `${point.y}%`,
                  opacity: point.intensity,
                  transform: 'translate(-50%, -50%)',
                }}
              />
            ))}
            {heatmapPoints.length === 0 && (
              <div className="absolute inset-0 flex items-center justify-center text-gray-400 text-sm">
                暂无病虫害告警
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">月度种植效率趋势</h3>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={monthlyReports}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="month" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="plantingEfficiency" stroke="#22c55e" strokeWidth={2} dot={{ fill: '#22c55e' }} name="种植效率(%)" />
            <Line type="monotone" dataKey="roi" stroke="#3b82f6" strokeWidth={2} dot={{ fill: '#3b82f6' }} name="ROI" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default Dashboard;
