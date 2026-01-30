#!/bin/bash
# Build script that ensures _redirects file is copied

# Run the Cloudflare Pages build
npx @cloudflare/next-on-pages@1

# Copy _redirects file to build output
if [ -f "public/_redirects" ]; then
  cp public/_redirects .vercel/output/static/_redirects
  echo "Copied _redirects file to build output"
fi
