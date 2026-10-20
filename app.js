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
const STORAGE_KEY_FILTERS = 'biblioteczka_filters_v1';

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
  starFilled: (size = 12) => `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="#f59e0b" stroke="#f59e0b" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><polygon fill="#f59e0b" stroke="#f59e0b" points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`,
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

// Stan filtrów UI (zapamiętywany między uruchomieniami aplikacji PWA)
let uiState = {
  search: '',
  statusFilter: 'all',
  formatFilter: 'all', // 'all' | 'paper' | 'ebook'
  categoryFilter: 'all',
  storeFilter: 'all',
  sortBy: 'added-desc',
  filtersDrawerOpen: false,
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
  loadFilterState();
  bindEvents();
  setupSwipeToDismissModals();
  setupResizeObserver();
  applySettingsToUI();
  renderAll();
});

function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker
      .register('./sw.js?v=8')
      .then((reg) => {
        if (reg && typeof reg.update === 'function') {
          reg.update().catch(() => {});
        }
      })
      .catch(() => {});
  }
}

function saveFilterState() {
  const payload = {
    formatFilter: uiState.formatFilter || 'all',
    statusFilter: uiState.statusFilter || 'all',
    categoryFilter: uiState.categoryFilter || 'all',
    storeFilter: uiState.storeFilter || 'all',
    sortBy: uiState.sortBy || 'added-desc',
    filtersDrawerOpen: Boolean(uiState.filtersDrawerOpen)
  };
  try {
    localStorage.setItem(STORAGE_KEY_FILTERS, JSON.stringify(payload));
  } catch (e) {}
  if (appData && appData.settings) {
    appData.settings.savedFilters = payload;
    try {
      localStorage.setItem(STORAGE_KEY_DATA, JSON.stringify(appData));
    } catch (e) {}
  }
}

function loadFilterState() {
  let saved = null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY_FILTERS);
    if (raw) saved = JSON.parse(raw);
  } catch (e) {}
  if (!saved && appData?.settings?.savedFilters) {
    saved = appData.settings.savedFilters;
  }
  if (!saved) return;

  if (saved.formatFilter) uiState.formatFilter = saved.formatFilter;
  if (saved.statusFilter) uiState.statusFilter = saved.statusFilter;
  if (saved.categoryFilter) uiState.categoryFilter = saved.categoryFilter;
  if (saved.storeFilter) uiState.storeFilter = saved.storeFilter;
  if (saved.sortBy) uiState.sortBy = saved.sortBy;
  if (typeof saved.filtersDrawerOpen === 'boolean') {
    uiState.filtersDrawerOpen = saved.filtersDrawerOpen;
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

  const libName = s.libraryName || 'Moja Prywatna Biblioteczka';
  document.getElementById('libraryTitle').textContent = libName;
  const libInput = document.getElementById('libraryNameInput');
  if (libInput) libInput.value = libName;

  document.getElementById('viewCoversBtn').classList.toggle('active', uiState.viewMode === 'covers');
  document.getElementById('viewSpinesBtn').classList.toggle('active', uiState.viewMode === 'spines');
  document.getElementById('btnToggleGroupStatus').classList.toggle('active', uiState.groupByStatus);

  // Przywrócenie zapisanych filtrów i sortowania po ponownym uruchomieniu aplikacji
  document.querySelectorAll('.format-filter-group .seg-btn').forEach((b) =>
    b.classList.toggle('active', b.dataset.formatFilter === (uiState.formatFilter || 'all'))
  );
  const statusSelect = document.getElementById('filterStatus');
  if (statusSelect) statusSelect.value = uiState.statusFilter || 'all';
  const sortSelect = document.getElementById('sortSelect');
  if (sortSelect) sortSelect.value = uiState.sortBy || 'added-desc';

  const filtersDrawer = document.getElementById('filtersDrawer');
  const btnToggleFilters = document.getElementById('btnToggleFilters');
  if (filtersDrawer && btnToggleFilters) {
    filtersDrawer.classList.toggle('hidden', !uiState.filtersDrawerOpen);
    btnToggleFilters.classList.toggle('open', Boolean(uiState.filtersDrawerOpen));
    btnToggleFilters.setAttribute('aria-expanded', String(Boolean(uiState.filtersDrawerOpen)));
  }
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
   ZARZĄDZANIE MODALAMI IOS (ZAWSZE NA GÓRZE + IZOLACJA PRZEWIJANIA + SWIPE)
   ========================================================================== */

let lockedScrollY = 0;
let isBodyScrollLocked = false;

function lockBodyScroll() {
  if (isBodyScrollLocked) return;
  lockedScrollY = window.scrollY || window.pageYOffset || 0;
  isBodyScrollLocked = true;
  document.body.classList.add('modal-open');
  document.body.style.position = 'fixed';
  document.body.style.top = `-${lockedScrollY}px`;
  document.body.style.left = '0';
  document.body.style.right = '0';
  document.body.style.width = '100%';
}

function unlockBodyScroll() {
  if (!isBodyScrollLocked) return;
  isBodyScrollLocked = false;
  document.body.classList.remove('modal-open');
  document.body.style.position = '';
  document.body.style.top = '';
  document.body.style.left = '';
  document.body.style.right = '';
  document.body.style.width = '';
  window.scrollTo(0, lockedScrollY);
}

function resetModalScrollToTop(backdrop) {
  if (!backdrop) return;
  backdrop.scrollTop = 0;
  const card = backdrop.querySelector('.modal-card');
  if (card) {
    card.scrollTop = 0;
    if (typeof card.scrollTo === 'function') {
      try {
        card.scrollTo({ top: 0, left: 0, behavior: 'instant' });
      } catch (e) {
        card.scrollTop = 0;
      }
    }
  }
  backdrop.querySelectorAll('.title-search-results, .settings-body, .detail-layout, form').forEach((el) => {
    el.scrollTop = 0;
  });
}

function openModalById(modalId) {
  const backdrop = document.getElementById(modalId);
  if (!backdrop) return;
  const card = backdrop.querySelector('.modal-card');
  if (card) {
    card.style.transition = '';
    card.style.transform = '';
  }
  // KLUCZOWE NA IOS SAFARI: Najpierw usuń display:none (.hidden), a dopiero potem ustaw scrollTop = 0!
  backdrop.classList.remove('hidden');
  lockBodyScroll();
  resetModalScrollToTop(backdrop);
  requestAnimationFrame(() => {
    resetModalScrollToTop(backdrop);
    setTimeout(() => resetModalScrollToTop(backdrop), 40);
  });
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
    resetModalScrollToTop(backdrop);
    const card = backdrop.querySelector('.modal-card');
    if (card) {
      card.style.transition = '';
      card.style.transform = '';
    }
    backdrop.classList.add('hidden');
  }
  const anyOpen = ['settingsModal', 'detailModal', 'bookFormModal', 'syncModal'].some(
    (id) => !document.getElementById(id).classList.contains('hidden')
  );
  if (!anyOpen) {
    unlockBodyScroll();
  }
}

