import { next } from "@vercel/functions";
import { isAuthorized } from "./auth-core.mjs";

const USERNAME = "villas";
const PASSWORD_HASH = "a4bded7f702929c65a4aa95e24d790d91af9331a06655b609bacdceb4bbebdcb";

export default async function middleware(request) {
  const authorized = await isAuthorized(
    request.headers.get("authorization"),
    USERNAME,
    PASSWORD_HASH,
  );

  if (authorized) return next();

  return new Response("Acceso privado.", {
    status: 401,
    headers: {
      "Cache-Control": "no-store",
      "Content-Type": "text/plain; charset=utf-8",
      "WWW-Authenticate": 'Basic realm="Villas de San Pablo", charset="UTF-8"',
    },
  });
}

export const config = {
  matcher: "/(.*)",
};
