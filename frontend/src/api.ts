import { Task, CreateTaskInput, UpdateTaskInput } from "./types";

const API_BASE = `${import.meta.env.VITE_API_URL || 'https://diminish-waving-shore.ngrok-free.dev'}/api/tasks`;

const headers = {
    "Content-Type": "application/json",
    "ngrok-skip-browser-warning": "true",
};

export async function fetchTasks(): Promise<Task[]> {
    const response = await fetch(API_BASE, { headers });
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to fetch tasks.");
    }
    return response.json();
}

export async function createTask(input: CreateTaskInput): Promise<Task> {
    const response = await fetch(API_BASE, {
        method: "POST",
        headers,
        body: JSON.stringify(input),
    });
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to create task.");
    }
    return response.json();
}

export async function updateTask(id: string, input: UpdateTaskInput): Promise<Task> {
    const response = await fetch(`${API_BASE}/${id}`, {
        method: "PUT",
        headers,
        body: JSON.stringify(input),
    });
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to update task.");
    }
    return response.json();
}

export async function deleteTask(id: string): Promise<void> {
    const response = await fetch(`${API_BASE}/${id}`, {
        method: "DELETE",
        headers,
    });
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to delete task.");
    }
}
