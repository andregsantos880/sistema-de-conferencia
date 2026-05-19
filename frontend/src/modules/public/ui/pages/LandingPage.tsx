import { Link } from 'react-router-dom';
import { Button } from '@/shadcn/components/ui/button';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900">
      <header className="border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="text-xl font-bold tracking-tight">SisConf</Link>
          <nav className="flex items-center gap-3">
            <Link to="/precos" className="text-sm font-medium text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100">
              Planos
            </Link>
            <Link to="/login">
              <Button variant="ghost" size="sm">Entrar</Button>
            </Link>
            <Link to="/cadastro">
              <Button size="sm">Começar trial</Button>
            </Link>
          </nav>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-20">
        <section className="text-center">
          <h1 className="text-5xl font-bold tracking-tight text-slate-900 dark:text-slate-100 mb-6">
            Conferência de móveis planejados<br />que não trava sob bipagem.
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto mb-10">
            Receba arquivos de qualquer fabricante, organize por box e mande o operador bipar.
            Áudio do destino, fila offline e zero perda de dados — mesmo em pico de carga.
          </p>
          <div className="flex justify-center gap-3">
            <Link to="/cadastro">
              <Button size="lg">Testar grátis por 14 dias</Button>
            </Link>
            <Link to="/precos">
              <Button variant="outline" size="lg">Ver planos</Button>
            </Link>
          </div>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-24">
          {[
            { titulo: 'Bipagem assíncrona', desc: 'Fila local + SignalR. O operador continua bipando mesmo se a internet vacilar.' },
            { titulo: 'Status configuráveis', desc: 'Cada cliente define seu fluxo (cores, ordem, transições, áudio).' },
            { titulo: 'Importação multi-formato', desc: 'CSV padrão + parsers específicos dos principais fabricantes do mercado.' },
          ].map((f) => (
            <div key={f.titulo} className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur">
              <h3 className="text-lg font-semibold mb-2">{f.titulo}</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">{f.desc}</p>
            </div>
          ))}
        </section>
      </main>

      <footer className="border-t border-slate-200 dark:border-slate-800 mt-20">
        <div className="max-w-6xl mx-auto px-6 py-6 text-sm text-slate-500 dark:text-slate-400">
          © {new Date().getFullYear()} SisConf — Conferência SaaS para móveis planejados.
        </div>
      </footer>
    </div>
  );
}
