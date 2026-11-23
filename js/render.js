/* ==========================================================================
   render.js — Renders every section/page from window.SITE_DATA.
   No personal strings live here: all copy comes from data.js or i18n.js.
   ========================================================================== */
(function () {
  'use strict';

  var Site = (window.Site = window.Site || {});
  if (document.documentElement) document.documentElement.classList.add('js');

  function D() { return Site.data || {}; }
  function t(value) { return Site.t ? Site.t(value) : ''; }
  function str(key, vars) { return Site.str ? Site.str(key, vars) : key; }
  function esc(value) { return Site.utils ? Site.utils.escapeHtml(value) : String(value || ''); }
  function sanitize(value) { return Site.utils ? Site.utils.sanitizeHtml(value) : ''; }
  function filled(value) { return Site.utils ? Site.utils.isFilled(value) : !!value; }
  function list(value) {
    if (Site.utils && Site.utils.localizedList) {
      return Site.utils.localizedList(value, Site.i18n ? Site.i18n.lang : 'en');
    }
    return Array.isArray(value) ? value : [];
  }

  var PAGE = (document.body && document.body.getAttribute('data-page')) || 'home';
  var BASE = document.body && document.body.getAttribute('data-base');
  if (BASE === null) BASE = PAGE === 'home' ? '' : '../';

  function homeHref(hash) {
    if (PAGE === 'home') return hash || '#main';
    return BASE + 'index.html' + (hash || '');
  }

  function safeUrl(value) {
    var url = String(value || '').trim();
    if (!url) return '';
    if (/^(https?:\/\/|mailto:|tel:|\/|#|\.\/|\.\.\/)/i.test(url)) return esc(url);
    return '';
  }

  function assetUrl(value) {
    var url = String(value || '').trim();
    if (!url) return '';
    if (/^(https?:\/\/|\/\/|data:|#|\/)/i.test(url)) return esc(url);
    return esc(BASE + url.replace(/^\.\//, ''));
  }

  function icon(name, extraClass) {
    return '<svg class="icon ' + (extraClass || '') + '" aria-hidden="true" focusable="false">' +
      '<use href="#i-' + name + '"></use></svg>';
  }

  function externalAttrs(url) {
    return /^https?:\/\//i.test(String(url || '')) ? ' target="_blank" rel="noopener noreferrer"' : '';
  }

  function statusKey(value) {
    return String(value || '').trim().toLowerCase().replace(/\s+/g, '-');
  }

  function statusChip(value) {
    if (!filled(value)) return '';
    return '<span class="chip chip--status" data-status="' + esc(statusKey(value)) + '">' +
      esc(Site.i18n ? Site.i18n.status(t(value)) : t(value)) + '</span>';
  }

  function formatDate(value, opts) {
    if (!filled(value)) return '';
    var raw = String(value).trim();
    var lang = Site.i18n ? Site.i18n.lang : 'en';
    var locale = lang === 'ar' ? 'ar-EG' : 'en-US';
    try {
      if (/^\d{4}$/.test(raw)) return raw;
      if (/^\d{4}-\d{2}$/.test(raw)) {
        var parts = raw.split('-');
        var d = new Date(Number(parts[0]), Number(parts[1]) - 1, 1);
        return new Intl.DateTimeFormat(locale, { year: 'numeric', month: 'short' }).format(d);
      }
      var parsed = new Date(raw);
      if (!isNaN(parsed.getTime())) {
        return new Intl.DateTimeFormat(locale, opts || { year: 'numeric', month: 'short' }).format(parsed);
      }
    } catch (e) { /* ignore */ }
    return raw;
  }

  function firstName() {
    var name = t(D().profile && D().profile.name) || 'Your Name';
    return name.split(' ')[0];
  }

  function socialLinks() {
    var data = D();
    var links = data.links || {};
    var order = [
      ['github', 'github'],
      ['linkedin', 'linkedin'],
      ['twitter', 'x'],
      ['kaggle', 'kaggle'],
      ['medium', 'medium'],
      ['youtube', 'youtube'],
      ['website', 'globe']
    ];
    var list = [];
    order.forEach(function (pair) {
      var url = (links[pair[0]] || '').trim();
      if (!url) return;
      var key = pair[0];
      list.push({
        key: key,
        url: url,
        icon: pair[1],
        label: key === 'website' ? str('common.website') : str('common.' + key)
      });
    });
    return list;
  }

  function socialRow(extraClass) {
    var links = socialLinks();
    if (!links.length) return '';
    return '<div class="' + (extraClass || 'hero__socials') + '">' + links.map(function (link) {
      return '<a class="hero__social-link" href="' + safeUrl(link.url) + '"' + externalAttrs(link.url) +
        ' aria-label="' + esc(link.label) + '" title="' + esc(link.label) + '">' + icon(link.icon) + '</a>';
    }).join('') + '</div>';
  }

  /* ---------------------------------------------------------------------
     Section registry (order drives numbering + nav)
     --------------------------------------------------------------------- */
  function visibleSections() {
    var data = D();
    var keys = [];
    if ((data.profile && data.profile.aboutHtml && data.profile.aboutHtml.length) ||
        (data.profile && filled(data.profile.bio))) keys.push('about');
    if ((data.focusAreas || []).length) keys.push('focus');
    if (data.skills && data.skills.groups && data.skills.groups.length) keys.push('skills');
    if ((data.projects || []).length) keys.push('projects');
    if (data.research && data.research.items && data.research.items.length) keys.push('research');
    if ((data.experience || []).length || (data.education || []).length || (data.courses || []).length) keys.push('experience');
    if ((data.blog || []).length) keys.push('writing');
    if (filled(data.profile && data.profile.email) || filled(data.contact && data.contact.intro)) keys.push('contact');
    return keys;
  }

  function sectionLabel(key) {
    return str('nav.' + key);
  }

  function sectionHeader(key, title, subtitle) {
    var sections = visibleSections();
    var index = sections.indexOf(key);
    var number = index === -1 ? '' : String(index + 1).padStart(2, '0');
    return '<div class="section-header reveal">' +
      (number ? '<span class="section-header__index">' + number + ' — ' + esc(sectionLabel(key)) + '</span>' : '') +
      '<h2 class="section-header__title" id="' + key + '-title">' + esc(title) + '</h2>' +
      (subtitle ? '<p class="section-header__subtitle">' + esc(subtitle) + '</p>' : '') +
      '</div>';
  }

  function section(key, title, body, subtitle) {
    return '<section class="section" id="' + key + '" aria-labelledby="' + key + '-title">' +
      sectionHeader(key, title, subtitle) +
      '<div class="section-body">' + body + '</div>' +
      '</section>';
  }

  /* ---------------------------------------------------------------------
     NAV
     --------------------------------------------------------------------- */
  function renderNav() {
    var skip = document.getElementById('skip-link');
    if (skip) skip.textContent = str('common.skipToContent');
    var mount = document.getElementById('site-header');
    if (!mount) return;
    var data = D();
    var sections = visibleSections();
    var name = t(data.profile && data.profile.name) || 'Your Name';
    var initials = (data.profile && data.profile.initials) || 'YN';
    var langEnabled = Site.i18n && Site.i18n.enabled();

    var links = sections.map(function (key) {
      return '<li><a class="nav__link" href="' + homeHref('#' + key) + '" data-nav="' + key + '">' +
        esc(sectionLabel(key)) + '</a></li>';
    }).join('');

    var drawerLinks = sections.map(function (key) {
      return '<li><a class="nav__drawer-link" href="' + homeHref('#' + key) + '" data-nav="' + key + '">' +
        esc(sectionLabel(key)) + '</a></li>';
    }).join('');

    var langBtn = langEnabled
      ? '<button type="button" class="lang-toggle" data-action="lang" aria-label="' +
        esc(str('common.language')) + '" title="' + esc(str('common.language')) + '">' +
        (Site.i18n.lang === 'ar' ? 'EN' : 'AR') + '</button>'
      : '';

    mount.innerHTML =
      '<div class="scroll-progress" id="scroll-progress" aria-hidden="true"></div>' +
      '<div class="nav__inner">' +
        '<a class="nav__logo" href="' + homeHref('') + '">' +
          '<span class="nav__monogram" aria-hidden="true">' + esc(initials) + '</span>' +
          '<span>' + esc(firstName()) + '</span>' +
        '</a>' +
        '<nav aria-label="' + esc(str('nav.primary')) + '" class="nav__nav">' +
          '<ul class="nav__links">' + links + '</ul>' +
        '</nav>' +
        '<div class="nav__actions">' +
          '<button type="button" class="btn btn--icon" data-action="palette" aria-label="' +
            esc(str('common.search')) + '" title="' + esc(str('common.search')) + '">' + icon('search') + '</button>' +
          langBtn +
          '<button type="button" class="theme-toggle" data-action="theme" aria-label="' +
            esc(str('common.theme')) + '" title="' + esc(str('common.theme')) + '">' +
            '<span class="theme-toggle__moon">' + icon('moon') + '</span>' +
            '<span class="theme-toggle__sun">' + icon('sun') + '</span>' +
          '</button>' +
          '<a class="btn btn--sm btn--primary nav__cta" href="' + homeHref('#contact') + '">' +
            esc(str('nav.contact')) + '</a>' +
          '<button type="button" class="nav__hamburger" data-action="drawer-toggle" aria-expanded="false" aria-controls="nav-drawer" aria-label="' +
            esc(str('common.menu')) + '">' +
            '<span class="nav__hamburger-line"></span><span class="nav__hamburger-line"></span><span class="nav__hamburger-line"></span>' +
          '</button>' +
        '</div>' +
      '</div>' +
      '<div class="nav__drawer-backdrop" data-action="drawer-close" hidden></div>' +
      '<div class="nav__drawer" id="nav-drawer" role="dialog" aria-modal="true" aria-hidden="true" aria-label="' + esc(str('nav.primary')) + '">' +
        '<button type="button" class="btn btn--icon nav__drawer-close" data-action="drawer-close" aria-label="' +
          esc(str('common.close')) + '">' + icon('close') + '</button>' +
        '<ul class="nav__drawer-links">' + drawerLinks + '</ul>' +
        '<a class="btn btn--primary nav__drawer-cta" href="' + homeHref('#contact') + '">' +
          esc(str('nav.contact')) + '</a>' +
      '</div>';
  }

  /* ---------------------------------------------------------------------
     HERO
     --------------------------------------------------------------------- */
  function renderHero() {
    var data = D();
    var p = data.profile || {};
    var name = t(p.name) || 'Your Name';
    var role = t(p.role);
    var bio = t(p.bio) || t(p.tagline);
    var availability = p.availability && p.availability.show && filled(p.availability.text)
      ? '<span class="availability"><span class="availability__dot" aria-hidden="true"></span>' +
        esc(t(p.availability.text)) + '</span>'
      : '';

    var ctas = [];
    if ((data.projects || []).length) {
      ctas.push('<a class="btn btn--primary" href="' + homeHref('#projects') + '">' +
        icon('arrow-right') + esc(str('hero.viewProjects')) + '</a>');
    }
    if (data.cv && filled(data.cv.file)) {
      ctas.push('<a class="btn btn--secondary" href="' + assetUrl(data.cv.file) + '" download>' +
        icon('download') + esc(t(data.cv.label) || str('hero.downloadCv')) + '</a>');
    }
    if (!ctas.length && filled(p.email)) {
      ctas.push('<a class="btn btn--primary" href="mailto:' + esc(p.email) + '">' +
        icon('mail') + esc(str('hero.contact')) + '</a>');
    }

    var stats = (data.hero && data.hero.stats || []).map(function (stat) {
      return '<div class="hero__stat"><span class="hero__stat-value">' + esc(t(stat.value)) +
        '</span><span class="hero__stat-label">' + esc(t(stat.label)) + '</span></div>';
    }).join('');

    return '<section class="hero" aria-labelledby="hero-title">' +
      '<div class="hero__content">' +
        availability +
        '<p class="hero__greeting">' + esc(str('hero.greeting')) + '</p>' +
        '<h1 class="hero__name" id="hero-title">' + esc(name) + '</h1>' +
        (role ? '<p class="hero__role">' + esc(role) + '</p>' : '') +
        (bio ? '<p class="hero__tagline">' + esc(bio) + '</p>' : '') +
        (ctas.length ? '<div class="hero__cta">' + ctas.join('') + '</div>' : '') +
        (stats ? '<div class="hero__stats">' + stats + '</div>' : '') +
        socialRow('hero__socials') +
      '</div>' +
      '<div class="hero__visual" id="hero-visual" aria-hidden="true"></div>' +
      '</section>';
  }

  /* ---------------------------------------------------------------------
     ABOUT
     --------------------------------------------------------------------- */
  function renderAbout() {
    var data = D();
    var p = data.profile || {};
    var paragraphs = Array.isArray(p.aboutHtml) ? p.aboutHtml : [];
    var body = paragraphs.map(function (html) { return sanitize(t(html)); }).join('');

    var now = data.now || {};
    var rows = [
      ['building', now.building],
      ['learning', now.learning],
      ['reading', now.reading]
    ].filter(function (row) { return filled(row[1]); }).map(function (row) {
      return '<li class="currently-item"><span class="currently-item__label">' + esc(str('about.' + row[0])) +
        '</span><span class="currently-item__text">' + esc(t(row[1])) + '</span></li>';
    }).join('');

    var currently = rows
      ? '<aside class="currently-card"><span class="currently-card__indicator" aria-hidden="true"></span>' +
        '<div class="currently-card__content"><h3 class="currently-card__title">' + esc(str('about.currently')) +
        '</h3><ul class="currently-list">' + rows + '</ul></div></aside>'
      : '';

    var photo = filled(p.photo)
      ? '<figure class="photo about__photo"><img class="photo__img" src="' + assetUrl(p.photo) +
        '" alt="' + esc(t(p.name)) + '" width="200" height="200" loading="lazy" decoding="async"></figure>'
      : '';

    var content = '<div class="about-grid">' +
      '<div class="about-copy prose">' + body + currently + '</div>' +
      (photo ? '<div class="about-media">' + photo + '</div>' : '') +
      '</div>';

    return section('about', str('sections.about'), content);
  }

  /* ---------------------------------------------------------------------
     FOCUS AREAS
     --------------------------------------------------------------------- */
  function renderFocus() {
    var data = D();
    var cards = (data.focusAreas || []).map(function (item) {
      return '<article class="focus-card">' +
        '<span class="focus-card__icon">' + icon(item.icon || 'cpu') + '</span>' +
        '<h3 class="focus-card__title">' + esc(t(item.title)) + '</h3>' +
        '<p class="focus-card__text">' + esc(t(item.text)) + '</p>' +
        '</article>';
    }).join('');
    return section('focus', str('sections.focus'), '<div class="card-grid card-grid--2 focus-grid">' + cards + '</div>');
  }

  /* ---------------------------------------------------------------------
     SKILLS
     --------------------------------------------------------------------- */
  function renderSkills() {
    var data = D();
    var skills = data.skills || {};
    var groups = (skills.groups || []).map(function (group) {
      var tags = (group.items || []).map(function (item) {
        return '<span class="chip skill-tag" data-skill="' + esc(String(item).toLowerCase()) + '">' + esc(item) + '</span>';
      }).join('');
      return '<div class="skills__group" data-skill-group>' +
        '<h3 class="skills__group-title">' + esc(t(group.title)) + '</h3>' +
        '<div class="skills__tags">' + tags + '</div></div>';
    }).join('');

    var learning = list(skills.learning);
    var learningStrip = learning.length
      ? '<div class="skills__learning"><span class="skills__learning-label">' + esc(str('skills.learning')) +
        '</span><div class="skills__learning-tags">' + learning.map(function (item) {
          return '<span class="chip chip--tech">' + esc(item) + '</span>';
        }).join('') + '</div></div>'
      : '';

    var body = '<div class="skills">' +
      '<div class="skills__filter">' +
        '<label class="search-input" for="skills-filter">' + icon('search', 'search-input__icon') +
          '<input class="search-input__field" id="skills-filter" type="search" autocomplete="off" placeholder="' +
          esc(str('skills.filterPlaceholder')) + '" aria-label="' + esc(str('skills.filterLabel')) + '">' +
        '</label>' +
        '<p class="skills__empty" data-skills-empty hidden>' + esc(str('skills.empty')) + '</p>' +
      '</div>' +
      '<div class="skills__groups">' + groups + '</div>' +
      learningStrip +
      '</div>';

    return section('skills', str('sections.skills'), body);
  }

  /* ---------------------------------------------------------------------
     PROJECTS — cards, explorer, modal
     --------------------------------------------------------------------- */
  function projectLinks(project, compact) {
    var links = project.links || {};
    var out = [];
    if (filled(links.github)) {
      out.push('<a class="project-card__link" href="' + safeUrl(links.github) + '"' + externalAttrs(links.github) +
        ' aria-label="' + esc(str('common.sourceCode')) + '">' + icon('github') +
        (compact ? '' : '<span>' + esc(str('common.sourceCode')) + '</span>') + '</a>');
    }
    if (filled(links.demo)) {
      out.push('<a class="project-card__link" href="' + safeUrl(links.demo) + '"' + externalAttrs(links.demo) +
        ' aria-label="' + esc(str('common.liveDemo')) + '">' + icon('external-link') +
        (compact ? '' : '<span>' + esc(str('common.liveDemo')) + '</span>') + '</a>');
    }
    if (filled(links.caseStudy)) {
      out.push('<a class="project-card__link" href="' + safeUrl(links.caseStudy) + '"' + externalAttrs(links.caseStudy) +
        ' aria-label="' + esc(str('common.caseStudy')) + '">' + icon('code') +
        (compact ? '' : '<span>' + esc(str('common.caseStudy')) + '</span>') + '</a>');
    }
    return out.join('');
  }

  function projectCard(project) {
    var highlights = (project.highlights || []).slice(0, 3).map(function (h) {
      return '<li>' + esc(t(h)) + '</li>';
    }).join('');
    var tech = (project.tech || []).map(function (item) {
      return '<span class="chip chip--tech">' + esc(item) + '</span>';
    }).join('');

    return '<article class="project-card" data-project-card="' + esc(project.id) + '">' +
      '<div class="project-card__body">' +
        '<div class="project-card__top">' + statusChip(project.status) +
          (project.featured ? '<span class="chip chip--badge">' + esc(str('projects.featuredTag')) + '</span>' : '') +
        '</div>' +
        '<h3 class="project-card__title">' +
          '<button type="button" class="project-card__open" data-open-project="' + esc(project.id) + '">' +
            esc(t(project.title)) + '</button>' +
        '</h3>' +
        '<p class="project-card__description">' + esc(t(project.summary)) + '</p>' +
        (highlights ? '<ul class="project-card__highlights">' + highlights + '</ul>' : '') +
        (tech ? '<div class="project-card__tags">' + tech + '</div>' : '') +
      '</div>' +
      '<div class="project-card__footer">' +
        '<span class="project-card__meta">' + esc(formatDate(project.date)) + '</span>' +
        '<div class="project-card__links">' + projectLinks(project, true) +
          '<button type="button" class="project-card__link" data-open-project="' + esc(project.id) + '">' +
            esc(str('common.viewProject')) + icon('arrow-right') + '</button>' +
        '</div>' +
      '</div>' +
      '</article>';
  }

  function projectModalHtml(project) {
    var m = str('projects.modal');
    function block(labelKey, value) {
      if (!filled(value)) return '';
      return '<div class="modal__section"><h4 class="modal__section-title">' + esc(str('projects.modal.' + labelKey)) +
        '</h4><div class="modal__section-content">' + esc(t(value)) + '</div></div>';
    }
    var highlights = (project.highlights || []).map(function (h) {
      return '<li>' + esc(t(h)) + '</li>';
    }).join('');

    var tech = (project.tech || []).map(function (item) {
      return '<span class="chip chip--tech">' + esc(item) + '</span>';
    }).join('');

    var meta = [
      ['role', t(project.role)],
      ['timeline', formatDate(project.date)],
      ['category', t(project.category)],
      ['status', Site.i18n ? Site.i18n.status(t(project.status)) : t(project.status)]
    ].filter(function (row) { return filled(row[1]); }).map(function (row) {
      return '<div class="modal__meta-item"><span class="modal__meta-label">' + esc(str('projects.modal.' + row[0])) +
        '</span><span class="modal__meta-value">' + esc(row[1]) + '</span></div>';
    }).join('');

    return '<div class="modal-overlay" data-modal-overlay>' +
      '<div class="modal" role="dialog" aria-modal="true" aria-labelledby="project-modal-title" tabindex="-1">' +
        '<div class="modal__header">' +
          '<div><span class="modal__eyebrow">' + esc(t(project.category)) + '</span>' +
            '<h2 class="modal__title" id="project-modal-title">' + esc(t(project.title)) + '</h2>' +
            '<div class="modal__status">' + statusChip(project.status) + '</div></div>' +
          '<button type="button" class="btn btn--icon modal__close" data-action="close-modal" aria-label="' +
            esc(str('common.close')) + '">' + icon('close') + '</button>' +
        '</div>' +
        '<div class="modal__body">' +
          (meta ? '<div class="modal__meta">' + meta + '</div>' : '') +
          block('overview', project.description) +
          (highlights ? '<div class="modal__section"><h4 class="modal__section-title">' +
            esc(str('projects.modal.highlights')) + '</h4><div class="modal__section-content"><ul>' +
            highlights + '</ul></div></div>' : '') +
          block('problem', project.problem) +
          block('approach', project.approach) +
          block('result', project.result) +
          (tech ? '<div class="modal__section"><h4 class="modal__section-title">' + esc(str('projects.modal.tech')) +
            '</h4><div class="modal__tags">' + tech + '</div></div>' : '') +
        '</div>' +
        (projectLinks(project) ? '<div class="modal__footer">' + projectLinks(project) + '</div>' : '') +
      '</div></div>';
  }

  var lastFocused = null;
  var modalKeyHandler = null;

  function closeModal() {
    var root = document.getElementById('modal-root');
    if (!root) return;
    var overlay = root.querySelector('[data-modal-overlay]');
    if (!overlay) return;
    overlay.classList.remove('modal-overlay--open');
    document.body.style.overflow = '';
    if (modalKeyHandler) document.removeEventListener('keydown', modalKeyHandler);
    modalKeyHandler = null;
    var captured = overlay;
    window.setTimeout(function () {
      if (root.contains(captured)) root.innerHTML = '';
    }, 220);
    if (lastFocused && typeof lastFocused.focus === 'function') {
      try { lastFocused.focus(); } catch (e) { /* ignore */ }
    }
    lastFocused = null;
  }

  function trapModalFocus(event, overlay) {
    if (event.key !== 'Tab') return;
    var focusable = overlay.querySelectorAll(
      'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
    );
    if (!focusable.length) return;
    var first = focusable[0];
    var last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  function openProject(id) {
    var project = (D().projects || []).filter(function (p) { return p.id === id; })[0];
    if (!project) return;
    var root = document.getElementById('modal-root');
    if (!root) return;
    closeModal();
    lastFocused = document.activeElement;
    root.innerHTML = projectModalHtml(project);
    var overlay = root.querySelector('[data-modal-overlay]');
    document.body.style.overflow = 'hidden';

    modalKeyHandler = function (event) {
      if (event.key === 'Escape') {
        event.preventDefault();
        closeModal();
      } else {
        trapModalFocus(event, overlay);
      }
    };
    document.addEventListener('keydown', modalKeyHandler);

    overlay.addEventListener('click', function (event) {
      if (event.target === overlay) closeModal();
      if (event.target.closest('[data-action="close-modal"]')) closeModal();
    });

    window.requestAnimationFrame(function () {
      overlay.classList.add('modal-overlay--open');
      var closeBtn = overlay.querySelector('[data-action="close-modal"]');
      (closeBtn || overlay.querySelector('.modal')).focus();
    });
  }

  function mountExplorer(root, options) {
    if (!root) return;
    options = options || {};
    var data = D();
    var all = data.projects || [];
    var limit = options.limit || 0;
    var archive = !!options.archive;
    var showTechFilter = !!options.techFilter;

    var state = { q: '', cat: '', tech: [], sort: 'featured' };

    if (archive && window.URLSearchParams) {
      try {
        var params = new URLSearchParams(window.location.search);
        state.q = params.get('q') || '';
        state.cat = params.get('cat') || '';
        state.sort = params.get('sort') || 'featured';
      } catch (e) { /* ignore */ }
    }

    var categories = [];
    all.forEach(function (project) {
      var c = t(project.category);
      if (c && categories.indexOf(c) === -1) categories.push(c);
    });

    var techs = [];
    all.forEach(function (project) {
      (project.tech || []).forEach(function (tech) {
        if (techs.indexOf(tech) === -1) techs.push(tech);
      });
    });
    techs.sort(function (a, b) { return a.localeCompare(b); });

    var catChips = ['<button type="button" class="chip chip--interactive is-active" data-cat="">' +
      esc(str('projects.all')) + '</button>'].concat(categories.map(function (cat) {
      return '<button type="button" class="chip chip--interactive" data-cat="' + esc(cat) + '">' + esc(cat) + '</button>';
    })).join('');

    var techChips = showTechFilter
      ? '<div class="explorer-filter" data-tech-filter><span class="explorer-filter__label">' +
        esc(str('projects.modal.tech')) + '</span><div class="chip-row">' + techs.map(function (tech) {
          return '<button type="button" class="chip chip--interactive" data-tech="' + esc(tech) + '">' + esc(tech) + '</button>';
        }).join('') + '</div></div>'
      : '';

    root.innerHTML =
      '<div class="explorer-controls">' +
        '<label class="search-input explorer-search" for="project-search">' + icon('search', 'search-input__icon') +
          '<input class="search-input__field" id="project-search" type="search" autocomplete="off" placeholder="' +
          esc(str('projects.searchPlaceholder')) + '" aria-label="' + esc(str('projects.searchLabel')) + '" value="' + esc(state.q) + '">' +
          '<button type="button" class="search-input__clear" data-clear-search aria-label="' + esc(str('common.close')) + '">' +
          icon('close') + '</button>' +
        '</label>' +
        '<div class="explorer-filter" data-cat-filter><span class="explorer-filter__label">' +
          esc(str('projects.modal.category')) + '</span><div class="chip-row">' + catChips + '</div></div>' +
        techChips +
        '<label class="explorer-sort"><span class="explorer-filter__label">' + esc(str('projects.sortLabel')) + '</span>' +
          '<select class="explorer-sort__select" data-sort aria-label="' + esc(str('projects.sortLabel')) + '">' +
            '<option value="featured">' + esc(str('projects.featured')) + '</option>' +
            '<option value="newest">' + esc(str('projects.newest')) + '</option>' +
            '<option value="az">' + esc(str('projects.az')) + '</option>' +
          '</select></label>' +
      '</div>' +
      '<div class="explorer-meta"><span class="explorer-count" data-count aria-live="polite"></span>' +
        '<button type="button" class="btn btn--ghost btn--sm" data-clear-all hidden>' +
          esc(str('projects.clearFilters')) + '</button></div>' +
      '<div class="card-grid card-grid--3" data-project-grid></div>' +
      '<div class="empty-state" data-project-empty hidden>' + icon('search', 'empty-state__icon') +
        '<h3 class="empty-state__title">' + esc(str('projects.emptyTitle')) + '</h3>' +
        '<p class="empty-state__message">' + esc(str('projects.emptyMessage')) + '</p>' +
        '<button type="button" class="btn btn--secondary btn--sm" data-clear-all>' +
          esc(str('projects.clearFilters')) + '</button></div>';

    var search = root.querySelector('#project-search');
    var grid = root.querySelector('[data-project-grid]');
    var empty = root.querySelector('[data-project-empty]');
    var count = root.querySelector('[data-count]');
    var clearButtons = root.querySelectorAll('[data-clear-all]');
    var clearSearch = root.querySelector('[data-clear-search]');
    var sortSelect = root.querySelector('[data-sort]');

    if (sortSelect) sortSelect.value = state.sort;

    function matches(project) {
      var query = state.q.trim().toLowerCase();
      if (query) {
        var haystack = [t(project.title), t(project.summary), t(project.category)]
          .concat(project.tech || []).join(' ').toLowerCase();
        if (haystack.indexOf(query) === -1) return false;
      }
      if (state.cat && t(project.category) !== state.cat) return false;
      if (state.tech.length) {
        var ok = state.tech.every(function (tech) {
          return (project.tech || []).indexOf(tech) !== -1;
        });
        if (!ok) return false;
      }
      return true;
    }

    function sortList(list) {
      var copy = list.slice();
      if (state.sort === 'az') {
        copy.sort(function (a, b) { return t(a.title).localeCompare(t(b.title)); });
      } else if (state.sort === 'newest') {
        copy.sort(function (a, b) { return String(b.date || '').localeCompare(String(a.date || '')); });
      } else {
        copy.sort(function (a, b) {
          var fa = a.featured ? 1 : 0;
          var fb = b.featured ? 1 : 0;
          if (fa !== fb) return fb - fa;
          return String(b.date || '').localeCompare(String(a.date || ''));
        });
      }
      return copy;
    }

    function syncUrl() {
      if (!archive || !window.URLSearchParams || !window.history.replaceState) return;
      try {
        var params = new URLSearchParams();
        if (state.q) params.set('q', state.q);
        if (state.cat) params.set('cat', state.cat);
        if (state.sort && state.sort !== 'featured') params.set('sort', state.sort);
        var qs = params.toString();
        window.history.replaceState(null, '', window.location.pathname + (qs ? '?' + qs : '') + window.location.hash);
      } catch (e) { /* ignore */ }
    }

    function apply() {
      var filtered = sortList(all.filter(matches));
      var shown = limit ? filtered.slice(0, limit) : filtered;
      grid.innerHTML = shown.map(projectCard).join('');
      var total = filtered.length;
      if (count) {
        count.textContent = total === 1
          ? str('projects.countOne')
          : str('projects.count', { count: String(total) });
      }
      if (empty) empty.hidden = total !== 0;
      if (grid) grid.hidden = total === 0;
      var hasFilter = !!(state.q || state.cat || state.tech.length);
      Array.prototype.forEach.call(clearButtons, function (btn) { btn.hidden = !hasFilter; });
      if (clearSearch) clearSearch.parentNode.classList.toggle('search-input--has-value', !!state.q);
      syncUrl();
    }

    if (search) {
      search.addEventListener('input', function () {
        state.q = search.value;
        apply();
      });
    }
    if (clearSearch) {
      clearSearch.addEventListener('click', function () {
        state.q = '';
        if (search) search.value = '';
        apply();
        if (search) search.focus();
      });
    }
    root.querySelectorAll('[data-cat]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        state.cat = btn.getAttribute('data-cat') || '';
        root.querySelectorAll('[data-cat]').forEach(function (other) {
          other.classList.toggle('is-active', other === btn);
          other.setAttribute('aria-pressed', other === btn ? 'true' : 'false');
        });
        apply();
      });
    });
    root.querySelectorAll('[data-tech]').forEach(function (btn) {
      btn.setAttribute('aria-pressed', 'false');
      btn.addEventListener('click', function () {
        var tech = btn.getAttribute('data-tech');
        var index = state.tech.indexOf(tech);
        if (index === -1) state.tech.push(tech); else state.tech.splice(index, 1);
        btn.classList.toggle('is-active', index === -1);
        btn.setAttribute('aria-pressed', index === -1 ? 'true' : 'false');
        apply();
      });
    });
    Array.prototype.forEach.call(clearButtons, function (btn) {
      btn.addEventListener('click', function () {
        state.q = '';
        state.cat = '';
        state.tech = [];
        if (search) search.value = '';
        root.querySelectorAll('[data-cat]').forEach(function (other) {
          var isAll = !other.getAttribute('data-cat');
          other.classList.toggle('is-active', isAll);
          other.setAttribute('aria-pressed', isAll ? 'true' : 'false');
        });
        root.querySelectorAll('[data-tech]').forEach(function (other) {
          other.classList.remove('is-active');
          other.setAttribute('aria-pressed', 'false');
        });
        apply();
      });
    });
    if (sortSelect) {
      sortSelect.addEventListener('change', function () {
        state.sort = sortSelect.value;
        apply();
      });
    }

    root.addEventListener('click', function (event) {
      // Never hijack real links.
      if (event.target.closest('a')) return;
      var trigger = event.target.closest('[data-open-project]');
      var card = event.target.closest('[data-project-card]');
      if (!trigger && !card) return;
      event.preventDefault();
      openProject(trigger
        ? trigger.getAttribute('data-open-project')
        : card.getAttribute('data-project-card'));
    });

    // Some category chip initial state.
    root.querySelectorAll('[data-cat]').forEach(function (btn) {
      var isCurrent = (btn.getAttribute('data-cat') || '') === state.cat;
      btn.classList.toggle('is-active', isCurrent);
      btn.setAttribute('aria-pressed', isCurrent ? 'true' : 'false');
    });

    apply();
  }

  function renderProjectsHome() {
    var data = D();
    var body = '<div class="project-explorer" data-explorer>—</div>' +
      '<div class="view-all"><a class="btn btn--ghost" href="' + (PAGE === 'home' ? 'projects/index.html' : 'index.html') + '">' +
      esc(str('projects.viewAll')) + icon('arrow-right') + '</a></div>';
    return section('projects', str('sections.projects'), body);
  }

  /* ---------------------------------------------------------------------
     RESEARCH
     --------------------------------------------------------------------- */
  function renderResearch() {
    var data = D();
    var research = data.research || {};
    var cards = (research.items || []).map(function (item) {
      return '<article class="research-card">' +
        '<div class="research-card__top">' + statusChip(item.status) + '</div>' +
        '<h3 class="research-card__title">' + esc(t(item.title)) + '</h3>' +
        '<p class="research-card__summary">' + esc(t(item.text)) + '</p>' +
        '</article>';
    }).join('');

    var cta = research.cta && (filled(research.cta.title) || filled(research.cta.text))
      ? '<div class="research-cta">' +
        (filled(research.cta.title) ? '<h3 class="research-cta__title">' + esc(t(research.cta.title)) + '</h3>' : '') +
        (filled(research.cta.text) ? '<p class="research-cta__text">' + esc(t(research.cta.text)) + '</p>' : '') +
        '<a class="btn btn--primary btn--sm" href="' + homeHref('#contact') + '">' +
        esc(str('research.cta')) + icon('arrow-right') + '</a></div>'
      : '';

    return section('research', str('sections.research'),
      '<div class="card-grid card-grid--3">' + cards + '</div>' + cta);
  }

  /* ---------------------------------------------------------------------
     EXPERIENCE / EDUCATION
     --------------------------------------------------------------------- */
  function timelineItem(item) {
    var bullets = (item.bullets || []).map(function (b) {
      return '<li>' + esc(t(b)) + '</li>';
    }).join('');
    var badges = list(item.badges).map(function (b) {
      return '<span class="chip">' + esc(t(b)) + '</span>';
    }).join('');
    return '<li class="timeline__item">' +
      '<span class="timeline__dot' + (item.current ? ' timeline__dot--live' : '') + '" aria-hidden="true"></span>' +
      (filled(item.period) ? '<div class="timeline__date">' + esc(t(item.period)) +
        (item.current ? ' · ' + esc(str('experience.current')) : '') + '</div>' : '') +
      '<h4 class="timeline__title">' + esc(t(item.title)) + '</h4>' +
      (filled(item.org) ? '<div class="timeline__org">' + esc(t(item.org)) + '</div>' : '') +
      (bullets ? '<ul class="timeline__bullets">' + bullets + '</ul>' : '') +
      (badges ? '<div class="timeline__tags">' + badges + '</div>' : '') +
      '</li>';
  }

  function renderExperience() {
    var data = D();
    var experience = data.experience || [];
    var education = data.education || [];
    var courses = data.courses || [];

    var left = experience.length
      ? '<div class="timeline-column"><h3 class="timeline-column__title">' + esc(str('experience.experience')) + '</h3>' +
        '<ol class="timeline">' + experience.map(timelineItem).join('') + '</ol></div>'
      : '';

    var right = '';
    if (education.length || courses.length) {
      right = '<div class="timeline-column"><h3 class="timeline-column__title">' + esc(str('experience.education')) + '</h3>';
      if (education.length) right += '<ol class="timeline">' + education.map(timelineItem).join('') + '</ol>';
      if (courses.length) {
        right += '<h3 class="timeline-column__title timeline-column__title--sub">' + esc(str('experience.courses')) + '</h3>' +
          '<ul class="course-list">' + courses.map(function (course) {
            var link = filled(course.link) ? safeUrl(course.link) : '';
            var inner = '<span class="course-list__title">' + esc(t(course.title)) + '</span>' +
              (filled(course.org) ? '<span class="course-list__org">' + esc(t(course.org)) + '</span>' : '') +
              (filled(course.period) ? '<span class="course-list__period">' + esc(t(course.period)) + '</span>' : '');
            return '<li class="course-list__item">' + (link
              ? '<a href="' + link + '"' + externalAttrs(course.link) + '>' + inner + icon('external-link') + '</a>'
              : inner) + '</li>';
          }).join('') + '</ul>';
      }
      right += '</div>';
    }

    return section('experience', str('sections.experience'),
      '<div class="timeline-grid">' + left + right + '</div>');
  }

  /* ---------------------------------------------------------------------
     WRITING
     --------------------------------------------------------------------- */
  function postHref(link) {
    var url = String(link || '').trim();
    if (!url) return '';
    if (/^(https?:\/\/|\/)/i.test(url)) return url;
    if (PAGE === 'home') return url.replace(/^\.\//, '');
    if (PAGE === 'blog') return url.replace(/^blog\//, '').replace(/^\.\//, '');
    return '../' + url.replace(/^\.\//, '');
  }

  function renderWriting() {
    var posts = (D().blog || []).slice(0, 3);
    var items = posts.map(function (post) {
      return '<a class="blog-item" href="' + safeUrl(postHref(post.link)) + '">' +
        '<span class="blog-item__date">' + esc(formatDate(post.date, { year: 'numeric', month: 'short', day: 'numeric' })) + '</span>' +
        '<span class="blog-item__title">' + esc(t(post.title)) + '</span>' +
        '<span class="blog-item__category">' + esc(t(post.category)) + '</span>' +
        '<span class="blog-item__reading-time">' + esc(t(post.readingTime) || '') + '</span>' +
        '</a>';
    }).join('');
    var body = '<div class="blog-list">' + items + '</div>' +
      '<div class="view-all"><a class="btn btn--ghost" href="' + (PAGE === 'home' ? 'blog/index.html' : 'index.html') + '">' +
      esc(str('common.viewAll')) + icon('arrow-right') + '</a></div>';
    return section('writing', str('sections.writing'), body);
  }

  /* ---------------------------------------------------------------------
     CONTACT
     --------------------------------------------------------------------- */
  function renderContact() {
    var data = D();
    var p = data.profile || {};
    var contact = data.contact || {};
    var intro = t(contact.intro) || t(p.tagline);

    var items = [];
    if (filled(p.email)) {
      items.push('<li class="contact-item"><span class="contact-item__icon">' + icon('mail') + '</span>' +
        '<div class="contact-item__body"><span class="contact-item__label">' + esc(str('common.email')) + '</span>' +
        '<a class="contact-item__value" href="mailto:' + esc(p.email) + '">' + esc(p.email) + '</a></div>' +
        '<button type="button" class="btn btn--icon" data-action="copy" data-copy="' + esc(p.email) +
        '" aria-label="' + esc(str('common.copy')) + '" title="' + esc(str('common.copy')) + '">' + icon('copy') + '</button></li>');
    }
    if (filled(p.phone)) {
      items.push('<li class="contact-item"><span class="contact-item__icon">' + icon('phone') + '</span>' +
        '<div class="contact-item__body"><span class="contact-item__label">' + esc(str('common.phone')) + '</span>' +
        '<a class="contact-item__value" href="tel:' + esc(String(p.phone).replace(/[^\d+]/g, '')) + '">' + esc(p.phone) + '</a></div></li>');
    }
    if (filled(p.location)) {
      items.push('<li class="contact-item"><span class="contact-item__icon">' + icon('map-pin') + '</span>' +
        '<div class="contact-item__body"><span class="contact-item__label">' + esc(str('common.location')) + '</span>' +
        '<span class="contact-item__value">' + esc(t(p.location)) + '</span></div></li>');
    }
    socialLinks().forEach(function (link) {
      items.push('<li class="contact-item"><span class="contact-item__icon">' + icon(link.icon) + '</span>' +
        '<div class="contact-item__body"><span class="contact-item__label">' + esc(link.label) + '</span>' +
        '<a class="contact-item__value" href="' + safeUrl(link.url) + '"' + externalAttrs(link.url) + '>' +
        esc(link.url.replace(/^https?:\/\//, '').replace(/\/$/, '')) + '</a></div></li>');
    });

    var info = '<div class="contact-info">' +
      (intro ? '<p class="text-lead contact-intro">' + esc(intro) + '</p>' : '') +
      '<ul class="contact-list">' + items.join('') + '</ul>' +
      (filled(contact.responseTime) ? '<p class="contact-response"><span class="contact-response__label">' +
        esc(str('contact.responseTime')) + '</span> ' + esc(t(contact.responseTime)) + '</p>' : '') +
      '</div>';

    var form = '<form class="contact-form" data-contact-form novalidate>' +
      '<h3 class="contact-form__title">' + esc(str('contact.formTitle')) + '</h3>' +
      '<div class="form-group"><label class="form-group__label form-group__label--required" for="cf-name">' +
        esc(str('contact.name')) + '</label><input class="form-group__input" id="cf-name" name="name" type="text" required autocomplete="name" placeholder="' +
        esc(str('contact.namePlaceholder')) + '"><span class="form-group__error">' + esc(str('common.required')) + '</span></div>' +
      '<div class="form-group"><label class="form-group__label form-group__label--required" for="cf-email">' +
        esc(str('contact.email')) + '</label><input class="form-group__input" id="cf-email" name="email" type="email" required autocomplete="email" placeholder="' +
        esc(str('contact.emailPlaceholder')) + '"><span class="form-group__error">' + esc(str('common.required')) + '</span></div>' +
      '<div class="form-group"><label class="form-group__label form-group__label--required" for="cf-message">' +
        esc(str('contact.message')) + '</label><textarea class="form-group__textarea" id="cf-message" name="message" required rows="5" placeholder="' +
        esc(str('contact.messagePlaceholder')) + '"></textarea><span class="form-group__error">' + esc(str('common.required')) + '</span></div>' +
      '<div class="form-group form-group--honeypot" aria-hidden="true"><label class="form-group__label" for="cf-company">' +
        esc(str('contact.honey')) + '</label><input class="form-group__input" id="cf-company" name="company" type="text" tabindex="-1" autocomplete="off"></div>' +
      '<div class="contact-form__actions"><button type="submit" class="btn btn--primary">' + esc(str('contact.send')) + '</button>' +
        '<button type="button" class="btn btn--ghost" data-action="copy-message">' + esc(str('contact.copyMessage')) + '</button></div>' +
      '<p class="form-status" role="status" aria-live="polite"></p>' +
      '<p class="form-note">' + esc(str('contact.formNote')) + '</p>' +
      '</form>';

    return section('contact', str('sections.contact'),
      '<div class="contact-grid">' + info + form + '</div>');
  }

  /* ---------------------------------------------------------------------
     FOOTER
     --------------------------------------------------------------------- */
  function renderFooter() {
    var mount = document.getElementById('site-footer');
    if (!mount) return;
    var data = D();
    var sections = visibleSections();
    var name = t(data.profile && data.profile.name) || 'Your Name';
    var year = new Date().getFullYear();
    var links = sections.map(function (key) {
      return '<li><a class="footer__link" href="' + homeHref('#' + key) + '">' + esc(sectionLabel(key)) + '</a></li>';
    }).join('');

    mount.innerHTML = '<div class="footer__inner">' +
      '<div class="footer__brand"><span class="footer__name">' + esc(name) + '</span>' +
        '<span class="footer__copy">© ' + year + ' · ' + esc(str('footer.rights')) + '</span></div>' +
      '<ul class="footer__links">' + links + '</ul>' +
      '<div class="footer__actions">' + socialRow('footer__socials') +
        '<button type="button" class="footer__link footer__top" data-action="back-to-top">' +
          esc(str('footer.backToTop')) + icon('arrow-up') + '</button></div>' +
      '</div>';
  }

  /* ---------------------------------------------------------------------
     ARCHIVE / LISTING PAGES
     --------------------------------------------------------------------- */
  function renderProjectsPage(main) {
    var title = str('sections.projects');
    main.innerHTML = section('projects', title,
      '<div class="project-explorer" data-explorer></div>',
      t(D().profile && D().profile.tagline));
    mountExplorer(main.querySelector('[data-explorer]'), { archive: true, techFilter: true });
    var header = main.querySelector('.section-header__index');
    if (header) header.textContent = '→ ' + str('nav.projects');
  }

  function renderBlogPage(main) {
    var posts = D().blog || [];
    var title = str('sections.writing');
    if (!posts.length) {
      main.innerHTML = section('writing', title,
        '<div class="empty-state">' + icon('code', 'empty-state__icon') +
        '<h3 class="empty-state__title">' + esc(str('writing.emptyTitle')) + '</h3>' +
        '<p class="empty-state__message">' + esc(str('writing.emptyMessage')) + '</p>' +
        '<a class="btn btn--secondary btn--sm" href="' + homeHref('#about') + '">' + esc(str('nav.about')) + '</a>' +
        '</div>');
      return;
    }

    var categories = [];
    posts.forEach(function (post) {
      var c = t(post.category);
      if (c && categories.indexOf(c) === -1) categories.push(c);
    });

    main.innerHTML = section('writing', title,
      '<div class="explorer-controls">' +
        '<label class="search-input explorer-search" for="post-search">' + icon('search', 'search-input__icon') +
          '<input class="search-input__field" id="post-search" type="search" autocomplete="off" placeholder="' +
          esc(str('writing.searchPlaceholder')) + '" aria-label="' + esc(str('writing.searchPlaceholder')) + '"></label>' +
        '<div class="explorer-filter"><span class="explorer-filter__label">' + esc(str('projects.modal.category')) +
          '</span><div class="chip-row" data-post-cats><button type="button" class="chip chip--interactive is-active" data-post-cat="">' +
          esc(str('projects.all')) + '</button>' + categories.map(function (cat) {
            return '<button type="button" class="chip chip--interactive" data-post-cat="' + esc(cat) + '">' + esc(cat) + '</button>';
          }).join('') + '</div></div>' +
      '</div>' +
      '<div class="blog-list" data-post-list></div>' +
      '<div class="empty-state" data-post-empty hidden>' + icon('search', 'empty-state__icon') +
        '<h3 class="empty-state__title">' + esc(str('projects.emptyTitle')) + '</h3>' +
        '<p class="empty-state__message">' + esc(str('projects.emptyMessage')) + '</p></div>');

    var list = main.querySelector('[data-post-list]');
    var input = main.querySelector('#post-search');
    var empty = main.querySelector('[data-post-empty]');
    var category = '';

    function apply() {
      var q = (input ? input.value : '').trim().toLowerCase();
      var filtered = posts.filter(function (post) {
        if (category && t(post.category) !== category) return false;
        if (!q) return true;
        return [t(post.title), t(post.summary), t(post.category)].concat(post.tags || [])
          .join(' ').toLowerCase().indexOf(q) !== -1;
      });
      list.innerHTML = filtered.map(function (post) {
        return '<a class="blog-item" href="' + safeUrl(postHref(post.link)) + '">' +
          '<span class="blog-item__date">' + esc(formatDate(post.date, { year: 'numeric', month: 'short', day: 'numeric' })) + '</span>' +
          '<span class="blog-item__title">' + esc(t(post.title)) + '</span>' +
          '<span class="blog-item__category">' + esc(t(post.category)) + '</span>' +
          '<span class="blog-item__reading-time">' + esc(t(post.readingTime)) + '</span></a>';
      }).join('');
      list.hidden = filtered.length === 0;
      empty.hidden = filtered.length !== 0;
    }

    if (input) input.addEventListener('input', apply);
    main.querySelectorAll('[data-post-cat]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        category = btn.getAttribute('data-post-cat') || '';
        main.querySelectorAll('[data-post-cat]').forEach(function (other) {
          other.classList.toggle('is-active', other === btn);
          other.setAttribute('aria-pressed', other === btn ? 'true' : 'false');
        });
        apply();
      });
    });
    apply();
  }

  /* ---------------------------------------------------------------------
     HOME
     --------------------------------------------------------------------- */
  function renderHome(main) {
    var sections = visibleSections();
    var html = [renderHero()];

    if (sections.indexOf('about') !== -1) html.push(renderAbout());
    if (sections.indexOf('focus') !== -1) html.push(renderFocus());
    if (sections.indexOf('skills') !== -1) html.push(renderSkills());
    if (sections.indexOf('projects') !== -1) html.push(renderProjectsHome());
    if (sections.indexOf('research') !== -1) html.push(renderResearch());
    if (sections.indexOf('experience') !== -1) html.push(renderExperience());
    if (sections.indexOf('writing') !== -1) html.push(renderWriting());
    if (sections.indexOf('contact') !== -1) html.push(renderContact());

    main.innerHTML = html.join('');

    var explorer = main.querySelector('[data-explorer]');
    if (explorer) mountExplorer(explorer, { limit: 6, archive: false });
  }

  /* ---------------------------------------------------------------------
     SEO
     --------------------------------------------------------------------- */
  function absoluteUrl(path) {
    var data = D();
    var site = (data.site && data.site.url) || '';
    var value = String(path || '');
    if (!value) return site;
    if (/^https?:\/\//i.test(value)) return value;
    if (!site) return value;
    return site.replace(/\/$/, '') + '/' + value.replace(/^\//, '');
  }

  function setMeta(attr, name, content) {
    if (!content) return;
    var selector = 'meta[' + attr + '="' + name + '"]';
    var el = document.head.querySelector(selector);
    if (!el) {
      el = document.createElement('meta');
      el.setAttribute(attr, name);
      document.head.appendChild(el);
    }
    el.setAttribute('content', content);
  }

  function updateSeo() {
    if (PAGE === 'article') return;
    var data = D();
    var p = data.profile || {};
    var site = data.site || {};
    var name = t(p.name) || 'Your Name';
    var role = t(p.role);
    var description = (t(p.tagline) || t(p.bio) || '').slice(0, 160);

    var pageTitle = name + (role ? ' — ' + role : '');
    if (PAGE === 'projects') pageTitle = str('sections.projects') + ' — ' + name;
    if (PAGE === 'blog') pageTitle = str('sections.writing') + ' — ' + name;

    document.title = pageTitle;

    var canonical = PAGE === 'home' ? absoluteUrl('/')
      : absoluteUrl(PAGE === 'projects' ? '/projects/' : '/blog/');
    var link = document.head.querySelector('link[rel="canonical"]');
    if (canonical) {
      if (!link) {
        link = document.createElement('link');
        link.setAttribute('rel', 'canonical');
        document.head.appendChild(link);
      }
      link.setAttribute('href', canonical);
    }

    setMeta('name', 'description', description);
    setMeta('property', 'og:type', 'website');
    setMeta('property', 'og:title', pageTitle);
    setMeta('property', 'og:description', description);
    setMeta('property', 'og:url', canonical);
    setMeta('property', 'og:image', absoluteUrl(site.ogImage));
    setMeta('property', 'og:site_name', name);
    setMeta('property', 'og:locale', Site.i18n && Site.i18n.lang === 'ar' ? 'ar_EG' : 'en_US');
    setMeta('name', 'twitter:card', 'summary_large_image');
    setMeta('name', 'twitter:title', pageTitle);
    setMeta('name', 'twitter:description', description);
    setMeta('name', 'twitter:image', absoluteUrl(site.ogImage));

    var json = {
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'Person',
          name: name,
          jobTitle: role || undefined,
          url: site.url || undefined,
          email: filled(p.email) ? p.email : undefined,
          address: filled(p.location) ? { '@type': 'PostalAddress', addressLocality: t(p.location) } : undefined,
          sameAs: socialLinks().map(function (link) { return link.url; }),
          knowsAbout: (data.skills && data.skills.groups || []).reduce(function (acc, group) {
            return acc.concat(group.items || []);
          }, []).slice(0, 20)
        },
        {
          '@type': 'WebSite',
          name: name,
          url: site.url || undefined,
          description: description,
          inLanguage: Site.i18n ? Site.i18n.lang : 'en'
        }
      ]
    };

    updateFavicon();

    var script = document.getElementById('site-jsonld');
    if (!script) {
      script = document.createElement('script');
      script.type = 'application/ld+json';
      script.id = 'site-jsonld';
      document.head.appendChild(script);
    }
    script.textContent = JSON.stringify(json);

    updateThemeColor();
  }

  function updateFavicon() {
    var data = D();
    var initials = (data.profile && data.profile.initials) || '';
    if (!initials) return;
    var accent = (data.theme && data.theme.accent) || '#3B82F6';
    var svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">' +
      '<rect width="32" height="32" rx="6" fill="' + accent + '"/>' +
      '<text x="16" y="21.5" font-family="Inter, system-ui, sans-serif" font-size="13" font-weight="700" fill="#ffffff" text-anchor="middle" letter-spacing="0.5">' +
      esc(initials) + '</text></svg>';
    var link = document.head.querySelector('link[rel="icon"]');
    if (!link) {
      link = document.createElement('link');
      link.setAttribute('rel', 'icon');
      link.setAttribute('type', 'image/svg+xml');
      document.head.appendChild(link);
    }
    link.setAttribute('href', 'data:image/svg+xml,' + encodeURIComponent(svg));
  }

  function updateThemeColor() {
    var mode = document.documentElement.getAttribute('data-theme') || 'light';
    var color = mode === 'dark' ? '#0e0f11' : '#faf9f6';
    setMeta('name', 'theme-color', color);
  }

  /* ---------------------------------------------------------------------
     SPRITE
     --------------------------------------------------------------------- */
  var SPRITE = '<svg xmlns="http://www.w3.org/2000/svg" style="position:absolute;inline-size:0;block-size:0;overflow:hidden" aria-hidden="true" focusable="false">' +
    '<defs>' +
    strokeSymbol('github', '<path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/>') +
    strokeSymbol('linkedin', '<path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/>') +
    strokeSymbol('mail', '<rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-10 6L2 7"/>') +
    strokeSymbol('phone', '<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z"/>') +
    strokeSymbol('map-pin', '<path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>') +
    strokeSymbol('external-link', '<path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><path d="M15 3h6v6"/><path d="M10 14 21 3"/>') +
    strokeSymbol('download', '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="m7 10 5 5 5-5"/><path d="M12 15V3"/>') +
    strokeSymbol('copy', '<rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>') +
    strokeSymbol('sun', '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/>') +
    strokeSymbol('moon', '<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>') +
    strokeSymbol('search', '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>') +
    strokeSymbol('arrow-right', '<path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>') +
    strokeSymbol('arrow-up', '<path d="M12 19V5"/><path d="m5 12 7-7 7 7"/>') +
    strokeSymbol('globe', '<circle cx="12" cy="12" r="10"/><path d="M2 12h20"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>') +
    strokeSymbol('x', '<path d="M18 6 6 18M6 6l12 12"/>') +
    strokeSymbol('youtube', '<rect x="2" y="5" width="20" height="14" rx="4"/><path d="m10 9 5 3-5 3V9z"/>') +
    strokeSymbol('kaggle', '<path d="M5 3v18"/><path d="m5 13 8-7"/><path d="m5 13 8 8"/>') +
    strokeSymbol('medium', '<circle cx="7" cy="12" r="4"/><ellipse cx="16" cy="12" rx="2.5" ry="4"/><ellipse cx="21" cy="12" rx="1" ry="4"/>') +
    strokeSymbol('cpu', '<rect x="5" y="5" width="14" height="14" rx="2"/><rect x="9" y="9" width="6" height="6"/><path d="M9 2v3M15 2v3M9 19v3M15 19v3M2 9h3M2 15h3M19 9h3M19 15h3"/>') +
    strokeSymbol('database', '<ellipse cx="12" cy="5" rx="8" ry="3"/><path d="M4 5v6c0 1.66 3.58 3 8 3s8-1.34 8-3V5"/><path d="M4 11v6c0 1.66 3.58 3 8 3s8-1.34 8-3v-6"/>') +
    strokeSymbol('pipeline', '<circle cx="5" cy="6" r="2"/><circle cx="19" cy="6" r="2"/><circle cx="12" cy="18" r="2"/><path d="M7 6h10M6 7.5l5 9M18 7.5l-5 9"/>') +
    strokeSymbol('check', '<path d="m20 6-11 11-5-5"/>') +
    strokeSymbol('close', '<path d="M18 6 6 18M6 6l12 12"/>') +
    strokeSymbol('code', '<path d="m8 6-6 6 6 6"/><path d="m16 6 6 6-6 6"/>') +
    strokeSymbol('command', '<path d="M18 3a3 3 0 0 0-3 3v12a3 3 0 1 0 3-3H6a3 3 0 1 0 3 3V6a3 3 0 1 0-3 3h12a3 3 0 0 0 3-3 3 3 0 0 0-3-3z"/>') +
    '</defs></svg>';

  function strokeSymbol(id, content) {
    return '<symbol id="i-' + id + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">' + content + '</symbol>';
  }

  function injectSprite() {
    if (document.getElementById('site-icons')) return;
    var holder = document.createElement('div');
    holder.id = 'site-icons';
    holder.hidden = true;
    holder.innerHTML = SPRITE;
    document.body.insertBefore(holder, document.body.firstChild);
  }

  /* ---------------------------------------------------------------------
     BOOT
     --------------------------------------------------------------------- */
  function renderAll() {
    injectSprite();
    renderNav();
    renderFooter();

    var main = document.getElementById('main');
    if (main) {
      if (PAGE === 'home') renderHome(main);
      else if (PAGE === 'projects') renderProjectsPage(main);
      else if (PAGE === 'blog') renderBlogPage(main);
    }

    updateSeo();

    if (window.Site.heroVisual && window.Site.heroVisual.init) {
      window.Site.heroVisual.init();
    }
    if (window.Site.ui && window.Site.ui.refresh) {
      window.Site.ui.refresh();
    }
  }

  Site.render = {
    init: function () {
      if (!Site.data && Site.dataLoader) Site.dataLoader.load();
      renderAll();
      document.addEventListener('site:langchange', function () {
        renderAll();
      });
    },
    renderAll: renderAll,
    openProject: openProject,
    closeModal: closeModal,
    updateSeo: updateSeo,
    updateThemeColor: updateThemeColor,
    updateFavicon: updateFavicon,
    mountExplorer: mountExplorer,
    visibleSections: visibleSections
  };

  document.addEventListener('DOMContentLoaded', function () {
    Site.render.init();
  });
})();
