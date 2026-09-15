/**
 * Sons do app (substituem os .wav de App/audio usados por Util.GetSom).
 * Sintetizados com a Web Audio API para não depender de arquivos.
 */
let contexto: AudioContext | null = null;

function obterContexto(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctor) return null;
  if (!contexto) contexto = new Ctor();
  return contexto;
}

function tocar(frequencia: number, duracaoMs: number, tipo: OscillatorType = 'sine', volume = 0.15) {
  const ctx = obterContexto();
  if (!ctx) return;

  const oscilador = ctx.createOscillator();
  const ganho = ctx.createGain();
  oscilador.type = tipo;
  oscilador.frequency.value = frequencia;
  ganho.gain.value = volume;

  oscilador.connect(ganho);
  ganho.connect(ctx.destination);
  oscilador.start();
  oscilador.stop(ctx.currentTime + duracaoMs / 1000);
}

/** Etiqueta lida/alterada com sucesso. */
export function somOk() {
  tocar(1400, 90, 'sine');
}

/** Etiqueta não encontrada / operação inválida. */
export function somErro() {
  tocar(240, 260, 'square', 0.2);
}

/** Fechamento da conferência. */
export function somFechar() {
  tocar(700, 130, 'triangle');
}
