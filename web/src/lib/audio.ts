/**
 * Sons do app (substituem os .wav de App/audio usados por Util.GetSom).
 * Sintetizados com a Web Audio API para não depender de arquivos.
 *
 * Correspondência com o legado (App/Util.cs):
 *   success      -> peça conferida com sucesso
 *   Exclamation  -> etiqueta já lida
 *   Air_Horn     -> conferência concluída (não há mais nada fora do alvo)
 *   ringout      -> etiqueta fora de sequência (já está em outro status)
 *   Error        -> etiqueta não encontrada
 *   BOX          -> box de destino anunciado
 */
let contexto: AudioContext | null = null;

function obterContexto(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctor) return null;
  if (!contexto) contexto = new Ctor();
  return contexto;
}

type Nota = { hz: number; ms: number; tipo?: OscillatorType; volume?: number; pausa?: number };

function tocarNota(nota: Nota, atrasoMs: number) {
  const ctx = obterContexto();
  if (!ctx) return;

  const inicio = ctx.currentTime + atrasoMs / 1000;
  const oscilador = ctx.createOscillator();
  const ganho = ctx.createGain();

  oscilador.type = nota.tipo ?? 'sine';
  oscilador.frequency.value = nota.hz;
  ganho.gain.setValueAtTime(nota.volume ?? 0.15, inicio);
  ganho.gain.exponentialRampToValueAtTime(0.0001, inicio + nota.ms / 1000);

  oscilador.connect(ganho);
  ganho.connect(ctx.destination);
  oscilador.start(inicio);
  oscilador.stop(inicio + nota.ms / 1000);
}

function tocar(notas: Nota[]) {
  let atraso = 0;
  for (const nota of notas) {
    tocarNota(nota, atraso);
    atraso += nota.ms + (nota.pausa ?? 40);
  }
}

/** Peça conferida com sucesso. */
export function somSuccess() {
  tocar([
    { hz: 1100, ms: 90 },
    { hz: 1600, ms: 140 },
  ]);
}

/** Etiqueta já lida (aviso, não é erro). */
export function somExclamation() {
  tocar([{ hz: 900, ms: 140, tipo: 'triangle' }]);
}

/** Conferência concluída (Air_Horn do legado). */
export function somAirHorn() {
  tocar([
    { hz: 400, ms: 220, tipo: 'sawtooth', volume: 0.12 },
    { hz: 300, ms: 320, tipo: 'sawtooth', volume: 0.12 },
  ]);
}

/** Etiqueta fora de sequência para o alvo atual. */
export function somRingout() {
  tocar([
    { hz: 1200, ms: 110, tipo: 'square', volume: 0.12 },
    { hz: 900, ms: 110, tipo: 'square', volume: 0.12 },
    { hz: 600, ms: 160, tipo: 'square', volume: 0.12 },
  ]);
}

/** Etiqueta não encontrada. */
export function somError() {
  tocar([
    { hz: 300, ms: 200, tipo: 'square', volume: 0.2 },
    { hz: 220, ms: 260, tipo: 'square', volume: 0.2 },
  ]);
}

/** Box de destino anunciado (o legado toca o recurso "BOX"). */
export function somBox() {
  tocar([{ hz: 1400, ms: 80, tipo: 'sine', volume: 0.18 }]);
}

/** Fechamento do painel de conferência. */
export function somFechar() {
  tocar([{ hz: 700, ms: 130, tipo: 'triangle' }]);
}

/**
 * Anuncia o box por voz (o legado dá a entender isso ao exibir/ler o box).
 * Usa a Web Speech API; se o navegador não suportar, não faz nada.
 */
export function falarBox(nome: string) {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
  const texto = String(nome ?? '').trim();
  if (!texto) return;

  const fala = new SpeechSynthesisUtterance(texto);
  fala.lang = 'pt-BR';
  fala.rate = 1.05;
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(fala);
}

/* Compatibilidade com as telas que já usavam estes nomes. */
export const somOk = somSuccess;
export const somErro = somError;
