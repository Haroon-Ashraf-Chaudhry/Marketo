require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./src/models/User');
const Product = require('./src/models/Product');

const seed = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  await User.deleteMany({});
  await Product.deleteMany({});
  console.log('Cleared existing data');

  // Create users
  const admin = await User.create({ name: 'Admin User', email: 'admin@marketo.com', password: 'password123', role: 'admin', isVerified: true });
  const vendor1 = await User.create({ name: 'TechStore', email: 'vendor@marketo.com', password: 'password123', role: 'vendor', isVerified: true });
  const vendor2 = await User.create({ name: 'FashionHub', email: 'vendor2@marketo.com', password: 'password123', role: 'vendor', isVerified: true });
  const buyer = await User.create({ name: 'John Buyer', email: 'buyer@marketo.com', password: 'password123', role: 'buyer', isVerified: true });

  // Create products
  const products = [
    { vendor: vendor1._id, name: 'Wireless Noise-Cancelling Headphones', description: 'Premium sound quality with 30hr battery life. Bluetooth 5.0, foldable design. Perfect for travel and work.', price: 149.99, category: 'electronics', stock: 50, tags: ['wireless', 'bluetooth', 'audio'] },
    { vendor: vendor1._id, name: 'Mechanical Gaming Keyboard', description: 'RGB backlit, tactile switches, full N-key rollover. Built for competitive gaming.', price: 89.99, category: 'electronics', stock: 30, tags: ['gaming', 'keyboard', 'rgb'] },
    { vendor: vendor1._id, name: 'USB-C Hub 7-in-1', description: 'Compatible with MacBook, iPad Pro, and all USB-C laptops. Includes HDMI 4K, SD card, USB-A x3.', price: 49.99, category: 'electronics', stock: 75, tags: ['usb', 'hub', 'accessories'] },
    { vendor: vendor2._id, name: 'Premium Leather Jacket', description: 'Genuine cowhide leather, YKK zippers, quilted lining. Available in black and brown.', price: 299.00, category: 'clothing', stock: 15, tags: ['leather', 'jacket', 'fashion'] },
    { vendor: vendor2._id, name: 'Classic Denim Jeans', description: 'Slim-fit cut, stretch denim, 5-pocket styling. Versatile enough for any occasion.', price: 79.00, category: 'clothing', stock: 100, tags: ['denim', 'jeans', 'casual'] },
    { vendor: vendor2._id, name: 'Oversized Hoodie', description: 'Heavyweight 400 GSM cotton, dropped shoulders. Unisex sizing, machine washable.', price: 59.99, category: 'clothing', stock: 80, tags: ['hoodie', 'streetwear', 'cozy'] },
    { vendor: vendor1._id, name: 'Smart LED Desk Lamp', description: 'Touch-dimming, USB-C charging port, 5 color temperatures. Perfect for reading or work.', price: 39.99, category: 'home', stock: 60, tags: ['lamp', 'smart', 'desk'] },
    { vendor: vendor2._id, name: 'Yoga Mat Premium', description: 'Non-slip 6mm thick, eco-friendly TPE material. Includes carrying strap.', price: 45.00, category: 'sports', stock: 40, tags: ['yoga', 'fitness', 'exercise'] },
  ];

  for (const p of products) {
    await Product.create(p);
  }

  console.log('\n✅ Database seeded successfully!\n');
  console.log('Test accounts:');
  console.log('  Admin:  admin@marketo.com / password123');
  console.log('  Vendor: vendor@marketo.com / password123');
  console.log('  Vendor: vendor2@marketo.com / password123');
  console.log('  Buyer:  buyer@marketo.com / password123\n');

  process.exit(0);
};

seed().catch(err => { console.error(err); process.exit(1); });
