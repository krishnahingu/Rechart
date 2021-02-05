import { ethers, providers, Wallet } from 'ethers'

const connect = (): [string, providers.Provider, Wallet] => {
  // get network from args
  const network = 'mainnet'

  // set provider from infura & network
  const provider = new providers.InfuraProvider(
    network, 'e33335b99d78415b82f8b9bc5fdc44c0')

  // use private key for wallet
  const wallet = new ethers.Wallet('0x1d908e7746b5cd98b18574c559406fc485c445fa7dd3ab958082c3e4a40beb4d', provider)
  
  return [network, provider, wallet]
}

export { connect }