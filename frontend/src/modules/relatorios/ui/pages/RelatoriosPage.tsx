import { useEffect, useState } from 'react';
import { api } from '@/shared/services/api';
import { authStore } from '@/modules/auth/infrastructure/authStore';
import { Button } from '@/shadcn/components/ui/button';
import { Input } from '@/shadcn/components/ui/input';

type Job = {
  id: string; tipo: string; status: string; mensagemErro?: string | null;
  criadoEm: string; iniciadoEm?: string | null; finalizadoEm?: string | null;
  temDownload: boolean;
};

const STATUS_COR: Record<string, string> = {
  pendente: 'bg-slate-200 text-slate-800',
  processando: 'bg-blue-100 text-blue-800',
  concluido: 'bg-green-100 text-green-800',
  erro: 'bg-red-100 text-red-800',
};

export default function RelatoriosPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [de, setDe] = useState('');
  const [ate, setAte] = useState('');
  const [gerando, setGerando] = useState(false);

  function carregar() {
    api.get<{ itens: Job[] }>('/relatorios').then((r) => setJobs(r.data.itens));
  }
  useEffect(() => {
    carregar();
    const t = setInterval(carregar, 3000); // polling enquanto não temos SignalR aqui
    return () => clearInterval(t);
  }, []);

  async function gerar() {
    setGerando(true);
    const parametros: Record<string, string> = {};
    if (de) parametros.de = new Date(de).toISOString();
    if (ate) parametros.ate = new Date(ate + 'T23:59:59').toISOString();
    await api.post('/relatorios/resumido/gerar', { parametros });
    carregar();
    setGerando(false);
  }

  async function download(id: string) {
    const token = authStore.getAccessToken();
    const resp = await fetch(`/api/relatorios/${id}/download`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!resp.ok) { alert('Relatório ainda não pronto.'); return; }
    const blob = await resp.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `relatorio_${id.slice(0, 8)}.pdf`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Relatórios</h1>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 mb-6">
        <h2 className="text-sm font-semibold mb-3">Gerar relatório resumido</h2>
        <p className="text-sm text-slate-500 mb-4">PDF com contagem de pedidos por status no período.</p>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
          <div>
            <label className="block text-sm mb-1">Data inicial</label>
            <Input type="date" value={de} onChange={(e) => setDe(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm mb-1">Data final</label>
            <Input type="date" value={ate} onChange={(e) => setAte(e.target.value)} />
          </div>
          <Button onClick={gerar} disabled={gerando} className="md:col-span-2">
            {gerando ? 'Enviando…' : 'Gerar PDF'}
          </Button>
        </div>
      </div>

      <h2 className="text-sm font-semibold mb-3 text-slate-600 dark:text-slate-400">Histórico</h2>
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 dark:bg-slate-800/50 text-left">
            <tr>
              <th className="px-4 py-3 font-semibold">Tipo</th>
              <th className="px-4 py-3 font-semibold">Status</th>
              <th className="px-4 py-3 font-semibold">Criado</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {jobs.length === 0 && <tr><td colSpan={4} className="text-center py-8 text-slate-500">Nenhum relatório ainda.</td></tr>}
            {jobs.map((j) => (
              <tr key={j.id} className="border-t border-slate-200 dark:border-slate-800">
                <td className="px-4 py-2.5 capitalize">{j.tipo}</td>
                <td className="px-4 py-2.5">
                  <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${STATUS_COR[j.status] ?? ''}`}>
                    {j.status}
                  </span>
                  {j.mensagemErro && <span className="ml-2 text-xs text-red-600">{j.mensagemErro}</span>}
                </td>
                <td className="px-4 py-2.5 text-xs text-slate-500">{new Date(j.criadoEm).toLocaleString('pt-BR')}</td>
                <td className="px-4 py-2.5 text-right">
                  {j.temDownload && <Button size="sm" variant="outline" onClick={() => download(j.id)}>Baixar PDF</Button>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
