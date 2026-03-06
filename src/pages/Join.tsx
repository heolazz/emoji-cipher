import { useState } from 'react';
import { useGameStore } from '../store/gameStore';

export default function Join() {
    const [code, setCode] = useState('');
    const [name, setName] = useState('');
    const { setRoomCode, setRole } = useGameStore();

    const handleJoin = () => {
        if (code.length === 4 && name.trim()) {
            setRoomCode(code.toUpperCase());
            setRole('PLAYER');
            // Logic sinkronisasi realtime akan ditambahkan di task selanjutnya
            alert(`Welcome, ${name}! Joining room ${code.toUpperCase()}`);
        } else {
            alert('Isi Nama dan Kode Room dengan benar!');
        }
    };

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
