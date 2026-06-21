const fs = require('fs');
let content = fs.readFileSync('d:\\MSS\\MSS301_Wardrobe-FE\\src\\pages\\user\\wardrobe\\AddClothing.tsx', 'utf8');

// The exact string in the file
const target = `import {
  clothingItemApi,
  categoryApi,
  ensureAiCategoryCatalog,
  resolveCategoryFromAi,
  wardrobeZoneApi,
} from "../../../services/wardrobeService";`;

const replacement = `import {
  clothingItemApi,
  categoryApi,
  ensureAiCategoryCatalog,
  resolveCategoryFromAi,
  wardrobeZoneApi,
  wardrobeApi,
} from "../../../services/wardrobeService";`;

if (content.includes('wardrobeZoneApi,')) {
    content = content.replace(target, replacement);
    fs.writeFileSync('d:\\MSS\\MSS301_Wardrobe-FE\\src\\pages\\user\\wardrobe\\AddClothing.tsx', content, 'utf8');
    console.log("Fixed wardrobeApi import!");
} else {
    console.log("Could not find the target block");
}
