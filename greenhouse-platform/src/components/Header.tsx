import React, { useState } from 'react';
import { Bell, LogOut, ChevronDown } from 'lucide-react';
import { useAppStore } from '../store';
import { formatDateTime, getRoleName } from '../utils';

const Header: React.FC = () => {
  const { currentUser, lastRefresh, alerts, logout } = useAppStore();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const unreadAlerts = alerts.filter((a) => !a.resolved).length;

  if (!currentUser) return null;

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <div className="text-sm text-gray-500">
          最后更新: {formatDateTime(lastRefresh)}
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button className="relative p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors">
          <Bell size={20} />
          {unreadAlerts > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
              {unreadAlerts}
            </span>
          )}
        </button>

        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-primary-500 flex items-center justify-center text-white font-bold text-sm">
              {currentUser.name.charAt(0)}
            </div>
            <div className="text-left">
              <div className="text-sm font-medium text-gray-800">{currentUser.name}</div>
              <div className="text-xs text-gray-500">{getRoleName(currentUser.role)}</div>
            </div>
            <ChevronDown size={16} className="text-gray-500" />
          </button>

          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
              <div className="px-4 py-2 border-b border-gray-100">
                <div className="text-sm font-medium text-gray-800">{currentUser.name}</div>
                <div className="text-xs text-gray-500">{currentUser.phone}</div>
              </div>
              <button
                onClick={() => {
                  logout();
                  setShowUserMenu(false);
                }}
                className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2 text-red-600"
              >
                <LogOut size={16} />
                退出登录
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
