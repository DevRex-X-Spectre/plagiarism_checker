import { ROLES } from '../config/constants.js';

export function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    next();
  };
}

export const requireAdmin = requireRole(ROLES.ADMIN);
export const requireLecturerOrAdmin = requireRole(ROLES.LECTURER, ROLES.ADMIN);