function setupSwipeToDismissModals() {
  // 1. Całkowita blokada przewijania tła przy dotknięciu półprzezroczystego tła modala (.modal-backdrop)
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

  // 2. Izolacja przewijania wewnętrznej listy wyników wyszukiwania książek (#titleSearchResults)
  // Gdy palec dotyka listy wyszukanych książek, przewija się WYŁĄCZNIE ta lista (bez skakania modala ani strony!)
  const titleResultsEl = document.getElementById('titleSearchResults');
  if (titleResultsEl) {
    let nestedStartY = 0;
    titleResultsEl.addEventListener(
      'touchstart',
      (e) => {
        if (e.touches.length !== 1) return;
        nestedStartY = e.touches[0].clientY;
        e.stopPropagation();
      },
      { passive: true }
    );

    titleResultsEl.addEventListener(
      'touchmove',
      (e) => {
        if (e.touches.length !== 1) return;
        const currentY = e.touches[0].clientY;
        const deltaY = currentY - nestedStartY;
        const isScrollable = titleResultsEl.scrollHeight > titleResultsEl.clientHeight + 1;

        if (!isScrollable) {
          // Jeśli lista jest krótka i nie wymaga przewijania, nie pozwól na przypadkowe przesuwanie tła
          if (e.cancelable) e.preventDefault();
          e.stopPropagation();
          return;
        }

        const atTop = titleResultsEl.scrollTop <= 0;
        const atBottom =
          titleResultsEl.scrollTop + titleResultsEl.clientHeight >= titleResultsEl.scrollHeight - 1;

        // Zatrzymaj przebijanie przewijania (scroll chaining) na górnej i dolnej krawędzi listy
        if ((atTop && deltaY > 0) || (atBottom && deltaY < 0)) {
          if (e.cancelable) e.preventDefault();
        }
        e.stopPropagation();
      },
      { passive: false }
    );
  }

  // 3. Obsługa gestu ściągnięcia karty w dół (Swipe-to-dismiss) oraz kontrola aktywnego przewijania .modal-card
  document.querySelectorAll('.modal-card').forEach((card) => {
    const modalId = card.dataset.dismissTarget;
    const handleArea = card.querySelector('[data-swipe-handle]');

    let startY = 0;
    let currentDeltaY = 0;
    let isDraggingSheet = false;

    if (handleArea) {
      handleArea.addEventListener('click', (e) => {
        if (e.target.closest('.modal-close')) return;
        if (Math.abs(currentDeltaY) < 6 && e.target.classList.contains('modal-drag-handle')) {
          closeModalById(modalId);
        }
      });

      // Ściąganie karty w dół wyłącznie za górny pasek uchwytu [data-swipe-handle],
      // aby nigdy nie kolidowało z przewijaniem formularza ani listy wyszukiwania książek!
      handleArea.addEventListener(
        'touchstart',
        (e) => {
          if (e.touches.length !== 1) return;
          if (e.target.closest('.modal-close')) return;
          startY = e.touches[0].clientY;
          currentDeltaY = 0;
          isDraggingSheet = true;
        },
        { passive: true }
      );

      handleArea.addEventListener(
        'touchmove',
        (e) => {
          if (!isDraggingSheet || e.touches.length !== 1) return;
          const touchY = e.touches[0].clientY;
          const deltaY = touchY - startY;

          if (deltaY > 0) {
            currentDeltaY = deltaY;
            card.style.transition = 'none';
            card.style.transform = `translateY(${deltaY}px)`;
            if (e.cancelable) e.preventDefault();
          } else {
            currentDeltaY = 0;
            card.style.transform = '';
          }
        },
        { passive: false }
      );

      const finishDrag = () => {
        if (!isDraggingSheet) return;
        isDraggingSheet = false;
        card.style.transition = 'transform 0.26s cubic-bezier(0.32, 0.72, 0, 1)';

        if (currentDeltaY > 75) {
          card.style.transform = 'translateY(105%)';
          setTimeout(() => {
            closeModalById(modalId);
          }, 210);
        } else {
          card.style.transform = '';
        }
        currentDeltaY = 0;
      };

      handleArea.addEventListener('touchend', finishDrag, { passive: true });
      handleArea.addEventListener('touchcancel', finishDrag, { passive: true });
    }

    // Strażnik granic przewijania samej karty .modal-card (aby ruch palcem w oknie nigdy nie przewijał strony pod spodem)
    let cardTouchStartY = 0;
    card.addEventListener(
      'touchstart',
      (e) => {
        if (e.touches.length === 1) {
          cardTouchStartY = e.touches[0].clientY;
        }
      },
      { passive: true }
    );

    card.addEventListener(
      'touchmove',
      (e) => {
        if (isDraggingSheet || e.touches.length !== 1) return;
        if (e.target.closest('#titleSearchResults')) return;

        const deltaY = e.touches[0].clientY - cardTouchStartY;
        const canScrollCard = card.scrollHeight > card.clientHeight + 1;

        if (!canScrollCard) {
          if (e.cancelable) e.preventDefault();
          return;
        }

        const atTop = card.scrollTop <= 0;
        const atBottom = card.scrollTop + card.clientHeight >= card.scrollHeight - 1;

        if ((atTop && deltaY > 0) || (atBottom && deltaY < 0)) {
          if (e.cancelable) e.preventDefault();
        }
      },
      { passive: false }
    );
  });
}

/* ==========================================================================
   RENDEROWANIE CAŁEGO WIDOKU, STATYSTYK, FILTRÓW I DREWNIANYCH PÓŁEK
   ========================================================================== */

function renderAll() {
  renderHeaderStats();
  renderCategoryFilterOptions();
  renderStoreFilterOptions();
  syncAllFilterSelectDisplays();
  updateActiveFilterBadge();
  renderSampleBanner();
  renderBookshelf();
  updateJsonPreviewArea();
}

function syncSelectDisplayLabel(selectId, displayId) {
  const select = document.getElementById(selectId);
  const display = document.getElementById(displayId);
  if (!select || !display) return;
  const selectedOpt = select.options[select.selectedIndex];
  display.textContent = selectedOpt ? selectedOpt.textContent : '';
}

function syncAllFilterSelectDisplays() {
  syncSelectDisplayLabel('filterStatus', 'filterStatusDisplay');
  syncSelectDisplayLabel('filterCategory', 'filterCategoryDisplay');
  syncSelectDisplayLabel('filterStore', 'filterStoreDisplay');
  syncSelectDisplayLabel('sortSelect', 'sortSelectDisplay');
}

function updateActiveFilterBadge() {
  let count = 0;
  if (uiState.formatFilter !== 'all') count++;
  if (uiState.statusFilter !== 'all') count++;
  if (uiState.categoryFilter !== 'all') count++;
  if (uiState.storeFilter !== 'all') count++;

  const hasNonDefaultSort = uiState.sortBy && uiState.sortBy !== 'added-desc';
  const hasAnyActive = count > 0 || hasNonDefaultSort;

  const badge = document.getElementById('activeFilterCount');
  const toggleBtn = document.getElementById('btnToggleFilters');
  const resetBtn = document.getElementById('btnResetFilters');
  const quickResetBtn = document.getElementById('btnQuickResetFilters');

  if (badge) {
    badge.textContent = String(count);
    badge.classList.toggle('hidden', count === 0);
  }
  if (toggleBtn) {
    toggleBtn.classList.toggle('has-active', hasAnyActive);
  }
  if (resetBtn) {
    resetBtn.classList.toggle('hidden', !hasAnyActive);
  }
  if (quickResetBtn) {
    quickResetBtn.classList.toggle('hidden', !hasAnyActive);
  }
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
    'UpolujEbooka', 'Publio', 'Woblink', 'Legimi', 'Ebookpoint', 'Antykwariat', 'Prezent', 'Targi Książki'
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
   SERWIS POBIERANIA DANYCH I OKŁADKI PO NUMERZE ISBN ORAZ TYTULE
   (Biblioteka Narodowa + Apple Books + Open Library + Google Books)
   ========================================================================== */

function normalizeIsbn(raw) {
  return String(raw || '')
    .replace(/[^0-9Xx]/g, '')
    .toUpperCase();
}

async function fetchWithTimeout(url, timeoutMs = 8500) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Most CORS dla API Biblioteki Narodowej (data.bn.org.pl oraz katalogi.bn.org.pl),
 * które nie wysyłają nagłówka Access-Control-Allow-Origin, przez co Safari blokowało bezpośredni fetch().
 */
async function fetchJsonViaCorsBridge(targetUrl, timeoutMs = 8500) {
  const jinaUrl = `https://r.jina.ai/${targetUrl}`;
  try {
    const res = await fetchWithTimeout(jinaUrl, timeoutMs);
    if (res.ok) {
      const text = await res.text();
      let payload = text.trim();
      const marker = 'Markdown Content:';
      const markerIdx = payload.indexOf(marker);
      if (markerIdx !== -1) {
        payload = payload.slice(markerIdx + marker.length).trim();
      }
      const braceIdx = payload.indexOf('{');
      if (braceIdx !== -1) {
        const parsed = JSON.parse(payload.slice(braceIdx));
        if (parsed && parsed.data && typeof parsed.data.content === 'string') {
          return JSON.parse(parsed.data.content);
        }
        return parsed;
      }
    }
  } catch (e) {}

  // Fallback bezpośredni (gdyby serwer docelowy dodał nagłówki CORS)
  try {
    const directRes = await fetchWithTimeout(targetUrl, 4500);
    if (directRes.ok) {
      return await directRes.json();
    }
  } catch (e) {}

  return null;
}

function parseOmnisPrimoDoc(doc, fallbackIsbn = '') {
  const pnx = doc?.pnx;
  if (!pnx) return null;
  const addata = pnx.addata || {};
  const disp = pnx.display || {};

  let title = (addata.btitle?.[0] || disp.title?.[0] || '')
    .replace(/\s*\/\s*[^/]+$/, '')
    .replace(/\s*\[Dokument.*?\].*$/i, '')
    .replace(/\.$/, '')
    .trim();
  if (!title) return null;

  let author = '';
  if (addata.aufirst?.[0] && addata.aulast?.[0]) {
    author = `${addata.aufirst[0]} ${addata.aulast[0]}`.trim();
  } else if (addata.au?.[0] || disp.lds01?.[0] || disp.creator?.[0]) {
    const rawAu = (addata.au?.[0] || disp.lds01?.[0] || disp.creator?.[0] || '')
      .split('$$')[0]
      .replace(/\([^)]*\)/g, '')
      .replace(/Autor$/i, '')
      .replace(/\.$/, '')
      .trim();
    if (rawAu.includes(',')) {
      const parts = rawAu.split(',').map((s) => s.trim()).filter(Boolean);
      author = parts.length >= 2 ? `${parts[1]} ${parts[0]}`.trim() : rawAu;
    } else {
      author = rawAu;
    }
  }

  let publisher = (addata.pub?.[0] || disp.publisher?.[0] || '')
    .replace(/^[^:]+:\s*/, '')
    .replace(/[,:;.]+\s*$/, '')
    .replace(/^"|"$/g, '')
    .trim();

  const publishedYear = (addata.date?.[0] || disp.creationdate?.[0] || '').replace(/\D/g, '').slice(0, 4);

  let pages = '';
  const fmtStr = disp.format?.[0] || '';
  const pageMatch =
    fmtStr.match(/(\d+)\s*(?:,\s*\[[^\]]*\]\s*)?(?:s\.|str)/i) ||
    fmtStr.match(/^(\d+)/);
  if (pageMatch) {
    pages = Number(pageMatch[1]);
  }

  const rawGenre = (disp.genre?.[0] || disp.lds12?.[0] || '').replace(/\.$/, '').trim();
  const isbnList = Array.isArray(addata.isbn) ? addata.isbn.map((i) => normalizeIsbn(i)).filter(Boolean) : [];
  const bestIsbn =
    (fallbackIsbn && isbnList.includes(fallbackIsbn) ? fallbackIsbn : '') ||
    isbnList.find((i) => i.length === 13) ||
    isbnList[0] ||
    fallbackIsbn;

  return {
    isbn: bestIsbn,
    title,
    author,
    publisher,
    publishedYear,
    pages,
    category: rawGenre,
    description: '',
    isEbookHint: /online|elektroniczny/i.test(fmtStr)
  };
}

