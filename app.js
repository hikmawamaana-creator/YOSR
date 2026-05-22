/* ── STATE ─────────────────────────────────────── */
let currentLang = localStorage.getItem('yosr_lang') || 'ar';

/* ── INIT ──────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  buildVilleFilter();
  applyLang(currentLang);
  renderAll(ASSOCIATIONS);
  updateResults(ASSOCIATIONS.length);
});

/* ── LANGUAGE ──────────────────────────────────── */
function toggleLang() {
  currentLang = currentLang === 'ar' ? 'fr' : 'ar';
  localStorage.setItem('yosr_lang', currentLang);
  applyLang(currentLang);
  filterAssocs();
}

function applyLang(lang) {
  const html = document.documentElement;
  html.setAttribute('lang', lang);
  html.setAttribute('dir', lang === 'ar' ? 'rtl' : 'ltr');

  document.getElementById('langLabel').textContent = lang === 'ar' ? 'FR' : 'ع';

  // Translate all data-ar / data-fr elements
  document.querySelectorAll('[data-ar]').forEach(el => {
    if (el.tagName !== 'INPUT' && el.tagName !== 'OPTION') {
      el.textContent = lang === 'ar' ? el.dataset.ar : el.dataset.fr;
    }
  });

  // Placeholders
  document.querySelectorAll('[data-ar-ph]').forEach(el => {
    el.placeholder = lang === 'ar' ? el.dataset.arPh : el.dataset.frPh;
  });

  // Ville select options
  document.querySelectorAll('#villeFilter option').forEach(opt => {
    if (opt.dataset.ar) opt.textContent = lang === 'ar' ? opt.dataset.ar : opt.dataset.fr;
  });

  // Filter label
  const filterLabel = document.querySelector('.filter-label');
  if (filterLabel) {
    filterLabel.textContent = lang === 'ar' ? 'المدينة:' : 'Ville :';
  }

  // Results text update
  filterAssocs();
}

/* ── VILLE FILTER ──────────────────────────────── */
function buildVilleFilter() {
  const villes = {};
  ASSOCIATIONS.forEach(a => { villes[a.ville_fr] = a.ville_ar; });
  const sorted = Object.keys(villes).sort((a, b) => a.localeCompare(b, 'fr'));
  const select = document.getElementById('villeFilter');
  sorted.forEach(vf => {
    const opt = document.createElement('option');
    opt.value = vf;
    opt.dataset.ar = villes[vf];
    opt.dataset.fr = vf;
    opt.textContent = currentLang === 'ar' ? villes[vf] : vf;
    select.appendChild(opt);
  });
}

/* ── FILTER ────────────────────────────────────── */
function filterAssocs() {
  const query = document.getElementById('searchInput').value.trim().toLowerCase();
  const ville = document.getElementById('villeFilter').value;

  const filtered = ASSOCIATIONS.filter(a => {
    const matchVille = !ville || a.ville_fr === ville;
    const matchSearch = !query ||
      a.nom_ar.toLowerCase().includes(query) ||
      a.nom_fr.toLowerCase().includes(query) ||
      a.ville_ar.toLowerCase().includes(query) ||
      a.ville_fr.toLowerCase().includes(query) ||
      a.aide_ar.toLowerCase().includes(query) ||
      a.aide_fr.toLowerCase().includes(query);
    return matchVille && matchSearch;
  });

  renderAll(filtered);
  updateResults(filtered.length);

  document.getElementById('emptyState').style.display = filtered.length === 0 ? 'block' : 'none';
  document.getElementById('grid').style.display = filtered.length === 0 ? 'none' : '';
}

/* ── UPDATE RESULTS TEXT ───────────────────────── */
function updateResults(count) {
  const el = document.getElementById('resultsText');
  const countEl = document.getElementById('countDisplay');
  if (countEl) countEl.textContent = count;

  if (currentLang === 'ar') {
    el.textContent = count === 0
      ? 'لا توجد نتائج'
      : count === 1
      ? 'جمعية واحدة'
      : `${count} جمعية`;
  } else {
    el.textContent = count === 0
      ? 'Aucun résultat'
      : count === 1
      ? '1 association'
      : `${count} associations`;
  }
}

/* ── RENDER ────────────────────────────────────── */
function renderAll(list) {
  const grid = document.getElementById('grid');
  grid.innerHTML = '';
  list.forEach(a => grid.appendChild(buildCard(a)));
}

function buildCard(a) {
  const lang = currentLang;
  const card = document.createElement('article');
  card.className = 'card';
  card.setAttribute('aria-label', lang === 'ar' ? a.nom_ar : a.nom_fr);

  const nom   = lang === 'ar' ? a.nom_ar   : a.nom_fr;
  const ville = lang === 'ar' ? a.ville_ar : a.ville_fr;
  const aide  = lang === 'ar' ? a.aide_ar  : a.aide_fr;
  const addr  = lang === 'ar' ? a.adresse_ar : a.adresse_fr;

  const fiabMap = {
    verif:   { ar: '✅ موثق رسمياً',       fr: '✅ Vérifié officiellement', cls: 'fiab-verif' },
    assoc:   { ar: '🟡 موثق جمعوياً',     fr: '🟡 Vérifié associativement', cls: 'fiab-assoc' },
    encours: { ar: '⚠️ قيد التحقق',       fr: '⚠️ En cours de vérification', cls: 'fiab-encours' }
  };
  const fiab = fiabMap[a.fiabilite] || fiabMap.encours;

  // Tel block — only if tel is not null
  let telHTML = '';
  if (a.tel) {
    // Clean up extra spaces in multi-number strings
    const telDisplay = a.tel.replace(/\s+\/\s+/g, ' / ').replace(/\s{2,}/g, ' ').trim();
    // Make first number clickable (click-to-call on mobile)
    const firstNum = telDisplay.split('/')[0].trim().replace(/\s/g, '');
    const telLabel = lang === 'ar' ? 'الهاتف' : 'Tél';
    telHTML = `
      <div class="contact-item">
        <span class="contact-icon">📞</span>
        <span class="contact-text">
          <strong>${telLabel}:</strong> <a href="tel:${firstNum}">${telDisplay}</a>
        </span>
      </div>`;
  }

  const addrLabel = lang === 'ar' ? 'العنوان' : 'Adresse';
  const aideLabel = lang === 'ar' ? 'المساعدات المقدمة' : 'Services proposés';

  card.innerHTML = `
    <div class="card-header">
      <div class="card-name">${escHtml(nom)}</div>
      <div class="card-ville-tag">${escHtml(ville)}</div>
    </div>
    <div class="card-body">
      <div>
        <div class="card-aide" aria-label="${aideLabel}">${escHtml(aide)}</div>
      </div>
      <div class="card-contact">
        ${telHTML}
        <div class="contact-item">
          <span class="contact-icon">📍</span>
          <span class="contact-text">${escHtml(addr)}</span>
        </div>
        <span class="fiab-badge ${fiab.cls}">${lang === 'ar' ? fiab.ar : fiab.fr}</span>
      </div>
    </div>`;

  return card;
}

function escHtml(str) {
  return (str || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}
