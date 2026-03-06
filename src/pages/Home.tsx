import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function Home() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-[#6a5ae0] flex flex-col items-center justify-center p-6 relative overflow-hidden font-sans">
            {/* Animated Background Emojis */}
            <motion.div
                animate={{ y: [0, -20, 0], rotate: [0, 10, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute top-20 left-20 text-6xl opacity-30 select-none"
            >
                🎨
            </motion.div>
            <motion.div
                animate={{ y: [0, 20, 0], rotate: [0, -10, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                className="absolute bottom-20 right-20 text-6xl opacity-30 select-none"
            >
                🚀
            </motion.div>
            <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                className="absolute top-1/4 right-1/4 text-4xl opacity-20 select-none"
            >
                ⭐
            </motion.div>

            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-white rounded-[3.5rem] p-12 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] max-w-md w-full text-center border-b-[10px] border-gray-200 relative z-10"
            >
                <div className="mb-10">
                    <div className="bg-[#ffca28] w-20 h-20 rounded-3xl flex items-center justify-center text-4xl mx-auto mb-6 shadow-lg rotate-3">
                        🧐
                    </div>
                    <h1 className="text-5xl font-black text-black tracking-tight mb-2">Emoji Cipher</h1>
                    <p className="text-gray-400 font-bold uppercase tracking-widest text-sm">Multiplayer Party Game</p>
                </div>

                <div className="flex flex-col gap-5">
                    <button
                        onClick={() => navigate('/host')}
                        className="bg-[#6a5ae0] text-white rounded-[2rem] py-5 text-2xl font-black shadow-[0_8px_0_0_#4e41b0] active:shadow-none active:translate-y-2 transition-all"
                    >
                        HOST GAME
                    </button>
                    <button
                        onClick={() => navigate('/join')}
                        className="bg-[#ffca28] text-black rounded-[2rem] py-5 text-2xl font-black shadow-[0_8px_0_0_#c79100] active:shadow-none active:translate-y-2 transition-all"
                    >
                        JOIN GAME
                    </button>
                </div>

                <p className="mt-10 text-gray-300 font-medium text-sm italic">
                    Bring your friends and start the fun!
                </p>
            </motion.div>
        </div>
    );
}
