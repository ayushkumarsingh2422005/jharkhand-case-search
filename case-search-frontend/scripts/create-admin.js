require('dotenv').config({ path: '.env.local' });
const { connectDB, disconnectDB, User } = require('../models');

async function createDefaultAdmin() {
  try {
    // Connect to MongoDB
    await connectDB();
    console.log('✅ Connected to MongoDB');

    // Check if any users exist
    const existingUsers = await User.countDocuments();
    
    if (existingUsers > 0) {
      console.log(`⚠️  Users already exist (${existingUsers} users found). Skipping default admin creation.`);
      console.log('   If you want to create a new admin, use the admin panel after logging in.');
      await disconnectDB();
      return;
    }

    // Default admin credentials (can be overridden with environment variables)
    const defaultEmail = process.env.DEFAULT_ADMIN_EMAIL || 'admin@example.com';
    const defaultPassword = process.env.DEFAULT_ADMIN_PASSWORD || 'admin123';
    const defaultRole = 'SuperAdmin';

    // Check if this email already exists
    const existingUser = await User.findOne({ email: defaultEmail.toLowerCase() });
    if (existingUser) {
      console.log(`⚠️  User with email ${defaultEmail} already exists.`);
      await disconnectDB();
      return;
    }

    // Create admin user (password will be hashed by pre-save hook)
    const admin = new User({
      email: defaultEmail.toLowerCase(),
      password: defaultPassword, // Will be hashed by pre-save hook
      role: defaultRole,
      createdBy: 'System',
    });

    await admin.save();
    console.log('✅ Default SuperAdmin created successfully!');
    console.log('');
    console.log('📧 Email:', defaultEmail);
    console.log('🔑 Password:', defaultPassword);
    console.log('👤 Role: SuperAdmin');
    console.log('');
    console.log('⚠️  IMPORTANT: Please change the default password after first login!');
    console.log('   You can do this via the Admin Panel > User Management.');

    await disconnectDB();
    console.log('✅ Disconnected from MongoDB');
  } catch (error) {
    console.error('❌ Error creating default admin:', error.message);
    if (error.code === 11000) {
      console.error('   Email already exists in database.');
    }
    process.exit(1);
  }
}

// Run the script
createDefaultAdmin();

