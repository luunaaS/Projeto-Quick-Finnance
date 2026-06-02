import { DollarSign, Menu, User, HelpCircle, TrendingUp, Repeat, Globe } from "lucide-react";
import { Button } from "./ui/simple-button";

interface HeaderProps {
  currentPage: string;
  onNavigate: (page: string) => void;
}

export function Header({ currentPage, onNavigate }: HeaderProps) {
  return (
    <header className="border-b bg-white shadow-sm" style={{ borderColor: '#6B7280' }}>
      <div className="flex h-16 items-center justify-between px-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" className="md:hidden">
            <Menu className="h-5 w-5" />
          </Button>
          <button
            onClick={() => onNavigate('dashboard')}
            className="flex items-center gap-2 rounded-md px-1 py-1 hover:bg-blue-50 transition-colors"
            title="Ir para o Dashboard"
            aria-label="Ir para o Dashboard"
          >
            <div 
              className="flex h-8 w-8 items-center justify-center rounded-lg"
              style={{ backgroundColor: '#1E3A8A' }}
            >
              <DollarSign className="h-5 w-5 text-white" />
            </div>
            <h1 className="text-lg md:text-xl font-bold" style={{ color: '#1E3A8A' }}>
              QFin
            </h1>
          </button>
        </div>
        
        <nav className="hidden md:flex items-center gap-6">
          <Button 
            variant="ghost" 
            className="hover:bg-blue-50"
            style={{ color: currentPage === 'dashboard' ? '#1E3A8A' : '#6B7280' }}
            onClick={() => onNavigate('dashboard')}
          >
            Dashboard
          </Button>
          <Button 
            variant="ghost"
            className="hover:bg-blue-50"
            style={{ color: currentPage === 'transactions' ? '#1E3A8A' : '#6B7280' }}
            onClick={() => onNavigate('transactions')}
          >
            Transações
          </Button>
          <Button 
            variant="ghost"
            className="hover:bg-blue-50 flex items-center gap-2"
            style={{ color: currentPage === 'recurring' ? '#1E3A8A' : '#6B7280' }}
            onClick={() => onNavigate('recurring')}
          >
            <Repeat className="h-4 w-4" />
            Recorrentes
          </Button>
          <Button 
            variant="ghost"
            className="hover:bg-blue-50 flex items-center gap-2"
            style={{ color: currentPage === 'multicurrency' ? '#1E3A8A' : '#6B7280' }}
            onClick={() => onNavigate('multicurrency')}
          >
            <Globe className="h-4 w-4" />
            Multi-moeda
          </Button>
          <Button 
            variant="ghost"
            className="hover:bg-blue-50 flex items-center gap-2"
            style={{ color: currentPage === 'investments' ? '#1E3A8A' : '#6B7280' }}
            onClick={() => onNavigate('investments')}
          >
            <TrendingUp className="h-4 w-4" />
            Investimentos
          </Button>
          <Button 
            variant="ghost"
            className="hover:bg-blue-50"
            style={{ color: currentPage === 'financing' ? '#1E3A8A' : '#6B7280' }}
            onClick={() => onNavigate('financing')}
          >
            Financiamentos
          </Button>
          <Button 
            variant="ghost"
            className="hover:bg-blue-50"
            style={{ color: currentPage === 'reports' ? '#1E3A8A' : '#6B7280' }}
            onClick={() => onNavigate('reports')}
          >
            Relatórios
          </Button>
          <Button 
            variant="ghost"
            className="hover:bg-blue-50 flex items-center gap-2"
            style={{ color: currentPage === 'help' ? '#1E3A8A' : '#6B7280' }}
            onClick={() => onNavigate('help')}
          >
            <HelpCircle className="h-4 w-4" />
            Ajuda
          </Button>
        </nav>

        <div className="flex items-center gap-4">
          <button
            onClick={() => onNavigate('profile')}
            className="h-8 w-8 rounded-full flex items-center justify-center hover:opacity-90 transition-opacity"
            style={{ backgroundColor: '#1E3A8A', color: 'white' }}
            title="Perfil do usuário"
          >
            <User className="h-4 w-4" />
          </button>
        </div>
      </div>
    </header>
  );
}