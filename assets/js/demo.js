/* ============================================
   MEMPALACE — Demo Page Logic
   demo.js — interactive panels
   ============================================ */

(function () {
  'use strict';

  /* ─── Tab Switching ─────────────────────────── */
  const tabs = document.querySelectorAll('.demo-tab');
  const panels = document.querySelectorAll('.demo-panel');

  tabs.forEach(function (tab) {
    tab.addEventListener('click', function () {
      const target = tab.dataset.tab;
      tabs.forEach(function (t) {
        t.classList.remove('active');
        t.setAttribute('aria-selected', 'false');
      });
      panels.forEach(function (p) {
        p.classList.remove('active');
        p.hidden = true;
      });
      tab.classList.add('active');
      tab.setAttribute('aria-selected', 'true');
      var panel = document.getElementById('panel-' + target);
      if (panel) {
        panel.classList.add('active');
        panel.hidden = false;
      }
      // Lazy-init panels
      if (target === 'palace' && !palaceBuilt) { buildPalaceTree(); palaceBuilt = true; }
      if (target === 'bench'  && !benchBuilt)  { buildBenchChart(); benchBuilt = true; }
    });
  });

  /* ════════════════════════════════════════════
     PANEL 1 — MEMORY SEARCH
  ════════════════════════════════════════════ */
  var MEMORIES = [
    {
      text: 'Decided to use Next.js 14 with TypeScript for the frontend and FastAPI on Python 3.11 for the backend. Rationale: Next.js server components reduce client JS bundle, FastAPI async is 3× faster for our data access patterns.',
      score: 0.97,
      wing: 'Projects', hall: 'Decisions', room: 'TechStack-2024',
      type: 'decision', date: '2024-11-03'
    },
    {
      text: 'Prefer Tailwind CSS over CSS Modules for all new projects. Convention: utility-first, no custom class names unless strictly necessary.',
      score: 0.91,
      wing: 'Projects', hall: 'Preferences', room: 'CodeStyle',
      type: 'preference', date: '2024-10-18'
    },
    {
      text: 'Product roadmap Q1 2025: launch public beta by March 1, ship mobile app by April 15, hit 1000 DAU by May.',
      score: 0.88,
      wing: 'Projects', hall: 'Milestones', room: 'Roadmap-Q1',
      type: 'milestone', date: '2024-12-20'
    },
    {
      text: 'Encountered cold-start latency on AWS Lambda for the inference endpoint — p99 ~2.8 s. Mitigation: keep-warm cron every 4 min + Provisioned Concurrency for prod.',
      score: 0.85,
      wing: 'Projects', hall: 'Problems', room: 'API-Performance',
      type: 'problem', date: '2025-01-07'
    },
    {
      text: 'API rate-limiting issue: third-party data provider caps at 60 req/min. Workaround: request batching + local cache with 5-min TTL. Long-term: negotiate higher tier.',
      score: 0.82,
      wing: 'Projects', hall: 'Problems', room: 'API-Limits',
      type: 'problem', date: '2025-01-14'
    },
    {
      text: 'Alice owns the auth module. Responsibilities: JWT implementation, refresh token rotation, OAuth2 integration (Google, GitHub). She prefers pair-programming sessions on Fridays.',
      score: 0.94,
      wing: 'People', hall: 'Team', room: 'Alice',
      type: 'person', date: '2024-09-12'
    },
    {
      text: 'Code style preferences: 2-space indent, single quotes, no semicolons in JS/TS, snake_case for Python, kebab-case for CSS class names.',
      score: 0.89,
      wing: 'Projects', hall: 'Preferences', room: 'CodeStyle',
      type: 'preference', date: '2024-10-05'
    },
    {
      text: 'Prefer async/await over .then() chains everywhere. Enforce via ESLint rule. No raw Promise constructors unless wrapping a callback API.',
      score: 0.83,
      wing: 'Projects', hall: 'Preferences', room: 'CodeStyle',
      type: 'preference', date: '2024-10-18'
    }
  ];

  var QUERY_SEEDS = {
    'tech stack': [0, 1, 6],
    'stack':      [0, 1, 6],
    'code style': [1, 6, 7],
    'code':       [1, 6, 7],
    'preferences':[1, 6, 7],
    'roadmap':    [2],
    'product':    [2],
    'api':        [3, 4],
    'problem':    [3, 4],
    'latency':    [3],
    'alice':      [5],
    'team':       [5],
    'auth':       [5],
    'default':    [0, 2, 5, 3]
  };

  function getResults(query) {
    var q = query.toLowerCase();
    var indices = QUERY_SEEDS['default'];
    var keys = Object.keys(QUERY_SEEDS).filter(function (k) { return k !== 'default'; });
    for (var i = 0; i < keys.length; i++) {
      if (q.indexOf(keys[i]) !== -1) {
        indices = QUERY_SEEDS[keys[i]];
        break;
      }
    }
    return indices.map(function (idx) { return MEMORIES[idx]; }).filter(Boolean);
  }

  function renderResultCard(mem, delay) {
    var card = document.createElement('article');
    card.className = 'result-card';
    card.style.animationDelay = (delay * 80) + 'ms';
    var pctScore = Math.round(mem.score * 100);
    card.innerHTML =
      '<p class="result-card-text">' + escHtml(mem.text) + '</p>' +
      '<span class="result-card-score">' + pctScore + '% match</span>' +
      '<div class="result-card-meta">' +
        '<span class="result-meta-tag tag-wing">' + escHtml(mem.wing) + '</span>' +
        '<span class="result-meta-tag tag-hall">' + escHtml(mem.hall) + '</span>' +
        '<span class="result-meta-tag tag-room">' + escHtml(mem.room) + '</span>' +
        '<span class="result-meta-tag tag-type">' + escHtml(mem.type) + '</span>' +
        '<span class="result-meta-tag tag-date">' + escHtml(mem.date) + '</span>' +
      '</div>';
    return card;
  }

  function renderSkeletons(count) {
    var frag = document.createDocumentFragment();
    for (var i = 0; i < count; i++) {
      var card = document.createElement('div');
      card.className = 'result-card skeleton';
      card.innerHTML =
        '<div><div class="skeleton-line"></div><div class="skeleton-line"></div></div>' +
        '<div><div class="skeleton-line short"></div></div>' +
        '<div class="result-card-meta" style="grid-column:1/-1">' +
          '<div class="skeleton-line short" style="width:80px;height:22px;border-radius:999px;"></div>' +
          '<div class="skeleton-line short" style="width:60px;height:22px;border-radius:999px;"></div>' +
        '</div>';
      frag.appendChild(card);
    }
    return frag;
  }

  function runSearch() {
    var query = searchInput.value.trim();
    if (!query) return;
    searchClear.hidden = false;

    resultsEl.innerHTML = '';
    statsEl.hidden = true;
    resultsEl.appendChild(renderSkeletons(3));

    var t0 = Date.now();
    var delay = 420 + Math.random() * 280;
    setTimeout(function () {
      var results = getResults(query);
      resultsEl.innerHTML = '';
      if (results.length === 0) {
        resultsEl.innerHTML = '<div class="demo-search-empty"><p>No memories found. Try a different query.</p></div>';
        return;
      }
      results.forEach(function (mem, i) {
        resultsEl.appendChild(renderResultCard(mem, i));
      });
      var elapsed = Date.now() - t0;
      statsEl.hidden = false;
      document.getElementById('statsCount').textContent = results.length + ' result' + (results.length !== 1 ? 's' : '');
      document.getElementById('statsTime').textContent = elapsed + ' ms';
    }, delay);
  }

  var searchInput = document.getElementById('searchInput');
  var searchBtn   = document.getElementById('searchBtn');
  var searchClear = document.getElementById('searchClear');
  var resultsEl   = document.getElementById('searchResults');
  var statsEl     = document.getElementById('searchStats');

  if (searchBtn) {
    searchBtn.addEventListener('click', runSearch);
    searchInput.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') runSearch();
    });
    searchClear.addEventListener('click', function () {
      searchInput.value = '';
      searchClear.hidden = true;
      resultsEl.innerHTML = '<div class="demo-search-empty"><svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg><p>Run a search to see how Mempalace finds memories across your palace.</p></div>';
      statsEl.hidden = true;
      searchInput.focus();
    });
    document.querySelectorAll('.demo-chip').forEach(function (chip) {
      chip.addEventListener('click', function () {
        searchInput.value = chip.dataset.query;
        searchClear.hidden = false;
        runSearch();
      });
    });
  }

  /* ════════════════════════════════════════════
     PANEL 2 — PALACE EXPLORER
  ════════════════════════════════════════════ */
  var palaceBuilt = false;

  var PALACE_DATA = [
    {
      id: 'wing-projects', label: 'Projects Wing', icon: '&#128193;', count: 184, type: 'wing',
      children: [
        {
          id: 'hall-decisions', label: 'Decisions Hall', icon: '&#9878;', count: 42, type: 'hall',
          children: [
            { id: 'room-techstack', label: 'TechStack-2024', icon: '&#128308;', count: 6, type: 'room',
              memories: [MEMORIES[0]] },
            { id: 'room-infra', label: 'Infrastructure', icon: '&#128308;', count: 8, type: 'room',
              memories: [{
                text: 'Chose AWS over GCP. Rationale: existing team familiarity + better Lambda cold-start with SnapStart for Java. Revisit if Python latency stays high.',
                score: 0.88, wing: 'Projects', hall: 'Decisions', room: 'Infrastructure', type: 'decision', date: '2024-11-20'
              }] }
          ]
        },
        {
          id: 'hall-preferences', label: 'Preferences Hall', icon: '&#9733;', count: 51, type: 'hall',
          children: [
            { id: 'room-codestyle', label: 'CodeStyle', icon: '&#128308;', count: 14, type: 'room',
              memories: [MEMORIES[1], MEMORIES[6], MEMORIES[7]] },
            { id: 'room-tooling', label: 'Tooling', icon: '&#128308;', count: 9, type: 'room',
              memories: [{
                text: 'Prefer pnpm over npm/yarn for monorepos. Use Turborepo for build caching. ESLint + Prettier required in every TS project.',
                score: 0.86, wing: 'Projects', hall: 'Preferences', room: 'Tooling', type: 'preference', date: '2024-09-30'
              }] }
          ]
        },
        {
          id: 'hall-milestones', label: 'Milestones Hall', icon: '&#127937;', count: 28, type: 'hall',
          children: [
            { id: 'room-roadmap', label: 'Roadmap-Q1', icon: '&#128308;', count: 5, type: 'room',
              memories: [MEMORIES[2]] }
          ]
        },
        {
          id: 'hall-problems', label: 'Problems Hall', icon: '&#9888;', count: 63, type: 'hall',
          children: [
            { id: 'room-api-perf', label: 'API-Performance', icon: '&#128308;', count: 7, type: 'room',
              memories: [MEMORIES[3]] },
            { id: 'room-api-limits', label: 'API-Limits', icon: '&#128308;', count: 4, type: 'room',
              memories: [MEMORIES[4]] }
          ]
        }
      ]
    },
    {
      id: 'wing-people', label: 'People Wing', icon: '&#128101;', count: 63, type: 'wing',
      children: [
        {
          id: 'hall-team', label: 'Team Hall', icon: '&#128100;', count: 38, type: 'hall',
          children: [
            { id: 'room-alice', label: 'Alice', icon: '&#128308;', count: 12, type: 'room',
              memories: [MEMORIES[5]] },
            { id: 'room-bob', label: 'Bob', icon: '&#128308;', count: 9, type: 'room',
              memories: [{
                text: 'Bob owns the data pipeline. He prefers dbt for transformations and runs all ML experiments in Jupyter before productionising. Timezone: UTC+1.',
                score: 0.91, wing: 'People', hall: 'Team', room: 'Bob', type: 'person', date: '2024-09-15'
              }] }
          ]
        },
        {
          id: 'hall-stakeholders', label: 'Stakeholders Hall', icon: '&#128188;', count: 25, type: 'hall',
          children: [
            { id: 'room-investors', label: 'Investors', icon: '&#128308;', count: 4, type: 'room',
              memories: [{
                text: 'Lead investor Priya focuses on growth metrics, not revenue in early stage. Prefers weekly async updates in Notion. Key concern: retention at 30-day mark.',
                score: 0.89, wing: 'People', hall: 'Stakeholders', room: 'Investors', type: 'person', date: '2025-01-02'
              }] }
          ]
        }
      ]
    }
  ];

  var selectedRoomId = null;

  function buildTreeNode(node, depth) {
    var el = document.createElement('div');
    el.className = 'tree-node';
    el.id = 'tnode-' + node.id;

    var label = document.createElement('div');
    label.className = 'tree-node-label';

    var chevronHtml = node.children
      ? '<svg class="tree-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true"><polyline points="9 18 15 12 9 6"/></svg>'
      : '';

    label.innerHTML =
      '<span class="tree-node-icon">' + node.icon + '</span>' +
      '<span>' + escHtml(node.label) + '</span>' +
      '<span class="tree-count">' + node.count + '</span>' +
      chevronHtml;

    label.addEventListener('click', function () {
      if (node.children) {
        el.classList.toggle('open');
      }
      if (node.type === 'room') {
        document.querySelectorAll('.tree-node-label').forEach(function (l) { l.classList.remove('selected'); });
        label.classList.add('selected');
        selectedRoomId = node.id;
        showRoomDetail(node);
      }
    });

    el.appendChild(label);

    if (node.children) {
      var childrenEl = document.createElement('div');
      childrenEl.className = 'tree-children';
      node.children.forEach(function (child) {
        childrenEl.appendChild(buildTreeNode(child, depth + 1));
      });
      el.appendChild(childrenEl);
    }

    return el;
  }

  function showRoomDetail(room) {
    var detail = document.getElementById('palaceDetail');
    detail.innerHTML = '';

    var title = document.createElement('div');
    title.className = 'palace-detail-title';
    title.textContent = room.label;
    detail.appendChild(title);

    var path = document.createElement('div');
    path.className = 'palace-detail-path';
    path.textContent = findPath(room.id);
    detail.appendChild(path);

    if (room.memories && room.memories.length > 0) {
      room.memories.forEach(function (mem, i) {
        var memEl = document.createElement('div');
        memEl.className = 'detail-memory';
        memEl.style.animationDelay = (i * 60) + 'ms';
        memEl.innerHTML =
          '<div>' + escHtml(mem.text) + '</div>' +
          '<div class="detail-memory-meta">' +
            '<span class="result-meta-tag tag-type">' + escHtml(mem.type) + '</span>' +
            '<span class="result-meta-tag tag-date">' + escHtml(mem.date) + '</span>' +
          '</div>';
        detail.appendChild(memEl);
      });
    } else {
      var empty = document.createElement('p');
      empty.style.color = 'var(--text-muted)';
      empty.style.fontSize = '0.85rem';
      empty.textContent = 'No sample memories for this room.';
      detail.appendChild(empty);
    }
  }

  function findPath(id) {
    for (var w = 0; w < PALACE_DATA.length; w++) {
      var wing = PALACE_DATA[w];
      if (wing.id === id) return wing.label;
      for (var h = 0; h < (wing.children || []).length; h++) {
        var hall = wing.children[h];
        if (hall.id === id) return wing.label + ' › ' + hall.label;
        for (var r = 0; r < (hall.children || []).length; r++) {
          var room = hall.children[r];
          if (room.id === id) return wing.label + ' › ' + hall.label + ' › ' + room.label;
        }
      }
    }
    return id;
  }

  function buildPalaceTree() {
    var treeEl = document.getElementById('palaceTree');
    if (!treeEl) return;
    treeEl.innerHTML = '';
    PALACE_DATA.forEach(function (wing) {
      var node = buildTreeNode(wing, 0);
      node.classList.add('open');
      treeEl.appendChild(node);
    });
  }

  /* ════════════════════════════════════════════
     PANEL 3 — LIVE MINER
  ════════════════════════════════════════════ */
  var SAMPLE_TEXT =
    'User: Let\'s go with Next.js and TypeScript for the frontend. I prefer Tailwind over CSS Modules.\n' +
    'AI: Noted. For the backend we discussed FastAPI on Python 3.11.\n' +
    'User: Yes. Alice will own the auth module — JWT with refresh tokens. Bob handles the data pipeline.\n' +
    'AI: Got it. Main risk: cold-start latency on Lambda could hit 2 s+.\n' +
    'User: We hit 1000 beta signups milestone last Friday! Now we need to hit 5000 by March 1.\n' +
    'AI: Great milestone. I\'ll track the March target.';

  var EXTRACTED_MEMORIES = [
    { type: 'decision',   text: 'Use Next.js + TypeScript for frontend, FastAPI on Python 3.11 for backend.', aaak: 'DEC:stack>Next.js+TS/FastAPI-Py311 d:today' },
    { type: 'preference', text: 'Prefer Tailwind CSS over CSS Modules for all new projects.', aaak: 'PREF:css>tailwind!css-modules d:today' },
    { type: 'person',     text: 'Alice owns auth module — JWT with refresh tokens.', aaak: 'PPL:alice>own[auth/JWT+refresh] d:today' },
    { type: 'person',     text: 'Bob owns the data pipeline.', aaak: 'PPL:bob>own[data-pipeline] d:today' },
    { type: 'problem',    text: 'Risk: cold-start latency on Lambda may exceed 2 s.', aaak: 'PROB:lambda>cold-start~2s d:today' },
    { type: 'milestone',  text: 'Reached 1000 beta signups. Target: 5000 by March 1.', aaak: 'MILE:signups=1000>target:5000@Mar1 d:today' }
  ];

  var PIPELINE_STEPS = ['parse', 'classify', 'compress', 'store'];

  function resetPipeline() {
    PIPELINE_STEPS.forEach(function (s) {
      var el = document.getElementById('pstep-' + s);
      if (el) { el.classList.remove('active', 'done'); }
    });
  }

  function activateStep(name, done) {
    var el = document.getElementById('pstep-' + name);
    if (!el) return;
    if (done) {
      el.classList.remove('active');
      el.classList.add('done');
    } else {
      el.classList.add('active');
      el.classList.remove('done');
    }
  }

  function runMiner() {
    var text = document.getElementById('minerInput').value.trim();
    if (!text) {
      document.getElementById('minerInput').focus();
      return;
    }

    var resultsEl  = document.getElementById('minerResults');
    var compEl     = document.getElementById('minerCompression');
    var origTokens = Math.round(text.split(/\s+/).length * 1.3);
    var aaakTokens = Math.round(origTokens / 28);

    resultsEl.innerHTML = '<div class="miner-empty"><p style="color:var(--cyan)">Mining in progress…</p></div>';
    compEl.hidden = true;
    resetPipeline();

    var delays = [0, 600, 1200, 1900];

    PIPELINE_STEPS.forEach(function (step, i) {
      setTimeout(function () {
        resetPipeline();
        PIPELINE_STEPS.slice(0, i).forEach(function (s) { activateStep(s, true); });
        activateStep(step, false);
      }, delays[i]);
    });

    // Show memories one by one
    setTimeout(function () {
      resultsEl.innerHTML = '';
      EXTRACTED_MEMORIES.forEach(function (mem, i) {
        setTimeout(function () {
          var el = document.createElement('div');
          el.className = 'memory-extracted';
          el.style.animationDelay = '0ms';
          el.innerHTML =
            '<div class="memory-extracted-header">' +
              '<span class="memory-type-badge type-' + mem.type + '">' + mem.type + '</span>' +
            '</div>' +
            '<div class="memory-extracted-text">' + escHtml(mem.text) + '</div>' +
            '<div class="memory-extracted-aaak"><span class="aaak-label">AAAK:</span>' + escHtml(mem.aaak) + '</div>';
          resultsEl.appendChild(el);
        }, i * 220);
      });
    }, 2100);

    // Finish pipeline + show compression
    setTimeout(function () {
      PIPELINE_STEPS.forEach(function (s) { activateStep(s, true); });

      compEl.hidden = false;
      document.getElementById('compOriginal').textContent = origTokens + ' tokens';
      document.getElementById('compAaak').textContent     = aaakTokens + ' tokens';

      var pct = Math.round((aaakTokens / origTokens) * 100);
      var ratio = Math.round(origTokens / aaakTokens);
      document.getElementById('compAaakBar').style.width = pct + '%';
      document.getElementById('compRatio').textContent   = ratio + '× compression — load months of context in ~' + (aaakTokens * 6) + ' chars';
    }, 3300);
  }

  var minerRunBtn    = document.getElementById('minerRun');
  var minerSampleBtn = document.getElementById('minerSample');

  if (minerRunBtn) {
    minerRunBtn.addEventListener('click', runMiner);
    minerSampleBtn.addEventListener('click', function () {
      document.getElementById('minerInput').value = SAMPLE_TEXT;
      runMiner();
    });
  }

  /* ════════════════════════════════════════════
     PANEL 4 — BENCHMARKS
  ════════════════════════════════════════════ */
  var benchBuilt = false;

  var BENCH_DATA = [
    { name: 'Mempalace',       pct: 96.6, type: 'winner' },
    { name: null },
    { name: 'Zep Cloud',       pct: 79.2, type: 'paid' },
    { name: 'MemGPT / MemOS',  pct: 74.1, type: 'paid' },
    { name: 'Letta (fka MemGPT)', pct: 71.3, type: 'paid' },
    { name: null },
    { name: 'Mem0 (free tier)', pct: 61.4, type: 'free' },
    { name: 'LangMem',         pct: 58.7, type: 'free' },
    { name: 'Naive RAG',       pct: 51.3, type: 'free' },
    { name: 'No memory',       pct: 22.0, type: 'free' }
  ];

  function buildBenchChart() {
    var chartEl = document.getElementById('benchChart');
    if (!chartEl) return;
    chartEl.innerHTML = '';

    BENCH_DATA.forEach(function (row) {
      if (!row.name) {
        var hr = document.createElement('hr');
        hr.className = 'bench-divider';
        chartEl.appendChild(hr);
        return;
      }

      var rowEl = document.createElement('div');
      rowEl.className = 'bench-row';

      var nameEl = document.createElement('div');
      nameEl.className = 'bench-name' + (row.type === 'winner' ? ' winner' : '');
      nameEl.textContent = row.name;

      var barWrap = document.createElement('div');
      barWrap.className = 'bench-bar-wrap';

      var bar = document.createElement('div');
      bar.className = 'bench-bar bar-' + row.type;
      bar.style.width = '0%';
      barWrap.appendChild(bar);

      var pctEl = document.createElement('div');
      pctEl.className = 'bench-pct' + (row.type === 'winner' ? ' winner' : '');
      pctEl.textContent = row.pct + '%';

      rowEl.appendChild(nameEl);
      rowEl.appendChild(barWrap);
      rowEl.appendChild(pctEl);
      chartEl.appendChild(rowEl);

      // Animate bar after a tick
      setTimeout(function () {
        bar.style.width = row.pct + '%';
      }, 80);
    });
  }

  // Intersection Observer: animate bench chart when it scrolls into view
  var benchObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting && !benchBuilt) {
        buildBenchChart();
        benchBuilt = true;
        benchObserver.disconnect();
      }
    });
  }, { threshold: 0.2 });

  var benchPanel = document.getElementById('panel-bench');
  if (benchPanel) { benchObserver.observe(benchPanel); }

  /* ─── Utility ───────────────────────────────── */
  function escHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

})();
