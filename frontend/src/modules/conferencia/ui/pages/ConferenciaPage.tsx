import { useEffect, useMemo, useRef, useState } from 'react';
import type { HubConnection } from '@microsoft/signalr';
import { api } from '@/shared/services/api';
import { criarConexaoHub } from '@/shared/services/realtime/hubConnection';
import { tts } from '@/modules/conferencia/infrastructure/tts';
import { Button } from '@/shadcn/components/ui/button';
import { Input } from '@/shadcn/components/ui/input';
import { Label } from '@/shadcn/components/ui/label';

type StatusDto = { id: string; codigo: string; nome: string; corHex: string; ordem: number; ehInicial: boolean; ehBloqueio: boolean };

type ResultadoTipo = 0 | 1 | 2 | 3 | 4 | 5 | 6;
const TIPO_LABEL: Record<ResultadoTipo, string> = {
  0: 'OK', 1: 'Já lida', 2: 'Não encontrada', 3: 'Status inválido',
  4: 'Bloqueada', 5: 'Sem permissão', 6: 'Erro',
};
const TIPO_COR: Record<ResultadoTipo, string> = {
  0: 'bg-green-100 text-green-800 border-green-300',
  1: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  2: 'bg-red-100 text-red-800 border-red-300',
  3: 'bg-orange-100 text-orange-800 border-orange-300',
  4: 'bg-purple-100 text-purple-800 border-purple-300',
  5: 'bg-slate-100 text-slate-800 border-slate-300',
  6: 'bg-red-100 text-red-800 border-red-300',
};

type Resultado = {
  clientEventId: string;
  tipo: ResultadoTipo;
  tts: string;
  etiqueta?: string;
  statusNome?: string;
  statusCor?: string;
  boxCodigo?: string;
  cliente?: string;
  descricao?: string;
  detalheErro?: string;
  recebidoEm: number;
};

export default function ConferenciaPage() {
  const [statuses, setStatuses] = useState<StatusDto[]>([]);
  const [statusDestinoId, setStatusDestinoId] = useState<string>('');
  const [conectado, setConectado] = useState(false);
  const [resultados, setResultados] = useState<Resultado[]>([]);
  const [etiqueta, setEtiqueta] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const hubRef = useRef<HubConnection | null>(null);
  const contagem = useMemo(() => ({
    ok: resultados.filter((r) => r.tipo === 0).length,
    erro: resultados.filter((r) => r.tipo === 2 || r.tipo === 6).length,
    aviso: resultados.filter((r) => r.tipo === 1 || r.tipo === 3 || r.tipo === 4).length,
  }), [resultados]);

  // Carrega statuses configurados pelo tenant
  useEffect(() => {
    api.get<StatusDto[]>('/status').then((r) => {
      setStatuses(r.data);
      // default: 1º status não-inicial e não-bloqueio (geralmente "Conferido")
      const proximo = r.data.find((s) => !s.ehInicial && !s.ehBloqueio) ?? r.data[1] ?? r.data[0];
      if (proximo) setStatusDestinoId(proximo.id);
    });
  }, []);

  // SignalR
  useEffect(() => {
    const conn = criarConexaoHub('conferencia');
    hubRef.current = conn;

    conn.on('conferenciaResultado', (r: Omit<Resultado, 'recebidoEm'>) => {
      setResultados((prev) => [{ ...r, recebidoEm: Date.now() }, ...prev].slice(0, 50));
      // Fala o TTS já enviado pelo backend
      tts.speak(r.tts);
    });

    conn.start()
      .then(() => setConectado(true))
      .catch(() => setConectado(false));

    conn.onreconnected(() => setConectado(true));
    conn.onreconnecting(() => setConectado(false));
    conn.onclose(() => setConectado(false));

    return () => { conn.stop(); };
  }, []);

  // Foco automático no input após cada bipe
  useEffect(() => { inputRef.current?.focus(); }, [resultados.length]);

  function bipar(e: React.FormEvent) {
    e.preventDefault();
    if (!etiqueta.trim() || !statusDestinoId) return;
    const clientEventId = crypto.randomUUID();
    api.post('/conferencias', {
      clientEventId,
      etiqueta: etiqueta.trim(),
      statusDestinoId,
      connectionId: hubRef.current?.connectionId ?? null,
    }).catch((ex) => {
      const detalhe = ex?.response?.data?.erro ?? 'Falha ao enviar';
      setResultados((prev) => [{
        clientEventId, tipo: 6 as const, tts: 'Erro de rede',
        etiqueta, detalheErro: detalhe, recebidoEm: Date.now(),
      }, ...prev]);
    });
    setEtiqueta('');
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <header className="mb-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Conferência</h1>
          <div className="flex items-center gap-2 text-sm">
            <span className={`w-2 h-2 rounded-full ${conectado ? 'bg-green-500' : 'bg-amber-500 animate-pulse'}`} />
            <span className="text-slate-600 dark:text-slate-400">
              {conectado ? 'Online' : 'Reconectando…'}
            </span>
          </div>
        </div>
      </header>

      <form onSubmit={bipar} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div className="md:col-span-2">
            <Label className="mb-1.5 block">Etiqueta (bipe ou digite)</Label>
            <Input
              ref={inputRef}
              autoFocus
              value={etiqueta}
              onChange={(e) => setEtiqueta(e.target.value)}
              placeholder="código de barras…"
              className="text-lg font-mono h-12"
            />
          </div>
          <div>
            <Label className="mb-1.5 block">Status destino</Label>
            <select
              className="w-full h-12 rounded-md border border-slate-300 dark:border-slate-700 bg-transparent px-3 text-sm"
              value={statusDestinoId}
              onChange={(e) => setStatusDestinoId(e.target.value)}
            >
              {statuses.map((s) => (
                <option key={s.id} value={s.id}>{s.nome}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="mt-3 flex justify-between text-sm">
          <div className="space-x-4">
            <span className="text-green-700"><b>{contagem.ok}</b> OK</span>
            <span className="text-yellow-700"><b>{contagem.aviso}</b> avisos</span>
            <span className="text-red-700"><b>{contagem.erro}</b> erros</span>
          </div>
          <Button type="submit" className="px-6">Bipar (Enter)</Button>
        </div>
      </form>

      <section className="space-y-2">
        {resultados.length === 0 && (
          <div className="text-center text-slate-500 py-12">
            Aguardando bipagem… O áudio toca automaticamente quando o backend responde.
          </div>
        )}
        {resultados.map((r, idx) => (
          <div
            key={`${r.clientEventId}-${idx}`}
            className={`rounded-xl border p-4 ${TIPO_COR[r.tipo]}`}
          >
            <div className="flex items-center justify-between">
              <div>
                <span className="font-mono font-bold">{r.etiqueta ?? '—'}</span>
                <span className="ml-3 text-sm font-semibold">{TIPO_LABEL[r.tipo]}</span>
              </div>
              <div className="text-sm">
                {r.statusNome && (
                  <span
                    className="inline-block px-2 py-0.5 rounded text-white text-xs"
                    style={{ backgroundColor: r.statusCor ?? '#64748b' }}
                  >
                    {r.statusNome}
                  </span>
                )}
                {r.boxCodigo && <span className="ml-2">Box {r.boxCodigo}</span>}
              </div>
            </div>
            <div className="text-sm mt-1">
              {r.cliente && <span>{r.cliente}</span>}
              {r.descricao && <span className="text-slate-600"> • {r.descricao}</span>}
              {r.detalheErro && <span className="text-red-700 font-medium"> • {r.detalheErro}</span>}
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}
