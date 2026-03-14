// Web Audio API sound effects for gacha — no external files needed

let audioCtx: AudioContext | null = null;

function getCtx(): AudioContext {
  if (!audioCtx) {
    audioCtx = new AudioContext();
  }
  return audioCtx;
}

function playTone(freq: number, duration: number, type: OscillatorType = "sine", volume = 0.15) {
  const ctx = getCtx();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, ctx.currentTime);
  gain.gain.setValueAtTime(volume, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start();
  osc.stop(ctx.currentTime + duration);
}

/** Drumroll building tension */
export function playDrumroll() {
  const ctx = getCtx();
  const duration = 2.0;
  // Rapid snare-like hits that increase in speed
  for (let i = 0; i < 40; i++) {
    const t = (i / 40) * duration;
    const gap = 0.15 - (i / 40) * 0.1;
    setTimeout(() => {
      const noise = ctx.createBufferSource();
      const buffer = ctx.createBuffer(1, ctx.sampleRate * 0.05, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let j = 0; j < data.length; j++) {
        data[j] = (Math.random() * 2 - 1) * 0.1;
      }
      noise.buffer = buffer;
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.08 + (i / 40) * 0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
      noise.connect(gain);
      gain.connect(ctx.destination);
      noise.start();
    }, (t + gap * i * 0.3) * 1000);
  }
}

/** Tier 1 (common) — simple chime */
export function playCommonReveal() {
  playTone(523, 0.3, "sine", 0.12);
  setTimeout(() => playTone(659, 0.3, "sine", 0.12), 100);
}

/** Tier 2 (rare) — ascending arpeggio */
export function playRareReveal() {
  playTone(523, 0.3, "sine", 0.15);
  setTimeout(() => playTone(659, 0.3, "sine", 0.15), 120);
  setTimeout(() => playTone(784, 0.4, "sine", 0.15), 240);
}

/** Tier 3 (ultra rare) — triumphant fanfare */
export function playUltraRareReveal() {
  const notes = [523, 659, 784, 1047];
  notes.forEach((freq, i) => {
    setTimeout(() => playTone(freq, 0.5, "sine", 0.18), i * 150);
    setTimeout(() => playTone(freq * 1.5, 0.5, "triangle", 0.08), i * 150 + 50);
  });
}

/** Tier 4 (legendary) — epic reveal with harmony */
export function playLegendaryReveal() {
  // Base fanfare
  const notes = [392, 523, 659, 784, 1047, 1319];
  notes.forEach((freq, i) => {
    setTimeout(() => {
      playTone(freq, 0.8, "sine", 0.2);
      playTone(freq * 1.25, 0.8, "triangle", 0.1); // harmony
      playTone(freq * 0.5, 0.8, "sine", 0.08); // sub bass
    }, i * 130);
  });
  // Shimmer
  setTimeout(() => {
    for (let i = 0; i < 8; i++) {
      setTimeout(() => playTone(2000 + Math.random() * 2000, 0.3, "sine", 0.04), i * 60);
    }
  }, 800);
}

/** Play reveal sound based on rarity */
export function playRevealSound(rarity: string) {
  switch (rarity) {
    case "tier4": return playLegendaryReveal();
    case "tier3": return playUltraRareReveal();
    case "tier2": return playRareReveal();
    default: return playCommonReveal();
  }
}

/** Whoosh sound for charge-up */
export function playChargeUp() {
  const ctx = getCtx();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = "sine";
  osc.frequency.setValueAtTime(100, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 2);
  gain.gain.setValueAtTime(0.08, ctx.currentTime);
  gain.gain.setValueAtTime(0.15, ctx.currentTime + 1.5);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 2.2);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start();
  osc.stop(ctx.currentTime + 2.5);
}

/** Explosion burst sound */
export function playBurst() {
  const ctx = getCtx();
  const noise = ctx.createBufferSource();
  const buffer = ctx.createBuffer(1, ctx.sampleRate * 0.3, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < data.length; i++) {
    data[i] = (Math.random() * 2 - 1) * (1 - i / data.length);
  }
  noise.buffer = buffer;
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.25, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
  const filter = ctx.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.setValueAtTime(2000, ctx.currentTime);
  noise.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);
  noise.start();
}
