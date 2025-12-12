# StepPay

A Paystack-style payment platform clone for Ghanaian merchants to receive payments from abroad. Built with Next.js, TypeScript, TailwindCSS, and shadcn/ui.

## Features

- 🎯 **Dashboard** - Payment volume cards, line charts, and transaction tables
- 💳 **Payment Collection** - Paystack-style inline payment form
- 👥 **Customer Management** - Customer list with filtering and search
- 📊 **Transaction History** - Complete transaction records and analytics
- 🔐 **Authentication** - Login, signup, and onboarding flows (frontend validation only)
- ⚙️ **Settings** - Profile and payment configuration pages

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: TailwindCSS 4
- **UI Components**: shadcn/ui
- **Icons**: Lucide React

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Run the development server:
```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
step-pay/
├── app/
│   ├── dashboard/          # Dashboard pages
│   │   ├── customers/      # Customer management
│   │   ├── payments/       # Payment collection
│   │   ├── transactions/   # Transaction history
│   │   └── settings/       # Settings pages
│   ├── login/              # Login page
│   ├── signup/             # Signup page
│   ├── onboarding/         # Onboarding flow
│   └── page.tsx            # Landing page
├── components/
│   ├── dashboard/          # Dashboard components
│   └── ui/                 # shadcn/ui components
├── lib/
│   └── mock-data.ts        # Mock data for demo
└── public/                 # Static assets
```

## Pages Overview

- **Landing Page** (`/`) - Marketing homepage
- **Login** (`/login`) - Sign in with frontend validation
- **Signup** (`/signup`) - Create account with frontend validation
- **Onboarding** (`/onboarding`) - Multi-step onboarding flow
- **Dashboard** (`/dashboard`) - Main dashboard with stats and charts
- **Collect Payment** (`/dashboard/payments`) - Paystack-style payment form
- **Customers** (`/dashboard/customers`) - Customer list with search/filter
- **Transactions** (`/dashboard/transactions`) - Full transaction history
- **Settings** (`/dashboard/settings`) - Account and payment settings

## Notes

- This is a **demo/preview application** - all data is mocked
- No real backend logic or API calls
- Authentication uses frontend validation only
- Perfect for demos, previews, and UI showcases

## Deployment to Netlify

This project is fully configured for deployment to Netlify with all mock data intact. See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed instructions.

### Prerequisites

1. A Netlify account
2. Node.js 20 (specified in `.nvmrc`)

### Deploy Steps

#### Option 1: Deploy via Netlify UI

1. Push your code to GitHub, GitLab, or Bitbucket
2. Log in to [Netlify](https://app.netlify.com)
3. Click "Add new site" → "Import an existing project"
4. Connect your Git repository
5. Netlify will auto-detect the settings from `netlify.toml`:
   - Build command: `npm run build`
   - Publish directory: `.next`
   - Node version: 20
6. Click "Deploy site"

#### Option 2: Deploy via Netlify CLI

1. Install Netlify CLI globally:
   ```bash
   npm install -g netlify-cli
   ```

2. Build the project:
   ```bash
   npm run build
   ```

3. Deploy to Netlify:
   ```bash
   netlify deploy --prod
   ```

   Or for a preview deployment:
   ```bash
   netlify deploy
   ```

### Build Configuration

The project includes:
- `netlify.toml` - Netlify configuration with Next.js plugin
- `.nvmrc` - Node.js version specification
- `public/_redirects` - Client-side routing support
- Mock data JSON files in `/data` folder (included in build)

### Mock Data

All mock data files in the `/data` directory will be included in the deployment:
- `transactions.json`
- `customers.json`
- `payment-volume.json`

These are loaded via API routes (`/api/*`) and work seamlessly on Netlify.

### Environment Variables

No environment variables are required for this demo application. All data is static and mocked.

### Post-Deployment

After deployment, your site will be available at:
- Production: `https://your-site-name.netlify.app`
- Preview deployments: `https://deploy-preview-X--your-site-name.netlify.app`

All pages and API routes will work as expected with the mock data intact.

## License

MIT
