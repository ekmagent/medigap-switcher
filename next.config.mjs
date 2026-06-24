/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  async rewrites() {
    // beforeFiles: runs before filesystem routes, so it overrides the "/" page.
    return {
      beforeFiles: [
        // smile.healthplans.now serves the dental funnel at its root.
        // (switch.healthplans.now and others keep the Medigap homepage at /.)
        {
          source: "/",
          has: [{ type: "host", value: "smile.healthplans.now" }],
          destination: "/dental",
        },
      ],
    }
  },
  async redirects() {
    // smile.healthplans.now must never expose "/dental" in the browser URL — the Meta
    // browser pixel sends the page URL (dl) to Meta, and "dental" is a health term.
    // Bounce the exact /dental path to "/", where the rewrite above serves the same
    // landing at a clean URL. Redirects run before rewrites, so there's no loop.
    // Funnel routes (/dental/coverage-now, etc.) are NOT matched (source is exact) and
    // never fire the browser pixel; CAPI is origin-only — so nothing else leaks the path.
    return [
      {
        source: "/dental",
        has: [{ type: "host", value: "smile.healthplans.now" }],
        destination: "/",
        permanent: false,
      },
    ]
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://va.vercel-scripts.com https://connect.facebook.net https://maps.googleapis.com https://us-assets.i.posthog.com https://us.i.posthog.com",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: blob: https:",
              "font-src 'self' data:",
              "connect-src 'self' https://graph.facebook.com https://www.facebook.com https://api.csgactuarial.com https://api.zippopotam.us https://maps.googleapis.com https://places.googleapis.com https://us.i.posthog.com https://*.posthog.com",
              "frame-ancestors 'none'",
            ].join("; "),
          },
        ],
      },
    ]
  },
}

export default nextConfig
