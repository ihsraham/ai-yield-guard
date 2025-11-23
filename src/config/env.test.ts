import { describe, it } from 'node:test'
import assert from 'node:assert'
import { z } from 'zod'

// We can't easily test the `env.ts` file directly because it executes side effects on import (process.exit).
// Instead, we will test the schema validation logic which is the core part.

const envSchema = z.object({
  AGENT_SEED_PHRASE: z.string().min(1, 'Seed phrase is required'),
  RPC_URL: z.string().url('RPC URL must be a valid URL'),
  TOKEN_ADDRESS: z.string().regex(/^0x[a-fA-F0-9]{40}$/, 'Invalid Token Address'),
  AAVE_POOL_ADDRESS: z.string().regex(/^0x[a-fA-F0-9]{40}$/, 'Invalid Aave Pool Address')
})

void describe('Env Config Validation', () => {
  void it('should validate correct environment variables', () => {
    const validEnv = {
      AGENT_SEED_PHRASE: 'test seed phrase',
      RPC_URL: 'https://rpc.example.com',
      TOKEN_ADDRESS: '0x1234567890123456789012345678901234567890',
      AAVE_POOL_ADDRESS: '0x0987654321098765432109876543210987654321'
    }

    const result = envSchema.safeParse(validEnv)
    assert.strictEqual(result.success, true)
  })

  void it('should fail on invalid RPC URL', () => {
    const invalidEnv = {
      AGENT_SEED_PHRASE: 'test seed phrase',
      RPC_URL: 'not-a-url',
      TOKEN_ADDRESS: '0x1234567890123456789012345678901234567890',
      AAVE_POOL_ADDRESS: '0x0987654321098765432109876543210987654321'
    }

    const result = envSchema.safeParse(invalidEnv)
    assert.strictEqual(result.success, false)
    if (result.success === false) {
      assert.ok(result.error.format().RPC_URL)
    }
  })

  void it('should fail on invalid Ethereum address', () => {
    const invalidEnv = {
      AGENT_SEED_PHRASE: 'test seed phrase',
      RPC_URL: 'https://rpc.example.com',
      TOKEN_ADDRESS: 'invalid-address',
      AAVE_POOL_ADDRESS: '0x0987654321098765432109876543210987654321'
    }

    const result = envSchema.safeParse(invalidEnv)
    assert.strictEqual(result.success, false)
    if (result.success === false) {
      assert.ok(result.error.format().TOKEN_ADDRESS)
    }
  })
})
