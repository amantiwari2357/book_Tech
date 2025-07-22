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

  const app = express();
  app.use(cors());
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

  const PORT = process.env.PORT || 5000;

  mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
    .then(() => {
      console.log('MongoDB connected');
      app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
    })
    .catch((err) => console.error('MongoDB connection error:', err)); 