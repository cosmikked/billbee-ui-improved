import { type ReactNode, type ButtonHTMLAttributes } from 'react'

export type ButtonVariant = 'default' | 'primary' | 'accent' | 'ghost'
export type ButtonSize    = 'sm' | 'md' | 'lg'

const VARIANT: Record<ButtonVariant, string> = {
  default: 'bg-surface border-border text-ink hover:bg-surface-2 hover:border-border-strong',
  primary: 'bg-ink border-ink text-white hover:bg-ink-2 hover:border-ink-2',
  accent:  'bg-accent border-accent text-white font-semibold hover:bg-accent-2 hover:border-accent-2',
  ghost:   'bg-transparent border-transparent text-ink-2 hover:bg-surface-2 hover:text-ink',
}

const SIZE: Record<ButtonSize, string> = {
  sm: 'px-[10px] py-[5px] text-[12.5px]',
  md: 'px-[14px] py-2    text-[13.5px]',
  lg: 'px-[18px] py-[10px] text-[14.5px]',
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  children: ReactNode
}

export function Button({
  variant = 'default',
  size = 'md',
  className = '',
  children,
  ...rest
}: ButtonProps) {
  return (
    <button
      className={[
        'inline-flex items-center gap-1.5 border rounded-btn font-medium transition-ui',
        VARIANT[variant],
        SIZE[size],
        className,
      ].join(' ')}
      {...rest}
    >
      {children}
    </button>
  )
}
