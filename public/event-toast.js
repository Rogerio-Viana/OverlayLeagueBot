const scriptTag = document.currentScript;
const targetCategory = scriptTag?.dataset?.category || 'all';

const eventToastEl = document.getElementById('event-toast');
const eventIconEl = document.getElementById('event-toast-icon');
const eventTitleEl = document.getElementById('event-toast-title');
const eventSubtitleEl = document.getElementById('event-toast-subtitle');

let currentConfig = {
  eventConfig: {
    displayMode: 'icon-and-text',
    iconSize: 56,
    entryAnimation: 'slide-up',
    exitAnimation: 'fade',
    durationSec: 5,
  },
  visibility: {
    showEventBanner: true,
    showKillEvents: true,
    showDeathEvents: true,
    showAssistEvents: true,
    showTurretEvents: true,
    showObjectiveEvents: true,
  },
};

let hasInitializedEventQueue = false;
const seenEventIds = new Set();
const eventQueue = [];
let isPlayingEvent = false;
let hideTimer = null;
let exitTimer = null;

function clearTimers() {
  if (hideTimer) {
    clearTimeout(hideTimer);
    hideTimer = null;
  }
  if (exitTimer) {
    clearTimeout(exitTimer);
    exitTimer = null;
  }
}

function clearAnimClasses() {
  const toRemove = Array.from(eventToastEl.classList).filter(
    (c) => c.startsWith('anim-in-') || c.startsWith('anim-out-'),
  );
  for (const c of toRemove) {
    eventToastEl.classList.remove(c);
  }
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

function applyConfig(config) {
  if (!config) return;
  currentConfig = config;
  const evCfg = config.eventConfig || {};

  eventToastEl.classList.remove('icon-only', 'icon-and-name', 'banner');
  if (evCfg.displayMode === 'icon-only') {
    eventToastEl.classList.add('icon-only');
  } else if (evCfg.displayMode === 'icon-and-name') {
    eventToastEl.classList.add('icon-and-name');
  } else if (evCfg.displayMode === 'banner') {
    eventToastEl.classList.add('banner');
  }
  eventToastEl.style.setProperty('--event-toast-size', `${evCfg.iconSize || 56}px`);
}

function playEventToastEntry(event) {
  if (!shouldShowEvent(event)) {
    isPlayingEvent = false;
    processEventQueue();
    return;
  }

  isPlayingEvent = true;
  clearTimers();
  clearAnimClasses();

  const evCfg = currentConfig.eventConfig || {};
  applyConfig(currentConfig);

  window.renderLoLEventIcon(eventIconEl, event.iconType, evCfg.customImages);
  eventToastEl.classList.toggle('enemy-advantage', Boolean(event.isEnemyAdvantage));
  eventTitleEl.textContent = event.title || '';
  eventSubtitleEl.textContent = event.subtitle || '';
  eventToastEl.classList.remove('hidden');

  if (window.playLoLSound && window.mapEventToSoundKey) {
    window.playLoLSound(window.mapEventToSoundKey(event), currentConfig.soundConfig, 'dedicated');
  }

  void eventToastEl.offsetWidth;
  eventToastEl.classList.add(`anim-in-${evCfg.entryAnimation || 'slide-up'}`);

  const durationMs = Math.max(1000, Math.round((evCfg.durationSec || 5) * 1000));
  exitTimer = setTimeout(() => {
    clearAnimClasses();
    eventToastEl.classList.add(`anim-out-${evCfg.exitAnimation || 'fade'}`);

    hideTimer = setTimeout(() => {
      eventToastEl.classList.add('hidden');
      clearAnimClasses();
      isPlayingEvent = false;
      processEventQueue();
    }, 320);
  }, durationMs);
}

function processEventQueue() {
  if (isPlayingEvent || eventQueue.length === 0) return;
  const next = eventQueue.shift();
  if (next) {
    playEventToastEntry(next);
  }
}

function enqueueEventsFromState(state) {
  const queue = Array.isArray(state.eventQueue) ? state.eventQueue : [];
  const matchesCategory = (ev) =>
    targetCategory === 'all' || (ev && ev.category === targetCategory);

  if (!hasInitializedEventQueue) {
    for (const ev of queue) {
      if (ev && ev.id !== undefined) seenEventIds.add(ev.id);
    }
    hasInitializedEventQueue = true;
    return;
  }

  for (const ev of queue) {
    if (ev && ev.id !== undefined && !seenEventIds.has(ev.id) && matchesCategory(ev)) {
      seenEventIds.add(ev.id);
      eventQueue.push(ev);
    }
  }
  processEventQueue();
}

function connectWebSocket() {
  const protocol = location.protocol === 'https:' ? 'wss:' : 'ws:';
  const ws = new WebSocket(`${protocol}//${location.host}/ws`);

  ws.onmessage = (msgEvent) => {
    try {
      const msg = JSON.parse(msgEvent.data);
      if (msg.type === 'config') {
        applyConfig(msg.payload);
      } else if (msg.type === 'state') {
        const state = msg.payload;
        if (!state || (state.status !== 'IN_GAME' && state.status !== 'MOCK')) return;

        enqueueEventsFromState(state);
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
