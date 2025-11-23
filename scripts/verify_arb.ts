import { ethers } from 'ethers'

const RPC = 'https://sepolia-rollup.arbitrum.io/rpc'
const ADDR = '0x546e0806fdA32AA6e3757b5ed8A3651B41439b11'

async function main() {
    const provider = new ethers.JsonRpcProvider(RPC)
    const safeAddr = ethers.getAddress(ADDR.toLowerCase())
    console.log('Checking', safeAddr)
    try {
        const code = await provider.getCode(safeAddr)
        console.log('Code length:', code.length)
        if (code === '0x') {
            console.log('❌ No code at address')
        } else {
            console.log('✅ Contract exists!')
        }
    } catch (e) {
        console.log('Error:', e.message)
    }
}

main()
