import { Menu, Bell, Search } from 'lucide-react'
import { useLocation } from 'react-router-dom'

const pageTitles = {
  '/': 'Dashboard',
  '/candidates': 'Candidates',
  '/pipeline': 'Hiring Pipeline',
  '/jobs': 'Jobs',
}

export default function TopNav({ onMenuClick }) {
  const location = useLocation()

  // Match title by prefix
  const title =
    Object.entries(pageTitles)
      .sort((a, b) => b[0].length - a[0].length)
      .find(([path]) => location.pathname === path || location.pathname.startsWith(path + '/'))?.[1] ||
    'Mini ATS'

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 lg:px-6 shrink-0 z-10">
      {/* Left: hamburger + page title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-1.5 rounded-md text-slate-500 hover:bg-slate-100"
          aria-label="Open menu"
        >
          <Menu size={20} />
        </button>
        <h1 className="text-lg font-semibold text-slate-900">{title}</h1>
      </div>

      {/* Right: actions */}
      <div className="flex items-center gap-2">
        <button
          className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
          aria-label="Notifications"
        >
          <Bell size={18} />
        </button>
        <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-semibold text-sm">
          R
        </div>
      </div>
    </header>
  )
}
