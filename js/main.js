/* ============================================================
   MIKRONEXIS — Main JavaScript
   ============================================================ */

'use strict';

// ---- PRELOADER ----
window.addEventListener('load', () => {
  setTimeout(() => {
    const preloader = document.getElementById('preloader');
    if (preloader) {
      preloader.classList.add('hidden');
      setTimeout(() => preloader.remove(), 600);
    }
  }, 1800);
});

// ---- NAVBAR ----
const navbar = document.getElementById('navbar');
const navToggle = document.getElementById('navToggle');
const navLinks = document.getElementById('navLinks');

window.addEventListener('scroll', () => {
  if (window.scrollY > 60) {
    navbar.classList.add('scrolled');
  } else {
    navbar.classList.remove('scrolled');
  }
  updateActiveNavLink();
  toggleBackToTop();
});

navToggle.addEventListener('click', () => {
  navLinks.classList.toggle('open');
  // Animate hamburger to X
  const spans = navToggle.querySelectorAll('span');
  if (navLinks.classList.contains('open')) {
    spans[0].style.transform = 'translateY(7px) rotate(45deg)';
    spans[1].style.opacity = '0';
    spans[2].style.transform = 'translateY(-7px) rotate(-45deg)';
  } else {
    spans[0].style.transform = '';
    spans[1].style.opacity = '';
    spans[2].style.transform = '';
  }
});

// Close nav when a link is clicked (mobile)
navLinks.querySelectorAll('.nav-link, .nav-cta-btn').forEach(link => {
  link.addEventListener('click', () => {
    navLinks.classList.remove('open');
    const spans = navToggle.querySelectorAll('span');
    spans[0].style.transform = '';
    spans[1].style.opacity = '';
    spans[2].style.transform = '';
  });
});

// Close nav on outside click
document.addEventListener('click', (e) => {
  if (!navbar.contains(e.target) && navLinks.classList.contains('open')) {
    navLinks.classList.remove('open');
    const spans = navToggle.querySelectorAll('span');
    spans[0].style.transform = '';
    spans[1].style.opacity = '';
    spans[2].style.transform = '';
  }
});

// ---- ACTIVE NAV LINK ON SCROLL ----
function updateActiveNavLink() {
  const sections = document.querySelectorAll('section[id]');
  const scrollY = window.scrollY + 120;

  sections.forEach(section => {
    const sectionTop = section.offsetTop;
    const sectionHeight = section.offsetHeight;
    const sectionId = section.getAttribute('id');
    const navLink = document.querySelector(`.nav-link[href="#${sectionId}"]`);

    if (navLink) {
      if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
        document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
        navLink.classList.add('active');
      }
    }
  });
}

// ---- SMOOTH SCROLL ----
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    const target = document.querySelector(this.getAttribute('href'));
    if (target) {
      e.preventDefault();
      const offset = 80;
      const top = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  });
});

// ---- AOS (ANIMATE ON SCROLL) ----
function initAOS() {
  const elements = document.querySelectorAll('[data-aos]');
  const delays = { '100': 100, '200': 200, '300': 300, '400': 400, '500': 500, '600': 600 };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const delay = el.getAttribute('data-aos-delay');
        const ms = delays[delay] || 0;
        setTimeout(() => {
          el.classList.add('aos-animate');
        }, ms);
        observer.unobserve(el);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -60px 0px' });

  elements.forEach(el => observer.observe(el));
}

// ---- COUNTER ANIMATION ----
function animateCounter(el, target, duration = 2000) {
  let start = 0;
  const step = target / (duration / 16);
  const timer = setInterval(() => {
    start += step;
    if (start >= target) {
      el.textContent = target;
      clearInterval(timer);
    } else {
      el.textContent = Math.floor(start);
    }
  }, 16);
}

function initCounters() {
  const counters = document.querySelectorAll('.stat-number');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const target = parseInt(el.getAttribute('data-target'));
        animateCounter(el, target);
        observer.unobserve(el);
      }
    });
  }, { threshold: 0.5 });

  counters.forEach(c => observer.observe(c));
}

// ---- PARTICLES ----
function initParticles() {
  const container = document.getElementById('heroParticles');
  if (!container) return;

  const particleCount = 30;

  for (let i = 0; i < particleCount; i++) {
    const p = document.createElement('div');
    p.style.cssText = `
      position: absolute;
      width: ${Math.random() * 3 + 1}px;
      height: ${Math.random() * 3 + 1}px;
      background: ${Math.random() > 0.5 ? 'rgba(0,180,219,0.5)' : 'rgba(46,204,113,0.4)'};
      border-radius: 50%;
      left: ${Math.random() * 100}%;
      top: ${Math.random() * 100}%;
      animation: particleFloat ${Math.random() * 8 + 6}s ease-in-out infinite;
      animation-delay: ${Math.random() * 4}s;
    `;
    container.appendChild(p);
  }

  // Add keyframe if not present
  if (!document.getElementById('particleStyle')) {
    const style = document.createElement('style');
    style.id = 'particleStyle';
    style.textContent = `
      @keyframes particleFloat {
        0%, 100% { transform: translateY(0) translateX(0); opacity: 0.4; }
        25% { transform: translateY(-${Math.random() * 30 + 15}px) translateX(${Math.random() * 20 - 10}px); opacity: 0.8; }
        75% { transform: translateY(${Math.random() * 20 + 10}px) translateX(${Math.random() * 20 - 10}px); opacity: 0.3; }
      }
    `;
    document.head.appendChild(style);
  }
}

