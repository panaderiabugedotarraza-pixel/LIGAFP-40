import React from 'react';
import { motion } from 'motion/react';
import { useLeague } from '../context/LeagueContext';
import { 
  Trophy, 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  Filter, 
  Download,
  ChevronRight,
  Star
} from 'lucide-react';

export default function Standings() {
  const { teams } = useLeague();
  const sortedTeams = [...teams].sort((a, b) => {
    if (b.stats.pts !== a.stats.pts) return b.stats.pts - a.stats.pts;
    const diffA = a.stats.sw - a.stats.sl;
    const diffB = b.stats.sw - b.stats.sl;
    return diffB - diffA;
  });
  
  const handleDownload = () => {
    alert('Descargando clasificación oficial en formato Excel...');
  };

  const handleFilter = () => {
    alert('Abriendo filtros avanzados (Categoría, Sede, Temporada)...');
  };

  // Calculate average age
  const allPlayers = teams.flatMap(t => t.players);
  const avgAge = allPlayers.length > 0 
    ? (allPlayers.reduce((acc, p) => acc + parseInt(p.age || '0'), 0) / allPlayers.length).toFixed(1)
    : '0.0';

  // Find MVP player
  const mvpPlayer = allPlayers.length > 0
    ? [...allPlayers].sort((a, b) => b.mvpCount - a.mvpCount)[0]
    : null;

  return (
    <div className="space-y-8">
      {/* Hero Stats Header */}
      <header className="py-8 border-b border-surface-highest">
        <div className="flex flex-col md:flex-row justify-between items-end gap-4">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tighter leading-none mb-2">
              TABLA DE <span className="text-secondary neon-glow-secondary">POSICIONES</span>
            </h1>
          </motion.div>
          <div className="flex gap-2">
            <div className="bg-surface-high px-4 py-2 rounded-lg border-l-4 border-primary">
              <span className="block text-xs text-on-surface-variant font-bold uppercase">Jornada</span>
              <span className="text-xl font-headline font-extrabold">00 / 18</span>
            </div>
            <div className="bg-surface-high px-4 py-2 rounded-lg border-l-4 border-secondary">
              <span className="block text-xs text-on-surface-variant font-bold uppercase">Próximo Cierre</span>
              <span className="text-xl font-headline font-extrabold text-secondary">--D --H</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Classification Table */}
      <motion.section 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-surface rounded-xl overflow-hidden shadow-2xl"
      >
        <div className="px-6 py-5 flex justify-between items-center border-b border-surface-highest">
          <h3 className="text-xl font-headline font-bold">Tabla General</h3>
          <div className="flex gap-2">
            <button 
              onClick={handleFilter}
              className="bg-surface-highest p-2 rounded-lg text-on-surface-variant hover:text-white transition-colors"
            >
              <Filter size={18} />
            </button>
            <button 
              onClick={handleDownload}
              className="bg-surface-highest p-2 rounded-lg text-on-surface-variant hover:text-white transition-colors"
            >
              <Download size={18} />
            </button>
          </div>
        </div>
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-high/50 text-on-surface-variant text-xs font-bold uppercase tracking-widest">
                <th className="px-6 py-4">Posición</th>
                <th className="px-6 py-4">Equipo</th>
                <th className="px-6 py-4 text-center">MP</th>
                <th className="px-6 py-4 text-center">W</th>
                <th className="px-6 py-4 text-center">L</th>
                <th className="px-6 py-4 text-center">Sets (W/L)</th>
                <th className="px-6 py-4 text-center">MVP</th>
                <th className="px-6 py-4 text-center text-secondary">Puntos</th>
                <th className="px-6 py-4 text-right">Forma</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-highest">
              {sortedTeams.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-6 py-12 text-center text-on-surface-variant italic">
                    La liga aún no ha comenzado. Registra tu equipo para aparecer en la tabla.
                  </td>
                </tr>
              ) : (
                sortedTeams.map((team, idx) => (
                  <tr key={team.id} className="hover:bg-surface-highest/50 transition-colors">
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-2">
                        <span className="font-headline font-extrabold text-2xl text-white">{(idx + 1).toString().padStart(2, '0')}</span>
                        <Minus size={14} className="text-on-surface-variant" />
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div className="bg-primary/10 border border-primary/30 text-primary w-8 h-8 rounded flex items-center justify-center font-bold relative">
                          {team.name.charAt(0).toUpperCase()}
                          {team.stats.mvps > 0 && (
                            <div className="absolute -top-1 -right-1 bg-secondary text-on-secondary rounded-full p-0.5 shadow-sm">
                              <Star size={8} fill="currentColor" />
                            </div>
                          )}
                        </div>
                        <span className="font-bold text-white">{team.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-center font-medium">{team.stats.mp}</td>
                    <td className="px-6 py-5 text-center font-bold text-primary">{team.stats.w}</td>
                    <td className="px-6 py-5 text-center font-medium">{team.stats.l}</td>
                    <td className="px-6 py-5 text-center font-medium text-on-surface-variant">
                      {team.stats.sw} / {team.stats.sl}
                    </td>
                    <td className="px-6 py-5 text-center">
                      <div className="flex items-center justify-center gap-1 text-secondary">
                        <Star size={14} fill={team.stats.mvps > 0 ? "currentColor" : "none"} />
                        <span className="font-bold">{team.stats.mvps}</span>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-center font-headline font-extrabold text-xl text-white">{team.stats.pts}</td>
                    <td className="px-6 py-5">
                      <div className="flex justify-end gap-1">
                        {team.stats.form.length === 0 ? (
                          <span className="text-[10px] text-on-surface-variant uppercase">Sin partidos</span>
                        ) : (
                          team.stats.form.map((f, i) => (
                            <div key={i} className={`w-2 h-2 rounded-full ${f === 'W' ? 'bg-secondary' : 'bg-error-dim'}`}></div>
                          ))
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile View - Cards */}
        <div className="md:hidden divide-y divide-surface-highest">
          {sortedTeams.length === 0 ? (
            <div className="px-6 py-12 text-center text-on-surface-variant italic">
              La liga aún no ha comenzado.
            </div>
          ) : (
            sortedTeams.map((team, idx) => (
              <div key={team.id} className="p-4 space-y-4">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <span className="font-headline font-black text-2xl text-primary/50">{(idx + 1).toString().padStart(2, '0')}</span>
                    <div className="flex flex-col">
                      <span className="font-headline font-bold text-white uppercase tracking-tight">{team.name}</span>
                      <div className="flex gap-1 mt-1">
                        {team.stats.form.map((f, i) => (
                          <div key={i} className={`w-1.5 h-1.5 rounded-full ${f === 'W' ? 'bg-secondary' : 'bg-error-dim'}`}></div>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Puntos</span>
                    <span className="text-2xl font-headline font-black text-secondary">{team.stats.pts}</span>
                  </div>
                </div>
                
                <div className="grid grid-cols-4 gap-2">
                  <div className="bg-surface-high p-2 rounded-lg text-center">
                    <span className="block text-[8px] font-bold text-on-surface-variant uppercase">MP</span>
                    <span className="text-sm font-bold">{team.stats.mp}</span>
                  </div>
                  <div className="bg-surface-high p-2 rounded-lg text-center">
                    <span className="block text-[8px] font-bold text-on-surface-variant uppercase">W</span>
                    <span className="text-sm font-bold text-primary">{team.stats.w}</span>
                  </div>
                  <div className="bg-surface-high p-2 rounded-lg text-center">
                    <span className="block text-[8px] font-bold text-on-surface-variant uppercase">Sets</span>
                    <span className="text-[10px] font-bold">{team.stats.sw}-{team.stats.sl}</span>
                  </div>
                  <div className="bg-surface-high p-2 rounded-lg text-center">
                    <span className="block text-[8px] font-bold text-on-surface-variant uppercase">MVP</span>
                    <span className="text-sm font-bold text-secondary">{team.stats.mvps}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
        <div className="px-6 py-4 bg-surface-highest/30 flex justify-between items-center">
          <div className="flex gap-4 text-xs font-bold text-on-surface-variant">
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-secondary"></span> W - Victoria</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-error-dim"></span> L - Derrota</span>
          </div>
          <button className="text-primary font-bold text-sm hover:underline">Ver Clasificación Completa</button>
        </div>
      </motion.section>

      {/* Dynamic Team Insights Section */}
      <section className="grid grid-cols-1 gap-4">
        {[
          { label: 'Jugador MVP', value: mvpPlayer?.fullName || '--', sub: `${mvpPlayer?.mvpCount || 0} MVPs` },
        ].map((stat, i) => (
          <motion.div 
            key={stat.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 + (i * 0.1) }}
            className="bg-surface-high p-5 rounded-xl border border-outline-variant/10"
          >
            <span className="text-on-surface-variant text-xs font-bold uppercase tracking-widest block mb-2">{stat.label}</span>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-headline font-extrabold truncate max-w-[70%]">{stat.value}</span>
              <span className="text-primary font-bold">{stat.sub}</span>
            </div>
          </motion.div>
        ))}
      </section>
    </div>
  );
}
