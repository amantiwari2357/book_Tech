require('dotenv').config();
const mongoose = require('mongoose');
const BookDesign = require('./models/BookDesign');
const User = require('./models/User');

async function testAdminRoute() {
  try {
    await mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('Connected to MongoDB');

    // Test 1: Check if there are any pending book designs
    console.log('\n=== Test 1: Check pending book designs ===');
    const pendingDesigns = await BookDesign.find({ status: 'pending' }).populate('authorRef', 'name email');
    console.log(`Found ${pendingDesigns.length} pending designs`);

    if (pendingDesigns.length > 0) {
      console.log('Pending designs:');
      pendingDesigns.forEach((design, index) => {
        console.log(`${index + 1}. ${design.title} by ${design.author}`);
        console.log(`   Author Ref: ${design.authorRef?.name} (${design.authorRef?.email})`);
        console.log(`   ID: ${design._id}`);
        console.log(`   Status: ${design.status}`);
        console.log(`   Created: ${design.createdAt}`);
        console.log('---');
      });
    } else {
      console.log('No pending designs found');
    }

    // Test 2: Check if there are any approved book designs
    console.log('\n=== Test 2: Check approved book designs ===');
    const approvedDesigns = await BookDesign.find({ status: 'approved' });
    console.log(`Found ${approvedDesigns.length} approved designs`);

    // Test 3: Check if there are any users with admin role
    console.log('\n=== Test 3: Check admin users ===');
    const adminUsers = await User.find({ role: 'admin' });
    console.log(`Found ${adminUsers.length} admin users`);

    adminUsers.forEach((user, index) => {
      console.log(`${index + 1}. ${user.name} (${user.email}) - Role: ${user.role}`);
    });

    // Test 4: Check if there are any users with author role
    console.log('\n=== Test 4: Check author users ===');
    const authorUsers = await User.find({ role: 'author' });
    console.log(`Found ${authorUsers.length} author users`);

    authorUsers.forEach((user, index) => {
      console.log(`${index + 1}. ${user.name} (${user.email}) - Role: ${user.role}`);
    });

    // Test 5: Check all book designs by author
    console.log('\n=== Test 5: Check all book designs ===');
    const allDesigns = await BookDesign.find({}).populate('authorRef', 'name email');
    console.log(`Total book designs: ${allDesigns.length}`);

    allDesigns.forEach((design, index) => {
      console.log(`${index + 1}. ${design.title} by ${design.author}`);
      console.log(`   Author Ref: ${design.authorRef?.name} (${design.authorRef?.email})`);
      console.log(`   Status: ${design.status}`);
      console.log(`   Created: ${design.createdAt}`);
      console.log('---');
    });

  } catch (error) {
    console.error('Error testing admin route:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

testAdminRoute(); 