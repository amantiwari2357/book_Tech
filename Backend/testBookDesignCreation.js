require('dotenv').config();
const mongoose = require('mongoose');
const BookDesign = require('./models/BookDesign');
const User = require('./models/User');

async function testBookDesignCreation() {
  try {
    await mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('Connected to MongoDB');

    // Test 1: Create a test author if not exists
    console.log('\n=== Test 1: Create test author ===');
    let testAuthor = await User.findOne({ email: 'testauthor2@example.com' });
    if (!testAuthor) {
      testAuthor = new User({
        name: 'Test Author 2',
        email: 'testauthor2@example.com',
        password: 'password123',
        role: 'author'
      });
      await testAuthor.save();
      console.log('Created test author:', testAuthor.name);
    } else {
      console.log('Test author already exists:', testAuthor.name);
    }

    // Test 2: Create a new book design
    console.log('\n=== Test 2: Create new book design ===');
    const newBookDesign = new BookDesign({
      title: 'Test Book Design',
      author: 'Test Author 2',
      description: 'This is a test book design for testing purposes.',
      coverImageUrl: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400',
      content: `Chapter 1: Introduction

This is a test book design created for testing the approval process. The content includes multiple paragraphs to simulate a real book.

Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.

Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.

Chapter 2: Development

The story continues with more content to test the reading functionality. This chapter explores various themes and ideas that would be found in a real book.

Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.

Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt.`,
      formatting: {
        fontSize: 16,
        fontFamily: 'Arial',
        lineHeight: 1.6,
        textColor: '#2c3e50',
        backgroundColor: '#f8f9fa',
        pageWidth: 5.5,
        pageHeight: 8.5,
        margins: { top: 0.5, bottom: 0.5, left: 0.75, right: 0.75 }
      },
      category: 'Test',
      tags: ['test', 'sample'],
      isFree: true,
      price: 0,
      isPremium: false,
      status: 'pending',
      authorRef: testAuthor._id
    });

    await newBookDesign.save();
    console.log('Created new book design:', newBookDesign.title);
    console.log('Book design ID:', newBookDesign._id);
    console.log('Status:', newBookDesign.status);

    // Test 3: Check pending designs
    console.log('\n=== Test 3: Check pending designs ===');
    const pendingDesigns = await BookDesign.find({ status: 'pending' }).populate('authorRef', 'name email');
    console.log(`Total pending designs: ${pendingDesigns.length}`);

    pendingDesigns.forEach((design, index) => {
      console.log(`${index + 1}. ${design.title} by ${design.author}`);
      console.log(`   Author: ${design.authorRef?.name} (${design.authorRef?.email})`);
      console.log(`   ID: ${design._id}`);
      console.log(`   Status: ${design.status}`);
      console.log('---');
    });

    // Test 4: Simulate admin approval
    console.log('\n=== Test 4: Simulate admin approval ===');
    const designToApprove = await BookDesign.findOne({ status: 'pending' });
    if (designToApprove) {
      designToApprove.status = 'approved';
      await designToApprove.save();
      console.log(`Approved book design: ${designToApprove.title}`);
    }

    // Test 5: Check approved designs
    console.log('\n=== Test 5: Check approved designs ===');
    const approvedDesigns = await BookDesign.find({ status: 'approved' });
    console.log(`Total approved designs: ${approvedDesigns.length}`);

  } catch (error) {
    console.error('Error testing book design creation:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

testBookDesignCreation(); 