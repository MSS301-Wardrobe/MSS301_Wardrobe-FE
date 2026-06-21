const fs = require('fs');
const filePath = 'd:\\MSS\\MSS\\storage-service\\src\\main\\java\\wardrobe\\project\\com\\storageservice\\controller\\StorageController.java';
let content = fs.readFileSync(filePath, 'utf8');

// Remove @CrossOrigin("*")
content = content.replace(/@CrossOrigin\("\*"\).*?\n/, '');

fs.writeFileSync(filePath, content, 'utf8');
console.log("Removed @CrossOrigin from StorageController");
