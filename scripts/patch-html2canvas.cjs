const fs = require('fs');
const path = require('path');

function patchFile(filePath) {
  if (!fs.existsSync(filePath)) return;
  let content = fs.readFileSync(filePath, 'utf8');
  let changed = false;

  // 1. Replace throw new Error for unsupported color functions
  // Matches: throw new Error("Attempting to parse an unsupported color function \"" + value.name + "\"");
  // and variations with single/double quotes or transpiled code
  const regexThrow = /throw new Error\(\s*["']Attempting to parse an unsupported color function[^)]+\);?/g;
  if (regexThrow.test(content)) {
    content = content.replace(regexThrow, 'return 0x000000ff;');
    changed = true;
  }

  // 2. Add fallback for undefined colorFunction in parse
  // If `var colorFunction = SUPPORTED_COLOR_FUNCTIONS[value.name];`
  // Ensure that if colorFunction is undefined, it returns 0x000000ff (or 255)
  if (content.includes('SUPPORTED_COLOR_FUNCTIONS[value.name]')) {
    // Add oklch, oklab, lab, lch, color into SUPPORTED_COLOR_FUNCTIONS definition if not already present
    if (!content.includes('oklch:')) {
      content = content.replace(
        /SUPPORTED_COLOR_FUNCTIONS\s*=\s*\{([^}]+)\}/,
        (match, inner) => {
          return `SUPPORTED_COLOR_FUNCTIONS = {${inner}, oklch: function() { return 0x000000ff; }, oklab: function() { return 0x000000ff; }, lab: function() { return 0x000000ff; }, lch: function() { return 0x000000ff; }, color: function() { return 0x000000ff; }}`;
        }
      );
      changed = true;
    }
  }

  if (changed) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`[patch-html2canvas] Successfully patched: ${filePath}`);
  }
}

function walkDir(dir) {
  if (!fs.existsSync(dir)) return;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walkDir(fullPath);
    } else if (entry.isFile() && (entry.name.endsWith('.js') || entry.name.endsWith('.cjs') || entry.name.endsWith('.mjs'))) {
      patchFile(fullPath);
    }
  }
}

// Patch html2canvas distribution files
const html2canvasDir = path.resolve(__dirname, '../node_modules/html2canvas');
if (fs.existsSync(html2canvasDir)) {
  walkDir(html2canvasDir);
}

// Clear Vite cache so pre-bundled dependencies are re-compiled
const viteCacheDir = path.resolve(__dirname, '../node_modules/.vite');
if (fs.existsSync(viteCacheDir)) {
  fs.rmSync(viteCacheDir, { recursive: true, force: true });
  console.log('[patch-html2canvas] Cleared node_modules/.vite cache');
}

console.log('[patch-html2canvas] Complete.');
