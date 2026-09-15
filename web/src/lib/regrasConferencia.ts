/**
 * Regras de negócio da conferência — extraídas de App/Form1.cs do sistema legado.
 *
 * Este módulo é PURO (não faz I/O) para que as regras fiquem testáveis e em um
 * único lugar. O alvo da conferência é o número do status:
 *   1 = CONFERENCIA (entrada)   2 = SAIDA   3 = ENTREGA
 *
 * Regras do legado replicadas aqui:
 *  - A etiqueta só avança UM passo: a linha precisa estar em `alvo - 1`.
 *  - Se a linha já está no alvo  -> "Etiqueta já lida !"      (som Exclamation)
 *  - Se está em outro status     -> "Esta etiqueta está para X" (som ringout)
 *  - Não encontrada              -> erro                       (som Error)
 *  - Comparação da etiqueta: TRIM exato, primeira linha que casa.
 *  - "Restante": {linhas no alvo+1} de {linhas fora do alvo + linhas no alvo+1}
 *    e a conferência é considerada concluída quando não há linha fora do alvo.
 */
import type { Pedido } from './api';

export type Alvo = 1 | 2 | 3;

export type Som = 'success' | 'exclamation' | 'air_horn' | 'ringout' | 'error' | 'box';

export type ResultadoLeitura =
  | { tipo: 'vazio' }
  | { tipo: 'jaLida'; linha: Pedido; som: Som; mensagem: string }
  | {
      tipo: 'sucesso';
      linha: Pedido;
      linhaAtualizada: Pedido;
      som: Som;
      concluido: boolean;
      mensagem: string;
    }
  | { tipo: 'bloqueada'; linha: Pedido; som: Som; mensagem: string }
  | { tipo: 'naoEncontrada'; som: Som; mensagem: string };

/** Texto que o legado grava na coluna DsStatus (só exibição). */
export const DS_STATUS: Record<number, string> = {
  0: 'NORMAL',
  1: 'CONFERENCIA',
  2: 'SAIDA',
  3: 'ENTREGA',
};

export function statusDe(pedido: Pedido): number {
  return Number(pedido.status ?? 0);
}

/** Igual ao Consultar() do legado: TRIM comparado de forma exata, primeira ocorrência. */
export function localizarPorEtiqueta(linhas: Pedido[], etiqueta: string): Pedido | undefined {
  const alvo = etiqueta;
  return linhas.find((linha) => String(linha.etiqueta ?? '').trim() === alvo);
}

export type Restante = {
  /** Linhas que ainda não chegaram ao alvo. */
  foraDoAlvo: number;
  /** Linhas que já passaram do alvo (alvo + 1). */
  noAlvoSeguinte: number;
  texto: string;
  /** true quando não há mais nada para conferir (dispara o som Air_Horn no legado). */
  concluido: boolean;
};

export function calcularRestante(linhas: Pedido[], alvo: Alvo): Restante {
  const foraDoAlvo = linhas.filter((l) => statusDe(l) !== alvo).length;
  const noAlvoSeguinte = linhas.filter((l) => statusDe(l) === alvo + 1).length;

  return {
    foraDoAlvo,
    noAlvoSeguinte,
    texto: `Restante: ${noAlvoSeguinte} de ${foraDoAlvo + noAlvoSeguinte}`,
    concluido: noAlvoSeguinte === foraDoAlvo + noAlvoSeguinte,
  };
}

function comStatus(pedido: Pedido, status: number): Pedido {
  return { ...pedido, status };
}

/**
 * Classifica a leitura de uma etiqueta e devolve o desfecho do legado.
 * Não altera a lista — quem chama decide o que persistir.
 */
export function classificarLeitura(linhas: Pedido[], etiqueta: string, alvo: Alvo): ResultadoLeitura {
  const texto = etiqueta.trim();
  if (!texto) return { tipo: 'vazio' };

  const linha = localizarPorEtiqueta(linhas, texto);

  if (!linha) {
    return { tipo: 'naoEncontrada', som: 'error', mensagem: 'Etiqueta não encontrada !' };
  }

  const status = statusDe(linha);

  if (status === alvo) {
    return {
      tipo: 'jaLida',
      linha,
      som: 'exclamation',
      mensagem: 'Etiqueta já lida !',
    };
  }

  if (status === alvo - 1) {
    const linhaAtualizada = comStatus(linha, alvo);
    const depois = linhas.map((l) => (l.id === linha.id ? linhaAtualizada : l));
    const restante = calcularRestante(depois, alvo);

    return {
      tipo: 'sucesso',
      linha,
      linhaAtualizada,
      som: restante.concluido ? 'air_horn' : 'success',
      concluido: restante.concluido,
      mensagem: `${DS_STATUS[alvo]} registrado.`,
    };
  }

  return {
    tipo: 'bloqueada',
    linha,
    som: 'ringout',
    mensagem: `Esta etiqueta está para ${DS_STATUS[status] ?? status}`,
  };
}

/** Linhas já no alvo — no legado é o que o Fechar gravava; usado aqui só para conferência visual. */
export function linhasNoAlvo(linhas: Pedido[], alvo: Alvo): Pedido[] {
  return linhas.filter((l) => statusDe(l) === alvo);
}

/** Textos exibidos no painel quando a bipagem dá certo (peça / quantidade / pedido / box). */
export type InfoBipagem = {
  box: string;
  peca: string;
  quantidade: string;
  pedido: string;
  cliente: string;
  etiqueta: string;
};

export function montarInfoBipagem(
  pedido: Pedido,
  nomeDoBox: string | undefined,
): InfoBipagem {
  const descricao = [pedido.produto, pedido.descricao1].filter(Boolean).join(' · ');

  return {
    box: nomeDoBox ?? `Box ${pedido.idbox ?? ''}`.trim(),
    peca: descricao || '—',
    quantidade: String(pedido.qtde ?? ''),
    pedido: String(pedido.ordcompra ?? ''),
    cliente: String(pedido.cliente ?? '').trim(),
    etiqueta: String(pedido.etiqueta ?? '').trim(),
  };
}
