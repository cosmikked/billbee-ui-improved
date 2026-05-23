import { type ReactNode, type ButtonHTMLAttributes } from 'react'

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode
  /** Numeric badge overlaid top-right. Hidden when 0 or undefined. */
  badge?: number
}

export function IconButton({ children, badge, className = '', ...rest }: IconButtonProps) {
  return (
    <button
      className={[
        'relative w-9 h-9 rounded-pill bg-surface border border-border',
        'inline-flex items-center justify-center text-ink-2',
        'hover:bg-surface-2 hover:border-border-strong hover:text-ink transition-ui',
        className,
      ].join(' ')}
      {...rest}
    >
      {children}

      {badge !== undefined && badge > 0 && (
        <span
          className="absolute -top-0.5 -right-0.5 min-w-4 h-4 px-1 bg-accent rounded-pill
                     text-white font-mono text-[10px] font-medium
                     inline-flex items-center justify-center border-2 border-bg"
        >
          {badge > 99 ? '99+' : badge}
        </span>
      )}
    </button>
  )
}
