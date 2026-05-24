/* ── STATE ─────────────────────────────────────── */
let currentLang = localStorage.getItem('yosr_lang') || 'ar';

const UPDATE_DATE_AR = 'آخر تحديث: 22/05/2026';
const UPDATE_DATE_FR = 'Dernière mise à jour : 22/05/2026';

/* ── BADGE DETECTION ───────────────────────────── */
// Détecte automatiquement les badges depuis le texte aide_ar
const BADGE_RULES = [
  {
    key: 'heberg',
    emoji: '🏠',
    ar: 'إيواء',
    fr: 'Hébergement',
    keywords_ar: ['إيواء'],
    keywords_fr: ['hébergement', 'logement']
  },
  {
    key: 'financier',
    emoji: '🏥',
    ar: 'مساعدة مالية',
    fr: 'Aide financière',
    keywords_ar: ['مساعدة مالية', 'مساعدة على الأدوية', 'مساعدات مالية', 'تخفيض تكاليف'],
    keywords_fr: ['aide financière', 'aide médicaments', 'réduction']
  },
  {
    key: 'soutien',
    emoji: '🧠',
    ar: 'دعم نفسي',
    fr: 'Soutien psy.',
    keywords_ar: ['دعم نفسي', 'متابعة نفسية', 'مرافقة نفسية', 'دعم نفسي واجتماعي'],
    keywords_fr: ['soutien psychologique', 'suivi psychologique', 'accompagnement psychologique']
  },
  {
    key: 'transport',
    emoji: '🚗',
    ar: 'نقل',
    fr: 'Transport',
    keywords_ar: ['نقل'],
    keywords_fr: ['transport']
  },
  {
    key: 'sensib',
    emoji: '📢',
    ar: 'توعية',
    fr: 'Sensibilisation',
    keywords_ar: ['توعية', 'حملات الكشف', 'قوافل'],
    keywords_fr: ['sensibilisation', 'dépistage', 'caravane']
  }
];

function detectBadges(assoc) {
  const textAr = (assoc.aide_ar || '').toLowerCase();
  const textFr = (assoc.aide_fr || '').toLowerCase();
  return BADGE_RULES.filter(rule =>
    rule.keywords_ar.some(k => textAr.includes(k)) ||
    rule.keywords_fr.some(k => textFr.includes(k))
  );
}

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
  if (filterLabel) filterLabel.textContent = lang === 'ar' ? 'المدينة:' : 'Ville :';

  // Contribution section
  const contribTitle = document.getElementById('contrib-title');
  const contribText  = document.getElementById('contrib-text');
  const btnModif     = document.getElementById('btn-modif');
  const btnAjout     = document.getElementById('btn-ajout');
  const contribMail  = document.getElementById('contrib-mail');
  if (contribTitle) contribTitle.textContent = lang === 'ar' ? 'معلومة غير صحيحة؟' : 'Une information incorrecte ?';
  if (contribText)  contribText.textContent  = lang === 'ar'
    ? 'ساعدنا في الحفاظ على دليل موثوق لفائدة المرضى.'
    : 'Aidez-nous à maintenir un annuaire fiable pour les patients.';
  if (btnModif) btnModif.innerHTML = lang === 'ar' ? '📩&nbsp; الإبلاغ عن خطأ' : '📩&nbsp; Signaler une modification';
  if (btnAjout) btnAjout.innerHTML = lang === 'ar' ? '➕&nbsp; اقتراح جمعية جديدة' : '➕&nbsp; Ajouter une association';
  if (contribMail) contribMail.innerHTML = lang === 'ar'
    ? 'أو تواصل معنا : <a href="mailto:hikmawamaana@gmail.com">hikmawamaana@gmail.com</a>'
    : 'Ou contactez-nous : <a href="mailto:hikmawamaana@gmail.com">hikmawamaana@gmail.com</a>';

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

  const nom   = lang === 'ar' ? a.nom_ar    : a.nom_fr;
  const ville = lang === 'ar' ? a.ville_ar  : a.ville_fr;
  const aide  = lang === 'ar' ? a.aide_ar   : a.aide_fr;
  const addr  = lang === 'ar' ? a.adresse_ar: a.adresse_fr;
  const dateLabel = lang === 'ar' ? UPDATE_DATE_AR : UPDATE_DATE_FR;

  /* ── Badges ── */
  const badges = detectBadges(a);
  const badgesHTML = badges.map(b =>
    `<span class="badge badge--${b.key}">${b.emoji} ${lang === 'ar' ? b.ar : b.fr}</span>`
  ).join('');

  /* ── Téléphone ── */
  let telHTML = '';
  if (a.tel) {
    const numbers   = a.tel.split('/').map(n => n.trim().replace(/\s{2,}/g, ' ')).filter(Boolean);
    const callLabel = lang === 'ar' ? '📞 اتصل الآن' : '📞 Appeler';
    const primaryHref = numbers[0].replace(/\s/g, '');
    const extraHTML = numbers.slice(1).map(n =>
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
      <div class="card-aide-section">
        <div class="card-badges">${badgesHTML}</div>
        <div class="card-aide">${escHtml(aide)}...</div>
      </div>
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
