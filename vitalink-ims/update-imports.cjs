const fs = require('fs');
const path = require('path');

function walk(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    const dirPath = path.join(dir, f);
    const isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walk(dirPath, callback) : callback(path.join(dir, f));
  });
}

walk('src', (filePath) => {
  if (filePath.endsWith('.tsx') || filePath.endsWith('.ts')) {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;

    // Replace ../api/http-client with ../services
    // Replace ./api/http-client with ./services
    if (content.includes('api/http-client')) {
      content = content.replace(/from ["'](?:\.\.\/|\.\/)?api\/http-client["']/g, 'from "../services"');
      // For paths that might need explicit resolution (e.g. from store/index.ts)
      
      const apiToServiceMap = {
        'AuthAPI': 'AuthService',
        'InsuredsAPI': 'InsuredsService',
        'ExportAPI': 'ExportService'
      };

      for (const [api, service] of Object.entries(apiToServiceMap)) {
        if (content.includes(api)) {
          const regex = new RegExp(`\\b${api}\\b`, 'g');
          content = content.replace(regex, service);
        }
      }
      
      modified = true;
    }

    if (modified) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`Updated ${filePath}`);
    }
  }
});
