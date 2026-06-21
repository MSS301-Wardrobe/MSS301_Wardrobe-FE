const fs = require('fs');
let content = fs.readFileSync('d:\\MSS\\MSS301_Wardrobe-FE\\src\\pages\\user\\wardrobe\\AddClothing.tsx', 'utf8');

const regex = /await clothingItemApi\.create\(\{[\s\S]*?\/\/ imageId would come from storage-service upload in a full flow\n\s*\}\);/;

const newSubmit = `      let finalImageId = undefined;
        if (selectedFile) {
          try {
            const uploadRes = await storageService.upload(selectedFile);
            finalImageId = uploadRes.id;
          } catch (err) {
            console.error("Upload failed", err);
          }
        } else if (preview && preview.startsWith('blob:')) {
          try {
            const response = await fetch(preview);
            const blob = await response.blob();
            const file = new File([blob], 'ai-image.jpg', { type: blob.type });
            const uploadRes = await storageService.upload(file);
            finalImageId = uploadRes.id;
          } catch (err) {
            console.error("Blob upload failed", err);
          }
        }

        await clothingItemApi.create({
          itemName: form.itemName,
          categoryId: form.categoryId || undefined,
          zoneId: form.zoneId || undefined,
          wardrobeId: form.wardrobeId || undefined,
          dominantColor: form.dominantColor || undefined,
          style: form.style || undefined,
          confidenceScore: form.confidenceScore,
          imageId: finalImageId,
        });`;

content = content.replace(regex, newSubmit);

fs.writeFileSync('d:\\MSS\\MSS301_Wardrobe-FE\\src\\pages\\user\\wardrobe\\AddClothing.tsx', content, 'utf8');
console.log("Fixed handleSubmit image upload");
