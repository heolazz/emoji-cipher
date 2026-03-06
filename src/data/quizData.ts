export interface QuizItem {
    id: string;
    emojis: string;
    answer: string;
    clue: string;
    category: 'Movie' | 'Music' | 'Brand' | 'Proverb';
}

export const quizData: QuizItem[] = [
    { id: '1', emojis: '🧙‍♂️⚡👓', answer: 'HARRY POTTER', clue: 'The boy who lived', category: 'Movie' },
    { id: '2', emojis: '🦇🌑🏙️', answer: 'BATMAN', clue: 'The Dark Knight', category: 'Movie' },
    { id: '3', emojis: '🍔🍟🤡', answer: 'MCDONALDS', clue: 'I\'m Lovin\' It', category: 'Brand' },
    { id: '4', emojis: '🚢🧊💔', answer: 'TITANIC', clue: 'Unsinkable Ship?', category: 'Movie' },
    { id: '5', emojis: '🍎💻📱', answer: 'APPLE', clue: 'Think Different', category: 'Brand' },
    { id: '6', emojis: '🕷️🕸️🏙️', answer: 'SPIDERMAN', clue: 'Friendly neighborhood hero', category: 'Movie' },
    { id: '7', emojis: '🥤🔴❄️', answer: 'COCA COLA', clue: 'The pause that refreshes', category: 'Brand' },
    { id: '8', emojis: '⚔️🌌🚀', answer: 'STAR WARS', clue: 'In a galaxy far, far away', category: 'Movie' },
    { id: '9', emojis: '🦁👑🌅', answer: 'LION KING', clue: 'Circle of Life', category: 'Movie' },
    { id: '10', emojis: '👟✔️💨', answer: 'NIKE', clue: 'Just Do It', category: 'Brand' },
    { id: '11', emojis: '🦖🌴🦕', answer: 'JURASSIC PARK', clue: 'Life finds a way', category: 'Movie' },
    { id: '12', emojis: '🐚🌊🧜‍♀️', answer: 'LITTLE MERMAID', clue: 'Under the sea', category: 'Movie' },
    { id: '13', emojis: '🥊⚡🏆', answer: 'ROCKY', clue: 'The Italian Stallion', category: 'Movie' },
    { id: '14', emojis: '☕💚🏢', answer: 'STARBUCKS', clue: 'The green siren', category: 'Brand' },
];
