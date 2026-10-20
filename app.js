/**
 * MOJA PRYWATNA BIBLIOTECZKA — LOGIKA APLIKACJI PWA (IOS / MACOS SAFARI)
 * - Wizualna półka 3D (okładki przodem + grzbiety książek)
 * - Obsługa wariantów: Książka papierowa, E-book oraz Obie wersje (Papier + E-book)
 * - Filtrowanie po statusie, gatunku, sklepie i nośniku (systemowe kontrolki iOS)
 * - Gest ściągania dolnej karty w dół (Swipe-to-dismiss iOS Sheet) + blokada tła
 * - Motywy ciemne i jasne (Ciemny gabinet, Jasny pergamin Apple Books, Jasny iOS, Auto)
 * - Pobieranie po ISBN (Google Books + Biblioteka Narodowa + OpenLibrary) + skaner kodów
 * - Synchronizacja JSON z darmowym kontem GitHub
 */

const STORAGE_KEY_DATA = 'biblioteczka_data_v1';
const STORAGE_KEY_GH = 'biblioteczka_github_config_v1';

const SPINE_PALETTE = [
  '#2c1810', '#1b3a4b', '#7c3f1c', '#1e3a2f', '#4a1c2a',
  '#3b2d54', '#5c2c16', '#1f334d', '#4d3b1f', '#2b3a28'
];

/* Biblioteka spójnych ikon wektorowych SVG */
const SVG_ICONS = {
  reading: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>`,
  unread: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"/></svg>`,
  read: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`,
  wishlist: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`,
  paper: `<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/></svg>`,
  ebook: `<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"/><line x1="9" y1="7" x2="15" y2="7"/><line x1="9" y1="11" x2="15" y2="11"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg>`,
  both: `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H14v15H6.5a2.5 2.5 0 0 0 0 5H14"/><rect x="12" y="6" width="9" height="15" rx="1.5"/></svg>`,
  store: `<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>`,
  starFilled: (size = 12) => `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`,
  starOutline: (size = 12) => `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`
};

const STATUS_META = {
  reading: { label: 'W trakcie czytania', short: 'W trakcie', svg: SVG_ICONS.reading, css: 'status-reading' },
  unread:  { label: 'Na półce (Do przeczytania)', short: 'Na półce', svg: SVG_ICONS.unread, css: 'status-unread' },
  read:    { label: 'Przeczytana', short: 'Przeczytana', svg: SVG_ICONS.read, css: 'status-read' },
  wishlist:{ label: 'Lista życzeń', short: 'Lista życzeń', svg: SVG_ICONS.wishlist, css: 'status-wishlist' }
};

const FORMAT_META = {
  paper: { label: 'Książka papierowa', short: 'Papier', svg: SVG_ICONS.paper, css: 'is-paper' },
  ebook: { label: 'E-book', short: 'E-book', svg: SVG_ICONS.ebook, css: 'is-ebook' },
  both:  { label: 'Papier + E-book', short: 'Papier + E-book', svg: SVG_ICONS.both, css: 'is-both' }
};

// Stan główny aplikacji
let appData = {
  version: 2,
  updatedAt: new Date().toISOString(),
  settings: {
    libraryName: 'Moja Prywatna Biblioteczka',
    shelfWood: 'oak',
    appTheme: 'dark', // 'dark' | 'sepia' | 'light' | 'auto'
    defaultView: 'covers',
    groupByStatus: false
  },
  books: []
};

// Stan filtrów UI
let uiState = {
  search: '',
  statusFilter: 'all',
  formatFilter: 'all', // 'all' | 'paper' | 'ebook'
  categoryFilter: 'all',
  storeFilter: 'all',
  sortBy: 'added-desc',
  viewMode: 'covers', // 'covers' | 'spines'
  groupByStatus: false,
  activeBookId: null,
  formRating: 0,
  formFormat: 'paper'
};

// Konfiguracja GitHub API (przechowywana wyłącznie lokalnie)
let ghConfig = {
  owner: 'paqs-89',
  repo: 'moja-biblioteczka',
  branch: 'main',
  path: 'data/books.json',
  token: '',
  autoSync: true,
  lastSha: null
};

let html5QrScanner = null;
let autoSyncTimer = null;

/* ==========================================================================
   INICJALIZACJA APLIKACJI I SERVICE WORKERA
   ========================================================================== */

document.addEventListener('DOMContentLoaded', async () => {
  registerServiceWorker();
  loadGhConfig();
  await initializeData();
  bindEvents();
  setupSwipeToDismissModals();
  setupResizeObserver();
  applySettingsToUI();
  renderAll();
});

function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js').catch(() => {});
  }
}

async function initializeData() {
  const savedLocal = localStorage.getItem(STORAGE_KEY_DATA);
  if (savedLocal) {
    try {
      const parsed = JSON.parse(savedLocal);
      if (parsed && Array.isArray(parsed.books)) {
        appData = parsed;
      }
    } catch (e) {
      console.warn('Błąd odczytu localStorage, pobieram data/books.json', e);
    }
  }

  if (!appData.books || appData.books.length === 0) {
    try {
      const res = await fetch('./data/books.json', { cache: 'no-store' });
      if (res.ok) {
        const fileData = await res.json();
        if (fileData && Array.isArray(fileData.books)) {
          appData = fileData;
          saveLocalData(false);
        }
      }
    } catch (e) {
      console.warn('Nie udało się pobrać ./data/books.json:', e);
    }
  }

  if (!appData.settings) {
    appData.settings = {
      libraryName: 'Moja Prywatna Biblioteczka',
      shelfWood: 'oak',
      appTheme: 'dark',
      defaultView: 'covers',
      groupByStatus: false
    };
  }

  let migrated = false;
  (appData.books || []).forEach((b) => {
    if (!b.format) {
      b.format = b.id === 'sample-2' || b.id === 'sample-4' ? 'ebook' : 'paper';
      migrated = true;
    }
  });
  if (migrated) saveLocalData(false);

  if (ghConfig.owner && ghConfig.repo && ghConfig.token) {
    updateSyncStatusUI('syncing', 'Sprawdzam GitHub...');
    pullFromGitHub(true).catch(() => {
      updateSyncStatusUI('error', 'Błąd GitHub');
    });
  } else {
    updateSyncStatusUI('local', 'JSON / GitHub');
  }
}

function applySettingsToUI() {
  const s = appData.settings || {};
  uiState.viewMode = s.defaultView || 'covers';
  uiState.groupByStatus = Boolean(s.groupByStatus);

  const wood = s.shelfWood || 'oak';
  document.body.dataset.wood = wood;
  document.getElementById('woodSelect').value = wood;

  const themeMode = s.appTheme || 'dark';
  document.getElementById('themeSelect').value = themeMode;
  applyThemeMode(themeMode);

  document.getElementById('libraryTitle').textContent = s.libraryName || 'Moja Prywatna Biblioteczka';

  document.getElementById('viewCoversBtn').classList.toggle('active', uiState.viewMode === 'covers');
  document.getElementById('viewSpinesBtn').classList.toggle('active', uiState.viewMode === 'spines');
  document.getElementById('btnToggleGroupStatus').classList.toggle('active', uiState.groupByStatus);
}

function applyThemeMode(mode) {
  let effective = mode;
  if (mode === 'auto') {
    const prefersLight = window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches;
    effective = prefersLight ? 'sepia' : 'dark';
  }
  document.body.dataset.theme = effective;

  const metaTheme = document.getElementById('metaThemeColor');
  if (metaTheme) {
    if (effective === 'sepia') metaTheme.content = '#f4ede1';
    else if (effective === 'light') metaTheme.content = '#f2f2f7';
    else metaTheme.content = '#1b120c';
  }
}

function saveLocalData(triggerGitHubSync = true) {
  appData.updatedAt = new Date().toISOString();
  localStorage.setItem(STORAGE_KEY_DATA, JSON.stringify(appData));
  updateJsonPreviewArea();

  if (triggerGitHubSync && ghConfig.autoSync && ghConfig.owner && ghConfig.repo && ghConfig.token) {
    updateSyncStatusUI('syncing', 'Zapisuję...');
    clearTimeout(autoSyncTimer);
    autoSyncTimer = setTimeout(() => {
      pushToGitHub(true);
    }, 900);
  }
}

/* ==========================================================================
   ZARZĄDZANIE MODALMAMI IOS (BLOKADA PRZEWIJANIA TŁA + SWIPE-TO-DISMISS)
   ========================================================================== */

function openModalById(modalId) {
  const backdrop = document.getElementById(modalId);
  if (!backdrop) return;
  const card = backdrop.querySelector('.modal-card');
  if (card) {
    card.style.transform = '';
    card.scrollTop = 0;
  }
  backdrop.classList.remove('hidden');
  document.body.classList.add('modal-open');
}

function closeModalById(modalId) {
  if (modalId === 'bookFormModal') {
    stopCameraScanner();
  }
  if (modalId === 'detailModal') {
    uiState.activeBookId = null;
  }
  const backdrop = document.getElementById(modalId);
  if (backdrop) {
    const card = backdrop.querySelector('.modal-card');
    if (card) card.style.transform = '';
    backdrop.classList.add('hidden');
  }
  const anyOpen = ['detailModal', 'bookFormModal', 'syncModal'].some(
    (id) => !document.getElementById(id).classList.contains('hidden')
  );
  if (!anyOpen) {
    document.body.classList.remove('modal-open');
  }
}

