import React, { useState } from 'react';
import {
  Settings as SettingsIcon,
  Thermometer,
  Droplets,
  Sun,
  Wind,
  Sprout,
  Save,
  RotateCcw,
  Bell,
  Smartphone,
} from 'lucide-react';
import { useAppStore } from '../store';

const SystemSettings: React.FC = () => {
  const { zones } = useAppStore();
  const [selectedZone, setSelectedZone] = useState<string>('all');
  const [systemSettings, setSystemSettings] = useState({
    temperature: { min: 15, max: 35, autoControl: true },
    humidity: { min: 40, max: 85, autoControl: true },
    light: { min: 5000, max: 50000, autoControl: true },
    co2: { min: 300, max: 1500, autoControl: true },
    soil: { min: 20, max: 70, autoControl: true },
    phoneAlerts: true,
    smsAlerts: true,
    appAlerts: true,
    dataRefreshInterval: 5,
  });

  const handleSave = () => {
    alert('设置已保存');
  };

  const handleReset = () => {
    setSystemSettings({
      temperature: { min: 15, max: 35, autoControl: true },
      humidity: { min: 40, max: 85, autoControl: true },
      light: { min: 5000, max: 50000, autoControl: true },
      co2: { min: 300, max: 1500, autoControl: true },
      soil: { min: 20, max: 70, autoControl: true },
      phoneAlerts: true,
      smsAlerts: true,
      appAlerts: true,
      dataRefreshInterval: 5,
    });
  };

  const sensorConfig = [
    { key: 'temperature', label: '温度', icon: Thermometer, unit: '°C', color: 'red' },
    { key: 'humidity', label: '湿度', icon: Droplets, unit: '%', color: 'blue' },
    { key: 'light', label: '光照', icon: Sun, unit: 'lux', color: 'yellow' },
    { key: 'co2', label: 'CO₂', icon: Wind, unit: 'ppm', color: 'gray' },
    { key: 'soil', label: '土壤湿度', icon: Sprout, unit: '%', color: 'green' },
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">系统设置</h2>
        <div className="flex gap-3">
          <button
            onClick={handleReset}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm"
          >
            <RotateCcw size={16} />
            重置默认
          </button>
          <button
            onClick={handleSave}
            className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm"
          >
            <Save size={16} />
            保存设置
          </button>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 bg-white rounded-lg px-3 py-2 border border-gray-200">
          <select
            value={selectedZone}
            onChange={(e) => setSelectedZone(e.target.value)}
            className="text-sm border-none outline-none bg-transparent"
          >
            <option value="all">全部区域（统一设置）</option>
            {zones.map((z) => (
              <option key={z.id} value={z.id}>{z.name}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <SettingsIcon size={20} className="text-primary-600" />
            环境阈值设置
          </h3>
          <div className="space-y-6">
            {sensorConfig.map((config) => {
              const s = systemSettings[config.key as keyof typeof systemSettings] as { min: number; max: number; autoControl: boolean };
              return (
                <div key={config.key} className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <config.icon size={20} className={`text-${config.color}-600`} />
                      <span className="font-medium text-gray-800">{config.label}</span>
                    </div>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={s.autoControl}
                        onChange={(e) =>
                          setSystemSettings({
                            ...systemSettings,
                            [config.key]: { ...s, autoControl: e.target.checked },
                          })
                        }
                        className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                      />
                      <span className="text-sm text-gray-600">自动控制</span>
                    </label>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">最低阈值 ({config.unit})</label>
                      <input
                        type="number"
                        value={s.min}
                        onChange={(e) =>
                          setSystemSettings({
                            ...systemSettings,
                            [config.key]: { ...s, min: Number(e.target.value) },
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">最高阈值 ({config.unit})</label>
                      <input
                        type="number"
                        value={s.max}
                        onChange={(e) =>
                          setSystemSettings({
                            ...systemSettings,
                            [config.key]: { ...s, max: Number(e.target.value) },
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Bell size={20} className="text-primary-600" />
              告警推送设置
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Smartphone size={20} className="text-gray-600" />
                  <div>
                    <div className="text-sm font-medium text-gray-800">APP推送</div>
                    <div className="text-xs text-gray-500">通过手机APP接收告警通知</div>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={systemSettings.appAlerts}
                    onChange={(e) => setSystemSettings({ ...systemSettings, appAlerts: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Bell size={20} className="text-gray-600" />
                  <div>
                    <div className="text-sm font-medium text-gray-800">短信通知</div>
                    <div className="text-xs text-gray-500">通过短信接收紧急告警</div>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={systemSettings.smsAlerts}
                    onChange={(e) => setSystemSettings({ ...systemSettings, smsAlerts: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Bell size={20} className="text-gray-600" />
                  <div>
                    <div className="text-sm font-medium text-gray-800">电话告警</div>
                    <div className="text-xs text-gray-500">严重告警自动拨打电话</div>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={systemSettings.phoneAlerts}
                    onChange={(e) => setSystemSettings({ ...systemSettings, phoneAlerts: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                </label>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <SettingsIcon size={20} className="text-primary-600" />
              系统参数
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  数据刷新间隔（秒）
                </label>
                <select
                  value={systemSettings.dataRefreshInterval}
                  onChange={(e) =>
                    setSystemSettings({ ...systemSettings, dataRefreshInterval: Number(e.target.value) })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                >
                  <option value={5}>5秒</option>
                  <option value={10}>10秒</option>
                  <option value={30}>30秒</option>
                  <option value={60}>60秒</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  任务超时升级时间（分钟）
                </label>
                <input
                  type="number"
                  defaultValue={30}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  安全库存预警阈值（%）
                </label>
                <input
                  type="number"
                  defaultValue={80}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SystemSettings;
