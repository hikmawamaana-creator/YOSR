# يسر | Yosr — Annuaire des associations cancer Maroc

Annuaire simple, mobile-first, bilingue AR/FR des associations aidant les malades du cancer au Maroc.

## Structure des fichiers

```
yosr/
├── index.html       ← Page principale
├── style.css        ← Styles (mobile-first, RTL/LTR)
├── data.js          ← Données des 34 associations (à mettre à jour)
├── app.js           ← Logique JS (recherche, filtres, langue)
├── 404.html         ← Page d'erreur personnalisée
├── _redirects       ← Config Netlify
└── README.md
```

## Mettre à jour les données

Toutes les données se trouvent dans **data.js**.
Chaque association suit ce format :

```js
{
  id: 1,
  nom_ar: "اسم الجمعية بالعربية",
  nom_fr: "Nom de l'association en français",
  ville_ar: "المدينة",
  ville_fr: "Ville",
  aide_ar: "وصف المساعدات بالعربية",
  aide_fr: "Description des aides en français",
  adresse_ar: "العنوان بالعربية",
  adresse_fr: "Adresse en français",
  tel: "0X XX XX XX XX",   // null si non disponible
  fiabilite: "verif"       // "verif" | "assoc" | "encours"
}
```

**Règle importante :** mettre `tel: null` si le téléphone n'est pas disponible.
Le numéro ne s'affichera pas sur la carte.

## Déploiement GitHub Pages

1. Créer un repository GitHub (ex: `yosr-maroc`)
2. Uploader tous les fichiers à la racine du repo
3. Aller dans Settings → Pages → Source: main branch, / (root)
4. Le site sera disponible sur `https://[username].github.io/yosr-maroc`

## Déploiement Netlify

1. Connecter le repository GitHub à Netlify
2. Build command: *(laisser vide)*
3. Publish directory: `.` (racine)
4. Le fichier `_redirects` est déjà configuré

## Langue par défaut

Le site s'affiche en **arabe** par défaut.
Le visiteur peut basculer en français via le bouton en haut à droite.
Le choix est mémorisé dans le navigateur (localStorage).
