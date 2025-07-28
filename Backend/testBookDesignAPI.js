require('dotenv').config();
const mongoose = require('mongoose');
const BookDesign = require('./models/BookDesign');
const User = require('./models/User');

async function testBookDesignAPI() {
  try {
    await mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('Connected to MongoDB');

    // Test 1: Get all approved book designs
    console.log('\n=== Test 1: Get all approved book designs ===');
    const approvedDesigns = await BookDesign.find({ status: 'approved' });
    console.log(`Found ${approvedDesigns.length} approved designs`);

    // Test 2: Get pending book designs (admin endpoint)
    console.log('\n=== Test 2: Get pending book designs ===');
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

    // Test 3: Get a specific book design by ID
    if (pendingDesigns.length > 0) {
      console.log('\n=== Test 3: Get specific book design by ID ===');
      const testDesign = pendingDesigns[0];
      const foundDesign = await BookDesign.findById(testDesign._id).populate('authorRef', 'name email');
      if (foundDesign) {
        console.log(`Found design: ${foundDesign.title}`);
        console.log(`Status: ${foundDesign.status}`);
        console.log(`Content length: ${foundDesign.content?.length || 0} characters`);
      } else {
        console.log('Design not found');
      }
    }

    // Test 4: Check if approved designs can be accessed publicly
    console.log('\n=== Test 4: Check approved designs for public access ===');
    const approvedDesign = await BookDesign.findOne({ status: 'approved' });
    if (approvedDesign) {
      console.log(`Approved design: ${approvedDesign.title}`);
      console.log(`Content length: ${approvedDesign.content?.length || 0} characters`);
      console.log(`ID: ${approvedDesign._id}`);
    }

  } catch (error) {
    console.error('Error testing book design API:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

testBookDesignAPI(); 