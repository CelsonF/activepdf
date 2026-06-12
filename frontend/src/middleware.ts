import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const PUBLIC = [
  "/login",
  "/register",
  "/landing", // legado: redireciona para a capa
  "/precos",
  "/portfolio",
  "/editor", // editor anônimo: 100% client-side, sem sessão
  "/api/auth/login",
  "/api/auth/register",
  "/sitemap.xml",
  "/robots.txt",
  "/opengraph-image",
];
const SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET ?? "activepdf-dev-secret-change-in-production"
);

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // A capa (/) é pública: editor gratuito embutido
  if (pathname === "/") return NextResponse.next();
  if (PUBLIC.some((p) => pathname.startsWith(p))) return NextResponse.next();
  if (pathname.startsWith("/_next") || pathname.startsWith("/favicon")) return NextResponse.next();

  const token = request.cookies.get("activepdf_session")?.value;

  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  try {
    await jwtVerify(token, SECRET);
    return NextResponse.next();
  } catch {
    const res = NextResponse.redirect(new URL("/login", request.url));
    res.cookies.delete("activepdf_session");
    return res;
  }
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
