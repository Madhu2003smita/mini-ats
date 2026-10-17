export default function Select({
  label,
  error,
  className = '',
  id,
  required,
  children,
  ...props
}) {
  const selectId = id || label?.toLowerCase().replace(/\s+/g, '-')

  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      {label && (
        <label htmlFor={selectId} className="text-sm font-medium text-slate-700">
          {label}
          {required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
      )}
      <select
        id={selectId}
        className={`
          w-full px-3 py-2 text-sm rounded-lg border bg-white
          text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500
          disabled:bg-slate-50 disabled:cursor-not-allowed
          transition-colors
          ${error ? 'border-red-400 focus:ring-red-400' : 'border-slate-300'}
        `}
        {...props}
      >
        {children}
      </select>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  )
}