function stripHtmlTags(html) {
  if (!html) return '';
  return String(html)
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, '&')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function translateGenreToPolish(rawGenre) {
  if (!rawGenre) return '';
  const map = {
    'fiction': 'Powieść',
    'fiction & literature': 'Powieść',
    'historical fiction': 'Powieść historyczna',
    'historical mysteries': 'Kryminał / Thriller',
    'crime & thrillers': 'Kryminał / Thriller',
    'mysteries & thrillers': 'Kryminał / Thriller',
    'thrillers': 'Kryminał / Thriller',
    'mystery & detective': 'Kryminał / Thriller',
    'kryminał': 'Kryminał / Thriller',
    'sensacja': 'Kryminał / Thriller',
    'thriller': 'Kryminał / Thriller',
    'horror': 'Powieść grozy',
    'powieść grozy': 'Powieść grozy',
    'powieść amerykańska': 'Powieść',
    'powieść polska': 'Powieść',
    'powieść angielska': 'Powieść',
    'juvenile fiction': 'Literatura młodzieżowa',
    'young adult fiction': 'Young Adult',
    'science fiction': 'Sci-Fi',
    'sci-fi & fantasy': 'Fantasy',
    'fantastyka': 'Fantasy',
    'fantasy': 'Fantasy',
    'romance': 'Obyczajowa / Romans',
    'biography & autobiography': 'Biografia / Historia',
    'biographies & memoirs': 'Biografia / Historia',
    'history': 'Biografia / Historia',
    'historia': 'Biografia / Historia',
    'biografie': 'Biografia / Historia',
    'reportaż': 'Reportaż / Literatura faktu',
    'literatura faktu': 'Reportaż / Literatura faktu',
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

async function fetchFromSwiatCzytnikowEbook(isbn) {
  try {
    const targetUrl = `https://ebooki.swiatczytnikow.pl/ebook/${encodeURIComponent(isbn)}`;
    const jinaUrl = `https://r.jina.ai/${targetUrl}`;
    const res = await fetchWithTimeout(jinaUrl, 8500, {
      headers: { Accept: 'text/plain' }
    });
    if (!res.ok) return null;
    const text = await res.text();
    if (!text || (!text.includes(`ISBN: ${isbn}`) && !text.includes(`/ebook/${isbn}`))) {
      return null;
    }

    // Wyciągnij tytuł z nagłówka "# Tytuł" lub z nagłówka strony "Title: Tytuł, Autor..."
    const h1Match = text.match(/^#\s+([^\n]+)$/m);
    const pageTitleMatch = text.match(/^Title:\s*([^,\n]+)/m);
    const title = (h1Match?.[1] || pageTitleMatch?.[1] || '').trim();
    if (!title || /porównywarka|świat czytników|404/i.test(title)) return null;

    // Autor: [Dan Simmons](...)
    const authorMatch =
      text.match(/Autor:\s*\[([^\]]+)\]/i) ||
      text.match(/Autor:\s*([^\n\[]+)/i);
    const author = (authorMatch?.[1] || '').trim();

    // Wydawnictwo: [Mag](...)
    const pubMatch =
      text.match(/Wydawnictwo:\s*\[([^\]]+)\]/i) ||
      text.match(/Wydawnictwo:\s*([^\n\[]+)/i);
    const publisher = (pubMatch?.[1] || '').trim();

    // Okładka wysokiej rozdzielczości ze Świata Czytników
    const coverMatch = text.match(/!\[[^\]]*\]\((https:\/\/static\.swiatczytnikow\.pl\/img\/covers\/[^)\s]+)\)/i);
    const coverUrl = coverMatch?.[1] || '';

    // Gatunek / Tematy: linki do https://ebooki.swiatczytnikow.pl/temat/...
    let rawCategory = '';
    const tagMatches = [...text.matchAll(/\[([^\]]+)\]\(https?:\/\/ebooki\.swiatczytnikow\.pl\/temat\/[^)]+\)/gi)].map(
      (m) => m[1].trim()
    );
    if (tagMatches.length) {
      const preferredTag =
        tagMatches.find((t) =>
          /horror|krymina|thriller|sci-fi|science fiction|fantasy|fantastyka|reporta|biograf|histori/i.test(t)
        ) ||
        tagMatches[0] ||
        '';
      rawCategory = preferredTag;
    }

    // Opis wydawcy (akapity pomiędzy "Oszczędzasz: ..." / "Najniższa cena ..." a "[Pokaż więcej]" / "Kup teraz")
    let description = '';
    const descSectionMatch = text.match(
      /(?:Oszczędzasz:[^\n]*|Najniższa cena[^\n]*|Wydawnictwo:\s*\[[^\]]+\]\([^)]+\))\n+([\s\S]*?)\n+(?:\[Pokaż więcej\]|Kup teraz|Ustaw alert cenowy|Powiadomienia o promocjach|Historia cen)/i
    );
    if (descSectionMatch?.[1]) {
      const paras = descSectionMatch[1]
        .replace(/!\[[^\]]*\]\([^)]+\)/g, '')
        .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
        .split(/\n{2,}/)
        .map((p) => p.trim())
        .filter((p) => p && !/^(?:Najniższa cena|Oszczędzasz:)/i.test(p));
      if (paras.length >= 2 && paras[0].endsWith('...') && paras[1].startsWith(paras[0].slice(0, 35))) {
        paras.shift();
      }
      description = paras.join('\n\n').trim();
    }

    return {
      isbn,
      title,
      author,
      publisher,
      publishedYear: '',
      pages: '',
      category: rawCategory,
      description,
      coverUrl,
      isEbookHint: true
    };
  } catch (e) {
    return null;
  }
}

