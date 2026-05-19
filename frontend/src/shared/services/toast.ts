import { toast as sonner } from 'sonner';

/**
 * Wrapper sobre sonner. Padroniza durações e estilo entre os módulos.
 */
export const toast = {
  sucesso(msg: string, descricao?: string) {
    sonner.success(msg, { description: descricao, duration: 3500 });
  },
  erro(msg: string, descricao?: string) {
    sonner.error(msg, { description: descricao, duration: 6000 });
  },
  info(msg: string, descricao?: string) {
    sonner.info(msg, { description: descricao, duration: 3500 });
  },
  aviso(msg: string, descricao?: string) {
    sonner.warning(msg, { description: descricao, duration: 4500 });
  },
};
