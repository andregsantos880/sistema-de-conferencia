import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/shadcn/components/ui/button';
import { api } from '@/shared/services/api';

type Plano = {
  id: string;
  nome: string;
  codigo: string;
  precoMensalCentavos: number;
  limiteImportacoesMes: number;
  ehIlimitado: boolean;
};

function brl(centavos: number) {
  return (centavos / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export default function PrecosPage() {
  const [planos, setPlanos] = useState<Plano[]>([]);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    api.get<Plano[]>('/public/planos')
      .then((r) => setPlanos(r.data))
      .catch(() => setErro('Falha ao carregar planos. Tente novamente.'));
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <header className="border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="text-xl font-bold">SisConf</Link>
          <Link to="/cadastro"><Button size="sm">Começar trial</Button></Link>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-16">
        <h1 className="text-4xl font-bold text-center mb-3">Planos</h1>
        <p className="text-center text-slate-600 dark:text-slate-400 mb-12">
          14 dias grátis em qualquer plano. Cancele quando quiser.
        </p>

        {erro && <div className="text-red-600 text-center mb-6">{erro}</div>}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {planos.map((p) => (
            <div key={p.id} className="p-8 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
              <h3 className="text-xl font-semibold">{p.nome}</h3>
              <div className="mt-4">
                <span className="text-4xl font-bold">{brl(p.precoMensalCentavos)}</span>
                <span className="text-slate-500">/mês</span>
              </div>
              <ul className="mt-6 space-y-2 text-sm">
                <li>{p.ehIlimitado ? 'Importações ilimitadas' : `${p.limiteImportacoesMes} importações por mês`}</li>
                <li>Usuários ilimitados</li>
                <li>Suporte por email</li>
              </ul>
              <Link to={`/cadastro?plano=${p.codigo}`} className="block mt-6">
                <Button className="w-full">Escolher {p.nome}</Button>
              </Link>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
