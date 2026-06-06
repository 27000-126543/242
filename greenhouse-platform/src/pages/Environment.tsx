import React, { useEffect, useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import {
  Thermometer,
  Droplets,
  Sun,
  Wind,
  Sprout,
  Power,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Settings,
} from 'lucide-react';
import { useAppStore } from '../store';
import {
  formatDateTime,
  getZoneName,
  getSensorTypeName,
  getDeviceTypeName,
} from '../utils';

const Environment: React.FC = () => {
  const {
    zones,
    sensorData,
    devices,
    alerts,
    refreshSensorData,
    toggleDevice,
    toggleDeviceAutoControl,
    resolveAlert,
    lastRefresh,
  } = useAppStore();

  const [selectedZone, setSelectedZone] = useState<string>('all');
  const [selectedSensorType, setSelectedSensorType] = useState<string>('all');

  useEffect(() => {
    const interval = setInterval(() => {
      refreshSensorData();
    }, 5000);
    return () => clearInterval(interval);
  }, [refreshSensorData]);

  const filteredSensorData = sensorData.filter((s) => {
    if (selectedZone !== 'all' && s.zoneId !== selectedZone) return false;
    if (selectedSensorType !== 'all' && s.type !== selectedSensorType) return false;
    return true;
  });

  const zoneDevices = devices.filter((d) =>
    selectedZone === 'all' ? true : d.zoneId === selectedZone
  );

  const zoneAlerts = alerts.filter((a) =>
    selectedZone === 'all' ? true : a.zoneId === selectedZone
  );

  const generateHistoryData = () => {
    const data = [];
    for (let i = 24; i >= 0; i--) {
      const time = new Date();
      time.setHours(time.getHours() - i);
      data.push({
        time: `${time.getHours().toString().padStart(2, '0')}:00`,
        温度: 18 + Math.random() * 12,
        湿度: 50 + Math.random() * 30,
        光照: 10000 + Math.random() * 30000,
        CO2: 400 + Math.random() * 800,
        土壤湿度: 30 + Math.random() * 30,
      });
    }
    return data;
  };

  const historyData = generateHistoryData();

  const sensorTypeIcons: Record<string, React.ReactNode> = {
    temperature: <Thermometer size={20} />,
    humidity: <Droplets size={20} />,
    light: <Sun size={20} />,
    co2: <Wind size={20} />,
    soil: <Sprout size={20} />,
  };

  const sensorTypeColors: Record<string, string> = {
    temperature: 'text-red-600 bg-red-100',
    humidity: 'text-blue-600 bg-blue-100',
    light: 'text-yellow-600 bg-yellow-100',
    co2: 'text-gray-600 bg-gray-100',
    soil: 'text-green-600 bg-green-100',
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">环境监测与控制</h2>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-white rounded-lg px-3 py-2 border border-gray-200">
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
              value={selectedSensorType}
              onChange={(e) => setSelectedSensorType(e.target.value)}
              className="text-sm border-none outline-none bg-transparent"
            >
              <option value="all">全部传感器</option>
              <option value="temperature">温度</option>
              <option value="humidity">湿度</option>
              <option value="light">光照</option>
              <option value="co2">CO₂</option>
              <option value="soil">土壤湿度</option>
            </select>
          </div>
          <button
            onClick={() => refreshSensorData()}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm"
          >
            <RefreshCw size={16} />
            刷新数据
          </button>
        </div>
      </div>

      <div className="grid grid-cols-5 gap-4">
        {['temperature', 'humidity', 'light', 'co2', 'soil'].map((type) => {
          const typeSensors = filteredSensorData.filter((s) => s.type === type);
          const avgValue = typeSensors.length > 0
            ? typeSensors.reduce((a, b) => a + b.value, 0) / typeSensors.length
            : 0;
          const isAllNormal = typeSensors.every((s) => s.isNormal);
          const unit = typeSensors[0]?.unit || '';

          return (
            <div key={type} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-3">
                <span className="text-gray-500 text-sm">{getSensorTypeName(type)}</span>
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${sensorTypeColors[type]}`}>
                  {sensorTypeIcons[type]}
                </div>
              </div>
              <div className="text-3xl font-bold text-gray-800 mb-1">
                {avgValue.toFixed(1)} <span className="text-lg font-normal text-gray-500">{unit}</span>
              </div>
              <div className={`flex items-center gap-2 text-sm ${isAllNormal ? 'text-green-600' : 'text-red-600'}`}>
                {isAllNormal ? (
                  <><CheckCircle size={16} /> 全部正常</>
                ) : (
                  <><AlertTriangle size={16} /> 存在异常</>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">24小时环境趋势</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={historyData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="time" fontSize={12} />
            <YAxis fontSize={12} />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="温度" stroke="#ef4444" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="湿度" stroke="#3b82f6" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="土壤湿度" stroke="#22c55e" strokeWidth={2} dot={false} />
            <Line type="monotone" dataKey="CO2" stroke="#6b7280" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">实时传感器详情</h3>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {filteredSensorData.map((sensor) => (
              <div key={sensor.id} className="flex items-center justify-between p-4 border border-gray-100 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${sensorTypeColors[sensor.type]}`}>
                    {sensorTypeIcons[sensor.type]}
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-800">{getZoneName(sensor.zoneId)}</div>
                    <div className="text-xs text-gray-500">{formatDateTime(sensor.timestamp)}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`font-bold text-lg ${sensor.isNormal ? 'text-gray-800' : 'text-red-600'}`}>
                    {sensor.value} {sensor.unit}
                  </div>
                  <div className="text-xs text-gray-500">
                    阈值: {sensor.minThreshold} - {sensor.maxThreshold}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">设备控制中心</h3>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {zoneDevices.map((device) => (
              <div key={device.id} className="flex items-center justify-between p-4 border border-gray-100 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    device.status === 'on' ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600'
                  }`}>
                    <Power size={18} />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-800">{device.name}</div>
                    <div className="text-xs text-gray-500">
                      {getZoneName(device.zoneId)} · {getDeviceTypeName(device.type)}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleDeviceAutoControl(device.id)}
                    className={`px-2 py-1 text-xs rounded ${
                      device.autoControl
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {device.autoControl ? '自动' : '手动'}
                  </button>
                  <button
                    onClick={() => toggleDevice(device.id)}
                    className={`relative w-12 h-6 rounded-full transition-colors ${
                      device.status === 'on' ? 'bg-green-500' : 'bg-gray-300'
                    }`}
                  >
                    <div
                      className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                        device.status === 'on' ? 'translate-x-7' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">告警记录</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">时间</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">区域</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">传感器</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">告警内容</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">级别</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">状态</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">操作</th>
              </tr>
            </thead>
            <tbody>
              {zoneAlerts.map((alert) => (
                <tr key={alert.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4 text-sm text-gray-600">{formatDateTime(alert.timestamp)}</td>
                  <td className="py-3 px-4 text-sm text-gray-800">{getZoneName(alert.zoneId)}</td>
                  <td className="py-3 px-4 text-sm text-gray-600">{getSensorTypeName(alert.sensorType)}</td>
                  <td className="py-3 px-4 text-sm text-gray-800">{alert.message}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      alert.level === 'critical' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {alert.level === 'critical' ? '严重' : '警告'}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      alert.resolved ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                    }`}>
                      {alert.resolved ? '已处理' : '未处理'}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    {!alert.resolved && (
                      <button
                        onClick={() => resolveAlert(alert.id)}
                        className="text-sm text-blue-600 hover:text-blue-800"
                      >
                        标记已处理
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Environment;
