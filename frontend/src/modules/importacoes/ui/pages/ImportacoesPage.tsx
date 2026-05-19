import { useEffect, useRef, useState } from 'react';
import type { HubConnection } from '@microsoft/signalr';
import { api } from '@/shared/services/api';
import { criarConexaoHub } from '@/shared/services/realtime/hubConnection';
import { Button } from '@/shadcn/components/ui/button';

type LayoutDto = { id: string; nome: string; parserKey: string; ativadoParaTenant: boolean };
type ImpDto = {
  id: string; nomeArquivo: string; layoutId: string; layoutNome: string;
  status: string; totalLinhas?: number | null; linhasOk: number; linhasErro: number;
  criadoEm: string; iniciadoEm?: string | null; finalizadoEm?: string | null;
  mensagemErro?: string | null;
};

const STATUS_COR: Record<string, string> = {
  recebido: 'bg-slate-200 text-slate-800',
  processando: 'bg-blue-100 text-blue-800',
  concluido: 'bg-green-100 text-green-800',
  erro: 'bg-red-100 text-red-800',
  cancelado: 'bg-yellow-100 text-yellow-800',
};

export default function ImportacoesPage() {
  const [layouts, setLayouts] = useState<LayoutDto[]>([]);
  const [layoutId, setLayoutId] = useState('');
  const [arquivo, setArquivo] = useState<File | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [historico, setHistorico] = useState<ImpDto[]>([]);
  const inputArquivo = useRef<HTMLInputElement>(null);
  const hubRef = useRef<HubConnection | null>(null);

  function carregarLayouts() {
    api.get<LayoutDto[]>('/layouts').then((r) => {
      const ativos = r.data.filter((l) => l.ativadoParaTenant);
      setLayouts(ativos);
      if (!layoutId && ativos.length > 0) setLayoutId(ativos[0].id);
    });
  }

  function carregarHistorico() {
    api.get<{ itens: ImpDto[] }>('/importacoes', { params: { tamanho: 30 } })
      .then((r) => setHistorico(r.data.itens));
  }

  useEffect(() => {
    carregarLayouts();
    carregarHistorico();
    const conn = criarConexaoHub('importacao');
    hubRef.current = conn;
    conn.on('importacaoProgresso', (p: ImpDto) => {
      setHistorico((prev) => {
        const idx = prev.findIndex((x) => x.id === p.id);
        if (idx >= 0) {
          const novo = [...prev];
          novo[idx] = { ...novo[idx], ...p };
          return novo;
        }
        // se chegou um progresso de import nova, recarrega lista
        carregarHistorico();
        return prev;
      });
    });
    conn.start().catch(() => {});
    return () => { conn.stop(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    if (!arquivo || !layoutId) return;
    setErro(null); setEnviando(true);
    try {
      const fd = new FormData();
      fd.append('arquivo', arquivo);
      fd.append('layoutId', layoutId);
      await api.post('/importacoes', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      setArquivo(null);
      if (inputArquivo.current) inputArquivo.current.value = '';
      carregarHistorico();
    } catch (ex: unknown) {
      const data = (ex as { response?: { data?: { erro?: string; codigo?: string; limite?: number } } })?.response?.data;
      const detalhe = data?.erro ?? 'Falha no upload.';
      setErro(detalhe + (data?.codigo === 'limite_plano_excedido' ? ' Faça upgrade na tela de assinatura.' : ''));
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Importações</h1>

      <form onSubmit={enviar} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 mb-6">
        <h2 className="text-sm font-semibold mb-3">Nova importação</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
          <div>
            <label className="block text-sm mb-1">Layout</label>
            <select className="w-full h-10 rounded-md border border-slate-300 dark:border-slate-700 bg-transparent px-3 text-sm"
              value={layoutId} onChange={(e) => setLayoutId(e.target.value)} required>
              {layouts.length === 0 && <option value="">— Nenhum layout ativo —</option>}
              {layouts.map((l) => <option key={l.id} value={l.id}>{l.nome}</option>)}
            </select>
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm mb-1">Arquivo (CSV)</label>
            <input
              ref={inputArquivo}
              type="file"
              accept=".csv,.txt"
              onChange={(e) => setArquivo(e.target.files?.[0] ?? null)}
              className="block w-full text-sm file:mr-3 file:py-2 file:px-4 file:rounded-md file:border-0 file:bg-slate-100 file:text-slate-700 hover:file:bg-slate-200"
              required
            />
          </div>
        </div>
        {erro && <p className="text-red-600 text-sm mt-3">{erro}</p>}
        <div className="mt-4 flex justify-end">
          <Button type="submit" disabled={enviando || !layoutId || !arquivo}>
            {enviando ? 'Enviando…' : 'Enviar e processar'}
          </Button>
        </div>
      </form>

      <h2 className="text-sm font-semibold mb-3 text-slate-600 dark:text-slate-400">Histórico</h2>
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 dark:bg-slate-800/50 text-left">
            <tr>
              <th className="px-4 py-3 font-semibold">Arquivo</th>
              <th className="px-4 py-3 font-semibold">Layout</th>
              <th className="px-4 py-3 font-semibold">Status</th>
              <th className="px-4 py-3 font-semibold text-right">OK</th>
              <th className="px-4 py-3 font-semibold text-right">Erros</th>
              <th className="px-4 py-3 font-semibold">Criado</th>
            </tr>
          </thead>
          <tbody>
            {historico.length === 0 && (
              <tr><td colSpan={6} className="text-center py-8 text-slate-500">Nenhuma importação ainda.</td></tr>
            )}
            {historico.map((h) => (
              <tr key={h.id} className="border-t border-slate-200 dark:border-slate-800">
                <td className="px-4 py-2.5 font-mono text-xs">{h.nomeArquivo}</td>
                <td className="px-4 py-2.5">{h.layoutNome}</td>
                <td className="px-4 py-2.5">
                  <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${STATUS_COR[h.status] ?? ''}`}>
                    {h.status}
                  </span>
                </td>
                <td className="px-4 py-2.5 text-right">{h.linhasOk}</td>
                <td className="px-4 py-2.5 text-right text-red-600">{h.linhasErro}</td>
                <td className="px-4 py-2.5 text-xs text-slate-500">{new Date(h.criadoEm).toLocaleString('pt-BR')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
