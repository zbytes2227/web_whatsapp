require('dotenv').config();
const { Router } = require('express'); 
const qrcode = require('qrcode');
const path = require('path'); 
const { Client, LocalAuth, MessageMedia } = require('whatsapp-web.js');

const router = Router();
const mediaPath = path.join(__dirname, '../public/images/poster.png'); 
  media = MessageMedia.fromFilePath(mediaPath);

// WhatsApp client setup
const client = new Client({
  authStrategy: new LocalAuth({
    dataPath: process.env.WWEBJS_AUTH_PATH || path.join(__dirname, '../.wwebjs_auth')
  }),
  puppeteer: {
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  }
});

let qrCodeBase64 = null;
let status = 'unauthenticated';

// --- Event Handlers ---
client.on('qr', async (qr) => {
  status = 'qr';
  qrCodeBase64 = await qrcode.toDataURL(qr, { scale: 4 });
  console.log('QR Code available at /api/qr');
});

client.on('authenticated', () => {
  status = 'authenticated';
  console.log('Authenticated');
});

client.on('ready', () => {
  status = 'ready';
  console.log('Client is ready!');
});

client.on('auth_failure', () => {
  status = 'auth_failure';
  console.error('Authentication failed');
});

client.on('disconnected', (reason) => {
  status = 'disconnected';
  console.log('Client logged out:', reason);
});

client.initialize();

// --- API Endpoints ---

// Get QR code
router.get('/api/qr', (req, res) => {
  if (!qrCodeBase64) {
    return res.status(400).json({ error: 'No QR code available yet. Please wait...' });
  }
  res.json({ qr: qrCodeBase64 });
});

// Get status
router.get('/api/status', (req, res) => {
  res.json({ status });
});

// Send messages
router.post('/api/send-message', async (req, res) => {
  if (status !== 'ready') {
    return res.status(400).json({ error: 'WhatsApp client not ready. Please authenticate first.' });
  }

  const { numbers, message } = req.body;
  if (!numbers || !Array.isArray(numbers) || numbers.length === 0) {
    return res.status(400).json({ error: 'Please provide an array of numbers.' });
  }
  if (!message) {
    return res.status(400).json({ error: 'Please provide a message.' });
  }

  function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
  const report = [];
 for (const number of numbers) {
  const chatId = number.replace(/[^0-9]/g, '') + '@c.us';
  try {
    const isRegistered = await client.isRegisteredUser(chatId);
    if (!isRegistered) {
      report.push({ number, status: 'failed', message: 'Not registered on WhatsApp' });
      await delay(2000); // Optional: Wait even if user not registered
      continue;
    } 
     await client.sendMessage(chatId, message);
    await client.sendMessage(chatId, media, { caption: message });
    report.push({ number, status: 'success', message: 'Text and photo sent' });
    await delay(2000); // Wait 2 seconds after each successful send
  } catch (err) {
    report.push({ number, status: 'failed', message: err.message });
    await delay(2000); // Optional: Wait even if error
  }
}


  res.json({ report });
});

module.exports = router;
