import React, { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import Cropper from 'react-easy-crop';
import { useLeague } from '../context/LeagueContext';
import { 
  Users, 
  Trophy, 
  Activity, 
  Bell, 
  UserPlus, 
  CheckCircle2, 
  LayoutGrid, 
  ArrowRight,
  TrendingUp,
  Mail,
  Edit,
  Trash2,
  Plus,
  ChevronRight,
  X,
  User,
  Lock,
  Camera,
  Edit2,
  RefreshCw
} from 'lucide-react';

export default function Admin() {
  const { 
    teams, 
    pendingPlayers, 
    replacements,
    news,
    removeTeam, 
    removePendingPlayer, 
    registerPlayer,
    registerReplacement,
    removeReplacement,
    seedTestData,
    addNews,
    removeNews
  } = useLeague();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loginData, setLoginData] = useState({ username: '', password: '' });
  const [loginError, setLoginError] = useState('');

  const [showRegistration, setShowRegistration] = useState(false);
  const [regType, setRegType] = useState<'player' | 'replacement'>('player');
  const [newNewsText, setNewNewsText] = useState('');
  const [formData, setFormData] = useState({
    fullName: '',
    age: '',
    phone: '',
    teamName: '',
    position: 'Drive' as 'Revés' | 'Drive'
  });
  const [photo, setPhoto] = useState<string | null>(null);
  const [tempPhoto, setTempPhoto] = useState<string | null>(null);
  const [showCropper, setShowCropper] = useState(false);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const onCropComplete = useCallback((_croppedArea: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const createImage = (url: string): Promise<HTMLImageElement> =>
    new Promise((resolve, reject) => {
      const image = new Image();
      image.addEventListener('load', () => resolve(image));
      image.addEventListener('error', (error) => reject(error));
      image.setAttribute('crossOrigin', 'anonymous');
      image.src = url;
    });

  const getCroppedImg = async (imageSrc: string, pixelCrop: any): Promise<string | null> => {
    const image = await createImage(imageSrc);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) return null;

    canvas.width = pixelCrop.width;
    canvas.height = pixelCrop.height;

    ctx.drawImage(
      image,
      pixelCrop.x,
      pixelCrop.y,
      pixelCrop.width,
      pixelCrop.height,
      0,
      0,
      pixelCrop.width,
      pixelCrop.height
    );

    return canvas.toDataURL('image/jpeg');
  };

  const handleCropSave = async () => {
    try {
      if (tempPhoto && croppedAreaPixels) {
        const croppedImage = await getCroppedImg(tempPhoto, croppedAreaPixels);
        setPhoto(croppedImage);
        setShowCropper(false);
        setTempPhoto(null);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (loginData.username === 'admin' && loginData.password === 'liga40') {
      setIsAuthenticated(true);
      setLoginError('');
    } else {
      setLoginError('Credenciales incorrectas');
    }
  };

  const handlePhotoClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setTempPhoto(reader.result as string);
        setShowCropper(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (regType === 'player') {
      registerPlayer({ ...formData, photo });
      alert('Jugador registrado internamente con éxito.');
    } else {
      registerReplacement({ fullName: formData.fullName, phone: formData.phone, photo });
      alert('Jugador de reemplazo registrado con éxito.');
    }
    setFormData({ fullName: '', age: '', phone: '', teamName: '', position: 'Drive' });
    setPhoto(null);
    setShowRegistration(false);
  };

  const handleAddNews = (e: React.FormEvent) => {
    e.preventDefault();
    if (newNewsText.trim()) {
      addNews({ text: newNewsText, type: 'info' });
      setNewNewsText('');
    }
  };

  const metrics = [
    { label: 'Total de Jugadores', value: (teams.length * 2 + pendingPlayers.length).toString(), trend: 'En tiempo real', icon: Users, color: 'text-primary' },
    { label: 'Jugadores Pendientes', value: pendingPlayers.length.toString().padStart(2, '0'), trend: 'Esperando compañero', icon: Trophy, color: 'text-on-surface', border: 'border-l-4 border-secondary' },
    { label: 'Equipos Formados', value: teams.length.toString().padStart(2, '0'), trend: 'Listos para la liga', icon: Activity, color: 'text-on-surface', progress: teams.length > 0 ? (teams.length / 12) * 100 : 0 }
  ];

  const parches = [
    { name: 'Ricardo Mendoza', initial: 'RM', availability: 'Lunes a Jueves', status: 'Disponible', statusColor: 'bg-secondary/20 text-secondary' },
    { name: 'Javier Soto', initial: 'JS', availability: 'Fines de semana', status: 'Disponible', statusColor: 'bg-secondary/20 text-secondary' },
    { name: 'Andrés López', initial: 'AL', availability: 'Solo noches', status: 'En Partido', statusColor: 'bg-surface-highest text-on-surface-variant' }
  ];

  if (!isAuthenticated) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-surface p-8 rounded-2xl border border-outline-variant/20 w-full max-w-md shadow-2xl"
        >
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <Lock size={32} className="text-primary" />
          </div>
          <h2 className="text-2xl font-headline font-bold text-center mb-8">Acceso Administrativo</h2>
          
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-xs font-bold text-on-surface-variant mb-2 uppercase tracking-widest">Usuario</label>
              <input 
                type="text" 
                required
                value={loginData.username}
                onChange={(e) => setLoginData({...loginData, username: e.target.value})}
                className="w-full bg-background border border-outline-variant/20 rounded-lg p-4 text-on-surface outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                placeholder="admin"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-on-surface-variant mb-2 uppercase tracking-widest">Contraseña</label>
              <input 
                type="password" 
                required
                value={loginData.password}
                onChange={(e) => setLoginData({...loginData, password: e.target.value})}
                className="w-full bg-background border border-outline-variant/20 rounded-lg p-4 text-on-surface outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                placeholder="••••••••"
              />
            </div>
            {loginError && <p className="text-error-dim text-xs font-bold text-center">{loginError}</p>}
            <button 
              type="submit"
              className="w-full bg-primary text-on-primary font-bold py-4 rounded-xl hover:opacity-90 transition-all shadow-lg shadow-primary/20"
            >
              Iniciar Sesión
            </button>
          </form>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      {/* Header with Logout */}
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-headline font-black tracking-tighter">PANEL DE <span className="text-primary">CONTROL</span></h2>
        <button 
          onClick={() => setIsAuthenticated(false)}
          className="text-xs font-bold text-on-surface-variant hover:text-error-dim transition-colors uppercase tracking-widest"
        >
          Cerrar Sesión
        </button>
      </div>

      {/* Metrics Grid */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {metrics.map((m, i) => (
          <motion.div 
            key={m.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className={`bg-surface p-6 rounded-xl relative overflow-hidden group ${m.border || ''}`}
          >
            <div className="relative z-10">
              <p className="text-on-surface-variant text-sm font-semibold mb-1 font-headline">{m.label}</p>
              <h3 className={`text-5xl font-extrabold font-headline ${m.color}`}>{m.value}</h3>
              {m.trend && (
                <p className={`text-xs mt-2 flex items-center gap-1 ${m.color === 'text-primary' ? 'text-secondary' : 'text-on-surface-variant'}`}>
                  {m.color === 'text-primary' && <TrendingUp size={12} />} {m.trend}
                </p>
              )}
              {m.progress !== undefined && (
                <div className="w-full bg-surface-highest h-2 rounded-full mt-4 overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${m.progress}%` }}
                    transition={{ duration: 1, delay: 0.5 }}
                    className="bg-secondary h-full rounded-full"
                  ></motion.div>
                </div>
              )}
            </div>
            <m.icon className="absolute -right-4 -bottom-4 text-9xl text-white/5 group-hover:text-white/10 transition-colors" size={120} />
          </motion.div>
        ))}
      </section>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Teams and Parches */}
        <div className="lg:col-span-2 space-y-8">
          {/* Teams List */}
          <section className="bg-surface rounded-xl overflow-hidden shadow-xl">
            <div className="p-6 flex justify-between items-center bg-surface-high">
              <h4 className="font-headline font-bold text-xl">Equipos Activos ({teams.length} parejas)</h4>
              <p className="text-xs text-on-surface-variant italic">Gestión interna activa</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-6">
              {teams.length === 0 ? (
                <div className="col-span-2 py-12 text-center border-2 border-dashed border-outline-variant/20 rounded-xl">
                  <p className="text-on-surface-variant">No hay equipos formados todavía.</p>
                </div>
              ) : (
                teams.map((team) => (
                  <motion.div 
                    key={team.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    whileHover={{ scale: 1.02 }}
                    className="bg-surface-highest p-4 rounded-lg flex items-center gap-4 group transition-all"
                  >
                    <div className="flex -space-x-3">
                      {team.players.map((player, i) => (
                        <div key={i} className="w-10 h-10 rounded-full border-2 border-surface-highest overflow-hidden bg-background">
                          {player.photo ? (
                            <img src={player.photo} alt={player.fullName} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-primary/20 text-primary">
                              <User size={16} />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                    <div className="flex-1">
                      <p className="font-headline font-bold text-on-surface leading-none">{team.name}</p>
                      <p className="text-[10px] text-on-surface-variant mt-1 uppercase tracking-tighter">
                        {team.players[0].fullName.split(' ')[0]} & {team.players[1].fullName.split(' ')[0]}
                      </p>
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => removeTeam(team.id)}
                        className="p-2 hover:bg-error-dim/20 rounded-lg text-error-dim"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </section>

          {/* News Management */}
          <section className="bg-surface rounded-xl overflow-hidden shadow-xl">
            <div className="p-6 bg-surface-high flex justify-between items-center">
              <h4 className="font-headline font-bold text-xl">Gestión de Noticias / Banner</h4>
              <Bell size={20} className="text-primary" />
            </div>
            <div className="p-6 space-y-6">
              <form onSubmit={handleAddNews} className="flex gap-3">
                <input 
                  type="text" 
                  value={newNewsText}
                  onChange={(e) => setNewNewsText(e.target.value)}
                  placeholder="Escribe una noticia importante..."
                  className="flex-1 bg-background border border-outline-variant/20 rounded-lg p-3 text-sm text-on-surface outline-none focus:ring-1 focus:ring-primary"
                />
                <button 
                  type="submit"
                  className="bg-primary text-on-primary px-6 py-3 rounded-lg font-bold text-xs uppercase tracking-widest hover:opacity-90 transition-all"
                >
                  Publicar
                </button>
              </form>

              <div className="space-y-3">
                {news.length === 0 ? (
                  <p className="text-center py-8 text-on-surface-variant italic text-sm">No hay noticias publicadas.</p>
                ) : (
                  news.map((n) => (
                    <div key={n.id} className="flex items-center justify-between p-4 bg-surface-highest rounded-lg group">
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                        <p className="text-sm text-on-surface">{n.text}</p>
                      </div>
                      <button 
                        onClick={() => removeNews(n.id)}
                        className="p-2 text-on-surface-variant hover:text-error-dim transition-colors opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </section>

          {/* Pending Players List */}
          <section className="bg-surface rounded-xl overflow-hidden shadow-xl">
            <div className="p-6 bg-surface-high flex justify-between items-center">
              <h4 className="font-headline font-bold text-xl">Jugadores Esperando Compañero</h4>
              <span className="bg-secondary/20 text-secondary text-[10px] font-bold px-2 py-1 rounded-full uppercase">Pendientes</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="text-xs text-on-surface-variant uppercase font-headline border-b border-outline-variant/20">
                  <tr>
                    <th className="px-6 py-4">Jugador</th>
                    <th className="px-6 py-4">Equipo Solicitado</th>
                    <th className="px-6 py-4">Estado</th>
                    <th className="px-6 py-4 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/10">
                  {pendingPlayers.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-12 text-center text-on-surface-variant italic">
                        No hay registros individuales pendientes.
                      </td>
                    </tr>
                  ) : (
                    pendingPlayers.map((p) => (
                      <tr key={p.id} className="hover:bg-surface-highest/50 transition-colors group">
                        <td className="px-6 py-4 flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-xs">
                            {p.fullName.charAt(0)}
                          </div>
                          <span className="font-medium">{p.fullName}</span>
                        </td>
                        <td className="px-6 py-4 text-sm font-bold text-primary">{p.teamName}</td>
                        <td className="px-6 py-4">
                          <span className="px-2 py-1 text-[10px] font-bold rounded-full uppercase tracking-tighter bg-surface-highest text-on-surface-variant">
                            Esperando Socio
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button 
                              onClick={() => removePendingPlayer(p.id)}
                              className="p-2 hover:bg-error-dim/20 rounded-lg text-error-dim transition-colors"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>

          {/* Replacement Players List */}
          <section className="bg-surface rounded-xl overflow-hidden shadow-xl">
            <div className="p-6 bg-surface-high flex justify-between items-center">
              <h4 className="font-headline font-bold text-xl">Jugadores de Reemplazo ({replacements.length}/3)</h4>
              <button 
                onClick={() => { setRegType('replacement'); setShowRegistration(true); }}
                className="bg-primary text-on-primary text-xs font-bold px-4 py-2 rounded-lg flex items-center gap-2 hover:opacity-90 transition-all font-headline"
              >
                <UserPlus size={16} />
                Agregar Reemplazo
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="text-xs text-on-surface-variant uppercase font-headline border-b border-outline-variant/20">
                  <tr>
                    <th className="px-6 py-4">Jugador</th>
                    <th className="px-6 py-4">Teléfono</th>
                    <th className="px-6 py-4 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/10">
                  {replacements.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="px-6 py-12 text-center text-on-surface-variant italic">
                        No hay jugadores de reemplazo registrados.
                      </td>
                    </tr>
                  ) : (
                    replacements.map((r) => (
                      <tr key={r.id} className="hover:bg-surface-highest/50 transition-colors group">
                        <td className="px-6 py-4 flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full overflow-hidden bg-surface-highest">
                            {r.photo ? (
                              <img src={r.photo} alt={r.fullName} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center font-bold text-xs text-on-surface-variant">
                                {r.fullName.charAt(0)}
                              </div>
                            )}
                          </div>
                          <span className="font-medium">{r.fullName}</span>
                        </td>
                        <td className="px-6 py-4 text-sm text-on-surface-variant">{r.phone}</td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button 
                              onClick={() => removeReplacement(r.id)}
                              className="p-2 hover:bg-error-dim/20 rounded-lg text-error-dim transition-colors"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </div>

        {/* Right: Registration Form */}
        <aside className="space-y-6">
          <div className="bg-surface p-6 rounded-xl border border-outline-variant/10 shadow-xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-secondary/10 rounded-lg text-secondary">
                <UserPlus size={20} />
              </div>
              <h4 className="font-headline font-bold text-xl">Registro Interno</h4>
            </div>

            <div className="flex gap-2 mb-6">
              <button 
                onClick={() => setRegType('player')}
                className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${regType === 'player' ? 'bg-primary text-on-primary' : 'bg-surface-high text-on-surface-variant'}`}
              >
                Jugador Liga
              </button>
              <button 
                onClick={() => setRegType('replacement')}
                className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${regType === 'replacement' ? 'bg-secondary text-on-secondary' : 'bg-surface-high text-on-surface-variant'}`}
              >
                Reemplazo
              </button>
            </div>
            
            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              <div className="flex justify-center mb-4">
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileChange} 
                  className="hidden" 
                  accept="image/*"
                />
                <div 
                  onClick={handlePhotoClick}
                  className="relative cursor-pointer group"
                >
                  <div className="w-20 h-20 rounded-xl bg-surface-highest flex items-center justify-center border border-dashed border-outline-variant group-hover:border-primary transition-all overflow-hidden">
                    {photo ? (
                      <img src={photo} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <Camera size={24} className="text-on-surface-variant" />
                    )}
                  </div>
                  <div className="absolute -bottom-1 -right-1 bg-primary text-on-primary p-1 rounded-md shadow-lg">
                    <Plus size={12} />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-on-surface-variant mb-1 uppercase tracking-widest">Nombre Completo</label>
                <input 
                  type="text" 
                  required
                  value={formData.fullName}
                  onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                  className="w-full bg-background border border-outline-variant/20 rounded-lg p-3 text-sm text-on-surface outline-none focus:ring-1 focus:ring-primary"
                  placeholder="Nombre del jugador"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                {regType === 'player' && (
                  <div>
                    <label className="block text-[10px] font-bold text-on-surface-variant mb-1 uppercase tracking-widest">Edad</label>
                    <input 
                      type="number" 
                      required
                      value={formData.age}
                      onChange={(e) => setFormData({...formData, age: e.target.value})}
                      className="w-full bg-background border border-outline-variant/20 rounded-lg p-3 text-sm text-on-surface outline-none focus:ring-1 focus:ring-primary"
                      placeholder="40"
                    />
                  </div>
                )}
                <div className={regType === 'player' ? '' : 'col-span-2'}>
                  <label className="block text-[10px] font-bold text-on-surface-variant mb-1 uppercase tracking-widest">Teléfono</label>
                  <input 
                    type="tel" 
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    className="w-full bg-background border border-outline-variant/20 rounded-lg p-3 text-sm text-on-surface outline-none focus:ring-1 focus:ring-primary"
                    placeholder="+34..."
                  />
                </div>
              </div>
              {regType === 'player' && (
                <div>
                  <label className="block text-[10px] font-bold text-on-surface-variant mb-1 uppercase tracking-widest">Nombre del Equipo</label>
                  <input 
                    type="text" 
                    required
                    value={formData.teamName}
                    onChange={(e) => setFormData({...formData, teamName: e.target.value})}
                    className="w-full bg-background border border-outline-variant/20 rounded-lg p-3 text-sm text-on-surface outline-none focus:ring-1 focus:ring-primary"
                    placeholder="Nombre del equipo"
                  />
                </div>
              )}
              {regType === 'player' && (
                <div>
                  <label className="block text-[10px] font-bold text-on-surface-variant mb-1 uppercase tracking-widest">Posición (Perfil Técnico)</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setFormData({...formData, position: 'Drive'})}
                      className={`py-2 rounded-lg text-xs font-bold transition-all ${formData.position === 'Drive' ? 'bg-primary text-background' : 'bg-surface-highest text-on-surface-variant hover:bg-surface-high'}`}
                    >
                      Drive
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({...formData, position: 'Revés'})}
                      className={`py-2 rounded-lg text-xs font-bold transition-all ${formData.position === 'Revés' ? 'bg-primary text-background' : 'bg-surface-highest text-on-surface-variant hover:bg-surface-high'}`}
                    >
                      Revés
                    </button>
                  </div>
                </div>
              )}
              <button 
                type="submit"
                className="w-full bg-secondary text-on-secondary font-bold py-3 rounded-lg hover:opacity-90 transition-all flex items-center justify-center gap-2 mt-4"
              >
                Registrar Jugador <ArrowRight size={16} />
              </button>
            </form>
          </div>

          <div className="bg-surface p-6 rounded-xl border border-outline-variant/10 shadow-xl">
            <h4 className="font-headline font-bold text-lg mb-4">Pruebas de Sistema</h4>
            <button 
              onClick={seedTestData}
              className="w-full py-3 bg-surface-highest text-on-surface-variant font-bold rounded-lg hover:bg-primary/10 hover:text-primary transition-all flex items-center justify-center gap-2 text-xs uppercase tracking-widest"
            >
              <RefreshCw size={16} />
              Generar 6 Equipos Random
            </button>
            <p className="text-[10px] text-on-surface-variant mt-3 leading-relaxed italic">
              * Esto borrará los equipos actuales y generará 6 parejas ficticias con fotos para probar el sorteo y la tabla.
            </p>
          </div>

          <div className="bg-surface p-6 rounded-xl border border-outline-variant/10 shadow-xl">
            <h4 className="font-headline font-bold text-lg mb-4">Ayuda de Gestión</h4>
            <p className="text-xs text-on-surface-variant leading-relaxed">
              Los equipos se forman automáticamente cuando dos jugadores se registran con el mismo nombre de equipo. 
              Asegúrate de escribir el nombre del equipo exactamente igual para ambos jugadores.
            </p>
          </div>
        </aside>
      </div>

      {/* Floating Action Button */}
      <div className="fixed bottom-8 right-8 z-50">
        <button 
          onClick={() => setShowRegistration(true)}
          className="bg-secondary text-on-secondary h-16 w-16 rounded-full shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all"
        >
          <Plus size={32} strokeWidth={3} />
        </button>
      </div>

      {/* Registration Modal (Optional shortcut) */}
      <AnimatePresence>
        {showRegistration && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowRegistration(false)}
              className="absolute inset-0 bg-background/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-surface w-full max-w-lg rounded-2xl shadow-2xl border border-outline-variant/20 relative z-10 overflow-hidden"
            >
              <div className="p-6 border-b border-outline-variant/10 flex justify-between items-center bg-surface-high">
                <h3 className="text-xl font-headline font-bold">Nuevo Registro Interno</h3>
                <button onClick={() => setShowRegistration(false)} className="text-on-surface-variant hover:text-on-surface">
                  <X size={24} />
                </button>
              </div>
              <div className="p-8">
                <p className="text-on-surface-variant text-sm mb-6">Completa la ficha técnica del jugador para el registro oficial de la liga.</p>
                <form onSubmit={handleRegisterSubmit} className="space-y-6">
                  <div className="flex justify-center mb-6">
                    <div 
                      onClick={handlePhotoClick}
                      className="relative cursor-pointer group"
                    >
                      <div className="w-24 h-24 rounded-2xl bg-surface-highest flex items-center justify-center border-2 border-dashed border-outline-variant group-hover:border-primary transition-all overflow-hidden shadow-inner">
                        {photo ? (
                          <img src={photo} alt="Preview" className="w-full h-full object-cover" />
                        ) : (
                          <Camera size={32} className="text-on-surface-variant" />
                        )}
                      </div>
                      <div className="absolute -bottom-2 -right-2 bg-primary text-on-primary p-2 rounded-lg shadow-lg">
                        <Plus size={16} />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-on-surface-variant mb-2 uppercase tracking-widest">Nombre Completo</label>
                      <input 
                        type="text" 
                        required
                        value={formData.fullName}
                        onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                        className="w-full bg-background border border-outline-variant/20 rounded-xl p-4 text-on-surface outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                        placeholder="Ej. Ricardo Montenegro"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-on-surface-variant mb-2 uppercase tracking-widest">Edad</label>
                        <input 
                          type="number" 
                          required
                          value={formData.age}
                          onChange={(e) => setFormData({...formData, age: e.target.value})}
                          className="w-full bg-background border border-outline-variant/20 rounded-xl p-4 text-on-surface outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                          placeholder="40"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-on-surface-variant mb-2 uppercase tracking-widest">Teléfono</label>
                        <input 
                          type="tel" 
                          required
                          value={formData.phone}
                          onChange={(e) => setFormData({...formData, phone: e.target.value})}
                          className="w-full bg-background border border-outline-variant/20 rounded-xl p-4 text-on-surface outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                          placeholder="+34..."
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-on-surface-variant mb-2 uppercase tracking-widest">Nombre del Equipo</label>
                      <input 
                        type="text" 
                        required
                        value={formData.teamName}
                        onChange={(e) => setFormData({...formData, teamName: e.target.value})}
                        className="w-full bg-background border border-outline-variant/20 rounded-xl p-4 text-on-surface outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                        placeholder="Nombre del equipo"
                      />
                    </div>
                  </div>

                  <button 
                    type="submit"
                    className="w-full bg-secondary text-on-secondary font-headline font-black text-lg py-5 rounded-xl shadow-lg shadow-secondary/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 mt-4"
                  >
                    Confirmar Registro <ArrowRight size={20} />
                  </button>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Image Cropper Modal */}
      <AnimatePresence>
        {showCropper && tempPhoto && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-background/95 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-surface w-full max-w-2xl rounded-3xl shadow-2xl border border-outline-variant/20 relative z-10 overflow-hidden flex flex-col h-[80vh]"
            >
              <div className="p-6 border-b border-outline-variant/10 flex justify-between items-center bg-surface-high">
                <div>
                  <h3 className="text-xl font-headline font-bold">Ajustar Fotografía</h3>
                  <p className="text-xs text-on-surface-variant mt-1 uppercase tracking-widest font-bold">Mueve y escala para centrar al jugador</p>
                </div>
                <button 
                  onClick={() => { setShowCropper(false); setTempPhoto(null); }}
                  className="p-2 hover:bg-surface-highest rounded-full transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="flex-1 relative bg-black/20">
                <Cropper
                  image={tempPhoto}
                  crop={crop}
                  zoom={zoom}
                  aspect={1}
                  onCropChange={setCrop}
                  onCropComplete={onCropComplete}
                  onZoomChange={setZoom}
                  cropShape="round"
                  showGrid={false}
                />
              </div>

              <div className="p-8 bg-surface-high space-y-6">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-on-surface-variant uppercase tracking-widest">Zoom</span>
                    <span className="text-xs font-black text-primary">{Math.round(zoom * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    value={zoom}
                    min={1}
                    max={3}
                    step={0.1}
                    aria-labelledby="Zoom"
                    onChange={(e) => setZoom(Number(e.target.value))}
                    className="w-full h-2 bg-background rounded-lg appearance-none cursor-pointer accent-primary"
                  />
                </div>

                <div className="flex gap-4">
                  <button
                    onClick={() => { setShowCropper(false); setTempPhoto(null); }}
                    className="flex-1 py-4 rounded-xl font-bold text-on-surface-variant hover:bg-surface-highest transition-all border border-outline-variant/10"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleCropSave}
                    className="flex-1 py-4 rounded-xl font-headline font-black bg-primary text-on-primary shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                  >
                    <CheckCircle2 size={20} />
                    Guardar Ajuste
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
