import { useState } from 'react';
import { ArrowLeft, RefreshCw, Hand, Handicap, Grab } from 'lucide-react';
import { motion } from 'motion/react';

type Choice = 'rock' | 'paper' | 'scissors';

const choices: { id: Choice; emoji: string; label: string }[] = [
  { id: 'rock', emoji: '✊', label: '石头' },
  { id: 'paper', emoji: '✋', label: '布' },
  { id: 'scissors', emoji: '✌️', label: '剪刀' },
];

export default function RockPaperScissors({ onBack }: { onBack: () => void }) {
  const [playerChoice, setPlayerChoice] = useState<Choice | null>(null);
  const [computerChoice, setComputerChoice] = useState<Choice | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [scores, setScores] = useState({ player: 0, computer: 0 });

  const getComputerChoice = (): Choice => {
    const randomIndex = Math.floor(Math.random() * 3);
    return choices[randomIndex].id;
  };

  const determineWinner = (player: Choice, computer: Choice) => {
    if (player === computer) return '平局!';
    if (
      (player === 'rock' && computer === 'scissors') ||
      (player === 'paper' && computer === 'rock') ||
      (player === 'scissors' && computer === 'paper')
    ) {
      setScores(s => ({ ...s, player: s.player + 1 }));
      return '你赢了! 🎉';
    } else {
      setScores(s => ({ ...s, computer: s.computer + 1 }));
      return '电脑赢了! 😢';
    }
  };

  const play = (choice: Choice) => {
    const compChoice = getComputerChoice();
    setPlayerChoice(choice);
    setComputerChoice(compChoice);
    setResult(determineWinner(choice, compChoice));
  };

  const resetGame = () => {
    setPlayerChoice(null);
    setComputerChoice(null);
    setResult(null);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="flex flex-col items-center justify-start w-full h-full max-w-md mx-auto p-8 space-y-6 bg-green-400 absolute inset-0 overflow-y-auto"
    >
      <div className="w-full flex items-center justify-between">
        <button 
          onClick={onBack}
          className="p-3 bg-white hover:bg-slate-100 rounded-full border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all cursor-pointer text-black active:translate-y-1 active:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
        >
          <ArrowLeft size={24} />
        </button>
        <h2 className="text-3xl font-black text-white uppercase tracking-tight drop-shadow-md">猜拳</h2>
        <div className="w-[52px]"></div>
      </div>

      <div className="flex gap-12 text-center w-full justify-center text-lg font-black bg-white px-6 py-4 border-4 border-black rounded-[24px] shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
        <div className="flex flex-col items-center">
          <span className="text-4xl text-indigo-500">{scores.player}</span>
          <span className="text-sm uppercase tracking-wider text-black mt-1">PLAYER</span>
        </div>
        <div className="flex flex-col items-center">
          <span className="text-4xl text-pink-500">{scores.computer}</span>
          <span className="text-sm uppercase tracking-wider text-black mt-1">CPU</span>
        </div>
      </div>

      <div className="flex w-full justify-between items-center py-6 px-4">
        <div className="flex flex-col items-center justify-center w-28 h-28 bg-white rounded-3xl border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
          {playerChoice ? (
            <motion.span 
              initial={{ scale: 0, rotate: -45 }} 
              animate={{ scale: 1, rotate: 0 }} 
              className="text-6xl"
            >
              {choices.find(c => c.id === playerChoice)?.emoji}
            </motion.span>
          ) : (
            <span className="text-black/30 font-black uppercase text-sm">YOU</span>
          )}
        </div>
        
        <div className="text-4xl font-black text-white drop-shadow-md italic">VS</div>

        <div className="flex flex-col items-center justify-center w-28 h-28 bg-white rounded-3xl border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
          {computerChoice ? (
            <motion.span 
              initial={{ scale: 0, rotate: 45 }} 
              animate={{ scale: 1, rotate: 0 }} 
              className="text-6xl"
            >
              {choices.find(c => c.id === computerChoice)?.emoji}
            </motion.span>
          ) : (
            <span className="text-black/30 font-black uppercase text-sm">CPU</span>
          )}
        </div>
      </div>

      <div className="h-[76px] flex items-center justify-center bg-white px-6 py-5 rounded-full border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex-shrink-0 w-full text-center">
        {result ? (
          <motion.div 
            initial={{ opacity: 0, y: -10 }} 
            animate={{ opacity: 1, y: 0 }}
            className={`text-xl font-black uppercase ${result.includes('你赢了') ? 'text-green-500' : result.includes('电脑') ? 'text-pink-500' : 'text-indigo-500'}`}
          >
            {result}
          </motion.div>
        ) : (
          <span className="text-black/50 font-black uppercase text-sm">CHOOSE YOUR WEAPON</span>
        )}
      </div>

      <div className="grid grid-cols-3 gap-4 w-full">
        {choices.map((c) => (
          <motion.button
            key={c.id}
            whileHover={{ y: -4, boxShadow: '6px 6px 0px 0px rgba(0,0,0,1)' }}
            whileTap={{ y: 2, scale: 0.95, boxShadow: '2px 2px 0px 0px rgba(0,0,0,1)' }}
            onClick={() => play(c.id)}
            className="flex flex-col items-center justify-center py-4 bg-yellow-400 border-4 border-black rounded-2xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:bg-yellow-300 transition-all cursor-pointer"
          >
            <span className="text-4xl mb-2">{c.emoji}</span>
            <span className="text-sm font-black text-black uppercase">{c.label}</span>
          </motion.button>
        ))}
      </div>

      <div className="h-[72px] flex flex-col justify-end w-full">
        {playerChoice && (
          <button 
            onClick={resetGame}
            className="flex w-fit mx-auto items-center gap-2 px-8 py-4 bg-pink-400 hover:bg-pink-300 text-black border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] rounded-2xl font-black text-xl transition-all cursor-pointer active:translate-y-1 active:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
          >
            <RefreshCw size={24} className="font-black" />
            NEXT ROUND
          </button>
        )}
      </div>
    </motion.div>
  );
}
