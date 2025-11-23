````md

# TinyURL – Frontend

A modern dashboard built with Next.js for creating, managing, and tracking shortened URLs.

This frontend communicates with a backend service responsible for redirecting short links and storing analytics.

---

## Features

- Create short links from long URLs  
- Copy short links to clipboard  
- View analytics: total clicks, creation date, last clicked  
- Visit and delete links  
- Row-click opens stats view  
- Visit button opens the backend redirect URL  
- Built-in proxy to support frontend-based redirects

---

## Tech Stack

- Next.js 16 (App Router)
- TypeScript
- TailwindCSS
- Lucide Icons
- REST API backend (Express/Nest/Fastify, etc.)

---

## Environment Variables

Create a `.env` file in the project root:

```
NEXT_PUBLIC_API_URL=http://localhost:4000
```

Explanation:

- Backend runs at port `4000`.
- All API calls and redirect operations use this backend URL.

---

## Installation

Install dependencies:

```
npm install
```

---

## Running in Development

Start the development server:

```
npm run dev
```

Application will be available at:

```
http://localhost:3000
```

---

## Production Build

Build and start:

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
 ├─ lib/
 │   └─ api.ts
 ├─ public/
 ├─ proxy.ts
 ├─ styles/
 ├─ .env
 └─ package.json
```

---

## Proxy Redirect (Next.js 16)

Next.js 16 replaces `middleware.ts` with `proxy.ts`.

With proxy enabled, this works:

```
http://localhost:3000/abc123
```

The request is internally forwarded to:

```
http://localhost:4000/abc123
```

If the backend returns a redirect (`302`), the browser will follow it.

---

## Copy and Visit Behavior

### Copy Button  
Copies the full frontend URL:

```
http://localhost:3000/<shortCode>
```

### Visit Button  
Opens backend redirect URL:

```
http://localhost:4000/<shortCode>
```

### Row Click  
Opens the stats panel for the selected short link.

---

## API Endpoints Used by the Frontend

```
GET    /api/links
GET    /api/links/:id
POST   /api/links
DELETE /api/links/:id
```

---

## License

This project is for personal or educational use. You may modify it as needed.

```