import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '@/modules/auth/infrastructure/useAuth';
import { useTheme } from '@/app/providers/useTheme';
import { Button } from '@/shadcn/components/ui/button';

const navItems: { path: string; label: string; permissao?: string }[] = [
  { path: '/app/conferencia', label: 'Conferência', permissao: 'pedidos.conferir' },
  { path: '/app/pedidos', label: 'Pedidos', permissao: 'pedidos.visualizar' },
  { path: '/app/importacoes', label: 'Importações', permissao: 'importacao.visualizar' },
  { path: '/app/historico', label: 'Histórico', permissao: 'historico.visualizar' },
  { path: '/app/relatorios', label: 'Relatórios', permissao: 'relatorios.gerar' },
  { path: '/app/status', label: 'Status', permissao: 'status.gerenciar' },
  { path: '/app/boxes', label: 'Boxes', permissao: 'boxes.gerenciar' },
  { path: '/app/layouts', label: 'Layouts', permissao: 'layouts.gerenciar' },
  { path: '/app/usuarios', label: 'Usuários', permissao: 'usuarios.visualizar' },
  { path: '/app/roles', label: 'Roles', permissao: 'roles.gerenciar' },
  { path: '/app/grupos', label: 'Grupos', permissao: 'grupos.gerenciar' },
  { path: '/app/assinatura', label: 'Assinatura', permissao: 'faturas.visualizar' },
  { path: '/app/faturas', label: 'Faturas', permissao: 'faturas.visualizar' },
];

export default function AppLayout() {
  const { usuario, logout, temPermissao } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  function sair() {
    logout();
    navigate('/login', { replace: true });
  }

  const ehDark = theme === 'dark' || (theme === 'system' && typeof window !== 'undefined' && window.matchMedia?.('(prefers-color-scheme: dark)').matches);

  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-slate-950">
      <aside className="w-60 shrink-0 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col">
        <div className="p-6 border-b border-slate-200 dark:border-slate-800">
          <div className="text-xl font-bold">SisConf</div>
          {usuario && <div className="text-xs text-slate-500 mt-1 truncate">{usuario.email}</div>}
        </div>
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {navItems
            .filter((i) => !i.permissao || temPermissao(i.permissao))
            .map((i) => (
              <NavLink
                key={i.path}
                to={i.path}
                className={({ isActive }) =>
                  `block px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                  }`
                }
              >
                {i.label}
              </NavLink>
            ))}
        </nav>
        <div className="p-3 border-t border-slate-200 dark:border-slate-800 space-y-2">
          <Button variant="ghost" size="sm" className="w-full justify-start" onClick={(e) => toggleTheme(e.nativeEvent)}>
            <span className="mr-2">{ehDark ? '🌙' : '☀️'}</span>
            {ehDark ? 'Tema escuro' : 'Tema claro'}
          </Button>
          <Button variant="outline" size="sm" className="w-full" onClick={sair}>Sair</Button>
        </div>
      </aside>

      <main className="flex-1 min-w-0 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}
