import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { Task, TaskStatus, TaskPriority } from "../types";
import { X, Calendar, Clock, Edit3, Trash2, Tag, CheckCircle2, RefreshCw } from "lucide-react";

interface TaskDetailsModalProps {
    isOpen: boolean;
    task: Task | null;
    onClose: () => void;
    onEdit: (task: Task) => void;
    onDelete: (id: string) => void;
    onStatusChange: (id: string, status: TaskStatus) => void;
    onPriorityChange: (id: string, priority: TaskPriority) => void;
}

const PRIORITY_LABELS = {
    low: "Low Priority",
    medium: "Medium Priority",
    high: "High Priority",
};

const PRIORITY_THEMES = {
    high: "bg-red-50 text-red-700 border-red-200",
    medium: "bg-amber-50 text-amber-700 border-amber-200",
    low: "bg-emerald-50 text-emerald-700 border-emerald-200",
};

const STATUS_THEMES = {
    todo: "bg-slate-100 text-slate-700 border-slate-200",
    in_progress: "bg-blue-50 text-blue-700 border-blue-200",
    completed: "bg-emerald-50 text-emerald-700 border-emerald-200",
    on_hold: "bg-amber-50 text-amber-700 border-amber-200",
};

const STATUS_LABELS = {
    todo: "To Do",
    in_progress: "In Progress",
    completed: "Completed",
    on_hold: "On Hold",
};

export default function TaskDetailsModal({
    isOpen,
    task,
    onClose,
    onEdit,
    onDelete,
    onStatusChange,
    onPriorityChange,
}: TaskDetailsModalProps) {
    if (!isOpen || !task) return null;

    // Format dates nicely
    const formatDateString = (isoString: string) => {
        return new Date(isoString).toLocaleString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const formattedDueDate = task.dueDate
        ? new Date(task.dueDate + "T00:00:00").toLocaleDateString("en-US", {
            month: "long",
            day: "numeric",
            year: "numeric",
        })
        : "Not defined";

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
                    id="task-details-modal"
                    initial={{ opacity: 0, scale: 0.95, y: 16 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 16 }}
                    transition={{ duration: 0.2 }}
                    className="relative w-full max-w-xl bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-800 overflow-hidden"
                >
                    {/* Header Action Row */}
                    <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 px-6 py-4">
                        <span className="text-xs font-mono font-semibold tracking-wider text-slate-400 uppercase">
                            Task Details
                        </span>
                        <div className="flex items-center gap-2">
                            <button
                                id="details-btn-edit"
                                onClick={() => {
                                    onEdit(task);
                                    onClose();
                                }}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:border-indigo-200 dark:hover:border-indigo-800 hover:bg-indigo-50/50 dark:hover:bg-indigo-950/40 text-xs font-medium transition-all"
                            >
                                <Edit3 className="w-3.5 h-3.5" />
                                Edit
                            </button>
                            <button
                                id="details-btn-delete"
                                onClick={() => {
                                    onDelete(task.id);
                                    onClose();
                                }}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-red-100 dark:border-red-900 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 text-xs font-medium transition-all"
                            >
                                <Trash2 className="w-3.5 h-3.5" />
                                Remove
                            </button>
                            <div className="w-px h-5 bg-slate-200 dark:bg-slate-700 mx-1" />
                            <button
                                id="details-modal-close"
                                onClick={onClose}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    <div className="p-6 space-y-6">
                        {/* Title & Description */}
                        <div>
                            <h1 className="font-display font-semibold text-2xl text-slate-800 dark:text-slate-100 leading-snug mb-3">
                                {task.title}
                            </h1>
                            <div className="bg-slate-50/50 dark:bg-slate-950/50 rounded-xl p-4 border border-slate-100 dark:border-slate-800 min-h-[80px]">
                                {task.description ? (
                                    <p className="text-slate-600 dark:text-slate-300 text-sm font-sans whitespace-pre-wrap leading-relaxed">
                                        {task.description}
                                    </p>
                                ) : (
                                    <p className="text-slate-400 dark:text-slate-500 text-sm font-sans italic">
                                        No description provided.
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Quick Status and Priority Badges / Controls */}
                        <div className="grid grid-cols-2 gap-4 border-y border-slate-100 dark:border-slate-800 py-5">
                            {/* Status Selector */}
                            <div>
                                <span className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                                    Status
                                </span>
                                <select
                                    id="details-status-select"
                                    value={task.status}
                                    onChange={(e) => onStatusChange(task.id, e.target.value as TaskStatus)}
                                    className={`w-full px-3 py-1.5 rounded-xl border text-xs font-medium bg-white dark:bg-slate-950 focus:outline-hidden focus:ring-4 focus:ring-indigo-100 dark:focus:ring-indigo-950 transition-all cursor-pointer ${task.status === "completed"
                                            ? "text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900 bg-emerald-50/50 dark:bg-emerald-950/20"
                                            : task.status === "in_progress"
                                                ? "text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-900 bg-blue-50/50 dark:bg-blue-950/20"
                                                : task.status === "on_hold"
                                                    ? "text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-900 bg-amber-50/50 dark:bg-amber-950/20"
                                                    : "text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/40"
                                        }`}
                                >
                                    <option value="todo">To Do</option>
                                    <option value="in_progress">In Progress</option>
                                    <option value="completed">Completed</option>
                                    <option value="on_hold">On Hold</option>
                                </select>
                            </div>

                            {/* Priority Selector */}
                            <div>
                                <span className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                                    Priority
                                </span>
                                <select
                                    id="details-priority-select"
                                    value={task.priority}
                                    onChange={(e) => onPriorityChange(task.id, e.target.value as TaskPriority)}
                                    className={`w-full px-3 py-1.5 rounded-xl border text-xs font-medium bg-white dark:bg-slate-950 focus:outline-hidden focus:ring-4 focus:ring-indigo-100 dark:focus:ring-indigo-950 transition-all cursor-pointer ${task.priority === "high"
                                            ? "text-red-700 dark:text-red-400 border-red-200 dark:border-red-900 bg-red-50/50 dark:bg-red-950/20"
                                            : task.priority === "medium"
                                                ? "text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-900 bg-amber-50/50 dark:bg-amber-950/20"
                                                : "text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900 bg-emerald-50/50 dark:bg-emerald-950/20"
                                        }`}
                                >
                                    <option value="low">Low Priority</option>
                                    <option value="medium">Medium Priority</option>
                                    <option value="high">High Priority</option>
                                </select>
                            </div>
                        </div>

                        {/* Date Details */}
                        <div className="grid grid-cols-2 gap-y-4 text-sm font-sans">
                            <div className="flex items-center gap-3">
                                <Calendar className="w-5 h-5 text-slate-400" />
                                <div>
                                    <span className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                                        Due Date
                                    </span>
                                    <span className="text-slate-700 dark:text-slate-300 font-medium text-sm">
                                        {formattedDueDate}
                                    </span>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <Clock className="w-5 h-5 text-slate-400" />
                                <div>
                                    <span className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                                        Created
                                    </span>
                                    <span className="text-slate-600 dark:text-slate-400 text-xs">
                                        {formatDateString(task.createdAt)}
                                    </span>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 col-span-2">
                                <RefreshCw className="w-5 h-5 text-slate-400" />
                                <div>
                                    <span className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                                        Last Update
                                    </span>
                                    <span className="text-slate-600 dark:text-slate-400 text-xs">
                                        {formatDateString(task.updatedAt)}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
