require('dotenv').config({ path: '.env' });
const Razorpay = require('razorpay');

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID, 
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

async function findAll() {
  let skip = 0;
  let found = false;
  
  while(skip < 500) {
    const payments = await razorpay.payments.all({
      from: Math.floor(new Date('2026-06-25T00:00:00Z').getTime() / 1000),
      to: Math.floor(new Date('2026-06-26T23:59:59Z').getTime() / 1000),
      count: 100,
      skip: skip
    });
    
    if (payments.items.length === 0) break;

    const match = payments.items.find(p => p.acquirer_data && (p.acquirer_data.rrn === "654240423227" || p.acquirer_data.upi_transaction_id === "654240423227"));
    if (match) {
      console.log("✅ FOUND IT!");
      console.log(match);
      found = true;
      break;
    }
    skip += 100;
  }
  if(!found) console.log("Not found in Razorpay API for June 25-26");
}
findAll();
