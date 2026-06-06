/**
 * quantize.js — MMCQ (Modified Median Cut Quantization)
 * Standalone color quantization algorithm. No dependencies.
 *
 * Based on the Leptonica MMCQ algorithm, ported to JavaScript.
 * Extracts a representative color palette from raw pixel data.
 *
 * @module quantize
 */

// ============================================================
// SECTION 1: Point — a single color with population count
// ============================================================

class Point {
  constructor(r = 0, g = 0, b = 0, count = 1) {
    this.r = r;
    this.g = g;
    this.b = b;
    this.count = count;
  }

  get rgb() {
    return { r: this.r, g: this.g, b: this.b };
  }

  get hex() {
    const toHex = (c) => Math.round(c).toString(16).padStart(2, '0');
    return `#${toHex(this.r)}${toHex(this.g)}${toHex(this.b)}`.toUpperCase();
  }

  distanceTo(other) {
    const dr = this.r - other.r;
    const dg = this.g - other.g;
    const db = this.b - other.b;
    return Math.sqrt(dr * dr + dg * dg + db * db);
  }

  weightedDistanceTo(other) {
    const dr = this.r - other.r;
    const dg = this.g - other.g;
    const db = this.b - other.b;
    return Math.sqrt(2 * dr * dr + 4 * dg * dg + 3 * db * db);
  }

  clone() {
    return new Point(this.r, this.g, this.b, this.count);
  }

  toString() {
    return `${this.hex} (${this.count})`;
  }
}

// ============================================================
// SECTION 2: VBox — a 3D color cube in RGB space
// ============================================================

class VBox {
  constructor(r1, r2, g1, g2, b1, b2, histogram) {
    this.r1 = r1;
    this.r2 = r2;
    this.g1 = g1;
    this.g2 = g2;
    this.b1 = b1;
    this.b2 = b2;
    this.histogram = histogram;
    this._volume = -1;
    this._avg = null;
    this._count = -1;
  }

  volume() {
    if (this._volume < 0) {
      this._volume = (this.r2 - this.r1 + 1) * (this.g2 - this.g1 + 1) * (this.b2 - this.b1 + 1);
    }
    return this._volume;
  }

  count() {
    if (this._count < 0) {
      let total = 0;
      const hist = this.histogram;
      for (let r = this.r1; r <= this.r2; r++) {
        for (let g = this.g1; g <= this.g2; g++) {
          for (let b = this.b1; b <= this.b2; b++) {
            const idx = (r << 10) | (g << 5) | b;
            total += hist[idx] || 0;
          }
        }
      }
      this._count = total;
    }
    return this._count;
  }

  copy() {
    const box = new VBox(this.r1, this.r2, this.g1, this.g2, this.b1, this.b2, this.histogram);
    box._count = this._count;
    box._volume = this._volume;
    return box;
  }

  avg() {
    if (this._avg) return this._avg;

    let total = 0;
    let rSum = 0, gSum = 0, bSum = 0;
    const hist = this.histogram;

    for (let r = this.r1; r <= this.r2; r++) {
      for (let g = this.g1; g <= this.g2; g++) {
        for (let b = this.b1; b <= this.b2; b++) {
          const idx = (r << 10) | (g << 5) | b;
          const count = hist[idx] || 0;
          if (count > 0) {
            total += count;
            rSum += count * (r + 0.5);
            gSum += count * (g + 0.5);
            bSum += count * (b + 0.5);
          }
        }
      }
    }

    if (total === 0) {
      this._avg = new Point(0, 0, 0, 0);
      return this._avg;
    }

    this._avg = new Point(
      rSum / total,
      gSum / total,
      bSum / total,
      total
    );
    return this._avg;
  }

  longestAxis() {
    const rLen = this.r2 - this.r1;
    const gLen = this.g2 - this.g1;
    const bLen = this.b2 - this.b1;

    if (rLen >= gLen && rLen >= bLen) return 'r';
    if (gLen >= rLen && gLen >= bLen) return 'g';
    return 'b';
  }

