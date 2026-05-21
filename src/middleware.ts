import {
  convexAuthNextjsMiddleware,
  createRouteMatcher,
  nextjsMiddlewareRedirect,
} from "@convex-dev/auth/nextjs/server";

const isLoginPage = createRouteMatcher(["/login"]);
const isProtectedRoute = createRouteMatcher([
  "/today(.*)",
  "/projects(.*)",
  "/search(.*)",
  "/profile(.*)",
  "/settings(.*)",
]);

export default convexAuthNextjsMiddleware(
  async (request, { convexAuth }) => {
    if (isLoginPage(request) && (await convexAuth.isAuthenticated())) {
      return nextjsMiddlewareRedirect(request, "/today");
    }
    if (isProtectedRoute(request) && !(await convexAuth.isAuthenticated())) {
      return nextjsMiddlewareRedirect(request, "/login");
    }
  }
);

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};
