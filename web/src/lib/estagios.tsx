import { useMemo, useSyncExternalStore } from 'react';
import type { Estagio } from './api';

/**
 * Estágios da conferência (1..9) — cadastrados pela empresa na tela "Estágios".
 *
 * O contexto é preenchido uma vez pelo `Sysconf` (que já carrega a empresa e as
 * fábricas). Enquanto o banco não tiver o cadastro (migração 00111), vale
 * `ESTAGIOS_PADRAO` — os três estágios de sempre, então NADA muda de
 * comportamento por causa disso.
 *
 * Regra do fluxo (decisão do cliente): a etiqueta anda UM estágio por vez —
 * não pula (1 → 3) e não volta (3 → 2).
 */

/** Cores do legado (estilos.css: linha-1/2/3), usadas quando o estágio não tem cor. */
const CORES_PADRAO: Record<number, string> = {
  1: '#90ee90',
  2: '#f08080',
  3: '#0000ff',
};

/** Os três estágios que já existiam — fallback e semente do cadastro. */
export const ESTAGIOS_PADRAO: Estagio[] = [
  { numero: 1, nome: 'CONFERENCIA', cor: CORES_PADRAO[1], ativo: 1, pecas: 0 },
  { numero: 2, nome: 'SAIDA', cor: CORES_PADRAO[2], ativo: 1, pecas: 0 },
  { numero: 3, nome: 'ENTREGA', cor: CORES_PADRAO[3], ativo: 1, pecas: 0 },
];

/*
 * Os estágios ficam em uma store minúscula (fora do React) em vez de um
 * provider: assim QUALQUER tela usa `useEstagios()` sem receber a lista por
 * prop, e todas re-renderizam quando o cadastro muda.
 */
let estagiosAtuais: Estagio[] = ESTAGIOS_PADRAO;
const ouvintes = new Set<() => void>();

/** Chamado pelo Sysconf quando o cadastro é lido do banco (lista vazia = padrão). */
export function definirEstagios(lista: Estagio[]): void {
  estagiosAtuais = lista.length > 0 ? lista : ESTAGIOS_PADRAO;
  ouvintes.forEach((avisar) => avisar());
}

function inscrever(avisar: () => void): () => void {
  ouvintes.add(avisar);
  return () => {
    ouvintes.delete(avisar);
  };
}

export type Estagios = {
  /** Todos, como vieram do banco (inclui os desativados). */
  todos: Estagio[];
  /** Só os ativos, em ordem de fluxo — é o que a conferência oferece. */
  ativos: Estagio[];
  /** Número do último estágio ativo (destino final). */
  ultimo: number;
  /** Nome do estágio (0 = NORMAL). */
  nome: (numero: number) => string;
  /** Cor de fundo do estágio (null = usa a paleta padrão do CSS). */
  cor: (numero: number) => string | null;
  /** Rótulos por número, incluindo o 0 = NORMAL (para tabelas e logs). */
  rotulos: Record<number, string>;
};

function montar(todos: Estagio[]): Estagios {
  const ativos = [...todos]
    .filter((estagio) => Number(estagio.ativo) === 1)
    .sort((a, b) => a.numero - b.numero);

  const achar = (numero: number) => todos.find((estagio) => estagio.numero === numero);

  const nome = (numero: number) =>
    numero === 0 ? 'NORMAL' : (achar(numero)?.nome ?? `ESTAGIO ${numero}`);

  const rotulos: Record<number, string> = { 0: 'NORMAL' };
  todos.forEach((estagio) => {
    rotulos[estagio.numero] = estagio.nome;
  });

  return {
    todos,
    ativos,
    ultimo: ativos.length > 0 ? ativos[ativos.length - 1].numero : 3,
    nome,
    cor: (numero: number) => achar(numero)?.cor ?? CORES_PADRAO[numero] ?? null,
    rotulos,
  };
}

/** Acesso aos estágios dentro dos componentes. */
export function useEstagios(): Estagios {
  const todos = useSyncExternalStore(
    inscrever,
    () => estagiosAtuais,
    () => estagiosAtuais,
  );

  return useMemo(() => montar(todos), [todos]);
}

/**
 * Mensagens da regra de avanço: só vale ir para `atual + 1`.
 * Usada tanto pela tela de conferência quanto pelo cadastro (explicação).
 */
export const REGRA_ESTAGIOS =
  'A peça anda um estágio por vez: não é possível pular estágio nem voltar para um estágio anterior.';
