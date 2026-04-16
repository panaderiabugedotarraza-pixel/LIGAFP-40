import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Trophy, Clock, MapPin, Calendar as CalendarIcon, Users, Activity, Star, User, Crown, Bell, ChevronLeft, ChevronRight } from 'lucide-react';
import { useLeague } from '../context/LeagueContext';
import { AnimatePresence } from 'motion/react';

export default function Home() {
  const { teams, schedule, news, groupPhotoUrl } = useLeague();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [currentNewsIndex, setCurrentNewsIndex] = useState(0);

  useEffect(() => {
    if (news.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentNewsIndex(prev => (prev + 1) % news.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [news.length]);

  const sortedTeams = [...teams].sort((a, b) => {
    if (b.stats.pts !== a.stats.pts) return b.stats.pts - a.stats.pts;
    const diffA = a.stats.sw - a.stats.sl;
    const diffB = b.stats.sw - b.stats.sl;
    return diffB - diffA;
  });

  const topTeam = sortedTeams[0];
  const isLeagueFinished = schedule.length > 0 && schedule.every(m => m.status === 'finished');

  useEffect(() => {
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

  return (
    <div className="space-y-8 md:space-y-12 pb-12">
      {/* Hero Banner */}
      <section className="relative h-[180px] md:h-[240px] rounded-2xl md:rounded-3xl overflow-hidden shadow-2xl">
        <img 
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuDrusnx-jUkVts0oAS7CZI-s_AQ7CAfUWPTqJtDFbSqIEYU3EnSyQk0j3GLkxCY06gIY5UP_YSXS4-jIWWAR1n7bvB9-QYiFayXl2b4U3XcoeUoBJqIHpSEiMqCRBbErTOsgzK-JEqPxirJbVkL4flqU0tw7SJJpnvs3jbSPHjU4UCjoRLuc5idCuKjJfrgotCIN1neMUy2yTbxJ_GhqCNwcw3fkBmVbHmHZ6DVjfW8y5kD_Hrtsk0nFdp2T2Tqa5GHqsKYZJHF70_N" 
          alt="Liga FP+40 Banner" 
          className="w-full h-full object-cover grayscale-[0.3] brightness-50"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent"></div>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-2"
          >
            <span className="bg-secondary text-on-secondary px-3 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest shadow-lg">Temporada 2026</span>
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-3xl sm:text-5xl md:text-6xl font-headline font-black tracking-tighter text-white drop-shadow-2xl italic uppercase"
          >
            LIGA <span className="text-primary neon-glow-primary">FP+40</span>
          </motion.h1>
        </div>
      </section>

      {/* Group Photo Section */}
      <motion.section 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.3 }}
        className="bg-surface p-2 md:p-4 rounded-2xl md:rounded-3xl border border-outline-variant/10 shadow-xl overflow-hidden"
      >
        <div className="aspect-[21/9] relative rounded-xl md:rounded-2xl overflow-hidden bg-surface-high group">
          <img 
            src={groupPhotoUrl} 
            alt="Foto Grupal Liga FP+40" 
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            referrerPolicy="no-referrer"
          />
        </div>
      </motion.section>

      {/* News Ticker / Banner */}
      {news.length > 0 && (
        <section className="relative bg-surface-high border-y border-primary/20 overflow-hidden py-3 md:py-4 shadow-2xl">
          <div className="flex whitespace-nowrap">
            <motion.div
              animate={{ x: ["0%", "-100%"] }}
              transition={{ 
                duration: news.length * 45, 
                repeat: Infinity, 
                ease: "linear" 
              }}
              className="flex gap-12 md:gap-24 items-center pr-12 md:pr-24"
            >
              {[...news, ...news, ...news].map((n, i) => (
                <div key={`${n.id}-${i}`} className="flex items-center gap-3">
                  <Bell size={14} className="text-primary" />
                  <p className="text-sm md:text-base font-black text-white/90 italic tracking-tight uppercase">
                    {n.text}
                  </p>
                  <div className="w-2 h-2 rounded-full bg-secondary/50 ml-4 md:ml-8" />
                </div>
              ))}
            </motion.div>
          </div>
          
          {/* Animated Background Line */}
          <div className="absolute bottom-0 left-0 h-[1px] bg-primary/50 w-full overflow-hidden">
            <motion.div 
              animate={{ x: ['-100%', '100%'] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
              className="h-full w-1/3 bg-gradient-to-r from-transparent via-primary to-transparent"
            />
          </div>
        </section>
      )}

      {/* Info Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Real-time Clock Card */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-surface p-6 md:p-8 rounded-2xl border border-outline-variant/10 shadow-xl flex flex-col items-center justify-center text-center group hover:border-secondary/30 transition-all"
        >
          <div className="w-12 h-12 md:w-16 md:h-16 bg-secondary/10 rounded-full flex items-center justify-center mb-4 md:mb-6 group-hover:scale-110 transition-transform">
            <Clock size={24} className="text-secondary animate-pulse md:w-8 md:h-8" />
          </div>
          <h3 className="text-[10px] md:text-sm font-bold text-on-surface-variant uppercase tracking-widest mb-2">Hora Oficial</h3>
          <div className="text-4xl md:text-6xl font-headline font-black text-white tabular-nums tracking-tighter mb-4">
            {formatTime(currentTime)}
          </div>
          <p className="text-[10px] md:text-xs text-on-surface-variant font-medium">
            Sincronización: <span className="text-primary font-bold">19:30 HS</span>
          </p>
        </motion.div>

        {/* Match Info Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-2 bg-surface p-6 md:p-8 rounded-2xl border border-outline-variant/10 shadow-xl"
        >
          <div className="flex items-center justify-between mb-6 md:mb-8">
            <h3 className="text-lg md:text-xl font-headline font-bold flex items-center gap-2 md:gap-3">
              <CalendarIcon size={20} className="text-primary md:w-6 md:h-6" />
              {isLeagueFinished ? 'Clasificación Final' : 'Próxima Jornada'}
            </h3>
            <span className="bg-primary/10 text-primary text-[8px] md:text-[10px] font-bold px-2 py-0.5 md:px-3 md:py-1 rounded-full uppercase tracking-widest">
              {isLeagueFinished ? 'Finalizada' : 'Jornada 01'}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="p-2 bg-surface-high rounded-lg text-secondary">
                  <MapPin size={20} />
                </div>
                <div>
                  <p className="text-xs text-on-surface-variant font-bold uppercase tracking-tighter">Sede Oficial</p>
                  <p className="font-headline font-bold text-lg">FullPadel</p>
                  <p className="text-xs text-on-surface-variant">Freire 1573, Quillota</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="p-2 bg-surface-high rounded-lg text-primary">
                  <Activity size={20} />
                </div>
                <div>
                  <p className="text-xs text-on-surface-variant font-bold uppercase tracking-tighter">Estado de Inscripción</p>
                  <p className="font-headline font-bold text-lg">{teams.length} / 12 Equipos</p>
                  <div className="w-full bg-surface-highest h-1.5 rounded-full mt-2 overflow-hidden">
                    <div 
                      className="bg-primary h-full rounded-full transition-all duration-1000" 
                      style={{ width: `${(teams.length / 12) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>

            <div className={`relative p-6 rounded-xl border transition-all duration-500 overflow-hidden ${
              isLeagueFinished 
                ? 'bg-gradient-to-br from-secondary/20 to-secondary/5 border-secondary shadow-[0_0_20px_rgba(195,244,0,0.2)]' 
                : 'bg-surface-high border-outline-variant/5'
            }`}>
              {topTeam ? (
                <div className="flex flex-col items-center text-center space-y-3">
                  <div className="flex items-center gap-2 mb-1">
                    {isLeagueFinished ? (
                      <Crown size={20} className="text-secondary animate-bounce" />
                    ) : (
                      <Star size={16} className="text-primary" fill="currentColor" />
                    )}
                    <h4 className="text-xs font-bold text-on-surface uppercase tracking-widest">
                      {isLeagueFinished ? 'Campeón de Liga' : 'Líder Actual'}
                    </h4>
                  </div>
                  
                  <div className="flex gap-4">
                    {topTeam.players.map((p, i) => (
                      <div key={i} className="relative">
                        <div className={`w-16 h-16 rounded-full overflow-hidden border-2 transition-all duration-500 ${
                          isLeagueFinished ? 'border-secondary scale-110 shadow-lg' : 'border-primary/30'
                        }`}>
                          {p.photo ? (
                            <img src={p.photo} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full bg-surface-highest flex items-center justify-center text-on-surface-variant">
                              <User size={24} />
                            </div>
                          )}
                        </div>
                        {isLeagueFinished && i === 0 && (
                          <div className="absolute -top-4 -left-2 -rotate-12">
                            <Crown size={24} className="text-secondary drop-shadow-lg" />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                  
                  <div className="space-y-1">
                    <p className={`font-headline font-black text-xl uppercase italic tracking-tighter ${
                      isLeagueFinished ? 'text-secondary neon-glow-secondary' : 'text-white'
                    }`}>
                      {topTeam.name}
                    </p>
                    <p className="text-[10px] text-on-surface-variant font-bold uppercase">
                      {topTeam.stats.pts} Puntos | {topTeam.stats.w} Victorias
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center text-on-surface-variant italic">
                  <p className="text-sm">Esperando inicio de liga...</p>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Stats Summary */}
      <section className="grid grid-cols-2 gap-6">
        {[
          { label: 'Jugadores', value: teams.length * 2, icon: Users, color: 'text-primary' },
          { label: 'Equipos', value: teams.length, icon: Trophy, color: 'text-secondary' },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 + (i * 0.1) }}
            className="bg-surface-high p-6 rounded-xl text-center border border-outline-variant/5"
          >
            <stat.icon size={24} className={`${stat.color} mx-auto mb-3`} />
            <div className="text-3xl font-headline font-black mb-1">{stat.value}</div>
            <div className="text-[10px] text-on-surface-variant font-bold uppercase tracking-widest">{stat.label}</div>
          </motion.div>
        ))}
      </section>
    </div>
  );
}
