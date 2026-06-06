/**
 * main.js
 * Application orchestrator — GSAP animations, Lenis smooth scroll,
 * dark mode, event bus, custom cursor, and all module wiring.
 *
 * @module main
 */

import * as colorExtractor from './colorExtractor.js';
import * as unsplashApi from './unsplashApi.js';
import * as collageBuilder from './collageBuilder.js';
import * as exportPalette from './exportPalette.js';
import { harmonizePalette, desaturate } from '../lib/colorHarmony.js';
import { getRandomPalette } from '../lib/paletteLibrary.js';

let lenis = null;
let gsapReady = false;
let _extractionGen = 0;
let _searchTimeout = null;

document.addEventListener('DOMContentLoaded', init);

function init() {
  try {
    const hasGSAP = typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined';
    gsapReady = hasGSAP;

    if (hasGSAP) initLenis();
    setupHero();
    setupDarkMode();
    setupNavbar();
    setupSectionProgress();
    setupBubbles();
    setupCustomCursor();
    setupEventBus();
    setupButtons();
    setupMagneticHover();
    setupKeyboardShortcuts();

    colorExtractor.init();
    collageBuilder.init();
    setupDemo();

    if (hasGSAP) {
      try { animateHeroEntrance(); } catch (e) { console.warn('GSAP hero entrance failed:', e); }
      try { setupScrollRevealGSAP(); } catch (e) { console.warn('GSAP scroll reveal failed:', e); setupScrollRevealFallback(); }
    } else {
      setupScrollRevealFallback();
    }

    try { setupParticles(); } catch (e) {}
    try { setupImagePreview(); } catch (e) {}
    try { setupFAQ(); } catch (e) {}
    try { loadPaletteFromHash(); } catch (e) {}
    try { setupSurprise(); } catch (e) {}
  } catch (err) {
    console.error('init failed, showing fallback UI:', err);
    setupScrollRevealFallback();
  }

  document.body.classList.add('loaded');
}

// ============================================================
// LENIS SMOOTH SCROLL
// ============================================================

function initLenis() {
  if (typeof Lenis === 'undefined') return;

  lenis = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true,
  });

  function raf(time) {
    lenis.raf(time);
    requestAnimationFrame(raf);
  }
  requestAnimationFrame(raf);

  lenis.on('scroll', ScrollTrigger.update);
  ScrollTrigger.defaults({ scroller: document.documentElement });
}

// ============================================================
// HERO ENTRANCE (GSAP)
// ============================================================

function animateHeroEntrance() {
  const tl = gsap.timeline({ defaults: { ease: 'power3.out', duration: .9 } });

  gsap.set('.hero-tag', { opacity: 0, y: -12, scale: .95 });
  gsap.set('.hero-headline .line', { opacity: 0, y: 36 });
  gsap.set('.hero-lead', { opacity: 0, y: 20 });
  gsap.set('#uploadZone', { opacity: 0, y: 24 });
  gsap.set('.hero-actions .btn', { opacity: 0, y: 16 });

  tl.to('.hero-tag', { opacity: 1, y: 0, scale: 1, duration: .4 })
    .to('.hero-headline .line', { opacity: 1, y: 0, stagger: .12 }, '-=.05')
    .to('.hero-lead', { opacity: 1, y: 0 }, '-=.3')
    .to('#uploadZone', { opacity: 1, y: 0, duration: .7 }, '-=.15')
    .to('.hero-actions .btn', { opacity: 1, y: 0, stagger: .08 }, '-=.2');
}

// ============================================================
// HERO BLOCKS PARALLAX
// ============================================================

function setupBubbles() {
  if (!gsapReady) return;

  const orb = document.querySelector('.hero-orb');
  if (!orb) return;

  document.addEventListener('mousemove', (e) => {
    try {
      const x = (e.clientX - window.innerWidth / 2) / window.innerWidth;
      const y = (e.clientY - window.innerHeight / 2) / window.innerHeight;
      gsap.to(orb, { x: x * 20, y: y * 15, duration: 1.5, ease: 'power2.out', overwrite: 'auto' });
    } catch (e) {}
  });
}

// ============================================================
// SCROLL REVEAL — GSAP
// ============================================================

