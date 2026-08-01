/* ============================================
   MEMPALACE — Dashboard Logic
   ============================================ */

(function() {
  'use strict';

  var SESSION_KEY = 'mp_session';

  // ── Auth guard ────────────────────────────────
  var session = null;
  try { session = JSON.parse(localStorage.getItem(SESSION_KEY)); } catch(e) {}

  if (!session) {
    window.location.href = 'login.html';
    return;
  }

  // ── Populate user info ─────────────────────────
  var nameEls = document.querySelectorAll('[data-user="name"]');
  var emailEls = document.querySelectorAll('[data-user="email"]');
  var avatarEls = document.querySelectorAll('[data-user="avatar"]');
  var typeEls = document.querySelectorAll('[data-user="type"]');

  var displayName = session.name || session.email || ('Wallet ' + (session.address || '').slice(0, 8));
  var initial = displayName.charAt(0).toUpperCase();

  nameEls.forEach(function(el) { el.textContent = displayName; });
  emailEls.forEach(function(el) { el.textContent = session.email || session.address || ''; });
  avatarEls.forEach(function(el) { el.textContent = initial; });
  typeEls.forEach(function(el) {
    var labels = { email: 'Email Account', wallet: 'Wallet Account', metamask: 'Metamask', phantom: 'Phantom' };
    el.textContent = labels[session.walletType || session.type] || session.type;
  });

  // ── Logout ──────────────────────────────────────
  document.querySelectorAll('[data-action="logout"]').forEach(function(btn) {
    btn.addEventListener('click', function() {
      localStorage.removeItem(SESSION_KEY);
      window.showToast && window.showToast('Signed out', 'info');
      setTimeout(function() { window.location.href = 'login.html'; }, 700);
    });
  });

  // ── Demo memory data ────────────────────────────
  var demoMemories = [
    {
      id: 1,
      tag: 'decision',
      text: 'Switched from REST to GraphQL for the API layer after benchmarking latency with 10k concurrent requests. GraphQL reduced over-fetching by 68%.',
      date: '2024-12-15',
      wing: 'Projects',
      room: 'Architecture',
    },
    {
      id: 2,
      tag: 'preference',
      text: 'Prefers TypeScript strict mode across all projects. ESLint with Airbnb config. No semicolons. Tabs = 2 spaces.',
      date: '2025-01-03',
      wing: 'Personal',
      room: 'Dev Setup',
    },
    {
      id: 3,
      tag: 'milestone',
      text: 'Shipped v2.0 of the platform with 99.97% uptime over 30 days. Zero critical bugs in production.',
      date: '2025-02-10',
      wing: 'Projects',
      room: 'Launches',
    },
    {
      id: 4,
      tag: 'problem',
      text: 'Memory leak in the worker pool caused 2GB RAM spike every 6h. Root cause: event listeners not cleaned up in WebSocket disconnect handler.',
      date: '2025-03-01',
      wing: 'Projects',
      room: 'Bugs',
    },
    {
      id: 5,
      tag: 'decision',
      text: 'Chose Postgres over MongoDB for the new service. Complex joins and ACID compliance outweigh document flexibility for this use case.',
      date: '2025-03-20',
      wing: 'Projects',
      room: 'Architecture',
    },
    {
      id: 6,
      tag: 'preference',
      text: 'Morning deep work 7-11am. No meetings before noon. Slack notifications off during focus blocks.',
      date: '2025-04-05',
      wing: 'Personal',
      room: 'Work Style',
    },
  ];

  // ── Search functionality ─────────────────────────
  var searchInput = document.getElementById('searchInput');
  var searchBtn = document.getElementById('searchBtn');
  var resultsContainer = document.getElementById('memoryResults');

  function renderResults(results, query) {
    if (!resultsContainer) return;
    resultsContainer.innerHTML = '';

    if (!results.length) {
      resultsContainer.innerHTML = '<p style="color:var(--text-muted);font-size:0.9rem;padding:1rem 0;">No memories found for "' + escapeHtml(query) + '". Try a different search term.</p>';
      return;
    }

    results.forEach(function(mem) {
      var highlight = function(text) {
        if (!query) return escapeHtml(text);
        var re = new RegExp('(' + escapeRegex(query) + ')', 'gi');
        return escapeHtml(text).replace(re, '<mark style="background:rgba(0,245,255,0.2);color:var(--cyan);border-radius:3px;padding:0 2px;">$1</mark>');
      };

      var el = document.createElement('div');
      el.className = 'memory-result';
      el.innerHTML = '<div class="memory-result-meta">' +
        '<span class="memory-tag tag-' + mem.tag + '">' + mem.tag + '</span>' +
        '<span class="text-muted text-sm">' + mem.wing + ' / ' + mem.room + '</span>' +
        '</div>' +
        '<div class="memory-result-text">' + highlight(mem.text) + '</div>' +
        '<div class="memory-result-date" style="margin-top:0.5rem;">' + formatDate(mem.date) + '</div>';
      resultsContainer.appendChild(el);
    });
  }

  function doSearch() {
    if (!searchInput || !resultsContainer) return;
    var query = searchInput.value.trim();

    if (!query) {
      resultsContainer.innerHTML = '<p style="color:var(--text-muted);font-size:0.9rem;padding:1rem 0;">Type a query above to search your memory palace.</p>';
      return;
    }

    // Simulate search delay
    resultsContainer.innerHTML = '<p style="color:var(--text-muted);font-size:0.9rem;padding:1rem 0;">Searching palace...</p>';

    setTimeout(function() {
      var q = query.toLowerCase();
      var results = demoMemories.filter(function(m) {
        return m.text.toLowerCase().includes(q) ||
               m.tag.toLowerCase().includes(q) ||
               m.room.toLowerCase().includes(q) ||
               m.wing.toLowerCase().includes(q);
      });
      renderResults(results, query);
      updateSearchStats(results.length, query);
    }, 400);
  }

  if (searchBtn) searchBtn.addEventListener('click', doSearch);
  if (searchInput) {
    searchInput.addEventListener('keydown', function(e) {
      if (e.key === 'Enter') doSearch();
    });
  }

  // Show all memories on load
  if (resultsContainer) {
    renderResults(demoMemories, '');
  }

  // ── Stats update ──────────────────────────────────
  function updateSearchStats(count, query) {
    var statsEl = document.getElementById('searchStats');
    if (!statsEl) return;
    statsEl.textContent = count + ' result' + (count !== 1 ? 's' : '') + ' for "' + query + '"';
    statsEl.style.display = count >= 0 ? 'block' : 'none';
  }

  // ── Recent activity ───────────────────────────────
  var activityList = document.getElementById('activityList');
  if (activityList) {
    var activities = [
      { icon: '&#128269;', text: 'Searched "GraphQL migration"', time: '2 min ago' },
      { icon: '&#128190;', text: 'Mined 847 new memories from chat exports', time: '1 hour ago' },
      { icon: '&#128279;', text: 'Connected Claude via MCP', time: '3 hours ago' },
      { icon: '&#128200;', text: 'Palace sync complete. 12,483 memories indexed.', time: 'Yesterday' },
      { icon: '&#128218;', text: 'Added wing: "Side Projects"', time: '2 days ago' },
    ];

    activities.forEach(function(a) {
      var li = document.createElement('div');
      li.style.cssText = 'display:flex;gap:0.75rem;align-items:flex-start;padding:0.75rem 0;border-bottom:1px solid var(--border);';
      li.innerHTML = '<span style="font-size:1.1rem;flex-shrink:0;">' + a.icon + '</span>' +
        '<div style="flex:1;">' +
          '<p style="font-size:0.88rem;color:var(--text-primary);margin:0 0 0.2rem;">' + a.text + '</p>' +
          '<span style="font-size:0.75rem;color:var(--text-muted);">' + a.time + '</span>' +
        '</div>';
      activityList.appendChild(li);
    });
  }

  // ── Animate stats counters ────────────────────────
  function animateCounter(el, target) {
    var start = 0;
    var duration = 1500;
    var startTime = null;
    var suffix = el.dataset.suffix || '';
    var comma = el.dataset.comma;

    function step(timestamp) {
      if (!startTime) startTime = timestamp;
      var elapsed = timestamp - startTime;
      var progress = Math.min(elapsed / duration, 1);
      var eased = 1 - Math.pow(1 - progress, 3);
      var val = Math.round(start + (target - start) * eased);
      el.textContent = (comma ? val.toLocaleString() : val) + suffix;
      if (progress < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  document.querySelectorAll('[data-counter]').forEach(function(el) {
    var target = parseInt(el.dataset.counter, 10);
    if (isNaN(target)) return;
    var observer = new IntersectionObserver(function(entries) {
      if (entries[0].isIntersecting) {
        animateCounter(el, target);
        observer.disconnect();
      }
    });
    observer.observe(el);
  });

  // ── Sidebar navigation ────────────────────────────
  var sidebarLinks = document.querySelectorAll('.sidebar-link[data-view]');
  var views = document.querySelectorAll('[data-panel]');

  sidebarLinks.forEach(function(link) {
    link.addEventListener('click', function() {
      var view = link.dataset.view;
      sidebarLinks.forEach(function(l) { l.classList.remove('active'); });
      link.classList.add('active');

      views.forEach(function(v) {
        v.style.display = v.dataset.panel === view ? 'block' : 'none';
      });
    });
  });

  // ── Utilities ─────────────────────────────────────
  function escapeHtml(str) {
    var d = document.createElement('div');
    d.textContent = str;
    return d.innerHTML;
  }

  function escapeRegex(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  function formatDate(dateStr) {
    try {
      return new Date(dateStr).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    } catch(e) { return dateStr; }
  }

})();
