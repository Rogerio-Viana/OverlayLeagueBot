import fs from 'node:fs/promises';
import path from 'node:path';
import type { OverlayConfig } from '../types/lol.js';

const CONFIG_PATH = path.resolve(process.cwd(), 'config.json');

export const DEFAULT_OVERLAY_CONFIG: OverlayConfig = {
  itemDisplayMode: 'icon-only',
  itemIconSize: 64,
  itemEntryAnimation: 'zoom',
  itemExitAnimation: 'fade',
  itemDurationSec: 4.5,
  eventConfig: {
    displayMode: 'icon-and-name',
    iconSize: 56,
    entryAnimation: 'slide-up',
    exitAnimation: 'fade',
    durationSec: 5,
    customImages: {},
  },
  soundConfig: {
    enabled: true,
    volume: 70,
    playInOverlay: true,
    playInDedicatedUrls: true,
    triggers: {
      itemBuy: true,
      itemSell: true,
      dragon: true,
      baron: true,
      herald: true,
      turret: true,
      kill: true,
      death: true,
      assist: true,
      firstBlood: true,
      doubleKill: true,
      tripleKill: true,
      quadraKill: true,
      pentaKill: true,
      enemyBad: true,
    },
    customFiles: {},
  },
  hudConfig: {
    layout: 'classic',
    position: 'bottom-left',
    theme: 'lol-gold',
    accentColor: '#c8aa6e',
    bgColor: '#0a0e17',
    bgOpacity: 88,
    borderRadius: 12,
    scale: 100,
    fontFamily: 'default',
    showChampLevel: true,
    showTimer: true,
    showRiotId: true,
  },
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

function mergeConfig(partial?: Partial<OverlayConfig>): OverlayConfig {
  const duration = Number(partial?.itemDurationSec);
  const iconSize = Number(partial?.itemIconSize);
  const ev = partial?.eventConfig;
  const evDuration = Number(ev?.durationSec);
  const evIconSize = Number(ev?.iconSize);
  const snd = partial?.soundConfig;
  const sndVolume = Number(snd?.volume);
  const hud = partial?.hudConfig;
  const hudBgOpacity = Number(hud?.bgOpacity);
  const hudBorderRadius = Number(hud?.borderRadius);
  const hudScale = Number(hud?.scale);
  const hexColorRegex = /^#[0-9a-fA-F]{6}$/;

  return {
    itemDisplayMode:
      partial?.itemDisplayMode === 'icon-and-name' ? 'icon-and-name' : 'icon-only',
    itemIconSize: Number.isFinite(iconSize)
      ? Math.min(140, Math.max(32, Math.round(iconSize)))
      : DEFAULT_OVERLAY_CONFIG.itemIconSize,
    itemEntryAnimation: partial?.itemEntryAnimation ?? DEFAULT_OVERLAY_CONFIG.itemEntryAnimation,
    itemExitAnimation: partial?.itemExitAnimation ?? DEFAULT_OVERLAY_CONFIG.itemExitAnimation,
    itemDurationSec: Number.isFinite(duration)
      ? Math.min(30, Math.max(1, Number(duration.toFixed(1))))
      : DEFAULT_OVERLAY_CONFIG.itemDurationSec,
    eventConfig: {
      displayMode:
        ev?.displayMode === 'icon-only' ||
        ev?.displayMode === 'icon-and-name' ||
        ev?.displayMode === 'icon-and-text' ||
        ev?.displayMode === 'banner'
          ? ev.displayMode
          : DEFAULT_OVERLAY_CONFIG.eventConfig.displayMode,
      iconSize: Number.isFinite(evIconSize)
        ? Math.min(140, Math.max(32, Math.round(evIconSize)))
        : DEFAULT_OVERLAY_CONFIG.eventConfig.iconSize,
      entryAnimation: ev?.entryAnimation ?? DEFAULT_OVERLAY_CONFIG.eventConfig.entryAnimation,
      exitAnimation: ev?.exitAnimation ?? DEFAULT_OVERLAY_CONFIG.eventConfig.exitAnimation,
      durationSec: Number.isFinite(evDuration)
        ? Math.min(30, Math.max(1, Number(evDuration.toFixed(1))))
        : DEFAULT_OVERLAY_CONFIG.eventConfig.durationSec,
      customImages: {
        ...(ev?.customImages ?? {}),
      },
    },
    soundConfig: {
      enabled: snd?.enabled !== false,
      volume: Number.isFinite(sndVolume)
        ? Math.min(100, Math.max(0, Math.round(sndVolume)))
        : DEFAULT_OVERLAY_CONFIG.soundConfig.volume,
      playInOverlay: snd?.playInOverlay !== false,
      playInDedicatedUrls: snd?.playInDedicatedUrls !== false,
      triggers: {
        ...DEFAULT_OVERLAY_CONFIG.soundConfig.triggers,
        ...(snd?.triggers ?? {}),
      },
      customFiles: {
        ...(snd?.customFiles ?? {}),
      },
    },
    hudConfig: {
      layout:
        hud?.layout === 'classic' ||
        hud?.layout === 'compact' ||
        hud?.layout === 'bar' ||
        hud?.layout === 'vertical' ||
        hud?.layout === 'minimal'
          ? hud.layout
          : DEFAULT_OVERLAY_CONFIG.hudConfig.layout,
      position:
        hud?.position === 'bottom-left' ||
        hud?.position === 'bottom-right' ||
        hud?.position === 'top-left' ||
        hud?.position === 'top-right' ||
        hud?.position === 'bottom-center' ||
        hud?.position === 'top-center'
          ? hud.position
          : DEFAULT_OVERLAY_CONFIG.hudConfig.position,
      theme:
        hud?.theme === 'lol-gold' ||
        hud?.theme === 'emerald' ||
        hud?.theme === 'hextech' ||
        hud?.theme === 'crimson' ||
        hud?.theme === 'custom'
          ? hud.theme
          : DEFAULT_OVERLAY_CONFIG.hudConfig.theme,
      accentColor:
        typeof hud?.accentColor === 'string' && hexColorRegex.test(hud.accentColor)
          ? hud.accentColor
          : DEFAULT_OVERLAY_CONFIG.hudConfig.accentColor,
      bgColor:
        typeof hud?.bgColor === 'string' && hexColorRegex.test(hud.bgColor)
          ? hud.bgColor
          : DEFAULT_OVERLAY_CONFIG.hudConfig.bgColor,
      bgOpacity: Number.isFinite(hudBgOpacity)
        ? Math.min(100, Math.max(0, Math.round(hudBgOpacity)))
        : DEFAULT_OVERLAY_CONFIG.hudConfig.bgOpacity,
      borderRadius: Number.isFinite(hudBorderRadius)
        ? Math.min(24, Math.max(0, Math.round(hudBorderRadius)))
        : DEFAULT_OVERLAY_CONFIG.hudConfig.borderRadius,
      scale: Number.isFinite(hudScale)
        ? Math.min(140, Math.max(70, Math.round(hudScale)))
        : DEFAULT_OVERLAY_CONFIG.hudConfig.scale,
      fontFamily:
        hud?.fontFamily === 'default' ||
        hud?.fontFamily === 'esports' ||
        hud?.fontFamily === 'mono'
          ? hud.fontFamily
          : DEFAULT_OVERLAY_CONFIG.hudConfig.fontFamily,
      showChampLevel: hud?.showChampLevel !== false,
      showTimer: hud?.showTimer !== false,
      showRiotId: hud?.showRiotId !== false,
    },
    visibility: {
      ...DEFAULT_OVERLAY_CONFIG.visibility,
      ...(partial?.visibility ?? {}),
    },
  };
}

export class ConfigService {
  private config: OverlayConfig = structuredClone(DEFAULT_OVERLAY_CONFIG);

  async load(): Promise<OverlayConfig> {
    try {
      const raw = await fs.readFile(CONFIG_PATH, 'utf8');
      this.config = mergeConfig(JSON.parse(raw) as Partial<OverlayConfig>);
    } catch {
      this.config = structuredClone(DEFAULT_OVERLAY_CONFIG);
    }
    return this.config;
  }

  get(): OverlayConfig {
    return this.config;
  }

  async update(partial: Partial<OverlayConfig>): Promise<OverlayConfig> {
    this.config = mergeConfig({
      ...this.config,
      ...partial,
      eventConfig: {
        ...this.config.eventConfig,
        ...(partial.eventConfig ?? {}),
        customImages: {
          ...this.config.eventConfig.customImages,
          ...(partial.eventConfig?.customImages ?? {}),
        },
      },
      soundConfig: {
        ...this.config.soundConfig,
        ...(partial.soundConfig ?? {}),
        triggers: {
          ...this.config.soundConfig.triggers,
          ...(partial.soundConfig?.triggers ?? {}),
        },
        customFiles: {
          ...this.config.soundConfig.customFiles,
          ...(partial.soundConfig?.customFiles ?? {}),
        },
      },
      hudConfig: {
        ...this.config.hudConfig,
        ...(partial.hudConfig ?? {}),
      },
      visibility: {
        ...this.config.visibility,
        ...(partial.visibility ?? {}),
      },
    });
    await fs.writeFile(CONFIG_PATH, JSON.stringify(this.config, null, 2), 'utf8');
    return this.config;
  }
}
