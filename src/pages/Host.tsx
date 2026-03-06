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
        roomCode, setRole, players, addPlayer,
        status, startGame, questions, currentQuestionIndex,
        validateAnswer, updatePlayerScore, nextQuestion,
        timeLeft, setTimeLeft, subStatus, revealAnswer
    } = useGameStore();

    const channelRef = useRef<any>(null);
    const sounds = useRef<Record<string, HTMLAudioElement>>({
        correct: new Audio('https://assets.mixkit.co/sfx/preview/mixkit-correct-answer-reward-952.mp3'),
        timeout: new Audio('https://assets.mixkit.co/sfx/preview/mixkit-wrong-answer-fail-notification-946.mp3'),
        tick: new Audio('https://assets.mixkit.co/sfx/preview/mixkit-clock-ticking-second-timer-2936.mp3')
    });

    useEffect(() => {
        if (!roomCode || !isVerified) return;

        const channel = supabase.channel(`room_${roomCode}`)
            .on('broadcast', { event: 'player_join' }, ({ payload }) => {
                addPlayer(payload.id, payload.name);
            })
            .on('broadcast', { event: 'submit_answer' }, ({ payload }) => {
                if (subStatus !== 'QUESTION') return;

                const isCorrect = validateAnswer(payload.answer);

                // Kahoot Logic: Base 500 + (seconds left * 25)
                const speedBonus = timeLeft * 25;
                const totalPoints = isCorrect ? (500 + speedBonus) : 0;

                updatePlayerScore(payload.id, totalPoints);

                // Broadcast individual result back to the player
                if (channelRef.current) {
                    const player = useGameStore.getState().players[payload.id];
                    channelRef.current.send({
                        type: 'broadcast',
                        event: 'answer_result',
                        payload: {
                            playerId: payload.id,
                            isCorrect,
                            points: totalPoints,
                            streak: player?.streak || 0
                        }
                    });
                }

                if (isCorrect) {
                    sounds.current.correct.play().catch(() => { });
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
    }, [roomCode, isVerified, addPlayer, validateAnswer, updatePlayerScore, subStatus, timeLeft]);

    useEffect(() => {
        let interval: any;
        if (status === 'PLAYING' && timeLeft > 0 && subStatus === 'QUESTION') {
            interval = setInterval(() => {
                setTimeLeft(timeLeft - 1);
                if (timeLeft <= 6 && timeLeft > 0) {
                    sounds.current.tick.play().catch(() => { });
                }
            }, 1000);
        } else if (timeLeft === 0 && status === 'PLAYING' && subStatus === 'QUESTION') {
            sounds.current.timeout.play().catch(() => { });
            revealAnswer();
            if (channelRef.current) {
                channelRef.current.send({
                    type: 'broadcast',
                    event: 'timeout',
                    payload: {}
                });
            }
        }
        return () => clearInterval(interval);
    }, [status, timeLeft, setTimeLeft, subStatus, revealAnswer]);

    const handleVerify = () => {
        if (pin === '123456') {
            setIsVerified(true);
            setRole('HOST');
            const code = Math.random().toString(36).substring(2, 6).toUpperCase();
            useGameStore.getState().setRoomCode(code);
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
            <div className="min-h-screen bg-[#6a5ae0] bg-polka flex flex-col items-center justify-center p-6 font-sans relative">
                <button onClick={() => navigate('/')} className="absolute top-6 left-6 md:top-8 md:left-8 bg-white/20 hover:bg-white/30 backdrop-blur-md text-white px-6 py-3 rounded-full font-bold flex items-center gap-2 transition-all active:scale-95 z-20 shadow-lg">
                    ⬅️ BACK
                </button>
                <motion.div initial={{ y: 50, scale: 0.9, opacity: 0 }} animate={{ y: 0, scale: 1, opacity: 1 }} transition={{ type: "spring", stiffness: 200, damping: 20 }} className="bg-white rounded-[3rem] p-12 shadow-2xl max-w-md w-full text-center border-b-8 border-gray-200">
                    <div className="bg-[#6a5ae0]/10 w-20 h-20 rounded-3xl flex items-center justify-center text-4xl mx-auto mb-8">🔐</div>
                    <h2 className="text-4xl font-black text-black mb-2 uppercase">HOST ACCESS</h2>
                    <p className="text-gray-400 font-bold uppercase tracking-widest text-xs mb-10">Enter your secret PIN</p>
                    <div className="space-y-6">
                        <input type="password" value={pin} onChange={(e) => setPin(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleVerify()} placeholder="••••••" className="w-full bg-gray-50 border-4 border-gray-100 rounded-2xl px-4 py-6 text-center text-4xl font-black tracking-[0.5em] placeholder:text-gray-200 focus:border-[#6a5ae0] outline-none transition-all" maxLength={6} />
                        <button onClick={handleVerify} className="w-full bg-[#ffca28] text-black rounded-[2rem] py-6 text-2xl font-black shadow-[0_8px_0_0_#c79100] active:shadow-none active:translate-y-2 transition-all uppercase">VERIFY PIN</button>
                    </div>
                </motion.div>
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
                useGameStore.getState().endGame();
                if (channelRef.current) {
                    await channelRef.current.send({
                        type: 'broadcast',
                        event: 'game_end',
                        payload: {
                            leaderboard: sortedPlayers.map((p, index) => ({
                                id: p.id,
                                rank: index + 1,
                                score: p.score
                            }))
                        }
                    });
                }
                navigate('/podium');
            }
        };

        return (
            <div className="h-screen bg-[#6a5ae0] bg-polka flex flex-col p-10 md:p-14 font-sans overflow-hidden">
                {/* Top Header: Progress & Timer */}
                <div className="flex justify-between items-center mb-8 shrink-0">
                    <div className="flex gap-2">
                        {questions.map((_, i) => (
                            <div key={i} className={`h-2 md:h-3 w-8 md:w-12 rounded-full transition-all duration-500 ${i <= currentQuestionIndex ? 'bg-[#ffca28]' : 'bg-white/20'}`} />
                        ))}
                    </div>
                    <div className="bg-[#ffca28] px-6 py-2 rounded-2xl font-bold text-[#6a5ae0] shadow-lg flex items-center gap-3">
                        <span className="text-xl">⏱️</span>
                        <span className={timeLeft <= 5 && subStatus === 'QUESTION' ? 'text-red-600 animate-pulse' : ''}>
                            00:{timeLeft.toString().padStart(2, '0')}
                        </span>
                    </div>
                </div>

                <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8 items-stretch">
                    <div className="lg:col-span-2 flex flex-col gap-6">
                        <div className="flex-1 bg-white rounded-[2.5rem] md:rounded-[3rem] shadow-2xl p-6 md:p-10 flex flex-col items-center justify-center border-b-8 border-gray-200 overflow-hidden relative">
                            {subStatus === 'QUESTION' ? (
                                <>
                                    <motion.span initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="bg-[#6a5ae0]/10 text-[#6a5ae0] px-4 md:px-6 py-1 md:py-2 rounded-xl font-black uppercase tracking-widest mb-4 md:mb-8 text-xs md:text-sm">
                                        {currentQuiz.category}
                                    </motion.span>
                                    <motion.h1
                                        key={currentQuiz.id}
                                        initial={{ y: 40, scale: 0.5, opacity: 0 }}
                                        animate={{ y: 0, scale: 1, opacity: 1 }}
                                        transition={{ type: "spring", stiffness: 300, damping: 15 }}
                                        className="text-[6rem] md:text-[10rem] lg:text-[12rem] leading-none mb-6 md:mb-10 drop-shadow-xl filter saturate-150"
                                    >
                                        {currentQuiz.emojis}
                                    </motion.h1>

                                    <p className="text-xl md:text-2xl text-gray-400 font-medium text-center italic max-w-xl">
                                        "{currentQuiz.clue}"
                                    </p>
                                </>
                            ) : (
                                <motion.div
                                    initial={{ scale: 0.5, opacity: 0, rotate: -10 }}
                                    animate={{ scale: 1, opacity: 1, rotate: 0 }}
                                    transition={{ type: "spring", stiffness: 250, damping: 15 }}
                                    className="text-center"
                                >
                                    <h3 className="text-[#6a5ae0] font-black text-2xl mb-4 tracking-widest uppercase">The Answer Is</h3>
                                    <h2 className="text-6xl md:text-8xl font-black text-black mb-8 bg-[#ffca28] px-12 py-6 rounded-full shadow-xl">
                                        {currentQuiz.answer}
                                    </h2>
                                    <div className="flex justify-center gap-4 text-6xl">🎉 ✅ 🏆</div>
                                </motion.div>
                            )}
                        </div>
                    </div>

                    <div className="bg-white/10 rounded-[2.5rem] md:rounded-[3rem] p-6 md:p-8 flex flex-col backdrop-blur-md border border-white/20 overflow-hidden">
                        <h2 className="text-white text-xl md:text-2xl font-black mb-4 md:mb-6 flex items-center gap-3 shrink-0">
                            <span className="bg-[#ffca28] p-2 rounded-lg text-black">🏆</span> Leaderboard
                        </h2>
                        <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                            <AnimatePresence mode="popLayout">
                                {sortedPlayers.map((p, index) => (
                                    <motion.div key={p.id} layout initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="bg-white rounded-2xl p-3 md:p-4 flex items-center justify-between border-b-4 border-gray-100 shadow-sm mb-3">
                                        <div className="flex items-center gap-3 md:gap-4">
                                            <div className={`h-8 w-8 md:h-10 md:w-10 flex items-center justify-center rounded-full font-bold text-sm md:text-base ${index === 0 ? 'bg-[#ffca28] text-black' : 'bg-[#6a5ae0]/10 text-[#6a5ae0]'}`}>
                                                {index + 1}
                                            </div>
                                            <span className="font-bold text-gray-700 text-base md:text-lg truncate max-w-[100px] md:max-w-none">{p.name}</span>
                                        </div>
                                        <div className="flex items-center gap-1 md:gap-2">
                                            <span className="font-black text-lg md:text-xl text-[#6a5ae0]">{p.score}</span>
                                            <span className="text-[10px] md:text-xs font-bold text-gray-400 uppercase">pts</span>
                                        </div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>
                        <button onClick={subStatus === 'QUESTION' ? revealAnswer : handleNext} className={`mt-4 md:mt-6 px-6 md:px-8 py-4 md:py-5 rounded-3xl font-black text-lg md:text-xl shadow-[0_6px_0_0_#999] active:shadow-none active:translate-y-1 transition-all shrink-0 ${subStatus === 'QUESTION' ? 'bg-white text-[#6a5ae0]' : 'bg-[#ffca28] text-black'}`}>
                            {subStatus === 'QUESTION' ? "REVEAL ANSWER" : (currentQuestionIndex < questions.length - 1 ? "NEXT QUESTION" : "REVEAL WINNER")}
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#6a5ae0] bg-polka flex flex-col items-center justify-center p-8 font-sans relative">
            <button onClick={() => navigate('/')} className="absolute top-6 left-6 md:top-8 md:left-8 bg-white/20 hover:bg-white/30 backdrop-blur-md text-white px-6 py-3 rounded-full font-bold flex items-center gap-2 transition-all active:scale-95 z-20 shadow-lg">
                ⬅️ BACK
            </button>
            <motion.div initial={{ scale: 0.8, y: 50, opacity: 0 }} animate={{ scale: 1, y: 0, opacity: 1 }} transition={{ type: "spring", stiffness: 200, damping: 20 }} className="bg-white rounded-[3rem] p-12 shadow-2xl max-w-2xl w-full text-center border-b-8 border-gray-200">
                <div className="mb-8">
                    <p className="text-[#6a5ae0] font-black tracking-widest mb-2">ROOM CODE</p>
                    <h1 className="text-[10rem] font-black text-black leading-none">{roomCode}</h1>
                </div>
                <div className="space-y-4 mb-12">
                    <h3 className="text-2xl font-bold text-gray-400 italic">Waiting for your friends...</h3>
                    <div className="flex flex-wrap justify-center gap-3">
                        {Object.values(players).map((p) => (
                            <motion.div key={p.id} initial={{ scale: 0 }} animate={{ scale: 1 }} className="bg-[#6a5ae0] text-white px-6 py-2 rounded-2xl font-bold shadow-lg">
                                {p.name}
                            </motion.div>
                        ))}
                        {Object.keys(players).length === 0 && <p className="text-gray-300">No one here yet • No one here yet</p>}
                    </div>
                </div>
                <button onClick={handleStartGame} className="w-full bg-[#ffca28] hover:bg-[#ffd54f] text-black py-6 rounded-[2rem] font-black text-3xl shadow-[0_8px_0_0_#c79100] active:shadow-none active:translate-y-2 transition-all disabled:opacity-50 disabled:active:translate-y-0" disabled={Object.keys(players).length === 0}>START GAME!</button>
            </motion.div>
        </div>
    );
}
