import { useState, useEffect, useRef } from 'react';
import { useGameStore } from '../store/gameStore';
import { supabase } from '../lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';

export default function Host() {
    const [pin, setPin] = useState('');
    const [isVerified, setIsVerified] = useState(false);
    const {
        roomCode, setRoomCode, setRole, players, addPlayer,
        status, startGame, questions, currentQuestionIndex,
        validateAnswer, updatePlayerScore, nextQuestion
    } = useGameStore();
    const channelRef = useRef<any>(null);

    useEffect(() => {
        if (!roomCode || !isVerified) return;

        const channel = supabase.channel(`room_${roomCode}`)
            .on('broadcast', { event: 'player_join' }, ({ payload }) => {
                addPlayer({
                    id: payload.id,
                    name: payload.name,
                    score: 0,
                    isConnected: true
                });
            })
            .on('broadcast', { event: 'submit_answer' }, ({ payload }) => {
                const isCorrect = validateAnswer(payload.answer);
                if (isCorrect) {
                    updatePlayerScore(payload.id, 10);
                    confetti({
                        particleCount: 150,
                        spread: 70,
                        origin: { y: 0.6 },
                        colors: ['#000000', '#FFD700', '#FFFFFF']
                    });
                }
            })
            .subscribe();

        channelRef.current = channel;

        return () => {
            supabase.removeChannel(channel);
        };
    }, [roomCode, isVerified, addPlayer, validateAnswer, updatePlayerScore]);

    const handleVerify = () => {
        if (pin === '123456') { // PIN Statis untuk MVP
            setIsVerified(true);
            setRole('HOST');
            const code = Math.random().toString(36).substring(2, 6).toUpperCase();
            setRoomCode(code);
        } else {
            alert('PIN Salah!');
        }
    };

    const handleStartGame = async () => {
        if (Object.keys(players).length === 0) {
            alert('Wait for at least one player!');
            return;
        }
        startGame();
        if (channelRef.current) {
            await channelRef.current.send({
                type: 'broadcast',
                event: 'game_start',
                payload: {}
            });
        }
    };

    if (!isVerified) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-[#fdfbf7]">
                <h2 className="text-2xl font-serif mb-6 text-gray-700">Host Authentication</h2>
                <input
                    type="password"
                    value={pin}
                    onChange={(e) => setPin(e.target.value)}
                    placeholder="Enter 6-digit PIN"
                    className="border-2 border-gray-200 rounded-xl px-4 py-3 text-center text-2xl tracking-widest mb-4 focus:border-black outline-none transition-colors"
                    maxLength={6}
                />
                <button
                    onClick={handleVerify}
                    className="bg-black text-white px-8 py-3 rounded-xl font-semibold active:scale-95 transition-transform"
                >
                    Verify & Create Room
                </button>
            </div>
        );
    }

    if (status === 'PLAYING') {
        const currentQuiz = questions[currentQuestionIndex];
        const sortedPlayers = Object.values(players).sort((a, b) => b.score - a.score);
        const maxScore = Math.max(...sortedPlayers.map(p => p.score), 10);

        const handleNext = async () => {
            if (currentQuestionIndex < questions.length - 1) {
                nextQuestion();
                if (channelRef.current) {
                    await channelRef.current.send({
                        type: 'broadcast',
                        event: 'next_question',
                        payload: {}
                    });
                }
            } else {
                alert('Game End! Final Scoreboard.');
            }
        };

        return (
            <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 gap-8 p-12 bg-[#fdfbf7]">
                {/* Left Side: Question Display */}
                <div className="flex flex-col items-center justify-center bg-white rounded-[3rem] shadow-xl border border-gray-100 p-12">
                    <motion.span
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-black/5 px-8 py-3 rounded-full text-lg font-bold uppercase tracking-[0.3em] mb-12 text-gray-400"
                    >
                        {currentQuiz.category}
                    </motion.span>

                    <motion.h1
                        key={currentQuiz.id}
                        initial={{ scale: 0.5, opacity: 0, rotate: -10 }}
                        animate={{ scale: 1, opacity: 1, rotate: 0 }}
                        className="text-[12rem] md:text-[16rem] mb-12 drop-shadow-2xl"
                    >
                        {currentQuiz.emojis}
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 }}
                        className="text-4xl text-gray-400 italic font-serif text-center max-w-xl leading-relaxed mb-12"
                    >
                        "{currentQuiz.clue}"
                    </motion.p>

                    <button
                        onClick={handleNext}
                        className="mt-4 bg-gray-100 hover:bg-black hover:text-white text-gray-400 px-12 py-5 rounded-3xl font-bold text-xl transition-all active:scale-95"
                    >
                        {currentQuestionIndex < questions.length - 1 ? "Next Question →" : "Finish Game"}
                    </button>
                </div>

                {/* Right Side: Racing Leaderboard */}
                <div className="flex flex-col justify-center p-8 bg-gray-50/50 rounded-[3rem] border border-dashed border-gray-200">
                    <h2 className="text-3xl font-serif font-bold mb-12 text-black text-center">Live Leaderboard</h2>

                    <div className="flex flex-col gap-6 w-full max-w-md mx-auto">
                        <AnimatePresence mode="popLayout">
                            {sortedPlayers.map((p) => {
                                const percentage = (p.score / maxScore) * 100;
                                return (
                                    <motion.div
                                        key={p.id}
                                        layout
                                        initial={{ opacity: 0, x: -50 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        className="flex flex-col gap-2"
                                    >
                                        <div className="flex justify-between items-end px-2">
                                            <span className="font-bold text-xl text-gray-800">{p.name}</span>
                                            <span className="font-serif italic text-2xl text-black">{p.score} pt</span>
                                        </div>
                                        <div className="h-10 w-full bg-white rounded-2xl overflow-hidden shadow-inner border border-gray-100">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${percentage}%` }}
                                                transition={{ type: "spring", stiffness: 50, damping: 15 }}
                                                className="h-full bg-black rounded-r-xl"
                                            />
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-[#fdfbf7]">
            <p className="text-gray-500 mb-2 uppercase tracking-widest text-sm">Room Code</p>
            <h1 className="text-8xl font-serif font-bold mb-8">{roomCode}</h1>
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 max-w-md w-full text-center">
                <h3 className="text-xl font-semibold mb-2">Waiting for Players...</h3>
                <p className="text-gray-400 mb-6">Enter code at emojicipher.com</p>

                <button
                    onClick={handleStartGame}
                    className="w-full bg-black text-white py-4 rounded-2xl font-bold text-lg active:scale-95 transition-all shadow-lg hover:bg-gray-800 disabled:opacity-50 disabled:active:scale-100"
                    disabled={Object.keys(players).length === 0}
                >
                    Start Game
                </button>
            </div>

            <div className="mt-12 flex flex-wrap justify-center gap-4">
                {Object.values(players).map((p) => (
                    <div key={p.id} className="bg-white px-6 py-3 rounded-2xl shadow-sm border border-gray-100 font-bold text-gray-700 animate-in fade-in zoom-in duration-500">
                        {p.name}
                    </div>
                ))}
            </div>
        </div>
    );
}
