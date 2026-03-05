#!/usr/bin/env bun

// Workaround for AI SDK timestamp parsing issue with certain providers
// Some providers (e.g., opencode) return invalid timestamps that cause
// RangeError: Invalid Date when AI SDK tries to call toISOString()
const originalToISOString = Date.prototype.toISOString;
Date.prototype.toISOString = function () {
  try {
    return originalToISOString.call(this);
  } catch {
    // Return current time as fallback for invalid dates
    return new Date().toISOString();
  }
};

import { defineCommand, renderUsage, runMain } from "citty";
import yoctoSpinner from "yocto-spinner";
import { extract } from "./extract";
import {
  doublePass,
  doublePassAutoMerge,
  parallel,
  parallelAutoMerge,
  sequential,
  sequentialAutoMerge,
  simple,
} from "./strategies";
import {
  setDefaultModel,
  setAlias,
  getAlias,
  deleteAlias,
  listAliases,
  resolveAlias,
  listParsers,
  getParser,
  setParser,
  deleteParser,
} from "./auth/config";
import {
  deleteProviderToken,
  listStoredProviders,
  maskToken,
  setProviderToken,
  type TokenStorageType,
} from "./auth/tokens";
import {
  listAllProviderModels,
  listProviderModels,
  resolveCheapestModel,
} from "./llm/models";
import {
  validateSerializedArtifacts,
  hydrateSerializedArtifacts,
} from "./artifacts/input";
import {
  loadArtifactsFromOptions,
  loadSchema,
  readStdinText,
  resolveDefaultModelSpec,
  resolveExplicitModelSpec,
  resolveModel,
  stdinConsumed,
} from "./cli/shared";
import { detectMimeType } from "./parsers/mime";
import { runParser } from "./parsers/runner";
import type { NpmParserDef, ParsersConfig } from "./parsers/types";
import type { ExtractionEvents, ExtractionStrategy } from "./types";
import { createDebugLogger } from "./debug/logger";
import type { SerializedArtifact } from "./artifacts/input";
import pkg from "../package.json";

const supportedProviders = [
  "openai",
  "anthropic",
  "google",
  "opencode",
  "openrouter",
];

const isBrokenPipe = (error: unknown) => {
  if (!error || typeof error !== "object") {
    return false;
  }
  const code = (error as { code?: string }).code;
  return code === "EPIPE" || code === "ERR_STREAM_WRITE_AFTER_END";
};

const writeOutput = async (target: string | undefined, data: string) => {
  if (!target || target === "-") {
    try {
      process.stdout.write(`${data}\n`);
    } catch (error) {
      if (isBrokenPipe(error)) {
        return;
      }
      throw error;
    }
    return;
  }
  await Bun.write(target, data);
};

