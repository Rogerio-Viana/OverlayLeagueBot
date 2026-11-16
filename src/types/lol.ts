export interface RiotAllGameData {
  activePlayer: RiotActivePlayer;
  allPlayers: RiotPlayer[];
  events: {
    Events: RiotGameEvent[];
  };
  gameData: RiotGameData;
}

export interface RiotActivePlayer {
  abilities: Record<string, {
    abilityLevel: number;
    displayName: string;
    id: string;
    rawDescription: string;
    rawDisplayName: string;
  }>;
  championStats: {
    abilityPower: number;
    armor: number;
    attackDamage: number;
    attackSpeed: number;
    currentHealth: number;
    maxHealth: number;
    moveSpeed: number;
    resourceType: string;
    resourceValue: number;
    resourceMax: number;
  };
  currentGold: number;
  fullRunes: {
    keystone: RiotRune;
    primaryRuneTree: RiotRune;
    secondaryRuneTree: RiotRune;
    generalRunes?: RiotRune[];
  };
  level: number;
  riotId: string;
  riotIdGameName: string;
  riotIdTagLine: string;
  summonerName: string;
}

export interface RiotRune {
  displayName: string;
  id: number;
  rawDescription: string;
  rawDisplayName: string;
}

export interface RiotPlayer {
  championName: string;
  isBot: boolean;
  isDead: boolean;
  items: RiotItem[];
  level: number;
  position: string;
  rawChampionName: string;
  respawnTimer: number;
  riotId: string;
  riotIdGameName: string;
  riotIdTagLine: string;
  runes: {
    keystone: RiotRune;
    primaryRuneTree: RiotRune;
    secondaryRuneTree: RiotRune;
  };
  scores: {
    assists: number;
    creepScore: number;
    deaths: number;
    kills: number;
    wardScore: number;
  };
  skinID: number;
  summonerName: string;
  summonerSpells: {
    summonerSpellOne: RiotSummonerSpell;
    summonerSpellTwo: RiotSummonerSpell;
  };
  team: 'ORDER' | 'CHAOS';
}

export interface RiotItem {
  canUse: boolean;
  consumable: boolean;
  count: number;
  displayName: string;
  itemID: number;
  price: number;
  rawDescription: string;
  rawDisplayName: string;
  slot: number;
}

export interface RiotSummonerSpell {
  displayName: string;
  rawDescription: string;
  rawDisplayName: string;
}

export interface RiotGameEvent {
  EventID: number;
  EventName: string;
  EventTime: number;
  KillerName?: string;
  VictimName?: string;
  RecipientName?: string;
  Assisters?: string[];
  DragonType?: string;
  Stolen?: string;
  TurretKilled?: string;
  KillStreak?: number;
  Acer?: string;
  AcingTeam?: string;
}

export interface RiotGameData {
  gameMode: string;
  gameTime: number;
  mapName: string;
  mapNumber: number;
  mapTerrain: string;
}

export type GameConnectionStatus = 'OFFLINE' | 'LOADING' | 'IN_GAME' | 'MOCK';

export interface OverlayItem {
  id: number;
  name: string;
  slot: number;
  count: number;
  iconUrl: string;
}

export interface OverlayRune {
  id: number;
  name: string;
  iconUrl: string;
}

export interface OverlayRunePage {
  keystone: OverlayRune | null;
  primaryTree: OverlayRune | null;
  secondaryTree: OverlayRune | null;
  runes: OverlayRune[];
}

export interface OverlayPlayerSummary {
  riotId: string;
  championName: string;
  championId: string;
  championIconUrl: string;
  level: number;
  team: 'ORDER' | 'CHAOS';
  isDead: boolean;
  respawnTimer: number;
  kills: number;
  deaths: number;
  assists: number;
  creepScore: number;
  csPerMin: number;
  wardScore: number;
  currentGold: number;
  keystoneName: string;
  runePage: OverlayRunePage | null;
  items: OverlayItem[];
}

export type EventCategory = 'monster' | 'map';

export interface OverlayEventBanner {
  id: number;
  name: string;
  category: EventCategory;
  iconType: string;
  title: string;
  subtitle: string;
  eventTime: number;
  isEnemyAdvantage?: boolean;
}

export interface PurchasedItemRecord {
  uid: string;
  itemId: number;
  name: string;
  iconUrl: string;
  price: number;
  consumable: boolean;
  purchasedAtGameTime: number;
}

