import { useMemo, useState } from 'react';

/**
 * Ordenação das tabelas (asc/desc) — a mesma lógica para todas as telas que
 * usam `<table>` simples (Logs, Importações, Locais, Locais das peças,
 * Usuários, Fábricas). O grid da conferência usa o TanStack Table, mas compara
 * os valores com o `compararValores` daqui, para o resultado ser igual.
 */

export type Ordem = { campo: string; desc: boolean } | null;

/** Como o valor deve ser comparado: número, texto (pt-BR) ou a ordem dos estágios. */
export type TipoOrdenacao = 'numero' | 'texto' | 'status';

/** Aceita "1.234,50", "1234.5", "10" — devolve null quando não é número. */
export function comoNumero(valor: unknown): number | null {
  if (valor === null || valor === undefined || valor === '') return null;
  if (typeof valor === 'number') return Number.isFinite(valor) ? valor : null;

  const texto = String(valor).trim();
  if (!texto) return null;

  const normalizado = texto.includes(',')
    ? texto.replace(/\./g, '').replace(',', '.')
    : texto;
  const numero = Number(normalizado);
  return Number.isFinite(numero) ? numero : null;
}

/**
 * Compara dois valores como o usuário espera:
 *  - número ordena como número (QTDE 9 antes de 10);
 *  - texto ordena em português e entende número dentro do texto (ETQ2 antes de ETQ10);
 *  - status segue a ordem dos estágios (NORMAL, CONFERÊNCIA, SAÍDA, ENTREGA);
 *  - vazio sempre vai para o fim, nos dois sentidos.
 */
export function compararValores(
  a: unknown,
  b: unknown,
  tipo: TipoOrdenacao = 'texto',
): number {
  if (tipo === 'numero' || tipo === 'status') {
    const na = comoNumero(a);
    const nb = comoNumero(b);
    if (na === null && nb === null) return 0;
    if (na === null) return -1;
    if (nb === null) return 1;
    return na - nb;
  }

  const ta = String(a ?? '').trim();
  const tb = String(b ?? '').trim();
  if (!ta && !tb) return 0;
  if (!ta) return 1;
  if (!tb) return -1;

  return ta.localeCompare(tb, 'pt-BR', { numeric: true, sensitivity: 'base' });
}

export type CampoOrdenavel<T> = {
  /** Título mostrado no cabeçalho. */
  titulo: string;
  /** Como extrair o valor da linha (pode ser o campo cru — número ordena como número). */
  valor: (linha: T) => unknown;
  tipo?: TipoOrdenacao;
  /** Classe extra do `<th>` (ex.: alinhamento à direita). */
  classe?: string;
  /** Largura/estilo do `<th>`. */
  estilo?: React.CSSProperties;
};

export type Ordenacao<T> = {
  /** As linhas já na ordem escolhida. */
  linhas: T[];
  /** Ordem atual (null = ordem original, sem ordenação). */
  ordem: Ordem;
  /** Clique no cabeçalho: alterna asc → desc → sem ordenação. */
  alternar: (campo: string) => void;
  /** Valor de `valor(linha)` para o campo ordenado. */
  valorDe: (campo: string) => ((linha: T) => unknown) | undefined;
  /** Campo ordenado agora (ou null). */
  campo: string | null;
  /** Clique no cabeçalho (asc/desc), para usar direto no th. */
  aoClicar: (campo: string) => { onClick: () => void; title: string; className: string };
};

/**
 * Guarda a ordenação de uma tabela. `campos` descreve como extrair o valor de
 * cada coluna (o mesmo mapa usado no cabeçalho).
 */
export function useOrdenacao<T>(
  linhas: T[],
  campos: Record<string, CampoOrdenavel<T>>,
  inicial: string | null = null,
): Ordenacao<T> {
  const [ordem, setOrdem] = useState<Ordem>(inicial ? { campo: inicial, desc: false } : null);

  const ordenadas = useMemo(() => {
    if (!ordem) return linhas;
    const campo = campos[ordem.campo];
    if (!campo) return linhas;

    const fator = ordem.desc ? -1 : 1;
    /* cópia: não mexe no array recebido (React pode estar usando a mesma referência) */
    return [...linhas].sort(
      (a, b) => fator * compararValores(campo.valor(a), campo.valor(b), campo.tipo),
    );
  }, [linhas, ordem, campos]);

  function alternar(campo: string) {
    setOrdem((atual) => {
      if (!atual || atual.campo !== campo) return { campo, desc: false };
      if (!atual.desc) return { campo, desc: true };
      return atual.campo === campo ? null : { campo, desc: false };
    });
  }

  return {
    linhas: ordenadas,
    ordem,
    alternar,
    valorDe: (campo: string) => campos[campo]?.valor,
    campo: ordem?.campo ?? null,
    aoClicar: (campo: string) => ({
      onClick: () => alternar(campo),
      title: 'Clique para ordenar (asc/desc)',
      className: 'cursor-pointer select-none hover:text-slate-900',
    }),
  };
}

/**
 * Cabeçalho de coluna ordenável. Mostra ↕ quando há ordenação possível,
 * ▲ (asc) ou ▼ (desc) quando a coluna é a ordenada.
 */
export function ThOrdenavel({
  campo,
  titulo,
  ordem,
  aoAlternar,
  className = '',
  style,
}: {
  campo: string;
  titulo: string;
  ordem: Ordem;
  aoAlternar: (campo: string) => void;
  className?: string;
  style?: React.CSSProperties;
}) {
  const ativo = ordem?.campo === campo;
  const seta = ativo ? (ordem.desc ? '▼' : '▲') : '↕';

  return (
    <th
      className={`cursor-pointer select-none ${className}`}
      style={style}
      title={ativo ? (ordem.desc ? 'Ordenado do maior para o menor' : 'Ordenado do menor para o maior') : 'Clique para ordenar'}
      onClick={() => aoAlternar(campo)}
    >
      <span className="inline-flex items-center gap-1">
        {titulo}
        <span className={ativo ? 'text-slate-800' : 'text-slate-300'}>{seta}</span>
      </span>
    </th>
  );
}
