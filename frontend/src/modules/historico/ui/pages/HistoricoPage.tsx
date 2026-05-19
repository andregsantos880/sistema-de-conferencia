import { useEffect, useState } from 'react';
import { api } from '@/shared/services/api';
import { authStore } from '@/modules/auth/infrastructure/authStore';
import { Button } from '@/shadcn/components/ui/button';
import { Input } from '@/shadcn/components/ui/input';

type Status = { id: string; nome: string };
type Evento = {
  id: string; pedidoId: string; etiqueta: string;
  statusAnteriorNome?: string | null; statusAnteriorCor?: string | null;
  statusNovoNome: string; statusNovoCor: string;
  usuarioNome: string; ocorreuEm: string; origem: string;
};

export default function HistoricoPage() {
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [statuses, setStatuses] = useState<Status[]>([]);
  const [filtros, setFiltros] = useState({ etiqueta: '', statusId: '', de: '', ate: '' });
  const [total, setTotal] = useState(0);
  const [carregando, setCarregando] = useState(false);

  useEffect(() => { api.get<Status[]>('/status').then((r) => setStatuses(r.data)); }, []);

  function carregar() {
    setCarregando(true);
    const params: Record<string, string> = { pagina: '1', tamanho: '100' };
    if (filtros.etiqueta) params.etiqueta = filtros.etiqueta;
    if (filtros.statusId) params.statusId = filtros.statusId;
    if (filtros.de) params.de = new Date(filtros.de).toISOString();
    if (filtros.ate) params.ate = new Date(filtros.ate + 'T23:59:59').toISOString();
    api.get<{ total: number; itens: Evento[] }>('/eventos', { params })
      .then((r) => { setEventos(r.data.itens); setTotal(r.data.total); })
      .finally(() => setCarregando(false));
  }
  useEffect(carregar, []);  // eslint-disable-line react-hooks/exhaustive-deps

  async function exportar() {
    const params = new URLSearchParams();
    if (filtros.etiqueta) params.set('etiqueta', filtros.etiqueta);
    if (filtros.statusId) params.set('statusId', filtros.statusId);
    if (filtros.de) params.set('de', new Date(filtros.de).toISOString());
    if (filtros.ate) params.set('ate', new Date(filtros.ate + 'T23:59:59').toISOString());

    // Como é download, usa fetch direto pra pegar o blob com headers de auth
    const token = authStore.getAccessToken();
    const resp = await fetch(`/api/eventos/exportar.xlsx?${params.toString()}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!resp.ok) { alert('Falha ao exportar.'); return; }
    const blob = await resp.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `historico_${new Date().toISOString().slice(0, 10)}.xlsx`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <header className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Histórico</h1>
        <Button variant="outline" onClick={exportar}>Exportar Excel</Button>
      </header>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 mb-4">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          <Input placeholder="Etiqueta…" value={filtros.etiqueta}
            onChange={(e) => setFiltros((s) => ({ ...s, etiqueta: e.target.value }))} />
          <select className="h-10 rounded-md border border-slate-300 dark:border-slate-700 bg-transparent px-3 text-sm"
            value={filtros.statusId} onChange={(e) => setFiltros((s) => ({ ...s, statusId: e.target.value }))}>
            <option value="">Todos os status</option>
            {statuses.map((s) => <option key={s.id} value={s.id}>{s.nome}</option>)}
          </select>
          <Input type="date" value={filtros.de} onChange={(e) => setFiltros((s) => ({ ...s, de: e.target.value }))} />
          <Input type="date" value={filtros.ate} onChange={(e) => setFiltros((s) => ({ ...s, ate: e.target.value }))} />
          <Button onClick={carregar} disabled={carregando}>{carregando ? 'Carregando…' : 'Filtrar'}</Button>
        </div>
      </div>

      <div className="text-sm text-slate-500 mb-2">{total} eventos</div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 dark:bg-slate-800/50 text-left">
            <tr>
              <th className="px-4 py-3 font-semibold">Data</th>
              <th className="px-4 py-3 font-semibold">Etiqueta</th>
              <th className="px-4 py-3 font-semibold">De</th>
              <th className="px-4 py-3 font-semibold">Para</th>
              <th className="px-4 py-3 font-semibold">Usuário</th>
              <th className="px-4 py-3 font-semibold">Origem</th>
            </tr>
          </thead>
          <tbody>
            {eventos.length === 0 && (
              <tr><td colSpan={6} className="text-center py-8 text-slate-500">Nenhum evento encontrado.</td></tr>
            )}
            {eventos.map((e) => (
              <tr key={e.id} className="border-t border-slate-200 dark:border-slate-800">
                <td className="px-4 py-2.5 text-xs">{new Date(e.ocorreuEm).toLocaleString('pt-BR')}</td>
                <td className="px-4 py-2.5 font-mono">{e.etiqueta}</td>
                <td className="px-4 py-2.5">
                  {e.statusAnteriorNome ? (
                    <span className="inline-block px-2 py-0.5 rounded text-white text-xs"
                      style={{ backgroundColor: e.statusAnteriorCor ?? '#94A3B8' }}>{e.statusAnteriorNome}</span>
                  ) : '—'}
                </td>
                <td className="px-4 py-2.5">
                  <span className="inline-block px-2 py-0.5 rounded text-white text-xs"
                    style={{ backgroundColor: e.statusNovoCor }}>{e.statusNovoNome}</span>
                </td>
                <td className="px-4 py-2.5">{e.usuarioNome}</td>
                <td className="px-4 py-2.5 text-xs text-slate-500">{e.origem}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
