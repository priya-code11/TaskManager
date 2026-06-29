import express from 'express';
import { getAllTasks,createTask,updateTask,deleteTask } from '../controllers/taskController.js';
import { validateTask } from '../middleware/validatetask.js';

const router = express.Router();

router.get('/', getAllTasks);       
router.post('/',validateTask, createTask);     
router.put('/:id',validateTask, updateTask);   
router.delete('/:id', deleteTask); 

export default router;