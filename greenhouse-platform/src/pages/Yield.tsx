import React, { useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import {
  TrendingUp,
  ShoppingCart,
  AlertTriangle,
  CheckCircle,
  Package,
  Calendar,
  Building2,
  ArrowUpRight,
  ArrowDownRight,
  Users,
} from 'lucide-react';
import { useAppStore } from '../store';
import { formatDate, getZoneName } from '../utils';

const Yield: React.FC = () => {
  const { yieldPredictions, salesOrders, zones } = useAppStore();
  const [activeTab, setActiveTab] = useState<'predictions' | 'orders'>('predictions');

  const totalPredictedYield = yieldPredictions.reduce((a, b) => a + b.predictedYield, 0);
  const totalHistoricalYield = yieldPredictions.reduce((a, b) => a + b.historicalYield, 0);
  const yieldGrowth = ((totalPredictedYield - totalHistoricalYield) / totalHistoricalYield * 100).toFixed(1);

  const totalOrdered = salesOrders.reduce((a, b) => a + b.quantity, 0);
  const matchedOrders = salesOrders.filter((o) => o.status === 'matched').length;
  const shortageOrders = salesOrders.filter((o) => o.status === 'shortage').length;

  const yieldComparisonData = yieldPredictions.map((yp) => ({
    name: yp.crop,
    预测产量: yp.predictedYield,
    历史产量: yp.historicalYield,
    增长率: ((yp.predictedYield - yp.historicalYield) / yp.historicalYield * 100).toFixed(1),
  }));

  const orderStatusData = [
    { name: '已匹配', value: salesOrders.filter((o) => o.status === 'matched').length, color: '#22c55e' },
    { name: '待匹配', value: salesOrders.filter((o) => o.status === 'pending').length, color: '#f59e0b' },
    { name: '有缺口', value: salesOrders.filter((o) => o.status === 'shortage').length, color: '#ef4444' },
    { name: '有盈余', value: salesOrders.filter((o) => o.status === 'surplus').length, color: '#3b82f6' },
  ];

  const cropYieldData = yieldPredictions.map((yp) => ({
    name: yp.crop,
    value: yp.predictedYield,
    zone: getZoneName(yp.zoneId),
  }));

  const COLORS = ['#22c55e', '#3b82f6', '#f59e0b', '#8b5cf6'];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">产量预测与订单匹配</h2>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <span className="text-gray-500 text-sm">预计总产量</span>
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <TrendingUp size={20} className="text-green-600" />
            </div>
          </div>
          <div className="text-3xl font-bold text-gray-800 mb-1">
            {totalPredictedYield} <span className="text-lg font-normal">kg</span>
          </div>
          <div className={`flex items-center gap-2 text-sm ${Number(yieldGrowth) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {Number(yieldGrowth) >= 0 ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
            {Math.abs(Number(yieldGrowth))}% 较历史同期
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <span className="text-gray-500 text-sm">销售订单总量</span>
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <ShoppingCart size={20} className="text-blue-600" />
            </div>
          </div>
          <div className="text-3xl font-bold text-gray-800 mb-1">
            {totalOrdered} <span className="text-lg font-normal">kg</span>
          </div>
          <div className="text-sm text-gray-500">
            共 {salesOrders.length} 个订单
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <span className="text-gray-500 text-sm">已匹配订单</span>
            <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
              <CheckCircle size={20} className="text-emerald-600" />
            </div>
          </div>
          <div className="text-3xl font-bold text-gray-800 mb-1">
            {matchedOrders} <span className="text-lg font-normal">单</span>
          </div>
          <div className="text-sm text-gray-500">
            匹配率 {((matchedOrders / salesOrders.length) * 100).toFixed(1)}%
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-3">
            <span className="text-gray-500 text-sm">订单缺口预警</span>
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <AlertTriangle size={20} className="text-orange-600" />
            </div>
          </div>
          <div className="text-3xl font-bold text-gray-800 mb-1">
            {shortageOrders} <span className="text-lg font-normal">单</span>
          </div>
          <div className="text-sm text-orange-600">
            需要对接合作商
          </div>
        </div>
      </div>

      <div className="flex gap-4 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('predictions')}
          className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px ${
            activeTab === 'predictions'
              ? 'border-primary-600 text-primary-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          产量预测
        </button>
        <button
          onClick={() => setActiveTab('orders')}
          className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px ${
            activeTab === 'orders'
              ? 'border-primary-600 text-primary-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          订单匹配
          {shortageOrders > 0 && (
            <span className="ml-2 px-2 py-0.5 text-xs bg-red-100 text-red-700 rounded-full">
              {shortageOrders}
            </span>
          )}
        </button>
      </div>

      {activeTab === 'predictions' && (
        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-8 bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">各作物产量预测对比</h3>
            <ResponsiveContainer width="100%" height={350}>
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

          <div className="col-span-4 bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">产量分布</h3>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={cropYieldData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  labelLine={false}
                >
                  {cropYieldData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="col-span-12 bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">预测详情</h3>
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">区域</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">作物</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">预测产量</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">历史产量</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">增长率</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">当前长势</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">置信度</th>
                </tr>
              </thead>
              <tbody>
                {yieldPredictions.map((yp, idx) => (
                  <tr key={yp.zoneId} className="border-t border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 text-sm text-gray-800">{getZoneName(yp.zoneId)}</td>
                    <td className="py-3 px-4 text-sm text-gray-800 font-medium">{yp.crop}</td>
                    <td className="py-3 px-4 text-sm text-gray-800">{yp.predictedYield} {yp.unit}</td>
                    <td className="py-3 px-4 text-sm text-gray-600">{yp.historicalYield} {yp.unit}</td>
                    <td className="py-3 px-4">
                      <span className={`text-sm ${Number(yieldComparisonData[idx]?.增长率) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {Number(yieldComparisonData[idx]?.增长率) >= 0 ? '+' : ''}{yieldComparisonData[idx]?.增长率}%
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`text-sm ${yp.currentGrowthRate >= 1 ? 'text-green-600' : 'text-orange-600'}`}>
                        {yp.currentGrowthRate >= 1 ? '良好' : '一般'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-primary-500 h-2 rounded-full"
                            style={{ width: `${yp.confidence}%` }}
                          />
                        </div>
                        <span className="text-sm text-gray-600">{yp.confidence}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'orders' && (
        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-4 bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">订单状态分布</h3>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={orderStatusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`}
                >
                  {orderStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="col-span-8 bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">销售订单列表</h3>
            <div className="space-y-3">
              {salesOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between p-4 border border-gray-100 rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      order.status === 'matched' ? 'bg-green-100 text-green-600' :
                      order.status === 'shortage' ? 'bg-red-100 text-red-600' :
                      order.status === 'surplus' ? 'bg-blue-100 text-blue-600' :
                      'bg-yellow-100 text-yellow-600'
                    }`}>
                      <ShoppingCart size={20} />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-800">{order.customer}</div>
                      <div className="text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <Building2 size={12} />
                          {order.crop} · {order.quantity} {order.unit}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="text-sm text-gray-800">
                        <Calendar size={12} className="inline mr-1" />
                        交货: {formatDate(order.deliveryDate)}
                      </div>
                    </div>
                    <span className={`px-3 py-1 text-xs rounded-full ${
                      order.status === 'matched' ? 'bg-green-100 text-green-700' :
                      order.status === 'shortage' ? 'bg-red-100 text-red-700' :
                      order.status === 'surplus' ? 'bg-blue-100 text-blue-700' :
                      'bg-yellow-100 text-yellow-700'
                    }`}>
                      {order.status === 'matched' ? '已匹配' :
                       order.status === 'shortage' ? '有缺口' :
                       order.status === 'surplus' ? '有盈余' : '待匹配'}
                    </span>
                    {order.status === 'shortage' && (
                      <button className="px-3 py-1 text-xs bg-orange-600 text-white rounded-lg hover:bg-orange-700">
                        发往合作商
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Yield;
