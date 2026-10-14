(async () => {
  const status = document.getElementById('status');
  const show = (message) => { status.textContent = message; };
  try {
    const params = new URLSearchParams(location.search);
    const returnSecret = params.get('payment_intent_client_secret');
    if (returnSecret) {
      const r = await fetch(`/api/payment-status?payment_intent_client_secret=${encodeURIComponent(returnSecret)}`);
      const result = await r.json();
      if (r.ok && result.status === 'succeeded' && result.amount === 990 && result.currency === 'brl') {
        show('Pagamento de R$ 9,90 confirmado!');
        return;
      }
      if (r.ok && result.status === 'processing') { show('Pagamento em processamento.'); return; }
      show('Pagamento não concluído. Você pode tentar novamente.');
      history.replaceState(null, '', '/');
    }
    const configRes = await fetch('/api/config');
    const config = await configRes.json();
    if (!configRes.ok) throw new Error(config.error || 'Configuração indisponível');
    const stripe = Stripe(config.publishableKey);
    const elements = stripe.elements({
      mode: 'payment', amount: 990, currency: 'brl',
      paymentMethodTypes: ['card'],
      appearance: { theme: 'stripe' }
    });
    const express = elements.create('expressCheckout', {
      paymentMethods: { applePay: 'always', googlePay: 'never', link: 'never', paypal: 'never', amazonPay: 'never', klarna: 'never' },
      buttonHeight: 52,
      buttonType: { applePay: 'pay' }
    });
    express.on('ready', ({ availablePaymentMethods }) => {
      show(availablePaymentMethods && availablePaymentMethods.applePay ? '' : 'Apple Pay indisponível neste dispositivo ou navegador. Abra no Safari com Apple Pay configurado.');
    });
    express.on('confirm', async () => {
      show('Processando…');
      const submit = await elements.submit();
      if (submit.error) { show(submit.error.message || 'Erro de validação'); return; }
      const intentRes = await fetch('/api/create-payment-intent', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' });
      const data = await intentRes.json();
      if (!intentRes.ok) { show(data.error || 'Erro ao iniciar pagamento'); return; }
      const result = await stripe.confirmPayment({ elements, clientSecret: data.clientSecret, confirmParams: { return_url: location.origin + '/' }, redirect: 'if_required' });
      if (result.error) { show(result.error.message || 'Pagamento não concluído'); return; }
      if (result.paymentIntent?.status === 'succeeded') show('Pagamento de R$ 9,90 confirmado!');
      else if (result.paymentIntent?.status === 'processing') show('Pagamento em processamento.');
      else show('Verifique o status do pagamento.');
    });
    express.mount('#express-checkout-element');
  } catch (err) {
    show(err.message || 'Falha ao carregar Apple Pay');
  }
})();
