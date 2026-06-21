const fs = require('fs');
const file = 'd:\\MSS\\MSS301_Wardrobe-FE\\src\\pages\\user\\wardrobe\\AddClothing.tsx';
let c = fs.readFileSync(file, 'utf8');

// 1. Fix import: add wardrobeApi + storageService + useLocation
c = c.replace(
  'import { useState, useRef, useEffect, useCallback } from "react";\r\nimport { useNavigate, useSearchParams } from "react-router";',
  'import { useState, useRef, useEffect, useCallback } from "react";\r\nimport { useNavigate, useSearchParams, useLocation } from "react-router";'
);

c = c.replace(
  '  wardrobeZoneApi,\r\n} from "../../../services/wardrobeService";',
  '  wardrobeZoneApi,\r\n  wardrobeApi,\r\n} from "../../../services/wardrobeService";'
);

c = c.replace(
  'import { aiService } from "../../../services/aiService";',
  'import { aiService } from "../../../services/aiService";\r\nimport { storageService } from "../../../services/storageService";'
);

// 2. Add wardrobes state after categories
c = c.replace(
  '  // Real data from API\r\n  const [categories, setCategories] = useState<Category[]>([]);\r\n  const [zones, setZones] = useState<WardrobeZone[]>([]);',
  '  // Real data from API\r\n  const [categories, setCategories] = useState<Category[]>([]);\r\n  const [wardrobes, setWardrobes] = useState<any[]>([]);\r\n  const [zones, setZones] = useState<WardrobeZone[]>([]);'
);

// 3. Add wardrobeId to form state
c = c.replace(
  '    itemName: "",\r\n    categoryId: "",\r\n    zoneId: initialZoneId || "",',
  '    itemName: "",\r\n    categoryId: "",\r\n    wardrobeId: "",\r\n    zoneId: initialZoneId || "",'
);

// 4. Add useLocation and navState
c = c.replace(
  'export function AddClothing() {\r\n  const navigate = useNavigate();\r\n  const [searchParams] = useSearchParams();\r\n  const initialZoneId = searchParams.get("zoneId");',
  'export function AddClothing() {\r\n  const navigate = useNavigate();\r\n  const location = useLocation();\r\n  const [searchParams] = useSearchParams();\r\n  const initialZoneId = searchParams.get("zoneId");\r\n  const navState = location.state as {\r\n    prefillDetection?: any;\r\n    previewImage?: string;\r\n    sourceFile?: File;\r\n  } | null;'
);

// 5. Fix fetchMeta to fetch wardrobes too, add type annotation for z
c = c.replace(
  "        const [cats, zns] = await Promise.all([\r\n          categoryApi.getAll(),\r\n          wardrobeZoneApi.getAll(), // Fetch all zones to match ID with name, but dropdown will be disabled\r\n        ]);",
  "        const [cats, zns, wrdbs] = await Promise.all([\r\n          categoryApi.getAll(),\r\n          wardrobeZoneApi.getAll(),\r\n          wardrobeApi.getAll(),\r\n        ]);"
);

c = c.replace(
  '        setCategories(syncedCategories);\r\n        setZones(zns);',
  '        setCategories(syncedCategories);\r\n        setZones(zns);\r\n        setWardrobes(wrdbs);\r\n        // If coming from a zone, auto-select its wardrobe\r\n        if (initialZoneId) {\r\n          const foundZone = zns.find((z: WardrobeZone) => z.zoneId === initialZoneId);\r\n          if (foundZone) setForm(prev => ({ ...prev, wardrobeId: (foundZone as any).wardrobeId || "" }));\r\n        }'
);