async function fetchBookDetailsByIsbn(rawIsbn) {
  const isbn = normalizeIsbn(rawIsbn);
  if (isbn.length !== 10 && isbn.length !== 13) {
    throw new Error('Numer ISBN powinien składać się z 10 lub 13 cyfr.');
  }

  const [bnRes, scRes, googleRes, openLibRes, appleRes] = await Promise.allSettled([
    fetchFromBibliotekaNarodowa(isbn),
    fetchFromSwiatCzytnikowEbook(isbn),
    fetchFromGoogleBooks(isbn),
    fetchFromOpenLibrary(isbn),
    fetchFromAppleBooksByIsbn(isbn)
  ]);

  const bnData = bnRes.status === 'fulfilled' ? bnRes.value : null;
  const scData = scRes.status === 'fulfilled' ? scRes.value : null;
  const gData = googleRes.status === 'fulfilled' ? googleRes.value : null;
  const olData = openLibRes.status === 'fulfilled' ? openLibRes.value : null;
  const apData = appleRes.status === 'fulfilled' ? appleRes.value : null;

  if (!bnData && !scData && !gData && !olData && !apData) {
    throw new Error(`Nie znaleziono książki o numerze ISBN ${isbn} w katalogach online. Wyszukaj ją po tytule poniżej.`);
  }

  const rawCategory = pickBestString(
    bnData?.category,
    scData?.category,
    gData?.category,
    apData?.category,
    olData?.category
  );

  const merged = {
    isbn,
    title: pickBestString(bnData?.title, scData?.title, gData?.title, apData?.title, olData?.title),
    author: pickBestString(bnData?.author, scData?.author, gData?.author, apData?.author, olData?.author),
    publisher: pickBestString(bnData?.publisher, scData?.publisher, gData?.publisher, olData?.publisher, apData?.publisher),
    publishedYear: pickBestString(bnData?.publishedYear, gData?.publishedYear, olData?.publishedYear, apData?.publishedYear),
    pages: bnData?.pages || gData?.pages || olData?.pages || '',
    category: translateGenreToPolish(rawCategory),
    description: pickBestString(scData?.description, gData?.description, apData?.description, olData?.description, bnData?.description),
    coverUrl: pickBestString(scData?.coverUrl, gData?.coverUrl, apData?.coverUrl, olData?.coverUrl),
    isEbookHint: Boolean(scData?.isEbookHint || bnData?.isEbookHint || gData?.isEbookHint),
    sources: [
      bnData ? 'Biblioteka Narodowa' : null,
      scData ? 'Świat Czytników (E-book)' : null,
      gData ? 'Google Books' : null,
      apData ? 'Apple Books' : null,
      olData ? 'Open Library' : null
    ].filter(Boolean)
  };

  // Jeśli brakuje okładki, opisu, liczby stron lub roku polskiego wydania (np. przy ISBN e-booka ze Świata Czytników
  // lub wydaniu papierowym z Biblioteki Narodowej) — dociągnij brakujące pola po tytule i autorze!
  if ((!merged.coverUrl || !merged.description || !merged.pages || !merged.publishedYear) && merged.title) {
    const needPolishMeta = !merged.pages || !merged.publishedYear;
    const enriched = await enrichBookByTitleAuthor(merged.title, merged.author, isbn, needPolishMeta);
    if (!merged.coverUrl && enriched.coverUrl) {
      merged.coverUrl = enriched.coverUrl;
    }
    if (!merged.description && enriched.description) {
      merged.description = enriched.description;
    }
    if (!merged.category && enriched.category) {
      merged.category = translateGenreToPolish(enriched.category);
    }
    if (!merged.pages && enriched.pages) {
      merged.pages = enriched.pages;
    }
    if (!merged.publishedYear && enriched.publishedYear) {
      merged.publishedYear = enriched.publishedYear;
    }
    if (!merged.publisher && enriched.publisher) {
      merged.publisher = enriched.publisher;
    }
    if (enriched.source && !merged.sources.includes(enriched.source)) {
      merged.sources.push(enriched.source);
    }
  }

  return merged;
}

async function fetchFromGoogleBooks(isbn) {
  try {
    let url = `https://www.googleapis.com/books/v1/volumes?q=isbn:${encodeURIComponent(isbn)}&maxResults=2`;
    let res = await fetchWithTimeout(url, 6500);
    let data = res.ok ? await res.json() : null;

    if (!data?.items?.length && res.status !== 429) {
      url = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(isbn)}&maxResults=2`;
      res = await fetchWithTimeout(url, 6500);
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
  } catch (e) {
    return null;
  }
}

function parseBibliotekaNarodowaBib(bib, fallbackIsbn = '') {
  if (!bib) return null;
  const rawTitle = bib.title || '';
  const isEbookHint = /dokument elektroniczny/i.test(rawTitle);

  let cleanTitle = rawTitle
    .replace(/\s*\/\s*[^/]+$/, '')
    .replace(/\s*\/\s*$/, '')
    .replace(/\s*\[Dokument.*?\].*$/i, '')
    .replace(/\.$/, '')
    .trim();

  let marcAuthor = '';
  let marcPublisher = '';
  let marcGenre = '';
  let marcIsbn = '';
  let pages = '';

  if (Array.isArray(bib.marc?.fields)) {
    for (const f of bib.marc.fields) {
      // Pole 100: Główny autor książki (bez tłumaczy i redaktorów)
      if (f['100'] && Array.isArray(f['100'].subfields) && !marcAuthor) {
        const subA = f['100'].subfields.find((sf) => sf.a)?.a || '';
        if (subA) marcAuthor = subA.replace(/\.$/, '').trim();
      }
      // Pole 245: Tytuł właściwy ($a + $b)
      if (f['245'] && Array.isArray(f['245'].subfields)) {
        const subA = f['245'].subfields.find((sf) => sf.a)?.a || '';
        const subB = f['245'].subfields.find((sf) => sf.b)?.b || '';
        const combined = `${subA} ${subB}`
          .replace(/\s*[/:;]\s*$/, '')
          .replace(/\s*\[Dokument.*?\].*$/i, '')
          .trim();
        if (combined) cleanTitle = combined;
      }
      // Pole 260 lub 264: Wydawnictwo ($b)
      const pubField = f['260'] || f['264'];
      if (pubField && Array.isArray(pubField.subfields) && !marcPublisher) {
        const subB = pubField.subfields.find((sf) => sf.b)?.b || '';
        if (subB) {
          marcPublisher = subB.replace(/[,:;.]+\s*$/, '').replace(/^"|"$/g, '').trim();
        }
      }
      // Pole 300: Liczba stron (np. "815, [1] strona ;" lub "320 s.")
      if (f['300'] && Array.isArray(f['300'].subfields) && !pages) {
        const subA = f['300'].subfields.find((sf) => sf.a)?.a || '';
        const match =
          subA.match(/(\d+)\s*(?:,\s*\[[^\]]*\]\s*)?(?:s\.|str)/i) ||
          subA.match(/^(\d+)/);
        if (match) {
          pages = Number(match[1]);
        }
      }
      // Pole 655: Gatunek literacki (np. "Powieść grozy")
      if (f['655'] && Array.isArray(f['655'].subfields) && !marcGenre) {
        const subA = f['655'].subfields.find((sf) => sf.a)?.a || '';
        if (subA) marcGenre = subA.replace(/\.$/, '').trim();
      }
      // Pole 020: Numer ISBN
      if (f['020'] && Array.isArray(f['020'].subfields) && !marcIsbn) {
        const subA = f['020'].subfields.find((sf) => sf.a)?.a || '';
        const norm = normalizeIsbn(subA);
        if (norm.length === 13 || norm.length === 10) marcIsbn = norm;
      }
    }
  }

  let rawAuthor = marcAuthor;
  if (!rawAuthor) {
    // Wytnij tłumaczy/wydawców doklejonych w ogólnym polu bib.author
    rawAuthor = (bib.author || '')
      .split(/\([0-9? -]+\)/)[0]
      .replace(/\([^)]*\)/g, '')
      .replace(/\.$/, '')
      .trim();
  }
  if (rawAuthor.includes(',')) {
    const parts = rawAuthor.split(',').map((s) => s.trim()).filter(Boolean);
    if (parts.length >= 2) {
      rawAuthor = `${parts[1]} ${parts[0]}`.trim();
    }
  }

  const rawPublisher = marcPublisher || (bib.publisher || '').split(',')[0].replace(/\.$/, '').trim();
  const rawCategory = marcGenre || (bib.genre || bib.subject || '').split(';')[0].trim();
  const cleanIsbn = marcIsbn || normalizeIsbn(bib.isbnIssn) || fallbackIsbn;

  return {
    isbn: cleanIsbn,
    title: cleanTitle,
    author: rawAuthor,
    publisher: rawPublisher,
    publishedYear: (bib.publicationYear || '').replace(/\D/g, '').slice(0, 4),
    pages,
    category: rawCategory,
    description: '',
    isEbookHint
  };
}

async function fetchFromBibliotekaNarodowa(isbn) {
  try {
    // 1. Zapytanie do API Biblioteki Narodowej (z limit=1 i mostem CORS dla Safari)
    const bnUrl = `https://data.bn.org.pl/api/institutions/bibs.json?isbnIssn=${encodeURIComponent(isbn)}&limit=1`;
    const bnData = await fetchJsonViaCorsBridge(bnUrl, 8500);
    if (bnData?.bibs?.length) {
      const parsed = parseBibliotekaNarodowaBib(bnData.bibs[0], isbn);
      if (parsed && parsed.title) return parsed;
    }

    // 2. Fallback do nowego katalogu OMNIS Primo Biblioteki Narodowej
    const omnisUrl = `https://katalogi.bn.org.pl/primaws/rest/pub/pnxs?q=${encodeURIComponent(
      'any,contains,' + isbn
    )}&vid=48OMNIS_NLOP:48OMNIS_NLOP&lang=pl&offset=0&limit=1`;
    const omnisData = await fetchJsonViaCorsBridge(omnisUrl, 8000);
    if (omnisData?.docs?.length) {
      const parsedOmnis = parseOmnisPrimoDoc(omnisData.docs[0], isbn);
      if (parsedOmnis && parsedOmnis.title) return parsedOmnis;
    }
    return null;
  } catch (e) {
    return null;
  }
}

