# Database Migration: Add Status Column

## Fecha
2026-01-16

## Descripción
Agregar columna `status` a la tabla `protocols` para controlar la visibilidad de los protocolos.

## Valores posibles
- `'public'`: El protocolo es visible para todos los usuarios (valor por defecto)
- `'draft'`: El protocolo está oculto (solo visible en admin)

## Aplicar la migración

### Opción 1: Usando el archivo de migración
```bash
# Conectar a Neon PostgreSQL y ejecutar
psql $DATABASE_URL -f migration-add-status.sql
```

### Opción 2: Ejecutar manualmente
Conecta a tu base de datos Neon y ejecuta estos comandos SQL:

```sql
-- Add status column with default value 'public'
ALTER TABLE protocols
ADD COLUMN IF NOT EXISTS status VARCHAR(10) DEFAULT 'public';

-- Add check constraint to ensure only valid values
ALTER TABLE protocols
ADD CONSTRAINT check_protocol_status CHECK (status IN ('public', 'draft'));

-- Create index for filtering by status
CREATE INDEX IF NOT EXISTS idx_protocols_status ON protocols(status);

-- Add comment for documentation
COMMENT ON COLUMN protocols.status IS 'Protocol visibility status: public (visible to users) or draft (hidden)';

-- Update existing rows to have 'public' status if null
UPDATE protocols
SET status = 'public'
WHERE status IS NULL;
```

### Opción 3: Desde la consola de Neon
1. Ve a [https://console.neon.tech](https://console.neon.tech)
2. Selecciona tu proyecto y base de datos
3. Abre el SQL Editor
4. Copia y pega el contenido de `migration-add-status.sql`
5. Ejecuta el script

## Verificar la migración

```sql
-- Ver la estructura de la tabla
\d protocols

-- Verificar que la columna existe
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'protocols' AND column_name = 'status';

-- Ver los valores actuales
SELECT id, name, status FROM protocols;
```

## Rollback (opcional)

Si necesitas revertir esta migración:

```sql
-- Remover la constraint
ALTER TABLE protocols DROP CONSTRAINT IF EXISTS check_protocol_status;

-- Remover el índice
DROP INDEX IF EXISTS idx_protocols_status;

-- Remover la columna
ALTER TABLE protocols DROP COLUMN IF EXISTS status;
```

## Archivos modificados

### Código TypeScript
- [src/types/protocol.ts](src/types/protocol.ts) - Agregado campo `status?: 'public' | 'draft'`
- [src/lib/db/protocols.ts](src/lib/db/protocols.ts) - Actualizado interface y queries SQL
- [src/app/api/protocols/[id]/route.ts](src/app/api/protocols/[id]/route.ts) - Agregado `status` a updates
- [src/app/page.tsx](src/app/page.tsx) - Filtro para ocultar drafts
- [src/data/protocols/aave.ts](src/data/protocols/aave.ts) - Agregado `status: 'public'`
- [src/data/protocols/morpho.ts](src/data/protocols/morpho.ts) - Agregado `status: 'public'`
- [src/data/protocols/sablier.ts](src/data/protocols/sablier.ts) - Agregado `status: 'draft'` (ejemplo)

### Base de datos
- [schema.sql](schema.sql) - Schema principal actualizado
- [migration-add-status.sql](migration-add-status.sql) - Script de migración

## Uso

### En archivos de protocolo (file-based)
```typescript
export const myProtocol: Protocol = {
  // ... otros campos
  status: 'draft', // o 'public'
}
```

### En el admin API
```bash
# Actualizar un protocolo a draft
curl -X PUT http://localhost:3000/api/protocols/aave \
  -H "x-admin-secret: $ADMIN_SECRET" \
  -H "Content-Type: application/json" \
  -d '{"status": "draft"}'

# Actualizar un protocolo a public
curl -X PUT http://localhost:3000/api/protocols/aave \
  -H "x-admin-secret: $ADMIN_SECRET" \
  -H "Content-Type: application/json" \
  -d '{"status": "public"}'
```

## Impacto

### Frontend
- Los protocolos con `status: 'draft'` NO aparecen en la página principal
- Solo los protocolos con `status: 'public'` (o sin status) son visibles

### Backend
- `getAllProtocols()` filtra automáticamente por `status = 'public'`
- `getAllProtocolsAdmin()` muestra todos los protocolos incluyendo drafts
- La constraint a nivel de base de datos garantiza que solo se usen valores válidos

## Notas
- El campo `status` es independiente del campo `active`
- Un protocolo puede estar `active: true` pero `status: 'draft'` (no visible públicamente)
- Para deshabilitar completamente un protocolo, usar `active: false`