function setupScrollRevealGSAP() {
  gsap.utils.toArray('[data-reveal]').forEach(el => {
    const variant = el.dataset.reveal || 'fade-up';
    const from = { opacity: 0 };

    switch (variant) {
      case 'fade-up': from.y = 48; break;
      case 'fade-down': from.y = -48; break;
      case 'fade-left': from.x = -48; break;
      case 'fade-right': from.x = 48; break;
      case 'scale': from.scale = .9; break;
      case 'flip-up': from.rotateX = 12; break;
    }

    ScrollTrigger.create({
      trigger: el,
      start: 'top 85%',
      onEnter: () => {
        gsap.fromTo(el, from, { opacity: 1, x: 0, y: 0, scale: 1, rotateX: 0, duration: .8, ease: 'expo.out' });
      },
      once: true,
    });
  });

  document.querySelectorAll('[data-stagger]').forEach(parent => {
    const children = parent.querySelectorAll(':scope > *');
    children.forEach((child, i) => child.style.setProperty('--i', i));

    ScrollTrigger.create({
      trigger: parent,
      start: 'top 85%',
      onEnter: () => parent.classList.add('is-visible'),
      once: true,
    });
  });

  // Step cards staggered reveal
  const stepCards = document.querySelectorAll('.step-card');
  if (stepCards.length > 0) {
    ScrollTrigger.create({
      trigger: stepCards[0].parentElement,
      start: 'top 80%',
      onEnter: () => {
        gsap.fromTo(stepCards, { opacity: 0, y: 48, scale: .95 }, {
          opacity: 1, y: 0, scale: 1, duration: .7, ease: 'expo.out',
          stagger: .12,
        });
      },
      once: true,
    });
  }

  // Feature cards alternating direction
  const featureCards = document.querySelectorAll('.feature-card');
  if (featureCards.length > 0) {
    ScrollTrigger.create({
      trigger: featureCards[0].parentElement,
      start: 'top 80%',
      onEnter: () => {
        featureCards.forEach((card, i) => {
          const dir = i % 2 === 0 ? -40 : 40;
          gsap.fromTo(card, { opacity: 0, x: dir, y: 24 }, {
            opacity: 1, x: 0, y: 0, duration: .7, ease: 'expo.out', delay: i * .1,
          });
        });
      },
      once: true,
    });
  }

  // Tech badges stagger entrance
  const badges = document.querySelectorAll('.tech-badge');
  if (badges.length > 0) {
    ScrollTrigger.create({
      trigger: badges[0].parentElement,
      start: 'top 85%',
      onEnter: () => {
        gsap.fromTo(badges, { opacity: 0, scale: .85, y: 12 }, {
          opacity: 1, scale: 1, y: 0, duration: .5, ease: 'back.out(1.7)',
          stagger: .04,
        });
      },
      once: true,
    });
  }

  // Stat counter animation
  const statValues = document.querySelectorAll('.stat-value[data-count]');
  if (statValues.length > 0) {
    ScrollTrigger.create({
      trigger: statValues[0].closest('.stats-grid'),
      start: 'top 80%',
      onEnter: () => {
        statValues.forEach(el => {
          const target = parseInt(el.dataset.count);
          if (isNaN(target)) return;
          const obj = { val: 0 };
          gsap.to(obj, {
            val: target,
            duration: 1.5,
            ease: 'expo.out',
            onUpdate: () => { el.textContent = Math.round(obj.val); },
          });
        });
      },
      once: true,
    });
  }

  // Hero-to-content seamless transition
  const heroBody = document.querySelector('.hero-body');
  if (heroBody) {
    gsap.to(heroBody, {
      opacity: 0, y: -20, duration: 1.2, ease: 'none',
      scrollTrigger: { trigger: '#hero', start: 'top top', end: '60% top', scrub: 1 },
    });
  }
}

// ============================================================
// SCROLL REVEAL — INTERSECTION OBSERVER (FALLBACK)
// ============================================================

function setupScrollRevealFallback() {
  if (window.__COLORIS_CONFIG__?.ENABLE_SCROLL_ANIMATIONS === false) {
    document.querySelectorAll('[data-reveal]').forEach(el => el.classList.add('is-visible'));
    document.querySelectorAll('[data-stagger]').forEach(el => el.classList.add('is-visible'));
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: .1, rootMargin: '0px 0px -40px 0px' });

  document.querySelectorAll('[data-reveal]').forEach(el => observer.observe(el));
  document.querySelectorAll('[data-stagger]').forEach(el => observer.observe(el));

  document.querySelectorAll('[data-stagger]').forEach(parent => {
    parent.querySelectorAll(':scope > *').forEach((child, i) => child.style.setProperty('--i', i));
  });
}

// ============================================================
// HERO
// ============================================================

function setupHero() {
  document.getElementById('startBtn')?.addEventListener('click', () => {
    document.getElementById('uploadZone')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  });
}

// ============================================================
// DARK MODE
// ============================================================

function setupDarkMode() {
  const html = document.documentElement;
  const toggleBtn = document.getElementById('themeToggle');
  const sunIcon = document.getElementById('sunIcon');
  const moonIcon = document.getElementById('moonIcon');

  if (!toggleBtn) return;

  const stored = localStorage.getItem('coloris-theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

  const applyTheme = (isDark) => {
    html.classList.toggle('dark', isDark);
    if (sunIcon && moonIcon) {
      sunIcon.classList.toggle('hidden', isDark);
      moonIcon.classList.toggle('hidden', !isDark);
    }
  };

  if (stored === 'dark' || (!stored && prefersDark)) applyTheme(true);
  else applyTheme(false);

  toggleBtn.addEventListener('click', async () => {
    const isDark = !html.classList.contains('dark');
    const rect = toggleBtn.getBoundingClientRect();
    document.documentElement.style.setProperty('--click-x', (rect.left + rect.width / 2) + 'px');
    document.documentElement.style.setProperty('--click-y', (rect.top + rect.height / 2) + 'px');

    if (document.startViewTransition) {
      await document.startViewTransition(() => applyTheme(isDark)).ready;
    } else {
      applyTheme(isDark);
    }

    localStorage.setItem('coloris-theme', isDark ? 'dark' : 'light');
  });

  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    if (!localStorage.getItem('coloris-theme')) applyTheme(e.matches);
  });
}

// ============================================================
// NAVBAR
// ============================================================

