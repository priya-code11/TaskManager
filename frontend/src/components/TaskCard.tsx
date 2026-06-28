import React from "react";
import { motion } from "motion/react";
import { Task, TaskStatus, TaskPriority } from "../types";
import { Calendar, Trash2, Edit3, ArrowRight, CheckCircle2, Clock, PlayCircle, AlertCircle } from "lucide-react";

interface TaskCardProps {
    key?: React.Key;
    task: Task;
    onView: (task: Task) => void;
    onEdit: (task: Task) => void;
    onDelete: (id: string) => void;
    onStatusChange: (id: string, status: TaskStatus) => void;
}

const PRIORITY_THEMES = {
    high: {
        bg: "bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-400 border-red-200 dark:border-red-900/50",
        dot: "bg-red-500",
        label: "High Priority",
    },
    medium: {
        bg: "bg-amber-50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-900/50",
        dot: "bg-amber-500",
        label: "Medium Priority",
    },
    low: {
        bg: "bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900/50",
        dot: "bg-emerald-500",
        label: "Low Priority",
    },
};

const STATUS_ICONS = {
    todo: <Clock className="w-4 h-4 text-slate-400 dark:text-slate-500" />,
    in_progress: <PlayCircle className="w-4 h-4 text-blue-500 dark:text-blue-400 animate-pulse" />,
    completed: <CheckCircle2 className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />,
    on_hold: <AlertCircle className="w-4 h-4 text-amber-500 dark:text-amber-400" />,
};

const STATUS_LABELS = {
    todo: "To Do",
    in_progress: "In Progress",
    completed: "Completed",
    on_hold: "On Hold",
};

export default function TaskCard({ task, onView, onEdit, onDelete, onStatusChange }: TaskCardProps) {
    const priorityStyle = PRIORITY_THEMES[task.priority] || PRIORITY_THEMES.medium;

    // Format due date to be user friendly
    const formattedDueDate = task.dueDate ? new Date(task.dueDate + "T00:00:00").toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
    }) : "No due date";

    // Quick next-step helper for status cycle
    const getNextStatus = (current: TaskStatus): TaskStatus | null => {
        if (current === "todo") return "in_progress";
        if (current === "in_progress") return "completed";
        return null;
    };

    const nextStatus = getNextStatus(task.status);

    return (
        <motion.div
            id={`task-card-${task.id}`}
            layout
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.2 }}
            className="group relative flex flex-col justify-between bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-md dark:hover:shadow-lg transition-all duration-250 cursor-pointer"
            onClick={() => onView(task)}
        >
            {/* Top Section */}
            <div>
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                        {STATUS_ICONS[task.status]}
                        <span className="text-xs font-mono text-slate-500 dark:text-slate-400 font-medium">
                            {STATUS_LABELS[task.status]}
                        </span>
                    </div>
                    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium border ${priorityStyle.bg}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${priorityStyle.dot}`} />
                        {priorityStyle.label}
                    </span>
                </div>

                <h3 className="font-display font-medium text-slate-800 dark:text-slate-100 text-base leading-snug group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors mb-2 line-clamp-1">
                    {task.title}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-sans line-clamp-2 leading-relaxed mb-4">
                    {task.description || <span className="italic text-slate-400 dark:text-slate-500">No description provided</span>}
                </p>
            </div>

            {/* Bottom Section */}
            <div className="border-t border-slate-100 dark:border-slate-800 pt-4 flex items-center justify-between mt-auto" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 font-mono">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>{formattedDueDate}</span>
                </div>

                {/* Action Tray */}
                <div className="flex items-center gap-1">
                    {nextStatus && (
                        <button
                            id={`task-btn-promote-${task.id}`}
                            onClick={() => onStatusChange(task.id, nextStatus)}
                            title={`Move to ${STATUS_LABELS[nextStatus]}`}
                            className="p-1.5 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-950/40 text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                        >
                            <ArrowRight className="w-4 h-4" />
                        </button>
                    )}
                    <button
                        id={`task-btn-edit-${task.id}`}
                        onClick={() => onEdit(task)}
                        title="Edit Task"
                        className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
                    >
                        <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                        id={`task-btn-delete-${task.id}`}
                        onClick={() => onDelete(task.id)}
                        title="Remove Task"
                        className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/20 text-slate-500 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </motion.div>
    );
}