function setupSwipeToDismissModals() {
  // Blokada przewijania strony pod spodem przy dotknięciu tła modala na iOS Safari
  document.querySelectorAll('.modal-backdrop').forEach((backdrop) => {
    backdrop.addEventListener(
      'touchmove',
      (e) => {
        if (e.target === backdrop) {
          e.preventDefault();
        }
      },
      { passive: false }
    );
  });

  // Obsługa gestu ściągnięcia karty w dół (Swipe-to-dismiss) na każdym .modal-card
  document.querySelectorAll('.modal-card').forEach((card) => {
    const modalId = card.dataset.dismissTarget;
    const handleArea = card.querySelector('[data-swipe-handle]');

    let startY = 0;
    let currentDeltaY = 0;
    let isDraggingSheet = false;
    let startedOnHandle = false;

    if (handleArea) {
      handleArea.addEventListener('click', (e) => {
        if (e.target.closest('.modal-close')) return;
        if (Math.abs(currentDeltaY) < 6 && e.target.classList.contains('modal-drag-handle')) {
          closeModalById(modalId);
        }
      });
    }

    card.addEventListener(
      'touchstart',
      (e) => {
        if (e.touches.length !== 1) return;
        const target = e.target;
        startedOnHandle = Boolean(target.closest('[data-swipe-handle]'));

        // Pozwól na ściągnięcie karty w dół, jeśli użytkownik ciągnie za górny uchwyt LUB jest na samej górze przewinięcia karty
        if (startedOnHandle || (card.scrollTop <= 0 && !target.closest('input, textarea, select, button'))) {
          startY = e.touches[0].clientY;
          currentDeltaY = 0;
          isDraggingSheet = true;
        } else {
          isDraggingSheet = false;
        }
      },
      { passive: true }
    );

    card.addEventListener(
      'touchmove',
      (e) => {
        if (!isDraggingSheet) return;
        const touchY = e.touches[0].clientY;
        const deltaY = touchY - startY;

        if (deltaY > 0 && (startedOnHandle || card.scrollTop <= 0)) {
          currentDeltaY = deltaY;
          card.style.transition = 'none';
          card.style.transform = `translateY(${deltaY}px)`;
          if (e.cancelable) e.preventDefault();
        } else if (deltaY < 0 && !startedOnHandle) {
          // Użytkownik przewija zawartość karty w dół (czyta dalej) — oddaj pełną kontrolę natywnemu scrollowi!
          isDraggingSheet = false;
          currentDeltaY = 0;
          card.style.transition = '';
          card.style.transform = '';
        }
      },
      { passive: false }
    );

    const finishDrag = () => {
      if (!isDraggingSheet) return;
      isDraggingSheet = false;
      card.style.transition = 'transform 0.26s cubic-bezier(0.32, 0.72, 0, 1)';

      if (currentDeltaY > 85) {
        card.style.transform = 'translateY(105%)';
        setTimeout(() => {
          closeModalById(modalId);
        }, 210);
      } else {
        card.style.transform = '';
      }
      currentDeltaY = 0;
    };

    card.addEventListener('touchend', finishDrag, { passive: true });
    card.addEventListener('touchcancel', finishDrag, { passive: true });
  });
}

/* ==========================================================================
   RENDEROWANIE CAŁEGO WIDOKU, STATYSTYK, FILTRÓW I DREWNIANYCH PÓŁEK
   ========================================================================== */

function renderAll() {
  renderHeaderStats();
  renderCategoryFilterOptions();
  renderStoreFilterOptions();
  renderSampleBanner();
  renderBookshelf();
  updateJsonPreviewArea();
}

function renderHeaderStats() {
  const books = appData.books || [];
  const total = books.length;
  const paperCount = books.filter((b) => !b.format || b.format === 'paper' || b.format === 'both').length;
  const ebookCount = books.filter((b) => b.format === 'ebook' || b.format === 'both').length;
  const readCount = books.filter((b) => b.status === 'read').length;

  document.getElementById('statTotal').textContent = total;
  document.getElementById('statTotalWord').textContent = pluralizeTom(total);
  document.getElementById('statPaper').textContent = paperCount;
  document.getElementById('statEbook').textContent = ebookCount;
  document.getElementById('statRead').textContent = readCount;
}

function renderCategoryFilterOptions() {
  const select = document.getElementById('filterCategory');
  const currentVal = uiState.categoryFilter;
  const categoryCounts = new Map();

  (appData.books || []).forEach((b) => {
    const rawCat = (b.category || '').trim();
    if (rawCat) {
      categoryCounts.set(rawCat, (categoryCounts.get(rawCat) || 0) + 1);
    }
  });

  const sortedCategories = Array.from(categoryCounts.keys()).sort((a, b) => a.localeCompare(b, 'pl'));
  select.innerHTML = `<option value="all">Wszystkie gatunki (${sortedCategories.length})</option>`;
  sortedCategories.forEach((cat) => {
    const opt = document.createElement('option');
    opt.value = cat;
    opt.textContent = `${cat} (${categoryCounts.get(cat)})`;
    select.appendChild(opt);
  });

  if (sortedCategories.includes(currentVal)) {
    select.value = currentVal;
  } else {
    uiState.categoryFilter = 'all';
    select.value = 'all';
  }

  // Zaktualizuj datalist podpowiedzi gatunków w formularzu
  const datalist = document.getElementById('categorySuggestions');
  if (datalist) {
    const defaultCats = [
      'Fantasy', 'Sci-Fi', 'Kryminał / Thriller', 'Powieść', 'Obyczajowa / Romans',
      'Reportaż / Literatura faktu', 'Biografia / Historia', 'Rozwój osobisty', 'Psychologia', 'Biznes / Finanse'
    ];
    const allCats = Array.from(new Set([...defaultCats, ...sortedCategories]));
    datalist.innerHTML = allCats.map((c) => `<option value="${escapeHtml(c)}"></option>`).join('');
  }
}

function renderStoreFilterOptions() {
  const select = document.getElementById('filterStore');
  const currentVal = uiState.storeFilter;
  const storeCounts = new Map();

  (appData.books || []).forEach((b) => {
    const rawStore = (b.purchasePlace || '').trim();
    if (rawStore) {
      storeCounts.set(rawStore, (storeCounts.get(rawStore) || 0) + 1);
    }
  });

  const sortedStores = Array.from(storeCounts.keys()).sort((a, b) => a.localeCompare(b, 'pl'));
  select.innerHTML = `<option value="all">Wszystkie sklepy (${sortedStores.length})</option>`;
  sortedStores.forEach((store) => {
    const opt = document.createElement('option');
    opt.value = store;
    opt.textContent = `${store} (${storeCounts.get(store)})`;
    select.appendChild(opt);
  });

  if (sortedStores.includes(currentVal)) {
    select.value = currentVal;
  } else {
    uiState.storeFilter = 'all';
    select.value = 'all';
  }

  const datalist = document.getElementById('storeSuggestions');
  const defaultShops = [
    'Empik', 'Allegro', 'Bonito', 'Świat Książki', 'TaniaKsiazka.pl',
    'Publio', 'Woblink', 'Legimi', 'Ebookpoint', 'Antykwariat', 'Prezent', 'Targi Książki'
  ];
  const allSuggestions = Array.from(new Set([...defaultShops, ...sortedStores]));
  datalist.innerHTML = allSuggestions.map((s) => `<option value="${escapeHtml(s)}"></option>`).join('');
}

function renderSampleBanner() {
  const hasSamples = (appData.books || []).some((b) => b.isSample);
  const banner = document.getElementById('sampleBanner');
  banner.classList.toggle('hidden', !hasSamples);
}

