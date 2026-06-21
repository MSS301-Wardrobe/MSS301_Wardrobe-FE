const fs = require('fs');
let content = fs.readFileSync('d:\\MSS\\MSS301_Wardrobe-FE\\src\\pages\\user\\wardrobe\\ClothingDetail.tsx', 'utf8');

// Fix duplicate useState import
const importsRegex = /import \{ useEffect, useState \} from "react";[\s\S]*?import \{ useState \} from "react";/;
if (importsRegex.test(content)) {
  content = content.replace('import { useState } from "react";\n', '');
}

// Fix never[] inference on aiAttributes
content = content.replace(
  'aiAttributes: [],',
  'aiAttributes: [] as Array<{label: string, value: string, confidence: number}>,'
);

fs.writeFileSync('d:\\MSS\\MSS301_Wardrobe-FE\\src\\pages\\user\\wardrobe\\ClothingDetail.tsx', content, 'utf8');
console.log("Fixed ClothingDetail TS errors!");
