import { useState, useEffect, useCallback, useRef } from 'react';
import { ArrowLeft, RefreshCw, Trophy, ArrowUp, ArrowDown, ArrowLeft as ArrowLeftIcon, ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';

type Difficulty = 'easy' | 'normal' | 'hard';
type Point = { x: number, y: number };

const GRID_SIZE = 15;

export default function SnakeGame({ onBack }: { onBack: () => void }) {
  const [difficulty, setDifficulty] = useState<Difficulty>('normal');
  const [snake, setSnake] = useState<Point[]>([{ x: 7, y: 7 }]);
  const [food, setFood] = useState<Point>({ x: 10, y: 10 });
  const [direction, setDirection] = useState<Point>({ x: 0, y: -1 });
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [bestScore, setBestScore] = useState(0);

  const directionRef = useRef(direction);
  directionRef.current = direction;

  const getSpeed = () => {
    switch (difficulty) {
      case 'easy': return 200;
      case 'hard': return 70;
      default: return 120;
    }
  };

  const generateFood = useCallback((currentSnake: Point[]) => {
    let newFood: Point;
    while (true) {
      newFood = { x: Math.floor(Math.random() * GRID_SIZE), y: Math.floor(Math.random() * GRID_SIZE) };
      const isOnSnake = currentSnake.some(segment => segment.x === newFood.x && segment.y === newFood.y);
      if (!isOnSnake) break;
    }
    setFood(newFood);
  }, []);

  const initGame = useCallback(() => {
    setSnake([{ x: 7, y: 7 }]);
    setDirection({ x: 0, y: -1 });
    directionRef.current = { x: 0, y: -1 };
    setScore(0);
    setGameOver(false);
    generateFood([{ x: 7, y: 7 }]);
  }, [generateFood]);

  useEffect(() => { initGame(); }, [difficulty, initGame]);

  useEffect(() => {
    if (gameOver) return;

    const moveSnake = () => {
      setSnake(prev => {
        const head = prev[0];
        const newHead = { 
          x: head.x + directionRef.current.x, 
          y: head.y + directionRef.current.y 
        };

        // Wall collision
        if (newHead.x < 0 || newHead.x >= GRID_SIZE || newHead.y < 0 || newHead.y >= GRID_SIZE) {
          setGameOver(true);
          return prev;
        }

        // Self collision
        if (prev.some(segment => segment.x === newHead.x && segment.y === newHead.y)) {
          setGameOver(true);
          return prev;
        }

        const newSnake = [newHead, ...prev];
        if (newHead.x === food.x && newHead.y === food.y) {
          setScore(s => {
            const newScore = s + 10;
            if (newScore > bestScore) setBestScore(newScore);
            return newScore;
          });
          generateFood(newSnake);
        } else {
          newSnake.pop();
        }
        return newSnake;
      });
    };

    const interval = setInterval(moveSnake, getSpeed());
    return () => clearInterval(interval);
  }, [gameOver, food, difficulty, bestScore, generateFood]);

  const changeDirection = (newDir: Point) => {
    if (gameOver) return;
    const current = directionRef.current;
    // Prevent 180 turn
    if (current.x === -newDir.x && current.y === -newDir.y) return;
    // Prevent rapidly making reverse moves in same tick
    setDirection(newDir);
    directionRef.current = newDir;
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowUp': e.preventDefault(); changeDirection({ x: 0, y: -1 }); break;
        case 'ArrowDown': e.preventDefault(); changeDirection({ x: 0, y: 1 }); break;
        case 'ArrowLeft': e.preventDefault(); changeDirection({ x: -1, y: 0 }); break;
        case 'ArrowRight': e.preventDefault(); changeDirection({ x: 1, y: 0 }); break;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameOver]);

  // Handle swipes for mobile
  const [touchStart, setTouchStart] = useState<Point | null>(null);
  const handleTouchStart = (e: React.TouchEvent) => setTouchStart({ x: e.touches[0].clientX, y: e.touches[0].clientY });
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStart) return;
    const dx = e.changedTouches[0].clientX - touchStart.x;
    const dy = e.changedTouches[0].clientY - touchStart.y;
    if (Math.abs(dx) > Math.abs(dy)) {
      if (Math.abs(dx) > 30) changeDirection(dx > 0 ? { x: 1, y: 0 } : { x: -1, y: 0 });
    } else {
      if (Math.abs(dy) > 30) changeDirection(dy > 0 ? { x: 0, y: 1 } : { x: 0, y: -1 });
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
      className="flex flex-col items-center justify-start w-full h-full max-w-md mx-auto p-8 space-y-4 bg-emerald-400 absolute inset-0 overflow-y-auto"
      onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}
    >
      <div className="w-full flex items-center justify-between">
        <button onClick={onBack} className="p-3 bg-white hover:bg-slate-100 rounded-full border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all cursor-pointer text-black active:translate-y-1 active:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
          <ArrowLeft size={24} />
        </button>
        <h2 className="text-4xl font-black text-white uppercase tracking-tighter drop-shadow-md">贪吃蛇</h2>
        <div className="w-[52px]"></div>
      </div>

      <div className="flex bg-white rounded-full border-4 border-black p-1 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] w-full mb-2">
        {(['easy', 'normal', 'hard'] as Difficulty[]).map(d => (
          <button key={d} onClick={() => setDifficulty(d)} className={`flex-1 font-black py-2 rounded-full uppercase transition-colors ${difficulty === d ? 'bg-black text-white' : 'text-black hover:bg-slate-200'}`}>{d}</button>
        ))}
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

      <div className="relative w-full aspect-square bg-[#A3D95D] rounded-[32px] border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] overflow-hidden p-2">
        {gameOver && (
          <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center z-10 rounded-[28px]">
            <h3 className="text-4xl font-black text-white mb-4 uppercase drop-shadow-md">Game Over!</h3>
            <button onClick={initGame} className="px-6 py-3 bg-pink-400 border-4 border-black font-black text-xl rounded-2xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:bg-pink-300 active:translate-y-1 active:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
              TRY AGAIN
            </button>
          </div>
        )}
        <div className="relative w-full h-full border-2 border-black/20 rounded-2xl overflow-hidden bg-[#8cb949]">
          {/* Apply grid pattern */}
          <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: 'linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)', backgroundSize: `${100/GRID_SIZE}% ${100/GRID_SIZE}%` }}></div>
          
          <div className="absolute w-full h-full">
            {/* Draw Food */}
            <div 
              className="absolute bg-red-500 rounded-full border-2 border-white shadow-sm flex items-center justify-center"
              style={{
                width: `${100/GRID_SIZE}%`, height: `${100/GRID_SIZE}%`,
                left: `${(food.x * 100) / GRID_SIZE}%`, top: `${(food.y * 100) / GRID_SIZE}%`
              }}
            >
              <div className="w-1.5 h-1.5 bg-white rounded-full absolute top-1 right-1 opacity-50"></div>
            </div>

            {/* Draw Snake */}
            {snake.map((segment, i) => (
              <div 
                key={i} 
                className={`absolute ${i === 0 ? 'bg-indigo-600 z-10 rounded-lg' : 'bg-indigo-400 rounded-md'} border-2 border-black transition-all duration-75`}
                style={{
                  width: `${100/GRID_SIZE}%`, height: `${100/GRID_SIZE}%`,
                  left: `${(segment.x * 100) / GRID_SIZE}%`, top: `${(segment.y * 100) / GRID_SIZE}%`
                }}
              >
                {i === 0 && ( /* Eyes for the head */
                  <div className="relative w-full h-full flex items-center justify-center gap-1">
                    <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                    <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* D-Pad Controls for Mobile */}
      <div className="grid grid-cols-3 gap-2 w-48 mt-4">
        <div></div>
        <button onClick={() => changeDirection({x: 0, y: -1})} className="p-3 bg-white border-4 border-black rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-y-1 active:shadow-none flex items-center justify-center"><ArrowUp size={24} className="font-black"/></button>
        <div></div>
        <button onClick={() => changeDirection({x: -1, y: 0})} className="p-3 bg-white border-4 border-black rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-y-1 active:shadow-none flex items-center justify-center"><ArrowLeftIcon size={24} className="font-black"/></button>
        <button onClick={() => changeDirection({x: 0, y: 1})} className="p-3 bg-white border-4 border-black rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-y-1 active:shadow-none flex items-center justify-center"><ArrowDown size={24} className="font-black"/></button>
        <button onClick={() => changeDirection({x: 1, y: 0})} className="p-3 bg-white border-4 border-black rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-y-1 active:shadow-none flex items-center justify-center"><ArrowRight size={24} className="font-black"/></button>
      </div>

    </motion.div>
  );
}
