import React, { createContext, useContext, useState, useEffect } from 'react';

interface Player {
  id: string;
  fullName: string;
  age: string;
  phone: string;
  teamName: string;
  photo: string | null;
  mvpCount: number;
  position?: 'Revés' | 'Drive';
}

interface Team {
  id: string;
  name: string;
  players: Player[];
  level: string;
  rank: string;
  stats: {
    mp: number;
    w: number;
    l: number;
    sw: number; // Sets won
    sl: number; // Sets lost
    pts: number;
    mvps: number; // Total MVPs for the team
    form: string[];
  };
}

interface Match {
  id: string;
  round: number;
  date: string;
  team1: Team;
  team2: Team;
  score1?: number;
  score2?: number;
  setScores?: {
    s1: [number, number];
    s2: [number, number];
    s3?: [number, number];
  };
  mvpPlayerId?: string;
  status: 'pending' | 'finished';
}

interface Replacement {
  id: string;
  fullName: string;
  phone: string;
  photo: string | null;
}

interface News {
  id: string;
  text: string;
  type: 'info' | 'warning' | 'success';
}

interface LeagueContextType {
  pendingPlayers: Player[];
  teams: Team[];
  replacements: Replacement[];
  schedule: Match[];
  news: News[];
  registerPlayer: (player: Omit<Player, 'id' | 'mvpCount'>) => void;
  removeTeam: (id: string) => void;
  removePendingPlayer: (id: string) => void;
  registerReplacement: (replacement: Omit<Replacement, 'id'>) => void;
  removeReplacement: (id: string) => void;
  generateSchedule: () => void;
  updateMatchResult: (matchId: string, score1: number, score2: number, mvpPlayerId: string, setScores?: Match['setScores']) => void;
  seedTestData: () => void;
  addNews: (news: Omit<News, 'id'>) => void;
  removeNews: (id: string) => void;
}

const LeagueContext = createContext<LeagueContextType | undefined>(undefined);

