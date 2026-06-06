import React, { useState, useEffect } from 'react';
import {
  Users as UsersIcon,
  Plus,
  Edit,
  Trash2,
  Shield,
  User,
  MapPin,
  Phone,
  Search,
} from 'lucide-react';
import { useAppStore } from '../store';
import { getRoleName, getZoneName } from '../utils';

const UserManagement: React.FC = () => {
  const { users, zones, setCurrentUser, currentUser, loadUsers, loadZones } = useAppStore();
  const [searchText, setSearchText] = useState<string>('');
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    loadUsers();
    loadZones();
  }, [loadUsers, loadZones]);

  const filteredUsers = users.filter((u) => {
    if (searchText && !u.name.includes(searchText)) return false;
    return true;
  });

  const roleColors: Record<string, string> = {
    worker: 'bg-gray-100 text-gray-700',
    technician: 'bg-blue-100 text-blue-700',
    supervisor: 'bg-purple-100 text-purple-700',
    owner: 'bg-orange-100 text-orange-700',
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">用户管理</h2>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm"
        >
          <Plus size={16} />
          添加用户
        </button>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="text-2xl font-bold text-gray-800">{users.length}</div>
          <div className="text-sm text-gray-500 mt-1">总用户数</div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="text-2xl font-bold text-gray-500">
            {users.filter((u) => u.role === 'worker').length}
          </div>
          <div className="text-sm text-gray-500 mt-1">工人</div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="text-2xl font-bold text-blue-600">
            {users.filter((u) => u.role === 'technician').length}
          </div>
          <div className="text-sm text-gray-500 mt-1">技术员</div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="text-2xl font-bold text-purple-600">
            {users.filter((u) => u.role === 'supervisor' || u.role === 'owner').length}
          </div>
          <div className="text-sm text-gray-500 mt-1">管理员</div>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 bg-white rounded-lg px-3 py-2 border border-gray-200 flex-1 max-w-md">
          <Search size={16} className="text-gray-400" />
          <input
            type="text"
            placeholder="搜索用户..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="flex-1 text-sm border-none outline-none bg-transparent"
          />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">用户</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">角色</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">手机号</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">负责区域</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">权限等级</th>
              <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">操作</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((user) => (
              <tr key={user.id} className="border-t border-gray-100 hover:bg-gray-50">
                <td className="py-3 px-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary-500 flex items-center justify-center text-white font-bold">
                      {user.name.charAt(0)}
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-800">{user.name}</div>
                    </div>
                  </div>
                </td>
                <td className="py-3 px-4">
                  <span className={`px-2 py-1 text-xs rounded-full ${roleColors[user.role]}`}>
                    {getRoleName(user.role)}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Phone size={14} />
                    {user.phone}
                  </div>
                </td>
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <MapPin size={14} />
                    {user.zoneIds?.map((zid) => getZoneName(zid)).join('、') || '全部区域'}
                  </div>
                </td>
                <td className="py-3 px-4">
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4].map((level) => (
                      <div
                        key={level}
                        className={`w-2 h-6 rounded ${
                          (user.role === 'worker' && level <= 1) ||
                          (user.role === 'technician' && level <= 2) ||
                          (user.role === 'supervisor' && level <= 3) ||
                          (user.role === 'owner' && level <= 4)
                            ? 'bg-primary-500'
                            : 'bg-gray-200'
                        }`}
                      />
                    ))}
                    <Shield size={14} className="text-gray-400 ml-2" />
                  </div>
                </td>
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setCurrentUser(user)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="切换用户"
                    >
                      <User size={16} />
                    </button>
                    <button
                      className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                      title="编辑"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="删除"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">权限说明</h3>
        <div className="grid grid-cols-4 gap-4">
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 bg-gray-200 rounded-lg flex items-center justify-center">
                <User size={16} className="text-gray-600" />
              </div>
              <span className="font-medium text-gray-800">工人</span>
            </div>
            <ul className="text-xs text-gray-500 space-y-1">
              <li>• 查看并执行自己的任务</li>
              <li>• 上报病虫害</li>
              <li>• 查看数据大屏</li>
              <li>• 扫码打卡</li>
            </ul>
          </div>
          <div className="p-4 bg-blue-50 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 bg-blue-200 rounded-lg flex items-center justify-center">
                <Shield size={16} className="text-blue-600" />
              </div>
              <span className="font-medium text-gray-800">技术员</span>
            </div>
            <ul className="text-xs text-gray-500 space-y-1">
              <li>• 环境监测与设备控制</li>
              <li>• 审核病虫害识别</li>
              <li>• 制定防治方案</li>
              <li>• 查看全部任务</li>
            </ul>
          </div>
          <div className="p-4 bg-purple-50 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 bg-purple-200 rounded-lg flex items-center justify-center">
                <Shield size={16} className="text-purple-600" />
              </div>
              <span className="font-medium text-gray-800">生产主管</span>
            </div>
            <ul className="text-xs text-gray-500 space-y-1">
              <li>• 查看辖区全部数据</li>
              <li>• 审批采购申请</li>
              <li>• 管理库存</li>
              <li>• 查看产量预测</li>
            </ul>
          </div>
          <div className="p-4 bg-orange-50 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 bg-orange-200 rounded-lg flex items-center justify-center">
                <Shield size={16} className="text-orange-600" />
              </div>
              <span className="font-medium text-gray-800">农场主</span>
            </div>
            <ul className="text-xs text-gray-500 space-y-1">
              <li>• 全局数据查看</li>
              <li>• 用户管理</li>
              <li>• 系统设置</li>
              <li>• 调整种植规则</li>
            </ul>
          </div>
        </div>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">添加用户</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">姓名</label>
                <input
                  type="text"
                  placeholder="输入姓名"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">手机号</label>
                <input
                  type="tel"
                  placeholder="输入手机号"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">角色</label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
                  <option value="worker">工人</option>
                  <option value="technician">技术员</option>
                  <option value="supervisor">生产主管</option>
                  <option value="owner">农场主</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">负责区域</label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm">
                  <option value="">全部区域</option>
                  {zones.map((z) => (
                    <option key={z.id} value={z.id}>{z.name}</option>
                  ))}
                </select>
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
                确认添加
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
