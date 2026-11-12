/* Weekly tiffin planner: fills days from the recipe library, lock/swap, combined shopping list, saved locally. */
(function () {
  var T = window.TB, f = document.querySelector('[data-planner-form]');
  if (!f || !T) return;
  var weekEl = document.querySelector('[data-week]'), shop = document.querySelector('[data-shop]'), extra = document.querySelector('[data-plan-extra]');
  var DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  var LAB = { veg: 'Veg', vegan: 'Vegan', jain: 'Jain', egg: 'Egg', nonveg: 'Non-veg' };
  var all = [], plan = T.store.get('tb_plan', null);
  function allowed(r, o) {
    var okDiet = { veg: ['veg', 'vegan', 'jain'], vegan: ['vegan'], jain: ['jain', 'vegan', 'veg'], egg: ['veg', 'vegan', 'jain', 'egg'], all: ['veg', 'vegan', 'jain', 'egg', 'nonveg'] }[o.diet] || ['veg', 'vegan', 'jain'];
    if (okDiet.indexOf(r.diet) < 0) return false;
    if (o.diet === 'jain' && r.diet !== 'jain' && !/jain/i.test(r.swap || '')) return false;
    if (o.aud && r.audience.indexOf(o.aud) < 0) return false;
    if (o.time && r.time > parseInt(o.time, 10)) return false;
    return true;
  }
  function opts() { return { aud: f.elements.aud.value, diet: f.elements.diet.value, days: parseInt(f.elements.days.value, 10), people: Math.max(1, parseInt(f.elements.people.value, 10) || 1), time: f.elements.time.value }; }
  function shuffle(a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  function bySlug(s) { for (var i = 0; i < all.length; i++) if (all[i].slug === s) return all[i]; return null; }
  function fill(o, keep) {
    var pool = shuffle(all.filter(function (r) { return allowed(r, o); }));
    if (!pool.length) return null;
    var days = [], used = {};
    (keep || []).forEach(function (d) { if (d && d.locked) used[d.slug] = 1; });
    for (var i = 0; i < o.days; i++) {
      var k = keep && keep[i];
      if (k && k.locked && bySlug(k.slug)) { days.push(k); continue; }
      var pick = null;
      for (var j = 0; j < pool.length; j++) { if (!used[pool[j].slug]) { pick = pool[j]; break; } }
      if (!pick) pick = pool[i % pool.length];
      used[pick.slug] = 1;
      days.push({ slug: pick.slug, locked: false });
    }
    return days;
  }
  function fmt(n) { return Math.round(n * 100) / 100; }
  function render() {
    if (!plan || !plan.days) return;
    var o = plan.opts;
    weekEl.innerHTML = plan.days.map(function (d, i) {
      var r = bySlug(d.slug); if (!r) return '';
      var mark = (r.diet === 'nonveg' || r.diet === 'egg') ? 'dm dm-nv' : 'dm dm-v';
      return '<div class="day' + (d.locked ? ' locked' : '') + '"><h3>' + DAYS[i] + '</h3>' +
        '<span class="tin" style="--food:' + r.color + ';--garnish:' + r.accent + '" aria-hidden="true"><span class="tin-food"></span></span>' +
        '<a href="' + T.base + '/recipes/' + r.slug + '.html">' + T.esc(r.title) + '</a>' +
        '<span class="diet-line"><span class="' + mark + '"></span><span class="dm-t">' + LAB[r.diet] + '</span><span>' + r.time + ' min</span></span>' +
        '<span class="day-actions"><button class="btn btn-ghost" type="button" data-lock="' + i + '" aria-pressed="' + (d.locked ? 'true' : 'false') + '">' + (d.locked ? 'Locked' : 'Lock') + '</button><button class="btn btn-ghost" type="button" data-swap="' + i + '"' + (d.locked ? ' disabled' : '') + '>Swap</button></span></div>';
    }).join('');
    var agg = {}, order = [];
    plan.days.forEach(function (d) {
      var r = bySlug(d.slug); if (!r) return;
      var k = o.people / r.serves;
      r.ing.forEach(function (x) {
        var key = (x[1] + '|' + x[2]).toLowerCase();
        var q = parseFloat(x[0]);
        if (!agg[key]) { agg[key] = { q: 0, unit: x[1], item: x[2], countable: !isNaN(q) }; order.push(key); }
        if (!isNaN(q)) agg[key].q += q * k;
      });
    });
    order.sort(function (a, b) { return agg[a].countable === agg[b].countable ? agg[a].item.localeCompare(agg[b].item) : agg[a].countable ? -1 : 1; });
    shop.innerHTML = order.map(function (key) { var a = agg[key]; return '<li>' + (a.countable ? '<b>' + fmt(a.q) + (a.unit ? ' ' + T.esc(a.unit) : '') + '</b> ' : '') + T.esc(a.item) + '</li>'; }).join('');
    extra.hidden = false;
    T.store.set('tb_plan', plan);
  }
  function setForm(o) { ['aud', 'diet', 'days', 'people', 'time'].forEach(function (k) { if (o[k] !== undefined && f.elements[k]) f.elements[k].value = o[k]; }); }
  fetch(T.base + '/assets/data/recipes.json').then(function (r) { return r.json(); }).then(function (list) {
    all = list;
    var add = new URLSearchParams(location.search).get('add');
    if (plan && plan.opts) setForm(plan.opts);
    if (!plan || !plan.days) { var o = opts(); plan = { opts: o, days: fill(o) }; }
    if (add && bySlug(add)) {
      var idx = -1; for (var i = 0; i < plan.days.length; i++) { if (!plan.days[i].locked) { idx = i; break; } }
      if (idx > -1) plan.days[idx] = { slug: add, locked: true };
    }
    render();
  });
  f.addEventListener('submit', function (e) {
    e.preventDefault();
    var o = opts();
    var days = fill(o, plan && plan.days);
    if (!days) { weekEl.innerHTML = '<p class="empty">No recipes match all of those choices. Try a longer cooking time or a wider diet.</p>'; extra.hidden = true; return; }
    plan = { opts: o, days: days }; render();
  });
  weekEl.addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b || !plan) return;
    if (b.hasAttribute('data-lock')) { var i = +b.getAttribute('data-lock'); plan.days[i].locked = !plan.days[i].locked; render(); }
    if (b.hasAttribute('data-swap')) {
      var n = +b.getAttribute('data-swap');
      var inUse = plan.days.map(function (d) { return d.slug; });
      var pool = shuffle(all.filter(function (r) { return allowed(r, plan.opts) && inUse.indexOf(r.slug) < 0; }));
      if (!pool.length) pool = shuffle(all.filter(function (r) { return allowed(r, plan.opts) && r.slug !== plan.days[n].slug; }));
      if (pool.length) { plan.days[n] = { slug: pool[0].slug, locked: false }; render(); }
    }
  });
  document.querySelector('[data-reshuffle]').addEventListener('click', function () { plan.days = fill(plan.opts, plan.days) || plan.days; render(); });
  document.querySelector('[data-copy]').addEventListener('click', function () {
    var txt = 'TiffinBreak shopping list\n' + Array.prototype.map.call(shop.querySelectorAll('li'), function (li) { return '- ' + li.textContent; }).join('\n');
    var m = document.querySelector('[data-copy-msg]');
    (navigator.clipboard ? navigator.clipboard.writeText(txt) : Promise.reject()).then(function () { m.className = 'form-msg ok'; m.textContent = 'Shopping list copied.'; }, function () { m.className = 'form-msg err'; m.textContent = 'Copy is blocked in this browser. Select the list and copy it by hand.'; });
  });
})();
