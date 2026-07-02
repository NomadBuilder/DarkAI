import type { ReactNode } from 'react'

type HubPageProps = {
  children: ReactNode
  /** Use max-w-7xl for map and campaign directory grids */
  wide?: boolean
  className?: string
}

export function HubPage({ children, wide = false, className = '' }: HubPageProps) {
  return (
    <div className={`${wide ? 'max-w-7xl' : 'max-w-6xl'} mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 md:py-16 ${className}`}>
      {children}
    </div>
  )
}

type HubPageIntroProps = {
  title: ReactNode
  children?: ReactNode
  className?: string
  eyebrow?: ReactNode
}

export function HubPageIntro({ title, children, className = '', eyebrow }: HubPageIntroProps) {
  return (
    <header className={`mb-10 md:mb-14 max-w-3xl ${className}`}>
      {eyebrow}
      <h1 className="text-3xl sm:text-4xl md:text-5xl font-light text-[#142818] leading-tight">{title}</h1>
      {children && (
        <div className="mt-4 text-lg text-[#3d5c48] font-light leading-relaxed">{children}</div>
      )}
    </header>
  )
}
