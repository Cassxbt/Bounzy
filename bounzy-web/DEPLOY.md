# 🚀 Bounzy Web - Vercel Deployment Guide

## Quick Deploy (3 Steps)

### 1. Install Vercel CLI
```bash
npm install -g vercel
```

### 2. Login to Vercel
```bash
vercel login
```

### 3. Deploy
```bash
# Preview deployment
vercel

# Production deployment
vercel --prod
```

---

## Environment Variables

Set these in Vercel Dashboard → Settings → Environment Variables:

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` | WalletConnect Cloud Project ID | ✅ Yes |
| `NEXT_PUBLIC_CONTRACT_ADDRESS` | Deployed Bounzy contract address | ✅ Yes |

> Get WalletConnect ID at: https://cloud.walletconnect.com/

---

## Deployment Methods

### Option A: CLI (Recommended)
```bash
# From bounzy-web directory
cd /Users/apple/Bounzy/bounzy-web

# Preview (creates unique URL for testing)
vercel

# Production (pushes to main domain)
vercel --prod
```

### Option B: Using Script
```bash
chmod +x scripts/deploy-vercel.sh

# Preview deployment
./scripts/deploy-vercel.sh

# Production deployment
./scripts/deploy-vercel.sh --prod
```

### Option C: GitHub Integration
1. Go to [vercel.com/new](https://vercel.com/new)
2. Import your GitHub repository
3. Select `bounzy-web` as root directory
4. Add environment variables
5. Deploy

---

## Build Settings (Auto-detected)

| Setting | Value |
|---------|-------|
| Framework | Next.js |
| Build Command | `npm run build` |
| Output Directory | `.next` |
| Install Command | `npm install` |
| Root Directory | `bounzy-web` |

---

## Post-Deployment Checklist

- [ ] Verify environment variables are set
- [ ] Test wallet connection
- [ ] Test all routes load correctly
- [ ] Verify FHE operations work
- [ ] Check mobile responsiveness

---

## Troubleshooting

**Build Warnings (Safe to Ignore)**
- `@react-native-async-storage/async-storage` - MetaMask SDK optional dep
- `pino-pretty` - Optional logging formatter
- Circular dependency warnings - RainbowKit internal

**Common Issues**
| Issue | Solution |
|-------|----------|
| Wallet not connecting | Check `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` |
| Contract calls failing | Verify `NEXT_PUBLIC_CONTRACT_ADDRESS` |
| 500 errors | Check Vercel logs in dashboard |

---

## Useful Commands

```bash
# View deployments
vercel ls

# View deployment logs  
vercel logs <deployment-url>

# Pull env vars to local
vercel env pull

# Inspect production
vercel inspect <deployment-url>
```
