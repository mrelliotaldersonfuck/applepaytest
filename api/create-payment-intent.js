const Stripe = require('stripe');
module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método não permitido' });
  if (!process.env.STRIPE_SECRET_KEY) return res.status(500).json({ error: 'Stripe não configurada' });
  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    const intent = await stripe.paymentIntents.create({
      amount: 990,
      currency: 'brl',
      payment_method_types: ['card'],
      description: 'Pagamento Apple Pay - R$ 9,90',
      metadata: { product: 'applepay-test' }
    });
    res.setHeader('Cache-Control', 'no-store');
    return res.status(200).json({ clientSecret: intent.client_secret });
  } catch (err) {
    console.error('Stripe create intent:', err.message);
    return res.status(500).json({ error: 'Não foi possível iniciar o pagamento' });
  }
};
