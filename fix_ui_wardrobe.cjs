const fs = require('fs');
const file = 'd:\\MSS\\MSS301_Wardrobe-FE\\src\\pages\\user\\wardrobe\\AddClothing.tsx';
let c = fs.readFileSync(file, 'utf8');

// Replace zone dropdown section: Add wardrobe dropdown BEFORE zone, and filter zones by selected wardrobe
const oldZoneSection = `              {/* Zone */}
                <div>
                  <label style={{ fontSize: "0.82rem", fontWeight: 600, color: "#374151", display: "block", marginBottom: 6 }}>Ng\u0103n K\u00e9o</label>
                  <select
                    value={form.zoneId}
                    onChange={(e) => setForm({ ...form, zoneId: e.target.value })}
                    style={{ ...inputStyle, cursor: initialZoneId ? "not-allowed" : "pointer", background: initialZoneId ? "#F8FAFC" : "white" }}
                    disabled={!!initialZoneId}
                  >
                    <option value="">Ch\u1ecdn ng\u0103n k\u00e9o</option>
                    {zones.map((z) => (
                      <option key={z.zoneId} value={z.zoneId}>{z.zoneName}</option>
                    ))}
                  </select>
                </div>`;

const newZoneSection = `              {/* Wardrobe */}
                <div>
                  <label style={{ fontSize: "0.82rem", fontWeight: 600, color: "#374151", display: "block", marginBottom: 6 }}>T\u1ee7 \u0110\u1ed3</label>
                  <select
                    value={form.wardrobeId}
                    onChange={(e) => setForm({ ...form, wardrobeId: e.target.value, zoneId: "" })}
                    style={{ ...inputStyle, cursor: initialZoneId ? "not-allowed" : "pointer", background: initialZoneId ? "#F8FAFC" : "white" }}
                    disabled={!!initialZoneId}
                  >
                    <option value="">Ch\u1ecdn t\u1ee7 \u0111\u1ed3</option>
                    {wardrobes.map((w: any) => (
                      <option key={w.wardrobeId} value={w.wardrobeId}>{w.wardrobeName}</option>
                    ))}
                  </select>
                </div>

                {/* Zone - filtered by selected wardrobe */}
                <div>
                  <label style={{ fontSize: "0.82rem", fontWeight: 600, color: "#374151", display: "block", marginBottom: 6 }}>Ng\u0103n K\u00e9o</label>
                  <select
                    value={form.zoneId}
                    onChange={(e) => setForm({ ...form, zoneId: e.target.value })}
                    style={{ ...inputStyle, cursor: (!form.wardrobeId && !initialZoneId) ? "not-allowed" : "pointer", background: (!form.wardrobeId && !initialZoneId) ? "#F8FAFC" : "white" }}
                    disabled={!form.wardrobeId && !initialZoneId}
                  >
                    <option value="">Ch\u1ecdn ng\u0103n k\u00e9o</option>
                    {zones
                      .filter((z: any) => !form.wardrobeId || z.wardrobeId === form.wardrobeId)
                      .map((z) => (
                        <option key={z.zoneId} value={z.zoneId}>{z.zoneName}</option>
                      ))}
                  </select>
                </div>`;

if (c.includes('Ch\u1ecdn ng\u0103n k\u00e9o')) {
  c = c.replace(oldZoneSection, newZoneSection);
  console.log("Added wardrobe dropdown UI + filtered zone dropdown");
} else {
  console.log("WARNING: Zone section not found in expected format, trying alternative...");
  // Try with the garbled encoding that's in the file
  const garbledZone = c.indexOf('Ng\\u0103n K');
  console.log("Garbled zone idx:", garbledZone);
}

fs.writeFileSync(file, c, 'utf8');
console.log("Done!");
