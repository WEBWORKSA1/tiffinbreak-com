/* Recipe library filters */
(function () {
  var f = document.querySelector('[data-recipe-filters]');
  if (!f) return;
  var cards = Array.prototype.slice.call(document.querySelectorAll('[data-recipe-grid] .rc'));
  var count = document.querySelector('[data-recipe-count]');
  var empty = document.querySelector('[data-recipe-empty]');
  var qs = new URLSearchParams(location.search);
  ['q', 'aud', 'diet', 'time'].forEach(function (k) { if (qs.get(k) && f.elements[k]) f.elements[k].value = qs.get(k); });
  function run() {
    var q = f.elements.q.value.trim().toLowerCase(), aud = f.elements.aud.value, diet = f.elements.diet.value, t = parseInt(f.elements.time.value, 10) || 0, n = 0;
    cards.forEach(function (c) {
      var d = c.getAttribute('data-diet');
      var ok = (!q || q.split(/\s+/).every(function (w) { return c.getAttribute('data-q').indexOf(w) > -1; }))
        && (!aud || c.getAttribute('data-aud').indexOf(aud) > -1)
        && (!diet || (diet === 'veg' ? ['veg', 'vegan', 'jain'].indexOf(d) > -1 : d === diet))
        && (!t || parseInt(c.getAttribute('data-time'), 10) <= t);
      c.hidden = !ok; if (ok) n++;
    });
    count.textContent = n + (n === 1 ? ' recipe' : ' recipes');
    empty.hidden = n > 0;
  }
  f.addEventListener('input', run);
  f.addEventListener('submit', function (e) { e.preventDefault(); });
  run();
})();
