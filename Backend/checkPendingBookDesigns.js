require('dotenv').config();
const mongoose = require('mongoose');
const BookDesign = require('./models/BookDesign');
const User = require('./models/User');

async function checkPendingBookDesigns() {
  try {
    await mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('Connected to MongoDB');

    // Check all book designs
    const allDesigns = await BookDesign.find({}).populate('authorRef', 'name email');
    console.log(`Total book designs: ${allDesigns.length}`);

    // Check pending book designs
    const pendingDesigns = await BookDesign.find({ status: 'pending' }).populate('authorRef', 'name email');
    console.log(`Pending book designs: ${pendingDesigns.length}`);

    if (pendingDesigns.length > 0) {
      console.log('\nPending Book Designs:');
      pendingDesigns.forEach((design, index) => {
        console.log(`${index + 1}. ${design.title} by ${design.author} (${design.authorRef?.name || 'Unknown'})`);
        console.log(`   Status: ${design.status}`);
        console.log(`   ID: ${design._id}`);
        console.log(`   Created: ${design.createdAt}`);
        console.log('---');
      });
    } else {
      console.log('No pending book designs found.');
    }

    // Check approved book designs
    const approvedDesigns = await BookDesign.find({ status: 'approved' }).populate('authorRef', 'name email');
    console.log(`\nApproved book designs: ${approvedDesigns.length}`);

    if (approvedDesigns.length > 0) {
      console.log('\nApproved Book Designs:');
      approvedDesigns.forEach((design, index) => {
        console.log(`${index + 1}. ${design.title} by ${design.author} (${design.authorRef?.name || 'Unknown'})`);
        console.log(`   Status: ${design.status}`);
        console.log(`   ID: ${design._id}`);
        console.log('---');
      });
    }

  } catch (error) {
    console.error('Error checking book designs:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

checkPendingBookDesigns(); 