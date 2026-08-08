# Play Store Launch Checklist — AKR Electronics (Android)

Session: 2026-08-08. Covers the code/config side of getting the Capacitor
Android app ready for a first Play Store submission, plus everything that's
left that only the account owner can do (Play Console is a Google account,
not a repo).

## Already handled in code (this session)

- **App display name** set to "AKR Electronics" everywhere it's sourced
  from: `capacitor.config.ts` (`appName`), `android/app/src/main/res/values/strings.xml`
  (`app_name`, `title_activity_main`), and the offline fallback page
  (`www/index.html`). Ran `npx cap sync android` so the native project
  actually picked it up — **re-run that command any time `capacitor.config.ts`
  changes**, or the native strings drift back out of sync.
- **Target/compile SDK 36, min SDK 24** (`android/variables.gradle`) —
  already meets Play's "must target a recent API level" requirement, no
  change needed.
- **Release signing** already wired: `android/keystore.properties` +
  `android/akr-release.jks`, referenced from `android/app/build.gradle`,
  correctly `.gitignore`'d (never committed — verified).
- **Adaptive launcher icon** present across all density buckets
  (`mipmap-*`, `ic_launcher.xml` with foreground/background layers).
- **Manifest permissions are minimal** — only `INTERNET` is declared, and
  that's accurate for what the app does:
  - `@capacitor/filesystem` is only ever used with `Directory.Cache` (app-private,
    no storage permission needed on any API level).
  - `@capacitor/network`'s and `@capacitor/push-notifications`' own required
    permissions are merged in automatically from their plugin AARs — nothing
    to hand-declare.
- **Privacy Policy corrected** (`/privacy-policy`) — removed a claim about
  "anonymous usage analytics" since no analytics SDK is actually integrated
  anywhere in the codebase (checked `package.json` — none present). The
  policy now only claims what the app actually does: collects name, email,
  phone, delivery address, and order history.
- **No ad SDK / Advertising ID usage** anywhere — simplifies the Play
  Console Ads and Data Safety sections considerably (see below).
- **Push notifications** are feature-flagged off
  (`NEXT_PUBLIC_PUSH_NOTIFICATIONS_ENABLED`) and inert until a real
  `google-services.json` is added (see `components/native/PushNotifications.tsx`).
  Nothing half-working to worry about at launch — turn it on later. When you
  do, add a line to the Data Safety form for device/push tokens.

## Things only you can do (Google account / Play Console — no code involved)

1. **Google Play Developer account** — one-time $25 fee + identity
   verification (personal or organization). Can take a few days.
2. **Closed testing requirement for new accounts** — Google requires new
   developer accounts to run a closed test with **at least 12 opted-in
   testers, continuously for 14 days**, before production access is granted
   for a first app. Start recruiting testers early (friends, a WhatsApp
   group, whatever) — this is usually the longest pole in the launch
   timeline, not anything technical.
3. **Content rating questionnaire** (IARC, inside Play Console). Plain
   e-commerce app selling electronics — expect "Everyone".
4. **Data Safety form** — based on what the app actually does:
   - Collected & linked to identity: name, email, phone number, physical
     address (delivery address), purchase history. Purpose: "App
     functionality" (order processing). Not shared with third parties for
     advertising.
   - Not collected: precise/approximate location, photos/videos, contacts,
     advertising ID, analytics identifiers.
   - Encrypted in transit: yes (HTTPS / Firestore).
   - Users can request deletion: yes, via `privacy@akrelectronics.com`
     (already stated in the Privacy Policy).
5. **Store listing assets** (design/marketing work, not code):
   - Short description (≤80 chars) + full description (≤4000 chars)
   - Hi-res app icon: 512×512 PNG, no alpha channel
   - Feature graphic: 1024×500
   - At least 2 phone screenshots (recommend 4–6: home, product, cart,
     checkout)
6. **Privacy Policy URL** for the listing form:
   `https://akr-electronics.vercel.app/privacy-policy` (already live).
7. ~~Build the release bundle~~ — **done**. Built and verified on a physical
   device (adb install + launch):
   `android/app/build/outputs/bundle/release/AKR-Electronics-release.aab`
   (upload this to Play Console) and
   `android/app/build/outputs/apk/release/AKR-Electronics-release.apk`
   (for sideloading/testing only). Rebuild with
   `./gradlew bundleRelease assembleRelease` from `android/` — needs
   `JAVA_HOME` pointed at a JDK 17–21 (this machine's Android Studio JBR was
   incomplete; used Microsoft OpenJDK 21 installed via winget instead).
   Bump `versionCode`/`versionName` in `android/app/build.gradle` before any
   *rebuild after this first submission*.
8. **Category & audience** — "Shopping" category; confirm target audience
   excludes children (keeps you out of the stricter Families policy).
9. **Support contact** — Play Console requires a support email. Decide if
   `privacy@akrelectronics.com` doubles as support or if you want a
   dedicated `support@` address.

## One thing worth knowing before you submit

The app loads the live production site
(`https://akr-electronics.vercel.app`) inside a WebView via Capacitor's
`server.url` config, rather than bundling static content. That's a normal,
supported pattern — but Play's "Minimum Functionality" policy rejects apps
that are *just* a website wrapper with nothing else. The app is in
reasonable shape here since it already has real native behavior beyond the
webview: a native offline fallback page, a native share sheet for the
payment-QR download, and (once turned on) push notifications. If a reviewer
ever flags this, the fix is to lean further into those native touches —
not to change the underlying architecture.

## Deploying app updates going forward

Because the app just points at the production URL, **any web fix that's
merged to `main` and deployed to Vercel is live in the app immediately** —
no APK rebuild or Play Store update needed for ordinary bug fixes/UI
changes. You only need to build and submit a new `.aab` when something
*native* changes: app name/icon, permissions, Capacitor plugin
versions, `capacitor.config.ts`, or anything under `android/`. Bump
`versionCode`/`versionName` in `android/app/build.gradle` for each of those
native-level releases (currently `versionCode 1`, `versionName "1.0"` — correct
as-is for the first submission).
