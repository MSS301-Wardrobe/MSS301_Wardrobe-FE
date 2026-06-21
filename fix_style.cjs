const fs = require('fs');
let content = fs.readFileSync('d:\\MSS\\MSS301_Wardrobe-FE\\src\\pages\\user\\wardrobe\\AddClothing.tsx', 'utf8');

// Replace formStyle in navState block
const oldNavStateStyle = `      let formStyle = "Thường Ngày";
      const lowerStyle = styleLabel.toLowerCase();
      if (lowerStyle.includes("công sở")) formStyle = "Công Sở";
      else if (lowerStyle.includes("trang trọng")) formStyle = "Trang Trọng";
      else if (lowerStyle.includes("tiệc")) formStyle = "Tiệc Tùng";
      else if (lowerStyle.includes("thể thao")) formStyle = "Thể Thao";
      else if (lowerStyle.includes("thanh lịch")) formStyle = "Thanh Lịch";`;

content = content.replace(oldNavStateStyle, `      let formStyle = styleLabel;`);

// Replace formStyle in handleFile block
const oldHandleFileStyle = `const styleLabel = translateStyle(primary.style);\n        const formStyle = mapAiStyleToFormStyle(primary.style);`;
content = content.replace(oldHandleFileStyle, `const styleLabel = translateStyle(primary.style);\n        const formStyle = styleLabel;`);

fs.writeFileSync('d:\\MSS\\MSS301_Wardrobe-FE\\src\\pages\\user\\wardrobe\\AddClothing.tsx', content, 'utf8');
console.log("Fixed style mapping");
