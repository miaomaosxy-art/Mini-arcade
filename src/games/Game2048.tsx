import { useState, useEffect, useCallback } from 'react';
import { ArrowLeft, RefreshCw, Trophy } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

type Difficulty = 3 | 4 | 5;

export default function Game2048({ onBack }: { onBack: () => void }) {
  const [size, setSize] = useState<Difficulty>(4);
  const [board, setBoard] = useState<number[][]>([]);
  const [score, setScore] = useState(0);
  const [bestScore, setBestScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [touchStart, setTouchStart] = useState<{x: number, y: number} | null>(null);

  const initBoard = useCallback((gridSize: number) => {
    let newBoard = Array(gridSize).fill(0).map(() => Array(gridSize).fill(0));
    newBoard = addRandomTile(newBoard);
    newBoard = addRandomTile(newBoard);
    setBoard(newBoard);
    setScore(0);
    setGameOver(false);
  }, []);

  useEffect(() => {
    initBoard(size);
  }, [size, initBoard]);

  const addRandomTile = (currentBoard: number[][]) => {
    const emptyCells: {r: number, c: number}[] = [];
    for (let r = 0; r < currentBoard.length; r++) {
      for (let c = 0; c < currentBoard[r].length; c++) {
        if (currentBoard[r][c] === 0) emptyCells.push({r, c});
      }
    }
    if (emptyCells.length === 0) return currentBoard;
    
    const { r, c } = emptyCells[Math.floor(Math.random() * emptyCells.length)];
    const newBoard = currentBoard.map(row => [...row]);
    newBoard[r][c] = Math.random() < 0.9 ? 2 : 4;
    return newBoard;
  };

  const slideAndMergeRow = (row: number[]): { newRow: number[], gainedScore: number } => {
    let arr = row.filter(val => val !== 0);
    let gainedScore = 0;
    for (let i = 0; i < arr.length - 1; i++) {
      if (arr[i] !== 0 && arr[i] === arr[i + 1]) {
        arr[i] *= 2;
        gainedScore += arr[i];
        arr[i + 1] = 0;
      }
    }
    arr = arr.filter(val => val !== 0);
    while (arr.length < row.length) arr.push(0);
    return { newRow: arr, gainedScore };
  };

  const move = useCallback((direction: 'up' | 'down' | 'left' | 'right') => {
    if (gameOver) return;

    setBoard(prevBoard => {
      let newBoard = prevBoard.map(row => [...row]);
      let gainedScore = 0;
      let moved = false;

      if (direction === 'left' || direction === 'right') {
        for (let r = 0; r < size; r++) {
          let row = newBoard[r];
          if (direction === 'right') row.reverse();
          const { newRow, gainedScore: s } = slideAndMergeRow(row);
          if (direction === 'right') newRow.reverse();
          if (newBoard[r].join(',') !== newRow.join(',')) moved = true;
          newBoard[r] = newRow;
          gainedScore += s;
        }
      } else {
        for (let c = 0; c < size; c++) {
          let col = [];
          for (let r = 0; r < size; r++) col.push(newBoard[r][c]);
          if (direction === 'down') col.reverse();
          const { newRow, gainedScore: s } = slideAndMergeRow(col);
          if (direction === 'down') newRow.reverse();
          for (let r = 0; r < size; r++) {
            if (newBoard[r][c] !== newRow[r]) moved = true;
            newBoard[r][c] = newRow[r];
          }
          gainedScore += s;
        }
      }

      if (moved) {
        newBoard = addRandomTile(newBoard);
        setScore(s => {
          const newScore = s + gainedScore;
          if (newScore > bestScore) setBestScore(newScore);
          return newScore;
        });
        
        // Check game over
        let isOver = true;
        for (let r = 0; r < size; r++) {
          for (let c = 0; c < size; c++) {
            if (newBoard[r][c] === 0) isOver = false;
            if (r < size - 1 && newBoard[r][c] === newBoard[r + 1][c]) isOver = false;
            if (c < size - 1 && newBoard[r][c] === newBoard[r][c + 1]) isOver = false;
          }
        }
        if (isOver) setGameOver(true);
      }
      return newBoard;
    });
  }, [size, gameOver, bestScore]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowUp') move('up');
      if (e.key === 'ArrowDown') move('down');
      if (e.key === 'ArrowLeft') move('left');
      if (e.key === 'ArrowRight') move('right');
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [move]);

  const handleTouchStart = (e: React.TouchEvent) => setTouchStart({ x: e.touches[0].clientX, y: e.touches[0].clientY });
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStart) return;
    const dx = e.changedTouches[0].clientX - touchStart.x;
    const dy = e.changedTouches[0].clientY - touchStart.y;
    if (Math.abs(dx) > Math.abs(dy)) {
      if (Math.abs(dx) > 30) move(dx > 0 ? 'right' : 'left');
    } else {
      if (Math.abs(dy) > 30) move(dy > 0 ? 'down' : 'up');
    }
  };

  const getTileColor = (val: number) => {
    if (val === 0) return 'bg-white/40 border-black/20 text-transparent shadow-none';
    const colors: Record<number, string> = {
      2: 'bg-[#faf8ef] text-black',
      4: 'bg-[#eee4da] text-black',
      8: 'bg-[#f2b179] text-white',
      16: 'bg-[#f59563] text-white',
      32: 'bg-[#f67c5f] text-white',
      64: 'bg-[#f65e3b] text-white',
      128: 'bg-[#edcf72] text-white',
      256: 'bg-[#edcc61] text-white',
      512: 'bg-[#edc850] text-white',
      1024: 'bg-[#edc53f] text-white',
      2048: 'bg-[#edc22e] text-white',
    };
    return (colors[val] || 'bg-[#3c3a32] text-white') + ' border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]';
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
      className="flex flex-col items-center justify-start w-full h-full max-w-md mx-auto p-8 space-y-4 bg-cyan-400 absolute inset-0 overflow-y-auto"
      onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}
    >
      <div className="w-full flex items-center justify-between">
        <button onClick={onBack} className="p-3 bg-white hover:bg-slate-100 rounded-full border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all cursor-pointer text-black active:translate-y-1 active:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
          <ArrowLeft size={24} />
        </button>
        <h2 className="text-4xl font-black text-white uppercase tracking-tighter drop-shadow-md">2048</h2>
        <div className="w-[52px]"></div>
      </div>

      <div className="flex bg-white rounded-full border-4 border-black p-1 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] w-full mb-2">
        <button onClick={() => setSize(5)} className={`flex-1 font-black py-2 rounded-full uppercase transition-colors ${size === 5 ? 'bg-black text-white' : 'text-black hover:bg-slate-200'}`}>Easy</button>
        <button onClick={() => setSize(4)} className={`flex-1 font-black py-2 rounded-full uppercase transition-colors ${size === 4 ? 'bg-black text-white' : 'text-black hover:bg-slate-200'}`}>Normal</button>
        <button onClick={() => setSize(3)} className={`flex-1 font-black py-2 rounded-full uppercase transition-colors ${size === 3 ? 'bg-black text-white' : 'text-black hover:bg-slate-200'}`}>Hard</button>
      </div>

      <div className="flex gap-4 w-full">
        <div className="flex-1 bg-white border-4 border-black rounded-2xl p-2 text-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <div className="text-xs font-black uppercase text-slate-500">SCORE</div>
          <div className="text-2xl font-black">{score}</div>
        </div>
        <div className="flex-1 bg-yellow-400 border-4 border-black rounded-2xl p-2 text-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex flex-col items-center">
          <div className="text-xs font-black uppercase text-black flex items-center gap-1"><Trophy size={12}/> BEST</div>
          <div className="text-2xl font-black">{bestScore}</div>
        </div>
      </div>

      <div className="relative w-full aspect-square bg-[#bbada0] p-3 rounded-[32px] border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
        {gameOver && (
          <div className="absolute inset-0 bg-black/70 rounded-[28px] flex flex-col items-center justify-center z-10">
            <h3 className="text-4xl font-black text-white mb-4 uppercase drop-shadow-md">Game Over!</h3>
            <button onClick={() => initBoard(size)} className="px-6 py-3 bg-green-400 border-4 border-black font-black text-xl rounded-2xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:bg-green-300 active:translate-y-1 active:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
              TRY AGAIN
            </button>
          </div>
        )}
        <div className={`grid gap-2 w-full h-full`} style={{ gridTemplateColumns: `repeat(${size}, minmax(0, 1fr))` }}>
          {board.flat().map((val, i) => (
            <motion.div
              initial={val ? { scale: 0.5 } : false}
              animate={{ scale: 1 }}
              key={`${i}-${val}`}
              className={`flex items-center justify-center rounded-xl font-black text-2xl sm:text-3xl border-4 ${getTileColor(val)}`}
            >
              {val > 0 ? val : ''}
            </motion.div>
          ))}
        </div>
      </div>

      <p className="font-black text-black/60 text-sm uppercase text-center w-full">Swipe or use Arrow Keys to move tiles.</p>
    </motion.div>
  );
}
