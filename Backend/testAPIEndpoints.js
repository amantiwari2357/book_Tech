require('dotenv').config();
const mongoose = require('mongoose');
const BookDesign = require('./models/BookDesign');
const User = require('./models/User');

async function testAPIEndpoints() {
  try {
    await mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('Connected to MongoDB');

    // Test 1: Get all approved book designs (public endpoint)
    console.log('\n=== Test 1: GET /api/book-designs (public) ===');
    const approvedDesigns = await BookDesign.find({ status: 'approved' });
    console.log(`Found ${approvedDesigns.length} approved designs`);

    // Test 2: Get pending book designs (admin endpoint simulation)
    console.log('\n=== Test 2: GET /api/book-designs/admin/pending (admin) ===');
    const pendingDesigns = await BookDesign.find({ status: 'pending' }).populate('authorRef', 'name email');
    console.log(`Found ${pendingDesigns.length} pending designs`);

    if (pendingDesigns.length > 0) {
      console.log('Pending designs:');
      pendingDesigns.forEach((design, index) => {
        console.log(`${index + 1}. ${design.title} by ${design.author}`);
        console.log(`   Author Ref: ${design.authorRef?.name} (${design.authorRef?.email})`);
        console.log(`   ID: ${design._id}`);
        console.log(`   Status: ${design.status}`);
        console.log(`   Content length: ${design.content?.length || 0} characters`);
        console.log('---');
      });
    }

    // Test 3: Get specific book design by ID (public for approved)
    console.log('\n=== Test 3: GET /api/book-designs/:id (public for approved) ===');
    const approvedDesign = await BookDesign.findOne({ status: 'approved' });
    if (approvedDesign) {
      console.log(`Testing access to approved design: ${approvedDesign.title}`);
      console.log(`ID: ${approvedDesign._id}`);
      console.log(`Content length: ${approvedDesign.content?.length || 0} characters`);
    }

    // Test 4: Get specific pending book design by ID (should require auth)
    console.log('\n=== Test 4: GET /api/book-designs/:id (pending - should require auth) ===');
    const pendingDesign = await BookDesign.findOne({ status: 'pending' });
    if (pendingDesign) {
      console.log(`Testing access to pending design: ${pendingDesign.title}`);
      console.log(`ID: ${pendingDesign._id}`);
      console.log(`Content length: ${pendingDesign.content?.length || 0} characters`);
    }

    // Test 5: Simulate admin approval process
    console.log('\n=== Test 5: Simulate admin approval process ===');
    const designToApprove = await BookDesign.findOne({ status: 'pending' });
    if (designToApprove) {
      console.log(`Found design to approve: ${designToApprove.title}`);
      console.log(`Current status: ${designToApprove.status}`);
      
      // Simulate approval
      designToApprove.status = 'approved';
      await designToApprove.save();
      console.log(`Approved design: ${designToApprove.title}`);
      console.log(`New status: ${designToApprove.status}`);
    }

    // Test 6: Check final counts
    console.log('\n=== Test 6: Final counts ===');
    const finalPending = await BookDesign.find({ status: 'pending' });
    const finalApproved = await BookDesign.find({ status: 'approved' });
    console.log(`Pending designs: ${finalPending.length}`);
    console.log(`Approved designs: ${finalApproved.length}`);

  } catch (error) {
    console.error('Error testing API endpoints:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

testAPIEndpoints(); 