export interface SoldItemRecord {
  uid: string;
  itemId: number;
  name: string;
  iconUrl: string;
  goldGained: number;
  soldAtGameTime: number;
  isUndo?: boolean;
}

export type ItemToastAction = 'buy' | 'sell' | 'undo';

export interface ItemToastEvent {
  uid: string;
  action: ItemToastAction;
  itemId: number;
  name: string;
  iconUrl: string;
  goldGained?: number;
  gameTime: number;
}

export type ItemDisplayMode = 'icon-only' | 'icon-and-name';
export type EventDisplayMode = 'icon-only' | 'icon-and-name' | 'icon-and-text' | 'banner';
export type EntryAnimation = 'fade' | 'slide-up' | 'slide-left' | 'zoom' | 'bounce';
export type ExitAnimation = 'fade' | 'slide-down' | 'slide-left' | 'zoom';

export interface EventDisplayConfig {
  displayMode: EventDisplayMode;
  iconSize: number;
  entryAnimation: EntryAnimation;
  exitAnimation: ExitAnimation;
  durationSec: number;
  customImages: Record<string, string>;
}

export interface OverlayVisibilityConfig {
  showHudCard: boolean;
  showKills: boolean;
  showDeaths: boolean;
  showAssists: boolean;
  showTurrets: boolean;
  showCs: boolean;
  showGold: boolean;
  showWard: boolean;
  showInventory: boolean;
  showPurchaseHistory: boolean;
  showRunePage: boolean;
  showEventBanner: boolean;
  showItemToast: boolean;
  showSoldItemToast: boolean;
  showKillEvents: boolean;
  showDeathEvents: boolean;
  showAssistEvents: boolean;
  showTurretEvents: boolean;
  showObjectiveEvents: boolean;
}

export type SoundTriggerKey =
  | 'itemBuy'
  | 'itemSell'
  | 'dragon'
  | 'baron'
  | 'herald'
  | 'turret'
  | 'kill'
  | 'death'
  | 'assist'
  | 'firstBlood'
  | 'doubleKill'
  | 'tripleKill'
  | 'quadraKill'
  | 'pentaKill'
  | 'enemyBad';

export interface SoundConfig {
  enabled: boolean;
  volume: number;
  playInOverlay: boolean;
  playInDedicatedUrls: boolean;
  triggers: Record<SoundTriggerKey, boolean>;
  customFiles: Partial<Record<SoundTriggerKey, string>>;
}

export type HudLayoutPreset = 'classic' | 'compact' | 'bar' | 'vertical' | 'minimal';
export type HudPosition =
  | 'bottom-left'
  | 'bottom-right'
  | 'top-left'
  | 'top-right'
  | 'bottom-center'
  | 'top-center';
export type HudTheme = 'lol-gold' | 'emerald' | 'hextech' | 'crimson' | 'custom';
export type HudFont = 'default' | 'esports' | 'mono';

export interface HudCustomConfig {
  layout: HudLayoutPreset;
  position: HudPosition;
  theme: HudTheme;
  accentColor: string;
  bgColor: string;
  bgOpacity: number;
  borderRadius: number;
  scale: number;
  fontFamily: HudFont;
  showChampLevel: boolean;
  showTimer: boolean;
  showRiotId: boolean;
}

export interface OverlayConfig {
  itemDisplayMode: ItemDisplayMode;
  itemIconSize: number;
  itemEntryAnimation: EntryAnimation;
  itemExitAnimation: ExitAnimation;
  itemDurationSec: number;
  eventConfig: EventDisplayConfig;
  soundConfig: SoundConfig;
  hudConfig: HudCustomConfig;
  visibility: OverlayVisibilityConfig;
}

export interface OverlayState {
  status: GameConnectionStatus;
  ddragonVersion: string;
  gameMode: string;
  gameTime: number;
  turretsDestroyed: number;
  activePlayer: OverlayPlayerSummary | null;
  purchasedItems: PurchasedItemRecord[];
  latestPurchasedItem: PurchasedItemRecord | null;
  latestSoldItem: SoldItemRecord | null;
  itemQueue?: ItemToastEvent[];
  latestEvent: OverlayEventBanner | null;
  latestMonsterEvent: OverlayEventBanner | null;
  latestMapEvent: OverlayEventBanner | null;
  eventQueue?: OverlayEventBanner[];
  updatedAt: number;
}
