/**
 * colorUtils.js
 * CIEDE2000 color science library for perceptual color matching.
 * Provides RGB↔Lab conversion, delta-E2000 calculation, and
 * color search utilities.
 *
 * @module colorUtils
 */

const CACHE = new Map();

export function hexToLab(hex) {
  const cached = CACHE.get(hex);
  if (cached) return cached;

  const rgb = hexToRgb(hex);
  const lab = rgbToLab(rgb.r, rgb.g, rgb.b);
  CACHE.set(hex, lab);
  return lab;
}

export function rgbToLab(r, g, b) {
  let rf = r / 255;
  let gf = g / 255;
  let bf = b / 255;

  rf = rf > 0.04045 ? Math.pow((rf + 0.055) / 1.055, 2.4) : rf / 12.92;
  gf = gf > 0.04045 ? Math.pow((gf + 0.055) / 1.055, 2.4) : gf / 12.92;
  bf = bf > 0.04045 ? Math.pow((bf + 0.055) / 1.055, 2.4) : bf / 12.92;

  const x = (rf * 0.4124564 + gf * 0.3575761 + bf * 0.1804375) / 0.95047;
  const y = (rf * 0.2126729 + gf * 0.7151522 + bf * 0.0721750);
  const z = (rf * 0.0193339 + gf * 0.1191920 + bf * 0.9503041) / 1.08883;

  const fx = x > 0.008856 ? Math.pow(x, 1 / 3) : (7.787 * x) + (16 / 116);
  const fy = y > 0.008856 ? Math.pow(y, 1 / 3) : (7.787 * y) + (16 / 116);
  const fz = z > 0.008856 ? Math.pow(z, 1 / 3) : (7.787 * z) + (16 / 116);

  return {
    L: (116 * fy) - 16,
    a: 500 * (fx - fy),
    b: 200 * (fy - fz),
  };
}

export function deltaE2000(lab1, lab2) {
  const rad2deg = 180 / Math.PI;
  const deg2rad = Math.PI / 180;

  const L1 = lab1.L;
  const a1 = lab1.a;
  const b1 = lab1.b;
  const L2 = lab2.L;
  const a2 = lab2.a;
  const b2 = lab2.b;

  const kL = 1;
  const kC = 1;
  const kH = 1;

  const C1 = Math.sqrt(a1 * a1 + b1 * b1);
  const C2 = Math.sqrt(a2 * a2 + b2 * b2);

  const Lbar = (L1 + L2) / 2;
  const Cbar = (C1 + C2) / 2;

  const Cbar7 = Math.pow(Cbar, 7);
  const G = 0.5 * (1 - Math.sqrt(Cbar7 / (Cbar7 + Math.pow(25, 7))));

  const a1p = a1 * (1 + G);
  const a2p = a2 * (1 + G);

  const C1p = Math.sqrt(a1p * a1p + b1 * b1);
  const C2p = Math.sqrt(a2p * a2p + b2 * b2);

  let h1p = Math.atan2(b1, a1p) * rad2deg;
  if (h1p < 0) h1p += 360;
  let h2p = Math.atan2(b2, a2p) * rad2deg;
  if (h2p < 0) h2p += 360;

  const dLp = L2 - L1;
  const dCp = C2p - C1p;

  let dhp;
  const CpProduct = C1p * C2p;
  if (CpProduct === 0) {
    dhp = 0;
  } else {
    const deltaH = h2p - h1p;
    if (Math.abs(deltaH) <= 180) {
      dhp = deltaH;
    } else if (deltaH > 180) {
      dhp = deltaH - 360;
    } else {
      dhp = deltaH + 360;
    }
  }

  const dHp = 2 * Math.sqrt(CpProduct) * Math.sin((dhp * deg2rad) / 2);

  let Hbarp;
  if (CpProduct === 0) {
    Hbarp = h1p + h2p;
  } else {
    const absDiff = Math.abs(h1p - h2p);
    if (absDiff <= 180) {
      Hbarp = (h1p + h2p) / 2;
    } else if (absDiff > 180 && (h1p + h2p) < 360) {
      Hbarp = (h1p + h2p + 360) / 2;
    } else {
      Hbarp = (h1p + h2p - 360) / 2;
    }
  }

  const T = 1
    - 0.17 * Math.cos((Hbarp - 30) * deg2rad)
    + 0.24 * Math.cos(2 * Hbarp * deg2rad)
    + 0.32 * Math.cos((3 * Hbarp + 6) * deg2rad)
    - 0.20 * Math.cos((4 * Hbarp - 63) * deg2rad);

  const dTheta = 30 * Math.exp(-Math.pow((Hbarp - 275) / 25, 2));

  const Cbarp7 = Math.pow((C1p + C2p) / 2, 7);
  const RC = 2 * Math.sqrt(Cbarp7 / (Cbarp7 + Math.pow(25, 7)));

  const SL = 1 + (0.015 * Math.pow(Lbar - 50, 2)) / Math.sqrt(20 + Math.pow(Lbar - 50, 2));
  const SC = 1 + 0.045 * ((C1p + C2p) / 2);
  const SH = 1 + 0.015 * ((C1p + C2p) / 2) * T;

  const RT = -Math.sin(2 * dTheta * deg2rad) * RC;

  const term1 = dLp / (kL * SL);
  const term2 = dCp / (kC * SC);
  const term3 = dHp / (kH * SH);

  return Math.sqrt(
    term1 * term1 + term2 * term2 + term3 * term3 + RT * term2 * term3
  );
}

export function scoreColorMatch(hex1, hex2) {
  const lab1 = hexToLab(hex1);
  const lab2 = hexToLab(hex2);
  const deltaE = deltaE2000(lab1, lab2);

  if (deltaE > 40) return null;
  return Math.max(0, Math.round((1 - deltaE / 45) * 100));
}

export function findClosestHex(targetHex, candidates) {
  const targetLab = hexToLab(targetHex);
  const results = [];

  for (const candidate of candidates) {
    let bestScore = 0;
    let bestHex = candidate.hexes[0];

    for (const cHex of candidate.hexes) {
      const cLab = hexToLab(cHex);
      const deltaE = deltaE2000(targetLab, cLab);
      if (deltaE > 40) continue;

      const score = Math.max(0, Math.round((1 - deltaE / 45) * 100));
      if (score > bestScore) {
        bestScore = score;
        bestHex = cHex;
      }
    }

    if (bestScore > 0) {
      results.push({
        ...candidate,
        matchScore: bestScore,
        matchedHex: bestHex,
      });
    }
  }

  results.sort((a, b) => b.matchScore - a.matchScore);
  return results.slice(0, 10);
}

export function hexToRgb(hex) {
  const clean = hex.replace('#', '').trim();
  if (clean.length === 3) {
    return {
      r: parseInt(clean[0] + clean[0], 16) || 0,
      g: parseInt(clean[1] + clean[1], 16) || 0,
      b: parseInt(clean[2] + clean[2], 16) || 0,
    };
  }
  return {
    r: parseInt(clean.slice(0, 2), 16) || 0,
    g: parseInt(clean.slice(2, 4), 16) || 0,
    b: parseInt(clean.slice(4, 6), 16) || 0,
  };
}

export function rgbToHex(r, g, b) {
  const toHex = (c) => Math.max(0, Math.min(255, Math.round(c))).toString(16).padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
}
