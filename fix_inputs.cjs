const fs = require('fs');
let content = fs.readFileSync('d:\\MSS\\MSS301_Wardrobe-FE\\src\\pages\\user\\wardrobe\\AddClothing.tsx', 'utf8');

// 1. Remove colors and styles
content = content.replace(/const colors = \[.*?\];\n/g, '');
content = content.replace(/const styles = \[.*?\];\n/g, '');

// 2. Change the dropdowns to text inputs
// I'll find the <select> for dominantColor and style and replace them
const selectColorRegex = /<select\s+value=\{form\.dominantColor\}[\s\S]*?<\/select>/;
const inputColor = `<input
                    type="text"
                    value={form.dominantColor}
                    onChange={(e) => setForm({ ...form, dominantColor: e.target.value })}
                    placeholder="Vd: Xám"
                    style={inputStyle}
                  />`;
content = content.replace(selectColorRegex, inputColor);

const selectStyleRegex = /<select\s+value=\{form\.style\}[\s\S]*?<\/select>/;
const inputStyleStr = `<input
                    type="text"
                    value={form.style}
                    onChange={(e) => setForm({ ...form, style: e.target.value })}
                    placeholder="Vd: Thường ngày"
                    style={inputStyle}
                  />`;
content = content.replace(selectStyleRegex, inputStyleStr);

// 3. Make sure the effect doesn't override with exact mapped value if we don't need it.
// Actually, since they are inputs now, any text is fine. The existing effect logic just sets `aiResult.style` and `formStyle` which gets populated, so it's perfectly fine!

fs.writeFileSync('d:\\MSS\\MSS301_Wardrobe-FE\\src\\pages\\user\\wardrobe\\AddClothing.tsx', content, 'utf8');
console.log("Replaced selects with inputs!");
