/* ============================================
   MEMPALACE — Authentication Logic
   Email/password via localStorage (demo)
   ============================================ */

(function() {
  'use strict';

  // Storage key for users DB
  var USERS_KEY = 'mp_users';
  var SESSION_KEY = 'mp_session';

  // ── Helpers ──────────────────────────────────
  function getUsers() {
    try { return JSON.parse(localStorage.getItem(USERS_KEY) || '[]'); }
    catch(e) { return []; }
  }

  function saveUsers(users) {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  }

  function hashSimple(str) {
    // Simple client-side obfuscation (not secure — demo only)
    var hash = 0;
    for (var i = 0; i < str.length; i++) {
      var chr = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + chr;
      hash |= 0;
    }
    return 'mp_' + Math.abs(hash).toString(16);
  }

  function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  function validatePassword(pw) {
    return pw && pw.length >= 8;
  }

  function showFieldError(inputId, message) {
    var input = document.getElementById(inputId);
    var err = document.getElementById(inputId + 'Error');
    if (input) input.style.borderColor = '#FF6B6B';
    if (err) { err.textContent = message; err.classList.add('show'); }
  }

  function clearFieldError(inputId) {
    var input = document.getElementById(inputId);
    var err = document.getElementById(inputId + 'Error');
    if (input) input.style.borderColor = '';
    if (err) { err.classList.remove('show'); }
  }

  function clearAllErrors() {
    document.querySelectorAll('.form-error').forEach(function(el) {
      el.classList.remove('show');
    });
    document.querySelectorAll('.form-input').forEach(function(el) {
      el.style.borderColor = '';
    });
  }

  // ── Tab switching ─────────────────────────────
  var tabs = document.querySelectorAll('.auth-tab');
  var panels = document.querySelectorAll('.auth-panel');

  tabs.forEach(function(tab) {
    tab.addEventListener('click', function() {
      var target = tab.dataset.tab;
      tabs.forEach(function(t) { t.classList.remove('active'); });
      panels.forEach(function(p) { p.classList.remove('active'); });
      tab.classList.add('active');
      var panel = document.getElementById('panel-' + target);
      if (panel) panel.classList.add('active');
      clearAllErrors();
    });
  });

  // ── Password visibility toggle ────────────────
  document.querySelectorAll('.toggle-pass').forEach(function(btn) {
    btn.addEventListener('click', function() {
      var input = btn.previousElementSibling;
      if (!input) {
        input = btn.parentElement.querySelector('input');
      }
      if (!input) return;
      if (input.type === 'password') {
        input.type = 'text';
        btn.textContent = '🙈';
      } else {
        input.type = 'password';
        btn.textContent = '👁';
      }
    });
  });

  // ── Register ──────────────────────────────────
  var registerForm = document.getElementById('registerForm');
  if (registerForm) {
    registerForm.addEventListener('submit', function(e) {
      e.preventDefault();
      clearAllErrors();

      var name = document.getElementById('regName').value.trim();
      var email = document.getElementById('regEmail').value.trim().toLowerCase();
      var password = document.getElementById('regPassword').value;
      var confirm = document.getElementById('regConfirm').value;

      var valid = true;

      if (!name || name.length < 2) {
        showFieldError('regName', 'Name must be at least 2 characters.');
        valid = false;
      }
      if (!validateEmail(email)) {
        showFieldError('regEmail', 'Please enter a valid email address.');
        valid = false;
      }
      if (!validatePassword(password)) {
        showFieldError('regPassword', 'Password must be at least 8 characters.');
        valid = false;
      }
      if (password !== confirm) {
        showFieldError('regConfirm', 'Passwords do not match.');
        valid = false;
      }
      if (!valid) return;

      var users = getUsers();
      var exists = users.find(function(u) { return u.email === email; });
      if (exists) {
        showFieldError('regEmail', 'An account with this email already exists.');
        return;
      }

      var btn = registerForm.querySelector('[type="submit"]');
      btn.classList.add('loading');

      setTimeout(function() {
        var user = {
          id: 'u_' + Date.now(),
          name: name,
          email: email,
          passwordHash: hashSimple(password),
          createdAt: new Date().toISOString(),
          type: 'email',
          plan: 'free',
          memories: 0,
        };
        users.push(user);
        saveUsers(users);

        var session = {
          id: user.id,
          name: user.name,
          email: user.email,
          type: 'email',
          plan: user.plan,
          loginAt: new Date().toISOString(),
        };
        localStorage.setItem(SESSION_KEY, JSON.stringify(session));

        btn.classList.remove('loading');
        showToast && showToast('Account created! Welcome to Mempalace.', 'success');
        setTimeout(function() {
          window.location.href = 'dashboard.html';
        }, 800);
      }, 900);
    });
  }

  // ── Login ─────────────────────────────────────
  var loginForm = document.getElementById('loginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', function(e) {
      e.preventDefault();
      clearAllErrors();

      var email = document.getElementById('loginEmail').value.trim().toLowerCase();
      var password = document.getElementById('loginPassword').value;

      if (!validateEmail(email)) {
        showFieldError('loginEmail', 'Please enter a valid email address.');
        return;
      }
      if (!password) {
        showFieldError('loginPassword', 'Please enter your password.');
        return;
      }

      var btn = loginForm.querySelector('[type="submit"]');
      btn.classList.add('loading');

      setTimeout(function() {
        var users = getUsers();
        var user = users.find(function(u) {
          return u.email === email && u.passwordHash === hashSimple(password);
        });

        btn.classList.remove('loading');

        if (!user) {
          showFieldError('loginPassword', 'Incorrect email or password.');
          return;
        }

        var session = {
          id: user.id,
          name: user.name,
          email: user.email,
          type: 'email',
          plan: user.plan,
          loginAt: new Date().toISOString(),
        };
        localStorage.setItem(SESSION_KEY, JSON.stringify(session));

        showToast && showToast('Welcome back, ' + user.name + '!', 'success');
        setTimeout(function() {
          window.location.href = 'dashboard.html';
        }, 700);
      }, 800);
    });
  }

  // ── Auto-redirect if already logged in ────────
  var session = null;
  try { session = JSON.parse(localStorage.getItem(SESSION_KEY)); } catch(e) {}
  if (session && (window.location.pathname.includes('login.html') || window.location.pathname.endsWith('login'))) {
    window.location.href = 'dashboard.html';
  }

  // ── Forgot password (demo) ────────────────────
  var forgotLink = document.getElementById('forgotLink');
  if (forgotLink) {
    forgotLink.addEventListener('click', function(e) {
      e.preventDefault();
      var email = document.getElementById('loginEmail').value.trim();
      if (!email || !validateEmail(email)) {
        showFieldError('loginEmail', 'Enter your email above, then click Forgot Password.');
        return;
      }
      showToast && showToast('Password reset instructions sent to ' + email, 'info');
    });
  }

})();
