import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const publicDir = path.join(__dirname, 'public');
const app = express();
const port = Number(process.env.PORT ?? 3000);

const catalog = {
  storeName: 'Northstar Outfitters',
  cartItems: [
    { id: 'sku-hoodie', name: 'Trailhead Hoodie', price: 78, quantity: 1 },
    { id: 'sku-bottle', name: 'Insulated Bottle', price: 24, quantity: 2 },
    { id: 'sku-socks', name: 'Merino Socks', price: 16, quantity: 1 }
  ],
  shippingMethods: [
    { id: 'standard', label: 'Standard', price: 8, eta: '3-5 business days' },
    { id: 'express', label: 'Express', price: 19, eta: '1-2 business days' }
  ],
  paymentMethods: ['Credit Card', 'Apple Pay', 'PayPal']
};

function calculateSubtotal() {
  return catalog.cartItems.reduce((total, item) => total + item.price * item.quantity, 0);
}

function calculateTotal(shippingMethodId) {
  const shipping = catalog.shippingMethods.find((method) => method.id === shippingMethodId) ?? catalog.shippingMethods[0];
  return calculateSubtotal() + shipping.price;
}

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(publicDir));

app.get('/api/checkout-context', (_request, response) => {
  response.json({
    storeName: catalog.storeName,
    user: {
      displayName: 'Ada Lovelace',
      email: 'ada@example.com',
      authenticated: true
    },
    cartItems: catalog.cartItems,
    shippingMethods: catalog.shippingMethods,
    paymentMethods: catalog.paymentMethods,
    subtotal: calculateSubtotal(),
    recommendedShippingMethodId: 'standard'
  });
});

app.post('/api/checkout', (request, response) => {
  const payload = request.body ?? {};
  const shipping = payload.shipping ?? {};
  const paymentMethod = payload.paymentMethod ?? 'Credit Card';

  if (!shipping.name || !shipping.address || !shipping.postalCode) {
    response.status(400).json({
      ok: false,
      error: 'Shipping address is incomplete.'
    });
    return;
  }

  if (payload.forceFailure === true || process.env.CHECKOUT_FORCE_500 === '1') {
    response.status(500).json({
      ok: false,
      error: 'Upstream payment authorization failed.'
    });
    return;
  }

  const shippingMethodId = payload.shippingMethodId ?? 'standard';
  response.json({
    ok: true,
    orderId: 'ORD-2026-06-02-1842',
    paymentMethod,
    shippingMethodId,
    total: calculateTotal(shippingMethodId),
    confirmationMessage: 'Order confirmed. Receipt sent to the demo inbox.'
  });
});

app.get('/', (_request, response) => {
  response.sendFile(path.join(publicDir, 'index.html'));
});

app.listen(port, () => {
  // The demo intentionally stays local and deterministic.
  console.log(`Northstar Outfitters listening on http://127.0.0.1:${port}`);
});
