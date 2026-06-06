import React, { useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  BarChart,
  Bar,
} from 'recharts';
import {
  FileBarChart,
  Download,
  Filter,
  Calendar,
  TrendingUp,
  DollarSign,
  Leaf,
  BarChart3,
} from 'lucide-react';
import { useAppStore } from '../store';
import { monthlyReports } from '../data/mockData';

const Reports: React.FC = () => {
  const { zones } = useAppStore();
  const [selectedMonth, setSelectedMonth] = useState<string>('2026-06');
  const [selectedZone, setSelectedZone] = useState<string>('all');
  const [selectedCrop, setSelectedCrop] = useState<string>('all');

  const reportData = monthlyReports.map((r) => ({
    ...r,
    monthLabel: r.month.slice(5),
  }));

  const currentMonthData = monthlyReports[monthlyReports.length - 1];

  const handleExport = (type: 'efficiency' | 'finance') => {
    alert(`正在导出${type === 'efficiency' ? '种植效率分析' : '投入产出明细'}报告...`);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">报表分析</h2>
        <div className="flex items-center gap-3">
          <button
            onClick={() => handleExport('efficiency')}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm"
          >
            <Download size={16} />
            导出种植效率分析
          </button>
          <button
            onClick={() => handleExport('finance')}
            className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm"
          >
            <Download size={16} />
            导出投入产出明细
          </button>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 bg-white rounded-lg px-3 py-2 border border-gray-200">
          <Calendar size={16} className="text-gray-400" />
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="text-sm border-none outline-none bg-transparent"
          >
            {monthlyReports.map((r) => (
              <option key={r.month} value={r.month}>{r.month}</option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-2 bg-white rounded-lg px-3 py-2 border border-gray-200">
          <Filter size={16} className="text-gray-400" />
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
      </div>

      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <span className="text-gray-500 text-sm">种植效率</span>
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <Leaf size={20} className="text-green-600" />
            </div>
          </div>
          <div className="text-3xl font-bold text-gray-800 mb-1">
            {currentMonthData.plantingEfficiency}%
          </div>
          <div className="text-sm text-green-600">
            ↑ 2.0% 较上月
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <span className="text-gray-500 text-sm">投入成本</span>
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              <DollarSign size={20} className="text-red-600" />
            </div>
          </div>
          <div className="text-3xl font-bold text-gray-800 mb-1">
            ¥{(currentMonthData.inputCost / 10000).toFixed(1)}万
          </div>
          <div className="text-sm text-gray-500">
            较上月 -5.6%
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <span className="text-gray-500 text-sm">产出收入</span>
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <TrendingUp size={20} className="text-blue-600" />
            </div>
          </div>
          <div className="text-3xl font-bold text-gray-800 mb-1">
            ¥{(currentMonthData.outputRevenue / 10000).toFixed(1)}万
          </div>
          <div className="text-sm text-green-600">
            ↑ 3.6% 较上月
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <span className="text-gray-500 text-sm">投资回报率</span>
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <BarChart3 size={20} className="text-purple-600" />
            </div>
          </div>
          <div className="text-3xl font-bold text-gray-800 mb-1">
            {currentMonthData.roi.toFixed(2)}
          </div>
          <div className="text-sm text-green-600">
            ↑ 0.25 较上月
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">月度种植效率趋势</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={reportData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="monthLabel" fontSize={12} />
              <YAxis fontSize={12} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="plantingEfficiency" name="效率(%)" stroke="#22c55e" strokeWidth={2} dot={{ fill: '#22c55e', r: 4 }} />
              <Line type="monotone" dataKey="yieldPerUnit" name="单位产量(kg/㎡)" stroke="#3b82f6" strokeWidth={2} dot={{ fill: '#3b82f6', r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">投入产出对比</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={reportData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="monthLabel" fontSize={12} />
              <YAxis fontSize={12} tickFormatter={(v) => `${v / 10000}万`} />
              <Tooltip formatter={(v: number) => [`¥${(v / 10000).toFixed(1)}万`, '']} />
              <Legend />
              <Bar dataKey="inputCost" name="投入成本" fill="#f87171" radius={[4, 4, 0, 0]} />
              <Bar dataKey="outputRevenue" name="产出收入" fill="#22c55e" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">月度详细数据</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">月份</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">种植效率</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">投入成本</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">产出收入</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">利润</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">ROI</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">单位产量</th>
              </tr>
            </thead>
            <tbody>
              {monthlyReports.slice().reverse().map((r) => (
                <tr key={r.month} className="border-t border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4 text-sm text-gray-800 font-medium">{r.month}</td>
                  <td className="py-3 px-4">
                    <span className={`text-sm ${r.plantingEfficiency >= 85 ? 'text-green-600' : 'text-orange-600'}`}>
                      {r.plantingEfficiency}%
                    </span>
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-600">¥{r.inputCost.toLocaleString()}</td>
                  <td className="py-3 px-4 text-sm text-gray-800 font-medium">¥{r.outputRevenue.toLocaleString()}</td>
                  <td className="py-3 px-4">
                    <span className="text-sm text-green-600">¥{(r.outputRevenue - r.inputCost).toLocaleString()}</span>
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-800">{r.roi.toFixed(2)}</td>
                  <td className="py-3 px-4 text-sm text-gray-600">{r.yieldPerUnit} kg/㎡</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Reports;
