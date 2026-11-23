import './styles.css';
import { Pixelit, PALETTES } from 'image-to-pixel-art/browser';
import { readControlsFromForm, listPalettes } from './controls.ts';
import { createSampleDataUrl } from './sample.ts';
import {
  DEFAULT_BLOCK_SIZE,
  MAX_BLOCK_SIZE,
  MAX_FILE_BYTES,
  MAX_IMAGE_EDGE,
  MIN_BLOCK_SIZE,
  validateImageFile,
  validateNaturalSize,
} from './limits.ts';

type StatusKind = 'info' | 'error' | 'success';

const els = {
  form: document.querySelector<HTMLFormElement>('#controls')!,
  drop: document.querySelector<HTMLElement>('#dropzone')!,
  file: document.querySelector<HTMLInputElement>('#file')!,
  blockSize: document.querySelector<HTMLInputElement>('#blockSize')!,
  blockOut: document.querySelector<HTMLOutputElement>('#blockOut')!,
  palette: document.querySelector<HTMLSelectElement>('#palette')!,
  usePalette: document.querySelector<HTMLInputElement>('#usePalette')!,
  grayscale: document.querySelector<HTMLInputElement>('#grayscale')!,
  maxWidth: document.querySelector<HTMLInputElement>('#maxWidth')!,
  maxHeight: document.querySelector<HTMLInputElement>('#maxHeight')!,
  previewOriginal: document.querySelector<HTMLImageElement>('#previewOriginal')!,
  previewResult: document.querySelector<HTMLCanvasElement>('#previewResult')!,
  workImg: document.querySelector<HTMLImageElement>('#workImg')!,
  sampleCanvas: document.querySelector<HTMLCanvasElement>('#sampleCanvas')!,
  status: document.querySelector<HTMLElement>('#status')!,
  meta: document.querySelector<HTMLElement>('#meta')!,
  btnSample: document.querySelector<HTMLButtonElement>('#btnSample')!,
  btnReset: document.querySelector<HTMLButtonElement>('#btnReset')!,
  btnDownload: document.querySelector<HTMLButtonElement>('#btnDownload')!,
  btnProcess: document.querySelector<HTMLButtonElement>('#btnProcess')!,
};

let objectUrl: string | null = null;
let hasSource = false;
let lastPixelit: Pixelit | null = null;

function setStatus(message: string, kind: StatusKind = 'info') {
  els.status.textContent = message;
  els.status.dataset.kind = kind;
  els.status.hidden = !message;
}

function clearObjectUrl() {
  if (objectUrl) {
    URL.revokeObjectURL(objectUrl);
    objectUrl = null;
  }
}

function setBusy(busy: boolean) {
  els.btnProcess.disabled = busy || !hasSource;
  els.btnDownload.disabled = busy || !lastPixelit;
  els.btnSample.disabled = busy;
  els.btnReset.disabled = busy;
  els.file.disabled = busy;
}

function populatePalettes() {
  els.palette.replaceChildren();
  for (const p of listPalettes()) {
    const opt = document.createElement('option');
    opt.value = p.name;
    opt.textContent = `${p.name} (${p.colors.length})`;
    if (p.name === 'Pixelit Default') opt.selected = true;
    els.palette.append(opt);
  }
}

function syncBlockOut() {
  els.blockOut.value = String(els.blockSize.value);
}

function resetPreview() {
  hasSource = false;
  lastPixelit = null;
  clearObjectUrl();
  els.previewOriginal.removeAttribute('src');
  els.previewOriginal.alt = 'Original image preview';
  els.workImg.removeAttribute('src');
  const ctx = els.previewResult.getContext('2d');
  if (ctx) {
    ctx.clearRect(0, 0, els.previewResult.width, els.previewResult.height);
  }
  els.previewResult.width = 1;
  els.previewResult.height = 1;
  els.meta.textContent = 'No image loaded.';
  els.btnProcess.disabled = true;
  els.btnDownload.disabled = true;
  setStatus('');
}

function loadFromUrl(url: string, label: string) {
  setBusy(true);
  setStatus('Loading image…');
  const img = els.workImg;
  const onLoad = () => {
    img.removeEventListener('load', onLoad);
    img.removeEventListener('error', onError);
    const sizeCheck = validateNaturalSize(img.naturalWidth, img.naturalHeight);
    if (!sizeCheck.ok) {
      setBusy(false);
      resetPreview();
      setStatus(sizeCheck.error, 'error');
      return;
    }
    hasSource = true;
    els.previewOriginal.src = url;
    els.previewOriginal.alt = `Original: ${label}`;
    els.meta.textContent =
      `${label} · ${img.naturalWidth}×${img.naturalHeight} px · processing stays in your browser`;
    els.btnProcess.disabled = false;
    setBusy(false);
    setStatus('Image ready. Adjust settings and convert.', 'success');
    void processImage();
  };
  const onError = () => {
    img.removeEventListener('load', onLoad);
    img.removeEventListener('error', onError);
    setBusy(false);
    resetPreview();
    setStatus('Could not decode that image.', 'error');
  };
  img.addEventListener('load', onLoad);
  img.addEventListener('error', onError);
  img.src = url;
}

