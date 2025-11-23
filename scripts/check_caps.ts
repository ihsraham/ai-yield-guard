import { ethers } from 'ethers'
import dotenv from 'dotenv'

dotenv.config()

const RPC_URL = process.env.RPC_URL
const TOKEN_ADDRESS = '0x779877A7B0D9E8603169DdbD7836e478b4624789' // Aave Faucet LINK
// Aave Protocol Data Provider on Sepolia
const ADDRESS_PROVIDER = '0x012bAC54348C0E635dCAc9D5FB99f06F24136C9A'
const ADDRESS_PROVIDER_ABI = [
    'function getPoolDataProvider() view returns (address)'
]

const DATA_PROVIDER_ABI = [
    'function getReserveCaps(address asset) view returns (uint256 borrowCap, uint256 supplyCap)',
    'function getReserveData(address asset) view returns (uint256 unbacked, uint256 accruedToTreasury, uint256 totalAToken, uint256 totalStableDebt, uint256 totalVariableDebt, uint256 liquidityRate, uint256 variableBorrowRate, uint256 stableBorrowRate, uint256 averageStableBorrowRate, uint256 liquidityIndex, uint256 variableBorrowIndex, uint40 lastUpdateTimestamp)'
]

async function main() {
    const provider = new ethers.JsonRpcProvider(RPC_URL)

    // 1. Get DataProvider from AddressProvider
    const addressProvider = new ethers.Contract(ADDRESS_PROVIDER, ADDRESS_PROVIDER_ABI, provider)
    const dataProviderAddress = await addressProvider.getPoolDataProvider()
    console.log('Data Provider Address:', dataProviderAddress)

    const dataProvider = new ethers.Contract(dataProviderAddress, DATA_PROVIDER_ABI, provider)

    console.log(`Checking Caps for Asset: ${TOKEN_ADDRESS}`)

    try {
        const caps = await dataProvider.getReserveCaps(TOKEN_ADDRESS!)
        const data = await dataProvider.getReserveData(TOKEN_ADDRESS!)

        const supplyCap = caps.supplyCap
        const totalSupplied = data.totalAToken

        console.log(`Supply Cap: ${supplyCap.toString()}`)
        console.log(`Total Supplied (aToken): ${totalSupplied.toString()}`)

        // Supply Cap is in whole units (e.g. 1000000 USDT), while totalSupplied is in wei units (6 decimals for USDT)
        // Wait, Aave V3 supplyCap is usually in whole units of the asset.
        // Let's check the docs or assume standard.
        // If supplyCap is 0, it means uncapped? No, 0 usually means 0.

        console.log('--- Analysis ---')
        if (supplyCap === 0n) {
            console.log('Supply Cap is 0 (Likely Capped/Frozen or Uncapped if interpreted differently, but usually 0 means 0)')
        } else {
            // Assuming USDT has 6 decimals
            const supplyCapWei = supplyCap * 10n ** 6n
            console.log(`Supply Cap (Wei approx): ${supplyCapWei.toString()}`)

            if (totalSupplied >= supplyCapWei) {
                console.log('❌ SUPPLY CAP REACHED OR EXCEEDED!')
            } else {
                const remaining = supplyCapWei - totalSupplied
                console.log(`✅ Cap not reached. Remaining capacity: ${remaining.toString()} wei`)
            }
        }

    } catch (e) {
        console.error('Error fetching data:', e)
    }
}

main()