function getFilteredAndSortedBooks() {
  const q = uiState.search.trim().toLowerCase();

  const filtered = (appData.books || []).filter((book) => {
    const bookFormat = book.format || 'paper';
    if (uiState.formatFilter === 'paper' && bookFormat !== 'paper' && bookFormat !== 'both') {
      return false;
    }
    if (uiState.formatFilter === 'ebook' && bookFormat !== 'ebook' && bookFormat !== 'both') {
      return false;
    }
    if (uiState.statusFilter !== 'all' && book.status !== uiState.statusFilter) {
      return false;
    }
    if (uiState.categoryFilter !== 'all' && (book.category || '').trim() !== uiState.categoryFilter) {
      return false;
    }
    if (uiState.storeFilter !== 'all' && (book.purchasePlace || '').trim() !== uiState.storeFilter) {
      return false;
    }
    if (q) {
      const haystack = [
        book.title,
        book.author,
        book.isbn,
        book.publisher,
        book.purchasePlace,
        book.category,
        book.notes
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      if (!haystack.includes(q)) return false;
    }
    return true;
  });

  return filtered.sort((a, b) => {
    switch (uiState.sortBy) {
      case 'rating-desc':
        return (Number(b.rating) || 0) - (Number(a.rating) || 0);
      case 'title-asc':
        return (a.title || '').localeCompare(b.title || '', 'pl');
      case 'author-asc':
        return (a.author || '').localeCompare(b.author || '', 'pl');
      case 'pages-desc':
        return (Number(b.pages) || 0) - (Number(a.pages) || 0);
      case 'added-desc':
      default:
        return new Date(b.addedAt || 0) - new Date(a.addedAt || 0);
    }
  });
}

function calculateBooksPerShelfRow() {
  const interior = document.getElementById('bookcaseInterior');
  const width = interior ? interior.clientWidth : window.innerWidth - 40;
  const isMobile = window.innerWidth <= 720;

  if (uiState.viewMode === 'spines') {
    const avgSpineWidth = 40;
    const usable = Math.max(220, width - 48);
    return Math.max(5, Math.floor(usable / avgSpineWidth));
  }

  const cardWidth = isMobile ? 104 : 136;
  const gap = isMobile ? 14 : 24;
  const padding = isMobile ? 24 : 44;
  const usable = Math.max(180, width - padding);
  return Math.max(2, Math.floor((usable + gap) / (cardWidth + gap)));
}

function renderBookshelf() {
  const interior = document.getElementById('bookcaseInterior');
  if (!interior) return;

  const books = getFilteredAndSortedBooks();
  const perRow = calculateBooksPerShelfRow();
  interior.innerHTML = '';

  if (books.length === 0) {
    const emptyBay = document.createElement('div');
    emptyBay.className = 'shelf-bay';
    emptyBay.innerHTML = `
      <div class="shelf-books-row mode-covers">
        <div class="empty-shelf-placeholder">
          <h3>Półka jest obecnie pusta</h3>
          <p>${
            appData.books.length === 0
              ? 'Dodaj swoją pierwszą książkę papierową lub e-booka po numerze ISBN.'
              : 'Brak książek pasujących do wybranych filtrów wyszukiwania.'
          }</p>
          <button type="button" class="btn btn-primary" id="btnEmptyAddBook">Dodaj książkę po ISBN</button>
        </div>
      </div>
      <div class="shelf-plank"></div>
    `;
    interior.appendChild(emptyBay);
    const btnEmpty = document.getElementById('btnEmptyAddBook');
    if (btnEmpty) btnEmpty.addEventListener('click', () => openBookFormModal());
    return;
  }

  if (uiState.groupByStatus && uiState.statusFilter === 'all') {
    const order = ['reading', 'unread', 'read', 'wishlist'];
    order.forEach((statusKey) => {
      const groupBooks = books.filter((b) => b.status === statusKey);
      if (groupBooks.length === 0) return;

      const meta = STATUS_META[statusKey];
      const header = document.createElement('div');
      header.className = 'shelf-category-header';
      header.innerHTML = `
        <span class="shelf-category-title">${meta.svg} <span>${meta.label}</span></span>
        <span class="shelf-count">${groupBooks.length} ${pluralizeTom(groupBooks.length)}</span>
      `;
      interior.appendChild(header);

      appendBookRowsToInterior(interior, groupBooks, perRow, 1);
    });
  } else {
    appendBookRowsToInterior(interior, books, perRow, 2);
  }
}

function appendBookRowsToInterior(interior, books, perRow, minShelves) {
  const chunks = [];
  for (let i = 0; i < books.length; i += perRow) {
    chunks.push(books.slice(i, i + perRow));
  }
  while (chunks.length < minShelves) {
    chunks.push([]);
  }

  chunks.forEach((rowBooks) => {
    const bay = document.createElement('div');
    bay.className = 'shelf-bay';

    const rowEl = document.createElement('div');
    rowEl.className = `shelf-books-row mode-${uiState.viewMode}`;

    rowBooks.forEach((book) => {
      const card =
        uiState.viewMode === 'spines'
          ? createBookSpineElement(book)
          : createBookCoverElement(book);
      rowEl.appendChild(card);
    });

    const plank = document.createElement('div');
    plank.className = 'shelf-plank';

    bay.appendChild(rowEl);
    bay.appendChild(plank);
    interior.appendChild(bay);
  });
}

function renderMiniStarsHtml(rating) {
  if (!rating || rating <= 0) {
    return '<span>Brak oceny</span>';
  }
  let html = '';
  for (let i = 1; i <= 5; i++) {
    html += i <= rating ? SVG_ICONS.starFilled(11) : SVG_ICONS.starOutline(11);
  }
  return html;
}

function createBookCoverElement(book) {
  const el = document.createElement('article');
  el.className = 'book-card-cover';
  el.tabIndex = 0;
  el.setAttribute('role', 'button');
  el.setAttribute('aria-label', `${book.title} — ${book.author}`);

  const statusInfo = STATUS_META[book.status] || STATUS_META.unread;
  const formatKey = FORMAT_META[book.format] ? book.format : 'paper';
  const formatInfo = FORMAT_META[formatKey];
  const rating = Number(book.rating) || 0;
  const spineBg = book.spineColor || pickSpineColor(book.id || book.title);
  const hasCover = Boolean(book.coverUrl && book.coverUrl.trim());

  el.innerHTML = `
    <div class="book-3d-wrap ${formatKey === 'ebook' ? 'is-ebook' : 'is-paper'}" style="background-color: ${escapeHtml(spineBg)}">
      <div class="book-format-chip ${formatInfo.css}" title="${escapeHtml(formatInfo.label)}">
        ${formatInfo.svg}
        <span>${formatInfo.short}</span>
      </div>

      <div class="book-status-ribbon ${statusInfo.css}" title="${escapeHtml(statusInfo.label)}">
        ${statusInfo.svg}
      </div>

      ${
        hasCover
          ? `<img class="book-cover-img" src="${escapeHtml(book.coverUrl)}" alt="${escapeHtml(book.title)}" loading="lazy" />`
          : ''
      }

      <div class="book-cover-fallback ${hasCover ? 'hidden' : ''}" style="background: linear-gradient(145deg, ${escapeHtml(spineBg)}, #140c08)">
        <div class="fallback-title">${escapeHtml(book.title)}</div>
        <div class="fallback-author">${escapeHtml(book.author)}</div>
      </div>

      <div class="book-cover-overlay">
        <div class="book-mini-stars ${rating === 0 ? 'unrated' : ''}">${renderMiniStarsHtml(rating)}</div>
        ${
          book.purchasePlace
            ? `<div class="book-mini-store">${SVG_ICONS.store} <span>${escapeHtml(book.purchasePlace)}</span></div>`
            : ''
        }
      </div>
    </div>
  `;

  if (hasCover) {
    const img = el.querySelector('.book-cover-img');
    const fallback = el.querySelector('.book-cover-fallback');
    img.addEventListener('error', () => {
      img.classList.add('hidden');
      fallback.classList.remove('hidden');
    });
    img.addEventListener('load', () => {
      if (img.naturalWidth <= 2 && img.naturalHeight <= 2) {
        img.classList.add('hidden');
        fallback.classList.remove('hidden');
      }
    });
  }

  el.addEventListener('click', () => openDetailModal(book.id));
  el.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      openDetailModal(book.id);
    }
  });

  return el;
}

function createBookSpineElement(book) {
  const el = document.createElement('article');
  el.className = 'book-card-spine';
  el.tabIndex = 0;
  el.setAttribute('role', 'button');

  const pages = Number(book.pages) || 280;
  const spineWidth = Math.min(54, Math.max(32, Math.round(26 + pages / 24)));
  const spineHeight = Math.min(218, Math.max(192, 198 + ((book.title || '').length % 18)));
  const spineBg = book.spineColor || pickSpineColor(book.id || book.title);
  const statusInfo = STATUS_META[book.status] || STATUS_META.unread;
  const formatKey = FORMAT_META[book.format] ? book.format : 'paper';
  const formatInfo = FORMAT_META[formatKey];
  const rating = Number(book.rating) || 0;

  el.style.width = `${spineWidth}px`;
  el.style.height = `${spineHeight}px`;
  el.style.background = `linear-gradient(90deg, rgba(255,255,255,0.12) 0%, ${spineBg} 20%, ${spineBg} 82%, rgba(0,0,0,0.42) 100%)`;

  el.innerHTML = `
    <span class="spine-status-dot ${statusInfo.css}" title="${escapeHtml(statusInfo.label)}"></span>
    <div class="spine-text-vertical">
      <span class="spine-title">${escapeHtml(book.title)}</span>
      <span class="spine-author">${escapeHtml(book.author)}</span>
    </div>
    <div class="spine-bottom-meta">
      <span class="spine-format-icon" title="${escapeHtml(formatInfo.label)}">${formatInfo.svg}</span>
      <span class="spine-rating-badge">${rating > 0 ? `${rating}${SVG_ICONS.starFilled(10)}` : ''}</span>
    </div>

    <div class="spine-hover-card">
      ${book.coverUrl ? `<img src="${escapeHtml(book.coverUrl)}" alt="" loading="lazy" />` : ''}
      <div class="hover-title">${escapeHtml(book.title)}</div>
      <div class="hover-meta">
        ${formatInfo.short}
        ${book.purchasePlace ? ` • ${escapeHtml(book.purchasePlace)}` : ''}
      </div>
    </div>
  `;

  el.addEventListener('click', () => openDetailModal(book.id));
  return el;
}

/* ==========================================================================
   SERWIS POBIERANIA DANYCH I OKŁADKI PO NUMERZE ISBN
   ========================================================================== */

function normalizeIsbn(raw) {
  return String(raw || '')
    .replace(/[^0-9Xx]/g, '')
    .toUpperCase();
}

