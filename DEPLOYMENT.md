# Netlify Deployment Guide for StepPay

This guide covers deploying StepPay to Netlify with all mock data intact.

## Quick Deploy

### Using Netlify UI

1. **Push to Git Repository**
   - Push your code to GitHub, GitLab, or Bitbucket

2. **Connect to Netlify**
   - Go to [Netlify](https://app.netlify.com)
   - Click "Add new site" → "Import an existing project"
   - Select your Git provider and repository

3. **Auto-configured Settings**
   - Netlify will automatically detect settings from `netlify.toml`:
     - **Build command**: `npm run build`
     - **Publish directory**: `.next`
     - **Node version**: 20 (from `.nvmrc`)
     - **Plugin**: `@netlify/plugin-nextjs` (installed automatically)

4. **Deploy**
   - Click "Deploy site"
   - Wait for build to complete (usually 2-3 minutes)

### Using Netlify CLI

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login to Netlify
netlify login

# Initialize (if first time)
netlify init

# Deploy to production
netlify deploy --prod
```

## Build Process

The build process:
1. Installs dependencies (`npm install`)
2. Runs the build command (`npm run build`)
3. The `@netlify/plugin-nextjs` plugin handles Next.js optimization
4. JSON data files from `/data` are included in the build
5. API routes are set up as serverless functions

## Configuration Files

### `netlify.toml`
Main Netlify configuration file specifying:
- Build command and publish directory
- Next.js plugin
- Node.js version
- Redirects for client-side routing

### `.nvmrc`
Specifies Node.js version 20 for consistent builds

### `public/_redirects`
Handles client-side routing for Next.js pages

### `next.config.ts`
Includes configuration to ensure JSON data files are included in the build

## Mock Data

All mock data is preserved in deployment:
- `/data/transactions.json` - Transaction data
- `/data/customers.json` - Customer data  
- `/data/payment-volume.json` - Chart data

These files are:
- Included in the build automatically
- Accessible via API routes (`/api/*`)
- Loaded at build time and served as static JSON

## API Routes

All API routes work on Netlify as serverless functions:
- `/api/transactions` - Returns transaction data
- `/api/customers` - Returns customer data
- `/api/payment-volume` - Returns chart data
- `/api/dashboard/stats` - Returns dashboard statistics

## Troubleshooting

### Build Fails

1. **Check Node version**: Ensure using Node 20 (specified in `.nvmrc`)
2. **Check dependencies**: Run `npm install` locally first
3. **Check logs**: Review Netlify build logs for specific errors

### API Routes Not Working

1. Ensure `@netlify/plugin-nextjs` is installed (auto-installed)
2. Check that API routes are in `/app/api` directory
3. Verify JSON data files exist in `/data` directory

### Client-Side Routing Issues

1. Ensure `public/_redirects` file exists
2. Check `netlify.toml` redirects configuration
3. Verify all links use Next.js `Link` component

### Missing Data

1. Verify JSON files are in `/data` directory
2. Check `next.config.ts` includes data files in tracing
3. Ensure JSON files are committed to Git

## Post-Deployment Checklist

- [ ] Site loads correctly
- [ ] All pages are accessible
- [ ] API routes return data
- [ ] Dashboard displays mock data
- [ ] Client-side routing works
- [ ] Images and assets load
- [ ] Mobile responsive design works

## Custom Domain (Optional)

1. Go to Site settings → Domain management
2. Click "Add custom domain"
3. Follow DNS configuration instructions
4. Netlify will auto-provision SSL certificate

## Environment Variables

This demo doesn't require environment variables. If you add real backend integration later:
1. Go to Site settings → Environment variables
2. Add required variables
3. Redeploy for changes to take effect

## Support

For issues:
- Check [Netlify Docs](https://docs.netlify.com/)
- Review [Next.js on Netlify](https://docs.netlify.com/integrations/frameworks/nextjs/)
- Check build logs in Netlify dashboard


