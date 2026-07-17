# SARWA API Reference

Base: `/api/v1`. Auth via `Authorization: Bearer <accessToken>` unless noted.

## Auth
- `POST /auth/register`
- `POST /auth/login`
- `POST /auth/refresh`
- `POST /auth/logout`
- `POST /auth/forgot-password`
- `POST /auth/reset-password`
- `GET  /auth/me`

## Products
- `GET  /products` — filters, search, pagination
- `GET  /products/:slug`
- `GET  /products/:id/related`
- `POST /admin/products`
- `PUT  /admin/products/:id`
- `POST /admin/products/:id/duplicate`
- `DELETE /admin/products/:id`

## Categories
- `GET /categories` (tree)
- `POST /admin/categories`

## Menus
- `GET /menus` (public mega menu structure)
- `POST /admin/menus`
- `PUT  /admin/menus/reorder`
- `DELETE /admin/menus/:id`

## Banners
- `GET  /banners?position=hero`
- `POST /admin/banners`
- `PUT  /admin/banners/:id`
- `DELETE /admin/banners/:id`

## Cart / Wishlist / Orders
- `GET /cart`
- `POST /cart/items`
- `PATCH /cart/items/:id`
- `DELETE /cart/items/:id`
- `POST /cart/coupon`
- `GET /wishlist`
- `POST /wishlist`
- `POST /checkout`
- `POST /orders/:id/cancel`
- `POST /orders/:id/refund`

## Customer
- `GET /customer/orders`
- `GET /customer/addresses`
- `POST /customer/addresses`

## CMS / Blog
- `GET /pages/:slug`
- `GET /blogs`
- `GET /blogs/:slug`
- `POST /blogs/:id/comments`

## Admin
- `GET /admin/dashboard`
- `GET /admin/orders`
- `PATCH /admin/orders/:id/status`
- `GET /admin/customers`
- `POST /admin/coupons`
- `GET /admin/reviews`
- `PATCH /admin/reviews/:id`
- `GET /admin/users` (admin only)

All admin endpoints require `role ∈ {ADMIN, MANAGER, EDITOR, STAFF}` with permission mapping.
