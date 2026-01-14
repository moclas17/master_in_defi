/**
 * Configuración de Wagmi para conexión de wallets
 * Basado en ConnectHub
 */

import { createConfig, http } from 'wagmi'
import { mainnet, celo, base } from 'wagmi/chains'
import { injected, walletConnect } from 'wagmi/connectors'

const walletConnectProjectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || ''

export const wagmiConfig = createConfig({
  chains: [mainnet, celo, base],
  connectors: [
    injected(),
    ...(walletConnectProjectId ? [walletConnect({ projectId: walletConnectProjectId })] : [])
  ],
  transports: {
    [mainnet.id]: http(),
    [celo.id]: http(process.env.NEXT_PUBLIC_CELO_MAINNET_RPC || 'https://forno.celo.org'),
    [base.id]: http(),
  },
})
