import { createRootRoute, Outlet, Link } from '@tanstack/react-router'
import { BrandLogo } from '@/components/BrandLogo'
import { ButtonLink, PageContainer } from '@/components/ui'

export const Route = createRootRoute({
  component: RootLayout,
})

function RootLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-brand-glow">
      <a
        href="#main-content"
        className="sr-only absolute left-4 top-4 z-[100] rounded-full bg-white px-4 py-2 text-sm font-medium text-primary-700 shadow-soft focus:not-sr-only"
      >
        Bỏ qua điều hướng
      </a>

      <header className="sticky top-0 z-50 border-b border-white/60 bg-white/80 backdrop-blur-xl">
        <PageContainer className="flex h-20 items-center justify-between gap-6">
          <Link to="/" className="flex items-center gap-3" aria-label="MyKite - Trang chủ">
            <BrandLogo className="h-11 w-auto" />
          </Link>

          <nav className="hidden items-center gap-2 md:flex">
            <Link
              to="/"
              className="rounded-full px-4 py-2 text-sm font-medium text-ink-600 transition hover:bg-primary-50 hover:text-primary-700 [&.active]:bg-primary-50 [&.active]:text-primary-700"
            >
              Trang chủ
            </Link>
            <Link
              to="/assessments"
              className="rounded-full px-4 py-2 text-sm font-medium text-ink-600 transition hover:bg-primary-50 hover:text-primary-700 [&.active]:bg-primary-50 [&.active]:text-primary-700"
            >
              Trắc nghiệm
            </Link>
          </nav>

          <ButtonLink to="/assessments" className="hidden md:inline-flex">
            Làm bài ngay
          </ButtonLink>
        </PageContainer>
      </header>

      <main id="main-content" className="flex-1">
        <Outlet />
      </main>

      <footer className="border-t border-white/70 bg-white/70 py-10 backdrop-blur-xl">
        <PageContainer className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <BrandLogo className="h-10 w-auto" />
            <p className="mt-4 max-w-xl text-sm leading-6 text-ink-600">
              MyKite giúp học sinh và người trẻ hiểu bản thân rõ hơn trước khi chọn ngành, chọn nghề và xây lộ trình phát triển phù hợp.
            </p>
          </div>
          <div className="text-sm text-ink-500 md:text-right">
            <p>© 2026 MyKite</p>
            <p className="mt-1">Khám phá bản thân. Chọn hướng đi hợp với mình.</p>
          </div>
        </PageContainer>
      </footer>
    </div>
  )
}
