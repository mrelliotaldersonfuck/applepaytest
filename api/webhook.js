const Stripe = require('stripe');
module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).end();
  if (!process.env.STRIPE_WEBHOOK_SECRET || !process.env.STRIPE_SECRET_KEY) return res.status(500).end();
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  try {
    const chunks = [];
    for await (const chunk of req) chunks.push(Buffer.from(chunk));
    const payload = Buffer.concat(chunks);
    const event = stripe.webhooks.constructEvent(payload, req.headers['stripe-signature'], process.env.STRIPE_WEBHOOK_SECRET);
    if (event.type === 'payment_intent.succeeded') {
      const payment = event.data.object;
      console.log('Pagamento confirmado:', payment.id, payment.amount, payment.currency);
      // Em produção: registre a confirmação no banco de dados de forma idempotente.
    }
    return res.status(200).json({ received: true });
  } catch (err) {
    console.error('Webhook inválido:', err.message);
    return res.status(400).send('Assinatura inválida');
  }
};
module.exports.config = { api: { bodyParser: false } };
