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
