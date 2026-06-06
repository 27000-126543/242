import React, { useState } from 'react';
import {
  Package,
  QrCode,
  AlertTriangle,
  CheckCircle,
  Search,
  Filter,
  Plus,
  Calendar,
  Building2,
  Clock,
} from 'lucide-react';
import { useAppStore } from '../store';
import {
  formatDate,
  formatDateTime,
  getUserName,
} from '../utils';

const Inventory: React.FC = () => {
  const { inventoryItems, purchaseWarnings, currentUser, approvePurchaseWarning, updateInventory } = useAppStore();
  const [selectedType, setSelectedType] = useState<string>('all');
  const [searchText, setSearchText] = useState<string>('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'inventory' | 'warnings'>('inventory');

  const filteredItems = inventoryItems.filter((item) => {
    if (selectedType !== 'all' && item.type !== selectedType) return false;
    if (searchText && !item.name.includes(searchText) && !item.batchNumber.includes(searchText)) return false;
    return true;
  });

  const lowStockItems = inventoryItems.filter((item) => item.quantity <= item.safetyStock);

  const stats = {
    total: inventoryItems.length,
    pesticides: inventoryItems.filter((i) => i.type === 'pesticide').length,
    fertilizers: inventoryItems.filter((i) => i.type === 'fertilizer').length,
    lowStock: lowStockItems.length,
    pendingWarnings: purchaseWarnings.filter((w) => w.status === 'pending').length,
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">库存管理</h2>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm"
        >
          <Plus size={16} />
          扫码入库
        </button>
      </div>

      <div className="grid grid-cols-5 gap-4">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="text-2xl font-bold text-gray-800">{stats.total}</div>
          <div className="text-sm text-gray-500 mt-1">全部物品</div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="text-2xl font-bold text-red-600">{stats.pesticides}</div>
          <div className="text-sm text-gray-500 mt-1">农药品种</div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="text-2xl font-bold text-green-600">{stats.fertilizers}</div>
          <div className="text-sm text-gray-500 mt-1">肥料品种</div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="text-2xl font-bold text-orange-600">{stats.lowStock}</div>
          <div className="text-sm text-gray-500 mt-1">库存预警</div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="text-2xl font-bold text-yellow-600">{stats.pendingWarnings}</div>
          <div className="text-sm text-gray-500 mt-1">待审批采购</div>
        </div>
      </div>

      <div className="flex gap-4 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('inventory')}
          className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px ${
            activeTab === 'inventory'
              ? 'border-primary-600 text-primary-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          库存列表
        </button>
        <button
          onClick={() => setActiveTab('warnings')}
          className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px ${
            activeTab === 'warnings'
              ? 'border-primary-600 text-primary-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          采购预警
          {stats.pendingWarnings > 0 && (
            <span className="ml-2 px-2 py-0.5 text-xs bg-red-100 text-red-700 rounded-full">
              {stats.pendingWarnings}
            </span>
          )}
        </button>
      </div>

      {activeTab === 'inventory' && (
        <>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-white rounded-lg px-3 py-2 border border-gray-200 flex-1 max-w-md">
              <Search size={16} className="text-gray-400" />
              <input
                type="text"
                placeholder="搜索物品..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                className="flex-1 text-sm border-none outline-none bg-transparent"
              />
            </div>
            <div className="flex items-center gap-2 bg-white rounded-lg px-3 py-2 border border-gray-200">
              <Filter size={16} className="text-gray-400" />
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="text-sm border-none outline-none bg-transparent"
              >
                <option value="all">全部类型</option>
                <option value="pesticide">农药</option>
                <option value="fertilizer">肥料</option>
              </select>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">物品名称</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">类型</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">批次号</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">当前库存</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">安全库存</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">有效期</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">供应商</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">状态</th>
                </tr>
              </thead>
              <tbody>
                {filteredItems.map((item) => (
                  <tr key={item.id} className="border-t border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          item.type === 'pesticide' ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'
                        }`}>
                          <Package size={20} />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-800">{item.name}</div>
                          <div className="text-xs text-gray-500">{item.batchNumber}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        item.type === 'pesticide' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                      }`}>
                        {item.type === 'pesticide' ? '农药' : '肥料'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600 font-mono">{item.batchNumber}</td>
                    <td className="py-3 px-4">
                      <div className={`text-sm font-medium ${
                        item.quantity <= item.safetyStock ? 'text-red-600' : 'text-gray-800'
                      }`}>
                        {item.quantity} {item.unit}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600">{item.safetyStock} {item.unit}</td>
                    <td className="py-3 px-4 text-sm text-gray-600">{formatDate(item.expiryDate)}</td>
                    <td className="py-3 px-4 text-sm text-gray-600">{item.supplier}</td>
                    <td className="py-3 px-4">
                      {item.quantity <= item.safetyStock ? (
                        <span className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded-full flex items-center gap-1 w-fit">
                          <AlertTriangle size={12} />
                          库存不足
                        </span>
                      ) : (
                        <span className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded-full flex items-center gap-1 w-fit">
                          <CheckCircle size={12} />
                          正常
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {activeTab === 'warnings' && (
        <div className="space-y-4">
          {purchaseWarnings.map((warning) => {
            const item = inventoryItems.find((i) => i.id === warning.itemId);
            return (
              <div key={warning.id} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center text-orange-600">
                      <AlertTriangle size={24} />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 mb-1">
                        {warning.itemName} 库存预警
                      </h3>
                      <div className="space-y-1 text-sm text-gray-500">
                        <div className="flex items-center gap-2">
                          <Package size={14} />
                          当前库存：{warning.currentStock} {item?.unit || ''} / 安全库存：{warning.safetyStock} {item?.unit || ''}
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar size={14} />
                          创建时间：{formatDateTime(warning.createdAt)}
                        </div>
                        {warning.approvedBy && (
                          <div className="flex items-center gap-2">
                            <CheckCircle size={14} />
                            审批人：{getUserName(warning.approvedBy)}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-3 py-1 text-xs rounded-full ${
                      warning.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                      warning.status === 'approved' ? 'bg-green-100 text-green-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {warning.status === 'pending' ? '待审批' :
                       warning.status === 'approved' ? '已批准' : '已拒绝'}
                    </span>
                    {warning.status === 'pending' && currentUser.role !== 'worker' && (
                      <div className="flex gap-2">
                        <button className="px-3 py-1 border border-gray-300 text-gray-700 rounded-lg text-sm hover:bg-gray-50">
                          拒绝
                        </button>
                        <button
                          onClick={() => approvePurchaseWarning(warning.id, currentUser.id)}
                          className="px-3 py-1 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700"
                        >
                          批准采购
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
          {purchaseWarnings.length === 0 && (
            <div className="bg-white rounded-xl p-12 text-center shadow-sm border border-gray-100">
              <CheckCircle size={48} className="mx-auto text-green-500 mb-3" />
              <p className="text-gray-500">暂无采购预警</p>
            </div>
          )}
        </div>
      )}

      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">扫码入库</h3>
            <div className="bg-gray-100 rounded-lg p-8 text-center mb-4">
              <QrCode size={120} className="mx-auto text-gray-600 mb-3" />
              <p className="text-sm text-gray-500">请扫描物品条码进行入库登记</p>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">物品名称</label>
                <input
                  type="text"
                  placeholder="输入或扫描物品名称"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">批次号</label>
                <input
                  type="text"
                  placeholder="输入批次号"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">入库数量</label>
                  <input
                    type="number"
                    placeholder="数量"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">单位</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
                    <option>kg</option>
                    <option>L</option>
                    <option>袋</option>
                    <option>瓶</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">有效期</label>
                <input
                  type="date"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowAddModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm"
              >
                取消
              </button>
              <button
                onClick={() => setShowAddModal(false)}
                className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm"
              >
                确认入库
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Inventory;
