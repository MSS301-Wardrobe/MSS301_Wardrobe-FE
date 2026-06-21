const fs = require('fs');
let content = fs.readFileSync('d:\\MSS\\MSS\\storage-service\\src\\main\\java\\wardrobe\\project\\com\\storageservice\\controller\\StorageController.java', 'utf8');

// 1. Remove @CrossOrigin line
const lines = content.split('\n');
const filteredLines = lines.filter(line => !line.includes('@CrossOrigin'));
content = filteredLines.join('\n');

// 2. Add /files/{id} endpoint
const newEndpoint = `
    // GET /api/v1/storage/files/{id} - Redirects to presigned URL
    @GetMapping("/files/{id}")
    public ResponseEntity<Void> redirectToFile(@PathVariable("id") UUID id) {
        log.info("Redirecting to image URL for ID: {}", id);
        try {
            String url = storageService.getImageUrl(id);
            return ResponseEntity.status(HttpStatus.FOUND)
                    .header("Location", url)
                    .build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
`;

content = content.replace('private ImageResponse mapToResponse', newEndpoint + '\n    private ImageResponse mapToResponse');

fs.writeFileSync('d:\\MSS\\MSS\\storage-service\\src\\main\\java\\wardrobe\\project\\com\\storageservice\\controller\\StorageController.java', content, 'utf8');
console.log("Fixed CORS and added /files endpoint to StorageController");
