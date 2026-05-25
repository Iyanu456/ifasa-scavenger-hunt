# IAS 3.0 — The Hunt

QR code scavenger hunt web app for the **Ife Architecture Summit 3.0** at Obafemi Awolowo University, Ile-Ife. Participants scan hidden QR codes across campus to earn points; rankings update live on a public leaderboard. Admins control code activation through a protected dashboard.

Built with **Next.js 16 App Router** — a single project that handles both the frontend UI and all API routes, deployed to Vercel.

---

## Local development

```bash
# Install dependencies
npm install

# Copy env file and fill in your values
cp .env.example .env.local

# Start the dev server
npm run dev
```

The app runs at [http://localhost:3000](http://localhost:3000).

---

## Environment variables

All environment variables live in `.env.local` at the project root.

| Variable | Description | Example |
|---|---|---|
| `MONGODB_URI` | MongoDB Atlas connection string | `mongodb+srv://user:pass@cluster.mongodb.net/ias3hunt` |
| `JWT_SECRET` | Secret key for signing admin JWTs | `some-long-random-string` |
| `ADMIN_SEED` | JSON array of admin accounts to create on first start | `[{"name":"Adewumi Fadele","email":"adewumi@ifasa.com","password":"changeme123"}]` |
| `NEXT_PUBLIC_APP_URL` | Public URL of the app (used to generate QR scan URLs) | `https://your-app.vercel.app` |

> `MONGODB_URI`, `JWT_SECRET`, and `ADMIN_SEED` are server-only. `NEXT_PUBLIC_APP_URL` is exposed to the browser for QR code generation.

---

## MongoDB Atlas setup

1. Go to [cloud.mongodb.com](https://cloud.mongodb.com) and create a free M0 cluster.
2. Create a database user with a strong password.
3. Under **Network Access**, add `0.0.0.0/0` to allow connections from Vercel's dynamic IPs.
4. Click **Connect → Drivers**, copy the connection string, replace `<password>` with your database user's password.
5. Paste the URI into `MONGODB_URI` in `.env.local`.

---

## Seeding admin accounts

Set `ADMIN_SEED` before the first run:

```
ADMIN_SEED=[{"name":"Adewumi Fadele","email":"adewumi@ifasa.com","password":"changeme123"}]
```

On first DB connection, if the Admin collection is empty the server will hash passwords and insert the accounts. Subsequent cold starts skip this. **Change the default password after the first login.**

---

## Deploying to Vercel

1. Push this repo to GitHub.
2. Go to [vercel.com](https://vercel.com) → **New Project** → import the repo.
3. Framework preset is detected automatically as **Next.js**.
4. Under **Environment Variables**, add all four variables from `.env.example` with real values. Set `NEXT_PUBLIC_APP_URL` to the Vercel URL you're about to deploy to (e.g. `https://ias3hunt.vercel.app`).
5. Click **Deploy**.

No separate backend deployment is needed — all API routes are bundled into the same Vercel project.

---

## Setting QR code coordinates (GPS fraud prevention)

Each code has a GPS location that must match where the physical QR code is placed. Participants must be within 200 m of the code to earn points.

There are two ways to set coordinates for each code:

**1. From a desk (map picker)**

Log in at `/admin/login` → **Codes** → click **Set Location** on any code card. An interactive map opens centred on OAU campus. Click the exact spot where the QR code will be placed. The pin can be dragged to fine-tune. Click **Save Location** when done.

**2. On location (most accurate)**

When you are physically standing at the QR code, open the admin panel on your phone → **Codes** → **Set Location** → tap **Use My Current Location**. The map flies to your GPS position and places the pin automatically. Confirm it looks right on the map, then save.

The second method is the most accurate. If possible, have someone stand at each location on the day codes are placed and set the coordinates from their phone.

> Codes without coordinates set will show a warning banner in the admin panel and will skip distance checking until coordinates are added.

---

## Activating Code 6 on summit day

Log in at `/admin/login`. Go to **Codes**. Find the **Summit Venue** card (`code-06`). Click **Activate** and confirm the dialog. The code goes live immediately — anyone who scans it from that moment earns 100 points. Do this only once the physical QR code is in place at the venue.
