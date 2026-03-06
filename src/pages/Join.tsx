import { useState, useEffect, useRef } from 'react';
import { useGameStore } from '../store/gameStore';
import { supabase } from '../lib/supabase';

export default function Join() {
    const [code, setCode] = useState('');
    const [name, setName] = useState('');
    const [isJoined, setIsJoined] = useState(false);
    const [answer, setAnswer] = useState('');
    const [hasAnswered, setHasAnswered] = useState(false);
    const { roomCode, setRoomCode, setRole, status, startGame } = useGameStore();

    const channelRef = useRef<any>(null);

    useEffect(() => {
        if (!isJoined || !roomCode) return;

        const channel = supabase.channel(`room_${roomCode}`)
            .on('broadcast', { event: 'game_start' }, () => {
                startGame();
            })
            .on('broadcast', { event: 'next_question' }, () => {
                setHasAnswered(false);
                setAnswer('');
            })
            .subscribe();

        channelRef.current = channel;

        return () => {
            supabase.removeChannel(channel);
        };
    }, [isJoined, roomCode, startGame]);

    const handleJoin = async () => {
        if (code.length === 4 && name.trim()) {
            const room = code.toUpperCase();
            setRoomCode(room);
            setRole('PLAYER');

            const playerId = Math.random().toString(36).substring(7);
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
            <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-[#fdfbf7]">
                {status === 'PLAYING' ? (
                    <div className="w-full max-w-sm flex flex-col items-center gap-6">
                        <h2 className="text-2xl font-serif font-bold text-black mb-4">Your Answer</h2>

                        {!hasAnswered ? (
                            <>
                                <input
                                    type="text"
                                    value={answer}
                                    onChange={(e) => setAnswer(e.target.value)}
                                    placeholder="Type answer here..."
                                    className="w-full border-2 border-gray-100 rounded-3xl px-6 py-6 text-2xl text-center focus:border-black outline-none transition-all"
                                    autoFocus
                                />
                                <button
                                    onClick={handleSubmitAnswer}
                                    className="w-full bg-black text-white rounded-3xl py-5 text-2xl font-bold active:scale-95 transition-all shadow-xl"
                                >
                                    Submit
                                </button>
                            </>
                        ) : (
                            <div className="text-center animate-pulse">
                                <p className="text-6xl mb-6">⏳</p>
                                <p className="text-2xl font-serif text-gray-400">Answer Sent! Wait for the host...</p>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="text-center animate-[fade-in_1s_ease-out]">
                        <h2 className="text-4xl font-serif font-bold mb-4 text-black">Connected!</h2>
                        <p className="text-xl text-gray-500">Look at the iPad screen. Game will start soon...</p>
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-[#fdfbf7]">
            <h2 className="text-3xl font-serif font-bold mb-8 text-black">Join Game</h2>

            <div className="w-full max-w-xs flex flex-col gap-4">
                <input
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="Room Code"
                    className="border-2 border-gray-100 rounded-2xl px-4 py-4 text-center text-xl font-bold uppercase focus:border-black outline-none transition-colors"
                    maxLength={4}
                />
                <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your Name"
                    className="border-2 border-gray-100 rounded-2xl px-4 py-4 text-center text-xl focus:border-black outline-none transition-colors"
                />
                <button
                    onClick={handleJoin}
                    className="bg-black text-white rounded-2xl py-4 text-xl font-semibold shadow-lg active:scale-95 transition-transform mt-4"
                >
                    Let's Play!
                </button>
            </div>
        </div>
    );
}
