/* 宠物的一生 · 主程序
   没有服务器，没有账号。所有的一生，都留在这个浏览器里。 */

(function () {
  'use strict';

  const KEY = 'petlife.store.v1';
  const app = document.getElementById('app');
  const modal = document.getElementById('modal');
  const modalCard = document.getElementById('modal-card');
  const confirmDialog = document.getElementById('confirm');
  const confirmTitle = document.getElementById('confirm-title');
  const confirmText = document.getElementById('confirm-text');
  const toastEl = document.getElementById('toast');

  const STATS = [
    { key: 'health', label: '健康', icon: 'heart', color: '#7c9a6a' },
    { key: 'bond', label: '亲密', icon: 'paw', color: '#b8452f' },
    { key: 'curiosity', label: '好奇', icon: 'star', color: '#b08a4a' },
    { key: 'freedom', label: '自在', icon: 'leaf', color: '#64705a' },
  ];

  const WEATHER_LABEL = { rain: '雨', snow: '雪', clear: '晴', wind: '风' };
  const state = {
    view: 'home',
    meet: null,
    ending: null,
    modalRecord: null,
    confirmAction: null,
  };

  let store = loadStore();
  let toastTimer = null;
  let audioStarted = false;

  function defaultStore() {
    return { settings: { audio: true }, lives: [], run: null };
  }

  function loadStore() {
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return defaultStore();
      const data = JSON.parse(raw);
      const base = defaultStore();
      return {
        settings: { ...base.settings, ...(data.settings || {}) },
        lives: Array.isArray(data.lives) ? data.lives : [],
        run: data.run && data.run.speciesId ? data.run : null,
      };
    } catch (e) {
      return defaultStore();
    }
  }

  function saveStore() {
    try {
      localStorage.setItem(KEY, JSON.stringify(store));
    } catch (e) {
      showToast('这个浏览器不让我记住它。请检查存储空间。');
    }
  }

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, (m) => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
    }[m]));
  }

  function showToast(text) {
    clearTimeout(toastTimer);
    toastEl.textContent = text;
    toastEl.classList.add('show');
    toastTimer = setTimeout(() => toastEl.classList.remove('show'), 2600);
  }

  function say(text, c) {
    return PL.pronounize(text, c && c.he);
  }

  function cleanUserText(value, max) {
    return String(value == null ? '' : value)
      .replace(/<[^>]*>/g, '')
      .replace(/[<>]/g, '')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, max);
  }

  function statColor(key) {
    return (STATS.find((s) => s.key === key) || {}).color || '#26231f';
  }

  function statLabel(key) {
    return (STATS.find((s) => s.key === key) || {}).label || key;
  }

  function currentRun() {
    return store.run || null;
  }

  function ensureCompanions(run) {
    if (!run) return;
    if (!Array.isArray(run.companions) || !run.companions.length) {
      run.companions = PL.makeCompanions(run.speciesId);
    }
  }

  function startRun(speciesId, homeId) {
    const s = PL.SPECIES[speciesId];
    const h = PL.HOMES[homeId];
    if (!s || !h) return;
    const stats = {};
    Object.keys(s.base).forEach((k) => { stats[k] = PL.clamp(PL.jitter(s.base[k], 4)); });
    const theme = PL.getTodayTheme();
    store.run = {
      id: PL.uid(),
      speciesId,
      homeId,
      name: '',
      chapter: 0,
      age: 0,
      stats,
      flags: {},
      memories: [],
      companions: PL.makeCompanions(speciesId),
      themeId: theme.id,
      earlyDeath: false,
      pending: null,
      lastWords: '',
      startedAt: Date.now(),
    };
    saveStore();
    state.ending = null;
    state.meet = null;
    state.view = 'life';
    render();
    window.scrollTo(0, 0);
    PL.audio.chime();
  }

  function newFlow(next) {
    if (store.run) {
      askConfirm(
        '还有一段人生没有走完',
        '开始新的一生，会把现在这一段放下。它不会被送进回忆馆，也不会再回来。',
        () => {
          store.run = null;
          saveStore();
          next();
        }
      );
    } else {
      next();
    }
  }

  function chooseOption(index) {
    const run = currentRun();
    if (!run || run.pending) return;
    const ctx = PL.contextFor(run);
    const ch = PL.getChapterContent(run.chapter, ctx);
    if (!ch || !ch.options || !ch.options[index]) return;
    if (ch.input === 'name' && !run.name) {
      showToast('先给它一个名字吧。');
      return;
    }
    const opt = ch.options[index];
    const deltas = {};
    Object.keys(opt.effects || {}).forEach((k) => {
      if (run.stats[k] == null) run.stats[k] = 50;
      const before = run.stats[k];
      const after = PL.clamp(before + opt.effects[k]);
      run.stats[k] = after;
      const d = after - before;
      if (d !== 0) deltas[k] = d;
    });
    if (opt.flag) {
      if (Array.isArray(opt.flag)) opt.flag.forEach((f) => { run.flags[f] = true; });
      else run.flags[opt.flag] = true;
    }
    const memory = opt.memory
      ? { ...opt.memory, chapter: ch.no, chapterIndex: run.chapter }
      : null;
    if (memory) run.memories.push(memory);
    if (run.stats.health <= 8 && run.chapter >= 7) run.earlyDeath = true;
    const resultText = typeof opt.result === 'function' ? opt.result(ctx) : opt.result;
    run.pending = {
      optionIndex: index,
      deltas,
      resultText,
      memory,
      at: Date.now(),
    };
    saveStore();
    render({ top: false });
    PL.audio.chime();
    if (memory) showToast(`记住了一枚碎片 · ${memory.title}`);
    if (run.earlyDeath) {
      setTimeout(() => showToast('它的身体，没能撑过这个冬天。'), 900);
    }
    setTimeout(() => {
      const el = document.querySelector('.result');
      if (el && window.innerWidth < 900) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 120);
  }

  function nextChapter() {
    const run = currentRun();
    if (!run || !run.pending) return;
    run.pending = null;
    if (run.earlyDeath) {
      finishRun();
      return;
    }
    if (run.chapter >= PL.CHAPTERS.length - 1) {
      finishRun();
      return;
    }
    run.chapter += 1;
    const s = PL.SPECIES[run.speciesId];
    const ch = PL.getChapterContent(run.chapter, PL.contextFor(run));
    run.age = +(s.lifespan * (ch.frac || 0)).toFixed(2);
    if (ch.enter) {
      Object.keys(ch.enter).forEach((k) => {
        run.stats[k] = PL.clamp((run.stats[k] || 0) + ch.enter[k]);
      });
    }
    saveStore();
    render({ top: true });
    window.scrollTo(0, 0);
  }

  function finishRun() {
    const run = currentRun();
    if (!run) return;
    const s = PL.SPECIES[run.speciesId];
    if (!run.earlyDeath) run.age = s.lifespan;
    const record = PL.buildRecord(run);
    record.candle = 0;
    store.lives.unshift(record);
    if (store.lives.length > 60) store.lives = store.lives.slice(0, 60);
    store.run = null;
    state.ending = record;
    state.view = 'ending';
    saveStore();
    render();
    window.scrollTo(0, 0);
    PL.audio.ending();
  }

  function setPetName(name) {
    const run = currentRun();
    if (!run) return;
    const clean = cleanUserText(name, 8);
    if (!clean) {
      const input = document.querySelector('.name-input');
      if (input) {
        input.classList.add('shake');
        setTimeout(() => input.classList.remove('shake'), 450);
        input.focus();
      }
      showToast('总得有个名字，它才找得到你。');
      return;
    }
    run.name = clean;
    saveStore();
    render({ top: false });
    showToast(`它记住了：${clean}`);
    setTimeout(() => {
      const el = document.querySelector('.choices');
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);
  }

  function saveLastWords(words) {
    const record = state.ending;
    if (!record) return;
    const clean = cleanUserText(words, 40);
    record.lastWords = clean;
    const stored = store.lives.find((l) => l.id === record.id);
    if (stored) stored.lastWords = clean;
    saveStore();
    state.ending = record;
    render({ top: false });
    if (clean) showToast('这句话，写进它的一生了。');
  }

  function updateRecord(record) {
    const idx = store.lives.findIndex((l) => l.id === record.id);
    if (idx >= 0) store.lives[idx] = record;
    if (state.ending && state.ending.id === record.id) state.ending = record;
    if (state.modalRecord && state.modalRecord.id === record.id) state.modalRecord = record;
    saveStore();
  }

  function lightCandle(record) {
    if (!record) return;
    record.candle = (record.candle || 0) + 1;
    updateRecord(record);
    const count = document.getElementById('candle-count');
    if (count) count.textContent = String(record.candle);
    const modalCount = document.querySelector('[data-candle-count]');
    if (modalCount) modalCount.textContent = String(record.candle);
    PL.audio.chime();
    showToast(record.candle === 1 ? '为它点了一盏灯。' : `第 ${record.candle} 盏灯。`);
  }

  async function shareRecord(record) {
    if (!record) return;
    showToast('正在把这一生画成一张卡……');
    try {
      const canvas = document.createElement('canvas');
      await PL.drawShareCard(canvas, record);
      const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/png'));
      if (!blob) throw new Error('no blob');
      const safeName = String(record.name || 'pet').replace(/[\\/:*?"<>|]/g, '_');
      const file = new File([blob], `宠物的一生-${safeName}.png`, { type: 'image/png' });
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        try {
          await navigator.share({
            files: [file],
            title: '宠物的一生',
            text: record.shareLine,
          });
          return;
        } catch (err) {
          if (err && err.name === 'AbortError') return;
        }
      }
      PL.downloadCanvas(canvas, `宠物的一生-${safeName}.png`);
      showToast('一生卡已保存到下载。');
    } catch (e) {
      showToast('这张卡没画出来。请通过本地服务器打开页面再试。');
    }
  }

  function askConfirm(title, text, onYes) {
    confirmTitle.textContent = title;
    confirmText.textContent = text;
    state.confirmAction = onYes;
    if (confirmDialog.open) confirmDialog.close();
    confirmDialog.showModal();
  }

  function closeModal() {
    if (modal.open) modal.close();
    state.modalRecord = null;
  }

  function openModal(html) {
    modalCard.innerHTML = html;
    if (!modal.open) modal.showModal();
    document.body.style.overflow = 'hidden';
  }

  function go(view) {
    state.view = view;
    state.modalRecord = null;
    document.body.classList.remove('nav-open');
    const menuBtn = document.querySelector('.menu-btn');
    if (menuBtn) menuBtn.setAttribute('aria-expanded', 'false');
    render();
    window.scrollTo(0, 0);
  }

  function render(opts = {}) {
    let html = '';
    if (state.view === 'home') html = renderHome();
    else if (state.view === 'select') html = renderSelect();
    else if (state.view === 'meet') html = renderMeet();
    else if (state.view === 'life') html = renderLife();
    else if (state.view === 'ending') html = renderEnding();
    else if (state.view === 'memorial') html = renderMemorial();
    else if (state.view === 'about') html = renderAbout();
    else html = renderHome();

    app.innerHTML = html;
    document.title = pageTitle();
    if (opts.top !== false) window.scrollTo(0, 0);
  }

  function pageTitle() {
    const map = {
      home: '宠物的一生 · 一爪一生',
      select: '九种灵魂 · 宠物的一生',
      meet: '相遇 · 宠物的一生',
      life: '这一生 · 宠物的一生',
      ending: '它的一生 · 宠物的一生',
      memorial: '回忆馆 · 宠物的一生',
      about: '关于 · 宠物的一生',
    };
    return map[state.view] || map.home;
  }

  /* ---------------- 页脚 ---------------- */

  function footer() {
    return `<footer class="site-footer">
      <div class="footer-inner">
        <div>
          <h2 class="footer-title">宠物的一生<span>。</span></h2>
          <p class="footer-sub">它的一辈子，是你人生里的一小段。你的一小段，是它的一辈子。<br>这是一个没有评分、没有广告的小游戏。所有的一生，只留在你的浏览器里。</p>
        </div>
        <div class="footer-links">
          <button data-nav="home">首页</button>
          <button data-nav="select">九种灵魂</button>
          <button data-nav="memorial">回忆馆</button>
          <button data-nav="about">关于</button>
          <a href="https://1in8b.life/zh-hans/" target="_blank" rel="noopener">1in8b.life ↗</a>
        </div>
      </div>
      <div class="footer-bottom">
        <span>© 2026 宠物的一生 · 一个深夜的小实验</span>
        <span>灵感来自 1in8b.life · 不是官方作品</span>
      </div>
    </footer>`;
  }

  /* ---------------- 首页 ---------------- */

  function renderHome() {
    const today = PL.getTodayTheme();
    const lives = store.lives.slice(0, 3);
    const run = store.run;
    const rail = PL.SPECIES_LIST.map((s) => `
      <button class="rail-card" data-action="choose-species" data-id="${s.id}">
        <div class="rail-card-img"><img src="${PL.portraitPath(s.id)}" alt="${esc(s.name)}" loading="lazy"></div>
        <div class="rail-card-body">
          <div class="rail-card-name">${esc(s.name)}<em>${esc(s.en)}</em></div>
          <div class="rail-card-line">${esc(s.tagline)}</div>
          <div class="rail-card-meta"><span>一生约 ${s.lifespan} 年</span><span>${s.tags[0]} · ${s.tags[1]}</span></div>
        </div>
      </button>`).join('');

    const preview = lives.length
      ? `<div class="preview-grid">${lives.map((l) => `
          <button class="preview-card" data-action="open-life" data-id="${esc(l.id)}">
            <img src="${PL.portraitPath(l.speciesId)}" alt="${esc(l.name)}" loading="lazy">
            <div>
              <div class="preview-card-name">${esc(l.name)}</div>
              <div class="preview-card-meta">${esc(l.speciesName)} · ${esc(l.ageLabel)}<br>${esc(l.endingTitle)}</div>
            </div>
          </button>`).join('')}</div>`
      : `<div class="empty-memorial">
          <div class="lantern" aria-hidden="true"></div>
          <p><strong>这里还很空。</strong>等第一只动物走完它的一生，这里会亮起一盏灯。<br>它不会消失，除非你亲手删掉。</p>
        </div>`;

    return `<div class="view-enter">
      ${run ? resumeBar(run) : ''}
      <section class="home-hero">
        <div class="hero-copy">
          <span class="eyebrow">A PET'S LIFE · 一爪一生</span>
          <h1 class="hero-title"><span>宠物</span><span>的一生<span class="dot">.</span></span></h1>
          <p class="hero-sub">它的一辈子，是你人生里的一小段。<br><strong>你的一小段，是它的一辈子。</strong></p>
          <p class="hero-sub" style="margin-top:14px;font-size:14px;color:var(--soft)">用十二分钟，陪一只动物过完它的一生。你会记得它的名字。</p>
          <div class="hero-cta">
            <button class="btn btn-primary btn-lg" data-action="random">${PL.icon('sparkle')} 投胎成一只动物</button>
            <button class="btn btn-ghost btn-lg" data-nav="select">看看九种灵魂 ${PL.icon('arrow')}</button>
          </div>
          <p class="hero-note">无需登录 · 没有广告 · 一生卡只留在你的浏览器里</p>
          <div class="hero-stats">
            <div class="hero-stat"><strong>9</strong><span>种动物</span></div>
            <div class="hero-stat"><strong>6</strong><span>种相遇</span></div>
            <div class="hero-stat"><strong>11</strong><span>次选择</span></div>
            <div class="hero-stat"><strong>12</strong><span>分钟，一生</span></div>
          </div>
        </div>
        <div class="hero-art">
          <div class="hero-vertical">ペットのいっしょう · 一爪一生</div>
          <div class="arch">
            <img src="assets/art/hero.jpg" alt="午后窗边的一只橘猫" fetchpriority="high">
          </div>
          <span class="seal">一生</span>
          <div class="hero-caption">“它只是你人生里的一章。<br>你却是它的一辈子。”<span>PAWPRINT · 2026</span></div>
          <span class="hero-stamp">九种灵魂 · 六种相遇 · 一个家</span>
        </div>
      </section>

      <section class="section">
        <div class="section-head">
          <div><span class="eyebrow">HOW IT WORKS</span><h2 class="section-title">三次呼吸，走完一生</h2></div>
          <p class="section-sub">没有属性加点，没有十连抽。你只做选择，然后看着它一点一点，变成它自己。</p>
        </div>
        <div class="steps">
          <div class="step"><div class="step-num">01</div><h3>抽一个家</h3><p>你没法选择出生。随机遇见一个人、一间屋子、一种气味。有些家很吵，有些家很安静，有些家只有一个人。</p></div>
          <div class="step"><div class="step-num">02</div><h3>做十一次选择</h3><p>咬坏一双鞋，还是咬他的手；在门口等他，还是跟他走。每个选择都只是选择，没有对错，也没有存档。</p></div>
          <div class="step"><div class="step-num">03</div><h3>留下一张一生卡</h3><p>它会走完这一生。你可以带走一张卡，也可以把它安放在回忆馆。下一次，它会变成另一只动物。</p></div>
        </div>
      </section>

      <section class="section">
        <div class="section-head">
          <div><span class="eyebrow">NINE SOULS</span><h2 class="section-title">九种灵魂，九种一生</h2></div>
          <p class="section-sub">不是强度榜。每一种动物都有自己的时间尺度：仓鼠的一生只有两年半，鹦鹉可以陪你二十年。</p>
        </div>
        <div class="species-rail">${rail}</div>
      </section>

      <section class="section">
        <div class="theme-panel" style="--theme-color:${today.color}">
          <div class="theme-char">${esc(today.char)}</div>
          <div class="theme-copy">
            <div class="theme-kicker">今日主题 · ${esc(today.title)}</div>
            <h2>${esc(today.line)}<small>${esc(today.essay)}</small></h2>
            <div class="theme-actions">
              <button class="btn btn-primary" data-action="random">带着这个主题出生 ${PL.icon('arrow')}</button>
              <button class="btn btn-ghost" data-nav="about">为什么要做这个</button>
            </div>
          </div>
        </div>
      </section>

      <section class="section">
        <div class="section-head">
          <div><span class="eyebrow">MEMORIAL</span><h2 class="section-title">回忆馆</h2></div>
          <p class="section-sub">每一段被认真走过的一生，都会在这里留一盏灯。没有排名，没有点赞，只有名字。</p>
        </div>
        ${preview}
        <div style="display:flex;justify-content:flex-end;margin-top:16px">
          <button class="btn btn-ghost btn-sm" data-nav="memorial">进入回忆馆 ${PL.icon('arrow')}</button>
        </div>
        <div class="inspiration-note">
          <div class="mark">“</div>
          <p>这个游戏的骨架，借自 <a href="https://1in8b.life/zh-hans/" target="_blank" rel="noopener">《80亿分之1》</a>：随机出生、有限的一生、同一秒出生的其他人、以及一个安放逝者的追思馆。我们把它从“人”换成了“宠物”，从国家统计换成了六个普通的家。<br>不是官方作品，只是一次认真的致敬。</p>
        </div>
      </section>
      ${footer()}
    </div>`;
  }

  function resumeBar(run) {
    const s = PL.SPECIES[run.speciesId];
    if (!s) return '';
    return `<div class="resume-bar">
      <div class="resume-copy"><span class="resume-kicker">有一段人生还没有走完</span><strong>${esc(run.name || '还没有名字')}</strong><span>${esc(s.name)} · 第 ${run.chapter + 1} / ${PL.CHAPTERS.length} 话</span></div>
      <button class="btn btn-primary btn-sm" data-action="resume">继续它的一生 ${PL.icon('arrow')}</button>
    </div>`;
  }

  /* ---------------- 选择页 ---------------- */

  function renderSelect() {
    const cards = PL.SPECIES_LIST.map((s) => `
      <button class="species-card" data-action="choose-species" data-id="${s.id}">
        <div class="species-card-media">
          <img src="${PL.portraitPath(s.id)}" alt="${esc(s.name)}" loading="lazy">
          <div class="lifespan"><small>LIFESPAN</small>一生约 ${s.lifespan} 年</div>
        </div>
        <div class="species-card-body">
          <div class="species-card-name">${esc(s.name)}<em>${esc(s.en)}</em></div>
          <div class="species-card-tagline">${esc(s.tagline)}</div>
          <div class="species-tags">${s.tags.map((t) => `<span class="tag">${esc(t)}</span>`).join('')}</div>
          <div class="species-card-foot"><span>${esc(s.quote)}</span><span class="choose-arrow">${PL.icon('arrow')}</span></div>
        </div>
      </button>`).join('');

    return `<div class="view-enter">
      <div class="page">
        <div class="page-head">
          <div>
            <span class="eyebrow">NINE SOULS</span>
            <h1 class="page-title">九种灵魂</h1>
            <p class="page-sub">你没法选择出生，但这一次，你可以先看看自己想成为谁。每一种动物都有不同的时间尺度、脾气和结局。</p>
          </div>
          <div class="page-actions">
            <button class="btn btn-primary" data-action="random">${PL.icon('sparkle')} 随机投胎</button>
            <button class="btn btn-ghost" data-nav="home">回首页</button>
          </div>
        </div>
        <div class="species-grid">${cards}</div>
        <div class="selection-note">${PL.icon('heart')}<span>没有强弱，也没有最优解。你选的不是一张卡，是一种看待世界的方式。每一次投胎，家、人、天气和你会遇见的事，都会重新洗牌。</span></div>
        ${store.lives.length ? `<p class="muted" style="font-size:11px;margin-top:18px">你已经在这个浏览器里，送走了 ${store.lives.length} 只动物。</p>` : ''}
      </div>
      ${footer()}
    </div>`;
  }

  /* ---------------- 相遇页 ---------------- */

  function renderMeet() {
    if (!state.meet) return renderSelect();
    const s = PL.SPECIES[state.meet.speciesId];
    const h = PL.HOMES[state.meet.homeId];
    if (!s || !h) return renderSelect();
    const humanEnd = h.human.age + Math.round(s.lifespan);
    const human = h.human;

    return `<div class="view-enter">
      <div class="meet">
        <div class="meet-head">
          <span class="eyebrow">THE MEETING · 相遇</span>
          <button class="btn btn-ghost btn-sm" data-nav="select">换一只动物</button>
        </div>
        <div class="meet-grid">
          <div class="meet-left">
            <div class="meet-portrait">
              <img src="${PL.portraitPath(s.id)}" alt="${esc(s.name)}">
              <span class="meet-seal">${esc(s.en)}</span>
            </div>
            <div class="meet-body">
              <h1 class="meet-name">${esc(s.name)}<em>${esc(s.jp)}</em></h1>
              <p class="meet-tagline">${esc(s.tagline)}</p>
              <div class="meet-quote">${esc(s.quote)}</div>
              <div class="meet-facts">
                <div class="meet-fact"><strong>${s.lifespan} 年</strong><span>它的一生</span></div>
                <div class="meet-fact"><strong>${Math.min(100, Math.round(s.toHuman(s.lifespan)))} 岁</strong><span>相当于人类</span></div>
                <div class="meet-fact"><strong>11 次</strong><span>由你决定</span></div>
              </div>
            </div>
          </div>
          <div class="home-card">
            <div class="home-card-bg" style="background-image:url('${h.art}')"></div>
            <div class="home-card-top"><span class="fate-label">命运抽到的家</span><span class="fate-label">${esc(h.kind)}</span></div>
            <div class="home-card-content">
              <div class="city">${esc(h.city)}</div>
              <h2>${esc(h.name)}</h2>
              <p class="detail">${esc(h.detail)}</p>
              <div class="home-human">
                <div class="home-human-mark">${esc(human.name.slice(0, 1))}</div>
                <div>
                  <div class="home-human-name">${esc(human.name)}<span style="font-family:var(--sans);font-size:10px;color:rgba(246,239,226,.5);margin-left:8px">${human.age} 岁</span></div>
                  <div class="home-human-meta">${esc(human.pronoun)} · ${esc(human.role)} · ${esc(human.trait)}</div>
                </div>
              </div>
              <p class="home-quote">${esc(human.quote)}</p>
              <p class="detail" style="margin-bottom:0">${esc(h.oneLine)}</p>
              <div class="home-actions">
                <button class="btn btn-primary" data-action="start-run">住进这个家 ${PL.icon('arrow')}</button>
                ${state.meet.rerolls < 1
                  ? `<button class="btn" data-action="reroll-home">再抽一次家</button><span class="reroll-note">只有一次。命运也会开玩笑。</span>`
                  : `<span class="reroll-note">命运已定。它不会知道另一种可能。</span>`}
              </div>
              <p class="reroll-note" style="margin-top:12px">住进去以后，${esc(human.name)}会从 ${human.age} 岁走到 ${humanEnd} 岁。你的一辈子，是${esc(human.pronoun)}的这一段。</p>
            </div>
          </div>
        </div>
      </div>
      ${footer()}
    </div>`;
  }

  /* ---------------- 一生页 ---------------- */

  function renderLife() {
    const run = currentRun();
    if (!run) { state.view = 'home'; return renderHome(); }
    ensureCompanions(run);
    const s = PL.SPECIES[run.speciesId];
    const h = PL.HOMES[run.homeId];
    if (!s || !h) { store.run = null; saveStore(); state.view = 'home'; return renderHome(); }
    const ctx = PL.contextFor(run);
    const ch = PL.getChapterContent(run.chapter, ctx);
    if (!ch) { finishRun(); return ''; }
    if (!run.age) run.age = +(s.lifespan * (ch.frac || 0)).toFixed(2);

    const pending = run.pending;
    const result = pending ? {
      text: pending.resultText,
      deltas: pending.deltas || {},
      memory: pending.memory,
    } : null;
    const showNameForm = ch.input === 'name' && !run.name;
    const humanAge = h.human.age + Math.round(run.age);
    const displayName = run.name || '还没有名字';

    const statsHtml = STATS.map((st) => {
      const v = Math.round(run.stats[st.key] || 0);
      return `<div class="stat-mini" style="--stat-color:${st.color}">
        <div class="stat-mini-head"><span class="label">${PL.icon(st.icon)}${st.label}</span><b>${v}</b></div>
        <div class="stat-mini-track"><div class="stat-mini-fill" style="width:${v}%"></div></div>
      </div>`;
    }).join('');

    const companions = renderCompanionStrip(run);
    const story = renderStory({ run, s, h, ch, ctx, result, showNameForm, pending });
    const scene = renderScene({ run, s, h, ch, ctx, displayName });
    const isLast = run.chapter >= PL.CHAPTERS.length - 1;

    return `<div class="view-enter">
      <div class="life">
        <div class="life-top">
          <div>
            <h1 class="life-title">${esc(displayName)}<span>${esc(s.name)} · ${esc(h.name)}</span></h1>
            <div class="life-meta">${esc(h.human.name)} ${humanAge} 岁 · 它 ${PL.formatAge(run.age)} · 第 ${run.chapter + 1} / ${PL.CHAPTERS.length} 话</div>
          </div>
          <div class="life-tools">
            <button class="btn btn-ghost btn-sm" data-action="companions">同一秒 · 3</button>
            <button class="btn btn-ghost btn-sm" data-action="journal">记忆 · ${run.memories.length}</button>
            <button class="btn btn-ghost btn-sm" data-action="leave">离开</button>
          </div>
        </div>
        <div class="life-status">${statsHtml}</div>
        <div class="life-grid">
          <div>
            ${scene}
            ${companions}
          </div>
          ${story}
        </div>
        <div class="life-footer">
          <span>${isLast ? '这是最后一话。' : '所有选择只改变它的一生，不评价对错。'}</span>
          <button data-action="abandon">放弃这一生</button>
        </div>
      </div>
    </div>`;
  }

  function renderScene({ run, s, h, ch, ctx, displayName }) {
    const weather = ch.weather || 'clear';
    const particles = makeParticles(weather);
    const petWidth = s.id === 'hamster' ? 34 : s.id === 'cockatiel' ? 37 : s.id === 'rabbit' ? 43 : 45;
    return `<div class="scene palette-${ch.palette || 'dawn'}">
      <div class="scene-bg" style="background-image:url('${h.art}')"></div>
      <div class="scene-shade"></div>
      <div class="scene-grain"></div>
      <div class="scene-particles">${particles}</div>
      <div class="scene-top">
        <span class="scene-chapter">${esc(ch.no)} · ${esc(ch.title)}</span>
        <span class="scene-season"><b>${esc(ch.season || '')}</b>${esc(WEATHER_LABEL[weather] || '')} · ${esc(h.city.split(' · ')[0])}</span>
      </div>
      <button class="scene-pet" data-action="pet" aria-label="摸摸它" style="width:min(${petWidth}%, 330px)">${PL.animalSVG(s.id)}</button>
      <div class="scene-name">${esc(displayName)}<small>${esc(s.name)} · ${PL.formatAge(run.age)}</small></div>
      <button class="pet-hint" data-action="pet">摸摸它</button>
    </div>`;
  }

  function makeParticles(weather) {
    const count = weather === 'rain' ? 16 : weather === 'snow' ? 18 : weather === 'wind' ? 12 : 10;
    const kinds = weather === 'rain' ? ['rain'] : weather === 'snow' ? ['snow'] : weather === 'wind' ? ['petal'] : ['dust', 'petal'];
    let html = '';
    for (let i = 0; i < count; i++) {
      const kind = kinds[i % kinds.length];
      const left = Math.random() * 100;
      const delay = Math.random() * -14;
      const dur = kind === 'rain' ? 1.2 + Math.random() * 1.2 : kind === 'snow' ? 8 + Math.random() * 8 : 7 + Math.random() * 8;
      const drift = (Math.random() * 120 - 60).toFixed(0);
      html += `<span class="particle ${kind}" style="left:${left}%;--drift:${drift}px;animation-duration:${dur}s;animation-delay:${delay}s"></span>`;
    }
    return html;
  }

  function renderCompanionStrip(run) {
    return `<div class="companion-strip">${(run.companions || []).map((c) => {
      const s = PL.SPECIES[c.speciesId];
      if (!s) return '';
      const st = PL.companionStatus(c, run.age);
      return `<div class="companion-mini ${st.dead ? 'dead' : ''}">
        <img src="${PL.portraitPath(c.speciesId)}" alt="${esc(s.name)}" loading="lazy">
        <div class="companion-mini-body">
          <div class="companion-mini-name">${esc(c.name)} <span>${esc(s.name)}</span></div>
          <div class="companion-mini-line">${st.dead ? `停在 ${PL.formatAge(c.lifespan)}` : `${PL.formatAge(st.age)} · ${esc(st.text)}`}</div>
        </div>
      </div>`;
    }).join('')}</div>`;
  }

  function renderStory({ run, s, h, ch, ctx, result, showNameForm, pending }) {
    const prelude = typeof ch.prelude === 'function' ? ch.prelude(ctx) : ch.prelude;
    const narration = (typeof ch.narration === 'function' ? ch.narration(ctx) : ch.narration || '')
      .split('\n').filter(Boolean).map((p) => `<p>${esc(say(p, ctx))}</p>`).join('');

    let body = '';
    if (showNameForm) {
      body = `<form class="name-form" id="name-form" autocomplete="off">
        <label for="pet-name">给它的名字</label>
        <div class="name-row">
          <input class="name-input" id="pet-name" name="name" maxlength="8" placeholder="给它的名字" value="${esc(run.name)}" autofocus>
          <button class="btn btn-primary" type="submit">就叫这个名字</button>
        </div>
        <div class="name-suggestions">${s.names.map((n) => `<button type="button" class="suggestion" data-action="suggest-name" data-name="${esc(n)}">${esc(n)}</button>`).join('')}</div>
        <p class="muted" style="font-size:10px;line-height:1.8;margin:11px 0 0">这个名字会出现在它的一生里，也会出现在你最后带走的那张卡上。</p>
      </form>`;
    } else if (result) {
      body = renderResult({ run, ch, result, pending });
    } else {
      const isLast = run.chapter >= PL.CHAPTERS.length - 1;
      body = `<div class="prompt">${esc(say(ch.prompt || '', ctx))}</div>
        <div class="choices">${(ch.options || []).map((o, i) => `
          <button class="choice" data-action="choice" data-index="${i}">
            <span class="choice-main">${esc(say(o.label, ctx))}${o.sub ? `<span class="choice-sub">${esc(o.sub)}</span>` : ''}</span>
            <span class="choice-arrow">${PL.icon('arrow')}</span>
          </button>`).join('')}</div>
        <div class="life-footer" style="margin-top:auto;padding-top:16px"><span>${isLast ? '这是最后一话。' : '选一个，然后继续。'}</span><span>${esc(ch.no)}</span></div>`;
    }

    return `<div class="story-panel">
      <div class="story-kicker">${esc(ch.no)} · CHAPTER ${run.chapter + 1}</div>
      <h2 class="story-title">${esc(ch.title)}</h2>
      <div class="story-jp">${esc(ch.jp || '')}</div>
      ${prelude ? `<p class="prelude">${esc(say(prelude, ctx))}</p>` : ''}
      <div class="narration">${narration}</div>
      ${body}
    </div>`;
  }

  function renderResult({ run, ch, result, pending }) {
    const he = (PL.HOMES[run.homeId] || {}).human?.pronoun || '他';
    const raw = (t) => PL.pronounize(t, he);
    const deltas = Object.keys(result.deltas || {}).filter((k) => result.deltas[k] !== 0);
    const deltaHtml = deltas.length
      ? deltas.map((k) => {
          const v = result.deltas[k];
          return `<span class="delta ${v > 0 ? 'up' : 'down'}">${v > 0 ? '+' : ''}${v} ${statLabel(k)}</span>`;
        }).join('')
      : '<span class="delta">没有变化</span>';
    const isLast = run.chapter >= PL.CHAPTERS.length - 1;
    const early = run.earlyDeath;
    return `<div class="result">
      <div class="result-kicker">${early ? '它没有等到下一个春天' : '这一话，走完了'}</div>
      <p class="result-text">${esc(raw(result.text || ''))}</p>
      <div class="deltas">${deltaHtml}</div>
      ${result.memory ? `<div class="memory-note">${PL.icon(result.memory.icon || 'sparkle')}<div><div class="memory-note-title">${esc(raw(result.memory.title))}</div><div class="memory-note-line">${esc(raw(result.memory.line))}</div></div></div>` : ''}
      <div class="result-actions">
        <span class="hint">${early ? '它的一生，到这里就结束了。' : isLast ? '这一话之后，就是终章。' : '它还会记得很久。'}</span>
        <button class="btn btn-primary" data-action="next">${early ? '送它走' : isLast ? '走完这一生' : '继续'} ${PL.icon('arrow')}</button>
      </div>
    </div>`;
  }

  /* ---------------- 结局页 ---------------- */

  function renderEnding() {
    const record = state.ending;
    if (!record) return renderMemorial();
    const e = PL.ENDINGS[record.endingId] || PL.ENDINGS.ordinary;
    const theme = PL.THEMES.find((t) => t.id === record.themeId);
    const he = (PL.HOMES[record.homeId] || {}).human?.pronoun || '他';
    const raw = (t) => PL.pronounize(t, he);
    const statsHtml = STATS.map((st) => `<div class="ending-stat"><strong>${Math.round(record.stats[st.key] || 0)}</strong><span>${st.label}</span></div>`).join('');
    const memories = record.memories.map((m, i) => `<div class="memory-card">
      <div class="chapter">${esc(m.chapter || `第 ${PL.memoryLetters[i] || i + 1} 话`)}</div>
      <div class="m-title">${PL.icon(m.icon || 'sparkle')}${esc(raw(m.title))}</div>
      <div class="m-line">${esc(raw(m.line))}</div>
    </div>`).join('');

    const comps = (record.companions || []).map((c) => {
      const cs = PL.SPECIES[c.speciesId];
      if (!cs) return '';
      const st = PL.companionStatus(c, record.age);
      return `<div class="companion-card ${st.dead ? 'dead' : ''}">
        <img src="${PL.portraitPath(c.speciesId)}" alt="${esc(cs.name)}" loading="lazy">
        <div class="c-name">${esc(c.name)}</div>
        <div class="c-meta">${esc(cs.name)} · ${esc(c.homeName)}</div>
        <div class="c-line">${esc(st.dead ? st.text : st.text)}</div>
        <div class="c-status">${st.dead ? `停在 ${PL.formatAge(c.lifespan)}` : `现在 ${PL.formatAge(record.age)}`}</div>
      </div>`;
    }).join('');

    const youCard = `<div class="companion-card">
      <img src="${PL.portraitPath(record.speciesId)}" alt="${esc(record.name)}">
      <div class="c-name">${esc(record.name)}</div>
      <div class="c-meta">${esc(record.speciesName)} · ${esc(record.homeName)}</div>
      <div class="c-line">它的一生走完了。${record.lastWords ? `它留下了一句话：“${esc(record.lastWords)}”` : ''}</div>
      <div class="c-status">终章 · ${esc(record.ageLabel)}</div>
    </div>`;

    const words = record.lastWords
      ? `<div class="words-saved">${PL.icon('heart')}<div>“${esc(record.lastWords)}”<button data-action="edit-words">改一句</button></div></div>`
      : `<form id="words-form" class="words-row" autocomplete="off">
          <input class="words-input" id="last-words" name="words" maxlength="40" placeholder="如果它可以留下一句话……">
          <button class="btn btn-primary" type="submit">写进它的一生</button>
        </form>`;

    return `<div class="view-enter ending">
      <section class="ending-hero">
        <div class="ending-top">终章 · 它的一生 <span>ONE LIFE, ONE SECOND</span></div>
        <div class="ending-hero-inner">
          <div class="ending-portrait-wrap">
            <div class="ending-portrait-ring"></div>
            <div class="ending-portrait"><img src="${PL.portraitPath(record.speciesId)}" alt="${esc(record.name)}"></div>
          </div>
          <div>
            <div class="ending-kicker">THE END · ${esc(e.jp)}</div>
            <div class="ending-title">${esc(e.title)}</div>
            <h1 class="ending-name">${esc(record.name)}<span class="dot">.</span></h1>
            <div class="ending-species">${esc(record.speciesName)} · ${record.birthYear} — ${record.endYear} · ${esc(record.ageLabel)}</div>
            <p class="ending-subtitle">${esc(raw(PL.endingSubtitle(record)))}</p>
            <p class="ending-line">${esc(record.shareLine)}<br><span style="color:rgba(246,239,226,.55);font-size:15px">相当于人类的 ${record.humanAge} 岁。</span></p>
            <div class="ending-stats">${statsHtml}</div>
            <div class="ending-keywords">${record.keywords.map((k) => `<span class="tag">${esc(k)}</span>`).join('')}</div>
            <div class="ending-actions">
              <button class="btn btn-primary" data-action="share">${PL.icon('download')} 保存一生卡</button>
              <button class="btn" data-action="again">再遇见一只${esc(record.speciesName)}</button>
              <button class="btn btn-ghost" data-action="other-species">投胎成别的</button>
              <button class="candle-btn" data-action="candle"><span class="candle-flame"></span>为它点一盏灯 · <span id="candle-count">${record.candle || 0}</span></button>
            </div>
          </div>
        </div>
        <div class="ending-scroll">往下看 · 它留下的事 <span>↓</span></div>
      </section>

      <div class="ending-body">
        <div class="ending-section">
          <div class="ending-section-head"><h2>它记得的事</h2><span>${record.memories.length} 枚碎片</span></div>
          <div class="memory-grid">${memories || '<div class="memory-card"><div class="m-line">它没有记住什么。也许这就是最轻的一生。</div></div>'}</div>
        </div>

        <div class="ending-section">
          <div class="ending-section-head"><h2>如果它可以留下一句话</h2><span>可以由你替它写</span></div>
          <div class="last-words">
            <h3>最后想说的</h3>
            <p>它不会说话。但你可以替它留一句，给${esc(record.humanName)}，也给你自己。</p>
            ${words}
          </div>
        </div>

        <div class="ending-section">
          <div class="ending-section-head"><h2>${esc(record.humanName)}后来</h2><span>AFTERWARD</span></div>
          <div class="epilogue">
            <p>${esc(record.epilogue)}</p>
            <div class="epilogue-meta">${esc(record.humanName)} · ${record.humanAgeStart} 岁 → ${record.humanAgeEnd} 岁</div>
          </div>
        </div>

        <div class="ending-section">
          <div class="ending-section-head"><h2>同一秒出生的它们</h2><span>4 LIVES, ONE SECOND</span></div>
          <div class="companions-final">${youCard}${comps}</div>
          <p class="muted" style="font-size:11px;line-height:1.8;margin-top:14px">它们和你同一秒出生，却活在不同的时间里。有的已经走了，有的还小，有的还在等一个人回家。</p>
        </div>

        ${theme ? `<div class="ending-theme"><span class="theme-small-char">${esc(theme.char)}</span><div><strong style="color:var(--ink);font-family:var(--serif);font-size:16px">今日主题 · ${esc(theme.title)}</strong><br>${esc(theme.line)}</div></div>` : ''}

        <div class="ending-bottom">
          <span class="note">这一生只留在这个浏览器里。回忆馆会替你记住它。</span>
          <div class="ending-actions" style="margin:0">
            <button class="btn btn-ghost btn-sm" data-action="share">保存一生卡</button>
            <button class="btn btn-ghost btn-sm" data-action="memorial">去回忆馆</button>
            <button class="btn btn-ghost btn-sm" data-nav="home">回到首页</button>
          </div>
        </div>
      </div>
      ${footer()}
    </div>`;
  }

  /* ---------------- 回忆馆 ---------------- */

  function renderMemorial() {
    const lives = store.lives;
    const cards = lives.map((l) => `<button class="life-card" data-action="open-life" data-id="${esc(l.id)}">
      <div class="life-card-img"><img src="${PL.portraitPath(l.speciesId)}" alt="${esc(l.name)}" loading="lazy"></div>
      <div class="life-card-body">
        <div class="life-card-name">${esc(l.name)}<span>${esc(l.speciesName)}</span></div>
        <div class="life-card-meta">${l.birthYear} — ${l.endYear} · ${esc(l.ageLabel)}<br>${esc(l.homeName)} · ${esc(l.humanName)}</div>
        <div class="life-card-ending">${esc(l.endingTitle)}</div>
        <div class="life-card-line">${esc(l.epitaph || '')}</div>
      </div>
    </button>`).join('');

    const unlocked = new Set(lives.map((l) => l.endingId));
    const seals = PL.ENDING_ORDER.map((id) => {
      const e = PL.ENDINGS[id];
      const has = unlocked.has(id);
      return `<div class="seal-card ${has ? 'unlocked' : 'locked'}">
        <span class="seal-dot">${has ? '✓' : '?'}</span>
        <span class="seal-name">${has ? esc(e.title) : '未抵达'}</span>
      </div>`;
    }).join('');

    return `<div class="view-enter">
      <div class="memorial">
        <div class="memorial-head">
          <div><span class="eyebrow">MEMORIAL · 回忆馆</span><h1>所有被爱过的一生</h1></div>
          <p>这里没有排名，也没有点赞。只有名字、年份，和它留下的一句话。<br>点一盏灯，是留给还记得的人。</p>
        </div>
        ${lives.length ? `<div class="memorial-grid">${cards}</div>` : `<div class="memorial-empty">
          <div class="lantern"></div>
          <h2>这里还很空</h2>
          <p>等第一只动物走完它的一生，这里会亮起一盏灯。你可以随时回来，看看它叫什么名字。</p>
          <button class="btn btn-primary" data-nav="select">去遇见一只</button>
        </div>`}
        <div class="collection">
          <div class="collection-head"><h2>结局图鉴</h2><span class="collection-count">已收集 ${unlocked.size} / ${PL.ENDING_ORDER.length}</span></div>
          <div class="ending-collection">${seals}</div>
        </div>
        <div class="danger-zone">
          ${lives.length ? `<button data-action="reset">清空所有回忆</button>` : ''}
          <button data-action="about">关于这个游戏</button>
        </div>
      </div>
      ${footer()}
    </div>`;
  }

  function openLife(record) {
    state.modalRecord = record;
    const stats = STATS.map((st) => `<div class="ending-stat" style="color:var(--ink)"><strong>${Math.round(record.stats[st.key] || 0)}</strong><span style="color:var(--soft)">${st.label}</span></div>`).join('');
    const he = (PL.HOMES[record.homeId] || {}).human?.pronoun || '他';
    const memories = (record.memories || []).map((m, i) => `<div class="ml-memory"><b>${esc(PL.pronounize(m.title, he))}</b><span>${esc(PL.pronounize(m.line, he))}</span></div>`).join('');
    openModal(`<button class="modal-close" data-action="close-modal" aria-label="关闭">${PL.icon('close')}</button>
      <div class="modal-life">
        <div class="modal-life-img"><img src="${PL.portraitPath(record.speciesId)}" alt="${esc(record.name)}"></div>
        <div>
          <h3>${esc(record.name)}</h3>
          <div class="ml-meta">${esc(record.speciesName)} · ${record.birthYear} — ${record.endYear} · ${esc(record.ageLabel)} · 相当于人类 ${record.humanAge} 岁</div>
          <span class="ml-ending">${esc(record.endingTitle)}</span>
          <p class="ml-line">${esc(record.shareLine)}</p>
          <div class="ending-stats" style="grid-template-columns:repeat(4,1fr);margin:16px 0;padding:12px 0;border-color:var(--line)">${stats}</div>
          <div class="ml-epilogue">${esc(record.epilogue)}</div>
          <p class="ml-line" style="font-size:14px;color:var(--soft)">${esc(record.lastWords ? `它留下了一句话：“${record.lastWords}”` : record.epitaph)}</p>
          <div class="ml-memories">${memories || '<div class="ml-memory">它没有留下什么记忆。</div>'}</div>
          <div class="ml-actions">
            <button class="btn btn-primary btn-sm" data-action="share-modal">保存一生卡</button>
            <button class="btn btn-ghost btn-sm" data-action="candle-modal">点一盏灯 · <span data-candle-count>${record.candle || 0}</span></button>
            <button class="btn btn-ghost btn-sm" data-action="close-modal">关上</button>
          </div>
        </div>
      </div>`);
  }

  function openCompanions() {
    const run = currentRun();
    if (!run) return;
    const list = (run.companions || []).map((c) => {
      const s = PL.SPECIES[c.speciesId];
      if (!s) return '';
      const st = PL.companionStatus(c, run.age);
      return `<div class="modal-companion ${st.dead ? 'dead' : ''}">
        <img src="${PL.portraitPath(c.speciesId)}" alt="${esc(s.name)}">
        <div>
          <div class="mc-name">${esc(c.name)} <span style="font-family:var(--sans);font-size:10px;color:var(--faint)">${esc(s.name)}</span></div>
          <div class="mc-meta">${esc(c.homeName)} · ${esc(c.humanName)} · ${st.dead ? `停在 ${PL.formatAge(c.lifespan)}` : `现在 ${PL.formatAge(st.age)}`}</div>
          <div class="mc-line">${esc(st.text)}</div>
        </div>
      </div>`;
    }).join('');
    openModal(`<button class="modal-close" data-action="close-modal" aria-label="关闭">${PL.icon('close')}</button>
      <div class="modal-companions">
        <h3>同一秒出生的它们</h3>
        <p>你出生的时候，世界上还有三只动物也睁开了眼睛。它们不认识你，但和你共享同一段时间。</p>
        <div class="modal-companion-list">${list || '<p>这一秒很安静，只有你。</p>'}</div>
      </div>`);
  }

  function openJournal() {
    const run = currentRun();
    if (!run) return;
    const list = run.memories.length
      ? run.memories.map((m) => `<div class="modal-companion"><div style="width:34px;height:34px;border-radius:50%;background:rgba(184,69,47,.08);display:grid;place-items:center;color:var(--red);flex:0 0 auto">${PL.icon(m.icon || 'sparkle')}</div><div><div class="mc-name">${esc(PL.pronounize(m.title, PL.HOMES[run.homeId]?.human.pronoun))}</div><div class="mc-meta">${esc(m.chapter || '')}</div><div class="mc-line">${esc(PL.pronounize(m.line, PL.HOMES[run.homeId]?.human.pronoun))}</div></div></div>`).join('')
      : '<p class="muted">它还没有记住什么。再走几步吧。</p>';
    openModal(`<button class="modal-close" data-action="close-modal" aria-label="关闭">${PL.icon('close')}</button>
      <div class="modal-companions">
        <h3>它记住的事</h3>
        <p>这些碎片会跟着它走到最后，变成一张一生卡。</p>
        <div class="modal-companion-list">${list}</div>
      </div>`);
  }

  /* ---------------- 关于页 ---------------- */

  function renderAbout() {
    return `<div class="view-enter">
      <div class="about">
        <div class="about-hero">
          <span class="eyebrow">ABOUT · 关于</span>
          <h1>它只是你人生里的一章，<br>你却是它的一辈子。</h1>
          <p>《宠物的一生》是一个十二分钟的小游戏。你随机遇见一个家，成为一只动物，做十一次选择，然后送它走完一生。</p>
        </div>
        <div class="prose">
          <h2>为什么做这个</h2>
          <p>我们太容易把宠物当成“生活的一部分”。可对它们来说，你就是全部的世界。你出门上班，它的一天就只剩下等你；你搬家，它要重新认识所有气味；你难过的时候，它不知道怎么安慰，只能坐得离你近一点。</p>
          <p>这个游戏想做的，不是让你“养”一只动物，而是让你在一小时里，从它的眼睛看一次世界。它不会说话，所以你要替它做选择。它的一生很短，所以每一个选择都显得很重。</p>

          <h2>从《80亿分之1》借来的四件事</h2>
          <p>这个游戏的骨架，来自韩国独立开发者 Jin Hwi-eus 用 Claude Opus 5.5 在四小时内做出来的网页人生模拟 <a href="https://1in8b.life/zh-hans/" target="_blank" rel="noopener">《80亿分之1》</a>。它不是官方作品，也没有得到授权，只是一次认真的、写给宠物的致敬。</p>
          <div class="borrow-grid">
            <div class="borrow-card"><div class="n">01</div><h3>出生由不得你</h3><p>你没法选择自己出生在哪里。我们把它换成了“你没法选择被谁捡到”。家、城市、人的脾气，都是抽出来的。</p></div>
            <div class="borrow-card"><div class="n">02</div><h3>一生有尽头</h3><p>游戏不会因为你不舍得就停下来。仓鼠只能陪你两年半，鹦鹉可以陪你二十年。时间尺度本身就是故事。</p></div>
            <div class="borrow-card"><div class="n">03</div><h3>同一秒的别人</h3><p>你出生时，还有三只动物也出生了。它们活在不同的时间尺度里。你老去的时候，有的已经走了，有的还小。</p></div>
            <div class="borrow-card"><div class="n">04</div><h3>一个安放的地方</h3><p>走完的一生不会被删掉，而是进入回忆馆。没有排名，没有点赞，只有名字和一盏灯。</p></div>
          </div>
          <p>《80亿分之1》最打动人的地方，不是“投胎抽卡”，而是它把冷冰冰的统计数据变成一个人的一生：172 个国家与地区的出生、寿命、收入、教育、死亡原因，都由联合国、WHO、世界银行等公开数据推算；你在 5 岁、15 岁、30 岁、50 岁、70 岁时停下来回答一个问题；同一秒出生的另外四个人，在你旁边过完他们的一生。它没有评分，也不评价你的人生是否成功。</p>
          <p>我们把这些结构搬了过来，但把“国家统计”换成了“六个普通的家”，把“人生抉择”换成了“一只动物能做的选择”。它不再是社会实验，而是一个关于陪伴的寓言。</p>

          <h2>我们没有做的事</h2>
          <ul>
            <li>没有评分、排名、胜负，也没有“完美结局”。结局只描述它的一生，不评价它。</li>
            <li>没有登录、广告、付费，也没有把数据传到任何服务器。所有记录都只在这个浏览器的 localStorage 里。</li>
            <li>没有假装自己是真实统计。动物的寿命是常见范围，故事是虚构的，选择带来的数值变化只是为了叙事。</li>
          </ul>

          <h2>关于数据与虚构</h2>
          <p>九种动物的寿命参考了常见的家养范围：猫约 13–17 年，小型犬约 12–15 年，垂耳兔约 8–12 年，玄凤鹦鹉约 15–20 年，仓鼠约 2–3 年。游戏里的具体年龄、疾病、性格和事件都是虚构的，不是兽医建议，也不能用来预测任何一只真实动物的寿命。</p>
          <p>“相当于人类多少岁”用的是常见的年龄换算公式，只是一个温柔的比喻，不是科学结论。</p>

          <div class="warning">
            <strong>如果你最近失去了它</strong>
            <p>这个游戏里有衰老、疾病和告别。如果你还没有准备好，可以先去别的地方待一会儿。如果你正在难过，请找一个人说说话，或者联系当地的心理援助热线。你不需要一个人扛着。</p>
          </div>

          <h2>怎么做出来的</h2>
          <p>一个深夜，echo 说：“我们做一个宠物版吧。”于是有了这个站点。它没有后端，没有框架，只有 HTML、CSS、JavaScript，和几张用 AI 画的画。所有文案、选项和结局，都是在这个夜里一个字一个字写下来的。</p>
          <p>如果你也养过一只动物，希望你在某一个选择前停一下，想起它的名字。</p>

          <div class="credits">
            <strong>灵感</strong>：<a href="https://1in8b.life/zh-hans/" target="_blank" rel="noopener">1in8b.life</a> · <a href="https://zh.wikipedia.org/wiki/80%E5%84%84%E5%88%86%E4%B9%8B1" target="_blank" rel="noopener">维基百科</a> · <a href="http://www.gamelook.com.cn/2026/10/604620/" target="_blank" rel="noopener">GameLook 报道</a><br>
            <strong>制作</strong>：echo &amp; 大肥鱼，一个晚上。AI 参与了代码、文案和插画。<br>
            <strong>声明</strong>：非官方作品，与 1in8b.life 及 Jin's Earth 无隶属关系。所有动物插画均为虚构角色。
          </div>
        </div>
      </div>
      ${footer()}
    </div>`;
  }

  /* ---------------- 事件 ---------------- */

  document.addEventListener('click', (e) => {
    const nav = e.target.closest('[data-nav]');
    if (nav) {
      e.preventDefault();
      const target = nav.getAttribute('data-nav');
      if (state.view === 'life' && target !== 'life') showToast('这一生已保存在这个浏览器里。');
      go(target);
      return;
    }

    const confirmBtn = e.target.closest('[data-confirm]');
    if (confirmBtn) {
      const yes = confirmBtn.getAttribute('data-confirm') === 'yes';
      const fn = state.confirmAction;
      state.confirmAction = null;
      confirmDialog.close();
      if (yes && fn) fn();
      return;
    }

    const el = e.target.closest('[data-action]');
    if (!el) return;
    const action = el.getAttribute('data-action');

    if (action === 'audio') {
      store.settings.audio = !store.settings.audio;
      saveStore();
      PL.audio.setEnabled(store.settings.audio);
      showToast(store.settings.audio ? '声音开了。' : '声音关了。');
      return;
    }

    if (action === 'menu') {
      const open = document.body.classList.toggle('nav-open');
      el.setAttribute('aria-expanded', String(open));
      return;
    }

    if (action === 'random') {
      newFlow(() => {
        const s = PL.pick(PL.SPECIES_LIST);
        const h = PL.pick(PL.HOMES_LIST);
        state.meet = { speciesId: s.id, homeId: h.id, rerolls: 0 };
        go('meet');
      });
      return;
    }

    if (action === 'choose-species') {
      const id = el.getAttribute('data-id');
      if (!PL.SPECIES[id]) return;
      newFlow(() => {
        state.meet = { speciesId: id, homeId: PL.pick(PL.HOMES_LIST).id, rerolls: 0 };
        go('meet');
      });
      return;
    }

    if (action === 'reroll-home') {
      if (!state.meet) return;
      if (state.meet.rerolls >= 1) { showToast('命运只让再抽一次。'); return; }
      const old = state.meet.homeId;
      const options = PL.HOMES_LIST.filter((h) => h.id !== old);
      state.meet.homeId = PL.pick(options).id;
      state.meet.rerolls += 1;
      render();
      showToast('换了一个家。');
      return;
    }

    if (action === 'start-run') {
      if (!state.meet) return;
      newFlow(() => startRun(state.meet.speciesId, state.meet.homeId));
      return;
    }

    if (action === 'resume') {
      if (!store.run) return;
      state.view = 'life';
      render();
      window.scrollTo(0, 0);
      return;
    }

    if (action === 'choice') {
      chooseOption(Number(el.getAttribute('data-index')));
      return;
    }

    if (action === 'next') {
      nextChapter();
      return;
    }

    if (action === 'suggest-name') {
      const name = el.getAttribute('data-name');
      const input = document.querySelector('.name-input');
      if (input) {
        input.value = name;
        input.focus();
      }
      return;
    }

    if (action === 'pet') {
      petThePet(el);
      return;
    }

    if (action === 'leave') {
      go('home');
      showToast('这一生已保存。随时可以回来。');
      return;
    }

    if (action === 'abandon') {
      askConfirm('放弃这一生？', '它会被删掉，不会进入回忆馆。这个动作不能撤回。', () => {
        store.run = null;
        saveStore();
        state.view = 'home';
        render();
        window.scrollTo(0, 0);
        showToast('你放下了这一生。');
      });
      return;
    }

    if (action === 'companions') { openCompanions(); return; }
    if (action === 'journal') { openJournal(); return; }
    if (action === 'close-modal') { closeModal(); return; }

    if (action === 'share') { shareRecord(state.ending); return; }
    if (action === 'share-modal') { shareRecord(state.modalRecord); return; }

    if (action === 'candle') { lightCandle(state.ending); return; }
    if (action === 'candle-modal') { lightCandle(state.modalRecord); return; }

    if (action === 'edit-words') {
      if (!state.ending) return;
      state.ending.lastWords = '';
      const stored = store.lives.find((l) => l.id === state.ending.id);
      if (stored) stored.lastWords = '';
      saveStore();
      render({ top: false });
      return;
    }

    if (action === 'again') {
      if (!state.ending) return;
      state.meet = { speciesId: state.ending.speciesId, homeId: PL.pick(PL.HOMES_LIST).id, rerolls: 0 };
      state.view = 'meet';
      render();
      window.scrollTo(0, 0);
      return;
    }

    if (action === 'other-species') { go('select'); return; }
    if (action === 'memorial') { go('memorial'); return; }
    if (action === 'about') { go('about'); return; }

    if (action === 'open-life') {
      const record = store.lives.find((l) => l.id === el.getAttribute('data-id'));
      if (record) openLife(record);
      return;
    }

    if (action === 'reset') {
      askConfirm('清空所有回忆？', '回忆馆里的每一只动物都会被删掉。这个动作不能撤回。', () => {
        store.lives = [];
        store.run = null;
        saveStore();
        state.ending = null;
        render();
        showToast('回忆馆空了。');
      });
      return;
    }
  });

  document.addEventListener('submit', (e) => {
    if (e.target.id === 'name-form') {
      e.preventDefault();
      const data = new FormData(e.target);
      setPetName(data.get('name'));
      return;
    }
    if (e.target.id === 'words-form') {
      e.preventDefault();
      const data = new FormData(e.target);
      saveLastWords(data.get('words'));
      return;
    }
  });

  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });
  modal.addEventListener('close', () => {
    document.body.style.overflow = '';
    state.modalRecord = null;
  });
  confirmDialog.addEventListener('close', () => {
    state.confirmAction = null;
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (modal.open) closeModal();
      if (document.body.classList.contains('nav-open')) {
        document.body.classList.remove('nav-open');
        const menuBtn = document.querySelector('.menu-btn');
        if (menuBtn) menuBtn.setAttribute('aria-expanded', 'false');
      }
    }
  });

  document.addEventListener('pointerdown', () => {
    if (!audioStarted && store.settings.audio) {
      audioStarted = true;
      PL.audio.start();
    }
  }, { once: true });

  window.addEventListener('resize', () => {
    if (window.innerWidth > 900 && document.body.classList.contains('nav-open')) {
      document.body.classList.remove('nav-open');
      const menuBtn = document.querySelector('.menu-btn');
      if (menuBtn) menuBtn.setAttribute('aria-expanded', 'false');
    }
  });

  function petThePet(el) {
    PL.audio.purr();
    const rect = el.getBoundingClientRect();
    const lines = [
      '它把头往你手心里蹭了蹭。',
      '呼噜呼噜。',
      '尾巴轻轻敲了两下地板。',
      '它看了你一眼，又闭上了眼睛。',
      '它把一只爪子搭在你的手上。',
      '它假装不在意，但耳朵转向了你。',
    ];
    for (let i = 0; i < 3; i++) {
      const heart = document.createElement('span');
      heart.className = 'heart-pop';
      heart.textContent = i === 0 ? '♥' : '♡';
      heart.style.left = `${rect.left + rect.width * (0.3 + Math.random() * 0.4)}px`;
      heart.style.top = `${rect.top + rect.height * (0.2 + Math.random() * 0.3)}px`;
      heart.style.animationDelay = `${i * 0.08}s`;
      document.body.appendChild(heart);
      setTimeout(() => heart.remove(), 1500);
    }
    showToast(lines[Math.floor(Math.random() * lines.length)]);
  }

  /* ---------------- 启动 ---------------- */

  function boot() {
    document.body.classList.toggle('audio-muted', !store.settings.audio);
    PL.audio.enabled = store.settings.audio;
    if (store.run) ensureCompanions(store.run);
    render();
    // 给测试和未来的自己留一个后门
    window.PETLIFE = {
      get store() { return store; },
      get state() { return state; },
      startRun,
      render,
      go,
      chooseOption,
      nextChapter,
    };
  }

  boot();
})();
