import type {
  ItemToastEvent,
  OverlayEventBanner,
  OverlayState,
  PurchasedItemRecord,
  SoldItemRecord,
} from '../types/lol.js';
import {
  getChampionIconUrl,
  getDDragonVersion,
  getItemIconUrl,
  getRuneIconMap,
} from './ddragon.js';

let mockGameTime = 1124; // 18:44
let mockBanner: OverlayEventBanner | null = null;
let mockBannerExpiresAt = 0;
let mockMonsterBanner: OverlayEventBanner | null = null;
let mockMonsterExpiresAt = 0;
let mockMapBanner: OverlayEventBanner | null = null;
let mockMapExpiresAt = 0;
let mockEventCounter = 100;

let mockPurchaseCounter = 6;
let mockLatestPurchasedItem: PurchasedItemRecord | null = null;
let mockPurchaseExpiresAt = 0;
let mockLatestSoldItem: SoldItemRecord | null = null;
let mockSoldExpiresAt = 0;
let mockItemQueue: ItemToastEvent[] = [];
let mockEventQueue: OverlayEventBanner[] = [];

const extraMockItems = [
  { id: 3089, name: 'Capuz da Morte de Rabadon', price: 3600 },
  { id: 3135, name: 'Cajado do Vazio', price: 3000 },
  { id: 3102, name: 'Véu da Banshee', price: 3100 },
  { id: 4629, name: 'Ímpeto Cósmico', price: 3000 },
];
let extraMockIndex = 0;

const baseMockPurchases = [
  { uid: '1056-1', itemId: 1056, name: 'Anel de Doran', price: 400, consumable: false, purchasedAtGameTime: 12 },
  { uid: '1001-2', itemId: 1001, name: 'Botas', price: 300, consumable: false, purchasedAtGameTime: 245 },
  { uid: '3802-3', itemId: 3802, name: 'Capítulo Perdido', price: 1200, consumable: false, purchasedAtGameTime: 410 },
  { uid: '3020-4', itemId: 3020, name: 'Sapatos do Feiticeiro', price: 1100, consumable: false, purchasedAtGameTime: 530 },
  { uid: '6655-5', itemId: 6655, name: 'Companheiro de Luden', price: 2850, consumable: false, purchasedAtGameTime: 785 },
  { uid: '4645-6', itemId: 4645, name: 'Chama Sombria', price: 3200, consumable: false, purchasedAtGameTime: 1015 },
];

const addedMockPurchases: Array<Omit<PurchasedItemRecord, 'iconUrl'>> = [];

export type MockEventKind =
  | 'first_blood'
  | 'double_kill'
  | 'triple_kill'
  | 'quadra_kill'
  | 'penta_kill'
  | 'dragon'
  | 'dragon_fire'
  | 'dragon_water'
  | 'dragon_earth'
  | 'dragon_air'
  | 'dragon_hextech'
  | 'dragon_chemtech'
  | 'dragon_elder'
  | 'enemy_dragon'
  | 'enemy_baron'
  | 'enemy_turret'
  | 'baron'
  | 'herald'
  | 'voidgrubs'
  | 'turret'
  | 'inhibitor'
  | 'kill'
  | 'death'
  | 'assist'
  | 'pentakill';

