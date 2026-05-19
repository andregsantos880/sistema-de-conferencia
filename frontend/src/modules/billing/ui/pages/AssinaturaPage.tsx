import { useEffect, useState } from 'react';
import { api } from '@/shared/services/api';
import { Button } from '@/shadcn/components/ui/button';

type Assinatura = {
  id: string; planoCodigo: string; planoNome: string;
  precoMensalCentavos: number; limiteImportacoesMes: number;
  status: string; iniciadaEm: string; proximaCobrancaEm?: string | null;
  stripeSubscriptionId?: string | null;
};

type Uso = { anoMes: number; importacoesCount: number; limiteImportacoesMes: number };

type Plano = { id: string; nome: string; codigo: string; precoMensalCentavos: number; limiteImportacoesMes: number; ehIlimitado: boolean };

function brl(c: number) { return (c / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }); }

const STATUS_COR: Record<string, string> = {
  trialing: 'bg-blue-100 text-blue-800',
  active: 'bg-green-100 text-green-800',
  pastdue: 'bg-yellow-100 text-yellow-800',
  canceled: 'bg-red-100 text-red-800',
  incomplete: 'bg-slate-200 text-slate-800',
};

export default function AssinaturaPage() {
  const [assin, setAssin] = useState<Assinatura | null>(null);
  const [uso, setUso] = useState<Uso | null>(null);
  const [planos, setPlanos] = useState<Plano[]>([]);
  const [alterando, setAlterando] = useState(false);

  function carregar() {
    api.get<Assinatura>('/assinatura').then((r) => setAssin(r.data)).catch(() => setAssin(null));
    api.get<Uso>('/assinatura/uso').then((r) => setUso(r.data)).catch(() => setUso(null));
    api.get<Plano[]>('/public/planos').then((r) => setPlanos(r.data));
  }
  useEffect(carregar, []);

  async function alterarPlano(codigo: string) {
    if (!confirm(`Alterar para plano ${codigo}?`)) return;
    setAlterando(true);
    try {
      await api.post('/assinatura/alterar-plano', { planoCodigo: codigo });
      carregar();
    } finally { setAlterando(false); }
  }

  async function abrirPortal() {
    const r = await api.post<{ url: string }>('/billing/portal-session', {});
    window.location.href = r.data.url;
  }

  if (!assin) {
    return (
      <div className="p-6 max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">Assinatura</h1>
        <p className="text-slate-500">Carregando…</p>
      </div>
    );
  }

  const pct = uso && uso.limiteImportacoesMes > 0 ? (uso.importacoesCount / uso.limiteImportacoesMes) * 100 : 0;
  const limiteTexto = uso?.limiteImportacoesMes === -1 ? 'ilimitado' : String(uso?.limiteImportacoesMes ?? 0);

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Assinatura</h1>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 mb-6">
        <div className="flex items-start justify-between">
          <div>
            <div className="text-sm text-slate-500">Plano atual</div>
            <div className="text-2xl font-bold mt-1">{assin.planoNome}</div>
            <div className="text-lg text-slate-600 mt-1">{brl(assin.precoMensalCentavos)}/mês</div>
          </div>
          <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${STATUS_COR[assin.status] ?? ''}`}>
            {assin.status}
          </span>
        </div>
        <div className="mt-6 grid grid-cols-2 gap-4 text-sm">
          <div>
            <div className="text-slate-500">Iniciada em</div>
            <div className="font-medium">{new Date(assin.iniciadaEm).toLocaleDateString('pt-BR')}</div>
          </div>
          <div>
            <div className="text-slate-500">Próxima cobrança</div>
            <div className="font-medium">{assin.proximaCobrancaEm ? new Date(assin.proximaCobrancaEm).toLocaleDateString('pt-BR') : '—'}</div>
          </div>
        </div>
        <div className="mt-6 flex gap-2">
          <Button variant="outline" onClick={abrirPortal}>Gerenciar pagamento (Portal Stripe)</Button>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 mb-6">
        <h2 className="text-sm font-semibold mb-3">Uso do mês</h2>
        {uso && (
          <>
            <div className="flex justify-between text-sm mb-2">
              <span>Importações</span>
              <span><b>{uso.importacoesCount}</b> de {limiteTexto}</span>
            </div>
            {uso.limiteImportacoesMes > 0 && (
              <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div
                  className={`h-full ${pct >= 90 ? 'bg-red-500' : pct >= 70 ? 'bg-yellow-500' : 'bg-green-500'}`}
                  style={{ width: `${Math.min(100, pct)}%` }}
                />
              </div>
            )}
          </>
        )}
      </div>

      <h2 className="text-sm font-semibold mb-3 text-slate-600">Outros planos</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {planos.filter((p) => p.codigo !== assin.planoCodigo).map((p) => (
          <div key={p.id} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4">
            <div className="font-semibold">{p.nome}</div>
            <div className="text-lg font-bold mt-1">{brl(p.precoMensalCentavos)}<span className="text-sm font-normal text-slate-500">/mês</span></div>
            <div className="text-xs text-slate-500 mt-1">{p.ehIlimitado ? 'Importações ilimitadas' : `${p.limiteImportacoesMes} importações/mês`}</div>
            <Button size="sm" className="w-full mt-3" variant="outline"
              onClick={() => alterarPlano(p.codigo)} disabled={alterando}>
              Mudar para {p.nome}
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
