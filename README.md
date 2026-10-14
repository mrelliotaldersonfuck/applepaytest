# Apple Pay Test — R$ 9,90 (pagamento real)

Site simples para GitHub + Vercel, usando Stripe Express Checkout Element. Mostra somente Apple Pay; não mostra formulário de cartão. A confirmação do Apple Pay **exige um toque do usuário**.

## Publicar

1. Crie um repositório GitHub e envie **todos os arquivos**, preservando as pastas `api/` e `public/`.
2. Na Vercel, clique em **Add New → Project**, importe o repositório e use o preset **Other** (sem build command).
3. Em **Settings → Environment Variables**, adicione:
   - `STRIPE_SECRET_KEY` = chave secreta **live** (`sk_live_...`)
   - `STRIPE_PUBLISHABLE_KEY` = chave pública **live** (`pk_live_...`)
   - `STRIPE_WEBHOOK_SECRET` = segredo da assinatura do webhook (`whsec_...`), se ativá-lo.
4. Faça deploy e abra a URL HTTPS no Safari do iPhone com cartão compatível configurado no Wallet.
5. No Dashboard Stripe, em **Payment method domains**, registre o domínio exato da Vercel e os domínios personalizados usados pelo checkout, quando necessário. Habilite pagamentos por cartão e Apple Pay na conta.
6. Em **Developers → Webhooks**, adicione `https://SEU-DOMINIO/api/webhook` para o evento `payment_intent.succeeded`; copie o segredo `whsec_...` para a Vercel e faça redeploy.

## Segurança e observações

- **REAL:** pagamentos efetivos de R$ 9,90; podem existir taxas Stripe. Faça uma compra somente se desejar ser cobrado.
- Valor `990` centavos BRL é definido no servidor, não enviado pelo navegador.
- Nunca envie `sk_live_...` ou `whsec_...` ao GitHub ou a chats.
- Apple Pay pode não aparecer em aparelhos/navegadores incompatíveis. Não há fallback para cartão neste exemplo.
- O webhook valida assinatura e apenas registra evento nos logs; para entrega de produtos, adicione persistência idempotente em banco de dados.
- O endpoint de criação não implementa rate limiting ou antifraude adicional. Para site público de alto tráfego, adicione essas proteções e políticas adequadas de venda.
- Para testar sem cobrança, use temporariamente chaves `pk_test_...` e `sk_test_...` da mesma conta, nunca misturadas com live.

## Desenvolvimento local

`npm install` e `npx vercel dev`, com variáveis configuradas no ambiente local. Apple Pay requer HTTPS/domínio elegível para testes confiáveis.
