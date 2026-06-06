/**
 * collageBuilder.js
 * Manages the collage tray, image selection, drag-to-reorder,
 * layout presets, and high-resolution canvas export.
 *
 * @module collageBuilder
 */

function ensureRoundRect(ctx) {
  if (!ctx.roundRect) {
    ctx.roundRect = function (x, y, w, h, r) {
      if (typeof r === 'number') r = { tl: r, tr: r, br: r, bl: r };
      ctx.beginPath();
      ctx.moveTo(x + r.tl, y);
      ctx.lineTo(x + w - r.tr, y);
      ctx.quadraticCurveTo(x + w, y, x + w, y + r.tr);
      ctx.lineTo(x + w, y + h - r.br);
      ctx.quadraticCurveTo(x + w, y + h, x + w, y + h - r.br);
      ctx.lineTo(x + r.bl, y + h);
      ctx.quadraticCurveTo(x, y + h, x, y + h - r.bl);
      ctx.lineTo(x, y + r.tl);
      ctx.quadraticCurveTo(x, y, x + r.tl, y);
      ctx.closePath();
    };
  }
}

function canvasToBlob(canvas, type = 'image/png', quality = 0.92) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error('canvas.toBlob timed out'));
    }, 10000);

    canvas.toBlob((blob) => {
      clearTimeout(timer);
      if (blob) {
        resolve(blob);
      } else {
        reject(new Error('canvas.toBlob returned null'));
      }
    }, type, quality);
  });
}

function getEl(id) {
  const el = document.getElementById(id);
  if (!el) console.warn(`collageBuilder: element #${id} not found`);
  return el;
}

// ============================================================
// LAYOUT DEFINITIONS
// ============================================================

const LAYOUTS = {
  'grid-2x2':  { cols: 2, rows: 2,   cellW: 600, cellH: 600, gap: 16, padding: 32, label: '2×2 Grid' },
  'grid-3x2':  { cols: 3, rows: 2,   cellW: 500, cellH: 500, gap: 14, padding: 28, label: '3×2 Grid' },
  'grid-4x2':  { cols: 4, rows: 2,   cellW: 400, cellH: 400, gap: 12, padding: 24, label: '4×2 Grid' },
  'grid-3x3':  { cols: 3, rows: 3,   cellW: 500, cellH: 500, gap: 14, padding: 28, label: '3×3 Grid' },
  'polaroid':  { cols: 4, rows: 2,   cellW: 300, cellH: 380, gap: 20, padding: 40, label: 'Polaroid' },
};

// ============================================================
// STATE
// ============================================================

const state = {
  selectedImages: [],
  layoutType: 'grid-2x2',
  maxImages: 12,
  isExporting: false,
  dragIndex: null,
};

// ============================================================
// DOM REFS
// ============================================================

const collageOverlay = getEl('collageOverlay');
const collageTray = getEl('collageTray');
const trayItems = getEl('trayItems');
const trayCount = getEl('trayCount');
const exportBtn = getEl('exportCollageBtn');
const closeBtn = getEl('collageCloseBtn');
const clearBtn = getEl('collageClearBtn');
const htmlBtn = getEl('exportHtmlBtn');
const layoutBtns = document.querySelectorAll('.layout-opt');
const collagePreview = getEl('collagePreview');
const collageCanvas = getEl('collageCanvas');

// ============================================================
// PUBLIC API
// ============================================================

export function init() {
  bindLayoutButtons();
  setupDragDrop();
  exportBtn?.addEventListener('click', exportCollage);
  htmlBtn?.addEventListener('click', exportCollageHTML);
  closeBtn?.addEventListener('click', hideTray);
  clearBtn?.addEventListener('click', clearAll);
  updateUI();
}

export function addImage(imageData) {
  if (state.selectedImages.length >= state.maxImages) {
    dispatchToast('Maximum ' + state.maxImages + ' images allowed', 'warning');
    return false;
  }

  if (state.selectedImages.find(img => img.id === imageData.id)) return false;

  state.selectedImages.push({
    ...imageData,
    _selectionIndex: state.selectedImages.length,
  });

  updateUI();
  dispatchUpdate();
  return true;
}