  medianCut() {
    const axis = this.longestAxis();
    let cutValue;
    let values = [];
    const hist = this.histogram;

    if (axis === 'r') {
      for (let r = this.r1; r <= this.r2; r++) {
        let total = 0;
        for (let g = this.g1; g <= this.g2; g++) {
          for (let b = this.b1; b <= this.b2; b++) {
            const idx = (r << 10) | (g << 5) | b;
            total += hist[idx] || 0;
          }
        }
        values.push({ value: r, total });
      }
    } else if (axis === 'g') {
      for (let g = this.g1; g <= this.g2; g++) {
        let total = 0;
        for (let r = this.r1; r <= this.r2; r++) {
          for (let b = this.b1; b <= this.b2; b++) {
            const idx = (r << 10) | (g << 5) | b;
            total += hist[idx] || 0;
          }
        }
        values.push({ value: g, total });
      }
    } else {
      for (let b = this.b1; b <= this.b2; b++) {
        let total = 0;
        for (let r = this.r1; r <= this.r2; r++) {
          for (let g = this.g1; g <= this.g2; g++) {
            const idx = (r << 10) | (g << 5) | b;
            total += hist[idx] || 0;
          }
        }
        values.push({ value: b, total });
      }
    }

    const totalCount = this.count();
    const halfCount = totalCount / 2;
    let cumulative = 0;

    for (let i = 0; i < values.length; i++) {
      cumulative += values[i].total;
      if (cumulative >= halfCount) {
        cutValue = values[i].value;
        break;
      }
    }

    if (cutValue === undefined) {
      cutValue = values[Math.floor(values.length / 2)]?.value || (axis === 'r' ? this.r1 : axis === 'g' ? this.g1 : this.b1);
    }

    const box1 = this.copy();
    const box2 = this.copy();

    if (axis === 'r') {
      box1.r2 = cutValue;
      box2.r1 = cutValue + 1;
    } else if (axis === 'g') {
      box1.g2 = cutValue;
      box2.g1 = cutValue + 1;
    } else {
      box1.b2 = cutValue;
      box2.b1 = cutValue + 1;
    }

    return [box1, box2];
  }
}

// ============================================================
// SECTION 3: CMap — collection of VBoxes forming a palette
// ============================================================

class CMap {
  constructor() {
    this.vboxes = [];
  }

  push(vbox) {
    this.vboxes.push(vbox);
  }

  palette() {
    return this.vboxes.map((vbox) => {
      const avg = vbox.avg();
      return { r: avg.r, g: avg.g, b: avg.b, population: avg.count };
    });
  }

  size() {
    return this.vboxes.length;
  }

  nearest(color) {
    let bestDist = Infinity;
    let best = null;

    for (const vbox of this.vboxes) {
      const avg = vbox.avg();
      const dr = color.r - avg.r;
      const dg = color.g - avg.g;
      const db = color.b - avg.b;
      const dist = dr * dr + dg * dg + db * db;

      if (dist < bestDist) {
        bestDist = dist;
        best = avg;
      }
    }

    return best;
  }
}

// ============================================================
// SECTION 4: Histogram Builder
// ============================================================

function buildHistogram(pixels, quality = 10, ignoreAlpha = true) {
  const hist = new Uint32Array(32768);
  const pixelCount = pixels.length / 4;

  for (let i = 0; i < pixelCount; i += quality) {
    const offset = i * 4;
    let r = pixels[offset];
    let g = pixels[offset + 1];
    let b = pixels[offset + 2];
    let a = pixels[offset + 3];

    if (ignoreAlpha && a !== undefined && a < 128) continue;

    r = (r >> 3) & 0x1f;
    g = (g >> 3) & 0x1f;
    b = (b >> 3) & 0x1f;

    const idx = (r << 10) | (g << 5) | b;
    hist[idx] = (hist[idx] || 0) + 1;
  }

  return { histogram: hist, pixelCount: Math.ceil(pixelCount / quality) };
}

