export default async function proxy(request: Request) {
  console.log("PROXY HIT:", request.url);

  const url = new URL(request.url);
  const pathname = url.pathname;

  if (
    pathname.startsWith("/api") ||
    pathname.startsWith("/_next") ||
    pathname.includes(".")
  ) {
    return;
  }

  const shortCode = pathname.slice(1);
  if (!shortCode) return;

  const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/${shortCode}`;

  try {
    const res = await fetch(apiUrl, { redirect: "manual" });

    if (res.status === 301 || res.status === 302) {
      const target = res.headers.get("Location");
      if (target) {
        return Response.redirect(target, res.status);
      }
    }
  } catch (err) {
    console.error("Proxy redirect error:", err);
  }

  return;
}
