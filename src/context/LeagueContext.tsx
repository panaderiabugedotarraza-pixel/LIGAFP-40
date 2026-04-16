import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  collection, 
  onSnapshot, 
  doc, 
  setDoc, 
  deleteDoc, 
  updateDoc,
  query,
  orderBy,
  getDoc
} from 'firebase/firestore';
import { db, auth } from '../lib/firebase';

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId: string | undefined;
    email: string | null | undefined;
    emailVerified: boolean | undefined;
    isAnonymous: boolean | undefined;
    tenantId: string | null | undefined;
    providerInfo: {
      providerId: string;
      displayName: string | null;
      email: string | null;
      photoUrl: string | null;
    }[];
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData.map(provider => ({
        providerId: provider.providerId,
        displayName: provider.displayName,
        email: provider.email,
        photoUrl: provider.photoURL
      })) || []
    },
    operationType,
    path
  }
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

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
  groupPhotoUrl: string;
  registerPlayer: (player: Omit<Player, 'id' | 'mvpCount'>) => Promise<boolean>;
  removeTeam: (id: string) => Promise<void>;
  removePendingPlayer: (id: string) => Promise<void>;
  registerReplacement: (replacement: Omit<Replacement, 'id'>) => Promise<void>;
  removeReplacement: (id: string) => Promise<void>;
  generateSchedule: () => Promise<void>;
  updateMatchResult: (matchId: string, score1: number, score2: number, mvpPlayerId: string, setScores?: Match['setScores']) => Promise<void>;
  seedTestData: () => Promise<void>;
  addNews: (news: Omit<News, 'id'>) => Promise<void>;
  removeNews: (id: string) => Promise<void>;
  updateGroupPhoto: (url: string) => Promise<void>;
}

const LeagueContext = createContext<LeagueContextType | undefined>(undefined);

