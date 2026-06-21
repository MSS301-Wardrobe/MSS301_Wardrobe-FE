const fs = require('fs');

// 1. Update aiMappings.ts to add gainsboro
let mapContent = fs.readFileSync('d:\\MSS\\MSS301_Wardrobe-FE\\src\\utils\\aiMappings.ts', 'utf8');
if (!mapContent.includes('gainsboro:')) {
  mapContent = mapContent.replace(
    'gray: "Xám",',
    'gray: "Xám",\n  gainsboro: "Xám",'
  );
  fs.writeFileSync('d:\\MSS\\MSS301_Wardrobe-FE\\src\\utils\\aiMappings.ts', mapContent, 'utf8');
}

// 2. Fix AddClothing.tsx
let content = fs.readFileSync('d:\\MSS\\MSS301_Wardrobe-FE\\src\\pages\\user\\wardrobe\\AddClothing.tsx', 'utf8');

// The block we need to replace is the one parsing navState
const oldEffect = `  useEffect(() => {
    if (navState?.prefillDetection && !form.confidenceScore && categories.length > 0) {
      const primary = navState.prefillDetection;
      
      const colorName = primary.colorLabel || translateBaseColor(primary.color?.hex);
      const styleLabel = primary.style || "Thường Ngày";
      const formStyle = mapAiStyleToFormStyle(primary.style);
      const catName = primary.category || translateCategory(primary.class_name);

      setAiResult({
        categoryName: catName,
        confidence: primary.confidence,
        color: colorName,
        style: styleLabel,
      });

      const detection = {
        classKey: primary.class_name,
        categoryName: catName,
        color: colorName,
        formStyle,
        confidence: primary.confidence,
      };
      
      pendingAiRef.current = detection;
      void applyAiToForm(detection, categories);
      
      if (navState.previewImage) {
        setPreview(navState.previewImage);
      }
      if (navState.sourceFile) {
        setSelectedFile(navState.sourceFile);
      }
    }
  }, [navState, categories, form.confidenceScore, applyAiToForm]);`;

const newEffect = `  useEffect(() => {
    if (navState?.prefillDetection && !form.confidenceScore && categories.length > 0) {
      const primary = navState.prefillDetection;
      
      let colorName = primary.colorLabel || "Xám";
      // fix color cases manually if needed to match the array exactly
      if (colorName === "Xám") colorName = "Xám";
      else if (colorName.toLowerCase() === "trắng") colorName = "Trắng";
      else if (colorName.toLowerCase() === "đen") colorName = "Đen";
      
      const styleLabel = primary.style || "Thường Ngày";
      
      let formStyle = "Thường Ngày";
      const lowerStyle = styleLabel.toLowerCase();
      if (lowerStyle.includes("công sở")) formStyle = "Công Sở";
      else if (lowerStyle.includes("trang trọng")) formStyle = "Trang Trọng";
      else if (lowerStyle.includes("tiệc")) formStyle = "Tiệc Tùng";
      else if (lowerStyle.includes("thể thao")) formStyle = "Thể Thao";
      else if (lowerStyle.includes("thanh lịch")) formStyle = "Thanh Lịch";
      
      const catName = primary.category || "Áo";
      const classKey = primary.classKey || "short_sleeve_top";

      // Fix confidence scaling: prefillDetection.confidence is e.g. 71.3, so divide by 100 for confidenceScore which expects 0.713
      const confRatio = (primary.confidence || 0) / 100;

      setAiResult({
        categoryName: catName,
        confidence: confRatio,
        color: colorName,
        style: styleLabel,
      });

      const detection = {
        classKey: classKey,
        categoryName: catName,
        color: colorName,
        formStyle,
        confidence: confRatio,
      };
      
      pendingAiRef.current = detection;
      void applyAiToForm(detection, categories);
      
      if (navState.previewImage) {
        setPreview(navState.previewImage);
      }
      if (navState.sourceFile) {
        setSelectedFile(navState.sourceFile);
      }
    }
  }, [navState, categories, form.confidenceScore, applyAiToForm]);`;

if (content.includes('navState?.prefillDetection')) {
  content = content.replace(oldEffect, newEffect);
}

fs.writeFileSync('d:\\MSS\\MSS301_Wardrobe-FE\\src\\pages\\user\\wardrobe\\AddClothing.tsx', content, 'utf8');
console.log("Fixed!");
