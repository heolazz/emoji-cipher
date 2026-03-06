import { useState, useEffect } from 'react';
import { useGameStore } from '../store/gameStore';
import { supabase } from '../lib/supabase';

export default function Host() {
    const [pin, setPin] = useState('');
    const [isVerified, setIsVerified] = useState(false);
    const { roomCode, setRoomCode, setRole, players, addPlayer } = useGameStore();

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
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [roomCode, isVerified, addPlayer]);

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

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-[#fdfbf7]">
            <p className="text-gray-500 mb-2 uppercase tracking-widest text-sm">Room Code</p>
            <h1 className="text-8xl font-serif font-bold mb-8">{roomCode}</h1>
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 max-w-md w-full text-center">
                <h3 className="text-xl font-semibold mb-4">Waiting for Players...</h3>
                <p className="text-gray-400">Scan QR or enter code at emojicipher.com</p>
            </div>

            <div className="mt-8 flex flex-wrap justify-center gap-3">
                {Object.values(players).map((p) => (
                    <div key={p.id} className="bg-white px-6 py-3 rounded-full shadow-sm border border-gray-100 font-medium animate-in fade-in zoom-in duration-300">
                        {p.name}
                    </div>
                ))}
            </div>
        </div>
    );
}
