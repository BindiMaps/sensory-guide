import { Outlet, Link } from 'react-router-dom'

export function AdminLayout() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link to="/admin" className="text-xl font-semibold">
            Sensory Guide Admin
          </Link>
          <nav>
            <Link
              to="/"
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              View Public Site
            </Link>
          </nav>
        </div>
      </header>
      <main className="container mx-auto px-4 py-8">
        <Outlet />
      </main>
    </div>
  )
}
