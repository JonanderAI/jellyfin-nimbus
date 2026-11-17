/*!
 * Nimbus - hero del Inicio (opcional, requiere el plugin "JavaScript Injector")
 * Crea un banner destacado arriba del Inicio con un titulo al azar de tu biblioteca.
 */
(function () {
  'use strict';
  var ROTATE_MS = 10000; // el hero cambia cada 10 s
  var timer = null;

  function api() { return window.ApiClient; }

  function isHome() {
    var h = location.hash;
    return h === '' || h === '#/' || h.indexOf('#/home') === 0;
  }

  function pageEl() {
    return document.querySelector('#indexPage:not(.hide)') || document.querySelector('.homePage:not(.hide)');
  }

  function fmtMeta(it) {
    var p = [];
    if (it.ProductionYear) p.push(it.ProductionYear);
    if (it.RunTimeTicks) p.push(Math.round(it.RunTimeTicks / 600000000) + ' min');
    if (it.Genres && it.Genres.length) p = p.concat(it.Genres.slice(0, 2));
    return p.join(' · ');
  }

  function backdropUrl(it) {
    var tag = it.BackdropImageTags && it.BackdropImageTags[0];
    return api().getImageUrl(it.Id, { type: 'Backdrop', maxWidth: 1800, tag: tag });
  }

  function render(hero, items, i) {
    var it = items[i];
    var url = backdropUrl(it);
    var pre = new Image();
    pre.onload = function () { hero.style.backgroundImage = 'url("' + url + '")'; hero.classList.remove('nb-hero-loading'); };
    pre.src = url;
    if (hero.querySelector('.nb-hero-title').textContent === '') hero.style.backgroundImage = 'url("' + url + '")';
    hero.querySelector('.nb-hero-title').textContent = it.Name;
    // logo de la pelicula en lugar del titulo (si tiene)
    var logo = hero.querySelector('.nb-hero-logo');
    var logoTag = it.ImageTags && it.ImageTags.Logo;
    hero.classList.remove('nb-has-logo');
    logo.onload = null; logo.onerror = null;
    if (logoTag) {
      logo.onload = function () { hero.classList.add('nb-has-logo'); };
      logo.onerror = function () { hero.classList.remove('nb-has-logo'); };
      logo.alt = it.Name;
      logo.src = api().getImageUrl(it.Id, { type: 'Logo', maxWidth: 700, tag: logoTag });
    } else { logo.removeAttribute('src'); }
    hero.querySelector('.nb-hero-meta').textContent = fmtMeta(it);
    hero.querySelector('.nb-hero-play').setAttribute('href', '#/details?id=' + it.Id);
    hero.setAttribute('data-id', it.Id);
    hero.querySelector('.nb-hero-fav').onclick = function (e) {
      e.preventDefault();
      api().updateFavouriteStatus(api().getCurrentUserId(), it.Id, true);
      this.classList.add('nb-done');
    };
    hero.classList.remove('nb-hero-in');
    void hero.offsetWidth;
    hero.classList.add('nb-hero-in');
  }

  function build(page) {
    var container = page.querySelector('.homeSectionsContainer');
    if (!container || page.querySelector('.nb-hero')) return;
    var hero = document.createElement('div');
    hero.className = 'nb-hero nb-hero-loading';
    hero.innerHTML =
      '<div class="nb-hero-shade"></div><div class="nb-hero-body">' +
      '<img class="nb-hero-logo" alt=""><div class="nb-hero-title"></div><div class="nb-hero-meta"></div>' +
      '<div class="nb-hero-actions"><a class="nb-hero-play" href="#"><span class="material-icons play_arrow" aria-hidden="true"></span>Reproducir</a>' +
      '<a class="nb-hero-fav" href="#"><span class="material-icons add" aria-hidden="true"></span>Mi lista</a></div></div>';
    container.parentNode.insertBefore(hero, container);
    // clic en cualquier parte del hero abre la ficha del titulo mostrado
    hero.addEventListener('click', function (e) {
      if (e.target.closest('a')) return; // los botones tienen su propio enlace
      var id = hero.getAttribute('data-id');
      if (id) location.hash = '#/details?id=' + id;
    });

    var c = api();
    c.getItems(c.getCurrentUserId(), {
      IncludeItemTypes: 'Movie,Series', Recursive: true, SortBy: 'Random', Limit: 8,
      ImageTypes: 'Backdrop', Fields: 'Genres,ProductionYear,RunTimeTicks'
    }).then(function (r) {
      var items = (r.Items || []).filter(function (x) { return x.BackdropImageTags && x.BackdropImageTags.length; });
      if (!items.length) { hero.remove(); return; }
      var i = 0;
      render(hero, items, i);
      clearInterval(timer);
      timer = setInterval(function () {
        if (!document.body.contains(hero)) { clearInterval(timer); return; }
        i = (i + 1) % items.length;
        render(hero, items, i);
      }, ROTATE_MS);
    });
  }

  // "Mis medios": imagen aleatoria (fondo) de cada biblioteca
  function libs(page) {
    var c = api();
    page.querySelectorAll('.card[data-type="CollectionFolder"]:not([data-nb-img])').forEach(function (card) {
      card.setAttribute('data-nb-img', '1');
      c.getItems(c.getCurrentUserId(), {
        ParentId: card.getAttribute('data-id'), Recursive: true, SortBy: 'Random', Limit: 1,
        IncludeItemTypes: 'Movie,Series,MusicAlbum,Photo,Video,Book', ImageTypes: 'Backdrop'
      }).then(function (r) {
        var it = (r.Items || [])[0];
        if (!it || !it.BackdropImageTags || !it.BackdropImageTags.length) return;
        var url = c.getImageUrl(it.Id, { type: 'Backdrop', maxWidth: 800, tag: it.BackdropImageTags[0] });
        var img = card.querySelector('.cardImageContainer');
        if (img) { img.style.setProperty('background-image', 'url("' + url + '")', 'important'); img.classList.add('nb-lib-img'); }
      });
    });
  }

  // "S1:E4 - Titulo" -> "Temporada 1 · Episodio 4" + titulo en otro tono
  var L = window.NB_LABELS || { season: 'Temporada', episode: 'Episodio' };
  var EP = /^S(\d+):E(\d+(?:-\d+)?)\s*-\s*(.+)$/;
  function episodes(root) {
    (root || document).querySelectorAll('.cardText:not([data-nb-ep])').forEach(function (el) {
      var m = EP.exec((el.textContent || '').trim());
      if (!m) return;
      el.setAttribute('data-nb-ep', '1');
      var a = document.createElement('span'), b = document.createElement('span');
      a.className = 'nb-ep-num'; a.textContent = L.season + ' ' + m[1] + ' · ' + L.episode + ' ' + m[2];
      b.className = 'nb-ep-name'; b.textContent = m[3];
      el.textContent = ''; el.appendChild(a); el.appendChild(b);
    });
  }
  var obsT = null;
  new MutationObserver(function () {
    clearTimeout(obsT); obsT = setTimeout(function () { episodes(); }, 150);
  }).observe(document.body, { childList: true, subtree: true });

  // ---- Personalizacion: se guarda en localStorage (por dispositivo/navegador) ----
  var KEY = 'nb-settings';
  var DEF = { a1: '#4cc9ff', a2: '#7a7bff', font: 0, zoom: 1.06, radius: 14, hero: true, bgAnim: true, anim: true, sound: true };
  var FONTS = [
    ['Actual', 'Plus Jakarta Sans', 'Geist', 'family=Geist:wght@400;500;600&family=Plus+Jakarta+Sans:wght@600;700;800'],
    ['Mágica', 'Outfit', 'Figtree', 'family=Outfit:wght@500;600;700;800&family=Figtree:wght@400;500;600'],
    ['Cine', 'Cinzel', 'DM Sans', 'family=Cinzel:wght@600;700;800&family=DM+Sans:wght@400;500;600'],
    ['Tech', 'Sora', 'DM Sans', 'family=Sora:wght@600;700;800&family=DM+Sans:wght@400;500;600'],
    ['Familiar', 'Fredoka', 'Figtree', 'family=Fredoka:wght@500;600;700&family=Figtree:wght@400;500;600']
  ];
  var PRESETS = [['#4cc9ff', '#7a7bff'], ['#ff7ac8', '#a78bff'], ['#ffbe5a', '#ff7a59'], ['#6ee6aa', '#4cc9ff'], ['#b794ff', '#ff7ac8']];
  function loadS() { try { return Object.assign({}, DEF, JSON.parse(localStorage.getItem(KEY) || '{}')); } catch (e) { return Object.assign({}, DEF); } }
  var S = loadS();
  function saveS() { try { localStorage.setItem(KEY, JSON.stringify(S)); localStorage.setItem('nb-sound', S.sound ? 'on' : 'off'); } catch (e) {} }
  function rgbOf(hex) { var n = parseInt(hex.slice(1), 16); return (n >> 16) + ',' + ((n >> 8) & 255) + ',' + (n & 255); }
  function applyS() {
    var r = document.documentElement, st = r.style, f = FONTS[S.font] || FONTS[0];
    st.setProperty('--nb-accent', S.a1); st.setProperty('--nb-accent-2', S.a2); st.setProperty('--nb-accent-rgb', rgbOf(S.a1));
    st.setProperty('--nb-card-zoom', S.zoom); st.setProperty('--nb-radius', S.radius + 'px');
    st.setProperty('--nb-font-head', '"' + f[1] + '", system-ui, sans-serif');
    st.setProperty('--nb-font-body', '"' + f[2] + '", system-ui, sans-serif');
    var l = document.getElementById('nb-font-link');
    if (!l) { l = document.createElement('link'); l.id = 'nb-font-link'; l.rel = 'stylesheet'; document.head.appendChild(l); }
    var href = 'https://fonts.googleapis.com/css2?' + f[3] + '&display=swap';
    if (l.getAttribute('href') !== href) l.setAttribute('href', href);
    r.classList.toggle('nb-no-hero', !S.hero);
    r.classList.toggle('nb-no-bg-anim', !S.bgAnim);
    r.classList.toggle('nb-no-anim', !S.anim);
  }
  applyS();

  var syncFns = [];
  function commit() { applyS(); saveS(); syncFns.forEach(function (fn) { fn(); }); }

  function buildPanel() {
    var p = document.querySelector('.nb-panel');
    if (p) return p;
    p = document.createElement('aside');
    p.className = 'nb-panel';
    p.innerHTML = '<div class="nb-panel-head"><b>Personalizar</b><button class="nb-x" aria-label="Cerrar">✕</button></div><div class="nb-panel-body"></div>';
    var body = p.querySelector('.nb-panel-body');
    function sec(t) {
      var d = document.createElement('div'); d.className = 'nb-sec';
      var h = document.createElement('div'); h.className = 'nb-sec-t'; h.textContent = t;
      d.appendChild(h); body.appendChild(d); return d;
    }
    function row(parent, label, ctrl) {
      var r = document.createElement('label'); r.className = 'nb-row';
      var s = document.createElement('span'); s.textContent = label;
      r.appendChild(s); r.appendChild(ctrl); parent.appendChild(r); return r;
    }
    // Colores
    var c = sec('Color de acento'), sw = document.createElement('div'); sw.className = 'nb-swatches';
    PRESETS.forEach(function (pr) {
      var b = document.createElement('button'); b.className = 'nb-sw'; b.setAttribute('aria-label', pr[0]);
      b.style.background = 'linear-gradient(135deg,' + pr[0] + ',' + pr[1] + ')';
      b.onclick = function () { S.a1 = pr[0]; S.a2 = pr[1]; commit(); };
      syncFns.push(function () { b.classList.toggle('nb-on', S.a1 === pr[0] && S.a2 === pr[1]); });
      sw.appendChild(b);
    });
    c.appendChild(sw);
    [['Acento 1', 'a1'], ['Acento 2', 'a2']].forEach(function (k) {
      var i = document.createElement('input'); i.type = 'color';
      i.oninput = function () { S[k[1]] = i.value; applyS(); saveS(); syncFns.forEach(function (fn) { if (fn !== sync) fn(); }); };
      var sync = function () { i.value = S[k[1]]; };
      syncFns.push(sync); row(c, k[0], i);
    });
    // Fuente
    var f = sec('Fuente'), fw = document.createElement('div'); fw.className = 'nb-chips';
    FONTS.forEach(function (ft, idx) {
      var b = document.createElement('button'); b.className = 'nb-chip'; b.textContent = ft[0];
      b.onclick = function () { S.font = idx; commit(); };
      syncFns.push(function () { b.classList.toggle('nb-on', S.font === idx); });
      fw.appendChild(b);
    });
    f.appendChild(fw);
    // Tarjetas
    var t = sec('Tarjetas');
    function slider(label, key, min, max, step, fmt) {
      var i = document.createElement('input'); i.type = 'range'; i.min = min; i.max = max; i.step = step;
      var v = document.createElement('em');
      var wrap = document.createElement('div'); wrap.className = 'nb-range'; wrap.appendChild(i); wrap.appendChild(v);
      i.oninput = function () { S[key] = parseFloat(i.value); applyS(); saveS(); v.textContent = fmt(S[key]); };
      syncFns.push(function () { i.value = S[key]; v.textContent = fmt(S[key]); });
      row(t, label, wrap);
    }
    slider('Zoom al pasar', 'zoom', 1, 1.15, 0.01, function (x) { return x.toFixed(2) + 'x'; });
    slider('Redondeo', 'radius', 4, 26, 1, function (x) { return x + ' px'; });
    // Opciones
    var o = sec('Opciones');
    [['Mostrar hero del Inicio', 'hero'], ['Fondo animado', 'bgAnim'], ['Animaciones', 'anim'], ['Sonidos', 'sound']].forEach(function (k) {
      var i = document.createElement('input'); i.type = 'checkbox'; i.className = 'nb-switch';
      i.onchange = function () { S[k[1]] = i.checked; commit(); };
      syncFns.push(function () { i.checked = !!S[k[1]]; });
      row(o, k[0], i);
    });
    var rb = document.createElement('button'); rb.className = 'nb-reset'; rb.textContent = 'Restablecer valores';
    rb.onclick = function () { S = Object.assign({}, DEF); commit(); };
    body.appendChild(rb);
    var note = document.createElement('div'); note.className = 'nb-note'; note.textContent = 'Se guarda en este dispositivo.';
    body.appendChild(note);
    p.querySelector('.nb-x').onclick = function () { p.classList.remove('nb-open'); };
    document.body.appendChild(p);
    syncFns.forEach(function (fn) { fn(); });
    return p;
  }

  function ensureBtn() {
    if (document.querySelector('.nb-cust-btn')) return;
    var btns = [].slice.call(document.querySelectorAll('header .MuiToolbar-root .MuiIconButton-root')).filter(function (b) { return b.querySelector('svg'); });
    var last = btns[btns.length - 1];
    if (!last) return;
    var b = document.createElement('button');
    b.className = 'MuiButtonBase-root MuiIconButton-root MuiIconButton-colorInherit MuiIconButton-sizeLarge nb-cust-btn';
    b.setAttribute('aria-label', 'Personalizar tema'); b.setAttribute('title', 'Personalizar tema');
    b.innerHTML = '<span class="material-icons palette" aria-hidden="true"></span>';
    b.onclick = function (e) { e.stopPropagation(); buildPanel().classList.toggle('nb-open'); };
    last.insertAdjacentElement('afterend', b);
  }
  document.addEventListener('click', function (e) {
    var p = document.querySelector('.nb-panel.nb-open');
    if (p && !p.contains(e.target) && !e.target.closest('.nb-cust-btn')) p.classList.remove('nb-open');
  });

  // Cabecera con cristal al hacer scroll
  function onScroll(e) {
    var t = e && e.target, y = (t && typeof t.scrollTop === 'number') ? t.scrollTop : 0;
    y = Math.max(y, window.scrollY || 0, document.body.scrollTop || 0);
    document.documentElement.classList.toggle('nb-scrolled', y > 24);
  }
  document.addEventListener('scroll', onScroll, true);

  // Marca la pestana activa del menu superior (Favoritos, Peliculas, Series...)
  function markNav() {
    var h = location.hash.split('?');
    document.querySelectorAll('header a.MuiButton-root[href]').forEach(function (a, i) {
      var u = a.getAttribute('href') || '', hh = u.indexOf('#') >= 0 ? u.slice(u.indexOf('#')) : u, p = hh.split('?');
      var same = p[0] === h[0] && (!p[1] || (h[1] || '').indexOf(p[1].split('&')[0]) >= 0);
      a.classList.toggle('nb-active', i > 0 && same);
    });
  }

  // Icono de Moonfin: se pinta con mascara para que tenga el mismo color que el resto
  function moonfin() {
    var b = document.querySelector('header .headerMoonfinButton');
    if (!b || b.getAttribute('data-nb-mf')) return;
    var img = b.querySelector('img');
    if (!img || !img.src) return;
    b.setAttribute('data-nb-mf', '1');
    b.style.setProperty('--nb-mf', 'url("' + img.src + '")');
  }

  function tick() {
    markNav();
    moonfin();
    ensureBtn();
    if (!api() || !isHome()) { episodes(); return; }
    var page = pageEl();
    if (page) { build(page); libs(page); }
    episodes();
  }

  // ---- Sonidos de interfaz (sintetizados, sin archivos). Desactivar: localStorage.setItem('nb-sound','off') ----
  var actx = null, lastHover = 0;
  function soundOn() { try { return localStorage.getItem('nb-sound') !== 'off'; } catch (e) { return true; } }
  function playing() { var v = document.querySelector('video'); return v && !v.paused; }
  // Tono suave "aura": seno puro, ataque lento, filtro paso bajo y cola larga
  function blip(freq, dur, vol, type, slideTo) {
    if (!actx || !soundOn() || playing()) return;
    var t = actx.currentTime, o = actx.createOscillator(), g = actx.createGain(), f = actx.createBiquadFilter();
    o.type = 'sine';
    f.type = 'lowpass'; f.frequency.value = 1800; f.Q.value = 0.3;
    o.frequency.setValueAtTime(freq, t);
    if (slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, t + dur);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + dur * 0.35);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(f); f.connect(g); g.connect(actx.destination);
    o.start(t); o.stop(t + dur + 0.05);
  }
  function unlock() {
    if (!actx) { try { actx = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { return; } }
    if (actx.state === 'suspended') actx.resume();
  }
  ['pointerdown', 'keydown'].forEach(function (ev) { document.addEventListener(ev, unlock, { passive: true }); });
  document.addEventListener('mouseover', function (e) {
    var el = e.target.closest && e.target.closest('.card, .emby-tab-button, .headerButton, .navMenuOption');
    if (!el || el.contains(e.relatedTarget)) return;
    var now = Date.now(); if (now - lastHover < 140) return; lastHover = now;
    blip(880, 0.16, 0.012);
  });
  document.addEventListener('click', function (e) {
    var el = e.target.closest && e.target.closest('.card, button, .nb-hero-actions a, .emby-tab-button, .navMenuOption');
    if (el) blip(587, 0.32, 0.03, 'sine', 784);
  }, true);

  document.addEventListener('viewshow', tick);
  window.addEventListener('hashchange', function () { setTimeout(tick, 400); });
  setInterval(tick, 1500);
})();
