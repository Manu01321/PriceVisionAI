// Setup validation script for Price Vision AI Pro
// Run this to check if frontend and backend are properly configured

import 'dotenv/config';
import { configValidator } from './src/services/index.js';

async function main() {
  console.log('\n🚀 Price Vision AI Pro - Setup Validation');
  console.log('==========================================\n');

  try {
    // Print current configuration
    configValidator.printSummary();

    // Generate full validation report
    console.log('🔍 Running comprehensive validation...\n');
    const report = await configValidator.generateReport();

    // Display results
    console.log('📊 Validation Results:');
    console.log('=====================\n');

    // Frontend configuration
    console.log('🖥️  Frontend Configuration:');
    console.log(`   Status: ${report.frontend.validation.valid ? '✅ Valid' : '❌ Invalid'}`);

    if (report.frontend.validation.errors.length > 0) {
      console.log('   ❌ Errors:');
      report.frontend.validation.errors.forEach((error) => {
        console.log(`      • ${error}`);
      });
    }

    if (report.frontend.validation.warnings.length > 0) {
      console.log('   ⚠️  Warnings:');
      report.frontend.validation.warnings.forEach((warning) => {
        console.log(`      • ${warning}`);
      });
    }

    // Backend connectivity
    console.log('\n🌐 Backend Connectivity:');
    console.log(
      `   Status: ${report.backend.connectionTest.connected ? '✅ Connected' : '❌ Disconnected'}`
    );
    console.log(`   API URL: ${report.frontend.config.apiBaseUrl}`);

    if (report.backend.connectionTest.errors.length > 0) {
      console.log('   ❌ Connection Errors:');
      report.backend.connectionTest.errors.forEach((error) => {
        console.log(`      • ${error}`);
      });
    }

    // Endpoint status
    console.log('\n🔗 API Endpoints:');
    Object.entries(report.backend.connectionTest.endpoints).forEach(([endpoint, status]) => {
      const statusIcon = status.status === 'ok' ? '✅' : '❌';
      console.log(`   ${statusIcon} /${endpoint}`);
      if (status.status === 'failed') {
        console.log(`      Error: ${status.error}`);
      }
    });

    // Backend configuration
    if (report.backend.config) {
      console.log('\n⚙️  Backend Configuration:');
      console.log(`   Environment: ${report.backend.config.environment}`);
      console.log(`   Port: ${report.backend.config.server.port}`);
      console.log(`   Max Browsers: ${report.backend.config.server.maxBrowsers}`);
      console.log(`   Features:`);
      console.log(`      Gemini AI: ${report.backend.config.features.geminiAI ? '✅' : '❌'}`);
      console.log(`      OpenAI: ${report.backend.config.features.openAI ? '✅' : '❌'}`);
      console.log(`      Telegram: ${report.backend.config.features.telegram ? '✅' : '❌'}`);
      console.log(`      Email: ${report.backend.config.features.email ? '✅' : '❌'}`);
    }

    // Compatibility check
    if (report.compatibility) {
      console.log('\n🔄 Frontend-Backend Compatibility:');
      console.log(
        `   Status: ${report.compatibility.compatible ? '✅ Compatible' : '❌ Issues Found'}`
      );

      if (report.compatibility.mismatches && report.compatibility.mismatches.length > 0) {
        console.log('   ❌ Configuration Mismatches:');
        report.compatibility.mismatches.forEach((mismatch) => {
          console.log(
            `      • ${mismatch.setting}: Frontend(${mismatch.frontend}) vs Backend(${mismatch.backend})`
          );
          console.log(`        Issue: ${mismatch.issue}`);
        });
      }

      if (report.compatibility.recommendations && report.compatibility.recommendations.length > 0) {
        console.log('   💡 Recommendations:');
        report.compatibility.recommendations.forEach((rec) => {
          console.log(`      • ${rec.feature}: ${rec.message}`);
        });
      }
    }

    // Overall status
    console.log('\n🏁 Overall Status:');
    console.log('==================');

    const statusIcon =
      report.overall.status === 'success'
        ? '✅'
        : report.overall.status === 'warning'
          ? '⚠️'
          : '❌';
    console.log(`Status: ${statusIcon} ${report.overall.status.toUpperCase()}`);
    console.log(`Ready for Use: ${report.overall.readyForUse ? '✅ Yes' : '❌ No'}`);

    if (report.overall.criticalIssues.length > 0) {
      console.log('\n❌ Critical Issues to Fix:');
      report.overall.criticalIssues.forEach((issue) => {
        console.log(`   • ${issue}`);
      });
    }

    if (report.overall.recommendations.length > 0) {
      console.log('\n💡 Recommendations:');
      report.overall.recommendations.forEach((rec) => {
        console.log(`   • ${rec}`);
      });
    }

    // Next steps
    console.log('\n📋 Next Steps:');
    console.log('==============');

    if (report.overall.status === 'success') {
      console.log('🎉 All systems are GO!');
      console.log('   1. Your frontend and backend are properly configured');
      console.log('   2. All API endpoints are accessible');
      console.log('   3. You can start using the Price Vision system');
      console.log('\n🚀 To start the system:');
      console.log('   • Run: start-full-system.bat');
      console.log('   • Or manually: cd backend && node server.js (in one terminal)');
      console.log('   • Then: npm run dev (in another terminal)');
    } else if (report.overall.status === 'warning') {
      console.log('⚠️  System is functional but has some warnings');
      console.log('   1. Address the warnings above for optimal performance');
      console.log('   2. The system should still work with current configuration');
      console.log('\n🚀 To start the system:');
      console.log('   • Run: start-full-system.bat');
    } else {
      console.log('❌ System has critical issues that need to be fixed');
      console.log('   1. Fix the critical issues listed above');
      console.log('   2. Make sure backend server is running');
      console.log('   3. Verify .env configuration files');
      console.log('\n🔧 Common fixes:');
      console.log('   • Start backend: cd backend && node server.js');
      console.log('   • Check .env files in both root and backend directories');
      console.log('   • Verify VITE_API_BASE_URL=http://localhost:5000');
    }

    console.log('\n📞 Need Help?');
    console.log('=============');
    console.log('   • Check the logs in backend/logs/ directory');
    console.log('   • Verify all dependencies are installed');
    console.log('   • Ensure no other service is using ports 5000 or 5173');

    // Save report to file
    const reportPath = './validation-report.json';
    await import('fs')
      .then((fs) => {
        fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
        console.log(`\n💾 Detailed report saved to: ${reportPath}`);
      })
      .catch(() => {
        console.log('\n💾 Could not save detailed report to file');
      });
  } catch (error) {
    console.error('\n❌ Validation failed with error:', error);
    console.log('\nThis might indicate a serious configuration issue.');
    console.log('Please check:');
    console.log('1. All dependencies are installed (npm install)');
    console.log('2. Backend server is running');
    console.log('3. .env files are properly configured');
  }
}

// Run validation if this script is executed directly
if (process.argv[1] && import.meta.url.includes('validate-setup.js')) {
  main().catch(console.error);
}

export default main;
