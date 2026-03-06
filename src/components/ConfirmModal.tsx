import { motion, AnimatePresence } from 'framer-motion';

interface ConfirmModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title?: string;
    message?: string;
    confirmText?: string;
    cancelText?: string;
    type?: 'danger' | 'warning';
}

export default function ConfirmModal({
    isOpen, onClose, onConfirm,
    title = "QUIT GAME?",
    message = "Are you sure you want to leave this session?",
    confirmText = "YES, LEAVE",
    cancelText = "KEEP PLAYING",
    type = 'danger'
}: ConfirmModalProps) {
    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/60 backdrop-blur-md"
                    />

                    {/* Modal Card */}
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0, y: 50, rotate: -3 }}
                        animate={{ scale: 1, opacity: 1, y: 0, rotate: 0 }}
                        exit={{ scale: 0.8, opacity: 0, y: 50, rotate: 3 }}
                        transition={{ type: "spring", stiffness: 300, damping: 25 }}
                        className="relative bg-white rounded-[3rem] p-10 max-w-sm w-full text-center shadow-2xl border-b-[12px] border-gray-200 overflow-hidden"
                    >
                        {/* Status Icon */}
                        <div className={`${type === 'danger' ? 'bg-red-50 text-red-500' : 'bg-yellow-50 text-yellow-600'} w-24 h-24 rounded-[2rem] flex items-center justify-center text-5xl mx-auto mb-8 shadow-inner`}>
                            {type === 'danger' ? '🚪' : '⚠️'}
                        </div>

                        <h2 className="text-4xl font-black text-black mb-3 uppercase tracking-tighter italic">
                            {title}
                        </h2>

                        <p className="text-gray-400 font-bold text-xs mb-12 leading-relaxed uppercase tracking-widest px-4">
                            {message}
                        </p>

                        <div className="space-y-4">
                            <button
                                onClick={onConfirm}
                                className={`w-full ${type === 'danger' ? 'bg-red-500 shadow-[0_8px_0_0_#991b1b]' : 'bg-[#ffca28] shadow-[0_8px_0_0_#c79100]'} text-white py-6 rounded-[2rem] font-black text-2xl active:shadow-none active:translate-y-2 transition-all uppercase`}
                            >
                                <span className={type === 'warning' ? 'text-black' : ''}>{confirmText}</span>
                            </button>

                            <button
                                onClick={onClose}
                                className="w-full bg-gray-100 hover:bg-gray-200 text-gray-400 py-6 rounded-[2rem] font-black text-xl border-b-4 border-gray-300 active:border-b-0 active:translate-y-1 transition-all uppercase"
                            >
                                {cancelText}
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
