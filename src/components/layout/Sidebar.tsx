import { NavLink, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { 
  Users, 
  LogOut,
  History,
  LayoutDashboard,
  X
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Trabajadores', href: '/workers', icon: Users },
  { name: 'Auditoría', href: '/audit', icon: History },
];

interface SidebarProps {
  onClose?: () => void;
}

export function Sidebar({ onClose }: SidebarProps) {
  const location = useLocation();
  const { signOut, user } = useAuth();

  const handleNavClick = () => {
    if (onClose) onClose();
  };

  return (
    <div className="flex h-full w-64 flex-col bg-sidebar shadow-xl">
      {/* Logo */}
      <div className="flex h-16 items-center justify-between px-6 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/10 backdrop-blur-sm">
            <img src="/img/logo sin fondo.png" alt="logo" className="w-8 h-8 object-contain" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-sidebar-foreground">Tiunet</h1>
            <p className="text-xs text-sidebar-foreground/60">Trabajadores</p>
          </div>
        </div>
        
        {/* Close button for mobile */}
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="lg:hidden text-sidebar-foreground hover:bg-sidebar-accent"
        >
          <X className="h-5 w-5" />
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-4 overflow-y-auto">
        {navigation.map((item) => {
          const isActive = location.pathname.startsWith(item.href);
          return (
            <NavLink
              key={item.name}
              to={item.href}
              onClick={handleNavClick}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium transition-all duration-200 group',
                isActive
                  ? 'bg-sidebar-accent text-sidebar-primary shadow-sm scale-[1.02]'
                  : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground hover:scale-[1.01]'
              )}
            >
              <item.icon className={cn(
                'h-5 w-5 transition-transform duration-200',
                isActive && 'text-sidebar-primary',
                !isActive && 'group-hover:scale-110'
              )} />
              <span className="flex-1">{item.name}</span>
              {isActive && (
                <div className="w-1.5 h-1.5 rounded-full bg-sidebar-primary animate-pulse" />
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* User section */}
      <div className="border-t border-sidebar-border p-4 bg-sidebar-accent/30 backdrop-blur-sm">
        <div className="mb-3 flex items-center gap-3 p-2 rounded-lg bg-white/5 transition-all hover:bg-white/10">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-sidebar-primary to-sidebar-primary/70 text-sm font-semibold text-sidebar-primary-foreground shadow-lg ring-2 ring-sidebar-primary/20">
            {user?.email?.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="truncate text-sm font-medium text-sidebar-foreground">
              Administrador
            </p>
            <p className="truncate text-xs text-sidebar-foreground/60">
              {user?.email}
            </p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={signOut}
          className="w-full justify-start text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/50 transition-all duration-200 group"
        >
          <LogOut className="mr-2 h-4 w-4 transition-transform duration-200 group-hover:-translate-x-0.5" />
          Cerrar sesión
        </Button>
      </div>
    </div>
  );
}
