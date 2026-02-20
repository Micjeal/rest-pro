// Node.js script to generate password hash and update admin user
const bcrypt = require('bcryptjs');

async function updatePassword() {
  try {
    // Generate hash for admin123
    const passwordHash = await bcrypt.hash('admin123', 10);
    console.log('Password hash for admin123:', passwordHash);
    
    // SQL to update the user
    const updateSQL = `
      UPDATE users 
      SET password_hash = '${passwordHash}' 
      WHERE email = 'micknick168@gmail.com';
    `;
    
    console.log('\nRun this SQL in Supabase editor:');
    console.log(updateSQL);
    
    // Also show verification SQL
    console.log('\nTo verify the user was created:');
    console.log("SELECT id, email, name, role FROM users WHERE email = 'micknick168@gmail.com';");
    
  } catch (error) {
    console.error('Error:', error);
  }
}

updatePassword();
