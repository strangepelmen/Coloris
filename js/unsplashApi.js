/**
 * unsplashApi.js
 * Stock photo search engine with CIEDE2000 perceptual color matching.
 * Uses a 200+ curated image database with exact hex tags.
 * Falls back to legacy mock/Unsplash API when needed.
 *
 * @module unsplashApi
 */

import { deltaE2000, hexToLab, scoreColorMatch, findClosestHex } from '../lib/colorUtils.js';
import { getAllImages } from './imageDatabase.js';

const LEGACY_MOCK = [
  { colorName: 'red', author: 'Annie Spratt', id: 'mock-red-1', url: 'https://picsum.photos/seed/red1/800/600' },
  { colorName: 'red', author: 'Joanna Kosinska', id: 'mock-red-2', url: 'https://picsum.photos/seed/red2/800/600' },
  { colorName: 'orange', author: 'Drew Beamer', id: 'mock-orange-1', url: 'https://picsum.photos/seed/orange1/800/600' },
  { colorName: 'orange', author: 'Vladimir Fedotov', id: 'mock-orange-2', url: 'https://picsum.photos/seed/orange2/800/600' },
  { colorName: 'yellow', author: 'Scott Webb', id: 'mock-yellow-1', url: 'https://picsum.photos/seed/yellow1/800/600' },
  { colorName: 'yellow', author: 'Zach Reiner', id: 'mock-yellow-2', url: 'https://picsum.photos/seed/yellow2/800/600' },
  { colorName: 'green', author: 'Lukasz Szmigiel', id: 'mock-green-1', url: 'https://picsum.photos/seed/green1/800/600' },
  { colorName: 'green', author: 'Marek Piwnicki', id: 'mock-green-2', url: 'https://picsum.photos/seed/green2/800/600' },
  { colorName: 'teal', author: 'Nikola Jovanovic', id: 'mock-teal-1', url: 'https://picsum.photos/seed/teal1/800/600' },
  { colorName: 'blue', author: 'Jeremy Bishop', id: 'mock-blue-1', url: 'https://picsum.photos/seed/blue1/800/600' },
  { colorName: 'blue', author: 'Sean Oulashin', id: 'mock-blue-2', url: 'https://picsum.photos/seed/blue2/800/600' },
  { colorName: 'purple', author: 'Kari Shea', id: 'mock-purple-1', url: 'https://picsum.photos/seed/purple1/800/600' },
  { colorName: 'pink', author: 'Azzedine Rouichi', id: 'mock-pink-1', url: 'https://picsum.photos/seed/pink1/800/600' },
  { colorName: 'white', author: 'Rawan Yasser', id: 'mock-white-1', url: 'https://picsum.photos/seed/white1/800/600' },
  { colorName: 'gray', author: 'Daniele Levis', id: 'mock-gray-1', url: 'https://picsum.photos/seed/gray1/800/600' },
  { colorName: 'black', author: 'Tom Gainor', id: 'mock-black-1', url: 'https://picsum.photos/seed/black1/800/600' },
  { colorName: 'warm brown', author: 'Sven Mieke', id: 'mock-brown-1', url: 'https://picsum.photos/seed/brown1/800/600' },
  { colorName: 'warm brown', author: 'Raimond Klavins', id: 'mock-brown-2', url: 'https://picsum.photos/seed/brown2/800/600' },
  { colorName: 'beige', author: 'Liana Mikah', id: 'mock-beige-1', url: 'https://picsum.photos/seed/beige1/800/600' },
  { colorName: 'terracotta', author: 'Rene Bohmer', id: 'mock-terracotta-1', url: 'https://picsum.photos/seed/terra1/800/600' },
  { colorName: 'navy', author: 'Max Baskakov', id: 'mock-navy-1', url: 'https://picsum.photos/seed/navy1/800/600' },
  { colorName: 'forest green', author: 'Timo Volz', id: 'mock-forest-1', url: 'https://picsum.photos/seed/forest1/800/600' },
  { colorName: 'sky blue', author: 'Tobias Rademacher', id: 'mock-sky-1', url: 'https://picsum.photos/seed/sky1/800/600' },
  { colorName: 'lavender', author: 'Micheile Henderson', id: 'mock-lavender-1', url: 'https://picsum.photos/seed/lavender1/800/600' },
  { colorName: 'gold', author: 'Daniel Tseng', id: 'mock-gold-1', url: 'https://picsum.photos/seed/gold1/800/600' },
  { colorName: 'peach', author: 'Sandy Millar', id: 'mock-peach-1', url: 'https://picsum.photos/seed/peach1/800/600' },
  { colorName: 'olive', author: 'Leigh Jurgens', id: 'mock-olive-1', url: 'https://picsum.photos/seed/olive1/800/600' },
  { colorName: 'turquoise', author: 'Jared Rice', id: 'mock-turquoise-1', url: 'https://picsum.photos/seed/turquoise1/800/600' },
  { colorName: 'burgundy', author: 'Mia Frome', id: 'mock-burgundy-1', url: 'https://picsum.photos/seed/burgundy1/800/600' },
  { colorName: 'coral', author: 'Marta Pawlik', id: 'mock-coral-1', url: 'https://picsum.photos/seed/coral1/800/600' },
  { colorName: 'charcoal', author: 'Shifaaz Shamoon', id: 'mock-charcoal-1', url: 'https://picsum.photos/seed/charcoal1/800/600' },
  { colorName: 'camel', author: 'Yuriy Chemerys', id: 'mock-camel-1', url: 'https://picsum.photos/seed/camel1/800/600' },
];

