const fs = require('fs');
let content = fs.readFileSync('d:\\MSS\\MSS301_Wardrobe-FE\\src\\pages\\user\\wardrobe\\AddClothing.tsx', 'utf8');

// Add wardrobeApi import
if (!content.includes('wardrobeApi')) {
  content = content.replace(
    'import { clothingItemApi, categoryApi }',
    'import { clothingItemApi, categoryApi, wardrobeApi }'
  );
} else if (content.includes('import { clothingItemApi, categoryApi }')) {
    content = content.replace(
      'import { clothingItemApi, categoryApi }',
      'import { clothingItemApi, categoryApi, wardrobeApi }'
    );
}

// Add wardrobes state
if (!content.includes('const [wardrobes, setWardrobes]')) {
  content = content.replace(
    'const [categories, setCategories] = useState<Category[]>([]);',
    'const [categories, setCategories] = useState<Category[]>([]);\n  const [wardrobes, setWardrobes] = useState<any[]>([]);'
  );
}

// Fix parameter 'z' implicitly has 'any' type
content = content.replace(/\(z\) => \(\{/g, '(z: any) => ({');

fs.writeFileSync('d:\\MSS\\MSS301_Wardrobe-FE\\src\\pages\\user\\wardrobe\\AddClothing.tsx', content, 'utf8');
console.log("Fixed AddClothing TS errors");
