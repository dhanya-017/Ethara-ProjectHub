const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

async function seedDatabase() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ethara');
    console.log('MongoDB connected successfully');

    // Clear existing users
    await User.deleteMany({});
    console.log('Cleared existing users');

    // Create admin user
    const adminUser = await User.create({
      username: 'admin',
      email: 'admin@projecthub.com',
      password: 'Admin123',
      full_name: 'Admin User',
      role: 'admin'
    });
    console.log('Admin user created:', adminUser.email);

    // Create member user
    const memberUser = await User.create({
      username: 'member',
      email: 'member@projecthub.com',
      password: 'Member123',
      full_name: 'Member User',
      role: 'member'
    });
    console.log('Member user created:', memberUser.email);

    console.log('\n✅ Database seeded successfully!');
    console.log('\nLogin Credentials:');
    console.log('-------------------');
    console.log('Admin:');
    console.log('  Email: admin@projecthub.com');
    console.log('  Password: Admin123');
    console.log('\nMember:');
    console.log('  Email: member@projecthub.com');
    console.log('  Password: Member123');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

seedDatabase();
