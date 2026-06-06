import React, { useState } from 'react';
import {
  ClipboardList,
  QrCode,
  Camera,
  CheckCircle,
  Clock,
  AlertTriangle,
  Filter,
  Search,
  User,
  MapPin,
  Calendar,
} from 'lucide-react';
import { useAppStore } from '../store';
import {
  formatDateTime,
  formatTime,
  getZoneName,
  getUserName,
  getTaskTypeName,
  getTaskStatusName,
  getTaskStatusColor,
} from '../utils';
import type { TaskStatus } from '../types';

const Tasks: React.FC = () => {
  const { tasks, currentUser, updateTaskStatus, zones } = useAppStore();
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [searchText, setSearchText] = useState<string>('');
  const [showCheckinModal, setShowCheckinModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState<string | null>(null);
  const [photoUrl, setPhotoUrl] = useState<string>('');

  const filteredTasks = tasks.filter((task) => {
    if (selectedStatus !== 'all' && task.status !== selectedStatus) return false;
    if (searchText && !task.title.includes(searchText) && !getZoneName(task.zoneId).includes(searchText)) return false;
    if (currentUser.role === 'worker' && task.assignedTo !== currentUser.id) return false;
    return true;
  });

  const handleTaskAction = (taskId: string, status: TaskStatus) => {
    if (status === 'completed') {
      setSelectedTask(taskId);
      setPhotoUrl('');
    } else {
      updateTaskStatus(taskId, status);
    }
  };

  const handleCompleteTask = () => {
    if (selectedTask) {
      const mockPhotoUrl = photoUrl || `https://images.unsplash.com/photo-${1416879595882 + Math.floor(Math.random() * 1000)}-3373a0480b5b?w=400`;
      updateTaskStatus(selectedTask, 'completed', mockPhotoUrl);
      setSelectedTask(null);
    }
  };

  const stats = {
    total: tasks.length,
    pending: tasks.filter((t) => t.status === 'pending').length,
    inProgress: tasks.filter((t) => t.status === 'in_progress').length,
    completed: tasks.filter((t) => t.status === 'completed').length,
    overdue: tasks.filter((t) => t.status === 'overdue' || t.status === 'escalated').length,
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">任务管理</h2>
        <button
          onClick={() => setShowCheckinModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm"
        >
          <QrCode size={16} />
          扫码打卡
        </button>
      </div>

      <div className="grid grid-cols-5 gap-4">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="text-2xl font-bold text-gray-800">{stats.total}</div>
          <div className="text-sm text-gray-500 mt-1">全部任务</div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="text-2xl font-bold text-gray-500">{stats.pending}</div>
          <div className="text-sm text-gray-500 mt-1">待处理</div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="text-2xl font-bold text-blue-600">{stats.inProgress}</div>
          <div className="text-sm text-gray-500 mt-1">进行中</div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
          <div className="text-sm text-gray-500 mt-1">已完成</div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="text-2xl font-bold text-red-600">{stats.overdue}</div>
          <div className="text-sm text-gray-500 mt-1">已超时/已升级</div>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 bg-white rounded-lg px-3 py-2 border border-gray-200 flex-1 max-w-md">
          <Search size={16} className="text-gray-400" />
          <input
            type="text"
            placeholder="搜索任务..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="flex-1 text-sm border-none outline-none bg-transparent"
          />
        </div>
        <div className="flex items-center gap-2 bg-white rounded-lg px-3 py-2 border border-gray-200">
          <Filter size={16} className="text-gray-400" />
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="text-sm border-none outline-none bg-transparent"
          >
            <option value="all">全部状态</option>
            <option value="pending">待处理</option>
            <option value="in_progress">进行中</option>
            <option value="completed">已完成</option>
            <option value="overdue">已超时</option>
            <option value="escalated">已升级</option>
          </select>
        </div>
      </div>

      <div className="space-y-4">
        {filteredTasks.map((task) => (
          <div key={task.id} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-lg font-semibold text-gray-800">{task.title}</h3>
                  <span className={`px-2 py-1 text-xs rounded-full ${getTaskStatusColor(task.status)}`}>
                    {getTaskStatusName(task.status)}
                  </span>
                  {task.escalated && (
                    <span className="px-2 py-1 text-xs rounded-full bg-orange-100 text-orange-700 flex items-center gap-1">
                      <AlertTriangle size={12} />
                      已升级主管
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-600 mb-4">{task.description}</p>
                <div className="flex items-center gap-6 text-sm text-gray-500">
                  <div className="flex items-center gap-2">
                    <MapPin size={14} />
                    {getZoneName(task.zoneId)}
                  </div>
                  <div className="flex items-center gap-2">
                    <User size={14} />
                    {getUserName(task.assignedTo)}
                  </div>
                  <div className="flex items-center gap-2">
                    <ClipboardList size={14} />
                    {getTaskTypeName(task.type)}
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar size={14} />
                    创建于 {formatDateTime(task.createdAt)}
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock size={14} />
                    截止 {formatTime(task.dueTime)}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {task.status === 'pending' && (
                  <button
                    onClick={() => handleTaskAction(task.id, 'in_progress')}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                  >
                    开始执行
                  </button>
                )}
                {task.status === 'in_progress' && (
                  <button
                    onClick={() => handleTaskAction(task.id, 'completed')}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm flex items-center gap-2"
                  >
                    <Camera size={16} />
                    完成上传
                  </button>
                )}
                {task.status === 'completed' && task.photoUrl && (
                  <img
                    src={task.photoUrl}
                    alt="完成照片"
                    className="w-16 h-16 rounded-lg object-cover"
                  />
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {selectedTask && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">完成任务</h3>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                上传完成照片
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <Camera size={48} className="mx-auto text-gray-400 mb-2" />
                <p className="text-sm text-gray-500 mb-2">点击或拖拽上传照片</p>
                <input
                  type="text"
                  placeholder="或输入图片URL（演示用）"
                  value={photoUrl}
                  onChange={(e) => setPhotoUrl(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setSelectedTask(null)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm"
              >
                取消
              </button>
              <button
                onClick={handleCompleteTask}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
              >
                确认完成
              </button>
            </div>
          </div>
        </div>
      )}

      {showCheckinModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md text-center">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">扫码打卡</h3>
            <div className="bg-gray-100 rounded-lg p-8 mb-4">
              <div className="w-48 h-48 mx-auto bg-white border-2 border-gray-300 rounded-lg flex items-center justify-center">
                <QrCode size={120} className="text-gray-600" />
              </div>
            </div>
            <p className="text-sm text-gray-500 mb-4">请扫描工作区域二维码进行打卡</p>
            <div className="bg-green-50 text-green-700 p-3 rounded-lg mb-4">
              <p className="text-sm">当前用户：{currentUser.name}</p>
              <p className="text-sm">打卡时间：{formatDateTime(new Date().toISOString())}</p>
            </div>
            <button
              onClick={() => setShowCheckinModal(false)}
              className="w-full px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm"
            >
              模拟打卡成功
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Tasks;