function setupNavbar() {
  const hero = document.getElementById('hero');
  const navbar = document.getElementById('navbar');
  if (!hero || !navbar) return;

  let ticking = false;
  const updateNav = () => {
    navbar.classList.toggle('scrolled', hero.getBoundingClientRect().bottom <= 0);
    ticking = false;
  };

  window.addEventListener('scroll', () => {
    if (!ticking) { requestAnimationFrame(updateNav); ticking = true; }
  }, { passive: true });
  updateNav();
}

// ============================================================
// SECTION PROGRESS
// ============================================================

function setupSectionProgress() {
  const bar = document.getElementById('sectionProgress');
  if (!bar) return;
  let ticking = false;

  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        const scrollTop = window.scrollY;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        bar.style.width = (docHeight > 0 ? Math.min((scrollTop / docHeight) * 100, 100) : 0) + '%';
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });
}

// ============================================================
// CUSTOM CURSOR
// ============================================================

function setupCustomCursor() {
  const cursor = document.getElementById('customCursor');
  if (!cursor) return;

  if (window.__COLORIS_CONFIG__?.ENABLE_CUSTOM_CURSOR === false) { cursor.style.display = 'none'; return; }
  if (window.matchMedia('(hover: none)').matches || window.matchMedia('(pointer: coarse)').matches) { cursor.style.display = 'none'; return; }

  let mouseX = 0, mouseY = 0, cursorX = 0, cursorY = 0;
  let isVisible = false, animationId = null;

  function updateCursor() {
    cursorX += (mouseX - cursorX) * .1;
    cursorY += (mouseY - cursorY) * .1;
    cursor.style.transform = `translate3d(${cursorX - 16}px, ${cursorY - 16}px, 0)`;
    animationId = requestAnimationFrame(updateCursor);
  }

  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    if (!isVisible) {
      isVisible = true;
      cursor.classList.remove('cursor-hidden');
      cursorX = mouseX;
      cursorY = mouseY;
      cancelAnimationFrame(animationId);
      updateCursor();
    }
  }, { passive: true });

  document.addEventListener('mouseleave', () => { cursor.classList.add('cursor-hidden'); isVisible = false; if (animationId) cancelAnimationFrame(animationId); });
  document.addEventListener('mouseenter', () => { cursor.classList.remove('cursor-hidden'); isVisible = true; if (animationId) cancelAnimationFrame(animationId); updateCursor(); });

  const hoverSel = '.btn, .result-card, .swatch, .swatch-color, .tray-item, .upload-zone, .layout-opt, .nav-btn';
  document.addEventListener('mouseover', (e) => { if (e.target.closest(hoverSel)) cursor.classList.add('cursor-hover'); });
  document.addEventListener('mouseout', (e) => { if (e.target.closest(hoverSel)) cursor.classList.remove('cursor-hover'); });
  document.addEventListener('mousedown', () => cursor.classList.add('cursor-click'));
  document.addEventListener('mouseup', () => cursor.classList.remove('cursor-click'));
}

// ============================================================
// MAGNETIC HOVER (GSAP)
// ============================================================

function setupMagneticHover() {
  if (!gsapReady) return;

  document.querySelectorAll('.btn').forEach(btn => {
    btn.addEventListener('mousemove', (e) => {
      try {
        const rect = btn.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        gsap.to(btn, { x: x * .15, y: y * .15, duration: .45, ease: 'power2.out', overwrite: 'auto' });
      } catch (e) {}
    });

    btn.addEventListener('mouseleave', () => {
      try { gsap.to(btn, { x: 0, y: 0, duration: .55, ease: 'power2.out', overwrite: 'auto' }); } catch (e) {}
    });
  });
}

// ============================================================
// FLOATING PARTICLES (GSAP)
// ============================================================

function setupParticles() {
  if (!gsapReady) return;
  const hero = document.getElementById('hero');
  if (!hero) return;
  const count = 6;

  for (let i = 0; i < count; i++) {
    const dot = document.createElement('div');
    dot.className = 'hero-particle';
    dot.style.cssText = `position:absolute;width:${4 + i * 2}px;height:${4 + i * 2}px;border-radius:50%;background:var(--color-accent);opacity:.15;pointer-events:none;z-index:0;`;
    hero.appendChild(dot);

    const x = 10 + Math.random() * 80;
    const y = 10 + Math.random() * 80;
    const dur = 12 + Math.random() * 16;

    gsap.set(dot, { xPercent: x, yPercent: y });
    gsap.to(dot, {
      x: (Math.random() - .5) * 120,
      y: (Math.random() - .5) * 80,
      opacity: .08 + Math.random() * .1,
      duration: dur,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut',
    });
  }
}

// ============================================================
// IMAGE PREVIEW MODAL
// ============================================================

function setupImagePreview() {
  document.addEventListener('click', (e) => {
    const card = e.target.closest('.result-card-image');
    if (!card) return;
    const img = card.querySelector('img');
    if (!img) return;
    const src = img.src.replace('/400/300', '/800/600');
    showImageModal(src);
  });
}

function showImageModal(src) {
  const existing = document.getElementById('imgModal');
  if (existing) existing.remove();

  const overlay = document.createElement('div');
  overlay.id = 'imgModal';
  overlay.className = 'img-modal-overlay';
  overlay.setAttribute('role', 'dialog');
  overlay.innerHTML = `<div class="img-modal-content"><button class="img-modal-close" aria-label="Close">&times;</button><img src="${src}" alt="Preview" class="img-modal-img"></div>`;

  document.body.appendChild(overlay);

  overlay.addEventListener('click', (e) => {
    if (e.target === overlay || e.target.closest('.img-modal-close')) overlay.remove();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && document.getElementById('imgModal')) overlay.remove();
  }, { once: true });
}

