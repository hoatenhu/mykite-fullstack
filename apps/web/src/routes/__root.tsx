import { createRootRoute, Outlet, Link } from '@tanstack/react-router'
import { BrandLogo } from '@/components/BrandLogo'
import { ButtonLink, PageContainer } from '@/components/ui'

export const Route = createRootRoute({
  component: RootLayout,
})

function RootLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-paper-100">
      <a
        href="#main-content"
        className="sr-only absolute left-4 top-4 z-[100] rounded-md bg-paper-50 px-4 py-2 text-sm font-medium text-ink-900 shadow-soft focus:not-sr-only"
      >
        Bỏ qua điều hướng
      </a>

      <header className="sticky top-0 z-50 border-b border-ink-200 bg-paper-50/95 backdrop-blur-md">
        <PageContainer className="flex h-20 items-center justify-between gap-6">
          <Link to="/" className="flex items-center gap-3" aria-label="MyKite - Trang chủ">
            <BrandLogo className="h-8 sm:h-10 w-auto object-contain" />
          </Link>

          <nav className="hidden items-center gap-2 md:flex">
            <Link
              to="/"
              className="rounded-md px-4 py-2 font-label text-xs font-semibold uppercase tracking-[0.16em] text-ink-600 transition-colors duration-200 hover:text-ink-900 [&.active]:text-ink-900"
            >
              Trang chủ
            </Link>
            <Link
              to="/assessments"
              className="rounded-md px-4 py-2 font-label text-xs font-semibold uppercase tracking-[0.16em] text-ink-600 transition-colors duration-200 hover:text-ink-900 [&.active]:text-ink-900"
            >
              Trắc nghiệm
            </Link>
          </nav>

          <ButtonLink to="/assessments" className="hidden min-w-40 md:inline-flex" aria-label="Chọn bài trắc nghiệm">
            Chọn bài trắc nghiệm
          </ButtonLink>
        </PageContainer>
      </header>

      <main id="main-content" className="flex-1">
        <Outlet />
      </main>

      <footer className="mt-16 border-t border-ink-200 py-10">
        <PageContainer className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <BrandLogo className="h-10 sm:h-12 w-auto object-contain" />
            <p className="mt-4 max-w-xl text-sm leading-6 text-ink-600">
              MyKite giúp học sinh và người trẻ hiểu bản thân rõ hơn trước khi chọn ngành, chọn nghề và xây lộ trình phát triển phù hợp.
            </p>
          </div>
          <div className="text-sm text-ink-500 md:text-right">
            <p>© 2026 MyKite</p>
            <p className="mt-1 font-label uppercase tracking-wider">Crafted for the sky.</p>
          </div>
        </PageContainer>
      </footer>
    </div>
  )
}
