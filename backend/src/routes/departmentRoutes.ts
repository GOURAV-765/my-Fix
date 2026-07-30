import express from 'express';
import { authenticate } from '../middlewares/auth.js';
import { checkPermission } from '../middlewares/rbac.js';
import { createDepartment, getDepartments, assignUserToDepartment } from '../controllers/departmentController.js';

const router = express.Router();

router.use(authenticate);

// We use global permissions to manage the overall list of departments
router.post('/', checkPermission('department:manage'), createDepartment);
router.get('/', checkPermission('department:read'), getDepartments);
router.post('/:departmentId/users', checkPermission('department:manage'), assignUserToDepartment);

export default router;