export function triggerMockEvent(kind: MockEventKind): OverlayEventBanner {
  mockEventCounter += 1;
  const map: Record<MockEventKind, Omit<OverlayEventBanner, 'id' | 'eventTime'>> = {
    first_blood: {
      name: 'FirstBlood',
      category: 'map',
      iconType: 'first-blood',
      title: 'FIRST BLOOD',
      subtitle: 'ShowMaker#KR1',
    },
    double_kill: {
      name: 'Multikill',
      category: 'map',
      iconType: 'double-kill',
      title: 'DOUBLE KILL!',
      subtitle: 'ShowMaker#KR1',
    },
    triple_kill: {
      name: 'Multikill',
      category: 'map',
      iconType: 'triple-kill',
      title: 'TRIPLE KILL!',
      subtitle: 'ShowMaker#KR1',
    },
    quadra_kill: {
      name: 'Multikill',
      category: 'map',
      iconType: 'quadra-kill',
      title: 'QUADRAKILL!',
      subtitle: 'ShowMaker#KR1',
    },
    penta_kill: {
      name: 'Multikill',
      category: 'map',
      iconType: 'penta-kill',
      title: 'PENTAKILL!',
      subtitle: 'ShowMaker#KR1',
    },
    dragon: {
      name: 'DragonKill',
      category: 'monster',
      iconType: 'dragon-fire',
      title: 'DRAGÃO INFERNAL',
      subtitle: 'ShowMaker#KR1',
    },
    dragon_fire: {
      name: 'DragonKill',
      category: 'monster',
      iconType: 'dragon-fire',
      title: 'DRAGÃO INFERNAL',
      subtitle: 'ShowMaker#KR1',
    },
    dragon_water: {
      name: 'DragonKill',
      category: 'monster',
      iconType: 'dragon-water',
      title: 'DRAGÃO DO OCEANO',
      subtitle: 'ShowMaker#KR1',
    },
    dragon_earth: {
      name: 'DragonKill',
      category: 'monster',
      iconType: 'dragon-earth',
      title: 'DRAGÃO DA MONTANHA',
      subtitle: 'ShowMaker#KR1',
    },
    dragon_air: {
      name: 'DragonKill',
      category: 'monster',
      iconType: 'dragon-air',
      title: 'DRAGÃO DAS NUVENS',
      subtitle: 'ShowMaker#KR1',
    },
    dragon_hextech: {
      name: 'DragonKill',
      category: 'monster',
      iconType: 'dragon-hextech',
      title: 'DRAGÃO HEXTEC',
      subtitle: 'ShowMaker#KR1',
    },
    dragon_chemtech: {
      name: 'DragonKill',
      category: 'monster',
      iconType: 'dragon-chemtech',
      title: 'DRAGÃO QUIMTEC',
      subtitle: 'ShowMaker#KR1',
    },
    dragon_elder: {
      name: 'DragonKill',
      category: 'monster',
      iconType: 'dragon-elder',
      title: 'DRAGÃO ANCIÃO',
      subtitle: 'ShowMaker#KR1',
    },
    enemy_dragon: {
      name: 'DragonKill',
      category: 'monster',
      iconType: 'dragon-fire',
      title: 'DRAGÃO INFERNAL',
      subtitle: 'Faker#KR1 (Inimigo)',
      isEnemyAdvantage: true,
    },
    enemy_baron: {
      name: 'BaronKill',
      category: 'monster',
      iconType: 'baron',
      title: 'BARÃO NASHOR',
      subtitle: 'Faker#KR1 (Inimigo)',
      isEnemyAdvantage: true,
    },
    enemy_turret: {
      name: 'TurretKilled',
      category: 'map',
      iconType: 'turret',
      title: 'TORRE ALIADA CAÍDA',
      subtitle: 'Faker#KR1 (Inimigo)',
      isEnemyAdvantage: true,
    },
    baron: {
      name: 'BaronKill',
      category: 'monster',
      iconType: 'baron',
      title: 'BARÃO NASHOR',
      subtitle: 'ShowMaker#KR1 (ROUBADO!)',
    },
    herald: {
      name: 'HeraldKill',
      category: 'monster',
      iconType: 'herald',
      title: 'ARAUTO DO VALE',
      subtitle: 'ShowMaker#KR1',
    },
    voidgrubs: {
      name: 'HordeKill',
      category: 'monster',
      iconType: 'voidgrubs',
      title: 'VASTILARVAS',
      subtitle: 'ShowMaker#KR1',
    },
    turret: {
      name: 'TurretKilled',
      category: 'map',
      iconType: 'turret',
      title: 'TORRE DESTRUÍDA',
      subtitle: 'ShowMaker#KR1',
    },
    inhibitor: {
      name: 'InhibKilled',
      category: 'map',
      iconType: 'inhibitor',
      title: 'INIBIDOR DESTRUÍDO',
      subtitle: 'Base adversária exposta',
    },
    kill: {
      name: 'ChampionKill',
      category: 'map',
      iconType: 'kill',
      title: 'ABATE!',
      subtitle: 'Eliminou Faker#KR1',
    },
    death: {
      name: 'ChampionDeath',
      category: 'map',
      iconType: 'death',
      title: 'ABATIDO',
      subtitle: 'Eliminado por Faker#KR1',
    },
    assist: {
      name: 'ChampionAssist',
      category: 'map',
      iconType: 'assist',
      title: 'ASSISTÊNCIA!',
      subtitle: 'Assistência em Faker#KR1',
    },
    pentakill: {
      name: 'Multikill',
      category: 'map',
      iconType: 'penta-kill',
      title: 'PENTAKILL!',
      subtitle: 'ShowMaker#KR1',
    },
  };

  mockBanner = {
    id: mockEventCounter,
    ...map[kind],
    eventTime: mockGameTime,
  };
  mockEventQueue.push(mockBanner);
  if (mockEventQueue.length > 30) {
    mockEventQueue = mockEventQueue.slice(-30);
  }
  mockBannerExpiresAt = Date.now() + 30000;
  if (mockBanner.category === 'monster') {
    mockMonsterBanner = mockBanner;
    mockMonsterExpiresAt = mockBannerExpiresAt;
  } else {
    mockMapBanner = mockBanner;
    mockMapExpiresAt = mockBannerExpiresAt;
  }
  return mockBanner;
}

