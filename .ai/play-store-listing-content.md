# Play Store Listing — Copy-Paste Content

Session: 2026-08-08. Everything here is ready to paste directly into Play
Console's Store Listing / Content Rating / Data Safety forms. Assets
referenced below are in `play-store-assets/` (gitignored — generated
deliverables, not app source, so they're not committed).

## Assets

| Play Console field | File | Notes |
|---|---|---|
| App icon (hi-res) | `play-store-assets/icon-512.png` | 512×512, no alpha — ready as-is |
| Feature graphic | `play-store-assets/feature-graphic-1024x500.png` | 1024×500 |
| Phone screenshots | `play-store-assets/screenshots/01-home.png` … `05-checkout.png` | 1082×2402, real production site, captured 2026-08-08. `05-checkout.png` shows the guest sign-in gate — swap for a logged-in checkout screenshot yourself if you'd rather show the actual payment/shipping form (I didn't log in with your account credentials to get one) |

## Short description (max 80 chars)

```
Genuine Arduino, ESP32, Raspberry Pi & IoT kits — fast delivery, GST invoice
```
(78 characters)

## Full description (max 4000 chars)

```
AKR Electronics — India's store for genuine IoT components, development
boards, sensors and complete starter kits.

WHAT YOU'LL FIND
• Arduino, ESP32, Raspberry Pi and other development boards
• Sensors, displays, motors & drivers, power & wireless modules
• Curated IoT starter kits with project guides — great for students and first
  builds
• 500+ components across Development Boards, Sensors, Displays & LEDs,
  Motors & Drivers, Power & Batteries, IoT & Wireless, and Tools &
  Prototyping

WHY BUY FROM AKR ELECTRONICS
• Genuine parts with clear GST-inclusive pricing on every listing
• Fast dispatch across India, with free delivery above a minimum order value
• Cash on Delivery, UPI, cards and net banking supported
• GST invoice on every order
• Compare products side by side before you buy
• Track your order anytime — no login required
• Wishlist and cart stay in sync across your devices
• Bulk / B2B ordering for institutions and teams

BUILT FOR MAKERS
Whether you're a student working on a college project, a hobbyist
prototyping your next build, or a startup sourcing components at scale, AKR
Electronics is built to get the right part into your hands quickly — with
honest pricing and no guesswork.

Questions or support: reach us via the in-app Contact page, or write to
privacy@akrelectronics.com.
```
(character count comfortably under 4000 — expand with more product detail
if you want to use the remaining space)

## Content rating questionnaire (IARC)

Straightforward e-commerce app selling electronic components — no
user-generated content beyond product reviews/Q&A (moderated), no violence,
no gambling, no mature content. Expected outcome: **Everyone**.

When asked about specific categories, answer "No" to: violence, sexual
content, profanity, controlled substances, gambling. Answer "Yes" to: users
can interact/communicate (reviews & Q&A are visible to other users) —
this may bump it to a slightly higher tier in some regions' rating boards;
that's expected and fine.

## Data Safety form

**Data collected (linked to user identity):**
| Data type | Collected? | Purpose | Shared with 3rd parties? |
|---|---|---|---|
| Name | Yes | App functionality (orders) | No |
| Email address | Yes | App functionality, account management | No |
| Phone number | Yes | App functionality (delivery/order contact) | No |
| Physical address | Yes | App functionality (delivery) | No |
| Purchase history | Yes | App functionality | No |

**Not collected:** precise/approximate location, photos/videos, contacts,
calendar, advertising ID, analytics identifiers, financial account numbers
(payments are handled by Razorpay — this app never sees/stores card or UPI
credentials).

**Security practices:**
- Data encrypted in transit: **Yes** (HTTPS / Firestore)
- Users can request data deletion: **Yes** — via `privacy@akrelectronics.com`
  (stated in the in-app Privacy Policy)

**If/when push notifications are turned on later** (currently
feature-flagged off — see `.ai/play-store-checklist.md`), come back and add
a "Device or other identifiers" entry for the push token.

## Category & contact

- **App category:** Shopping
- **Target audience:** General / not directed at children
- **Privacy Policy URL:** `https://akr-electronics.vercel.app/privacy-policy`
- **Support email:** `privacy@akrelectronics.com` (or set up a dedicated
  `support@` address if you'd rather keep that separate)
