/**
 * colorExtractor.js
 * Handles image upload, preview rendering, and dominant color extraction
 * via the MMCQ quantization algorithm.
 *
 * @module colorExtractor
 */

import { quantize, samplePalette, mergeSimilarColors, rgbToHex } from '../lib/quantize.js';

// ============================================================
// STATE
// ============================================================

let generation = 0;

const state = {
  file: null,
  imageUrl: null,
  imageData: null,
  dominantColors: [],
  sourceWidth: 0,
  sourceHeight: 0,
  isExtracting: false,
  extractionHistory: [],
  abortController: null,
};

function getEl(id) {
  const el = document.getElementById(id);
  if (!el) console.warn(`colorExtractor: element #${id} not found`);
  return el;
}

// ============================================================
// DOM REFS
// ============================================================

const uploadZone = getEl('uploadZone');
const fileInput = getEl('fileInput');
const uploadPlaceholder = getEl('uploadPlaceholder');
const uploadPreview = getEl('uploadPreview');
const previewImage = getEl('previewImage');
const extractionOverlay = getEl('extractionOverlay');
const fileError = getEl('fileError');
const swatchesContainer = getEl('swatchesContainer');

// ============================================================
// PUBLIC API
// ============================================================

export function init() {
  bindEvents();
}

export async function processFile(file) {
  const gen = ++generation;

  if (state.isExtracting) {
    if (state.abortController) state.abortController.abort();
  }
  state.abortController = new AbortController();

  const validation = validateFile(file);
  if (!validation.valid) {
    showError(validation.message);
    return null;
  }

  state.file = file;
  state.isExtracting = true;
  setLoading(true);
  dispatchStart();

  try {
    if (gen !== generation) return null;

    const imageUrl = await readFileAsDataURL(file);
    if (gen !== generation) return null;
    state.imageUrl = imageUrl;

    const img = await loadImage(imageUrl);
    if (gen !== generation) return null;
    state.sourceWidth = img.naturalWidth;
    state.sourceHeight = img.naturalHeight;

    showPreview(img);

    const pixels = getImageData(img);
    state.imageData = pixels;

    const rawColors = await extractColors(pixels, getMaxColors());
    if (gen !== generation) return null;
    state.dominantColors = rawColors;
    state.extractionHistory.push([...rawColors]);

    displaySwatches(rawColors);
    showExtractionComplete();
    dispatchReady(rawColors, file.name);
    return rawColors;

  } catch (err) {
    if (err.name === 'AbortError') return null;
    showError(err.message || 'Failed to process image');
    dispatchError(err.message || 'Failed to process image');
    return null;
  } finally {
    state.isExtracting = false;
    setLoading(false);
  }
}

export async function processUrl(url) {
  const response = await fetch(url);
  if (!response.ok) throw new Error('Failed to load demo image');
  const blob = await response.blob();
  const file = new File([blob], 'demo.jpg', { type: blob.type || 'image/jpeg' });
  return await processFile(file);
}

export function getPalette() {
  return state.dominantColors.map(c => ({ ...c }));
}

export function getHistory() {
  return state.extractionHistory.map(entry => entry.map(c => ({ ...c })));
}

export function reset() {
  state.file = null;
  state.imageUrl = null;
  state.imageData = null;
  state.dominantColors = [];
  state.isExtracting = false;

  uploadPreview?.classList.remove('displayed');
  const previewImg = uploadPreview?.querySelector('img');
  if (previewImg) previewImg.src = '';
  if (uploadPlaceholder) uploadPlaceholder.style.display = 'flex';
  extractionOverlay?.classList.remove('active');
  fileError?.classList.remove('active');
  uploadZone?.classList.remove('has-file', 'is-extracting', 'is-error');
  if (uploadZone) uploadZone.style.borderColor = '';
}

function setLoading(isLoading) {
  if (isLoading) {
    extractionOverlay?.classList.add('active');
    uploadZone?.classList.add('is-extracting');
  } else {
    extractionOverlay?.classList.remove('active');
    uploadZone?.classList.remove('is-extracting');
  }
}

