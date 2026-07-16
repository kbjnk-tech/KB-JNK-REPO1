import type {
  ButtonHTMLAttributes,
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
} from 'react'

export function Button({
  className = '',
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      className={`rounded-md bg-amber-700 px-3 py-2 text-sm font-medium text-white hover:bg-amber-800 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-amber-600 dark:hover:bg-amber-500 ${className}`}
      {...props}
    />
  )
}

export function Input({
  className = '',
  label,
  ...props
}: InputHTMLAttributes<HTMLInputElement> & { label?: string }) {
  return (
    <label className="block text-sm text-slate-700 dark:text-slate-300">
      {label ? <span className="mb-1 block font-medium">{label}</span> : null}
      <input
        className={`w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none focus:border-amber-600 focus:ring-1 focus:ring-amber-600 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-amber-500 ${className}`}
        {...props}
      />
    </label>
  )
}

export function Select({
  label,
  children,
  className = '',
  ...props
}: SelectHTMLAttributes<HTMLSelectElement> & {
  label?: string
  children: ReactNode
}) {
  return (
    <label className="block text-sm text-slate-700 dark:text-slate-300">
      {label ? <span className="mb-1 block font-medium">{label}</span> : null}
      <select
        className={`w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none focus:border-amber-600 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-amber-500 ${className}`}
        {...props}
      >
        {children}
      </select>
    </label>
  )
}

type TabItem = { id: string; label: string }

export function Tabs({
  items,
  activeId,
  onChange,
}: {
  items: TabItem[]
  activeId: string
  onChange: (id: string) => void
}) {
  return (
    <div
      className="flex gap-1 overflow-x-auto border-b border-slate-200 dark:border-slate-700"
      role="tablist"
    >
      {items.map((item) => (
        <button
          key={item.id}
          type="button"
          role="tab"
          aria-selected={activeId === item.id}
          className={`shrink-0 px-4 py-2 text-sm font-medium ${
            activeId === item.id
              ? 'border-b-2 border-amber-700 text-amber-800 dark:border-amber-500 dark:text-amber-300'
              : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
          }`}
          onClick={() => onChange(item.id)}
        >
          {item.label}
        </button>
      ))}
    </div>
  )
}
