'use client'

/**
 * Componente 3D del Macintosh Vintage
 * Renderiza el modelo 3D del Macintosh según las especificaciones técnicas
 */

import { useMemo } from 'react'
import { Box, RoundedBox, Text } from '@react-three/drei'
import { PlaneGeometry } from 'three'
import { usePlasticTextures } from './textures'

// Colores según especificaciones
const COLORS = {
  mainBody: '#F5F5DC', // Beige claro
  screenBezel: '#D8D8C8', // Beige más oscuro
  screen: '#1a1a1a', // Negro muy oscuro
  floppySlot: '#808080', // Gris metálico
  base: '#C8C8B8', // Beige oscuro
} as const

// Dimensiones según especificaciones (en metros, escala web 0.6x)
const DIMENSIONS = {
  // Carcasa principal
  bodyWidth: 0.15, // 15cm
  bodyHeight: 0.18, // 18cm
  bodyDepth: 0.15, // 15cm
  
  // Pantalla
  screenWidth: 0.12, // 12cm
  screenHeight: 0.09, // 9cm
  screenDepth: 0.005, // 0.5cm
  
  // Bisel
  bezelThickness: 0.012, // 1.2cm
  
  // Ranura disquete
  floppyWidth: 0.054, // 5.4cm
  floppyHeight: 0.001, // 0.1cm
  floppyDepth: 0.006, // 0.6cm
} as const

interface MacintoshModelProps {
  /** Si es true, muestra detalles opcionales como base y logo */
  showDetails?: boolean
}

