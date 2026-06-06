import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'greenhouse-secret-key-2024';

export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: '未提供认证令牌' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: '认证令牌无效' });
    }
    req.user = user;
    next();
  });
};

export const generateToken = (user) => {
  return jwt.sign(
    { 
      id: user.id, 
      name: user.name, 
      role: user.role,
      zoneIds: user.zoneIds || []
    },
    JWT_SECRET,
    { expiresIn: '24h' }
  );
};

export const hasPermission = (requiredRole) => {
  const roleHierarchy = {
    worker: 1,
    technician: 2,
    supervisor: 3,
    owner: 4
  };

  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: '未认证' });
    }
    if (roleHierarchy[req.user.role] < roleHierarchy[requiredRole]) {
      return res.status(403).json({ error: '权限不足' });
    }
    next();
  };
};
