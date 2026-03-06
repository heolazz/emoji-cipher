import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGameStore } from '../store/gameStore';
import { supabase } from '../lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';

export default function Host() {
    const navigate = useNavigate();
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
                navigate('/podium');
            }
        };

        return (
            <div className="min-h-screen bg-[#6a5ae0] flex flex-col p-8 font-sans">
                {/* Top Header: Progress & Timer */}
                <div className="flex justify-between items-center mb-8">
                    <div className="flex gap-2">
                        {questions.map((_, i) => (
                            <div
                                key={i}
                                className={`h-3 w-12 rounded-full transition-all duration-500 ${i <= currentQuestionIndex ? 'bg-[#ffca28]' : 'bg-white/20'
                                    }`}
                            />
                        ))}
                    </div>
                    <div className="bg-[#ffca28] px-6 py-2 rounded-2xl font-bold text-[#6a5ae0] shadow-lg">
                        {currentQuestionIndex + 1} / {questions.length}
                    </div>
                </div>

                <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                    {/* Main Question Card */}
                    <div className="lg:col-span-2 bg-white rounded-[3rem] shadow-2xl p-12 flex flex-col items-center justify-center min-h-[500px] border-b-8 border-gray-200">
                        <motion.span
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-[#6a5ae0]/10 text-[#6a5ae0] px-6 py-2 rounded-xl font-black uppercase tracking-widest mb-8"
                        >
                            {currentQuiz.category}
                        </motion.span>

                        <motion.h1
                            key={currentQuiz.id}
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            className="text-[12rem] md:text-[18rem] mb-8 drop-shadow-xl filter saturate-150"
                        >
                            {currentQuiz.emojis}
                        </motion.h1>

                        <p className="text-3xl text-gray-400 font-medium text-center italic max-w-xl">
                            "{currentQuiz.clue}"
                        </p>
                    </div>

                    {/* Leaderboard Section */}
                    <div className="bg-white/10 rounded-[3rem] p-8 flex flex-col gap-4 backdrop-blur-md border border-white/20">
                        <h2 className="text-white text-2xl font-black mb-4 flex items-center gap-3">
                            <span className="bg-[#ffca28] p-2 rounded-lg text-black">🏆</span> Leaderboard
                        </h2>

                        <AnimatePresence mode="popLayout">
                            {sortedPlayers.map((p, index) => (
                                <motion.div
                                    key={p.id}
                                    layout
                                    initial={{ x: 20, opacity: 0 }}
                                    animate={{ x: 0, opacity: 1 }}
                                    className="bg-white rounded-2xl p-4 flex items-center justify-between border-b-4 border-gray-100 shadow-sm"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={`h-10 w-10 flex items-center justify-center rounded-full font-bold ${index === 0 ? 'bg-[#ffca28] text-black' : 'bg-[#6a5ae0]/10 text-[#6a5ae0]'
                                            }`}>
                                            {index + 1}
                                        </div>
                                        <span className="font-bold text-gray-700 text-lg">{p.name}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="font-black text-xl text-[#6a5ae0]">{p.score}</span>
                                        <span className="text-xs font-bold text-gray-400 uppercase">pts</span>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>

                        <button
                            onClick={handleNext}
                            className="mt-8 bg-[#ffca28] hover:bg-[#ffd54f] text-black px-8 py-5 rounded-3xl font-black text-xl shadow-[0_6px_0_0_#c79100] active:shadow-none active:translate-y-1 transition-all"
                        >
                            {currentQuestionIndex < questions.length - 1 ? "NEXT QUESTION" : "REVEAL WINNER"}
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#6a5ae0] flex flex-col items-center justify-center p-8 font-sans">
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-white rounded-[3rem] p-12 shadow-2xl max-w-2xl w-full text-center border-b-8 border-gray-200"
            >
                <div className="mb-8">
                    <p className="text-[#6a5ae0] font-black tracking-widest mb-2">ROOM CODE</p>
                    <h1 className="text-[10rem] font-black text-black leading-none">{roomCode}</h1>
                </div>

                <div className="space-y-4 mb-12">
                    <h3 className="text-2xl font-bold text-gray-400 italic">Waiting for your friends...</h3>
                    <div className="flex flex-wrap justify-center gap-3">
                        {Object.values(players).map((p) => (
                            <motion.div
                                key={p.id}
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="bg-[#6a5ae0] text-white px-6 py-2 rounded-2xl font-bold shadow-lg"
                            >
                                {p.name}
                            </motion.div>
                        ))}
                        {Object.keys(players).length === 0 && (
                            <p className="text-gray-300">No one here yet • No one here yet • No one here yet</p>
                        )}
                    </div>
                </div>

                <button
                    onClick={handleStartGame}
                    className="w-full bg-[#ffca28] hover:bg-[#ffd54f] text-black py-6 rounded-[2rem] font-black text-3xl shadow-[0_8px_0_0_#c79100] active:shadow-none active:translate-y-2 transition-all disabled:opacity-50 disabled:active:translate-y-0"
                    disabled={Object.keys(players).length === 0}
                >
                    START GAME!
                </button>
            </motion.div>
        </div>
    );
}
