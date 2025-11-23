import { describe, it } from 'node:test'
import assert from 'node:assert'
import { decideIntent } from './AgentIntentEngine.js'

void describe('AgentIntentEngine', () => {
  const minIdleBalance = 1000n
  const minSupplyUnit = 500n

  void it('should supply excess funds when wallet balance is high', () => {
    const result = decideIntent({
      walletTokenBalance: 2000n, // 2000 > 1000 + 500
      aaveTokenBalance: 0n,
      minIdleBalance,
      minSupplyUnit
    })

    assert.strictEqual(result.action, 'supply')
    assert.strictEqual(result.amount, 1000n) // 2000 - 1000
  })

  void it('should withdraw funds when wallet balance is low and aave has funds', () => {
    const result = decideIntent({
      walletTokenBalance: 500n, // 500 < 1000
      aaveTokenBalance: 2000n,
      minIdleBalance,
      minSupplyUnit
    })

    assert.strictEqual(result.action, 'withdraw')
    assert.strictEqual(result.amount, 500n) // 1000 - 500
  })

  void it('should cap withdrawal at available aave balance', () => {
    const result = decideIntent({
      walletTokenBalance: 500n, // Need 500
      aaveTokenBalance: 200n, // Only have 200
      minIdleBalance,
      minSupplyUnit
    })

    assert.strictEqual(result.action, 'withdraw')
    assert.strictEqual(result.amount, 200n)
  })

  void it('should do nothing when balances are within optimal range', () => {
    const result = decideIntent({
      walletTokenBalance: 1200n, // 1000 < 1200 < 1500 (minIdle + minSupply)
      aaveTokenBalance: 1000n,
      minIdleBalance,
      minSupplyUnit
    })

    assert.strictEqual(result.action, 'none')
    assert.strictEqual(result.amount, 0n)
  })
})
