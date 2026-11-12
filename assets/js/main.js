/* TiffinBreak.com: shared UI, forms, lead scoring and self-updating blocks. */
(function () {
  'use strict';
  var C = window.TB_CONFIG || {};
  var BASE = window.TB_BASE || '';
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var store = {
    get: function (k, d) { try { var v = localStorage.getItem(k); return v === null ? d : JSON.parse(v); } catch (e) { return d; } },
    set: function (k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
  };
  window.TB = { store: store, base: BASE, $: $, $$: $$ };
  var esc = function (s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); };
  window.TB.esc = esc;

  /* Year */
  $$('[data-year]').forEach(function (el) { el.textContent = new Date().getFullYear(); });

  /* Mobile nav */
  var tog = $('[data-nav-toggle]'), nav = $('#nav');
  if (tog && nav) {
    tog.addEventListener('click', function () {
      var open = nav.classList.toggle('open');
      tog.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && nav.classList.contains('open')) { nav.classList.remove('open'); tog.setAttribute('aria-expanded', 'false'); tog.focus(); } });
  }

  /* Cookie notice */
  var ck = $('[data-cookie]');
  if (ck && !store.get('tb_cookie_ok', false)) {
    ck.hidden = false;
    $('[data-cookie-ok]', ck).addEventListener('click', function () { store.set('tb_cookie_ok', true); ck.hidden = true; });
  }

  /* Attribution: first landing page, referrer and UTM tags */
  var qs = new URLSearchParams(location.search);
  var attr = store.get('tb_attr', null);
  if (!attr) {
    attr = { landing: location.pathname, referrer: document.referrer || 'direct', first_seen: new Date().toISOString() };
    store.set('tb_attr', attr);
  }
  ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'].forEach(function (k) {
    if (qs.get(k)) { attr[k] = qs.get(k); store.set('tb_attr', attr); }
  });

  /* Prefill any form field from the URL (?city=Brampton&diet=Jain) */
  $$('form[data-tb-form]').forEach(function (f) {
    qs.forEach(function (v, k) {
      var els = f.elements[k];
      if (!els || /^_|^utm_/.test(k)) return;
      if (els.length && els[0] && els[0].type === 'radio') { $$('input[name="' + k + '"]', f).forEach(function (r) { if (r.value.toLowerCase() === v.toLowerCase()) r.checked = true; }); }
      else if (els.tagName === 'SELECT') { $$('option', els).forEach(function (o) { if ((o.value || o.text).toLowerCase() === v.toLowerCase()) els.value = o.value || o.text; }); }
      else if (els.type !== 'checkbox' && els.type !== 'hidden') els.value = v;
    });
  });

  /* Form relay */
  function endpoint() {
    if (C.formAlias) return 'https://formsubmit.co/ajax/' + C.formAlias;
    var d = '';
    try { d = atob(C.relay || '').split('').reverse().join(''); } catch (e) {}
    return 'https://formsubmit.co/ajax/' + d;
  }

  /* Lead scoring (0-100) */
  function score(type, data) {
    var s = 0;
    if (type === 'customer') {
      s += { asap: 35, '2weeks': 25, month: 12, exploring: 3 }[data.start] || 0;
      s += { high: 20, mid: 14, low: 6, unsure: 6 }[data.budget] || 0;
      if (data.phone) s += 15;
      if (data.meals === 'Lunch and dinner') s += 10;
      if (data.people && data.people !== '1') s += 8;
      if (data.days === '6' || data.days === '7') s += 5;
      if (data.postal) s += 4;
      if (data.deliver_to === 'Office') s += 3;
    } else if (type === 'office') {
      var h = parseInt(data.headcount, 10) || 0;
      s += h >= 100 ? 35 : h >= 40 ? 28 : h >= 15 ? 20 : 10;
      s += { daily: 30, weekly: 22, event: 14, exploring: 4 }[data.frequency] || 0;
      s += { asap: 20, month: 14, quarter: 8, exploring: 2 }[data.start] || 0;
      if (data.phone) s += 10;
      if (data.company) s += 5;
    } else if (type === 'kitchen') {
      s += { spotlight: 40, featured: 30, leads: 25, free: 10 }[data.plan] || 0;
      s += { registered: 25, progress: 12, no: 0 }[data.licence] || 0;
      var cap = parseInt(data.capacity, 10) || 0;
      s += cap >= 60 ? 20 : cap >= 25 ? 14 : 6;
      if (data.phone) s += 10;
      if (data.website) s += 5;
    } else return '';
    return Math.min(100, s);
  }
  window.TB.score = score;

  function serialize(f) {
    var o = {};
    new FormData(f).forEach(function (v, k) {
      if (k === '_honey') return;
      o[k] = o[k] ? o[k] + ', ' + v : v;
    });
    return o;
  }

  function validate(scope) {
    var ok = true, first = null;
    $$('input,select,textarea', scope).forEach(function (el) {
      if (el.closest('[hidden]') && el.closest('[hidden]') !== scope && scope.contains(el.closest('[hidden]'))) return;
      el.classList.remove('invalid');
      var bad = false;
      if (el.type === 'radio') {
        if (el.required) { var any = $$('input[name="' + el.name + '"]', scope).some(function (r) { return r.checked; }); bad = !any; }
      } else if (el.type === 'checkbox') { bad = el.required && !el.checked; }
      else if (el.required && !String(el.value).trim()) bad = true;
      else if (el.type === 'email' && el.value && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(el.value)) bad = true;
      else if (el.type === 'url' && el.value && !/^https?:\/\//i.test(el.value)) bad = true;
      if (bad) { ok = false; el.classList.add('invalid'); if (!first) first = el; }
    });
    if (first) first.focus();
    return ok;
  }

  var LABELS = { customer: 'Tiffin match request', office: 'Office / bulk tiffin quote', kitchen: 'Kitchen listing', contact: 'Contact message', pledge: 'Support pledge', challenge: 'Challenge entry', careers: 'Job application', partner: 'Advertising / partnership enquiry', newsletter: 'Newsletter signup', starter: 'Tiffin business starter kit', city: 'City request' };

  $$('form[data-tb-form]').forEach(function (f) {
    var type = f.getAttribute('data-tb-form');
    var msg = $('.form-msg', f);
    var steps = $$('.step', f);
    var cur = 0;
    function show(i) {
      steps.forEach(function (s, n) { s.hidden = n !== i; });
      $$('.progress li', f).forEach(function (li, n) { li.className = n < i ? 'done' : n === i ? 'on' : ''; });
      var back = $('[data-back]', f), next = $('[data-next]', f), sub = $('[data-submit]', f);
      if (back) back.hidden = i === 0;
      if (next) next.hidden = i === steps.length - 1;
      if (sub) sub.hidden = i !== steps.length - 1;
      cur = i;
    }
    if (f.hasAttribute('data-steps') && steps.length) {
      show(0);
      $('[data-next]', f).addEventListener('click', function () { if (validate(steps[cur])) { show(cur + 1); var lg = $('legend', steps[cur]); if (lg) { lg.setAttribute('tabindex', '-1'); lg.focus(); } } });
      $('[data-back]', f).addEventListener('click', function () { show(cur - 1); });
    }
    var cty = f.elements.country;
    if (cty && cty.tagName === 'SELECT') {
      var upd = function () { var o = cty.options[cty.selectedIndex]; var lab = $('[data-cur-label]', f); if (lab) lab.textContent = o && o.getAttribute('data-cur') ? '(' + o.getAttribute('data-cur') + ')' : '(local currency)'; };
      cty.addEventListener('change', upd); upd();
    }
    f.addEventListener('submit', function (e) {
      e.preventDefault();
      if (f.elements._honey && f.elements._honey.value) return;
      if (!validate(f)) { if (msg) { msg.className = 'form-msg err'; msg.textContent = 'Check the highlighted fields.'; } if (steps.length) { var bad = $('.invalid', f); var st = bad && bad.closest('.step'); if (st) show(steps.indexOf(st)); } return; }
      var data = serialize(f);
      var sc = score(type, data);
      if (sc !== '') data.lead_score = sc;
      var a = store.get('tb_attr', {});
      Object.keys(a).forEach(function (k) { data['src_' + k] = a[k]; });
      data.page = location.href;
      data.submitted = new Date().toString();
      data._subject = 'TiffinBreak: ' + (LABELS[type] || type) + (data.city ? ' (' + data.city + ')' : '') + (sc !== '' ? ' score ' + sc : '');
      data._template = 'table';
      data._captcha = 'false';
      if (data.email) data._replyto = data.email;
      var btn = $('[type=submit]', f);
      if (btn) { btn.disabled = true; btn.dataset.label = btn.textContent; btn.textContent = 'Sending...'; }
      if (msg) { msg.className = 'form-msg'; msg.textContent = ''; }
      fetch(endpoint(), { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify(data) })
        .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
        .then(function () {
          store.set('tb_last_' + type, Date.now());
          var red = f.getAttribute('data-redirect');
          if (red) { location.href = BASE + '/' + red; return; }
          f.reset();
          if (msg) { msg.className = 'form-msg ok'; msg.textContent = f.getAttribute('data-inline-success') || 'Sent. We reply ' + (C.replyTime || 'soon') + '.'; }
        })
        .catch(function () {
          if (msg) { msg.className = 'form-msg err'; msg.textContent = 'That did not send. Check your connection and press the button again.'; }
        })
        .then(function () { if (btn) { btn.disabled = false; btn.textContent = btn.dataset.label; } });
    });
  });

  /* Quick-match bar on the home page hands off to the full form */
  var qm = $('[data-quick-match]');
  if (qm) qm.addEventListener('submit', function (e) {
    e.preventDefault();
    var p = new URLSearchParams(new FormData(qm));
    location.href = BASE + '/find.html?' + p.toString();
  });

  /* YouTube click-to-play */
  document.addEventListener('click', function (e) {
    var b = e.target.closest('.yt-play');
    if (!b) return;
    var fig = b.closest('[data-yt]');
    var id = fig.getAttribute('data-yt');
    var ifr = document.createElement('iframe');
    ifr.src = 'https://www.youtube-nocookie.com/embed/' + encodeURIComponent(id) + '?autoplay=1&rel=0';
    ifr.title = b.getAttribute('aria-label') || 'YouTube video';
    ifr.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
    ifr.allowFullscreen = true;
    b.replaceWith(ifr);
  });

  /* Print */
  $$('[data-print]').forEach(function (b) { b.addEventListener('click', function () { window.print(); }); });

  /* Recipe scaler */
  var sc = $('[data-scale]');
  if (sc) {
    var baseN = parseFloat(sc.getAttribute('data-scale')) || 1;
    var fmt = function (n) {
      if (n >= 10) return String(Math.round(n));
      var w = Math.floor(n), fr = n - w, fracs = [[0, ''], [0.25, '¼'], [0.33, '⅓'], [0.5, '½'], [0.67, '⅔'], [0.75, '¾'], [1, '']];
      var best = fracs.reduce(function (a, b) { return Math.abs(b[0] - fr) < Math.abs(a[0] - fr) ? b : a; });
      if (best[0] === 1) { w += 1; best = [0, '']; }
      return (w ? w : (best[1] ? '' : '0')) + best[1];
    };
    var run = function () {
      var k = (parseFloat(sc.value) || baseN) / baseN;
      $$('[data-q]').forEach(function (q) {
        var raw = q.getAttribute('data-q');
        var n = parseFloat(raw);
        q.textContent = isNaN(n) ? raw : fmt(n * k);
      });
    };
    sc.addEventListener('input', run);
    run();
  }

  /* Guide table of contents */
  var toc = $('[data-toc]'), prose = $('[data-prose]');
  if (toc && prose) {
    var hs = $$('h2', prose);
    if (hs.length > 2) {
      toc.innerHTML = '<b>On this page</b>' + hs.map(function (h, i) { if (!h.id) h.id = 's' + i; return '<a href="#' + h.id + '">' + esc(h.textContent) + '</a>'; }).join('');
      if ('IntersectionObserver' in window) {
        var links = $$('a', toc);
        var io = new IntersectionObserver(function (ents) { ents.forEach(function (en) { if (en.isIntersecting) { links.forEach(function (l) { l.classList.toggle('on', l.getAttribute('href') === '#' + en.target.id); }); } }); }, { rootMargin: '0px 0px -70% 0px' });
        hs.forEach(function (h) { io.observe(h); });
      }
    } else toc.hidden = true;
  }

  /* Month-based blocks: challenge theme and seasonal picks change on their own */
  var m = new Date().getMonth() + 1;
  $$('[data-month-group]').forEach(function (g) {
    var items = $$('[data-month]', g), hit = false;
    items.forEach(function (it) { var on = it.getAttribute('data-month').split(',').indexOf(String(m)) > -1 && !hit; it.hidden = !on; if (on) hit = true; });
    if (!hit && items[0]) items[0].hidden = false;
  });

  /* Countdown to the end of the month (challenge deadline) */
  $$('[data-countdown]').forEach(function (el) {
    var now = new Date();
    var end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
    var lab = $('[data-deadline]');
    if (lab) lab.textContent = end.toLocaleDateString(undefined, { day: 'numeric', month: 'long', year: 'numeric' });
    var tick = function () {
      var d = Math.max(0, end - new Date());
      var parts = [Math.floor(d / 864e5), Math.floor(d / 36e5) % 24, Math.floor(d / 6e4) % 60];
      el.innerHTML = ['days', 'hours', 'minutes'].map(function (u, i) { return '<div><b>' + parts[i] + '</b><span>' + u + '</span></div>'; }).join('');
    };
    tick(); setInterval(tick, 30000);
  });

  /* Prizes from config */
  $$('[data-prizes]').forEach(function (ul) {
    var p = C.prizes || [];
    if (p.length) ul.innerHTML = p.map(function (x, i) { return '<li><b>' + ['First', 'Second', 'Third'][i] + '</b>' + esc(x) + '</li>'; }).join('');
  });
  $$('[data-listing]').forEach(function (el) { var k = el.getAttribute('data-listing'); if (C.listing && C.listing[k]) el.textContent = C.listing[k]; });

  /* Tiffin of the day (rotates daily from the recipe library) */
  var today = $('[data-today]');
  if (today) {
    fetch(BASE + '/assets/data/recipes.json').then(function (r) { return r.json(); }).then(function (list) {
      var start = new Date(new Date().getFullYear(), 0, 0);
      var doy = Math.floor((new Date() - start) / 864e5);
      var r = list[doy % list.length];
      var mark = (r.diet === 'nonveg' || r.diet === 'egg') ? 'dm dm-nv' : 'dm dm-v';
      var lab = { veg: 'Veg', vegan: 'Vegan', jain: 'Jain', egg: 'Egg', nonveg: 'Non-veg' }[r.diet] || 'Veg';
      today.innerHTML = '<a class="today-card" href="' + BASE + '/recipes/' + r.slug + '.html"><span class="tin" style="--food:' + r.color + ';--garnish:' + r.accent + '" aria-hidden="true"><span class="tin-food"></span></span><span><span class="diet-line"><span class="' + mark + '"></span><span class="dm-t">' + lab + '</span><span>' + r.time + ' min</span><span>' + esc(r.cuisine) + '</span></span><b>' + esc(r.title) + '</b><span>' + esc(r.desc) + '</span></span></a>';
    }).catch(function () {});
  }

  /* Support page: tiers, payment links or pledge mode */
  var sup = $('[data-support]');
  if (sup) {
    var pay = C.payments || {};
    var keys = Object.keys(pay).filter(function (k) { return pay[k]; });
    var names = { paypal: 'PayPal', stripe: 'Card (Stripe)', buymeacoffee: 'Buy Me a Coffee', kofi: 'Ko-fi', razorpay: 'Razorpay', upi: 'UPI' };
    var box = $('[data-paylinks]');
    if (keys.length && box) {
      box.innerHTML = keys.map(function (k) { return '<a class="btn btn-ink" href="' + esc(pay[k]) + '" target="_blank" rel="noopener">Give with ' + names[k] + '</a>'; }).join('');
      $$('[data-pledge-note]').forEach(function (n) { n.textContent = 'Prefer to pledge first? Use the form and we send a payment link.'; });
    }
    $$('.tiers button', sup).forEach(function (b) {
      b.addEventListener('click', function () {
        $$('.tiers button', sup).forEach(function (x) { x.setAttribute('aria-pressed', 'false'); });
        b.setAttribute('aria-pressed', 'true');
        var amt = $('[name=amount]'); if (amt) amt.value = b.getAttribute('data-amount');
        var tier = $('[name=tier]'); if (tier) tier.value = b.getAttribute('data-tier');
      });
    });
  }

  /* Mobile sticky "Find a tiffin" bar */
  var sm = $('.sticky-match');
  if (sm) document.body.classList.add('has-sticky');

  /* Search */
  var sbox = $('[data-search]');
  if (sbox) {
    var out = $('[data-results]'), input = $('input', sbox), idx = null;
    var runS = function () {
      var q = input.value.trim().toLowerCase();
      if (!q) { out.innerHTML = ''; return; }
      var terms = q.split(/\s+/);
      var hits = idx.map(function (d) {
        var hay = (d.title + ' ' + d.description + ' ' + (d.tags || '')).toLowerCase();
        var s = 0; terms.forEach(function (t) { if (hay.indexOf(t) > -1) s += d.title.toLowerCase().indexOf(t) > -1 ? 3 : 1; });
        return { d: d, s: s };
      }).filter(function (h) { return h.s >= terms.length; }).sort(function (a, b) { return b.s - a.s; }).slice(0, 30);
      out.innerHTML = hits.length ? hits.map(function (h) { return '<li><a href="' + esc(h.d.url) + '">' + esc(h.d.title) + '</a><small>' + esc(h.d.type) + '</small>' + esc(h.d.description) + '</li>'; }).join('') : '<li>No matches. Try a dish ("poha"), a city ("Brampton") or a topic ("licence").</li>';
    };
    fetch(BASE + '/search.json').then(function (r) { return r.json(); }).then(function (d) {
      idx = d; var q0 = qs.get('q'); if (q0) { input.value = q0; runS(); }
      input.addEventListener('input', runS);
    });
    sbox.addEventListener('submit', function (e) { e.preventDefault(); if (idx) runS(); });
  }
})();
