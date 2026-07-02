# Competitive Analysis: Robu.in → AKR Electronics Improvement Roadmap

**Date**: 2026-07-02
**Source**: Deep crawl of robu.in (homepage, shop, product pages, campaign pages, footer)
**Purpose**: Identify what India's leading IoT components store does that AKR should adopt

---

## 1. Who Robu.in Is

- Operated by **MACFOS LIMITED** — a publicly listed company (has Investor Relations page)
- India's dominant electronics/robotics components e-commerce store
- Tech: **Next.js storefront** (same stack as AKR), S3 media (ap-south-1 Mumbai), Cloudflare bot protection, GTM + GA4 analytics, Android + iOS apps
- Runs brand-partnered national competitions (Arduino Physical AI Challenge 2026 with Qualcomm, ₹30L+ prizes)

## 2. Complete Feature Inventory (what they have)

### Commerce Core
| Feature | Detail |
|---|---|
| GST-inclusive pricing | Every price shows "₹ X (Incl. GST)" — Indian legal/UX norm |
| Cash on Delivery | Trust badge on every product page |
| Free delivery threshold | "Free Delivery Above ₹999" badge |
| Pincode delivery estimator | "📍 Check estimated delivery" on product page |
| Buy Now (skip cart) | Alongside Add to Cart |
| Stock status | "Availability: In Stock" per product |
| SKU system | Visible SKU (e.g. R257713) on every product |
| Quantity stepper | +/- controls |
| Product comparison tool | /product-comparision/ |
| Order tracking page | /order-tracking/ (public, no login) |
| Loyalty program | "Robu Points" ~1% earn rate, shown on product page |
| Coupons/offers | Promo banners with campaign codes |

### Product Page (richest page — tabs)
1. **Description** (long-form + Features list + "Package Includes" full BOM)
2. **Specification** (key-value table incl. shipping weight/dimensions)
3. **Warranty** (15-day warranty terms + what voids it)
4. **Reviews** (histogram by star, verified reviewer names, dates, add-review form)
5. **QnA** (registered users ask questions)
6. **Country of Origin** (Legal Metrology compliance — mandatory in India!)
- Plus: breadcrumbs (full category path), image gallery + thumbnails, brand link, category link, wishlist, compare, bulk-order CTA ("sales@robu.in"), support CTA, related products

### Catalog & Navigation
- **Massive hierarchical mega-menu**: 3 levels deep, ~15 top categories, hundreds of subcategories
- Category grid with photos on homepage
- Smart search with query suggestions ("Arduino UNO R3", "how to make a drone") — promoted via YouTube video
- New Arrivals page, Featured Brands page, brand pages (/brand/xyz)

### Marketing Machine
- **Hero carousel**: 10 rotating banners, every link UTM-tagged (source/medium/campaign)
- **Announcement bar**: competition promo above header
- **Campaign landing pages**: dynamic slug pages (the Arduino challenge page)
- **Influencer marketing**: UTM-tracked influencer links
- **Newsletter** signup in footer
- **Competitions**: purchase-proof-required contests = direct sales driver
- Blogs + Tutorials + Videos content hub (SEO + community)
- JSON-LD structured data (Organization, WebSite + SearchAction)

### Community & Ecosystem (their moat)
- Community forum (forum.robu.in)
- **BOM Tool** — paste a bill of materials, auto-build cart (genius for engineers)
- B2B/Bulk enquiry channel (/businesstobusiness/)
- **ATL Kits** (Atal Tinkering Labs — government school program sales channel)
- "Sell on Robu" marketplace (third-party sellers)
- Services: PCB manufacturing, 3D printing, laser cutting, custom battery packs
- Private-label brands: SmartElex, Pro-Range, SimpliFly
- Refurbished & "partial working" products (recommerce, budget segment)
- E-waste collection points (compliance + green cred)

### Support & Trust
- Toll-free 1800 number + hours in header/footer
- Dedicated helpdesk (support.robu.in ticket system)
- FAQ knowledgebase
- 15-day warranty policy
- Full policy pages: privacy, ToS, shipping & refund, CSR, investor relations

---

## 3. Gap Analysis: AKR vs Robu.in

**AKR already has**: design system, product listing/detail UI, cart/checkout UI, wishlist, profile, admin skeleton, Firestore service layer — but **frontend runs on mock data, auth is localStorage-mock, no payments**.

