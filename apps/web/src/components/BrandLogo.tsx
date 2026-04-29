import logoPrimary from '@/assets/brand/logo-primary.png'
import logoDark from '@/assets/brand/logo-dark.png'
import logoLight from '@/assets/brand/logo-light.png'

export function BrandLogo({
  mode = 'dark',
  className = 'h-10 w-auto',
  alt = 'MyKite',
}: {
  mode?: 'dark' | 'primary' | 'light'
  className?: string
  alt?: string
}) {
  const src = mode === 'light' ? logoLight : mode === 'primary' ? logoPrimary : logoDark

  return <img src={src} alt={alt} className={className} />
}
