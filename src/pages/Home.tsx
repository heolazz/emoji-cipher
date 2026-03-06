import { useNavigate } from 'react-router-dom';

export default function Home() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4">
            <h1 className="text-5xl font-serif font-bold mb-2">Emoji Cipher</h1>
            <p className="text-gray-500 mb-12">Multiplayer Guessing Game</p>

            <div className="flex flex-col gap-4 w-full max-w-sm">
                <button
                    onClick={() => navigate('/host')}
                    className="bg-black text-white rounded-2xl py-4 text-xl font-semibold shadow-lg active:scale-95 transition-transform"
                >
                    Host a Game
                </button>
                <button
                    onClick={() => navigate('/join')}
                    className="bg-white text-black border-2 border-gray-200 rounded-2xl py-4 text-xl font-semibold shadow-sm active:scale-95 transition-transform"
                >
                    Join a Game
                </button>
            </div>
        </div>
    )
}
