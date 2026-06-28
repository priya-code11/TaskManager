export type TaskStatus = 'todo' | 'in_progress' | 'completed' | 'on_hold';
export type TaskPriority = 'low' | 'medium' | 'high';

export interface Task {
    id: string;
    title: string;
    description: string;
    status: TaskStatus;
    priority: TaskPriority;
    dueDate: string; // YYYY-MM-DD
    createdAt: string;
    updatedAt?: string; // Made optional just in case the backend doesn't attach it on every request
}

// CreateTaskInput takes the full Task interface, but removes the fields the database generates
export type CreateTaskInput = Omit<Task, 'id' | 'createdAt' | 'updatedAt'>;

// UpdateTaskInput takes the CreateTaskInput, but makes every field optional (?)
export type UpdateTaskInput = Partial<CreateTaskInput>;