// ============================================================
// KEYBOARD SHORTCUTS
// ============================================================

function setupKeyboardShortcuts() {
  document.addEventListener('keydown', (e) => {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
    switch (e.key) {
      case 'd':
      case 'D':
        document.getElementById('themeToggle')?.click();
        break;
      case 'u':
      case 'U':
        document.getElementById('fileInput')?.click();
        break;
      case 'Escape':
        const modal = document.getElementById('imgModal');
        if (modal) modal.remove();
        break;
    }
  });
}

// ============================================================
// SHARE PALETTE VIA URL HASH
// ============================================================

function loadPaletteFromHash() {
  const raw = window.location.hash.replace('#', '').trim();
  if (!raw) return;

  const pipeIdx = raw.indexOf('|');
  const hash = pipeIdx >= 0 ? raw.slice(0, pipeIdx) : raw;
  const photoPart = pipeIdx >= 0 ? raw.slice(pipeIdx + 1) : '';

  if (!/^[0-9A-Fa-f-]+$/.test(hash)) return;

  const parts = hash.split('-').filter(p => p.length === 6);
  if (parts.length < 3) return;

  const colors = parts.map((hex, i) => ({
    r: parseInt(hex.slice(0, 2), 16),
    g: parseInt(hex.slice(2, 4), 16),
    b: parseInt(hex.slice(4, 6), 16),
    hex: '#' + hex.toUpperCase(),
    population: parts.length - i,
    pct: parseFloat(((parts.length - i) / parts.length * 100).toFixed(1)),
  }));

  showSection('palette-section');
  const container = document.getElementById('swatchesContainer');
  if (container) {
    container.innerHTML = '';
    colors.forEach((c, i) => {
      const sw = document.createElement('div');
      sw.className = 'swatch entering';
      sw.style.setProperty('--i', i);
      sw.innerHTML = `<div class="swatch-color" style="background:${c.hex}"></div><span class="swatch-hex">${c.hex}</span><span class="swatch-pct">${c.pct}%</span>`;
      sw.addEventListener('click', () => { if (navigator.clipboard) navigator.clipboard.writeText(c.hex).catch(() => {}); });
      container.appendChild(sw);
    });
    requestAnimationFrame(() => container.querySelectorAll('.swatch').forEach(s => s.classList.remove('entering')));
  }
  document.getElementById('exportPaletteBtn').disabled = false;
  document.getElementById('copyCssBtn').disabled = false;
  document.getElementById('copyJsonBtn').disabled = false;

  renderHarmonies(colors);

  unsplashApi.searchByPalette(colors).then(results => {
    if (results && results.length > 0) {
      renderResults(results);
      showSection('results-section');
      if (photoPart) {
        const ids = photoPart.split(',');
        ids.forEach(id => {
          const img = results.find(r => r.id === id);
          if (img) collageBuilder.addImage(img);
        });
      }
    } else {
      showEmptyState();
    }
  }).catch(() => {});

  try {
    const stored = localStorage.getItem('coloris-state');
    if (stored && !photoPart) {
      const state = JSON.parse(stored);
      if (state.photoIds && state.photoIds.length > 0) {
        // Photo IDs from localStorage will be used when search returns
      }
    }
  } catch (e) {}
}

// ============================================================
// COLOR HARMONIES
// ============================================================

function renderHarmonies(colors) {
  let section = document.getElementById('harmonySection');
  if (!section) {
    section = document.createElement('div');
    section.id = 'harmonySection';
    section.className = 'harmony-section';
    document.getElementById('palette-section')?.querySelector('.container')?.appendChild(section);
  }
  const harmonies = harmonizePalette(colors);
  if (!harmonies) { section.innerHTML = ''; return; }

  const searchAndClosePalette = (hex) => {
    const prev = document.getElementById('harmonyOverlay');
    if (prev) prev.remove();
    const overlay = document.createElement('div');
    overlay.id = 'harmonyOverlay';
    overlay.style.cssText = 'position:fixed;inset:0;z-index:9999;background:rgba(0,0,0,.5);display:flex;align-items:center;justify-content:center';
    overlay.innerHTML = `<div style="background:var(--color-surface);border-radius:24px;padding:32px;max-width:400px;text-align:center"><p style="margin-bottom:16px;color:var(--color-text)">Search with this color?</p><div style="width:64px;height:64px;border-radius:16px;background:${hex};margin:0 auto 16px;border:2px solid var(--color-border)"></div><span style="font-family:var(--font-mono);font-size:14px;color:var(--color-text-soft)">${hex}</span><div style="display:flex;gap:12px;justify-content:center;margin-top:20px"><button class="btn btn-primary btn-sm" id="harmonyConfirm" type="button">Search</button><button class="btn btn-ghost btn-sm" id="harmonyCancel" type="button">Cancel</button></div></div>`;
    document.body.appendChild(overlay);
    overlay.querySelector('#harmonyConfirm').addEventListener('click', () => {
      overlay.remove();
      const grid = document.getElementById('resultsGrid');
      if (grid) { grid.innerHTML = ''; showSkeletons(grid, 6); }
      unsplashApi.searchByPalette([{ hex }]).then(results => {
        if (results && results.length > 0) { renderResults(results); showSection('results-section'); }
        else showEmptyState();
      });
    });
    overlay.querySelector('#harmonyCancel').addEventListener('click', () => overlay.remove());
    overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.remove(); });
  };

  const harmonyData = [
    { label: 'Complementary', colors: [harmonies.complementary] },
    { label: 'Analogous', colors: harmonies.analogous },
    { label: 'Triad', colors: harmonies.triad },
  ];

  section.innerHTML = `<span class="harmony-label">Color Harmonies</span><div class="harmony-row">${harmonyData.map(g => `<div class="harmony-group"><span class="harmony-group-label">${g.label}</span><div class="harmony-swatches">${g.colors.map(h => `<div class="harmony-swatch" style="background:${h}" data-hex="${h}"></div>`).join('')}</div></div>`).join('')}</div>`;

  section.querySelectorAll('.harmony-swatch').forEach(el => {
    el.addEventListener('click', () => searchAndClosePalette(el.dataset.hex));
  });
}

