import fs from 'fs';
import path from 'path';

const width = 16;
const height = 16;
const bpp = 32;
const numPixels = width * height;
const imageSize = 40 + numPixels * 4 + (width * height / 8);

const buffer = Buffer.alloc(6 + 16 + imageSize);

// ICONDIR
buffer.writeUInt16LE(0, 0); // reserved
buffer.writeUInt16LE(1, 2); // icon
buffer.writeUInt16LE(1, 4); // 1 image

// ICONDIRENTRY
buffer.writeUInt8(width, 6);
buffer.writeUInt8(height, 7);
buffer.writeUInt8(0, 8); // no palette
buffer.writeUInt8(0, 9); // reserved
buffer.writeUInt16LE(1, 10); // color planes
buffer.writeUInt16LE(bpp, 12); // bpp
buffer.writeUInt32LE(imageSize, 14); // image size
buffer.writeUInt32LE(22, 18); // offset

// BITMAPINFOHEADER
let offset = 22;
buffer.writeUInt32LE(40, offset); // header size
buffer.writeInt32LE(width, offset + 4); // width
buffer.writeInt32LE(height * 2, offset + 8); // height (doubled for ICO mask)
buffer.writeUInt16LE(1, offset + 12); // planes
buffer.writeUInt16LE(bpp, offset + 14); // bpp
buffer.writeUInt32LE(0, offset + 16); // BI_RGB
buffer.writeUInt32LE(numPixels * 4, offset + 20); // image size
buffer.writeInt32LE(0, offset + 24);
buffer.writeInt32LE(0, offset + 28);
buffer.writeUInt32LE(0, offset + 32);
buffer.writeUInt32LE(0, offset + 36);

offset += 40;
// Fill pixels (BGRA, bottom-up)
// Emdad primary: #0D5C96 (B: 150, G: 92, R: 13, A: 255)
// Emdad turquoise: #14B8A6 (B: 166, G: 184, R: 20, A: 255)
for (let y = 0; y < height; y++) {
  for (let x = 0; x < width; x++) {
    const isTooth = (x >= 3 && x <= 12 && y >= 2 && y <= 13);
    if (isTooth) {
      buffer.writeUInt8(166, offset); // B
      buffer.writeUInt8(184, offset + 1); // G
      buffer.writeUInt8(20, offset + 2); // R
      buffer.writeUInt8(255, offset + 3); // A
    } else {
      buffer.writeUInt8(0, offset);
      buffer.writeUInt8(0, offset + 1);
      buffer.writeUInt8(0, offset + 2);
      buffer.writeUInt8(0, offset + 3);
    }
    offset += 4;
  }
}

// 1-bit mask
for (let i = 0; i < (width * height / 8); i++) {
  buffer.writeUInt8(0, offset + i);
}

const outPath = path.resolve('public/favicon.ico');
fs.writeFileSync(outPath, buffer);
console.log('favicon.ico created at', outPath, 'size:', buffer.length);
