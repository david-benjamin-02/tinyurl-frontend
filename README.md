```md

# Link Dashboard – Frontend

A modern dashboard built with Next.js for creating, managing, and tracking shortened URLs.
This frontend communicates with a backend service (Node.js/Express) that handles redirecting and analytics.

---

## Features

* Create short links from long URLs
* Copy short links to clipboard
* View stats: total clicks, creation date, last clicked
* Visit and delete links
* Row-click opens stats modal
* Visit button opens actual redirect URL
* Backend redirect support through Next.js Proxy

---

## Tech Stack

* Next.js 16 (App Router)
* TypeScript
* TailwindCSS
* Lucide Icons
* REST API (Backend running on Express/Nest/Fastify etc.)

---

## Environment Variables

Create a `.env` file:

```
NEXT_PUBLIC_API_URL=http://localhost:4000
```

Meaning:

* The backend runs at port 4000.
* All API calls and short-link visits use this backend URL.

---

## Install Dependencies

```
npm install
```

---

## Development Server

Start the development server:

```
npm run dev
```

It will run at:

```
http://localhost:3000
```

---

## Production Build

```
npm run build
npm run start
```

---

## Folder Structure

```
frontend/
 ├─ app/
 │   ├─ page.tsx
 │   ├─ layout.tsx
 ├─ components/
 ├─ lib/api.ts
 ├─ public/
 ├─ proxy.ts
 ├─ styles/
 ├─ .env
 └─ package.json
```

---

## Proxy Redirect

Next.js 16 no longer uses `middleware.ts` for redirects.

Instead, use the new Proxy

```
http://localhost:3000/abc123
```

Internally proxies to:

```
http://localhost:4000/abc123
```

If backend returns redirect (302), browser will follow it.

---

## Copy and Visit Behavior

Copy button copies frontend URL:

```
http://localhost:3000/shortCode
```

Visit button opens frontend URL and rediredt to backend URL:

```
href={`${NEXT_PUBLIC_API_URL}/${item.shortCode}`}
```

Row click opens stats drawer.

---

## API Endpoints Used

```
GET    /api/links
GET    /api/links/:id
POST   /api/links
DELETE /api/links/:id
```