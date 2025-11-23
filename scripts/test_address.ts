import { ethers } from 'ethers'

const addr = '0x207ABAcEa9C55C6b18974aA179c5D0401b659B050'
console.log('Original:', addr)
console.log('Length:', addr.length)

try {
    const safe = ethers.getAddress(addr)
    console.log('Checksummed:', safe)
} catch (e) {
    console.log('Error (Direct):', e.message)
}

try {
    const lower = addr.toLowerCase()
    console.log('Lower:', lower)
    const safeLower = ethers.getAddress(lower)
    console.log('Checksummed (Lower):', safeLower)
} catch (e) {
    console.log('Error (Lower):', e.message)
}
