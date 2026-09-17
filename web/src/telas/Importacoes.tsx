import { useCallback, useEffect, useState } from 'react';
import {
  AVISO_IMPORTACOES,
  excluirImportacao,
  lerArquivoImportacao,
  listarImportacoes,
  migracaoPendente,
  type Empresa,
  type Importacao,
} from '../lib/api';
import { baixarBase64, tamanhoLegivel } from '../lib/arquivo';
import { PERFIL } from '../lib/config';

type Props = {
  empresa: Empresa;
  usuarioLogado: { id: number; login: string; perfil: string };
  onVoltar: () => void;
};

const dataHora = (valor: string): string => {
  const data = new Date(valor);
  return Number.isNaN(data.getTime()) ? String(valor) : data.toLocaleString('pt-BR');
};

/**
 * Arquivos importados: o que entrou na base, quando, por quem, quantas linhas
 * de cada arquivo — com o arquivo original para BAIXAR e a opção de EXCLUIR a
 * importação (o que apaga os pedidos que vieram dela).
 *
 * Excluir é ação de administrador: apaga pedidos de verdade.
 */
export default function Importacoes({ usuarioLogado, onVoltar }: Props) {
  const [importacoes, setImportacoes] = useState<Importacao[]>([]);
  const [selecionada, setSelecionada] = useState<Importacao | null>(null);
  const [filtroFabrica, setFiltroFabrica] = useState('');
  const [erro, setErro] = useState('');
  const [mensagem, setMensagem] = useState('');
  const [ocupado, setOcupado] = useState(false);
  const [migracaoOk, setMigracaoOk] = useState(true);

  const administrador = usuarioLogado.perfil === PERFIL.ADMIN;

  const carregar = useCallback(async () => {
    setErro('');
    try {
      const lista = await listarImportacoes();
      setImportacoes(lista);
      setMigracaoOk(true);
      setSelecionada((atual) =>
        atual ? (lista.find((i) => i.id === atual.id) ?? null) : (lista[0] ?? null),
      );
    } catch (falha) {
      if (migracaoPendente(falha)) {
        setMigracaoOk(false);
      } else {
        setErro(falha instanceof Error ? falha.message : 'Falha ao carregar as importações.');
      }
    }
  }, []);

  useEffect(() => {
    void carregar();
  }, [carregar]);

  const fábricas = [...new Set(importacoes.map((i) => i.fabrica))].sort((a, b) =>
    a.localeCompare(b, 'pt-BR'),
  );
  const visiveis = filtroFabrica
    ? importacoes.filter((i) => i.fabrica === filtroFabrica)
    : importacoes;

  const totais = visiveis.reduce(
    (soma, i) => ({
      arquivos: soma.arquivos + 1,
      linhas: soma.linhas + i.linhas_importadas,
      pedidos: soma.pedidos + Number(i.pedidos ?? 0),
      descartadas: soma.descartadas + i.linhas_descartadas,
    }),
    { arquivos: 0, linhas: 0, pedidos: 0, descartadas: 0 },
  );

  async function baixar(item: Importacao) {
    setErro('');
    setMensagem('');
    setOcupado(true);
    try {
      const arquivo = await lerArquivoImportacao(item.id);
      if (!arquivo?.conteudo) {
        setErro(
          `O conteúdo de "${item.nome_arquivo}" não foi guardado (importação feita pelo sistema antigo ou arquivo grande demais).`,
        );
        return;
      }
      baixarBase64(arquivo.conteudo, arquivo.nome_arquivo);
      setMensagem(`Download de "${arquivo.nome_arquivo}" iniciado.`);
    } catch (falha) {
      setErro(falha instanceof Error ? falha.message : 'Falha ao baixar o arquivo.');
    } finally {
      setOcupado(false);
    }
  }

  async function excluir(item: Importacao) {
    const pedidos = Number(item.pedidos ?? 0);
    if (
      !confirm(
        `Excluir a importação de "${item.nome_arquivo}" (${item.fabrica})?\n\n` +
          `${pedidos} pedido(s) desta importação serão APAGADOS da base.\n` +
          'Esta ação não pode ser desfeita.',
      )
    ) {
      return;
    }

    setErro('');
    setMensagem('');
    setOcupado(true);
    try {
      const apagados = await excluirImportacao(item.id);
      setMensagem(`Importação excluída — ${apagados} pedido(s) apagado(s).`);
      setSelecionada(null);
      await carregar();
    } catch (falha) {
      setErro(falha instanceof Error ? falha.message : 'Falha ao excluir a importação.');
    } finally {
      setOcupado(false);
    }
  }

  return (
    <div className="flex h-screen flex-col bg-slate-200 p-3">
      <div className="mb-2 flex items-center justify-between rounded border border-slate-300 bg-white px-3 py-2">
        <h1 className="text-sm font-semibold text-slate-700">
          Arquivos importados
          {!administrador && (
            <span className="ml-2 text-[11px] font-normal text-slate-500">
              (só o administrador exclui importações)
            </span>
          )}
        </h1>
        <div className="flex items-center gap-2">
          <label className="text-[11px] text-slate-600">
            Fábrica{' '}
            <select
              value={filtroFabrica}
              onChange={(e) => setFiltroFabrica(e.target.value)}
              className="rounded border border-slate-300 px-2 py-1 text-xs"
            >
              <option value="">todas</option>
              {fábricas.map((nome) => (
                <option key={nome} value={nome}>
                  {nome}
                </option>
              ))}
            </select>
          </label>
          <button
            onClick={() => void carregar()}
            disabled={ocupado}
            className="rounded border border-slate-300 px-3 py-1 text-xs hover:bg-slate-100 disabled:opacity-50"
          >
            Atualizar
          </button>
          <button
            onClick={onVoltar}
            className="rounded border border-slate-300 px-3 py-1 text-xs hover:bg-slate-100"
          >
            Voltar
          </button>
        </div>
      </div>

      {!migracaoOk && (
        <p className="mb-2 rounded border border-amber-400 bg-amber-50 px-3 py-2 text-[11px] text-amber-900">
          {AVISO_IMPORTACOES}
        </p>
      )}
      {erro && (
        <p className="mb-2 rounded border border-red-300 bg-red-50 px-3 py-2 text-[11px] text-red-700">
          {erro}
        </p>
      )}
      {mensagem && (
        <p className="mb-2 rounded border border-emerald-300 bg-emerald-50 px-3 py-2 text-[11px] text-emerald-800">
          {mensagem}
        </p>
      )}

      <div className="mb-2 flex flex-wrap gap-3 rounded border border-slate-300 bg-white px-3 py-2 text-xs text-slate-600">
        <span>
          Arquivos: <strong className="text-slate-800">{totais.arquivos}</strong>
        </span>
        <span>
          Linhas importadas: <strong className="text-slate-800">{totais.linhas}</strong>
        </span>
        <span>
          Linhas descartadas: <strong className="text-amber-700">{totais.descartadas}</strong>
        </span>
        <span>
          Pedidos na base: <strong className="text-emerald-700">{totais.pedidos}</strong>
        </span>
      </div>

      <div className="min-h-0 flex-1 overflow-auto rounded border border-slate-300 bg-white">
        <table className="w-full text-xs">
          <thead className="sticky top-0 bg-slate-100 text-left text-slate-600">
            <tr>
              <th className="px-3 py-2">Data / hora</th>
              <th className="px-3 py-2">Fábrica</th>
              <th className="px-3 py-2">Arquivo</th>
              <th className="px-3 py-2">Tamanho</th>
              <th className="px-3 py-2">Codificação</th>
              <th className="px-3 py-2 text-right">Linhas</th>
              <th className="px-3 py-2 text-right">Descartadas</th>
              <th className="px-3 py-2 text-right">Pedidos</th>
              <th className="px-3 py-2">Importado por</th>
              <th className="px-3 py-2 text-right">Ações</th>
            </tr>
          </thead>
          <tbody>
            {visiveis.length === 0 && (
              <tr>
                <td className="px-3 py-3 text-slate-500" colSpan={10}>
                  {migracaoOk
                    ? 'Nenhuma importação registrada ainda.'
                    : 'Aguardando a migração no banco.'}
                </td>
              </tr>
            )}
            {visiveis.map((item) => (
              <tr
                key={item.id}
                onClick={() => setSelecionada(item)}
                className={`cursor-pointer border-t border-slate-200 hover:bg-slate-50 ${
                  selecionada?.id === item.id ? 'bg-sky-50' : ''
                }`}
              >
                <td className="whitespace-nowrap px-3 py-1.5 text-slate-600">
                  {dataHora(item.criado_em)}
                </td>
                <td className="px-3 py-1.5">{item.fabrica}</td>
                <td className="max-w-[320px] truncate px-3 py-1.5 font-medium" title={item.nome_arquivo}>
                  {item.nome_arquivo}
                  {!item.tem_arquivo && (
                    <span className="ml-2 text-[10px] font-normal text-slate-400">
                      (sem arquivo guardado)
                    </span>
                  )}
                </td>
                <td className="px-3 py-1.5 text-slate-500">{tamanhoLegivel(item.tamanho_bytes)}</td>
                <td className="px-3 py-1.5 text-slate-500">{item.codificacao}</td>
                <td className="px-3 py-1.5 text-right">{item.linhas_importadas}</td>
                <td className="px-3 py-1.5 text-right text-amber-700">
                  {item.linhas_descartadas || ''}
                </td>
                <td className="px-3 py-1.5 text-right font-semibold text-emerald-700">
                  {item.pedidos}
                </td>
                <td className="px-3 py-1.5 text-slate-500">{item.usuario_login ?? '—'}</td>
                <td className="px-3 py-1.5">
                  <div className="flex justify-end gap-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        void baixar(item);
                      }}
                      disabled={ocupado || !item.tem_arquivo}
                      title={item.tem_arquivo ? 'Baixar o arquivo original' : 'Arquivo não guardado'}
                      className="rounded border border-slate-300 px-2 py-0.5 hover:bg-slate-100 disabled:opacity-40"
                    >
                      Baixar
                    </button>
                    {administrador && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          void excluir(item);
                        }}
                        disabled={ocupado}
                        className="rounded border border-red-300 px-2 py-0.5 text-red-700 hover:bg-red-50 disabled:opacity-50"
                      >
                        Excluir
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selecionada && (
        <div className="mt-2 rounded border border-slate-300 bg-white px-3 py-2 text-[11px] text-slate-600">
          <strong className="text-slate-800">{selecionada.nome_arquivo}</strong>
          {' · '}
          {selecionada.fabrica} (controle {selecionada.layout_controle}){' · '}
          importado em {dataHora(selecionada.criado_em)}
          {selecionada.usuario_login ? ` por ${selecionada.usuario_login}` : ''}
          {' · '}
          {selecionada.linhas_importadas} linha(s) importada(s)
          {selecionada.linhas_descartadas > 0
            ? `, ${selecionada.linhas_descartadas} descartada(s) pela leitura`
            : ''}
          {' · '}
          {selecionada.codificacao} · {tamanhoLegivel(selecionada.tamanho_bytes)} ·{' '}
          {Number(selecionada.pedidos ?? 0)} pedido(s) na base hoje
          {selecionada.tem_arquivo ? '' : ' · arquivo original não guardado'}
        </div>
      )}
    </div>
  );
}
