import { useState, useEffect } from 'react';
import { ArrowLeft, RefreshCw } from 'lucide-react';
import { motion } from 'motion/react';

const EMOJIS = ['🍎', '🍌', '🍇', '🍉', '🍓', '🥑', '🥕', '🧀'];

type Card = {
  id: number;
  emoji: string;
  isFlipped: boolean;
  isMatched: boolean;
};

export default function MemoryMatch({ onBack }: { onBack: () => void }) {
  const [cards, setCards] = useState<Card[]>([]);
  const [flippedIndices, setFlippedIndices] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);

  useEffect(() => {
    initializeGame();
  }, []);

  const initializeGame = () => {
    const shuffledCards = [...EMOJIS, ...EMOJIS]
      .sort(() => Math.random() - 0.5)
      .map((emoji, index) => ({
        id: index,
        emoji,
        isFlipped: false,
        isMatched: false,
      }));
    setCards(shuffledCards);
    setFlippedIndices([]);
    setMoves(0);
    setIsLocked(false);
    setIsGameOver(false);
  };

  const handleCardClick = (index: number) => {
    if (isLocked || cards[index].isFlipped || cards[index].isMatched) return;

    const newCards = [...cards];
    newCards[index].isFlipped = true;
    setCards(newCards);

    const newFlippedIndices = [...flippedIndices, index];
    setFlippedIndices(newFlippedIndices);

    if (newFlippedIndices.length === 2) {
      setIsLocked(true);
      setMoves(m => m + 1);

      const [firstIndex, secondIndex] = newFlippedIndices;
      if (newCards[firstIndex].emoji === newCards[secondIndex].emoji) {
        // Match found
        newCards[firstIndex].isMatched = true;
        newCards[secondIndex].isMatched = true;
        setCards(newCards);
        setFlippedIndices([]);
        setIsLocked(false);

        if (newCards.every(card => card.isMatched)) {
          setIsGameOver(true);
        }
      } else {
        // No match
        setTimeout(() => {
          const resetCards = [...newCards];
          resetCards[firstIndex].isFlipped = false;
          resetCards[secondIndex].isFlipped = false;
          setCards(resetCards);
          setFlippedIndices([]);
          setIsLocked(false);
        }, 1000);
      }
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="flex flex-col items-center justify-start w-full h-full max-w-md mx-auto p-8 space-y-6 bg-pink-400 absolute inset-0 overflow-y-auto"
    >
      <div className="w-full flex items-center justify-between pointer-events-auto">
        <button 
          onClick={onBack}
          className="p-3 bg-white hover:bg-slate-100 rounded-full border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all cursor-pointer text-black active:translate-y-1 active:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
        >
          <ArrowLeft size={24} />
        </button>
        <h2 className="text-3xl font-black text-white uppercase tracking-tight drop-shadow-md">记忆配对</h2>
        <div className="w-[52px]"></div>
      </div>

      <div className="flex justify-between items-center w-full bg-white px-6 py-3 border-4 border-black rounded-full shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
        <span className="font-black text-black uppercase">MOVES: {moves}</span>
        {isGameOver && <span className="text-green-500 font-black uppercase">WIN! 🎉</span>}
      </div>

      <div className="grid grid-cols-4 gap-3 bg-indigo-400 p-4 rounded-[32px] border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] w-full">
        {cards.map((card, index) => (
          <motion.div
            key={card.id}
            whileHover={!card.isFlipped && !card.isMatched ? { scale: 1.05 } : {}}
            whileTap={!card.isFlipped && !card.isMatched ? { scale: 0.95 } : {}}
            onClick={() => handleCardClick(index)}
            className={`aspect-square flex items-center justify-center text-4xl rounded-2xl border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all duration-300 cursor-pointer 
              ${card.isFlipped || card.isMatched ? 'bg-white' : 'bg-yellow-400 hover:bg-yellow-300'}
            `}
          >
            <div className="w-full h-full flex items-center justify-center transition-all duration-300" style={{ transform: (card.isFlipped || card.isMatched) ? 'rotateY(180deg)' : 'rotateY(0deg)' }}>
              {card.isFlipped || card.isMatched ? card.emoji : <span className="text-black/20 font-black text-2xl">?</span>}
            </div>
          </motion.div>
        ))}
      </div>

      <div className="pt-2">
        <button 
          onClick={initializeGame}
          className="flex items-center gap-2 px-8 py-4 bg-orange-400 hover:bg-orange-300 text-black border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] rounded-2xl font-black text-xl transition-all cursor-pointer active:translate-y-1 active:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
        >
          <RefreshCw size={24} className="font-black" />
          RESTART
        </button>
      </div>
    </motion.div>
  );
}
