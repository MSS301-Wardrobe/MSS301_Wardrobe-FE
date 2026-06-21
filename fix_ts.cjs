const fs = require('fs');
let content = fs.readFileSync('d:\\MSS\\MSS301_Wardrobe-FE\\src\\pages\\user\\wardrobe\\AddClothing.tsx', 'utf8');

if (!content.includes('wardrobeId: "",')) {
  content = content.replace(
    'categoryId: "",',
    'categoryId: "",\n    wardrobeId: "",'
  );
}

fs.writeFileSync('d:\\MSS\\MSS301_Wardrobe-FE\\src\\pages\\user\\wardrobe\\AddClothing.tsx', content, 'utf8');
console.log("TS Fixed!");