// ---- BACK TO TOP ----
const backToTop = document.getElementById('backToTop');

function toggleBackToTop() {
  if (window.scrollY > 400) {
    backToTop.classList.add('visible');
  } else {
    backToTop.classList.remove('visible');
  }
}

backToTop.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

// ---- FOOTER YEAR ----
const footerYear = document.getElementById('footerYear');
if (footerYear) footerYear.textContent = new Date().getFullYear();

// ---- CONTACT FORM ----
const contactForm = document.getElementById('contactForm');

if (contactForm) {
  contactForm.addEventListener('submit', function (e) {
    e.preventDefault();

    const fields = [
      { id: 'firstName', msg: 'Please enter your first name.' },
      { id: 'lastName',  msg: 'Please enter your last name.' },
      { id: 'email',     msg: 'Please enter a valid email address.', type: 'email' },
      { id: 'message',   msg: 'Please describe your project.' },
    ];

    let valid = true;

    // Clear previous errors
    contactForm.querySelectorAll('.field-error').forEach(e => {
      e.textContent = '';
      e.classList.remove('visible');
    });
    contactForm.querySelectorAll('input, textarea, select').forEach(el => {
      el.classList.remove('error');
    });

    fields.forEach(field => {
      const el = document.getElementById(field.id);
      const errorEl = el.parentElement.querySelector('.field-error');

      let hasError = false;
      if (!el.value.trim()) {
        hasError = true;
      } else if (field.type === 'email') {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(el.value.trim())) {
          hasError = true;
        }
      }

      if (hasError) {
        valid = false;
        el.classList.add('error');
        if (errorEl) {
          errorEl.textContent = field.msg;
          errorEl.classList.add('visible');
        }
      }
    });

    if (!valid) return;

    // Simulate submission
    const submitBtn = document.getElementById('submitBtn');
    const btnText = submitBtn.querySelector('.btn-text');
    const btnLoading = submitBtn.querySelector('.btn-loading');
    const btnIcon = submitBtn.querySelector('.fa-paper-plane');
    const formSuccess = document.getElementById('formSuccess');

    submitBtn.disabled = true;
    if (btnText) btnText.style.display = 'none';
    if (btnLoading) btnLoading.style.display = 'inline-flex';
    if (btnIcon) btnIcon.style.display = 'none';

    setTimeout(() => {
      submitBtn.style.display = 'none';
      if (formSuccess) formSuccess.style.display = 'block';
      contactForm.reset();
    }, 2000);
  });

  // Real-time validation
  contactForm.querySelectorAll('input[required], textarea[required]').forEach(el => {
    el.addEventListener('blur', function () {
      const errorEl = this.parentElement.querySelector('.field-error');
      if (!this.value.trim()) {
        this.classList.add('error');
        if (errorEl) {
          errorEl.textContent = 'This field is required.';
          errorEl.classList.add('visible');
        }
      } else {
        this.classList.remove('error');
        if (errorEl) {
          errorEl.textContent = '';
          errorEl.classList.remove('visible');
        }
      }
    });

    el.addEventListener('input', function () {
      if (this.value.trim()) {
        this.classList.remove('error');
        const errorEl = this.parentElement.querySelector('.field-error');
        if (errorEl) {
          errorEl.textContent = '';
          errorEl.classList.remove('visible');
        }
      }
    });
  });
}

// ---- SERVICE CARDS TILT (subtle) ----
document.querySelectorAll('.service-card').forEach(card => {
  card.addEventListener('mousemove', function (e) {
    const rect = this.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    const tiltX = (y / rect.height) * 6;
    const tiltY = -(x / rect.width) * 6;
    this.style.transform = `translateY(-8px) rotateX(${tiltX}deg) rotateY(${tiltY}deg)`;
  });
  card.addEventListener('mouseleave', function () {
    this.style.transform = '';
  });
});

// ---- PORTFOLIO FILTER ----
function initPortfolioFilter() {
  const filterBtns = document.querySelectorAll('.filter-btn');
  const cards = document.querySelectorAll('.portfolio-card');

  if (!filterBtns.length) return;

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      // Update active button
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filter = btn.getAttribute('data-filter');

      cards.forEach(card => {
        const categories = card.getAttribute('data-category') || '';
        if (filter === 'all' || categories.includes(filter)) {
          card.classList.remove('hidden');
          card.style.animation = 'none';
          // Trigger reflow for re-animation
          void card.offsetWidth;
          card.style.animation = '';
        } else {
          card.classList.add('hidden');
        }
      });
    });
  });
}

// ---- INIT ----
document.addEventListener('DOMContentLoaded', () => {
  initAOS();
  initCounters();
  initParticles();
  initPortfolioFilter();
});
