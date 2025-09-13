import { withAuth } from "next-auth/middleware"

export default withAuth(
  function middleware(req) {
    // Add any additional middleware logic here
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token
    },
  }
)

export const config = {
  matcher: [
    "/builder/:path*",
    "/data/:path*",
    "/analysis/:path*",
    "/print/:path*",
    "/api/profiles/:path*",
    "/api/optimize-resume/:path*",
    "/api/extract-job/:path*"
  ]
}