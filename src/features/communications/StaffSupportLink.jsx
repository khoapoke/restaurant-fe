import { MessageCircle } from 'lucide-react'
import { NavLink } from 'react-router-dom'
import useLivePolling from '../../lib/useLivePolling'
import { supportQueueApi } from './services'

export default function StaffSupportLink() {
  const { data } = useLivePolling(async ({ signal }) => (await supportQueueApi({}, signal)).data, { interval: 10000, hiddenInterval: 0 })
  const count = data?.attentionCount || 0
  return <NavLink to="/staff/support" aria-label={`Hỗ trợ khách hàng${count ? `, ${count} cuộc cần chú ý` : ''}`} className="relative grid h-10 w-10 shrink-0 place-items-center rounded-full border border-[var(--moc-line)] text-[#6f1d32]"><MessageCircle className="h-5 w-5" />{!!count && <span className="moc-inverse absolute -right-2 -top-2 grid h-5 min-w-5 place-items-center rounded-full bg-[#6f1d32] px-1 text-xs text-white">{count > 99 ? '99+' : count}</span>}</NavLink>
}
