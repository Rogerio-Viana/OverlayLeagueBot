(function () {
  const CDRAGON_MINIMAP = 'https://raw.communitydragon.org/latest/game/assets/ux/minimap/icons';

  const MONSTER_ICON_URLS = {
    'dragon-fire': `${CDRAGON_MINIMAP}/dragon_infernal.png`,
    'dragon-water': `${CDRAGON_MINIMAP}/dragon_ocean.png`,
    'dragon-earth': `${CDRAGON_MINIMAP}/dragon_mountain.png`,
    'dragon-air': `${CDRAGON_MINIMAP}/dragon_cloud.png`,
    'dragon-hextech': `${CDRAGON_MINIMAP}/dragon_hextech.png`,
    'dragon-chemtech': `${CDRAGON_MINIMAP}/dragon_chemtech.png`,
    'dragon-elder': `${CDRAGON_MINIMAP}/dragon_elder.png`,
    baron: `${CDRAGON_MINIMAP}/baron.png`,
    herald: `${CDRAGON_MINIMAP}/riftherald.png`,
    voidgrubs: `${CDRAGON_MINIMAP}/voidgrub.png`,
  };

  function getEventSvg(iconType) {
    const dragonColors = {
      'dragon-fire': '#ff5c39',
      'dragon-water': '#38bdf8',
      'dragon-earth': '#d97706',
      'dragon-air': '#cbd5e1',
      'dragon-hextech': '#0ac8b9',
      'dragon-chemtech': '#84cc16',
      'dragon-elder': '#facc15',
    };

    if (dragonColors[iconType]) {
      const color = dragonColors[iconType];
      return `<svg viewBox="0 0 64 64" fill="none"><path d="M12 40C16 24 28 14 44 14L38 24L52 26L40 34L48 44C36 46 24 44 12 40Z" fill="${color}" stroke="#f0e6d2" stroke-width="2.5" stroke-linejoin="round"/><circle cx="34" cy="24" r="2.5" fill="#0b101b"/></svg>`;
    }

    switch (iconType) {
      case 'baron':
        return '<svg viewBox="0 0 64 64" fill="none"><path d="M32 8L42 20L54 16L48 34L54 50L32 44L10 50L16 34L10 16L22 20L32 8Z" fill="#a855f7" stroke="#f0e6d2" stroke-width="2.5" stroke-linejoin="round"/><circle cx="25" cy="29" r="3" fill="#f0e6d2"/><circle cx="39" cy="29" r="3" fill="#f0e6d2"/><circle cx="32" cy="22" r="2.5" fill="#0ac8b9"/></svg>';
      case 'herald':
        return '<svg viewBox="0 0 64 64" fill="none"><ellipse cx="32" cy="32" rx="20" ry="18" fill="#7e22ce" stroke="#f0e6d2" stroke-width="2.5"/><ellipse cx="32" cy="32" rx="8" ry="11" fill="#0ac8b9"/><circle cx="32" cy="32" r="3.5" fill="#0b101b"/></svg>';
      case 'voidgrubs':
        return '<svg viewBox="0 0 64 64" fill="none"><circle cx="22" cy="36" r="9" fill="#9333ea" stroke="#f0e6d2" stroke-width="2"/><circle cx="42" cy="36" r="9" fill="#9333ea" stroke="#f0e6d2" stroke-width="2"/><circle cx="32" cy="22" r="9" fill="#a855f7" stroke="#f0e6d2" stroke-width="2"/></svg>';
      case 'turret':
        return '<svg viewBox="0 0 64 64" fill="none"><path d="M18 12H25V18H29V12H35V18H39V12H46V26L42 30V50H48V54H16V50H22V30L18 26V12Z" fill="#c8aa6e" stroke="#f0e6d2" stroke-width="2.5" stroke-linejoin="round"/></svg>';
      case 'inhibitor':
        return '<svg viewBox="0 0 64 64" fill="none"><polygon points="32,8 52,20 52,44 32,56 12,44 12,20" fill="#0ac8b9" stroke="#f0e6d2" stroke-width="2.5"/><polygon points="32,18 42,24 42,40 32,46 22,40 22,24" fill="#0b101b"/></svg>';
      case 'first-blood':
        return '<svg viewBox="0 0 64 64" fill="none"><circle cx="32" cy="32" r="24" fill="#991b1b" stroke="#f0e6d2" stroke-width="2.5"/><path d="M32 14C32 14 44 28 44 37C44 43.6 38.6 49 32 49C25.4 49 20 43.6 20 37C20 28 32 14 32 14Z" fill="#ef4444" stroke="#f0e6d2" stroke-width="2"/></svg>';
      case 'double-kill':
        return '<svg viewBox="0 0 64 64" fill="none"><circle cx="32" cy="32" r="24" fill="#1e293b" stroke="#38bdf8" stroke-width="2.5"/><text x="32" y="40" text-anchor="middle" fill="#38bdf8" font-size="24" font-weight="900" font-family="Segoe UI, sans-serif">2X</text></svg>';
      case 'triple-kill':
        return '<svg viewBox="0 0 64 64" fill="none"><circle cx="32" cy="32" r="24" fill="#1e293b" stroke="#a855f7" stroke-width="2.5"/><text x="32" y="40" text-anchor="middle" fill="#c084fc" font-size="24" font-weight="900" font-family="Segoe UI, sans-serif">3X</text></svg>';
      case 'quadra-kill':
        return '<svg viewBox="0 0 64 64" fill="none"><circle cx="32" cy="32" r="24" fill="#2d1b2e" stroke="#f97316" stroke-width="2.5"/><text x="32" y="40" text-anchor="middle" fill="#fb923c" font-size="24" font-weight="900" font-family="Segoe UI, sans-serif">4X</text></svg>';
      case 'penta-kill':
        return '<svg viewBox="0 0 64 64" fill="none"><circle cx="32" cy="32" r="24" fill="#451a03" stroke="#facc15" stroke-width="3"/><text x="32" y="40" text-anchor="middle" fill="#fde047" font-size="24" font-weight="900" font-family="Segoe UI, sans-serif">5X</text></svg>';
      case 'kill':
      case 'multikill':
        return '<svg viewBox="0 0 64 64" fill="none"><path d="M16 48L44 14L50 14L50 20L22 54L16 48Z" fill="#e84057" stroke="#f0e6d2" stroke-width="2.2"/><path d="M14 40L24 50" stroke="#c8aa6e" stroke-width="4" stroke-linecap="round"/></svg>';
      case 'death':
        return '<svg viewBox="0 0 64 64" fill="none"><circle cx="32" cy="28" r="16" fill="#64748b" stroke="#f0e6d2" stroke-width="2.5"/><rect x="24" y="42" width="16" height="10" rx="2" fill="#64748b" stroke="#f0e6d2" stroke-width="2"/><circle cx="26" cy="27" r="3" fill="#0b101b"/><circle cx="38" cy="27" r="3" fill="#0b101b"/></svg>';
      case 'assist':
        return '<svg viewBox="0 0 64 64" fill="none"><path d="M32 10L40 26L56 28L44 40L48 56L32 48L16 56L20 40L8 28L24 26L32 10Z" fill="#0ac8b9" stroke="#f0e6d2" stroke-width="2.2" stroke-linejoin="round"/></svg>';
      case 'ace':
      default:
        return '<svg viewBox="0 0 64 64" fill="none"><circle cx="32" cy="32" r="20" fill="#c8aa6e" stroke="#f0e6d2" stroke-width="2.5"/><path d="M22 34L29 41L44 24" stroke="#0b101b" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/></svg>';
    }
  }

  window.renderLoLEventIcon = function renderLoLEventIcon(container, iconType, customImages) {
    if (!container) return;
    const customUrl = customImages?.[iconType];
    const officialUrl = MONSTER_ICON_URLS[iconType];
    const url = customUrl || officialUrl;

    if (!url) {
      container.innerHTML = getEventSvg(iconType);
      return;
    }

    container.innerHTML = '';
    const img = document.createElement('img');
    img.src = url;
    img.alt = iconType || 'event';
    img.onerror = () => {
      if (customUrl && officialUrl && img.src !== officialUrl) {
        img.src = officialUrl;
      } else {
        container.innerHTML = getEventSvg(iconType);
      }
    };
    container.appendChild(img);
  };
})();
