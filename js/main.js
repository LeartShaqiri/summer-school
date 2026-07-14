/**
 * ═══════════════════════════════════════════════════════
 * Summer School — AI & ML
 * Animation Engine & Interactions
 * ═══════════════════════════════════════════════════════
 */

/* ── Navigation scroll effect ──────────────────────── */
const nav = document.getElementById('nav');
let lastScrollY = 0;

window.addEventListener('scroll', () => {
  const scrollY = window.scrollY;

  // Add scrolled class past threshold
  if (scrollY > 50) {
    nav.classList.add('scrolled');
  } else {
    nav.classList.remove('scrolled');
  }

  lastScrollY = scrollY;
}, { passive: true });

/* ── Scroll Reveal Observer ────────────────────────── */
const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        // Optionally unobserve after reveal for performance
        // revealObserver.unobserve(entry.target);
      }
    });
  },
  {
    threshold: 0.15,
    rootMargin: '0px 0px -60px 0px',
  }
);

// Observe all .reveal elements
document.querySelectorAll('.reveal').forEach((el) => {
  revealObserver.observe(el);
});

/**
 * Observe newly-added .reveal elements dynamically.
 * Call this after injecting new content.
 */
function observeNewReveals() {
  document.querySelectorAll('.reveal:not([data-reveal-observed])').forEach((el) => {
    el.setAttribute('data-reveal-observed', '');
    revealObserver.observe(el);
  });
}

/* ── Parallax / Mouse-tracking glow ────────────────── */
document.addEventListener('mousemove', (e) => {
  const x = (e.clientX / window.innerWidth) * 100;
  const y = (e.clientY / window.innerHeight) * 100;
  document.documentElement.style.setProperty('--mouse-x', `${x}%`);
  document.documentElement.style.setProperty('--mouse-y', `${y}%`);
});

/* ── Smooth section-link scrolling ─────────────────── */
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener('click', (e) => {
    e.preventDefault();
    const target = document.querySelector(anchor.getAttribute('href'));
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});

/* ── Hero Particle Network ──────────────────────────── */
(function () {
  const canvas = document.getElementById('hero-particles');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let w, h, particles;
  const PARTICLE_COUNT = 60;
  const CONNECT_DIST   = 130;
  const SPEED          = 0.35;

  function resize() {
    w = canvas.width  = canvas.offsetWidth;
    h = canvas.height = canvas.offsetHeight;
  }

  class Particle {
    constructor() {
      this.reset();
      this.y = Math.random() * h;
    }
    reset() {
      this.x  = Math.random() * w;
      this.y  = -10;
      this.vx = (Math.random() - 0.5) * SPEED;
      this.vy = Math.random() * 0.5 + 0.25;
      this.r  = Math.random() * 1.6 + 0.7;
      this.opacity = Math.random() * 0.4 + 0.15;
    }
    update() {
      this.x += this.vx;
      this.y += this.vy;
      if (this.y > h + 10 || this.x < -10 || this.x > w + 10) this.reset();
    }
    draw(ctx) {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(167, 139, 250, ${this.opacity})`;
      ctx.fill();
    }
  }

  function init() {
    particles = Array.from({ length: PARTICLE_COUNT }, () => new Particle());
    resize();
  }

  function draw() {
    ctx.clearRect(0, 0, w, h);

    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < CONNECT_DIST) {
          const alpha = (1 - dist / CONNECT_DIST) * 0.1;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(108, 92, 231, ${alpha})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
    }

    for (const p of particles) {
      p.update();
      p.draw(ctx);
    }

    requestAnimationFrame(draw);
  }

  window.addEventListener('resize', resize);
  init();
  draw();
})();

/* ── Parallax Claude Background Logo ────────────────── */
(function () {
  const bg = document.getElementById('hero-parallax-bg');
  if (!bg) return;

  const SPEED = 0.35; // slower = more depth

  function update() {
    const scrollY = window.scrollY;
    const heroSection = document.getElementById('section-1');
    if (!heroSection) return;

    const heroBottom = heroSection.offsetTop + heroSection.offsetHeight;

    // Only animate while hero is visible
    if (scrollY < heroBottom) {
      const translateY = scrollY * SPEED;
      bg.style.transform = `translateX(-50%) translateY(${translateY}px)`;
      bg.style.opacity = Math.max(0, 1 - (scrollY / heroSection.offsetHeight) * 1.2);
    }
  }

  window.addEventListener('scroll', update, { passive: true });
  update();
})();

/* ── Ready ─────────────────────────────────────────── */
console.log('%c Summer School %c AI & ML %c Ready',
  'color: #a78bfa; font-size: 1.2em; font-weight: bold;',
  'color: #00d2ff; font-size: 1.2em; font-weight: bold;',
  'color: #8888a0;');
