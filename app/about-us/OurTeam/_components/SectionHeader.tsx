type SectionHeaderProps = {
  title: string
  highlight?: string
  subtitle?: string
  align?: 'left' | 'center' | 'right'
  className?: string
  titleClassName?: string
  subtitleClassName?: string
}

export default function SectionHeader({
  title,
  highlight,
  subtitle,
  align = 'center',
  className = '',
  titleClassName = '',
  subtitleClassName = '',
}: SectionHeaderProps) {
  const alignment = align === 'left' ? 'items-start text-left' : align === 'right' ? 'items-end text-right' : 'items-center text-center'

  return (
    <div className={`flex flex-col ${alignment} justify-center gap-[15px] ${className}`}>
      <h2 className={`text-[64px] font-mono font-bold ${titleClassName}`}>
        {title}
        {highlight ? <span className='text-gray-400'> {highlight}</span> : null}
      </h2>
      {subtitle ? (
        <p className={`text-2xl ${subtitleClassName}`}>{subtitle}</p>
      ) : null}
    </div>
  )
}
