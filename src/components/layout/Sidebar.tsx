import { NavLink, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Users, LogOut, History, LayoutDashboard, X } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Trabajadores", href: "/workers", icon: Users },
  { name: "Auditoría", href: "/audit", icon: History },
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
    <div className="flex h-full w-64 flex-col bg-[#222222] shadow-xl">
      {/* Logo */}
      <div className="flex h-16 items-center justify-between px-8 border-b border-[#333333]">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded bg-white">
            <img
              src="/img/logo sin fondo.png"
              alt="logo"
              className="w-6 h-6 object-contain"
            />
          </div>
          <span className="font-bold text-xl tracking-tight text-white">
            Infinet Tiuna
          </span>
        </div>

        {/* Close button for mobile */}
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="lg:hidden text-gray-400 hover:text-white hover:bg-[#333333]"
        >
          <X className="h-5 w-5" />
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-3 px-4 py-6 overflow-y-auto">
        {navigation.map((item) => {
          const isActive = location.pathname.startsWith(item.href);
          return (
            <NavLink
              key={item.name}
              to={item.href}
              onClick={handleNavClick}
              className={cn(
                "flex items-center gap-3 px-4 py-3 text-sm font-medium transition-all duration-300 ease-out rounded-md",
                isActive
                  ? "bg-green-600 text-white transform translate-x-2 shadow-lg"
                  : "text-gray-400 hover:bg-[#333333] hover:text-white hover:translate-x-1"
              )}
            >
              <item.icon className="h-5 w-5" />
              <span className="flex-1">{item.name}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* User section */}
      <div className="border-t border-[#333333] p-4">
        <div className="mb-3 flex items-center gap-3 p-2 rounded-lg">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 text-green-700 text-sm font-bold">
            {user?.email?.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="truncate text-sm font-medium text-white">
              Administrador
            </p>
            <p className="truncate text-xs text-gray-400">{user?.email}</p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={signOut}
          className="w-full justify-start text-gray-400 hover:bg-red-500 hover:text-white transition-all duration-200"
        >
          <LogOut className="mr-2 h-4 w-4" />
          Cerrar sesión
        </Button>
      </div>
    </div>
  );
}
