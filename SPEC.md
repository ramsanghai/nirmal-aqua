# Nirmal Aqua — shared contract (mobile / admin / automation)

Brand: **Nirmal Aqua** (water purifier e-commerce). Currency INR. Roles are exact strings: `"Customer" | "Dealer" | "Admin"`.

## Firestore
users/{uid}
  name, email, phone, role ("Customer"|"Dealer"|"Admin"),
  dealerStatus ("none"|"pending"|"approved"|"rejected")  // Dealers must be "approved" to see wholesale prices / order
  businessName?, gstin?, city?,
  referralCode (6 chars), referredBy? (code), referralCredits (number, INR),
  fcmToken? (native FCM device token), createdAt (ms number)

products/{id}   // id = slug
  name, brand, category ("Purifiers"|"Dispensers"|"Pumps"|"Filters"|"Spares"),
  description, specs: string[], mrp, price (retail), wholesalePrice, minBulkQty (dealer min qty per line, default 5),
  image (public URL), images: string[], stock, rating (number), reviews (number), featured (bool), createdAt

orders/{id}
  userId, userName, userEmail, userPhone, role ("Customer"|"Dealer"),
  items: [{productId,name,image,qty,unitPrice}], subtotal, discount (referral credit used), total,
  address: {label, line, lat, lng, phone},
  paymentId, paymentStatus ("paid"|"pending"), paymentMethod ("razorpay"|"cod"),
  status ("placed"|"confirmed"|"shipped"|"delivered"|"cancelled"), isBulk (bool), createdAt, updatedAt

services/{id}
  userId, userName, userEmail, userPhone,
  type ("Installation"|"Repair"|"Filter change"|"AMC"), productName, date (YYYY-MM-DD), slot ("10-12"|"12-3"|"3-6"),
  address: {line, lat, lng}, notes,
  status ("requested"|"scheduled"|"completed"|"cancelled"), adminNote?, createdAt, updatedAt

## Notification API (Next.js on Vercel, admin app)
POST {ADMIN_URL}/api/notify   headers: Authorization: Bearer <Firebase ID token>
body: { kind, id }
kinds: order_placed(id=orderId, caller=owner) | order_status(orderId, caller=Admin) |
       dealer_decision(uid, caller=Admin) | service_booked(serviceId, caller=owner) | service_update(serviceId, caller=Admin)
Server loads docs itself (never trusts client text), then sends: FCM push to the target user's fcmToken
(and to all Admin users for order_placed/service_booked/new dealer), EmailJS email (REST), TextBee SMS (REST).
CORS: allow all origins for POST/OPTIONS.

## Admin panel
Next.js (App Router) deployed on Vercel. Firebase Auth email+password; only users/{uid}.role==="Admin" may enter.
Pages: Dashboard, Orders (filter, status update), Dealers (approve/reject), Service desk (schedule/complete), Products (list, edit price/stock).
Also hosts product images at /products/<id>.jpg (public folder) — these URLs go in products.image.