// ============================================================
// BACKGROUND SHIFT
// ============================================================

function changeBackground(hex) {
  const muted = desaturate(hex, 0.85);
  document.body.style.backgroundColor = muted;
}

// ============================================================
// COLOR MAGNIFIER
// ============================================================

function setupMagnifier(imgElement) {
  const container = imgElement.closest('.upload-preview') || imgElement.parentElement;
  if (!container) return;

  const existing = container.querySelector('.magnifier');
  if (existing) existing.remove();
  const existingHex = container.querySelector('.magnifier-hex');
  if (existingHex) existingHex.remove();

  const mag = document.createElement('canvas');
  mag.className = 'magnifier hidden';
  mag.width = 120;
  mag.height = 120;

  const hexLabel = document.createElement('span');
  hexLabel.className = 'magnifier-hex hidden';

  container.appendChild(mag);
  container.appendChild(hexLabel);

  const offscreen = document.createElement('canvas');
  const img = imgElement;
  offscreen.width = img.naturalWidth || img.width;
  offscreen.height = img.naturalHeight || img.height;
  const offCtx = offscreen.getContext('2d');
  if (!offCtx) return;
  offCtx.drawImage(img, 0, 0);

  let magTimeout = null;

  container.addEventListener('mouseenter', () => {
    mag.classList.remove('hidden');
    hexLabel.classList.remove('hidden');
  });

  container.addEventListener('mouseleave', () => {
    mag.classList.add('hidden');
    hexLabel.classList.add('hidden');
  });

  container.addEventListener('mousemove', (e) => {
    clearTimeout(magTimeout);
    magTimeout = setTimeout(() => {
      const rect = container.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;
      const scaleX = offscreen.width / rect.width;
      const scaleY = offscreen.height / rect.height;
      const px = Math.round(mx * scaleX);
      const py = Math.round(my * scaleY);

      const magCtx = mag.getContext('2d');
      if (!magCtx) return;

      const size = 10;
      const sx = Math.max(0, Math.min(px - size / 2, offscreen.width - size));
      const sy = Math.max(0, Math.min(py - size / 2, offscreen.height - size));

      magCtx.beginPath();
      magCtx.arc(60, 60, 58, 0, Math.PI * 2);
      magCtx.clip();
      magCtx.drawImage(offscreen, sx, sy, size, size, 0, 0, 120, 120);

      const imgData = offCtx.getImageData(px, py, 1, 1);
      const cr = imgData.data[0], cg = imgData.data[1], cb = imgData.data[2];
      const hex = '#' + [cr, cg, cb].map(c => c.toString(16).padStart(2, '0')).join('').toUpperCase();
      hexLabel.textContent = hex;

      mag.style.left = mx + 'px';
      mag.style.top = my + 'px';
      hexLabel.style.left = mx + 'px';
      hexLabel.style.top = (my + 66) + 'px';

      if (e.buttons === 1 || e.detail > 0) {
        const swatchContainer = document.getElementById('swatchesContainer');
        if (swatchContainer) {
          const existingSwatches = swatchContainer.querySelectorAll('.swatch-color');
          const dup = Array.from(existingSwatches).some(el => el.style.backgroundColor === hex);
          if (!dup) {
            const sw = document.createElement('div');
            sw.className = 'swatch entering';
            sw.innerHTML = `<div class="swatch-color" style="background:${hex}"></div><span class="swatch-hex">${hex}</span><span class="swatch-pct">-</span>`;
            sw.addEventListener('click', () => { if (navigator.clipboard) navigator.clipboard.writeText(hex).catch(() => {}); });
            swatchContainer.appendChild(sw);
            requestAnimationFrame(() => sw.classList.remove('entering'));
          }
        }
      }
    }, 16);
  });
}

// ============================================================
// SURPRISE COLLAGE
// ============================================================

