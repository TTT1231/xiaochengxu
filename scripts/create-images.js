const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

// CRC32 查找表
const crcTable = [];
for (let i = 0; i < 256; i++) {
  let c = i;
  for (let j = 0; j < 8; j++) {
    c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
  }
  crcTable[i] = c >>> 0;
}

function crc32(data) {
  let crc = 0xFFFFFFFF;
  for (let i = 0; i < data.length; i++) {
    crc = crcTable[(crc ^ data[i]) & 0xFF] ^ (crc >>> 8);
  }
  return (crc ^ 0xFFFFFFFF) >>> 0;
}

function createChunk(type, data) {
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length, 0);

  const typeBuffer = Buffer.from(type, 'ascii');
  const crcData = Buffer.concat([typeBuffer, data]);
  const crcValue = crc32(crcData);

  const crcBuffer = Buffer.alloc(4);
  crcBuffer.writeUInt32BE(crcValue, 0);

  return Buffer.concat([length, typeBuffer, data, crcBuffer]);
}

function createSimplePng(width, height, r, g, b, outputPath) {
  const signature = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]);

  // IHDR chunk
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8;  // bit depth
  ihdrData[9] = 2;  // color type (RGB)
  ihdrData[10] = 0; // compression
  ihdrData[11] = 0; // filter
  ihdrData[12] = 0; // interlace

  const ihdrChunk = createChunk('IHDR', ihdrData);

  // IDAT chunk - 原始图像数据
  const rawData = [];
  for (let y = 0; y < height; y++) {
    rawData.push(0); // filter byte
    for (let x = 0; x < width; x++) {
      rawData.push(r, g, b);
    }
  }

  const compressed = zlib.deflateSync(Buffer.from(rawData));
  const idatChunk = createChunk('IDAT', compressed);

  // IEND chunk
  const iendChunk = createChunk('IEND', Buffer.alloc(0));

  const png = Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, png);
  console.log('Created: ' + outputPath);
}

// 创建分类图标
const iconsDir = path.join(__dirname, '..', 'src', 'static', 'icons');
const icons = [
  { name: 'recommend.png', r: 238, g: 134, b: 43 },   // 橙色
  { name: 'cake.png', r: 255, g: 182, b: 193 },       // 粉色
  { name: 'drink.png', r: 78, g: 205, b: 196 },       // 青色
  { name: 'snack.png', r: 167, g: 139, b: 250 },      // 紫色
  { name: 'gift.png', r: 244, g: 114, b: 182 }        // 粉紫
];

icons.forEach(icon => {
  createSimplePng(40, 50, icon.r, icon.g, icon.b, path.join(iconsDir, icon.name));
});

// 创建产品图片 (192x192)
const productsDir = path.join(__dirname, '..', 'src', 'static', 'images', 'products');
const products = [
  { name: 'chocolate-cake.png', r: 139, g: 69, b: 19 },      // 棕色
  { name: 'strawberry-tart.png', r: 255, g: 105, b: 180 },   // 粉色
  { name: 'salt-caramel-latte.png', r: 210, g: 180, b: 140 },// 米色
  { name: 'maple-croissant.png', r: 222, g: 184, b: 135 },   // 金色
  { name: 'tiramisu.png', r: 197, g: 164, b: 132 },          // 咖啡色
  { name: 'mango-pancake.png', r: 255, g: 215, b: 0 },       // 黄色
  { name: 'matcha-cake.png', r: 137, g: 190, b: 137 },       // 绿色
  { name: 'mango-pomelo.png', r: 255, g: 140, b: 0 },        // 橙色
  { name: 'pearl-milk-tea.png', r: 210, g: 105, b: 30 },     // 棕色
  { name: 'grape-tea.png', r: 147, g: 112, b: 219 },         // 紫色
  { name: 'cookies.png', r: 210, g: 140, b: 90 },            // 棕色
  { name: 'macaron.png', r: 255, g: 182, b: 193 },           // 粉色
  { name: 'afternoon-tea.png', r: 144, g: 238, b: 144 },     // 浅绿
  { name: 'birthday-cake.png', r: 255, g: 105, b: 180 }      // 粉色
];

products.forEach(product => {
  createSimplePng(192, 192, product.r, product.g, product.b, path.join(productsDir, product.name));
});

// 创建Banner图片
const bannerDir = path.join(__dirname, '..', 'src', 'static', 'images');
createSimplePng(400, 256, 255, 200, 150, path.join(bannerDir, 'banner-food.png'));

console.log('\nAll images created successfully!');
