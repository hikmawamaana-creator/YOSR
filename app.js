/* ── STATE ─────────────────────────────────────── */
let currentLang = localStorage.getItem('yosr_lang') || 'ar';
let currentPage = 'home';

const UPDATE_DATE_AR = 'آخر تحديث: 22/05/2026';
const UPDATE_DATE_FR = 'Dernière mise à jour : 22/05/2026';

/* ── INIT ──────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  buildVilleFilter();
  applyLang(currentLang);
  renderAll(ASSOCIATIONS);
  updateResults(ASSOCIATIONS.length);
});

/* ── PAGE NAVIGATION ───────────────────────────── */
function showPage(page, event) {
  if (event) event.preventDefault();
  currentPage = page;

  document.getElementById('page-home').style.display    = page === 'home'    ? '' : 'none';
  document.getElementById('page-contact').style.display = page === 'contact' ? '' : 'none';

  document.getElementById('nav-home').classList.toggle('nav-link--active',    page === 'home');
  document.getElementById('nav-contact').classList.toggle('nav-link--active', page === 'contact');

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

/* ── LANGUAGE ──────────────────────────────────── */
function toggleLang() {
  currentLang = currentLang === 'ar' ? 'fr' : 'ar';
  localStorage.setItem('yosr_lang', currentLang);
  applyLang(currentLang);
  if (currentPage === 'home') filterAssocs();
}

function applyLang(lang) {
  const html = document.documentElement;
  html.setAttribute('lang', lang);
  html.setAttribute('dir', lang === 'ar' ? 'rtl' : 'ltr');

  document.getElementById('langLabel').textContent = lang === 'ar' ? 'FR' : 'ع';

  // Generic data-ar / data-fr elements
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
  if (filterLabel) filterLabel.textContent = lang === 'ar' ? 'المدينة:' : 'Ville :';

  // Contact page translations
  const t = {
    'contact-hero-title':  { ar: 'تواصل معنا',              fr: 'Contactez-nous' },
    'contact-hero-sub':    { ar: 'نحن هنا للاستماع إليكم ومساعدتكم', fr: 'Nous sommes là pour vous écouter et vous aider' },
    'contact-title':       { ar: 'هل لاحظتم خطأ في المعلومات؟', fr: 'Vous avez remarqué une erreur ?' },
    'contact-desc':        {
      ar: 'إذا لاحظتم خطأ في المعلومات أو ترغبون في إضافة جمعية جديدة، يمكنكم التواصل معنا عبر النموذج التالي.',
      fr: 'Si vous constatez une erreur ou souhaitez ajouter une association, contactez-nous via le formulaire ci-dessous.'
    },
    'btn-report-label':    { ar: 'الإبلاغ عن خطأ',          fr: 'Signaler une erreur' },
    'btn-add-label':       { ar: 'اقتراح جمعية جديدة',      fr: 'Ajouter une association' },
    'contact-email-label': { ar: 'أو تواصلوا معنا مباشرة عبر البريد الإلكتروني', fr: 'Ou écrivez-nous directement par email' },
  };
  Object.entries(t).forEach(([id, vals]) => {
    const el = document.getElementById(id);
    if (el) el.textContent = lang === 'ar' ? vals.ar : vals.fr;
  });
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
    const matchVille  = !ville || a.ville_fr === ville;
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
  document.getElementById('grid').style.display       = filtered.length === 0 ? 'none'  : '';
}

/* ── RESULTS TEXT ──────────────────────────────── */
function updateResults(count) {
  const el = document.getElementById('resultsText');
  const countEl = document.getElementById('countDisplay');
  if (countEl) countEl.textContent = count;
  if (currentLang === 'ar') {
    el.textContent = count === 0 ? 'لا توجد نتائج' : count === 1 ? 'جمعية واحدة' : `${count} جمعية`;
  } else {
    el.textContent = count === 0 ? 'Aucun résultat' : count === 1 ? '1 association' : `${count} associations`;
  }
}

/* ── RENDER ────────────────────────────────────── */
function renderAll(list) {
  const grid = document.getElementById('grid');
  grid.innerHTML = '';
  list.forEach(a => grid.appendChild(buildCard(a)));
}

function buildCard(a) {
  const lang  = currentLang;
  const card  = document.createElement('article');
  card.className = 'card';

  const nom       = lang === 'ar' ? a.nom_ar     : a.nom_fr;
  const ville     = lang === 'ar' ? a.ville_ar   : a.ville_fr;
  const aide      = lang === 'ar' ? a.aide_ar    : a.aide_fr;
  const addr      = lang === 'ar' ? a.adresse_ar : a.adresse_fr;
  const dateLabel = lang === 'ar' ? UPDATE_DATE_AR : UPDATE_DATE_FR;

  /* ── Téléphone ── */
  let telHTML = '';
  if (a.tel) {
    const numbers     = a.tel.split('/').map(n => n.trim().replace(/\s{2,}/g, ' ')).filter(Boolean);
    const callLabel   = lang === 'ar' ? '📞 اتصل الآن' : '📞 Appeler';
    const primaryHref = numbers[0].replace(/\s/g, '');
    const extraHTML   = numbers.slice(1).map(n =>
      `<a href="tel:${n.replace(/\s/g,'')}" class="tel-extra" dir="ltr">${n}</a>`
    ).join('');
    telHTML = `
      <a href="tel:${primaryHref}" class="call-btn" dir="ltr">
        ${callLabel}&nbsp;<span dir="ltr">${numbers[0]}</span>
      </a>
      ${extraHTML}`;
  }

  card.innerHTML = `
    <div class="card-header">
      <div class="card-name">${escHtml(nom)}</div>
      <div class="card-ville-tag">${escHtml(ville)}</div>
    </div>
    <div class="card-body">
      <div class="card-aide">${escHtml(aide)}...</div>
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
  return (str || '')
    .replace(/&/g,'&amp;').replace(/</g,'&lt;')
    .replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}
