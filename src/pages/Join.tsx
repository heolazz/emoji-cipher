import { useState, useEffect, useRef } from 'react';
import { useGameStore } from '../store/gameStore';
import { supabase } from '../lib/supabase';
import { motion } from 'framer-motion';

export default function Join() {
    const [code, setCode] = useState('');
    const [name, setName] = useState('');
    const [isJoined, setIsJoined] = useState(false);
    const [answer, setAnswer] = useState('');
    const [hasAnswered, setHasAnswered] = useState(false);
    const [isLocked, setIsLocked] = useState(false);
    const [result, setResult] = useState<{ isCorrect: boolean, points: number, streak: number } | null>(null);
    const [playerId] = useState(() => localStorage.getItem('emoji_player_id') || Math.random().toString(36).substring(2, 9));
    const { roomCode, setRoomCode, setRole, status, startGame } = useGameStore();

    const channelRef = useRef<any>(null);

    useEffect(() => {
        if (!isJoined || !roomCode) return;

        localStorage.setItem('emoji_player_id', playerId);

        const channel = supabase.channel(`room_${roomCode}`)
            .on('broadcast', { event: 'game_start' }, () => {
                startGame();
            })
            .on('broadcast', { event: 'next_question' }, () => {
                setHasAnswered(false);
                setIsLocked(false);
                setAnswer('');
                setResult(null);
            })
            .on('broadcast', { event: 'timeout' }, () => {
                setIsLocked(true);
            })
            .on('broadcast', { event: 'answer_result' }, ({ payload }) => {
                if (payload.playerId === playerId) {
                    setResult({
                        isCorrect: payload.isCorrect,
                        points: payload.points,
                        streak: payload.streak
                    });
                }
            })
            .subscribe();

        channelRef.current = channel;

        return () => {
            supabase.removeChannel(channel);
        };
    }, [isJoined, roomCode, startGame, playerId]);

    const handleJoin = async () => {
        if (code.length === 4 && name.trim()) {
            const room = code.toUpperCase();
            setRoomCode(room);
            setRole('PLAYER');

            const channel = supabase.channel(`room_${room}`);
            channel.subscribe(async (status) => {
                if (status === 'SUBSCRIBED') {
                    await channel.send({
                        type: 'broadcast',
                        event: 'player_join',
                        payload: { id: playerId, name }
                    });
                    setIsJoined(true);
                }
            });
        } else {
            alert('Isi Nama dan Kode Room dengan benar!');
        }
    };

    const handleSubmitAnswer = async () => {
        if (!answer.trim() || !channelRef.current) return;

        const playerId = localStorage.getItem('emoji_player_id');
        await channelRef.current.send({
            type: 'broadcast',
            event: 'submit_answer',
            payload: { id: playerId, name, answer }
        });
        setHasAnswered(true);
    };

    if (isJoined) {
        return (
            <div className="min-h-screen bg-[#6a5ae0] flex flex-col items-center justify-center p-6 font-sans">
                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className={`rounded-[3rem] p-8 shadow-2xl max-w-sm w-full border-b-8 transition-colors duration-500 ${result
                            ? (result.isCorrect ? 'bg-green-500 border-green-700 text-white' : 'bg-red-500 border-red-700 text-white')
                            : 'bg-white border-gray-200 text-black'
                        }`}
                >
                    {status === 'PLAYING' ? (
                        <div className="flex flex-col items-center">
                            {/* Result Screen (Kahoot Style) */}
                            {result ? (
                                <motion.div
                                    initial={{ scale: 0.8, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    className="w-full flex flex-col items-center justify-center py-6"
                                >
                                    <div className="text-[7rem] mb-6 drop-shadow-2xl">
                                        {result.isCorrect ? '✨' : '❄️'}
                                    </div>
                                    <h2 className="text-5xl font-black mb-4 uppercase tracking-tighter italic">
                                        {result.isCorrect ? 'GENIUS!' : 'Ouch...'}
                                    </h2>

                                    <div className="bg-white/20 backdrop-blur-md rounded-3xl p-6 w-full text-center mb-6">
                                        {result.isCorrect ? (
                                            <>
                                                <div className="text-3xl font-black mb-1">
                                                    +{result.points}
                                                </div>
                                                <div className="text-xs font-bold uppercase opacity-80">Points Earned</div>
                                            </>
                                        ) : (
                                            <div className="text-xl font-bold uppercase tracking-widest italic opacity-80">
                                                Better luck next time!
                                            </div>
                                        )}
                                    </div>

                                    {result.streak > 1 && (
                                        <motion.div
                                            animate={{ scale: [1, 1.1, 1] }}
                                            transition={{ repeat: Infinity, duration: 2 }}
                                            className="bg-[#ffca28] text-black px-8 py-3 rounded-full font-black text-sm uppercase flex items-center gap-2 shadow-xl"
                                        >
                                            🔥 {result.streak} ANSWER STREAK!
                                        </motion.div>
                                    )}
                                </motion.div>
                            ) : !hasAnswered && !isLocked ? (
                                <div className="w-full flex flex-col items-center">
                                    <div className="bg-[#6a5ae0]/10 text-[#6a5ae0] px-6 py-2 rounded-xl font-black uppercase tracking-[0.2em] text-[10px] mb-8">
                                        Guess the Cipher
                                    </div>

                                    <div className="w-full space-y-6">
                                        <div className="relative">
                                            <input
                                                type="text"
                                                value={answer}
                                                onChange={(e) => setAnswer(e.target.value)}
                                                placeholder="TYPE ANSWER..."
                                                className="w-full bg-gray-50 border-4 border-gray-100 rounded-3xl px-6 py-8 text-3xl text-center font-black placeholder:text-gray-200 focus:border-[#6a5ae0] focus:bg-white outline-none transition-all uppercase shadow-inner"
                                                autoFocus
                                            />
                                            {answer.length > 0 && (
                                                <motion.div
                                                    initial={{ opacity: 0, scale: 0 }}
                                                    animate={{ opacity: 1, scale: 1 }}
                                                    className="absolute -top-3 -right-3 bg-[#6a5ae0] text-white w-8 h-8 rounded-full flex items-center justify-center font-black text-xs shadow-lg"
                                                >
                                                    {answer.length}
                                                </motion.div>
                                            )}
                                        </div>

                                        <button
                                            onClick={handleSubmitAnswer}
                                            disabled={!answer.trim()}
                                            className="w-full bg-[#ffca28] text-black rounded-[2.5rem] py-6 text-3xl font-black shadow-[0_10px_0_0_#c79100] active:shadow-none active:translate-y-2 transition-all uppercase disabled:opacity-50 disabled:active:translate-y-0"
                                        >
                                            SEND IT!
                                        </button>
                                    </div>

                                    <p className="mt-8 text-gray-300 font-bold uppercase tracking-widest text-[10px]">
                                        Be fast for bonus points! ⚡
                                    </p>
                                </div>
                            ) : (
                                <div className="text-center py-12 flex flex-col items-center">
                                    <div className="relative">
                                        <motion.div
                                            animate={{
                                                scale: [1, 1.2, 1],
                                                rotate: [0, 10, -10, 0]
                                            }}
                                            transition={{ duration: 3, repeat: Infinity }}
                                            className="text-[8rem] mb-8"
                                        >
                                            {isLocked && !hasAnswered ? '⌛' : '🛰️'}
                                        </motion.div>
                                        <motion.div
                                            animate={{ opacity: [0, 1, 0], y: [-20, -60] }}
                                            transition={{ duration: 2, repeat: Infinity }}
                                            className="absolute top-0 right-0 text-3xl"
                                        >
                                            ✨
                                        </motion.div>
                                    </div>

                                    <h2 className="text-3xl font-black text-black mb-2 tracking-tighter uppercase">
                                        {hasAnswered ? 'LOCKED IN!' : 'OUT OF TIME!'}
                                    </h2>
                                    <p className="text-gray-400 font-bold uppercase tracking-[0.1em] text-xs">
                                        {hasAnswered ? 'Wait for the results on screen' : 'Better luck on the next one!'}
                                    </p>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="text-center py-8">
                            <motion.div
                                animate={{ y: [0, -10, 0] }}
                                transition={{ repeat: Infinity, duration: 2 }}
                                className="bg-[#ffca28] w-24 h-24 rounded-[2rem] flex items-center justify-center text-5xl mx-auto mb-8 shadow-[0_8px_0_0_#c79100]"
                            >
                                ✅
                            </motion.div>
                            <h2 className="text-4xl font-black text-black mb-4 tracking-tighter uppercase italic">YOU'RE IN!</h2>
                            <p className="text-gray-400 font-bold uppercase tracking-widest text-[10px] leading-relaxed max-w-[200px] mx-auto opacity-70">
                                Get ready to crack the code. The emojis are coming...
                            </p>
                        </div>
                    )}
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#6a5ae0] flex flex-col items-center justify-center p-6 font-sans">
            <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="bg-white rounded-[3rem] p-10 shadow-2xl max-w-sm w-full border-b-8 border-gray-200"
            >
                <div className="text-center mb-10">
                    <div className="bg-[#6a5ae0]/10 text-[#6a5ae0] w-20 h-20 rounded-3xl flex items-center justify-center text-4xl mx-auto mb-6">
                        👋
                    </div>
                    <h2 className="text-4xl font-black text-black mb-2 uppercase">JOIN GAME</h2>
                    <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">Enter your details</p>
                </div>

                <div className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-[#6a5ae0] font-black text-xs uppercase ml-4">Room Code</label>
                        <input
                            type="text"
                            value={code}
                            onChange={(e) => setCode(e.target.value)}
                            placeholder="CODE"
                            className="w-full bg-gray-50 border-4 border-gray-100 rounded-2xl px-4 py-5 text-center text-2xl font-black uppercase placeholder:text-gray-200 focus:border-[#6a5ae0] outline-none transition-all"
                            maxLength={4}
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[#6a5ae0] font-black text-xs uppercase ml-4">Your Name</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="NAME"
                            className="w-full bg-gray-50 border-4 border-gray-100 rounded-2xl px-4 py-5 text-center text-xl font-black placeholder:text-gray-200 focus:border-[#6a5ae0] outline-none transition-all"
                        />
                    </div>
                    <button
                        onClick={handleJoin}
                        className="w-full bg-[#ffca28] text-black rounded-[2rem] py-6 text-2xl font-black shadow-[0_8px_0_0_#c79100] active:shadow-none active:translate-y-2 transition-all mt-6 uppercase"
                    >
                        LET'S PLAY!
                    </button>
                </div>
            </motion.div>
        </div>
    );
}