function translateGenreToPolish(rawGenre) {
  if (!rawGenre) return '';
  const map = {
    'fiction': 'Powieść',
    'juvenile fiction': 'Literatura młodzieżowa',
    'young adult fiction': 'Young Adult',
    'science fiction': 'Sci-Fi',
    'fantasy': 'Fantasy',
    'thrillers': 'Kryminał / Thriller',
    'mystery & detective': 'Kryminał',
    'romance': 'Obyczajowa / Romans',
    'biography & autobiography': 'Biografia',
    'history': 'Historia',
    'self-help': 'Rozwój osobisty',
    'psychology': 'Psychologia',
    'business & economics': 'Biznes / Finanse',
    'computers': 'Technologia / IT',
    'philosophy': 'Filozofia',
    'poetry': 'Poezja'
  };
  const lower = rawGenre.trim().toLowerCase();
  if (map[lower]) return map[lower];
  if (lower.startsWith('fiction')) {
    return rawGenre.replace(/^Fiction/i, 'Powieść');
  }
  return rawGenre.trim();
}

async function fetchBookDetailsByIsbn(rawIsbn) {
  const isbn = normalizeIsbn(rawIsbn);
  if (isbn.length !== 10 && isbn.length !== 13) {
    throw new Error('Numer ISBN powinien składać się z 10 lub 13 cyfr.');
  }

  const [googleRes, bnRes, openLibRes] = await Promise.allSettled([
    fetchFromGoogleBooks(isbn),
    fetchFromBibliotekaNarodowa(isbn),
    fetchFromOpenLibrary(isbn)
  ]);

  const gData = googleRes.status === 'fulfilled' ? googleRes.value : null;
  const bnData = bnRes.status === 'fulfilled' ? bnRes.value : null;
  const olData = openLibRes.status === 'fulfilled' ? openLibRes.value : null;

  if (!gData && !bnData && !olData) {
    throw new Error(`Nie znaleziono książki o numerze ISBN ${isbn} w katalogach online. Możesz wyszukać ją po tytule poniżej.`);
  }

  const rawCategory = pickBestString(bnData?.category, gData?.category, olData?.category);

  const merged = {
    isbn,
    title: pickBestString(gData?.title, bnData?.title, olData?.title),
    author: pickBestString(gData?.author, bnData?.author, olData?.author),
    publisher: pickBestString(bnData?.publisher, gData?.publisher, olData?.publisher),
    publishedYear: pickBestString(bnData?.publishedYear, gData?.publishedYear, olData?.publishedYear),
    pages: gData?.pages || bnData?.pages || olData?.pages || '',
    category: translateGenreToPolish(rawCategory),
    description: pickBestString(gData?.description, olData?.description, bnData?.description),
    coverUrl: pickBestString(gData?.coverUrl, olData?.coverUrl),
    isEbookHint: Boolean(bnData?.isEbookHint || gData?.isEbookHint),
    sources: [
      gData ? 'Google Books' : null,
      bnData ? 'Biblioteka Narodowa' : null,
      olData ? 'Open Library' : null
    ].filter(Boolean)
  };

  if (!merged.coverUrl) {
    const olCover = `https://covers.openlibrary.org/b/isbn/${isbn}-L.jpg?default=false`;
    const olExists = await checkImageExists(olCover);
    if (olExists) {
      merged.coverUrl = `https://covers.openlibrary.org/b/isbn/${isbn}-L.jpg`;
    } else if (merged.title) {
      const fallbackCover = await searchCoverByTitleAuthor(merged.title, merged.author);
      if (fallbackCover) merged.coverUrl = fallbackCover;
    }
  }

  return merged;
}

async function fetchFromGoogleBooks(isbn) {
  let url = `https://www.googleapis.com/books/v1/volumes?q=isbn:${encodeURIComponent(isbn)}&maxResults=3`;
  let res = await fetch(url);
  let data = res.ok ? await res.json() : null;

  if (!data?.items?.length) {
    url = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(isbn)}&maxResults=3`;
    res = await fetch(url);
    data = res.ok ? await res.json() : null;
  }

  if (!data?.items?.length) return null;

  const item = data.items[0];
  const info = item.volumeInfo || {};
  let cover =
    info.imageLinks?.extraLarge ||
    info.imageLinks?.large ||
    info.imageLinks?.medium ||
    info.imageLinks?.thumbnail ||
    info.imageLinks?.smallThumbnail ||
    '';

  if (cover) {
    cover = cover.replace(/^http:\/\//i, 'https://').replace('&edge=curl', '');
  }

  return {
    title: info.subtitle ? `${info.title}. ${info.subtitle}` : info.title || '',
    author: Array.isArray(info.authors) ? info.authors.join(', ') : '',
    publisher: info.publisher || '',
    publishedYear: (info.publishedDate || '').slice(0, 4),
    pages: info.pageCount || '',
    category: Array.isArray(info.categories) ? info.categories[0] : '',
    description: info.description || '',
    coverUrl: cover,
    isEbookHint: Boolean(item.saleInfo?.isEbook)
  };
}

async function fetchFromBibliotekaNarodowa(isbn) {
  const url = `https://data.bn.org.pl/api/institutions/bibs.json?isbnIssn=${encodeURIComponent(isbn)}&limit=3`;
  const res = await fetch(url);
  if (!res.ok) return null;
  const data = await res.json();
  if (!data?.bibs?.length) return null;

  const bib = data.bibs[0];
  const rawTitle = bib.title || '';
  const isEbookHint = /dokument elektroniczny/i.test(rawTitle);

  let cleanTitle = rawTitle
    .replace(/\s*\/\s*[^/]+$/, '')
    .replace(/\s*\[Dokument.*?\].*$/i, '')
    .replace(/\.$/, '')
    .trim();

  let rawAuthor = (bib.author || '').replace(/\([^)]*\)/g, '').replace(/\.$/, '').trim();
  if (rawAuthor.includes(',')) {
    const parts = rawAuthor.split(',').map((s) => s.trim());
    if (parts.length >= 2) {
      rawAuthor = `${parts[1]} ${parts[0]}`.trim();
    }
  }

  let pages = '';
  if (Array.isArray(bib.marc?.fields)) {
    for (const f of bib.marc.fields) {
      if (f['300'] && Array.isArray(f['300'].subfields)) {
        const subA = f['300'].subfields.find((sf) => sf.a)?.a || '';
        const match = subA.match(/(\d+)\s*(?:s\.|str)/i);
        if (match) {
          pages = Number(match[1]);
          break;
        }
      }
    }
  }

  return {
    title: cleanTitle,
    author: rawAuthor,
    publisher: (bib.publisher || '').replace(/\.$/, '').trim(),
    publishedYear: (bib.publicationYear || '').replace(/\D/g, '').slice(0, 4),
    pages,
    category: (bib.genre || bib.subject || '').split(';')[0].trim(),
    description: '',
    isEbookHint
  };
}

async function fetchFromOpenLibrary(isbn) {
  const key = `ISBN:${isbn}`;
  const url = `https://openlibrary.org/api/books?bibkeys=${encodeURIComponent(key)}&format=json&jscmd=data`;
  const res = await fetch(url);
  if (!res.ok) return null;
  const data = await res.json();
  const book = data[key];
  if (!book) return null;

  return {
    title: book.title || '',
    author: Array.isArray(book.authors) ? book.authors.map((a) => a.name).join(', ') : '',
    publisher: Array.isArray(book.publishers) ? book.publishers[0]?.name || '' : '',
    publishedYear: (book.publish_date || '').match(/\d{4}/)?.[0] || '',
    pages: book.number_of_pages || '',
    category: Array.isArray(book.subjects) ? book.subjects[0]?.name || '' : '',
    description: typeof book.notes === 'string' ? book.notes : book.notes?.value || '',
    coverUrl: book.cover?.large || book.cover?.medium || ''
  };
}

