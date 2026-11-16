const rootEl = document.getElementById('overlay-root');
const hudCardEl = document.getElementById('hud-card');
const eventBannerEl = document.getElementById('event-banner');
const eventBannerIconEl = document.getElementById('event-banner-icon');
const eventTitleEl = document.getElementById('event-title');
const eventSubtitleEl = document.getElementById('event-subtitle');
const itemToastEl = document.getElementById('item-toast');
const itemToastIconEl = document.getElementById('item-toast-icon');
const itemToastGoldEl = document.getElementById('item-toast-gold');
const itemToastLabelEl = document.getElementById('item-toast-label');
const itemToastNameEl = document.getElementById('item-toast-name');
const champIconEl = document.getElementById('champ-icon');
const champLevelEl = document.getElementById('champ-level');
const deadBadgeEl = document.getElementById('dead-badge');
const respawnTimerEl = document.getElementById('respawn-timer');
const riotIdEl = document.getElementById('riot-id');
const gameTimerEl = document.getElementById('game-timer');
const statKillsEl = document.getElementById('stat-kills');
const statDeathsEl = document.getElementById('stat-deaths');
const statAssistsEl = document.getElementById('stat-assists');
const statTurretsEl = document.getElementById('stat-turrets');
const statCsEl = document.getElementById('stat-cs');
const statGoldEl = document.getElementById('stat-gold');
const statWardEl = document.getElementById('stat-ward');
const killsValueEl = document.getElementById('kills-value');
const deathsValueEl = document.getElementById('deaths-value');
const assistsValueEl = document.getElementById('assists-value');
const turretsValueEl = document.getElementById('turrets-value');
const csValueEl = document.getElementById('cs-value');
const goldValueEl = document.getElementById('gold-value');
const wardValueEl = document.getElementById('ward-value');
const itemsRowEl = document.getElementById('items-row');
const runeSectionEl = document.getElementById('rune-section');
const runeTreesLabelEl = document.getElementById('rune-trees-label');
const runeListEl = document.getElementById('rune-list');
const historySectionEl = document.getElementById('history-section');
const purchaseHistoryRowEl = document.getElementById('purchase-history-row');

let currentConfig = {
  itemDisplayMode: 'icon-only',
  itemIconSize: 64,
  itemEntryAnimation: 'zoom',
  itemExitAnimation: 'fade',
  itemDurationSec: 4.5,
  visibility: {
    showHudCard: true,
    showKills: true,
    showDeaths: true,
    showAssists: true,
    showTurrets: true,
    showCs: true,
    showGold: true,
    showWard: true,
    showInventory: true,
    showPurchaseHistory: true,
    showRunePage: true,
    showEventBanner: true,
    showItemToast: true,
    showSoldItemToast: true,
    showKillEvents: true,
    showDeathEvents: true,
    showAssistEvents: true,
    showTurretEvents: true,
    showObjectiveEvents: true,
  },
};

let hasInitializedItemQueue = false;
const seenItemUids = new Set();
const itemQueue = [];
let isPlayingItem = false;
let itemToastHideTimer = null;
let itemToastExitTimer = null;

let hasInitializedEventQueue = false;
const seenEventIds = new Set();
const eventQueue = [];
let isPlayingEvent = false;
let eventHideTimer = null;
let eventExitTimer = null;

function formatTime(seconds) {
  const total = Math.max(0, Math.floor(seconds));
  const mins = String(Math.floor(total / 60)).padStart(2, '0');
  const secs = String(total % 60).padStart(2, '0');
  return `${mins}:${secs}`;
}

function hexToRgb(hex) {
  const clean = String(hex || '').replace('#', '');
  if (clean.length !== 6) return '10, 14, 23';
  const r = parseInt(clean.slice(0, 2), 16);
  const g = parseInt(clean.slice(2, 4), 16);
  const b = parseInt(clean.slice(4, 6), 16);
  if ([r, g, b].some((n) => Number.isNaN(n))) return '10, 14, 23';
  return `${r}, ${g}, ${b}`;
}

function replacePrefixedClass(el, prefix, nextValue) {
  if (!el) return;
  Array.from(el.classList)
    .filter((c) => c.startsWith(prefix))
    .forEach((c) => el.classList.remove(c));
  if (nextValue) {
    el.classList.add(`${prefix}${nextValue}`);
  }
}

