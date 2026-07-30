import { Request } from 'express';

declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        email: string;
        roleId: string;
        roleName: string;
        societyId: string;
        permissions: string[];
        departments: {
          departmentId: string;
          roleName: string;
          permissions: string[];
        }[];
      };
    }
  }
}