export function MacintoshModel({ showDetails = false }: MacintoshModelProps) {
  // Generar texturas procedurales para materiales de plástico
  const mainBodyTextures = usePlasticTextures(COLORS.mainBody, 512)
  const bezelTextures = usePlasticTextures(COLORS.screenBezel, 512)
  const baseTextures = usePlasticTextures(COLORS.base, 512)

  // Props de materiales físicos (PBR) con texturas para mejor performance
  const mainBodyMaterialProps = useMemo(() => ({
    color: COLORS.mainBody,
    roughness: 0.7,
    metalness: 0.1,
    // Propiedades PBR para plástico con recubrimiento
    clearcoat: 0.3, // Recubrimiento brillante sutil (simula plástico con acabado)
    clearcoatRoughness: 0.2, // Rugosidad del recubrimiento (más bajo = más brillante)
    ior: 1.5, // Índice de refracción del plástico (típico para plástico ABS)
    envMapIntensity: 0.5, // Intensidad de reflejos del entorno
    // Texturas
    normalMap: mainBodyTextures.normalMap,
    normalScale: 0.3, // Intensidad del normal map (sutil)
    roughnessMap: mainBodyTextures.roughnessMap,
    aoMap: mainBodyTextures.aoMap,
    aoMapIntensity: 0.5, // Intensidad de ambient occlusion
  }), [mainBodyTextures])

  const screenBezelMaterialProps = useMemo(() => ({
    color: COLORS.screenBezel,
    roughness: 0.7,
    metalness: 0.1,
    // Propiedades PBR
    clearcoat: 0.25, // Recubrimiento ligeramente menos brillante que la carcasa
    clearcoatRoughness: 0.25,
    ior: 1.5,
    envMapIntensity: 0.4,
    // Texturas
    normalMap: bezelTextures.normalMap,
    normalScale: 0.3,
    roughnessMap: bezelTextures.roughnessMap,
    aoMap: bezelTextures.aoMap,
    aoMapIntensity: 0.5,
  }), [bezelTextures])

  // Geometría de pantalla con curvatura sutil (típica de CRT)
  // Las pantallas CRT tienen una curvatura convexa hacia afuera, más pronunciada en los bordes
  const curvedScreenGeometry = useMemo(() => {
    const width = DIMENSIONS.screenWidth
    const height = DIMENSIONS.screenHeight
    const widthSegments = 32
    const heightSegments = 32
    
    // Crear geometría de plano
    const geometry = new PlaneGeometry(width, height, widthSegments, heightSegments)
    const positions = geometry.attributes.position
    
    // Aplicar curvatura sutil hacia afuera (convex) típica de CRT
    // La curvatura es más pronunciada en los bordes (como en pantallas CRT reales)
    const maxCurvature = 0.003 // Curvatura máxima en los bordes (3mm)
    
    for (let i = 0; i < positions.count; i++) {
      const x = positions.getX(i)
      const y = positions.getY(i)
      
      // Calcular distancia desde el centro (normalizada de 0 a 1)
      const nx = (x / (width / 2))
      const ny = (y / (height / 2))
      const dist = Math.sqrt(nx * nx + ny * ny)
      
      // Aplicar curvatura con función cuadrática (más pronunciada en bordes)
      // Usar clamp para evitar valores fuera de rango
      const clampedDist = Math.min(1, dist)
      const z = Math.pow(clampedDist, 2.5) * maxCurvature
      positions.setZ(i, z)
    }
    
    // Recalcular normales para que la iluminación sea correcta
    geometry.computeVertexNormals()
    
    return geometry
  }, [])

  // Material de pantalla CRT con propiedades de vidrio
  const screenMaterialProps = useMemo(() => ({
    color: COLORS.screen,
    roughness: 0.1, // Vidrio liso
    metalness: 0.0,
    // Propiedades de vidrio
    transmission: 0.1, // Ligera transparencia (permite ver reflejos)
    thickness: DIMENSIONS.screenDepth, // Grosor del vidrio
    ior: 1.5, // Índice de refracción del vidrio
    envMapIntensity: 0.3, // Reflejos sutiles del entorno
    // Emissive para cuando muestre contenido (se puede ajustar dinámicamente)
    emissive: '#000000',
    emissiveIntensity: 0,
  }), [])

  // Material mejorado para la ranura de disquete (más metálico y reflectante)
  const floppySlotMaterialProps = useMemo(() => ({
    color: COLORS.floppySlot,
    roughness: 0.2, // Más brillante (reducido de 0.3)
    metalness: 0.9, // Más metálico (aumentado de 0.7)
    envMapIntensity: 0.8, // Reflejos más pronunciados
  }), [])

  // Material para el interior de la ranura (más oscuro, simula profundidad)
  const floppySlotInteriorMaterialProps = useMemo(() => ({
    color: '#2a2a2a', // Negro mate para simular profundidad
    roughness: 0.9,
    metalness: 0.1,
  }), [])

  // Material para detalles internos (partes metálicas)
  const floppySlotDetailMaterialProps = useMemo(() => ({
    color: '#606060', // Gris metálico más claro
    roughness: 0.1,
    metalness: 0.8,
    envMapIntensity: 1.0,
  }), [])

  const baseMaterialProps = useMemo(() => ({
    color: COLORS.base,
    roughness: 0.7,
    metalness: 0.1,
    // Propiedades PBR (base puede tener menos brillo)
    clearcoat: 0.2, // Recubrimiento menos brillante
    clearcoatRoughness: 0.3,
    ior: 1.5,
    envMapIntensity: 0.3, // Menos reflejos en la base
    // Texturas
    normalMap: baseTextures.normalMap,
    normalScale: 0.3,
    roughnessMap: baseTextures.roughnessMap,
    aoMap: baseTextures.aoMap,
    aoMapIntensity: 0.5,
  }), [baseTextures])

  return (
    <group>
      {/* Carcasa Principal */}
      <RoundedBox
        args={[DIMENSIONS.bodyWidth, DIMENSIONS.bodyHeight, DIMENSIONS.bodyDepth]}
        radius={0.006} // Radio de bordes redondeados (6mm)
        smoothness={4}
        position={[0, 0, 0]}
      >
        <meshPhysicalMaterial {...mainBodyMaterialProps} />
      </RoundedBox>

      {/* Bisel de la Pantalla - Parte Superior */}
      <Box
        args={[DIMENSIONS.screenWidth + DIMENSIONS.bezelThickness * 2, DIMENSIONS.bezelThickness, 0.008]}
        position={[0, DIMENSIONS.screenHeight / 2 + DIMENSIONS.bezelThickness / 2 + 0.03, 0.075]}
      >
        <meshPhysicalMaterial {...screenBezelMaterialProps} />
      </Box>

      {/* Bisel de la Pantalla - Parte Inferior */}
      <Box
        args={[DIMENSIONS.screenWidth + DIMENSIONS.bezelThickness * 2, DIMENSIONS.bezelThickness, 0.008]}
        position={[0, -DIMENSIONS.screenHeight / 2 - DIMENSIONS.bezelThickness / 2 + 0.03, 0.075]}
      >
        <meshPhysicalMaterial {...screenBezelMaterialProps} />
      </Box>

      {/* Bisel de la Pantalla - Parte Izquierda */}
      <Box
        args={[DIMENSIONS.bezelThickness, DIMENSIONS.screenHeight, 0.008]}
        position={[-DIMENSIONS.screenWidth / 2 - DIMENSIONS.bezelThickness / 2, 0.03, 0.075]}
      >
        <meshPhysicalMaterial {...screenBezelMaterialProps} />
      </Box>

      {/* Bisel de la Pantalla - Parte Derecha */}
      <Box
        args={[DIMENSIONS.bezelThickness, DIMENSIONS.screenHeight, 0.008]}
        position={[DIMENSIONS.screenWidth / 2 + DIMENSIONS.bezelThickness / 2, 0.03, 0.075]}
      >
        <meshPhysicalMaterial {...screenBezelMaterialProps} />
      </Box>

      {/* Pantalla CRT con curvatura y propiedades de vidrio */}
      <mesh
        geometry={curvedScreenGeometry}
        position={[0, 0.03, 0.076]}
        rotation={[0, 0, 0]}
      >
        <meshPhysicalMaterial {...screenMaterialProps} />
      </mesh>

      {/* Ranura de Disquete Detallada */}
      <group position={[0, -0.048, 0.076]}>
        {/* Marco exterior de la ranura (metálico brillante) */}
        <Box
          args={[DIMENSIONS.floppyWidth, DIMENSIONS.floppyHeight, DIMENSIONS.floppyDepth]}
          position={[0, 0, 0]}
        >
          <meshPhysicalMaterial {...floppySlotMaterialProps} />
        </Box>

        {/* Interior de la ranura (hueco oscuro para simular profundidad) */}
        <Box
          args={[
            DIMENSIONS.floppyWidth * 0.85, // Ligeramente más estrecho
            DIMENSIONS.floppyHeight * 0.5,  // Más bajo (simula profundidad)
            DIMENSIONS.floppyDepth * 1.5    // Más profundo
          ]}
          position={[0, -DIMENSIONS.floppyHeight * 0.25, -DIMENSIONS.floppyDepth * 0.25]}
        >
          <meshStandardMaterial {...floppySlotInteriorMaterialProps} />
        </Box>

        {/* Detalle interno: Parte metálica superior (simula mecanismo) */}
        <Box
          args={[
            DIMENSIONS.floppyWidth * 0.7,
            0.0005, // Muy delgado
            DIMENSIONS.floppyDepth * 0.8
          ]}
          position={[0, DIMENSIONS.floppyHeight * 0.2, -DIMENSIONS.floppyDepth * 0.1]}
        >
          <meshPhysicalMaterial {...floppySlotDetailMaterialProps} />
        </Box>

        {/* Detalle interno: Parte metálica inferior (simula resorte/mecanismo) */}
        <Box
          args={[
            DIMENSIONS.floppyWidth * 0.6,
            0.0005, // Muy delgado
            DIMENSIONS.floppyDepth * 0.6
          ]}
          position={[0, -DIMENSIONS.floppyHeight * 0.3, -DIMENSIONS.floppyDepth * 0.2]}
        >
          <meshPhysicalMaterial {...floppySlotDetailMaterialProps} />
        </Box>

        {/* Bordes internos de la ranura (simula guías) */}
        <Box
          args={[0.001, DIMENSIONS.floppyHeight * 0.4, DIMENSIONS.floppyDepth * 1.2]}
          position={[-DIMENSIONS.floppyWidth * 0.4, -DIMENSIONS.floppyHeight * 0.2, -DIMENSIONS.floppyDepth * 0.3]}
        >
          <meshPhysicalMaterial {...floppySlotDetailMaterialProps} />
        </Box>
        <Box
          args={[0.001, DIMENSIONS.floppyHeight * 0.4, DIMENSIONS.floppyDepth * 1.2]}
          position={[DIMENSIONS.floppyWidth * 0.4, -DIMENSIONS.floppyHeight * 0.2, -DIMENSIONS.floppyDepth * 0.3]}
        >
          <meshPhysicalMaterial {...floppySlotDetailMaterialProps} />
        </Box>
      </group>

      {/* Logotipo de Apple - Parte inferior izquierda del frente */}
      {/* Símbolo de Apple estilizado - usando texto con símbolo Unicode */}
      <Text
        position={[-0.06, -0.08, 0.077]}
        rotation={[0, 0, 0]}
        fontSize={0.015}
        color="#999999"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.001}
        outlineColor="#666666"
      >
        ⚬
      </Text>
      {/* Texto "Apple" pequeño debajo */}
      <Text
        position={[-0.06, -0.092, 0.077]}
        rotation={[0, 0, 0]}
        fontSize={0.006}
        color="#666666"
        anchorX="center"
        anchorY="top"
      >
        Apple
      </Text>

      {/* Base/Soporte (Opcional) - Ancho reducido */}
      {showDetails && (
        <Box
          args={[DIMENSIONS.bodyWidth * 1.05, 0.03, DIMENSIONS.bodyDepth * 1.05]}
          position={[0, -DIMENSIONS.bodyHeight / 2 - 0.015, 0]}
        >
          <meshPhysicalMaterial {...baseMaterialProps} />
        </Box>
      )}
    </group>
  )
}