// ============================================================
// SECTION 5: Main quantize() function
// ============================================================

function vboxFromHistogram(histogram) {
  let rMin = 32, rMax = 0;
  let gMin = 32, gMax = 0;
  let bMin = 32, bMax = 0;

  for (let i = 0; i < 32768; i++) {
    if (histogram[i] > 0) {
      const r = (i >> 10) & 0x1f;
      const g = (i >> 5) & 0x1f;
      const b = i & 0x1f;

      if (r < rMin) rMin = r;
      if (r > rMax) rMax = r;
      if (g < gMin) gMin = g;
      if (g > gMax) gMax = g;
      if (b < bMin) bMin = b;
      if (b > bMax) bMax = b;
    }
  }

  return new VBox(rMin, rMax, gMin, gMax, bMin, bMax, histogram);
}

function quantize(pixels, maxColors = 5, quality = 10) {
  if (maxColors < 2) maxColors = 2;
  if (maxColors > 256) maxColors = 256;
  if (quality < 1) quality = 1;

  const pixelCount = pixels.length / 4;
  const adjustedQuality = pixelCount > 3000000 ? Math.max(quality, 15) : quality;

  const { histogram, pixelCount: sampled } = buildHistogram(pixels, adjustedQuality);

  if (sampled === 0) {
    return [{ r: 0, g: 0, b: 0, population: 0 }];
  }

  const initialVbox = vboxFromHistogram(histogram);
  const cmap = new CMap();
  const vboxQueue = [initialVbox];

  const iter = (a, b) => b.count() - a.count();

  while (vboxQueue.length < maxColors) {
    vboxQueue.sort(iter);
    const vbox = vboxQueue.shift();

    if (!vbox || vbox.count() === 0) {
      if (vboxQueue.length > 0) continue;
      break;
    }

    const [box1, box2] = vbox.medianCut();

    if (box1.count() === 0 || box2.count() === 0) {
      cmap.push(vbox);
      continue;
    }

    vboxQueue.push(box1, box2);

    if (vboxQueue.length >= maxColors * 10) break;
  }

  vboxQueue.sort(iter);

  for (const vbox of vboxQueue) {
    if (vbox.count() > 0) {
      cmap.push(vbox);
    }
    if (cmap.size() >= maxColors) break;
  }

  const palette = cmap.palette();

  const totalPopulation = palette.reduce((sum, c) => sum + c.population, 0);

  palette.sort((a, b) => b.population - a.population);

  return palette.map((c) => ({
    r: Math.round(c.r),
    g: Math.round(c.g),
    b: Math.round(c.b),
    population: c.population,
    pct: totalPopulation > 0 ? (c.population / totalPopulation) * 100 : 0,
  }));
}

// ============================================================
// SECTION 6: Simple Sampling Fallback (fast mode)
// ============================================================

function samplePalette(pixels, count = 5) {
  const pixelCount = pixels.length / 4;
  if (pixelCount === 0) return [];

  const step = Math.max(1, Math.floor(pixelCount / (count * 20)));
  const sampled = [];
  const used = new Set();

  for (let i = 0; i < pixelCount && sampled.length < count * 15; i += step) {
    const offset = i * 4;
    const r = pixels[offset];
    const g = pixels[offset + 1];
    const b = pixels[offset + 2];
    const a = pixels[offset + 3];

    if (a < 128) continue;

    const key = `${r},${g},${b}`;
    if (!used.has(key)) {
      used.add(key);
      sampled.push({ r, g, b, count: 1 });
    } else {
      const existing = sampled.find((s) => s.r === r && s.g === g && s.b === b);
      if (existing) existing.count++;
    }
  }

  sampled.sort((a, b) => b.count - a.count);

  const clusters = sampled.slice(0, count * 3);
  const finalColors = [];
  const clusterSize = Math.max(1, Math.floor(clusters.length / count));

  for (let i = 0; i < clusters.length; i += clusterSize) {
    const slice = clusters.slice(i, i + clusterSize);
    if (slice.length === 0) continue;

    const rAvg = Math.round(slice.reduce((s, c) => s + c.r, 0) / slice.length);
    const gAvg = Math.round(slice.reduce((s, c) => s + c.g, 0) / slice.length);
    const bAvg = Math.round(slice.reduce((s, c) => s + c.b, 0) / slice.length);
    const pop = slice.reduce((s, c) => s + c.count, 0);

    finalColors.push({ r: rAvg, g: gAvg, b: bAvg, population: pop });
  }

  finalColors.sort((a, b) => b.population - a.population);
  const total = finalColors.reduce((s, c) => s + c.population, 0);

  return finalColors.slice(0, count).map((c) => ({
    r: c.r,
    g: c.g,
    b: c.b,
    population: c.population,
    pct: total > 0 ? (c.population / total) * 100 : 0,
  }));
}

