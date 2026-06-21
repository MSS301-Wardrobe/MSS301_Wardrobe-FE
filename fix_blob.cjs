const fs = require('fs');
let content = fs.readFileSync('d:\\MSS\\MSS301_Wardrobe-FE\\src\\pages\\user\\wardrobe\\AddClothing.tsx', 'utf8');

const oldSubmit = `      let finalImageId = undefined;
      if (selectedFile) {
        try {
          const uploadRes = await storageService.upload(selectedFile);
          finalImageId = uploadRes.id;
        } catch (err) {
          console.error("Upload failed", err);
        }
      }`;

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
      }`;

content = content.replace(oldSubmit, newSubmit);

fs.writeFileSync('d:\\MSS\\MSS301_Wardrobe-FE\\src\\pages\\user\\wardrobe\\AddClothing.tsx', content, 'utf8');
console.log("Updated AddClothing blob upload");
