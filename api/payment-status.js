const Stripe = require('stripe');
module.exports = async (req, res) => {
  if (req.method !== 'GET') return res.status(405).end();
  const secret = req.query.payment_intent_client_secret;
  if (typeof secret !== 'string' || !/^pi_[^\s]+_secret_[^\s]+$/.test(secret)) return res.status(400).json({ error: 'Identificador inválido' });
  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    const intentId = secret.split('_secret_')[0];
    const intent = await stripe.paymentIntents.retrieve(intentId);
    if (intent.client_secret !== secret) return res.status(403).end();
    res.setHeader('Cache-Control', 'no-store');
    res.json({ status: intent.status, amount: intent.amount, currency: intent.currency });
  } catch (err) {
    res.status(400).json({ error: 'Não foi possível consultar o pagamento' });
  }
};
