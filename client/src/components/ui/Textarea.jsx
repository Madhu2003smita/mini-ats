export default function Textarea({
  label,
  error,
  className = '',
  id,
  required,
  rows = 4,
  ...props
}) {
  const textareaId = id || label?.toLowerCase().replace(/\s+/g, '-')

  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      {label && (
        <label htmlFor={textareaId} className="text-sm font-medium text-slate-700">
          {label}
          {required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
      )}
      <textarea
        id={textareaId}
        rows={rows}
        className={`
          w-full px-3 py-2 text-sm rounded-lg border bg-white resize-y
          placeholder:text-slate-400 text-slate-900
          focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500
          disabled:bg-slate-50 disabled:cursor-not-allowed
          transition-colors
          ${error ? 'border-red-400 focus:ring-red-400' : 'border-slate-300'}
        `}
        {...props}
      />
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  )
}
