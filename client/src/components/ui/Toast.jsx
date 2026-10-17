import { useEffect } from 'react'
import { CheckCircle, XCircle, AlertCircle, X } from 'lucide-react'

const configs = {
  success: {
    icon: CheckCircle,
    bg: 'bg-green-50 border-green-200',
    text: 'text-green-800',
    icon_color: 'text-green-500',
  },
  error: {
    icon: XCircle,
    bg: 'bg-red-50 border-red-200',
    text: 'text-red-800',
    icon_color: 'text-red-500',
  },
  warning: {
    icon: AlertCircle,
    bg: 'bg-yellow-50 border-yellow-200',
    text: 'text-yellow-800',
    icon_color: 'text-yellow-500',
  },
}

export default function Toast({ message, type = 'success', onClose, duration = 4000 }) {
  const cfg = configs[type] || configs.success
  const Icon = cfg.icon

  useEffect(() => {
    const t = setTimeout(onClose, duration)
    return () => clearTimeout(t)
  }, [onClose, duration])

  return (
    <div
      className={`flex items-start gap-3 px-4 py-3 rounded-xl border shadow-lg max-w-sm w-full ${cfg.bg}`}
      role="alert"
    >
      <Icon size={18} className={`shrink-0 mt-0.5 ${cfg.icon_color}`} />
      <p className={`flex-1 text-sm font-medium ${cfg.text}`}>{message}</p>
      <button
        onClick={onClose}
        className={`shrink-0 p-0.5 rounded ${cfg.text} opacity-60 hover:opacity-100`}
        aria-label="Dismiss"
      >
        <X size={14} />
      </button>
    </div>
  )
}

// Toast container placed at root level
export function ToastContainer({ toasts, removeToast }) {
  return (
    <div className="fixed bottom-5 right-5 z-[100] flex flex-col gap-2 items-end">
      {toasts.map((t) => (
        <Toast
          key={t.id}
          message={t.message}
          type={t.type}
          onClose={() => removeToast(t.id)}
        />
      ))}
    </div>
  )
}
