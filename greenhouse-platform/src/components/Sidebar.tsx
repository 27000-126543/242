import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Thermometer,
  ClipboardList,
  Bug,
  Package,
  TrendingUp,
  FileBarChart,
  Users as UsersIcon,
  Settings as SettingsIcon,
} from 'lucide-react';
import { useAppStore, hasPermission } from '../store';
import { getRoleName } from '../utils';

const Sidebar: React.FC = () => {
  const { currentUser } = useAppStore();

  const menuItems = [
    { path: '/', icon: LayoutDashboard, label: '数据大屏', roles: ['worker', 'technician', 'supervisor', 'owner'] },
    { path: '/environment', icon: Thermometer, label: '环境监测', roles: ['technician', 'supervisor', 'owner'] },
    { path: '/tasks', icon: ClipboardList, label: '任务管理', roles: ['worker', 'technician', 'supervisor', 'owner'] },
    { path: '/pests', icon: Bug, label: '病虫害防治', roles: ['technician', 'supervisor', 'owner'] },
    { path: '/inventory', icon: Package, label: '库存管理', roles: ['supervisor', 'owner'] },
    { path: '/yield', icon: TrendingUp, label: '产量预测', roles: ['supervisor', 'owner'] },
    { path: '/reports', icon: FileBarChart, label: '报表分析', roles: ['supervisor', 'owner'] },
    { path: '/users', icon: UsersIcon, label: '用户管理', roles: ['owner'] },
    { path: '/settings', icon: SettingsIcon, label: '系统设置', roles: ['owner'] },
  ];

  const filteredItems = menuItems.filter((item) =>
    item.roles.includes(currentUser.role)
  );

  return (
    <div className="w-64 bg-slate-800 text-white h-screen flex flex-col">
      <div className="p-4 border-b border-slate-700">
        <h1 className="text-xl font-bold flex items-center gap-2">
          <span className="text-2xl">🌱</span>
          智慧温室管理平台
        </h1>
      </div>

      <nav className="flex-1 py-4">
        {filteredItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 text-sm transition-colors ${
                isActive
                  ? 'bg-primary-600 text-white'
                  : 'text-slate-300 hover:bg-slate-700 hover:text-white'
              }`
            }
          >
            <item.icon size={20} />
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-700">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary-500 flex items-center justify-center font-bold">
            {currentUser.name.charAt(0)}
          </div>
          <div>
            <div className="font-medium text-sm">{currentUser.name}</div>
            <div className="text-xs text-slate-400">{getRoleName(currentUser.role)}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
