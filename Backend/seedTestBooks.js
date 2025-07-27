require('dotenv').config();
const mongoose = require('mongoose');
const Book = require('./models/Book');
const User = require('./models/User');

async function seedTestBooks() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to MongoDB');

    // Find or create a test author
    let testAuthor = await User.findOne({ email: 'testauthor@example.com' });
    if (!testAuthor) {
      testAuthor = await User.create({
        name: 'Test Author',
        email: 'testauthor@example.com',
        password: 'password123',
        role: 'author'
      });
      console.log('Created test author');
    }

    // Create test books with pending status
    const testBooks = [
      {
        title: 'The Adventure Begins',
        author: 'Test Author',
        description: 'An exciting adventure story about a young hero discovering their destiny.',
        price: 9.99,
        coverImage: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400',
        category: 'Fiction',
        genre: 'Adventure',
        tags: ['adventure', 'hero', 'fantasy'],
        isPremium: false,
        readingType: 'soft',
        status: 'pending',
        authorRef: testAuthor._id
      },
      {
        title: 'Mystery of the Old Library',
        author: 'Test Author',
        description: 'A thrilling mystery novel set in an ancient library with hidden secrets.',
        price: 12.99,
        coverImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
        category: 'Fiction',
        genre: 'Mystery',
        tags: ['mystery', 'library', 'thriller'],
        isPremium: true,
        readingType: 'hard',
        status: 'pending',
        authorRef: testAuthor._id
      },
      {
        title: 'Science and Discovery',
        author: 'Test Author',
        description: 'A comprehensive guide to modern scientific discoveries and innovations.',
        price: 15.99,
        coverImage: 'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=400',
        category: 'Non-Fiction',
        genre: 'Science',
        tags: ['science', 'discovery', 'innovation'],
        isPremium: false,
        readingType: 'soft',
        status: 'pending',
        authorRef: testAuthor._id
      },
      {
        title: 'Cooking Masterclass',
        author: 'Test Author',
        description: 'Learn the art of cooking with step-by-step recipes and techniques.',
        price: 8.99,
        coverImage: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400',
        category: 'Non-Fiction',
        genre: 'Cooking',
        tags: ['cooking', 'recipes', 'food'],
        isPremium: false,
        readingType: 'hard',
        status: 'pending',
        authorRef: testAuthor._id
      },
      {
        title: 'Digital Marketing Guide',
        author: 'Test Author',
        description: 'Complete guide to digital marketing strategies and best practices.',
        price: 19.99,
        coverImage: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400',
        category: 'Business',
        genre: 'Marketing',
        tags: ['marketing', 'digital', 'business'],
        isPremium: true,
        readingType: 'soft',
        status: 'pending',
        authorRef: testAuthor._id
      }
    ];

    // Clear existing pending books
    await Book.deleteMany({ status: 'pending' });
    console.log('Cleared existing pending books');

    // Insert test books
    const createdBooks = await Book.insertMany(testBooks);
    console.log(`Created ${createdBooks.length} test books with pending status`);

    console.log('Test books created successfully!');
    console.log('You can now test the admin approval system.');
    
    // List the created books
    createdBooks.forEach((book, index) => {
      console.log(`${index + 1}. ${book.title} - $${book.price} - ${book.readingType} copy`);
    });

  } catch (error) {
    console.error('Error seeding test books:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the seed function
seedTestBooks(); 