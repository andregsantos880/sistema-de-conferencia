import { useEffect, useMemo, useRef, useState } from 'react';
import {
  lerLayoutFabrica,
  inserirPedidos,
  type Empresa,
  type Fabrica,
  type LayoutSalvo,
  type PedidoNovo,
} from '../lib/api';
import { analisarArquivo, comoLayoutFabrica, PARSERS, rotuloSeparador } from '../lib/parsers';
import { somErro, somOk } from '../lib/audio';

type Props = {
  empresa: Empresa;
  fabricas: Fabrica[];
  fabricaId: number | null;
  onTrocarFabrica: (id: number) => void;
  onConcluir: () => void;
  onVoltar: () => void;
};

/**
 * Recriação da tela TabeLayo (importação de arquivos):
 * combo de fábrica, botão "Arquivo...", barra de progresso, lista de lojas
 * com checkbox e o botão "Incluir lojas selecionadas.".
 * Os pedidos importados ficam vinculados à empresa logada.
 */
export default function Importacao({ empresa, fabricas, fabricaId, onTrocarFabrica, onConcluir, onVoltar }: Props) {
  const [linhas, setLinhas] = useState<PedidoNovo[]>([]);
  const [nomeArquivo, setNomeArquivo] = useState('');
  const [lojasMarcadas, setLojasMarcadas] = useState<Set<string>>(new Set());
  const [progresso, setProgresso] = useState(0);
  const [etapa, setEtapa] = useState('');
  const [erro, setErro] = useState('');
  const [aviso, setAviso] = useState('');
  /** Layout que o administrador configurou para a fábrica (tela Fábricas). */
  const [layout, setLayout] = useState<LayoutSalvo | null>(null);
  const [layoutEmUso, setLayoutEmUso] = useState<{ origem: string; separador: string } | null>(null);
  const arquivoRef = useRef<HTMLInputElement>(null);

  /* Ao trocar de fábrica, busca o layout dela. Sem migração 00104 (ou sem layout
     configurado) segue o caminho antigo: detecção automática + PARSERS. */
  useEffect(() => {
    let cancelado = false;
    setLayout(null);
    setLayoutEmUso(null);

    if (fabricaId === null) return;

    lerLayoutFabrica(fabricaId)
      .then((salvo) => {
        if (!cancelado) setLayout(salvo);
      })
      .catch(() => {
        if (!cancelado) setLayout(null);
      });

    return () => {
      cancelado = true;
    };
  }, [fabricaId]);

  const fabrica = fabricas.find((f) => f.controle === fabricaId) ?? null;
  /* Fábricas COM INTEGRAÇÃO ficam fixadas no topo do combo (ver lib/integracao.ts). */
  const fabricasIntegradas = fabricas.filter((f) => f.integrada);
  const fabricasSemIntegracao = fabricas.filter((f) => !f.integrada);

  /** Lojas (CLIENTE) distintas encontradas no arquivo. */
  const lojas = useMemo(() => {
    const mapa = new Map<string, number>();
    linhas.forEach((linha) => {
      const cliente = String(linha.cliente ?? '');
      mapa.set(cliente, (mapa.get(cliente) ?? 0) + 1);
    });
    return [...mapa.entries()].sort((a, b) => a[0].localeCompare(b[0], 'pt-BR'));
  }, [linhas]);

  const selecionadas = linhas.filter((l) => lojasMarcadas.has(String(l.cliente ?? ''))).length;

  async function lerArquivo(arquivo: File) {
    setErro('');
    setAviso('');
    setProgresso(0);

    if (fabricaId === null) {
      setErro('Selecione a fábrica antes de escolher o arquivo.');
      somErro();
      return;
    }

    try {
      const conteudo = await arquivo.text();
      const resultado = analisarArquivo(conteudo, {
        idlayout: fabricaId,
        nomeArquivo: arquivo.name,
        fabrica: fabrica?.nome ?? '',
        layout: comoLayoutFabrica(layout),
      });

      if (resultado.linhas.length === 0) {
        setErro('Nenhuma linha válida encontrada no arquivo.');
        somErro();
        return;
      }

      setLinhas(resultado.linhas);
      setNomeArquivo(arquivo.name);
      setLojasMarcadas(new Set(resultado.linhas.map((l) => String(l.cliente ?? ''))));
      setLayoutEmUso({ origem: resultado.origem, separador: resultado.separador });

      if (resultado.origem === 'generico' && !PARSERS[fabrica?.nome ?? '']) {
        setAviso(
          `Sem layout configurado para "${fabrica?.nome}" — o arquivo foi lido no modo genérico ` +
            `(separador "${rotuloSeparador(resultado.separador)}", ` +
            `${resultado.cabecalhoDetectado ? 'colunas pelo cabeçalho' : 'colunas por posição'}). ` +
            'Confira a prévia antes de importar. O administrador pode definir o layout em Fábricas.',
        );
      }
    } catch (falha) {
      setErro(falha instanceof Error ? falha.message : 'Falha ao ler o arquivo.');
      somErro();
    }
  }

  async function importar() {
    if (fabricaId === null || linhas.length === 0) return;

    const paraImportar = linhas.filter((l) => lojasMarcadas.has(String(l.cliente ?? '')));
    if (paraImportar.length === 0) {
      setErro('Marque pelo menos uma loja para importar.');
      somErro();
      return;
    }

    setErro('');
    setEtapa('Importando dados...');

    try {
      const total = paraImportar.length;
      let enviados = 0;

      // envia em blocos para a barra de progresso andar de verdade
      for (let i = 0; i < total; i += 500) {
        const bloco = paraImportar.slice(i, i + 500);
        await inserirPedidos(fabricaId, bloco);
        enviados += bloco.length;
        setProgresso(Math.round((enviados / total) * 100));
      }

      somOk();
      setEtapa(`${enviados} linha(s) importada(s) com sucesso.`);
      setLinhas([]);
      setNomeArquivo('');
      setLojasMarcadas(new Set());
      if (arquivoRef.current) arquivoRef.current.value = '';
      onConcluir();
    } catch (falha) {
      somErro();
      setEtapa('');
      setErro(falha instanceof Error ? falha.message : 'Falha ao importar.');
    }
  }

  return (
    <div className="flex min-h-full items-start justify-center bg-slate-200 p-6">
      <div className="w-full max-w-[560px] rounded-lg border border-slate-300 bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-200 px-4 py-2">
          <h2 className="text-sm font-semibold">
            Importação de Arquivos
            <span className="ml-2 rounded bg-emerald-700 px-2 py-0.5 text-[11px] font-semibold text-white">
              {empresa.nome}
            </span>
          </h2>
          <button onClick={onVoltar} className="rounded border border-slate-300 px-3 py-1 text-xs hover:bg-slate-100">
            Voltar
          </button>
        </div>

        <div className="space-y-4 p-4 text-xs">
          <div>
            <label className="mb-1 block text-slate-700" htmlFor="fabrica">
              Fábrica
            </label>
            <div className="flex gap-2">
              <select
                id="fabrica"
                value={fabricaId ?? ''}
                onChange={(e) => onTrocarFabrica(Number(e.target.value))}
                className="w-full rounded border border-slate-300 px-2 py-1.5"
              >
                {fabricasIntegradas.length > 0 && (
                  <optgroup label="★ Com integração instalada">
                    {fabricasIntegradas.map((f) => (
                      <option key={f.controle} value={f.controle}>
                        ★ {f.nome}
                      </option>
                    ))}
                  </optgroup>
                )}
                {fabricasSemIntegracao.length > 0 && (
                  <optgroup label="Demais fábricas (sem integração)">
                    {fabricasSemIntegracao.map((f) => (
                      <option key={f.controle} value={f.controle}>
                        {f.nome} (controle {f.controle})
                      </option>
                    ))}
                  </optgroup>
                )}
              </select>
              <button
                onClick={() => arquivoRef.current?.click()}
                className="shrink-0 rounded border border-slate-400 bg-slate-100 px-3 py-1.5 font-semibold hover:bg-slate-200"
              >
                Arquivo...
              </button>
              <input
                ref={arquivoRef}
                type="file"
                accept=".txt,.csv,.dat,text/plain"
                className="hidden"
                onChange={(e) => {
                  const arquivo = e.target.files?.[0];
                  if (arquivo) void lerArquivo(arquivo);
                }}
              />
            </div>
            {fabrica && !fabrica.integrada && !layout && (
              <p className="mt-1 rounded border border-amber-300 bg-amber-50 px-2 py-1 text-[11px] text-amber-800">
                “{fabrica.nome}” não tem integração instalada — o arquivo será lido no modo genérico
                (detecção de separador e colunas).
              </p>
            )}
            {fabrica && layout && (
              <p className="mt-1 rounded border border-emerald-300 bg-emerald-50 px-2 py-1 text-[11px] text-emerald-800">
                Layout configurado desta fábrica: {Object.keys(layout.campos ?? {}).length} coluna(s)
                mapeada(s), separador “{rotuloSeparador(layout.delimitador)}”, começando na linha{' '}
                {layout.linha_inicial}
                {layout.tem_cabecalho ? ' (com cabeçalho)' : ''}.
              </p>
            )}
            {layoutEmUso && (
              <p className="mt-1 text-[11px] text-slate-500">
                Arquivo lido com{' '}
                {layoutEmUso.origem === 'layout'
                  ? 'o layout configurado da fábrica'
                  : layoutEmUso.origem === 'cabecalho'
                    ? 'as colunas identificadas pelo cabeçalho'
                    : 'o modo genérico'}{' '}
                (separador “{rotuloSeparador(layoutEmUso.separador)}”).
              </p>
            )}
            {nomeArquivo && <p className="mt-1 text-slate-500">Arquivo: {nomeArquivo}</p>}
          </div>

          <div>
            <div className="mb-1 flex justify-between text-slate-600">
              <span>{etapa || 'Nenhuma importação em andamento'}</span>
              <span>{progresso}%</span>
            </div>
            <div className="h-5 w-full overflow-hidden rounded border border-slate-300 bg-slate-100">
              <div
                className="h-full bg-emerald-500 transition-all"
                style={{ width: `${progresso}%` }}
              />
            </div>
          </div>

          <div>
            <p className="mb-1 text-slate-700">Selecionar as lojas:</p>
            <div className="h-40 overflow-auto rounded border border-slate-300 p-2">
              {lojas.length === 0 && (
                <p className="text-slate-500">Escolha um arquivo para listar as lojas encontradas.</p>
              )}
              {lojas.map(([cliente, quantidade]) => (
                <label key={cliente} className="flex items-center gap-2 py-0.5">
                  <input
                    type="checkbox"
                    checked={lojasMarcadas.has(cliente)}
                    onChange={(e) => {
                      setLojasMarcadas((atual) => {
                        const novo = new Set(atual);
                        if (e.target.checked) novo.add(cliente);
                        else novo.delete(cliente);
                        return novo;
                      });
                    }}
                  />
                  <span className="flex-1">{cliente}</span>
                  <span className="text-slate-500">{quantidade} item(ns)</span>
                </label>
              ))}
            </div>
          </div>

          {aviso && (
            <div className="rounded border border-amber-300 bg-amber-50 px-3 py-2 text-amber-800">{aviso}</div>
          )}
          {erro && <div className="rounded border border-red-300 bg-red-50 px-3 py-2 text-red-700">{erro}</div>}

          <div className="flex items-center justify-between border-t border-slate-200 pt-3">
            <span className="text-slate-500">
              {linhas.length} linha(s) lida(s) · {selecionadas} selecionada(s)
            </span>
            <button
              onClick={() => void importar()}
              disabled={linhas.length === 0}
              className="rounded bg-blue-600 px-4 py-1.5 font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
            >
              Incluir lojas selecionadas.
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
