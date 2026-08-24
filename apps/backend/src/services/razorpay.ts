import Razorpay from 'razorpay';
import crypto from 'crypto';
import { config } from '../config';

let _client: Razorpay | null = null;

export function getRazorpay(): Razorpay {
  if (!_client) {
    _client = new Razorpay({
      key_id: config.razorpay.keyId,
      key_secret: config.razorpay.keySecret,
    });
  }
  return _client;
}

export interface CreateOrderInput {
  amountInPaise: number;
  currency?: string;
  receipt: string;
  notes?: Record<string, string>;
}

export async function createRazorpayOrder(input: CreateOrderInput) {
  const rzp = getRazorpay();
  return rzp.orders.create({
    amount: input.amountInPaise,
    currency: input.currency || 'INR',
    receipt: input.receipt,
    notes: input.notes || {},
  });
}

export function verifyPaymentSignature(params: {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}): boolean {
  const body = `${params.razorpay_order_id}|${params.razorpay_payment_id}`;
  const expected = crypto
    .createHmac('sha256', config.razorpay.keySecret)
    .update(body)
    .digest('hex');
  try {
    return crypto.timingSafeEqual(
      Buffer.from(expected, 'hex'),
      Buffer.from(params.razorpay_signature, 'hex')
    );
  } catch {
    return false;
  }
}

export function verifyWebhookSignature(body: string, signature: string, secret?: string): boolean {
  const webhookSecret = secret || process.env.RAZORPAY_WEBHOOK_SECRET || '';
  if (!webhookSecret) return false;
  const expected = crypto.createHmac('sha256', webhookSecret).update(body).digest('hex');
  try {
    return crypto.timingSafeEqual(
      Buffer.from(expected, 'hex'),
      Buffer.from(signature, 'hex')
    );
  } catch {
    return false;
  }
}

export function toPaise(rupees: number): number {
  return Math.round(rupees * 100);
}