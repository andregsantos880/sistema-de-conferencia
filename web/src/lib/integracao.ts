/**
 * Fábricas (LAYOUT) que POSSUEM integração de leitura de arquivo.
 *
 * Fonte: `Negocio/boPedido.cs` -> `CarregarDados()`, no `switch (arquivoIm.LayoutId)`.
 * Cada `case` chama um parser por fornecedor (ex.: `case 2 -> InserirCriare`).
 * A coluna `legado` é o `LayoutId` daquele switch e é mantida apenas para
 * auditoria/rastreabilidade — ela NÃO é o `controle` da tabela LAYOUT do banco:
 * a migração `20260914000002` gravou `controle` na ordem alfabética do cadastro
 * (o mesmo 3 é "Italinea" no legado e "CSV Padrão" no banco).
 *
 * Por isso a identificação é feita pelo NOME da fábrica, normalizado
 * (maiúsculas, sem acento, espaços colapsados).
 *
 * Estas fábricas são "fixadas" no topo dos combos de Fábrica (conferência e
 * importação) — ver `temIntegracao()` e `listarFabricas()` em `api.ts`.
 */

export const LAYOUTS_COM_INTEGRACAO: ReadonlyArray<{ legado: number; nome: string }> = [
  { legado: 1, nome: 'Todeschini' },
  { legado: 2, nome: 'Criare' },
  { legado: 3, nome: 'Italinea' },
  { legado: 4, nome: 'Unicasa' },
  { legado: 5, nome: 'DalMobile' },
  { legado: 6, nome: 'Romanzza' },
  { legado: 7, nome: 'Inusitta' },
  { legado: 8, nome: 'Idelli' },
  { legado: 9, nome: 'SCA' },
  { legado: 10, nome: 'Vitta' },
  { legado: 11, nome: 'Rudnick' },
  { legado: 12, nome: 'Simonetto' },
  { legado: 13, nome: 'Marel' },
  { legado: 14, nome: 'Italinea Loja' },
  { legado: 15, nome: 'Kasak' },
  { legado: 16, nome: 'Transpaese' },
  { legado: 17, nome: 'IMOBAL' },
  { legado: 18, nome: 'RIMO' },
  { legado: 19, nome: 'CASTINI' },
  { legado: 20, nome: 'Simonetto V2' },
  { legado: 21, nome: 'Bartzen' },
  { legado: 22, nome: 'Vivatto' },
  { legado: 23, nome: 'HRM' },
  { legado: 24, nome: 'MANFROI' },
  // o LayoutId 25 não existe no legado
  { legado: 26, nome: 'Jaeli' },
  { legado: 27, nome: 'Evviva' },
  { legado: 28, nome: 'BARTZ' },
  { legado: 29, nome: 'Evviva V2' },
  { legado: 30, nome: 'MovelMar' },
];

/** Normaliza o nome da fábrica para comparar cadastro x legado. */
export function normalizarNomeFabrica(valor: string | null | undefined): string {
  return String(valor ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, ' ')
    .trim();
}

const NOMES_COM_INTEGRACAO = new Set(LAYOUTS_COM_INTEGRACAO.map((item) => normalizarNomeFabrica(item.nome)));

/** Nome canônico (como está no legado) quando a fábrica tem integração. */
export function nomeIntegracao(nome: string | null | undefined): string | null {
  const normalizado = normalizarNomeFabrica(nome);
  if (!normalizado) return null;
  return LAYOUTS_COM_INTEGRACAO.find((item) => normalizarNomeFabrica(item.nome) === normalizado)?.nome ?? null;
}

/** A fábrica possui integração instalada (parser do legado)? */
export function temIntegracao(nome: string | null | undefined): boolean {
  return NOMES_COM_INTEGRACAO.has(normalizarNomeFabrica(nome));
}