async function fetchFromOpenLibrary(isbn) {
  try {
    const key = `ISBN:${isbn}`;
    const url = `https://openlibrary.org/api/books?bibkeys=${encodeURIComponent(key)}&format=json&jscmd=data`;
    const res = await fetchWithTimeout(url, 7000);
    if (res.ok) {
      const data = await res.json();
      const book = data[key];
      if (book) {
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
    }
  } catch (e) {}
  return null;
}

async function fetchFromAppleBooksByIsbn(isbn) {
  try {
    const url = `https://itunes.apple.com/lookup?isbn=${encodeURIComponent(isbn)}&country=pl`;
    const res = await fetchWithTimeout(url, 6000);
    if (!res.ok) return null;
    const data = await res.json();
    const item = data?.results?.[0];
    if (!item) return null;

    const cover = (item.artworkUrl100 || '')
      .replace('100x100bb', '600x600bb')
      .replace(/^http:\/\//i, 'https://');
    const genres = (item.genres || []).filter((g) => g.toLowerCase() !== 'books' && g.toLowerCase() !== 'książki');

    return {
      title: item.trackName || item.collectionName || '',
      author: item.artistName || '',
      publisher: item.sellerName || '',
      publishedYear: (item.releaseDate || '').slice(0, 4),
      category: genres[0] || '',
      description: stripHtmlTags(item.description || ''),
      coverUrl: cover
    };
  } catch (e) {
    return null;
  }
}

async function enrichBookByTitleAuthor(title, author, isbn = '', needPolishMeta = false) {
  const result = {
    coverUrl: '',
    description: '',
    category: '',
    pages: '',
    publishedYear: '',
    publisher: '',
    source: ''
  };
  const cleanTitle = (title || '').trim();
  const cleanAuthor = (author || '').split(',')[0].trim();
  const q = `${cleanTitle} ${cleanAuthor}`.trim();

  // 1. Odpytaj równolegle Świat Czytników, Apple Books (iTunes PL), Open Library Search, Google Books, okładkę OpenLibrary po ISBN
  //    oraz opcjonalnie katalog OMNIS Biblioteki Narodowej (gdy mamy e-booka ze Świata Czytników i chcemy dociągnąć liczbę stron / rok wydania)
  const olIsbnCoverUrl = isbn ? `https://covers.openlibrary.org/b/isbn/${isbn}-L.jpg?default=false` : '';
  const [scSearchRes, applePlRes, openLibSearchRes, googleSearchRes, olCoverExistsRes, bnQueryRes] = await Promise.allSettled([
    searchSwiatCzytnikowByQuery(q),
    fetchWithTimeout(
      `https://itunes.apple.com/search?term=${encodeURIComponent(q)}&media=ebook&limit=5&country=pl`,
      6000
    ).then((r) => (r.ok ? r.json() : null)),
    fetchWithTimeout(
      `https://openlibrary.org/search.json?q=${encodeURIComponent(q)}&limit=5`,
      6500
    ).then((r) => (r.ok ? r.json() : null)),
    fetchWithTimeout(
      `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(q)}&maxResults=4`,
      6000
    ).then((r) => (r.ok ? r.json() : null)),
    olIsbnCoverUrl ? checkImageExists(olIsbnCoverUrl) : Promise.resolve(false),
    needPolishMeta ? searchBibliotekaNarodowaByQuery(q) : Promise.resolve([])
  ]);

  // Okładki i opisy polskich wydań ze Świata Czytników mają najwyższy priorytet dla polskich książek
  const scItems = scSearchRes.status === 'fulfilled' ? scSearchRes.value || [] : [];
  for (const scItem of scItems) {
    if (!result.coverUrl && scItem.coverUrl) {
      result.coverUrl = scItem.coverUrl;
      result.source = 'Świat Czytników (E-book)';
    }
    if (!result.description && scItem.description) {
      result.description = scItem.description;
      if (!result.source) result.source = 'Świat Czytników (E-book)';
    }
  }

  if (!result.coverUrl && olCoverExistsRes.status === 'fulfilled' && olCoverExistsRes.value) {
    result.coverUrl = `https://covers.openlibrary.org/b/isbn/${isbn}-L.jpg`;
    if (!result.source) result.source = 'Open Library';
  }

  // Jeśli szukaliśmy metadanych polskiego wydania w Bibliotece Narodowej (np. liczba stron i rok wydania dla e-booka)
  const bnItems = bnQueryRes.status === 'fulfilled' ? bnQueryRes.value || [] : [];
  for (const bnItem of bnItems) {
    if (!result.pages && bnItem.pages) result.pages = bnItem.pages;
    if (!result.publishedYear && bnItem.publishedYear) result.publishedYear = bnItem.publishedYear;
    if (!result.publisher && bnItem.publisher) result.publisher = bnItem.publisher;
    if (!result.category && bnItem.category) result.category = bnItem.category;
    if (bnItem.pages || bnItem.publishedYear) {
      if (!result.source) result.source = 'Biblioteka Narodowa';
      break;
    }
  }

  // Przeszukaj wyniki Google Books (jeśli brak limitu 429)
  const gItems = googleSearchRes.status === 'fulfilled' ? googleSearchRes.value?.items || [] : [];
  for (const item of gItems) {
    const info = item.volumeInfo || {};
    const links = info.imageLinks;
    if (!result.coverUrl && (links?.thumbnail || links?.smallThumbnail)) {
      result.coverUrl = (links.extraLarge || links.large || links.medium || links.thumbnail || links.smallThumbnail)
        .replace(/^http:\/\//i, 'https://')
        .replace('&edge=curl', '');
      result.source = 'Google Books';
    }
    if (!result.description && info.description) {
      result.description = info.description;
    }
    if (!result.category && Array.isArray(info.categories) && info.categories[0]) {
      result.category = info.categories[0];
    }
    if (!result.pages && info.pageCount) {
      result.pages = info.pageCount;
    }
    if (!result.publishedYear && info.publishedDate) {
      result.publishedYear = info.publishedDate.slice(0, 4);
    }
  }

  // Przeszukaj wyniki Apple Books (niezawodne okładki HD 600x600 i opisy bez limitów 429!)
  const apItems = applePlRes.status === 'fulfilled' ? applePlRes.value?.results || [] : [];
  for (const item of apItems) {
    if (!result.coverUrl && item.artworkUrl100) {
      result.coverUrl = item.artworkUrl100
        .replace('100x100bb', '600x600bb')
        .replace(/^http:\/\//i, 'https://');
      if (!result.source) result.source = 'Apple Books';
    }
    if (!result.description && item.description) {
      result.description = stripHtmlTags(item.description);
      if (!result.source) result.source = 'Apple Books';
    }
    const genres = (item.genres || []).filter((g) => g.toLowerCase() !== 'books');
    if (!result.category && genres[0]) {
      result.category = genres[0];
    }
    if (!result.publishedYear && item.releaseDate) {
      result.publishedYear = item.releaseDate.slice(0, 4);
    }
  }

  // Przeszukaj wyniki Open Library Search
  const olDocs = openLibSearchRes.status === 'fulfilled' ? openLibSearchRes.value?.docs || [] : [];
  for (const doc of olDocs) {
    if (!result.coverUrl && doc.cover_i) {
      result.coverUrl = `https://covers.openlibrary.org/b/id/${doc.cover_i}-L.jpg`;
      if (!result.source) result.source = 'Open Library';
      break;
    }
  }

  return result;
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

  const handleDetailRatingSelect = (newRating) => {
    book.rating = newRating;
    book.updatedAt = new Date().toISOString();
    renderInteractiveStars('detailStars', newRating, handleDetailRatingSelect);
    updateDetailRatingLabel(newRating);
    saveLocalData(true);
    renderAll();
    showToast(
      newRating > 0
        ? `Oceniono „${book.title}” na ${newRating}/5`
        : `Wyczyszczono ocenę dla „${book.title}”`
    );
  };
  renderInteractiveStars('detailStars', Number(book.rating) || 0, handleDetailRatingSelect);
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
  const rawInput = document.getElementById('isbnInput').value.trim();
  const btn = document.getElementById('btnFetchIsbn');

  const clean = normalizeIsbn(rawInput);
  // Jeśli użytkownik wpisał tytuł zamiast cyfr ISBN w pierwszym polu — automatycznie uruchom wyszukiwanie po tytule!
  if (rawInput && clean.length !== 10 && clean.length !== 13 && /[a-zA-ZąćęłńóśźżĄĆĘŁŃÓŚŹŻ]{2,}/.test(rawInput)) {
    document.getElementById('titleSearchDrawer').classList.remove('hidden');
    document.getElementById('titleQueryInput').value = rawInput;
    await handleSearchByTitle();
    return;
  }

  if (!clean) {
    showLookupFeedback('warn', 'Wpisz 10 lub 13-cyfrowy numer ISBN z okładki książki.');
    return;
  }

  btn.disabled = true;
  showLookupFeedback(
    'loading',
    `Szukam książki o ISBN ${clean} (Biblioteka Narodowa, Świat Czytników E-booki, Apple Books, OpenLibrary, Google Books)...`
  );

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

    const srcInfo = data.sources.length ? ` (źródło: ${data.sources.join(' + ')})` : '';
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

/* Wielokatalogowe wyszukiwanie po tytule i autorze (Biblioteka Narodowa OMNIS + Apple Books + OpenLibrary + Google Books) */
async function searchBibliotekaNarodowaByQuery(query) {
  const items = [];
  try {
    // Katalog OMNIS Primo Biblioteki Narodowej obsługuje jednoczesne wyszukiwanie tytułu i autora w jednym zapytaniu!
    const omnisUrl = `https://katalogi.bn.org.pl/primaws/rest/pub/pnxs?q=${encodeURIComponent(
      'any,contains,' + query
    )}&qInclude=facet_rtype,exact,books&vid=48OMNIS_NLOP:48OMNIS_NLOP&lang=pl&offset=0&limit=5`;

    const omnisData = await fetchJsonViaCorsBridge(omnisUrl, 7500);
    if (Array.isArray(omnisData?.docs)) {
      for (const doc of omnisData.docs) {
        const parsed = parseOmnisPrimoDoc(doc);
        if (parsed && parsed.title) {
          items.push({
            isbn: parsed.isbn || '',
            title: parsed.title,
            author: parsed.author || 'Autor nieznany',
            publisher: parsed.publisher || '',
            publishedYear: parsed.publishedYear || '',
            pages: parsed.pages || '',
            category: translateGenreToPolish(parsed.category || ''),
            description: '',
            coverUrl: '',
            source: 'Biblioteka Narodowa'
          });
        }
      }
    }
  } catch (e) {}

  return items;
}

async function searchSwiatCzytnikowByQuery(query) {
  const items = [];
  try {
    const slug = query
      .trim()
      .replace(/\s+/g, '-')
      .replace(/%/g, '%25');
    if (slug.length < 3) return items;

    const targetUrl = `https://ebooki.swiatczytnikow.pl/szukaj/${encodeURIComponent(slug)}`;
    const jinaUrl = `https://r.jina.ai/${targetUrl}`;
    const res = await fetchWithTimeout(jinaUrl, 7500, {
      headers: { Accept: 'text/plain' }
    });
    if (!res.ok) return items;
    const text = await res.text();

    const pattern =
      /\[!\[Image\s+\d+:\s*Okładka książki:\s*([^\]]+)\]\((https:\/\/static\.swiatczytnikow\.pl\/img\/covers\/[^)\s]+)\)\]\(https:\/\/ebooki\.swiatczytnikow\.pl\/ebook\/(\d{10,13}),([^.)]+)\.html\)\s*([^\n[]*)/gi;

    let match;
    while ((match = pattern.exec(text)) !== null && items.length < 5) {
      const title = match[1].trim();
      const coverUrl = match[2].replace('/small/', '/big/');
      const isbn = match[3].trim();
      const urlSlug = match[4] || '';
      const authorSlug = urlSlug.split('--')[0] || '';
      const author = authorSlug
        ? authorSlug
            .split('-')
            .filter(Boolean)
            .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
            .join(' ')
        : 'Autor nieznany';
      const snippet = (match[5] || '').trim();

      items.push({
        isbn,
        title,
        author,
        publisher: '',
        publishedYear: '',
        pages: '',
        category: '',
        description: snippet,
        coverUrl,
        isEbookHint: true,
        source: 'Świat Czytników (E-book)'
      });
    }
  } catch (e) {}
  return items;
}

async function handleSearchByTitle() {
  const inputEl = document.getElementById('titleQueryInput');
  const query = inputEl.value.trim();
  const resultsEl = document.getElementById('titleSearchResults');
  if (!query) return;

  // Schowaj klawiaturę ekranową iOS po zatwierdzeniu wyszukiwania, aby nie przesuwała widoku
  inputEl.blur();
  resultsEl.scrollTop = 0;

  // Jeśli użytkownik wkleił numer ISBN (np. z myślnikami 978-83-670-2382-5) w polu wyszukiwania po tytule — pobierz od razu po ISBN!
  const cleanPossibleIsbn = normalizeIsbn(query);
  if ((cleanPossibleIsbn.length === 13 || cleanPossibleIsbn.length === 10) && !/[a-zA-WY-ZąćęłńóśźżĄĆĘŁŃÓŚŹŻ]{2,}/.test(query)) {
    document.getElementById('isbnInput').value = cleanPossibleIsbn;
    await handleIsbnLookup();
    return;
  }

  resultsEl.innerHTML = `<div class="title-search-status" style="color:#3b82f6;">Szukam „${escapeHtml(
    query
  )}” (Biblioteka Narodowa, Świat Czytników E-booki, Apple Books, OpenLibrary, Google Books)...</div>`;

  try {
    const [bnRes, scRes, applePlRes, openLibRes, googleRes] = await Promise.allSettled([
      searchBibliotekaNarodowaByQuery(query),
      searchSwiatCzytnikowByQuery(query),
      fetchWithTimeout(
        `https://itunes.apple.com/search?term=${encodeURIComponent(query)}&media=ebook&limit=6&country=pl`,
        6500
      ).then((r) => (r.ok ? r.json() : null)),
      fetchWithTimeout(
        `https://openlibrary.org/search.json?q=${encodeURIComponent(query)}&limit=6`,
        6500
      ).then((r) => (r.ok ? r.json() : null)),
      fetchWithTimeout(
        `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&maxResults=6`,
        6000
      ).then((r) => (r.ok ? r.json() : null))
    ]);

    const candidates = [];

    // 1. Wyniki z Biblioteki Narodowej (polskie wydania z ISBN, wydawnictwem i liczbą stron)
    if (bnRes.status === 'fulfilled' && Array.isArray(bnRes.value)) {
      candidates.push(...bnRes.value);
    }

    // 1b. Wyniki polskich e-booków ze Świata Czytników (z polskim ISBN e-booka i okładką HD)
    if (scRes.status === 'fulfilled' && Array.isArray(scRes.value)) {
      candidates.push(...scRes.value);
    }

    // 2. Wyniki z Google Books (jeśli dostępne)
    const gItems = googleRes.status === 'fulfilled' ? googleRes.value?.items || [] : [];
    gItems.forEach((item) => {
      const info = item.volumeInfo || {};
      const identifiers = info.industryIdentifiers || [];
      const isbn13 = identifiers.find((id) => id.type === 'ISBN_13')?.identifier;
      const isbn10 = identifiers.find((id) => id.type === 'ISBN_10')?.identifier;
      const cover = (info.imageLinks?.thumbnail || info.imageLinks?.smallThumbnail || '')
        .replace(/^http:\/\//i, 'https://')
        .replace('&edge=curl', '');

      candidates.push({
        isbn: isbn13 || isbn10 || '',
        title: info.title || '',
        author: Array.isArray(info.authors) ? info.authors.join(', ') : 'Nieznany autor',
        publisher: info.publisher || '',
        publishedYear: (info.publishedDate || '').slice(0, 4),
        pages: info.pageCount || '',
        category: Array.isArray(info.categories) ? translateGenreToPolish(info.categories[0]) : '',
        description: info.description || '',
        coverUrl: cover,
        source: 'Google Books'
      });
    });

    // 3. Wyniki z Apple Books (niezawodne okładki HD 600x600 i opisy bez limitów 429)
    const apItems = applePlRes.status === 'fulfilled' ? applePlRes.value?.results || [] : [];
    apItems.forEach((item) => {
      const cover = (item.artworkUrl100 || '')
        .replace('100x100bb', '600x600bb')
        .replace(/^http:\/\//i, 'https://');
      const genres = (item.genres || []).filter((g) => g.toLowerCase() !== 'books');

      candidates.push({
        isbn: '',
        title: item.trackName || item.collectionName || '',
        author: item.artistName || 'Nieznany autor',
        publisher: item.sellerName || '',
        publishedYear: (item.releaseDate || '').slice(0, 4),
        pages: '',
        category: translateGenreToPolish(genres[0] || ''),
        description: stripHtmlTags(item.description || ''),
        coverUrl: cover,
        source: 'Apple Books'
      });
    });

    // 4. Wyniki z Open Library Search
    const olDocs = openLibRes.status === 'fulfilled' ? openLibRes.value?.docs || [] : [];
    olDocs.forEach((doc) => {
      const cover = doc.cover_i ? `https://covers.openlibrary.org/b/id/${doc.cover_i}-L.jpg` : '';
      const firstIsbn = Array.isArray(doc.isbn) ? doc.isbn.find((i) => i.length === 13) || doc.isbn[0] || '' : '';

      candidates.push({
        isbn: firstIsbn,
        title: doc.title || '',
        author: Array.isArray(doc.author_name) ? doc.author_name.join(', ') : 'Nieznany autor',
        publisher: Array.isArray(doc.publisher) ? doc.publisher[0] || '' : '',
        publishedYear: doc.first_publish_year ? String(doc.first_publish_year) : '',
        pages: doc.number_of_pages_median || '',
        category: '',
        description: '',
        coverUrl: cover,
        source: 'Open Library'
      });
    });

    if (candidates.length === 0) {
      resultsEl.innerHTML = `<div class="title-search-status" style="color:#d97706;">Brak wyników dla „${escapeHtml(
        query
      )}”. Spróbuj wpisać sam tytuł lub uzupełnij pola ręcznie poniżej.</div>`;
      return;
    }

    // Wzbogać wzajemnie rekordy z Biblioteki Narodowej i Świata Czytników o okładkę HD, opis, wydawnictwo, rok i liczbę stron
    const firstWithCover = candidates.find((c) => c.coverUrl)?.coverUrl || '';
    const firstWithDesc = candidates.find((c) => c.description)?.description || '';
    const firstWithPub = candidates.find((c) => c.publisher)?.publisher || '';
    const firstWithYear = candidates.find((c) => c.publishedYear)?.publishedYear || '';
    const firstWithPages = candidates.find((c) => c.pages)?.pages || '';
    const firstWithCat = candidates.find((c) => c.category)?.category || '';
    candidates.forEach((c) => {
      if (!c.coverUrl && firstWithCover) c.coverUrl = firstWithCover;
      if (!c.description && firstWithDesc) c.description = firstWithDesc;
      if (!c.publisher && firstWithPub) c.publisher = firstWithPub;
      if (!c.publishedYear && firstWithYear) c.publishedYear = firstWithYear;
      if (!c.pages && firstWithPages) c.pages = firstWithPages;
      if (!c.category && firstWithCat) c.category = firstWithCat;
    });

    // Usuń zduplikowane pozycje i wyświetl do 8 najlepszych wydań
    const unique = [];
    const seenKeys = new Set();
    for (const c of candidates) {
      const key = `${c.title.toLowerCase()}|${c.author.toLowerCase()}|${c.isbn || c.source}`;
      if (!seenKeys.has(key)) {
        seenKeys.add(key);
        unique.push(c);
      }
      if (unique.length >= 8) break;
    }

    resultsEl.innerHTML = '';
    resultsEl.scrollTop = 0;

    unique.forEach((bookItem) => {
      const row = document.createElement('div');
      row.className = 'title-result-item';
      const metaParts = [
        bookItem.author,
        bookItem.publisher ? `${bookItem.publisher}` : '',
        bookItem.publishedYear ? `${bookItem.publishedYear}` : '',
        bookItem.pages ? `${bookItem.pages} str.` : '',
        bookItem.isbn ? `ISBN ${bookItem.isbn}` : ''
      ].filter(Boolean);

      row.innerHTML = `
        ${
          bookItem.coverUrl
            ? `<img src="${escapeHtml(bookItem.coverUrl)}" alt="" loading="lazy" />`
            : `<div class="title-result-thumb-placeholder"></div>`
        }
        <div class="title-result-info">
          <div class="title-result-head">
            <strong>${escapeHtml(bookItem.title || 'Bez tytułu')}</strong>
            <em class="title-result-source">${escapeHtml(bookItem.source)}</em>
          </div>
          <span>${escapeHtml(metaParts.join(' • '))}</span>
        </div>
      `;

      row.addEventListener('click', async () => {
        if (bookItem.isbn) document.getElementById('isbnInput').value = bookItem.isbn;
        if (bookItem.title) document.getElementById('titleInput').value = bookItem.title;
        if (bookItem.author) document.getElementById('authorInput').value = bookItem.author;
        if (bookItem.publisher) document.getElementById('publisherInput').value = bookItem.publisher;
        if (bookItem.publishedYear) document.getElementById('publishedYearInput').value = bookItem.publishedYear;
        if (bookItem.pages) document.getElementById('pagesInput').value = bookItem.pages;
        if (bookItem.category) {
          document.getElementById('categoryInput').value = bookItem.category;
          highlightCategoryChip(bookItem.category);
        }
        if (bookItem.description) document.getElementById('descriptionInput').value = bookItem.description;
        if (bookItem.isEbookHint) setFormFormat('ebook');
        if (bookItem.coverUrl) {
          document.getElementById('coverUrlInput').value = bookItem.coverUrl;
          updateFormCoverPreview(bookItem.coverUrl);
        }

        document.getElementById('titleSearchDrawer').classList.add('hidden');
        showLookupFeedback('success', `Wybrano wydanie: „${bookItem.title}” (${bookItem.source})`);

        // Jeśli wybrano pozycję z Apple Books / OpenLibrary bez polskiego ISBN lub liczby stron,
        // dociągnij w tle dane polskiego wydania z Biblioteki Narodowej przez most CORS!
        if ((!bookItem.isbn || !bookItem.pages || !bookItem.publisher) && bookItem.title) {
          const authorLastName = (bookItem.author || '').split(/\s+/).pop() || '';
          try {
            const qStr = `${bookItem.title} ${authorLastName}`.trim();
            const omnisUrl = `https://katalogi.bn.org.pl/primaws/rest/pub/pnxs?q=${encodeURIComponent(
              'any,contains,' + qStr
            )}&qInclude=facet_rtype,exact,books&vid=48OMNIS_NLOP:48OMNIS_NLOP&lang=pl&offset=0&limit=1`;
            const omnisData = await fetchJsonViaCorsBridge(omnisUrl, 6500);
            if (omnisData?.docs?.length) {
              const bnParsed = parseOmnisPrimoDoc(omnisData.docs[0]);
              if (bnParsed) {
                if (!document.getElementById('isbnInput').value && bnParsed.isbn) {
                  document.getElementById('isbnInput').value = bnParsed.isbn;
                }
                if (!document.getElementById('publisherInput').value && bnParsed.publisher) {
                  document.getElementById('publisherInput').value = bnParsed.publisher;
                }
                if (!document.getElementById('pagesInput').value && bnParsed.pages) {
                  document.getElementById('pagesInput').value = bnParsed.pages;
                }
                if (!document.getElementById('categoryInput').value && bnParsed.category) {
                  const catPl = translateGenreToPolish(bnParsed.category);
                  document.getElementById('categoryInput').value = catPl;
                  highlightCategoryChip(catPl);
                }
              }
            }
          } catch (e) {}
        }
      });

      resultsEl.appendChild(row);
    });
  } catch (e) {
    resultsEl.innerHTML = `<div class="title-search-status" style="color:#ef4444;">Błąd połączenia podczas wyszukiwania.</div>`;
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

  // Otwieranie i zamykanie modalu Ustawień Wyglądu (przycisk zębatki SVG lub kliknięcie w tytuł)
  const openSettings = () => {
    const libInput = document.getElementById('libraryNameInput');
    if (libInput) {
      libInput.value = appData.settings.libraryName || 'Moja Prywatna Biblioteczka';
    }
    openModalById('settingsModal');
  };
  document.getElementById('btnOpenSettings').addEventListener('click', openSettings);
  document.getElementById('libraryTitle').addEventListener('click', openSettings);

  const saveAndCloseSettings = () => {
    const libInput = document.getElementById('libraryNameInput');
    if (libInput && libInput.value.trim()) {
      appData.settings.libraryName = libInput.value.trim();
      document.getElementById('libraryTitle').textContent = appData.settings.libraryName;
      saveLocalData(true);
    }
    closeModalById('settingsModal');
  };
  document.getElementById('btnCloseSettings').addEventListener('click', saveAndCloseSettings);
  document.getElementById('btnDoneSettings').addEventListener('click', saveAndCloseSettings);

  document.getElementById('libraryNameInput').addEventListener('input', (e) => {
    const val = e.target.value.trim() || 'Moja Prywatna Biblioteczka';
    appData.settings.libraryName = val;
    document.getElementById('libraryTitle').textContent = val;
  });

  // Rozwijane / zwijane menu filtrów i sortowania (#btnToggleFilters -> #filtersDrawer)
  const btnToggleFilters = document.getElementById('btnToggleFilters');
  const filtersDrawer = document.getElementById('filtersDrawer');
  btnToggleFilters.addEventListener('click', () => {
    const isNowHidden = filtersDrawer.classList.toggle('hidden');
    uiState.filtersDrawerOpen = !isNowHidden;
    btnToggleFilters.classList.toggle('open', !isNowHidden);
    btnToggleFilters.setAttribute('aria-expanded', String(!isNowHidden));
    saveFilterState();
  });

  // Wspólna funkcja resetowania wszystkich filtrów (z wnętrza szuflady oraz z paska wyszukiwania)
  const resetAllFilters = () => {
    uiState.formatFilter = 'all';
    uiState.statusFilter = 'all';
    uiState.categoryFilter = 'all';
    uiState.storeFilter = 'all';
    uiState.sortBy = 'added-desc';

    document.getElementById('filterStatus').value = 'all';
    document.getElementById('filterCategory').value = 'all';
    document.getElementById('filterStore').value = 'all';
    document.getElementById('sortSelect').value = 'added-desc';

    document.querySelectorAll('.format-filter-group .seg-btn').forEach((b) =>
      b.classList.toggle('active', b.dataset.formatFilter === 'all')
    );

    saveFilterState();
    syncAllFilterSelectDisplays();
    updateActiveFilterBadge();
    renderBookshelf();
    showToast('Zresetowano filtry do domyślnych');
  };

  document.getElementById('btnResetFilters').addEventListener('click', resetAllFilters);
  const btnQuickReset = document.getElementById('btnQuickResetFilters');
  if (btnQuickReset) {
    btnQuickReset.addEventListener('click', resetAllFilters);
  }

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
      saveFilterState();
      updateActiveFilterBadge();
      renderBookshelf();
    });
  });

  // Systemowe listy rozwijane: Status, Gatunek, Sklep, Sortowanie (z synchronizacją etykiety "...")
  document.getElementById('filterStatus').addEventListener('change', (e) => {
    uiState.statusFilter = e.target.value;
    saveFilterState();
    syncSelectDisplayLabel('filterStatus', 'filterStatusDisplay');
    updateActiveFilterBadge();
    renderBookshelf();
  });
  document.getElementById('filterCategory').addEventListener('change', (e) => {
    uiState.categoryFilter = e.target.value;
    saveFilterState();
    syncSelectDisplayLabel('filterCategory', 'filterCategoryDisplay');
    updateActiveFilterBadge();
    renderBookshelf();
  });
  document.getElementById('filterStore').addEventListener('change', (e) => {
    uiState.storeFilter = e.target.value;
    saveFilterState();
    syncSelectDisplayLabel('filterStore', 'filterStoreDisplay');
    updateActiveFilterBadge();
    renderBookshelf();
  });
  document.getElementById('sortSelect').addEventListener('change', (e) => {
    uiState.sortBy = e.target.value;
    saveFilterState();
    syncSelectDisplayLabel('sortSelect', 'sortSelectDisplay');
    updateActiveFilterBadge();
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

  // Wybór koloru drewna półki (w oknie Ustawień)
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
      if (
        ['upolujebooka', 'publio', 'woblink', 'legimi', 'ebookpoint'].includes(store.toLowerCase()) &&
        uiState.formFormat === 'paper'
      ) {
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

  ['settingsModal', 'detailModal', 'bookFormModal', 'syncModal'].forEach((id) => {
    const backdrop = document.getElementById(id);
    if (!backdrop) return;
    backdrop.addEventListener('click', (e) => {
      if (e.target === backdrop) {
        closeModalById(id);
      }
    });
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeModalById('settingsModal');
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
  if (!container) return;
  container.innerHTML = '';
  const numericRating = Number(currentRating) || 0;

  for (let i = 1; i <= 5; i++) {
    const btn = document.createElement('button');
    btn.type = 'button';
    const isFilled = i <= numericRating;
    btn.className = `star-btn ${isFilled ? 'filled' : ''}`;
    btn.setAttribute('aria-checked', String(i === numericRating));
    btn.innerHTML = isFilled ? SVG_ICONS.starFilled(24) : SVG_ICONS.starOutline(24);
    btn.title = `Oceń na ${i}/5`;
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      // Natychmiast odśwież wygląd gwiazdek w aktywnym oknie jeszcze przed wywołaniem callbacku
      renderInteractiveStars(containerId, i, onSelect);
      if (typeof onSelect === 'function') {
        onSelect(i);
      }
    });
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