function setupSurprise() {
  const btn = document.getElementById('surpriseBtn');
  if (!btn) return;
  btn.addEventListener('click', async () => {
    btn.disabled = true;
    btn.classList.add('is-loading');
    try {
      const palette = getRandomPalette();
      showToast('Palette: ' + palette.name, 'info');

      const swatchContainer = document.getElementById('swatchesContainer');
      if (swatchContainer) {
        swatchContainer.innerHTML = '';
        palette.colors.forEach((hex, i) => {
          const sw = document.createElement('div');
          sw.className = 'swatch entering';
          sw.style.setProperty('--i', i);
          sw.innerHTML = `<div class="swatch-color" style="background:${hex}"></div><span class="swatch-hex">${hex}</span><span class="swatch-pct">-</span>`;
          sw.addEventListener('click', () => { if (navigator.clipboard) navigator.clipboard.writeText(hex).catch(() => {}); });
          swatchContainer.appendChild(sw);
        });
        requestAnimationFrame(() => swatchContainer.querySelectorAll('.swatch').forEach(s => s.classList.remove('entering')));
      }

      const paletteObj = palette.colors.map(h => ({ hex: h }));
      const results = await unsplashApi.searchByPalette(paletteObj);
      if (results && results.length > 0) {
        renderResults(results);
        showSection('results-section');
        const top4 = results.slice(0, 4);
        top4.forEach(img => collageBuilder.addImage(img));

        const layouts = ['grid-2x2', 'grid-3x2', 'grid-4x2', 'polaroid'];
        const randomLayout = layouts[Math.floor(Math.random() * layouts.length)];
        collageBuilder.setLayout(randomLayout);
        showToast('Collage built! Export or rearrange.', 'success');
      } else {
        showEmptyState();
      }
    } catch (err) {
      showToast('Surprise failed: ' + err.message, 'error');
    } finally {
      btn.disabled = false;
      btn.classList.remove('is-loading');
    }
  });
}

// ============================================================
// EVENT BUS
// ============================================================

function setupEventBus() {
  document.addEventListener('extraction:start', onExtractionStart);
  document.addEventListener('extraction:complete', onExtractionComplete);
  document.addEventListener('extraction:error', onExtractionError);
  document.addEventListener('search:start', onSearchStart);
  document.addEventListener('search:complete', onSearchComplete);
  document.addEventListener('search:error', onSearchError);
  document.addEventListener('search:fallback', onSearchFallback);
  document.addEventListener('collage:update', onCollageUpdate);
  document.addEventListener('collage:export:start', onCollageExportStart);
  document.addEventListener('collage:export:complete', onCollageExportComplete);
  document.addEventListener('collage:export:error', onCollageExportError);
  document.addEventListener('toast:show', onToastShow);
}

function onExtractionStart() {
  _extractionGen++;
  if (_searchTimeout) { clearTimeout(_searchTimeout); _searchTimeout = null; }
  const grid = document.getElementById('resultsGrid');
  if (grid) { grid.innerHTML = ''; showSkeletons(grid, 6); }
  const bar = document.getElementById('colorFilterBar');
  if (bar) bar.innerHTML = '';
}

function onExtractionComplete(e) {
  const { colors } = e.detail;
  if (!colors || colors.length === 0) return;
  const gen = _extractionGen;

  showSection('palette-section');
  showToast('Palette extracted!', 'success');

  const exportBtn = document.getElementById('exportPaletteBtn');
  const cssBtn = document.getElementById('copyCssBtn');
  const jsonBtn = document.getElementById('copyJsonBtn');
  if (exportBtn) { exportBtn.disabled = false; exportBtn.onclick = () => exportPalette.exportPalettePNG(colors); }
  if (cssBtn) { cssBtn.disabled = false; cssBtn.onclick = () => exportPalette.copyAsCSS(colors); }
  if (jsonBtn) { jsonBtn.disabled = false; jsonBtn.onclick = () => exportPalette.copyAsJSON(colors); }

  const hexStr = colors.map(c => c.hex.replace('#', '')).join('-');
  window.location.hash = hexStr;

  renderHarmonies(colors);

  const previewImg = document.getElementById('previewImage');
  if (previewImg && previewImg.src) {
    setTimeout(() => setupMagnifier(previewImg), 500);
  }

  const grid = document.getElementById('resultsGrid');
  if (grid) { grid.innerHTML = ''; showSkeletons(grid, 6); }

  _searchTimeout = setTimeout(async () => {
    _searchTimeout = null;
    if (gen !== _extractionGen) return;
    try {
      const results = await unsplashApi.searchByPalette(colors);
      if (gen !== _extractionGen) return;
      if (results && results.length > 0) {
        renderResults(results);
        showSection('results-section');
        const topIds = results.slice(0, 3).map(r => r.id).join(',');
        try {
          localStorage.setItem('coloris-state', JSON.stringify({ colors, photoIds: results.slice(0, 3).map(r => r.id) }));
        } catch (e) {}
        const hashColors = colors.map(c => c.hex.replace('#', '')).join('-');
        window.location.hash = hashColors + '|' + topIds;
      } else {
        showEmptyState();
      }
    } catch (err) {
      if (gen === _extractionGen) showErrorState(err.message);
    }
  }, 300);
}

function onExtractionError(e) { showToast(e.detail.error || 'Extraction failed', 'error'); }
function onSearchStart() {}

function onSearchComplete(e) { renderResults(e.detail.images); }

function onSearchError(e) {
  showErrorState(e.detail.error || 'Search failed');
  showToast('Search failed, using demo data', 'warning');
}

function onSearchFallback() { showToast('Using demo image dataset', 'info'); }

function onCollageUpdate() {
  if (collageBuilder.getCount() > 0) collageBuilder.showTray();
  else collageBuilder.hideTray();
}

