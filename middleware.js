import { next } from "@vercel/functions";
import { isAuthorized } from "./auth-core.mjs";

const USERNAME = "villas";
const PASSWORD_HASH = "d456700c03b673f50f7e6f15e75c3a705f8333a1ad330618fc77fe0acfcbb307";

export default async function middleware(request) {
  const authorized = await isAuthorized(
    request.headers.get("authorization"),
    USERNAME,
    PASSWORD_HASH,
  );

  if (authorized) return next();

  return new Response("Sitio temporalmente protegido. Ingresa las credenciales autorizadas.", {
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
