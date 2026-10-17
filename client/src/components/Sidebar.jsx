import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  Users,
  GitBranch,
  Briefcase,
  X,
  Building2,
} from 'lucide-react'

const navItems = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/candidates', label: 'Candidates', icon: Users },
  { to: '/pipeline', label: 'Hiring Pipeline', icon: GitBranch },
  { to: '/jobs', label: 'Jobs', icon: Briefcase },
]

export default function Sidebar({ open, onClose }) {
  return (
    <aside
      className={`
        fixed inset-y-0 left-0 z-30 w-64 bg-white border-r border-slate-200 flex flex-col
        transform transition-transform duration-200 ease-in-out
        lg:static lg:translate-x-0
        ${open ? 'translate-x-0' : '-translate-x-full'}
      `}
    >
      {/* Logo */}
      <div className="flex items-center justify-between h-16 px-5 border-b border-slate-200 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shrink-0">
            <Building2 size={17} className="text-white" />
          </div>
          <span className="font-semibold text-slate-900 text-[15px] tracking-tight">
            Mini<span className="text-indigo-600">ATS</span>
          </span>
        </div>
        <button
          onClick={onClose}
          className="lg:hidden text-slate-400 hover:text-slate-600 p-1 rounded"
          aria-label="Close sidebar"
        >
          <X size={18} />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        <p className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
          Menu
        </p>
        {navItems.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            onClick={onClose}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-indigo-50 text-indigo-700'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <Icon
                  size={18}
                  className={isActive ? 'text-indigo-600' : 'text-slate-400'}
                />
                {label}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-4 py-4 border-t border-slate-200 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-semibold text-sm shrink-0">
            R
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-slate-900 truncate">Recruiter</p>
            <p className="text-xs text-slate-400 truncate">admin@miniats.com</p>
          </div>
        </div>
      </div>
    </aside>
  )
}
