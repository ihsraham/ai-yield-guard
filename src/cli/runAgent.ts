import { createInterface } from 'readline'
import { formatUnits } from 'ethers'
import { loadConfig, type Env } from '../config/env.js'
import { WalletService } from '../wallet/WalletService.js'
import { AaveClient } from '../defi/AaveClient.js'
import { getAgentIntent } from '../agent/AgentService.js'
import { IdentityClient } from '../agent/IdentityClient.js'

// Configuration constants (could be moved to env later)
const MIN_IDLE_BALANCE = 1100000n // Example: 1 USDT (6 decimals)
const MIN_SUPPLY_UNIT = 100000n // Example: 1 USDT

async function promptUser (query: string): Promise<string> {
  const rl = createInterface({
    input: process.stdin,
    output: process.stdout
  })

  return await new Promise((resolve) => {
    rl.question(query, (answer) => {
      rl.close()
      resolve(answer)
    })
  })
}

// Helper to parse arguments
function parseArgs (): { watch: boolean, interval: number, seed?: string } {
  const args = process.argv.slice(2)
  const watch = args.includes('--watch') || args.includes('-w')
  const intervalIndex = args.indexOf('--interval')
  const seedIndex = args.indexOf('--seed')
  let interval = 30 // Default 30s
  let seed: string | undefined

  if (intervalIndex !== -1 && args[intervalIndex + 1] !== undefined && args[intervalIndex + 1] !== '') {
    interval = parseInt(args[intervalIndex + 1], 10)
  }

  if (seedIndex !== -1 && args[seedIndex + 1] !== undefined && args[seedIndex + 1] !== '') {
    seed = args[seedIndex + 1]
  }

  return { watch, interval, seed }
}

async function runCycle (
  wallet: WalletService,
  aaveClient: AaveClient,
  identityClient: IdentityClient,
  isWatchMode: boolean,
  env: Env
): Promise<void> {
  const timestamp = new Date().toLocaleTimeString()
  console.log(`\n[${timestamp}] 🔄 Starting Agent Cycle...`)

  // 1. Fetch State
  const address = await wallet.getAddress()
  const walletTokenBalance = await aaveClient.getTokenBalance()
  const aaveTokenBalance = await aaveClient.getAaveTokenBalance()

  // 2. Identity Check (Only warn in watch mode, don't block)
  const isRegistered = await identityClient.checkRegistration()
  if (!isRegistered) {
    if (!isWatchMode) {
      console.log('\n⚠️ Agent Identity not found on ERC-8004 Registry.')
      const answer = await promptUser('❓ Mint Agent Identity NFT? [y/N] ')
      if (answer.toLowerCase() === 'y') {
        try {
          const hash = await identityClient.register(env.AGENT_NAME)
          console.log(`✅ Identity Minted! Hash: ${hash}`)
          console.log('Waiting 5s for propagation...')
          await new Promise(resolve => setTimeout(resolve, 5000))
        } catch (error) {
          console.error('❌ Failed to register identity:', error)
        }
      }
    } else {
      console.warn(`[${timestamp}] ⚠️ Agent Identity missing. Continuing in watch mode...`)
    }
  } else if (!isWatchMode) {
    console.log('✅ On-Chain Sovereignty Established (ERC-8004 Identity).')
  }

  // 3. Log State
  console.log(`📍 Wallet: ${address}`)
  console.log(`💰 Balance: ${formatUnits(walletTokenBalance, 6)} USDT`)
  console.log(`🏦 Aave:    ${formatUnits(aaveTokenBalance, 6)} aUSDT`)

  // 4. Get Agent Intent
  const intent = await getAgentIntent({
    aaveClient,
    minIdleBalance: MIN_IDLE_BALANCE,
    minSupplyUnit: MIN_SUPPLY_UNIT
  })

  console.log(`🧠 Intent:  ${intent.action.toUpperCase()} (${intent.reason})`)

  if (intent.action === 'none') {
    return
  }

  console.log(`   Amount:  ${formatUnits(intent.amount, 6)} USDT`)

  // 5. Confirmation (Skip in watch mode)
  if (!isWatchMode) {
    const answer = await promptUser(`\n❓ Proceed with ${intent.action.toUpperCase()}? [y/N] `)
    if (answer.toLowerCase() !== 'y') {
      console.log('❌ Action cancelled by user.')
      return
    }
  } else {
    console.log('🤖 Autonomous Mode: Auto-confirming action...')
  }

  // 6. Execute
  console.log(`🚀 Executing ${intent.action}...`)
  let txHash: string

  if (intent.action === 'supply') {
    txHash = await aaveClient.supply(intent.amount)
  } else if (intent.action === 'withdraw') {
    txHash = await aaveClient.withdraw(intent.amount)
  } else {
    throw new Error(`Unknown action: ${intent.action as string}`)
  }

  console.log('✅ Transaction sent!')
  console.log(`🔗 Hash: ${txHash}`)
}

async function main (): Promise<void> {
  console.log('🚀 Initializing Sovereign Financial Node...')
  console.log('===========================================')

  const { watch, interval, seed } = parseArgs()

  // Load configuration with optional seed override
  const env = loadConfig(seed !== undefined ? { AGENT_SEED_PHRASE: seed } : {})

  try {
    // Initialize Services
    const wallet = await WalletService.create(env)
    const aaveClient = new AaveClient(
      wallet,
      env.TOKEN_ADDRESS,
      env.AAVE_POOL_ADDRESS,
      env.AAVE_ATOKEN_ADDRESS,
      env.AAVE_DATA_PROVIDER_ADDRESS
    )
    const identityClient = new IdentityClient(wallet, env.ERC8004_IDENTITY_REGISTRY)

    if (watch) {
      console.log(`👁️  Autonomous Watch Mode Active (Heartbeat: ${interval}s)`)
      let isRunning = false

      // Initial run
      await runCycle(wallet, aaveClient, identityClient, true, env)

      setInterval(() => {
        void (async () => {
          if (isRunning) {
            console.log('⚠️ Previous cycle still running. Skipping...')
            return
          }
          isRunning = true
          try {
            await runCycle(wallet, aaveClient, identityClient, true, env)
          } catch (error) {
            console.error('❌ Error in cycle:', error)
          } finally {
            isRunning = false
            console.log(`💤 Sleeping for ${interval}s...`)
          }
        })()
      }, interval * 1000)
    } else {
      await runCycle(wallet, aaveClient, identityClient, false, env)
      process.exit(0)
    }
  } catch (error) {
    console.error('\n❌ Fatal error:', error)
    process.exit(1)
  }
}

void main()
