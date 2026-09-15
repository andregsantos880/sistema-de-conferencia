/**
 * Entrada usada SOMENTE no build (`npm run seo`).
 *
 * O site é uma SPA: o HTML publicado tinha ~1 KB e, para um robô de busca que
 * não executa JavaScript, a landing era invisível (só o <title>). Aqui a mesma
 * landing é renderizada para HTML estático em tempo de build e injetada no
 * dist/index.html — o conteúdo passa a existir na primeira resposta do servidor.
 *
 * Como é o MESMO componente que o usuário vê, não há conteúdo diferente para o
 * robô (nada de cloaking): o React assume depois, no navegador.
 *
 * A landing não usa API do navegador (só MARCA/TRIAL_DIAS de lib/config), por
 * isso pode ser renderizada no Node sem shims.
 */
import { renderToStaticMarkup } from 'react-dom/server';
import Juridico from './telas/Juridico';
import Landing from './telas/Landing';
import Registrar from './telas/Registrar';

export function htmlLanding(): string {
  return renderToStaticMarkup(<Landing />);
}

/** O formulário não envia nada no HTML estático: o React assume no navegador. */
export function htmlRegistrar(): string {
  return renderToStaticMarkup(<Registrar onEntrar={() => undefined} />);
}

export function htmlTermos(): string {
  return renderToStaticMarkup(<Juridico documento="termos" />);
}

export function htmlPrivacidade(): string {
  return renderToStaticMarkup(<Juridico documento="privacidade" />);
}
