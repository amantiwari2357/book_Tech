require('dotenv').config();
const mongoose = require('mongoose');
const BookDesign = require('./models/BookDesign');
const User = require('./models/User');

async function approveTestBookDesigns() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to MongoDB');

    // Find all pending book designs
    const pendingDesigns = await BookDesign.find({ status: 'pending' });
    console.log(`Found ${pendingDesigns.length} pending book designs`);

    if (pendingDesigns.length === 0) {
      console.log('No pending book designs found');
      return;
    }

    // Approve all pending designs
    const updateResult = await BookDesign.updateMany(
      { status: 'pending' },
      { status: 'approved' }
    );

    console.log(`Approved ${updateResult.modifiedCount} book designs`);

    // List the approved designs
    const approvedDesigns = await BookDesign.find({ status: 'approved' });
    console.log('\nApproved book designs:');
    approvedDesigns.forEach((design, index) => {
      console.log(`${index + 1}. ${design.title} - ${design.isFree ? 'Free' : `$${design.price}`} - ${design.category}`);
    });

    console.log('\nBook designs approved successfully!');

  } catch (error) {
    console.error('Error approving book designs:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the approve function
approveTestBookDesigns(); 