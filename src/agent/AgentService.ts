import { AaveClient } from '../defi/AaveClient.js'
import { AgentIntent, decideIntent } from './AgentIntentEngine.js'

export interface AgentConfig {
  aaveClient: AaveClient
  minIdleBalance: bigint
  minSupplyUnit: bigint
}

/**
 * Orchestrates the agent's decision making process.
 * Fetches current state from the AaveClient and delegates logic to the pure AgentIntentEngine.
 */
export async function getAgentIntent (cfg: AgentConfig): Promise<AgentIntent> {
  const { aaveClient, minIdleBalance, minSupplyUnit } = cfg

  const walletTokenBalance = await aaveClient.getTokenBalance()
  const aaveTokenBalance = await aaveClient.getAaveTokenBalance()
  // const supplyCap = await aaveClient.getSupplyCap()

  // Check if supply cap is reached (or close to it)
  // We need total supplied to compare against cap.
  // AaveClient doesn't expose total supplied yet, but getSupplyCap logic in AaveClient could return it or we can fetch it.
  // Actually, AaveClient.getSupplyCap currently returns only the cap.
  // We need to know if the protocol is full.
  // The task description says: "Logic: Check if totalSupplied >= supplyCap".
  // I need to update AaveClient to return totalSupplied or check it internally.
  // Or I can update `getSupplyCap` to return `{ cap, totalSupplied }`.
  // Let's update `AaveClient` to return `Promise<{ cap: bigint, totalSupplied: bigint }>`?
  // Or add `getTotalSupplied()` to `AaveClient`.
  // The `check_base_caps_official.ts` script used `dataProvider.getReserveData(asset)` to get `totalAToken`.
  // I should implement `getTotalSupplied` in `AaveClient`.

  // Wait, I can't update `AaveClient` in this step.
  // I should have done it in the previous step.
  // I will update `AgentService.ts` to assume `AaveClient` has `getTotalSupplied` or similar,
  // OR I can update `AaveClient` again.

  // Let's update `AaveClient` to add `getTotalSupplied` or modify `getSupplyCap`.
  // Modifying `getSupplyCap` to return an object is better.
  // But I already implemented `getSupplyCap` to return `bigint`.
  // I'll add `getReserveData` to `AaveClient`.

  // I'll pause `AgentService.ts` update and go back to `AaveClient.ts`.
  // But I can't pause in the middle of a tool call sequence easily without wasting turns.

  // I will implement `getReserveData` in `AaveClient` in the next step.
  // For now, I will write `AgentService.ts` assuming `aaveClient.getReserveData()` exists and returns `{ totalAToken: bigint }`.
  // Or `aaveClient.isSupplyCapReached()`.
  // `isSupplyCapReached` is cleaner.

  // Let's add `isSupplyCapReached()` to `AaveClient`.
  // It will call `getReserveCaps` and `getReserveData`.

  // So in `AgentService.ts`:
  const isSupplyCapReached = await aaveClient.isSupplyCapReached()

  const intent = decideIntent({
    walletTokenBalance,
    aaveTokenBalance,
    minIdleBalance,
    minSupplyUnit,
    isSupplyCapReached
  })

  return intent
}