// 6. Add navState effect AFTER the fetchMeta useEffect
const navStateEffect = `\r\n  // Apply AI data from navigation state\r\n  useEffect(() => {\r\n    if (!navState?.prefillDetection) return;\r\n    if (navState.previewImage) setPreview(navState.previewImage);\r\n    if (navState.sourceFile) setSelectedFile(navState.sourceFile);\r\n    const primary = navState.prefillDetection;\r\n    const colorLabel = primary.colorLabel || primary.color?.name || "";\r\n    const styleLabel = primary.style || "";\r\n    const formStyle = mapAiStyleToFormStyle(styleLabel);\r\n    const catName = primary.category || "";\r\n    const confValue = typeof primary.confidence === "number"\r\n      ? (primary.confidence > 1 ? primary.confidence / 100 : primary.confidence)\r\n      : 0;\r\n    const result = { categoryName: catName, confidence: confValue, color: colorLabel, style: styleLabel };\r\n    setAiResult(result);\r\n    const detection = { classKey: primary.class_name || "", categoryName: catName, color: colorLabel, formStyle, confidence: confValue };\r\n    pendingAiRef.current = detection;\r\n    setForm(f => ({ ...f, dominantColor: colorLabel, style: formStyle, confidenceScore: confValue }));\r\n  // eslint-disable-next-line react-hooks/exhaustive-deps\r\n  }, [navState]);\r\n`;

c = c.replace(
  '  useEffect(() => {\r\n    if (pendingAiRef.current) {\r\n      void applyAiToForm(pendingAiRef.current, categories);\r\n    }\r\n  }, [categories, applyAiToForm]);',
  navStateEffect + '  useEffect(() => {\r\n    if (pendingAiRef.current) {\r\n      void applyAiToForm(pendingAiRef.current, categories);\r\n    }\r\n  }, [categories, applyAiToForm]);'
);

// 7. Fix imageId in submit
c = c.replace(
  '      confidenceScore: form.confidenceScore,\r\n        // imageId would come from storage-service upload in a full flow\r\n      });',
  '      confidenceScore: form.confidenceScore,\r\n        imageId: undefined as string | undefined,\r\n      });'
);

// 8. Replace the entire handleSubmit block to add image upload
const oldSubmit = `  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.itemName.trim()) {
      toast.error("Vui lòng nhập tên vật phẩm");
      return;
    }
    setSubmitting(true);
    try {
      await clothingItemApi.create({
        itemName: form.itemName,
        categoryId: form.categoryId || undefined,
        zoneId: form.zoneId || undefined,
        dominantColor: form.dominantColor || undefined,
        style: form.style || undefined,
        confidenceScore: form.confidenceScore,
        imageId: undefined as string | undefined,
      });`;

const newSubmit = `  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.itemName.trim()) {
      toast.error("Vui lòng nhập tên vật phẩm");
      return;
    }
    setSubmitting(true);
    try {
      let finalImageId: string | undefined = undefined;
      if (selectedFile) {
        try { const r = await storageService.upload(selectedFile); finalImageId = r.id; } catch(e) { console.error(e); }
      } else if (preview?.startsWith("blob:")) {
        try {
          const res = await fetch(preview);
          const blob = await res.blob();
          const f = new File([blob], "ai-image.jpg", { type: blob.type });
          const r = await storageService.upload(f);
          finalImageId = r.id;
        } catch(e) { console.error(e); }
      }
      await clothingItemApi.create({
        itemName: form.itemName,
        categoryId: form.categoryId || undefined,
        zoneId: form.zoneId || undefined,
        dominantColor: form.dominantColor || undefined,
        style: form.style || undefined,
        confidenceScore: form.confidenceScore,
        imageId: finalImageId,
      });`;

if (c.includes(oldSubmit.replace(/\n/g, '\r\n'))) {
  c = c.replace(oldSubmit.replace(/\n/g, '\r\n'), newSubmit.replace(/\n/g, '\r\n'));
  console.log("Fixed handleSubmit with image upload");
} else if (c.includes(oldSubmit)) {
  c = c.replace(oldSubmit, newSubmit);
  console.log("Fixed handleSubmit (LF) with image upload");
} else {
  console.log("WARNING: handleSubmit block not found, skipping image upload fix");
}

fs.writeFileSync(file, c, 'utf8');
console.log("All done!");
