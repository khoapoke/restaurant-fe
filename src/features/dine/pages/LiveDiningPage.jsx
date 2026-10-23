import { useCallback, useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { QrCode as QrIcon, UsersRound } from 'lucide-react'
import useApiResource from '../../../lib/useApiResource'
import useNow from '../../../lib/useNow'
import { apiErrorMessage } from '../../../lib/apiError'
import useDineSession from '../hooks/useDineSession'
import useDineCart from '../hooks/useDineCart'
import useRoundSubmission from '../hooks/useRoundSubmission'
import { getDineMenuApi } from '../services/dineService'
import { formatClock } from '../constants'
import DineHeader from '../components/DineHeader'
import EntryStage from '../components/EntryStage'
import MenuBrowser from '../components/MenuBrowser'
import DishSheet from '../components/DishSheet'
import { CartBar, CartSheet, OrderSentOverlay, PendingRoundCard } from '../components/CartSheet'
import OrderTracker from '../components/OrderTracker'
import ServiceSheet, { ServiceRequestList } from '../components/ServiceSheet'
import BillPanel from '../components/BillPanel'
import MealComplete from '../components/MealComplete'
import { DineTabBar, DineToasts, ReconnectBanner } from '../components/DineChrome'
import InviteSheet, { InviteButton } from '../components/InviteSheet'

const SESSION_LABEL = { OPEN: 'Đang phục vụ', AWAITING_PAYMENT: 'Chờ thanh toán', CLOSED: 'Đã hoàn tất', CANCELLED: 'Đã kết thúc' }

const PageSkeleton = () => (
  <div className="space-y-4" aria-busy="true" aria-label="Đang tải bàn">
    <div className="h-40 animate-pulse rounded-[28px] bg-[#e9dfd3]" />
    <div className="h-12 animate-pulse rounded-full bg-[#efe7dc]" />
    <div className="grid gap-4 sm:grid-cols-2">{[0, 1].map((key) => <div key={key} className="h-72 animate-pulse rounded-[24px] bg-[#efe7dc]" />)}</div>
  </div>
)

const InvalidQr = ({ message }) => (
  <section className="mt-10 rounded-[28px] border border-[var(--moc-line)] bg-[#fffdf8] p-8 text-center">
    <QrIcon className="mx-auto h-12 w-12 text-[#6f1d32]" />
    <h1 className="mt-4 moc-serif text-3xl font-medium text-[#211b18]">Mã QR không còn hiệu lực</h1>
    <p className="mt-2 text-[15px] leading-6 text-[#625a55]">{message}</p>
  </section>
)

const TableHero = ({ state, onInvite }) => {
  const { table, session, visit } = state
  const compact = !!session?.isCurrent
  return (
    <section className={`moc-inverse relative overflow-hidden rounded-[28px] bg-[#49101f] bg-[radial-gradient(circle_at_90%_-10%,rgba(232,196,138,0.4),transparent_42%),linear-gradient(140deg,#2a1714,#49101f_55%,#6f1d32)] text-[#fff8ed] shadow-[0_24px_60px_rgba(73,16,31,0.3)] ${compact ? 'p-5' : 'p-6'}`}>
      <span aria-hidden="true" className="pointer-events-none absolute -right-6 -top-8 moc-serif text-[9rem] leading-none text-[#fff8ed]/[0.06]">M</span>
      <p className="text-xs font-bold tracking-[0.22em] text-[#e8c48a]">MỘC LIVE DINING</p>
      <h1 className={`mt-2 moc-serif font-medium leading-tight ${compact ? 'text-3xl' : 'text-4xl'}`}>{table.tableName}</h1>
      <p className="mt-1 text-sm text-[#fff8ed]/80">{table.location}</p>
      {session && (
        <div className={`${compact ? 'mt-3' : 'mt-5'} flex flex-wrap items-center gap-2 text-sm`}>
          <span className="rounded-full bg-[#fff8ed]/15 px-3 py-1.5 font-semibold">{SESSION_LABEL[session.status] || session.status}</span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#fff8ed]/10 px-3 py-1.5"><UsersRound className="h-4 w-4" /> {session.guestCount} khách</span>
          {session.openedAt && <span className="rounded-full bg-[#fff8ed]/10 px-3 py-1.5">Mở lúc {formatClock(session.openedAt)}</span>}
        </div>
      )}
      {visit?.guestName && session?.isCurrent && <p className="mt-3 moc-serif text-lg">Chúc {visit.guestName} ngon miệng.</p>}
      {session?.isCurrent && session.joinCode && <InviteButton joinCode={session.joinCode} onClick={onInvite} />}
    </section>
  )
}

export const LiveDiningPage = () => {
  const { tableToken } = useParams()
  const dine = useDineSession(tableToken)
  const cart = useDineCart(tableToken)
  const now = useNow(15000, dine.clockOffset)
  const menuLoader = useCallback(() => getDineMenuApi(), [])
  const menu = useApiResource(menuLoader, { fallbackError: 'Chưa tải được thực đơn.' })
  const { reload: reloadMenu } = menu

  const [tab, setTab] = useState('menu')
  const [selectedDish, setSelectedDish] = useState(null)
  const [cartOpen, setCartOpen] = useState(false)
  const [service, setService] = useState({ open: false, type: null, key: 0 })
  const [sentRound, setSentRound] = useState(null)
  const [bumpKey, setBumpKey] = useState(0)
  const [inviteOpen, setInviteOpen] = useState(false)

  // Món hết hàng trong ca: làm mới thực đơn mỗi phút.
  useEffect(() => {
    const timer = window.setInterval(() => reloadMenu({ quiet: true }), 60000)
    return () => window.clearInterval(timer)
  }, [reloadMenu])

  const { state } = dine
  const session = state?.session
  const inService = !!session?.isCurrent
  const mealEnded = !!session && !session.isCurrent
  const movedTo = state?.entry?.movedTo
  const orderingOpen = state?.entry?.orderingOpen !== false

  // Phiên đã được nhân viên chuyển sang bàn khác: mang thẻ khách sang bàn mới (SES-05).
  const followMove = () => {
    if (!movedTo?.tableToken) return
    try {
      if (dine.visitToken) window.localStorage.setItem(`moc.dine.visit.${movedTo.tableToken}`, dine.visitToken)
    } catch {
      // Bộ nhớ bị chặn: khách nhập lại mã bàn ở bàn mới.
    }
    window.location.assign(`/dine/${movedTo.tableToken}`)
  }

  const handleSent = useCallback((round) => {
    setCartOpen(false)
    setSentRound(round)
    setTab('track')
  }, [])
  const rounds = useRoundSubmission({
    tableToken,
    visitToken: dine.visitToken,
    submitOrder: dine.submitOrder,
    cart,
    canOrder: !!session?.canOrder && orderingOpen,
    onSent: handleSent,
  })
  const { error: roundError } = rounds
  useEffect(() => {
    if (roundError) reloadMenu({ quiet: true })
  }, [roundError, reloadMenu])

  const addToCart = (dish, quantity = 1, note = '') => {
    cart.addDish(dish, quantity, note)
    setBumpKey((value) => value + 1)
    setSelectedDish(null)
  }

  const openService = (type = null) => setService((current) => ({ open: true, type, key: current.key + 1 }))
  const openRequests = (state?.serviceRequests || []).filter((request) => ['NEW', 'ACKNOWLEDGED'].includes(request.status))
  const sla = { warningMinutes: 10, lateMinutes: 20, ...(state?.sla || {}) }

  return (
    <div className="min-h-screen bg-[#f5f0e7] pb-40 text-[#211b18]">
      <DineHeader table={state?.table} status={dine.status} />
      <DineToasts events={dine.events} onDismiss={dine.dismissEvent} />
      <main className="mx-auto max-w-3xl px-4 pt-5">
        {dine.fatalError && <InvalidQr message={apiErrorMessage(dine.fatalError)} />}
        {!dine.fatalError && !state && <PageSkeleton />}

        {!dine.fatalError && state && (
          <div className="space-y-6">
            <ReconnectBanner status={dine.status} onRetry={dine.refresh} />
            <TableHero state={state} onInvite={() => setInviteOpen(true)} />

            {movedTo && (
              <section className="rounded-3xl border border-[#6f1d32]/30 bg-[#fffdf8] p-5" aria-live="polite">
                <h2 className="moc-serif text-2xl text-[#211b18]">Bàn của bạn đã được chuyển</h2>
                <p className="mt-2 text-sm leading-6 text-[#625a55]">Nhân viên đã chuyển nhóm của bạn sang {movedTo.tableNames.join(' + ')}. Món đã gọi và hóa đơn được giữ nguyên.</p>
                <button type="button" onClick={followMove} className="moc-inverse mt-4 min-h-12 w-full rounded-full bg-[#6f1d32] px-5 text-sm font-bold text-white">Tiếp tục ở {movedTo.tableNames[0]}</button>
              </section>
            )}

            {!session && !movedTo && (
              <EntryStage
                state={state}
                now={now}
                onCheckIn={dine.checkIn}
                onCancelCheckIn={dine.cancelCheckIn}
                onStartOver={dine.startOver}
                onJoin={dine.join}
              />
            )}

            {mealEnded && <MealComplete state={state} onStartOver={dine.startOver} />}

            {inService && (
              <>
                {openRequests.length > 0 && <ServiceRequestList requests={openRequests} now={now} onCancel={(id) => dine.cancelRequest(id).catch(() => {})} />}
                {(rounds.pending || rounds.notice) && (
                  <PendingRoundCard pending={rounds.pending} status={rounds.status} error={rounds.error} notice={rounds.notice} onRetry={rounds.retry} onDismissNotice={rounds.dismissNotice} onTrack={() => setTab('track')} />
                )}
                {!orderingOpen && session.status === 'OPEN' && tab === 'menu' && (
                  <p className="rounded-2xl bg-[#f3e7d3] px-4 py-3 text-sm text-[#6b4a12]">Bếp đã ngưng nhận món mới sau {state.entry.lastOrderAt}. Bạn vẫn xem được món đã gọi và thanh toán bình thường.</p>
                )}
                {session.status === 'AWAITING_PAYMENT' && tab === 'menu' && (
                  <p className="rounded-2xl bg-[#f3e7d3] px-4 py-3 text-sm text-[#6b4a12]">Hóa đơn đã được lập nên thực đơn tạm khóa. Gọi nhân viên nếu bạn muốn gọi thêm món.</p>
                )}
                {tab === 'menu' && (
                  <MenuBrowser
                    menu={menu.data}
                    loading={menu.loading}
                    error={menu.error}
                    onRetry={() => reloadMenu()}
                    quantityOf={cart.quantityOf}
                    onOpenDish={setSelectedDish}
                    onQuickAdd={(dish) => addToCart(dish)}
                  />
                )}
                {tab === 'track' && <OrderTracker rounds={state.rounds} summary={state.summary} now={now} sla={sla} onBrowseMenu={() => setTab('menu')} />}
                {tab === 'bill' && <BillPanel state={state} onRequestBill={() => openService('PAYMENT')} />}
              </>
            )}
          </div>
        )}
      </main>

      {inService && session.canOrder && orderingOpen && tab === 'menu' && <CartBar totals={cart.totals} onOpen={() => { rounds.clearError(); setCartOpen(true) }} bumpKey={bumpKey} />}
      {inService && (
        <DineTabBar
          active={tab}
          onChange={setTab}
          badges={{ track: (state.summary?.inKitchenCount || 0) + (state.summary?.readyCount || 0), bill: state.invoice?.status === 'OPEN' ? 1 : 0 }}
          onService={() => openService()}
          serviceBadge={openRequests.length}
          serviceEnabled={session.canRequestService}
        />
      )}

      <DishSheet key={selectedDish?.dishId || 'none'} dish={selectedDish} onClose={() => setSelectedDish(null)} onAdd={addToCart} />
      <CartSheet open={cartOpen && inService} onClose={() => setCartOpen(false)} cart={cart} onSubmit={rounds.submit} submitting={rounds.status === 'sending'} error={rounds.error} pending={rounds.pending} />
      {inService && (
        <ServiceSheet
          key={service.key}
          open={service.open}
          initialType={service.type}
          onClose={() => setService((current) => ({ ...current, open: false }))}
          onSubmit={dine.raiseRequest}
          onCancel={dine.cancelRequest}
          requests={state.serviceRequests}
          now={now}
        />
      )}
      <OrderSentOverlay round={sentRound} onDone={() => setSentRound(null)} />
      {inService && session.joinCode && (
        <InviteSheet open={inviteOpen} onClose={() => setInviteOpen(false)} tableToken={tableToken} joinCode={session.joinCode} tableName={state.table.tableName} />
      )}
    </div>
  )
}

export default LiveDiningPage
