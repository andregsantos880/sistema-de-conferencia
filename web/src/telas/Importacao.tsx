import { useEffect, useMemo, useRef, useState } from 'react';
import {
  lerLayoutFabrica,
  inserirPedidos,
  registrarImportacao,
  migracaoPendente,
  AVISO_IMPORTACOES,
  AVISO_LOCAIS,
  definirLocaisLote,
  listarLocais,
  locaisPorGrupo,
  type Empresa,
  type Fabrica,
  type LayoutSalvo,
  type Local,
  type LocalEscolhido,
  type PedidoNovo,
} from '../lib/api';
import { analisarArquivo, comoLayoutFabrica, PARSERS, rotuloSeparador } from '../lib/parsers';
import { arquivoParaBase64, lerTextoDoArquivo } from '../lib/arquivo';
import { somErro, somOk } from '../lib/audio';
import { ROTULO_ESTAGIO } from '../lib/config';

const ESTAGIOS = [1, 2, 3] as const;

type Props = {
  empresa: Empresa;
  fabricas: Fabrica[];
  fabricaId: number | null;
  onTrocarFabrica: (id: number) => void;
  onConcluir: () => void;
  onVoltar: () => void;
};

/**
 * Erros do banco traduzidos para o operador. O caso real: a descrição de uma
 * peça maior que a coluna reservada (a Romanzza manda 86 caracteres e a coluna
 * tem 80) derruba a importação inteira com um texto técnico em inglês.
 */
function mensagemDeImportacao(falha: unknown): string {
  const texto = falha instanceof Error ? falha.message : String(falha);
  const campoLongo = /too long for type character varying\((\d+)\)/.exec(texto);
  if (campoLongo) {
    return (
      `Um texto do arquivo é maior do que o espaço reservado no banco ` +
      `(${campoLongo[1]} caracteres) — a peça mais longa deste arquivo não cabe. ` +
      'Nada foi importado. Avise o suporte para ampliar a coluna de descrição.'
    );
  }
  return texto || 'Falha ao importar.';
}

/**
 * Recriação da tela TabeLayo (importação de arquivos):
 * combo de fábrica, botão "Arquivo...", barra de progresso, lista de lojas
 * com checkbox e o botão "Incluir lojas selecionadas.".
 * Os pedidos importados ficam vinculados à empresa logada.
 */
