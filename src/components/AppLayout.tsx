import { Outlet, Navigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Home, HeartPulse, Phone, User } from 'lucide-react';

const navItems = [
  { icon: Home, label: 'Início', path: '/dashboard' },
  { icon: HeartPulse, label: 'Saúde', path: '/health' },
  { icon: Phone, label: 'Contatos', path: '/contacts' },
  { icon: User, label: 'Perfil', path: '/profile' },
];

export default function AppLayout() {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  return (
    <div className="min-h-screen pb-24">
      <main className="max-w-lg mx-auto px-4 pt-8">
        <Outlet />
      </main>

      <nav className="fixed bottom-0 inset-x-0 glass border-t z-50 safe-bottom">
        <div className="max-w-lg mx-auto flex justify-around py-2 pt-2">
          {navItems.map((item) => {
            const active = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl text-[11px] font-medium transition-colors ${
                  active ? 'text-primary' : 'text-muted-foreground'
                }`}
              >
                <item.icon className={`h-[22px] w-[22px] ${active ? 'stroke-[2.5]' : 'stroke-[1.8]'}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
