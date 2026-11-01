/* 宠物的一生 · 声音
   一点钢琴，一点风。没有音频文件。 */

window.PL = window.PL || {};

PL.PetAudio = class {
  constructor() {
    this.ctx = null;
    this.master = null;
    this.enabled = true;
    this.started = false;
    this.noteTimer = null;
    this.delay = null;
    this.padGain = null;
    this.scale = [440, 523.25, 587.33, 659.25, 783.99, 880, 1046.5];
  }

  init() {
    if (this.ctx) return;
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    this.ctx = new AC();
    this.master = this.ctx.createGain();
    this.master.gain.value = 0;
    this.master.connect(this.ctx.destination);

    const delay = this.ctx.createDelay(1.0);
    delay.delayTime.value = 0.22;
    const feedback = this.ctx.createGain();
    feedback.gain.value = 0.28;
    const wet = this.ctx.createGain();
    wet.gain.value = 0.32;
    delay.connect(feedback);
    feedback.connect(delay);
    delay.connect(wet);
    wet.connect(this.master);
    this.delay = delay;

    // 低频暖垫
    const padGain = this.ctx.createGain();
    padGain.gain.value = 0.018;
    const padFilter = this.ctx.createBiquadFilter();
    padFilter.type = 'lowpass';
    padFilter.frequency.value = 460;
    padFilter.Q.value = 0.6;
    padGain.connect(padFilter);
    padFilter.connect(this.master);
    this.padGain = padGain;

    [110, 164.81, 220].forEach((f, i) => {
      const osc = this.ctx.createOscillator();
      osc.type = i === 2 ? 'sine' : 'triangle';
      osc.frequency.value = f;
      osc.detune.value = i === 1 ? 4 : -3;
      const g = this.ctx.createGain();
      g.gain.value = i === 0 ? 0.5 : 0.28;
      osc.connect(g);
      g.connect(padGain);
      osc.start();

      const lfo = this.ctx.createOscillator();
      lfo.frequency.value = 0.035 + i * 0.012;
      const lfoGain = this.ctx.createGain();
      lfoGain.gain.value = 0.008;
      lfo.connect(lfoGain);
      lfoGain.connect(padGain.gain);
      lfo.start();
    });

    this._scheduleNote(1200);
  }

  async start() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    if (this.ctx.state === 'suspended') {
      try { await this.ctx.resume(); } catch (e) {}
    }
    this.started = true;
    this.master.gain.cancelScheduledValues(this.ctx.currentTime);
    this.master.gain.setTargetAtTime(0.13, this.ctx.currentTime, 0.8);
  }

  setEnabled(on) {
    this.enabled = !!on;
    document.body.classList.toggle('audio-muted', !on);
    if (!this.ctx) {
      if (on) this.start();
      return;
    }
    const now = this.ctx.currentTime;
    this.master.gain.cancelScheduledValues(now);
    this.master.gain.setTargetAtTime(on ? 0.13 : 0, now, 0.35);
    if (on && this.ctx.state === 'suspended') this.ctx.resume();
  }

  _scheduleNote(delayMs) {
    clearTimeout(this.noteTimer);
    if (!this.enabled) return;
    this.noteTimer = setTimeout(() => {
      if (this.enabled && this.ctx && this.ctx.state === 'running') {
        this._musicBox();
        this._scheduleNote(2400 + Math.random() * 3200);
      } else {
        this._scheduleNote(1800);
      }
    }, delayMs);
  }

  _musicBox() {
    if (!this.ctx || !this.master) return;
    const t = this.ctx.currentTime + 0.02;
    const freq = this.scale[Math.floor(Math.random() * this.scale.length)];
    const osc = this.ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.value = freq;
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.055, t + 0.015);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 2.8);
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 3200;
    osc.connect(g);
    g.connect(filter);
    filter.connect(this.master);
    if (this.delay) filter.connect(this.delay);
    osc.start(t);
    osc.stop(t + 3);

    // 偶尔加一个高八度的泛音
    if (Math.random() > 0.62) {
      const o2 = this.ctx.createOscillator();
      o2.type = 'sine';
      o2.frequency.value = freq * 2;
      const g2 = this.ctx.createGain();
      g2.gain.setValueAtTime(0.0001, t + 0.08);
      g2.gain.exponentialRampToValueAtTime(0.018, t + 0.1);
      g2.gain.exponentialRampToValueAtTime(0.0001, t + 2.2);
      o2.connect(g2);
      g2.connect(this.master);
      o2.start(t + 0.08);
      o2.stop(t + 2.4);
    }
  }

  chime() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    if (this.ctx.state === 'suspended') this.ctx.resume();
    const t = this.ctx.currentTime + 0.01;
    [659.25, 880].forEach((f, i) => {
      const osc = this.ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.value = f;
      const g = this.ctx.createGain();
      g.gain.setValueAtTime(0.0001, t + i * 0.09);
      g.gain.exponentialRampToValueAtTime(0.045, t + i * 0.09 + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, t + i * 0.09 + 1.4);
      osc.connect(g);
      g.connect(this.master);
      osc.start(t + i * 0.09);
      osc.stop(t + i * 0.09 + 1.5);
    });
  }

  purr() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    if (this.ctx.state === 'suspended') this.ctx.resume();
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    osc.type = 'triangle';
    osc.frequency.value = 46;
    const lfo = this.ctx.createOscillator();
    lfo.frequency.value = 24;
    const lfoGain = this.ctx.createGain();
    lfoGain.gain.value = 12;
    lfo.connect(lfoGain);
    lfoGain.connect(osc.frequency);
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(0.05, t + 0.08);
    g.gain.linearRampToValueAtTime(0.0001, t + 0.85);
    osc.connect(g);
    g.connect(this.master);
    osc.start(t);
    lfo.start(t);
    osc.stop(t + 0.9);
    lfo.stop(t + 0.9);
  }

  ending() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    if (this.ctx.state === 'suspended') this.ctx.resume();
    const t = this.ctx.currentTime;
    [220, 329.63, 440].forEach((f, i) => {
      const osc = this.ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.value = f;
      const g = this.ctx.createGain();
      g.gain.setValueAtTime(0.0001, t + i * 0.4);
      g.gain.linearRampToValueAtTime(0.035, t + i * 0.4 + 0.5);
      g.gain.linearRampToValueAtTime(0.0001, t + i * 0.4 + 5);
      osc.connect(g);
      g.connect(this.master);
      osc.start(t + i * 0.4);
      osc.stop(t + i * 0.4 + 5.2);
    });
  }
};

PL.audio = new PL.PetAudio();
