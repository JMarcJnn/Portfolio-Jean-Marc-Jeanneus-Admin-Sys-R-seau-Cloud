/**
 * ═══════════════════════════════════════════════
 * Portfolio — Jean-Marc Jeanneus
 * Admin Sys & Réseau & Cloud | Apprenti Pentester
 * main.js — Scripts principaux
 * ═══════════════════════════════════════════════
 */

'use strict';

// ─── INERTIAL SMOOTH SCROLL (Lenis-style) ───
  (function() {
    let current = window.scrollY;
    let target  = window.scrollY;
    let rafId   = null;
    const ease  = 0.09; // lower = more inertia (like Lenis)

    function lerp(a, b, t) { return a + (b - a) * t; }

    function tick() {
      current = lerp(current, target, ease);
      const diff = Math.abs(target - current);
      window.scrollTo(0, current);
      if (diff > 0.5) {
        rafId = requestAnimationFrame(tick);
      } else {
        window.scrollTo(0, target);
        rafId = null;
      }
    }

    window.addEventListener('wheel', e => {
      e.preventDefault();
      target += e.deltaY * 1.2;
      target = Math.max(0, Math.min(target, document.body.scrollHeight - window.innerHeight));
      if (!rafId) rafId = requestAnimationFrame(tick);
    }, { passive: false });

    // Smooth anchor clicks
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function(e) {
        const href = this.getAttribute('href');
        if (href === '#') return;
        const el = document.querySelector(href);
        if (!el) return;
        e.preventDefault();
        target = Math.max(0, Math.min(
          el.getBoundingClientRect().top + window.scrollY - 80,
          document.body.scrollHeight - window.innerHeight
        ));
        if (!rafId) rafId = requestAnimationFrame(tick);
      });
    });

    // Sync on scroll from keyboard / scrollbar
    window.addEventListener('scroll', () => {
      if (!rafId) {
        current = window.scrollY;
        target  = window.scrollY;
      }
    });
  })();

  // ─── CUSTOM CURSOR ───
  const cursor = document.getElementById('cursor');
  const ring = document.getElementById('cursor-ring');
  if (cursor && ring) {
    // Suivre la souris
    document.addEventListener('mousemove', e => {
      cursor.style.left = e.clientX + 'px';
      cursor.style.top  = e.clientY + 'px';
      // Anneau avec léger lag pour effet fluide
      setTimeout(() => {
        ring.style.left = e.clientX + 'px';
        ring.style.top  = e.clientY + 'px';
      }, 80);
    });

    // Grossir sur les éléments interactifs
    const interactives = 'a, button, .lab-card, .hcard, .timeline-content, .contact-row, .fc-bts, .fc-cpts, .fc-mini, .skill-category, [onclick]';
    document.querySelectorAll(interactives).forEach(el => {
      el.addEventListener('mouseenter', () => {
        cursor.classList.add('hovering');
        ring.classList.add('hovering');
      });
      el.addEventListener('mouseleave', () => {
        cursor.classList.remove('hovering');
        ring.classList.remove('hovering');
      });
    });

    // Disparaître quand la souris quitte la fenêtre
    document.addEventListener('mouseleave', () => {
      cursor.style.opacity = '0';
      ring.style.opacity = '0';
    });
    document.addEventListener('mouseenter', () => {
      cursor.style.opacity = '1';
      ring.style.opacity = '1';
    });
  }

  // ─── TYPEWRITER ───
  const phrases = [
    'Apprenti Pentester',
    'Offensive Security Enthusiast',
    'HTB & Google Player',
    'Active Directory Explorer',
    'CTF Write-up Author',
  ];
  let pi = 0, ci = 0, deleting = false;
  const tw = document.getElementById('typewriter');
  function type() {
    if (!tw) return;
    const phrase = phrases[pi];
    if (!deleting) {
      tw.textContent = phrase.slice(0, ++ci);
      if (ci === phrase.length) { deleting = true; setTimeout(type, 2000); return; }
    } else {
      tw.textContent = phrase.slice(0, --ci);
      if (ci === 0) { deleting = false; pi = (pi + 1) % phrases.length; }
    }
    setTimeout(type, deleting ? 40 : 80);
  }
  if (tw) type();

  // ─── COUNTER ANIMATION (disabled — stat cards removed) ───

  // ─── SCROLL ANIMATIONS ───
  const fadeEls = document.querySelectorAll('.fade-in');
  const fadeObs = new IntersectionObserver(entries => {
    entries.forEach((e, i) => {
      if (e.isIntersecting) {
        e.target.style.transitionDelay = `${(i % 4) * 0.1}s`;
        e.target.classList.add('visible');
      }
    });
  }, { threshold: 0.1 });
  fadeEls.forEach(el => fadeObs.observe(el));

  // ─── SKILL BARS ───
  const skillObs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.querySelectorAll('.skill-fill').forEach(bar => {
          setTimeout(() => { bar.style.width = bar.dataset.pct + '%'; }, 200);
        });
      }
    });
  }, { threshold: 0.2 });
  document.querySelectorAll('.skill-category').forEach(el => skillObs.observe(el));

  // ─── SCRAMBLE / GLITCH TEXT EFFECT ON HERO NAME ───
  const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&!?<>/|[]{}~^*+-=';

  function initScramble() {
    const nameEl = document.getElementById('hero-name-el');
    const accentEl = document.getElementById('hero-name-accent');
    if (!nameEl || !accentEl) return;

    // Wrap the "Jean-Marc " text nodes in a span
    const firstLine = document.createElement('span');
    firstLine.id = 'hero-name-line1';
    const toMove = [];
    for (const n of Array.from(nameEl.childNodes)) {
      if (n === accentEl) break;
      toMove.push(n);
    }
    const rawText = toMove.map(n => n.textContent).join('');
    toMove.forEach(n => n.remove());
    firstLine.textContent = rawText;
    nameEl.insertBefore(firstLine, accentEl);

    // Explode a wrapper into per-letter spans
    // Returns array of {el, original} or null for spaces
    function buildLetters(wrapper, isAccent) {
      const text = wrapper.textContent;
      wrapper.textContent = '';
      const result = [];
      for (const ch of text) {
        const s = document.createElement('span');
        if (ch === ' ' || ch === '\u00a0') {
          s.innerHTML = '&nbsp;';
          wrapper.appendChild(s);
          result.push(null);
        } else {
          s.textContent = ch;
          s.className = 'letter' + (isAccent ? ' in-accent' : '');
          wrapper.appendChild(s);
          result.push({ el: s, original: ch });
        }
      }
      return result;
    }

    const letters1 = buildLetters(firstLine, false);
    const letters2 = buildLetters(accentEl, true);
    const all = [...letters1, ...letters2];

    let rafId = null;

    function runScramble() {
      if (rafId) cancelAnimationFrame(rafId);
      const now0 = performance.now();
      const resolveAt = all.map((item, i) =>
        item ? now0 + 400 + i * 130 + Math.random() * 200 : 0
      );
      all.forEach(item => { if (item) item.el.classList.add('scrambling'); });

      function tick(now) {
        let pending = false;
        all.forEach((item, i) => {
          if (!item) return;
          if (now >= resolveAt[i]) {
            item.el.textContent = item.original;
            item.el.classList.remove('scrambling');
            // restore saved gradient color if any
            if (item.savedColor) item.el.style.color = item.savedColor;
          } else {
            item.el.textContent = CHARS[Math.floor(Math.random() * CHARS.length)];
            pending = true;
          }
        });
        if (pending) rafId = requestAnimationFrame(tick);
      }
      rafId = requestAnimationFrame(tick);
    }

    nameEl.addEventListener('mouseenter', runScramble);

    // Apply white→green gradient on last 4 letters of Jeanneus (letters2)
    // letters2 = [{el,original}, null?, ...] — filter nulls then take last 4
    const realLetters2 = letters2.filter(x => x !== null);
    const gradLetters = realLetters2.slice(-6);
    const total = gradLetters.length; // 4
    gradLetters.forEach((item, i) => {
      // interpolate from white (#fff) to green (#00ff88)
      const t = i / (total - 1); // 0 → 1
      const r = Math.round(255 * (1 - t) + 0 * t);
      const g = Math.round(255 * (1 - t) + 255 * t);
      const b = Math.round(255 * (1 - t) + 136 * t);
      item.el.style.color = `rgb(${r},${g},${b})`;
      item.savedColor = `rgb(${r},${g},${b})`;
    });
  }

  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(initScramble);
  } else {
    window.addEventListener('load', initScramble);
  }



  // ─── NAVBAR SCROLL EFFECT ───
  const nav = document.querySelector('nav');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) {
      nav.classList.add('scrolled');
    } else {
      nav.classList.remove('scrolled');
    }
  }, { passive: true });

  // ─── ACTIVE SECTION HIGHLIGHT ───
  const navLinks = document.querySelectorAll('.nav-links a');
  const sections = document.querySelectorAll('section[id]');
  const observerOpts = { rootMargin: '-40% 0px -55% 0px', threshold: 0 };
  const sectionObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        navLinks.forEach(link => {
          link.classList.remove('active');
          if (link.getAttribute('href') === '#' + entry.target.id) {
            link.classList.add('active');
          }
        });
      }
    });
  }, observerOpts);
  sections.forEach(s => sectionObserver.observe(s));

  // ─── HAMBURGER MENU ───
  function toggleMenu() {
    const menu = document.getElementById('mobile-menu');
    const burger = document.getElementById('hamburger');
    const isOpen = menu.classList.toggle('open');
    burger.classList.toggle('open');
    document.body.style.overflow = isOpen ? 'hidden' : '';
  }

  // ESC key closes mobile menu
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      const menu = document.getElementById('mobile-menu');
      const burger = document.getElementById('hamburger');
      if (menu && menu.classList.contains('open')) {
        menu.classList.remove('open');
        burger.classList.remove('open');
        document.body.style.overflow = '';
      }
    }
  });
