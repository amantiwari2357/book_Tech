const express = require('express');
const Order = require('../models/Order');
const Book = require('../models/Book');
const BookDesign = require('../models/BookDesign');
const auth = require('../middleware/auth');

const router = express.Router();

// Get sales trends over time
router.get('/sales-trends', auth, async (req, res) => {
  try {
    const { startDate, endDate, category, region } = req.query;
    const userId = req.user.id;

    // Build date filter
    const dateFilter = {};
    if (startDate && endDate) {
      dateFilter.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    // Build category filter
    const categoryFilter = {};
    if (category) {
      categoryFilter.category = category;
    }

    // Get orders for the author's books
    const orders = await Order.find({
      ...dateFilter,
      'items.bookId': { $exists: true }
    })
    .populate('items.bookId', 'title author category')
    .sort({ createdAt: 1 });

    // Filter orders for this author's books
    const authorOrders = orders.filter(order => 
      order.items.some(item => 
        item.bookId && item.bookId.authorRef && item.bookId.authorRef.toString() === userId
      )
    );

    // Group by date
    const salesByDate = {};
    authorOrders.forEach(order => {
      const date = order.createdAt.toISOString().split('T')[0];
      if (!salesByDate[date]) {
        salesByDate[date] = {
          date,
          revenue: 0,
          orders: 0,
          downloads: 0
        };
      }
      
      salesByDate[date].revenue += order.totalAmount || 0;
      salesByDate[date].orders += 1;
      
      // Count downloads (assuming digital books)
      order.items.forEach(item => {
        if (item.bookId && item.bookId.category === 'digital') {
          salesByDate[date].downloads += item.quantity || 1;
        }
      });
    });

    const salesData = Object.values(salesByDate);

    res.json({
      success: true,
      data: salesData,
      totalRevenue: salesData.reduce((sum, item) => sum + item.revenue, 0),
      totalOrders: salesData.reduce((sum, item) => sum + item.orders, 0),
      totalDownloads: salesData.reduce((sum, item) => sum + item.downloads, 0)
    });
  } catch (error) {
    console.error('Error fetching sales trends:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch sales trends' });
  }
});

// Get downloads vs orders comparison
router.get('/downloads-vs-orders', auth, async (req, res) => {
  try {
    const { startDate, endDate, category } = req.query;
    const userId = req.user.id;

    // Build date filter
    const dateFilter = {};
    if (startDate && endDate) {
      dateFilter.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    // Get author's books
    const authorBooks = await Book.find({ authorRef: userId });
    const bookIds = authorBooks.map(book => book._id);

    // Get orders for author's books
    const orders = await Order.find({
      ...dateFilter,
      'items.bookId': { $in: bookIds }
    }).populate('items.bookId', 'title category');

    let downloads = 0;
    let hardCopyOrders = 0;

    orders.forEach(order => {
      order.items.forEach(item => {
        if (item.bookId && bookIds.includes(item.bookId._id)) {
          if (item.bookId.category === 'digital') {
            downloads += item.quantity || 1;
          } else {
            hardCopyOrders += item.quantity || 1;
          }
        }
      });
    });

    res.json({
      success: true,
      data: [
        { label: 'Downloads', value: downloads, color: '#3B82F6' },
        { label: 'Hard Copy Orders', value: hardCopyOrders, color: '#10B981' }
      ],
      total: downloads + hardCopyOrders
    });
  } catch (error) {
    console.error('Error fetching downloads vs orders:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch comparison data' });
  }
});

// Get most viewed books
router.get('/most-viewed', auth, async (req, res) => {
  try {
    const { startDate, endDate, limit = 5 } = req.query;
    const userId = req.user.id;

    // Build date filter
    const dateFilter = {};
    if (startDate && endDate) {
      dateFilter.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    // Get author's books with view counts
    const books = await Book.find({ 
      authorRef: userId,
      ...dateFilter
    })
    .select('title coverImage views downloads sales')
    .sort({ views: -1 })
    .limit(parseInt(limit));

    const bookData = books.map(book => ({
      title: book.title,
      coverImage: book.coverImage,
      views: book.views || 0,
      downloads: book.downloads || 0,
      sales: book.sales || 0
    }));

    res.json({
      success: true,
      data: bookData
    });
  } catch (error) {
    console.error('Error fetching most viewed books:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch most viewed books' });
  }
});

