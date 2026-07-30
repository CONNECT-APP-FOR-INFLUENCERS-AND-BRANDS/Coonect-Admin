# Connect Admin

A React web app for the 1–2 people who administer the Connect platform. It's the
only place that can see every brand, every influencer, and every collaboration
across the whole platform, and the only place that can:

- Approve/reject a brand's GST/business-registration document to grant the
  **verified badge**.
- Approve/deny a **cancellation request** — once a collaboration is accepted,
  neither the brand nor the influencer can cancel it directly from the mobile
  apps anymore; they can only ask here.
- View platform-wide performance: revenue and collaboration trends, brand/
  influencer tier distribution, top brands by ROI.

It talks to the **same GraphQL API** the mobile apps use
(`connect-backend`), gated the same way every other admin-only field already
is: `requireRole(user, "ADMIN")`, checked from a real Firebase ID token. There
is no separate admin API key or backend to stand up.

## Setup

1. **Backend URL** — copy `.env.example` to `.env` and set
   `VITE_BACKEND_GRAPHQL_URL` to your running `connect-backend` instance
   (defaults to `http://localhost:5001/graphql`).

2. **Firebase Web App config** — this app needs the Firebase project's public
   *web app* config, not the service-account JSON the backend uses. In
   [Firebase Console](https://console.firebase.google.com) → your project →
   Project Settings → General → "Your apps": if a Web app isn't registered
   yet, add one (it's free, doesn't affect the existing iOS/Android apps).
   Copy `apiKey` / `authDomain` / `projectId` / `appId` into `.env`'s
   `VITE_FIREBASE_*` variables. These are public client identifiers, not
   secrets — fine to have in a browser bundle.

3. **An admin account to sign in with** — admins are provisioned by a one-off
   script in the backend, not a signup form (by design — there's no self-serve
   way to become an admin). From `connect-backend/`:

   ```bash
   node scripts/createAdmin.js
   ```

   This creates `admin@connect.com` as a Firebase Auth user, writes an
   `admins` Firestore doc, and sets the `ADMIN` role. Check that script if you
   want a different email, or want to add a second admin — it's the same
   pattern, just insert another doc into the `admins` collection and create
   the matching Firebase Auth user.

4. **Install and run:**

   ```bash
   npm install
   npm run dev
   ```

   If the `.env` isn't filled in yet, the app shows a "Setup required" screen
   instead of crashing — that's expected until steps 1–3 are done.

## CORS

`connect-backend` currently allows requests from any origin (see the comment
in `connect-backend/src/index.js` where `cors()` is configured) — this app
will work against it with zero backend changes. Before this app is deployed
somewhere with a public URL, it's worth tightening that to an explicit origin
allow-list (this admin app's deployed URL + the existing
`connect-web-roan.vercel.app`, since that's a real production frontend that
also depends on the currently-open CORS policy) rather than leaving the API
open to any website — the admin surface now carries destructive mutations
(`deleteBrand`, `deleteInfluencer`, `resolveCancellationRequest`,
`reviewBrandVerification`) that weren't reachable by any client before this
app existed.

## What's deliberately not here yet

- **Aadhaar eKYC** for brand verification — see
  `connect-backend/docs/brand-verification-approach.md` for why (legal
  licensing requirement, not an oversight) and what it takes to turn on.
- **Automated GSTIN-to-government-database confirmation** — today GSTIN
  submissions are checksum-validated (catches typos/fake numbers) but the
  admin still eyeballs the uploaded document before approving; a paid GSP/KYC
  vendor API would automate the "is this GSTIN actually real and active"
  check. Same doc covers the integration point
  (`services/verificationProvider.service.js`).
- **Admin self-serve invite flow** — new admins are still provisioned via
  `scripts/createAdmin.js`, not a UI in this app. Worth adding once there are
  more than 1–2 admins.
