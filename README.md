# Fredericksburg READS Frontend

Next.js frontend application that builds to static HTML for Cloudflare Pages using `@cloudflare/next-on-pages`.

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Copy `.env.example` to `.env.local` and configure:
   ```bash
   NEXT_PUBLIC_API_URL=https://fredreads-api.solomongifford.workers.dev
   ```

## Development

```bash
npm run dev
```

Open [http://localhost:3100](http://localhost:3100) in your browser.

**Note**: Make sure the backend Workers API is running (see `../backend/README.md`).

## Deployment to Cloudflare Pages

The build configuration is set in `wrangler.toml` and matches Cloudflare's expected settings:

1. Push your code to a Git repository
2. In Cloudflare Dashboard:
   - Go to Pages
   - Click on your `fredreads` project (or create new)
   - Go to Settings → Builds & deployments
   - Click "Connect to Git"
   - Select your repository
     - Configure build settings:
     - **Build command**: `npx @cloudflare/next-on-pages@1`
     - **Build output directory**: `.vercel/output/static`
     - **Root directory**: `/` (repo root is now frontend/)
   - **IMPORTANT**: Go to Settings → Compatibility Flags
     - Add `nodejs_compat` flag to both Production and Preview environments
   - Add environment variables:
     - `NEXT_PUBLIC_API_URL` - Your Workers API URL

3. Save and deploy!

**Note**: The repository root is now `frontend/`, so the root directory in Cloudflare should be `/`.

**Important**: This frontend uses Cloudflare Pages Functions for SPA routing (see `/functions/_middleware.ts`). All authentication and API logic runs in the Workers backend.

## Environment Variables

- `NEXT_PUBLIC_API_URL` - Backend Workers API URL (required)
