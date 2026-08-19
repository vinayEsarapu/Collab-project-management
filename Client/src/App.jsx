function App() {
  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <h1 className="text-xl font-bold text-gray-900">
            CollabPM
          </h1>

          <span className="text-sm text-gray-500">
            Project Management
          </span>
        </div>
      </header>

      {/* Main content */}
      <main className="mx-auto max-w-7xl px-6 py-12">
        <h2 className="text-3xl font-bold text-gray-900">
          Welcome to CollabPM
        </h2>

        <p className="mt-3 max-w-2xl text-gray-600">
          A collaborative project management and issue tracking platform
          for teams.
        </p>

        <div className="mt-8 grid gap-6 md:grid-cols-3">
          <div className="rounded-lg border bg-white p-6 shadow-sm">
            <h3 className="font-semibold text-gray-900">
              Projects
            </h3>
            <p className="mt-2 text-sm text-gray-600">
              Organize and manage your projects.
            </p>
          </div>

          <div className="rounded-lg border bg-white p-6 shadow-sm">
            <h3 className="font-semibold text-gray-900">
              Tasks
            </h3>
            <p className="mt-2 text-sm text-gray-600">
              Create and track team tasks.
            </p>
          </div>

          <div className="rounded-lg border bg-white p-6 shadow-sm">
            <h3 className="font-semibold text-gray-900">
              Issues
            </h3>
            <p className="mt-2 text-sm text-gray-600">
              Track bugs and project issues.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;