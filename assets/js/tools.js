/* TiffinBreak calculators: cost comparison, business model, safety checker. */
(function () {
  var T = window.TB || {};
  var esc = T.esc || function (s) { return s; };
  var SYM = { CAD: 'CA$', USD: 'US$', GBP: '£', AUD: 'A$', INR: '₹' };
  function money(n, cur) {
    var s = SYM[cur] || '';
    var v = Math.round(n);
    var str = cur === 'INR' ? v.toLocaleString('en-IN') : v.toLocaleString('en-US');
    return (v < 0 ? '-' : '') + s + str.replace('-', '');
  }
  function num(f, k) { var v = parseFloat(f.elements[k].value); return isNaN(v) ? 0 : v; }
  function preset(f, table) {
    var cur = f.elements.cur.value, p = table[cur];
    Object.keys(p).forEach(function (k) { if (f.elements[k]) f.elements[k].value = p[k]; });
  }
  function bars(rows, cur) {
    var max = Math.max.apply(null, rows.map(function (r) { return r[1]; })) || 1;
    return '<div class="bars">' + rows.map(function (r) { return '<div class="bar ' + (r[2] || '') + '"><span>' + esc(r[0]) + '</span><i style="width:' + Math.max(2, r[1] / max * 100) + '%"></i><b>' + money(r[1], cur) + '</b></div>'; }).join('') + '</div>';
  }

  /* 1. Cost comparison */
  var cost = document.querySelector('[data-tool=cost]');
  if (cost) {
    var cf = cost.querySelector('form'), co = cost.querySelector('[data-out]');
    var CP = { CAD: { grocery: 4, hour: 20, plan: 200, takeout: 17 }, USD: { grocery: 4.5, hour: 22, plan: 260, takeout: 18 }, GBP: { grocery: 3, hour: 14, plan: 170, takeout: 11 }, AUD: { grocery: 5, hour: 28, plan: 300, takeout: 20 }, INR: { grocery: 60, hour: 150, plan: 3200, takeout: 180 } };
    var runC = function () {
      var cur = cf.elements.cur.value, ppl = Math.max(1, num(cf, 'people')), wk = Math.min(7, Math.max(1, num(cf, 'meals')));
      var perMonth = wk * 52 / 12, meals = perMonth * ppl;
      var groceries = num(cf, 'grocery') * meals;
      var hours = num(cf, 'minutes') * perMonth / 60;
      var homeTotal = groceries + hours * num(cf, 'hour');
      var plan = num(cf, 'plan') * ppl;
      var take = num(cf, 'takeout') * meals;
      var opts = [['Cook it yourself', homeTotal], ['Tiffin plan', plan], ['Takeout', take]].sort(function (a, b) { return a[1] - b[1]; });
      var best = opts[0][0];
      var line = best === 'Tiffin plan' ? 'A tiffin plan is the best value once your time counts. It saves about ' + Math.round(hours) + ' hours a month.' : best === 'Cook it yourself' ? 'Cooking yourself wins, even with your time priced in. A tiffin plan costs ' + money(plan - homeTotal, cur) + ' more a month.' : 'Takeout comes out cheapest on these numbers, which usually means the plan price or your cooking time is high.';
      co.innerHTML = '<h2>' + esc(best) + ' wins</h2><p>' + line + '</p>' +
        bars([['Cook (cash + time)', homeTotal], ['Tiffin plan', plan, 'alt'], ['Takeout', take, 'alt2']], cur) +
        '<dl class="kv"><dt>Groceries only</dt><dd>' + money(groceries, cur) + '</dd><dt>Hours cooking and cleaning</dt><dd>' + Math.round(hours) + ' h</dd><dt>Tiffin plan per lunch</dt><dd>' + money(plan / meals, cur) + '</dd><dt>Saving vs takeout</dt><dd>' + money(take - plan, cur) + ' with a plan</dd></dl>' +
        '<a class="btn btn-haldi" href="' + (T.base || '') + '/find.html">Get tiffin prices in my city</a>';
    };
    cf.elements.cur.addEventListener('change', function () { preset(cf, CP); runC(); });
    cf.addEventListener('input', runC);
    preset(cf, CP); runC();
  }

  /* 2. Business calculator */
  var biz = document.querySelector('[data-tool=biz]');
  if (biz) {
    var bf = biz.querySelector('form'), bo = biz.querySelector('[data-out]');
    var BP = { CAD: { price: 10, food: 3.5, pack: 0.6, deliv: 600, fixed: 250 }, USD: { price: 12, food: 4, pack: 0.7, deliv: 700, fixed: 300 }, GBP: { price: 7, food: 2.4, pack: 0.4, deliv: 400, fixed: 180 }, AUD: { price: 13, food: 4.5, pack: 0.7, deliv: 700, fixed: 300 }, INR: { price: 120, food: 50, pack: 8, deliv: 8000, fixed: 3000 } };
    var runB = function () {
      var cur = bf.elements.cur.value;
      var price = num(bf, 'price'), subs = num(bf, 'subs'), per = num(bf, 'per');
      var tiffins = subs * per, rev = price * tiffins;
      var varUnit = num(bf, 'food') + num(bf, 'pack') + price * num(bf, 'comm') / 100;
      var varCost = varUnit * tiffins, gross = rev - varCost;
      var fixed = num(bf, 'deliv') + num(bf, 'fixed'), net = gross - fixed;
      var hrs = num(bf, 'hours') * per;
      var perCust = (price - varUnit) * per;
      var be = perCust > 0 ? Math.ceil(fixed / perCust) : Infinity;
      var foodPct = price ? num(bf, 'food') / price * 100 : 0;
      var verdict = net <= 0 ? ['red', 'Losing money at this price and volume. Raise the price, cut food cost or add subscribers before launch.'] : (hrs && net / hrs < (cur === 'INR' ? 150 : 15)) ? ['amber', 'Profitable, but you earn less per hour than most part-time jobs. Price is the fastest lever.'] : ['green', 'Healthy. Protect it by keeping food cost under 40% as you grow.'];
      bo.innerHTML = '<h2>Monthly profit</h2><p class="big">' + money(net, cur) + '</p>' +
        '<p class="verdict ' + verdict[0] + '">' + verdict[1] + '</p>' +
        '<dl class="kv"><dt>Revenue (' + Math.round(tiffins) + ' tiffins)</dt><dd>' + money(rev, cur) + '</dd><dt>Food, packaging, commission</dt><dd>' + money(varCost, cur) + '</dd><dt>Gross margin</dt><dd>' + (rev ? Math.round(gross / rev * 100) : 0) + '%</dd><dt>Delivery + fixed costs</dt><dd>' + money(fixed, cur) + '</dd><dt>Food cost share of price</dt><dd>' + Math.round(foodPct) + '%</dd><dt>Profit per working hour</dt><dd>' + (hrs ? money(net / hrs, cur) : '-') + '</dd><dt>Break-even subscribers</dt><dd>' + (isFinite(be) ? be : 'never at this price') + '</dd></dl>';
      var s = document.querySelector('[data-calc-summary]');
      if (s) s.value = cur + ' | price ' + price + ' | subs ' + subs + ' | profit ' + Math.round(net) + ' | break-even ' + (isFinite(be) ? be : 'n/a');
    };
    bf.elements.cur.addEventListener('change', function () { preset(bf, BP); runB(); });
    bf.addEventListener('input', runB);
    preset(bf, BP); runB();
  }

  /* 3. Safety checker */
  var saf = document.querySelector('[data-tool=safety]');
  if (saf) {
    var sf = saf.querySelector('form'), so = saf.querySelector('[data-out]');
    var runS = function () {
      var p = (sf.elements.packed.value || '08:00').split(':'), e = (sf.elements.eat.value || '13:00').split(':');
      var h = (+e[0] + e[1] / 60) - (+p[0] + p[1] / 60); if (h < 0) h += 24;
      var has = Array.prototype.filter.call(sf.querySelectorAll('[name=has]'), function (x) { return x.checked; }).map(function (x) { return x.value; });
      var pack = (sf.querySelector('[name=pack]:checked') || {}).value, where = (sf.querySelector('[name=where]:checked') || {}).value;
      var perishable = has.some(function (x) { return x !== 'dry'; });
      var hot = where === 'hot';
      var limit, basis;
      if (!perishable) { limit = hot ? 6 : 8; basis = 'Dry, fully cooked items are low risk, but heat and humidity still shorten their life.'; }
      else if (where === 'fridge') { limit = 24; basis = 'Kept in a fridge (4°C or colder), a packed tiffin is fine until lunch.'; }
      else if (pack === 'hot') { limit = hot ? 3 : 4; basis = 'A preheated insulated tin keeps food above 60°C for a few hours if it went in piping hot and stayed closed.'; }
      else if (pack === 'cold2') { limit = hot ? 3 : 4; basis = 'Two cold sources in an insulated bag keep food cold for a typical morning.'; }
      else if (pack === 'cold1') { limit = hot ? 1.5 : 3; basis = 'One ice pack helps, but public guidance recommends at least two cold sources.'; }
      else { limit = hot ? 1 : 2; basis = 'With no heat or cold source, the 2-hour rule applies (1 hour above 32°C).'; }
      var level = h <= limit ? 'green' : h <= limit + 1 && perishable ? 'amber' : 'red';
      if (!perishable && h > limit) level = 'amber';
      var head = { green: 'Safe to eat', amber: 'Borderline: when in doubt, throw it out', red: 'Do not eat it' }[level];
      var tips = [];
      if (has.indexOf('rice') > -1) tips.push('Cooked rice can carry spores that survive cooking. Never leave it warm for long; pack it piping hot or cooled fast and cold.');
      if (has.indexOf('dairy') > -1) tips.push('Curd and paneer sour and spoil quickly in the heat. Pack them cold, separately from hot food.');
      if (has.indexOf('meat') > -1 || has.indexOf('egg') > -1) tips.push('Meat, fish and eggs should be cooked through (poultry to 74°C / 165°F) and kept hot or cold, never lukewarm.');
      if (has.indexOf('cut') > -1) tips.push('Cut fruit and salads belong in the cold tier. Dress salads at lunch.');
      if (pack === 'none' && perishable) tips.push('Next time: add two ice packs, or preheat an insulated tin with boiling water before packing hot.');
      if (pack === 'cold1') tips.push('Add a frozen water bottle as a second cold source.');
      so.innerHTML = '<h2>' + head + '</h2><p class="verdict ' + level + '">About ' + (Math.round(h * 10) / 10) + ' hours between packing and eating. Our limit for this tiffin: ' + limit + ' hours.</p><p>' + basis + '</p>' + (tips.length ? '<h3>Tips</h3><ul>' + tips.map(function (t) { return '<li>' + t + '</li>'; }).join('') + '</ul>' : '') + '<p class="small" style="color:#cfd8da">General guidance, not a guarantee. Babies, pregnant people, older adults and anyone with a weakened immune system should follow stricter advice.</p>';
    };
    sf.addEventListener('input', runS); sf.addEventListener('change', runS); runS();
  }
})();
