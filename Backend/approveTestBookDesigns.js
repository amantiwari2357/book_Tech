require('dotenv').config();
const mongoose = require('mongoose');
const BookDesign = require('./models/BookDesign');

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

    // Approve all pending designs
    for (const design of pendingDesigns) {
      design.status = 'approved';
      await design.save();
      console.log(`Approved: ${design.title}`);
    }

    console.log('All test book designs have been approved!');
    console.log('You can now read them online at /reader/[book-design-id]');

  } catch (error) {
    console.error('Error approving book designs:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the approve function
approveTestBookDesigns(); 