// Get analytics summary
router.get('/summary', auth, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const userId = req.user.id;

    // Build date filter
    const dateFilter = {};
    if (startDate && endDate) {
      dateFilter.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    // Get author's books
    const authorBooks = await Book.find({ authorRef: userId });
    const bookIds = authorBooks.map(book => book._id);

    // Get orders for author's books
    const orders = await Order.find({
      ...dateFilter,
      'items.bookId': { $in: bookIds }
    }).populate('items.bookId', 'title category');

    let totalRevenue = 0;
    let totalOrders = 0;
    let totalDownloads = 0;
    let totalViews = 0;

    orders.forEach(order => {
      totalRevenue += order.totalAmount || 0;
      totalOrders += 1;
      
      order.items.forEach(item => {
        if (item.bookId && bookIds.includes(item.bookId._id)) {
          if (item.bookId.category === 'digital') {
            totalDownloads += item.quantity || 1;
          }
        }
      });
    });

    // Get total views from books
    totalViews = authorBooks.reduce((sum, book) => sum + (book.views || 0), 0);

    res.json({
      success: true,
      data: {
        totalRevenue,
        totalOrders,
        totalDownloads,
        totalViews,
        totalBooks: authorBooks.length,
        averageRevenue: totalOrders > 0 ? totalRevenue / totalOrders : 0
      }
    });
  } catch (error) {
    console.error('Error fetching analytics summary:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch analytics summary' });
  }
});

// Get category breakdown
router.get('/category-breakdown', auth, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const userId = req.user.id;

    // Build date filter
    const dateFilter = {};
    if (startDate && endDate) {
      dateFilter.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    // Get author's books grouped by category
    const books = await Book.find({ 
      authorRef: userId,
      ...dateFilter
    }).select('title category sales views');

    const categoryData = {};
    books.forEach(book => {
      const category = book.category || 'Uncategorized';
      if (!categoryData[category]) {
        categoryData[category] = {
          category,
          sales: 0,
          views: 0,
          books: 0
        };
      }
      categoryData[category].sales += book.sales || 0;
      categoryData[category].views += book.views || 0;
      categoryData[category].books += 1;
    });

    res.json({
      success: true,
      data: Object.values(categoryData)
    });
  } catch (error) {
    console.error('Error fetching category breakdown:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch category breakdown' });
  }
});

// Export analytics data
router.get('/export', auth, async (req, res) => {
  try {
    const { format, startDate, endDate, category } = req.query;
    const userId = req.user.id;

    // Build filters
    const filters = { authorRef: userId };
    if (startDate && endDate) {
      filters.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }
    if (category) {
      filters.category = category;
    }

    // Get analytics data
    const books = await Book.find(filters).select('title category sales views downloads createdAt');
    const bookIds = books.map(book => book._id);

    const orders = await Order.find({
      'items.bookId': { $in: bookIds }
    }).populate('items.bookId', 'title category');

    // Prepare export data
    const exportData = {
      books: books.map(book => ({
        title: book.title,
        category: book.category,
        sales: book.sales || 0,
        views: book.views || 0,
        downloads: book.downloads || 0,
        createdAt: book.createdAt
      })),
      orders: orders.map(order => ({
        orderId: order._id,
        totalAmount: order.totalAmount,
        status: order.status,
        createdAt: order.createdAt,
        items: order.items.map(item => ({
          title: item.bookId?.title || 'Unknown',
          category: item.bookId?.category || 'Unknown',
          quantity: item.quantity
        }))
      })),
      summary: {
        totalBooks: books.length,
        totalSales: books.reduce((sum, book) => sum + (book.sales || 0), 0),
        totalViews: books.reduce((sum, book) => sum + (book.views || 0), 0),
        totalDownloads: books.reduce((sum, book) => sum + (book.downloads || 0), 0),
        totalOrders: orders.length,
        totalRevenue: orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0)
      }
    };

    res.json({
      success: true,
      data: exportData,
      format: format || 'json'
    });
  } catch (error) {
    console.error('Error exporting analytics data:', error);
    res.status(500).json({ success: false, message: 'Failed to export analytics data' });
  }
});

module.exports = router; 