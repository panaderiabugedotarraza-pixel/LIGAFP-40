import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Calendar as CalendarIcon, 
  Users, 
  BarChart3, 
  Settings, 
  Bell, 
  Search,
  Plus
} from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const location = useLocation();

  const navItems = [
    { path: '/', label: 'Inicio', icon: LayoutDashboard },
    { path: '/calendar', label: 'Calendario', icon: CalendarIcon },
    { path: '/teams', label: 'Equipos', icon: Users },
    { path: '/standings', label: 'Posiciones', icon: BarChart3 },
    { path: '/admin', label: 'Admin', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-background text-on-surface flex">
      {/* Sidebar - Desktop */}
      <aside className="fixed left-0 top-0 h-full w-64 bg-surface border-r border-outline-variant/20 shadow-2xl z-40 hidden md:flex flex-col p-4">
        <div className="mb-10 px-4">
          <h1 className="text-xl font-extrabold text-primary tracking-tighter neon-glow-primary">Liga FP+40</h1>
          <p className="text-[10px] text-on-surface-variant font-medium tracking-widest uppercase">Pista Cinética</p>
        </div>
        
        <nav className="flex-1 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                  isActive 
                    ? 'bg-surface-highest text-secondary font-bold' 
                    : 'text-on-surface-variant hover:bg-surface-high hover:text-primary'
                }`}
              >
                <Icon size={20} />
                <span className="font-headline text-sm">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 md:ml-64 flex flex-col min-h-screen w-full overflow-x-hidden">
        {/* Topbar */}
        <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-md border-b border-outline-variant/10 px-4 md:px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4 overflow-hidden">
            <h2 className="text-xl md:text-2xl font-bold tracking-tighter text-primary truncate">
              {navItems.find(item => item.path === location.pathname)?.label || 'Liga FP+40'}
            </h2>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="hidden md:flex items-center bg-surface px-4 py-2 rounded-full border border-outline-variant/20">
              <Search size={16} className="text-on-surface-variant mr-2" />
              <input 
                type="text" 
                placeholder="Buscar jugador o equipo..." 
                className="bg-transparent border-none focus:ring-0 text-sm text-on-surface w-48 outline-none"
              />
            </div>
            
            <div className="flex items-center gap-4">
              <button className="text-primary hover:scale-110 transition-all relative">
                <Bell size={20} />
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-secondary rounded-full"></span>
              </button>
              <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-primary/20">
                <img 
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuCxZ90dz3u_nspsOx-WTqpJuidUTbDQlRqSjkeRZXCxPwURmwPaqUJF_zALekoFKU9Rdaq6RerilkVhfcFeJrZkta5YZqTaYmIAKBZWOaTD8oI9b66h2yKgXt78td51lzPepmGQ_Zr-pUMitu-UE5l4YG2Kl-balZ6MxERKWkTRQ9_3_BAk_XEZH8XledBdyefBYudmvMWqwyNLbM9mnmf0p6_UfRVhr-r6fLsZLRrgrYm5dRkUvXlqmzlSJCaIejkU1nPYadiioueu" 
                  alt="User profile"
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 md:p-6 pb-24 md:pb-6">
          {children}
        </main>

        {/* Bottom Nav - Mobile */}
        <nav className="md:hidden fixed bottom-0 left-0 w-full bg-surface border-t border-outline-variant/20 flex justify-around items-center py-3 z-50 shadow-[0_-10px_20px_rgba(0,0,0,0.5)]">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center gap-1 transition-all ${
                  isActive ? 'text-secondary' : 'text-on-surface-variant'
                }`}
              >
                <Icon size={24} />
                <span className="text-[10px] font-bold uppercase tracking-tighter">{item.label.substring(0, 4)}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
