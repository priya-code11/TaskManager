import React, { useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";

export type ToastType = "success" | "error" | "info";

export interface ToastMessage {
    id: string;
    type: ToastType;
    text: string;
}

interface ToastProps {
    toasts: ToastMessage[];
    onDismiss: (id: string) => void;
}

export default function Toast({ toasts, onDismiss }: ToastProps) {
    return (
        <div className="fixed bottom-5 right-5 z-[9999] flex flex-col gap-2.5 max-w-sm w-full pointer-events-none">
            <AnimatePresence>
                {toasts.map((toast) => (
                    <ToastItem key={toast.id} toast={toast} onDismiss={onDismiss} />
                ))}
            </AnimatePresence>
        </div>
    );
}

interface ToastItemProps {
    key?: React.Key;
    toast: ToastMessage;
    onDismiss: (id: string) => void;
}

function ToastItem({ toast, onDismiss }: ToastItemProps) {
    useEffect(() => {
        const timer = setTimeout(() => {
            onDismiss(toast.id);
        }, 4000); // Auto dismiss after 4 seconds

        return () => clearTimeout(timer);
    }, [toast.id, onDismiss]);

    const config = {
        success: {
            icon: <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />,
            border: "border-emerald-100",
            bg: "bg-emerald-50/90",
            text: "text-emerald-900",
        },
        error: {
            icon: <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />,
            border: "border-red-100",
            bg: "bg-red-50/90",
            text: "text-red-900",
        },
        info: {
            icon: <Info className="w-5 h-5 text-blue-500 shrink-0" />,
            border: "border-blue-100",
            bg: "bg-blue-50/90",
            text: "text-blue-900",
        },
    }[toast.type];

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.15 } }}
            className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl border shadow-lg ${config.bg} ${config.border} backdrop-blur-md`}
        >
            {config.icon}
            <div className="flex-1 text-sm font-medium leading-normal text-slate-800">
                {toast.text}
            </div>
            <button
                onClick={() => onDismiss(toast.id)}
                className="p-0.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/40 transition-colors shrink-0"
            >
                <X className="w-4 h-4" />
            </button>
        </motion.div>
    );
}
