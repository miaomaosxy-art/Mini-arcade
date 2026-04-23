import { useState } from 'react';
import { ArrowLeft, RefreshCw } from 'lucide-react';
import { motion } from 'motion/react';

type Player = 'X' | 'O' | null;

export default function TicTacToe({ onBack }: { onBack: () => void }) {
  const [board, setBoard] = useState<Player[]>(Array(9).fill(null));
  const [isXNext, setIsXNext] = useState<boolean>(true);

  const checkWinner = (squares: Player[]) => {
    const lines = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
      [0, 3, 6], [1, 4, 7], [2, 5, 8], // cols
      [0, 4, 8], [2, 4, 6]             // diagonals
    ];
    for (let i = 0; i < lines.length; i++) {
      const [a, b, c] = lines[i];
      if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
        return squares[a];
      }
    }
    return null;
  };

  const winner = checkWinner(board);
  const isDraw = !winner && board.every((square) => square !== null);

  const handleClick = (index: number) => {
    if (board[index] || winner) return;
    const newBoard = [...board];
    newBoard[index] = isXNext ? 'X' : 'O';
    setBoard(newBoard);
    setIsXNext(!isXNext);
  };

  const resetGame = () => {
    setBoard(Array(9).fill(null));
    setIsXNext(true);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="flex flex-col items-center justify-start w-full h-full max-w-md mx-auto p-8 space-y-8 bg-blue-400 absolute inset-0 overflow-y-auto"
    >
      <div className="w-full flex items-center justify-between">
        <button 
          onClick={onBack}
          className="p-3 bg-white hover:bg-slate-100 rounded-full border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all cursor-pointer font-black text-black active:translate-y-1 active:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
        >
          <ArrowLeft size={24} />
        </button>
        <h2 className="text-3xl font-black text-white uppercase tracking-tight shadow-black drop-shadow-md">井字棋</h2>
        <div className="w-[52px]"></div> {/* Spacer for center alignment */}
      </div>

      <div className="text-xl font-black bg-white px-6 py-3 border-4 border-black rounded-full shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] mb-4">
        {winner ? (
          <span className="text-green-500 uppercase">WINNER: {winner}</span>
        ) : isDraw ? (
          <span className="text-orange-500 uppercase">DRAW!</span>
        ) : (
          <span className="uppercase text-black">Turn: <span className={isXNext ? 'text-indigo-500' : 'text-pink-500'}>{isXNext ? 'X' : 'O'}</span></span>
        )}
      </div>

      <div className="grid grid-cols-3 gap-3 bg-yellow-400 p-4 border-4 border-black rounded-[32px] shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
        {board.map((square, index) => (
          <motion.button
            key={index}
            whileHover={{ scale: 0.95 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => handleClick(index)}
            className={`w-20 h-20 sm:w-24 sm:h-24 flex items-center justify-center text-5xl font-black rounded-2xl border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-colors cursor-pointer bg-white
              ${square === 'X' ? 'text-indigo-500' : 'text-pink-500'}
            `}
          >
            {square}
          </motion.button>
        ))}
      </div>

      <div className="pt-4">
        <button 
          onClick={resetGame}
          className="flex items-center gap-2 px-8 py-4 bg-green-400 hover:bg-green-300 text-black border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] rounded-2xl font-black text-xl transition-all cursor-pointer active:translate-y-1 active:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
        >
          <RefreshCw size={24} className="font-black" />
          RESTART
        </button>
      </div>
    </motion.div>
  );
}