function applyHudConfig(hud) {
  const h = hud || {};
  const layout = h.layout || 'classic';
  const position = h.position || 'bottom-left';
  const theme = h.theme || 'lol-gold';
  const font = h.fontFamily || 'default';
  const scale = Number.isFinite(Number(h.scale)) ? Number(h.scale) / 100 : 1;
  const opacity = Number.isFinite(Number(h.bgOpacity)) ? Number(h.bgOpacity) / 100 : 0.88;
  const radius = Number.isFinite(Number(h.borderRadius)) ? Number(h.borderRadius) : 12;

  replacePrefixedClass(rootEl, 'layout-', layout);
  replacePrefixedClass(rootEl, 'pos-', position);
  replacePrefixedClass(rootEl, 'theme-', theme);
  replacePrefixedClass(rootEl, 'font-', font);

  rootEl.style.setProperty('--hud-scale', String(scale));
  rootEl.style.setProperty('--hud-bg-opacity', String(opacity));
  rootEl.style.setProperty('--hud-radius', `${radius}px`);

  if (theme === 'custom') {
    const accent = h.accentColor || '#c8aa6e';
    const bgRgb = hexToRgb(h.bgColor || '#0a0e17');
    rootEl.style.setProperty('--gold', accent);
    rootEl.style.setProperty('--border-gold', accent);
    rootEl.style.setProperty('--hud-bg-rgb', bgRgb);
  } else {
    rootEl.style.removeProperty('--gold');
    rootEl.style.removeProperty('--border-gold');
    rootEl.style.removeProperty('--hud-bg-rgb');
  }

  champLevelEl.classList.toggle('is-hidden', h.showChampLevel === false);
  gameTimerEl.classList.toggle('is-hidden', h.showTimer === false);
  riotIdEl.classList.toggle('is-hidden', h.showRiotId === false);
}

function applyConfig(config) {
  if (!config) return;
  currentConfig = config;

  const v = config.visibility || {};
  hudCardEl.classList.toggle('is-hidden', v.showHudCard === false);
  statKillsEl.classList.toggle('is-hidden', v.showKills === false);
  statDeathsEl.classList.toggle('is-hidden', v.showDeaths === false);
  statAssistsEl.classList.toggle('is-hidden', v.showAssists === false);
  statTurretsEl.classList.toggle('is-hidden', v.showTurrets === false);
  statCsEl.classList.toggle('is-hidden', v.showCs === false);
  statGoldEl.classList.toggle('is-hidden', v.showGold === false);
  statWardEl.classList.toggle('is-hidden', v.showWard === false);
  itemsRowEl.classList.toggle('is-hidden', v.showInventory === false);
  historySectionEl.classList.toggle('is-hidden', v.showPurchaseHistory === false);
  runeSectionEl.classList.toggle('is-hidden', v.showRunePage === false);
  eventBannerEl.classList.toggle('is-hidden', v.showEventBanner === false);

  applyHudConfig(config.hudConfig);

  itemToastEl.classList.toggle('icon-only', config.itemDisplayMode !== 'icon-and-name');
  itemToastEl.style.setProperty('--item-toast-size', `${config.itemIconSize || 64}px`);
}

function clearToastTimers() {
  if (itemToastHideTimer) {
    clearTimeout(itemToastHideTimer);
    itemToastHideTimer = null;
  }
  if (itemToastExitTimer) {
    clearTimeout(itemToastExitTimer);
    itemToastExitTimer = null;
  }
}

function clearToastAnimClasses() {
  const toRemove = Array.from(itemToastEl.classList).filter(
    (c) => c.startsWith('anim-in-') || c.startsWith('anim-out-'),
  );
  for (const c of toRemove) {
    itemToastEl.classList.remove(c);
  }
}

function playItemToastEntry(entry) {
  const isSoldOrUndo = entry.action === 'sell' || entry.action === 'undo';
  const isUndo = entry.action === 'undo';
  if (!isSoldOrUndo && currentConfig.visibility?.showItemToast === false) {
    isPlayingItem = false;
    processItemQueue();
    return;
  }
  if (isSoldOrUndo && currentConfig.visibility?.showSoldItemToast === false) {
    isPlayingItem = false;
    processItemQueue();
    return;
  }

  isPlayingItem = true;
  clearToastTimers();
  clearToastAnimClasses();

  itemToastIconEl.src = entry.iconUrl;
  itemToastNameEl.textContent = entry.name || '';
  itemToastLabelEl.textContent = isUndo
    ? 'ITEM DESFEITO'
    : isSoldOrUndo
      ? 'ITEM VENDIDO'
      : 'ITEM COMPRADO';
  itemToastEl.classList.toggle('sold', isSoldOrUndo);
  itemToastEl.classList.toggle('icon-only', currentConfig.itemDisplayMode !== 'icon-and-name');
  itemToastEl.style.setProperty('--item-toast-size', `${currentConfig.itemIconSize || 64}px`);

  if (isSoldOrUndo && typeof entry.goldGained === 'number') {
    itemToastGoldEl.textContent = `+${entry.goldGained}g`;
    itemToastGoldEl.classList.remove('hidden');
  } else {
    itemToastGoldEl.classList.add('hidden');
  }

  itemToastEl.classList.remove('hidden');

  if (window.playLoLSound) {
    window.playLoLSound(isSoldOrUndo ? 'itemSell' : 'itemBuy', currentConfig.soundConfig, 'overlay');
  }

  void itemToastEl.offsetWidth;
  itemToastEl.classList.add(`anim-in-${currentConfig.itemEntryAnimation || 'zoom'}`);

  const durationMs = Math.max(1000, Math.round((currentConfig.itemDurationSec || 4.5) * 1000));

  itemToastExitTimer = setTimeout(() => {
    clearToastAnimClasses();
    itemToastEl.classList.add(`anim-out-${currentConfig.itemExitAnimation || 'fade'}`);

    itemToastHideTimer = setTimeout(() => {
      itemToastEl.classList.add('hidden');
      clearToastAnimClasses();
      isPlayingItem = false;
      processItemQueue();
    }, 320);
  }, durationMs);
}