const COLOR_MAP = {
  red: '#FF0000', crimson: '#DC143C', 'dark red': '#8B0000', burgundy: '#800020',
  orange: '#FF7F00', coral: '#FF7F50', peach: '#FFDAB9', terracotta: '#E2725B',
  yellow: '#FFD700', gold: '#FFD700', mustard: '#E1AD01', lemon: '#FFF700',
  green: '#00AA00', 'forest green': '#228B22', lime: '#32CD32', olive: '#808000', emerald: '#50C878',
  teal: '#008080', cyan: '#00CED1', turquoise: '#40E0D0', aqua: '#00FFFF',
  blue: '#0000FF', navy: '#000080', 'sky blue': '#87CEEB', 'royal blue': '#4169E1', indigo: '#4B0082',
  purple: '#800080', violet: '#8F00FF', lavender: '#B57EDC', magenta: '#FF00FF',
  pink: '#FF69B4', 'hot pink': '#FF1493', rose: '#FF007F',
  white: '#FFFFFF', cream: '#FFFDD0', ivory: '#FFFFF0', beige: '#F5F5DC',
  gray: '#808080', silver: '#C0C0C0', charcoal: '#36454F', slate: '#708090', black: '#000000',
  'warm brown': '#5D4432', brown: '#8B4513', tan: '#D2B48C', chocolate: '#7B3F00',
  taupe: '#8B7355', camel: '#C19A6B', caramel: '#AF6E4D', umber: '#635147',
};

const state = {
  images: [],
  allResults: [],
  filteredResults: [],
  totalResults: [],
  pageSize: 15,
  isLoading: false,
  currentFilter: null,
  cache: new Map(),
  abortController: null,
};

export async function searchByPalette(colors) {
  if (!colors || colors.length === 0) return [];

  if (state.isLoading) {
    if (state.abortController) state.abortController.abort();
  }
  state.abortController = new AbortController();
  state.isLoading = true;
  state.currentFilter = null;

  dispatchSearchStart();

  try {
    const db = getAllImages();
    const seen = new Set();
    const scored = [];

    for (const color of colors) {
      if (state.abortController?.signal?.aborted) break;

      const targetLab = hexToLab(color.hex);

      for (const entry of db) {
        if (seen.has(entry.id)) continue;

        let bestScore = 0;
        let bestHex = entry.hexes[0];

        for (const entryHex of entry.hexes) {
          const entryLab = hexToLab(entryHex);
          const deltaE = deltaE2000(targetLab, entryLab);

          if (deltaE > 40) continue;

          const score = Math.max(0, Math.round((1 - deltaE / 45) * 100));
          if (score > bestScore) {
            bestScore = score;
            bestHex = entryHex;
          }
        }

        if (bestScore > 0) {
          seen.add(entry.id);
          scored.push({
            ...entry,
            matchScore: bestScore,
            matchedHex: bestHex,
            _matchedPaletteColor: color.hex,
          });
        }
      }
    }

    scored.sort((a, b) => b.matchScore - a.matchScore);

    const allFormatted = scored.map(entry => ({
      id: entry.id,
      url: `https://picsum.photos/seed/${entry.seeds[0] || entry.id}/800/600`,
      thumbUrl: `https://picsum.photos/seed/${entry.seeds[0] || entry.id}/400/300`,
      smallUrl: `https://picsum.photos/seed/${entry.seeds[0] || entry.id}/200/150`,
      author: entry.author,
      authorUrl: '#',
      alt: entry.name || 'Stock photo',
      color: entry.matchedHex,
      width: 800,
      height: 600,
      matchScore: entry.matchScore,
      matchedHex: entry.matchedHex,
      _matchedPaletteColor: entry._matchedPaletteColor,
      _mock: false,
      _dbEntry: entry,
    }));

    state.totalResults = allFormatted;
    state.allResults = allFormatted;
    state.images = allFormatted.slice(0, state.pageSize);
    state.filteredResults = [];
    state.isLoading = false;

    dispatchSearchComplete(allFormatted, 'database');
    return allFormatted;

  } catch (err) {
    if (err.name === 'AbortError') return state.images;
    state.isLoading = false;

    let fallback;
    try {
      const { searchPexelsByColor } = await import('./pexelsApi.js');
      const pexelsResults = [];
      for (const c of colors.slice(0, 2)) {
        const pr = await searchPexelsByColor(c.hex, 10, 1);
        pexelsResults.push(...pr);
      }
      if (pexelsResults.length > 0) {
        fallback = pexelsResults.slice(0, 30);
      }
    } catch (e) {}

    if (!fallback || fallback.length === 0) {
      fallback = getLegacyMockResults(colors);
    }
    state.images = fallback;
    state.allResults = fallback;
    state.totalResults = fallback;
    dispatchSearchComplete(fallback, 'mock');
    return fallback;
  }
}

