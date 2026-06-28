import React, { useState, useEffect } from "react";
import { Task, TaskStatus, TaskPriority, CreateTaskInput, UpdateTaskInput } from "./types";
import {
    fetchTasks,
    createTask,
    updateTask,
    deleteTask,
} from "./api";
import TaskCard from "./components/TaskCard";
import TaskModal from "./components/TaskModal";
import TaskDetailsModal from "./components/TaskDetailsModal";
import ConfirmModal from "./components/ConfirmModal";
import Toast, { ToastMessage, ToastType } from "./components/Toast";
import {
    Plus,
    Search,
    SlidersHorizontal,
    FolderKanban,
    CheckCircle,
    Clock,
    PlayCircle,
    TrendingUp,
    FolderOpen,
    X,
    AlertCircle,
    Sun,
    Moon
} from "lucide-react";

export default function App() {
    // State variables
    const [tasks, setTasks] = useState<Task[]>([]);
    const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
        if (typeof window !== "undefined") {
            const saved = localStorage.getItem("theme");
            return saved === "dark";
        }
        return false;
    });

    useEffect(() => {
        if (isDarkMode) {
            document.documentElement.classList.add("dark");
            localStorage.setItem("theme", "dark");
        } else {
            document.documentElement.classList.remove("dark");
            localStorage.setItem("theme", "light");
        }
    }, [isDarkMode]);

    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Search & Filters
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState<string>("all");
    const [priorityFilter, setPriorityFilter] = useState<string>("all");
    const [sortBy, setSortBy] = useState<"dueDate" | "priority" | "createdAt">("dueDate");

    // Modals & Active selections
    const [selectedTask, setSelectedTask] = useState<Task | null>(null);
    const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);

    // Confirmation state
    const [taskToDeleteId, setTaskToDeleteId] = useState<string | null>(null);

    // Toasts
    const [toasts, setToasts] = useState<ToastMessage[]>([]);

    // Show dynamic toast notification
    const showToast = (text: string, type: ToastType = "success") => {
        const id = "toast-" + Math.random().toString(36).substring(2, 9);
        setToasts((prev) => [...prev, { id, type, text }]);
    };

    const dismissToast = (id: string) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    };

    // Load tasks on mount
    useEffect(() => {
        loadTasks();
    }, []);

    const loadTasks = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await fetchTasks();
            setTasks(data);
        } catch (err: any) {
            console.error(err);
            setError("Failed to load tasks. Please ensure the backend is available.");
            showToast("Error loading tasks from server", "error");
        } finally {
            setIsLoading(false);
        }
    };

    // Handlers for task modifications
    const handleCreateTask = async (input: CreateTaskInput) => {
        try {
            const newTask = await createTask(input);
            setTasks((prev) => [...prev, newTask]);
            setIsFormModalOpen(false);
            showToast(`Task "${input.title}" created successfully!`);
        } catch (err: any) {
            showToast(err.message || "Failed to create task", "error");
        }
    };

    const handleUpdateTask = async (input: UpdateTaskInput) => {
        if (!taskToEdit) return;
        try {
            const updated = await updateTask(taskToEdit.id, input);
            setTasks((prev) => prev.map((t) => (t.id === taskToEdit.id ? updated : t)));

            // Update selectedTask view if it's currently open
            if (selectedTask?.id === taskToEdit.id) {
                setSelectedTask(updated);
            }

            setTaskToEdit(null);
            setIsFormModalOpen(false);
            showToast(`Task updated successfully!`);
        } catch (err: any) {
            showToast(err.message || "Failed to update task", "error");
        }
    };

    const handleQuickStatusChange = async (id: string, nextStatus: TaskStatus) => {
        try {
            const updated = await updateTask(id, { status: nextStatus });
            setTasks((prev) => prev.map((t) => (t.id === id ? updated : t)));

            if (selectedTask?.id === id) {
                setSelectedTask(updated);
            }

            const statusLabels: Record<string, string> = {
                todo: "To Do",
                in_progress: "In Progress",
                completed: "Completed",
                on_hold: "On Hold",
            };
            showToast(`Task moved to ${statusLabels[nextStatus]}`);
        } catch (err: any) {
            showToast(err.message || "Failed to change task status", "error");
        }
    };

    const handleQuickPriorityChange = async (id: string, priority: TaskPriority) => {
        try {
            const updated = await updateTask(id, { priority });
            setTasks((prev) => prev.map((t) => (t.id === id ? updated : t)));
            if (selectedTask?.id === id) {
                setSelectedTask(updated);
            }
            showToast(`Priority updated to ${priority}`);
        } catch (err: any) {
            showToast(err.message || "Failed to change task priority", "error");
        }
    };

    const handleDeleteTaskConfirm = async () => {
        if (!taskToDeleteId) return;
        try {
            await deleteTask(taskToDeleteId);
            setTasks((prev) => prev.filter((t) => t.id !== taskToDeleteId));

            if (selectedTask?.id === taskToDeleteId) {
                setSelectedTask(null);
            }

            showToast("Task has been successfully deleted.", "info");
        } catch (err: any) {
            showToast(err.message || "Failed to delete task", "error");
        } finally {
            setTaskToDeleteId(null);
        }
    };

    // Filter and Sort logic
    const filteredTasks = tasks.filter((task) => {
        const matchesSearch =
            task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            task.description.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = statusFilter === "all" || task.status === statusFilter;
        const matchesPriority = priorityFilter === "all" || task.priority === priorityFilter;

        return matchesSearch && matchesStatus && matchesPriority;
    });

    // Sort tasks
    const sortedTasks = [...filteredTasks].sort((a, b) => {
        if (sortBy === "dueDate") {
            return new Date(a.dueDate || "").getTime() - new Date(b.dueDate || "").getTime();
        }
        if (sortBy === "priority") {
            const priorityWeight = { high: 3, medium: 2, low: 1 };
            return priorityWeight[b.priority] - priorityWeight[a.priority];
        }
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    // Stats calculation
    const totalCount = tasks.length;
    const completedCount = tasks.filter((t) => t.status === "completed").length;
    const inProgressCount = tasks.filter((t) => t.status === "in_progress").length;
    const pendingCount = tasks.filter((t) => t.status === "todo").length;
    const completionPercentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

    return (
        <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950 font-sans text-slate-700 dark:text-slate-300 antialiased transition-colors duration-200">
            {/* Navigation Header */}
            <header className="sticky top-0 z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-100 dark:border-slate-800 px-6 py-4">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded-xl">
                            <FolderKanban className="w-6 h-6" />
                        </div>
                        <div>
                            <h1 className="font-display font-bold text-xl text-slate-800 dark:text-slate-100 tracking-tight">
                                Task Manager
                            </h1>
                            <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">
                                Streamline project milestones & collaborations
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            id="theme-toggle-btn"
                            onClick={() => setIsDarkMode(!isDarkMode)}
                            className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
                            title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
                        >
                            {isDarkMode ? <Sun className="w-4.5 h-4.5" /> : <Moon className="w-4.5 h-4.5" />}
                        </button>
                        <button
                            id="header-btn-new-task"
                            onClick={() => {
                                setTaskToEdit(null);
                                setIsFormModalOpen(true);
                            }}
                            className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white rounded-xl text-sm font-medium shadow-sm hover:shadow-md transition-all cursor-pointer"
                        >
                            <Plus className="w-4 h-4" />
                            New Task
                        </button>
                    </div>
                </div>
            </header>

            {/* Main Container */}
            <main className="max-w-7xl mx-auto px-6 py-8 space-y-8">
                {/* Statistics Banner */}
                <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 rounded-2xl p-5 shadow-xs flex items-center gap-4 transition-all">
                        <div className="p-3 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded-xl shrink-0">
                            <FolderOpen className="w-5 h-5" />
                        </div>
                        <div>
                            <span className="block text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Total Tasks</span>
                            <span className="text-2xl font-display font-bold text-slate-800 dark:text-slate-100">{totalCount}</span>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 rounded-2xl p-5 shadow-xs flex items-center gap-4 transition-all">
                        <div className="p-3 bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 rounded-xl shrink-0">
                            <PlayCircle className="w-5 h-5" />
                        </div>
                        <div>
                            <span className="block text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Active</span>
                            <span className="text-2xl font-display font-bold text-slate-800 dark:text-slate-100">{inProgressCount}</span>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 rounded-2xl p-5 shadow-xs flex items-center gap-4 transition-all">
                        <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 rounded-xl shrink-0">
                            <CheckCircle className="w-5 h-5" />
                        </div>
                        <div>
                            <span className="block text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Completed</span>
                            <span className="text-2xl font-display font-bold text-slate-800 dark:text-slate-100">{completedCount}</span>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 rounded-2xl p-5 shadow-xs flex items-center gap-4 col-span-2 lg:col-span-1 transition-all">
                        <div className="p-3 bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 rounded-xl shrink-0">
                            <TrendingUp className="w-5 h-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <span className="block text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Completion Rate</span>
                            <div className="flex items-center gap-2 mt-0.5">
                                <span className="text-2xl font-display font-bold text-slate-800 dark:text-slate-100">{completionPercentage}%</span>
                                <div className="flex-1 bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                                    <div
                                        className="bg-purple-600 h-full rounded-full transition-all duration-500"
                                        style={{ width: `${completionPercentage}%` }}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Filters Toolbar */}
                <section className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-5 shadow-xs space-y-4">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                        {/* Search Input */}
                        <div className="relative flex-1 max-w-md">
                            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400 dark:text-slate-500" />
                            <input
                                type="text"
                                id="search-input"
                                placeholder="Search by task title or description..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-11 pr-4 py-2.5 bg-slate-50/50 dark:bg-slate-950/50 rounded-xl border border-slate-200 dark:border-slate-800 focus:outline-hidden focus:ring-4 focus:ring-indigo-100 dark:focus:ring-indigo-950 focus:border-indigo-400 dark:focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-950 text-slate-700 dark:text-slate-200 transition-all text-sm font-sans placeholder-slate-400 dark:placeholder-slate-500"
                            />
                            {searchQuery && (
                                <button
                                    onClick={() => setSearchQuery("")}
                                    className="absolute right-3.5 top-1/2 -translate-y-1/2 p-0.5 rounded-md hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                                >
                                    <X className="w-3.5 h-3.5" />
                                </button>
                            )}
                        </div>

                        {/* Filter controls */}
                        <div className="flex flex-wrap items-center gap-3">
                            {/* Status Filter */}
                            <div className="flex items-center gap-1.5">
                                <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider hidden sm:inline">Status</span>
                                <select
                                    id="filter-status"
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                    className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-sm font-medium bg-white dark:bg-slate-950 text-slate-700 dark:text-slate-200 focus:outline-hidden focus:ring-4 focus:ring-indigo-100 dark:focus:ring-indigo-950 transition-all cursor-pointer"
                                >
                                    <option value="all">All Statuses</option>
                                    <option value="todo">To Do</option>
                                    <option value="in_progress">In Progress</option>
                                    <option value="completed">Completed</option>
                                    <option value="on_hold">On Hold</option>
                                </select>
                            </div>

                            {/* Priority Filter */}
                            <div className="flex items-center gap-1.5">
                                <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider hidden sm:inline">Priority</span>
                                <select
                                    id="filter-priority"
                                    value={priorityFilter}
                                    onChange={(e) => setPriorityFilter(e.target.value)}
                                    className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-sm font-medium bg-white dark:bg-slate-950 text-slate-700 dark:text-slate-200 focus:outline-hidden focus:ring-4 focus:ring-indigo-100 dark:focus:ring-indigo-950 transition-all cursor-pointer"
                                >
                                    <option value="all">All Priorities</option>
                                    <option value="low">Low Priority</option>
                                    <option value="medium">Medium Priority</option>
                                    <option value="high">High Priority</option>
                                </select>
                            </div>

                            {/* Sort By */}
                            <div className="flex items-center gap-1.5">
                                <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider hidden sm:inline">Sort By</span>
                                <select
                                    id="filter-sort"
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value as any)}
                                    className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-sm font-medium bg-white dark:bg-slate-950 text-slate-700 dark:text-slate-200 focus:outline-hidden focus:ring-4 focus:ring-indigo-100 dark:focus:ring-indigo-950 transition-all cursor-pointer"
                                >
                                    <option value="dueDate">Due Date</option>
                                    <option value="priority">Priority Order</option>
                                    <option value="createdAt">Created Date</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Task Board / List Grid */}
                <section>
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800/80 shadow-xs transition-all">
                            <div className="w-10 h-10 border-4 border-indigo-200 dark:border-indigo-900 border-t-indigo-600 dark:border-t-indigo-500 rounded-full animate-spin mb-4" />
                            <p className="text-slate-400 dark:text-slate-500 text-sm font-medium">Fetching internal task repository...</p>
                        </div>
                    ) : error ? (
                        <div className="flex flex-col items-center justify-center text-center p-12 bg-red-50/50 dark:bg-red-950/20 rounded-2xl border border-red-100 dark:border-red-900/50 shadow-xs transition-all">
                            <AlertCircle className="w-12 h-12 text-red-500 dark:text-red-400 mb-3" />
                            <h3 className="font-display font-semibold text-slate-800 dark:text-slate-200 text-lg mb-1">Server connection error</h3>
                            <p className="text-slate-500 dark:text-slate-400 text-sm max-w-md leading-relaxed mb-6">{error}</p>
                            <button
                                onClick={loadTasks}
                                className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:text-indigo-600 dark:hover:text-indigo-400 hover:border-indigo-200 dark:hover:border-indigo-800 rounded-xl text-sm font-medium shadow-xs transition-colors"
                            >
                                Retry Connecting
                            </button>
                        </div>
                    ) : sortedTasks.length === 0 ? (
                        /* Empty State Container */
                        <div className="flex flex-col items-center justify-center text-center py-24 px-6 bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800/80 rounded-2xl shadow-xs transition-all">
                            <div className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-850 text-slate-400 dark:text-slate-500 rounded-2xl mb-4">
                                <FolderOpen className="w-10 h-10" />
                            </div>
                            <h3 className="font-display font-semibold text-slate-800 dark:text-slate-200 text-lg mb-1.5">
                                {tasks.length === 0 ? "No Tasks Added Yet" : "No Matching Tasks Found"}
                            </h3>
                            <p className="text-slate-400 dark:text-slate-500 text-sm max-w-sm leading-relaxed mb-6">
                                {tasks.length === 0
                                    ? "Get started by adding a brand new task. Enter titles, status, descriptions, and assign priority milestones."
                                    : "Try clearing or modifying your status, priority, or search query parameters."}
                            </p>
                            {tasks.length === 0 ? (
                                <button
                                    id="empty-btn-new-task"
                                    onClick={() => {
                                        setTaskToEdit(null);
                                        setIsFormModalOpen(true);
                                    }}
                                    className="inline-flex items-center gap-1.5 px-4.5 py-2.5 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white rounded-xl text-sm font-medium shadow-sm transition-all cursor-pointer"
                                >
                                    <Plus className="w-4 h-4" />
                                    Create Your First Task
                                </button>
                            ) : (
                                <button
                                    id="empty-btn-reset-filters"
                                    onClick={() => {
                                        setSearchQuery("");
                                        setStatusFilter("all");
                                        setPriorityFilter("all");
                                    }}
                                    className="px-4.5 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-sm font-medium transition-all"
                                >
                                    Reset Active Filters
                                </button>
                            )}
                        </div>
                    ) : (
                        /* Grid layout with dynamic layout shifts smoothly animated */
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {sortedTasks.map((task) => (
                                <TaskCard
                                    key={task.id}
                                    task={task}
                                    onView={setSelectedTask}
                                    onEdit={(t) => {
                                        setTaskToEdit(t);
                                        setIsFormModalOpen(true);
                                    }}
                                    onDelete={setTaskToDeleteId}
                                    onStatusChange={handleQuickStatusChange}
                                />
                            ))}
                        </div>
                    )}
                </section>
            </main>

            {/* Task form Modal (Create / Edit) */}
            <TaskModal
                isOpen={isFormModalOpen}
                onClose={() => {
                    setIsFormModalOpen(false);
                    setTaskToEdit(null);
                }}
                taskToEdit={taskToEdit}
                onSubmit={taskToEdit ? handleUpdateTask : handleCreateTask}
            />

            {/* Detail viewer Modal */}
            <TaskDetailsModal
                isOpen={!!selectedTask}
                task={selectedTask}
                onClose={() => setSelectedTask(null)}
                onEdit={(t) => {
                    setTaskToEdit(t);
                    setIsFormModalOpen(true);
                }}
                onDelete={setTaskToDeleteId}
                onStatusChange={handleQuickStatusChange}
                onPriorityChange={handleQuickPriorityChange}
            />

            {/* Confirm Deletion modal */}
            <ConfirmModal
                isOpen={!!taskToDeleteId}
                title="Remove Task Permanently?"
                message="Are you sure you want to delete this task? This action is irreversible and the task information will be lost forever."
                confirmLabel="Remove Task"
                onConfirm={handleDeleteTaskConfirm}
                onClose={() => setTaskToDeleteId(null)}
            />

            {/* Notification Toast container */}
            <Toast toasts={toasts} onDismiss={dismissToast} />
        </div>
    );
}
