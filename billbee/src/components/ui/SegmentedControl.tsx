interface SegmentedControlProps<T extends string> {
  options: readonly T[]
  value: T
  onChange: (value: T) => void
  className?: string
}

export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  className = '',
}: SegmentedControlProps<T>) {
  return (
    <div className={`inline-flex bg-surface-2 border border-border rounded-btn p-0.5 ${className}`}>
      {options.map(opt => (
        <button
          key={opt}
          type="button"
          onClick={() => onChange(opt)}
          className={[
            'px-[10px] py-1 text-[12.5px] font-medium rounded-chip transition-ui',
            value === opt
              ? 'bg-surface text-ink shadow-[0_1px_2px_rgba(0,0,0,0.05)]'
              : 'text-ink-3 hover:text-ink',
          ].join(' ')}
        >
          {opt}
        </button>
      ))}
    </div>
  )
}
