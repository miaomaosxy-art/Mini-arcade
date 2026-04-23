import { useState } from 'react';
import { Gamepad2, Grid3X3, Brain, Scissors, LayoutGrid, Bomb, Bug } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import TicTacToe from './games/TicTacToe';
import MemoryMatch from './games/MemoryMatch';
import RockPaperScissors from './games/RockPaperScissors';
import Game2048 from './games/Game2048';
import Minesweeper from './games/Minesweeper';
import SnakeGame from './games/Snake';

type GameId = 'hub' | 'tictactoe' | 'memory' | 'rps' | '2048' | 'minesweeper' | 'snake';

export default function App() {
  const [currentGame, setCurrentGame] = useState<GameId>('hub');

  const games = [
    {
      id: '2048' as GameId,
      title: '2048',
      description: '合并相同数字，向 2048 冲刺',
      icon: <LayoutGrid className="w-8 h-8 text-black" />,
      color: 'bg-cyan-400',
    },
    {
      id: 'minesweeper' as GameId,
      title: '无猜扫雷',
      description: '经典扫雷！第一步必定安全',
      icon: <Bomb className="w-8 h-8 text-black" />,
      color: 'bg-orange-400',
    },
    {
      id: 'snake' as GameId,
      title: '贪吃蛇',
      description: '控制小蛇吃苹果，注意别撞墙',
      icon: <Bug className="w-8 h-8 text-black" />,
      color: 'bg-emerald-400',
    },
    {
      id: 'tictactoe' as GameId,
      title: '井字棋',
      description: '经典的两人对战游戏，连成一线即获胜',
      icon: <Grid3X3 className="w-8 h-8 text-black" />,
      color: 'bg-yellow-400',
    },
    {
      id: 'memory' as GameId,
      title: '记忆配对',
      description: '翻开卡牌找到相同图案，考验你的记忆力',
      icon: <Brain className="w-8 h-8 text-black" />,
      color: 'bg-pink-400',
    },
    {
      id: 'rps' as GameId,
      title: '猜拳',
      description: '石头、剪刀、布，与电脑一决高下',
      icon: <Scissors className="w-8 h-8 text-black" />,
      color: 'bg-green-400',
    }
  ];

  const goBack = () => setCurrentGame('hub');

  return (
    <div className="min-h-screen bg-[#6366F1] flex items-center justify-center p-4 font-sans text-black">
      <div className="w-full max-w-md bg-white rounded-[32px] border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] overflow-hidden relative min-h-[700px] flex flex-col justify-center">
        
        <AnimatePresence mode="wait">
          {currentGame === 'hub' && (
            <motion.div 
              key="hub"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="w-full p-8 flex flex-col absolute inset-0 bg-white overflow-y-auto"
            >
              <div className="flex items-center gap-4 mb-8 pt-4">
                <div className="p-3 bg-yellow-400 rounded-2xl border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                  <Gamepad2 size={32} className="text-black" />
                </div>
                <div>
                  <h1 className="text-3xl font-black uppercase tracking-tight text-black">JoyHub</h1>
                  <p className="text-sm font-bold text-black/70 uppercase tracking-widest mt-1">Select A Game</p>
                </div>
              </div>

              <div className="flex flex-col gap-5 flex-1 pb-10">
                {games.map((game) => (
                  <motion.button
                    key={game.id}
                    whileHover={{ y: -4, boxShadow: '8px 8px 0px 0px rgba(0,0,0,1)' }}
                    whileTap={{ y: 2, scale: 0.98, boxShadow: '2px 2px 0px 0px rgba(0,0,0,1)' }}
                    onClick={() => setCurrentGame(game.id)}
                    className={`flex flex-shrink-0 items-start text-left p-4 rounded-2xl border-4 border-black transition-all cursor-pointer shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] ${game.color}`}
                  >
                    <div className="bg-white p-3 rounded-xl border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] mr-4 flex-shrink-0">
                      {game.icon}
                    </div>
                    <div className="pt-1">
                      <h3 className="text-xl font-black text-black uppercase">{game.title}</h3>
                      <p className="text-sm font-medium text-black/80 mt-1 line-clamp-2 leading-relaxed">
                        {game.description}
                      </p>
                    </div>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}

          {currentGame === '2048' && <Game2048 key="2048" onBack={goBack} />}
          {currentGame === 'minesweeper' && <Minesweeper key="minesweeper" onBack={goBack} />}
          {currentGame === 'snake' && <SnakeGame key="snake" onBack={goBack} />}
          {currentGame === 'tictactoe' && <TicTacToe key="tictactoe" onBack={goBack} />}
          {currentGame === 'memory' && <MemoryMatch key="memory" onBack={goBack} />}
          {currentGame === 'rps' && <RockPaperScissors key="rps" onBack={goBack} />}
        </AnimatePresence>
        
      </div>
    </div>
  );
}