// ============================================================
// SECTION 7: Utility Functions
// ============================================================

function colorDistance(c1, c2) {
  const dr = c1.r - c2.r;
  const dg = c1.g - c2.g;
  const db = c1.b - c2.b;
  return Math.sqrt(dr * dr + dg * dg + db * db);
}

function weightedColorDistance(c1, c2) {
  const rMean = (c1.r + c2.r) / 2;
  const dr = c1.r - c2.r;
  const dg = c1.g - c2.g;
  const db = c1.b - c2.b;

  const weightR = 2 + rMean / 256;
  const weightG = 4;
  const weightB = 2 + (255 - rMean) / 256;

  return Math.sqrt(weightR * dr * dr + weightG * dg * dg + weightB * db * db);
}

function mergeSimilarColors(colors, threshold = 35) {
  if (colors.length <= 3) return colors;

  const merged = [];
  const used = new Set();

  for (let i = 0; i < colors.length; i++) {
    if (used.has(i)) continue;
    used.add(i);

    let rSum = colors[i].r * colors[i].population;
    let gSum = colors[i].g * colors[i].population;
    let bSum = colors[i].b * colors[i].population;
    let popSum = colors[i].population;
    let count = 1;

    for (let j = i + 1; j < colors.length; j++) {
      if (used.has(j)) continue;
      const dist = weightedColorDistance(colors[i], colors[j]);
      if (dist < threshold) {
        used.add(j);
        rSum += colors[j].r * colors[j].population;
        gSum += colors[j].g * colors[j].population;
        bSum += colors[j].b * colors[j].population;
        popSum += colors[j].population;
        count++;
      }
    }

    merged.push({
      r: Math.round(rSum / popSum),
      g: Math.round(gSum / popSum),
      b: Math.round(bSum / popSum),
      population: popSum,
    });
  }

  merged.sort((a, b) => b.population - a.population);
  return merged;
}

function gammaCorrect(value) {
  return Math.pow(value / 255, 2.2) * 255;
}

function inverseGamma(value) {
  return Math.pow(value / 255, 1 / 2.2) * 255;
}

function rgbToHex(r, g, b) {
  const toHex = (c) => Math.max(0, Math.min(255, Math.round(c))).toString(16).padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
}

function significantBits(pixels) {
  const pixelCount = pixels.length / 4;
  let maxBits = 0;

  for (let i = 0; i < Math.min(pixelCount, 1000); i++) {
    const offset = i * 4;
    const r = pixels[offset];
    const g = pixels[offset + 1];
    const b = pixels[offset + 2];

    const bits = (r >> 5) + (g >> 5) + (b >> 5);
    if (bits > maxBits) maxBits = bits;
  }

  return maxBits;
}

// ============================================================
// EXPORTS
// ============================================================

export {
  quantize,
  samplePalette,
  colorDistance,
  weightedColorDistance,
  mergeSimilarColors,
  rgbToHex,
  gammaCorrect,
  inverseGamma,
  significantBits,
  Point,
  VBox,
  CMap,
};
