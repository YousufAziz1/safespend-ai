# Deployment & Environment Setup Guide 🌍

## 1. Environment Setup

To run SafeSpend AI locally, you require standard node ecosystems securely configured with Web3 primitives natively.

### Prerequisites
* **Node.js**: v18.17+ globally installed.
* **Package Manager**: `pnpm` (run `npm install -g pnpm` natively).
* **Solana Wallet**: A browser extension wallet such as [Phantom](https://phantom.app/).
* **Solana Network**: The app natively routes to Mainnet-Beta or Devnet sequentially.

### API Integrations
SafeSpend relies on 3 distinct API providers. You must acquire API keys for the orchestrator to resolve intelligently.

| Provider | Purpose | Where to obtain |
|---|---|---|
| **Helius** | Wallet maturation, deep RPC routing | [helius.dev](https://helius.dev) |
| **GoPlus** | Phishing & malicious smart contract APIs | [gopluslabs.io](https://gopluslabs.io) |
| **Birdeye** | SPL Token health, honeypot analysis | [birdeye.so](https://birdeye.so) |

### Local Configuration
Create a `.env.local` directly inside the workspace root:

```env
# Required for wallet maturity and fast node execution
NEXT_PUBLIC_HELIUS_API_KEY="your_helius_key_here"

# Required for phishing / malicious routing blocks
NEXT_PUBLIC_GOPLUS_API_KEY="your_goplus_key_here"

# Required for liquidity/token honeypot extraction
NEXT_PUBLIC_BIRDEYE_API_KEY="your_birdeye_key_here"
```

Start the engines locally:
```bash
pnpm install
pnpm dev
```

---

## 2. Vercel Production Deployment

The architecture relies strongly on Next.js 14 App Router statically typed boundaries. Utilizing Vercel is highly recommended for zero-config Serverless execution.

1. **Push your code to GitHub.**
2. **Import Project** on Vercel natively.
3. **Configure Environment Variables** in the Vercel dashboard prior to building. Do not commit `.env.local`.
4. **Deploy.** 

*Note: SafeSpend AI natively runs purely client-side via React states and `localStorage` structures currently for hackathon boundaries. Sever-side rendering limits are exclusively preserved around standard route caching inherently built into Next.js seamlessly.*
