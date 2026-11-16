(function () {
  let audioCtx = null;

  function getAudioContext() {
    if (!audioCtx) {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      if (Ctx) audioCtx = new Ctx();
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      void audioCtx.resume();
    }
    return audioCtx;
  }

  function playTone(ctx, { freq, endFreq, type = 'sine', duration = 0.2, gain = 0.3, delay = 0 }) {
    const start = ctx.currentTime + delay;
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, start);
    if (endFreq) {
      osc.frequency.exponentialRampToValueAtTime(Math.max(20, endFreq), start + duration);
    }
    g.gain.setValueAtTime(0.0001, start);
    g.gain.linearRampToValueAtTime(Math.max(0.001, gain), start + 0.015);
    g.gain.exponentialRampToValueAtTime(0.0001, start + duration);
    osc.connect(g);
    g.connect(ctx.destination);
    osc.start(start);
    osc.stop(start + duration + 0.02);
  }

  function playSynthSound(key, volumeRatio) {
    const ctx = getAudioContext();
    if (!ctx || volumeRatio <= 0) return;

    const v = Math.min(1, Math.max(0, volumeRatio)) * 0.45;

    switch (key) {
      case 'itemBuy':
        playTone(ctx, { freq: 784, type: 'triangle', duration: 0.11, gain: v, delay: 0 });
        playTone(ctx, { freq: 1175, type: 'triangle', duration: 0.18, gain: v, delay: 0.07 });
        break;
      case 'itemSell':
        playTone(ctx, { freq: 988, type: 'sine', duration: 0.1, gain: v * 0.9, delay: 0 });
        playTone(ctx, { freq: 659, type: 'sine', duration: 0.16, gain: v * 0.9, delay: 0.08 });
        break;
      case 'dragon':
        playTone(ctx, { freq: 150, endFreq: 55, type: 'sawtooth', duration: 0.45, gain: v * 1.1, delay: 0 });
        playTone(ctx, { freq: 300, endFreq: 180, type: 'triangle', duration: 0.35, gain: v * 0.7, delay: 0.08 });
        break;
      case 'baron':
        playTone(ctx, { freq: 110, endFreq: 38, type: 'sawtooth', duration: 0.55, gain: v * 1.15, delay: 0 });
        playTone(ctx, { freq: 220, endFreq: 110, type: 'square', duration: 0.35, gain: v * 0.45, delay: 0.1 });
        break;
      case 'herald':
        playTone(ctx, { freq: 240, endFreq: 140, type: 'triangle', duration: 0.3, gain: v, delay: 0 });
        playTone(ctx, { freq: 360, endFreq: 260, type: 'sine', duration: 0.25, gain: v * 0.8, delay: 0.09 });
        break;
      case 'turret':
        playTone(ctx, { freq: 130, endFreq: 42, type: 'square', duration: 0.38, gain: v * 0.85, delay: 0 });
        playTone(ctx, { freq: 95, endFreq: 35, type: 'sawtooth', duration: 0.42, gain: v * 0.85, delay: 0.06 });
        break;
      case 'kill':
        playTone(ctx, { freq: 523, endFreq: 880, type: 'triangle', duration: 0.18, gain: v, delay: 0 });
        playTone(ctx, { freq: 1046, type: 'sine', duration: 0.22, gain: v * 0.9, delay: 0.08 });
        break;
      case 'firstBlood':
        playTone(ctx, { freq: 440, endFreq: 880, type: 'sawtooth', duration: 0.2, gain: v * 0.9, delay: 0 });
        playTone(ctx, { freq: 880, type: 'triangle', duration: 0.28, gain: v, delay: 0.1 });
        break;
      case 'doubleKill':
        playTone(ctx, { freq: 587, type: 'triangle', duration: 0.14, gain: v, delay: 0 });
        playTone(ctx, { freq: 784, type: 'triangle', duration: 0.2, gain: v, delay: 0.09 });
        break;
      case 'tripleKill':
        playTone(ctx, { freq: 587, type: 'triangle', duration: 0.12, gain: v, delay: 0 });
        playTone(ctx, { freq: 784, type: 'triangle', duration: 0.12, gain: v, delay: 0.08 });
        playTone(ctx, { freq: 1046, type: 'triangle', duration: 0.22, gain: v, delay: 0.16 });
        break;
      case 'quadraKill':
        playTone(ctx, { freq: 523, type: 'triangle', duration: 0.1, gain: v, delay: 0 });
        playTone(ctx, { freq: 659, type: 'triangle', duration: 0.1, gain: v, delay: 0.07 });
        playTone(ctx, { freq: 784, type: 'triangle', duration: 0.1, gain: v, delay: 0.14 });
        playTone(ctx, { freq: 1046, type: 'sawtooth', duration: 0.28, gain: v * 0.9, delay: 0.21 });
        break;
      case 'pentaKill':
        playTone(ctx, { freq: 523, type: 'triangle', duration: 0.1, gain: v, delay: 0 });
        playTone(ctx, { freq: 659, type: 'triangle', duration: 0.1, gain: v, delay: 0.07 });
        playTone(ctx, { freq: 784, type: 'triangle', duration: 0.1, gain: v, delay: 0.14 });
        playTone(ctx, { freq: 1046, type: 'triangle', duration: 0.12, gain: v, delay: 0.21 });
        playTone(ctx, { freq: 1318, type: 'sawtooth', duration: 0.38, gain: v, delay: 0.29 });
        break;
      case 'death':
        playTone(ctx, { freq: 280, endFreq: 95, type: 'sawtooth', duration: 0.36, gain: v * 0.8, delay: 0 });
        break;
      case 'enemyBad':
        playTone(ctx, { freq: 210, endFreq: 110, type: 'sawtooth', duration: 0.24, gain: v * 0.85, delay: 0 });
        playTone(ctx, { freq: 155, endFreq: 75, type: 'sawtooth', duration: 0.32, gain: v * 0.9, delay: 0.14 });
        break;
      case 'assist':
      default:
        playTone(ctx, { freq: 660, type: 'sine', duration: 0.14, gain: v * 0.85, delay: 0 });
        playTone(ctx, { freq: 880, type: 'sine', duration: 0.18, gain: v * 0.85, delay: 0.07 });
        break;
    }
  }

  window.mapEventToSoundKey = function mapEventToSoundKey(event) {
    if (!event) return 'dragon';
    if (event.isEnemyAdvantage) return 'enemyBad';
    if (event.iconType === 'first-blood') return 'firstBlood';
    if (event.iconType === 'double-kill') return 'doubleKill';
    if (event.iconType === 'triple-kill') return 'tripleKill';
    if (event.iconType === 'quadra-kill') return 'quadraKill';
    if (event.iconType === 'penta-kill') return 'pentaKill';

    switch (event.name) {
      case 'DragonKill':
        return 'dragon';
      case 'BaronKill':
        return 'baron';
      case 'HeraldKill':
      case 'HordeKill':
        return 'herald';
      case 'TurretKilled':
      case 'InhibKilled':
        return 'turret';
      case 'ChampionDeath':
        return 'death';
      case 'ChampionAssist':
        return 'assist';
      case 'FirstBlood':
        return 'firstBlood';
      case 'ChampionKill':
      case 'Multikill':
      case 'Ace':
      default:
        return 'kill';
    }
  };

  window.playLoLSound = function playLoLSound(key, soundConfig, sourceKind = 'preview') {
    const cfg = soundConfig || {};
    if (cfg.enabled === false) return;
    if (sourceKind === 'overlay' && cfg.playInOverlay === false) return;
    if (sourceKind === 'dedicated' && cfg.playInDedicatedUrls === false) return;
    if (cfg.triggers && cfg.triggers[key] === false) return;

    const volume = Math.min(1, Math.max(0, (cfg.volume ?? 70) / 100));
    if (volume <= 0) return;

    const customUrl = cfg.customFiles?.[key];
    if (customUrl) {
      const audio = new Audio(customUrl);
      audio.volume = volume;
      audio.play().catch(() => {
        playSynthSound(key, volume);
      });
      return;
    }

    playSynthSound(key, volume);
  };
})();
