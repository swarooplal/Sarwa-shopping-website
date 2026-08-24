import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '@sarwa/prisma';
import { config } from '../config';
import { ok, created, badRequest, notFound, unauthorized } from '../utils/response';
import {
  createRazorpayOrder,
  verifyPaymentSignature,
  verifyWebhookSignature,
  toPaise,
} from '../services/razorpay';

const router = Router();

// GET /payments/razorpay/key — returns public key id for the checkout widget
router.get('/razorpay/key', (_req, res) => {
  if (!config.razorpay.keyId) {
    return badRequest(res, 'Razorpay is not configured on the server');
  }
  return ok(res, { keyId: config.razorpay.keyId });
});

// POST /payments/razorpay/create-order
// Body: { orderNumber: string }
// Creates a Razorpay order for an existing DB order and returns the params needed by the widget.
router.post('/razorpay/create-order', async (req, res, next) => {
  try {
    const schema = z.object({ orderNumber: z.string() });
    const { orderNumber } = schema.parse(req.body);

    const order = await prisma.order.findUnique({ where: { orderNumber } });
    if (!order) return notFound(res, 'Order not found');
    if (order.paymentStatus === 'PAID') return badRequest(res, 'Order already paid');
    if (order.paymentMethod !== 'RAZORPAY') {
      return badRequest(res, 'Order payment method is not Razorpay');
    }

    const amount = toPaise(Number(order.total));
    const rzpOrder = await createRazorpayOrder({
      amountInPaise: amount,
      currency: 'INR',
      receipt: order.orderNumber,
      notes: { dbOrderId: order.id, orderNumber: order.orderNumber },
    });

    return created(res, {
      keyId: config.razorpay.keyId,
      razorpayOrderId: rzpOrder.id,
      amount: rzpOrder.amount,
      currency: rzpOrder.currency,
      orderNumber: order.orderNumber,
      customer: {
        name: undefined,
        email: order.guestEmail || undefined,
        contact: undefined,
      },
    });
  } catch (e: any) {
    if (e?.name === 'ZodError') return badRequest(res, 'Invalid payload');
    return next(e);
  }
});

// POST /payments/razorpay/verify
// Verifies the HMAC signature and marks the DB order as PAID.
router.post('/razorpay/verify', async (req, res, next) => {
  try {
    const schema = z.object({
      razorpay_order_id: z.string(),
      razorpay_payment_id: z.string(),
      razorpay_signature: z.string(),
      orderNumber: z.string(),
    });
    const body = schema.parse(req.body);

    const ok2 = verifyPaymentSignature({
      razorpay_order_id: body.razorpay_order_id,
      razorpay_payment_id: body.razorpay_payment_id,
      razorpay_signature: body.razorpay_signature,
    });
    if (!ok2) return badRequest(res, 'Invalid payment signature');

    const order = await prisma.order.findUnique({ where: { orderNumber: body.orderNumber } });
    if (!order) return notFound(res, 'Order not found');

    const updated = await prisma.order.update({
      where: { id: order.id },
      data: { paymentStatus: 'PAID' },
    });
    await prisma.orderTimeline.create({
      data: {
        orderId: order.id,
        status: 'PENDING',
        note: `Payment verified via Razorpay (payment id: ${body.razorpay_payment_id})`,
      },
    });

    return ok(res, { verified: true, order: { orderNumber: updated.orderNumber, paymentStatus: updated.paymentStatus } });
  } catch (e: any) {
    if (e?.name === 'ZodError') return badRequest(res, 'Invalid payload');
    return next(e);
  }
});

// POST /payments/razorpay/webhook
// Optional async webhook handler — verifies signature and updates order state.
router.post(
  '/razorpay/webhook',
  expressRaw(),
  async (req, res, next) => {
    try {
      const signature = (req.headers['x-razorpay-signature'] as string) || '';
      const raw = (req as any).rawBody as string;
      if (!raw) return badRequest(res, 'Missing body');
      if (!verifyWebhookSignature(raw, signature)) return unauthorized(res, 'Invalid webhook signature');

      const event = JSON.parse(raw);
      if (event?.event === 'payment.captured' || event?.event === 'payment.authorized') {
        const payment = event.payload?.payment?.entity;
        const rzpOrderId = payment?.order_id;
        const orderNumber = event.payload?.order?.entity?.receipt;
        if (orderNumber) {
          const order = await prisma.order.findUnique({ where: { orderNumber } });
          if (order && order.paymentStatus !== 'PAID') {
            await prisma.order.update({
              where: { id: order.id },
              data: { paymentStatus: 'PAID' },
            });
            await prisma.orderTimeline.create({
              data: {
                orderId: order.id,
                status: 'PENDING',
                note: `Payment captured via webhook (rzp order ${rzpOrderId})`,
              },
            });
          }
        }
      }
      return ok(res, { received: true });
    } catch (e) {
      return next(e);
    }
  }
);

// Helper to capture the raw body for webhook signature verification
function expressRaw() {
  const express = require('express');
  return express.raw({ type: '*/*', verify: (req: any, _res: any, buf: Buffer) => {
    req.rawBody = buf.toString('utf8');
  } });
}

export default router;