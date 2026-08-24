export type RazorpayPrefill = {
  name?: string;
  email?: string;
  contact?: string;
};

export type RazorpayOrderParams = {
  keyId: string;
  razorpayOrderId: string;
  amount: number;
  currency: string;
  orderNumber: string;
  prefill?: RazorpayPrefill;
};

declare global {
  interface Window {
    Razorpay?: any;
  }
}

let scriptPromise: Promise<boolean> | null = null;

export function loadRazorpayScript(): Promise<boolean> {
  if (typeof window === 'undefined') return Promise.resolve(false);
  if (window.Razorpay) return Promise.resolve(true);
  if (scriptPromise) return scriptPromise;
  scriptPromise = new Promise<boolean>((resolve) => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
  return scriptPromise;
}

export async function openRazorpayCheckout(params: RazorpayOrderParams): Promise<{
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}> {
  const loaded = await loadRazorpayScript();
  if (!loaded || !window.Razorpay) {
    throw new Error('Razorpay SDK failed to load');
  }
  return new Promise((resolve, reject) => {
    const options = {
      key: params.keyId,
      amount: params.amount,
      currency: params.currency,
      name: 'SARWA',
      description: `Order ${params.orderNumber}`,
      order_id: params.razorpayOrderId,
      prefill: params.prefill || {},
      theme: { color: '#C9A961' },
      modal: { ondismiss: () => reject(new Error('Payment cancelled by user')) },
      handler: (response: any) => resolve(response),
    };
    const rzp = new window.Razorpay(options);
    rzp.on('payment.failed', (resp: any) => reject(new Error(resp?.error?.description || 'Payment failed')));
    rzp.open();
  });
}