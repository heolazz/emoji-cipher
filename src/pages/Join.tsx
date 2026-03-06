import { useState, useEffect } from 'react';
import { useGameStore } from '../store/gameStore';
import { supabase } from '../lib/supabase';

export default function Join() {
    const [code, setCode] = useState('');
    const [name, setName] = useState('');
    const [isJoined, setIsJoined] = useState(false);
    const { roomCode, setRoomCode, setRole, status, startGame } = useGameStore();

    useEffect(() => {
        if (!isJoined || !roomCode) return;

        const channel = supabase.channel(`room_${roomCode}`)
            .on('broadcast', { event: 'game_start' }, () => {
                startGame();
            })
            .subscribe();

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

    if (isJoined) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-[#fdfbf7]">
                <h2 className="text-3xl font-serif font-bold mb-4 text-black text-center">
                    {status === 'PLAYING' ? "Game Started!" : "Connected!"}
                </h2>
                <p className="text-gray-500 text-center">
                    {status === 'PLAYING'
                        ? "Get ready to answer on your phone!"
                        : "Look at the iPad screen. Game will start soon..."}
                </p>
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
