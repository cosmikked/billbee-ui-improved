import { type CSSProperties, type ReactNode, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'
import { IconButton } from './IconButton'

export type DrawerSide = 'left' | 'right'

interface DrawerProps {
  open: boolean
  onClose: () => void
  children: ReactNode
  title?: ReactNode
  subtitle?: ReactNode
  actions?: ReactNode
  footer?: ReactNode
  side?: DrawerSide
  width?: number | string
  closeOnOverlayClick?: boolean
  showCloseButton?: boolean
  className?: string
  panelClassName?: string
}

function resolveWidth(width: number | string): CSSProperties {
  if (typeof width === 'number') return { width: `${width}px` }
  return { width }
}

export function Drawer({
  open,
  onClose,
  children,
  title,
  subtitle,
  actions,
  footer,
  side = 'right',
  width = 420,
  closeOnOverlayClick = true,
  showCloseButton = true,
  className = '',
  panelClassName = '',
}: DrawerProps) {
  useEffect(() => {
    if (!open) return

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }

    window.addEventListener('keydown', onKeyDown)
    return () => {
      window.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = previousOverflow
    }
  }, [onClose, open])

  if (!open) return null

  const panelEdgeClass = side === 'right'
    ? 'right-0 border-l border-border'
    : 'left-0 border-r border-border'

  return createPortal(
    <div className={`fixed inset-0 z-50 ${className}`}>
      <div
        className="absolute inset-0 bg-[rgba(26,24,22,0.35)]"
        onClick={closeOnOverlayClick ? onClose : undefined}
        aria-hidden
      />

      <section
        role="dialog"
        aria-modal="true"
        className={[
          'absolute top-0 h-full bg-surface',
          'w-full max-w-[100vw]',
          panelEdgeClass,
          panelClassName,
        ].join(' ')}
        style={resolveWidth(width)}
      >
        <div className="flex h-full flex-col">
          {(title || subtitle || actions || showCloseButton) && (
            <header className="px-[var(--pad-card)] py-3 border-b border-border">
              <div className="flex items-start gap-3">
                <div className="min-w-0 flex-1">
                  {title && (
                    <h2 className="font-display text-[20px] font-semibold tracking-[-0.01em] text-ink leading-[1.2]">
                      {title}
                    </h2>
                  )}
                  {subtitle && (
                    <p className="text-[13px] text-ink-3 mt-1">{subtitle}</p>
                  )}
                </div>

                {actions && <div className="flex items-center gap-2">{actions}</div>}

                {showCloseButton && (
                  <IconButton onClick={onClose} aria-label="Close drawer">
                    <X size={16} strokeWidth={1.9} />
                  </IconButton>
                )}
              </div>
            </header>
          )}

          <div className="flex-1 overflow-y-auto px-[var(--pad-card)] py-4">
            {children}
          </div>

          {footer && (
            <footer className="px-[var(--pad-card)] py-3 border-t border-border bg-surface">
              {footer}
            </footer>
          )}
        </div>
      </section>
    </div>,
    document.body,
  )
}