export async function triggerMockItemPurchase(): Promise<PurchasedItemRecord> {
  const version = await getDDragonVersion();
  const sample = extraMockItems[extraMockIndex % extraMockItems.length];
  extraMockIndex += 1;
  mockPurchaseCounter += 1;

  const entry = {
    uid: `${sample.id}-${mockPurchaseCounter}`,
    itemId: sample.id,
    name: sample.name,
    price: sample.price,
    consumable: false,
    purchasedAtGameTime: mockGameTime,
  };
  addedMockPurchases.push(entry);

  const record: PurchasedItemRecord = {
    ...entry,
    iconUrl: getItemIconUrl(version, entry.itemId),
  };
  mockLatestPurchasedItem = record;
  mockPurchaseExpiresAt = Date.now() + 30000;
  mockItemQueue.push({
    uid: record.uid,
    action: 'buy',
    itemId: record.itemId,
    name: record.name,
    iconUrl: record.iconUrl,
    gameTime: record.purchasedAtGameTime,
  });
  if (mockItemQueue.length > 30) {
    mockItemQueue = mockItemQueue.slice(-30);
  }
  return record;
}

export async function triggerMockItemSale(): Promise<SoldItemRecord> {
  const version = await getDDragonVersion();
  mockPurchaseCounter += 1;
  const sold: SoldItemRecord = {
    uid: `sold-1056-${mockPurchaseCounter}`,
    itemId: 1056,
    name: 'Anel de Doran',
    iconUrl: getItemIconUrl(version, 1056),
    goldGained: 160,
    soldAtGameTime: mockGameTime,
  };
  mockLatestSoldItem = sold;
  mockSoldExpiresAt = Date.now() + 30000;
  mockItemQueue.push({
    uid: sold.uid,
    action: 'sell',
    itemId: sold.itemId,
    name: sold.name,
    iconUrl: sold.iconUrl,
    goldGained: sold.goldGained,
    gameTime: sold.soldAtGameTime,
  });
  if (mockItemQueue.length > 30) {
    mockItemQueue = mockItemQueue.slice(-30);
  }
  return sold;
}

