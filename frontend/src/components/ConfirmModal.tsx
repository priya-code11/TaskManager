import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { AlertTriangle, X } from "lucide-react";

interface ConfirmModalProps {
    isOpen: boolean;
    title: string;
    message: string;
    confirmLabel?: string;
    cancelLabel?: string;
    onConfirm: () => void;
    onClose: () => void;
}

export default function ConfirmModal({
    isOpen,
    title,
    message,
    confirmLabel = "Confirm",
    cancelLabel = "Cancel",
    onConfirm,
    onClose,
}: ConfirmModalProps) {
    if (!isOpen) return null;

    return (
        <AnimatePresence>
            {isOpen &&
                (<div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
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
                        id="confirm-modal"
                        initial={{ opacity: 0, scale: 0.95, y: 16 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 16 }}
                        transition={{ duration: 0.15 }}
                        className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-800 overflow-hidden"
                    >
                        {/* Close trigger */}
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                        >
                            <X className="w-4 h-4" />
                        </button>

                        <div className="p-6">
                            <div className="flex items-start gap-4">
                                <div className="p-3 bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 rounded-xl shrink-0 border border-red-100 dark:border-red-900/40">
                                    <AlertTriangle className="w-6 h-6" />
                                </div>
                                <div className="space-y-1.5">
                                    <h3 className="font-display font-semibold text-slate-800 dark:text-slate-100 text-lg leading-tight">
                                        {title}
                                    </h3>
                                    <p className="text-slate-500 dark:text-slate-400 font-sans text-sm leading-relaxed">
                                        {message}
                                    </p>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center justify-end gap-3 pt-6 mt-6 border-t border-slate-100 dark:border-slate-800">
                                <button
                                    id="confirm-btn-cancel"
                                    onClick={onClose}
                                    className="px-4 py-2.5 rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 text-sm font-medium transition-colors"
                                >
                                    {cancelLabel}
                                </button>
                                <button
                                    id="confirm-btn-confirm"
                                    onClick={() => {
                                        onConfirm();
                                        onClose();
                                    }}
                                    className="px-5 py-2.5 rounded-xl bg-red-600 text-white font-medium text-sm hover:bg-red-700 active:bg-red-800 shadow-sm transition-all cursor-pointer"
                                >
                                    {confirmLabel}
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </div>
                )}
        </AnimatePresence>
    );
}
