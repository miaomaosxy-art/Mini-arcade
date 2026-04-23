import { useState, useEffect } from 'react';
import { ArrowLeft, RefreshCw, Flag, Pickaxe, Bomb } from 'lucide-react';
import { motion } from 'motion/react';

type Difficulty = 'easy' | 'normal' | 'hard';

interface Cell {
  r: number; c: number;
  isMine: boolean; isRevealed: boolean; isFlagged: boolean; count: number;
}

export default function Minesweeper({ onBack }: { onBack: () => void }) {
  const [difficulty, setDifficulty] = useState<Difficulty>('normal');
  const [board, setBoard] = useState<Cell[][]>([]);
  const [status, setStatus] = useState<'playing' | 'won' | 'lost'>('playing');
  const [mode, setMode] = useState<'dig' | 'flag'>('dig');
  const [minesLeft, setMinesLeft] = useState(0);

  const configs = {
    easy: { rows: 8, cols: 8, mines: 10 },
    normal: { rows: 10, cols: 10, mines: 15 },
    hard: { rows: 12, cols: 12, mines: 25 },
  };

  const getNeighbors = (r: number, c: number, rows: number, cols: number) => {
    const neighbors = [];
    for (let dr = -1; dr <= 1; dr++) {
      for (let dc = -1; dc <= 1; dc++) {
        if (dr === 0 && dc === 0) continue;
        const nr = r + dr, nc = c + dc;
        if (nr >= 0 && nr < rows && nc >= 0 && nc < cols) neighbors.push({ r: nr, c: nc });
      }
    }
    return neighbors;
  };

  const initGame = (diff: Difficulty) => {
    const { rows, cols, mines } = configs[diff];
    const newBoard = Array.from({ length: rows }, (_, r) => 
      Array.from({ length: cols }, (_, c) => ({ r, c, isMine: false, isRevealed: false, isFlagged: false, count: 0 }))
    );
    setBoard(newBoard);
    setStatus('playing');
    setMinesLeft(mines);
    setMode('dig');
  };

  useEffect(() => { initGame(difficulty); }, [difficulty]);

  const placeMines = (firstClickR: number, firstClickC: number) => {
    const { rows, cols, mines } = configs[difficulty];
    let newBoard = [...board].map(row => row.map(cell => ({...cell})));
    let placed = 0;
    while (placed < mines) {
      let r = Math.floor(Math.random() * rows);
      let c = Math.floor(Math.random() * cols);
      // Safe first click (3x3 area) -> No Guessing Start
      if (!newBoard[r][c].isMine && Math.max(Math.abs(r - firstClickR), Math.abs(c - firstClickC)) > 1) {
        newBoard[r][c].isMine = true;
        placed++;
      }
    }
    
    // Calculate counts
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (!newBoard[r][c].isMine) {
          let count = 0;
          getNeighbors(r, c, rows, cols).forEach(n => {
            if (newBoard[n.r][n.c].isMine) count++;
          });
          newBoard[r][c].count = count;
        }
      }
    }
    return newBoard;
  };

  const revealCell = (r: number, c: number, currentBoard: Cell[][]) => {
    const { rows, cols } = configs[difficulty];
    let newBoard = currentBoard.map(row => row.map(cell => ({...cell})));
    
    // First click?
    let isFirstClick = newBoard.every(row => row.every(cell => !cell.isRevealed));
    if (isFirstClick) {
      newBoard = placeMines(r, c);
    }

    if (newBoard[r][c].isRevealed || newBoard[r][c].isFlagged || status !== 'playing') return;

    if (newBoard[r][c].isMine) {
      newBoard[r][c].isRevealed = true;
      setStatus('lost');
      setBoard(newBoard);
      return;
    }

    const queue = [{ r, c }];
    while (queue.length > 0) {
      const current = queue.shift()!;
      if (newBoard[current.r][current.c].isRevealed) continue;
      newBoard[current.r][current.c].isRevealed = true;
      
      if (newBoard[current.r][current.c].count === 0) {
        getNeighbors(current.r, current.c, rows, cols).forEach(n => {
          if (!newBoard[n.r][n.c].isRevealed && !newBoard[n.r][n.c].isFlagged) {
            queue.push({ r: n.r, c: n.c });
          }
        });
      }
    }

    setBoard(newBoard);
    checkWin(newBoard);
  };

  const toggleFlag = (r: number, c: number) => {
    if (status !== 'playing' || board[r][c].isRevealed) return;
    setBoard(prev => {
      let b = prev.map(row => row.map(cell => ({...cell})));
      b[r][c].isFlagged = !b[r][c].isFlagged;
      setMinesLeft(m => b[r][c].isFlagged ? m - 1 : m + 1);
      return b;
    });
  };

  const handleClick = (r: number, c: number) => {
    if (mode === 'flag') toggleFlag(r, c);
    else revealCell(r, c, board);
  };

  const checkWin = (b: Cell[][]) => {
    const { rows, cols, mines } = configs[difficulty];
    let revealed = 0;
    b.forEach(row => row.forEach(cell => { if (cell.isRevealed) revealed++; }));
    if (revealed === (rows * cols) - mines) setStatus('won');
  };

  const countColors = ['text-transparent', 'text-blue-500', 'text-green-500', 'text-red-500', 'text-purple-500', 'text-orange-500', 'text-teal-500', 'text-black', 'text-gray-500'];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
      className="flex flex-col items-center justify-start w-full h-full max-w-md mx-auto p-8 space-y-4 bg-orange-400 absolute inset-0 overflow-y-auto"
    >
      <div className="w-full flex items-center justify-between">
        <button onClick={onBack} className="p-3 bg-white hover:bg-slate-100 rounded-full border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all cursor-pointer text-black active:translate-y-1 active:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
          <ArrowLeft size={24} />
        </button>
        <h2 className="text-3xl font-black text-white uppercase tracking-tight drop-shadow-md">无猜扫雷</h2>
        <div className="w-[52px]"></div>
      </div>

      <div className="flex bg-white rounded-full border-4 border-black p-1 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] w-full mb-2">
        {(['easy', 'normal', 'hard'] as Difficulty[]).map(d => (
          <button key={d} onClick={() => setDifficulty(d)} className={`flex-1 font-black py-2 rounded-full uppercase transition-colors ${difficulty === d ? 'bg-black text-white' : 'text-black hover:bg-slate-200'}`}>{d}</button>
        ))}
      </div>

      <div className="flex gap-4 w-full">
        <div className="flex-1 bg-white border-4 border-black rounded-2xl p-2 flex items-center justify-between px-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <Flag size={20} className="text-red-500" />
          <span className="text-2xl font-black">{minesLeft}</span>
        </div>
        <div className="flex-1 flex bg-white border-4 border-black rounded-2xl p-1 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <button onClick={() => setMode('dig')} className={`flex-1 flex justify-center items-center rounded-xl transition-colors ${mode === 'dig' ? 'bg-black text-white' : 'text-black'}`}><Pickaxe size={20} /></button>
          <button onClick={() => setMode('flag')} className={`flex-1 flex justify-center items-center rounded-xl transition-colors ${mode === 'flag' ? 'bg-black text-white' : 'text-black'}`}><Flag size={20} /></button>
        </div>
      </div>

      <div className="bg-yellow-400 p-3 rounded-[32px] border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] inline-block max-w-full">
        <div 
          className="grid gap-1 max-w-full overflow-hidden" 
          style={{ gridTemplateColumns: `repeat(${configs[difficulty].cols}, minmax(0, 1fr))` }}
        >
          {board.flat().map((cell, i) => {
            const isGameOver = status !== 'playing';
            const showMine = isGameOver && cell.isMine;
            return (
              <button
                key={i}
                onClick={() => handleClick(cell.r, cell.c)}
                onContextMenu={(e) => { e.preventDefault(); toggleFlag(cell.r, cell.c); }}
                className={`w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center font-black text-sm rounded transition-all border-2
                  ${cell.isRevealed 
                    ? (cell.isMine ? 'bg-red-500 border-red-700' : 'bg-white border-white shadow-inner') 
                    : 'bg-[#B0B0B0] border-[#E0E0E0] border-b-[#808080] border-r-[#808080] hover:bg-[#C0C0C0]'}
                  ${showMine && !cell.isRevealed && !cell.isFlagged ? 'bg-red-200' : ''}
                `}
              >
                {cell.isRevealed && cell.isMine && <Bomb size={16} className="text-black" />}
                {cell.isRevealed && !cell.isMine && cell.count > 0 && <span className={countColors[cell.count]}>{cell.count}</span>}
                {!cell.isRevealed && cell.isFlagged && <Flag size={14} className="text-red-500" fill="currentColor" />}
                {showMine && !cell.isFlagged && !cell.isRevealed && <Bomb size={16} className="text-black opacity-50" />}
              </button>
            )
          })}
        </div>
      </div>

      {status !== 'playing' && (
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="pt-2 flex flex-col items-center">
          <h3 className={`text-4xl font-black uppercase drop-shadow-md mb-4 ${status === 'won' ? 'text-green-300' : 'text-red-600'}`}>{status === 'won' ? 'YOU WIN!' : 'GAME OVER'}</h3>
          <button onClick={() => initGame(difficulty)} className="flex items-center gap-2 px-8 py-4 bg-white hover:bg-slate-100 text-black border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] rounded-2xl font-black text-xl transition-all cursor-pointer active:translate-y-1 active:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
            <RefreshCw size={24} className="font-black" />
            PLAY AGAIN
          </button>
        </motion.div>
      )}
    </motion.div>
  );
}