// ============================================================
// EVENT BINDING
// ============================================================

function bindEvents() {
  uploadZone?.addEventListener('click', () => fileInput?.click());
  uploadZone?.addEventListener('dragenter', onDragEnter);
  uploadZone?.addEventListener('dragover', onDragOver);
  uploadZone?.addEventListener('dragleave', onDragLeave);
  uploadZone?.addEventListener('drop', onDrop);
  fileInput?.addEventListener('change', onFileInput);

  ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(evt => {
    document.addEventListener(evt, preventDefaults);
  });
}

function preventDefaults(e) {
  e.preventDefault();
  e.stopPropagation();
}

function onDragEnter(e) {
  uploadZone?.classList.add('drag-over');
}

function onDragOver(e) {
  uploadZone?.classList.add('drag-over');
}

function onDragLeave(e) {
  if (!uploadZone?.contains(e.relatedTarget)) {
    uploadZone?.classList.remove('drag-over');
  }
}

function onDrop(e) {
  uploadZone?.classList.remove('drag-over');
  const files = e.dataTransfer.files;
  if (files && files.length > 0) {
    processFile(files[0]);
  }
}

function onFileInput(e) {
  if (e.target.files && e.target.files.length > 0) {
    processFile(e.target.files[0]);
  }
}

// ============================================================
// FILE VALIDATION
// ============================================================

function validateFile(file) {
  if (!file) return { valid: false, message: 'No file selected' };

  const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/bmp', 'image/tiff'];
  if (!validTypes.includes(file.type) && !file.type.startsWith('image/')) {
    return { valid: false, message: 'Please upload an image file (JPG, PNG, WebP)' };
  }

  const maxSize = 10 * 1024 * 1024;
  if (file.size > maxSize) {
    const sizeMb = (file.size / (1024 * 1024)).toFixed(1);
    return { valid: false, message: `Image too large (${sizeMb}MB). Maximum is 10MB.` };
  }

  if (file.size === 0) {
    return { valid: false, message: 'File is empty' };
  }

  return { valid: true, message: '' };
}

function showError(message) {
  if (fileError) fileError.textContent = message;
  fileError?.classList.add('active');
  uploadZone?.classList.add('is-error');
  setTimeout(() => {
    fileError?.classList.remove('active');
    uploadZone?.classList.remove('is-error');
  }, 4000);
}

// ============================================================
// IMAGE PROCESSING
// ============================================================

function readFileAsDataURL(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.onabort = () => reject(new DOMException('Aborted', 'AbortError'));
    reader.readAsDataURL(file);
  });
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Failed to decode image'));
    img.onabort = () => reject(new DOMException('Aborted', 'AbortError'));
    img.src = src;
  });
}

function showPreview(img) {
  if (previewImage) {
    previewImage.src = img.src;
    previewImage.alt = state.file ? state.file.name : 'Preview';
  }
  uploadPreview?.classList.add('displayed');
  if (uploadPlaceholder) uploadPlaceholder.style.display = 'none';
  uploadZone?.classList.add('has-file');
}

function getImageData(img, maxDimension) {
  if (maxDimension === undefined) {
    maxDimension = window.__COLORIS_CONFIG__?.MAX_DIMENSION || 1600;
  }
  const width = img.naturalWidth;
  const height = img.naturalHeight;

  let canvasWidth = width;
  let canvasHeight = height;

  if (width > maxDimension || height > maxDimension) {
    const ratio = Math.min(maxDimension / width, maxDimension / height);
    canvasWidth = Math.round(width * ratio);
    canvasHeight = Math.round(height * ratio);
  }

  const canvas = document.createElement('canvas');
  canvas.width = canvasWidth;
  canvas.height = canvasHeight;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) throw new Error('Canvas context unavailable');

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(img, 0, 0, canvasWidth, canvasHeight);

  return ctx.getImageData(0, 0, canvasWidth, canvasHeight);
}

// ============================================================
// COLOR EXTRACTION
// ============================================================

