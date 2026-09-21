/**
 * Marca do sistema dentro das telas internas.
 *
 * `IconeSistema` usa o mesmo arquivo do favicon (`/favicon.svg`), para o ícone
 * do cabeçalho nunca sair de sincronia com o ícone da aba do navegador.
 * Como o texto "SysConf" sempre aparece ao lado, a imagem fica decorativa
 * (`alt=""` + `aria-hidden`).
 */
export function IconeSistema({
  tamanho = 22,
  className = '',
}: {
  /** Lado do ícone em pixels (quadrado). */
  tamanho?: number;
  className?: string;
}) {
  return (
    <img
      src="/favicon.svg"
      alt=""
      aria-hidden="true"
      width={tamanho}
      height={tamanho}
      style={{ width: tamanho, height: tamanho }}
      className={`shrink-0 ${className}`}
    />
  );
}

/** Ícone + nome do produto, para o início dos cabeçalhos. */
export function Marca({ tamanho = 22, className = '' }: { tamanho?: number; className?: string }) {
  return (
    <span className={`flex items-center gap-2 ${className}`}>
      <IconeSistema tamanho={tamanho} />
      <span className="text-sm font-semibold tracking-wide">SysConf</span>
    </span>
  );
}
