const fs = require('fs');
let content = fs.readFileSync('d:\\MSS\\MSS301_Wardrobe-FE\\src\\pages\\user\\wardrobe\\AddClothing.tsx', 'utf8');

content = content.replace(
  'import { useNavigate, useSearchParams } from "react-router";',
  'import { useNavigate, useSearchParams, useLocation } from "react-router";'
);

content = content.replace(
  'wardrobeZoneApi,',
  'wardrobeZoneApi,\n  wardrobeApi,'
);

content = content.replace(
  'import type { Category, WardrobeZone } from "../../../types/wardrobe";',
  'import type { Category, WardrobeZone, Wardrobe } from "../../../types/wardrobe";'
);

content = content.replace(
  'export function AddClothing() {',
  'export function AddClothing() {\n  const location = useLocation();\n  const navState = location.state as any;'
);

content = content.replace(
  'const [categories, setCategories] = useState<Category[]>([]);',
  'const [categories, setCategories] = useState<Category[]>([]);\n  const [wardrobes, setWardrobes] = useState<Wardrobe[]>([]);'
);

content = content.replace(
  'categoryId: "",\n    zoneId: initialZoneId || "",',
  'categoryId: "",\n    wardrobeId: "",\n    zoneId: initialZoneId || "",'
);

content = content.replace(
  'const [cats, zns] = await Promise.all([\n          categoryApi.getAll(),\n          wardrobeZoneApi.getAll(), // Fetch all zones to match ID with name, but dropdown will be disabled\n        ]);',
  'const [cats, zns, wrdbs] = await Promise.all([\n          categoryApi.getAll(),\n          wardrobeZoneApi.getAll(),\n          wardrobeApi.getAll()\n        ]);'
);

content = content.replace(
  'setCategories(syncedCategories);\n        setZones(zns);',
  'setCategories(syncedCategories);\n        setZones(zns);\n        setWardrobes(wrdbs);\n\n        if (initialZoneId) {\n          const foundZone = zns.find(z => z.zoneId === initialZoneId);\n          if (foundZone) {\n            setForm(prev => ({ ...prev, wardrobeId: foundZone.wardrobeId }));\n          }\n        }'
);

const effectCode = `  useEffect(() => {
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
  }, [navState, categories, form.confidenceScore, applyAiToForm]);

`;

content = content.replace(
  '  const handleFile = async (file: File) => {',
  effectCode + '  const handleFile = async (file: File) => {'
);

const wardrobeDropdown = `              {/* Wardrobe */}
              <div>
                <label style={{ fontSize: "0.82rem", fontWeight: 600, color: "#374151", display: "block", marginBottom: 6 }}>Tủ Đồ</label>
                <select
                  value={form.wardrobeId}
                  onChange={(e) => setForm({ ...form, wardrobeId: e.target.value, zoneId: "" })}
                  style={{ ...inputStyle, cursor: initialZoneId ? "not-allowed" : "pointer", background: initialZoneId ? "#F8FAFC" : "white" }}
                  disabled={!!initialZoneId}
                >
                  <option value="">Chọn tủ đồ</option>
                  {wardrobes.map((w) => (
                    <option key={w.wardrobeId} value={w.wardrobeId}>{w.wardrobeName}</option>
                  ))}
                </select>
              </div>

              {/* Zone */}`;
content = content.replace('              {/* Zone */}', wardrobeDropdown);

content = content.replace(
  '{zones.map((z) => (',
  '{zones.filter(z => z.wardrobeId === form.wardrobeId).map((z) => ('
);

fs.writeFileSync('d:\\MSS\\MSS301_Wardrobe-FE\\src\\pages\\user\\wardrobe\\AddClothing.tsx', content, 'utf8');
console.log("Done!");
