/**
 * Leitura do arquivo escolhido pelo usuário.
 *
 * Os ERPs do setor geram dois tipos de arquivo: UTF-8 (mais novo) e ANSI
 * (Windows-1252, o antigo — o legado lia com Encoding.ASCII, então os acentos
 * já chegavam quebrados). Aqui tentamos UTF-8 e, quando aparecem caracteres
 * inválidos (U+FFFD), relemos como Windows-1252: é o que mantém "DORMITÓRIO"
 * legível sem o usuário ter que escolher nada.
 */

export type CodificacaoArquivo = 'UTF-8' | 'Windows-1252';

export type TextoArquivo = {
  texto: string;
  codificacao: CodificacaoArquivo;
};

const SUBSTITUTO = '\uFFFD';

export async function lerTextoDoArquivo(arquivo: File): Promise<TextoArquivo> {
  const bytes = new Uint8Array(await arquivo.arrayBuffer());

  const utf8 = new TextDecoder('utf-8').decode(bytes);
  if (!utf8.includes(SUBSTITUTO)) {
    return { texto: utf8, codificacao: 'UTF-8' };
  }

  /* acento corrompido: o arquivo é ANSI (Windows-1252) */
  return { texto: new TextDecoder('windows-1252').decode(bytes), codificacao: 'Windows-1252' };
}

/** Arquivo em base64 — é assim que o original fica guardado para ser baixado depois. */
export async function arquivoParaBase64(arquivo: File): Promise<string> {
  const bytes = new Uint8Array(await arquivo.arrayBuffer());
  let texto = '';
  const passo = 0x8000;
  for (let i = 0; i < bytes.length; i += passo) {
    texto += String.fromCharCode(...bytes.subarray(i, i + passo));
  }
  return btoa(texto);
}

/** Entrega o conteúdo guardado (base64) ao navegador como download. */
export function baixarBase64(conteudo: string, nomeArquivo: string): void {
  const binario = atob(conteudo);
  const bytes = new Uint8Array(binario.length);
  for (let i = 0; i < binario.length; i++) bytes[i] = binario.charCodeAt(i);

  const url = URL.createObjectURL(new Blob([bytes], { type: 'application/octet-stream' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = nomeArquivo;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

/** Tamanho em texto curto (KB/MB). */
export function tamanhoLegivel(bytes: number): string {
  if (!bytes) return '—';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

/**
 * Baixa um CSV com separador `;` e BOM — é o que faz o Excel abrir os acentos
 * certos (mesmo formato usado na exportação do grid de conferência).
 */
export function baixarCsv(nomeArquivo: string, cabecalho: string[], linhas: string[][]): void {
  const escapar = (valor: string) => `"${String(valor ?? '').replace(/"/g, '""')}"`;
  const texto = [
    cabecalho.map(escapar).join(';'),
    ...linhas.map((linha) => linha.map(escapar).join(';')),
  ].join('\r\n');

  const url = URL.createObjectURL(
    new Blob([`\uFEFF${texto}`], { type: 'text/csv;charset=utf-8' }),
  );
  const link = document.createElement('a');
  link.href = url;
  link.download = nomeArquivo;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