export function LeagueProvider({ children }: { children: React.ReactNode }) {
  const [pendingPlayers, setPendingPlayers] = useState<Player[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [replacements, setReplacements] = useState<Replacement[]>([]);
  const [schedule, setSchedule] = useState<Match[]>([]);
  const [news, setNews] = useState<News[]>([]);
  const [groupPhotoUrl, setGroupPhotoUrl] = useState<string>('https://picsum.photos/seed/padel-group/1200/600');

  // Real-time listeners
  useEffect(() => {
    const unsubPending = onSnapshot(collection(db, 'pendingPlayers'), (snapshot) => {
      setPendingPlayers(snapshot.docs.map(doc => doc.data() as Player));
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'pendingPlayers');
    });

    const unsubTeams = onSnapshot(collection(db, 'teams'), (snapshot) => {
      setTeams(snapshot.docs.map(doc => doc.data() as Team));
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'teams');
    });

    const unsubReplacements = onSnapshot(collection(db, 'replacements'), (snapshot) => {
      setReplacements(snapshot.docs.map(doc => doc.data() as Replacement));
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'replacements');
    });

    const unsubSchedule = onSnapshot(query(collection(db, 'schedule'), orderBy('round')), (snapshot) => {
      setSchedule(snapshot.docs.map(doc => doc.data() as Match));
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'schedule');
    });

    const unsubNews = onSnapshot(collection(db, 'news'), (snapshot) => {
      setNews(snapshot.docs.map(doc => doc.data() as News));
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'news');
    });

    const unsubSettings = onSnapshot(doc(db, 'settings', 'global'), (doc) => {
      if (doc.exists()) {
        setGroupPhotoUrl(doc.data().groupPhotoUrl);
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'settings/global');
    });

    return () => {
      unsubPending();
      unsubTeams();
      unsubReplacements();
      unsubSchedule();
      unsubNews();
      unsubSettings();
    };
  }, []);

  const registerPlayer = async (playerData: Omit<Player, 'id' | 'mvpCount'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newPlayer: Player = { ...playerData, id, mvpCount: 0 };

    const partner = pendingPlayers.find(
      (p) => p.teamName.toLowerCase().trim() === newPlayer.teamName.toLowerCase().trim()
    );

    if (partner) {
      const teamId = Math.random().toString(36).substr(2, 9);
      const newTeam: Team = {
        id: teamId,
        name: newPlayer.teamName,
        players: [partner, newPlayer],
        level: 'Intermedio',
        rank: `#${teams.length + 1}`,
        stats: {
          mp: 0, w: 0, l: 0, sw: 0, sl: 0, pts: 0, mvps: 0, form: [],
        },
      };

      try {
        await setDoc(doc(db, 'teams', teamId), newTeam);
        await deleteDoc(doc(db, 'pendingPlayers', partner.id));
      } catch (error) {
        handleFirestoreError(error, OperationType.WRITE, 'teams/pendingPlayers');
      }
      return true;
    } else {
      try {
        await setDoc(doc(db, 'pendingPlayers', id), newPlayer);
      } catch (error) {
        handleFirestoreError(error, OperationType.WRITE, 'pendingPlayers');
      }
      return false;
    }
  };

  const removeTeam = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'teams', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `teams/${id}`);
    }
  };

  const removePendingPlayer = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'pendingPlayers', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `pendingPlayers/${id}`);
    }
  };

  const registerReplacement = async (replacementData: Omit<Replacement, 'id'>) => {
    if (replacements.length >= 3) {
      alert('Máximo 3 jugadores de reemplazo permitidos.');
      return;
    }
    const id = Math.random().toString(36).substr(2, 9);
    try {
      await setDoc(doc(db, 'replacements', id), { ...replacementData, id });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'replacements');
    }
  };

  const removeReplacement = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'replacements', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `replacements/${id}`);
    }
  };

  const generateSchedule = async () => {
    if (teams.length < 6 || teams.length > 8) {
      alert('El sorteo requiere entre 6 y 8 parejas.');
      return;
    }

    const shuffledTeams = [...teams].sort(() => Math.random() - 0.5);
    const numTeams = shuffledTeams.length;
    const rounds = numTeams % 2 === 0 ? numTeams - 1 : numTeams;
    
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
          const id = Math.random().toString(36).substr(2, 9);
          try {
            await setDoc(doc(db, 'schedule', id), {
              id, round: r + 1, date, team1: t1, team2: t2, status: 'pending'
            });
          } catch (error) {
            handleFirestoreError(error, OperationType.WRITE, 'schedule');
          }
        }
      }
      teamsList.splice(1, 0, teamsList.pop()!);
    }
    alert('¡Sorteo generado con éxito!');
  };

  const updateMatchResult = async (matchId: string, score1: number, score2: number, mvpPlayerId: string, setScores?: Match['setScores']) => {
    const matchRef = doc(db, 'schedule', matchId);
    let matchSnap;
    try {
      matchSnap = await getDoc(matchRef);
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, `schedule/${matchId}`);
      return;
    }
    if (!matchSnap.exists()) return;
    
    const match = matchSnap.data() as Match;
    try {
      await updateDoc(matchRef, { score1, score2, mvpPlayerId, setScores, status: 'finished' });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `schedule/${matchId}`);
    }

    // Update teams
    const updateTeam = async (teamId: string, isTeam1: boolean) => {
      const teamRef = doc(db, 'teams', teamId);
      let teamSnap;
      try {
        teamSnap = await getDoc(teamRef);
      } catch (error) {
        handleFirestoreError(error, OperationType.GET, `teams/${teamId}`);
        return;
      }
      if (!teamSnap.exists()) return;
      
      const team = teamSnap.data() as Team;
      const teamScore = isTeam1 ? score1 : score2;
      const opponentScore = isTeam1 ? score2 : score1;
      const won = teamScore > opponentScore;
      const isMvpInThisTeam = team.players.some(p => p.id === mvpPlayerId);

      try {
        await updateDoc(teamRef, {
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
        });
      } catch (error) {
        handleFirestoreError(error, OperationType.UPDATE, `teams/${teamId}`);
      }
    };

    await updateTeam(match.team1.id, true);
    await updateTeam(match.team2.id, false);
  };

  const seedTestData = async () => {
    const testTeams = [
      { name: 'Los Galácticos', players: ['Juan Pérez', 'Carlos Ruiz'] },
      { name: 'Padel Masters', players: ['Roberto Gómez', 'Luis Torres'] },
      { name: 'Titanes del Drive', players: ['Andrés Silva', 'Mario Casas'] },
      { name: 'Reyes del Smash', players: ['Diego Luna', 'Fernando Soler'] },
      { name: 'Muro Infranqueable', players: ['Santi Ramos', 'Hugo Boss'] },
      { name: 'Volea Mortal', players: ['Alex Pina', 'Oscar Jaenada'] }
    ];

    for (const [idx, t] of testTeams.entries()) {
      const teamId = Math.random().toString(36).substr(2, 9);
      const newTeam: Team = {
        id: teamId,
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
          mp: 0, w: 0, l: 0, sw: 0, sl: 0, pts: 0, mvps: 0, form: [],
        }
      };
      try {
        await setDoc(doc(db, 'teams', teamId), newTeam);
      } catch (error) {
        handleFirestoreError(error, OperationType.WRITE, 'teams');
      }
    }
    alert('6 equipos de prueba generados con éxito.');
  };

  const addNews = async (newsData: Omit<News, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    try {
      await setDoc(doc(db, 'news', id), { ...newsData, id });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'news');
    }
  };

  const removeNews = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'news', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `news/${id}`);
    }
  };

  const updateGroupPhoto = async (url: string) => {
    try {
      await setDoc(doc(db, 'settings', 'global'), { groupPhotoUrl: url });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'settings/global');
    }
  };

  return (
    <LeagueContext.Provider value={{ 
      pendingPlayers, teams, replacements, schedule, news, groupPhotoUrl,
      registerPlayer, removeTeam, removePendingPlayer,
      registerReplacement, removeReplacement,
      generateSchedule, updateMatchResult, seedTestData,
      addNews, removeNews, updateGroupPhoto
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
