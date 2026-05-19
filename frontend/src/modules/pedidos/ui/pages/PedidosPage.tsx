import { useEffect, useState } from 'react';
import { api } from '@/shared/services/api';
import { Input } from '@/shadcn/components/ui/input';
import { Button } from '@/shadcn/components/ui/button';

type Status = { id: string; codigo: string; nome: string; corHex: string };
type Box = { id: string; codigo: string; nome: string };
type Pedido = {
  id: string; etiqueta: string; ordemCompra?: string | null;
  cliente?: string | null; peCliente?: string | null;
  produto?: string | null; descricao?: string | null;
  qtde?: number | null; volume?: string | null;
  statusId: string; statusNome: string; statusCor: string;
  boxId?: string | null; boxCodigo?: string | null;
  grupoId?: string | null; grupoNome?: string | null;
  bloqueado: boolean; atualizadoEm: string;
};
type PedidosResp = { total: number; pagina: number; tamanho: number; itens: Pedido[] };

export default function PedidosPage() {
  const [statuses, setStatuses] = useState<Status[]>([]);
  const [boxes, setBoxes] = useState<Box[]>([]);
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [total, setTotal] = useState(0);
  const [pagina, setPagina] = useState(1);
  const [carregando, setCarregando] = useState(false);
  const [filtros, setFiltros] = useState({ statusId: '', boxId: '', etiqueta: '', cliente: '' });

  useEffect(() => {
    api.get<Status[]>('/status').then((r) => setStatuses(r.data));
    api.get<Box[]>('/boxes').then((r) => setBoxes(r.data));
  }, []);

  function carregar(p = pagina) {
    setCarregando(true);
    const params: Record<string, string | number> = { pagina: p, tamanho: 50 };
    if (filtros.statusId) params.statusId = filtros.statusId;
    if (filtros.boxId) params.boxId = filtros.boxId;
    if (filtros.etiqueta) params.etiqueta = filtros.etiqueta;
    if (filtros.cliente) params.cliente = filtros.cliente;
    api.get<PedidosResp>('/pedidos', { params })
      .then((r) => { setPedidos(r.data.itens); setTotal(r.data.total); setPagina(r.data.pagina); })
      .finally(() => setCarregando(false));
  }

  useEffect(() => { carregar(1); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, []);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <header className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Pedidos</h1>
        <span className="text-sm text-slate-500">{total} pedidos</span>
      </header>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 mb-4">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          <Input placeholder="Etiqueta…" value={filtros.etiqueta}
            onChange={(e) => setFiltros((s) => ({ ...s, etiqueta: e.target.value }))} />
          <Input placeholder="Cliente…" value={filtros.cliente}
            onChange={(e) => setFiltros((s) => ({ ...s, cliente: e.target.value }))} />
          <select className="h-10 rounded-md border border-slate-300 dark:border-slate-700 bg-transparent px-3 text-sm"
            value={filtros.statusId} onChange={(e) => setFiltros((s) => ({ ...s, statusId: e.target.value }))}>
            <option value="">Todos os status</option>
            {statuses.map((s) => <option key={s.id} value={s.id}>{s.nome}</option>)}
          </select>
          <select className="h-10 rounded-md border border-slate-300 dark:border-slate-700 bg-transparent px-3 text-sm"
            value={filtros.boxId} onChange={(e) => setFiltros((s) => ({ ...s, boxId: e.target.value }))}>
            <option value="">Todos os boxes</option>
            {boxes.map((b) => <option key={b.id} value={b.id}>Box {b.codigo}</option>)}
          </select>
          <Button onClick={() => carregar(1)} disabled={carregando}>
            {carregando ? 'Carregando…' : 'Filtrar'}
          </Button>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 dark:bg-slate-800/50 text-left">
            <tr>
              <th className="px-4 py-3 font-semibold">Etiqueta</th>
              <th className="px-4 py-3 font-semibold">Cliente</th>
              <th className="px-4 py-3 font-semibold">OC / Pedido</th>
              <th className="px-4 py-3 font-semibold">Descrição</th>
              <th className="px-4 py-3 font-semibold">Box</th>
              <th className="px-4 py-3 font-semibold">Status</th>
            </tr>
          </thead>
          <tbody>
            {pedidos.length === 0 && (
              <tr><td colSpan={6} className="text-center py-8 text-slate-500">Nenhum pedido encontrado.</td></tr>
            )}
            {pedidos.map((p) => (
              <tr key={p.id} className="border-t border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40">
                <td className="px-4 py-2.5 font-mono">{p.etiqueta}{p.bloqueado && <span className="ml-2 text-purple-600 text-xs">🔒</span>}</td>
                <td className="px-4 py-2.5">{p.cliente ?? '—'}</td>
                <td className="px-4 py-2.5">{p.ordemCompra ?? '—'}{p.peCliente && ` / ${p.peCliente}`}</td>
                <td className="px-4 py-2.5 max-w-xs truncate">{p.descricao ?? '—'}</td>
                <td className="px-4 py-2.5">{p.boxCodigo ?? '—'}</td>
                <td className="px-4 py-2.5">
                  <span className="inline-block px-2 py-0.5 rounded text-white text-xs font-medium"
                    style={{ backgroundColor: p.statusCor }}>
                    {p.statusNome}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {total > 50 && (
        <div className="mt-4 flex justify-between items-center text-sm">
          <span className="text-slate-500">Página {pagina} de {Math.ceil(total / 50)}</span>
          <div className="space-x-2">
            <Button variant="outline" size="sm" disabled={pagina === 1} onClick={() => carregar(pagina - 1)}>Anterior</Button>
            <Button variant="outline" size="sm" disabled={pagina * 50 >= total} onClick={() => carregar(pagina + 1)}>Próxima</Button>
          </div>
        </div>
      )}
    </div>
  );
}
