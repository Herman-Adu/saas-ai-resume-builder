import { getSessionCookie } from "better-auth/cookies";
import { NextResponse, type NextRequest } from "next/server";

const publicPaths = [
  "/",
  "/tos",
  "/sign-in",
  "/sign-up",
  "/sitemap.xml",
  "/robots.txt",
];
const publicPrefixes = ["/api/auth", "/api/stripe-webhook"];

function isPublicRoute(pathname: string) {
  return (
    publicPaths.includes(pathname) ||
    publicPrefixes.some((prefix) => pathname.startsWith(prefix))
  );
}

// Optimistic cookie check only. Every page and server action validates the
// session itself with auth.api.getSession.
export function proxy(request: NextRequest) {
  if (isPublicRoute(request.nextUrl.pathname) || getSessionCookie(request)) {
    return NextResponse.next();
  }
  return NextResponse.redirect(new URL("/sign-in", request.url));
}

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
