import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Task, CreateTaskInput, TaskStatus, TaskPriority } from "../types";
import { X, Calendar, BookOpen, AlertTriangle } from "lucide-react";

interface TaskModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: any) => void;
    taskToEdit?: Task | null;
}

export default function TaskModal({ isOpen, onClose, onSubmit, taskToEdit }: TaskModalProps) {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [status, setStatus] = useState<TaskStatus>("todo");
    const [priority, setPriority] = useState<TaskPriority>("medium");
    const [dueDate, setDueDate] = useState("");
    const [errors, setErrors] = useState<{ title?: string }>({});

    // Reset fields when opening or editing shifts
    useEffect(() => {
        if (isOpen) {
            if (taskToEdit) {
                setTitle(taskToEdit.title);
                setDescription(taskToEdit.description);
                setStatus(taskToEdit.status);
                setPriority(taskToEdit.priority);
                setDueDate(taskToEdit.dueDate);
            } else {
                setTitle("");
                setDescription("");
                setStatus("todo");
                setPriority("medium");
                // Default to today
                setDueDate(new Date().toISOString().split("T")[0]);
            }
            setErrors({});
        }
    }, [isOpen, taskToEdit]);

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim()) {
            setErrors({ title: "Task title is required." });
            return;
        }

        onSubmit({
            title: title.trim(),
            description: description.trim(),
            status,
            priority,
            dueDate,
        });
    };

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                {/* Backdrop */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs"
                />

                {/* Modal Panel */}
                <motion.div
                    id="task-form-modal"
                    initial={{ opacity: 0, scale: 0.95, y: 16 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 16 }}
                    transition={{ duration: 0.2, ease: "easeOut" }}
                    className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-800 overflow-hidden"
                >
                    {/* Header */}
                    <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 px-6 py-4">
                        <h2 className="font-display font-semibold text-lg text-slate-800 dark:text-slate-100">
                            {taskToEdit ? "Edit Task" : "Create New Task"}
                        </h2>
                        <button
                            id="task-modal-close"
                            onClick={onClose}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-850 transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="p-6 space-y-4">
                        {/* Title */}
                        <div>
                            <label htmlFor="form-title" className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                                Task Title *
                            </label>
                            <input
                                type="text"
                                id="form-title"
                                value={title}
                                onChange={(e) => {
                                    setTitle(e.target.value);
                                    if (errors.title) setErrors({});
                                }}
                                placeholder="e.g. Design database schema"
                                className={`w-full px-3.5 py-2.5 rounded-xl border ${errors.title ? 'border-red-400 focus:ring-red-200 dark:focus:ring-red-950/50' : 'border-slate-200 dark:border-slate-800 focus:ring-indigo-200 dark:focus:ring-indigo-950/50'} focus:outline-hidden focus:ring-4 transition-all text-sm font-sans placeholder-slate-400 dark:placeholder-slate-500 bg-white dark:bg-slate-950 text-slate-700 dark:text-slate-200`}
                                autoFocus
                            />
                            {errors.title && (
                                <p className="mt-1.5 flex items-center gap-1 text-xs text-red-600 font-sans">
                                    <AlertTriangle className="w-3.5 h-3.5" />
                                    {errors.title}
                                </p>
                            )}
                        </div>

                        {/* Description */}
                        <div>
                            <label htmlFor="form-desc" className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                                Description
                            </label>
                            <textarea
                                id="form-desc"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Describe what needs to be accomplished in detail..."
                                rows={3}
                                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 focus:outline-hidden focus:ring-4 focus:ring-indigo-200 dark:focus:ring-indigo-950/50 transition-all text-sm font-sans placeholder-slate-400 dark:placeholder-slate-500 bg-white dark:bg-slate-950 text-slate-700 dark:text-slate-200 resize-none"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            {/* Status */}
                            <div>
                                <label htmlFor="form-status" className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                                    Status
                                </label>
                                <select
                                    id="form-status"
                                    value={status}
                                    onChange={(e) => setStatus(e.target.value as TaskStatus)}
                                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 focus:outline-hidden focus:ring-4 focus:ring-indigo-200 dark:focus:ring-indigo-950/50 transition-all text-sm font-sans bg-white dark:bg-slate-950 text-slate-700 dark:text-slate-200"
                                >
                                    <option value="todo">To Do</option>
                                    <option value="in_progress">In Progress</option>
                                    <option value="completed">Completed</option>
                                    <option value="on_hold">On Hold</option>
                                </select>
                            </div>

                            {/* Due Date */}
                            <div>
                                <label htmlFor="form-due" className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                                    Due Date
                                </label>
                                <input
                                    type="date"
                                    id="form-due"
                                    value={dueDate}
                                    onChange={(e) => setDueDate(e.target.value)}
                                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 focus:outline-hidden focus:ring-4 focus:ring-indigo-200 dark:focus:ring-indigo-950/50 transition-all text-sm font-sans bg-white dark:bg-slate-950 text-slate-700 dark:text-slate-200"
                                />
                            </div>
                        </div>

                        {/* Priority Selection */}
                        <div>
                            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                                Priority
                            </label>
                            <div className="grid grid-cols-3 gap-3">
                                {(["low", "medium", "high"] as TaskPriority[]).map((p) => {
                                    const isSelected = priority === p;
                                    return (
                                        <button
                                            key={p}
                                            type="button"
                                            id={`form-priority-${p}`}
                                            onClick={() => setPriority(p)}
                                            className={`py-2 px-3.5 rounded-xl border text-xs font-medium uppercase tracking-wider text-center transition-all ${isSelected
                                                    ? p === "high"
                                                        ? "bg-red-50 dark:bg-red-950/20 border-red-300 dark:border-red-900 text-red-700 dark:text-red-400 shadow-sm font-semibold"
                                                        : p === "medium"
                                                            ? "bg-amber-50 dark:bg-amber-950/20 border-amber-300 dark:border-amber-900 text-amber-700 dark:text-amber-400 shadow-sm font-semibold"
                                                            : "bg-emerald-50 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-900 text-emerald-700 dark:text-emerald-400 shadow-sm font-semibold"
                                                    : "border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
                                                }`}
                                        >
                                            {p}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800 mt-6">
                            <button
                                type="button"
                                id="task-form-cancel"
                                onClick={onClose}
                                className="px-4 py-2.5 rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 text-sm font-medium transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                id="task-form-submit"
                                className="px-5 py-2.5 rounded-xl bg-indigo-600 text-white font-medium text-sm hover:bg-indigo-700 active:bg-indigo-800 shadow-sm hover:shadow-md transition-all cursor-pointer"
                            >
                                {taskToEdit ? "Save Changes" : "Create Task"}
                            </button>
                        </div>
                    </form>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
