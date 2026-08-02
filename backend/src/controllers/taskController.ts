import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../middlewares/auth.js';
import prisma from '../config/db.js';

export const getTasks = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const societyId = req.user?.societyId;
    if (!societyId) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const { departmentId } = req.query;

    const userDepartments = await prisma.userDepartment.findMany({
      where: { userId: req.user?.id },
    });
    const userDeptIds = userDepartments.map((ud) => ud.departmentId);

    if (userDeptIds.length === 0) {
      res.status(200).json({ success: true, tasks: [] });
      return;
    }

    let whereClause: any = { societyId };

    if (departmentId && typeof departmentId === 'string') {
      if (!userDeptIds.includes(departmentId)) {
        res.status(403).json({ success: false, message: 'Forbidden: You do not belong to this department.' });
        return;
      }
      whereClause.departmentId = departmentId;
    } else {
      whereClause.departmentId = { in: userDeptIds };
    }

    const tasks = await prisma.task.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
    });

    res.status(200).json({ success: true, tasks });
  } catch (error) {
    next(error);
  }
};

export const createTask = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const societyId = req.user?.societyId;
    if (!societyId) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const { title, description, priority, assigneeId, dueDate, departmentId } = req.body;

    if (!departmentId) {
      res.status(400).json({ success: false, message: 'Department is required for a task' });
      return;
    }

    // Verify user belongs to this department
    const userDept = await prisma.userDepartment.findFirst({
      where: { userId: req.user?.id, departmentId },
    });

    if (!userDept) {
      res.status(403).json({ success: false, message: 'Forbidden: You do not belong to this department.' });
      return;
    }

    const task = await prisma.task.create({
      data: {
        societyId,
        departmentId,
        title,
        description,
        priority: priority || 'medium',
        assigneeId,
        dueDate,
        status: 'todo',
      },
    });

    res.status(201).json({ success: true, task });
  } catch (error) {
    next(error);
  }
};

export const updateTask = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const societyId = req.user?.societyId;
    if (!societyId) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const { id } = req.params;
    const { title, description, priority, assigneeId, dueDate, status, departmentId } = req.body;

    const taskToUpdate = await prisma.task.findUnique({ where: { id } });
    if (!taskToUpdate) {
      res.status(404).json({ success: false, message: 'Task not found' });
      return;
    }

    // Verify user belongs to the task's department
    const userDept = await prisma.userDepartment.findFirst({
      where: { userId: req.user?.id, departmentId: taskToUpdate.departmentId },
    });

    if (!userDept) {
      res.status(403).json({ success: false, message: 'Forbidden: You do not belong to this department.' });
      return;
    }

    // Use update to get the actual updated task object back rather than a batch count.
    const updatedTask = await prisma.task.update({
      where: { id },
      data: {
        title,
        description,
        priority,
        assigneeId,
        dueDate,
        status,
        ...(departmentId && { departmentId }), // Allow changing department if provided, though typically won't happen
      },
    });

    res.status(200).json({ success: true, task: updatedTask });
  } catch (error) {
    next(error);
  }
};

export const deleteTask = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const societyId = req.user?.societyId;
    if (!societyId) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const { id } = req.params;

    await prisma.task.delete({
      where: { id },
    });

    res.status(200).json({ success: true, message: 'Task deleted successfully' });
  } catch (error) {
    next(error);
  }
};
