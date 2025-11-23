import { env } from './config/env.js'
import { WalletService } from './wallet/WalletService.js'
import { AaveClient } from './defi/AaveClient.js'

async function main (): Promise<void> {
  console.log('🚀 Starting Agent-Driven Yield Guard...')

  try {
    const wallet = await WalletService.create(env)
    const address = await wallet.getAddress()
    const balance = await wallet.getNativeBalance()

    console.log('✅ Wallet initialized.')
    console.log(`   Address: ${address}`)
    console.log(`   Native Balance: ${balance.toString()} wei`)

    const aave = new AaveClient(
      wallet,
      env.TOKEN_ADDRESS,
      env.AAVE_POOL_ADDRESS,
      env.AAVE_ATOKEN_ADDRESS,
      env.AAVE_DATA_PROVIDER_ADDRESS
    )
    const tokenBalance = await aave.getTokenBalance()

    console.log(`   Token Balance (${String(env.TOKEN_ADDRESS)}): ${tokenBalance.toString()}`)
  } catch (error) {
    console.error('❌ Error initializing wallet:', error)
    process.exit(1)
  }
}

void main()
