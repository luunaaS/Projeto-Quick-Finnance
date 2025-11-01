import { DollarSign, Menu, User, LogOut, Settings } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { Button } from "./ui/button";
import { Avatar, AvatarFallback } from "./ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

export function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="border-b bg-white shadow-sm" style={{ borderColor: '#6B7280' }}>
      <div className="flex h-16 items-center justify-between px-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" className="md:hidden">
            <Menu className="h-5 w-5" />
          </Button>
          <div 
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => navigate('/')}
          >
            <div 
              className="flex h-8 w-8 items-center justify-center rounded-lg"
              style={{ backgroundColor: '#1E3A8A' }}
            >
              <DollarSign className="h-5 w-5 text-white" />
            </div>
            <h1 className="text-xl font-bold" style={{ color: '#1E3A8A' }}>
              Quick Finnance
            </h1>
          </div>
        </div>
        
        <nav className="hidden md:flex items-center gap-2">
          <Button 
            variant="ghost" 
            className="hover:bg-blue-50"
            style={{ 
              color: isActive('/') ? '#1E3A8A' : '#6B7280',
              fontWeight: isActive('/') ? '600' : '400'
            }}
            onClick={() => navigate('/')}
          >
            Dashboard
          </Button>
          <Button 
            variant="ghost"
            className="hover:bg-blue-50"
            style={{ 
              color: isActive('/transactions') ? '#1E3A8A' : '#6B7280',
              fontWeight: isActive('/transactions') ? '600' : '400'
            }}
            onClick={() => navigate('/transactions')}
          >
            Transações
          </Button>
          <Button 
            variant="ghost"
            className="hover:bg-blue-50"
            style={{ 
              color: isActive('/financings') ? '#1E3A8A' : '#6B7280',
              fontWeight: isActive('/financings') ? '600' : '400'
            }}
            onClick={() => navigate('/financings')}
          >
            Financiamentos
          </Button>
          <Button 
            variant="ghost"
            className="hover:bg-blue-50"
            style={{ 
              color: isActive('/goals') ? '#1E3A8A' : '#6B7280',
              fontWeight: isActive('/goals') ? '600' : '400'
            }}
            onClick={() => navigate('/goals')}
          >
            Metas
          </Button>
          <Button 
            variant="ghost"
            className="hover:bg-blue-50"
            style={{ 
              color: isActive('/reports') ? '#1E3A8A' : '#6B7280',
              fontWeight: isActive('/reports') ? '600' : '400'
            }}
            onClick={() => navigate('/reports')}
          >
            Relatórios
          </Button>
        </nav>

        <div className="flex items-center gap-4">
          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-2 hover:bg-blue-50 rounded-md px-2 py-1 outline-none focus:ring-2 focus:ring-blue-500">
              <Avatar className="h-8 w-8">
                <AvatarFallback style={{ backgroundColor: '#1E3A8A', color: 'white' }}>
                  {user ? getInitials(user.name) : <User className="h-4 w-4" />}
                </AvatarFallback>
              </Avatar>
              <span className="hidden md:inline text-sm font-medium" style={{ color: '#1E3A8A' }}>
                {user?.name}
              </span>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium">{user?.name}</p>
                  <p className="text-xs text-gray-500">{user?.email}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate('/profile')} className="cursor-pointer">
                <Settings className="mr-2 h-4 w-4" />
                Perfil
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="text-red-600 cursor-pointer">
                <LogOut className="mr-2 h-4 w-4" />
                Sair
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
