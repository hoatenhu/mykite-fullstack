import { createRootRoute, Outlet, Link } from '@tanstack/react-router'

export const Route = createRootRoute({
  component: RootLayout,
})

function RootLayout() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <span className="text-2xl">🪁</span>
            <span className="font-bold text-xl text-primary-600">MyKite</span>
          </Link>
          <nav className="flex items-center gap-6">
            <Link
              to="/"
              className="text-gray-600 hover:text-primary-600 transition-colors [&.active]:text-primary-600 [&.active]:font-medium"
            >
              Trang chủ
            </Link>
            <Link
              to="/assessments"
              className="text-gray-600 hover:text-primary-600 transition-colors [&.active]:text-primary-600 [&.active]:font-medium"
            >
              Trắc nghiệm
            </Link>
          </nav>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-gray-100 border-t border-gray-200 py-8">
        <div className="max-w-5xl mx-auto px-4 text-center text-gray-500 text-sm">
          <p>© 2026 MyKite - Trắc nghiệm Hướng nghiệp</p>
          <p className="mt-1">Khám phá bản thân, tìm nghề phù hợp</p>
        </div>
      </footer>
    </div>
  )
}
