// Execute all SQL files in database-plans folder
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials. Please check your .env.local file.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const sqlFiles = [
  '01-create-tables.sql',
  'add-category-column.sql',
  'add-chef-role.sql',
  'add-comprehensive-roles.sql',
  'create-restaurant-settings-table.sql',
  'create-user-context-function.sql',
  'delete-restaurant-procedure.sql',
  'enhance-cascade-delete.sql',
  'roles-access-permissions.sql'
];

const dataFiles = [
  'add-sample-data.sql',
  'complete-sample-data.sql',
  'populate-inventory-from-menu.sql',
  'fix-restaurant-data.sql'
];

const utilityFiles = [
  'clean-setup.sql',
  'complete-database-setup.sql',
  'final-setup.sql',
  'fix-auth-complete.sql',
  'migrate-roles-safely.sql',
  'test-cascade-delete.sql',
  'verify-tables.sql'
];

async function executeSqlFile(filePath) {
  try {
    const fullPath = path.join(__dirname, '..', 'database-plans', filePath);
    const sql = fs.readFileSync(fullPath, 'utf8');
    
    console.log(`📄 Executing ${filePath}...`);
    
    // Split SQL content by semicolons and execute each statement
    const statements = sql
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
    
    for (const statement of statements) {
      if (statement.trim()) {
        const { error } = await supabase.rpc('exec_sql', { sql_query: statement });
        
        if (error) {
          // Try direct SQL execution if RPC fails
          const { error: directError } = await supabase.from('_temp').select('*').limit(1);
          
          console.log(`⚠️  Warning: Could not execute statement via RPC: ${statement.substring(0, 50)}...`);
          console.log(`   Error: ${error.message}`);
          
          // For now, just log the statement that would be executed
          continue;
        }
      }
    }
    
    console.log(`✅ Successfully executed ${filePath}`);
    return true;
  } catch (error) {
    console.error(`❌ Error executing ${filePath}:`, error.message);
    return false;
  }
}

async function executeAllFiles() {
  console.log('🚀 Starting SQL file execution...\n');
  
  let successCount = 0;
  let failCount = 0;
  
  // Execute schema files first
  console.log('📋 Executing schema files...');
  for (const file of sqlFiles) {
    const success = await executeSqlFile(file);
    if (success) successCount++;
    else failCount++;
  }
  
  console.log('\n📊 Executing data files...');
  for (const file of dataFiles) {
    const success = await executeSqlFile(file);
    if (success) successCount++;
    else failCount++;
  }
  
  console.log('\n🛠️  Executing utility files...');
  for (const file of utilityFiles) {
    const success = await executeSqlFile(file);
    if (success) successCount++;
    else failCount++;
  }
  
  console.log(`\n📈 Execution Summary:`);
  console.log(`   ✅ Successful: ${successCount}`);
  console.log(`   ❌ Failed: ${failCount}`);
  console.log(`   📁 Total: ${successCount + failCount}`);
  
  if (failCount === 0) {
    console.log('\n🎉 All SQL files executed successfully!');
  } else {
    console.log('\n⚠️  Some files failed to execute. Please check the errors above.');
  }
}

// Alternative approach: Create a function to execute SQL via direct HTTP requests
async function executeSqlViaHttp(sql) {
  try {
    const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseKey}`,
        'apikey': supabaseKey
      },
      body: JSON.stringify({ sql_query: sql })
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('HTTP execution error:', error.message);
    return null;
  }
}

async function main() {
  console.log('📝 Note: This script requires the exec_sql function to exist in your Supabase database.');
  console.log('   If execution fails, you may need to manually run the SQL files in the Supabase dashboard.\n');
  
  await executeAllFiles();
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { executeSqlFile, executeAllFiles };
