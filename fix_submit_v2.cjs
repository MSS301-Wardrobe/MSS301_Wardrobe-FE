const fs = require('fs');
const file = 'd:\\MSS\\MSS301_Wardrobe-FE\\src\\pages\\user\\wardrobe\\AddClothing.tsx';
let c = fs.readFileSync(file, 'utf8');

// Use a shorter unique string to find the target
const oldPart = `      await clothingItemApi.create({
          itemName: form.itemName,
          categoryId: form.categoryId || undefined,
          zoneId: form.zoneId || undefined,
          dominantColor: form.dominantColor || undefined,
          style: form.style || undefined,
          confidenceScore: form.confidenceScore,
          // imageId would come from storage-service upload in a full flow
        });`;

const newPart = `      // Upload image first
      let finalImageId = undefined;
      if (selectedFile) {
        try {
          const uploadRes = await storageService.upload(selectedFile);
          finalImageId = uploadRes.id;
        } catch (uploadErr) {
          console.error('Image upload failed:', uploadErr);
        }
      } else if (preview && preview.startsWith('blob:')) {
        try {
          const response = await fetch(preview);
          const blob = await response.blob();
          const imgFile = new File([blob], 'ai-image.jpg', { type: blob.type });
          const uploadRes = await storageService.upload(imgFile);
          finalImageId = uploadRes.id;
        } catch (uploadErr) {
          console.error('Blob upload failed:', uploadErr);
        }
      }
      await clothingItemApi.create({
          itemName: form.itemName,
          categoryId: form.categoryId || undefined,
          zoneId: form.zoneId || undefined,
          dominantColor: form.dominantColor || undefined,
          style: form.style || undefined,
          confidenceScore: form.confidenceScore,
          imageId: finalImageId,
        });`;

if (!c.includes('imageId would come')) {
  console.log('Already patched or different format');
  process.exit(0);
}

c = c.replace(/\/\/ imageId would come from storage-service upload in a full flow/, 'imageId: finalImageId,');

// Now inject image upload BEFORE clothingItemApi.create
const createLine = '      await clothingItemApi.create({';
const uploadCode = `      // Upload image first
      let finalImageId = undefined;
      if (selectedFile) {
        try {
          const uploadRes = await storageService.upload(selectedFile);
          finalImageId = uploadRes.id;
        } catch (uploadErr) {
          console.error('Image upload failed:', uploadErr);
        }
      } else if (preview && preview.startsWith('blob:')) {
        try {
          const response = await fetch(preview);
          const blob = await response.blob();
          const imgFile = new File([blob], 'ai-image.jpg', { type: blob.type });
          const uploadRes = await storageService.upload(imgFile);
          finalImageId = uploadRes.id;
        } catch (uploadErr) {
          console.error('Blob upload failed:', uploadErr);
        }
      }
      `;

c = c.replace(createLine, uploadCode + createLine);

// Add storageService import
if (!c.includes('storageService')) {
  c = c.replace(
    'import { aiService } from "../../../services/aiService";',
    'import { aiService } from "../../../services/aiService";\nimport { storageService } from "../../../services/storageService";'
  );
}

fs.writeFileSync(file, c, 'utf8');
console.log('Done!');
