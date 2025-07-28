require('dotenv').config();
const mongoose = require('mongoose');
const BookDesign = require('./models/BookDesign');
const User = require('./models/User');
const jwt = require('jsonwebtoken');

async function testAdminAuth() {
  try {
    await mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('Connected to MongoDB');

    // Test 1: Find admin user
    console.log('\n=== Test 1: Find admin user ===');
    const adminUser = await User.findOne({ role: 'admin' });
    if (adminUser) {
      console.log(`Admin user found: ${adminUser.name} (${adminUser.email})`);
      console.log(`Role: ${adminUser.role}`);
      console.log(`ID: ${adminUser._id}`);
    } else {
      console.log('No admin user found');
      return;
    }

    // Test 2: Generate JWT token for admin
    console.log('\n=== Test 2: Generate JWT token ===');
    const token = jwt.sign({ id: adminUser._id }, process.env.JWT_SECRET, { expiresIn: '24h' });
    console.log('JWT token generated successfully');
    console.log('Token:', token.substring(0, 50) + '...');

    // Test 3: Verify token
    console.log('\n=== Test 3: Verify token ===');
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log('Token verified successfully');
      console.log('Decoded user ID:', decoded.id);
    } catch (error) {
      console.error('Token verification failed:', error);
      return;
    }

    // Test 4: Check pending book designs
    console.log('\n=== Test 4: Check pending book designs ===');
    const pendingDesigns = await BookDesign.find({ status: 'pending' }).populate('authorRef', 'name email');
    console.log(`Found ${pendingDesigns.length} pending designs`);

    if (pendingDesigns.length > 0) {
      console.log('Pending designs:');
      pendingDesigns.forEach((design, index) => {
        console.log(`${index + 1}. ${design.title} by ${design.author}`);
        console.log(`   Author Ref: ${design.authorRef?.name} (${design.authorRef?.email})`);
        console.log(`   ID: ${design._id}`);
        console.log(`   Status: ${design.status}`);
        console.log('---');
      });
    }

    // Test 5: Simulate admin route access
    console.log('\n=== Test 5: Simulate admin route access ===');
    console.log('This would normally require the auth middleware to check admin role');
    console.log('Admin user role:', adminUser.role);
    console.log('Admin check would pass:', adminUser.role === 'admin');

  } catch (error) {
    console.error('Error testing admin auth:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

testAdminAuth(); 