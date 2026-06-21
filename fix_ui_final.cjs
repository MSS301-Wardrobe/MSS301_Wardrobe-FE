const fs = require("fs");
const file = "d:\\MSS\\MSS301_Wardrobe-FE\\src\\pages\\user\\wardrobe\\AddClothing.tsx";
let c = fs.readFileSync(file, "utf8");

// Find the zone section boundary
const zoneStart = c.indexOf("{/* Zone */}");
if (zoneStart === -1) {
  console.log("ERROR: Cannot find {/* Zone */}");
  process.exit(1);
}
const zoneEnd = c.indexOf("</select>\r\n                </div>\r\n\r\n                {/* Color", zoneStart);
const zoneEndActual = c.indexOf("</div>", zoneEnd) + "</div>".length;

const oldZone = c.slice(zoneStart, zoneEndActual + 1);
console.log("Found zone block, length:", oldZone.length);

const newZoneBlock = `{/* Wardrobe */}
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

                {/* Zone */}
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

c = c.slice(0, zoneStart) + newZoneBlock + c.slice(zoneEndActual + 1);

// Now fix Color + Style: find the color/style dropdown section and replace with readonly inputs
const colorStart = c.indexOf("{/* Color + Style */}");
if (colorStart === -1) {
  console.log("ERROR: Cannot find Color + Style section");
  process.exit(1);
}
const colorSectionEnd = c.indexOf("</div>\r\n\r\n              {/* Confidence Score */}", colorStart);
const colorSectionEndActual = colorSectionEnd + "</div>".length;

const newColorStyle = `{/* Color + Style */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                <div>
                  <label style={{ fontSize: "0.82rem", fontWeight: 600, color: "#374151", display: "block", marginBottom: 6 }}>M\u00e0u Ch\u1ee7 \u0110\u1ea1o</label>
                  <input
                    type="text"
                    value={form.dominantColor}
                    onChange={(e) => setForm({ ...form, dominantColor: e.target.value })}
                    placeholder="Vd: X\u00e1m"
                    style={{ ...inputStyle, background: form.dominantColor ? "#F0FDF4" : "white" }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: "0.82rem", fontWeight: 600, color: "#374151", display: "block", marginBottom: 6 }}>Phong C\u00e1ch</label>
                  <input
                    type="text"
                    value={form.style}
                    onChange={(e) => setForm({ ...form, style: e.target.value })}
                    placeholder="Vd: Th\u01b0\u1eddng ng\u00e0y"
                    style={{ ...inputStyle, background: form.style ? "#F0FDF4" : "white" }}
                  />
                </div>
              </div>`;

const oldColorSection = c.slice(colorStart, colorSectionEndActual + 1);
c = c.slice(0, colorStart) + newColorStyle + c.slice(colorSectionEndActual + 1);

fs.writeFileSync(file, c, "utf8");
console.log("Fixed! Wardrobe dropdown + text inputs for color/style added");