async function searchCoverByTitleAuthor(title, author) {
  try {
    const q = `${title} ${author || ''}`.trim();
    const url = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(q)}&maxResults=5`;
    const res = await fetch(url);
    if (!res.ok) return '';
    const data = await res.json();
    for (const item of data.items || []) {
      const links = item.volumeInfo?.imageLinks;
      if (links?.thumbnail || links?.smallThumbnail) {
        return (links.thumbnail || links.smallThumbnail)
          .replace(/^http:\/\//i, 'https://')
          .replace('&edge=curl', '');
      }
    }
  } catch (e) {}
  return '';
}

function checkImageExists(url) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(img.naturalWidth > 2 && img.naturalHeight > 2);
    img.onerror = () => resolve(false);
    img.src = url;
  });
}

/* ==========================================================================
   MODAL SZCZEGÓŁÓW KSIĄŻKI (PO KLIKNIĘCIU NA PÓŁCE)
   ========================================================================== */

function openDetailModal(bookId) {
  const book = (appData.books || []).find((b) => b.id === bookId);
  if (!book) return;

  uiState.activeBookId = book.id;

  const imgEl = document.getElementById('detailCoverImg');
  const fallbackEl = document.getElementById('detailCoverFallback');
  const spineBg = book.spineColor || pickSpineColor(book.id);

  if (book.coverUrl) {
    imgEl.src = book.coverUrl;
    imgEl.classList.remove('hidden');
    fallbackEl.classList.add('hidden');
  } else {
    imgEl.classList.add('hidden');
    fallbackEl.classList.remove('hidden');
    fallbackEl.className = 'book-cover-fallback';
    fallbackEl.style.background = `linear-gradient(145deg, ${spineBg}, #140c08)`;
    fallbackEl.innerHTML = `
      <div class="fallback-title">${escapeHtml(book.title)}</div>
      <div class="fallback-author">${escapeHtml(book.author)}</div>
    `;
  }

  updateDetailFormatBadge(book.format || 'paper');
  document.getElementById('detailCategory').textContent = book.category || 'Nieokreślony gatunek';
  document.getElementById('detailIsbnBadge').textContent = book.isbn ? `ISBN: ${book.isbn}` : 'Brak ISBN';
  document.getElementById('detailTitle').textContent = book.title || 'Bez tytułu';
  document.getElementById('detailAuthor').textContent = book.author || 'Nieznany autor';

  document.getElementById('detailStore').textContent = book.purchasePlace || 'Nie określono';

  const priceParts = [];
  if (book.purchasePrice) priceParts.push(`${book.purchasePrice} zł`);
  if (book.purchaseDate) priceParts.push(book.purchaseDate);
  document.getElementById('detailPriceDate').textContent = priceParts.length ? priceParts.join(' • ') : '—';

  document.getElementById('detailPublisher').textContent = book.publisher || '—';

  const pagesYear = [];
  if (book.pages) pagesYear.push(`${book.pages} str.`);
  if (book.publishedYear) pagesYear.push(`wyd. ${book.publishedYear}`);
  document.getElementById('detailPagesYear').textContent = pagesYear.length ? pagesYear.join(' • ') : '—';

  const notesBox = document.getElementById('detailNotesBox');
  if (book.notes && book.notes.trim()) {
    notesBox.classList.remove('hidden');
    document.getElementById('detailNotes').textContent = book.notes;
  } else {
    notesBox.classList.add('hidden');
  }

  const descBox = document.getElementById('detailDescBox');
  if (book.description && book.description.trim()) {
    descBox.classList.remove('hidden');
    document.getElementById('detailDescription').textContent = book.description;
  } else {
    descBox.classList.add('hidden');
  }

  renderInteractiveStars('detailStars', Number(book.rating) || 0, (newRating) => {
    book.rating = newRating;
    book.updatedAt = new Date().toISOString();
    saveLocalData(true);
    updateDetailRatingLabel(newRating);
    renderAll();
    showToast(`Oceniono „${book.title}” na ${newRating}/5`);
  });
  updateDetailRatingLabel(Number(book.rating) || 0);

  // Szybka zmiana nośnika (Papier / E-book / Obie wersje)
  const currentFormat = FORMAT_META[book.format] ? book.format : 'paper';
  document.querySelectorAll('#detailFormatPills .status-pill-btn').forEach((btn) => {
    btn.classList.toggle('active', btn.dataset.setFormat === currentFormat);
    btn.onclick = () => {
      book.format = btn.dataset.setFormat;
      book.updatedAt = new Date().toISOString();
      saveLocalData(true);
      updateDetailFormatBadge(book.format);
      document.querySelectorAll('#detailFormatPills .status-pill-btn').forEach((b) =>
        b.classList.toggle('active', b.dataset.setFormat === book.format)
      );
      renderAll();
      showToast(`Zmieniono nośnik na: ${FORMAT_META[book.format].label}`);
    };
  });

  // Przyciski statusu
  document.querySelectorAll('#detailStatusPills .status-pill-btn').forEach((btn) => {
    btn.classList.toggle('active', btn.dataset.setStatus === book.status);
    btn.onclick = () => {
      book.status = btn.dataset.setStatus;
      book.updatedAt = new Date().toISOString();
      saveLocalData(true);
      document.querySelectorAll('#detailStatusPills .status-pill-btn').forEach((b) =>
        b.classList.toggle('active', b.dataset.setStatus === book.status)
      );
      renderAll();
      showToast(`Zmieniono status na: ${STATUS_META[book.status].label}`);
    };
  });

  openModalById('detailModal');
}

function updateDetailFormatBadge(formatKey) {
  const badge = document.getElementById('detailFormatBadge');
  const f = FORMAT_META[formatKey] || FORMAT_META.paper;
  badge.className = `badge badge-format ${f.css}`;
  badge.innerHTML = `${f.svg} <span>${f.label}</span>`;
}

function updateDetailRatingLabel(rating) {
  const el = document.getElementById('detailRatingText');
  el.textContent = rating > 0 ? `Ocena: ${rating} / 5` : 'Brak oceny (kliknij gwiazdkę)';
}

function closeDetailModal() {
  closeModalById('detailModal');
}

/* ==========================================================================
   MODAL DODAWANIA / EDYCJI KSIĄŻKI ORAZ SKANER KODÓW KRESKOWYCH ISBN
   ========================================================================== */

function openBookFormModal(bookToEdit = null, autoStartCamera = false) {
  stopCameraScanner();
  const form = document.getElementById('bookForm');
  form.reset();

  document.getElementById('isbnFeedback').classList.add('hidden');
  document.getElementById('titleSearchDrawer').classList.add('hidden');
  document.getElementById('titleSearchResults').innerHTML = '';

  if (bookToEdit) {
    document.getElementById('formModalTitle').textContent = 'Edytuj książkę na półce';
    document.getElementById('bookIdInput').value = bookToEdit.id;
    document.getElementById('isbnInput').value = bookToEdit.isbn || '';
    setFormFormat(bookToEdit.format || 'paper');
    document.getElementById('statusInput').value = bookToEdit.status || 'unread';
    document.getElementById('purchasePlaceInput').value = bookToEdit.purchasePlace || '';
    document.getElementById('purchasePriceInput').value = bookToEdit.purchasePrice || '';
    document.getElementById('purchaseDateInput').value = bookToEdit.purchaseDate || '';
    document.getElementById('titleInput').value = bookToEdit.title || '';
    document.getElementById('authorInput').value = bookToEdit.author || '';
    document.getElementById('publisherInput').value = bookToEdit.publisher || '';
    document.getElementById('publishedYearInput').value = bookToEdit.publishedYear || '';
    document.getElementById('pagesInput').value = bookToEdit.pages || '';
    document.getElementById('categoryInput').value = bookToEdit.category || '';
    document.getElementById('coverUrlInput').value = bookToEdit.coverUrl || '';
    document.getElementById('spineColorInput').value = bookToEdit.spineColor || pickSpineColor(bookToEdit.id);
    document.getElementById('notesInput').value = bookToEdit.notes || '';
    document.getElementById('descriptionInput').value = bookToEdit.description || '';
    setFormRating(Number(bookToEdit.rating) || 0);
    updateFormCoverPreview(bookToEdit.coverUrl || '');
  } else {
    document.getElementById('formModalTitle').textContent = 'Dodaj książkę na półkę';
    document.getElementById('bookIdInput').value = '';
    setFormFormat('paper');
    document.getElementById('statusInput').value = 'unread';
    document.getElementById('spineColorInput').value = pickSpineColor(String(Date.now()));
    document.getElementById('purchaseDateInput').value = new Date().toISOString().slice(0, 10);
    setFormRating(0);
    updateFormCoverPreview('');
  }

  highlightStoreChip(document.getElementById('purchasePlaceInput').value);
  highlightCategoryChip(document.getElementById('categoryInput').value);
  openModalById('bookFormModal');

  if (autoStartCamera) {
    startCameraScanner();
  }
}

function closeBookFormModal() {
  closeModalById('bookFormModal');
}

function setFormFormat(formatVal) {
  const val = FORMAT_META[formatVal] ? formatVal : 'paper';
  uiState.formFormat = val;
  document.getElementById('formatInput').value = val;
  document.querySelectorAll('#formFormatSelector .format-option-btn').forEach((btn) => {
    btn.classList.toggle('active', btn.dataset.formatVal === val);
  });
}

function setFormRating(rating) {
  uiState.formRating = rating;
  document.getElementById('ratingInput').value = String(rating);
  renderInteractiveStars('formStars', rating, (newVal) => {
    setFormRating(newVal);
  });
}

function updateFormCoverPreview(url) {
  const img = document.getElementById('formCoverPreviewImg');
  const placeholder = document.getElementById('formCoverPlaceholder');
  if (url && url.trim()) {
    img.src = url.trim();
    img.classList.remove('hidden');
    placeholder.classList.add('hidden');
  } else {
    img.src = '';
    img.classList.add('hidden');
    placeholder.classList.remove('hidden');
  }
}

async function handleIsbnLookup() {
  const rawIsbn = document.getElementById('isbnInput').value;
  const btn = document.getElementById('btnFetchIsbn');

  const clean = normalizeIsbn(rawIsbn);
  if (!clean) {
    showLookupFeedback('warn', 'Wpisz 10 lub 13-cyfrowy numer ISBN z okładki książki.');
    return;
  }

  btn.disabled = true;
  showLookupFeedback('loading', `Szukam książki o ISBN ${clean} w Google Books, Bibliotece Narodowej i OpenLibrary...`);

  try {
    const data = await fetchBookDetailsByIsbn(clean);

    document.getElementById('isbnInput').value = data.isbn;
    if (data.title) document.getElementById('titleInput').value = data.title;
    if (data.author) document.getElementById('authorInput').value = data.author;
    if (data.publisher) document.getElementById('publisherInput').value = data.publisher;
    if (data.publishedYear) document.getElementById('publishedYearInput').value = data.publishedYear;
    if (data.pages) document.getElementById('pagesInput').value = data.pages;
    if (data.category) {
      document.getElementById('categoryInput').value = data.category;
      highlightCategoryChip(data.category);
    }
    if (data.description) document.getElementById('descriptionInput').value = data.description;
    if (data.isEbookHint) setFormFormat('ebook');

    if (data.coverUrl) {
      document.getElementById('coverUrlInput').value = data.coverUrl;
      updateFormCoverPreview(data.coverUrl);
    }

    const srcInfo = data.sources.length ? ` (źródło: ${data.sources.join(', ')})` : '';
    showLookupFeedback(
      'success',
      `Pobrano dane: „${data.title || 'Książka'}” — ${data.author || ''}${srcInfo}`
    );
  } catch (err) {
    showLookupFeedback('warn', err.message);
    document.getElementById('titleSearchDrawer').classList.remove('hidden');
  } finally {
    btn.disabled = false;
  }
}

