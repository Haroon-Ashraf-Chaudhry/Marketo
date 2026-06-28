const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
});

const sendEmail = async ({ to, subject, html }) => {
  await transporter.sendMail({
    from: `Marketplace <${process.env.EMAIL_FROM}>`,
    to,
    subject,
    html,
  });
};

const sendOrderConfirmation = (order, user) =>
  sendEmail({
    to: user.email,
    subject: `Order #${order._id} Confirmed`,
    html: `<h2>Thanks for your order, ${user.name}!</h2>
           <p>Your order of <strong>$${order.totalAmount}</strong> has been received and is being processed.</p>
           <p>Order ID: <code>${order._id}</code></p>`,
  });

const sendVendorNewOrder = (order, vendor, items) =>
  sendEmail({
    to: vendor.email,
    subject: `New order received — ${items.length} item(s)`,
    html: `<h2>You have a new order!</h2>
           <p>A buyer placed an order for ${items.map(i => i.name).join(', ')}.</p>
           <p>Total payout: <strong>$${(order.totalAmount * 0.9).toFixed(2)}</strong> (after 10% platform fee)</p>`,
  });

module.exports = { sendEmail, sendOrderConfirmation, sendVendorNewOrder };