async function extractColors(pixels, count = 5) {
  const startTime = performance.now();
  const minDistance = getMinColorDistance();

  let rawColors;
  try {
    rawColors = extractColorsExact(pixels.data, pixels.width || 800, pixels.height || 600, count);
  } catch (e) {
    rawColors = samplePalette(pixels.data, count);
  }

  if (!rawColors || rawColors.length === 0) {
    rawColors = samplePaletteFallback(pixels.data, count);
  }

  const merged = minDistance > 0 ? mergeSimilarColors(rawColors, minDistance) : rawColors;

  const totalPopulation = merged.reduce((sum, c) => sum + c.population, 0);
  const processed = merged.slice(0, count).map(c => ({
    r: Math.round(c.r),
    g: Math.round(c.g),
    b: Math.round(c.b),
    hex: rgbToHex(Math.round(c.r), Math.round(c.g), Math.round(c.b)),
    population: c.population,
    pct: totalPopulation > 0 ? parseFloat(((c.population / totalPopulation) * 100).toFixed(1)) : 0,
    region: c.region || null,
  }));

  const elapsed = performance.now() - startTime;

  return processed;
}

function samplePaletteFallback(pixels, count) {
  const step = 4;
  const freq = {};
  const pixelCount = Math.floor(pixels.length / 4);

  for (let i = 0; i < pixelCount; i += step) {
    const offset = i * 4;
    const r = Math.round(pixels[offset] / 16) * 16;
    const g = Math.round(pixels[offset + 1] / 16) * 16;
    const b = Math.round(pixels[offset + 2] / 16) * 16;
    const key = `${r},${g},${b}`;
    freq[key] = (freq[key] || 0) + 1;
  }

  const sorted = Object.entries(freq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, count);

  if (sorted.length === 0) {
    return [{ r: 93, g: 68, b: 50, population: 1 }];
  }

  const total = sorted.reduce((s, e) => s + e[1], 0);
  return sorted.map(([key, pop]) => {
    const [r, g, b] = key.split(',').map(Number);
    return { r, g, b, population: pop, pct: total > 0 ? (pop / total) * 100 : 0 };
  });
}

function extractColorsExact(pixels, width, height, count) {
  const bins = {};
  const regions = {};
  const pixelCount = pixels.length / 4;

  for (let i = 0; i < pixelCount; i++) {
    const offset = i * 4;
    const r = pixels[offset];
    const g = pixels[offset + 1];
    const b = pixels[offset + 2];
    const a = pixels[offset + 3];
    if (a < 128) continue;

    const key = `${r >> 2},${g >> 2},${b >> 2}`;
    if (!bins[key]) {
      bins[key] = { r: 0, g: 0, b: 0, count: 0, pixels: [] };
    }
    bins[key].r += r;
    bins[key].g += g;
    bins[key].b += b;
    bins[key].count++;
    bins[key].pixels.push([i % width, Math.floor(i / width)]);
  }

  const sorted = Object.values(bins)
    .map(b => ({
      r: Math.round(b.r / b.count),
      g: Math.round(b.g / b.count),
      b: Math.round(b.b / b.count),
      population: b.count,
      pixels: b.pixels,
    }))
    .sort((a, b) => b.population - a.population)
    .slice(0, count * 3);

  const merged = mergeSimilarColors(sorted, 8);
  const totalPopulation = merged.reduce((s, c) => s + c.population, 0);

  return merged.slice(0, count).map(c => {
    const region = c.pixels && c.pixels.length > 0
      ? { x: c.pixels[0][0], y: c.pixels[0][1] }
      : { x: 0, y: 0 };
    return {
      r: Math.round(c.r),
      g: Math.round(c.g),
      b: Math.round(c.b),
      hex: rgbToHex(Math.round(c.r), Math.round(c.g), Math.round(c.b)),
      population: c.population,
      pct: totalPopulation > 0 ? parseFloat(((c.population / totalPopulation) * 100).toFixed(1)) : 0,
      region,
    };
  });
}

