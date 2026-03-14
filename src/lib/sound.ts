// Pachinko-style sound effects using Web Audio API

let audioCtx: AudioContext | null = null;

function getCtx(): AudioContext {
  if (!audioCtx || audioCtx.state === "closed") {
    audioCtx = new AudioContext();
  }
  if (audioCtx.state === "suspended") {
    audioCtx.resume();
  }
  return audioCtx;
}

/** キュイーン — rising pitch whoosh (pachinko charge) */
export function playKyuiin(duration = 2.5) {
  const ctx = getCtx();
  const t = ctx.currentTime;

  // Main rising tone
  const osc1 = ctx.createOscillator();
  osc1.type = "sine";
  osc1.frequency.setValueAtTime(200, t);
  osc1.frequency.exponentialRampToValueAtTime(2000, t + duration);

  // Harmonic
  const osc2 = ctx.createOscillator();
  osc2.type = "sine";
  osc2.frequency.setValueAtTime(400, t);
  osc2.frequency.exponentialRampToValueAtTime(4000, t + duration);

  // Modulation for wobble effect
  const lfo = ctx.createOscillator();
  lfo.type = "sine";
  lfo.frequency.setValueAtTime(6, t);
  lfo.frequency.linearRampToValueAtTime(20, t + duration);
  const lfoGain = ctx.createGain();
  lfoGain.gain.setValueAtTime(30, t);
  lfoGain.gain.linearRampToValueAtTime(100, t + duration);
  lfo.connect(lfoGain);
  lfoGain.connect(osc1.frequency);

  const gain1 = ctx.createGain();
  gain1.gain.setValueAtTime(0.01, t);
  gain1.gain.linearRampToValueAtTime(0.18, t + duration * 0.8);
  gain1.gain.linearRampToValueAtTime(0.25, t + duration);

  const gain2 = ctx.createGain();
  gain2.gain.setValueAtTime(0.01, t);
  gain2.gain.linearRampToValueAtTime(0.08, t + duration * 0.8);
  gain2.gain.linearRampToValueAtTime(0.12, t + duration);

  osc1.connect(gain1);
  gain1.connect(ctx.destination);
  osc2.connect(gain2);
  gain2.connect(ctx.destination);
  lfo.start(t);
  osc1.start(t);
  osc2.start(t);
  lfo.stop(t + duration + 0.1);
  osc1.stop(t + duration + 0.1);
  osc2.stop(t + duration + 0.1);
}

/** Color upgrade sound — brief ascending sweep (ギュン！) */
export function playColorUpgrade() {
  const ctx = getCtx();
  const t = ctx.currentTime;
  const osc = ctx.createOscillator();
  osc.type = "sawtooth";
  osc.frequency.setValueAtTime(300, t);
  osc.frequency.exponentialRampToValueAtTime(1500, t + 0.15);
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.15, t);
  gain.gain.exponentialRampToValueAtTime(0.001, t + 0.3);
  const filter = ctx.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.setValueAtTime(3000, t);
  osc.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);
  osc.start(t);
  osc.stop(t + 0.35);
}

/** Dice impact — heavy thud + metallic ring (ドン！ガシャン！) */
export function playDiceImpact() {
  const ctx = getCtx();
  const t = ctx.currentTime;

  // Low thud
  const osc = ctx.createOscillator();
  osc.type = "sine";
  osc.frequency.setValueAtTime(80, t);
  osc.frequency.exponentialRampToValueAtTime(30, t + 0.3);
  const thudGain = ctx.createGain();
  thudGain.gain.setValueAtTime(0.4, t);
  thudGain.gain.exponentialRampToValueAtTime(0.001, t + 0.4);
  osc.connect(thudGain);
  thudGain.connect(ctx.destination);
  osc.start(t);
  osc.stop(t + 0.5);

  // Metallic crash noise
  const noise = ctx.createBufferSource();
  const buffer = ctx.createBuffer(1, ctx.sampleRate * 0.4, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < data.length; i++) {
    data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.08));
  }
  noise.buffer = buffer;
  const noiseGain = ctx.createGain();
  noiseGain.gain.setValueAtTime(0.2, t);
  noiseGain.gain.exponentialRampToValueAtTime(0.001, t + 0.4);
  const bandpass = ctx.createBiquadFilter();
  bandpass.type = "bandpass";
  bandpass.frequency.setValueAtTime(2500, t);
  bandpass.Q.setValueAtTime(2, t);
  noise.connect(bandpass);
  bandpass.connect(noiseGain);
  noiseGain.connect(ctx.destination);
  noise.start(t);
}

/** Freeze / blackout sound — sudden cut + deep bass drop (プチュン) */
export function playFreeze() {
  const ctx = getCtx();
  const t = ctx.currentTime;

  // Sharp cut noise
  const noise = ctx.createBufferSource();
  const buffer = ctx.createBuffer(1, ctx.sampleRate * 0.05, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < data.length; i++) {
    data[i] = (Math.random() * 2 - 1) * (1 - i / data.length);
  }
  noise.buffer = buffer;
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.3, t);
  gain.gain.exponentialRampToValueAtTime(0.001, t + 0.05);
  noise.connect(gain);
  gain.connect(ctx.destination);
  noise.start(t);

  // Deep sub bass
  const sub = ctx.createOscillator();
  sub.type = "sine";
  sub.frequency.setValueAtTime(50, t + 0.1);
  sub.frequency.exponentialRampToValueAtTime(20, t + 1.5);
  const subGain = ctx.createGain();
  subGain.gain.setValueAtTime(0.3, t + 0.1);
  subGain.gain.exponentialRampToValueAtTime(0.001, t + 1.5);
  sub.connect(subGain);
  subGain.connect(ctx.destination);
  sub.start(t + 0.1);
  sub.stop(t + 1.6);
}

