# Netlify Deployment Guide for StepPay

This guide covers deploying StepPay to Netlify with all features and mock data intact.

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
     - **Publish directory**: Handled automatically by plugin
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
- Build command
- Next.js plugin
- Node.js version (20)
- The plugin automatically handles publish directory and routing

### `.nvmrc`
Specifies Node.js version 20 for consistent builds

### `public/_redirects`
Handles client-side routing for Next.js pages

### `next.config.ts`
Includes configuration for image optimization (unoptimized for Netlify)

### `.netlifyignore`
Specifies files to exclude from Netlify build (but not from Git)

## Mock Data

All mock data is preserved in deployment:
- `/data/transactions.json` - Transaction data
- `/data/customers.json` - Customer data  
- `/data/payment-volume.json` - Chart data

These files are:
- Included in the build automatically (not in `.netlifyignore`)
- Accessible via API routes (`/api/*`)
- Loaded at runtime by serverless functions

## API Routes

The following API routes are available as serverless functions:
- `/api/transactions` - Get all transactions
- `/api/dashboard/stats` - Get dashboard statistics
- `/api/payment-volume` - Get payment volume data

All routes return JSON data from the `/data` directory.

## Environment Variables

No environment variables are required for this demo application. All data is static and mocked.

## Post-Deployment

After deployment, your site will be available at:
- Production: `https://your-site-name.netlify.app`
- Preview deployments: `https://deploy-preview-X--your-site-name.netlify.app`

All pages and API routes will work as expected with the mock data intact.

## Troubleshooting

### Build Fails
- Ensure Node.js version 20 is specified (check `.nvmrc`)
- Verify all dependencies are in `package.json`
- Check build logs for specific errors

### API Routes Not Working
- Ensure `/data` directory is not in `.netlifyignore`
- Verify API route files are in `app/api/` directory
- Check that JSON files are valid

### Routing Issues
- Verify `public/_redirects` file exists
- Check that `@netlify/plugin-nextjs` is installed
- Ensure `netlify.toml` has the plugin configured

## Support

For issues or questions, refer to:
- [Netlify Next.js Documentation](https://docs.netlify.com/integrations/frameworks/next-js/)
- [Next.js Deployment Documentation](https://nextjs.org/docs/deployment)
