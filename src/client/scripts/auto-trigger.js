// scripts/auto-trigger.js
// 통합: superScare 정의 + 버튼 입력으로 강제 트리거
(() => {
  // -----------------------------
  // superScare 정의 (강렬한 시퀀스)
  // -----------------------------
  const SuperScare = {
    _fired: false,
    canvas: null,
    ctx: null,
    raf: null,
    audioCtx: null,
    seq: [],
    createCanvas() {
      if (this.canvas) return;
      const c = document.createElement('canvas');
      c.id = 'superScareCanvas';
      Object.assign(c.style, {
        position: 'fixed', inset: '0', width: '100vw', height: '100vh',
        pointerEvents: 'none', zIndex: 30000
      });
      document.body.appendChild(c);
      this.canvas = c;
      this.ctx = c.getContext('2d');
      this.resize();
      addEventListener('resize', () => this.resize());
    },
    resize() {
      if (!this.canvas) return;
      const dpr = Math.min(devicePixelRatio || 1, 2);
      this.canvas.width = innerWidth * dpr;
      this.canvas.height = innerHeight * dpr;
      this.ctx.setTransform(dpr,0,0,dpr,0,0);
    },
    ensureAudio() {
      if (this.audioCtx) return;
      try { this.audioCtx = new (window.AudioContext || window.webkitAudioContext)(); }
      catch (e) { this.audioCtx = null; }
    },
    playBuffer(url, when = 0) {
      if (!this.audioCtx) return;
      fetch(url).then(r => r.arrayBuffer()).then(b => {
        this.audioCtx.decodeAudioData(b, buf => {
          const src = this.audioCtx.createBufferSource();
          src.buffer = buf;
          const g = this.audioCtx.createGain();
          g.gain.value = 1;
          src.connect(g).connect(this.audioCtx.destination);
          src.start(this.audioCtx.currentTime + when);
        });
      }).catch(()=>{});
    },
    startSub(freq=40, dur=900) {
      if (!this.audioCtx) return;
      const o = this.audioCtx.createOscillator();
      const g = this.audioCtx.createGain();
      o.type = 'sine';
      o.frequency.value = freq;
      g.gain.value = 0;
      o.connect(g).connect(this.audioCtx.destination);
      o.start();
      g.gain.linearRampToValueAtTime(0.9, this.audioCtx.currentTime + 0.04);
      g.gain.exponentialRampToValueAtTime(0.0001, this.audioCtx.currentTime + dur/1000);
      setTimeout(()=>{ try{ o.stop(); }catch{} }, dur+300);
    },
    flash(count = 3) {
      const el = document.createElement('div');
      Object.assign(el.style, { position:'fixed', inset:0, zIndex:29999, pointerEvents:'none', background:'#fff', opacity:0 });
      document.body.appendChild(el);
      let i = 0;
      const next = () => {
        if (i++ >= count) { try{ el.remove(); }catch{}; return; }
        el.style.transition = 'opacity 40ms linear';
        el.style.opacity = '1';
        setTimeout(()=>{ el.style.opacity = '0'; setTimeout(next, 50 + Math.random()*80); }, 30 + Math.random()*40);
      };
      next();
    },
    heavyShake(duration = 1000) {
      const root = document.documentElement;
      const orig = root.style.transform || '';
      const start = performance.now();
      const step = (now) => {
        const t = now - start;
        const intensity = 12 * (1 - t / duration);
        const dx = (Math.random()*2-1) * intensity;
        const dy = (Math.random()*2-1) * intensity;
        const rot = (Math.random()*2-1) * intensity * 0.02;
        root.style.transform = `translate(${dx}px, ${dy}px) rotate(${rot}deg)`;
        if (t < duration) this.raf = requestAnimationFrame(step);
        else root.style.transform = orig;
      };
      this.raf = requestAnimationFrame(step);
    },
    drawGlitch() {
      if (!this.ctx) return;
      const ctx = this.ctx;
      const w = this.canvas.width, h = this.canvas.height;
      ctx.fillStyle = `rgba(0,0,0,${0.1 + Math.random() * 0.5})`;
      ctx.fillRect(0,0,w,h);
      // 노이즈 패치
      const sw = Math.min(200, w|0), sh = Math.min(140, h|0);
      const img = ctx.createImageData(sw, sh);
      for (let i = 0; i < img.data.length; i += 4) {
        const v = (Math.random()*255)|0;
        img.data[i] = v; img.data[i+1] = v; img.data[i+2] = v;
        img.data[i+3] = Math.random() < 0.6 ? (40 + Math.random()*180) : 0;
      }
      ctx.putImageData(img, Math.random()*(w-sw), Math.random()*(h-sh));
      // 가로 슬라이스
      if (Math.random() < 0.7) {
        const lines = 4 + (Math.random()*8)|0;
        for (let i=0;i<lines;i++){
          const y = (Math.random()*h)|0;
          const hh = 1 + (Math.random()*10)|0;
          const slice = ctx.getImageData(0,y,w,hh);
          ctx.putImageData(slice, (Math.random()*80-40)|0, y);
        }
      }
    },
    animateGlitch(ms = 1000) {
      const start = performance.now();
      const loop = (now) => {
        const t = now - start;
        this.drawGlitch();
        if (t < ms) this.raf = requestAnimationFrame(loop);
      };
      this.raf = requestAnimationFrame(loop);
    },
    showImage(selectorOrUrl, showMs = 700) {
      let img = null;
      if (typeof selectorOrUrl === 'string' && selectorOrUrl.startsWith('#')) {
        img = document.querySelector(selectorOrUrl);
      }
      if (!img) {
        img = document.createElement('img');
        img.src = selectorOrUrl || 'assets/jumpscare.png';
      }
      Object.assign(img.style, {
        position:'fixed', zIndex:31000, inset:0, margin:'auto', maxWidth:'95vw', maxHeight:'95vh',
        pointerEvents:'none', transform:'scale(1.2)', filter:'contrast(1.6) saturate(1.2)'
      });
      document.body.appendChild(img);
      img.animate([
        { transform:'scale(0.8) rotate(-6deg)', opacity:0 },
        { transform:'scale(1.2) rotate(6deg)', opacity:1, offset:0.6 },
        { transform:'scale(1.05) rotate(0deg)', opacity:1 }
      ], { duration: showMs, easing:'cubic-bezier(.2,.9,.2,1)' });
      setTimeout(()=>{ try{ img.remove(); }catch{} }, showMs + 40);
    },
    vibrate() { if (navigator.vibrate) navigator.vibrate([100,40,200]); },
    clearAll() {
      try{ cancelAnimationFrame(this.raf); }catch{}
      this.seq.forEach(id => clearTimeout(id));
      this.seq = [];
      if (this.canvas) try{ this.canvas.remove(); this.canvas = null; }catch{}
    },
    trigger(opts = {}) {
      if (this._fired) return;
      this._fired = true;
      this.createCanvas();
      this.ensureAudio();

      // 시퀀스: flash -> subbass -> scream layer -> shake+glitch -> show image -> cleanup
      this.flash(2);
      this.startSub(opts.subFreq || 36, opts.subDur || 1000);
      // 오디오 레이어 (파일 준비되어있으면 경로 넘겨라)
      if (opts.scream) this.playBuffer(opts.scream, 0.06);
      // 글리치 애니
      this.animateGlitch(opts.glitchMs || 1000);
      // 화면 흔들기
      this.heavyShake(opts.shakeMs || 1000);
      this.vibrate();

      // 피크 시점에 스케어 이미지 노출
      this.seq.push(setTimeout(() => {
        // 우선 기존 jumpscare 공개 함수 있으면 호출 시도
        const candidates = ['jumpscare','triggerJumpscare','startJumpscare','showJumpscare'];
        for (const n of candidates) {
          const fn = window[n];
          try { if (typeof fn === 'function') { fn(); return; } } catch(e){}
        }
        // 없으면 강제 이미지 노출
        this.showImage(opts.imgSelector || opts.imgUrl || '#scare-img' );
      }, opts.peakDelay || 240));

      // cleanup
      this.seq.push(setTimeout(() => {
        this.clearAll();
        this._fired = false; // 필요 시 재트리거 허용
      }, opts.totalMs || 1600));
    }
  };

  // 공개
  window.superScare = SuperScare;

  // -----------------------------
  // auto-trigger: 어떤 버튼이든 누르면 1회 강제 실행
  // -----------------------------
  let fired = false;
  function doTrigger() {
    if (fired) return;
    fired = true;

    // 우선 Glitch가 있으면 강한 글리치 시작
    try { if (window.glitch && typeof window.glitch.start === 'function') window.glitch.start(1000); } catch(e){}

    // 우선순위: superScare -> 기존 jumpscare 함수 -> 기본 이벤트 디스패치
    if (window.superScare && typeof window.superScare.trigger === 'function') {
      window.superScare.trigger({
        imgSelector: '#scare-img',        // 필요하면 바꿔라
        scream: 'assets/scream.mp3',      // 필요하면 바꿔라
        glitchMs: 1000, shakeMs: 1000, totalMs: 1600
      });
      return;
    }

    const candidates = ['jumpscare','triggerJumpscare','startJumpscare','showJumpscare'];
    for (const n of candidates) {
      const fn = window[n];
      if (typeof fn === 'function') { try { fn(); return; } catch(e){} }
      if (fn && typeof fn.trigger === 'function') { try { fn.trigger(); return; } catch(e){} }
      if (fn && typeof fn.start === 'function') { try { fn.start(); return; } catch(e){} }
    }

    // fallback: 전역 이벤트 발사
    window.dispatchEvent(new Event('jumpscare'));
    document.dispatchEvent(new Event('jumpscare'));
  }

  // 클릭: 실제 <button> 또는 role="button" 요소에 한정
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('button, [role="button"], a');
    if (btn) return;
  }, { capture: true });

  // 키보드: 활성화된 요소가 버튼 역할이면 Enter / Space로 트리거
  document.addEventListener('keydown', (e) => {
    if (!(e.key === 'Enter' || e.key === ' ')) return;
    const el = document.activeElement;
    if (!el) return;
    const isBtn = el.tagName === 'BUTTON' || el.getAttribute && el.getAttribute('role') === 'button' || el.tagName === 'A';
    if (isBtn) doTrigger();
  }, { capture: true });

  // 만약 테스트로 "페이지 어디든 눌러도" 트리거 하고 싶으면 아래 주석 해제
  // window.addEventListener('pointerdown', () => doTrigger(), { once: true });

})();

// 노래 관리 
window.Sound = {
  current: null,
  play(src, loop=false, vol=0.7){
    if(this.current){
      this.current.pause();
      this.current = null;
    }
    const audio = new Audio(src);
    audio.loop = loop;
    audio.volume = vol;
    audio.play().catch(()=>{});
    this.current = audio;
  },
  stop(){
    if(this.current){
      this.current.pause();
      this.current = null;
    }
  }
};