function showLookupFeedback(type, msg) {
  const el = document.getElementById('isbnFeedback');
  el.className = `lookup-feedback ${type}`;
  el.textContent = msg;
  el.classList.remove('hidden');
}

/* Skaner kodów kreskowych ISBN aparatem (html5-qrcode) */
async function startCameraScanner() {
  const container = document.getElementById('scannerContainer');
  container.classList.remove('hidden');

  if (typeof Html5Qrcode === 'undefined') {
    showLookupFeedback('warn', 'Biblioteka skanera kamery ładuje się lub brak połączenia z siecią.');
    return;
  }

  try {
    if (html5QrScanner) {
      await stopCameraScanner();
      container.classList.remove('hidden');
    }

    html5QrScanner = new Html5Qrcode('qrReader');
    await html5QrScanner.start(
      { facingMode: 'environment' },
      {
        fps: 10,
        qrbox: { width: 240, height: 115 }
      },
      (decodedText) => {
        const clean = normalizeIsbn(decodedText);
        if (clean.length === 13 || clean.length === 10) {
          if (navigator.vibrate) navigator.vibrate(100);
          document.getElementById('isbnInput').value = clean;
          stopCameraScanner();
          handleIsbnLookup();
        }
      },
      () => {}
    );
  } catch (err) {
    showLookupFeedback(
      'warn',
      'Nie udało się uruchomić kamery. Upewnij się, że przyznałeś uprawnienia do aparatu w Safari.'
    );
    container.classList.add('hidden');
  }
}

async function stopCameraScanner() {
  const container = document.getElementById('scannerContainer');
  container.classList.add('hidden');
  if (html5QrScanner) {
    try {
      if (html5QrScanner.isScanning) {
        await html5QrScanner.stop();
      }
      html5QrScanner.clear();
    } catch (e) {}
    html5QrScanner = null;
  }
}

