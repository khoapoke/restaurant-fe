import { Bell } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import useLivePolling from '../../lib/useLivePolling'
import { noticesApi } from './services'

export default function NotificationBell() {
  const { user, role } = useAuth()
  const { data } = useLivePolling(async ({ signal }) => (await noticesApi({}, signal)).data, {
    interval: 15000, hiddenInterval: 0, enabled: role === 'CUSTOMER' && !!user,
  })
  if (role !== 'CUSTOMER') return null
  return <Link to="/notifications" className="relative grid h-10 w-10 shrink-0 place-items-center rounded-full hover:bg-[#6f1d32]/8" aria-label={`Thông báo, ${data?.unreadCount || 0} chưa đọc`}>
    <Bell className="h-5 w-5 text-[#6f1d32]" />
    {!!data?.unreadCount && <span className="moc-inverse absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-[#6f1d32] px-1 text-xs font-bold">{data.unreadCount > 99 ? '99+' : data.unreadCount}</span>}
  </Link>
}