function getRegionThumbnail(sourceImg, region, size = 48) {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';
  const sx = Math.max(0, region.x - size / 2);
  const sy = Math.max(0, region.y - size / 2);
  ctx.drawImage(sourceImg, sx, sy, size, size, 0, 0, size, size);
  return canvas.toDataURL();
}

function getMaxColors() {
  return window.__COLORIS_CONFIG__?.MAX_COLORS || 5;
}

function getExtractionQuality() {
  return window.__COLORIS_CONFIG__?.EXTRACTION_QUALITY || 10;
}

function getMinColorDistance() {
  return window.__COLORIS_CONFIG__?.MIN_COLOR_DISTANCE || 35;
}

// ============================================================
// SWATCH RENDERING
// ============================================================

function displaySwatches(colors) {
  if (!swatchesContainer) return;
  swatchesContainer.innerHTML = '';

  const sourceImg = state.imageUrl ? new Image() : null;
  if (sourceImg) sourceImg.src = state.imageUrl;

  colors.forEach((color, index) => {
    const swatch = document.createElement('div');
    swatch.className = 'swatch entering';
    swatch.setAttribute('role', 'listitem');
    swatch.style.setProperty('--i', index);
    swatch.style.animationDelay = `${index * 80}ms`;

    const colorDiv = document.createElement('div');
    colorDiv.className = 'swatch-color';
    colorDiv.style.background = color.hex;

    const swatchInner = document.createElement('div');
    swatchInner.className = 'swatch-inner';

    const hexSpan = document.createElement('span');
    hexSpan.className = 'swatch-hex';
    hexSpan.textContent = color.hex;

    const pctSpan = document.createElement('span');
    pctSpan.className = 'swatch-pct';
    pctSpan.textContent = `${color.pct}%`;

    swatchInner.appendChild(hexSpan);
    swatchInner.appendChild(pctSpan);

    if (color.region && sourceImg) {
      const thumb = document.createElement('canvas');
      thumb.className = 'swatch-region';
      thumb.width = 48;
      thumb.height = 48;
      const tCtx = thumb.getContext('2d');
      if (tCtx) {
        const loadHandler = () => {
          const sx = Math.max(0, color.region.x - 24);
          const sy = Math.max(0, color.region.y - 24);
          tCtx.fillStyle = color.hex;
          tCtx.fillRect(0, 0, 48, 48);
          tCtx.drawImage(sourceImg, sx, sy, 48, 48, 0, 0, 48, 48);
        };
        if (sourceImg.complete) loadHandler();
        else sourceImg.addEventListener('load', loadHandler, { once: true });
      }
      swatch.appendChild(thumb);
    } else {
      swatch.appendChild(colorDiv);
    }

    swatch.appendChild(swatchInner);

    swatch.addEventListener('click', () => {
      if (navigator.clipboard) {
        navigator.clipboard.writeText(color.hex).catch(() => {});
      }
    });

    swatchesContainer.appendChild(swatch);
  });

  setTimeout(() => {
    swatchesContainer.querySelectorAll('.swatch-color').forEach(el => {
      el.classList.add('breathing');
    });
  }, 1000);

  requestAnimationFrame(() => {
    swatchesContainer.querySelectorAll('.swatch').forEach(s => {
      s.classList.remove('entering');
    });
  });
}

function showExtractionComplete() {
  extractionOverlay?.classList.remove('active');
  uploadZone?.classList.remove('is-extracting');
}

// ============================================================
// EVENT DISPATCH
// ============================================================

function dispatchStart() {
  document.dispatchEvent(new CustomEvent('extraction:start', {
    detail: { source: state.file?.name || 'unknown' },
    bubbles: true,
  }));
}

function dispatchReady(colors, source) {
  document.dispatchEvent(new CustomEvent('extraction:complete', {
    detail: { colors, source },
    bubbles: true,
  }));
}

function dispatchError(error) {
  document.dispatchEvent(new CustomEvent('extraction:error', {
    detail: { error },
    bubbles: true,
  }));
}

// ============================================================
// EXPORTED UTILITY
// ============================================================

export function getUploadedImageUrl() {
  return state.imageUrl;
}
