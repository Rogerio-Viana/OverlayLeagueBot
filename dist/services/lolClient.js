import https from 'node:https';
import { extractChampionId, getChampionIconUrl, getDDragonVersion, getItemIconUrl, getRuneIconMap, } from './ddragon.js';
const LIVE_CLIENT_URL = 'https://127.0.0.1:2999/liveclientdata/allgamedata';
const REQUEST_TIMEOUT_MS = 2000;
const insecureAgent = new https.Agent({
    rejectUnauthorized: false,
});
function fetchLocalGameData() {
    return new Promise((resolve, reject) => {
        const req = https.get(LIVE_CLIENT_URL, { agent: insecureAgent, timeout: REQUEST_TIMEOUT_MS }, (res) => {
            if (res.statusCode && res.statusCode >= 400) {
                res.resume();
                reject(new Error(`HTTP ${res.statusCode}`));
                return;
            }
            const chunks = [];
            res.on('data', (chunk) => chunks.push(chunk));
            res.on('end', () => {
                try {
                    const raw = Buffer.concat(chunks).toString('utf8');
                    resolve(JSON.parse(raw));
                }
                catch (err) {
                    reject(err);
                }
            });
        });
        req.on('timeout', () => {
            req.destroy(new Error('Live Client request timed out'));
        });
        req.on('error', (err) => {
            reject(err);
        });
    });
}
function findActivePlayerEntry(data) {
    const targetRiotId = data.activePlayer?.riotId;
    const targetGameName = data.activePlayer?.riotIdGameName;
    const targetSummoner = data.activePlayer?.summonerName;
    const matched = data.allPlayers?.find((p) => (targetRiotId && p.riotId === targetRiotId) ||
        (targetSummoner && p.summonerName === targetSummoner) ||
        (targetGameName && p.riotIdGameName === targetGameName));
    if (matched)
        return matched;
    if (data.allPlayers?.length === 1)
        return data.allPlayers[0];
    return undefined;
}
function dragonDisplayName(dragonType) {
    const key = (dragonType ?? '').toLowerCase();
    if (key.includes('fire') || key.includes('infernal'))
        return 'DRAGÃO INFERNAL';
    if (key.includes('water') || key.includes('ocean'))
        return 'DRAGÃO DO OCEANO';
    if (key.includes('earth') || key.includes('mountain'))
        return 'DRAGÃO DA MONTANHA';
    if (key.includes('air') || key.includes('cloud'))
        return 'DRAGÃO DAS NUVENS';
    if (key.includes('hextech'))
        return 'DRAGÃO HEXTEC';
    if (key.includes('chemtech'))
        return 'DRAGÃO QUIMTEC';
    if (key.includes('elder'))
        return 'DRAGÃO ANCIÃO';
    return `DRAGÃO ${dragonType?.toUpperCase() ?? 'ABATIDO'}`;
}
function dragonIconType(dragonType) {
    const key = (dragonType ?? '').toLowerCase();
    if (key.includes('fire') || key.includes('infernal'))
        return 'dragon-fire';
    if (key.includes('water') || key.includes('ocean'))
        return 'dragon-water';
    if (key.includes('earth') || key.includes('mountain'))
        return 'dragon-earth';
    if (key.includes('air') || key.includes('cloud'))
        return 'dragon-air';
    if (key.includes('hextech'))
        return 'dragon-hextech';
    if (key.includes('chemtech'))
        return 'dragon-chemtech';
    if (key.includes('elder'))
        return 'dragon-elder';
    return 'dragon-fire';
}
function isStructureOwnedByTeam(structureName, team) {
    if (!structureName)
        return false;
    const tag = team === 'ORDER' ? '_T1_' : '_T2_';
    return structureName.includes(tag);
}
function formatEventBanner(event, playerNames, enemyNames, activeTeam) {
    switch (event.EventName) {
        case 'ChampionKill': {
            const killer = event.KillerName ?? '';
            const victim = event.VictimName ?? '';
            const assisters = event.Assisters ?? [];
            if (playerNames.has(killer)) {
                return {
                    id: event.EventID,
                    name: 'ChampionKill',
                    category: 'map',
                    iconType: 'kill',
                    title: 'ABATE!',
                    subtitle: victim ? `Eliminou ${victim}` : 'Campeão eliminado',
                    eventTime: event.EventTime,
                    isEnemyAdvantage: false,
                };
            }
            if (playerNames.has(victim)) {
                return {
                    id: event.EventID,
                    name: 'ChampionDeath',
                    category: 'map',
                    iconType: 'death',
                    title: 'ABATIDO',
                    subtitle: killer ? `Eliminado por ${killer}` : 'Você foi eliminado',
                    eventTime: event.EventTime,
                    isEnemyAdvantage: false,
                };
            }
            if (assisters.some((a) => playerNames.has(a))) {
                return {
                    id: event.EventID,
                    name: 'ChampionAssist',
                    category: 'map',
                    iconType: 'assist',
                    title: 'ASSISTÊNCIA!',
                    subtitle: victim ? `Assistência em ${victim}` : 'Assistência registrada',
                    eventTime: event.EventTime,
                    isEnemyAdvantage: false,
                };
            }
            return null;
        }
        case 'FirstBlood': {
            const actor = event.RecipientName ?? event.KillerName ?? '';
            const isEnemy = enemyNames.has(actor);
            return {
                id: event.EventID,
                name: event.EventName,
                category: 'map',
                iconType: 'first-blood',
                title: 'FIRST BLOOD',
                subtitle: actor ? `${actor}${isEnemy ? ' (Inimigo)' : ''}` : 'Eliminação',
                eventTime: event.EventTime,
                isEnemyAdvantage: isEnemy,
            };
        }
        case 'DragonKill': {
            const isEnemy = Boolean(event.KillerName && enemyNames.has(event.KillerName));
            return {
                id: event.EventID,
                name: event.EventName,
                category: 'monster',
                iconType: dragonIconType(event.DragonType),
                title: dragonDisplayName(event.DragonType),
                subtitle: `${event.KillerName ?? 'Time'}${event.Stolen === 'True' ? ' (ROUBADO!)' : ''}${isEnemy ? ' (Inimigo)' : ''}`,
                eventTime: event.EventTime,
                isEnemyAdvantage: isEnemy,
            };
        }
        case 'BaronKill': {
            const isEnemy = Boolean(event.KillerName && enemyNames.has(event.KillerName));
            return {
                id: event.EventID,
                name: event.EventName,
                category: 'monster',
                iconType: 'baron',
                title: 'BARÃO NASHOR',
                subtitle: `${event.KillerName ?? 'Time'}${event.Stolen === 'True' ? ' (ROUBADO!)' : ''}${isEnemy ? ' (Inimigo)' : ''}`,
                eventTime: event.EventTime,
                isEnemyAdvantage: isEnemy,
            };
        }
        case 'HeraldKill': {
            const isEnemy = Boolean(event.KillerName && enemyNames.has(event.KillerName));
            return {
                id: event.EventID,
                name: event.EventName,
                category: 'monster',
                iconType: 'herald',
                title: 'ARAUTO DO VALE',
                subtitle: `${event.KillerName ?? 'Time'}${isEnemy ? ' (Inimigo)' : ''}`,
                eventTime: event.EventTime,
                isEnemyAdvantage: isEnemy,
            };
        }
        case 'HordeKill': {
            const isEnemy = Boolean(event.KillerName && enemyNames.has(event.KillerName));
            return {
                id: event.EventID,
                name: event.EventName,
                category: 'monster',
                iconType: 'voidgrubs',
                title: 'VASTILARVAS',
                subtitle: `${event.KillerName ?? 'Time'}${isEnemy ? ' (Inimigo)' : ''}`,
                eventTime: event.EventTime,
                isEnemyAdvantage: isEnemy,
            };
        }
        case 'TurretKilled': {
            const isEnemy = isStructureOwnedByTeam(event.TurretKilled, activeTeam) ||
                Boolean(event.KillerName && enemyNames.has(event.KillerName));
            return {
                id: event.EventID,
                name: event.EventName,
                category: 'map',
                iconType: 'turret',
                title: isEnemy ? 'TORRE ALIADA CAÍDA' : 'TORRE DESTRUÍDA',
                subtitle: `${event.KillerName ?? 'Objetivo'}${isEnemy ? ' (Inimigo)' : ''}`,
                eventTime: event.EventTime,
                isEnemyAdvantage: isEnemy,
            };
        }
        case 'InhibKilled': {
            const isEnemy = isStructureOwnedByTeam(event.InhibKilled, activeTeam) ||
                Boolean(event.KillerName && enemyNames.has(event.KillerName));
            return {
                id: event.EventID,
                name: event.EventName,
                category: 'map',
                iconType: 'inhibitor',
                title: isEnemy ? 'INIBIDOR ALIADO CAÍDO' : 'INIBIDOR DESTRUÍDO',
                subtitle: `${event.KillerName ?? 'Base exposta'}${isEnemy ? ' (Inimigo)' : ''}`,
                eventTime: event.EventTime,
                isEnemyAdvantage: isEnemy,
            };
        }
        case 'Multikill': {
            const streak = event.KillStreak ?? 2;
            const isEnemy = Boolean(event.KillerName && enemyNames.has(event.KillerName));
            return {
                id: event.EventID,
                name: event.EventName,
                category: 'map',
                iconType: multikillIconType(streak),
                title: multikillLabel(streak),
                subtitle: `${event.KillerName ?? ''}${isEnemy ? ' (Inimigo)' : ''}`,
                eventTime: event.EventTime,
                isEnemyAdvantage: isEnemy,
            };
        }
        case 'Ace': {
            const isEnemy = (event.AcingTeam ? event.AcingTeam !== activeTeam : false) ||
                Boolean(event.Acer && enemyNames.has(event.Acer));
            return {
                id: event.EventID,
                name: event.EventName,
                category: 'map',
                iconType: 'ace',
                title: isEnemy ? 'ACE INIMIGO!' : 'ACE!',
                subtitle: event.Acer ? `Por ${event.Acer}` : 'Equipe eliminada',
                eventTime: event.EventTime,
                isEnemyAdvantage: isEnemy,
            };
        }
        default:
            return null;
    }
}
function multikillIconType(streak) {
    if (streak >= 5)
        return 'penta-kill';
    if (streak === 4)
        return 'quadra-kill';
    if (streak === 3)
        return 'triple-kill';
    return 'double-kill';
}
function multikillLabel(streak) {
    if (streak >= 5)
        return 'PENTAKILL!';
    if (streak === 4)
        return 'QUADRAKILL!';
    if (streak === 3)
        return 'TRIPLE KILL!';
    return 'DOUBLE KILL!';
}
export class LolLiveClientService {
    lastEventId = -1;
    activeBanner = null;
    bannerExpiresAt = 0;
    activeMonsterBanner = null;
    monsterBannerExpiresAt = 0;
    activeMapBanner = null;
    mapBannerExpiresAt = 0;
    lastGameTime = 0;
    consecutiveFailures = 0;
    loggedInGame = false;
    hasInitializedInventory = false;
    previousItemCounts = new Map();
    previousItemMeta = new Map();
    previousGold = 0;
    purchaseHistory = [];
    purchaseSequence = 0;
    latestPurchasedItem = null;
    purchaseBannerExpiresAt = 0;
    latestSoldItem = null;
    soldBannerExpiresAt = 0;
    recentItemEvents = [];
    recentEvents = [];
    resetMatchState() {
        this.lastEventId = -1;
        this.activeBanner = null;
        this.bannerExpiresAt = 0;
        this.activeMonsterBanner = null;
        this.monsterBannerExpiresAt = 0;
        this.activeMapBanner = null;
        this.mapBannerExpiresAt = 0;
        this.lastGameTime = 0;
        this.consecutiveFailures = 0;
        if (this.loggedInGame) {
            console.log('[LoL] Partida encerrada / cliente offline.');
        }
        this.loggedInGame = false;
        this.hasInitializedInventory = false;
        this.previousItemCounts.clear();
        this.previousItemMeta.clear();
        this.previousGold = 0;
        this.purchaseHistory = [];
        this.purchaseSequence = 0;
        this.latestPurchasedItem = null;
        this.purchaseBannerExpiresAt = 0;
        this.latestSoldItem = null;
        this.soldBannerExpiresAt = 0;
        this.recentItemEvents = [];
        this.recentEvents = [];
    }
    async pollOverlayState() {
        const version = await getDDragonVersion();
        const runeIcons = await getRuneIconMap(version);
        try {
            const data = await fetchLocalGameData();
            this.consecutiveFailures = 0;
            const playerEntry = findActivePlayerEntry(data);
            if (!playerEntry || !data.gameData) {
                return {
                    status: 'LOADING',
                    ddragonVersion: version,
                    gameMode: data.gameData?.gameMode ?? 'CLASSIC',
                    gameTime: data.gameData?.gameTime ?? 0,
                    turretsDestroyed: 0,
                    activePlayer: null,
                    purchasedItems: [],
                    latestPurchasedItem: null,
                    latestSoldItem: null,
                    latestEvent: null,
                    latestMonsterEvent: null,
                    latestMapEvent: null,
                    updatedAt: Date.now(),
                };
            }
            if (!this.loggedInGame) {
                this.loggedInGame = true;
                console.log(`[LoL] Conectado à partida: ${playerEntry.riotId || playerEntry.summonerName} (${playerEntry.championName})`);
            }
            if (data.gameData.gameTime < this.lastGameTime - 30) {
                this.resetMatchState();
            }
            this.lastGameTime = data.gameData.gameTime;
            const championId = extractChampionId(playerEntry.rawChampionName, playerEntry.championName);
            const minutes = Math.max(data.gameData.gameTime / 60, 1 / 60);
            const cs = playerEntry.scores?.creepScore ?? 0;
            const events = data.events?.Events ?? [];
            const playerNames = new Set([
                data.activePlayer.riotId,
                data.activePlayer.riotIdGameName,
                data.activePlayer.summonerName,
                playerEntry.riotId,
                playerEntry.riotIdGameName,
                playerEntry.summonerName,
            ].filter((v) => Boolean(v)));
            const enemyNames = new Set((data.allPlayers ?? [])
                .filter((p) => p.team !== playerEntry.team)
                .flatMap((p) => [p.riotId, p.riotIdGameName, p.summonerName])
                .filter((v) => Boolean(v)));
            this.updateLatestEvent(events, playerNames, enemyNames, playerEntry.team);
            const currentGold = Math.floor(data.activePlayer.currentGold ?? 0);
            this.trackInventoryChanges(playerEntry.items ?? [], version, data.gameData.gameTime, currentGold);
            const turretsDestroyed = events.filter((e) => e.EventName === 'TurretKilled').length;
            const now = Date.now();
            const latestEvent = now < this.bannerExpiresAt ? this.activeBanner : null;
            const latestMonsterEvent = now < this.monsterBannerExpiresAt ? this.activeMonsterBanner : null;
            const latestMapEvent = now < this.mapBannerExpiresAt ? this.activeMapBanner : null;
            const latestPurchasedItem = now < this.purchaseBannerExpiresAt ? this.latestPurchasedItem : null;
            const latestSoldItem = now < this.soldBannerExpiresAt ? this.latestSoldItem : null;
            return {
                status: 'IN_GAME',
                ddragonVersion: version,
                gameMode: data.gameData.gameMode,
                gameTime: data.gameData.gameTime,
                turretsDestroyed,
                activePlayer: {
                    riotId: data.activePlayer.riotId ||
                        playerEntry.riotId ||
                        data.activePlayer.summonerName,
                    championName: playerEntry.championName,
                    championId,
                    championIconUrl: getChampionIconUrl(version, championId),
                    level: data.activePlayer.level ?? playerEntry.level,
                    team: playerEntry.team,
                    isDead: playerEntry.isDead,
                    respawnTimer: playerEntry.respawnTimer ?? 0,
                    kills: playerEntry.scores?.kills ?? 0,
                    deaths: playerEntry.scores?.deaths ?? 0,
                    assists: playerEntry.scores?.assists ?? 0,
                    creepScore: cs,
                    csPerMin: Number((cs / minutes).toFixed(1)),
                    wardScore: Math.round(playerEntry.scores?.wardScore ?? 0),
                    currentGold: Math.floor(data.activePlayer.currentGold ?? 0),
                    keystoneName: data.activePlayer.fullRunes?.keystone?.displayName ??
                        playerEntry.runes?.keystone?.displayName ??
                        '',
                    runePage: this.buildRunePage(data.activePlayer.fullRunes, playerEntry.runes, runeIcons),
                    items: (playerEntry.items ?? [])
                        .slice()
                        .sort((a, b) => a.slot - b.slot)
                        .map((item) => ({
                        id: item.itemID,
                        name: item.displayName,
                        slot: item.slot,
                        count: item.count,
                        iconUrl: getItemIconUrl(version, item.itemID),
                    })),
                },
                purchasedItems: this.purchaseHistory,
                latestPurchasedItem,
                latestSoldItem,
                itemQueue: this.recentItemEvents,
                latestEvent,
                latestMonsterEvent,
                latestMapEvent,
                eventQueue: this.recentEvents,
                updatedAt: now,
            };
        }
        catch {
            this.consecutiveFailures += 1;
            if (this.consecutiveFailures >= 5) {
                this.resetMatchState();
            }
            return {
                status: 'OFFLINE',
                ddragonVersion: version,
                gameMode: '',
                gameTime: 0,
                turretsDestroyed: 0,
                activePlayer: null,
                purchasedItems: [],
                latestPurchasedItem: null,
                latestSoldItem: null,
                latestEvent: null,
                latestMonsterEvent: null,
                latestMapEvent: null,
                updatedAt: Date.now(),
            };
        }
    }
    trackInventoryChanges(items, version, gameTime, currentGold) {
        const currentCounts = new Map();
        const itemMeta = new Map();
        for (const item of items) {
            if (!item.itemID || item.itemID <= 0)
                continue;
            const qty = Math.max(1, item.count || 1);
            currentCounts.set(item.itemID, (currentCounts.get(item.itemID) ?? 0) + qty);
            if (!itemMeta.has(item.itemID)) {
                itemMeta.set(item.itemID, item);
            }
        }
        const newlyPurchased = [];
        const removedItems = [];
        for (const [itemId, count] of currentCounts.entries()) {
            const prevCount = this.previousItemCounts.get(itemId) ?? 0;
            if (count > prevCount) {
                const meta = itemMeta.get(itemId);
                const delta = count - prevCount;
                for (let i = 0; i < delta; i++) {
                    this.purchaseSequence += 1;
                    const record = {
                        uid: `${itemId}-${this.purchaseSequence}`,
                        itemId,
                        name: meta.displayName,
                        iconUrl: getItemIconUrl(version, itemId),
                        price: meta.price ?? 0,
                        consumable: Boolean(meta.consumable),
                        purchasedAtGameTime: gameTime,
                    };
                    this.purchaseHistory.push(record);
                    newlyPurchased.push(record);
                }
            }
        }
        for (const [itemId, prevCount] of this.previousItemCounts.entries()) {
            const currCount = currentCounts.get(itemId) ?? 0;
            if (currCount < prevCount) {
                const meta = this.previousItemMeta.get(itemId);
                if (meta)
                    removedItems.push(meta);
            }
        }
        if (this.hasInitializedInventory && newlyPurchased.length > 0) {
            const orderedPurchases = newlyPurchased
                .slice()
                .sort((a, b) => {
                if (a.consumable !== b.consumable)
                    return a.consumable ? 1 : -1;
                return b.price - a.price;
            });
            for (const item of orderedPurchases) {
                this.recentItemEvents.push({
                    uid: item.uid,
                    action: 'buy',
                    itemId: item.itemId,
                    name: item.name,
                    iconUrl: item.iconUrl,
                    gameTime: item.purchasedAtGameTime,
                });
            }
            if (this.recentItemEvents.length > 30) {
                this.recentItemEvents = this.recentItemEvents.slice(-30);
            }
            const highlighted = orderedPurchases[0] ?? newlyPurchased[newlyPurchased.length - 1];
            this.latestPurchasedItem = highlighted;
            this.purchaseBannerExpiresAt = Date.now() + 30000;
            console.log(`[LoL] Item comprado: ${highlighted.name} (ID ${highlighted.itemId}) -> Toast ${highlighted.uid}`);
        }
        const goldDelta = currentGold - this.previousGold;
        const isLikelySaleOrUndo = newlyPurchased.length === 0 || goldDelta > 0;
        if (this.hasInitializedInventory && removedItems.length > 0 && isLikelySaleOrUndo) {
            const orderedRemoved = removedItems
                .slice()
                .sort((a, b) => (b.price ?? 0) - (a.price ?? 0));
            for (const soldCandidate of orderedRemoved) {
                if (soldCandidate.consumable && goldDelta <= 15)
                    continue;
                this.purchaseSequence += 1;
                const itemPrice = soldCandidate.price ?? 0;
                const isUndo = newlyPurchased.length === 0 &&
                    orderedRemoved.length === 1 &&
                    itemPrice > 0 &&
                    goldDelta >= itemPrice * 0.95;
                const goldGained = orderedRemoved.length === 1 && goldDelta > 0
                    ? goldDelta
                    : Math.round(itemPrice * 0.7);
                const soldRecord = {
                    uid: `${isUndo ? 'undo' : 'sold'}-${soldCandidate.itemID}-${this.purchaseSequence}`,
                    itemId: soldCandidate.itemID,
                    name: soldCandidate.displayName,
                    iconUrl: getItemIconUrl(version, soldCandidate.itemID),
                    goldGained,
                    soldAtGameTime: gameTime,
                    isUndo,
                };
                if (isUndo) {
                    for (let idx = this.purchaseHistory.length - 1; idx >= 0; idx--) {
                        if (this.purchaseHistory[idx].itemId === soldCandidate.itemID) {
                            this.purchaseHistory.splice(idx, 1);
                            break;
                        }
                    }
                }
                this.recentItemEvents.push({
                    uid: soldRecord.uid,
                    action: isUndo ? 'undo' : 'sell',
                    itemId: soldRecord.itemId,
                    name: soldRecord.name,
                    iconUrl: soldRecord.iconUrl,
                    goldGained: soldRecord.goldGained,
                    gameTime,
                });
                if (this.recentItemEvents.length > 30) {
                    this.recentItemEvents = this.recentItemEvents.slice(-30);
                }
                this.latestSoldItem = soldRecord;
                this.soldBannerExpiresAt = Date.now() + 30000;
                console.log(`[LoL] Item ${isUndo ? 'desfeito' : 'vendido'}: ${soldRecord.name} (+${soldRecord.goldGained}g)`);
            }
        }
        this.hasInitializedInventory = true;
        this.previousItemCounts = currentCounts;
        this.previousItemMeta = itemMeta;
        this.previousGold = currentGold;
    }
    buildRunePage(fullRunes, fallbackRunes, runeIcons) {
        const toOverlayRune = (r) => {
            if (!r)
                return null;
            return {
                id: r.id,
                name: r.displayName,
                iconUrl: runeIcons.get(r.id) ?? '',
            };
        };
        const source = fullRunes ?? fallbackRunes;
        if (!source)
            return null;
        const generalRunes = (fullRunes?.generalRunes ?? [])
            .map((r) => toOverlayRune(r))
            .filter((r) => r !== null);
        return {
            keystone: toOverlayRune(source.keystone),
            primaryTree: toOverlayRune(source.primaryRuneTree),
            secondaryTree: toOverlayRune(source.secondaryRuneTree),
            runes: generalRunes,
        };
    }
    updateLatestEvent(events, playerNames, enemyNames, activeTeam) {
        const newEvents = events.filter((e) => e.EventID > this.lastEventId);
        if (newEvents.length === 0)
            return;
        this.lastEventId = Math.max(...newEvents.map((e) => e.EventID));
        for (let i = 0; i < newEvents.length; i++) {
            const banner = formatEventBanner(newEvents[i], playerNames, enemyNames, activeTeam);
            if (!banner)
                continue;
            this.recentEvents.push(banner);
            if (this.recentEvents.length > 30) {
                this.recentEvents = this.recentEvents.slice(-30);
            }
            if (!this.activeBanner || this.lastEventId === newEvents[i].EventID || i === newEvents.length - 1) {
                this.activeBanner = banner;
                this.bannerExpiresAt = Date.now() + 30000;
            }
            if (banner.category === 'monster' && banner.id >= (this.activeMonsterBanner?.id ?? -1)) {
                this.activeMonsterBanner = banner;
                this.monsterBannerExpiresAt = Date.now() + 30000;
            }
            if (banner.category === 'map' && banner.id >= (this.activeMapBanner?.id ?? -1)) {
                this.activeMapBanner = banner;
                this.mapBannerExpiresAt = Date.now() + 30000;
            }
        }
    }
}
