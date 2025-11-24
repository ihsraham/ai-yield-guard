import dotenv from 'dotenv'
import { z } from 'zod'

const envSchema = z.object({
  AGENT_SEED_PHRASE: z.string().min(1, 'Seed phrase is required'),
  RPC_URL: z.string().url('RPC URL must be a valid URL'),
  TOKEN_ADDRESS: z.string().regex(/^0x[a-fA-F0-9]{40}$/, 'Invalid Token Address'),
  AAVE_POOL_ADDRESS: z.string().regex(/^0x[a-fA-F0-9]{40}$/, 'Invalid Aave Pool Address'),
  AAVE_ATOKEN_ADDRESS: z.string().regex(/^0x[a-fA-F0-9]{40}$/, 'Invalid Aave aToken Address'),
  AAVE_DATA_PROVIDER_ADDRESS: z.string().regex(/^0x[a-fA-F0-9]{40}$/, 'Invalid Aave Data Provider Address'),
  ERC8004_IDENTITY_REGISTRY: z.string().regex(/^0x[a-fA-F0-9]{40}$/, 'Invalid Identity Registry Address').default('0x8004AA63c570c570eBF15376c0dB199918BFe9Fb'),
  AGENT_NAME: z.string().default('AI Yield Guard'),

  // Agent Strategy Configuration (Units in lowest decimal, e.g., 6 for USDT)
  MIN_IDLE_BALANCE: z.string().default('1100000').transform((val) => BigInt(val)), // Default: 1.1 USDT
  MIN_SUPPLY_UNIT: z.string().default('100000').transform((val) => BigInt(val)) // Default: 0.1 USDT
})

export type Env = z.infer<typeof envSchema>

export function loadConfig(overrides?: Partial<Env>): Env {
  dotenv.config()

  const combinedEnv = {
    ...process.env,
    ...overrides
  }

  const parsedEnv = envSchema.safeParse(combinedEnv)

  if (parsedEnv.success === false) {
    console.error('❌ Invalid environment variables:', parsedEnv.error.format())
    process.exit(1)
  }

  return parsedEnv.data
}

// For backward compatibility if needed, but we should prefer loadConfig
export const env = loadConfig()