export async function getMockOverlayState(): Promise<OverlayState> {
  const version = await getDDragonVersion();
  const runeIcons = await getRuneIconMap(version);
  mockGameTime += 1;

  const now = Date.now();
  const latestEvent = now < mockBannerExpiresAt ? mockBanner : null;
  const latestMonsterEvent = now < mockMonsterExpiresAt ? mockMonsterBanner : null;
  const latestMapEvent = now < mockMapExpiresAt ? mockMapBanner : null;
  const latestPurchasedItem = now < mockPurchaseExpiresAt ? mockLatestPurchasedItem : null;
  const latestSoldItem = now < mockSoldExpiresAt ? mockLatestSoldItem : null;
  const cs = 178;
  const minutes = mockGameTime / 60;

  const purchasedItems: PurchasedItemRecord[] = [...baseMockPurchases, ...addedMockPurchases].map((item) => ({
    ...item,
    iconUrl: getItemIconUrl(version, item.itemId),
  }));

  return {
    status: 'MOCK',
    ddragonVersion: version,
    gameMode: 'CLASSIC',
    gameTime: mockGameTime,
    turretsDestroyed: 3,
    activePlayer: {
      riotId: 'ShowMaker#KR1',
      championName: 'Ahri',
      championId: 'Ahri',
      championIconUrl: getChampionIconUrl(version, 'Ahri'),
      level: 13,
      team: 'ORDER',
      isDead: false,
      respawnTimer: 0,
      kills: 7,
      deaths: 1,
      assists: 5,
      creepScore: cs,
      csPerMin: Number((cs / minutes).toFixed(1)),
      wardScore: 19,
      currentGold: 1420,
      keystoneName: 'Eletrocutar',
      runePage: {
        keystone: { id: 8112, name: 'Eletrocutar', iconUrl: runeIcons.get(8112) ?? '' },
        primaryTree: { id: 8100, name: 'Dominação', iconUrl: runeIcons.get(8100) ?? '' },
        secondaryTree: { id: 8200, name: 'Feitiçaria', iconUrl: runeIcons.get(8200) ?? '' },
        runes: [
          { id: 8112, name: 'Eletrocutar', iconUrl: runeIcons.get(8112) ?? '' },
          { id: 8139, name: 'Gosto de Sangue', iconUrl: runeIcons.get(8139) ?? '' },
          { id: 8138, name: 'Globos Oculares', iconUrl: runeIcons.get(8138) ?? '' },
          { id: 8106, name: 'Caça Suprema', iconUrl: runeIcons.get(8106) ?? '' },
          { id: 8226, name: 'Faixa de Fluxo de Mana', iconUrl: runeIcons.get(8226) ?? '' },
          { id: 8210, name: 'Transcendência', iconUrl: runeIcons.get(8210) ?? '' },
        ],
      },
      items: [
        { id: 6655, name: 'Companheiro de Luden', slot: 0, count: 1, iconUrl: getItemIconUrl(version, 6655) },
        { id: 3020, name: 'Sapatos do Feiticeiro', slot: 1, count: 1, iconUrl: getItemIconUrl(version, 3020) },
        { id: 4645, name: 'Chama Sombria', slot: 2, count: 1, iconUrl: getItemIconUrl(version, 4645) },
        { id: 3157, name: 'Ampulheta de Zhonya', slot: 3, count: 1, iconUrl: getItemIconUrl(version, 3157) },
        { id: 3340, name: 'Sentinela Invisível', slot: 6, count: 1, iconUrl: getItemIconUrl(version, 3340) },
      ],
    },
    purchasedItems,
    latestPurchasedItem,
    latestSoldItem,
    itemQueue: mockItemQueue,
    latestEvent,
    latestMonsterEvent,
    latestMapEvent,
    eventQueue: mockEventQueue,
    updatedAt: now,
  };
}
