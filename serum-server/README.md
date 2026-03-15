# Serum REST Server — Comicraft Trading Space

This directory contains configuration for the self-hosted [serum-rest-server](https://github.com/project-serum/serum-rest-server) that powers the Comicraft Trading Space (`/trading`).

## Setup

```bash
# 1. Clone the upstream Serum REST server
git clone https://github.com/project-serum/serum-rest-server .

# 2. Install dependencies
yarn install

# 3. Copy environment config
cp .env.example .env

# 4. Fill in your values in .env (see below)

# 5. Start the server
yarn start
```

## Environment Variables

See `.env.example` for all required variables.

| Variable | Description |
|---|---|
| `PORT` | Port to run the server on (default: 3001) |
| `SOLANA_RPC_URL` | Solana Mainnet (or Devnet) RPC endpoint, e.g. `https://api.mainnet-beta.solana.com` |
| `PAYER_KEYPAIR` | Base58-encoded private key of the Solana keypair that will sign and fund orders |
| `CRAFTS_SOL_MARKET` | Serum market address for CRAFTS/SOL pair |
| `CRAFTS_USDC_MARKET` | Serum market address for CRAFTS/USDC pair |

## Integration with Comicraft Frontend

The Comicraft frontend (`/app/trading/page.tsx`) calls these REST endpoints:

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/orderbooks/:marketAddress` | Fetch current bid/ask orderbook |
| `POST` | `/api/orders` | Place a limit or market order |
| `GET` | `/api/markets` | List available markets |
| `GET` | `/api/trades/:marketAddress` | Fetch recent trades |

Set `NEXT_PUBLIC_SERUM_API_URL` in the Comicraft frontend `.env.local` to point at this server:

```env
NEXT_PUBLIC_SERUM_API_URL=http://localhost:3001
```

## Security Notes

- **Never commit your `PAYER_KEYPAIR` to version control.** The `.env` file is gitignored.
- For production, run the server behind a reverse proxy (Nginx, Caddy) with TLS.
- Consider restricting CORS to only the Comicraft frontend domain.

## References

- [Project Serum](https://projectserum.com)
- [serum-rest-server on GitHub](https://github.com/project-serum/serum-rest-server)
- [Serum DEX on Solana](https://docs.projectserum.com)
