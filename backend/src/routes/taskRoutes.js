import express from 'express';
import {
  getAllTasks,
  createTask,
  updateTask,
  deleteTask
} from '../controllers/taskController.js';
import { validateTask } from '../middleware/validatetask.js'; // From BE2

const router = express.Router();

router.get('/', getAllTasks);       
router.post('/', validateTask, createTask);     // From BE2
router.put('/:id', validateTask, updateTask);   // From BE2
router.delete('/:id', deleteTask); 

export default router;