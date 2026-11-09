// Clear Water Concrete — landing page interactions

// ---- City swap (prepares for Google Ads location insertion) ----
// ?city=evans           → "Evans, GA"
// ?loc=1015344          → same, via Google's location ID ({loc_physical_ms} in the URL suffix)
// Anything unknown      → stays on the default (Augusta, GA) baked into the HTML.
(function () {
  var TOWNS = {
    // Google Ads geo IDs (pulled from the API 2026-11-09) → display name
    '1015256': 'Augusta, GA', '1015344': 'Evans, GA', '9052398': 'Martinez, GA', '1015372': 'Grovetown, GA',
    '1015383': 'Hephzibah, GA', '1015378': 'Harlem, GA', '1015251': 'Appling, GA', '1015268': 'Blythe, GA',
    '1025627': 'North Augusta, SC',
    // counties → the name we'd say
    '9057429': 'Augusta, GA', '9057345': 'Columbia County, GA'
  };
  var BY_NAME = {};
  Object.keys(TOWNS).forEach(function (k) { BY_NAME[TOWNS[k].split(',')[0].toLowerCase()] = TOWNS[k]; });
  BY_NAME['augusta'] = 'Augusta, GA';
  try {
    var q = new URLSearchParams(location.search);
    var name = null;
    if (q.get('city')) name = BY_NAME[q.get('city').trim().toLowerCase()] || null;
    if (!name && q.get('loc')) name = TOWNS[q.get('loc').trim()] || null;
    if (name) {
      document.querySelectorAll('[data-city]').forEach(function (el) { el.textContent = name; });
      document.querySelectorAll('[data-city-short]').forEach(function (el) { el.textContent = name.split(',')[0]; });
    }
  } catch (e) {}
})();

// ---- Scroll reveal ----
var reveals = document.querySelectorAll('.reveal');
if ('IntersectionObserver' in window && reveals.length) {
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
  reveals.forEach(function (el) { io.observe(el); });
} else {
  reveals.forEach(function (el) { el.classList.add('in'); });
}

// ---- Sticky mobile bar: only after the hero scrolls away ----
(function () {
  var bar = document.querySelector('.mobile-bar');
  var hero = document.querySelector('.hero');
  if (!bar || !hero || !('IntersectionObserver' in window)) return;
  new IntersectionObserver(function (entries) {
    bar.classList.toggle('show', !entries[0].isIntersecting);
  }, { threshold: 0.05 }).observe(hero);
})();

// ---- Lightbox for the big work photos ----
(function () {
  var lightbox = document.getElementById('lightbox');
  if (!lightbox) return;
  var lbImg = lightbox.querySelector('img');
  var closeBtn = lightbox.querySelector('.lightbox-close');
  var open = function (src, alt) {
    lbImg.src = src; lbImg.alt = alt || '';
    lightbox.classList.add('open'); lightbox.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  };
  var close = function () {
    lightbox.classList.remove('open'); lightbox.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  };
  document.querySelectorAll('.work-pic').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var img = btn.querySelector('img');
      open(img.getAttribute('src'), img.getAttribute('alt'));
    });
  });
  closeBtn.addEventListener('click', close);
  lightbox.addEventListener('click', function (e) { if (e.target === lightbox) close(); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && lightbox.classList.contains('open')) close(); });
})();

// ---- Call clicks → secondary gtag event (safe if gtag isn't configured yet) ----
document.querySelectorAll('a[href^="tel:"]').forEach(function (a) {
  a.addEventListener('click', function () {
    try { if (typeof gtag === 'function') gtag('event', 'call_click', { event_category: 'lead', event_label: location.pathname }); } catch (e) {}
  });
});

// ---- Quote form: don't pretend to send until the Web3Forms key is real ----
document.querySelectorAll('form.quote-form').forEach(function (form) {
  form.addEventListener('submit', function (ev) {
    // Bot trap: the hidden "botcheck" box is invisible to people; if a bot ticked it, drop the submit silently.
    var hp = form.querySelector('input[name="botcheck"]');
    if (hp && hp.checked) { ev.preventDefault(); return; }
    var key = form.querySelector('input[name="access_key"]');
    if (key && /YOUR_WEB3FORMS_KEY/.test(key.value)) {
      ev.preventDefault();
      var btn = form.querySelector('button[type="submit"]');
      if (btn) { btn.textContent = 'Form not live yet — call (478) 241-3655'; btn.disabled = true; }
      return;
    }
    try { if (typeof gtag === 'function') gtag('event', 'form_submit', { event_category: 'lead', event_label: location.pathname }); } catch (e) {}
  });
});

// ---- Footer year ----
document.querySelectorAll('[data-year]').forEach(function (el) { el.textContent = new Date().getFullYear(); });
