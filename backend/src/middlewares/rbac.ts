import { Request, Response, NextFunction } from 'express';

export const checkPermission = (requiredPermission: string) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Unauthorized. Authentication required.',
      });
      return;
    }

    const { roleName, permissions } = req.user;

    // Core Admin bypasses all checks (super admin privilege)
    if (roleName === 'Core Admin') {
      next();
      return;
    }

    // Check if the user has the required permission or wildcard
    if (permissions.includes('*') || permissions.includes(requiredPermission)) {
      next();
      return;
    }

    res.status(403).json({
      success: false,
      message: 'Forbidden. You do not have permission to perform this action.',
    });
  };
};

export const checkDepartmentPermission = (requiredPermission: string) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Unauthorized. Authentication required.',
      });
      return;
    }

    const { roleName, permissions, departments } = req.user;

    // 1. Core Admin bypasses all checks (super admin privilege)
    if (roleName === 'Core Admin') {
      next();
      return;
    }

    // 2. Check if the user has the required permission or wildcard globally
    if (permissions.includes('*') || permissions.includes(requiredPermission)) {
      next();
      return;
    }

    // 3. Extract departmentId from request
    // It could be in params (e.g. /departments/:departmentId/...) or body
    const departmentId = req.params.departmentId || req.body.departmentId;

    if (!departmentId) {
      res.status(403).json({
        success: false,
        message: 'Forbidden. No department specified for this action, and you lack global permissions.',
      });
      return;
    }

    // 4. Check if the user has the permission within this specific department
    const userDept = departments?.find((d) => d.departmentId === departmentId);
    
    if (userDept && (userDept.permissions.includes('*') || userDept.permissions.includes(requiredPermission))) {
      next();
      return;
    }

    res.status(403).json({
      success: false,
      message: 'Forbidden. You do not have permission to perform this action within this department.',
    });
  };
};
