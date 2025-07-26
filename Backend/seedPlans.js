const mongoose = require('mongoose');
require('dotenv').config();

const planSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  features: [{ type: String, required: true }],
  isPopular: { type: Boolean, default: false },
});

const Plan = mongoose.model('Plan', planSchema);

const defaultPlans = [
  {
    name: 'Basic',
    price: 9.99,
    features: ['Access to 1000+ books', 'Standard support', 'Basic reading features'],
  },
  {
    name: 'Premium',
    price: 19.99,
    features: ['Access to all books', 'Priority support', 'Advanced reading features', 'Offline reading'],
    isPopular: true,
  },
  {
    name: 'Enterprise',
    price: 39.99,
    features: ['Everything in Premium', 'Team collaboration', 'Admin dashboard', 'Custom integrations'],
  },
];

async function seedPlans() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing plans
    await Plan.deleteMany({});
    console.log('Cleared existing plans');

    // Insert default plans
    const plans = await Plan.insertMany(defaultPlans);
    console.log('Seeded plans:', plans);

    console.log('Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

seedPlans(); 