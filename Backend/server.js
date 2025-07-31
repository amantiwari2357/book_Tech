  require('dotenv').config();
  const express = require('express');
  const mongoose = require('mongoose');
  const cors = require('cors');

  const authRoutes = require('./routes/auth');
  const bookRoutes = require('./routes/books');
  const cartRoutes = require('./routes/cart');
  const subscriptionRoutes = require('./routes/subscription');
  const checkoutRoutes = require('./routes/checkout');
  const supportRoutes = require('./routes/support');
  const adminRoutes = require('./routes/admin');
  const usersRoutes = require('./routes/users');
  const notificationsRoutes = require('./routes/notifications');
  const ordersRoutes = require('./routes/orders');
  const razorpayRoutes = require('./routes/razorpay');
  const bookDesignRoutes = require('./routes/bookDesign');
  const cloudinaryRoutes = require('./routes/cloudinary');

  const app = express();
  
  // CORS configuration
  const corsOptions = {
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);
      
      const allowedOrigins = [
        'http://localhost:3000',
        'http://localhost:5173',
        'http://localhost:8080', 
        'http://127.0.0.1:8080',
        'http://127.0.0.1:3000',
        'http://127.0.0.1:5173',
        'https://book-tech.vercel.app',
        'https://book-tech-frontend.vercel.app'
      ];
      
      // Check if origin is allowed
      const isAllowed = allowedOrigins.some(allowedOrigin => {
        return origin === allowedOrigin;
      });
      
      // Also allow any vercel.app domain
      if (origin.includes('vercel.app')) {
        return callback(null, true);
      }
      
      if (isAllowed) {
        callback(null, true);
      } else {
        console.log('CORS blocked origin:', origin);
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
    exposedHeaders: ['Content-Range', 'X-Content-Range'],
    maxAge: 86400 // 24 hours
  };
  
  app.use(cors(corsOptions));
  app.use(express.json());

  app.use('/api/auth', authRoutes);
  app.use('/api/books', bookRoutes);
  app.use('/api/cart', cartRoutes);
  app.use('/api/subscription', subscriptionRoutes);
  app.use('/api/checkout', checkoutRoutes);
  app.use('/api/support', supportRoutes);
  app.use('/api/admin', adminRoutes);
  app.use('/api/users', usersRoutes);
  app.use('/api/notifications', notificationsRoutes);
  app.use('/api/orders', ordersRoutes);
  app.use('/api/razorpay', razorpayRoutes);
  app.use('/api/book-designs', bookDesignRoutes);
  app.use('/api/cloudinary', cloudinaryRoutes);

  // Test route
  app.get('/api/test', (req, res) => {
    res.json({ message: 'Backend server is running!', timestamp: new Date().toISOString() });
  });

  // CORS test route
  app.get('/api/cors-test', (req, res) => {
    res.json({ 
      message: 'CORS is working!', 
      timestamp: new Date().toISOString(),
      origin: req.headers.origin,
      method: req.method
    });
  });

  // Test orders route
  app.get('/api/orders-test', (req, res) => {
    res.json({ message: 'Orders route test!', timestamp: new Date().toISOString() });
  });

  const PORT = process.env.PORT || 3001;

  // Check if MONGODB_URI is set
  if (!process.env.MONGODB_URI) {
    console.log('⚠️  MONGODB_URI not set. Server will start without database connection.');
    console.log('📝 Please create a .env file with MONGODB_URI for full functionality.');
    app.listen(PORT, () => console.log(`Server running on port ${PORT} (without database)`));
  } else {
    mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
      .then(() => {
        console.log('MongoDB connected');
        app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
      })
      .catch((err) => console.error('MongoDB connection error:', err));
  } 