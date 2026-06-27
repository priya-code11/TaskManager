import 'dotenv/config'; 
import pg from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';

const pool = new pg.Pool({ 
  connectionString: process.env.DATABASE_URL,
  options: '-c search_path=taskDB'
 });

const adapter = new PrismaPg(pool, { schema: 'taskDB' });


const prisma = new PrismaClient({ adapter });


export const getAllTasks = async (req, res) => {
  try {
    const { status, priority } = req.query;
    
    // Build dynamic filter conditions for Prisma
    const whereCondition = {};
    if (status) whereCondition.status = status;
    if (priority) whereCondition.priority = priority;

    const tasks = await prisma.task.findMany({
      where: whereCondition,
      orderBy: { createdAt: 'desc' }, // Show newest tasks first
    });

    return res.status(200).json(tasks);
  } catch (error) {
    console.error('Error fetching tasks:', error);
    return res.status(500).json({ error: 'Failed to fetch tasks.' });
  }
};


export const createTask = async (req, res) => {
  try {
    const { title, description, status, priority, dueDate } = req.body;

    if (!title || title.trim() === '') {
      return res.status(400).json({ error: 'Title is a required field.' });
    }
    if (!dueDate) {
      return res.status(400).json({ error: 'Due date is a required field.' });
    }

    const newTask = await prisma.task.create({
      data: {
        title,
        description: description || '',
        status: status || 'todo',
        priority: priority || 'medium',
        dueDate: new Date(dueDate), // Parses 'YYYY-MM-DD' string to standard Date object
      },
    });

    return res.status(201).json(newTask);
  } catch (error) {
    console.error('Error creating task:', error);
    return res.status(500).json({ error: 'Failed to create task.' });
  }
};


export const updateTask = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, status, priority, dueDate } = req.body;

    // Check if task exists first
    const existingTask = await prisma.task.findUnique({ where: { id } });
    if (!existingTask) {
      return res.status(404).json({ error: 'Task not found.' });
    }

    const updateData = {};
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (status !== undefined) updateData.status = status;
    if (priority !== undefined) updateData.priority = priority;
    if (dueDate !== undefined) updateData.dueDate = new Date(dueDate);

    const updatedTask = await prisma.task.update({
      where: { id },
      data: updateData,
    });

    return res.status(200).json(updatedTask);
  } catch (error) {
    console.error('Error updating task:', error);
    return res.status(500).json({ error: 'Failed to update task.' });
  }
};


export const deleteTask = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if task exists
    const existingTask = await prisma.task.findUnique({ where: { id } });
    if (!existingTask) {
      return res.status(404).json({ error: 'Task not found or already deleted.' });
    }

    await prisma.task.delete({ where: { id } });

    return res.status(200).json({ message: 'Task successfully removed.' });
  } catch (error) {
    console.error('Error deleting task:', error);
    return res.status(500).json({ error: 'Failed to delete task.' });
  }
};