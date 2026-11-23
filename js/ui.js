/* ==========================================================================
   ui.js — Theme, navigation, scroll effects, command palette, toasts,
   keyboard shortcuts, clipboard and the contact form.
   All listeners are delegated so re-rendering (language switch) is safe.
   ========================================================================== */
(function () {
  'use strict';

  var Site = (window.Site = window.Site || {});
  var root = document.documentElement;

  function D() { return Site.data || {}; }
  function str(key, vars) { return Site.str ? Site.str(key, vars) : key; }
  function t(value) { return Site.t ? Site.t(value) : ''; }
  function escHtml(value) {
    return String(value === null || value === undefined ? '' : value)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  function storeGet(key) {
    try { return window.localStorage.getItem(key); } catch (e) { return null; }
  }
  function storeSet(key, value) {
    try { window.localStorage.setItem(key, value); } catch (e) { /* ignore */ }
  }

  function prefersReducedMotion() {
    try { return window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) { return false; }
  }
  function prefersDark() {
    try { return window.matchMedia('(prefers-color-scheme: dark)').matches; } catch (e) { return false; }
  }

  /* ---------------------------------------------------------------------
     Color helpers
     --------------------------------------------------------------------- */
  function hexToRgb(hex) {
    var value = String(hex || '').replace('#', '').trim();
    if (value.length === 3) value = value.split('').map(function (c) { return c + c; }).join('');
    if (!/^[0-9a-f]{6}$/i.test(value)) return null;
    return {
      r: parseInt(value.slice(0, 2), 16),
      g: parseInt(value.slice(2, 4), 16),
      b: parseInt(value.slice(4, 6), 16)
    };
  }

  function rgbToHsl(rgb) {
    var r = rgb.r / 255, g = rgb.g / 255, b = rgb.b / 255;
    var max = Math.max(r, g, b), min = Math.min(r, g, b);
    var h = 0, s = 0, l = (max + min) / 2;
    if (max !== min) {
      var d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      if (max === r) h = (g - b) / d + (g < b ? 6 : 0);
      else if (max === g) h = (b - r) / d + 2;
      else h = (r - g) / d + 4;
      h /= 6;
    }
    return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
  }

  function hslToHex(hsl) {
    var h = hsl.h / 360, s = hsl.s / 100, l = hsl.l / 100;
    function hue(p, q, t) {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    }
    var r, g, b;
    if (s === 0) { r = g = b = l; }
    else {
      var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      var p = 2 * l - q;
      r = hue(p, q, h + 1 / 3);
      g = hue(p, q, h);
      b = hue(p, q, h - 1 / 3);
    }
    function toHex(v) {
      var out = Math.round(v * 255).toString(16);
      return out.length === 1 ? '0' + out : out;
    }
    return '#' + toHex(r) + toHex(g) + toHex(b);
  }

  function contrastRatio(a, b) {
    var l1 = luminance(a), l2 = luminance(b);
    var lighter = Math.max(l1, l2);
    var darker = Math.min(l1, l2);
    return (lighter + 0.05) / (darker + 0.05);
  }

  function ensureContrast(hex, background, target) {
    if (contrastRatio(hex, background) >= target) return hex;
    var hsl = rgbToHsl(hexToRgb(hex));
    if (!hsl) return hex;
    var towardsDark = luminance(background) > 0.5;
    var candidate = hex;
    for (var i = 0; i < 60; i++) {
      hsl.l += towardsDark ? -1 : 1;
      hsl.l = Math.max(0, Math.min(100, hsl.l));
      candidate = hslToHex(hsl);
      if (contrastRatio(candidate, background) >= target) return candidate;
      if (hsl.l === 0 || hsl.l === 100) break;
    }
    return candidate;
  }

  function luminance(hex) {
    var rgb = hexToRgb(hex);
    if (!rgb) return 0;
    var channels = [rgb.r, rgb.g, rgb.b].map(function (c) {
      var v = c / 255;
      return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];
  }

  /* ---------------------------------------------------------------------
     Theme
     --------------------------------------------------------------------- */
  var themeMode = 'system';

  function resolveTheme(mode) {
    if (mode === 'light' || mode === 'dark') return mode;
    return prefersDark() ? 'dark' : 'light';
  }

  function applyAccent(resolved) {
    var theme = D().theme || {};
    var accent = resolved === 'dark'
      ? (theme.accentDark || theme.accent || '#60A5FA')
      : (theme.accent || '#3B82F6');
    var bg = resolved === 'dark' ? '#0e0f11' : '#faf9f6';
    // Keep the configured hue but guarantee readable contrast against the page.
    accent = ensureContrast(accent, bg, 4.6);
    var rgb = hexToRgb(accent);
    var hsl = rgb ? rgbToHsl(rgb) : { h: 217, s: 91, l: 60 };
    var onWhite = contrastRatio(accent, '#ffffff');
    var onDark = contrastRatio(accent, '#0e0f11');
    var contrast = onDark > onWhite ? '#0e0f11' : '#ffffff';

    root.style.setProperty('--color-accent', accent);
    root.style.setProperty('--accent-hsl', hsl.h + ' ' + hsl.s + '% ' + hsl.l + '%');
    root.style.setProperty('--color-accent-hover',
      'color-mix(in oklch, ' + accent + ' 82%, ' + (resolved === 'dark' ? '#ffffff' : '#000000') + ')');
    root.style.setProperty('--color-accent-soft', 'color-mix(in oklch, ' + accent + ' 12%, ' + bg + ')');
    root.style.setProperty('--color-accent-subtle', 'color-mix(in oklch, ' + accent + ' 6%, ' + bg + ')');
    root.style.setProperty('--color-accent-light', 'color-mix(in oklch, ' + accent + ' 60%, #ffffff)');
    root.style.setProperty('--color-accent-contrast', contrast);
    root.style.setProperty('--color-selection-bg', 'color-mix(in oklch, ' + accent + ' 22%, transparent)');
    root.style.setProperty('--color-focus-ring', accent);
  }

  function applyTheme(mode) {
    themeMode = mode;
    var resolved = resolveTheme(mode);
    root.setAttribute('data-theme', resolved);
    applyAccent(resolved);
    if (Site.render && Site.render.updateThemeColor) Site.render.updateThemeColor();
  }

  function toggleTheme() {
    var resolved = resolveTheme(themeMode);
    var next = resolved === 'dark' ? 'light' : 'dark';
    storeSet('theme', next);
    applyTheme(next);
  }

  function initTheme() {
    var stored = storeGet('theme');
    var mode = stored === 'light' || stored === 'dark' ? stored : ((D().theme && D().theme.defaultMode) || 'system');
    applyTheme(mode);

    try {
      var mq = window.matchMedia('(prefers-color-scheme: dark)');
      var handler = function () { if (themeMode === 'system') applyTheme('system'); };
      if (mq.addEventListener) mq.addEventListener('change', handler);
      else if (mq.addListener) mq.addListener(handler);
    } catch (e) { /* ignore */ }
  }

  /* ---------------------------------------------------------------------
     Toast + clipboard
     --------------------------------------------------------------------- */
  function toast(message, type) {
    var container = document.getElementById('toast-container');
    if (!container) return;
    var el = document.createElement('div');
    el.className = 'toast toast--' + (type || 'success');
    el.setAttribute('role', 'status');
    el.innerHTML = '<span class="toast__icon">' +
      '<svg class="icon" aria-hidden="true" focusable="false"><use href="#i-check"></use></svg></span>' +
      '<span class="toast__message"></span>' +
      '<button type="button" class="toast__dismiss" aria-label="' + str('common.close') + '">' +
      '<svg class="icon" aria-hidden="true" focusable="false"><use href="#i-close"></use></svg></button>';
    el.querySelector('.toast__message').textContent = message;
    container.appendChild(el);

    function dismiss() {
      if (!el.parentNode) return;
      el.classList.add('toast--exit');
      window.setTimeout(function () { if (el.parentNode) el.remove(); }, 260);
    }
    el.querySelector('.toast__dismiss').addEventListener('click', dismiss);
    window.setTimeout(dismiss, 3400);
  }

  function copyText(text) {
    if (!text) return Promise.resolve(false);
    if (navigator.clipboard && navigator.clipboard.writeText) {
      return navigator.clipboard.writeText(text).then(function () { return true; }).catch(function () {
        return legacyCopy(text);
      });
    }
    return Promise.resolve(legacyCopy(text));
  }

  function legacyCopy(text) {
    try {
      var area = document.createElement('textarea');
      area.value = text;
      area.setAttribute('readonly', '');
      area.style.position = 'fixed';
      area.style.opacity = '0';
      document.body.appendChild(area);
      area.select();
      var ok = document.execCommand('copy');
      area.remove();
      return ok;
    } catch (e) {
      return false;
    }
  }

  /* ---------------------------------------------------------------------
     Navigation: drawer, scroll progress, spy
     --------------------------------------------------------------------- */
  var lastDrawerFocus = null;
  var drawerKeyHandler = null;

  function drawer() { return document.getElementById('nav-drawer'); }
  function backdrop() { return document.querySelector('.nav__drawer-backdrop'); }
  function hamburger() { return document.querySelector('.nav__hamburger'); }

  function focusables(container) {
    return Array.prototype.filter.call(
      container.querySelectorAll('a[href], button:not([disabled]), input:not([disabled]), textarea, select, [tabindex]:not([tabindex="-1"])'),
      function (el) { return el.getClientRects().length > 0; }
    );
  }

  function openDrawer() {
    var panel = drawer();
    if (!panel) return;
    lastDrawerFocus = document.activeElement;
    panel.classList.add('nav__drawer--open');
    panel.removeAttribute('inert');
    panel.setAttribute('aria-hidden', 'false');
    var back = backdrop();
    if (back) { back.hidden = false; window.requestAnimationFrame(function () { back.classList.add('nav__drawer-backdrop--visible'); }); }
    var btn = hamburger();
    if (btn) btn.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';

    drawerKeyHandler = function (event) {
      if (event.key === 'Escape') { closeDrawer(); return; }
      if (event.key !== 'Tab') return;
      var items = focusables(panel);
      if (!items.length) return;
      var first = items[0], last = items[items.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    };
    document.addEventListener('keydown', drawerKeyHandler);
    window.setTimeout(function () {
      var items = focusables(panel);
      if (items.length) items[0].focus();
    }, 40);
  }

  function closeDrawer() {
    var panel = drawer();
    if (!panel) return;
    panel.classList.remove('nav__drawer--open');
    panel.setAttribute('aria-hidden', 'true');
    panel.setAttribute('inert', '');
    var back = backdrop();
    if (back) {
      back.classList.remove('nav__drawer-backdrop--visible');
      window.setTimeout(function () { if (back) back.hidden = true; }, 260);
    }
    var btn = hamburger();
    if (btn) btn.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
    if (drawerKeyHandler) document.removeEventListener('keydown', drawerKeyHandler);
    drawerKeyHandler = null;
    if (lastDrawerFocus && typeof lastDrawerFocus.focus === 'function') {
      try { lastDrawerFocus.focus(); } catch (e) { /* ignore */ }
    }
    lastDrawerFocus = null;
  }

  function updateScrollEffects() {
    var doc = document.documentElement;
    var scrollTop = window.pageYOffset || doc.scrollTop || 0;
    var height = doc.scrollHeight - doc.clientHeight;
    var bar = document.getElementById('scroll-progress');
    if (bar) bar.style.width = (height > 0 ? (scrollTop / height) * 100 : 0) + '%';
    var nav = document.querySelector('.nav');
    if (nav) nav.classList.toggle('nav--scrolled', scrollTop > 8);
  }

  var spyObserver = null;
  function initScrollSpy() {
    if (spyObserver) spyObserver.disconnect();
    spyObserver = null;
    if (document.body.getAttribute('data-page') !== 'home') return;
    if (!('IntersectionObserver' in window)) return;

    var links = Array.prototype.slice.call(document.querySelectorAll('.nav__link[data-nav]'));
    function setActive(id) {
      links.forEach(function (link) {
        var active = link.getAttribute('data-nav') === id;
        link.classList.toggle('nav__link--active', active);
        if (active) link.setAttribute('aria-current', 'page');
        else link.removeAttribute('aria-current');
      });
    }

    spyObserver = new IntersectionObserver(function (entries) {
      var visible = entries.filter(function (entry) { return entry.isIntersecting; });
      if (!visible.length) return;
      visible.sort(function (a, b) { return b.intersectionRatio - a.intersectionRatio; });
      setActive(visible[0].target.id);
    }, { rootMargin: '-40% 0px -50% 0px', threshold: [0, 0.25, 0.5, 1] });

    document.querySelectorAll('main section[id]').forEach(function (section) {
      spyObserver.observe(section);
    });
  }

  /* ---------------------------------------------------------------------
     Reveal on scroll
     --------------------------------------------------------------------- */
  var revealObserver = null;
  var observed = typeof WeakSet !== 'undefined' ? new WeakSet() : null;

  function initReveal() {
    if (prefersReducedMotion() || !('IntersectionObserver' in window)) {
      document.querySelectorAll('.reveal').forEach(function (el) { el.classList.add('is-visible'); });
      return;
    }
    if (!revealObserver) {
      revealObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            revealObserver.unobserve(entry.target);
          }
        });
      }, { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });
    }
    document.querySelectorAll('.reveal').forEach(function (el) {
      if (observed && observed.has(el)) return;
      if (observed) observed.add(el);
      revealObserver.observe(el);
    });
  }

  /* ---------------------------------------------------------------------
     Skills filter (delegated)
     --------------------------------------------------------------------- */
  function handleSkillsFilter(event) {
    var input = event.target;
    if (!input || input.id !== 'skills-filter') return;
    var query = input.value.trim().toLowerCase();
    var section = input.closest('#skills');
    if (!section) return;
    var groups = section.querySelectorAll('[data-skill-group]');
    var anyVisible = false;

    groups.forEach(function (group) {
      var tags = group.querySelectorAll('.skill-tag');
      var groupVisible = false;
      tags.forEach(function (tag) {
        var match = !query || (tag.getAttribute('data-skill') || '').indexOf(query) !== -1;
        tag.classList.toggle('is-dim', !match);
        if (match) groupVisible = true;
      });
      group.classList.toggle('is-dim', !groupVisible);
      if (groupVisible) anyVisible = true;
    });

    var empty = section.querySelector('[data-skills-empty]');
    if (empty) empty.hidden = anyVisible;
  }

  /* ---------------------------------------------------------------------
     Contact form (delegated)
     --------------------------------------------------------------------- */
  function formFields(form) {
    return {
      name: form.querySelector('[name="name"]'),
      email: form.querySelector('[name="email"]'),
      message: form.querySelector('[name="message"]'),
      company: form.querySelector('[name="company"]')
    };
  }

  function validateField(field, isEmail) {
    var group = field.closest('.form-group');
    var valid = field.value.trim() !== '';
    if (valid && isEmail) valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(field.value.trim());
    if (group) group.classList.toggle('form-group--error', !valid);
    return valid;
  }

  function buildMessage(form) {
    var fields = formFields(form);
    var name = fields.name ? fields.name.value.trim() : '';
    var email = fields.email ? fields.email.value.trim() : '';
    var message = fields.message ? fields.message.value.trim() : '';
    return { name: name, email: email, message: message };
  }

  function mailtoLink(payload) {
    var email = (D().profile && D().profile.email) || '';
    var subject = 'Portfolio message from ' + (payload.name || 'a visitor');
    var body = payload.message + '\n\n— ' + payload.name + (payload.email ? ' <' + payload.email + '>' : '');
    return 'mailto:' + email + '?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
  }

  function handleContactSubmit(event) {
    var form = event.target.closest('[data-contact-form]');
    if (!form) return;
    event.preventDefault();

    var fields = formFields(form);
    if (fields.company && fields.company.value.trim() !== '') return;

    var nameOk = validateField(fields.name, false);
    var emailOk = validateField(fields.email, true);
    var messageOk = validateField(fields.message, false);
    if (!nameOk || !emailOk || !messageOk) {
      var firstInvalid = form.querySelector('.form-group--error .form-group__input, .form-group--error .form-group__textarea');
      if (firstInvalid) firstInvalid.focus();
      return;
    }

    var payload = buildMessage(form);
    var status = form.querySelector('.form-status');
    var submit = form.querySelector('button[type="submit"]');
    var endpoint = (D().contact && D().contact.formEndpoint) || '';

    function setStatus(text, isError) {
      if (!status) return;
      status.textContent = text;
      status.classList.toggle('is-error', !!isError);
    }

    if (endpoint) {
      if (submit) { submit.disabled = true; submit.dataset.label = submit.textContent; submit.textContent = str('contact.sending'); }
      fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(payload)
      }).then(function (response) {
        if (!response.ok) throw new Error('HTTP ' + response.status);
        setStatus(str('contact.sentEndpoint'), false);
        form.reset();
      }).catch(function () {
        setStatus(str('contact.error'), true);
      }).then(function () {
        if (submit) { submit.disabled = false; submit.textContent = submit.dataset.label || str('contact.send'); }
      });
      return;
    }

    if (!(D().profile && D().profile.email)) {
      setStatus(str('contact.error'), true);
      return;
    }
    window.location.href = mailtoLink(payload);
    setStatus(str('contact.sent'), false);
  }

  /* ---------------------------------------------------------------------
     Command palette
     --------------------------------------------------------------------- */
  var paletteState = { open: false, items: [], active: 0, lastFocus: null };

  function fuzzyScore(query, text) {
    var q = query.toLowerCase();
    var target = text.toLowerCase();
    if (!q) return 1;
    if (target.indexOf(q) !== -1) return 100 - target.indexOf(q);
    var score = 0, index = 0;
    for (var i = 0; i < target.length && index < q.length; i++) {
      if (target[i] === q[index]) {
        score += 2;
        if (i === 0 || target[i - 1] === ' ' || target[i - 1] === '-') score += 4;
        index++;
      }
    }
    return index === q.length ? score : 0;
  }

  function paletteItem(label, group, iconName, run) {
    return { label: label, group: group, icon: iconName, run: run };
  }

  function buildPaletteItems() {
    var data = D();
    var items = [];
    var sections = Site.render && Site.render.visibleSections ? Site.render.visibleSections() : [];
    var page = document.body.getAttribute('data-page') || 'home';
    var base = document.body.getAttribute('data-base') || '';

    sections.forEach(function (key) {
      var href = (page === 'home' ? '' : base + 'index.html') + '#' + key;
      items.push(paletteItem(str('nav.' + key), str('palette.sections'), 'arrow-right', function () {
        window.location.href = href;
      }));
    });

    (data.projects || []).forEach(function (project) {
      items.push(paletteItem(t(project.title), str('palette.projects'), 'code', function () {
        if (Site.render) Site.render.openProject(project.id);
      }));
    });

    (data.blog || []).forEach(function (post) {
      items.push(paletteItem(t(post.title), str('palette.posts'), 'globe', function () {
        var link = String(post.link || '');
        if (!/^(https?:|\/)/i.test(link)) {
          link = (page === 'home' ? '' : '..') + '/' + link.replace(/^\.\//, '');
        }
        window.location.href = link;
      }));
    });

    if (data.profile && data.profile.email) {
      items.push(paletteItem(str('palette.copyEmail'), str('palette.actions'), 'copy', function () {
        copyText(data.profile.email).then(function (ok) {
          toast(ok ? str('common.copied') : str('contact.error'), ok ? 'success' : 'error');
        });
      }));
    }
    items.push(paletteItem(str('palette.toggleTheme'), str('palette.actions'), 'moon', toggleTheme));
    if (Site.i18n && Site.i18n.enabled()) {
      items.push(paletteItem(str('palette.switchLanguage'), str('palette.actions'), 'globe', function () {
        Site.i18n.setLang(Site.i18n.nextLang());
      }));
    }
    if (data.links && data.links.github) {
      items.push(paletteItem(str('palette.openGithub'), str('palette.actions'), 'github', function () {
        window.open(data.links.github, '_blank', 'noopener,noreferrer');
      }));
    }
    if (data.cv && data.cv.file) {
      items.push(paletteItem(str('palette.downloadCv'), str('palette.actions'), 'download', function () {
        var file = String(data.cv.file || '');
        var link = document.createElement('a');
        link.href = /^(https?:\/\/|\/)/i.test(file) ? file : base + file.replace(/^\.\//, '');
        link.setAttribute('download', '');
        document.body.appendChild(link);
        link.click();
        link.remove();
      }));
    }
    items.push(paletteItem(str('palette.openContact'), str('palette.actions'), 'mail', function () {
      window.location.href = (page === 'home' ? '' : base + 'index.html') + '#contact';
    }));

    return items;
  }

  function paletteRoot() { return document.getElementById('palette-root'); }

  function renderPaletteResults(query) {
    var rootEl = paletteRoot();
    if (!rootEl) return;
    var list = rootEl.querySelector('[data-palette-results]');
    var input = rootEl.querySelector('[data-palette-input]');
    var all = paletteState.items;
    var scored = all.map(function (item) {
      return { item: item, score: fuzzyScore(query, item.label + ' ' + item.group) };
    }).filter(function (entry) { return entry.score > 0; });
    if (query) scored.sort(function (a, b) { return b.score - a.score; });
    var items = scored.map(function (entry) { return entry.item; });

    if (!items.length) {
      list.innerHTML = '<li class="cmd-palette__empty">' + str('palette.noResults') + '</li>';
      paletteState.filtered = [];
      paletteState.active = -1;
      if (input) input.removeAttribute('aria-activedescendant');
      return;
    }

    var html = '';
    var group = '';
    items.forEach(function (item, index) {
      if (item.group !== group) {
        group = item.group;
        html += '<li class="cmd-palette__group" role="presentation">' + group + '</li>';
      }
      html += '<li class="cmd-palette__result' + (index === 0 ? ' cmd-palette__result--active' : '') +
        '" role="option" id="palette-option-' + index + '" data-palette-index="' + index + '" aria-selected="' +
        (index === 0 ? 'true' : 'false') + '"><span class="cmd-palette__result-icon">' +
        '<svg class="icon" aria-hidden="true" focusable="false"><use href="#i-' + item.icon + '"></use></svg></span>' +
        '<span class="cmd-palette__result-label">' + item.label + '</span></li>';
    });
    list.innerHTML = html;
    paletteState.filtered = items;
    paletteState.active = 0;
    if (input) input.setAttribute('aria-activedescendant', 'palette-option-0');
  }

  function setPaletteActive(index) {
    var rootEl = paletteRoot();
    if (!rootEl || !paletteState.filtered) return;
    var items = rootEl.querySelectorAll('[data-palette-index]');
    if (!items.length) return;
    if (index < 0) index = items.length - 1;
    if (index >= items.length) index = 0;
    paletteState.active = index;
    items.forEach(function (el, i) {
      var active = i === index;
      el.classList.toggle('cmd-palette__result--active', active);
      el.setAttribute('aria-selected', active ? 'true' : 'false');
      if (active) el.scrollIntoView({ block: 'nearest' });
    });
    var input = rootEl.querySelector('[data-palette-input]');
    if (input) input.setAttribute('aria-activedescendant', 'palette-option-' + index);
  }

  function runPaletteItem() {
    if (!paletteState.filtered || paletteState.active < 0) return;
    var item = paletteState.filtered[paletteState.active];
    if (!item) return;
    closePalette(true);
    window.setTimeout(function () {
      try { item.run(); } catch (e) { /* ignore */ }
    }, 10);
  }

  function openPalette() {
    if (paletteState.open) return;
    var rootEl = paletteRoot();
    if (!rootEl) return;
    paletteState.lastFocus = document.activeElement;
    paletteState.items = buildPaletteItems();
    paletteState.open = true;

    rootEl.innerHTML = '<div class="cmd-palette-overlay" data-palette-overlay>' +
      '<div class="cmd-palette" role="dialog" aria-modal="true" aria-label="' + str('palette.title') + '">' +
        '<div class="cmd-palette__input-wrap"><span class="cmd-palette__icon">' +
          '<svg class="icon" aria-hidden="true" focusable="false"><use href="#i-search"></use></svg></span>' +
          '<input class="cmd-palette__input" data-palette-input type="text" role="combobox" aria-expanded="true" aria-controls="palette-results" aria-autocomplete="list" placeholder="' +
          str('palette.placeholder') + '" autocomplete="off" spellcheck="false">' +
          '<kbd class="cmd-palette__kbd">Esc</kbd></div>' +
        '<ul class="cmd-palette__results" id="palette-results" data-palette-results role="listbox"></ul>' +
        '<div class="cmd-palette__footer"><span>↑↓ ' + str('palette.navigate') + ' · ↵ ' + str('palette.select') +
          '</span><span class="cmd-palette__hints"><kbd class="cmd-palette__kbd">g</kbd><kbd class="cmd-palette__kbd">p</kbd> ' +
          escHtml(str('nav.projects')) + ' · <kbd class="cmd-palette__kbd">g</kbd><kbd class="cmd-palette__kbd">c</kbd> ' +
          escHtml(str('nav.contact')) + ' · <kbd class="cmd-palette__kbd">t</kbd> ' + escHtml(str('common.theme')) +
          '</span><span>Esc ' + str('palette.close') + '</span></div>' +
      '</div></div>';

    var input = rootEl.querySelector('[data-palette-input]');
    var overlay = rootEl.querySelector('[data-palette-overlay]');
    renderPaletteResults('');
    document.body.style.overflow = 'hidden';

    window.requestAnimationFrame(function () {
      overlay.classList.add('cmd-palette-overlay--open');
      if (input) input.focus();
    });

    input.addEventListener('input', function () { renderPaletteResults(input.value); });

    overlay.addEventListener('click', function (event) {
      if (event.target === overlay) { closePalette(); return; }
      var result = event.target.closest('[data-palette-index]');
      if (result) {
        paletteState.active = Number(result.getAttribute('data-palette-index'));
        runPaletteItem();
      }
    });

    overlay.addEventListener('mousemove', function (event) {
      var result = event.target.closest('[data-palette-index]');
      if (!result) return;
      var index = Number(result.getAttribute('data-palette-index'));
      if (index !== paletteState.active) setPaletteActive(index);
    });

    overlay.addEventListener('keydown', function (event) {
      if (event.key === 'Escape') { event.preventDefault(); closePalette(); }
      else if (event.key === 'ArrowDown') { event.preventDefault(); setPaletteActive(paletteState.active + 1); }
      else if (event.key === 'ArrowUp') { event.preventDefault(); setPaletteActive(paletteState.active - 1); }
      else if (event.key === 'Enter') { event.preventDefault(); runPaletteItem(); }
      else if (event.key === 'Tab') { event.preventDefault(); setPaletteActive(paletteState.active + (event.shiftKey ? -1 : 1)); }
    });
  }

  function closePalette(silent) {
    var rootEl = paletteRoot();
    if (!rootEl || !paletteState.open) return;
    paletteState.open = false;
    var overlay = rootEl.querySelector('[data-palette-overlay]');
    if (overlay) overlay.classList.remove('cmd-palette-overlay--open');
    document.body.style.overflow = '';
    window.setTimeout(function () {
      if (!paletteState.open && rootEl) rootEl.innerHTML = '';
    }, 180);
    if (!silent && paletteState.lastFocus && typeof paletteState.lastFocus.focus === 'function') {
      try { paletteState.lastFocus.focus(); } catch (e) { /* ignore */ }
    }
    paletteState.lastFocus = null;
  }

  /* ---------------------------------------------------------------------
     Keyboard shortcuts
     --------------------------------------------------------------------- */
  var gPrefix = false;
  var gTimer = null;

  function isTyping(event) {
    var el = event.target;
    if (!el) return false;
    var tag = (el.tagName || '').toLowerCase();
    return tag === 'input' || tag === 'textarea' || tag === 'select' || el.isContentEditable;
  }

  function onKeydown(event) {
    var meta = event.metaKey || event.ctrlKey;
    if (meta && (event.key === 'k' || event.key === 'K')) {
      event.preventDefault();
      if (paletteState.open) closePalette(); else openPalette();
      return;
    }
    if (event.key === 'Escape') {
      if (paletteState.open) { closePalette(); return; }
      var drawerOpen = drawer() && drawer().classList.contains('nav__drawer--open');
      if (drawerOpen) closeDrawer();
      return;
    }
    if (paletteState.open || isTyping(event) || meta || event.altKey) return;

    var key = event.key.toLowerCase();
    if (gPrefix) {
      gPrefix = false;
      if (gTimer) window.clearTimeout(gTimer);
      var page = document.body.getAttribute('data-page') || 'home';
      var base = document.body.getAttribute('data-base') || '';
      if (key === 'p') { window.location.href = (page === 'home' ? '' : base + 'index.html') + '#projects'; }
      if (key === 'c') { window.location.href = (page === 'home' ? '' : base + 'index.html') + '#contact'; }
      return;
    }
    if (key === 'g') {
      gPrefix = true;
      gTimer = window.setTimeout(function () { gPrefix = false; }, 1200);
      return;
    }
    if (key === 't') {
      event.preventDefault();
      toggleTheme();
    }
  }

  /* ---------------------------------------------------------------------
     Delegated click handler
     --------------------------------------------------------------------- */
  function onDocumentClick(event) {
    var actionEl = event.target.closest('[data-action]');
    if (actionEl) {
      var action = actionEl.getAttribute('data-action');
      if (action === 'theme') { toggleTheme(); return; }
      if (action === 'lang' && Site.i18n) { Site.i18n.setLang(Site.i18n.nextLang()); return; }
      if (action === 'palette') { openPalette(); return; }
      if (action === 'drawer-toggle') {
        var open = drawer() && drawer().classList.contains('nav__drawer--open');
        if (open) closeDrawer(); else openDrawer();
        return;
      }
      if (action === 'drawer-close') { closeDrawer(); return; }
      if (action === 'back-to-top') {
        window.scrollTo({ top: 0, behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
        return;
      }
      if (action === 'close-modal' && Site.render) { Site.render.closeModal(); return; }
      if (action === 'copy') {
        var text = actionEl.getAttribute('data-copy') || '';
        copyText(text).then(function (ok) {
          toast(ok ? str('common.copied') : str('contact.error'), ok ? 'success' : 'error');
        });
        return;
      }
      if (action === 'copy-message') {
        var form = actionEl.closest('[data-contact-form]');
        if (!form) return;
        var payload = buildMessage(form);
        if (!payload.message) { toast(str('contact.messagePlaceholder'), 'info'); return; }
        var text = (payload.name ? payload.name + (payload.email ? ' <' + payload.email + '>' : '') + '\n\n' : '') + payload.message;
        copyText(text).then(function (ok) {
          toast(ok ? str('common.copied') : str('contact.error'), ok ? 'success' : 'error');
        });
        return;
      }
    }

    // Close the mobile drawer after navigating within the page.
    var navLink = event.target.closest('.nav__drawer a[href]');
    if (navLink) closeDrawer();

    if (actionEl) return;
  }

  function onViewportChange() {
    updateScrollEffects();
  }

  /* ---------------------------------------------------------------------
     Public refresh + init
     --------------------------------------------------------------------- */
  function refresh() {
    updateScrollEffects();
    initScrollSpy();
    initReveal();

    var panel = drawer();
    if (panel && !panel.classList.contains('nav__drawer--open')) {
      panel.setAttribute('inert', '');
      panel.setAttribute('aria-hidden', 'true');
    }

    // Keep an active skills filter working after a re-render.
    var skillInput = document.getElementById('skills-filter');
    if (skillInput && skillInput.value) {
      skillInput.dispatchEvent(new Event('input', { bubbles: true }));
    }
  }

  function init() {
    initTheme();
    refresh();

    document.addEventListener('click', onDocumentClick);
    document.addEventListener('keydown', onKeydown);
    document.addEventListener('input', handleSkillsFilter);
    document.addEventListener('submit', handleContactSubmit);
    document.addEventListener('site:langchange', function () { refresh(); });

    var scrollTicking = false;
    function requestScrollUpdate() {
      if (scrollTicking) return;
      scrollTicking = true;
      window.requestAnimationFrame(function () {
        updateScrollEffects();
        scrollTicking = false;
      });
    }
    window.addEventListener('scroll', requestScrollUpdate, { passive: true });
    window.addEventListener('resize', onViewportChange);
  }

  Site.ui = {
    init: init,
    refresh: refresh,
    toast: toast,
    copyText: copyText,
    openPalette: openPalette,
    closePalette: closePalette,
    applyTheme: applyTheme,
    toggleTheme: toggleTheme
  };

  document.addEventListener('DOMContentLoaded', function () {
    if (!Site.data && Site.dataLoader) Site.dataLoader.load();
    init();
  });
})();
