/* ============================================
   MEMPALACE — Main JavaScript
   Navigation, animations, utilities
   ============================================ */

// ── Navigation ──────────────────────────────
(function() {
  const nav = document.querySelector('.nav');
  const hamburger = document.querySelector('.hamburger');
  const mobileMenu = document.querySelector('.mobile-menu');

  if (!nav) return;

  // Scroll effect
  window.addEventListener('scroll', function() {
    if (window.scrollY > 20) {
      nav.classList.add('scrolled');
    } else {
      nav.classList.remove('scrolled');
    }
  }, { passive: true });

  // Mobile menu toggle
  if (hamburger && mobileMenu) {
    hamburger.addEventListener('click', function() {
      hamburger.classList.toggle('open');
      mobileMenu.classList.toggle('open');
    });

    // Close on link click
    mobileMenu.querySelectorAll('a').forEach(function(link) {
      link.addEventListener('click', function() {
        hamburger.classList.remove('open');
        mobileMenu.classList.remove('open');
      });
    });
  }

  // Active nav link
  const currentPath = window.location.pathname.replace(/\/$/, '').split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a, .mobile-menu a').forEach(function(link) {
    const href = link.getAttribute('href');
    if (!href) return;
    const linkFile = href.replace(/\/$/, '').split('/').pop();
    if (linkFile === currentPath || (currentPath === '' && linkFile === 'index.html')) {
      link.classList.add('active');
    }
  });
})();

// ── Scroll Reveal ───────────────────────────
(function() {
  const items = document.querySelectorAll('.reveal');
  if (!items.length) return;

  const observer = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  items.forEach(function(el) { observer.observe(el); });
})();

// ── Animated Score Bars ──────────────────────
(function() {
  const bars = document.querySelectorAll('.score-fill');
  if (!bars.length) return;

  const observer = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      if (entry.isIntersecting) {
        const fill = entry.target;
        const width = fill.dataset.width || '0';
        setTimeout(function() {
          fill.style.width = width + '%';
        }, 100);
        observer.unobserve(fill);
      }
    });
  }, { threshold: 0.3 });

  bars.forEach(function(bar) {
    bar.style.width = '0%';
    observer.observe(bar);
  });
})();

// ── Toast Notification ───────────────────────
window.showToast = function(message, type) {
  type = type || 'info';
  var existing = document.querySelector('.toast');
  if (existing) existing.remove();

  var toast = document.createElement('div');
  toast.className = 'toast ' + type;

  var icons = { success: '&#10003;', error: '&#10007;', info: '&#8505;' };
  toast.innerHTML = '<span>' + (icons[type] || icons.info) + '</span> ' + message;
  document.body.appendChild(toast);

  requestAnimationFrame(function() {
    requestAnimationFrame(function() {
      toast.classList.add('show');
    });
  });

  setTimeout(function() {
    toast.classList.remove('show');
    setTimeout(function() { toast.remove(); }, 400);
  }, 4000);
};

// ── Cookie Banner ────────────────────────────
(function() {
  var banner = document.getElementById('cookieBanner');
  if (!banner) return;

  if (!localStorage.getItem('mp_cookies_accepted')) {
    banner.classList.add('show');
  }

  var acceptBtn = document.getElementById('cookieAccept');
  var declineBtn = document.getElementById('cookieDecline');

  if (acceptBtn) {
    acceptBtn.addEventListener('click', function() {
      localStorage.setItem('mp_cookies_accepted', '1');
      banner.classList.remove('show');
    });
  }
  if (declineBtn) {
    declineBtn.addEventListener('click', function() {
      localStorage.setItem('mp_cookies_accepted', '0');
      banner.classList.remove('show');
    });
  }
})();

// ── Copy Code Blocks ─────────────────────────
document.querySelectorAll('.copy-btn').forEach(function(btn) {
  btn.addEventListener('click', function() {
    var block = btn.closest('.code-block');
    var code = block ? block.querySelector('pre') : null;
    if (!code) return;
    navigator.clipboard.writeText(code.textContent.trim()).then(function() {
      btn.textContent = 'Copied!';
      setTimeout(function() { btn.textContent = 'Copy'; }, 2000);
    }).catch(function() {
      btn.textContent = 'Failed';
      setTimeout(function() { btn.textContent = 'Copy'; }, 2000);
    });
  });
});

