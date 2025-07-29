const mongoose = require('mongoose');
const User = require('./models/User');
const BookDesign = require('./models/BookDesign');
const Book = require('./models/Book');
const Notification = require('./models/Notification');
const Order = require('./models/Order');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/booktech', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function cleanupOrphanedData() {
  try {
    console.log('Starting cleanup of orphaned data...');
    
    // Get all user IDs
    const users = await User.find({}, '_id');
    const userIds = users.map(user => user._id.toString());
    
    console.log(`Found ${userIds.length} users in the system`);
    
    // Cleanup orphaned book designs
    const orphanedBookDesigns = await BookDesign.find({
      authorRef: { $nin: userIds }
    });
    
    if (orphanedBookDesigns.length > 0) {
      console.log(`Found ${orphanedBookDesigns.length} orphaned book designs`);
      console.log('Orphaned book designs:');
      orphanedBookDesigns.forEach(design => {
        console.log(`- ${design.title} (Author ID: ${design.authorRef})`);
      });
      
      const deleteResult = await BookDesign.deleteMany({
        authorRef: { $nin: userIds }
      });
      console.log(`Deleted ${deleteResult.deletedCount} orphaned book designs`);
    } else {
      console.log('No orphaned book designs found');
    }
    
    // Cleanup orphaned books
    const orphanedBooks = await Book.find({
      authorRef: { $nin: userIds }
    });
    
    if (orphanedBooks.length > 0) {
      console.log(`Found ${orphanedBooks.length} orphaned books`);
      console.log('Orphaned books:');
      orphanedBooks.forEach(book => {
        console.log(`- ${book.title} (Author ID: ${book.authorRef})`);
      });
      
      const deleteResult = await Book.deleteMany({
        authorRef: { $nin: userIds }
      });
      console.log(`Deleted ${deleteResult.deletedCount} orphaned books`);
    } else {
      console.log('No orphaned books found');
    }
    
    // Cleanup orphaned notifications
    const orphanedNotifications = await Notification.find({
      $or: [
        { sender: { $nin: userIds } },
        { recipient: { $nin: userIds } }
      ]
    });
    
    if (orphanedNotifications.length > 0) {
      console.log(`Found ${orphanedNotifications.length} orphaned notifications`);
      
      const deleteResult = await Notification.deleteMany({
        $or: [
          { sender: { $nin: userIds } },
          { recipient: { $nin: userIds } }
        ]
      });
      console.log(`Deleted ${deleteResult.deletedCount} orphaned notifications`);
    } else {
      console.log('No orphaned notifications found');
    }
    
    // Cleanup orphaned orders
    const orphanedOrders = await Order.find({
      user: { $nin: userIds }
    });
    
    if (orphanedOrders.length > 0) {
      console.log(`Found ${orphanedOrders.length} orphaned orders`);
      
      const deleteResult = await Order.deleteMany({
        user: { $nin: userIds }
      });
      console.log(`Deleted ${deleteResult.deletedCount} orphaned orders`);
    } else {
      console.log('No orphaned orders found');
    }
    
    console.log('Cleanup completed successfully!');
    
  } catch (error) {
    console.error('Error during cleanup:', error);
  } finally {
    mongoose.connection.close();
  }
}

// Run the cleanup if this script is executed directly
if (require.main === module) {
  cleanupOrphanedData();
}

module.exports = cleanupOrphanedData; 