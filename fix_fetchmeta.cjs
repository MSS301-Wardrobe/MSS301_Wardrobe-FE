const fs = require('fs');
let content = fs.readFileSync('d:\\MSS\\MSS301_Wardrobe-FE\\src\\pages\\user\\wardrobe\\AddClothing.tsx', 'utf8');

content = content.replace(
  /const \[cats, zns\] = await Promise\.all\(\[\s+categoryApi\.getAll\(\),\s+wardrobeZoneApi\.getAll\(\)[^\]]+\]\);/,
  'const [cats, zns, wrdbs] = await Promise.all([\n          categoryApi.getAll(),\n          wardrobeZoneApi.getAll(),\n          wardrobeApi.getAll()\n        ]);'
);

content = content.replace(
  /setCategories\(syncedCategories\);\s+setZones\(zns\);/,
  'setCategories(syncedCategories);\n        setZones(zns);\n        setWardrobes(wrdbs);\n\n        if (initialZoneId) {\n          const foundZone = zns.find(z => z.zoneId === initialZoneId);\n          if (foundZone) {\n            setForm(prev => ({ ...prev, wardrobeId: foundZone.wardrobeId }));\n          }\n        }'
);

fs.writeFileSync('d:\\MSS\\MSS301_Wardrobe-FE\\src\\pages\\user\\wardrobe\\AddClothing.tsx', content, 'utf8');
console.log("fetchMeta Fixed!");
