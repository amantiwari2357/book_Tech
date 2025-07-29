require('dotenv').config();
const Razorpay = require('razorpay');

console.log('🔍 Testing Razorpay Configuration...');
console.log('RAZORPAY_KEY_ID:', process.env.RAZORPAY_KEY_ID ? 'SET' : 'NOT SET');
console.log('RAZORPAY_KEY_SECRET:', process.env.RAZORPAY_KEY_SECRET ? 'SET' : 'NOT SET');

if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
  console.error('❌ Razorpay credentials not found in .env file');
  process.exit(1);
}

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

async function testPaymentLink() {
  try {
    console.log('🔗 Testing payment link creation...');
    
    const paymentLink = await razorpay.paymentLink.create({
      amount: 100, // 1 rupee in paise
      currency: 'INR',
      description: 'Test payment link',
      customer: {
        name: 'Test User',
        email: 'test@example.com',
        contact: '1234567890',
      },
      notify: { sms: false, email: false },
      callback_url: 'https://book-tech.vercel.app/payment-success',
      callback_method: 'get',
    });

    console.log('✅ Payment link created successfully!');
    console.log('🔗 Payment Link:', paymentLink.short_url);
    console.log('🆔 Payment Link ID:', paymentLink.id);
    
    return paymentLink.short_url;
  } catch (error) {
    console.error('❌ Payment link creation failed:');
    console.error('Message:', error.message);
    console.error('Code:', error.code);
    console.error('Status Code:', error.statusCode);
    console.error('Error Details:', error.error);
    throw error;
  }
}

testPaymentLink()
  .then(() => {
    console.log('✅ Razorpay test completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Razorpay test failed!');
    process.exit(1);
  }); 