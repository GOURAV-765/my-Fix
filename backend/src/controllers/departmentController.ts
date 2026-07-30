import { Request, Response } from 'express';
import prisma from '../config/db.js';

export const createDepartment = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, description } = req.body;
    const societyId = req.user?.societyId;

    if (!societyId) {
      res.status(400).json({ success: false, message: 'Society ID missing.' });
      return;
    }

    const department = await prisma.department.create({
      data: {
        name,
        description,
        societyId,
      },
    });

    res.status(201).json({ success: true, data: department });
  } catch (error) {
    console.error('Error creating department:', error);
    res.status(500).json({ success: false, message: 'Error creating department' });
  }
};

export const getDepartments = async (req: Request, res: Response): Promise<void> => {
  try {
    const societyId = req.user?.societyId;
    
    if (!societyId) {
      res.status(400).json({ success: false, message: 'Society ID missing.' });
      return;
    }

    const departments = await prisma.department.findMany({
      where: { societyId },
      include: {
        _count: {
          select: { members: true }
        }
      }
    });

    res.status(200).json({ success: true, data: departments });
  } catch (error) {
    console.error('Error fetching departments:', error);
    res.status(500).json({ success: false, message: 'Error fetching departments' });
  }
};

export const assignUserToDepartment = async (req: Request, res: Response): Promise<void> => {
  try {
    const { departmentId } = req.params;
    const { userId, roleId } = req.body;
    const societyId = req.user?.societyId;

    if (!societyId) {
      res.status(400).json({ success: false, message: 'Society ID missing.' });
      return;
    }

    // Verify user exists and belongs to the same society
    const user = await prisma.user.findFirst({
      where: { id: userId, societyId }
    });

    if (!user) {
      res.status(404).json({ success: false, message: 'User not found in this society' });
      return;
    }

    // Create or update assignment
    const assignment = await prisma.userDepartment.upsert({
      where: {
        userId_departmentId: { userId, departmentId }
      },
      update: { roleId },
      create: { userId, departmentId, roleId }
    });

    res.status(200).json({ success: true, data: assignment });
  } catch (error) {
    console.error('Error assigning user:', error);
    res.status(500).json({ success: false, message: 'Error assigning user' });
  }
};