function processItemQueue() {
  if (isPlayingItem || itemQueue.length === 0) return;
  const next = itemQueue.shift();
  if (next) {
    playItemToastEntry(next);
  }
}

function enqueueItemsFromState(state) {
  const queue = Array.isArray(state.itemQueue) ? state.itemQueue : [];
  if (!hasInitializedItemQueue) {
    for (const item of queue) {
      if (item && item.uid) seenItemUids.add(item.uid);
    }
    hasInitializedItemQueue = true;
    return;
  }

  for (const item of queue) {
    if (item && item.uid && !seenItemUids.has(item.uid)) {
      seenItemUids.add(item.uid);
      itemQueue.push(item);
    }
  }
  processItemQueue();
}

function shouldShowEvent(event) {
  if (!event) return false;
  const v = currentConfig.visibility || {};
  if (v.showEventBanner === false) return false;

  switch (event.name) {
    case 'ChampionKill':
      return v.showKillEvents !== false;
    case 'ChampionDeath':
      return v.showDeathEvents !== false;
    case 'ChampionAssist':
      return v.showAssistEvents !== false;
    case 'TurretKilled':
    case 'InhibKilled':
      return v.showTurretEvents !== false;
    default:
      return v.showObjectiveEvents !== false;
  }
}

function clearEventAnimClasses() {
  const toRemove = Array.from(eventBannerEl.classList).filter(
    (c) => c.startsWith('anim-in-') || c.startsWith('anim-out-'),
  );
  for (const c of toRemove) {
    eventBannerEl.classList.remove(c);
  }
}

function playEventBannerEntry(event) {
  if (!shouldShowEvent(event)) {
    isPlayingEvent = false;
    processEventQueue();
    return;
  }

  isPlayingEvent = true;
  if (eventHideTimer) clearTimeout(eventHideTimer);
  if (eventExitTimer) clearTimeout(eventExitTimer);
  clearEventAnimClasses();

  const evCfg = currentConfig.eventConfig || {};
  eventBannerEl.classList.toggle('enemy-advantage', Boolean(event.isEnemyAdvantage));
  if (window.renderLoLEventIcon) {
    window.renderLoLEventIcon(eventBannerIconEl, event.iconType, evCfg.customImages);
  }
  eventTitleEl.textContent = event.title || '';
  eventSubtitleEl.textContent =
    evCfg.displayMode === 'icon-and-name' ? '' : (event.subtitle || '');
  eventBannerEl.classList.remove('hidden');

  if (window.playLoLSound && window.mapEventToSoundKey) {
    window.playLoLSound(window.mapEventToSoundKey(event), currentConfig.soundConfig, 'overlay');
  }

  void eventBannerEl.offsetWidth;
  eventBannerEl.classList.add(`anim-in-${evCfg.entryAnimation || 'slide-up'}`);

  const durationMs = Math.max(1000, Math.round((evCfg.durationSec || 5) * 1000));
  eventExitTimer = setTimeout(() => {
    clearEventAnimClasses();
    eventBannerEl.classList.add(`anim-out-${evCfg.exitAnimation || 'fade'}`);
    eventHideTimer = setTimeout(() => {
      eventBannerEl.classList.add('hidden');
      clearEventAnimClasses();
      isPlayingEvent = false;
      processEventQueue();
    }, 320);
  }, durationMs);
}

function processEventQueue() {
  if (isPlayingEvent || eventQueue.length === 0) return;
  const next = eventQueue.shift();
  if (next) {
    playEventBannerEntry(next);
  }
}

