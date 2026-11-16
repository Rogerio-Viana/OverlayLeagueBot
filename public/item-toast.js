const itemToastEl = document.getElementById('item-toast');
const itemToastIconEl = document.getElementById('item-toast-icon');
const itemToastGoldEl = document.getElementById('item-toast-gold');
const itemToastLabelEl = document.getElementById('item-toast-label');
const itemToastNameEl = document.getElementById('item-toast-name');

let currentConfig = {
  itemDisplayMode: 'icon-only',
  itemIconSize: 64,
  itemEntryAnimation: 'zoom',
  itemExitAnimation: 'fade',
  itemDurationSec: 4.5,
  visibility: {
    showItemToast: true,
    showSoldItemToast: true,
  },
};

let hasInitializedItemQueue = false;
const seenItemUids = new Set();
const itemQueue = [];
let isPlayingItem = false;
let itemToastHideTimer = null;
let itemToastExitTimer = null;

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

function applyConfig(config) {
  if (!config) return;
  currentConfig = config;

  itemToastEl.classList.toggle('icon-only', config.itemDisplayMode !== 'icon-and-name');
  itemToastEl.style.setProperty('--item-toast-size', `${config.itemIconSize || 64}px`);
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
    window.playLoLSound(isSoldOrUndo ? 'itemSell' : 'itemBuy', currentConfig.soundConfig, 'dedicated');
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

function connectWebSocket() {
  const protocol = location.protocol === 'https:' ? 'wss:' : 'ws:';
  const ws = new WebSocket(`${protocol}//${location.host}/ws`);

  ws.onmessage = (event) => {
    try {
      const msg = JSON.parse(event.data);
      if (msg.type === 'config') {
        applyConfig(msg.payload);
      } else if (msg.type === 'state') {
        const state = msg.payload;
        if (state && (state.status === 'IN_GAME' || state.status === 'MOCK')) {
          enqueueItemsFromState(state);
        }
      }
    } catch {
      // ignore malformed messages
    }
  };

  ws.onclose = () => {
    setTimeout(connectWebSocket, 1500);
  };
}

connectWebSocket();
