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

  function tick() {
    if (!api() || !isHome()) return;
    var page = pageEl();
    if (page) { build(page); libs(page); }
  }

  document.addEventListener('viewshow', tick);
  window.addEventListener('hashchange', function () { setTimeout(tick, 400); });
  setInterval(tick, 1500);
})();
