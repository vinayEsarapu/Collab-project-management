function PageLoader() {
  return (
    <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/20 border-t-white" />

        <p className="text-sm text-slate-400">
          Loading...
        </p>
      </div>
    </div>
  );
}

export default PageLoader;