const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

// Connect to MongoDB (use Render MongoDB URI)
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://booktech:booktech123@cluster0.mongodb.net/book-tech?retryWrites=true&w=majority';

mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const createTestUsers = async () => {
  try {
    // Test Admin User
    const adminExists = await User.findOne({ email: 'admin@test.com' });
    if (!adminExists) {
      const adminPassword = await bcrypt.hash('admin123', 10);
      const admin = new User({
        name: 'Admin User',
        email: 'admin@test.com',
        password: adminPassword,
        role: 'admin',
        subscription: 'enterprise'
      });
      await admin.save();
      console.log('✅ Admin user created: admin@test.com / admin123');
    } else {
      console.log('ℹ️ Admin user already exists');
    }

    // Test Customer User
    const customerExists = await User.findOne({ email: 'customer@test.com' });
    if (!customerExists) {
      const customerPassword = await bcrypt.hash('customer123', 10);
      const customer = new User({
        name: 'John Customer',
        email: 'customer@test.com',
        password: customerPassword,
        role: 'customer',
        subscription: 'premium'
      });
      await customer.save();
      console.log('✅ Customer user created: customer@test.com / customer123');
    } else {
      console.log('ℹ️ Customer user already exists');
    }

    // Test Author User
    const authorExists = await User.findOne({ email: 'author@test.com' });
    if (!authorExists) {
      const authorPassword = await bcrypt.hash('author123', 10);
      const author = new User({
        name: 'Jane Author',
        email: 'author@test.com',
        password: authorPassword,
        role: 'author',
        subscription: 'basic'
      });
      await author.save();
      console.log('✅ Author user created: author@test.com / author123');
    } else {
      console.log('ℹ️ Author user already exists');
    }

    console.log('\n🎉 All test users created successfully!');
    console.log('\n📋 Test Credentials:');
    console.log('Admin: admin@test.com / admin123');
    console.log('Customer: customer@test.com / customer123');
    console.log('Author: author@test.com / author123');

  } catch (error) {
    console.error('❌ Error creating test users:', error);
  } finally {
    mongoose.connection.close();
  }
};

createTestUsers(); 