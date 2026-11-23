/* ==========================================================================
   hero-visual.js — The hero "agent trace" terminal.
   Types out data.hero.traceLines in a loop. Respects prefers-reduced-motion
   by rendering the final static state. No libraries, no canvas.
   ========================================================================== */
(function () {
  'use strict';

  var Site = (window.Site = window.Site || {});
  var timer = null;
  var cancelled = false;

  var DEFAULT_LINES = [
    '→ extract(source="raw_data", format="csv")',
    '→ validate(schema="strict", nulls="reject")',
    '→ transform(drop_duplicates, cast_types)',
    '→ load(target="warehouse", mode="upsert")',
    '✓ pipeline complete (0 errors)'
  ];

  function reducedMotion() {
    try { return window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) { return false; }
  }

  function lines() {
    var data = Site.data || {};
    var fromData = data.hero && Array.isArray(data.hero.traceLines) ? data.hero.traceLines : [];
    var clean = fromData.filter(function (line) {
      return typeof line === 'string' && line.trim() !== '';
    });
    return clean.length ? clean : DEFAULT_LINES;
  }

  function terminalMarkup() {
    return '<div class="hero__terminal">' +
      '<div class="hero__terminal-bar">' +
        '<span class="hero__terminal-dot hero__terminal-dot--red" aria-hidden="true"></span>' +
        '<span class="hero__terminal-dot hero__terminal-dot--yellow" aria-hidden="true"></span>' +
        '<span class="hero__terminal-dot hero__terminal-dot--green" aria-hidden="true"></span>' +
        '<span class="hero__terminal-title">trace.log</span>' +
      '</div>' +
      '<div class="hero__terminal-body">' +
        '<div class="hero__terminal-lines" data-terminal-lines></div>' +
        '<div class="hero__terminal-progress" aria-hidden="true">' +
          '<span class="hero__terminal-progress-bar" data-terminal-progress></span>' +
        '</div>' +
      '</div>' +
      '</div>';
  }

  function escapeText(value) {
    return String(value).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  function lineHtml(text, partial) {
    var prompt = '';
    var body = text;
    if (/^[→✓✗>]/.test(text)) {
      prompt = text.charAt(0);
      body = text.slice(1).replace(/^\s+/, '');
    }
    return '<div class="hero__terminal-line">' +
      (prompt ? '<span class="hero__terminal-prompt">' + escapeText(prompt) + '</span> ' : '') +
      '<span class="hero__terminal-text">' + escapeText(body) + '</span>' +
      (partial ? '<span class="hero__terminal-cursor" aria-hidden="true"></span>' : '') +
      '</div>';
  }

  function staticRender(container) {
    var all = lines();
    var holder = container.querySelector('[data-terminal-lines]');
    if (!holder) return;
    holder.innerHTML = all.map(function (line) { return lineHtml(line, false); }).join('') +
      '<div class="hero__terminal-line"><span class="hero__terminal-cursor" aria-hidden="true"></span></div>';
    var progress = container.querySelector('[data-terminal-progress]');
    if (progress) progress.style.inlineSize = '100%';
  }

  function start(container) {
    var all = lines();
    var holder = container.querySelector('[data-terminal-lines]');
    var progress = container.querySelector('[data-terminal-progress]');
    if (!holder) return;

    cancelled = false;
    var lineIndex = 0;
    var charIndex = 0;
    var rendered = [];

    function draw(partial) {
      var html = rendered.map(function (line) { return lineHtml(line, false); }).join('');
      if (lineIndex < all.length) {
        var current = all[lineIndex];
        var typed = current.slice(0, charIndex);
        html += lineHtml(typed, true);
      }
      holder.innerHTML = html;
      if (progress) {
        var pct = all.length ? Math.min(100, ((lineIndex + (charIndex / Math.max(1, (all[lineIndex] || '').length))) / all.length) * 100) : 0;
        progress.style.inlineSize = pct.toFixed(1) + '%';
      }
    }

    function typeNext() {
      if (cancelled) return;
      var current = all[lineIndex] || '';
      if (charIndex < current.length) {
        charIndex += 1;
        draw(true);
        timer = window.setTimeout(typeNext, 16 + Math.random() * 22);
        return;
      }
      rendered.push(current);
      lineIndex += 1;
      charIndex = 0;
      draw(false);
      if (lineIndex >= all.length) {
        if (progress) progress.style.inlineSize = '100%';
        timer = window.setTimeout(function () {
          if (cancelled) return;
          rendered = [];
          lineIndex = 0;
          charIndex = 0;
          if (progress) progress.style.inlineSize = '0%';
          holder.innerHTML = lineHtml('', true);
          timer = window.setTimeout(typeNext, 650);
        }, 2600);
        return;
      }
      timer = window.setTimeout(typeNext, 420);
    }

    holder.innerHTML = lineHtml('', true);
    timer = window.setTimeout(typeNext, 500);
  }

  function init() {
    var container = document.getElementById('hero-visual');
    if (!container) return;

    if (timer) { window.clearTimeout(timer); timer = null; }
    cancelled = true;
    container.innerHTML = terminalMarkup();

    if (reducedMotion()) {
      staticRender(container);
      return;
    }
    start(container);
  }

  Site.heroVisual = { init: init };

  document.addEventListener('DOMContentLoaded', function () {
    // render.js calls init() after it mounts the hero; this is a fallback.
    if (document.getElementById('hero-visual') && !document.querySelector('.hero__terminal')) {
      init();
    }
  });
})();
