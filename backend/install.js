const { exec } = require('child_process');
const fs = require('fs').promises;
const path = require('path');

async function installDependencies() {
  console.log('🚀 Installing Price Vision Backend Dependencies...\n');
  
  try {
    // Install npm dependencies
    console.log('📦 Installing Node.js packages...');
    await runCommand('npm install');
    
    // Install Playwright browsers
    console.log('🌐 Installing Playwright browsers...');
    await runCommand('npx playwright install chromium');
    
    // Create necessary directories
    console.log('📁 Creating directories...');
    await createDirectories();
    
    // Copy environment file
    console.log('🔧 Setting up environment...');
    await setupEnvironment();
    
    console.log('\n✅ Installation completed successfully!');
    console.log('\n📋 Next steps:');
    console.log('1. Update .env file with your API keys');
    console.log('2. Run: node server.js');
    console.log('3. Visit: http://localhost:5000/api/health');
    
  } catch (error) {
    console.error('❌ Installation failed:', error.message);
    process.exit(1);
  }
}

function runCommand(command) {
  return new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error) {
        reject(error);
        return;
      }
      
      if (stdout) console.log(stdout);
      if (stderr) console.log(stderr);
      
      resolve();
    });
  });
}

async function createDirectories() {
  const directories = [
    'data',
    'temp', 
    'logs',
    'uploads'
  ];
  
  for (const dir of directories) {
    try {
      await fs.mkdir(dir, { recursive: true });
      console.log(`  ✓ Created ${dir}/`);
    } catch (error) {
      console.warn(`  ⚠ Failed to create ${dir}/: ${error.message}`);
    }
  }
}

async function setupEnvironment() {
  try {
    // Check if .env already exists
    await fs.access('.env');
    console.log('  ✓ .env file already exists');
  } catch (error) {
    // Create .env from template
    const envTemplate = `# Price Vision Backend Configuration
# Copy this file to .env and update the values

# Server
PORT=5000
NODE_ENV=development

# Database (Optional - for persistent storage)
MONGODB_URI=mongodb://localhost:27017/price_vision
REDIS_URL=redis://localhost:6379

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Scraping Configuration
MAX_CONCURRENT_BROWSERS=3
SCRAPING_TIMEOUT=30000
REQUEST_DELAY_MIN=1000
REQUEST_DELAY_MAX=3000

# AI Services (Update these with your API keys)
GEMINI_API_KEY=your_gemini_api_key_here
OPENAI_API_KEY=your_openai_api_key_here

# Notifications (Optional)
TELEGRAM_BOT_TOKEN=your_telegram_bot_token
EMAIL_SERVICE_KEY=your_email_service_key

# Security
JWT_SECRET=your_super_secret_jwt_key_here
ENCRYPTION_KEY=your_encryption_key_here

# Logging
LOG_LEVEL=info
LOG_FILE=logs/app.log
`;
    
    await fs.writeFile('.env', envTemplate);
    console.log('  ✓ Created .env file from template');
  }
}

// Create a simple test script
async function createTestScript() {
  const testScript = `const axios = require('axios');

async function testBackend() {
  try {
    console.log('🧪 Testing Price Vision Backend...');
    
    // Test health endpoint
    const healthResponse = await axios.get('http://localhost:5000/api/health');
    console.log('✅ Health check passed:', healthResponse.data.status);
    
    // Test sites endpoint
    const sitesResponse = await axios.get('http://localhost:5000/api/sites');
    console.log('✅ Sites endpoint working:', sitesResponse.data.sites.length, 'sites available');
    
    // Test search endpoint
    const searchResponse = await axios.post('http://localhost:5000/api/search/text', {
      query: 'iphone',
      limit: 5
    });
    console.log('✅ Search endpoint working:', searchResponse.data.count, 'results found');
    
    console.log('\\n🎉 All tests passed! Backend is working correctly.');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('💡 Make sure the backend server is running: node server.js');
    }
  }
}

// Run tests if this script is executed directly
if (require.main === module) {
  testBackend();
}

module.exports = { testBackend };
`;
  
  await fs.writeFile('test.js', testScript);
  console.log('  ✓ Created test.js script');
}

// Create startup script
async function createStartupScript() {
  const startScript = `@echo off
echo 🚀 Starting Price Vision Backend...

echo 📦 Checking dependencies...
call npm list > nul 2>&1
if errorlevel 1 (
    echo ❌ Dependencies not installed. Run: node install.js
    pause
    exit /b 1
)

echo 🌐 Starting server...
node server.js

pause
`;
  
  await fs.writeFile('start.bat', startScript);
  console.log('  ✓ Created start.bat script');
}

// Run installation if this script is executed directly
if (require.main === module) {
  installDependencies()
    .then(() => createTestScript())
    .then(() => createStartupScript())
    .catch(console.error);
}

module.exports = { installDependencies, createTestScript, createStartupScript };
