import React, { useState, useEffect, useRef } from 'react';
import {
  Bug,
  Camera,
  Upload,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Lock,
  Unlock,
  Search,
  Filter,
  MapPin,
  User,
  Calendar,
  FileText,
  Loader2,
} from 'lucide-react';
import { useAppStore, hasPermission } from '../store';
import { api } from '../services/api';
import {
  formatDateTime,
  getZoneName,
  getUserName,
  getPestStatusName,
  getPestStatusColor,
} from '../utils';

const Pests: React.FC = () => {
  const { pestDetections, currentUser, zones, approvePestDetection, addPestDetection, loadPestDetections } = useAppStore();
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [searchText, setSearchText] = useState<string>('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedDetection, setSelectedDetection] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [detecting, setDetecting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [newDetection, setNewDetection] = useState({
    zoneId: '',
    photoUrl: '',
    detectedPest: '',
    recommendedTreatment: '',
    confidence: 0,
  });

  useEffect(() => {
    loadPestDetections();
  }, [loadPestDetections]);

  const filteredDetections = pestDetections.filter((p) => {
    if (selectedStatus !== 'all' && p.status !== selectedStatus) return false;
    if (searchText && !p.detectedPest.includes(searchText) && !getZoneName(p.zoneId).includes(searchText)) return false;
    return true;
  });

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setUploading(true);
    setDetecting(true);
    try {
      const result = await api.upload.pestImage(file);
      setNewDetection(prev => ({
        ...prev,
        photoUrl: result.imageUrl,
        detectedPest: result.detectedPest,
        recommendedTreatment: result.recommendedTreatment,
        confidence: result.confidence,
      }));
    } catch (error) {
      console.error('图片上传识别失败:', error);
      alert('图片上传识别失败，请重试');
    } finally {
      setUploading(false);
      setDetecting(false);
    }
  };

  const handleAddDetection = () => {
    if (newDetection.zoneId && newDetection.photoUrl && newDetection.detectedPest) {
      addPestDetection({
        zoneId: newDetection.zoneId,
        reportedBy: currentUser.id,
        photoUrl: newDetection.photoUrl,
        detectedPest: newDetection.detectedPest,
        confidence: newDetection.confidence,
        recommendedTreatment: newDetection.recommendedTreatment || '请技术员审核后确定防治方案',
        status: 'detected',
        harvestLocked: false,
      });
      setShowAddModal(false);
      setNewDetection({ zoneId: '', photoUrl: '', detectedPest: '', recommendedTreatment: '', confidence: 0 });
    }
  };

  const canApprove = hasPermission(currentUser.role, 'technician');

  const stats = {
    total: pestDetections.length,
    detected: pestDetections.filter((p) => p.status === 'detected').length,
    approved: pestDetections.filter((p) => p.status === 'approved').length,
    treated: pestDetections.filter((p) => p.status === 'treated').length,
    resolved: pestDetections.filter((p) => p.status === 'resolved').length,
    locked: pestDetections.filter((p) => p.harvestLocked).length,
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">病虫害防治</h2>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm"
        >
          <Camera size={16} />
          上报病虫害
        </button>
      </div>

      <div className="grid grid-cols-6 gap-4">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="text-2xl font-bold text-gray-800">{stats.total}</div>
          <div className="text-sm text-gray-500 mt-1">全部记录</div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="text-2xl font-bold text-yellow-600">{stats.detected}</div>
          <div className="text-sm text-gray-500 mt-1">待审核</div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="text-2xl font-bold text-blue-600">{stats.approved}</div>
          <div className="text-sm text-gray-500 mt-1">已审核</div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="text-2xl font-bold text-purple-600">{stats.treated}</div>
          <div className="text-sm text-gray-500 mt-1">防治中</div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="text-2xl font-bold text-green-600">{stats.resolved}</div>
          <div className="text-sm text-gray-500 mt-1">已解决</div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="text-2xl font-bold text-red-600">{stats.locked}</div>
          <div className="text-sm text-gray-500 mt-1">采收锁定</div>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 bg-white rounded-lg px-3 py-2 border border-gray-200 flex-1 max-w-md">
          <Search size={16} className="text-gray-400" />
          <input
            type="text"
            placeholder="搜索病虫害..."
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
            <option value="detected">已检测</option>
            <option value="approved">已审核</option>
            <option value="treated">已防治</option>
            <option value="resolved">已解决</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {filteredDetections.map((detection) => (
          <div key={detection.id} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <div className="flex gap-4">
              <div className="w-32 h-32 flex-shrink-0">
                <img
                  src={detection.photoUrl}
                  alt={detection.detectedPest}
                  className="w-full h-full object-cover rounded-lg"
                />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-semibold text-gray-800">{detection.detectedPest}</h3>
                  <div className="flex items-center gap-2">
                    {detection.harvestLocked && (
                      <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-700 flex items-center gap-1">
                        <Lock size={12} />
                        采收锁定
                      </span>
                    )}
                    <span className={`px-2 py-1 text-xs rounded-full ${getPestStatusColor(detection.status)}`}>
                      {getPestStatusName(detection.status)}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded">
                    置信度 {detection.confidence}%
                  </span>
                </div>
                <div className="space-y-1 text-sm text-gray-500 mb-3">
                  <div className="flex items-center gap-2">
                    <MapPin size={14} />
                    {getZoneName(detection.zoneId)}
                  </div>
                  <div className="flex items-center gap-2">
                    <User size={14} />
                    上报人：{getUserName(detection.reportedBy)}
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar size={14} />
                    {formatDateTime(detection.reportedAt)}
                  </div>
                  {detection.approvedBy && (
                    <div className="flex items-center gap-2">
                      <CheckCircle size={14} />
                      审核人：{getUserName(detection.approvedBy)} · {formatDateTime(detection.approvedAt!)}
                    </div>
                  )}
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                    <FileText size={14} />
                    推荐用药方案
                  </div>
                  <p className="text-sm text-gray-600">{detection.recommendedTreatment}</p>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-4 pt-4 border-t border-gray-100">
              {detection.status === 'detected' && canApprove && (
                <>
                  <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm flex items-center gap-2">
                    <XCircle size={16} />
                    驳回
                  </button>
                  <button
                    onClick={() => approvePestDetection(detection.id, currentUser.id)}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm flex items-center gap-2"
                  >
                    <CheckCircle size={16} />
                    审核通过生成工单
                  </button>
                </>
              )}
              {detection.status === 'approved' && (
                <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm">
                  标记已防治
                </button>
              )}
              {detection.status === 'treated' && (
                <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm flex items-center gap-2">
                  <Unlock size={16} />
                  解除锁定并结案
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-lg">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">上报病虫害</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">选择区域</label>
                <select
                  value={newDetection.zoneId}
                  onChange={(e) => setNewDetection({ ...newDetection, zoneId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                >
                  <option value="">请选择区域</option>
                  {zones.map((z) => (
                    <option key={z.id} value={z.id}>{z.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">上传病害照片</label>
                <div 
                  className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-primary-400 transition-colors"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />
                  {newDetection.photoUrl ? (
                    <img src={newDetection.photoUrl} alt="上传预览" className="w-full max-h-48 object-contain mx-auto" />
                  ) : detecting ? (
                    <>
                      <Loader2 size={48} className="mx-auto text-primary-500 mb-2 animate-spin" />
                      <p className="text-sm text-primary-600">AI识别中...</p>
                    </>
                  ) : (
                    <>
                      <Upload size={48} className="mx-auto text-gray-400 mb-2" />
                      <p className="text-sm text-gray-500">{uploading ? '上传中...' : '点击上传照片进行AI识别'}</p>
                    </>
                  )}
                </div>
              </div>
              {newDetection.detectedPest && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      识别结果 <span className="text-green-600">（置信度：{newDetection.confidence}%）</span>
                    </label>
                    <input
                      type="text"
                      value={newDetection.detectedPest}
                      onChange={(e) => setNewDetection({ ...newDetection, detectedPest: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">推荐用药方案</label>
                    <textarea
                      value={newDetection.recommendedTreatment}
                      onChange={(e) => setNewDetection({ ...newDetection, recommendedTreatment: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm h-20 resize-none"
                    />
                  </div>
                </>
              )}
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowAddModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm"
              >
                取消
              </button>
              <button
                onClick={handleAddDetection}
                className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm"
              >
                提交识别
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Pests;
