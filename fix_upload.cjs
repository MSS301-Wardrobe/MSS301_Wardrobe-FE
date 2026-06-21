const fs = require('fs');
let content = fs.readFileSync('d:\\MSS\\MSS301_Wardrobe-FE\\src\\pages\\user\\wardrobe\\AddClothing.tsx', 'utf8');

if (!content.includes('import { storageService }')) {
  content = content.replace(
    'import { aiService } from "../../../services/aiService";',
    'import { aiService } from "../../../services/aiService";\nimport { storageService } from "../../../services/storageService";'
  );
}

const oldSubmit = `      const payload: CreateClothingItemPayload = {
        itemName: form.itemName,
        categoryId: form.categoryId || undefined,
        zoneId: form.zoneId || undefined,
        wardrobeId: form.wardrobeId || undefined, // just in case
        dominantColor: form.dominantColor || undefined,
        style: form.style || undefined,
        confidenceScore: form.confidenceScore,
        // imageId would come from storage-service upload in a full flow
      };`;

// Wait, the payload might not have wardrobeId because it was TS error and I added it to form but not payload.
// Let's use regex to replace the payload block inside handleSubmit
const replaceSubmitCode = `      let finalImageId = undefined;
      if (selectedFile) {
        try {
          const uploadRes = await storageService.upload(selectedFile);
          finalImageId = uploadRes.id;
        } catch (err) {
          console.error("Upload failed", err);
        }
      }

      const payload = {
        itemName: form.itemName,
        categoryId: form.categoryId || undefined,
        zoneId: form.zoneId || undefined,
        dominantColor: form.dominantColor || undefined,
        style: form.style || undefined,
        confidenceScore: form.confidenceScore,
        imageId: finalImageId,
      };`;

content = content.replace(
  /const payload: CreateClothingItemPayload = {[\s\S]*?};\n/,
  replaceSubmitCode + '\n'
);

fs.writeFileSync('d:\\MSS\\MSS301_Wardrobe-FE\\src\\pages\\user\\wardrobe\\AddClothing.tsx', content, 'utf8');
console.log("Updated AddClothing.tsx to upload image");
