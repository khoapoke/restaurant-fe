import { MapPin, Wifi, WifiOff } from 'lucide-react'

const CONNECTION_META = {
  live: { label: 'Trực tiếp', dot: 'bg-[#2f7d4a]', tone: 'text-[#1f5a35]', icon: Wifi },
  connecting: { label: 'Đang kết nối', dot: 'bg-[#b7791f]', tone: 'text-[#6b4a12]', icon: Wifi },
  reconnecting: { label: 'Đang kết nối lại', dot: 'bg-[#b7791f]', tone: 'text-[#6b4a12]', icon: WifiOff },
  offline: { label: 'Mất kết nối', dot: 'bg-[#b42318]', tone: 'text-[#8a1c1c]', icon: WifiOff },
  error: { label: 'Trực tiếp', dot: 'bg-[#2f7d4a]', tone: 'text-[#1f5a35]', icon: Wifi },
}

export const ConnectionBadge = ({ status }) => {
  const meta = CONNECTION_META[status] || CONNECTION_META.connecting
  return (
    <span className={`inline-flex min-h-8 items-center gap-2 rounded-full border border-[var(--moc-line)] bg-[#fffdf8] px-3 text-xs font-semibold ${meta.tone}`} role="status" aria-live="polite">
      <span className="relative flex h-2.5 w-2.5">
        {status === 'live' && <span className={`absolute inset-0 rounded-full ${meta.dot} moc-ring`} />}
        <span className={`relative h-2.5 w-2.5 rounded-full ${meta.dot}`} />
      </span>
      {meta.label}
    </span>
  )
}

export const DineHeader = ({ table, status }) => (
  <header className="sticky top-0 z-40 border-b border-[var(--moc-line)] bg-[#fffdf8]/92 backdrop-blur-xl">
    <div className="mx-auto flex min-h-16 max-w-3xl items-center justify-between gap-3 px-4">
      <div className="flex min-w-0 items-center gap-3">
        <span className="grid h-10 w-9 shrink-0 place-items-center rounded-[50%_50%_8px_8px] border border-[#211b18] moc-serif text-lg text-[#211b18]" aria-hidden="true">M</span>
        <div className="min-w-0">
          <p className="moc-serif text-base font-semibold leading-none tracking-[0.16em] text-[#211b18]">MỘC</p>
          <p className="mt-1 flex items-center gap-1 truncate text-xs text-[#625a55]">
            <MapPin className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">{table ? table.tableName : 'Live Dining'}</span>
          </p>
        </div>
      </div>
      <ConnectionBadge status={status} />
    </div>
  </header>
)

export default DineHeader
