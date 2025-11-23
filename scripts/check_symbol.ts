import { ethers } from 'ethers'

const RPC = 'https://sepolia.base.org'
const TOKEN = '0xba50Cd2A20f6DA35D788639E581bca8d0B5d4D5f'

const ABI = ['function symbol() view returns (string)']

async function main() {
    const provider = new ethers.JsonRpcProvider(RPC)
    const contract = new ethers.Contract(TOKEN, ABI, provider)
    const symbol = await contract.symbol()
    console.log(`Symbol: ${symbol}`)
}

main()
