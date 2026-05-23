/* ── STATE ─────────────────────────────────────── */
let currentLang = localStorage.getItem('yosr_lang') || 'ar';

const UPDATE_DATE_AR = 'آخر تحديث: 22/05/2026';
const UPDATE_DATE_FR = 'Dernière mise à jour : 22/05/2026';

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

  document.querySelectorAll('[data-ar]').forEach(el => {
    if (el.tagName !== 'INPUT' && el.tagName !== 'OPTION') {
      el.textContent = lang === 'ar' ? el.dataset.ar : el.dataset.fr;
    }
  });

  document.querySelectorAll('[data-ar-ph]').forEach(el => {
    el.placeholder = lang === 'ar' ? el.dataset.arPh : el.dataset.frPh;
  });

  document.querySelectorAll('#villeFilter option').forEach(opt => {
    if (opt.dataset.ar) opt.textContent = lang === 'ar' ? opt.dataset.ar : opt.dataset.fr;
  });

  const filterLabel = document.querySelector('.filter-label');
  if (filterLabel) {
    filterLabel.textContent = lang === 'ar' ? 'المدينة:' : 'Ville :';
  }

  // Update contribute section labels
  const contribTitle = document.getElementById('contrib-title');
  const contribText  = document.getElementById('contrib-text');
  const btnModif     = document.getElementById('btn-modif');
  const btnAjout     = document.getElementById('btn-ajout');
  const contribMail  = document.getElementById('contrib-mail');
  if (contribTitle) contribTitle.textContent = lang === 'ar'
    ? 'معلومة غير صحيحة؟' : 'Une information incorrecte ?';
  if (contribText) contribText.textContent = lang === 'ar'
    ? 'ساعدنا في الحفاظ على دليل موثوق لفائدة المرضى.'
    : 'Aidez-nous à maintenir un annuaire fiable pour les patients.';
  if (btnModif) btnModif.innerHTML = lang === 'ar'
    ? '📩&nbsp; الإبلاغ عن خطأ' : '📩&nbsp; Signaler une modification';
  if (btnAjout) btnAjout.innerHTML = lang === 'ar'
    ? '➕&nbsp; اقتراح جمعية جديدة' : '➕&nbsp; Ajouter une association';
  if (contribMail) contribMail.textContent = lang === 'ar'
    ? 'أو تواصل معنا عبر البريد الإلكتروني : hikmawamaana@gmail.com'
    : 'Ou contactez-nous par email : hikmawamaana@gmail.com';

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
  const dateLabel = lang === 'ar' ? UPDATE_DATE_AR : UPDATE_DATE_FR;

  /* ── Tel block ── always LTR, all numbers clickable, full-width call button */
  let telHTML = '';
  if (a.tel) {
    const numbers = a.tel.split('/').map(n => n.trim().replace(/\s{2,}/g, ' ')).filter(Boolean);
    // Primary number → big green call button
    const primaryHref = numbers[0].replace(/\s/g, '');
    const callLabel   = lang === 'ar' ? '📞 اتصل الآن' : '📞 Appeler';
    // Extra numbers (if any) as smaller links below
    const extraHTML = numbers.slice(1).map(n => {
      const href = n.replace(/\s/g, '');
      return `<a href="tel:${href}" class="tel-extra" dir="ltr">${n}</a>`;
    }).join('');

    telHTML = `
      <a href="tel:${primaryHref}" class="call-btn" dir="ltr" aria-label="${callLabel}">
        ${callLabel} &nbsp;<span dir="ltr">${numbers[0]}</span>
      </a>
      ${extraHTML}`;
  }

  const aideLabel = lang === 'ar' ? 'المساعدات المقدمة' : 'Services proposés';

  card.innerHTML = `
    <div class="card-header">
      <div class="card-name">${escHtml(nom)}</div>
      <div class="card-ville-tag">${escHtml(ville)}</div>
    </div>
    <div class="card-body">
      <div class="card-aide" aria-label="${aideLabel}">${escHtml(aide)}</div>
      <div class="card-contact">
        ${telHTML}
        <div class="contact-item">
          <span class="contact-icon">📍</span>
          <span class="contact-text">${escHtml(addr)}</span>
        </div>
        <div class="update-date">🗓 ${escHtml(dateLabel)}</div>
      </div>
    </div>`;

  return card;
}

function escHtml(str) {
  return (str || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}
