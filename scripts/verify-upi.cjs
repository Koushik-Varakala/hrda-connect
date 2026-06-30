require('dotenv').config({ path: '.env' });
const Razorpay = require('razorpay');

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID, 
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

async function findPaymentByUPI() {
  const upiRefId = "654240423227"; // From the screenshot
  
  try {
    // Fetch payments from the last few days (June 24 - June 26)
    const payments = await razorpay.payments.all({
      from: Math.floor(new Date('2026-06-24').getTime() / 1000),
      to: Math.floor(new Date('2026-06-27').getTime() / 1000),
      count: 100
    });

    const foundPayment = payments.items.find(
      p => p.acquirer_data && (p.acquirer_data.rrn === upiRefId || p.acquirer_data.upi_transaction_id === upiRefId)
    );

    if (foundPayment) {
      console.log("✅ Payment Found!");
      console.log("Payment ID:", foundPayment.id);
      console.log("Order ID:", foundPayment.order_id);
      console.log("Status:", foundPayment.status);
      console.log("Email:", foundPayment.email);
      console.log("Contact:", foundPayment.contact);
    } else {
      console.log("❌ Payment not found in the last 100 transactions.");
    }
  } catch (error) {
    console.error("Error fetching payments:", error.message);
  }
}

findPaymentByUPI();