export default function Importacao({ empresa, fabricas, fabricaId, onTrocarFabrica, onConcluir, onVoltar }: Props) {
  const [linhas, setLinhas] = useState<PedidoNovo[]>([]);
  const [nomeArquivo, setNomeArquivo] = useState('');
  /** O File escolhido: guardado para registrar a importação (com o original) e baixar depois. */
  const [arquivo, setArquivo] = useState<File | null>(null);
  const [descartadas, setDescartadas] = useState(0);
  const [gruposMarcados, setGruposMarcados] = useState<Set<string>>(new Set());
  /** Locais cadastrados (tabela `box`), só os ativos. */
  const [locais, setLocais] = useState<Local[]>([]);
  /**
   * Local escolhido por grupo → estágio → idbox. A chave do grupo é a
   * ORD.COMPRA inteira (decisão do cliente: um cliente pode ter vários pedidos e
   * a ordem de compra é o que os agrupa). Já vem preenchido com o local que o
   * grupo tem hoje na base, quando existe.
   */
  const [locaisEscolhidos, setLocaisEscolhidos] = useState<
    Record<string, Record<number, number>>
  >({});
  /** Combos de "aplicar aos selecionados". */
  const [emLote, setEmLote] = useState<Record<number, number | ''>>({});
  const [progresso, setProgresso] = useState(0);
  const [etapa, setEtapa] = useState('');
  const [erro, setErro] = useState('');
  const [aviso, setAviso] = useState('');
  /** Layout que o administrador configurou para a fábrica (tela Fábricas). */
  const [layout, setLayout] = useState<LayoutSalvo | null>(null);
  const [layoutEmUso, setLayoutEmUso] = useState<{
    origem: string;
    separador: string;
    tipo: string;
    codificacao?: string;
  } | null>(null);
  const arquivoRef = useRef<HTMLInputElement>(null);

  /**
   * LOCAIS: cadastro da empresa + o local que cada grupo (ORD.COMPRA) já tem na
   * base. Sem a migração 00110 a lista vem vazia e a importação segue normal.
   */
  useEffect(() => {
    let cancelado = false;
    setLocais([]);
    setLocaisEscolhidos({});

    if (fabricaId === null) return;

    Promise.all([listarLocais(), locaisPorGrupo(fabricaId)])
      .then(([cadastro, porGrupo]) => {
        if (cancelado) return;
        setLocais(cadastro.filter((local) => Number(local.ativo) === 1));

        const mapa: Record<string, Record<number, number>> = {};
        porGrupo.forEach((item) => {
          mapa[item.ordcompra] = {
            ...(mapa[item.ordcompra] ?? {}),
            [Number(item.estagio)]: Number(item.idbox),
          };
        });
        setLocaisEscolhidos(mapa);
      })
      .catch(() => {
        if (cancelado) return;
        setLocais([]);
        setLocaisEscolhidos({});
      });

    return () => {
      cancelado = true;
    };
  }, [fabricaId]);

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

  /**
   * Grupos do arquivo: a ORD.COMPRA inteira é o agrupamento (não o CLIENTE, que
   * na maioria dos arquivos vem "NÃO INFORMADO").
   */
  const grupos = useMemo(() => {
    const mapa = new Map<string, { ordcompra: string; quantidade: number; cliente: string }>();
    linhas.forEach((linha) => {
      const ordcompra = String(linha.ordcompra ?? '');
      const atual = mapa.get(ordcompra);
      if (atual) {
        atual.quantidade += 1;
        if (!atual.cliente) atual.cliente = String(linha.cliente ?? '');
      } else {
        mapa.set(ordcompra, {
          ordcompra,
          quantidade: 1,
          cliente: String(linha.cliente ?? ''),
        });
      }
    });
    return [...mapa.values()].sort((a, b) => a.ordcompra.localeCompare(b.ordcompra, 'pt-BR'));
  }, [linhas]);

  const selecionadas = linhas.filter((l) => gruposMarcados.has(String(l.ordcompra ?? ''))).length;

  /** Grupos selecionados que ainda estão sem local em algum estágio. */
  const semLocal = useMemo(() => {
    const faltando: Array<{ ordcompra: string; estagios: string[]; quantidade: number }> = [];
    grupos
      .filter((grupo) => gruposMarcados.has(grupo.ordcompra))
      .forEach((grupo) => {
        const escolha = locaisEscolhidos[grupo.ordcompra] ?? {};
        const estagios = ESTAGIOS.filter((estagio) => !escolha[estagio]).map(
          (estagio) => ROTULO_ESTAGIO[estagio],
        );
        if (estagios.length > 0) {
          faltando.push({ ordcompra: grupo.ordcompra, estagios, quantidade: grupo.quantidade });
        }
      });
    return faltando;
  }, [grupos, gruposMarcados, locaisEscolhidos]);

  const pecasSemLocal = semLocal.reduce((soma, item) => soma + item.quantidade, 0);

  /** Escolhe o local de um grupo em um estágio. */
  function escolherLocal(ordcompra: string, estagio: number, idbox: number) {
    setLocaisEscolhidos((atual) => ({
      ...atual,
      [ordcompra]: { ...(atual[ordcompra] ?? {}), [estagio]: idbox },
    }));
  }

  /** "Aplicar aos selecionados": joga os três combos em todos os grupos marcados. */
  function aplicarEmLote() {
    const escolhidos = ESTAGIOS.filter((estagio) => emLote[estagio]);
    if (escolhidos.length === 0) return;

    setLocaisEscolhidos((atual) => {
      const novo = { ...atual };
      gruposMarcados.forEach((ordcompra) => {
        novo[ordcompra] = { ...(novo[ordcompra] ?? {}) };
        escolhidos.forEach((estagio) => {
          novo[ordcompra][estagio] = Number(emLote[estagio]);
        });
      });
      return novo;
    });
  }

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
      const { texto: conteudo, codificacao } = await lerTextoDoArquivo(arquivo);
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
      setArquivo(arquivo);
      setDescartadas(resultado.descartadas);
      setGruposMarcados(new Set(resultado.linhas.map((l) => String(l.ordcompra ?? ''))));
      setLayoutEmUso({
        origem: resultado.origem,
        separador: resultado.separador,
        tipo: resultado.tipo,
        codificacao,
      });

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

    const paraImportar = linhas.filter((l) => gruposMarcados.has(String(l.ordcompra ?? '')));
    if (paraImportar.length === 0) {
      setErro('Marque pelo menos um pedido (ORD.COMPRA) para importar.');
      somErro();
      return;
    }

    setErro('');
    setEtapa('Importando dados...');

    try {
      const total = paraImportar.length;
      let enviados = 0;

      /* Registra a importação ANTES de gravar os pedidos: o id volta e cada
         bloco de pedidos nasce vinculado a ele (é o que permite excluir a
         importação depois, apagando os pedidos dela). Se a migração do banco
         ainda não foi aplicada, importa do jeito antigo, sem o vínculo. */
      let importacaoId: number | null = null;
      try {
        const original = arquivo ? await arquivoParaBase64(arquivo) : null;
        importacaoId = await registrarImportacao({
          controle: fabricaId,
          nomeArquivo: nomeArquivo || 'arquivo',
          tamanho: arquivo?.size ?? 0,
          codificacao: layoutEmUso?.codificacao ?? 'UTF-8',
          linhasLidas: linhas.length,
          linhasImportadas: total,
          linhasDescartadas: descartadas,
          conteudoBase64: original,
        });
      } catch (falha) {
        importacaoId = null;
        setAviso(
          migracaoPendente(falha)
            ? AVISO_IMPORTACOES
            : 'Não foi possível registrar a importação — os pedidos serão gravados sem o vínculo ' +
              'com o arquivo: ' +
              (falha instanceof Error ? falha.message : String(falha)),
        );
      }

      // envia em blocos para a barra de progresso andar de verdade
      for (let i = 0; i < total; i += 500) {
        const bloco = paraImportar.slice(i, i + 500);
        await inserirPedidos(fabricaId, bloco, importacaoId);
        enviados += bloco.length;
        setProgresso(Math.round((enviados / total) * 100));
      }

      /*
       * LOCAIS: depois de inserir, aplica os locais escolhidos na lista de
       * grupos. O banco casa pela ORD.COMPRA DENTRO desta importação, então só
       * as peças que acabaram de entrar recebem o local.
       */
      if (importacaoId !== null) {
        const escolhas: LocalEscolhido[] = [];
        paraImportar.forEach((linha) => {
          const grupo = String(linha.ordcompra ?? '');
          const doGrupo = locaisEscolhidos[grupo] ?? {};
          ESTAGIOS.forEach((estagio) => {
            const idbox = doGrupo[estagio];
            if (idbox) escolhas.push({ ordcompra: grupo, estagio, idbox });
          });
        });

        /* a mesma ORD.COMPRA se repete em várias linhas: manda uma vez só */
        const unicas = [...
          new Map(escolhas.map((item) => [`${item.ordcompra}|${item.estagio}`, item])).values()];

        if (unicas.length > 0) {
          try {
            await definirLocaisLote(fabricaId, importacaoId, unicas);
          } catch (falha) {
            setAviso(
              migracaoPendente(falha)
                ? AVISO_LOCAIS
                : 'Os pedidos foram importados, mas não foi possível gravar os locais: ' +
                  (falha instanceof Error ? falha.message : String(falha)),
            );
          }
        }
      }

      somOk();
      setEtapa(`${enviados} linha(s) importada(s) com sucesso.`);
      setLinhas([]);
      setNomeArquivo('');
      setArquivo(null);
      setDescartadas(0);
      setGruposMarcados(new Set());
      if (arquivoRef.current) arquivoRef.current.value = '';
      onConcluir();
    } catch (falha) {
      somErro();
      setEtapa('');
      setErro(mensagemDeImportacao(falha));
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
                Layout configurado desta fábrica:{' '}
                {layout.tipo === 'posicional'
                  ? `largura fixa (${Object.keys(layout.campos ?? {}).length} campo(s)` +
                    `${(layout.derivados && Object.keys(layout.derivados).length > 0) ? ` + ${Object.keys(layout.derivados).length} por regra` : ''})`
                  : `${Object.keys(layout.campos ?? {}).length} coluna(s) mapeada(s), separador “${rotuloSeparador(layout.delimitador)}”`}
                , começando na linha {layout.linha_inicial}
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
                {layoutEmUso.tipo === 'posicional'
                  ? '(largura fixa)'
                  : `(separador “${rotuloSeparador(layoutEmUso.separador)}”)`}
                {layoutEmUso.codificacao && layoutEmUso.codificacao !== 'UTF-8'
                  ? `, arquivo em ${layoutEmUso.codificacao}`
                  : ''}
                .
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
            <p className="mb-1 text-slate-700">
              Selecionar os pedidos (ORD.COMPRA) e definir onde as peças ficam em cada estágio:
            </p>

            {/* aplicar o mesmo local em todos os grupos marcados */}
            <div className="mb-2 flex flex-wrap items-center gap-2 rounded border border-slate-300 bg-slate-50 px-2 py-1.5">
              <span className="text-slate-600">Aplicar aos selecionados:</span>
              {ESTAGIOS.map((estagio) => (
                <label key={estagio} className="flex items-center gap-1">
                  {ROTULO_ESTAGIO[estagio]}
                  <select
                    value={emLote[estagio] ?? ''}
                    onChange={(e) =>
                      setEmLote((atual) => ({
                        ...atual,
                        [estagio]: e.target.value ? Number(e.target.value) : '',
                      }))
                    }
                    className="rounded border border-slate-300 px-1 py-1"
                  >
                    <option value="">—</option>
                    {locais.map((local) => (
                      <option key={local.idbox} value={local.idbox}>
                        {local.nmbox}
                      </option>
                    ))}
                  </select>
                </label>
              ))}
              <button
                onClick={aplicarEmLote}
                disabled={gruposMarcados.size === 0}
                className="rounded border border-slate-400 bg-white px-2 py-1 hover:bg-slate-100 disabled:opacity-50"
              >
                Aplicar
              </button>
              <span className="text-[11px] text-slate-500">
                {locais.length === 0
                  ? 'Nenhum local cadastrado — o administrador cadastra na tela "Locais".'
                  : `${locais.length} local(is) disponível(is)`}
              </span>
            </div>

            <div className="max-h-56 overflow-auto rounded border border-slate-300 p-2">
              {grupos.length === 0 && (
                <p className="text-slate-500">Escolha um arquivo para listar os pedidos encontrados.</p>
              )}
              {grupos.map((grupo) => {
                const escolha = locaisEscolhidos[grupo.ordcompra] ?? {};

                return (
                  <div
                    key={grupo.ordcompra}
                    className="flex flex-wrap items-center gap-2 border-b border-slate-100 py-1 last:border-b-0"
                  >
                    <label className="flex min-w-[190px] flex-1 items-center gap-2">
                      <input
                        type="checkbox"
                        checked={gruposMarcados.has(grupo.ordcompra)}
                        onChange={(e) => {
                          setGruposMarcados((atual) => {
                            const novo = new Set(atual);
                            if (e.target.checked) novo.add(grupo.ordcompra);
                            else novo.delete(grupo.ordcompra);
                            return novo;
                          });
                        }}
                      />
                      <span className="font-medium">{grupo.ordcompra || '(sem ORD.COMPRA)'}</span>
                      <span className="text-slate-500">
                        {grupo.quantidade} item(ns)
                        {grupo.cliente && grupo.cliente !== 'NÃO INFORMADO'
                          ? ` · ${grupo.cliente}`
                          : ''}
                      </span>
                    </label>

                    {ESTAGIOS.map((estagio) => (
                      <label
                        key={estagio}
                        className="flex items-center gap-1 text-[11px] text-slate-500"
                      >
                        {ROTULO_ESTAGIO[estagio]}
                        <select
                          value={escolha[estagio] ?? ''}
                          onChange={(e) =>
                            escolherLocal(grupo.ordcompra, estagio, Number(e.target.value))
                          }
                          className={`rounded border px-1 py-1 ${
                            escolha[estagio]
                              ? 'border-slate-300'
                              : 'border-amber-400 bg-amber-50 text-amber-800'
                          }`}
                        >
                          <option value="">sem local</option>
                          {locais.map((local) => (
                            <option key={local.idbox} value={local.idbox}>
                              {local.nmbox}
                            </option>
                          ))}
                        </select>
                      </label>
                    ))}
                  </div>
                );
              })}
            </div>
          </div>

          {pecasSemLocal > 0 && (
            <div className="rounded border border-amber-300 bg-amber-50 px-3 py-2 text-amber-800">
              {pecasSemLocal} peça(s) selecionada(s) ainda sem local definido em algum estágio:{' '}
              {semLocal
                .slice(0, 4)
                .map((item) => `${item.ordcompra || '(sem ORD.COMPRA)'} (${item.estagios.join('/')})`)
                .join(' · ')}
              {semLocal.length > 4 ? ` e mais ${semLocal.length - 4} pedido(s)` : ''}.<br />
              As peças entram assim mesmo — o local pode ser definido depois em “Locais das peças”.
            </div>
          )}

          {aviso && (
            <div className="rounded border border-amber-300 bg-amber-50 px-3 py-2 text-amber-800">{aviso}</div>
          )}
          {erro && <div className="rounded border border-red-300 bg-red-50 px-3 py-2 text-red-700">{erro}</div>}

          <div className="flex items-center justify-between border-t border-slate-200 pt-3">
            <span className="text-slate-500">
              {linhas.length} linha(s) lida(s) · {selecionadas} selecionada(s)
            </span>
            <button
              onClick={() => void importar()}              disabled={linhas.length === 0}
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