function onCollageExportStart() { showToast('Exporting collage...', 'info'); }
function onCollageExportComplete() { showToast('Collage exported!', 'success'); }
function onCollageExportError(e) { showToast(e.detail?.error || 'Export failed', 'error'); }
function onToastShow(e) { showToast(e.detail.message, e.detail.type); }

// ============================================================
// SECTION MANAGER
// ============================================================

function showSection(id) {
  const section = document.getElementById(id) || document.querySelector('#' + id);
  if (!section) return;

  section.classList.remove('section-hidden');
  section.classList.add('section-visible');

  if (section.hasAttribute('data-reveal') && !section.classList.contains('is-visible')) {
    section.classList.add('is-visible');
  }

  setTimeout(() => section.scrollIntoView({ behavior: 'smooth', block: 'nearest' }), 200);

  if (gsapReady) {
    try { ScrollTrigger.refresh(); } catch (e) {}
  }
}

// ============================================================
// RENDER HELPERS
// ============================================================

function showSkeletons(container, count) {
  container.innerHTML = '';
  for (let i = 0; i < count; i++) {
    const sk = document.createElement('div');
    sk.className = 'skeleton-card entering';
    sk.style.setProperty('--i', i);
    sk.innerHTML = '<div class="skeleton-image skeleton"></div><div class="skeleton-text skeleton"></div><div class="skeleton-meta skeleton"></div>';
    container.appendChild(sk);
  }
}

function renderResults(images) {
  const grid = document.getElementById('resultsGrid');
  const countEl = document.getElementById('resultsCount');
  const empty = document.getElementById('resultsEmpty');
  const error = document.getElementById('resultsError');
  const loadMore = document.getElementById('loadMore');

  if (!grid) return;
  grid.innerHTML = '';
  empty?.classList.add('hidden');
  error?.classList.add('hidden');

  if (!images || images.length === 0) { showEmptyState(); return; }
  if (countEl) countEl.textContent = `${images.length} images`;

  images.forEach((img, i) => {
    const card = document.createElement('div');
    card.className = 'result-card entering';
    card.style.setProperty('--i', i);
    card.dataset.id = img.id;
    if (img.matchedHex) card.dataset.matchedHex = img.matchedHex;

    const selected = collageBuilder.isSelected(img.id) ? 'selected' : '';
    const dot = img.matchedHex ? `<span class="color-match-indicator" style="background:${img.matchedHex}" title="${img.matchedHex}"></span>` : '';
    const score = img.matchScore != null ? `<span class="color-match-score">${img.matchScore}%</span>` : '';
    const dlUrl = (img.url || '').replace('/800/600', '/1600/1200');

    card.innerHTML = `<div class="result-card-image"><img src="${img.thumbUrl || img.url}" alt="${img.alt || img.author || ''}" loading="lazy" crossorigin="anonymous" onerror="this.src='data:image/svg+xml,${encodeURIComponent('<svg xmlns=\\"http://www.w3.org/2000/svg\\" width=\\"400\\" height=\\"300\\" fill=\\"#F3EFE9\\"><rect width=\\"400\\" height=\\"300\\"/><text x=\\"200\\" y=\\"150\\" text-anchor=\\"middle\\" fill=\\"#A6988A\\" font-size=\\"14\\">Failed to load</text></svg>')}'"></div><div class="result-card-meta"><span class="result-card-author">${img.author || 'Unknown'}</span>${dot}${score}<button class="result-card-dl" data-url="${dlUrl}" aria-label="Download" type="button"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg></button><button class="result-card-select ${selected}" data-id="${img.id}" aria-label="${selected ? 'Deselect' : 'Select'}" type="button"><svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><polyline points="3 8 7 12 13 4"/></svg></button></div>`;

    const btn = card.querySelector('.result-card-select');
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const sel = collageBuilder.toggleImage(img);
      btn.classList.toggle('selected', sel);
      btn.setAttribute('aria-label', sel ? 'Deselect' : 'Select');
    });

    const dlBtn = card.querySelector('.result-card-dl');
    if (dlBtn) {
      dlBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const a = document.createElement('a');
        a.href = dlBtn.dataset.url;
        a.download = img.id + '.jpg';
        a.target = '_blank';
        a.click();
      });
    }

    const imgEl = card.querySelector('img');
    imgEl.classList.add('loading');
    imgEl.addEventListener('load', () => { imgEl.classList.remove('loading'); imgEl.classList.add('loaded'); }, { once: true });
    if (imgEl.complete) { imgEl.classList.remove('loading'); imgEl.classList.add('loaded'); }

    grid.appendChild(card);
  });

  requestAnimationFrame(() => {
    grid.querySelectorAll('.result-card.entering').forEach(c => c.classList.remove('entering'));
  });

  if (loadMore) loadMore.classList.add('hidden');

  const palette = colorExtractor.getPalette();
  if (palette.length > 0) renderColorFilterChips(palette, images);
}

function showEmptyState() {
  const grid = document.getElementById('resultsGrid');
  const empty = document.getElementById('resultsEmpty');
  if (grid) grid.innerHTML = '';
  empty?.classList.remove('hidden');
  document.getElementById('resultsError')?.classList.add('hidden');
}