export function LeagueProvider({ children }: { children: React.ReactNode }) {
  const [pendingPlayers, setPendingPlayers] = useState<Player[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [replacements, setReplacements] = useState<Replacement[]>([]);
  const [schedule, setSchedule] = useState<Match[]>([]);
  const [news, setNews] = useState<News[]>([
    { id: '1', text: '¡Bienvenidos a la nueva temporada 2026 de la Liga FP+40!', type: 'info' },
    { id: '2', text: 'Recuerda que el cierre de inscripciones es el próximo viernes.', type: 'warning' }
  ]);

  const registerPlayer = (playerData: Omit<Player, 'id' | 'mvpCount'>) => {
    const newPlayer: Player = {
      ...playerData,
      id: Math.random().toString(36).substr(2, 9),
      mvpCount: 0,
    };

    const partnerIndex = pendingPlayers.findIndex(
      (p) => p.teamName.toLowerCase().trim() === newPlayer.teamName.toLowerCase().trim()
    );

    if (partnerIndex !== -1) {
      const partner = pendingPlayers[partnerIndex];
      const newTeam: Team = {
        id: Math.random().toString(36).substr(2, 9),
        name: newPlayer.teamName,
        players: [partner, newPlayer],
        level: 'Intermedio',
        rank: `#${teams.length + 1}`,
        stats: {
          mp: 0,
          w: 0,
          l: 0,
          sw: 0,
          sl: 0,
          pts: 0,
          mvps: 0,
          form: [],
        },
      };

      setTeams([...teams, newTeam]);
      setPendingPlayers(pendingPlayers.filter((_, i) => i !== partnerIndex));
      return true;
    } else {
      setPendingPlayers([...pendingPlayers, newPlayer]);
      return false;
    }
  };

  const removeTeam = (id: string) => {
    setTeams(teams.filter((t) => t.id !== id));
  };

  const removePendingPlayer = (id: string) => {
    setPendingPlayers(pendingPlayers.filter((p) => p.id !== id));
  };

  const registerReplacement = (replacementData: Omit<Replacement, 'id'>) => {
    if (replacements.length >= 3) {
      alert('Máximo 3 jugadores de reemplazo permitidos.');
      return;
    }
    const newReplacement: Replacement = {
      ...replacementData,
      id: Math.random().toString(36).substr(2, 9),
    };
    setReplacements([...replacements, newReplacement]);
  };

  const removeReplacement = (id: string) => {
    setReplacements(replacements.filter((r) => r.id !== id));
  };

  const generateSchedule = () => {
    if (teams.length < 6 || teams.length > 8) {
      alert('El sorteo requiere entre 6 y 8 parejas.');
      return;
    }

    const shuffledTeams = [...teams].sort(() => Math.random() - 0.5);
    const numTeams = shuffledTeams.length;
    const rounds = numTeams % 2 === 0 ? numTeams - 1 : numTeams;
    const newSchedule: Match[] = [];

    const getNextMonday = (weeksAhead: number) => {
      const d = new Date();
      d.setDate(d.getDate() + (1 + 7 - d.getDay()) % 7 + (weeksAhead * 7));
      return d.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
    };

    const teamsList = [...shuffledTeams];
    if (numTeams % 2 !== 0) teamsList.push({ id: 'bye', name: 'Descanso' } as any);

    for (let r = 0; r < rounds; r++) {
      const date = getNextMonday(r);
      for (let m = 0; m < teamsList.length / 2; m++) {
        const t1 = teamsList[m];
        const t2 = teamsList[teamsList.length - 1 - m];

        if (t1.id !== 'bye' && t2.id !== 'bye') {
          newSchedule.push({
            id: Math.random().toString(36).substr(2, 9),
            round: r + 1,
            date,
            team1: t1,
            team2: t2,
            status: 'pending'
          });
        }
      }
      teamsList.splice(1, 0, teamsList.pop()!);
    }

    setSchedule(newSchedule);
    alert('¡Sorteo generado con éxito! Formato Todos contra Todos.');
  };

  const updateMatchResult = (matchId: string, score1: number, score2: number, mvpPlayerId: string, setScores?: Match['setScores']) => {
    let matchToUpdate: Match | undefined;

    setSchedule(prev => prev.map(match => {
      if (match.id === matchId) {
        matchToUpdate = { ...match, score1, score2, mvpPlayerId, setScores, status: 'finished' };
        return matchToUpdate;
      }
      return match;
    }));

    // Update teams and player stats
    setTeams(prevTeams => {
      // We need the match details to know which teams are playing
      // Since setSchedule and setTeams are called together, we can find the match in the current schedule
      const match = schedule.find(m => m.id === matchId);
      if (!match) return prevTeams;

      return prevTeams.map(team => {
        const isTeam1 = team.id === match.team1.id;
        const isTeam2 = team.id === match.team2.id;

        if (isTeam1 || isTeam2) {
          const teamScore = isTeam1 ? score1 : score2;
          const opponentScore = isTeam1 ? score2 : score1;
          const won = teamScore > opponentScore;
          const isMvpInThisTeam = team.players.some(p => p.id === mvpPlayerId);

          return {
            ...team,
            players: team.players.map(player => {
              if (player.id === mvpPlayerId) {
                return { ...player, mvpCount: player.mvpCount + 1 };
              }
              return player;
            }),
            stats: {
              ...team.stats,
              mp: team.stats.mp + 1,
              w: team.stats.w + (won ? 1 : 0),
              l: team.stats.l + (won ? 0 : 1),
              pts: team.stats.pts + (won ? 3 : 0),
              sw: team.stats.sw + teamScore,
              sl: team.stats.sl + opponentScore,
              mvps: team.stats.mvps + (isMvpInThisTeam ? 1 : 0),
              form: [won ? 'W' : 'L', ...team.stats.form].slice(0, 5)
            }
          };
        }
        return team;
      });
    });
  };

  const seedTestData = () => {
    const testTeams = [
      { name: 'Los Galácticos', players: ['Juan Pérez', 'Carlos Ruiz'] },
      { name: 'Padel Masters', players: ['Roberto Gómez', 'Luis Torres'] },
      { name: 'Titanes del Drive', players: ['Andrés Silva', 'Mario Casas'] },
      { name: 'Reyes del Smash', players: ['Diego Luna', 'Fernando Soler'] },
      { name: 'Muro Infranqueable', players: ['Santi Ramos', 'Hugo Boss'] },
      { name: 'Volea Mortal', players: ['Alex Pina', 'Oscar Jaenada'] }
    ];

    const newTeams: Team[] = testTeams.map((t, idx) => ({
      id: Math.random().toString(36).substr(2, 9),
      name: t.name,
      players: t.players.map((name, pIdx) => ({
        id: Math.random().toString(36).substr(2, 9),
        fullName: name,
        age: '40',
        phone: '+34 600 000 000',
        teamName: t.name,
        photo: `https://picsum.photos/seed/${name.replace(' ', '')}/200/200`,
        mvpCount: 0,
        position: pIdx === 0 ? 'Revés' : 'Drive'
      })),
      level: 'Avanzado',
      rank: `#${idx + 1}`,
      stats: {
        mp: 0,
        w: 0,
        l: 0,
        sw: 0,
        sl: 0,
        pts: 0,
        mvps: 0,
        form: [],
      }
    }));

    setTeams(newTeams);
    setPendingPlayers([]);
    setSchedule([]);
    alert('6 equipos de prueba generados con éxito.');
  };

  const addNews = (newsData: Omit<News, 'id'>) => {
    const newNews: News = {
      ...newsData,
      id: Math.random().toString(36).substr(2, 9),
    };
    setNews(prev => [newNews, ...prev]);
  };

  const removeNews = (id: string) => {
    setNews(prev => prev.filter(n => n.id !== id));
  };

  return (
    <LeagueContext.Provider value={{ 
      pendingPlayers, 
      teams, 
      replacements, 
      schedule, 
      news,
      registerPlayer, 
      removeTeam, 
      removePendingPlayer,
      registerReplacement,
      removeReplacement,
      generateSchedule,
      updateMatchResult,
      seedTestData,
      addNews,
      removeNews
    }}>
      {children}
    </LeagueContext.Provider>
  );
}

export function useLeague() {
  const context = useContext(LeagueContext);
  if (context === undefined) {
    throw new Error('useLeague must be used within a LeagueProvider');
  }
  return context;
}
