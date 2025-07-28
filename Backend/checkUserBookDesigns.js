require('dotenv').config();
const mongoose = require('mongoose');
const BookDesign = require('./models/BookDesign');
const User = require('./models/User');

async function checkUserBookDesigns() {
  try {
    await mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('Connected to MongoDB');

    // Find the user who created the book designs
    const user = await User.findOne({ email: 'amantiwariat2005@gmail.com' });
    if (!user) {
      console.log('User not found');
      return;
    }

    console.log(`Found user: ${user.name} (${user.email})`);
    console.log(`User ID: ${user._id}`);
    console.log(`Role: ${user.role}`);

    // Find all book designs by this user
    const userBookDesigns = await BookDesign.find({ authorRef: user._id }).populate('authorRef', 'name email');
    console.log(`\nTotal book designs by this user: ${userBookDesigns.length}`);

    userBookDesigns.forEach((design, index) => {
      console.log(`\n${index + 1}. ${design.title}`);
      console.log(`   Author: ${design.author}`);
      console.log(`   Status: ${design.status}`);
      console.log(`   ID: ${design._id}`);
      console.log(`   Created: ${design.createdAt}`);
      console.log(`   Content length: ${design.content?.length || 0} characters`);
      console.log(`   Cover URL: ${design.coverImageUrl}`);
      console.log('---');
    });

    // Check if any are pending
    const pendingDesigns = userBookDesigns.filter(d => d.status === 'pending');
    console.log(`\nPending designs: ${pendingDesigns.length}`);
    
    const approvedDesigns = userBookDesigns.filter(d => d.status === 'approved');
    console.log(`Approved designs: ${approvedDesigns.length}`);

  } catch (error) {
    console.error('Error checking user book designs:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

checkUserBookDesigns(); 