/* Pomocnicze wyszukiwanie po tytule i autorze */
async function handleSearchByTitle() {
  const query = document.getElementById('titleQueryInput').value.trim();
  const resultsEl = document.getElementById('titleSearchResults');
  if (!query) return;

  resultsEl.innerHTML = `<div style="font-size:0.8rem;color:#3b82f6;">Szukam wydań dla „${escapeHtml(query)}”...</div>`;

  try {
    const url = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&maxResults=6`;
    const res = await fetch(url);
    const data = await res.json();

    if (!data?.items?.length) {
      resultsEl.innerHTML = `<div style="font-size:0.8rem;color:#d97706;">Brak wyników. Wpisz dane ręcznie poniżej.</div>`;
      return;
    }

    resultsEl.innerHTML = '';
    data.items.forEach((item) => {
      const info = item.volumeInfo || {};
      const identifiers = info.industryIdentifiers || [];
      const isbn13 = identifiers.find((id) => id.type === 'ISBN_13')?.identifier;
      const isbn10 = identifiers.find((id) => id.type === 'ISBN_10')?.identifier;
      const chosenIsbn = isbn13 || isbn10 || '';
      const cover = (info.imageLinks?.thumbnail || info.imageLinks?.smallThumbnail || '')
        .replace(/^http:\/\//i, 'https://')
        .replace('&edge=curl', '');
      const authors = Array.isArray(info.authors) ? info.authors.join(', ') : 'Nieznany autor';

      const row = document.createElement('div');
      row.className = 'title-result-item';
      row.innerHTML = `
        ${cover ? `<img src="${escapeHtml(cover)}" alt="" />` : `<div style="width:32px;height:46px;background:#332218;border-radius:3px"></div>`}
        <div class="title-result-info">
          <strong>${escapeHtml(info.title || 'Bez tytułu')}</strong>
          <span>${escapeHtml(authors)} ${info.publishedDate ? `(${info.publishedDate.slice(0, 4)})` : ''} ${chosenIsbn ? `• ISBN: ${chosenIsbn}` : ''}</span>
        </div>
      `;

      row.addEventListener('click', () => {
        if (chosenIsbn) document.getElementById('isbnInput').value = chosenIsbn;
        document.getElementById('titleInput').value = info.title || '';
        document.getElementById('authorInput').value = authors;
        document.getElementById('publisherInput').value = info.publisher || '';
        document.getElementById('publishedYearInput').value = (info.publishedDate || '').slice(0, 4);
        document.getElementById('pagesInput').value = info.pageCount || '';
        const cat = Array.isArray(info.categories) ? translateGenreToPolish(info.categories[0]) : '';
        document.getElementById('categoryInput').value = cat;
        highlightCategoryChip(cat);
        document.getElementById('descriptionInput').value = info.description || '';
        if (cover) {
          document.getElementById('coverUrlInput').value = cover;
          updateFormCoverPreview(cover);
        }
        document.getElementById('titleSearchDrawer').classList.add('hidden');
        showLookupFeedback('success', `Wybrano wydanie: „${info.title}”`);
      });

      resultsEl.appendChild(row);
    });
  } catch (e) {
    resultsEl.innerHTML = `<div style="font-size:0.8rem;color:#ef4444;">Błąd połączenia podczas wyszukiwania.</div>`;
  }
}

/* ==========================================================================
   SYNCHRONIZACJA Z DARMOWYM KONTEM GITHUB (REST API) + EKSPORT/IMPORT JSON
   ========================================================================== */

function loadGhConfig() {
  let detectedOwner = '';
  let detectedRepo = '';
  if (window.location.hostname.endsWith('.github.io')) {
    detectedOwner = window.location.hostname.replace('.github.io', '');
    const pathParts = window.location.pathname.split('/').filter(Boolean);
    if (pathParts.length > 0) {
      detectedRepo = pathParts[0];
    }
  }

  const saved = localStorage.getItem(STORAGE_KEY_GH);
  if (saved) {
    try {
      ghConfig = { ...ghConfig, ...JSON.parse(saved) };
    } catch (e) {}
  }

  if (!ghConfig.owner && detectedOwner) ghConfig.owner = detectedOwner;
  if (!ghConfig.repo && detectedRepo) ghConfig.repo = detectedRepo;

  document.getElementById('ghOwnerInput').value = ghConfig.owner || 'paqs-89';
  document.getElementById('ghRepoInput').value = ghConfig.repo || 'moja-biblioteczka';
  document.getElementById('ghBranchInput').value = ghConfig.branch || 'main';
  document.getElementById('ghPathInput').value = ghConfig.path || 'data/books.json';
  document.getElementById('ghTokenInput').value = ghConfig.token || '';
  document.getElementById('ghAutoSyncInput').checked = ghConfig.autoSync !== false;
}

function saveGhConfigFromUI() {
  ghConfig.owner = document.getElementById('ghOwnerInput').value.trim();
  ghConfig.repo = document.getElementById('ghRepoInput').value.trim();
  ghConfig.branch = document.getElementById('ghBranchInput').value.trim() || 'main';
  ghConfig.path = document.getElementById('ghPathInput').value.trim().replace(/^\/+/, '') || 'data/books.json';
  ghConfig.token = document.getElementById('ghTokenInput').value.trim();
  ghConfig.autoSync = document.getElementById('ghAutoSyncInput').checked;

  localStorage.setItem(STORAGE_KEY_GH, JSON.stringify(ghConfig));
  showGhBanner('ok', 'Zapisano ustawienia GitHub w przeglądarce.');
  showToast('Zapisano ustawienia GitHub');
}

function utf8ToBase64(str) {
  const bytes = new TextEncoder().encode(str);
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function base64ToUtf8(b64) {
  const clean = b64.replace(/\s/g, '');
  const binary = atob(clean);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return new TextDecoder().decode(bytes);
}

async function pullFromGitHub(silent = false) {
  if (!ghConfig.owner || !ghConfig.repo) {
    if (!silent) showGhBanner('err', 'Podaj nazwę użytkownika (Owner) oraz nazwę repozytorium GitHub.');
    return;
  }

  updateSyncStatusUI('syncing', 'Pobieram...');
  const apiUrl = `https://api.github.com/repos/${encodeURIComponent(ghConfig.owner)}/${encodeURIComponent(
    ghConfig.repo
  )}/contents/${ghConfig.path}?ref=${encodeURIComponent(ghConfig.branch)}`;

  const headers = {
    Accept: 'application/vnd.github+json'
  };
  if (ghConfig.token) {
    headers.Authorization = `Bearer ${ghConfig.token}`;
  }

  const res = await fetch(apiUrl, { headers, cache: 'no-store' });
  if (!res.ok) {
    updateSyncStatusUI('error', 'Błąd GitHub');
    const errData = await res.json().catch(() => ({}));
    if (!silent) {
      showGhBanner('err', `Błąd pobierania z GitHub (${res.status}): ${errData.message || res.statusText}`);
    }
    throw new Error(errData.message || 'Błąd GitHub API');
  }

  const fileMeta = await res.json();
  ghConfig.lastSha = fileMeta.sha;

  const decodedJson = base64ToUtf8(fileMeta.content || '');
  const parsed = JSON.parse(decodedJson);

  if (parsed && Array.isArray(parsed.books)) {
    appData = parsed;
    saveLocalData(false);
    applySettingsToUI();
    renderAll();
    updateSyncStatusUI('synced', 'GitHub OK');
    if (!silent) {
      showGhBanner('ok', `Pobrano ${parsed.books.length} książek z repozytorium ${ghConfig.owner}/${ghConfig.repo}.`);
      showToast('Pobrano bibliotekę z GitHuba');
    }
  }
}

async function pushToGitHub(silent = false) {
  if (!ghConfig.owner || !ghConfig.repo || !ghConfig.token) {
    if (!silent) {
      showGhBanner('err', 'Uzupełnij Owner, Repository oraz Personal Access Token, aby zapisywać na GitHubie.');
    }
    return;
  }

  updateSyncStatusUI('syncing', 'Zapisuję...');
  const apiUrl = `https://api.github.com/repos/${encodeURIComponent(ghConfig.owner)}/${encodeURIComponent(
    ghConfig.repo
  )}/contents/${ghConfig.path}`;

  const headers = {
    Accept: 'application/vnd.github+json',
    Authorization: `Bearer ${ghConfig.token}`,
    'Content-Type': 'application/json'
  };

  try {
    let currentSha = ghConfig.lastSha;
    const getRes = await fetch(`${apiUrl}?ref=${encodeURIComponent(ghConfig.branch)}`, {
      headers,
      cache: 'no-store'
    });
    if (getRes.ok) {
      const existing = await getRes.json();
      currentSha = existing.sha;
    }

    const jsonString = JSON.stringify(appData, null, 2);
    const bodyPayload = {
      message: `Aktualizacja biblioteczki (${appData.books.length} książek) — ${new Date().toLocaleDateString('pl-PL')}`,
      content: utf8ToBase64(jsonString),
      branch: ghConfig.branch
    };
    if (currentSha) {
      bodyPayload.sha = currentSha;
    }

    const putRes = await fetch(apiUrl, {
      method: 'PUT',
      headers,
      body: JSON.stringify(bodyPayload)
    });

    if (!putRes.ok) {
      const errData = await putRes.json().catch(() => ({}));
      throw new Error(errData.message || `HTTP ${putRes.status}`);
    }

    const putResult = await putRes.json();
    ghConfig.lastSha = putResult.content?.sha || null;
    updateSyncStatusUI('synced', 'GitHub OK');

    if (!silent) {
      showGhBanner(
        'ok',
        `Plik ${ghConfig.path} został pomyślnie zapisany w repozytorium ${ghConfig.owner}/${ghConfig.repo}.`
      );
      showToast('Zapisano plik JSON na GitHubie');
    }
  } catch (err) {
    updateSyncStatusUI('error', 'Błąd GitHub');
    if (!silent) {
      showGhBanner('err', `Nie udało się zapisać na GitHubie: ${err.message}`);
    }
  }
}

function updateSyncStatusUI(state, text) {
  const dot = document.getElementById('syncDot');
  const label = document.getElementById('syncStatusText');
  dot.className = 'sync-dot';
  if (state === 'synced') dot.classList.add('synced');
  if (state === 'syncing') dot.classList.add('syncing');
  if (state === 'error') dot.classList.add('error');
  label.textContent = text;
}

function showGhBanner(type, message) {
  const banner = document.getElementById('ghConnectionBanner');
  banner.className = `sync-status-banner ${type}`;
  banner.textContent = message;
  banner.classList.remove('hidden');
}

function updateJsonPreviewArea() {
  const area = document.getElementById('jsonPreviewArea');
  if (area) {
    area.value = JSON.stringify(appData, null, 2);
  }
}

/* ==========================================================================
   ZDARZENIA INTERFEJSU (EVENT LISTENERS)
   ========================================================================== */

function bindEvents() {
  document.getElementById('btnAddBook').addEventListener('click', () => openBookFormModal(null, false));
  document.getElementById('btnQuickScan').addEventListener('click', () => openBookFormModal(null, true));
  document.getElementById('btnOpenSync').addEventListener('click', () => {
    updateJsonPreviewArea();
    openModalById('syncModal');
  });

  document.getElementById('libraryTitle').addEventListener('click', () => {
    const nextName = prompt('Podaj własną nazwę swojej biblioteczki:', appData.settings.libraryName);
    if (nextName && nextName.trim()) {
      appData.settings.libraryName = nextName.trim();
      document.getElementById('libraryTitle').textContent = appData.settings.libraryName;
      saveLocalData(true);
    }
  });

  // Wyszukiwarka
  const searchInput = document.getElementById('searchInput');
  const clearBtn = document.getElementById('btnClearSearch');
  searchInput.addEventListener('input', () => {
    uiState.search = searchInput.value;
    clearBtn.classList.toggle('hidden', !uiState.search);
    renderBookshelf();
  });
  clearBtn.addEventListener('click', () => {
    searchInput.value = '';
    uiState.search = '';
    clearBtn.classList.add('hidden');
    renderBookshelf();
  });

  // Filtr nośnika (Wszystkie / Papierowe / E-booki)
  document.querySelectorAll('.format-filter-group .seg-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      uiState.formatFilter = btn.dataset.formatFilter;
      document.querySelectorAll('.format-filter-group .seg-btn').forEach((b) =>
        b.classList.toggle('active', b.dataset.formatFilter === uiState.formatFilter)
      );
      renderBookshelf();
    });
  });

  // Systemowe listy rozwijane: Status, Gatunek, Sklep, Sortowanie
  document.getElementById('filterStatus').addEventListener('change', (e) => {
    uiState.statusFilter = e.target.value;
    renderBookshelf();
  });
  document.getElementById('filterCategory').addEventListener('change', (e) => {
    uiState.categoryFilter = e.target.value;
    renderBookshelf();
  });
  document.getElementById('filterStore').addEventListener('change', (e) => {
    uiState.storeFilter = e.target.value;
    renderBookshelf();
  });
  document.getElementById('sortSelect').addEventListener('change', (e) => {
    uiState.sortBy = e.target.value;
    renderBookshelf();
  });

  // Przełącznik widoku: Okładki 3D vs Grzbiety
  document.querySelectorAll('.view-mode-group .seg-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      uiState.viewMode = btn.dataset.view;
      appData.settings.defaultView = uiState.viewMode;
      document.querySelectorAll('.view-mode-group .seg-btn').forEach((b) =>
        b.classList.toggle('active', b.dataset.view === uiState.viewMode)
      );
      saveLocalData(true);
      renderBookshelf();
    });
  });

  // Grupowanie półek wg statusu
  const groupBtn = document.getElementById('btnToggleGroupStatus');
  groupBtn.addEventListener('click', () => {
    uiState.groupByStatus = !uiState.groupByStatus;
    appData.settings.groupByStatus = uiState.groupByStatus;
    groupBtn.classList.toggle('active', uiState.groupByStatus);
    saveLocalData(true);
    renderBookshelf();
  });

  // Wybór koloru drewna półki
  document.getElementById('woodSelect').addEventListener('change', (e) => {
    const wood = e.target.value;
    document.body.dataset.wood = wood;
    appData.settings.shelfWood = wood;
    saveLocalData(true);
  });

  // Wybór motywu kolorystycznego aplikacji (Ciemny / Jasny pergamin / Jasny iOS / Auto)
  document.getElementById('themeSelect').addEventListener('change', (e) => {
    const theme = e.target.value;
    appData.settings.appTheme = theme;
    applyThemeMode(theme);
    saveLocalData(true);
  });

  if (window.matchMedia) {
    window.matchMedia('(prefers-color-scheme: light)').addEventListener('change', () => {
      if (appData.settings.appTheme === 'auto') {
        applyThemeMode('auto');
      }
    });
  }

  // Usunięcie książek przykładowych
  document.getElementById('btnClearSamples').addEventListener('click', () => {
    appData.books = (appData.books || []).filter((b) => !b.isSample);
    saveLocalData(true);
    renderAll();
    showToast('Usunięto przykładowe książki');
  });

  // Modal szczegółów książki
  document.getElementById('btnCloseDetail').addEventListener('click', closeDetailModal);
  document.getElementById('btnEditFromDetail').addEventListener('click', () => {
    const book = appData.books.find((b) => b.id === uiState.activeBookId);
    closeDetailModal();
    if (book) openBookFormModal(book, false);
  });
  document.getElementById('btnDeleteFromDetail').addEventListener('click', () => {
    const book = appData.books.find((b) => b.id === uiState.activeBookId);
    if (!book) return;
    if (confirm(`Czy na pewno chcesz usunąć „${book.title}” z półki?`)) {
      appData.books = appData.books.filter((b) => b.id !== book.id);
      saveLocalData(true);
      closeDetailModal();
      renderAll();
      showToast('Usunięto książkę z półki');
    }
  });

  // Modal formularza książki + ISBN
  document.getElementById('btnCloseForm').addEventListener('click', closeBookFormModal);
  document.getElementById('btnCancelForm').addEventListener('click', closeBookFormModal);
  document.getElementById('btnFetchIsbn').addEventListener('click', handleIsbnLookup);
  document.getElementById('isbnInput').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleIsbnLookup();
    }
  });

  // Przełącznik nośnika w formularzu (Papier / E-book / Papier + E-book)
  document.querySelectorAll('#formFormatSelector .format-option-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      setFormFormat(btn.dataset.formatVal);
    });
  });

  // Skaner kamery w formularzu
  document.getElementById('btnStartCameraScan').addEventListener('click', startCameraScanner);
  document.getElementById('btnStopCameraScan').addEventListener('click', stopCameraScanner);

  // Wyszukiwarka po tytule
  document.getElementById('btnToggleTitleSearch').addEventListener('click', () => {
    const drawer = document.getElementById('titleSearchDrawer');
    drawer.classList.toggle('hidden');
    if (!drawer.classList.contains('hidden')) {
      document.getElementById('titleQueryInput').focus();
    }
  });
  document.getElementById('btnSearchByTitle').addEventListener('click', handleSearchByTitle);
  document.getElementById('titleQueryInput').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSearchByTitle();
    }
  });

  // Szybkie chipy sklepów
  document.querySelectorAll('#storeQuickChips .chip-store').forEach((chip) => {
    chip.addEventListener('click', () => {
      const store = chip.dataset.store;
      document.getElementById('purchasePlaceInput').value = store;
      highlightStoreChip(store);
      if (['publio', 'woblink', 'legimi', 'ebookpoint'].includes(store.toLowerCase()) && uiState.formFormat === 'paper') {
        setFormFormat('ebook');
      }
    });
  });
  document.getElementById('purchasePlaceInput').addEventListener('input', (e) => {
    highlightStoreChip(e.target.value);
  });

  // Szybkie chipy gatunków (kategorii)
  document.querySelectorAll('#categoryQuickChips .chip-category').forEach((chip) => {
    chip.addEventListener('click', () => {
      const cat = chip.dataset.category;
      document.getElementById('categoryInput').value = cat;
      highlightCategoryChip(cat);
    });
  });
  document.getElementById('categoryInput').addEventListener('input', (e) => {
    highlightCategoryChip(e.target.value);
  });

  // Wyczyść ocenę w formularzu
  document.getElementById('btnClearFormRating').addEventListener('click', () => setFormRating(0));

  // Podgląd URL okładki oraz wgrywanie własnego pliku okładki
  document.getElementById('coverUrlInput').addEventListener('input', (e) => {
    updateFormCoverPreview(e.target.value);
  });
  document.getElementById('coverFileInput').addEventListener('change', async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const dataUrl = await compressImageFile(file, 360, 0.82);
    document.getElementById('coverUrlInput').value = dataUrl;
    updateFormCoverPreview(dataUrl);
  });

  // Zapis formularza książki
  document.getElementById('bookForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const title = document.getElementById('titleInput').value.trim();
    const author = document.getElementById('authorInput').value.trim();
    if (!title) {
      showToast('Podaj tytuł książki lub pobierz go po numerze ISBN.');
      document.getElementById('titleInput').focus();
      return;
    }

    const editId = document.getElementById('bookIdInput').value;
    const now = new Date().toISOString();
    const rawFormat = document.getElementById('formatInput').value;

    const bookRecord = {
      id: editId || `book-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      isbn: normalizeIsbn(document.getElementById('isbnInput').value),
      title,
      author: author || 'Autor nieznany',
      publisher: document.getElementById('publisherInput').value.trim(),
      publishedYear: document.getElementById('publishedYearInput').value.trim(),
      pages: Number(document.getElementById('pagesInput').value) || '',
      category: document.getElementById('categoryInput').value.trim(),
      format: FORMAT_META[rawFormat] ? rawFormat : 'paper',
      status: document.getElementById('statusInput').value,
      rating: Number(document.getElementById('ratingInput').value) || 0,
      purchasePlace: document.getElementById('purchasePlaceInput').value.trim(),
      purchasePrice: document.getElementById('purchasePriceInput').value.trim(),
      purchaseDate: document.getElementById('purchaseDateInput').value,
      coverUrl: document.getElementById('coverUrlInput').value.trim(),
      spineColor: document.getElementById('spineColorInput').value || '#2c1810',
      notes: document.getElementById('notesInput').value.trim(),
      description: document.getElementById('descriptionInput').value.trim(),
      updatedAt: now
    };

    if (editId) {
      const idx = appData.books.findIndex((b) => b.id === editId);
      if (idx !== -1) {
        bookRecord.addedAt = appData.books[idx].addedAt || now;
        appData.books[idx] = bookRecord;
      }
      showToast(`Zaktualizowano „${bookRecord.title}”`);
    } else {
      bookRecord.addedAt = now;
      appData.books.unshift(bookRecord);
      showToast(`Dodano „${bookRecord.title}” na półkę`);
    }

    saveLocalData(true);
    closeBookFormModal();
    renderAll();
  });

  // Modal Synchronizacji GitHub i plików JSON
  document.getElementById('btnCloseSync').addEventListener('click', () => {
    closeModalById('syncModal');
  });

  document.querySelectorAll('.sync-tab').forEach((tab) => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.sync-tab').forEach((t) => t.classList.remove('active'));
      tab.classList.add('active');
      const target = tab.dataset.synctab;
      document.getElementById('panelGithub').classList.toggle('hidden', target !== 'github');
      document.getElementById('panelLocal').classList.toggle('hidden', target !== 'local');
      document.getElementById('panelGuide').classList.toggle('hidden', target !== 'guide');
    });
  });

  document.getElementById('btnSaveGhConfig').addEventListener('click', saveGhConfigFromUI);
  document.getElementById('btnPushToGh').addEventListener('click', () => {
    saveGhConfigFromUI();
    pushToGitHub(false);
  });
  document.getElementById('btnPullFromGh').addEventListener('click', () => {
    saveGhConfigFromUI();
    pullFromGitHub(false);
  });

  // Eksport i import lokalnego pliku books.json
  document.getElementById('btnExportJson').addEventListener('click', () => {
    const blob = new Blob([JSON.stringify(appData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'books.json';
    a.click();
    URL.revokeObjectURL(url);
    showToast('Pobrano plik books.json');
  });

  document.getElementById('importJsonInput').addEventListener('change', (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const imported = JSON.parse(String(reader.result));
        if (!imported || !Array.isArray(imported.books)) {
          alert('Wybrany plik JSON nie zawiera prawidłowej tablicy "books".');
          return;
        }
        appData = imported;
        saveLocalData(true);
        applySettingsToUI();
        renderAll();
        showToast(`Wczytano ${imported.books.length} książek z pliku JSON`);
      } catch (err) {
        alert('Błąd odczytu pliku JSON: ' + err.message);
      }
    };
    reader.readAsText(file);
  });

  document.getElementById('btnCopyJson').addEventListener('click', () => {
    navigator.clipboard.writeText(JSON.stringify(appData, null, 2));
    showToast('Skopiowano zawartość JSON do schowka');
  });

  ['detailModal', 'bookFormModal', 'syncModal'].forEach((id) => {
    const backdrop = document.getElementById(id);
    backdrop.addEventListener('click', (e) => {
      if (e.target === backdrop) {
        closeModalById(id);
      }
    });
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeModalById('detailModal');
      closeModalById('bookFormModal');
      closeModalById('syncModal');
    }
  });
}

