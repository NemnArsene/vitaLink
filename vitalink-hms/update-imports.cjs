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

    // Replace @/api/client and @/api/http-client with @/services
    if (content.includes('@/api/client') || content.includes('@/api/http-client')) {
      content = content.replace(/from ["']@\/api\/(client|http-client)["']/g, 'from "@/services"');
      
      // Update any "API" suffix to "Service" to match the new exports
      // e.g., PatientsAPI -> PatientsService
      const apiToServiceMap = {
        'PatientsAPI': 'PatientsService',
        'MedicalRecordsAPI': 'MedicalRecordsService',
        'ConsultationsAPI': 'ConsultationsService',
        'ActsAPI': 'ActsService',
        'InvoicesAPI': 'BillingService',
        'RefundsAPI': 'RefundsService',
        'UsersAPI': 'UsersService',
        'InsuranceAPI': 'InsuranceService',
        'SettingsAPI': 'SettingsService',
        'DashboardAPI': 'DashboardService',
        'PharmacyAPI': 'PharmacyService',
        'AuditAPI': 'AuditService',
        'GatewayAPI': 'GatewayService',
        'AuthAPI': 'AuthService',
        'PersonnelAPI': 'PersonnelService',
        'ReportsAPI': 'ReportsService',
        'ImportExportAPI': 'ImportExportService',
        'WrittenReportsAPI': 'WrittenReportsService',
        'MessagesAPI': 'MessagingService',
        'httpClient': 'coreHttpClient'
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
