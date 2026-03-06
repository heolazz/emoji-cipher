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
    const [myPlayerId, setMyPlayerId] = useState<string>('');
    const { roomCode, setRoomCode, setRole, status, startGame } = useGameStore();

    const channelRef = useRef<any>(null);

    useEffect(() => {
        const id = Math.random().toString(36).substring(2, 9);
        setMyPlayerId(id);

        if (!isJoined || !roomCode) return;

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
                if (payload.playerId === myPlayerId) {
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
    }, [isJoined, roomCode, startGame, myPlayerId]);

    const handleJoin = async () => {
        if (code.length === 4 && name.trim()) {
            const room = code.toUpperCase();
            setRoomCode(room);
            setRole('PLAYER');

            const playerId = myPlayerId; // Use the generated myPlayerId
            localStorage.setItem('emoji_player_id', playerId);
            const channel = supabase.channel(`room_${room}`, {
                config: { broadcast: { self: true } }
            });

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
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="bg-white rounded-[3rem] p-10 shadow-2xl max-w-sm w-full text-center border-b-8 border-gray-200"
                >
                    {status === 'PLAYING' ? (
                        <div className="bg-white rounded-[2.5rem] p-10 shadow-2xl flex flex-col items-center justify-center border-b-8 border-gray-200">
                            <div className="bg-[#6a5ae0]/10 text-[#6a5ae0] px-6 py-2 rounded-xl font-black uppercase tracking-widest mb-10">
                                YOUR ANSWER
                            </div>

                            {/* Result Screen (Kahoot Style) */}
                            {result ? (
                                <motion.div
                                    initial={{ scale: 0.5, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    className={`w-full flex flex-col items-center justify-center p-8 rounded-[2rem] text-white ${result.isCorrect ? 'bg-green-500 shadow-[0_8px_0_0_#15803d]' : 'bg-red-500 shadow-[0_8px_0_0_#b91c1c]'
                                        }`}
                                >
                                    <div className="text-[6rem] mb-4">
                                        {result.isCorrect ? '✨' : '❄️'}
                                    </div>
                                    <h2 className="text-4xl font-black mb-2 uppercase">
                                        {result.isCorrect ? 'Correct!' : 'Incorrect'}
                                    </h2>

                                    {result.isCorrect && (
                                        <div className="text-2xl font-black mb-4">
                                            +{result.points} pts
                                        </div>
                                    )}

                                    {result.streak > 1 && (
                                        <div className="bg-white/20 px-6 py-2 rounded-full font-black text-sm uppercase flex items-center gap-2">
                                            🔥 {result.streak} STREAK
                                        </div>
                                    )}
                                </motion.div>
                            ) : !hasAnswered && !isLocked ? (
                                <div className="w-full flex flex-col gap-6">
                                    <input
                                        type="text"
                                        value={answer}
                                        onChange={(e) => setAnswer(e.target.value)}
                                        placeholder="TYPE HERE..."
                                        className="w-full bg-gray-50 border-4 border-gray-100 rounded-3xl px-6 py-6 text-2xl text-center font-black placeholder:text-gray-300 focus:border-[#6a5ae0] outline-none transition-all uppercase"
                                        autoFocus
                                    />
                                    <button
                                        onClick={handleSubmitAnswer}
                                        className="w-full bg-[#ffca28] text-black rounded-[2rem] py-6 text-2xl font-black shadow-[0_8px_0_0_#c79100] active:shadow-none active:translate-y-2 transition-all uppercase"
                                    >
                                        SUBMIT
                                    </button>
                                </div>
                            ) : (
                                <div className="text-center py-10">
                                    <motion.div
                                        animate={isLocked && !hasAnswered ? { rotate: [0, 5, -5, 0] } : { y: [0, -10, 0] }}
                                        transition={{ duration: 0.5, repeat: isLocked && !hasAnswered ? 5 : Infinity }}
                                        className="text-7xl mb-6 font-normal"
                                    >
                                        {isLocked && !hasAnswered ? '🚫' : '⏳'}
                                    </motion.div>
                                    <p className="text-xl font-bold text-gray-400 italic">
                                        {hasAnswered ? 'Answer Sent!' : 'Time is Up!'}
                                        <br />
                                        {hasAnswered ? 'Wait for Host...' : 'Input Locked'}
                                    </p>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="text-center py-10">
                            <div className="bg-[#ffca28] w-20 h-20 rounded-3xl flex items-center justify-center text-4xl mx-auto mb-8 shadow-lg">
                                ✅
                            </div>
                            <h2 className="text-4xl font-black text-black mb-4">CONNECTED!</h2>
                            <p className="text-lg font-bold text-gray-400 italic leading-relaxed px-4">
                                Keep an eye on the iPad screen. The game starts soon!
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