// ── Auth Guard (for dashboard) ───────────────
window.checkAuth = function() {
  var session = localStorage.getItem('mp_session');
  if (!session) {
    window.location.href = 'login.html';
    return null;
  }
  try { return JSON.parse(session); }
  catch(e) { return null; }
};

window.getSession = function() {
  try { return JSON.parse(localStorage.getItem('mp_session') || 'null'); }
  catch(e) { return null; }
};

window.setSession = function(data) {
  localStorage.setItem('mp_session', JSON.stringify(data));
};

window.clearSession = function() {
  localStorage.removeItem('mp_session');
};

window.logout = function() {
  clearSession();
  showToast('Signed out successfully', 'success');
  setTimeout(function() { window.location.href = 'login.html'; }, 800);
};

// ── Smooth anchor scroll ─────────────────────
document.querySelectorAll('a[href^="#"]').forEach(function(anchor) {
  anchor.addEventListener('click', function(e) {
    var href = anchor.getAttribute('href');
    if (href === '#') return;
    var target = document.querySelector(href);
    if (!target) return;
    e.preventDefault();
    var offset = 80;
    var y = target.getBoundingClientRect().top + window.pageYOffset - offset;
    window.scrollTo({ top: y, behavior: 'smooth' });
  });
});

// ── Update nav user state ────────────────────
(function() {
  var session = getSession && getSession();
  var loginBtn = document.getElementById('navLoginBtn');
  var userBtn = document.getElementById('navUserBtn');

  if (loginBtn && userBtn) {
    if (session) {
      loginBtn.style.display = 'none';
      userBtn.style.display = 'inline-flex';
      var label = session.name || session.email || (session.address ? session.address.slice(0, 6) + '...' : 'Account');
      userBtn.textContent = label;
    } else {
      loginBtn.style.display = 'inline-flex';
      userBtn.style.display = 'none';
    }
  }
})();

// ── Particle canvas (hero) ───────────────────
(function() {
  var canvas = document.getElementById('heroCanvas');
  if (!canvas) return;

  var ctx = canvas.getContext('2d');
  var particles = [];
  var mouse = { x: -1000, y: -1000 };

  function resize() {
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
  }
  resize();
  window.addEventListener('resize', resize, { passive: true });

  canvas.addEventListener('mousemove', function(e) {
    var rect = canvas.getBoundingClientRect();
    mouse.x = e.clientX - rect.left;
    mouse.y = e.clientY - rect.top;
  });

  var colors = ['rgba(123,47,255,', 'rgba(0,245,255,', 'rgba(255,215,0,'];

  function createParticle() {
    return {
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      r: Math.random() * 1.5 + 0.5,
      color: colors[Math.floor(Math.random() * colors.length)],
      alpha: Math.random() * 0.5 + 0.1,
    };
  }

  var count = Math.min(80, Math.floor(canvas.width * canvas.height / 8000));
  for (var i = 0; i < count; i++) particles.push(createParticle());

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    particles.forEach(function(p) {
      p.x += p.vx;
      p.y += p.vy;

      if (p.x < 0) p.x = canvas.width;
      if (p.x > canvas.width) p.x = 0;
      if (p.y < 0) p.y = canvas.height;
      if (p.y > canvas.height) p.y = 0;

      // Mouse repulsion
      var dx = p.x - mouse.x;
      var dy = p.y - mouse.y;
      var dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 100) {
        var force = (100 - dist) / 100;
        p.x += dx / dist * force * 2;
        p.y += dy / dist * force * 2;
      }

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = p.color + p.alpha + ')';
      ctx.fill();
    });

    // Draw connecting lines
    for (var i = 0; i < particles.length; i++) {
      for (var j = i + 1; j < particles.length; j++) {
        var dx = particles[i].x - particles[j].x;
        var dy = particles[i].y - particles[j].y;
        var d = Math.sqrt(dx * dx + dy * dy);
        if (d < 120) {
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = 'rgba(123,47,255,' + (0.08 * (1 - d / 120)) + ')';
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
    }

    requestAnimationFrame(draw);
  }

  draw();
})();