export function searchByColor(hex) {
  if (hex === 'all' || !hex) {
    state.currentFilter = null;
    const results = state.images.slice();
    dispatchSearchComplete(results, 'database');
    return results;
  }

  state.currentFilter = hex;
  const filtered = state.totalResults.filter(img =>
    img.matchedHex === hex || img._matchedPaletteColor === hex
  );

  state.filteredResults = filtered;
  dispatchSearchComplete(filtered, 'database');
  return filtered;
}

export async function loadMore() {
  if (state.isLoading) return [];
  const total = state.currentFilter ? state.filteredResults : state.totalResults;
  const start = state.images.length;
  const next = total.slice(start, start + state.pageSize);
  if (next.length > 0) {
    state.images = [...state.images, ...next];
    dispatchSearchComplete(state.images, 'database');
    return state.images;
  }
  return state.images;
}

export function getResults() {
  return state.images.map(img => ({ ...img }));
}

export function getFilteredResults() {
  return state.filteredResults.length > 0
    ? state.filteredResults.map(img => ({ ...img }))
    : state.images.map(img => ({ ...img }));
}

export function clearResults() {
  state.images = [];
  state.allResults = [];
  state.filteredResults = [];
  state.currentFilter = null;
  state.cache.clear();
}

function getLegacyMockResults(colors) {
  const results = [];
  const usedIds = new Set();

  for (const c of colors.slice(0, 2)) {
    const mockHexes = getTopLegacyMatch(c.hex);
    for (const hex of mockHexes) {
      const name = hexToLegacyColorName(hex);
      const matches = LEGACY_MOCK.filter(m => {
        const mHex = COLOR_MAP[m.colorName];
        return mHex === hex && !usedIds.has(m.id);
      });

      for (const match of matches) {
        usedIds.add(match.id);
        const colorHex = COLOR_MAP[match.colorName] || '#5D4432';
        results.push({
          id: match.id,
          url: match.url,
          thumbUrl: match.url.replace('/800/600', '/400/300'),
          smallUrl: match.url.replace('/800/600', '/200/150'),
          author: match.author,
          authorUrl: '#',
          alt: `Mock ${match.colorName} image`,
          color: colorHex,
          width: 800,
          height: 600,
          matchScore: 50,
          matchedHex: colorHex,
          _matchedPaletteColor: c.hex,
          _mock: true,
        });
      }
    }
  }

  shuffle(results);
  return results.slice(0, 30);
}

function getTopLegacyMatch(hex) {
  const closest = findClosestHex(hex, LEGACY_MOCK.map(m => ({ hexes: [COLOR_MAP[m.colorName] || '#000'], id: m.id })));
  if (!closest || closest.length === 0) return ['#5D4432'];
  return closest.map(c => c.hexes[0]).slice(0, 3);
}

function hexToLegacyColorName(hex) {
  let bestDist = Infinity;
  let best = 'warm brown';
  for (const [name, colorHex] of Object.entries(COLOR_MAP)) {
    const dr = parseInt(hex.slice(1, 3), 16) - parseInt(colorHex.slice(1, 3), 16);
    const dg = parseInt(hex.slice(3, 5), 16) - parseInt(colorHex.slice(3, 5), 16);
    const db = parseInt(hex.slice(5, 7), 16) - parseInt(colorHex.slice(5, 7), 16);
    const dist = dr * dr + dg * dg + db * db;
    if (dist < bestDist) {
      bestDist = dist;
      best = name;
    }
  }
  return best;
}

function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function dispatchSearchStart() {
  document.dispatchEvent(new CustomEvent('search:start', { detail: {}, bubbles: true }));
}

function dispatchSearchComplete(images, source) {
  document.dispatchEvent(new CustomEvent('search:complete', {
    detail: { images, source },
    bubbles: true,
  }));
}

function dispatchSearchError(error) {
  document.dispatchEvent(new CustomEvent('search:error', {
    detail: { error },
    bubbles: true,
  }));
}

function dispatchFallback() {
  document.dispatchEvent(new CustomEvent('search:fallback', {
    detail: {},
    bubbles: true,
  }));
}
