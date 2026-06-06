import React, { useState, useEffect, useRef } from 'react';
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
  Upload,
} from 'lucide-react';
import { useAppStore } from '../store';
import { api } from '../services/api';
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
  const { tasks, currentUser, updateTaskStatus, zones, loadTasks, loadQRCode, qrCode, checkIn } = useAppStore();
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [searchText, setSearchText] = useState<string>('');
  const [showCheckinModal, setShowCheckinModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState<string | null>(null);
  const [photoUrl, setPhotoUrl] = useState<string>('');
  const [uploading, setUploading] = useState(false);
  const [checkinSuccess, setCheckinSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  useEffect(() => {
    if (showCheckinModal && currentUser?.id) {
      loadQRCode(currentUser.id);
    }
  }, [showCheckinModal, currentUser?.id, loadQRCode]);

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

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedTask) return;
    
    setUploading(true);
    try {
      const result = await api.upload.taskPhoto(selectedTask, file);
      setPhotoUrl(result.photoUrl);
    } catch (error) {
      console.error('照片上传失败:', error);
      alert('照片上传失败，请重试');
    } finally {
      setUploading(false);
    }
  };

  const handleCompleteTask = async () => {
    if (selectedTask && photoUrl) {
      await updateTaskStatus(selectedTask, 'completed', photoUrl);
      setSelectedTask(null);
      setPhotoUrl('');
    }
  };

  const handleCheckIn = async () => {
    if (!currentUser?.id) return;
    try {
      await checkIn(currentUser.id);
      setCheckinSuccess(true);
      setTimeout(() => {
        setCheckinSuccess(false);
        setShowCheckinModal(false);
      }, 2000);
    } catch (error) {
      console.error('打卡失败:', error);
      alert('打卡失败，请重试');
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
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-primary-400 transition-colors" onClick={() => fileInputRef.current?.click()}>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="hidden"
                />
                {photoUrl ? (
                  <img src={photoUrl} alt="上传预览" className="w-full max-h-48 object-contain mx-auto" />
                ) : (
                  <>
                    <Upload size={48} className="mx-auto text-gray-400 mb-2" />
                    <p className="text-sm text-gray-500">{uploading ? '上传中...' : '点击上传照片'}</p>
                  </>
                )}
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
                disabled={!photoUrl || uploading}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
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
            {checkinSuccess ? (
              <div className="py-8">
                <CheckCircle size={64} className="mx-auto text-green-500 mb-4" />
                <p className="text-lg font-medium text-green-600">打卡成功！</p>
              </div>
            ) : (
              <>
                <div className="bg-gray-100 rounded-lg p-6 mb-4">
                  {qrCode ? (
                    <img src={qrCode} alt="打卡二维码" className="w-48 h-48 mx-auto" />
                  ) : (
                    <div className="w-48 h-48 mx-auto bg-white border-2 border-gray-300 rounded-lg flex items-center justify-center">
                      <QrCode size={120} className="text-gray-600" />
                    </div>
                  )}
                </div>
                <p className="text-sm text-gray-500 mb-4">请扫描上方二维码进行打卡</p>
                <div className="bg-green-50 text-green-700 p-3 rounded-lg mb-4">
                  <p className="text-sm">当前用户：{currentUser.name}</p>
                  <p className="text-sm">打卡时间：{formatDateTime(new Date().toISOString())}</p>
                </div>
                <button
                  onClick={handleCheckIn}
                  className="w-full px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm"
                >
                  确认打卡
                </button>
              </>
            )}
            {!checkinSuccess && (
              <button
                onClick={() => setShowCheckinModal(false)}
                className="w-full mt-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm"
              >
                取消
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Tasks;
