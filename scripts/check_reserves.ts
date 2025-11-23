import { ethers } from 'ethers'
import dotenv from 'dotenv'

dotenv.config()

const RPC_URL = process.env.RPC_URL
const POOL_ADDRESS = process.env.AAVE_POOL_ADDRESS
const USER_USDT = process.env.TOKEN_ADDRESS // 0x1c7...
const AAVE_FAUCET_USDT = '0x94a9D9AC8a22534E3FaCa9F4e7F2E2cf85d5E4C8'

const POOL_ABI = [
    'function getReserveData(address asset) view returns (tuple(uint256 configuration, uint128 liquidityIndex, uint128 currentLiquidityRate, uint128 variableBorrowIndex, uint128 currentVariableBorrowRate, uint128 currentStableBorrowRate, uint40 lastUpdateTimestamp, uint16 id, address aTokenAddress, address stableDebtTokenAddress, address variableDebtTokenAddress, address interestRateStrategyAddress, uint128 accruedToTreasury, uint128 unbacked, uint128 isolationModeTotalDebt))'
]

const ADDRESS_PROVIDER = '0x012bAC54348C0E635dCAc9D5FB99f06F24136C9A' // Sepolia Market
const ADDRESS_PROVIDER_ABI = ['function getPool() view returns (address)']

async function main() {
    const provider = new ethers.JsonRpcProvider(RPC_URL)

    // 1. Check Code
    const code = await provider.getCode(POOL_ADDRESS!)
    console.log(`Code at ${POOL_ADDRESS}:`, code === '0x' ? 'EMPTY (Not a contract)' : 'EXISTS')

    // 2. Get Pool from Provider
    try {
        const addressProvider = new ethers.Contract(ADDRESS_PROVIDER, ADDRESS_PROVIDER_ABI, provider)
        const officialPool = await addressProvider.getPool()
        console.log('Official Pool from Provider:', officialPool)

        if (officialPool.toLowerCase() !== POOL_ADDRESS!.toLowerCase()) {
            console.warn('⚠️ Configured Pool Address does NOT match Official Pool!')
        }

        // 3. Try getReserveData on Official Pool
        const pool = new ethers.Contract(officialPool, POOL_ABI, provider)

        // Check User USDT
        try {
            console.log(`\nChecking User USDT (${USER_USDT}) on Official Pool...`)
            const data = await pool.getReserveData(USER_USDT)
            console.log('✅ Asset is listed!')
            console.log('   aTokenAddress:', data.aTokenAddress)
        } catch (e) {
            console.log('❌ User USDT Failed:', e.code || e.message)
        }

        // Check Faucet USDT
        try {
            console.log(`\nChecking Faucet USDT (${AAVE_FAUCET_USDT}) on Official Pool...`)
            const data = await pool.getReserveData(AAVE_FAUCET_USDT)
            console.log('✅ Asset is listed!')
            console.log('   aTokenAddress:', data.aTokenAddress)
        } catch (e) {
            console.log('❌ Faucet USDT Failed:', e.code || e.message)
        }

    } catch (e) {
        console.error('Failed to query AddressProvider:', e.message)
    }
}

main()
