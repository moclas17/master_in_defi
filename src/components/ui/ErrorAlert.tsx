/**
 * Componente para mostrar errores al usuario
 * Diseño consistente para mensajes de error
 */

import { memo } from 'react'
import { Button } from './Button'
import { cn } from '@/utils/cn'

interface ErrorAlertProps {
  message: string
  onDismiss?: () => void
  className?: string
}

function ErrorAlertComponent({ message, onDismiss, className }: ErrorAlertProps) {
  return (
    <div
      className={cn(
        'p-3 bg-red-900/20 border border-red-800 rounded-lg text-red-400 text-sm',
        'flex items-start gap-3',
        className
      )}
    >
      <span className="text-red-500 text-lg flex-shrink-0">⚠️</span>
      <div className="flex-1">
        <p>{message}</p>
      </div>
      {onDismiss && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onDismiss}
          className="h-6 w-6 p-0 text-red-400 hover:text-red-300"
        >
          <span className="text-lg">×</span>
        </Button>
      )}
    </div>
  )
}

// Memoizar componente para evitar re-renders innecesarios
export const ErrorAlert = memo(ErrorAlertComponent)
