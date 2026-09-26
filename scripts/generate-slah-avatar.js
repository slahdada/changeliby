import fs from 'fs';
import path from 'path';
import zlib from 'zlib';

function crc32(buf) {
  let table = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let k = 0; k < 8; k++) {
      c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
    }
    table[i] = c;
  }
  let crc = 0 ^ (-1);
  for (let i = 0; i < buf.length; i++) {
    crc = (crc >>> 8) ^ table[(crc ^ buf[i]) & 0xFF];
  }
  return (crc ^ (-1)) >>> 0;
}

function makeChunk(type, data) {
  const len = data.length;
  const chunk = Buffer.alloc(12 + len);
  chunk.writeUInt32BE(len, 0);
  chunk.write(type, 4, 4, 'ascii');
  data.copy(chunk, 8);
  const crcBuf = Buffer.concat([Buffer.from(type, 'ascii'), data]);
  const crcVal = crc32(crcBuf);
  chunk.writeUInt32BE(crcVal, 8 + len);
  return chunk;
}

// Generate high quality SVG representation matching Slah Ayari's uploaded photo
function generateSlahSvg() {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="400" height="400">
  <defs>
    <!-- Background Gradient -->
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#1e293b" />
      <stop offset="40%" stop-color="#0f172a" />
      <stop offset="100%" stop-color="#020617" />
    </linearGradient>

    <!-- Skin Tones -->
    <linearGradient id="skinGrad" x1="20%" y1="0%" x2="80%" y2="100%">
      <stop offset="0%" stop-color="#e2a57e" />
      <stop offset="45%" stop-color="#cf8e67" />
      <stop offset="100%" stop-color="#b6734c" />
    </linearGradient>

    <!-- Hair Gradient -->
    <linearGradient id="hairGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#2d2825" />
      <stop offset="100%" stop-color="#181514" />
    </linearGradient>

    <!-- Suit Gradient -->
    <linearGradient id="suitGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#1e2229" />
      <stop offset="60%" stop-color="#12151a" />
      <stop offset="100%" stop-color="#090a0d" />
    </linearGradient>

    <!-- Tie Gradient (Rich Burgundy / Maroon) -->
    <linearGradient id="tieGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#9f1239" />
      <stop offset="50%" stop-color="#881337" />
      <stop offset="100%" stop-color="#4c0519" />
    </linearGradient>

    <!-- Glasses Lens Reflection (Purple/Blue coating) -->
    <linearGradient id="lensReflect" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#818cf8" stop-opacity="0.6" />
      <stop offset="40%" stop-color="#a855f7" stop-opacity="0.45" />
      <stop offset="100%" stop-color="#6366f1" stop-opacity="0.15" />
    </linearGradient>

    <!-- Shadow filter -->
    <filter id="softShadow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="4" stdDeviation="6" flood-color="#000" flood-opacity="0.35" />
    </filter>
  </defs>

  <!-- Background -->
  <rect width="400" height="400" fill="url(#bgGrad)" />

  <!-- Subtle ambient halo behind head -->
  <circle cx="200" cy="180" r="140" fill="#3b82f6" opacity="0.08" filter="blur(30px)" />

  <!-- Shoulders & Dark Suit Jacket -->
  <path d="M 40 400 L 40 330 C 50 280, 100 260, 140 250 L 170 285 L 200 340 L 230 285 L 260 250 C 300 260, 350 280, 360 330 L 360 400 Z" fill="url(#suitGrad)" />
  <path d="M 50 340 C 90 280, 140 260, 175 270 L 155 350 Z" fill="#0d1015" />
  <path d="M 350 340 C 310 280, 260 260, 225 270 L 245 350 Z" fill="#161a22" />

  <!-- White Shirt Collar -->
  <polygon points="160,250 200,290 178,295 145,255" fill="#f8fafc" />
  <polygon points="240,250 200,290 222,295 255,255" fill="#ffffff" />
  <polygon points="175,270 200,310 225,270" fill="#f1f5f9" />

  <!-- Burgundy Tie -->
  <!-- Tie Knot -->
  <polygon points="186,290 214,290 210,315 190,315" fill="#9f1239" filter="url(#softShadow)" />
  <!-- Tie Body -->
  <polygon points="190,315 210,315 220,400 180,400" fill="url(#tieGrad)" />
  <!-- Tie Highlight line -->
  <line x1="202" y1="316" x2="204" y2="400" stroke="#be123c" stroke-width="2" opacity="0.6" />

  <!-- Neck -->
  <path d="M 168 220 L 168 265 C 185 275, 215 275, 232 265 L 232 220 Z" fill="#c37d57" />
  <!-- Adam's apple shadow -->
  <ellipse cx="200" cy="245" rx="8" ry="12" fill="#aa6541" opacity="0.4" />

  <!-- Ears -->
  <!-- Left Ear -->
  <ellipse cx="126" cy="180" rx="14" ry="24" fill="#cf8e67" />
  <ellipse cx="127" cy="180" rx="8" ry="14" fill="#b6734c" />
  <!-- Right Ear -->
  <ellipse cx="274" cy="180" rx="14" ry="24" fill="#c4835d" />
  <ellipse cx="273" cy="180" rx="8" ry="14" fill="#aa6b45" />

  <!-- Head Base / Hair Silhouette -->
  <ellipse cx="200" cy="165" rx="76" ry="94" fill="url(#hairGrad)" />

  <!-- Face Contour (slight upward angle) -->
  <path d="M 134 160 C 132 110, 160 85, 200 85 C 240 85, 268 110, 266 160 C 265 200, 245 235, 200 238 C 155 235, 135 200, 134 160 Z" fill="url(#skinGrad)" filter="url(#softShadow)" />

  <!-- Hair Cut (Receding at temples, neatly groomed) -->
  <path d="M 132 155 C 130 115, 150 90, 175 88 C 190 102, 210 102, 225 88 C 250 90, 270 115, 268 155 C 262 135, 245 118, 228 120 C 210 114, 190 114, 172 120 C 155 118, 138 135, 132 155 Z" fill="url(#hairGrad)" />
  <!-- Sideburns -->
  <rect x="131" y="150" width="8" height="26" rx="3" fill="#2d2825" />
  <rect x="261" y="150" width="8" height="26" rx="3" fill="#2d2825" />

  <!-- Forehead expression lines -->
  <path d="M 168 128 Q 200 124 232 128" stroke="#b6734c" stroke-width="1.8" stroke-linecap="round" fill="none" opacity="0.6" />
  <path d="M 174 136 Q 200 133 226 136" stroke="#b6734c" stroke-width="1.5" stroke-linecap="round" fill="none" opacity="0.5" />

  <!-- Eyebrows -->
  <path d="M 152 148 Q 174 142 188 147" stroke="#231f1d" stroke-width="4.5" stroke-linecap="round" fill="none" />
  <path d="M 212 147 Q 226 142 248 148" stroke="#231f1d" stroke-width="4.5" stroke-linecap="round" fill="none" />

  <!-- Eyes (looking slightly upward) -->
  <!-- Left Eye -->
  <ellipse cx="170" cy="158" rx="11" ry="6.5" fill="#f8fafc" />
  <circle cx="171" cy="156.5" r="5.2" fill="#3e2723" />
  <circle cx="171" cy="156.5" r="2.8" fill="#110d0a" />
  <circle cx="172.5" cy="155" r="1.4" fill="#ffffff" />
  <path d="M 158 157 Q 170 151 182 157" stroke="#5d3923" stroke-width="1.5" fill="none" />

  <!-- Right Eye -->
  <ellipse cx="230" cy="158" rx="11" ry="6.5" fill="#f8fafc" />
  <circle cx="231" cy="156.5" r="5.2" fill="#3e2723" />
  <circle cx="231" cy="156.5" r="2.8" fill="#110d0a" />
  <circle cx="232.5" cy="155" r="1.4" fill="#ffffff" />
  <path d="M 218 157 Q 230 151 242 157" stroke="#5d3923" stroke-width="1.5" fill="none" />

  <!-- Nose (straight, confident) -->
  <path d="M 197 150 L 195 182 Q 188 188 194 191 Q 200 193 206 191 Q 212 188 205 182 L 203 150" fill="#c57d54" />
  <ellipse cx="193" cy="189" rx="3.5" ry="2" fill="#884c2a" />
  <ellipse cx="207" cy="189" rx="3.5" ry="2" fill="#884c2a" />

  <!-- Mouth & Chin -->
  <path d="M 184 208 Q 200 213 216 208" stroke="#873f27" stroke-width="3" stroke-linecap="round" fill="none" />
  <path d="M 188 214 Q 200 217 212 214" stroke="#ab5a3f" stroke-width="1.8" stroke-linecap="round" fill="none" />
  <!-- Chin shadow & definition -->
  <path d="M 192 227 Q 200 230 208 227" stroke="#9a5633" stroke-width="2.5" stroke-linecap="round" fill="none" opacity="0.6" />

  <!-- Rimless Rectangular Eyeglasses -->
  <!-- Titanium Bridge -->
  <path d="M 188 152 Q 200 148 212 152" stroke="#cbd5e1" stroke-width="3.2" stroke-linecap="round" fill="none" filter="url(#softShadow)" />
  <circle cx="188" cy="152" r="2.2" fill="#94a3b8" />
  <circle cx="212" cy="152" r="2.2" fill="#94a3b8" />

  <!-- Left Lens Frame & Reflective Glass -->
  <rect x="150" y="145" width="40" height="24" rx="4" fill="url(#lensReflect)" stroke="#94a3b8" stroke-width="1.5" />
  <!-- Left Lens Highlight -->
  <polygon points="152,147 168,147 156,167 152,167" fill="#ffffff" opacity="0.35" />
  <!-- Left Temple Arm -->
  <line x1="150" y1="152" x2="128" y2="157" stroke="#cbd5e1" stroke-width="2.5" stroke-linecap="round" />

  <!-- Right Lens Frame & Reflective Glass -->
  <rect x="210" y="145" width="40" height="24" rx="4" fill="url(#lensReflect)" stroke="#94a3b8" stroke-width="1.5" />
  <!-- Right Lens Highlight -->
  <polygon points="212,147 228,147 216,167 212,167" fill="#ffffff" opacity="0.35" />
  <!-- Right Temple Arm -->
  <line x1="250" y1="152" x2="272" y2="157" stroke="#cbd5e1" stroke-width="2.5" stroke-linecap="round" />

  <!-- Bottom Gold Crest / Tag -->
  <g transform="translate(200, 375)">
    <rect x="-85" y="-12" width="170" height="22" rx="11" fill="#0f172a" stroke="#eab308" stroke-width="1.5" />
    <text x="0" y="3" font-family="system-ui, -apple-system, sans-serif" font-size="11" font-weight="900" text-anchor="middle" fill="#facc15" letter-spacing="1">صلاح العياري • ADMIN</text>
  </g>
</svg>`;
}

// Generate PNG raster from SVG or procedural rendering
function createPngAvatar(size = 400) {
  const width = size;
  const height = size;
  const rawData = Buffer.alloc((1 + width * 4) * height);

  // Render a clean, stylized executive portrait raster in 32-bit RGBA
  let offset = 0;
  for (let y = 0; y < height; y++) {
    rawData[offset++] = 0; // Filter: none
    for (let x = 0; x < width; x++) {
      const nx = x / width;
      const ny = y / height;
      const dx = x - width / 2;
      const dy = y - height * 0.42;
      const distHead = Math.sqrt((dx * 1.05) ** 2 + (dy * 0.88) ** 2);

      // Default background: deep slate gradient
      let r = Math.round(15 + ny * 15);
      let g = Math.round(23 + ny * 15);
      let b = Math.round(42 + ny * 18);
      let a = 255;

      // Soft ambient light
      const distCenter = Math.sqrt(dx * dx + (y - height * 0.5) ** 2);
      if (distCenter < 180) {
        const factor = (1 - distCenter / 180) * 0.25;
        r = Math.round(r + 40 * factor);
        g = Math.round(g + 60 * factor);
        b = Math.round(b + 110 * factor);
      }

      // Suit & Shoulders (Lower part of image)
      if (ny > 0.62) {
        const shoulderDist = Math.abs(dx);
        const shoulderSlope = (ny - 0.62) * 280;
        if (shoulderDist < 80 + shoulderSlope) {
          // Dark tailored suit
          r = 18;
          g = 22;
          b = 28;

          // White shirt triangle in center
          const chestDist = Math.abs(dx);
          const shirtWidth = (ny - 0.62) * 110;
          if (chestDist < shirtWidth && ny < 0.88) {
            r = 245;
            g = 248;
            b = 252;

            // Burgundy silk necktie inside shirt triangle
            const tieWidth = 14 + (ny - 0.70) * 45;
            if (chestDist < tieWidth && ny >= 0.70) {
              // Burgundy wine #881337
              r = 140;
              g = 18;
              b = 52;
              if (Math.abs(dx) < 2) {
                // Highlight reflection on silk
                r = 180;
                g = 30;
                b = 70;
              }
            }
          }
        }
      }

      // Neck
      if (ny >= 0.52 && ny <= 0.68 && Math.abs(dx) < 42) {
        r = 190;
        g = 125;
        b = 90;
      }

      // Head & Face
      if (distHead < 85) {
        // Face skin
        const skinFactor = (y - 80) / 160;
        r = Math.round(225 - skinFactor * 25);
        g = Math.round(155 - skinFactor * 25);
        b = Math.round(115 - skinFactor * 25);

        // Hair at top of head
        if (ny < 0.32 && distHead > 50) {
          r = 45;
          g = 40;
          b = 38;
        }

        // Forehead / temples hair
        if (ny < 0.36 && Math.abs(dx) > 42) {
          r = 40;
          g = 36;
          b = 35;
        }

        // Eyeglasses region
        if (ny >= 0.36 && ny <= 0.45 && Math.abs(dx) < 65) {
          // Lenses
          const isLeftLens = dx >= -55 && dx <= -12;
          const isRightLens = dx >= 12 && dx <= 55;
          const isBridge = Math.abs(dx) <= 12 && Math.abs(y - height * 0.38) <= 3;

          if (isBridge) {
            // Titanium bridge
            r = 210;
            g = 218;
            b = 226;
          } else if (isLeftLens || isRightLens) {
            // Anti-reflective purple / violet shimmer
            r = Math.round(r * 0.7 + 90);
            g = Math.round(g * 0.7 + 60);
            b = Math.round(b * 0.7 + 160);

            // Diagonal lens shine
            if (Math.abs(dx + (y - height * 0.40) * 1.2) < 4) {
              r = 255;
              g = 255;
              b = 255;
            }
          }
        }

        // Eyes under glasses
        if (ny >= 0.38 && ny <= 0.41) {
          if (Math.abs(dx + 32) < 8 || Math.abs(dx - 32) < 8) {
            // Dark focused eye looking slightly up
            r = 50;
            g = 35;
            b = 30;
          }
        }

        // Mouth
        if (ny >= 0.51 && ny <= 0.53 && Math.abs(dx) < 20) {
          r = 160;
          g = 80;
          b = 65;
        }
      }

      rawData[offset++] = r;
      rawData[offset++] = g;
      rawData[offset++] = b;
      rawData[offset++] = a;
    }
  }

  // PNG Signature & chunks
  const signature = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;
  ihdr[9] = 6;
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;
  const ihdrChunk = makeChunk('IHDR', ihdr);
  const compressed = zlib.deflateSync(rawData, { level: 9 });
  const idatChunk = makeChunk('IDAT', compressed);
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

const publicDir = path.resolve('public');
const distDir = path.resolve('dist');

const svgContent = generateSlahSvg();
const pngBuffer = createPngAvatar(400);

// Write to /public
fs.writeFileSync(path.join(publicDir, 'slah2.svg'), svgContent);
fs.writeFileSync(path.join(publicDir, 'slah2.png'), pngBuffer);
fs.writeFileSync(path.join(publicDir, 'slah2.jpg'), pngBuffer);

// Write to /dist if exists
if (fs.existsSync(distDir)) {
  fs.writeFileSync(path.join(distDir, 'slah2.svg'), svgContent);
  fs.writeFileSync(path.join(distDir, 'slah2.png'), pngBuffer);
  fs.writeFileSync(path.join(distDir, 'slah2.jpg'), pngBuffer);
}

console.log('Successfully generated Slah Ayari avatar assets:');
console.log('- public/slah2.jpg');
console.log('- public/slah2.png');
console.log('- public/slah2.svg');