/** Revival / comeback sound — dramatic re-entry (復活！) */
export function playRevival() {
  const ctx = getCtx();
  const t = ctx.currentTime;

  // Reverse cymbal effect
  const noise = ctx.createBufferSource();
  const buffer = ctx.createBuffer(1, ctx.sampleRate * 0.8, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < data.length; i++) {
    const progress = i / data.length;
    data[i] = (Math.random() * 2 - 1) * progress * progress;
  }
  noise.buffer = buffer;
  const gain = ctx.createGain();
  gain.gain.setValueAtTime(0.01, t);
  gain.gain.linearRampToValueAtTime(0.25, t + 0.7);
  gain.gain.exponentialRampToValueAtTime(0.001, t + 0.85);
  const hp = ctx.createBiquadFilter();
  hp.type = "highpass";
  hp.frequency.setValueAtTime(500, t);
  hp.frequency.linearRampToValueAtTime(2000, t + 0.7);
  noise.connect(hp);
  hp.connect(gain);
  gain.connect(ctx.destination);
  noise.start(t);

  // Rising power tone
  const osc = ctx.createOscillator();
  osc.type = "sawtooth";
  osc.frequency.setValueAtTime(150, t);
  osc.frequency.exponentialRampToValueAtTime(800, t + 0.6);
  const oscGain = ctx.createGain();
  oscGain.gain.setValueAtTime(0.01, t);
  oscGain.gain.linearRampToValueAtTime(0.15, t + 0.5);
  oscGain.gain.exponentialRampToValueAtTime(0.001, t + 0.8);
  const lp = ctx.createBiquadFilter();
  lp.type = "lowpass";
  lp.frequency.setValueAtTime(500, t);
  lp.frequency.exponentialRampToValueAtTime(4000, t + 0.6);
  osc.connect(lp);
  lp.connect(oscGain);
  oscGain.connect(ctx.destination);
  osc.start(t);
  osc.stop(t + 0.9);
}

/** Card reveal fanfare — rarity-dependent (ジャーン！) */
export function playRevealFanfare(rarity: string) {
  const ctx = getCtx();
  const t = ctx.currentTime;

  const configs: Record<string, { notes: number[]; volume: number; shimmer: boolean }> = {
    tier1: { notes: [523, 659], volume: 0.12, shimmer: false },
    tier2: { notes: [523, 659, 784], volume: 0.15, shimmer: false },
    tier3: { notes: [392, 523, 659, 784, 1047], volume: 0.18, shimmer: true },
    tier4: { notes: [261, 392, 523, 659, 784, 1047, 1319], volume: 0.22, shimmer: true },
  };

  const cfg = configs[rarity] || configs.tier1;

  // Main fanfare chord
  cfg.notes.forEach((freq, i) => {
    const osc = ctx.createOscillator();
    osc.type = "sine";
    osc.frequency.setValueAtTime(freq, t + i * 0.08);
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(cfg.volume, t + i * 0.08 + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 1.5);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(t + i * 0.08);
    osc.stop(t + 1.6);

    // Octave harmony
    if (rarity === "tier3" || rarity === "tier4") {
      const h = ctx.createOscillator();
      h.type = "triangle";
      h.frequency.setValueAtTime(freq * 2, t + i * 0.08);
      const hg = ctx.createGain();
      hg.gain.setValueAtTime(0, t);
      hg.gain.linearRampToValueAtTime(cfg.volume * 0.3, t + i * 0.08 + 0.02);
      hg.gain.exponentialRampToValueAtTime(0.001, t + 1.5);
      h.connect(hg);
      hg.connect(ctx.destination);
      h.start(t + i * 0.08);
      h.stop(t + 1.6);
    }
  });

  // Shimmer sparkle for high rarities
  if (cfg.shimmer) {
    for (let i = 0; i < 12; i++) {
      const sparkle = ctx.createOscillator();
      sparkle.type = "sine";
      sparkle.frequency.setValueAtTime(3000 + Math.random() * 4000, t + 0.3 + i * 0.08);
      const sg = ctx.createGain();
      sg.gain.setValueAtTime(0.03, t + 0.3 + i * 0.08);
      sg.gain.exponentialRampToValueAtTime(0.001, t + 0.3 + i * 0.08 + 0.15);
      sparkle.connect(sg);
      sg.connect(ctx.destination);
      sparkle.start(t + 0.3 + i * 0.08);
      sparkle.stop(t + 0.3 + i * 0.08 + 0.2);
    }
  }
}

/** Heartbeat tension pulse */
export function playHeartbeat() {
  const ctx = getCtx();
  const t = ctx.currentTime;
  [0, 0.25].forEach((offset) => {
    const osc = ctx.createOscillator();
    osc.type = "sine";
    osc.frequency.setValueAtTime(50, t + offset);
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.2, t + offset);
    gain.gain.exponentialRampToValueAtTime(0.001, t + offset + 0.2);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(t + offset);
    osc.stop(t + offset + 0.25);
  });
}
