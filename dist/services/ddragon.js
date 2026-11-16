const DEFAULT_DDRAGON_VERSION = '15.22.1';
const VERSIONS_URL = 'https://ddragon.leagueoflegends.com/api/versions.json';
let cachedVersion = DEFAULT_DDRAGON_VERSION;
let lastFetchAt = 0;
const REFRESH_INTERVAL_MS = 60 * 60 * 1000; // 1 hour
const runeIconMap = new Map();
let runeCacheVersion = '';
/**
 * Fetches and caches the latest Data Dragon patch version.
 * Falls back to the cached/default version if offline.
 */
export async function getDDragonVersion() {
    const now = Date.now();
    if (now - lastFetchAt < REFRESH_INTERVAL_MS) {
        return cachedVersion;
    }
    try {
        const response = await fetch(VERSIONS_URL, {
            signal: AbortSignal.timeout(3000),
        });
        if (response.ok) {
            const versions = (await response.json());
            if (Array.isArray(versions) && versions.length > 0 && versions[0]) {
                cachedVersion = versions[0];
                lastFetchAt = now;
            }
        }
    }
    catch {
        // Keep cached/default version when offline or rate-limited
    }
    return cachedVersion;
}
/**
 * Normalizes Riot's rawChampionName (e.g. "game_character_displayname_LeeSin")
 * or display name into a Data Dragon champion key.
 */
export function extractChampionId(rawChampionName, fallbackName) {
    if (rawChampionName) {
        const prefix = 'game_character_displayname_';
        if (rawChampionName.startsWith(prefix)) {
            return rawChampionName.slice(prefix.length);
        }
        const parts = rawChampionName.split('_');
        const last = parts[parts.length - 1];
        if (last)
            return last;
    }
    return (fallbackName ?? 'Aatrox').replace(/[^a-zA-Z0-9]/g, '');
}
export function getChampionIconUrl(version, championId) {
    return `https://ddragon.leagueoflegends.com/cdn/${version}/img/champion/${championId}.png`;
}
export function getItemIconUrl(version, itemId) {
    return `https://ddragon.leagueoflegends.com/cdn/${version}/img/item/${itemId}.png`;
}
export async function getRuneIconMap(version) {
    if (runeCacheVersion === version && runeIconMap.size > 0) {
        return runeIconMap;
    }
    try {
        const url = `https://ddragon.leagueoflegends.com/cdn/${version}/data/pt_BR/runesReforged.json`;
        const response = await fetch(url, { signal: AbortSignal.timeout(4000) });
        if (response.ok) {
            const trees = (await response.json());
            runeIconMap.clear();
            for (const tree of trees) {
                runeIconMap.set(tree.id, `https://ddragon.leagueoflegends.com/cdn/img/${tree.icon}`);
                for (const slot of tree.slots ?? []) {
                    for (const rune of slot.runes ?? []) {
                        runeIconMap.set(rune.id, `https://ddragon.leagueoflegends.com/cdn/img/${rune.icon}`);
                    }
                }
            }
            runeCacheVersion = version;
        }
    }
    catch {
        // Return existing map if offline
    }
    return runeIconMap;
}
