// Execute the combined SQL file using Supabase REST API
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

async function executeCombinedSQL() {
  try {
    console.log('🚀 Executing combined SQL script...\n');
    
    // Read the combined SQL file
    const sqlFilePath = path.join(__dirname, '..', 'database-plans', 'all-scripts-combined.sql');
    const sqlContent = fs.readFileSync(sqlFilePath, 'utf8');
    
    console.log('📄 SQL file loaded successfully');
    console.log(`📊 File size: ${sqlContent.length} characters`);
    
    // Split into smaller chunks to avoid request size limits
    const statements = sqlContent
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--') && !stmt.startsWith('/*'));
    
    console.log(`📝 Found ${statements.length} SQL statements to execute\n`);
    
    let successCount = 0;
    let errorCount = 0;
    
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      
      if (statement.trim().length === 0) continue;
      
      try {
        console.log(`⚡ Executing statement ${i + 1}/${statements.length}...`);
        
        // Use the Supabase REST API to execute SQL
        const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${supabaseKey}`,
            'apikey': supabaseKey,
            'Prefer': 'return=minimal'
          },
          body: JSON.stringify({
            query: statement
          })
        });
        
        if (response.ok) {
          console.log(`✅ Statement ${i + 1} executed successfully`);
          successCount++;
        } else {
          const errorText = await response.text();
          console.log(`⚠️  Statement ${i + 1} failed: ${response.status} ${response.statusText}`);
          console.log(`   Error: ${errorText.substring(0, 200)}...`);
          errorCount++;
        }
        
        // Small delay to avoid overwhelming the API
        await new Promise(resolve => setTimeout(resolve, 100));
        
      } catch (error) {
        console.log(`❌ Statement ${i + 1} error: ${error.message}`);
        errorCount++;
      }
    }
    
    console.log(`\n📈 Execution Summary:`);
    console.log(`   ✅ Successful: ${successCount}`);
    console.log(`   ❌ Failed: ${errorCount}`);
    console.log(`   📁 Total: ${statements.length}`);
    
    if (errorCount === 0) {
      console.log('\n🎉 All SQL statements executed successfully!');
    } else {
      console.log('\n⚠️  Some statements failed. This might be due to:');
      console.log('   - Missing exec function in database');
      console.log('   - Permission issues');
      console.log('   - SQL syntax errors');
      console.log('\n💡 Recommendation: Run the SQL manually in Supabase dashboard:');
      console.log(`   📁 File: database-plans/all-scripts-combined.sql`);
    }
    
  } catch (error) {
    console.error('❌ Error executing SQL:', error.message);
  }
}

async function testConnection() {
  try {
    console.log('🔍 Testing Supabase connection...');
    
    const response = await fetch(`${supabaseUrl}/rest/v1/`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${supabaseKey}`,
        'apikey': supabaseKey
      }
    });
    
    if (response.ok) {
      console.log('✅ Supabase connection successful');
      return true;
    } else {
      console.log('❌ Supabase connection failed');
      console.log(`   Status: ${response.status} ${response.statusText}`);
      return false;
    }
  } catch (error) {
    console.log('❌ Connection error:', error.message);
    return false;
  }
}

async function main() {
  console.log('📝 SQL Execution Script');
  console.log('====================\n');
  
  const isConnected = await testConnection();
  
  if (!isConnected) {
    console.log('\n❌ Cannot proceed without database connection');
    process.exit(1);
  }
  
  await executeCombinedSQL();
  
  console.log('\n📋 Alternative Manual Execution:');
  console.log('1. Open Supabase Dashboard');
  console.log('2. Go to SQL Editor');
  console.log('3. Copy and paste contents of database-plans/all-scripts-combined.sql');
  console.log('4. Click "Run" to execute');
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { executeCombinedSQL, testConnection };
