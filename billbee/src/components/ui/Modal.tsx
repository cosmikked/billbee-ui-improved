import { type ReactNode, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'
import { IconButton } from './IconButton'

interface ModalProps {
  open: boolean
  onClose: () => void
  children: ReactNode
  title?: ReactNode
  subtitle?: ReactNode
  /** Rendered in a bordered footer bar — pass action buttons here */
  footer?: ReactNode
  /** px width or CSS string. Default 480 */
  width?: number | string
  closeOnOverlayClick?: boolean
  showCloseButton?: boolean
  className?: string
}

export function Modal({
  open,
  onClose,
  children,
  title,
  subtitle,
  footer,
  width = 480,
  closeOnOverlayClick = true,
  showCloseButton = true,
  className = '',
}: ModalProps) {
  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
    }
  }, [open, onClose])

  if (!open) return null

  const widthStyle: React.CSSProperties =
    typeof width === 'number' ? { width: `${width}px` } : { width }

  return createPortal(
    <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 ${className}`}>
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-[rgba(26,24,22,0.45)]"
        onClick={closeOnOverlayClick ? onClose : undefined}
        aria-hidden
      />

      {/* Panel */}
      <section
        role="dialog"
        aria-modal="true"
        className="relative bg-surface border border-border rounded-card flex flex-col max-h-[90vh] w-full shadow-lg"
        style={widthStyle}
      >
        {/* Header */}
        {(title || subtitle || showCloseButton) && (
          <header className="px-[var(--pad-card)] py-4 border-b border-border flex items-start gap-3 shrink-0">
            <div className="flex-1 min-w-0">
              {title && (
                <h2 className="font-display text-[18px] font-semibold tracking-[-0.01em] text-ink leading-tight">
                  {title}
                </h2>
              )}
              {subtitle && (
                <p className="text-[13px] text-ink-3 mt-0.5">{subtitle}</p>
              )}
            </div>
            {showCloseButton && (
              <IconButton onClick={onClose} aria-label="Close">
                <X size={16} strokeWidth={1.9} />
              </IconButton>
            )}
          </header>
        )}

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-[var(--pad-card)] py-4">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <footer className="px-[var(--pad-card)] py-3 border-t border-border bg-surface shrink-0">
            {footer}
          </footer>
        )}
      </section>
    </div>,
    document.body,
  )
}
