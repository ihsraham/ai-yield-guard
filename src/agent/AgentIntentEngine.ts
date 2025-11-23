export type AgentAction = 'supply' | 'withdraw' | 'none'

export interface AgentIntent {
  action: AgentAction
  amount: bigint
  reason: string
}

export interface DecisionParams {
  walletTokenBalance: bigint
  aaveTokenBalance: bigint
  minIdleBalance: bigint
  minSupplyUnit: bigint
  isSupplyCapReached: boolean
}

/**
 * Pure function to decide the agent's next action based on current balances and configuration.
 *
 * Rules:
 * 1. Supply: If wallet balance exceeds (minIdle + minSupplyUnit), supply the excess.
 * 2. Withdraw: If wallet balance is below minIdle AND we have supplied funds, withdraw enough to reach minIdle.
 * 3. None: Otherwise, do nothing.
 */
export function decideIntent (params: DecisionParams): AgentIntent {
  const { walletTokenBalance, aaveTokenBalance, minIdleBalance, minSupplyUnit, isSupplyCapReached } = params

  // Rule 1: Supply excess funds
  if (walletTokenBalance > minIdleBalance + minSupplyUnit) {
    if (isSupplyCapReached) {
      return {
        action: 'none',
        amount: 0n,
        reason: 'Target Supply Cap reached; cannot supply further.'
      }
    }

    const supplyAmount = walletTokenBalance - minIdleBalance
    return {
      action: 'supply',
      amount: supplyAmount,
      reason: `Wallet balance (${walletTokenBalance}) exceeds min idle (${minIdleBalance}) by more than min unit. Supplying excess.`
    }
  }

  // Rule 2: Withdraw if below min idle
  if (walletTokenBalance < minIdleBalance && aaveTokenBalance > 0n) {
    const deficit = minIdleBalance - walletTokenBalance
    // Cap withdrawal at available aave balance
    const withdrawAmount = deficit > aaveTokenBalance ? aaveTokenBalance : deficit

    return {
      action: 'withdraw',
      amount: withdrawAmount,
      reason: `Wallet balance (${walletTokenBalance}) is below min idle (${minIdleBalance}). Withdrawing to replenish.`
    }
  }

  // Rule 3: Do nothing
  return {
    action: 'none',
    amount: 0n,
    reason: 'Wallet balance is within optimal range. No action needed.'
  }
}
