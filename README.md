# 🎓 DeFi Learning Quiz

Una aplicación interactiva de quiz para aprender sobre protocolos DeFi, diseñada como Farcaster Mini App con verificación de identidad mediante Self Protocol y Wallet Signature.

## ✨ Características

- 🎮 **Quiz Interactivo**: Preguntas sobre protocolos DeFi (Aave, Morpho, Sablier)
- 🔒 **Seguridad Robusta**: Validación en servidor, tokens temporales, prevención de scraping
- 🛡️ **Verificación Dual**: Self Protocol (verificación completa) + Wallet Signature (accesible)
- 🌐 **Farcaster Mini App**: Funciona dentro de Farcaster y como web app
- ⏱️ **Sistema Anti-Cheat**: Detección de cambio de tab durante el quiz
- 🎯 **Gamificación**: Palabras secretas al completar quizzes exitosamente

## 🚀 Inicio Rápido

### Prerrequisitos

- Node.js 18+ y npm/yarn/pnpm
- Wallet (MetaMask, WalletConnect, etc.) para verificación opcional
- Self Protocol app (opcional, para verificación completa)

### Instalación

```bash
# Clonar el repositorio
git clone <tu-repo>
cd defi_learning

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env.local
# Editar .env.local con tus valores

# Iniciar servidor de desarrollo
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

### Variables de Entorno

Crea un archivo `.env.local` con:

```env
# Self Protocol (Opcional - para verificación completa)
NEXT_PUBLIC_SELF_SCOPE=defi-quiz-app
NEXT_PUBLIC_SELF_APP_NAME=DeFi Learning Quiz
NEXT_PUBLIC_SELF_BACKEND_ENDPOINT=https://yourapi.com/api/verify

# WalletConnect (Requerido para Wallet Signature)
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=tu_project_id

# Farcaster (Opcional - para producción)
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_SITE_NAME=DeFi Learning Quiz
```

Obtén tu WalletConnect Project ID en [cloud.walletconnect.com](https://cloud.walletconnect.com)

## 📁 Estructura del Proyecto

```
defi_learning/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/               # API Routes
│   │   │   ├── quiz/          # Endpoints del quiz
│   │   │   └── verify-signature/  # Verificación de wallet
│   │   ├── quiz/              # Páginas del quiz
│   │   └── providers.tsx      # Providers (Wagmi, React Query)
│   ├── components/
│   │   ├── ui/                # Componentes UI base
│   │   └── verification/      # Componentes de verificación
│   ├── contexts/              # React Contexts
│   ├── hooks/                 # Custom hooks
│   ├── lib/                   # Configuraciones (Wagmi, tokens)
│   ├── types/                 # TypeScript types
│   ├── data/                  # Datos estáticos (protocolos, preguntas)
│   └── utils/                 # Utilidades
├── public/
│   └── .well-known/
│       └── farcaster.json     # Manifest de Farcaster Mini App
└── docs/                      # Documentación
```

## 🎮 Uso

### Flujo del Quiz

1. **Seleccionar Protocolo**: Elige un protocolo DeFi (Aave, Morpho, Sablier)
2. **Estudiar Briefing**: Lee el briefing del protocolo antes de comenzar
3. **Iniciar Quiz**: Responde 5 preguntas con 25 segundos cada una
4. **Ver Resultados**: Obtén tu score y palabra secreta si pasas (≥3 correctas)

### Verificación (Opcional)

- **Self Protocol**: Verificación completa de identidad (requiere app)
- **Wallet Signature**: Verificación básica mediante firma de wallet

## 🔧 Scripts Disponibles

```bash
# Desarrollo
npm run dev

# Build para producción
npm run build

# Iniciar servidor de producción
npm start

# Linting
npm run lint
```

## 📚 Documentación

Toda la documentación está en la carpeta `docs/`:

- [Resumen de Progreso](./docs/PROGRESS_SUMMARY.md) - Estado actual del proyecto
- [Próximos Pasos y Mejoras](./docs/NEXT_STEPS_AND_IMPROVEMENTS.md) - Roadmap y sugerencias
- [Instrucciones de Instalación](./docs/INSTALLATION_INSTRUCTIONS.md) - Guía detallada
- [Implementación de Seguridad](./docs/SECURITY_IMPLEMENTATION.md) - Detalles de seguridad

## 🛠️ Stack Tecnológico

- **Framework**: Next.js 16.1.1 (App Router)
- **UI**: React 19, Tailwind CSS v4
- **TypeScript**: Tipado completo
- **Wallets**: Wagmi v3, Viem v2
- **Verificación**: Self Protocol SDK, Wallet Signature
- **Farcaster**: Farcaster Frame SDK

## 🔒 Seguridad

- ✅ Validación en servidor (score calculado en backend)
- ✅ Tokens temporales para acceso a resultados
- ✅ Ocultación de respuestas correctas en cliente
- ✅ Prevención de web scraping
- ✅ Anti-cheat (detección de cambio de tab)

## 📈 Estado del Proyecto

**~85% Completado**

- ✅ Funcionalidad core del quiz
- ✅ Sistema de seguridad
- ✅ Verificación (Self + Wallet)
- ✅ Integración Farcaster básica
- ⏳ Componentes adicionales (leaderboards, certificados)

Ver [PROGRESS_SUMMARY.md](./docs/PROGRESS_SUMMARY.md) para detalles completos.

## 🤝 Contribuir

Las contribuciones son bienvenidas. Por favor:

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT.

## 🙏 Agradecimientos

- [ConnectHub](https://github.com/ArturVargas/ConnectHub) - Template base para Farcaster Mini App
- [Self Protocol](https://self.id/) - Verificación de identidad
- [Farcaster](https://farcaster.xyz/) - Protocolo social descentralizado

---

**Desarrollado con ❤️ para la comunidad DeFi**