/* ==========================================================================
   FUNKCJE POMOCNICZE
   ========================================================================== */

function setupResizeObserver() {
  let lastPerRow = calculateBooksPerShelfRow();
  window.addEventListener('resize', () => {
    const nextPerRow = calculateBooksPerShelfRow();
    if (nextPerRow !== lastPerRow) {
      lastPerRow = nextPerRow;
      renderBookshelf();
    }
  });
}

function renderInteractiveStars(containerId, currentRating, onSelect) {
  const container = document.getElementById(containerId);
  container.innerHTML = '';
  for (let i = 1; i <= 5; i++) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = `star-btn ${i <= currentRating ? 'filled' : ''}`;
    btn.innerHTML = i <= currentRating ? SVG_ICONS.starFilled(22) : SVG_ICONS.starOutline(22);
    btn.title = `Oceń na ${i}/5`;
    btn.addEventListener('click', () => onSelect(i));
    container.appendChild(btn);
  }
}

function highlightStoreChip(val) {
  const clean = (val || '').trim().toLowerCase();
  document.querySelectorAll('#storeQuickChips .chip-store').forEach((chip) => {
    chip.classList.toggle('active', chip.dataset.store.toLowerCase() === clean);
  });
}

function highlightCategoryChip(val) {
  const clean = (val || '').trim().toLowerCase();
  document.querySelectorAll('#categoryQuickChips .chip-category').forEach((chip) => {
    chip.classList.toggle('active', chip.dataset.category.toLowerCase() === clean);
  });
}

function pickSpineColor(seedStr) {
  let hash = 0;
  const s = String(seedStr || 'book');
  for (let i = 0; i < s.length; i++) {
    hash = (hash * 31 + s.charCodeAt(i)) >>> 0;
  }
  return SPINE_PALETTE[hash % SPINE_PALETTE.length];
}

function pickBestString(...candidates) {
  for (const c of candidates) {
    if (typeof c === 'string' && c.trim().length > 0) {
      return c.trim();
    }
  }
  return '';
}

function pluralizeTom(n) {
  if (n === 1) return 'tom';
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return 'tomy';
  return 'tomów';
}

function compressImageFile(file, maxWidth = 360, quality = 0.82) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (ev) => {
      const img = new Image();
      img.onload = () => {
        const scale = Math.min(1, maxWidth / img.width);
        const canvas = document.createElement('canvas');
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.src = ev.target.result;
    };
    reader.readAsDataURL(file);
  });
}

function showToast(message) {
  const container = document.getElementById('toastContainer');
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = message;
  container.appendChild(toast);
  setTimeout(() => {
    toast.remove();
  }, 3200);
}

function escapeHtml(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
