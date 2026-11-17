/*!
 * Nimbus - hero del Inicio (opcional, requiere el plugin "JavaScript Injector")
 * Crea un banner destacado arriba del Inicio con un titulo al azar de tu biblioteca.
 */
(function () {
  'use strict';
  var ROTATE_MS = 12000;
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
    hero.style.backgroundImage = 'url("' + backdropUrl(it) + '")';
    hero.querySelector('.nb-hero-title').textContent = it.Name;
    hero.querySelector('.nb-hero-meta').textContent = fmtMeta(it);
    hero.querySelector('.nb-hero-play').setAttribute('href', '#/details?id=' + it.Id);
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
    hero.className = 'nb-hero';
    hero.innerHTML =
      '<div class="nb-hero-shade"></div><div class="nb-hero-body">' +
      '<div class="nb-hero-title"></div><div class="nb-hero-meta"></div>' +
      '<div class="nb-hero-actions"><a class="nb-hero-play" href="#"><span class="material-icons play_arrow" aria-hidden="true"></span>Reproducir</a>' +
      '<a class="nb-hero-fav" href="#"><span class="material-icons add" aria-hidden="true"></span>Mi lista</a></div></div>';
    container.parentNode.insertBefore(hero, container);

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

  function tick() {
    if (!api() || !isHome()) { episodes(); return; }
    var page = pageEl();
    if (page) { build(page); libs(page); }
    episodes();
  }

  // ---- Sonidos de interfaz (sintetizados, sin archivos). Desactivar: localStorage.setItem('nb-sound','off') ----
  var actx = null, lastHover = 0;
  function soundOn() { try { return localStorage.getItem('nb-sound') !== 'off'; } catch (e) { return true; } }
  function playing() { var v = document.querySelector('video'); return v && !v.paused; }
  function blip(freq, dur, vol, type, slideTo) {
    if (!actx || !soundOn() || playing()) return;
    var t = actx.currentTime, o = actx.createOscillator(), g = actx.createGain();
    o.type = type || 'sine';
    o.frequency.setValueAtTime(freq, t);
    if (slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, t + dur);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g); g.connect(actx.destination);
    o.start(t); o.stop(t + dur + 0.02);
  }
  function unlock() {
    if (!actx) { try { actx = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { return; } }
    if (actx.state === 'suspended') actx.resume();
  }
  ['pointerdown', 'keydown'].forEach(function (ev) { document.addEventListener(ev, unlock, { passive: true }); });
  document.addEventListener('mouseover', function (e) {
    var el = e.target.closest && e.target.closest('.card, .emby-tab-button, .headerButton, .navMenuOption');
    if (!el || el.contains(e.relatedTarget)) return;
    var now = Date.now(); if (now - lastHover < 60) return; lastHover = now;
    blip(1250, 0.05, 0.015, 'sine');
  });
  document.addEventListener('click', function (e) {
    var el = e.target.closest && e.target.closest('.card, button, .nb-hero-actions a, .emby-tab-button, .navMenuOption');
    if (el) blip(520, 0.12, 0.035, 'triangle', 860);
  }, true);

  document.addEventListener('viewshow', tick);
  window.addEventListener('hashchange', function () { setTimeout(tick, 400); });
  setInterval(tick, 1500);
})();
