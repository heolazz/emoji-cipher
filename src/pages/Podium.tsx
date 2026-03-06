import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useGameStore } from '../store/gameStore';
import confetti from 'canvas-confetti';
import { useEffect } from 'react';

export default function Podium() {
    const navigate = useNavigate();
    const { players } = useGameStore();

    const sortedPlayers = Object.values(players).sort((a, b) => b.score - a.score);
    const winners = sortedPlayers.slice(0, 3);

    useEffect(() => {
        const duration = 15 * 1000;
        const animationEnd = Date.now() + duration;
        const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

        const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

        const interval: any = setInterval(function () {
            const timeLeft = animationEnd - Date.now();

            if (timeLeft <= 0) {
                return clearInterval(interval);
            }

            const particleCount = 50 * (timeLeft / duration);
            confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
            confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
        }, 250);

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="min-h-screen bg-[#6a5ae0] flex flex-col items-center justify-center p-8 font-sans overflow-hidden">
            <motion.h1
                initial={{ y: -50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="text-white text-6xl font-black mb-20 drop-shadow-lg text-center"
            >
                👑 FINAL CHAMPIONS 👑
            </motion.h1>

            <div className="flex items-end gap-4 md:gap-8 h-[400px] mb-20">
                {/* 2nd Place */}
                {winners[1] && (
                    <div className="flex flex-col items-center">
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.5 }}
                            className="bg-white/20 p-4 rounded-2xl mb-4 text-white font-bold text-center"
                        >
                            <p className="text-sm opacity-60">2ND</p>
                            <p className="text-xl">{winners[1].name}</p>
                        </motion.div>
                        <motion.div
                            initial={{ height: 0 }}
                            animate={{ height: 180 }}
                            transition={{ duration: 1, delay: 0.5 }}
                            className="w-24 md:w-32 bg-gray-300 rounded-t-3xl border-b-0 shadow-lg relative overflow-hidden flex flex-col items-center pt-4"
                        >
                            <span className="text-4xl text-gray-500 font-black">2</span>
                        </motion.div>
                    </div>
                )}

                {/* 1st Place */}
                {winners[0] && (
                    <div className="flex flex-col items-center">
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1.2 }}
                            transition={{ type: "spring", stiffness: 200, delay: 1 }}
                            className="bg-[#ffca28] p-6 rounded-[2.5rem] mb-6 text-black font-black text-center shadow-2xl relative z-10"
                        >
                            <span className="absolute -top-10 left-1/2 -translate-x-1/2 text-5xl">👑</span>
                            <p className="text-xs uppercase tracking-widest opacity-60">CHAMPION</p>
                            <p className="text-3xl">{winners[0].name}</p>
                            <p className="text-[#6a5ae0] mt-1">{winners[0].score} pts</p>
                        </motion.div>
                        <motion.div
                            initial={{ height: 0 }}
                            animate={{ height: 280 }}
                            transition={{ duration: 1, delay: 0.1 }}
                            className="w-32 md:w-40 bg-[#ffca28] rounded-t-[3rem] shadow-2xl relative overflow-hidden flex flex-col items-center pt-8 border-t-8 border-white/30"
                        >
                            <span className="text-6xl text-[#c79100] font-black">1</span>
                        </motion.div>
                    </div>
                )}

                {/* 3rd Place */}
                {winners[2] && (
                    <div className="flex flex-col items-center">
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 1.5 }}
                            className="bg-white/10 p-4 rounded-2xl mb-4 text-white font-bold text-center"
                        >
                            <p className="text-sm opacity-60">3RD</p>
                            <p className="text-xl">{winners[2].name}</p>
                        </motion.div>
                        <motion.div
                            initial={{ height: 0 }}
                            animate={{ height: 120 }}
                            transition={{ duration: 1, delay: 1.5 }}
                            className="w-20 md:w-28 bg-[#cd7f32]/60 rounded-t-3xl shadow-lg relative overflow-hidden flex flex-col items-center pt-4"
                        >
                            <span className="text-3xl text-[#cd7f32] font-black">3</span>
                        </motion.div>
                    </div>
                )}
            </div>

            <motion.button
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 2.5 }}
                onClick={() => navigate('/')}
                className="bg-white text-[#6a5ae0] px-12 py-5 rounded-[2rem] font-black text-2xl shadow-xl hover:scale-105 active:scale-95 transition-all"
            >
                BACK TO HOME
            </motion.button>
        </div>
    );
}
