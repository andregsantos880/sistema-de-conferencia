/**
 * Wrapper sobre Web Speech API.
 * - speak() é fire-and-forget e cancela a fala anterior (bipe rápido não acumula fila).
 * - Em browsers sem suporte, faz fallback para um beep curto via Web Audio.
 */

let preferida: SpeechSynthesisVoice | null = null;
let audioCtx: AudioContext | null = null;

function escolherVoz(): SpeechSynthesisVoice | null {
  if (preferida) return preferida;
  if (typeof speechSynthesis === 'undefined') return null;
  const vozes = speechSynthesis.getVoices();
  preferida =
    vozes.find((v) => v.lang === 'pt-BR') ??
    vozes.find((v) => v.lang.startsWith('pt')) ??
    vozes[0] ?? null;
  return preferida;
}

if (typeof speechSynthesis !== 'undefined') {
  // Vozes carregam assincronamente — quando vierem, re-resolve preferida na próxima chamada
  speechSynthesis.onvoiceschanged = () => { preferida = null; };
}

export const tts = {
  speak(texto: string, opts: { rate?: number; volume?: number } = {}) {
    if (!texto) return;
    if (typeof speechSynthesis === 'undefined') return this.beep();
    try {
      const u = new SpeechSynthesisUtterance(texto);
      u.lang = 'pt-BR';
      u.rate = opts.rate ?? 1.1;
      u.volume = opts.volume ?? 1;
      const voz = escolherVoz();
      if (voz) u.voice = voz;
      speechSynthesis.cancel();
      speechSynthesis.speak(u);
    } catch {
      this.beep();
    }
  },
  beep(freq = 880, dur = 0.12) {
    try {
      audioCtx ??= new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const g = audioCtx.createGain();
      osc.frequency.value = freq;
      osc.connect(g);
      g.connect(audioCtx.destination);
      g.gain.setValueAtTime(0.15, audioCtx.currentTime);
      osc.start();
      osc.stop(audioCtx.currentTime + dur);
    } catch { /* sem áudio disponível */ }
  },
};
