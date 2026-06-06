export const formatDateTime = (dateStr: string): string => {
  const date = new Date(dateStr);
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const formatDate = (dateStr: string): string => {
  const date = new Date(dateStr);
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
};

export const formatTime = (dateStr: string): string => {
  const date = new Date(dateStr);
  return date.toLocaleTimeString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const getZoneName = (zoneId: string): string => {
  const zoneMap: Record<string, string> = {
    'zone-1': '育苗区A',
    'zone-2': '叶菜区B',
    'zone-3': '果菜区C',
    'zone-4': '育苗区D',
    'zone-5': '叶菜区E',
    'zone-6': '果菜区F',
  };
  return zoneMap[zoneId] || zoneId;
};

export const getUserName = (userId: string): string => {
  const userMap: Record<string, string> = {
    'user-1': '张工人',
    'user-2': '李工人',
    'user-3': '王工人',
    'user-4': '赵技术员',
    'user-5': '钱主管',
    'user-6': '孙农场主',
  };
  return userMap[userId] || userId;
};

export const getSensorTypeName = (type: string): string => {
  const map: Record<string, string> = {
    temperature: '温度',
    humidity: '湿度',
    light: '光照',
    co2: 'CO₂',
    soil: '土壤湿度',
  };
  return map[type] || type;
};

export const getDeviceTypeName = (type: string): string => {
  const map: Record<string, string> = {
    curtain: '遮阳帘',
    fan: '通风扇',
    sprinkler: '喷灌系统',
    light: '补光灯',
  };
  return map[type] || type;
};

export const getTaskTypeName = (type: string): string => {
  const map: Record<string, string> = {
    watering: '浇水',
    fertilizing: '施肥',
    pruning: '疏叶',
    harvesting: '采摘',
  };
  return map[type] || type;
};

export const getTaskStatusName = (status: string): string => {
  const map: Record<string, string> = {
    pending: '待处理',
    in_progress: '进行中',
    completed: '已完成',
    overdue: '已超时',
    escalated: '已升级',
  };
  return map[status] || status;
};

export const getTaskStatusColor = (status: string): string => {
  const map: Record<string, string> = {
    pending: 'bg-gray-100 text-gray-800',
    in_progress: 'bg-blue-100 text-blue-800',
    completed: 'bg-green-100 text-green-800',
    overdue: 'bg-red-100 text-red-800',
    escalated: 'bg-orange-100 text-orange-800',
  };
  return map[status] || 'bg-gray-100 text-gray-800';
};

export const getPestStatusName = (status: string): string => {
  const map: Record<string, string> = {
    detected: '已检测',
    approved: '已审核',
    treated: '已防治',
    resolved: '已解决',
  };
  return map[status] || status;
};

export const getPestStatusColor = (status: string): string => {
  const map: Record<string, string> = {
    detected: 'bg-yellow-100 text-yellow-800',
    approved: 'bg-blue-100 text-blue-800',
    treated: 'bg-purple-100 text-purple-800',
    resolved: 'bg-green-100 text-green-800',
  };
  return map[status] || 'bg-gray-100 text-gray-800';
};

export const getRoleName = (role: string): string => {
  const map: Record<string, string> = {
    worker: '工人',
    technician: '技术员',
    supervisor: '生产主管',
    owner: '农场主',
  };
  return map[role] || role;
};

export const getZoneTypeColor = (type: string): string => {
  const map: Record<string, string> = {
    seedling: 'bg-emerald-500',
    leafy: 'bg-green-500',
    fruit: 'bg-orange-500',
  };
  return map[type] || 'bg-gray-500';
};
