import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useLeague } from '../context/LeagueContext';
import { 
  Trophy, 
  Calendar as CalendarIcon, 
  Clock, 
  MapPin, 
  Download, 
  Share2, 
  RefreshCw,
  Star,
  Check,
  X,
  ChevronRight,
  Plus,
  User
} from 'lucide-react';

export default function Calendar() {
  const { teams, schedule, generateSchedule, updateMatchResult } = useLeague();
  const [currentTime, setCurrentTime] = React.useState(new Date());
  const [selectedMatch, setSelectedMatch] = useState<any>(null);
  const [activeRound, setActiveRound] = useState<number>(1);
  const [resultData, setResultData] = useState({ 
    s1_1: 0, s1_2: 0, 
    s2_1: 0, s2_2: 0, 
    s3_1: 0, s3_2: 0, 
    mvpPlayerId: '' 
  });

  React.useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('es-ES', { 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit',
      hour12: false 
    });
  };

  const handleUpdateResult = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resultData.mvpPlayerId) {
      alert('Por favor, selecciona al MVP del partido.');
      return;
    }

    // Calculate total sets won
    let score1 = 0;
    let score2 = 0;

    if (resultData.s1_1 > resultData.s1_2) score1++; else if (resultData.s1_2 > resultData.s1_1) score2++;
    if (resultData.s2_1 > resultData.s2_2) score1++; else if (resultData.s2_2 > resultData.s2_1) score2++;
    
    // Only count 3rd set if it was played (one of them has a score > 0 or it's a tie-break)
    // In padel, if it's 1-1 in sets, 3rd set is played.
    if (score1 === 1 && score2 === 1) {
      if (resultData.s3_1 > resultData.s3_2) score1++; else if (resultData.s3_2 > resultData.s3_1) score2++;
    }

    const setScores = {
      s1: [resultData.s1_1, resultData.s1_2] as [number, number],
      s2: [resultData.s2_1, resultData.s2_2] as [number, number],
      s3: (score1 === 1 && score2 === 1) || (resultData.s3_1 > 0 || resultData.s3_2 > 0) 
        ? [resultData.s3_1, resultData.s3_2] as [number, number] 
        : undefined
    };

    await updateMatchResult(selectedMatch.id, score1, score2, resultData.mvpPlayerId, setScores);
    setSelectedMatch(null);
    setResultData({ 
      s1_1: 0, s1_2: 0, 
      s2_1: 0, s2_2: 0, 
      s3_1: 0, s3_2: 0, 
      mvpPlayerId: '' 
    });
  };

  const handleDownload = () => {
    alert('Descargando calendario de la liga en formato PDF...');
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Liga FP+40 - Calendario',
        text: 'Mira el calendario oficial de la Liga FP+40',
        url: window.location.href
      }).catch(console.error);
    } else {
      alert('Enlace copiado al portapapeles');
    }
  };

  const groupedSchedule = schedule.reduce((acc, match) => {
    if (!acc[match.date]) acc[match.date] = [];
    acc[match.date].push(match);
    return acc;
  }, {} as Record<string, typeof schedule>);

  const sortedDates = Object.keys(groupedSchedule).sort((a, b) => {
    const [da, ma, ya] = a.split('/').map(Number);
    const [db, mb, yb] = b.split('/').map(Number);
    const timeA = new Date(ya, ma - 1, da).getTime();
    const timeB = new Date(yb, mb - 1, db).getTime();
    return timeA - timeB;
  });

  const rounds = Array.from(new Set(schedule.map(m => m.round))).sort((a, b) => (a as number) - (b as number));

  // Auto-set active round to the first pending round or the last round
  React.useEffect(() => {
    if (schedule.length > 0) {
      const firstPendingMatch = schedule.find(m => m.status === 'pending');
      if (firstPendingMatch) {
        setActiveRound(firstPendingMatch.round);
      } else {
        setActiveRound(rounds[rounds.length - 1]);
      }
    }
  }, [schedule.length]);

  return (
    <div className="space-y-8">
      {/* Header & Draw Action */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-2 bg-surface p-8 rounded-xl border-l-4 border-secondary flex flex-col justify-center"
        >
          <div className="flex flex-wrap items-center gap-3 mb-2">
            <span className="bg-secondary/20 text-secondary text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">Temporada 2026</span>
            <span className="text-on-surface-variant text-sm font-medium">Lunes de Padel</span>
            <div className="flex items-center gap-2 bg-surface-high px-3 py-1 rounded-full border border-outline-variant/20 ml-auto">
              <Clock size={14} className="text-secondary animate-pulse" />
              <span className="text-sm font-mono font-bold text-secondary tabular-nums">
                {formatTime(currentTime)}
              </span>
              <div className="w-px h-3 bg-outline-variant/30 mx-1"></div>
              <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">
                Sincronización: <span className="text-primary">19:30</span>
              </span>
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold font-headline leading-none mb-4">
            Calendario <span className="text-primary neon-glow-primary">Oficial</span>
          </h1>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-surface-highest p-6 rounded-xl flex flex-col justify-center items-center text-center overflow-hidden relative group"
        >
          {schedule.length === 0 ? (
            <>
              <div className="mb-4">
                <CalendarIcon size={48} className={`mx-auto mb-2 ${teams.length >= 6 && teams.length <= 8 ? 'text-secondary animate-bounce' : 'text-on-surface-variant opacity-50'}`} />
                <h3 className="text-sm font-bold text-on-surface-variant uppercase tracking-widest">Sorteo de Liga</h3>
              </div>
              <button 
                onClick={async () => await generateSchedule()}
                disabled={teams.length < 6 || teams.length > 8}
                className={`w-full py-4 rounded-xl font-headline font-black text-lg transition-all shadow-lg ${
                  teams.length >= 6 && teams.length <= 8 
                    ? 'bg-secondary text-on-secondary hover:scale-105 shadow-secondary/20' 
                    : 'bg-surface text-on-surface-variant cursor-not-allowed opacity-50'
                }`}
              >
                INICIAR SORTEO
              </button>
              <p className="text-[10px] mt-3 text-on-surface-variant font-bold uppercase">
                {teams.length < 6 ? `Faltan ${6 - teams.length} parejas` : teams.length > 8 ? 'Exceso de parejas (Máx 8)' : '¡Listo para sortear!'}
              </p>
            </>
          ) : (
            <>
              <Trophy size={48} className="text-primary mb-2" />
              <h3 className="text-sm font-bold text-on-surface-variant uppercase tracking-widest mb-2">Liga Iniciada</h3>
              <div className="text-3xl font-headline font-bold text-primary neon-glow-primary mb-1">{schedule.length}</div>
              <p className="text-[10px] text-on-surface-variant font-bold uppercase">Partidos Programados</p>
            </>
          )}
        </motion.div>
      </section>

      {/* Schedule Display */}
      {schedule.length > 0 ? (
        <div className="space-y-10">
          {/* Round Selector */}
          <div className="flex flex-col space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-headline font-bold flex items-center gap-2">
                <CalendarIcon size={20} className="text-primary" />
                Cronograma de Juegos
              </h2>
              <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">
                Selecciona una Jornada
              </span>
            </div>
            <div className="flex gap-2 overflow-x-auto pb-4 no-scrollbar">
              {rounds.map((r) => {
                const isFinished = schedule.filter(m => m.round === r).every(m => m.status === 'finished');
                return (
                  <button
                    key={r}
                    onClick={() => setActiveRound(r)}
                    className={`flex-shrink-0 px-6 py-3 rounded-xl font-headline font-bold text-sm transition-all border-2 ${
                      activeRound === r 
                        ? 'bg-primary text-on-primary border-primary shadow-lg shadow-primary/20' 
                        : 'bg-surface text-on-surface-variant border-outline-variant/10 hover:border-primary/30'
                    } flex items-center gap-2`}
                  >
                    Jornada {r}
                    {isFinished && <Check size={14} className="text-secondary" />}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-8">
            {sortedDates
              .filter(date => groupedSchedule[date][0].round === activeRound)
              .map((date, idx) => (
                <motion.section 
                  key={date}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-8"
                >
                  <div className="flex items-center gap-6">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">Lunes</span>
                      <span className="text-3xl font-headline font-black text-white">{date}</span>
                    </div>
                    <div className="h-px flex-1 bg-gradient-to-r from-outline-variant/30 to-transparent"></div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {groupedSchedule[date].map((match) => (
                      <div 
                        key={match.id}
                        className={`bg-surface rounded-3xl overflow-hidden border transition-all duration-300 group relative ${
                          match.status === 'finished' ? 'border-secondary/20' : 'border-outline-variant/10 shadow-xl'
                        }`}
                      >
                        <div className="p-8">
                          <div className="flex justify-between items-center mb-8">
                            <div className="flex items-center gap-2">
                              <Clock size={14} className="text-on-surface-variant" />
                              <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">
                                19:30 HS
                              </span>
                            </div>
                            {match.status === 'finished' ? (
                              <div className="flex items-center gap-2 bg-secondary/10 px-3 py-1 rounded-full">
                                <Check size={12} className="text-secondary" />
                                <span className="text-[10px] font-black text-secondary uppercase tracking-widest">Finalizado</span>
                              </div>
                            ) : (
                              <button 
                                onClick={() => setSelectedMatch(match)}
                                className="bg-primary/10 text-primary px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-primary hover:text-on-primary transition-all flex items-center gap-2"
                              >
                                <Plus size={12} /> Resultado
                              </button>
                            )}
                          </div>
                          
                          <div className="flex flex-row items-center justify-between gap-2 md:gap-4 relative">
                            {/* Team 1 */}
                            <div className="flex-1 flex flex-col items-center text-center space-y-2 md:space-y-3">
                              <div className="flex -space-x-2 md:-space-x-3">
                                {match.team1.players.map((p, i) => (
                                  <div key={i} className="w-10 h-10 md:w-12 md:h-12 rounded-full border-2 border-surface overflow-hidden bg-surface-high shadow-lg">
                                    {p.photo ? (
                                      <img src={p.photo} alt="" className="w-full h-full object-cover" />
                                    ) : (
                                      <div className="w-full h-full flex items-center justify-center text-on-surface-variant"><User size={16} /></div>
                                    )}
                                  </div>
                                ))}
                              </div>
                              <div className="space-y-0.5">
                                <p className="font-headline font-bold text-[10px] md:text-sm text-white uppercase tracking-tight line-clamp-1">{match.team1.name}</p>
                                <p className="text-[8px] md:text-[9px] text-on-surface-variant font-medium truncate max-w-[80px] md:max-w-[120px]">
                                  {match.team1.players[0].fullName.split(' ')[0]} & {match.team1.players[1].fullName.split(' ')[0]}
                                </p>
                              </div>
                            </div>

                            {/* VS Divider */}
                            <div className="flex flex-col items-center gap-1 md:gap-2">
                              <div className="w-px h-6 md:h-8 bg-gradient-to-b from-transparent via-outline-variant/20 to-transparent"></div>
                              <div className="w-6 h-6 md:w-8 md:h-8 rounded-full bg-surface-high border border-outline-variant/10 flex items-center justify-center text-[8px] md:text-[10px] font-black text-on-surface-variant italic">VS</div>
                              <div className="w-px h-6 md:h-8 bg-gradient-to-t from-transparent via-outline-variant/20 to-transparent"></div>
                            </div>

                            {/* Team 2 */}
                            <div className="flex-1 flex flex-col items-center text-center space-y-2 md:space-y-3">
                              <div className="flex -space-x-2 md:-space-x-3">
                                {match.team2.players.map((p, i) => (
                                  <div key={i} className="w-10 h-10 md:w-12 md:h-12 rounded-full border-2 border-surface overflow-hidden bg-surface-high shadow-lg">
                                    {p.photo ? (
                                      <img src={p.photo} alt="" className="w-full h-full object-cover" />
                                    ) : (
                                      <div className="w-full h-full flex items-center justify-center text-on-surface-variant"><User size={16} /></div>
                                    )}
                                  </div>
                                ))}
                              </div>
                              <div className="space-y-0.5">
                                <p className="font-headline font-bold text-[10px] md:text-sm text-white uppercase tracking-tight line-clamp-1">{match.team2.name}</p>
                                <p className="text-[8px] md:text-[9px] text-on-surface-variant font-medium truncate max-w-[80px] md:max-w-[120px]">
                                  {match.team2.players[0].fullName.split(' ')[0]} & {match.team2.players[1].fullName.split(' ')[0]}
                                </p>
                              </div>
                            </div>
                          </div>

                          {match.status === 'finished' && match.setScores && (
                            <div className="mt-8 flex flex-col items-center space-y-3">
                              <div className="flex items-center gap-4">
                                <div className="flex flex-col items-center">
                                  <span className="text-[24px] font-headline font-black text-white">{match.score1}</span>
                                </div>
                                <div className="text-on-surface-variant/20 font-black text-xl">-</div>
                                <div className="flex flex-col items-center">
                                  <span className="text-[24px] font-headline font-black text-white">{match.score2}</span>
                                </div>
                              </div>
                              <div className="flex gap-2">
                                <div className="bg-surface-high px-4 py-1.5 rounded-full border border-outline-variant/10 flex gap-3">
                                  <span className="text-[10px] font-black text-primary">{match.setScores.s1[0]}-{match.setScores.s1[1]}</span>
                                  <span className="text-[10px] font-black text-primary">{match.setScores.s2[0]}-{match.setScores.s2[1]}</span>
                                  {match.setScores.s3 && (
                                    <span className="text-[10px] font-black text-primary">{match.setScores.s3[0]}-{match.setScores.s3[1]}</span>
                                  )}
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                        
                        {match.status === 'finished' && (
                          <div className="bg-secondary/5 p-3 text-center border-t border-secondary/10">
                            <div className="flex items-center justify-center gap-2">
                              <Star size={12} className="text-secondary" fill="currentColor" />
                              <span className="text-[10px] text-secondary uppercase font-black tracking-widest">
                                MVP: {[...match.team1.players, ...match.team2.players].find(p => p.id === match.mvpPlayerId)?.fullName}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </motion.section>
              ))}
          </div>
        </div>
      ) : (
        <section className="py-20 text-center bg-surface rounded-3xl border-2 border-dashed border-outline-variant/20">
          <div className="max-w-md mx-auto space-y-6">
            <div className="w-20 h-20 bg-surface-highest rounded-full flex items-center justify-center mx-auto">
              <RefreshCw size={40} className="text-on-surface-variant opacity-30" />
            </div>
            <div>
              <h2 className="text-2xl font-headline font-bold mb-2">Esperando Parejas</h2>
              <p className="text-on-surface-variant">
                El calendario se generará automáticamente una vez que se inicie el sorteo desde el panel superior.
              </p>
            </div>
          </div>
        </section>
      )}

      {/* Result Entry Modal */}
      <AnimatePresence>
        {selectedMatch && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedMatch(null)}
              className="absolute inset-0 bg-background/90 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-surface w-full max-w-lg rounded-3xl shadow-2xl border border-outline-variant/20 relative z-10 overflow-hidden"
            >
              <div className="p-6 border-b border-outline-variant/10 flex justify-between items-center bg-surface-high">
                <h3 className="text-xl font-headline font-bold">Ingresar Resultado</h3>
                <button onClick={() => setSelectedMatch(null)} className="text-on-surface-variant hover:text-on-surface">
                  <X size={24} />
                </button>
              </div>
              <form onSubmit={handleUpdateResult} className="p-8 space-y-8">
                <div className="space-y-6">
                  <div className="grid grid-cols-3 gap-4 items-center text-center">
                    <div className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Set</div>
                    <div className="text-[10px] font-bold text-primary uppercase tracking-widest">{selectedMatch.team1.name}</div>
                    <div className="text-[10px] font-bold text-secondary uppercase tracking-widest">{selectedMatch.team2.name}</div>
                  </div>

                  {/* Set 1 */}
                  <div className="grid grid-cols-3 gap-4 items-center">
                    <div className="text-sm font-bold text-on-surface-variant text-center">Set 1</div>
                    <input 
                      type="number" min="0" required
                      value={resultData.s1_1}
                      onChange={(e) => setResultData({...resultData, s1_1: parseInt(e.target.value)})}
                      className="bg-surface-highest border-2 border-primary/20 rounded-xl p-3 text-center text-2xl font-black text-primary outline-none focus:border-primary"
                    />
                    <input 
                      type="number" min="0" required
                      value={resultData.s1_2}
                      onChange={(e) => setResultData({...resultData, s1_2: parseInt(e.target.value)})}
                      className="bg-surface-highest border-2 border-secondary/20 rounded-xl p-3 text-center text-2xl font-black text-secondary outline-none focus:border-secondary"
                    />
                  </div>

                  {/* Set 2 */}
                  <div className="grid grid-cols-3 gap-4 items-center">
                    <div className="text-sm font-bold text-on-surface-variant text-center">Set 2</div>
                    <input 
                      type="number" min="0" required
                      value={resultData.s2_1}
                      onChange={(e) => setResultData({...resultData, s2_1: parseInt(e.target.value)})}
                      className="bg-surface-highest border-2 border-primary/20 rounded-xl p-3 text-center text-2xl font-black text-primary outline-none focus:border-primary"
                    />
                    <input 
                      type="number" min="0" required
                      value={resultData.s2_2}
                      onChange={(e) => setResultData({...resultData, s2_2: parseInt(e.target.value)})}
                      className="bg-surface-highest border-2 border-secondary/20 rounded-xl p-3 text-center text-2xl font-black text-secondary outline-none focus:border-secondary"
                    />
                  </div>

                  {/* Set 3 (Optional) */}
                  <div className="grid grid-cols-3 gap-4 items-center">
                    <div className="text-sm font-bold text-on-surface-variant text-center">Set 3</div>
                    <input 
                      type="number" min="0"
                      value={resultData.s3_1}
                      onChange={(e) => setResultData({...resultData, s3_1: parseInt(e.target.value)})}
                      className="bg-surface-highest border-2 border-primary/20 rounded-xl p-3 text-center text-2xl font-black text-primary outline-none focus:border-primary"
                    />
                    <input 
                      type="number" min="0"
                      value={resultData.s3_2}
                      onChange={(e) => setResultData({...resultData, s3_2: parseInt(e.target.value)})}
                      className="bg-surface-highest border-2 border-secondary/20 rounded-xl p-3 text-center text-2xl font-black text-secondary outline-none focus:border-secondary"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-widest text-center">Seleccionar MVP del Partido</label>
                  <div className="grid grid-cols-1 gap-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <p className="text-[10px] font-bold text-primary uppercase text-center mb-1">{selectedMatch.team1.name}</p>
                        {selectedMatch.team1.players.map((player: any) => (
                          <button
                            key={player.id}
                            type="button"
                            onClick={() => setResultData({...resultData, mvpPlayerId: player.id})}
                            className={`w-full p-3 rounded-xl border-2 transition-all flex items-center gap-3 ${
                              resultData.mvpPlayerId === player.id 
                                ? 'border-primary bg-primary/10 text-on-surface' 
                                : 'border-outline-variant/10 bg-surface-highest text-on-surface-variant hover:border-primary/30'
                            }`}
                          >
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${resultData.mvpPlayerId === player.id ? 'bg-primary text-on-primary' : 'bg-surface text-on-surface-variant'}`}>
                              {player.fullName.charAt(0)}
                            </div>
                            <span className="text-xs font-bold truncate">{player.fullName}</span>
                            <Star 
                              size={16} 
                              className={`ml-auto ${resultData.mvpPlayerId === player.id ? 'text-primary' : 'text-on-surface-variant opacity-20'}`} 
                              fill={resultData.mvpPlayerId === player.id ? "currentColor" : "none"} 
                            />
                          </button>
                        ))}
                      </div>
                      <div className="space-y-2">
                        <p className="text-[10px] font-bold text-secondary uppercase text-center mb-1">{selectedMatch.team2.name}</p>
                        {selectedMatch.team2.players.map((player: any) => (
                          <button
                            key={player.id}
                            type="button"
                            onClick={() => setResultData({...resultData, mvpPlayerId: player.id})}
                            className={`w-full p-3 rounded-xl border-2 transition-all flex items-center gap-3 ${
                              resultData.mvpPlayerId === player.id 
                                ? 'border-secondary bg-secondary/10 text-on-surface' 
                                : 'border-outline-variant/10 bg-surface-highest text-on-surface-variant hover:border-secondary/30'
                            }`}
                          >
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${resultData.mvpPlayerId === player.id ? 'bg-secondary text-on-secondary' : 'bg-surface text-on-surface-variant'}`}>
                              {player.fullName.charAt(0)}
                            </div>
                            <span className="text-xs font-bold truncate">{player.fullName}</span>
                            <Star 
                              size={16} 
                              className={`ml-auto ${resultData.mvpPlayerId === player.id ? 'text-secondary' : 'text-on-surface-variant opacity-20'}`} 
                              fill={resultData.mvpPlayerId === player.id ? "currentColor" : "none"} 
                            />
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <button 
                  type="submit"
                  className="w-full bg-primary text-on-primary font-headline font-black text-lg py-5 rounded-2xl shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 mt-4"
                >
                  GUARDAR RESULTADO <Check size={20} />
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Rules Bento */}
      <section className="grid grid-cols-1 gap-6">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="bg-gradient-to-br from-surface to-surface-highest p-8 rounded-2xl border border-outline-variant/10"
        >
          <h3 className="text-lg font-headline font-bold mb-6 flex items-center gap-2">
            <RefreshCw size={20} className="text-secondary" />
            Formato de Liga
          </h3>
          <ul className="space-y-4">
            {[
              { id: '01', text: 'Formato Todos contra Todos (Round Robin).' },
              { id: '02', text: 'Partidos programados todos los lunes.' },
              { id: '03', text: 'Puntaje: 3 puntos por partido ganado.' }
            ].map((item) => (
              <li key={item.id} className="flex gap-4">
                <span className="text-secondary font-bold font-headline">{item.id}</span>
                <p className="text-sm text-on-surface-variant">{item.text}</p>
              </li>
            ))}
          </ul>
        </motion.div>
      </section>
    </div>
  );
}
