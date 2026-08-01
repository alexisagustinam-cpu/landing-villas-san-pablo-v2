import { next } from "@vercel/functions";
import { isAuthorized } from "./auth-core.mjs";

const USERNAME = "villas";
const PASSWORD_HASH = "fcccb441e5ee7e85f299907b7d32127a6585c9c6fc9d5896d519426ab65ad564";

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
