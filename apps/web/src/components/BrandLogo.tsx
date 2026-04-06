import logoPrimary from '@/assets/brand/logo-primary.png'
import logoLight from '@/assets/brand/logo-light.png'

export function BrandLogo({
  mode = 'primary',
  className = 'h-10 w-auto',
  alt = 'MyKite',
}: {
  mode?: 'primary' | 'light'
  className?: string
  alt?: string
}) {
  return <img src={mode === 'light' ? logoLight : logoPrimary} alt={alt} className={className} />
}
