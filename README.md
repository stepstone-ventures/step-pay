# StepPay Dashboard

A modern payment dashboard application built with Next.js 14, TypeScript, and Tailwind CSS.

## Features

- **Dashboard Overview**: Real-time transaction statistics and charts
- **Transaction Management**: View, filter, and manage all transactions
- **Customer Management**: Complete customer database with search and filters
- **Compliance Workflow**: Step-by-step compliance verification process
- **Payment Processing**: Multiple payment methods and channels
- **Responsive Design**: Fully responsive for desktop, tablet, and mobile devices

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4
- **UI Components**: shadcn/ui (Radix UI)
- **Icons**: Lucide React
- **Deployment**: Netlify

## Getting Started

### Prerequisites

- Node.js 20 or higher
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd step-pay
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
step-pay/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── dashboard/         # Dashboard pages
│   ├── login/             # Authentication pages
│   └── layout.tsx         # Root layout
├── components/            # React components
│   ├── dashboard/         # Dashboard-specific components
│   ├── ui/                # Reusable UI components
│   └── compliance/        # Compliance components
├── data/                  # JSON data files
│   ├── transactions.json
│   ├── customers.json
│   └── payment-volume.json
├── lib/                   # Utility functions
├── public/                # Static assets
└── netlify.toml           # Netlify configuration
```

## Deployment

### Netlify Deployment

This project is configured for easy deployment to Netlify.

#### Quick Deploy

1. **Push to Git Repository**
   - Push your code to GitHub, GitLab, or Bitbucket

2. **Connect to Netlify**
   - Go to [Netlify](https://app.netlify.com)
   - Click "Add new site" → "Import an existing project"
   - Select your Git provider and repository

3. **Auto-configured Settings**
   - Netlify will automatically detect settings from `netlify.toml`:
     - **Build command**: `npm run build`
     - **Publish directory**: `.next` (handled by plugin)
     - **Node version**: 20 (from `.nvmrc`)
     - **Plugin**: `@netlify/plugin-nextjs`

4. **Deploy**
   - Click "Deploy site"
   - Wait for build to complete (usually 2-3 minutes)

#### Using Netlify CLI

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
Includes configuration for image optimization and build settings

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

The following API routes are available:
- `/api/transactions` - Get all transactions
- `/api/dashboard/stats` - Get dashboard statistics
- `/api/payment-volume` - Get payment volume data

All routes return JSON data from the `/data` directory.

## Environment Variables

No environment variables are required for this demo application. All data is static and mocked.

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## License

MIT
