# 🎉 Integración POAP - Guía Completa

## Resumen

Este documento explica cómo funciona la integración de POAPs (Proof of Attendance Protocol) en el proyecto DeFi Learning Quiz.

## ¿Qué son los POAPs?

POAPs son NFTs que sirven como prueba de asistencia o logro. En este proyecto, los usuarios reciben un POAP al completar exitosamente un quiz (≥3 respuestas correctas de 5).

---

## 📋 Requisitos Previos

### 1. Cuenta POAP.xyz

Necesitas una cuenta en [POAP.xyz](https://poap.xyz) con acceso a la API.

**Credenciales necesarias:**
- `POAP_API_KEY`
- `POAP_CLIENT_ID`
- `POAP_CLIENT_SECRET`

### 2. Eventos POAP Creados

Debes crear 3 eventos POAP (uno por protocolo):
- **Aave Protocol Quiz** → Event ID
- **Morpho Protocol Quiz** → Event ID
- **Sablier Protocol Quiz** → Event ID

### 3. Base de Datos Neon

Necesitas una base de datos PostgreSQL en [Neon.tech](https://neon.tech) (tier gratuito disponible).

---

## 🚀 Configuración Paso a Paso

### Paso 1: Copiar Variables de Entorno

Copia tus credenciales POAP desde el proyecto anterior:

```bash
# En el proyecto /Users/mac03/web3/poapsdk/poap-quiz-app/.env.local
# Copia estas líneas a /Users/mac03/web3/master_in_defi/.env.local

POAP_API_KEY=tu_api_key_aqui
POAP_CLIENT_ID=tu_client_id_aqui
POAP_CLIENT_SECRET=tu_client_secret_aqui
```

### Paso 2: Configurar Event IDs

Agrega los IDs de tus eventos POAP en `.env.local`:

```env
POAP_EVENT_ID_AAVE=12345     # Reemplaza con tu Event ID real
POAP_EVENT_ID_MORPHO=12346   # Reemplaza con tu Event ID real
POAP_EVENT_ID_SABLIER=12347  # Reemplaza con tu Event ID real
```

### Paso 3: Configurar Base de Datos

1. **Crear base de datos en Neon:**
   - Ve a [neon.tech](https://neon.tech)
   - Crea un nuevo proyecto
   - Copia la connection string

2. **Agregar a `.env.local`:**
   ```env
   DATABASE_URL=postgresql://user:password@host:5432/dbname?sslmode=require
   ```

3. **Ejecutar el schema:**
   ```bash
   # Opción A: Desde psql
   psql $DATABASE_URL -f schema.sql

   # Opción B: Desde Neon dashboard
   # Copia el contenido de schema.sql y ejecútalo en el SQL Editor
   ```

### Paso 4: Verificar Instalación

```bash
npm install
npm run dev
```

La tabla `poap_claims` se creará automáticamente al iniciar la aplicación.

---

## 🎯 Flujo de Usuario

### 1. Usuario Completa Quiz

```
Usuario responde quiz → Score calculado en servidor → Token generado
```

### 2. Usuario Ve Resultados

Si `score >= 3`:
- ✅ Muestra secret word
- ✅ Muestra botón "Claim Your POAP"

### 3. Usuario Reclama POAP

```
Click "Claim Your POAP"
    ↓
POST /api/poap/claim { token, walletAddress }
    ↓
Validaciones:
  - Token válido y no expirado ✓
  - Quiz pasado (score >= 3) ✓
  - No reclamado previamente ✓
    ↓
Reservar POAP con poapClient.reservePoapForEmail()
    ↓
Guardar en database (poap_claims table)
    ↓
Retornar claim URL: https://poap.xyz/claim/abc123
    ↓
Modal animado con link a POAP.xyz
```

### 4. Usuario Mintea POAP

- Click en "Claim on POAP.xyz"
- Redirige a `https://poap.xyz/claim/ABC123`
- Usuario mintea el NFT en POAP.xyz

---

## 🗂️ Arquitectura

### Archivos Nuevos Creados

```
src/
├── types/
│   └── poap.ts                          # Types para POAPs
├── lib/
│   ├── poap/
│   │   └── client.ts                    # Cliente POAP SDK
│   └── db/
│       └── poap-claims.ts               # Database module
├── app/
│   └── api/
│       └── poap/
│           ├── claim/route.ts           # POST /api/poap/claim
│           └── verify/route.ts          # GET /api/poap/verify
└── components/
    └── poap/
        ├── POAPClaimButton.tsx          # Botón de claim
        └── POAPClaimModal.tsx           # Modal animado
```

### Archivos Modificados

```
src/
├── lib/
│   ├── config.ts                        # +poap config
│   └── quiz-tokens.ts                   # +walletAddress field
├── app/
│   ├── api/quiz/submit/route.ts         # +capture wallet
│   └── quiz/[protocolId]/
│       ├── start/page.tsx               # +send wallet
│       └── results/page.tsx             # +POAP UI
├── data/protocols/
│   ├── aave.ts                          # +poapEventId
│   ├── morpho.ts                        # +poapEventId
│   └── sablier.ts                       # +poapEventId
└── types/
    └── protocol.ts                      # +poapEventId field
```

---

## 🔒 Seguridad

### 1. Prevención de Duplicados

```sql
CONSTRAINT unique_protocol_wallet UNIQUE(protocol_id, wallet_address)
```

Un usuario solo puede reclamar 1 POAP por protocolo.

### 2. Validación de Token

```typescript
// El token expira en 10 minutos
const quizData = getQuizToken(token)
if (!quizData) {
  return { error: 'Invalid or expired token' }
}
```

### 3. Verificación de Score

```typescript
// Solo usuarios que pasaron el quiz
if (quizData.score < 3) {
  return { error: 'Quiz not passed' }
}
```

### 4. Verificación de Wallet

El wallet debe estar verificado mediante:
- Self Protocol (verificación completa), o
- Wallet Signature (verificación básica)

---

## 📊 Base de Datos

### Tabla: `poap_claims`

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id` | UUID | Primary key |
| `protocol_id` | VARCHAR(50) | 'aave', 'morpho', 'sablier' |
| `wallet_address` | VARCHAR(42) | Dirección del usuario |
| `email` | VARCHAR(255) | Email (opcional) |
| `score` | INTEGER | Score del quiz (0-5) |
| `passed` | BOOLEAN | Si pasó el quiz (≥3) |
| `verification_method` | VARCHAR(20) | 'self' o 'wallet' |
| `poap_event_id` | INTEGER | Event ID de POAP.xyz |
| `poap_claim_code` | VARCHAR(255) | qr_hash del POAP |
| `poap_claim_url` | VARCHAR(512) | URL de claim |
| `claimed` | BOOLEAN | Si ya fue reclamado |
| `quiz_token` | VARCHAR(128) | Token temporal del quiz |
| `completed_at` | TIMESTAMP | Cuándo completó el quiz |
| `claimed_at` | TIMESTAMP | Cuándo reclamó el POAP |

### Queries Útiles

```sql
-- Ver todos los claims
SELECT * FROM poap_claims ORDER BY completed_at DESC;

-- Claims por protocolo
SELECT protocol_id, COUNT(*) as total_claims
FROM poap_claims
WHERE claimed = true
GROUP BY protocol_id;

-- Top usuarios (por POAPs reclamados)
SELECT wallet_address, COUNT(*) as poaps_earned
FROM poap_claims
WHERE claimed = true
GROUP BY wallet_address
ORDER BY poaps_earned DESC
LIMIT 10;

-- Tasa de conversión (quiz completado → POAP reclamado)
SELECT
  protocol_id,
  COUNT(*) as total_passed,
  COUNT(CASE WHEN claimed THEN 1 END) as total_claimed,
  ROUND(COUNT(CASE WHEN claimed THEN 1 END)::NUMERIC / COUNT(*) * 100, 2) as claim_rate
FROM poap_claims
WHERE passed = true
GROUP BY protocol_id;
```

---

## 🎨 Componentes UI

### POAPClaimButton

**Props:**
```typescript
{
  token: string              // Token del quiz
  protocolId: string         // 'aave' | 'morpho' | 'sablier'
  walletAddress?: string     // Opcional (se obtiene del contexto)
  onSuccess?: (url) => void  // Callback al reclamar exitosamente
}
```

**Estados:**
- Loading: Muestra spinner mientras mintea
- Error: Muestra mensaje de error
- Already Claimed: Avisa si ya reclamó
- Success: Abre modal con el claim URL

### POAPClaimModal

**Características:**
- ✨ Animación de entrada (fade + scale)
- 🎨 Anillos rotatorios (spinning rings)
- 🎉 Emoji animado con bounce
- 📋 Botón para copiar URL
- 🚀 Botón para abrir POAP.xyz
- 🎭 Transiciones suaves con delays escalonados

---

## 🧪 Testing

### 1. Test Local (Sin POAP Real)

Si no tienes credenciales POAP, puedes:

**Opción A:** Mock el cliente POAP
```typescript
// En src/lib/poap/client.ts
async reservePoapForEmail(eventId: number, email: string) {
  // Mock response
  return {
    claimCode: 'MOCK-' + Math.random().toString(36).substring(7),
    claimUrl: 'https://poap.xyz/claim/mock-code',
  }
}
```

**Opción B:** Usar `.env.local` de desarrollo
```env
POAP_API_KEY=test_key
POAP_CLIENT_ID=test_id
POAP_CLIENT_SECRET=test_secret
```

### 2. Test con POAP Real

```bash
# 1. Configurar .env.local con credenciales reales
# 2. Iniciar app
npm run dev

# 3. Completar quiz
# - Ir a http://localhost:3000
# - Seleccionar protocolo (ej: Aave)
# - Verificar wallet
# - Estudiar briefing
# - Responder quiz (mínimo 3 correctas)

# 4. Reclamar POAP
# - Ver página de resultados
# - Click "Claim Your POAP"
# - Verificar modal con animación
# - Click "Claim on POAP.xyz"

# 5. Verificar en database
SELECT * FROM poap_claims WHERE wallet_address = '0x...';
```

### 3. Test de Duplicados

```bash
# Intentar reclamar el mismo protocolo 2 veces
# Debería mostrar: "You have already claimed a POAP for this protocol"
```

---

## 🐛 Troubleshooting

### Error: "POAP event not configured"

**Causa:** `POAP_EVENT_ID_XXX` no está configurado o es 0

**Solución:**
```env
# En .env.local, asegúrate de tener IDs reales
POAP_EVENT_ID_AAVE=12345  # No 0
```

### Error: "Failed to reserve POAP"

**Causas posibles:**
1. Credenciales POAP incorrectas
2. Event ID inválido
3. No hay códigos de claim disponibles en POAP.xyz
4. Rate limit de la API

**Solución:**
- Verificar credenciales en POAP.xyz dashboard
- Verificar que el evento tenga códigos disponibles
- Revisar logs del servidor: `console.error`

### Error: "Invalid or expired token"

**Causa:** El token del quiz expiró (10 minutos)

**Solución:**
- Completar el quiz nuevamente
- Los tokens expiran para seguridad

### Error: Database connection failed

**Causa:** `DATABASE_URL` incorrecta o database no accesible

**Solución:**
```bash
# Verificar connection string
echo $DATABASE_URL

# Test connection
psql $DATABASE_URL -c "SELECT 1;"

# Re-ejecutar schema
psql $DATABASE_URL -f schema.sql
```

---

## 📈 Métricas y Analytics

### Endpoints para Stats

**GET /api/poap/verify?wallet=0x...**
- Retorna todos los POAPs de un usuario

**Función útil en DB module:**
```typescript
import { getProtocolStats } from '@/lib/db/poap-claims'

const stats = await getProtocolStats('aave')
// {
//   totalAttempts: 100,
//   passedCount: 75,
//   claimedCount: 60,
//   averageScore: 4.2
// }
```

---

## 🔄 Mantenimiento

### Limpiar Tokens Expirados

Los tokens de quiz se limpian automáticamente cada 5 minutos (in-memory).

Para limpiar claims antiguos de la DB:

```sql
-- Claims más antiguos de 30 días sin reclamar
DELETE FROM poap_claims
WHERE claimed = false
AND completed_at < NOW() - INTERVAL '30 days';
```

### Backup de Database

```bash
# Export
pg_dump $DATABASE_URL > poap_claims_backup.sql

# Import
psql $DATABASE_URL < poap_claims_backup.sql
```

---

## 🎯 Próximas Mejoras

1. **Colección de POAPs**
   - Página `/collection` para ver todos los POAPs del usuario
   - Galería con imágenes de POAP.xyz

2. **Leaderboard**
   - Top usuarios por POAPs reclamados
   - Badges especiales por completar todos los protocolos

3. **Email Notifications**
   - Enviar email con claim link
   - Recordatorio si no reclama en 7 días

4. **Social Sharing**
   - Compartir logro en Twitter/Farcaster
   - Open Graph tags para preview

5. **Analytics Dashboard**
   - Admin panel para ver stats
   - Charts con tasa de conversión
   - Métricas por protocolo

---

## 📞 Soporte

Si tienes problemas:

1. Revisa logs del servidor: `npm run dev` (consola)
2. Verifica `.env.local` con todas las variables
3. Revisa que la database esté accesible
4. Consulta la documentación de POAP: [docs.poap.xyz](https://documentation.poap.tech/)

---

## 📝 Changelog

### v1.0.0 - Integración Inicial
- ✅ Cliente POAP SDK integrado
- ✅ Database con Neon PostgreSQL
- ✅ API endpoints (claim, verify)
- ✅ UI components con animaciones
- ✅ Prevención de duplicados
- ✅ Validación de seguridad

---

**¡Disfruta recompensando a tus usuarios con POAPs!** 🎉
