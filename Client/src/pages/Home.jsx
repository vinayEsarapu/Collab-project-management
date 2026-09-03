import { NavLink } from "react-router-dom";

function Home() {
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Public Navbar */}
      <header className="border-b border-white/10">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          
          {/* Logo */}
          <NavLink
            to="/"
            className="text-lg font-bold tracking-tight text-white"
          >
            Collab PM
          </NavLink>

          {/* Navigation */}
          <nav className="flex items-center gap-2 sm:gap-3">
            <NavLink
              to="/login"
              className="rounded-lg px-3 py-2 text-sm font-medium text-slate-300 transition-colors duration-200 hover:bg-white/5 hover:text-white sm:px-4"
            >
              Sign In
            </NavLink>

            <NavLink
              to="/register"
              className="rounded-lg bg-white px-3 py-2 text-sm font-semibold text-slate-950 transition-all duration-200 hover:bg-slate-200 sm:px-4"
            >
              Get Started
            </NavLink>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <main>
        <section className="relative overflow-hidden">
          {/* Lightweight background decoration */}
          <div
            className="pointer-events-none absolute left-1/2 top-0 h-72 w-72 -translate-x-1/2 rounded-full bg-indigo-500/10 blur-3xl"
            aria-hidden="true"
          />

          <div className="relative mx-auto max-w-5xl px-4 pb-20 pt-20 text-center sm:px-6 sm:pb-24 sm:pt-28 lg:px-8">
            <div className="mx-auto mb-6 inline-flex rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-medium text-slate-300">
              Project Management & Issue Tracking
            </div>

            <h1 className="mx-auto max-w-4xl text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
              Plan projects. Track issues.
              <span className="block text-slate-400">
                Work better together.
              </span>
            </h1>

            <p className="mx-auto mt-6 max-w-2xl text-base leading-7 text-slate-400 sm:text-lg">
              Collab PM helps teams organize projects, track issues, assign
              work, and discuss tasks in one simple workspace.
            </p>

            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <NavLink
                to="/register"
                className="w-full rounded-lg bg-white px-6 py-3 text-sm font-semibold text-slate-950 transition-all duration-200 hover:-translate-y-0.5 hover:bg-slate-200 sm:w-auto"
              >
                Get Started
              </NavLink>

              <NavLink
                to="/login"
                className="w-full rounded-lg border border-white/10 bg-white/5 px-6 py-3 text-sm font-semibold text-white transition-all duration-200 hover:-translate-y-0.5 hover:bg-white/10 sm:w-auto"
              >
                Sign In
              </NavLink>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="border-y border-white/10 bg-slate-900/40">
          <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <p className="text-sm font-semibold text-slate-300">
                Everything in one workspace
              </p>

              <h2 className="mt-2 text-3xl font-bold tracking-tight text-white">
                Built around your team's work
              </h2>

              <p className="mt-4 text-sm leading-6 text-slate-400 sm:text-base">
                Keep projects organized, make work visible, and keep issue
                discussions connected to the work.
              </p>
            </div>

            <div className="mt-10 grid gap-5 md:grid-cols-3">
              {/* Project Management */}
              <div className="rounded-2xl border border-white/10 bg-slate-950/70 p-6 transition-all duration-200 hover:-translate-y-1 hover:border-white/20">
                <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl bg-white/10 text-xl">
                  📁
                </div>

                <h3 className="text-lg font-semibold text-white">
                  Project Management
                </h3>

                <p className="mt-3 text-sm leading-6 text-slate-400">
                  Create and organize projects so your team's work stays
                  structured and easy to manage.
                </p>
              </div>

              {/* Issue Tracking */}
              <div className="rounded-2xl border border-white/10 bg-slate-950/70 p-6 transition-all duration-200 hover:-translate-y-1 hover:border-white/20">
                <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl bg-white/10 text-xl">
                  🐛
                </div>

                <h3 className="text-lg font-semibold text-white">
                  Issue Tracking
                </h3>

                <p className="mt-3 text-sm leading-6 text-slate-400">
                  Create, assign, prioritize, and track issues using status,
                  priority, labels, and assignees.
                </p>
              </div>

              {/* Team Collaboration */}
              <div className="rounded-2xl border border-white/10 bg-slate-950/70 p-6 transition-all duration-200 hover:-translate-y-1 hover:border-white/20">
                <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl bg-white/10 text-xl">
                  👥
                </div>

                <h3 className="text-lg font-semibold text-white">
                  Team Collaboration
                </h3>

                <p className="mt-3 text-sm leading-6 text-slate-400">
                  Work with project members, assign issues to teammates, and
                  discuss work through issue comments.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section>
          <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
            <div className="text-center">
              <p className="text-sm font-semibold text-slate-300">
                Simple workflow
              </p>

              <h2 className="mt-2 text-3xl font-bold tracking-tight text-white">
                How Collab PM works
              </h2>
            </div>

            <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-xl border border-white/10 bg-white/[0.03] p-5">
                <span className="text-xs font-bold text-slate-500">01</span>
                <h3 className="mt-3 font-semibold text-white">
                  Create an account
                </h3>
                <p className="mt-2 text-sm leading-6 text-slate-400">
                  Register and create your workspace.
                </p>
              </div>

              <div className="rounded-xl border border-white/10 bg-white/[0.03] p-5">
                <span className="text-xs font-bold text-slate-500">02</span>
                <h3 className="mt-3 font-semibold text-white">
                  Create a project
                </h3>
                <p className="mt-2 text-sm leading-6 text-slate-400">
                  Organize your work inside a project.
                </p>
              </div>

              <div className="rounded-xl border border-white/10 bg-white/[0.03] p-5">
                <span className="text-xs font-bold text-slate-500">03</span>
                <h3 className="mt-3 font-semibold text-white">
                  Track issues
                </h3>
                <p className="mt-2 text-sm leading-6 text-slate-400">
                  Manage tasks, bugs, priorities, and assignments.
                </p>
              </div>

              <div className="rounded-xl border border-white/10 bg-white/[0.03] p-5">
                <span className="text-xs font-bold text-slate-500">04</span>
                <h3 className="mt-3 font-semibold text-white">
                  Work together
                </h3>
                <p className="mt-2 text-sm leading-6 text-slate-400">
                  Discuss issues and keep project work connected.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="border-t border-white/10 bg-slate-900/40">
          <div className="mx-auto max-w-4xl px-4 py-16 text-center sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold tracking-tight text-white">
              Ready to organize your projects?
            </h2>

            <p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-slate-400 sm:text-base">
              Create your account and start managing projects and issues in
              one place.
            </p>

            <NavLink
              to="/register"
              className="mt-7 inline-flex rounded-lg bg-white px-6 py-3 text-sm font-semibold text-slate-950 transition-all duration-200 hover:-translate-y-0.5 hover:bg-slate-200"
            >
              Get Started
            </NavLink>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-4 py-6 text-sm text-slate-500 sm:flex-row sm:px-6 lg:px-8">
          <span>© 2026 Collab PM</span>

          <span>Project Management & Issue Tracking</span>
        </div>
      </footer>
    </div>
  );
}

export default Home;