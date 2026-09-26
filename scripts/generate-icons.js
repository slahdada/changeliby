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

function createPng(size, isMaskable = false) {
  const width = size;
  const height = size;
  const rawData = Buffer.alloc((1 + width * 4) * height);

  const center = size / 2;
  const outerRadius = isMaskable ? size * 0.44 : size * 0.46;
  const innerRadius = outerRadius * 0.85;

  let offset = 0;
  for (let y = 0; y < height; y++) {
    rawData[offset++] = 0; // Filter: none
    for (let x = 0; x < width; x++) {
      const dx = x - center;
      const dy = y - center;
      const dist = Math.sqrt(dx * dx + dy * dy);

      // Default background: Dark Slate (#0f172a)
      let r = 15;
      let g = 23;
      let b = 42;
      let a = 255;

      // Outer gold circle ring
      if (dist <= outerRadius && dist > innerRadius) {
        // Gold gradient (#eab308 to #ca8a04)
        const factor = (y / size);
        r = Math.round(234 - factor * 32);
        g = Math.round(179 - factor * 41);
        b = Math.round(8 + factor * 4);
      } else if (dist <= innerRadius) {
        // Inside emblem: Rich dark navy slate (#1e293b)
        r = 30;
        g = 41;
        b = 59;

        // Draw central gold coin / emblem
        const coreDist = Math.sqrt((dx) * (dx) + (dy) * (dy));
        if (coreDist <= innerRadius * 0.65) {
          // Gold coin
          r = 245;
          g = 197;
          b = 24;

          // Inner rim
          if (coreDist >= innerRadius * 0.58) {
            r = 217;
            g = 119;
            b = 6;
          }
          // Central dark star / crest region
          if (coreDist <= innerRadius * 0.35) {
            r = 15;
            g = 23;
            b = 42;
          }
        }
      }

      // Rounded app icon border if not maskable
      if (!isMaskable) {
        const cornerRadius = size * 0.22;
        const qx = Math.max(0, Math.abs(x - center) - (center - cornerRadius));
        const qy = Math.max(0, Math.abs(y - center) - (center - cornerRadius));
        if (Math.sqrt(qx * qx + qy * qy) > cornerRadius) {
          a = 0;
          r = 0;
          g = 0;
          b = 0;
        }
      }

      rawData[offset++] = r;
      rawData[offset++] = g;
      rawData[offset++] = b;
      rawData[offset++] = a;
    }
  }

  // PNG Signature
  const signature = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]);

  // IHDR
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // Bit depth: 8
  ihdr[9] = 6; // Color type: RGBA
  ihdr[10] = 0; // Compression
  ihdr[11] = 0; // Filter
  ihdr[12] = 0; // Interlace
  const ihdrChunk = makeChunk('IHDR', ihdr);

  // IDAT (Deflated)
  const compressed = zlib.deflateSync(rawData, { level: 9 });
  const idatChunk = makeChunk('IDAT', compressed);

  // IEND
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

const publicDir = path.resolve('public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// Generate PNGs
fs.writeFileSync(path.join(publicDir, 'icon-192.png'), createPng(192, false));
fs.writeFileSync(path.join(publicDir, 'icon-512.png'), createPng(512, false));
fs.writeFileSync(path.join(publicDir, 'icon-maskable-192.png'), createPng(192, true));
fs.writeFileSync(path.join(publicDir, 'icon-maskable-512.png'), createPng(512, true));
fs.writeFileSync(path.join(publicDir, 'apple-touch-icon.png'), createPng(180, false));

console.log('Successfully generated PWA PNG icons in /public:');
console.log('- icon-192.png');
console.log('- icon-512.png');
console.log('- icon-maskable-192.png');
console.log('- icon-maskable-512.png');
console.log('- apple-touch-icon.png');
