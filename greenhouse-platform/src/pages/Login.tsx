import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Leaf,
  Lock,
  User,
  Eye,
  EyeOff,
  Loader2,
} from 'lucide-react';
import { api, setAuthToken } from '../services/api';
import { useAppStore } from '../store';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { setCurrentUser } = useAppStore();
  const [phone, setPhone] = useState('13800138001');
  const [password, setPassword] = useState('123456');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const testAccounts = [
    { phone: '13800138001', name: '张农场主', role: 'owner' },
    { phone: '13800138002', name: '李主管', role: 'supervisor' },
    { phone: '13800138003', name: '王技术员', role: 'technician' },
    { phone: '13800138004', name: '刘工人', role: 'worker' },
    { phone: '13800138005', name: '陈工人', role: 'worker' },
  ];

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await api.auth.login(phone, password);
      setAuthToken(result.token);
      setCurrentUser(result.user);
      navigate('/');
    } catch (err: any) {
      setError(err.message || '登录失败，请检查手机号和密码');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = (accountPhone: string) => {
    setPhone(accountPhone);
    setPassword('123456');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <Leaf size={40} className="text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">智慧温室管理平台</h1>
          <p className="text-gray-500">智能物联网温室大棚种植管理系统</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-6 text-center">账号登录</h2>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">手机号</label>
              <div className="relative">
                <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="请输入手机号"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">密码</label>
              <div className="relative">
                <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="请输入密码"
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg font-medium hover:from-green-600 hover:to-emerald-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  登录中...
                </>
              ) : (
                '登 录'
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-100">
            <p className="text-sm text-gray-500 mb-3 text-center">测试账号（密码均为 123456）：</p>
            <div className="grid grid-cols-2 gap-2">
              {testAccounts.map((acc) => (
                <button
                  key={acc.phone}
                  onClick={() => handleQuickLogin(acc.phone)}
                  className="text-xs p-2 bg-gray-50 hover:bg-green-50 text-gray-600 hover:text-green-700 rounded-lg transition-colors text-left"
                >
                  <div className="font-medium">{acc.name}</div>
                  <div className="text-gray-400">{acc.phone}</div>
                </button>
              ))}
            </div>
          </div>
        </div>

        <p className="text-center text-sm text-gray-400 mt-6">
          © 2026 智慧温室管理平台 · 物联网智能种植系统
        </p>
      </div>
    </div>
  );
};

export default Login;
