// scripts/glitch.js
class Glitch {
  constructor() {
    this.canvas = null;
    this.ctx = null;
    this.raf = null;
    this.tick = 0;
    this.jitterTimer = null;
    this.active = false;
    this.target = document.documentElement; // 화면 흔들 타겟
  }

  _makeCanvas() {
    const c = document.createElement('canvas');
    c.id = 'glitchOverlay';
    Object.assign(c.style, {
      position: 'fixed',
      inset: '0',
      width: '100vw',
      height: '100vh',
      pointerEvents: 'none',
      zIndex: '9999',
      mixBlendMode: 'screen',
    });
    document.body.appendChild(c);
    this.canvas = c;
    this.ctx = c.getContext('2d', { willReadFrequently: true });
    this._resize();
    addEventListener('resize', () => this._resize());
  }

  _resize() {
    const dpr = Math.min(devicePixelRatio || 1, 2);
    this.canvas.width = innerWidth * dpr;
    this.canvas.height = innerHeight * dpr;
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  _loop = () => {
    this.tick++;
    // 30fps 정도로 제한
    if (this.tick % 2 === 0) {
      const { ctx, canvas } = this;
      const w = canvas.width, h = canvas.height;
      const img = ctx.createImageData(w, h);
      const data = img.data;
      // 흑백 노이즈
      for (let i = 0; i < data.length; i += 4) {
        const v = Math.random() * 255;
        data[i] = v; data[i + 1] = v; data[i + 2] = v;
        data[i + 3] = Math.random() < 0.6 ? 40 : 0; // 희미한 점
      }
      ctx.putImageData(img, 0, 0);

      // 스캔라인
      ctx.globalAlpha = 0.06;
      for (let y = 0; y < h; y += 3) {
        ctx.fillRect(0, y, w, 1);
      }
      ctx.globalAlpha = 1;

      // RGB 채널 살짝 분리
      const offset = (Math.random() * 6 - 3) | 0;
      if (offset !== 0) {
        const sliceH = (h * (0.2 + Math.random() * 0.6)) | 0;
        const y = (Math.random() * (h - sliceH)) | 0;
        const slice = ctx.getImageData(0, y, w, sliceH);
        ctx.putImageData(slice, offset, y);
      }

      // 수평 찢김
      if (Math.random() < 0.1) {
        const y = (Math.random() * h) | 0;
        const sw = (w * (0.3 + Math.random() * 0.4)) | 0;
        const sx = (Math.random() * (w - sw)) | 0;
        const sh = 8 + (Math.random() * 24) | 0;
        const slice = ctx.getImageData(sx, y, sw, sh);
        ctx.putImageData(slice, sx + (Math.random() * 20 - 10) | 0, y);
      }
    }
    this.raf = requestAnimationFrame(this._loop);
  };

  _startJitter() {
    const jitter = () => {
      if (!this.active) return;
      const dx = (Math.random() * 6 - 3).toFixed(2);
      const dy = (Math.random() * 6 - 3).toFixed(2);
      const rot = (Math.random() * 0.6 - 0.3).toFixed(2);
      this.target.style.transform = `translate(${dx}px, ${dy}px) rotate(${rot}deg)`;
      this.jitterTimer = setTimeout(jitter, 40 + (Math.random() * 60)|0);
    };
    jitter();
  }

  _stopJitter() {
    clearTimeout(this.jitterTimer);
    this.target.style.transform = '';
  }

  start(durationMs = 800) {
    if (this.active) return;
    this.active = true;
    if (!this.canvas) this._makeCanvas();
    this.canvas.style.display = 'block';
    this._loop();
    this._startJitter();
    if (durationMs) {
      setTimeout(() => this.stop(), durationMs);
    }
  }

  stop() {
    if (!this.active) return;
    this.active = false;
    cancelAnimationFrame(this.raf);
    this._stopJitter();
    if (this.canvas) this.canvas.style.display = 'none';
  }
}

window.glitch = new Glitch();
