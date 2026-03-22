export default function LoadingSpinner({
  label = "Loading...",
  className = "",
}) {
  return (
    <div
      className={`flex flex-col items-center justify-center gap-3 rounded-2xl border border-rose-100 bg-white/85 px-5 py-6 text-slate-600 shadow-sm ${className}`}
      role="status"
      aria-live="polite"
    >
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-rose-100 border-t-rose-500" />
      <p className="text-sm font-medium">{label}</p>
    </div>
  );
}