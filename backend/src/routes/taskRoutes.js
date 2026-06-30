import express from 'express';
import { getAllTasks,createTask,updateTask,deleteTask } from '../controllers/taskController.js';
import { validateTask } from '../middleware/validatetask.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.get('/',authenticateToken, getAllTasks);       
router.post('/',authenticateToken,validateTask, createTask);     
router.put('/:id',authenticateToken,validateTask, updateTask);   
router.delete('/:id',authenticateToken, deleteTask); 

export default router;