function loadFile(file: File) {
  const check = validateImageFile(file);
  if (!check.ok) {
    setStatus(check.error, 'error');
    return;
  }
  clearObjectUrl();
  objectUrl = URL.createObjectURL(file);
  loadFromUrl(objectUrl, file.name || 'upload');
}

function loadSample() {
  clearObjectUrl();
  const dataUrl = createSampleDataUrl(els.sampleCanvas, { width: 480, height: 320 });
  loadFromUrl(dataUrl, 'sample scene');
}

function processImage() {
  if (!hasSource) {
    setStatus('Load an image or sample first.', 'error');
    return;
  }
  const controls = readControlsFromForm(els.form);
  try {
    setBusy(true);
    const px = new Pixelit({
      to: els.previewResult,
      from: els.workImg,
      scale: controls.blockSize,
      palette: controls.palette.length ? controls.palette : PALETTES[0]?.colors,
      maxWidth: controls.maxWidth,
      maxHeight: controls.maxHeight,
    });
    px.draw().pixelate();
    if (controls.grayscale) px.convertGrayscale();
    if (controls.usePalette) px.convertPalette();
    if (controls.maxWidth || controls.maxHeight) px.resizeImage();
    lastPixelit = px;
    els.btnDownload.disabled = false;
    setStatus(
      `Converted · block ${controls.blockSize}` +
        (controls.usePalette ? ` · ${controls.paletteName}` : '') +
        (controls.grayscale ? ' · grayscale' : ''),
      'success',
    );
  } catch (err) {
    lastPixelit = null;
    els.btnDownload.disabled = true;
    const msg = err instanceof Error ? err.message : 'Conversion failed.';
    setStatus(msg, 'error');
  } finally {
    setBusy(false);
  }
}

function downloadPng() {
  if (!lastPixelit) {
    setStatus('Convert an image before downloading.', 'error');
    return;
  }
  lastPixelit.saveImage('image-to-pixel-art.png');
  setStatus('PNG download started.', 'success');
}

function onDrag(e: DragEvent) {
  e.preventDefault();
  e.stopPropagation();
  if (e.type === 'dragenter' || e.type === 'dragover') {
    els.drop.dataset.active = 'true';
  } else if (e.type === 'dragleave' || e.type === 'drop') {
    els.drop.dataset.active = 'false';
  }
  if (e.type === 'drop') {
    const file = e.dataTransfer?.files?.[0];
    if (file) loadFile(file);
  }
}

function wire() {
  populatePalettes();
  els.blockSize.min = String(MIN_BLOCK_SIZE);
  els.blockSize.max = String(MAX_BLOCK_SIZE);
  els.blockSize.value = String(DEFAULT_BLOCK_SIZE);
  syncBlockOut();
  els.maxWidth.placeholder = `optional ≤ ${MAX_IMAGE_EDGE}`;
  els.maxHeight.placeholder = `optional ≤ ${MAX_IMAGE_EDGE}`;

  els.blockSize.addEventListener('input', syncBlockOut);
  els.file.addEventListener('change', () => {
    const file = els.file.files?.[0];
    if (file) loadFile(file);
  });
  for (const type of ['dragenter', 'dragover', 'dragleave', 'drop'] as const) {
    els.drop.addEventListener(type, onDrag);
  }
  els.drop.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      els.file.click();
    }
  });
  els.form.addEventListener('submit', (e) => {
    e.preventDefault();
    processImage();
  });
  for (const el of [els.usePalette, els.grayscale, els.palette, els.maxWidth, els.maxHeight]) {
    el.addEventListener('change', () => {
      if (hasSource) processImage();
    });
  }
  els.blockSize.addEventListener('change', () => {
    if (hasSource) processImage();
  });
  els.btnSample.addEventListener('click', () => loadSample());
  els.btnReset.addEventListener('click', () => {
    els.form.reset();
    populatePalettes();
    els.blockSize.value = String(DEFAULT_BLOCK_SIZE);
    syncBlockOut();
    els.file.value = '';
    resetPreview();
    setStatus('Reset. Load an image or try the sample scene.');
  });
  els.btnDownload.addEventListener('click', () => downloadPng());

  resetPreview();
  setStatus(
    `Drop an image (max ${Math.floor(MAX_FILE_BYTES / (1024 * 1024))} MB) or load the sample. Nothing is uploaded.`,
  );
}

wire();
