# 🔍 Debugging Wallet Connection

## Problema Actual
La wallet no se está conectando cuando haces click en "Conectar Wallet".

## Cambios Realizados

### 1. Fix en VerificationContext
**Archivo:** `src/contexts/VerificationContext.tsx`

Cambiado de:
```typescript
walletAddress: walletVerified ? address : undefined
```

A:
```typescript
walletAddress: address // Devolver address siempre que esté conectada
```

### 2. Logging agregado en WalletSignatureButton
**Archivo:** `src/components/verification/WalletSignatureButton.tsx`

Se agregaron `console.log` para debugging:
- Estado del componente al renderizar
- Connectors disponibles
- Cuando se intenta conectar
- Cuando se intenta desconectar

### 3. API de Wagmi v3 verificada
- `connect.mutate({ connector })` - Correcto para Wagmi v3
- `disconnect.disconnect()` - Correcto para Wagmi v3

## Cómo Debuggear

### Paso 1: Iniciar el servidor
```bash
# Limpiar procesos anteriores
pkill -9 -f "next dev"
rm -rf .next

# Iniciar servidor limpio
npm run dev
```

### Paso 2: Abrir la aplicación
```bash
# Abrir en navegador
open http://localhost:3000
```

### Paso 3: Abrir DevTools Console
1. Click derecho → Inspeccionar
2. Tab "Console"
3. Limpiar console (click en 🚫)

### Paso 4: Navegar al VerificationGate
1. Click en un protocolo (ej: Aave)
2. Tab "Wallet Signature"
3. Observa la console

**Deberías ver:**
```javascript
WalletSignatureButton render: {
  connections: 0,
  isConnected: false,
  address: undefined,
  availableConnectors: [
    { id: 'farcasterMiniApp', name: '...' },
    { id: 'injected', name: 'Injected' },
    { id: 'walletConnect', name: 'WalletConnect' }
  ],
  connectPending: false
}
```

### Paso 5: Click "Conectar Wallet"

**En la console deberías ver:**
```javascript
Connecting with connector: injected MetaMask
```

**Luego deberías ver:**
- Popup de MetaMask (o tu wallet)
- Request para conectar

**Si NO aparece el popup:**
- Verifica que tengas una wallet instalada (MetaMask, Coinbase Wallet, etc.)
- Verifica la console por errores

### Paso 6: Después de conectar

**Deberías ver en console:**
```javascript
WalletSignatureButton render: {
  connections: 1,
  isConnected: true,
  address: "0x...",
  availableConnectors: [...],
  connectPending: false
}
```

## Posibles Problemas

### Error: "No connector available"
**Console muestra:**
```
No connector available, connectors: []
```

**Solución:**
- Verifica que `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` esté en `.env.local`
- Reinicia el servidor: `npm run dev`

### Error: "connect.mutate is not a function"
**Causa:** API de Wagmi incorrecta

**Solución:**
```typescript
// Correcto para Wagmi v3
connect.mutate({ connector })

// INCORRECTO (Wagmi v2)
connect.connect({ connector })
```

### Wallet popup no aparece
**Causas posibles:**
1. No tienes wallet instalada
2. Wallet está bloqueada
3. Popup bloqueado por el navegador

**Solución:**
1. Instala MetaMask: https://metamask.io
2. Desbloquea la wallet
3. Permite popups para localhost

### Error: "Cannot read property 'accounts' of undefined"
**Causa:** `activeConnection` es undefined

**Solución:**
El código ya maneja esto:
```typescript
const address = activeConnection?.accounts?.[0]
```

## Verificar Configuración

### 1. Wagmi Config
**Archivo:** `src/lib/wagmi.ts`

```typescript
export const wagmiConfig = createConfig({
  chains: [mainnet, celo, base],
  connectors: [
    farcasterMiniApp(),
    injected(),
    walletConnect({ projectId: config.wallet.projectId })
  ],
  transports: {
    [mainnet.id]: http(),
    [celo.id]: http(config.self.celoRpcUrl),
    [base.id]: http(),
  },
})
```

**Verificar:**
- ✅ `projectId` está configurado
- ✅ `injected()` está incluido
- ✅ Transports configurados

### 2. Providers
**Archivo:** `src/app/layout.tsx`

```typescript
<WagmiProvider config={wagmiConfig}>
  <QueryClientProvider client={queryClient}>
    <FarcasterProvider>
      <SelfProvider>
        <VerificationProvider>
          {children}
        </VerificationProvider>
      </SelfProvider>
    </FarcasterProvider>
  </QueryClientProvider>
</WagmiProvider>
```

**Verificar:**
- ✅ WagmiProvider envuelve todo
- ✅ QueryClientProvider presente
- ✅ VerificationProvider dentro

### 3. Environment Variables
**Archivo:** `.env.local`

```bash
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=9eaf123609f168f6af638f1f2d752b29
```

**Verificar:**
- ✅ Variable existe
- ✅ Tiene valor válido
- ✅ Empieza con `NEXT_PUBLIC_`

## Tests Rápidos

### Test 1: Verificar Connectors
Abrir console y ejecutar:
```javascript
// En la página de VerificationGate
console.log(window.wagmi)
```

**Debería mostrar:** Objeto wagmi configurado

### Test 2: Verificar WalletConnect
```bash
# En terminal
grep WALLETCONNECT .env.local
```

**Debería mostrar:**
```
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=...
```

### Test 3: Verificar Build
```bash
npm run build
```

**Debería completar sin errores**

## Reporte de Bug Template

Si el problema persiste, reporta con esta información:

```
**Environment:**
- OS: macOS
- Browser: Chrome/Firefox/Safari
- Wallet: MetaMask/Coinbase/Other
- Node version: [ejecuta: node -v]
- npm version: [ejecuta: npm -v]

**Console Logs:**
[Pega los logs de la console aquí]

**Network Tab:**
[Si hay requests fallando, pega aquí]

**Steps to Reproduce:**
1. Abrir http://localhost:3000
2. Click en protocolo
3. Tab "Wallet Signature"
4. Click "Conectar Wallet"
5. [Lo que pasa]

**Expected:** Wallet popup aparece
**Actual:** [Lo que realmente pasa]

**Screenshots:**
[Si es posible]
```

## Soluciones Alternativas

### Opción 1: Usar Solo Self Protocol
Si Wallet Signature no funciona, puedes deshabilitar esa opción:

```typescript
// En VerificationGate.tsx
<VerificationGate
  requireVerification={true}
  allowWalletSignature={false}  // Deshabilitar
>
```

### Opción 2: Hacer Wallet Signature Opcional
```typescript
// En quiz pages
<VerificationGate requireVerification={false}>
  {/* Quiz content */}
</VerificationGate>
```

### Opción 3: Mock para Testing
```typescript
// En development, mock el verification
if (process.env.NODE_ENV === 'development') {
  // Auto-verificar
  localStorage.setItem('WALLET_VERIFIED_0x123', 'true')
}
```

## Próximos Pasos

1. ✅ Iniciar servidor limpio
2. ✅ Abrir console
3. ✅ Intentar conectar wallet
4. ✅ Revisar logs
5. ✅ Reportar findings

---

**Última actualización:** 2026-01-15
**Versiones:** Wagmi v3.3.2, Next.js 16.1.1
