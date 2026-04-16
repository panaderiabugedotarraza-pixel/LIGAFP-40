import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useLeague } from '../context/LeagueContext';
import { User, Trophy, Star, Shield, Users, Crown, X, Zap, Target, Share2, ShieldAlert, Dumbbell, Move } from 'lucide-react';

export default function Teams() {
  const { teams, schedule } = useLeague();
  const [selectedPlayer, setSelectedPlayer] = React.useState<{player: any, team: any} | null>(null);

  const sortedTeams = [...teams].sort((a, b) => {
    if (b.stats.pts !== a.stats.pts) return b.stats.pts - a.stats.pts;
    const diffA = a.stats.sw - a.stats.sl;
    const diffB = b.stats.sw - b.stats.sl;
    return diffB - diffA;
  });

  const isLeagueFinished = schedule.length > 0 && schedule.every(m => m.status === 'finished');

  return (
    <div className="space-y-12 py-8">
      <AnimatePresence>
        {selectedPlayer && (
          <FifaCardModal 
            data={selectedPlayer} 
            onClose={() => setSelectedPlayer(null)}
            isChampion={isLeagueFinished && (sortedTeams.findIndex(t => t.id === selectedPlayer.team.id) + 1) === 1}
          />
        )}
      </AnimatePresence>

      <header className="text-center space-y-4 px-4">
        <motion.h1 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl sm:text-5xl md:text-7xl font-headline font-extrabold tracking-tighter"
        >
          EQUIPOS <span className="text-primary neon-glow-primary">OFICIALES</span>
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-on-surface-variant text-base md:text-lg max-w-2xl mx-auto"
        >
          Conoce a las parejas que competirán en la edición 2026 de la Liga FP+40.
        </motion.p>
      </header>

      {teams.length === 0 ? (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-surface p-12 rounded-2xl border-2 border-dashed border-outline-variant/20 text-center max-w-2xl mx-auto"
        >
          <Users size={64} className="text-on-surface-variant/30 mx-auto mb-6" />
          <h2 className="text-2xl font-headline font-bold mb-2">Aún no hay equipos formados</h2>
          <p className="text-on-surface-variant">
            Regístrate con tu compañero para aparecer en la lista oficial de la liga.
          </p>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {teams.map((team, idx) => {
            const rank = sortedTeams.findIndex(t => t.id === team.id) + 1;
            const isChampion = isLeagueFinished && rank === 1;

            return (
              <motion.div
                key={team.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.1 }}
                whileHover={{ y: -10 }}
                className={`bg-surface rounded-2xl overflow-hidden border shadow-2xl group transition-all duration-500 ${
                  isChampion 
                    ? 'border-secondary border-4 ring-4 ring-secondary/20 scale-105' 
                    : 'border-outline-variant/10'
                }`}
              >
                {/* Card Header */}
                <div className={`h-32 relative flex items-center justify-center ${
                  isChampion 
                    ? 'bg-gradient-to-br from-secondary/40 via-secondary/20 to-secondary/40' 
                    : 'bg-gradient-to-br from-primary/20 to-secondary/20'
                }`}>
                  <div className="absolute top-4 right-4 bg-surface/80 backdrop-blur-sm px-3 py-1 rounded-full border border-outline-variant/20 flex items-center gap-2">
                    {isChampion ? (
                      <Crown size={14} className="text-secondary animate-bounce" />
                    ) : (
                      <Trophy size={14} className="text-secondary" />
                    )}
                    <span className="text-[10px] font-bold uppercase tracking-widest">
                      {isChampion ? 'Campeón' : `Rank #${rank}`}
                    </span>
                  </div>
                  <h3 className={`text-3xl font-headline font-black text-center px-4 drop-shadow-lg uppercase italic tracking-tighter ${
                    isChampion ? 'text-secondary neon-glow-secondary' : 'text-white'
                  }`}>
                    {team.name}
                  </h3>
                </div>

              {/* Players Section */}
              <div className="p-8 space-y-6">
                <div className="flex justify-between items-center gap-4">
                  {team.players.map((player, pIdx) => (
                    <div key={pIdx} className="flex flex-col items-center flex-1 text-center">
                      <button 
                        onClick={() => setSelectedPlayer({ player, team })}
                        className="w-20 h-20 rounded-full border-4 border-surface-high overflow-hidden bg-background mb-3 shadow-lg hover:border-primary hover:scale-110 transition-all relative group/avatar"
                      >
                        {player.photo ? (
                          <img src={player.photo} alt={player.fullName} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-primary/10 text-primary">
                            <User size={32} />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover/avatar:opacity-100 transition-opacity flex items-center justify-center">
                          <Star size={20} className="text-white fill-white" />
                        </div>
                      </button>
                      <div className="flex flex-col items-center">
                        <p className="font-headline font-bold text-sm leading-tight flex items-center justify-center gap-1">
                          {player.fullName}
                        </p>
                        <p className="text-[10px] text-primary font-bold uppercase tracking-tighter mt-0.5">
                          {player.position || 'Drive'}
                        </p>
                        {player.mvpCount > 0 && (
                          <div className="flex items-center gap-0.5 mt-1 bg-secondary/10 px-2 py-0.5 rounded-full">
                            <Star size={10} className="text-secondary" fill="currentColor" />
                            <span className="text-[8px] font-black text-secondary uppercase tracking-tighter">MVP x{player.mvpCount}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Stats Bar */}
                <div className="pt-6 border-t border-outline-variant/10 grid grid-cols-3 gap-2">
                  <div className="text-center">
                    <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-tighter">Partidos</p>
                    <p className="font-headline font-bold text-lg">{team.stats.mp}</p>
                  </div>
                  <div className="text-center border-x border-outline-variant/10">
                    <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-tighter">Victorias</p>
                    <p className="font-headline font-bold text-lg text-secondary">{team.stats.w}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-tighter">Puntos</p>
                    <p className="font-headline font-bold text-lg text-primary">{team.stats.pts}</p>
                  </div>
                </div>

                <p className="text-[10px] text-on-surface-variant text-center italic mt-4">
                  Haz clic en un jugador para ver su carta especial
                </p>
              </div>
            </motion.div>
          );
        })}
      </div>
    )}
  </div>
  );
}

const FifaCardModal = ({ data, onClose, isChampion }: { data: {player: any, team: any}, onClose: () => void, isChampion: boolean }) => {
  const { player, team } = data;
  
  // Calculate FIFA-style stats
  const rating = Math.min(99, 75 + (player.mvpCount * 4) + (team.stats.w * 2));
  const pac = Math.min(99, 70 + Math.max(0, 50 - parseInt(player.age || '40')));
  const sho = Math.min(99, 65 + (team.stats.sw * 2));
  const pas = Math.min(99, 70 + (player.mvpCount * 8));
  const dri = Math.min(99, 68 + (team.stats.w * 3));
  const def = Math.min(99, 72 + Math.max(0, 20 - team.stats.sl));
  const phy = Math.min(99, 75 + (parseInt(player.age || '40') / 2));

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-background/90 backdrop-blur-sm"
      />
      
      <motion.div
        initial={{ opacity: 0, scale: 0.8, rotateY: 90 }}
        animate={{ opacity: 1, scale: 1, rotateY: 0 }}
        exit={{ opacity: 0, scale: 0.8, rotateY: -90 }}
        transition={{ type: 'spring', damping: 20 }}
        className="relative z-10 scale-[0.85] sm:scale-100"
      >
        {/* FIFA Card Container */}
        <div className={`relative w-72 h-[420px] bg-gradient-to-b ${isChampion ? 'from-[#f0d88d] via-[#d4af37] to-[#b8860b]' : 'from-primary/80 via-primary/40 to-primary/80'} rounded-[20px] p-1 shadow-[0_0_50px_rgba(0,0,0,0.5)] border-2 ${isChampion ? 'border-[#f0d88d]' : 'border-primary/50'}`}>
          <div className="absolute inset-0 bg-black/10 pointer-events-none"></div>
          
          {/* Card Shape (Shield) */}
          <div className="absolute inset-0 flex flex-col p-6 text-white font-headline">
            {/* Top Section: Rating & Position & Photo */}
            <div className="flex justify-between items-start mb-2">
              <div className="flex flex-col items-center">
                <span className="text-5xl font-black leading-none drop-shadow-md">{rating}</span>
                <span className="text-xl font-bold uppercase drop-shadow-md">{player.position === 'Revés' ? 'REV' : 'DRI'}</span>
                <div className="w-8 h-px bg-white/50 my-2"></div>
                <div className="w-8 h-6 bg-white/20 rounded flex items-center justify-center">
                  <span className="text-[10px] font-bold">FP+40</span>
                </div>
              </div>
              
              <div className="relative w-40 h-40">
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent rounded-full"></div>
                {player.photo ? (
                  <img src={player.photo} alt="" className="w-full h-full object-cover rounded-full border-4 border-white/20 shadow-2xl" />
                ) : (
                  <div className="w-full h-full bg-white/10 rounded-full flex items-center justify-center">
                    <User size={64} className="text-white/50" />
                  </div>
                )}
              </div>
            </div>

            {/* Name Section */}
            <div className="text-center py-2 border-y border-white/20 my-4">
              <h3 className="text-2xl font-black uppercase italic tracking-tighter drop-shadow-md truncate">
                {player.fullName.split(' ')[0]}
              </h3>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-x-8 gap-y-2 px-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-bold opacity-80">PAC</span>
                <span className="text-lg font-black">{pac}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-bold opacity-80">DRI</span>
                <span className="text-lg font-black">{dri}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-bold opacity-80">SHO</span>
                <span className="text-lg font-black">{sho}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-bold opacity-80">DEF</span>
                <span className="text-lg font-black">{def}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-bold opacity-80">PAS</span>
                <span className="text-lg font-black">{pas}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-bold opacity-80">PHY</span>
                <span className="text-lg font-black">{phy}</span>
              </div>
            </div>

            {/* Team Logo */}
            <div className="mt-auto flex justify-center">
              <div className="bg-white/20 px-4 py-1 rounded-full border border-white/30 flex items-center gap-2">
                <Trophy size={12} className="text-secondary" />
                <span className="text-[10px] font-bold uppercase tracking-widest">{team.name}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute -top-12 right-0 bg-white/10 hover:bg-white/20 p-2 rounded-full text-white transition-colors"
        >
          <X size={24} />
        </button>
      </motion.div>
    </div>
  );
};
