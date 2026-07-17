import { Router } from 'express';
import { z } from 'zod';
import { COOKIE_CART_ID, calculateShipping, calculateTax, FREE_SHIPPING_ABOVE } from '@sarwa/shared';
import { prisma } from '@sarwa/prisma';
import { created, notFound, ok } from '../utils/response';
import { authenticate, optionalAuth, AuthedRequest } from '../middleware/auth';

const router = Router();

async function getOrCreateCart(req: AuthedRequest) {
  if (req.user) {
    let cart = await prisma.cart.findUnique({ where: { userId: req.user.sub }, include: { items: true } });
    if (!cart) cart = await prisma.cart.create({ data: { userId: req.user.sub }, include: { items: true } });
    return cart;
  }
  const guestId = (req as any).cookies?.sarwa_guest;
  if (guestId) {
    let cart = await prisma.cart.findUnique({ where: { guestId }, include: { items: true } });
    if (!cart) cart = await prisma.cart.create({ data: { guestId }, include: { items: true } });
    return cart;
  }
  const newCart = await prisma.cart.create({ data: {}, include: { items: true } });
  return newCart;
}

async function recalc(cartId: string) {
  const items = await prisma.cartItem.findMany({ where: { cartId } });
  const subtotal = items.reduce((s, i) => s + Number(i.unitPrice) * i.quantity, 0);
  const shipping = calculateShipping(subtotal, FREE_SHIPPING_ABOVE);
  const tax = calculateTax(subtotal);
  const total = subtotal + shipping + tax;
  return prisma.cart.update({
    where: { id: cartId },
    data: { subtotal, shipping, tax, total },
    include: { items: true },
  });
}

router.get('/', optionalAuth, async (req: AuthedRequest, res, next) => {
  try {
    const cart = await getOrCreateCart(req);
    return ok(res, cart);
  } catch (e) {
    return next(e);
  }
});

router.post('/items', optionalAuth, async (req: AuthedRequest, res, next) => {
  try {
    const schema = z.object({
      productId: z.string(),
      variantId: z.string().optional(),
      quantity: z.number().int().min(1).default(1),
      size: z.string().optional(),
    });
    const body = schema.parse(req.body);
    const cart = await getOrCreateCart(req);
    const product = await prisma.product.findUnique({ where: { id: body.productId } });
    if (!product) return notFound(res, 'Product not found');

    const unitPrice = Number(product.offerPrice ?? product.price);
    const item = await prisma.cartItem.create({
      data: {
        cartId: cart.id,
        productId: body.productId,
        variantId: body.variantId,
        quantity: body.quantity,
        size: body.size,
        unitPrice,
      },
    });
    const updated = await recalc(cart.id);
    return created(res, updated);
  } catch (e) {
    return next(e);
  }
});

router.patch('/items/:id', optionalAuth, async (req, res, next) => {
  try {
    const schema = z.object({ quantity: z.number().int().min(1) });
    const { quantity } = schema.parse(req.body);
    const item = await prisma.cartItem.findUnique({ where: { id: String(req.params.id) } });
    if (!item) return notFound(res);
    await prisma.cartItem.update({ where: { id: item.id }, data: { quantity } });
    const cart = await recalc(item.cartId);
    return ok(res, cart);
  } catch (e) {
    return next(e);
  }
});

router.delete('/items/:id', optionalAuth, async (req, res, next) => {
  try {
    const item = await prisma.cartItem.findUnique({ where: { id: String(req.params.id) } });
    if (!item) return notFound(res);
    await prisma.cartItem.delete({ where: { id: item.id } });
    const cart = await recalc(item.cartId);
    return ok(res, cart);
  } catch (e) {
    return next(e);
  }
});

router.post('/coupon', optionalAuth, async (req, res, next) => {
  try {
    const schema = z.object({ code: z.string(), cartId: z.string().optional() });
    const { code, cartId } = schema.parse(req.body);
    const coupon = await prisma.coupon.findUnique({ where: { code: code.toUpperCase() } });
    if (!coupon || !coupon.active) return notFound(res, 'Invalid coupon');
    if (coupon.expiry && coupon.expiry < new Date()) return notFound(res, 'Coupon expired');

    const cart = cartId
      ? await prisma.cart.findUnique({ where: { id: cartId }, include: { items: true } })
      : await getOrCreateCart(req);
    if (!cart) return notFound(res, 'Cart not found');

    const subtotal = Number(cart.subtotal);
    if (coupon.minPurchase && subtotal < Number(coupon.minPurchase)) {
      return notFound(res, `Minimum purchase ₹${coupon.minPurchase}`);
    }

    const discount =
      coupon.type === 'PERCENTAGE'
        ? Math.round((subtotal * Number(coupon.value)) / 100)
        : Number(coupon.value);

    const updated = await prisma.cart.update({
      where: { id: cart.id },
      data: {
        couponCode: coupon.code,
        discount,
        total: Math.max(0, subtotal - discount + Number(cart.shipping) + Number(cart.tax)),
      },
      include: { items: true },
    });
    return ok(res, updated);
  } catch (e) {
    return next(e);
  }
});

router.delete('/coupon', optionalAuth, async (req, res, next) => {
  try {
    const cart = await getOrCreateCart(req);
    const subtotal = Number(cart.subtotal);
    const updated = await prisma.cart.update({
      where: { id: cart.id },
      data: { couponCode: null, discount: 0, total: subtotal + Number(cart.shipping) + Number(cart.tax) },
      include: { items: true },
    });
    return ok(res, updated);
  } catch (e) {
    return next(e);
  }
});

export default router;