function enqueueEventsFromState(state) {
  const queue = Array.isArray(state.eventQueue) ? state.eventQueue : [];
  if (!hasInitializedEventQueue) {
    for (const ev of queue) {
      if (ev && ev.id !== undefined) seenEventIds.add(ev.id);
    }
    hasInitializedEventQueue = true;
    return;
  }

  for (const ev of queue) {
    if (ev && ev.id !== undefined && !seenEventIds.has(ev.id)) {
      seenEventIds.add(ev.id);
      eventQueue.push(ev);
    }
  }
  processEventQueue();
}

function renderItems(items) {
  itemsRowEl.innerHTML = '';
  for (let slot = 0; slot <= 6; slot++) {
    const item = items.find((i) => i.slot === slot);
    const div = document.createElement('div');
    div.className = 'item-slot';
    if (item && item.iconUrl) {
      const img = document.createElement('img');
      img.src = item.iconUrl;
      img.alt = item.name || '';
      div.appendChild(img);
    }
    itemsRowEl.appendChild(div);
  }
}

function renderRunePage(runePage) {
  runeListEl.innerHTML = '';
  if (!runePage) {
    runeTreesLabelEl.textContent = '';
    return;
  }

  const primaryName = runePage.primaryTree?.name || '';
  const secondaryName = runePage.secondaryTree?.name || '';
  runeTreesLabelEl.textContent =
    primaryName && secondaryName ? `${primaryName} + ${secondaryName}` : primaryName;

  const runesToShow =
    runePage.runes && runePage.runes.length > 0
      ? runePage.runes
      : [runePage.keystone, runePage.primaryTree, runePage.secondaryTree].filter(Boolean);

  runesToShow.forEach((rune, idx) => {
    const badge = document.createElement('div');
    badge.className = idx === 0 ? 'rune-badge keystone' : 'rune-badge';
    badge.title = rune.name || '';
    if (rune.iconUrl) {
      const img = document.createElement('img');
      img.src = rune.iconUrl;
      img.alt = rune.name || '';
      badge.appendChild(img);
    }
    runeListEl.appendChild(badge);
  });
}

function renderPurchaseHistory(purchasedItems) {
  purchaseHistoryRowEl.innerHTML = '';
  for (const item of purchasedItems) {
    const div = document.createElement('div');
    div.className = 'history-item';
    div.title = `${item.name} (${formatTime(item.purchasedAtGameTime)})`;

    const img = document.createElement('img');
    img.src = item.iconUrl;
    img.alt = item.name || '';
    div.appendChild(img);

    const time = document.createElement('span');
    time.className = 'history-time';
    time.textContent = formatTime(item.purchasedAtGameTime);
    div.appendChild(time);

    purchaseHistoryRowEl.appendChild(div);
  }
}

function renderState(state) {
  if (!state || !state.activePlayer || (state.status !== 'IN_GAME' && state.status !== 'MOCK')) {
    rootEl.classList.add('hidden');
    return;
  }

  rootEl.classList.remove('hidden');
  const p = state.activePlayer;

  if (champIconEl.getAttribute('src') !== p.championIconUrl) {
    champIconEl.src = p.championIconUrl;
  }
  champLevelEl.textContent = String(p.level);
  riotIdEl.textContent = p.riotId || p.championName;
  gameTimerEl.textContent = formatTime(state.gameTime);

  if (p.isDead) {
    deadBadgeEl.classList.remove('hidden');
    respawnTimerEl.textContent = `${Math.ceil(p.respawnTimer)}s`;
  } else {
    deadBadgeEl.classList.add('hidden');
  }

  killsValueEl.textContent = String(p.kills);
  deathsValueEl.textContent = String(p.deaths);
  assistsValueEl.textContent = String(p.assists);
  turretsValueEl.textContent = String(state.turretsDestroyed ?? 0);
  csValueEl.textContent = `${p.creepScore} (${p.csPerMin})`;
  goldValueEl.textContent = p.currentGold.toLocaleString('pt-BR');
  wardValueEl.textContent = String(p.wardScore);

  renderItems(p.items || []);
  renderRunePage(p.runePage);
  renderPurchaseHistory(state.purchasedItems || []);

  enqueueItemsFromState(state);
  enqueueEventsFromState(state);
}

function connectWebSocket() {
  const protocol = location.protocol === 'https:' ? 'wss:' : 'ws:';
  const ws = new WebSocket(`${protocol}//${location.host}/ws`);

  ws.onmessage = (event) => {
    try {
      const msg = JSON.parse(event.data);
      if (msg.type === 'config') {
        applyConfig(msg.payload);
      } else if (msg.type === 'state') {
        renderState(msg.payload);
      }
    } catch {
      // ignore malformed messages
    }
  };

  ws.onclose = () => {
    setTimeout(connectWebSocket, 1500);
  };
}

window.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'preview-config') {
    applyConfig(event.data.payload);
  }
});

connectWebSocket();
