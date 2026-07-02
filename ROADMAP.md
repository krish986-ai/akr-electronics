# A.K.R Electronics — Master Roadmap

**Goal**: Build India's next great IoT components store — feature parity with the
market leader, with a modern tech structure and AKR's own identity.

**Stack**: Next.js 16 · React 18 · TypeScript · Tailwind · Firebase (Auth/Firestore/Storage) · Razorpay · Vercel (bom1)

**Reference analysis**: `.ai/competitive-analysis-robu.md`

---

## Phase 15 — Storefront Rebuild (CURRENT)

Rebuild the customer website with the full feature structure of a serious
Indian electronics store. Runs on the mock data layer; backend wiring is Phase 17.

### 15.1 Domain model upgrade
- [ ] Rich `Product`: SKU, GST-inclusive pricing, MRP + sale price, brand,
      hierarchical category, specifications table, package contents,
      warranty terms, country of origin, stock, badges (featured/bestseller/new)
- [ ] `Brand`, hierarchical `Category` (parent/children), `Banner`,
      `Coupon`, `Review` (histogram-ready), `Question` (QnA)

### 15.2 Layout & navigation
- [ ] Announcement bar (campaign strip above header)
- [ ] Top bar: support phone, email, social links
- [ ] Header: logo, smart search with suggestions, compare/track/wishlist/cart icons
- [ ] Category mega-menu (hierarchical, hover dropdowns; accordion on mobile)
- [ ] Footer: newsletter signup, support hours + phone, Information / My Account /
      Services / Policies columns, social row, copyright

### 15.3 Homepage
- [ ] Hero banner carousel (campaign banners, UTM-ready links)
- [ ] Category grid with images
- [ ] Featured products rail · New arrivals rail · Bestsellers rail
- [ ] Trust badges strip (warranty · free delivery ≥ threshold · COD · GST invoice)
- [ ] Services strip (kits sourcing, bulk orders, student discounts)
- [ ] Newsletter section

### 15.4 Product experience
- [ ] Product detail: breadcrumb trail, image gallery + thumbnails,
      GST-inclusive price + MRP strike-through, SKU, stock status,
      pincode delivery estimator, quantity stepper, Add to Cart + **Buy Now**,
      wishlist + compare buttons, bulk-order CTA, trust badges
- [ ] Tabs: Description | Specification | Warranty | Reviews | QnA | Country of Origin
- [ ] "Package Includes" list for kits
- [ ] Related products rail
- [ ] Listing page: filter sidebar (category tree, brand, price, availability),
      sort, pagination, breadcrumbs

### 15.5 Utility pages
- [ ] Public order tracking (/track-order — order ID + email, no login)
- [ ] Product comparison (/compare — up to 4 products)
- [ ] New arrivals (/new-arrivals)
- [ ] About, Contact, Bulk Orders (B2B enquiry form)
- [ ] Policies: Privacy, Terms of Service, Shipping & Refund

## Phase 16 — Admin Panel Rebuild (CURRENT)

- [ ] Sidebar shell: Dashboard, Orders, Products, Categories, Brands,
      Banners, Coupons, Customers, Reviews, Settings
- [ ] Dashboard: revenue/orders/customers/low-stock stat cards, recent orders,
      top products
- [ ] Products manager: table with search/filter, editor covering all rich
      fields (pricing incl. GST, specs key-value editor, warranty, origin,
      package contents, images, badges, stock)
- [ ] Categories manager: hierarchical tree editing
- [ ] Brands manager
- [ ] Banners/campaigns manager (hero carousel + announcement bar control)
- [ ] Coupons manager (code, %/flat, min order, expiry, usage limit)
- [ ] Orders manager: status pipeline (pending → confirmed → shipped →
      delivered), payment status, order detail view
- [ ] Customers manager: list, order history
- [ ] Reviews & QnA moderation (approve/reject, answer questions)
- [ ] Settings: store info, delivery thresholds, GST rate, support contacts

## Phase 17 — Backend Integration (make it real)

- [ ] Replace mock data with Firestore repositories on every page
- [ ] Real Firebase Auth (email/password + Google) replacing localStorage mock
- [ ] Cart/wishlist/compare persistence (Firestore for logged-in, localStorage guest, merge on login)
- [ ] Order lifecycle end-to-end: place → admin status updates → tracking page
- [ ] Reviews/QnA submission with moderation flow
- [ ] Admin CRUD wired to Firestore + Firebase Storage image uploads
- [ ] Firestore security rules deployed
- [ ] Seed script loading the catalog into Firestore

## Phase 18 — Payments & Transactional Email

- [ ] Razorpay checkout (cards, UPI, netbanking, wallets)
- [ ] Cash on Delivery option with COD rules (threshold, pincode eligibility)
- [ ] Payment webhook verification
- [ ] GST invoice generation (PDF) per order
- [ ] Email notifications: order confirmation, shipping, delivery (free tier: Resend/Brevo)

## Phase 19 — Traffic Engine (SEO + Analytics)

- [ ] JSON-LD: Organization, WebSite + SearchAction, Product, BreadcrumbList
- [ ] sitemap.xml + robots.txt + canonical URLs + OpenGraph/Twitter meta
- [ ] GA4 + GTM with e-commerce events (view_item, add_to_cart, begin_checkout, purchase)
- [ ] UTM convention for all campaign links
- [ ] Blog/tutorials hub (IoT project guides — organic traffic driver)

## Phase 20 — Retention & Marketing

- [ ] Campaign landing page system (dynamic slug pages, countdown timer)
- [ ] Coupon engine wired to checkout
- [ ] AKR Points loyalty program (~1% earn rate)
- [ ] Newsletter automation
- [ ] Contest/competition page template (purchase-proof mechanic)

## Phase 21 — Launch Hardening

- [ ] Rate limiting on APIs, input hardening
- [ ] Performance: image optimization strategy within Vercel free-tier limits
- [ ] Accessibility audit (WCAG AA)
- [ ] Vercel Pro upgrade decision before commercial sales
- [ ] Custom domain + monitoring

## Phase 22 — Moat (differentiators, post-launch)

- [ ] BOM tool: paste a parts list → auto-build cart
- [ ] B2B portal: bulk pricing tiers, GST-billed quotes
- [ ] Student/institution programs (ATL-style school kits channel)
- [ ] Refurbished/open-box section
- [ ] Community: project showcases, forum

---

**Progress log**
- 2026-07-02: Roadmap created. Phase 15 + 16 started (storefront + admin rebuild on mock data).