export function removeImage(id) {
  const index = state.selectedImages.findIndex(img => img.id === id);
  if (index === -1) return false;

  state.selectedImages.splice(index, 1);
  updateUI();
  dispatchUpdate();
  return true;
}

export function toggleImage(imageData) {
  const existing = state.selectedImages.find(img => img.id === imageData.id);
  if (existing) {
    removeImage(imageData.id);
    return false;
  } else {
    addImage(imageData);
    return true;
  }
}

export function isSelected(id) {
  return state.selectedImages.some(img => img.id === id);
}

export function getImages() {
  return [...state.selectedImages];
}

export function getCount() {
  return state.selectedImages.length;
}

export function setLayout(type) {
  if (!LAYOUTS[type]) return;
  state.layoutType = type;

  layoutBtns.forEach(btn => {
    const isActive = btn.dataset.layout === type;
    btn.classList.toggle('active', isActive);
    btn.setAttribute('aria-checked', isActive ? 'true' : 'false');
  });

  if (state.selectedImages.length > 0) {
    renderPreview();
  }
  dispatchUpdate();
}

export async function exportCollage() {
  if (state.selectedImages.length === 0 || state.isExporting) return;

  state.isExporting = true;
  exportBtn?.classList.add('is-loading');
  dispatchExportStart();

  try {
    const layout = LAYOUTS[state.layoutType];
    const imageCount = Math.min(state.selectedImages.length, layout.cols * layout.rows);
    const images = state.selectedImages.slice(0, imageCount);

    const { canvasWidth, canvasHeight } = calcCanvasSize(layout, imageCount);
    const canvas = document.createElement('canvas');
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
    const ctx = canvas.getContext('2d');

    ensureRoundRect(ctx);
    drawBackground(ctx, canvasWidth, canvasHeight);

    let loadedImages;
    try {
      loadedImages = await preloadImages(images);
    } catch (loadErr) {
      dispatchExportError('Failed to load images');
      return;
    }

    const isPolaroid = state.layoutType === 'polaroid';

    const gap = layout.gap * 2;
    const pad = layout.padding * 2;
    const usableW = canvasWidth - pad * 2;
    const usableH = canvasHeight - pad * 2;
    const cellW = (usableW - gap * (layout.cols - 1)) / layout.cols;
    const cellH = (usableH - gap * (layout.rows - 1)) / layout.rows;

    loadedImages.forEach((img, i) => {
      const col = i % layout.cols;
      const row = Math.floor(i / layout.cols);
      const x = pad + col * (cellW + gap);
      const y = pad + row * (cellH + gap);

      if (isPolaroid) {
        drawPolaroidCell(ctx, img, x, y, cellW, cellH);
      } else {
        drawImageCell(ctx, img, x, y, cellW, cellH);
      }
    });

    drawWatermark(ctx, canvasWidth, canvasHeight);

    try {
      const blob = await canvasToBlob(canvas, 'image/png', 0.92);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `coloris-collage-${Date.now()}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 2000);
      dispatchExportComplete(blob);
    } catch {
      dispatchExportError('Export failed');
    }
  } catch (err) {
    dispatchExportError(err.message);
  } finally {
    state.isExporting = false;
    exportBtn?.classList.remove('is-loading');
  }
}

export function showTray() {
  if (!collageOverlay) return;
  collageOverlay.classList.remove('hidden');
  void collageOverlay.offsetHeight;
  collageOverlay.classList.add('visible');
}

export function hideTray() {
  if (!collageOverlay) return;
  collageOverlay.classList.remove('visible');
  setTimeout(() => collageOverlay.classList.add('hidden'), 500);
}

export function clearAll() {
  state.selectedImages = [];
  updateUI();
  hideTray();
  dispatchUpdate();
}

// ============================================================
// LAYOUT BUTTONS
// ============================================================

function bindLayoutButtons() {
  layoutBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      setLayout(btn.dataset.layout);
    });
  });
}

// ============================================================
// UI UPDATES
// ============================================================

function updateUI() {
  renderTray();
  updateCount();
  updateExportButton();
  renderPreview();
}

function renderTray() {
  if (!trayItems) return;
  trayItems.innerHTML = '';

  state.selectedImages.forEach((img, index) => {
    const item = document.createElement('div');
    item.className = 'tray-item';
    item.draggable = true;
    item.dataset.index = index;
    item.dataset.id = img.id;
    item.setAttribute('role', 'listitem');

    const imageEl = document.createElement('img');
    imageEl.src = img.thumbUrl || img.url;
    imageEl.alt = img.author || 'Selected image';
    imageEl.loading = 'lazy';
    imageEl.draggable = false;

    const nameEl = document.createElement('span');
    nameEl.className = 'tray-item-name';
    nameEl.textContent = img.author || 'Image';

    const removeBtn = document.createElement('button');
    removeBtn.className = 'remove-btn';
    removeBtn.innerHTML = '&times;';
    removeBtn.setAttribute('aria-label', 'Remove image');
    removeBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      removeImage(img.id);
    });

    item.appendChild(imageEl);
    item.appendChild(nameEl);
    item.appendChild(removeBtn);
    trayItems.appendChild(item);
  });
}

function updateCount() {
  if (trayCount) trayCount.textContent = `${state.selectedImages.length} / ${state.maxImages}`;
}

function updateExportButton() {
  if (exportBtn) exportBtn.disabled = state.selectedImages.length < 2;
}

// ============================================================
// DRAG & DROP
// ============================================================

function setupDragDrop() {
  if (!trayItems) return;
  let dragItem = null;

  trayItems.addEventListener('dragstart', (e) => {
    const item = e.target.closest('.tray-item');
    if (!item) return;
    dragItem = item;
    item.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', item.dataset.id);
  });

  trayItems.addEventListener('dragend', (e) => {
    const item = e.target.closest('.tray-item');
    if (item) item.classList.remove('dragging');
    document.querySelectorAll('.tray-item.drag-over').forEach(el => el.classList.remove('drag-over'));
    dragItem = null;
  });

  trayItems.addEventListener('dragover', (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';

    const target = e.target.closest('.tray-item');
    if (!target || target === dragItem) return;

    const rect = target.getBoundingClientRect();
    const midY = rect.top + rect.height / 2;
    const after = e.clientY > midY;

    document.querySelectorAll('.tray-item.drag-over').forEach(el => el.classList.remove('drag-over'));
    target.classList.add('drag-over');
  });

  trayItems.addEventListener('drop', (e) => {
    e.preventDefault();
    const target = e.target.closest('.tray-item');
    if (!target || !dragItem) return;

    const fromId = dragItem.dataset.id;
    const toId = target.dataset.id;

    if (fromId === toId) return;

    const fromIndex = state.selectedImages.findIndex(img => img.id === fromId);
    const toIndex = state.selectedImages.findIndex(img => img.id === toId);

    if (fromIndex !== -1 && toIndex !== -1) {
      const [moved] = state.selectedImages.splice(fromIndex, 1);
      state.selectedImages.splice(toIndex, 0, moved);
      updateUI();
      dispatchUpdate();
    }
  });
}

// ============================================================
// CANVAS EXPORT ENGINE
// ============================================================

function calcCanvasSize(layout, imageCount) {
  const count = Math.min(imageCount, layout.cols * layout.rows);
  const cols = Math.min(count, layout.cols);
  const rows = Math.ceil(count / layout.cols);

  const totalW = layout.padding * 2 + cols * layout.cellW + (cols - 1) * layout.gap;
  const totalH = layout.padding * 2 + rows * layout.cellH + (rows - 1) * layout.gap;

  return { canvasWidth: Math.round(totalW), canvasHeight: Math.round(totalH) };
}

function drawBackground(ctx, w, h) {
  ctx.fillStyle = '#F9F7F5';
  ctx.fillRect(0, 0, w, h);

  ctx.fillStyle = '#F1EDE8';
  ctx.fillRect(0, 0, w, 4);
  ctx.fillRect(0, h - 4, w, 4);
}

function preloadImages(images) {
  return Promise.all(images.map(img => {
    return new Promise((resolve) => {
      const image = new Image();
      image.crossOrigin = 'anonymous';
      image.onload = () => resolve(image);
      image.onerror = () => {
        const fallback = new Image();
        fallback.onload = () => resolve(fallback);
        fallback.src = 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" fill="#F1EDE8"><rect width="800" height="600"/><text x="400" y="300" text-anchor="middle" fill="#A6988A" font-size="16">Failed to load</text></svg>');
      };
      image.src = img.url;
      setTimeout(() => { if (!image.complete) resolve(image); }, 8000);
    });
  }));
}

function drawImageCell(ctx, img, x, y, w, h) {
  ctx.save();
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, 6);
  ctx.clip();

  const imgAspect = img.naturalWidth / img.naturalHeight || 1;
  const cellAspect = w / h;

  let sx = 0, sy = 0, sw = img.naturalWidth, sh = img.naturalHeight;

  if (imgAspect > cellAspect) {
    sw = img.naturalHeight * cellAspect;
    sx = (img.naturalWidth - sw) / 2;
  } else {
    sh = img.naturalWidth / cellAspect;
    sy = (img.naturalHeight - sh) / 2;
  }

  ctx.drawImage(img, sx, sy, sw, sh, x, y, w, h);
  ctx.restore();

  ctx.fillStyle = 'rgba(0,0,0,0.04)';
  ctx.fillRect(x, y, w, 4);
}

function drawPolaroidCell(ctx, img, x, y, w, h) {
  const border = 16;
  const shadowBlur = 12;

  ctx.save();

  ctx.shadowColor = 'rgba(0,0,0,0.12)';
  ctx.shadowBlur = shadowBlur;
  ctx.shadowOffsetX = 3;
  ctx.shadowOffsetY = 5;
  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath();
  ctx.roundRect(x - 4, y - 4, w + 8, h + 8 + border, 4);
  ctx.fill();
  ctx.restore();

  ctx.save();
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, 2);
  ctx.clip();

  const imgAspect = img.naturalWidth / img.naturalHeight || 1;
  const cellAspect = w / h;
  let sx = 0, sy = 0, sw = img.naturalWidth, sh = img.naturalHeight;

  if (imgAspect > cellAspect) {
    sw = img.naturalHeight * cellAspect;
    sx = (img.naturalWidth - sw) / 2;
  } else {
    sh = img.naturalWidth / cellAspect;
    sy = (img.naturalHeight - sh) / 2;
  }

  ctx.drawImage(img, sx, sy, sw, sh, x, y, w, h);
  ctx.restore();
}

function drawWatermark(ctx, w, h) {
  ctx.save();
  ctx.fillStyle = 'rgba(93, 68, 50, 0.06)';
  ctx.font = '700 14px Poppins, sans-serif';
  ctx.textAlign = 'right';
  ctx.textBaseline = 'bottom';
  ctx.fillText('COLORIS', w - 20, h - 14);
  ctx.restore();
}

// ============================================================
// PREVIEW RENDERING (for in-page preview)
// ============================================================

function renderPreview() {
  if (state.selectedImages.length < 2) {
    if (collagePreview) collagePreview.classList.add('hidden');
    return;
  }

  const layout = LAYOUTS[state.layoutType];
  const imageCount = Math.min(state.selectedImages.length, layout.cols * layout.rows);
  const images = state.selectedImages.slice(0, imageCount);
  const { canvasWidth, canvasHeight } = calcCanvasSize(layout, imageCount);
  const scale = Math.min(1, 800 / canvasWidth);

  if (!collageCanvas) return;
  collageCanvas.width = canvasWidth;
  collageCanvas.height = canvasHeight;
  collageCanvas.style.width = (canvasWidth * scale) + 'px';
  collageCanvas.style.height = (canvasHeight * scale) + 'px';

  const ctx = collageCanvas.getContext('2d');
  ensureRoundRect(ctx);
  drawBackground(ctx, canvasWidth, canvasHeight);

  preloadImages(images).then(loadedImages => {
    const isPolaroid = state.layoutType === 'polaroid';
    const gap = layout.gap * 2;
    const pad = layout.padding * 2;
    const usableW = canvasWidth - pad * 2;
    const usableH = canvasHeight - pad * 2;
    const cellW = Math.max(1, (usableW - gap * (layout.cols - 1)) / layout.cols);
    const cellH = Math.max(1, (usableH - gap * (layout.rows - 1)) / layout.rows);

    loadedImages.forEach((img, i) => {
      const col = i % layout.cols;
      const row = Math.floor(i / layout.cols);
      const x = pad + col * (cellW + gap);
      const y = pad + row * (cellH + gap);

      if (isPolaroid) {
        drawPolaroidCell(ctx, img, x, y, cellW, cellH);
      } else {
        drawImageCell(ctx, img, x, y, cellW, cellH);
      }
    });

    if (collagePreview) collagePreview.classList.remove('hidden');
  }).catch(() => {
    if (collagePreview) collagePreview.classList.add('hidden');
  });
}

// ============================================================
// EVENT DISPATCH
// ============================================================

function dispatchUpdate() {
  document.dispatchEvent(new CustomEvent('collage:update', {
    detail: { count: state.selectedImages.length, max: state.maxImages },
    bubbles: true,
  }));
}

export async function exportCollageHTML() {
  if (typeof html2canvas === 'undefined') {
    dispatchToast('html2canvas not loaded, using standard export', 'warning');
    return exportCollage();
  }
  if (state.selectedImages.length === 0 || state.isExporting) return;
  state.isExporting = true;
  exportBtn?.classList.add('is-loading');

  const layout = LAYOUTS[state.layoutType];
  const imageCount = Math.min(state.selectedImages.length, layout.cols * layout.rows);
  const images = state.selectedImages.slice(0, imageCount);

  const wrap = document.createElement('div');
  wrap.style.cssText = `display:grid;grid-template-columns:repeat(${layout.cols},1fr);gap:${layout.gap}px;padding:${layout.padding}px;background:#F9F7F5;max-width:${layout.cols * 400}px;`;

  for (const img of images) {
    const div = document.createElement('div');
    div.style.cssText = `aspect-ratio:${layout.cellW}/${layout.cellH};overflow:hidden;border-radius:6px;background:#F1EDE8;background-image:url(${img.thumbUrl || img.url});background-size:cover;background-position:center;`;
    wrap.appendChild(div);
  }

  document.body.appendChild(wrap);
  try {
    const canvas = await html2canvas(wrap, { useCORS: true, backgroundColor: '#F9F7F5', scale: 2 });
    document.body.removeChild(wrap);
    canvas.toBlob((blob) => {
      if (blob) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `coloris-collage-html-${Date.now()}.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(() => URL.revokeObjectURL(url), 2000);
      }
    }, 'image/png', 0.95);
  } catch (err) {
    document.body.removeChild(wrap);
    dispatchExportError(err.message);
  } finally {
    state.isExporting = false;
    exportBtn?.classList.remove('is-loading');
  }
}

function dispatchExportStart() {
  document.dispatchEvent(new CustomEvent('collage:export:start', {
    bubbles: true,
  }));
}

function dispatchExportComplete(blob) {
  document.dispatchEvent(new CustomEvent('collage:export:complete', {
    detail: { blob },
    bubbles: true,
  }));
}

function dispatchExportError(error) {
  document.dispatchEvent(new CustomEvent('collage:export:error', {
    detail: { error },
    bubbles: true,
  }));
}

function dispatchToast(message, type = 'info') {
  document.dispatchEvent(new CustomEvent('toast:show', {
    detail: { message, type },
    bubbles: true,
  }));
}