const generateArtifactViewerHtml = (artifacts: SerializedArtifact[], version: string): string => {
  const artifactsJson = JSON.stringify(artifacts, null, 2);
  
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Artifact Viewer</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet">
  <script src="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4"></script>
  <style type="text/tailwindcss">
    @theme {
      --font-mono: 'JetBrains Mono', monospace;
    }
  </style>
  <style>
    body {
      font-family: 'JetBrains Mono', monospace;
    }
    .artifact-image {
      max-width: 100%;
      height: auto;
      border-radius: 0.5rem;
      box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1);
    }
    .page-card {
      background: #f9fafb;
      border-radius: 0.5rem;
      padding: 1rem;
      margin-bottom: 0.75rem;
    }
    .page-image {
      width: 100%;
      height: 100%;
      object-fit: cover;
      border-radius: 0.25rem;
      cursor: pointer;
      transition: transform 0.2s;
      background: #f3f4f6;
    }
    .page-image:hover {
      transform: scale(1.02);
    }
    .image-cell {
      position: relative;
      flex-shrink: 0;
      height: 120px;
      min-width: 80px;
      max-width: 200px;
    }
    .image-overlay-top {
      position: absolute;
      top: 0;
      left: 0;
      padding: 0.25rem;
      display: flex;
      justify-content: flex-start;
    }
    .image-overlay-bottom {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      background: linear-gradient(to top, rgba(0,0,0,0.5), transparent);
      padding: 0.5rem;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      border-radius: 0 0 0.25rem 0.25rem;
    }
    .screenshot-badge {
      font-size: 8px;
      padding: 1px 3px;
      border-radius: 2px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      background: #fef3c7;
      color: #92400e;
    }
    .chunk-boundary {
      border-top: 3px dashed #f59e0b;
      margin-top: 1rem;
      padding-top: 1rem;
    }
    .sidebar-item.active {
      background-color: #eff6ff;
      border-left-color: #3b82f6;
    }
    .batching-mode .default-view { display: none; }
    .batching-mode .batching-view { display: flex; }
    .default-view { display: block; }
    .batching-view { display: none; }
    .metadata-collapsible { max-height: 0; overflow: hidden; transition: max-height 0.3s ease-out; }
    .metadata-collapsible.open { max-height: 500px; }
    .text-truncated { max-height: 6em; overflow: hidden; }
    .text-expanded { max-height: none; }
    .loading-spinner {
      width: 40px;
      height: 40px;
      border: 3px solid #e5e7eb;
      border-top-color: #3b82f6;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
  </style>
</head>
<body class="bg-gray-50 text-gray-900 min-h-screen">
  <div id="app-container" class="min-h-screen">
    <header class="bg-white border-b border-gray-200 sticky top-0 z-10">
      <div class="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        <div>
          <h1 class="text-lg font-semibold text-gray-900">Artifact Viewer</h1>
          <p class="text-xs text-gray-500" id="header-stats"></p>
        </div>
        <div class="flex items-center gap-2">
          <button id="expand-all-text" class="px-2 py-1 text-xs font-medium text-gray-600 bg-gray-100 rounded hover:bg-gray-200 transition-colors">
            Expand All
          </button>
          <button id="collapse-all-text" class="px-2 py-1 text-xs font-medium text-gray-600 bg-gray-100 rounded hover:bg-gray-200 transition-colors">
            Collapse All
          </button>
          <span class="text-xs text-gray-400">v${version}</span>
          <button id="toggle-batching" class="px-3 py-1.5 text-xs font-medium text-gray-700 bg-gray-100 rounded hover:bg-gray-200 transition-colors">
            Enable Batching Mode
          </button>
        </div>
      </div>
    </header>
    
    <div id="loading" class="flex items-center justify-center p-12">
      <div class="loading-spinner"></div>
    </div>
    
    <div class="default-view max-w-7xl mx-auto p-6" id="default-content"></div>
    
    <div class="batching-view h-[calc(100vh-57px)]">
      <aside id="sidebar" class="w-72 bg-white border-r border-gray-200 flex flex-col overflow-hidden flex-shrink-0">
        <div class="p-4 border-b border-gray-200">
          <h2 class="text-sm font-semibold text-gray-900">Chunks & Batches</h2>
          <p class="text-xs text-gray-500 mt-1" id="artifact-count"></p>
        </div>
        <div id="sidebar-content" class="flex-1 overflow-y-auto"></div>
      </aside>
      
      <div class="flex-1 flex flex-col overflow-hidden">
        <div class="bg-white border-b border-gray-200 p-4">
          <div class="flex items-center gap-4 flex-wrap">
            <div class="flex items-center gap-2">
              <label class="text-xs font-medium text-gray-600">Max Tokens:</label>
              <input type="number" id="max-tokens" value="10000" min="100" max="100000" step="500" 
                class="w-24 px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500">
            </div>
            <div class="flex items-center gap-2">
              <label class="text-xs font-medium text-gray-600">Max Images:</label>
              <input type="number" id="max-images" value="" min="1" max="100" placeholder="none"
                class="w-20 px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500">
            </div>
            <div class="flex items-center gap-2">
              <label class="text-xs font-medium text-gray-600">Text Ratio:</label>
              <input type="number" id="text-ratio" value="4" min="1" max="10" step="0.5"
                class="w-16 px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500">
            </div>
            <div class="flex items-center gap-2">
              <label class="text-xs font-medium text-gray-600">Image Tokens:</label>
              <input type="number" id="image-tokens" value="1000" min="100" max="10000" step="100"
                class="w-20 px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500">
            </div>
          </div>
          <div class="flex items-center gap-4 mt-3 flex-wrap">
            <div class="flex items-center gap-2">
              <label class="text-xs font-medium text-gray-600">Image Types:</label>
              <label class="flex items-center gap-1 text-xs">
                <input type="checkbox" id="filter-embedded" checked class="rounded">
                <span>Embedded</span>
              </label>
              <label class="flex items-center gap-1 text-xs">
                <input type="checkbox" id="filter-screenshot" checked class="rounded">
                <span>Screenshot</span>
              </label>
            </div>
            <button id="apply-chunking" class="px-3 py-1 text-xs font-medium text-white bg-blue-600 rounded hover:bg-blue-700 transition-colors">
              Apply
            </button>
          </div>
          <div id="chunking-stats" class="mt-3 text-xs text-gray-600"></div>
        </div>
        
        <main id="batching-content" class="flex-1 overflow-y-auto p-6"></main>
      </div>
    </div>
  </div>
  
  <div id="image-modal" class="fixed inset-0 bg-black/80 z-50 hidden items-center justify-center p-4" onclick="this.classList.add('hidden'); this.classList.remove('flex');">
    <img id="modal-image" class="max-w-full max-h-full object-contain" src="" alt="">
  </div>
  
  <script>
    const artifacts = ${artifactsJson};
    const STRUKTUR_VERSION = '${version}';
    
    let batchingMode = false;
    let currentChunking = null;
    let activeChunkId = null;
    
    function getImageType(media) {
      if (media.imageType) return media.imageType;
      return 'embedded';
    }
    
    function filterMedia(media, options = {}) {
      const { imageTypes = ['embedded', 'screenshot'] } = options;
      if (!media || media.length === 0) return [];
      return media.filter(m => imageTypes.includes(getImageType(m)));
    }
    
    function estimateTextTokens(text, textTokenRatio = 4) {
      return Math.ceil(text.length / textTokenRatio);
    }
    
    function estimateImageTokens(defaultImageTokens = 1000) {
      return defaultImageTokens;
    }
    
    function countContentTokens(content, options = {}) {
      const { textTokenRatio = 4, defaultImageTokens = 1000, imageTypes } = options;
      let tokens = 0;
      if (content.text) {
        tokens += estimateTextTokens(content.text, textTokenRatio);
      }
      const filteredMedia = filterMedia(content.media, { imageTypes });
      for (const media of filteredMedia) {
        tokens += estimateImageTokens(defaultImageTokens);
        if (media.text) {
          tokens += estimateTextTokens(media.text, textTokenRatio);
        }
      }
      return tokens;
    }
    
    function countArtifactTokens(artifact, options = {}) {
      if (typeof artifact.tokens === 'number' && !options.imageTypes) return artifact.tokens;
      return artifact.contents.reduce((total, content) => total + countContentTokens(content, options), 0);
    }
    
    function countArtifactImages(artifact, options = {}) {
      const { imageTypes } = options;
      return artifact.contents.reduce((count, content) => {
        return count + filterMedia(content.media, { imageTypes }).length;
      }, 0);
    }
    
    function filterContent(content, options = {}) {
      const { imageTypes } = options;
      return {
        ...content,
        media: filterMedia(content.media, { imageTypes })
      };
    }
    
    function splitTextIntoChunks(content, maxTokens, options = {}) {
      if (!content.text) return [content];
      const { textTokenRatio = 4, imageTypes } = options;
      const filteredContent = filterContent(content, { imageTypes });
      const totalTokens = estimateTextTokens(content.text, textTokenRatio);
      if (totalTokens <= maxTokens) return [filteredContent];
      
      const chunkSize = Math.max(1, maxTokens * textTokenRatio);
      const chunks = [];
      
      for (let offset = 0; offset < content.text.length; offset += chunkSize) {
        const text = content.text.slice(offset, offset + chunkSize);
        chunks.push({
          page: content.page,
          text,
          media: offset === 0 ? filteredContent.media : undefined,
        });
      }
      return chunks;
    }
    
    function splitArtifact(artifact, options = {}) {
      const { maxTokens, maxImages, textTokenRatio, defaultImageTokens, imageTypes } = options;
      const splitContents = [];
      
      for (const content of artifact.contents) {
        splitContents.push(...splitTextIntoChunks(content, maxTokens, { textTokenRatio, imageTypes }));
      }
      
      const chunks = [];
      let currentContents = [];
      let currentTokens = 0;
      let currentImages = 0;
      
      for (const content of splitContents) {
        const contentTokens = countContentTokens(content, { textTokenRatio, defaultImageTokens, imageTypes });
        const contentImages = content.media?.length ?? 0;
        
        const exceedsTokens = currentContents.length > 0 && currentTokens + contentTokens > maxTokens;
        const exceedsImages = maxImages !== undefined && currentContents.length > 0 && currentImages + contentImages > maxImages;
        
        if (exceedsTokens || exceedsImages) {
          chunks.push({
            ...artifact,
            id: \`\${artifact.id}:part:\${chunks.length + 1}\`,
            contents: currentContents,
            tokens: currentTokens,
          });
          currentContents = [];
          currentTokens = 0;
          currentImages = 0;
        }
        
        currentContents.push(content);
        currentTokens += contentTokens;
        currentImages += contentImages;
      }
      
      if (currentContents.length > 0) {
        chunks.push({
          ...artifact,
          id: \`\${artifact.id}:part:\${chunks.length + 1}\`,
          contents: currentContents,
          tokens: currentTokens,
        });
      }
      
      if (chunks.length === 0) {
        chunks.push({
          ...artifact,
          id: \`\${artifact.id}:part:1\`,
          tokens: countArtifactTokens(artifact, { textTokenRatio, defaultImageTokens, imageTypes }),
        });
      }
      
      return chunks;
    }
    
    function batchArtifacts(artifacts, options = {}) {
      const { maxTokens, maxImages, textTokenRatio, defaultImageTokens, imageTypes } = options;
      const batches = [];
      let currentBatch = [];
      let currentTokens = 0;
      let currentImages = 0;
      
      for (const artifact of artifacts) {
        const splits = splitArtifact(artifact, { maxTokens, maxImages, textTokenRatio, defaultImageTokens, imageTypes });
        
        for (const split of splits) {
          const splitTokens = countArtifactTokens(split, { textTokenRatio, defaultImageTokens, imageTypes });
          const splitImages = countArtifactImages(split, { imageTypes });
          
          const exceedsTokens = currentBatch.length > 0 && currentTokens + splitTokens > maxTokens;
          const exceedsImages = maxImages !== undefined && currentBatch.length > 0 && currentImages + splitImages > maxImages;
          
          if (exceedsTokens || exceedsImages) {
            batches.push({ artifacts: currentBatch, tokens: currentTokens, images: currentImages });
            currentBatch = [];
            currentTokens = 0;
            currentImages = 0;
          }
          
          currentBatch.push(split);
          currentTokens += splitTokens;
          currentImages += splitImages;
        }
      }
      
      if (currentBatch.length > 0) {
        batches.push({ artifacts: currentBatch, tokens: currentTokens, images: currentImages });
      }
      
      return batches;
    }
    
    function getChunkingOptions() {
      const maxTokens = parseInt(document.getElementById('max-tokens').value) || 10000;
      const maxImages = document.getElementById('max-images').value ? parseInt(document.getElementById('max-images').value) : undefined;
      const textTokenRatio = parseFloat(document.getElementById('text-ratio').value) || 4;
      const defaultImageTokens = parseInt(document.getElementById('image-tokens').value) || 1000;
      const imageTypes = [];
      if (document.getElementById('filter-embedded').checked) imageTypes.push('embedded');
      if (document.getElementById('filter-screenshot').checked) imageTypes.push('screenshot');
      
      return { maxTokens, maxImages, textTokenRatio, defaultImageTokens, imageTypes };
    }
    
    function computeChunking() {
      const options = getChunkingOptions();
      
      const allSplits = [];
      for (const artifact of artifacts) {
        const splits = splitArtifact(artifact, options);
        allSplits.push(...splits.map(s => ({ ...s, originalArtifactId: artifact.id })));
      }
      
      const batches = batchArtifacts(artifacts, options);
      
      return { splits: allSplits, batches, options };
    }
    
    function showImageModal(src) {
      const modal = document.getElementById('image-modal');
      const img = document.getElementById('modal-image');
      img.src = src;
      modal.classList.remove('hidden');
      modal.classList.add('flex');
    }
    
    function renderDefaultView() {
      const container = document.getElementById('default-content');
      container.innerHTML = '';
      
      let totalImages = 0;
      let totalPages = 0;
      
      artifacts.forEach((artifact, idx) => {
        const artifactDiv = document.createElement('div');
        artifactDiv.className = 'mb-8 bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden';
        
        const header = document.createElement('div');
        header.className = 'px-6 py-4 border-b border-gray-200 bg-gray-50';
        const artifactImages = artifact.contents.reduce((sum, c) => sum + (c.media?.length || 0), 0);
        const artifactPages = artifact.contents.length;
        totalImages += artifactImages;
        totalPages += artifactPages;
        
        header.innerHTML = \`
          <div class="flex items-center justify-between">
            <div>
              <h2 class="text-lg font-semibold text-gray-900">\${artifact.id}</h2>
              <p class="text-sm text-gray-500 mt-1">\${artifactPages} page\${artifactPages !== 1 ? 's' : ''} · \${artifactImages} image\${artifactImages !== 1 ? 's' : ''}</p>
            </div>
            <span class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-50 text-blue-700">
              \${artifact.type}
            </span>
          </div>
        \`;
        artifactDiv.appendChild(header);
        
        const content = document.createElement('div');
        content.className = 'p-6';
        
        if (artifact.metadata) {
          const metadata = document.createElement('div');
          metadata.className = 'mb-6 p-4 bg-gray-50 rounded-lg';
          
          const metadataHeader = document.createElement('div');
          metadataHeader.className = 'flex items-center justify-between cursor-pointer';
          metadataHeader.innerHTML = \`
            <h3 class="text-sm font-semibold text-gray-700">Metadata</h3>
            <span class="text-xs text-gray-400">Click to expand</span>
          \`;
          
          const metadataContent = document.createElement('div');
          metadataContent.className = 'metadata-collapsible';
          metadataContent.innerHTML = \`<pre class="text-xs text-gray-600 overflow-x-auto mt-2">\${JSON.stringify(artifact.metadata, null, 2)}</pre>\`;
          
          metadataHeader.addEventListener('click', () => {
            metadataContent.classList.toggle('open');
            const label = metadataHeader.querySelector('span');
            if (label) label.textContent = metadataContent.classList.contains('open') ? 'Click to collapse' : 'Click to expand';
          });
          
          metadata.appendChild(metadataHeader);
          metadata.appendChild(metadataContent);
          content.appendChild(metadata);
        }
        
        if (artifact.contents && artifact.contents.length > 0) {
          const contentsDiv = document.createElement('div');
          contentsDiv.className = 'space-y-2';
          
          artifact.contents.forEach((item) => {
            const itemDiv = document.createElement('div');
            itemDiv.className = 'page-card';
            
            if (item.page !== undefined) {
              const pageLabel = document.createElement('div');
              pageLabel.className = 'text-xs font-semibold text-gray-500 mb-2';
              pageLabel.textContent = \`Page \${item.page}\`;
              itemDiv.appendChild(pageLabel);
            }
            
            if (item.text) {
              const textContainer = document.createElement('div');
              textContainer.className = 'mb-3';
              
              const textDiv = document.createElement('div');
              textDiv.className = 'text-sm text-gray-700 whitespace-pre-wrap text-truncated';
              textDiv.dataset.fullText = item.text;
              
              if (item.text.length > 500) {
                textDiv.textContent = item.text.slice(0, 500) + '...';
                
                const toggleBtn = document.createElement('button');
                toggleBtn.className = 'text-xs text-blue-600 hover:text-blue-800 mt-1';
                toggleBtn.textContent = 'Show more';
                toggleBtn.addEventListener('click', () => {
                  const isExpanded = textDiv.classList.contains('text-expanded');
                  if (isExpanded) {
                    textDiv.textContent = item.text.slice(0, 500) + '...';
                    textDiv.classList.remove('text-expanded');
                    toggleBtn.textContent = 'Show more';
                  } else {
                    textDiv.textContent = item.text;
                    textDiv.classList.add('text-expanded');
                    toggleBtn.textContent = 'Show less';
                  }
                });
                textContainer.appendChild(textDiv);
                textContainer.appendChild(toggleBtn);
              } else {
                textDiv.textContent = item.text;
                textContainer.appendChild(textDiv);
              }
              
              itemDiv.appendChild(textContainer);
            }
            
            if (item.media && item.media.length > 0) {
              const mediaLabel = document.createElement('div');
              mediaLabel.className = 'text-xs font-semibold text-gray-500 mb-2';
              mediaLabel.textContent = \`Media (\${item.media.length})\`;
              itemDiv.appendChild(mediaLabel);
              
              const mediaDiv = document.createElement('div');
              mediaDiv.className = 'flex flex-wrap gap-2';
              
              const sortedMedia = [...item.media].sort((a, b) => {
                const aType = getImageType(a);
                const bType = getImageType(b);
                if (aType === 'screenshot' && bType !== 'screenshot') return -1;
                if (aType !== 'screenshot' && bType === 'screenshot') return 1;
                return 0;
              });
              
              sortedMedia.forEach((media, j) => {
                const imgCell = document.createElement('div');
                imgCell.className = 'image-cell';
                
                if (media.width && media.height) {
                  const aspectRatio = media.width / media.height;
                  const cellWidth = Math.max(80, Math.min(200, 120 * aspectRatio));
                  imgCell.style.width = \`\${cellWidth}px\`;
                }
                
                if (media.base64) {
                  const img = document.createElement('img');
                  img.className = 'page-image';
                  img.src = \`data:image/png;base64,\${media.base64}\`;
                  img.alt = \`Image \${j + 1}\`;
                  img.onclick = () => showImageModal(img.src);
                  imgCell.appendChild(img);
                } else if (media.url) {
                  const img = document.createElement('img');
                  img.className = 'page-image';
                  img.src = media.url;
                  img.alt = \`Image \${j + 1}\`;
                  img.onclick = () => showImageModal(img.src);
                  imgCell.appendChild(img);
                }
                
                const imgType = getImageType(media);
                
                if (imgType === 'screenshot') {
                  const topOverlay = document.createElement('div');
                  topOverlay.className = 'image-overlay-top';
                  
                  const screenshotBadge = document.createElement('span');
                  screenshotBadge.className = 'screenshot-badge';
                  screenshotBadge.textContent = 'screenshot';
                  topOverlay.appendChild(screenshotBadge);
                  
                  imgCell.appendChild(topOverlay);
                }
                
                const bottomOverlay = document.createElement('div');
                bottomOverlay.className = 'image-overlay-bottom';
                
                if (media.width || media.height) {
                  const dims = document.createElement('span');
                  const w = media.width ? Math.round(media.width) : '?';
                  const h = media.height ? Math.round(media.height) : '?';
                  dims.className = 'text-xs text-white';
                  dims.textContent = \`\${w}×\${h}\`;
                  bottomOverlay.appendChild(dims);
                }
                
                imgCell.appendChild(bottomOverlay);
                mediaDiv.appendChild(imgCell);
              });
              
              itemDiv.appendChild(mediaDiv);
            }
            
            contentsDiv.appendChild(itemDiv);
          });
          
          content.appendChild(contentsDiv);
        }
        
        artifactDiv.appendChild(content);
        container.appendChild(artifactDiv);
      });
      
      document.getElementById('header-stats').textContent = \`\${artifacts.length} artifact\${artifacts.length !== 1 ? 's' : ''} · \${totalPages} page\${totalPages !== 1 ? 's' : ''} · \${totalImages} image\${totalImages !== 1 ? 's' : ''}\`;
    }
    
    function renderSidebar(chunking) {
      const sidebar = document.getElementById('sidebar-content');
      sidebar.innerHTML = '';
      
      document.getElementById('artifact-count').textContent = \`\${artifacts.length} artifact\${artifacts.length !== 1 ? 's' : ''} · \${chunking.splits.length} chunks · \${chunking.batches.length} batches\`;
      
      const batchGroups = document.createElement('div');
      batchGroups.className = 'p-2';
      
      chunking.batches.forEach((batch, batchIdx) => {
        const batchDiv = document.createElement('div');
        batchDiv.className = 'mb-2';
        
        const batchHeader = document.createElement('div');
        batchHeader.className = 'px-2 py-1 text-xs font-semibold text-gray-500 bg-gray-100 rounded flex items-center justify-between';
        batchHeader.innerHTML = \`
          <span>Batch \${batchIdx + 1}</span>
          <span class="text-gray-400">\${batch.tokens.toLocaleString()} tok</span>
        \`;
        batchDiv.appendChild(batchHeader);
        
        const chunksList = document.createElement('div');
        chunksList.className = 'mt-1 space-y-0.5';
        
        batch.artifacts.forEach((chunk) => {
          const chunkItem = document.createElement('div');
          chunkItem.className = 'sidebar-item px-2 py-1.5 text-xs cursor-pointer border-l-2 border-transparent hover:bg-gray-50 transition-colors';
          chunkItem.dataset.chunkId = chunk.id;
          
          const chunkTokens = chunk.tokens ?? countArtifactTokens(chunk, chunking.options);
          const chunkImages = countArtifactImages(chunk, chunking.options);
          
          chunkItem.innerHTML = \`
            <div class="font-medium text-gray-700 truncate">\${chunk.id}</div>
            <div class="text-gray-400 flex items-center gap-2">
              <span>\${chunkTokens.toLocaleString()} tok</span>
              \${chunkImages > 0 ? \`<span>· \${chunkImages} img</span>\` : ''}
            </div>
          \`;
          
          chunkItem.addEventListener('click', () => {
            document.querySelectorAll('.sidebar-item').forEach(el => el.classList.remove('active'));
            chunkItem.classList.add('active');
            activeChunkId = chunk.id;
            scrollToChunk(chunk.id);
          });
          
          chunksList.appendChild(chunkItem);
        });
        
        batchDiv.appendChild(chunksList);
        batchGroups.appendChild(batchDiv);
      });
      
      sidebar.appendChild(batchGroups);
    }
    
    function scrollToChunk(chunkId) {
      const element = document.querySelector(\`[data-chunk-id="\${chunkId}"]\`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        element.classList.add('ring-2', 'ring-blue-500', 'ring-offset-2');
        setTimeout(() => {
          element.classList.remove('ring-2', 'ring-blue-500', 'ring-offset-2');
        }, 2000);
      }
    }
    
    function renderBatchingContent(chunking) {
      const app = document.getElementById('batching-content');
      app.innerHTML = '';
      
      const stats = document.getElementById('chunking-stats');
      const totalTokens = chunking.splits.reduce((sum, s) => sum + (s.tokens ?? countArtifactTokens(s, chunking.options)), 0);
      const totalImages = chunking.splits.reduce((sum, s) => sum + countArtifactImages(s, chunking.options), 0);
      const imgFilter = chunking.options.imageTypes.length === 0 ? 'no images' : 
                        chunking.options.imageTypes.length < 2 ? \`only \${chunking.options.imageTypes.join(', ')}\` : 'all images';
      stats.innerHTML = \`
        <span class="font-medium">Total:</span> \${totalTokens.toLocaleString()} tokens, 
        \${totalImages} images (\${imgFilter})
        \${chunking.options.maxImages ? \`· Max \${chunking.options.maxImages} images/batch\` : ''}
      \`;
      
      const artifactGroups = {};
      for (const split of chunking.splits) {
        const origId = split.originalArtifactId;
        if (!artifactGroups[origId]) artifactGroups[origId] = [];
        artifactGroups[origId].push(split);
      }
      
      for (const [origId, splits] of Object.entries(artifactGroups)) {
        const artifact = artifacts.find(a => a.id === origId);
        if (!artifact) continue;
        
        const container = document.createElement('div');
        container.className = 'mb-8 bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden';
        
        const header = document.createElement('div');
        header.className = 'px-4 py-3 border-b border-gray-200 bg-gray-50';
        header.innerHTML = \`
          <div class="flex items-center justify-between">
            <div>
              <h2 class="text-sm font-semibold text-gray-900">\${artifact.id}</h2>
              <p class="text-xs text-gray-500 mt-0.5">\${splits.length} chunk\${splits.length !== 1 ? 's' : ''}</p>
            </div>
            <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-700">
              \${artifact.type}
            </span>
          </div>
        \`;
        container.appendChild(header);
        
        const content = document.createElement('div');
        content.className = 'p-4';
        
        splits.forEach((chunk, chunkIdx) => {
          const chunkDiv = document.createElement('div');
          chunkDiv.className = chunkIdx > 0 ? 'chunk-boundary' : '';
          chunkDiv.dataset.chunkId = chunk.id;
          
          const chunkHeader = document.createElement('div');
          chunkHeader.className = 'flex items-center justify-between mb-3';
          const chunkTokens = chunk.tokens ?? countArtifactTokens(chunk, chunking.options);
          const chunkImages = countArtifactImages(chunk, chunking.options);
          chunkHeader.innerHTML = \`
            <span class="text-xs font-semibold text-amber-600">\${chunk.id}</span>
            <span class="text-xs text-gray-400">\${chunkTokens.toLocaleString()} tokens\${chunkImages > 0 ? \`, \${chunkImages} images\` : ''}</span>
          \`;
          chunkDiv.appendChild(chunkHeader);
          
          if (chunk.contents && chunk.contents.length > 0) {
            const contentsDiv = document.createElement('div');
            contentsDiv.className = 'space-y-4';
            
            chunk.contents.forEach((item) => {
              const itemDiv = document.createElement('div');
              itemDiv.className = 'border-l-2 border-gray-200 pl-3';
              
              if (item.page !== undefined) {
                const pageLabel = document.createElement('div');
                pageLabel.className = 'text-xs font-medium text-gray-400 mb-1';
                pageLabel.textContent = \`Page \${item.page}\`;
                itemDiv.appendChild(pageLabel);
              }
              
              if (item.text) {
                const textDiv = document.createElement('div');
                textDiv.className = 'text-xs text-gray-600 whitespace-pre-wrap';
                textDiv.textContent = item.text.length > 500 ? item.text.slice(0, 500) + '...' : item.text;
                itemDiv.appendChild(textDiv);
              }
              
              if (item.media && item.media.length > 0) {
                const mediaLabel = document.createElement('div');
                mediaLabel.className = 'text-xs font-semibold text-gray-500 mb-1';
                mediaLabel.textContent = \`Media (\${item.media.length})\`;
                itemDiv.appendChild(mediaLabel);
                
                const mediaDiv = document.createElement('div');
                mediaDiv.className = 'flex flex-wrap gap-2';
                
                const sortedMedia = [...item.media].sort((a, b) => {
                  const aType = getImageType(a);
                  const bType = getImageType(b);
                  if (aType === 'screenshot' && bType !== 'screenshot') return -1;
                  if (aType !== 'screenshot' && bType === 'screenshot') return 1;
                  return 0;
                });
                
                sortedMedia.forEach((media, mi) => {
                  const imgCell = document.createElement('div');
                  imgCell.className = 'image-cell';
                  imgCell.style.cssText = 'height: 80px; min-width: 60px; max-width: 160px;';
                  
                  if (media.width && media.height) {
                    const aspectRatio = media.width / media.height;
                    const cellWidth = Math.max(60, Math.min(160, 80 * aspectRatio));
                    imgCell.style.width = \`\${cellWidth}px\`;
                  }
                  
                  if (media.base64) {
                    const img = document.createElement('img');
                    img.className = 'page-image';
                    img.src = \`data:image/png;base64,\${media.base64}\`;
                    img.alt = \`Image \${mi + 1}\`;
                    img.onclick = () => showImageModal(img.src);
                    imgCell.appendChild(img);
                  } else if (media.url) {
                    const img = document.createElement('img');
                    img.className = 'page-image';
                    img.src = media.url;
                    img.alt = \`Image \${mi + 1}\`;
                    img.onclick = () => showImageModal(img.src);
                    imgCell.appendChild(img);
                  }
                  
                  const imgType = getImageType(media);
                  
                  if (imgType === 'screenshot') {
                    const topOverlay = document.createElement('div');
                    topOverlay.className = 'image-overlay-top';
                    
                    const screenshotBadge = document.createElement('span');
                    screenshotBadge.className = 'screenshot-badge';
                    screenshotBadge.textContent = 'screenshot';
                    topOverlay.appendChild(screenshotBadge);
                    
                    imgCell.appendChild(topOverlay);
                  }
                  
                  const bottomOverlay = document.createElement('div');
                  bottomOverlay.className = 'image-overlay-bottom';
                  bottomOverlay.style.cssText = 'padding: 0.25rem;';
                  
                  if (media.width || media.height) {
                    const dims = document.createElement('span');
                    const w = media.width ? Math.round(media.width) : '?';
                    const h = media.height ? Math.round(media.height) : '?';
                    dims.className = 'text-xs text-white';
                    dims.textContent = \`\${w}×\${h}\`;
                    bottomOverlay.appendChild(dims);
                  }
                  
                  imgCell.appendChild(bottomOverlay);
                  mediaDiv.appendChild(imgCell);
                });
                
                itemDiv.appendChild(mediaDiv);
              }
              
              contentsDiv.appendChild(itemDiv);
            });
            
            chunkDiv.appendChild(contentsDiv);
          }
          
          content.appendChild(chunkDiv);
        });
        
        container.appendChild(content);
        app.appendChild(container);
      }
    }
    
    function toggleBatchingMode() {
      batchingMode = !batchingMode;
      const container = document.getElementById('app-container');
      const btn = document.getElementById('toggle-batching');
      
      if (batchingMode) {
        container.classList.add('batching-mode');
        btn.textContent = 'Disable Batching Mode';
        btn.classList.remove('bg-gray-100', 'text-gray-700', 'hover:bg-gray-200');
        btn.classList.add('bg-amber-100', 'text-amber-700', 'hover:bg-amber-200');
        currentChunking = computeChunking();
        renderSidebar(currentChunking);
        renderBatchingContent(currentChunking);
      } else {
        container.classList.remove('batching-mode');
        btn.textContent = 'Enable Batching Mode';
        btn.classList.remove('bg-amber-100', 'text-amber-700', 'hover:bg-amber-200');
        btn.classList.add('bg-gray-100', 'text-gray-700', 'hover:bg-gray-200');
      }
    }
    
    function expandAllText() {
      document.querySelectorAll('.text-truncated').forEach(el => {
        const fullText = el.dataset.fullText;
        if (fullText && fullText.length > 500) {
          el.textContent = fullText;
          el.classList.add('text-expanded');
        }
      });
      document.querySelectorAll('.text-truncated + button').forEach(btn => {
        btn.textContent = 'Show less';
      });
    }
    
    function collapseAllText() {
      document.querySelectorAll('.text-truncated').forEach(el => {
        const fullText = el.dataset.fullText;
        if (fullText && fullText.length > 500) {
          el.textContent = fullText.slice(0, 500) + '...';
          el.classList.remove('text-expanded');
        }
      });
      document.querySelectorAll('.text-truncated + button').forEach(btn => {
        btn.textContent = 'Show more';
      });
    }
    
    function render() {
      document.getElementById('loading').style.display = 'none';
      renderDefaultView();
    }
    
    document.getElementById('toggle-batching').addEventListener('click', toggleBatchingMode);
    document.getElementById('expand-all-text').addEventListener('click', expandAllText);
    document.getElementById('collapse-all-text').addEventListener('click', collapseAllText);
    
    document.getElementById('apply-chunking').addEventListener('click', () => {
      if (batchingMode) {
        currentChunking = computeChunking();
        renderSidebar(currentChunking);
        renderBatchingContent(currentChunking);
      }
    });
    
    document.querySelectorAll('#max-tokens, #max-images, #text-ratio, #image-tokens').forEach(input => {
      input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && batchingMode) {
          currentChunking = computeChunking();
          renderSidebar(currentChunking);
          renderBatchingContent(currentChunking);
        }
      });
    });
    
    render();
  </script>
</body>
</html>`;
};

type StrategyOptions = {
  chunkSize?: number;
};

const DEFAULT_CHUNK_SIZE = 10_000;

const createStrategy = (
  name: string,
  model: unknown,
  options?: StrategyOptions,
): ExtractionStrategy<unknown> => {
  const chunkSize = options?.chunkSize ?? DEFAULT_CHUNK_SIZE;
  switch (name) {
    case "simple":
      return simple({ model });
    case "parallel":
      return parallel({ model, mergeModel: model, chunkSize });
    case "sequential":
      return sequential({ model, chunkSize });
    case "parallelAutoMerge":
      return parallelAutoMerge({ model, dedupeModel: model, chunkSize });
    case "sequentialAutoMerge":
      return sequentialAutoMerge({ model, dedupeModel: model, chunkSize });
    case "doublePass":
      return doublePass({ model, mergeModel: model, chunkSize });
    case "doublePassAutoMerge":
      return doublePassAutoMerge({ model, dedupeModel: model, chunkSize });
    default:
      throw new Error(`Unsupported strategy: ${name}`);
  }
};

const parseStorage = (value: unknown): TokenStorageType => {
  if (value === "auto" || value === "keychain" || value === "file") {
    return value;
  }
  return "auto";
};

const readTokenInput = async (
  token: string | undefined,
  tokenStdin: boolean | undefined,
): Promise<string> => {
  const hasToken = token !== undefined && token !== "";
  const hasTokenStdin = tokenStdin === true;

  if (hasToken && hasTokenStdin) {
    throw new Error(
      "Specify exactly one token source (--token or --token-stdin).",
    );
  }

  if (!hasToken && !hasTokenStdin) {
    throw new Error("Token is required (--token or --token-stdin).");
  }

  if (hasToken) {
    return token;
  }

  return (await readStdinText()).trim();
};

const createSpinner = () => {
  if (!process.stderr.isTTY) {
    return null;
  }
  return yoctoSpinner({
    text: "Initializing...",
    color: "cyan",
  });
};

const formatStepMessage = (
  label: string | undefined,
  step: number,
  total?: number,
): string => {
  if (!label) {
    return total ? `Step ${step}/${total}` : "Processing...";
  }

  // Format common step labels into readable messages
  if (label === "extract") {
    return "Extracting data...";
  }
  if (label === "merge") {
    return "Merging results...";
  }
  if (label === "dedupe") {
    return "Removing duplicates...";
  }
  if (label.startsWith("batch ")) {
    const match = label.match(/batch (\d+)\/(\d+)/);
    if (match) {
      const [, current, totalBatches] = match;
      return `Processing batch ${current}/${totalBatches}...`;
    }
    return `Processing ${label}...`;
  }
  if (label.startsWith("pass ")) {
    // Handle pass 1 batch X/Y or pass 1 merge
    const passMatch = label.match(/pass (\d+) (.*)/);
    if (passMatch && passMatch[2]) {
      const passNum = passMatch[1];
      const rest = passMatch[2];
      if (rest === "merge") {
        return `Pass ${passNum}: Merging results...`;
      }
      const batchMatch = rest.match(/batch (\d+)\/(\d+)/);
      if (batchMatch) {
        const [, current, totalBatches] = batchMatch;
        return `Pass ${passNum}: Processing batch ${current}/${totalBatches}...`;
      }
      return `Pass ${passNum}: ${rest}...`;
    }
    return label;
  }
  return `${label.charAt(0).toUpperCase()}${label.slice(1)}...`;
};

// ---------------------------------------------------------------------------
// models list
// ---------------------------------------------------------------------------
const modelsListCommand = defineCommand({
  meta: {
    name: "list",
    description: "List models available for all (or one) provider",
  },
  args: {
    provider: {
      type: "string",
      description: "Provider ID to query",
      alias: "p",
    },
  },
  async run({ args }) {
    if (args.provider) {
      const result = await listProviderModels(args.provider);
      const json = JSON.stringify({ providers: [result] }, null, 2);
      await writeOutput("-", json);
      return;
    }
    const results = await listAllProviderModels(supportedProviders);
    const json = JSON.stringify({ providers: results }, null, 2);
    await writeOutput("-", json);
  },
});

// ---------------------------------------------------------------------------
// models alias list
// ---------------------------------------------------------------------------
const modelsAliasListCommand = defineCommand({
  meta: {
    name: "list",
    description: "List all model aliases",
  },
  async run() {
    const aliases = await listAliases();
    const json = JSON.stringify({ aliases }, null, 2);
    await writeOutput("-", json);
  },
});

// ---------------------------------------------------------------------------
// models alias get <alias>
// ---------------------------------------------------------------------------
const modelsAliasGetCommand = defineCommand({
  meta: {
    name: "get",
    description: "Get the model behind an alias",
  },
  args: {
    alias: {
      type: "positional",
      description: "Alias name",
      required: true,
    },
  },
  async run({ args }) {
    const model = await getAlias(args.alias);
    if (!model) {
      throw new Error(`No alias found: ${args.alias}`);
    }
    const json = JSON.stringify({ alias: args.alias, model }, null, 2);
    await writeOutput("-", json);
  },
});

// ---------------------------------------------------------------------------
// models alias set <alias> <model>
// ---------------------------------------------------------------------------
const modelsAliasSetCommand = defineCommand({
  meta: {
    name: "set",
    description: "Create or update a model alias",
  },
  args: {
    alias: {
      type: "positional",
      description: "Alias name",
      required: true,
    },
    model: {
      type: "positional",
      description: "Model string (provider/model)",
      required: true,
    },
  },
  async run({ args }) {
    const model = await setAlias(args.alias, args.model);
    const json = JSON.stringify({ alias: args.alias, model }, null, 2);
    await writeOutput("-", json);
  },
});

// ---------------------------------------------------------------------------
// models alias remove <alias>
// ---------------------------------------------------------------------------
const modelsAliasRemoveCommand = defineCommand({
  meta: {
    name: "remove",
    description: "Delete a model alias",
  },
  args: {
    alias: {
      type: "positional",
      description: "Alias name",
      required: true,
    },
  },
  async run({ args }) {
    const deleted = await deleteAlias(args.alias);
    const json = JSON.stringify({ alias: args.alias, deleted }, null, 2);
    await writeOutput("-", json);
  },
});

// ---------------------------------------------------------------------------
// models alias  (parent)
// ---------------------------------------------------------------------------
const modelsAliasCommand = defineCommand({
  meta: {
    name: "alias",
    description: "Manage model aliases",
  },
  subCommands: {
    list: modelsAliasListCommand,
    get: modelsAliasGetCommand,
    set: modelsAliasSetCommand,
    remove: modelsAliasRemoveCommand,
  },
});

// ---------------------------------------------------------------------------
// models use <alias_or_model>
// ---------------------------------------------------------------------------
const modelsUseCommand = defineCommand({
  meta: {
    name: "use",
    description: "Set the default model (accepts alias or provider/model)",
  },
  args: {
    model: {
      type: "positional",
      description:
        "Alias or provider/model string (e.g. fast, openai/gpt-4.1-mini)",
      required: true,
    },
  },
  async run({ args }) {
    // Resolve alias before storing so the config always holds a real model spec
    const resolved = await resolveAlias(args.model);
    const stored = await setDefaultModel(resolved);
    const json = JSON.stringify({ defaultModel: stored }, null, 2);
    await writeOutput("-", json);
  },
});

// ---------------------------------------------------------------------------
// models  (parent)
// ---------------------------------------------------------------------------
const modelsCommand = defineCommand({
  meta: {
    name: "models",
    description: "Manage and list LLM models",
  },
  subCommands: {
    list: modelsListCommand,
    alias: modelsAliasCommand,
    use: modelsUseCommand,
  },
});

// ---------------------------------------------------------------------------
// providers list
// ---------------------------------------------------------------------------
const providersListCommand = defineCommand({
  meta: {
    name: "list",
    description: "List all supported providers and whether they are configured",
  },
  async run() {
    const stored = await listStoredProviders();
    const storedSet = new Set(stored.map((e) => e.provider));
    const providers = supportedProviders.map((provider) => ({
      provider,
      configured: storedSet.has(provider),
      storage: stored.find((e) => e.provider === provider)?.storage ?? null,
    }));
    const json = JSON.stringify({ providers }, null, 2);
    await writeOutput("-", json);
  },
});

// ---------------------------------------------------------------------------
// providers add <provider>
// ---------------------------------------------------------------------------
const providersAddCommand = defineCommand({
  meta: {
    name: "add",
    description: "Configure an API token for a provider",
  },
  args: {
    provider: {
      type: "positional",
      description:
        "Provider ID (openai, anthropic, google, opencode, openrouter)",
      required: true,
    },
    token: {
      type: "string",
      description: "API token value",
      alias: "t",
    },
    "token-stdin": {
      type: "boolean",
      description: "Read token from stdin",
    },
    storage: {
      type: "string",
      description: "Token storage method",
      valueHint: "auto|keychain|file",
      default: "auto",
    },
    default: {
      type: "boolean",
      description: "Also set this provider's cheapest model as the default",
    },
  },
  async run({ args }) {
    if (!supportedProviders.includes(args.provider)) {
      throw new Error(
        `Unknown provider: ${args.provider}. Supported: ${supportedProviders.join(", ")}`,
      );
    }
    const token = await readTokenInput(args.token, args["token-stdin"]);
    const storage = parseStorage(args.storage);
    const stored = await setProviderToken(args.provider, token, storage);

    let defaultModel: string | undefined;
    if (args.default) {
      const cheapest = await resolveCheapestModel(args.provider);
      defaultModel = await setDefaultModel(`${args.provider}/${cheapest}`);
    }

    const json = JSON.stringify(
      { provider: args.provider, stored, defaultModel },
      null,
      2,
    );
    await writeOutput("-", json);
  },
});

// ---------------------------------------------------------------------------
// providers remove <provider>
// ---------------------------------------------------------------------------
const providersRemoveCommand = defineCommand({
  meta: {
    name: "remove",
    description: "Remove a configured provider token",
  },
  args: {
    provider: {
      type: "positional",
      description: "Provider ID",
      required: true,
    },
  },
  async run({ args }) {
    const deleted = await deleteProviderToken(args.provider);
    const json = JSON.stringify({ provider: args.provider, deleted }, null, 2);
    await writeOutput("-", json);
  },
});

// ---------------------------------------------------------------------------
// providers  (parent)
// ---------------------------------------------------------------------------
const providersCommand = defineCommand({
  meta: {
    name: "providers",
    description: "Manage LLM provider credentials",
  },
  subCommands: {
    list: providersListCommand,
    add: providersAddCommand,
    remove: providersRemoveCommand,
  },
});

const verifyCommand = defineCommand({
  meta: {
    name: "verify",
    description: "Validate artifact JSON from file or stdin",
  },
  args: {
    input: {
      type: "string",
      description: "Artifact JSON file to validate",
      alias: "i",
    },
    stdin: {
      type: "boolean",
      description: "Read artifact JSON from stdin",
      alias: "s",
      default: false,
    },
  },
  async run({ args }) {
    const useStdin = args.stdin === true;

    if (!args.input && !useStdin) {
      const usageText = await renderUsage(verifyCommand);
      process.stderr.write(`${usageText}\n`);
      process.stderr.write("error: Specify an input source: --input <file> or --stdin\n");
      process.exit(1);
    }

    const raw = useStdin
      ? await readStdinText()
      : await Bun.file(args.input!).text();
    const parsed = JSON.parse(raw) as unknown;
    const artifacts = validateSerializedArtifacts(parsed);
    const json = JSON.stringify(
      { valid: true, artifacts: artifacts.length },
      null,
      2,
    );
    await writeOutput("-", json);
  },
});

const extractCommand = defineCommand({
  meta: {
    name: "extract",
    description: "Extract structured data from files or text input",
  },
  args: {
    input: {
      type: "string",
      description: "Input file to parse",
      alias: "i",
    },
    text: {
      type: "string",
      description: "Raw text input",
      alias: "t",
    },
    stdin: {
      type: "boolean",
      description: "Read raw text from stdin (auto-detected when piped)",
    },
    artifact: {
      type: "string",
      description: "Artifact JSON file or stdin (-)",
      alias: "a",
    },
    "artifact-json": {
      type: "string",
      description: "Artifact JSON string",
    },
    schema: {
      type: "string",
      description: "JSON schema file path or URL",
      alias: "s",
    },
    "schema-json": {
      type: "string",
      description: "JSON schema string",
    },
    fields: {
      type: "string",
      description:
        'Shorthand field list, e.g. "name, age:number" / "price_history:array{number}" / "sizes:enum{small|medium|large}"',
      alias: "f",
    },
    model: {
      type: "string",
      description:
        "Model identifier (e.g., openai/gpt-5, anthropic/claude-sonnet-4-20250514)",
      alias: "m",
    },
    output: {
      type: "string",
      description: "Output path or stdout (default: -)",
      alias: "o",
      default: "-",
    },
    strategy: {
      type: "string",
      description:
        "Extraction strategy (simple|parallel|sequential|parallelAutoMerge|sequentialAutoMerge|doublePass|doublePassAutoMerge)",
      alias: "S",
      default: "simple",
      valueHint: "simple|parallel|...",
    },
    "chunk-size": {
      type: "string",
      description: "Token budget per batch for chunked strategies",
      default: "10000",
    },
    debug: {
      type: "boolean",
      description: "Enable verbose JSON debug logging to stderr",
      default: false,
    },
    strict: {
      type: "boolean",
      description: "Strict mode for schema validation",
      default: false,
    },
    "no-parse": {
      type: "boolean",
      description: "Skip custom parsers; use only built-in text/image/artifact-JSON detection",
      default: false,
    },
    mime: {
      type: "string",
      description: "Override MIME type detection for the input",
    },
    parser: {
      type: "string",
      description: "Use this npm package as the parser, overriding configured parser",
    },
    images: {
      type: "boolean",
      description: "Extract embedded images from documents (PDFs)",
      default: false,
    },
    screenshots: {
      type: "boolean",
      description: "Render page screenshots and include them as images in the artifact output",
      default: false,
    },
    "screenshot-scale": {
      type: "string",
      description: "Scale factor for screenshots (default: 1.5)",
    },
    "screenshot-width": {
      type: "string",
      description: "Target width in pixels for screenshots (overrides scale)",
    },
  },
  async run({ args }) {
    const isDebug = args.debug === true;
    const debug = createDebugLogger(isDebug);

    // Log CLI initialization
    debug.cliInit({
      args: {
        input: args.input,
        text: args.text ? "[provided]" : undefined,
        stdin: args.stdin,
        artifact: args.artifact,
        "artifact-json": args["artifact-json"] ? "[provided]" : undefined,
        schema: args.schema,
        "schema-json": args["schema-json"] ? "[provided]" : undefined,
        fields: args.fields,
        model: args.model,
        output: args.output,
        strategy: args.strategy,
        "chunk-size": args["chunk-size"],
        debug: args.debug,
      },
    });

    const schemaResult = await loadSchema({
      schema: args.schema,
      "schema-json": args["schema-json"],
      fields: args.fields,
    });

    if (schemaResult.kind === "missing") {
      const usageText = await renderUsage(extractCommand);
      process.stderr.write(`${usageText}\n`);
      process.stderr.write("error: Schema is required (--schema, --schema-json, or --fields).\n");
      process.exit(1);
    }

    debug.schemaLoaded({
      source:
        args.schema ??
        (args["schema-json"]
          ? "json-string"
          : args.fields
            ? "fields"
            : "unknown"),
      schemaSize:
        schemaResult.kind === "schema"
          ? JSON.stringify(schemaResult.schema).length
          : (args.fields?.length ?? 0),
    });

    const artifacts = await loadArtifactsFromOptions({
      input: args.input,
      text: args.text,
      stdin: args.stdin,
      artifact: args.artifact,
      "artifact-json": args["artifact-json"],
      "no-parse": args["no-parse"],
      images: args.images,
      screenshots: args.screenshots,
      "screenshot-scale": args["screenshot-scale"],
      "screenshot-width": args["screenshot-width"],
      mime: args.mime,
      parser: args.parser,
    });

    // Calculate artifact stats
    const artifactSummaries = artifacts.map((a) => ({
      id: a.id,
      type: a.type,
      contentCount: a.contents.length,
      tokens: a.tokens,
    }));
    const totalTokens = artifactSummaries.reduce(
      (sum, a) => sum + (a.tokens ?? 0),
      0,
    );

    // Count total images across all artifacts
    let totalImages = 0;
    for (const artifact of artifacts) {
      for (const content of artifact.contents) {
        totalImages += content.media?.length ?? 0;
      }
    }

    debug.artifactsLoaded({
      count: artifacts.length,
      artifacts: artifactSummaries,
      totalTokens,
      totalImages,
    });

    let modelSpec = args.model
      ? await resolveExplicitModelSpec(args.model)
      : await resolveDefaultModelSpec();

    const chunkSize = parseInt(args["chunk-size"], 10);
    if (!Number.isFinite(chunkSize) || chunkSize <= 0) {
      throw new Error("Chunk size must be a positive number.");
    }

    const model = await resolveModel(modelSpec);
    debug.modelResolved({ modelSpec, resolvedModel: JSON.stringify(model) });

    const strategy = createStrategy(args.strategy, model, { chunkSize });
    debug.strategyCreated({
      strategy: args.strategy,
      config: { chunkSize, model: JSON.stringify(model) },
    });

    const spinner = isDebug ? null : createSpinner();
    let currentStepLabel: string | undefined;

    if (spinner) {
      spinner.start();
    }

    const events: ExtractionEvents = {
      onStep: async (info) => {
        if (info.label) {
          currentStepLabel = info.label;
        }
        if (spinner && info.label) {
          spinner.text = formatStepMessage(info.label, info.step, info.total);
        }
      },
      onProgress: async (info) => {
        if (spinner && info.total > 0) {
          const percent = Math.round((info.current / info.total) * 100);
          spinner.text = `Processing ${info.current}/${info.total} (${percent}%)...`;
        }
      },
      onRetry: async (info) => {
        if (spinner) {
          const baseMessage = currentStepLabel
            ? formatStepMessage(currentStepLabel, 0, undefined).replace(
                /\.\.\.$/,
                "",
              )
            : "Extracting data";
          spinner.text = `${baseMessage} (retry ${info.attempt}/${info.maxAttempts})...`;
        }
      },
      onMessage: async () => {
        // Messages are handled internally
      },
      onTokenUsage: async () => {
        // Token usage tracked in result
      },
    };

    try {
      const result = await extract({
        artifacts,
        ...(schemaResult.kind === "schema"
          ? { schema: schemaResult.schema }
          : { fields: schemaResult.fields }),
        strategy,
        events,
        debug,
        strict: args.strict,
      });

      if (spinner) {
        spinner.stop();
      }

      if (result.error) {
        const { SchemaValidationError } =
          await import("./validation/validator");
        const isSchemaError =
          result.error instanceof SchemaValidationError ||
          (result.error.name === "SchemaValidationError" &&
            "errors" in result.error);
        if (isSchemaError) {
          const schemaError = result.error as InstanceType<
            typeof SchemaValidationError
          >;
          const errorDetails = JSON.stringify(schemaError.errors, null, 2);
          throw new Error(`Schema validation failed:\n${errorDetails}`);
        }
        throw result.error;
      }

      const json = JSON.stringify(result.data, null, 2);
      await writeOutput(args.output, json);
    } catch (error) {
      if (spinner) {
        spinner.stop();
      }
      throw error;
    }
  },
});

// ---------------------------------------------------------------------------
// parse
// ---------------------------------------------------------------------------
const parseCommand = defineCommand({
  meta: {
    name: "parse",
    description: "Convert a file or stdin to Artifact JSON",
  },
  args: {
    input: {
      type: "string",
      description: "File to parse",
      alias: "i",
    },
    stdin: {
      type: "boolean",
      description: "Read from stdin",
      alias: "s",
      default: false,
    },
    mime: {
      type: "string",
      description: "Override MIME type detection",
    },
    output: {
      type: "string",
      description: "Output destination (default: stdout)",
      alias: "o",
      default: "-",
    },
    parser: {
      type: "string",
      description: "Override configured parser with this npm package name",
    },
    images: {
      type: "boolean",
      description: "Extract embedded images from documents (PDFs)",
      default: false,
    },
    screenshots: {
      type: "boolean",
      description: "Render page screenshots and include them as images in the artifact output",
      default: false,
    },
    "screenshot-scale": {
      type: "string",
      description: "Scale factor for screenshots (default: 1.5)",
    },
    "screenshot-width": {
      type: "string",
      description: "Target width in pixels for screenshots (overrides scale)",
    },
  },
  async run({ args }) {
    const useStdin = args.stdin === true;

    if (!args.input && !useStdin) {
      // No input source — show usage + error and exit 1
      const usageText = await renderUsage(parseCommand);
      process.stderr.write(`${usageText}\n`);
      process.stderr.write("error: Specify an input source: --input <file> or --stdin\n");
      process.exit(1);
    }

    // Load parsers config
    let parsersConfig: ParsersConfig = {};
    try {
      parsersConfig = await listParsers();
    } catch {
      // Ignore config load failures
    }

    // Read input into buffer
    let buffer: Buffer;
    let filePath: string | undefined;

    if (useStdin) {
      const text = await readStdinText();
      buffer = Buffer.from(text);
    } else {
      filePath = args.input!;
      const file = Bun.file(filePath);
      buffer = Buffer.from(await file.arrayBuffer());
    }

    // Detect MIME type
    const npmParserEntries = Object.entries(parsersConfig)
      .filter((entry): entry is [string, NpmParserDef] => entry[1].type === "npm")
      .map(([mimeType, def]) => ({ mimeType, def }));

    let mimeType = await detectMimeType({
      buffer,
      filePath,
      mimeOverride: args.mime,
      npmParsers: npmParserEntries,
    });

    if (!mimeType) {
      if (useStdin) {
        // Fallback to text/plain for stdin
        mimeType = "text/plain";
      } else {
        throw new Error(
          `Cannot detect MIME type for file "${args.input}". Use --mime to specify the type.`
        );
      }
    }

    // JSON auto-detection: if MIME is application/json, check if it's already SerializedArtifact[]
    if (mimeType === "application/json") {
      try {
        const parsed = JSON.parse(buffer.toString()) as unknown;
        const serialized = validateSerializedArtifacts(parsed);
        const json = JSON.stringify(serialized, null, 2);
        await writeOutput(args.output, json);
        return;
      } catch {
        // Not valid artifact JSON — fall through to parser resolution
      }
    }

    // Resolve parser: --parser flag > configured parser > built-in (PDF, text, image)
    const effectiveParsers: ParsersConfig = { ...parsersConfig };
    if (args.parser) {
      effectiveParsers[mimeType] = { type: "npm", package: args.parser };
    }

    const parserDef = effectiveParsers[mimeType];

    let artifacts;
    if (parserDef) {
      artifacts = await runParser(parserDef, { kind: "buffer", buffer }, mimeType);
    } else if (mimeType === "application/pdf") {
      const { parsePdf } = await import("./parsers/pdf");
      const screenshotScale = args["screenshot-scale"] ? parseFloat(args["screenshot-scale"]) : undefined;
      const screenshotWidth = args["screenshot-width"] ? parseInt(args["screenshot-width"], 10) : undefined;
      artifacts = [await parsePdf(buffer, {
        includeImages: args.images === true,
        screenshots: args.screenshots === true,
        screenshotScale,
        screenshotWidth,
      })];
    } else if (mimeType.startsWith("text/")) {
      const { splitTextIntoContents, hydrateSerializedArtifacts: hydrate } = await import("./artifacts/input");
      const text = buffer.toString();
      const contents = splitTextIntoContents(text);
      artifacts = [{
        id: `artifact-${crypto.randomUUID()}`,
        type: "text" as const,
        raw: async () => buffer,
        contents,
      }];
    } else if (mimeType.startsWith("image/")) {
      artifacts = [{
        id: `artifact-${crypto.randomUUID()}`,
        type: "image" as const,
        raw: async () => buffer,
        contents: [{ media: [{ type: "image" as const, contents: buffer }] }],
      }];
    } else {
      throw new Error(
        `No parser configured for MIME type "${mimeType}". Use --parser to specify an npm parser package or configure one with: struktur config parsers add --mime ${mimeType} ...`
      );
    }

    // Serialize to SerializedArtifact[]
    const serialized: SerializedArtifact[] = artifacts.map((a) => ({
      id: a.id,
      type: a.type,
      contents: a.contents.map((c) => ({
        ...(c.page !== undefined ? { page: c.page } : {}),
        ...(c.text !== undefined ? { text: c.text } : {}),
        ...(c.media
          ? {
              media: c.media.map((m) => ({
                type: "image" as const,
                ...(m.url ? { url: m.url } : {}),
                ...(m.base64 ? { base64: m.base64 } : {}),
                ...(m.contents ? { base64: m.contents.toString("base64") } : {}),
                ...(m.text ? { text: m.text } : {}),
                ...(m.width !== undefined ? { width: m.width } : {}),
                ...(m.height !== undefined ? { height: m.height } : {}),
                ...(m.imageType ? { imageType: m.imageType } : {}),
              })),
            }
          : {}),
      })),
      ...(a.metadata ? { metadata: a.metadata } : {}),
    }));

    const json = JSON.stringify(serialized, null, 2);
    await writeOutput(args.output, json);
  },
});

// ---------------------------------------------------------------------------
// config parsers list
// ---------------------------------------------------------------------------
const configParsersListCommand = defineCommand({
  meta: {
    name: "list",
    description: "List all configured parsers",
  },
  async run() {
    const parsers = await listParsers();
    const json = JSON.stringify({ parsers }, null, 2);
    await writeOutput("-", json);
  },
});

// ---------------------------------------------------------------------------
// config parsers get
// ---------------------------------------------------------------------------
const configParsersGetCommand = defineCommand({
  meta: {
    name: "get",
    description: "Get the parser configured for a MIME type",
  },
  args: {
    mime: {
      type: "string",
      description: "MIME type",
      required: true,
    },
  },
  async run({ args }) {
    const parser = await getParser(args.mime);
    if (!parser) {
      throw new Error(`No parser configured for MIME type: ${args.mime}`);
    }
    const json = JSON.stringify({ mimeType: args.mime, parser }, null, 2);
    await writeOutput("-", json);
  },
});

// ---------------------------------------------------------------------------
// config parsers add
// ---------------------------------------------------------------------------
const configParsersAddCommand = defineCommand({
  meta: {
    name: "add",
    description: "Configure a parser for a MIME type",
  },
  args: {
    mime: {
      type: "string",
      description: "MIME type to configure",
      required: true,
    },
    npm: {
      type: "string",
      description: "npm package name",
    },
    "file-command": {
      type: "string",
      description: "Command with FILE_PATH placeholder",
    },
    "stdin-command": {
      type: "string",
      description: "Command that reads from stdin",
    },
  },
  async run({ args }) {
    const sources = [args.npm, args["file-command"], args["stdin-command"]].filter(
      (v) => v !== undefined && v !== ""
    );
    if (sources.length !== 1) {
      throw new Error(
        "Specify exactly one of --npm, --file-command, or --stdin-command."
      );
    }

    let parserDef;
    if (args.npm) {
      parserDef = { type: "npm" as const, package: args.npm };
    } else if (args["file-command"]) {
      if (!args["file-command"].includes("FILE_PATH")) {
        throw new Error(
          `--file-command must contain FILE_PATH placeholder. Got: "${args["file-command"]}"`
        );
      }
      parserDef = { type: "command-file" as const, command: args["file-command"] };
    } else {
      parserDef = { type: "command-stdin" as const, command: args["stdin-command"]! };
    }

    await setParser(args.mime, parserDef);
    const json = JSON.stringify({ mimeType: args.mime, parser: parserDef }, null, 2);
    await writeOutput("-", json);
  },
});

// ---------------------------------------------------------------------------
// config parsers remove
// ---------------------------------------------------------------------------
const configParsersRemoveCommand = defineCommand({
  meta: {
    name: "remove",
    description: "Remove a configured parser",
  },
  args: {
    mime: {
      type: "string",
      description: "MIME type",
      required: true,
    },
  },
  async run({ args }) {
    const deleted = await deleteParser(args.mime);
    const json = JSON.stringify({ mimeType: args.mime, deleted }, null, 2);
    await writeOutput("-", json);
  },
});

// ---------------------------------------------------------------------------
// config parsers (parent)
// ---------------------------------------------------------------------------
const configParsersCommand = defineCommand({
  meta: {
    name: "parsers",
    description: "Manage file parsers by MIME type",
  },
  subCommands: {
    list: configParsersListCommand,
    get: configParsersGetCommand,
    add: configParsersAddCommand,
    remove: configParsersRemoveCommand,
  },
});

// ---------------------------------------------------------------------------
// config (parent) — houses models, providers, parsers
// ---------------------------------------------------------------------------
const configCommand = defineCommand({
  meta: {
    name: "config",
    description: "Manage struktur configuration",
  },
  subCommands: {
    models: modelsCommand,
    providers: providersCommand,
    parsers: configParsersCommand,
  },
});

// ---------------------------------------------------------------------------
// utils artifact-viewer
// ---------------------------------------------------------------------------
const utilsArtifactViewerCommand = defineCommand({
  meta: {
    name: "artifact-viewer",
    description: "Generate an HTML viewer for artifact JSON",
  },
  args: {
    input: {
      type: "string",
      description: "Artifact JSON file to view",
      alias: "i",
    },
    stdin: {
      type: "boolean",
      description: "Read artifact JSON from stdin",
      alias: "s",
      default: false,
    },
    output: {
      type: "string",
      description: "Output HTML file path (default: stdout)",
      alias: "o",
      default: "-",
    },
  },
  async run({ args }) {
    const useStdin = args.stdin === true;

    if (!args.input && !useStdin) {
      const usageText = await renderUsage(utilsArtifactViewerCommand);
      process.stderr.write(`${usageText}\n`);
      process.stderr.write("error: Specify an input source: --input <file> or --stdin\n");
      process.exit(1);
    }

    const raw = useStdin
      ? await readStdinText()
      : await Bun.file(args.input!).text();
    
    const parsed = JSON.parse(raw) as unknown;
    const artifacts = validateSerializedArtifacts(parsed);

    const html = generateArtifactViewerHtml(artifacts, pkg.version);
    await writeOutput(args.output, html);
  },
});

// ---------------------------------------------------------------------------
// utils (parent)
// ---------------------------------------------------------------------------
const utilsCommand = defineCommand({
  meta: {
    name: "utils",
    description: "Utility commands for working with artifacts",
  },
  subCommands: {
    "artifact-viewer": utilsArtifactViewerCommand,
  },
});

const main = defineCommand({
  meta: {
    name: "struktur",
    version: "0.1.0",
    description: "Structured data extraction using LLMs",
  },
  subCommands: {
    extract: extractCommand,
    parse: parseCommand,
    config: configCommand,
    verify: verifyCommand,
    utils: utilsCommand,
  },
});

runMain(main).catch(async (error) => {
  // Drain stdin if needed to prevent broken pipe
  if (!process.stdin.isTTY && !stdinConsumed) {
    try {
      await readStdinText();
    } catch (drainError) {
      if (!isBrokenPipe(drainError)) {
        process.stderr.write(`${String(drainError)}\n`);
      }
    }
  }

  const message = error instanceof Error ? error.message : String(error);
  process.stderr.write(`${message}\n`);
  process.exit(1);
});