function showErrorState(message) {
  const grid = document.getElementById('resultsGrid');
  const error = document.getElementById('resultsError');
  if (grid) grid.innerHTML = '';
  error?.classList.remove('hidden');
  document.getElementById('resultsEmpty')?.classList.add('hidden');

  const retryBtn = document.getElementById('retryBtn');
  if (retryBtn) {
    retryBtn.onclick = async () => {
      const colors = colorExtractor.getPalette();
      if (colors.length > 0) {
        if (grid) showSkeletons(grid, 6);
        unsplashApi.searchByPalette(colors).catch(err => showErrorState(err.message || 'Search failed'));
      }
    };
  }
}

function renderColorFilterChips(colors, images) {
  const section = document.getElementById('results-section');
  if (!section) return;

  let bar = document.getElementById('colorFilterBar');
  if (!bar) {
    bar = document.createElement('div');
    bar.id = 'colorFilterBar';
    bar.className = 'color-filter-bar';
    const h2 = section.querySelector('h2');
    if (h2) h2.insertAdjacentElement('afterend', bar);
    else section.querySelector('.container')?.prepend(bar);
  }
  bar.innerHTML = '';

  const allBtn = document.createElement('button');
  allBtn.className = 'color-filter-chip active';
  allBtn.dataset.hex = 'all';
  allBtn.textContent = 'All';
  allBtn.addEventListener('click', () => {
    bar.querySelectorAll('.color-filter-chip').forEach(c => c.classList.remove('active'));
    allBtn.classList.add('active');
    renderResults(unsplashApi.searchByColor('all'));
  });
  bar.appendChild(allBtn);

  colors.forEach(color => {
    const chip = document.createElement('button');
    chip.className = 'color-filter-chip';
    chip.dataset.hex = color.hex;
    chip.innerHTML = `<span class="chip-dot" style="background:${color.hex}"></span>${color.hex}`;
    chip.addEventListener('click', () => {
      bar.querySelectorAll('.color-filter-chip').forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      renderResults(unsplashApi.searchByColor(color.hex));
    });
    bar.appendChild(chip);
  });
}

// ============================================================
// TOAST SYSTEM
// ============================================================

let toastCounter = 0;

function showToast(message, type = 'info', duration = 4000) {
  const container = document.getElementById('toastContainer');
  if (!container) return;

  toastCounter++;
  const id = `toast-${toastCounter}`;
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.id = id;
  toast.setAttribute('role', 'alert');

  const icons = { success: '\u2713', error: '\u2717', warning: '\u26A0', info: '\u2139' };
  toast.innerHTML = `<span class="toast-icon">${icons[type] || '\u2139'}</span><span class="toast-message">${escapeHtml(message)}</span><button class="toast-close" aria-label="Dismiss" type="button">&times;</button>`;
  toast.querySelector('.toast-close').addEventListener('click', () => removeToast(id));
  container.appendChild(toast);
  if (duration > 0) setTimeout(() => removeToast(id), duration);
}

function removeToast(id) {
  const toast = document.getElementById(id);
  if (!toast) return;
  toast.classList.add('removing');
  setTimeout(() => toast.remove(), 300);
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

// ============================================================
// BUTTONS (event delegation + loadMore wiring)
// ============================================================

function setupButtons() {
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('.btn');
    if (!btn) return;
    const ripple = document.createElement('span');
    ripple.className = 'ripple';
    const rect = btn.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    ripple.style.width = ripple.style.height = size + 'px';
    ripple.style.left = (e.clientX - rect.left - size / 2) + 'px';
    ripple.style.top = (e.clientY - rect.top - size / 2) + 'px';
    btn.appendChild(ripple);
    setTimeout(() => ripple.remove(), 500);
  });

  const loadMoreBtn = document.getElementById('loadMoreBtn');
  if (loadMoreBtn) {
    loadMoreBtn.addEventListener('click', async () => {
      loadMoreBtn.disabled = true;
      loadMoreBtn.classList.add('is-loading');
      try { await unsplashApi.loadMore(); } catch { showToast('Failed to load more', 'error'); }
      finally { loadMoreBtn.disabled = false; loadMoreBtn.classList.remove('is-loading'); }
    });
  }
}

// ============================================================
// DEMO MODE
// ============================================================

function setupDemo() {
  const demoBtn = document.getElementById('demoBtn');
  if (!demoBtn) return;

  if (window.__COLORIS_CONFIG__?.DEMO_MODE === false) { demoBtn.style.display = 'none'; return; }

  demoBtn.addEventListener('click', async () => {
    demoBtn.disabled = true;
    demoBtn.classList.add('is-loading');
    try {
      await colorExtractor.processUrl('https://picsum.photos/seed/demo-forest/800/600');
      showToast('Demo image loaded!', 'success');
    } catch {
      showToast('Demo image unavailable. Try uploading your own.', 'error');
    } finally {
      demoBtn.disabled = false;
      demoBtn.classList.remove('is-loading');
    }
  });
}

// ============================================================
// FAQ ACCORDION
// ============================================================

function setupFAQ() {
  document.addEventListener('click', (e) => {
    const question = e.target.closest('.faq-question');
    if (!question) return;
    const item = question.closest('.faq-item');
    if (!item) return;
    const isOpen = item.classList.contains('open');
    document.querySelectorAll('.faq-item.open').forEach(el => el.classList.remove('open'));
    if (!isOpen) item.classList.add('open');
  });
}