| Area | Robu.in | AKR today | Gap |
|---|---|---|---|
| Real backend | ✅ | ❌ mock data | CRITICAL |
| Payments (Razorpay/COD) | ✅ | ❌ | CRITICAL |
| GST-inclusive pricing | ✅ | ❌ | HIGH (legal/UX) |
| Country of origin | ✅ | ❌ | HIGH (legal) |
| Delivery estimator | ✅ | ❌ | HIGH |
| Product tabs (specs/warranty/QnA) | ✅ | Partial | MEDIUM |
| SEO / JSON-LD / sitemap | ✅ | ❌ | HIGH |
| Analytics (GA4/UTM) | ✅ | ❌ | HIGH |
| Order tracking | ✅ | UI only | MEDIUM |
| Loyalty points | ✅ | ❌ | LOW (later) |
| Content hub (blog/tutorials) | ✅ | ❌ | MEDIUM |
| Campaign landing pages | ✅ | ❌ | MEDIUM |
| Comparison tool | ✅ | ❌ | LOW |
| BOM tool | ✅ | ❌ | LOW (differentiator later) |
| Forum/community | ✅ | ❌ | LOW (later) |
| B2B channel | ✅ | ❌ | LOW (later) |
| Mobile apps | ✅ | ❌ | Not planned |

---

## 4. Prioritized Roadmap for AKR

### P0 — Make it real (Phase 14, prerequisite for everything)
1. Wire frontend to real Firestore APIs (products, cart, orders) — remove mock data
2. Real Firebase Authentication (replace localStorage mock)
3. Razorpay integration + **Cash on Delivery** option
4. Order lifecycle: place → confirm → track → deliver (status updates in admin)
5. Deploy to Vercel with real env vars

### P1 — Indian e-commerce table stakes (conversion)
6. **GST-inclusive pricing** display everywhere + GST invoice generation
7. **Country of Origin** field on products (Legal Metrology compliance)
8. Pincode-based **delivery estimator** on product page
9. Trust badges row: warranty / free delivery threshold / COD
10. Product page upgrade: tabbed Description | Specification | Warranty | Reviews | QnA, "Package Includes" list for kits, breadcrumbs, SKU display, Buy Now button
11. Public **order tracking page** (order ID + email, no login)

### P2 — Traffic engine (SEO + analytics)
12. JSON-LD: Organization, WebSite+SearchAction, Product (price/stock/rating), BreadcrumbList
13. sitemap.xml + robots.txt + per-page metadata + OpenGraph
14. GA4 + GTM with e-commerce events (view_item, add_to_cart, purchase)
15. UTM convention for all campaigns; announcement bar + hero carousel with UTM-tagged banners
16. Blog/tutorials section (MDX or Firestore-backed) — IoT project guides drive organic traffic

### P3 — Retention & marketing
17. Campaign landing page system (dynamic slug pages, countdown timer component)
18. Coupon engine wired to checkout (coupon service exists, needs UI + rules)
19. Newsletter capture + email notifications (order confirmations first)
20. Loyalty points ("AKR Points", ~1% earn rate)
21. Product comparison tool
22. Reviews + QnA submission flows (review service exists)

### P4 — Moat (later, post-launch)
23. BOM tool (paste parts list → auto cart) — high differentiation, low competition
24. B2B/bulk enquiry channel + student/institution (ATL-style) programs
25. Community: contests with purchase-proof mechanic, forum, videos
26. Refurbished/open-box section
27. Media to cloud storage (S3/Firebase Storage) instead of local filesystem

---

## 5. Key Strategic Lessons

1. **Robu sells trust, not components**: toll-free number, warranty terms, COD, GST invoices, order tracking — every anxiety a first-time Indian buyer has is answered on the product page.
2. **Content = free traffic**: tutorials/blogs/videos + smart search suggestions capture "how to make a drone" queries, not just "buy Arduino".
3. **Competitions are sales engines**: purchase proof required to enter = every participant is a customer.
4. **Everything is measured**: every banner, influencer link and campaign carries UTM tags into GA4.
5. **Ecosystem beats catalog**: forum, BOM tool, services, B2B, school programs make Robu the default destination — AKR should pick 1–2 of these as differentiators rather than copying all.
