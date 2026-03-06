import { useState, useEffect, useRef } from 'react';
import { useGameStore } from '../store/gameStore';
import { supabase } from '../lib/supabase';

export default function Host() {
    const [pin, setPin] = useState('');
    const [isVerified, setIsVerified] = useState(false);
    const {
        roomCode, setRoomCode, setRole, players, addPlayer,
        status, startGame, questions, currentQuestionIndex
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
            .subscribe();

        channelRef.current = channel;

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
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-[#fdfbf7]">
                <span className="bg-black/5 px-6 py-2 rounded-full text-sm font-bold uppercase tracking-widest mb-6 text-gray-500">
                    {currentQuiz.category}
                </span>
                <h1 className="text-[10rem] md:text-[14rem] mb-12 animate-bounce transition-all">
                    {currentQuiz.emojis}
                </h1>
                <p className="text-3xl text-gray-400 italic font-serif max-w-2xl text-center leading-relaxed">
                    "{currentQuiz.clue}"
                </p>
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
