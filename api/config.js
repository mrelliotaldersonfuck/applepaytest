module.exports = async (req, res) => {
  if (req.method !== 'GET') return res.status(405).end();
  const key = process.env.STRIPE_PUBLISHABLE_KEY;
  if (!key) return res.status(500).json({ error: 'Stripe não configurada' });
  res.setHeader('Cache-Control', 'no-store');
  res.json({ publishableKey: key });
};
