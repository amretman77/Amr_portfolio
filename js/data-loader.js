/* ==========================================================================
   data-loader.js
   Reads window.SITE_DATA, validates its shape, applies safe defaults and
   strips empty items. Never throws — it only console.warn()s.
   Exposes: Site.data, Site.utils, Site.t (overridden by i18n.js)
   ========================================================================== */
(function () {
  'use strict';

  var Site = (window.Site = window.Site || {});

  var KNOWN_KEYS = [
    'site', 'theme', 'i18n', 'profile', 'links', 'cv', 'hero', 'now',
    'focusAreas', 'skills', 'projects', 'research', 'experience',
    'education', 'courses', 'blog', 'contact', 'footer'
  ];

  var DEFAULTS = {
    site: { url: '', language: 'en', ogImage: '' },
    theme: { accent: '#3B82F6', accentDark: '#60A5FA', defaultMode: 'system' },
    i18n: { enabled: false, languages: ['en'] },
    profile: {
      name: '', initials: '', role: '', tagline: '', bio: '',
      aboutHtml: [], photo: '', location: '',
      availability: { show: false, text: '' },
      email: '', phone: ''
    },
    links: { github: '', linkedin: '', twitter: '', kaggle: '', medium: '', youtube: '', website: '' },
    cv: { file: '', label: '' },
    hero: { stats: [], traceLines: [] },
    now: { building: '', learning: '', reading: '' },
    focusAreas: [],
    skills: { groups: [], learning: [] },
    projects: [],
    research: { items: [], cta: { title: '', text: '' } },
    experience: [],
    education: [],
    courses: [],
    blog: [],
    contact: { intro: '', formEndpoint: '', responseTime: '' },
    footer: { text: '' }
  };

  function warn(message) {
    if (window.console && console.warn) console.warn('[data-loader] ' + message);
  }

  function isObj(v) {
    return !!v && typeof v === 'object' && !Array.isArray(v);
  }

  function isFilled(v) {
    if (v === null || v === undefined) return false;
    if (typeof v === 'string') return v.trim() !== '';
    if (Array.isArray(v)) return v.length > 0;
    if (isObj(v)) return Object.keys(v).some(function (k) { return isFilled(v[k]); });
    return true;
  }

  function deepMerge(base, source) {
    if (Array.isArray(source)) return source.slice();
    if (!isObj(source)) return source === undefined ? base : source;
    var out = isObj(base) ? Object.assign({}, base) : {};
    Object.keys(source).forEach(function (key) {
      out[key] = deepMerge(out[key], source[key]);
    });
    return out;
  }

  /* ---------------------------------------------------------------------
     Localisation helper: a value may be a string or { en, ar }
     --------------------------------------------------------------------- */
  function localizedList(value, lang) {
    if (Array.isArray(value)) return value;
    if (isObj(value)) {
      var candidate = value[lang] || value.en || value.ar;
      return Array.isArray(candidate) ? candidate : [];
    }
    return [];
  }

  function localized(value, lang) {
    if (value === null || value === undefined) return '';
    if (typeof value === 'string') return value;
    if (typeof value === 'number' || typeof value === 'boolean') return String(value);
    if (Array.isArray(value)) return value;
    if (isObj(value)) {
      var order = [lang, 'en', 'ar'];
      for (var i = 0; i < order.length; i++) {
        var key = order[i];
        if (key && typeof value[key] === 'string' && value[key].trim() !== '') return value[key];
      }
      var first = Object.keys(value)[0];
      return first ? localized(value[first], lang) : '';
    }
    return '';
  }

  /* ---------------------------------------------------------------------
     HTML sanitizer — allowlist: p, strong, em, a, br, code
     --------------------------------------------------------------------- */
  var ALLOWED = { P: true, STRONG: true, EM: true, A: true, BR: true, CODE: true };
  var DROP = { SCRIPT: true, STYLE: true, IFRAME: true, OBJECT: true, EMBED: true, SVG: true, MATH: true, TEMPLATE: true };

  function sanitizeHtml(input) {
    if (!input) return '';
    var doc = new DOMParser().parseFromString(String(input), 'text/html');
    var root = doc.body;

    function clean(parent) {
      var nodes = Array.prototype.slice.call(parent.childNodes);
      for (var i = 0; i < nodes.length; i++) {
        var node = nodes[i];
        if (node.nodeType === 8) { node.remove(); continue; }
        if (node.nodeType !== 1) continue;
        var tag = node.tagName;

        if (DROP[tag]) { node.remove(); continue; }

        if (!ALLOWED[tag]) {
          while (node.firstChild) parent.insertBefore(node.firstChild, node);
          node.remove();
          clean(parent);
          return;
        }

        Array.prototype.slice.call(node.attributes).forEach(function (attr) {
          if (tag === 'A' && attr.name === 'href') return;
          node.removeAttribute(attr.name);
        });

        if (tag === 'A') {
          var href = (node.getAttribute('href') || '').trim();
          if (!/^(https?:\/\/|mailto:|tel:|\/|#)/i.test(href)) {
            node.removeAttribute('href');
          } else if (/^https?:\/\//i.test(href)) {
            node.setAttribute('target', '_blank');
            node.setAttribute('rel', 'noopener noreferrer');
          }
        }

        clean(node);
      }
    }

    clean(root);
    return root.innerHTML;
  }

  function escapeHtml(value) {
    return String(value === null || value === undefined ? '' : value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function stripArray(list, validate, name) {
    if (!Array.isArray(list)) {
      if (list !== undefined && list !== null) warn('"' + name + '" should be an array — ignoring.');
      return [];
    }
    return list.filter(function (item, index) {
      if (validate(item)) return true;
      warn('Skipping incomplete item in "' + name + '" at index ' + index + '.');
      return false;
    });
  }

  function load() {
    var raw = window.SITE_DATA;

    if (!isObj(raw)) {
      warn('window.SITE_DATA is missing or not an object. Check that data.js loads before data-loader.js.');
      raw = {};
    }

    Object.keys(raw).forEach(function (key) {
      if (KNOWN_KEYS.indexOf(key) === -1) warn('Unknown top-level key "' + key + '" in data.js.');
    });

    var data = deepMerge(DEFAULTS, raw);

    /* Normalize nested containers */
    ['site', 'theme', 'i18n', 'profile', 'links', 'cv', 'hero', 'now', 'skills', 'research', 'contact', 'footer']
      .forEach(function (key) {
        if (!isObj(data[key])) {
          if (data[key] !== undefined) warn('"' + key + '" should be an object — using defaults.');
          data[key] = deepMerge(DEFAULTS[key], {});
        }
      });

    data.theme.defaultMode = ['system', 'light', 'dark'].indexOf(data.theme.defaultMode) !== -1
      ? data.theme.defaultMode : 'system';

    if (!Array.isArray(data.i18n.languages) || !data.i18n.languages.length) {
      data.i18n.languages = ['en'];
      warn('i18n.languages must be a non-empty array — falling back to ["en"].');
    }
    data.i18n.languages = data.i18n.languages.filter(function (lang) {
      return typeof lang === 'string' && lang.trim() !== '';
    });
    if (!data.i18n.languages.length) data.i18n.languages = ['en'];
    if (!data.i18n.enabled) data.i18n.languages = ['en'];

    /* Strip empty / malformed collections */
    data.hero.stats = stripArray(data.hero.stats, function (s) {
      return isObj(s) && isFilled(s.value) && isFilled(s.label);
    }, 'hero.stats');
    data.hero.traceLines = (Array.isArray(data.hero.traceLines) ? data.hero.traceLines : [])
      .filter(function (line) { return typeof line === 'string' && line.trim() !== ''; });

    data.focusAreas = stripArray(data.focusAreas, function (item) {
      return isObj(item) && isFilled(item.title);
    }, 'focusAreas');

    data.skills.groups = stripArray(data.skills.groups, function (group) {
      if (!isObj(group) || !isFilled(group.title)) return false;
      if (!Array.isArray(group.items)) return false;
      group.items = group.items.filter(function (i) { return typeof i === 'string' && i.trim() !== ''; });
      return group.items.length > 0;
    }, 'skills.groups');
    if (!Array.isArray(data.skills.learning) && !isObj(data.skills.learning)) data.skills.learning = [];

    var seenIds = {};
    data.projects = stripArray(data.projects, function (project) {
      if (!isObj(project) || !isFilled(project.title)) return false;
      if (!project.id) project.id = 'project-' + Math.random().toString(36).slice(2, 8);
      if (seenIds[project.id]) {
        warn('Duplicate project id "' + project.id + '" — keeping the first one.');
        return false;
      }
      seenIds[project.id] = true;
      if (!isObj(project.links)) project.links = {};
      if (!Array.isArray(project.highlights)) project.highlights = [];
      if (!Array.isArray(project.tech)) project.tech = [];
      return true;
    }, 'projects');

    data.research.items = stripArray(data.research.items, function (item) {
      return isObj(item) && isFilled(item.title);
    }, 'research.items');

    function timelineFilter(item) {
      return isObj(item) && isFilled(item.title);
    }
    data.experience = stripArray(data.experience, timelineFilter, 'experience');
    data.education = stripArray(data.education, timelineFilter, 'education');
    data.courses = stripArray(data.courses, timelineFilter, 'courses');

    data.blog = stripArray(data.blog, function (post) {
      return isObj(post) && isFilled(post.title) && isFilled(post.link);
    }, 'blog');

    if (!isFilled(data.profile.name)) warn('profile.name is empty — the site will show placeholders.');
    if (!isFilled(data.profile.email)) warn('profile.email is empty — contact links will be hidden.');

    Site.data = data;
    Site.utils = {
      isObj: isObj,
      isFilled: isFilled,
      localized: localized,
      localizedList: localizedList,
      sanitizeHtml: sanitizeHtml,
      escapeHtml: escapeHtml,
      deepMerge: deepMerge
    };
    Site.t = function (value) { return localized(value, 'en'); };

    return data;
  }

  Site.dataLoader = { load: load, DEFAULTS: DEFAULTS, KNOWN_KEYS: KNOWN_KEYS };

  /* Load immediately: data.js is always included before this file. */
  load();
})();
