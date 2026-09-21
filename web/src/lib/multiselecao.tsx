import { useEffect, useRef, useState } from 'react';

/**
 * Combobox de MÚLTIPLA seleção — usado nos filtros (ex.: Situação/estágios da
 * conferência). O botão mostra o resumo da seleção e a lista abre com caixas
 * de marcar, com atalhos "Todos" e "Nenhum".
 *
 * Fecha ao clicar fora ou com Esc (mesmo comportamento do menu do topo).
 */

export type OpcaoCombobox<T extends string | number> = {
  valor: T;
  rotulo: string;
  /** Cor de apoio (a bolinha do estágio, por exemplo). */
  cor?: string | null;
  /** Quantidade mostrada à direita do rótulo (opcional). */
  contagem?: number;
};

type Props<T extends string | number> = {
  rotulo: string;
  opcoes: Array<OpcaoCombobox<T>>;
  selecionados: T[];
  aoMudar: (novos: T[]) => void;
  /** Texto quando nada está selecionado (significa "todos"). */
  placeholder?: string;
  /** Classe de largura da caixa suspensa. */
  largura?: string;
  titulo?: string;
};

export function ComboboxMultiplo<T extends string | number>({
  rotulo,
  opcoes,
  selecionados,
  aoMudar,
  placeholder = 'todos',
  largura = 'w-60',
  titulo,
}: Props<T>) {
  const [aberto, setAberto] = useState(false);
  const caixaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function fechar(evento: MouseEvent) {
      if (caixaRef.current && !caixaRef.current.contains(evento.target as Node)) {
        setAberto(false);
      }
    }
    function tecla(evento: KeyboardEvent) {
      if (evento.key === 'Escape') setAberto(false);
    }

    document.addEventListener('mousedown', fechar);
    document.addEventListener('keydown', tecla);
    return () => {
      document.removeEventListener('mousedown', fechar);
      document.removeEventListener('keydown', tecla);
    };
  }, []);

  const escolhidas = opcoes.filter((opcao) => selecionados.includes(opcao.valor));

  const resumo =
    escolhidas.length === 0
      ? placeholder
      : escolhidas.length === 1
        ? escolhidas[0].rotulo
        : `${escolhidas.length} selecionados`;

  function alternar(valor: T) {
    aoMudar(
      selecionados.includes(valor)
        ? selecionados.filter((item) => item !== valor)
        : [...selecionados, valor],
    );
  }

  return (
    <div className="relative" ref={caixaRef}>
      <button
        type="button"
        onClick={() => setAberto((atual) => !atual)}
        title={titulo ?? `Filtrar por ${rotulo}`}
        className={`flex items-center gap-1 rounded border px-2 py-1 ${
          escolhidas.length > 0
            ? 'border-slate-700 bg-slate-700 font-semibold text-white'
            : 'border-slate-400 bg-white hover:bg-slate-50'
        }`}
      >
        {rotulo}: {resumo}
        <span className="text-[9px]">▼</span>
      </button>

      {aberto && (
        <div
          className={`absolute left-0 top-full z-40 mt-1 ${largura} rounded border border-slate-300 bg-white py-1 text-slate-700 shadow-xl`}
        >
          <div className="flex items-center justify-between border-b border-slate-100 px-2 pb-1">
            <button
              type="button"
              onClick={() => aoMudar(opcoes.map((opcao) => opcao.valor))}
              className="text-[10px] font-semibold text-blue-700 hover:underline"
            >
              Todos
            </button>
            <button
              type="button"
              onClick={() => aoMudar([])}
              className="text-[10px] font-semibold text-slate-500 hover:underline"
            >
              Nenhum
            </button>
          </div>

          <div className="max-h-64 overflow-auto">
            {opcoes.map((opcao) => (
              <label
                key={String(opcao.valor)}
                className="flex cursor-pointer items-center gap-2 px-2 py-1 hover:bg-slate-100"
              >
                <input
                  type="checkbox"
                  checked={selecionados.includes(opcao.valor)}
                  onChange={() => alternar(opcao.valor)}
                />
                {opcao.cor !== undefined && (
                  <span
                    className="inline-block h-3 w-3 shrink-0 rounded-sm border border-slate-300"
                    style={{ background: opcao.cor ?? '#ffffff' }}
                  />
                )}
                <span className="flex-1 truncate">{opcao.rotulo}</span>
                {opcao.contagem !== undefined && (
                  <span className="text-slate-400">{opcao.contagem}</span>
                )}
              </label>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
