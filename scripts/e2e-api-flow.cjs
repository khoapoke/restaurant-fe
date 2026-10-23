/**
 * Kiểm thử end-to-end nghiệp vụ Mộc Dining qua API thật (backend đang chạy).
 * Chạy: node scripts/e2e-api-flow.cjs [apiBaseUrl]
 * Mặc định dùng tài khoản demo của RestaurantSeeder: kh1 / staff1 / admin (mật khẩu 123).
 */
const API = process.argv[2] || process.env.API_BASE_URL || 'http://127.0.0.1:8000/api/v1'
const checks = []

const request = async (method, path, { token, body, headers = {} } = {}) => {
  const response = await fetch(`${API}${path}`, {
    method,
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  })
  const json = await response.json().catch(() => ({}))
  return { status: response.status, json }
}

const expectStatus = (result, expected, label) => {
  const allowed = Array.isArray(expected) ? expected : [expected]
  if (!allowed.includes(result.status)) {
    throw new Error(`${label}: expected HTTP ${allowed.join('/')}, received ${result.status} ${JSON.stringify(result.json).slice(0, 400)}`)
  }
  return result.json.data
}

const expectEqual = (actual, expected, label) => {
  if (actual !== expected) throw new Error(`${label}: expected ${JSON.stringify(expected)}, received ${JSON.stringify(actual)}`)
}

const pass = (label) => { checks.push(label); console.log(`✓ ${label}`) }
const uid = (prefix) => `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2, 10)}`

const login = async (username, password = '123') => expectStatus(await request('POST', '/auth/login', { body: { username, password } }), 200, `login ${username}`).accessToken

const pad = (value) => String(value).padStart(2, '0')
const localDateTime = (date) => `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:00`

const fillCart = async (token) => {
  const cart = expectStatus(await request('GET', '/customer/cart', { token }), 200, 'get cart')
  for (const item of cart.items || []) {
    expectStatus(await request('DELETE', `/customer/cart/items/${item.dishId}`, { token }), 200, 'clear cart item')
  }
  const dishes = expectStatus(await request('GET', '/customer/dishes?perPage=5&isAvailable=true'), 200, 'list dishes').items
  if (dishes.length < 2) throw new Error('Need at least two available dishes')
  expectStatus(await request('POST', '/customer/cart/items', { token, body: { dishId: dishes[0].dishId, quantity: 2 } }), [200, 201], 'add dish 1')
  expectStatus(await request('POST', '/customer/cart/items', { token, body: { dishId: dishes[1].dishId, quantity: 1 } }), [200, 201], 'add dish 2')
}

const advanceKitchenItemsToReady = async (staffToken, orderId) => {
  const board = expectStatus(await request('GET', '/staff/kitchen/items', { token: staffToken }), 200, 'kitchen board')
  const items = board.items.filter((item) => item.orderId === orderId)
  if (!items.length) throw new Error(`Order #${orderId} is not visible on the kitchen board`)
  for (const item of items) {
    const path = { SENT: ['QUEUED', 'PREPARING', 'READY'], QUEUED: ['PREPARING', 'READY'], PREPARING: ['READY'], READY: [] }[item.status] || []
    for (const status of path) {
      expectStatus(await request('PATCH', `/staff/kitchen/items/${item.itemId}/status`, { token: staffToken, body: { status } }), 200, `kitchen ${status}`)
    }
  }
  return items.length
}

const main = async () => {
  const customer = await login('kh1')
  const staff = await login('staff1')
  const admin = await login('admin')
  pass('Đăng nhập khách, nhân viên, admin')

  expectStatus(await request('GET', '/admin/orders', { token: customer }), 403, 'customer blocked from admin')
  expectStatus(await request('GET', '/staff/kitchen/items', { token: customer }), 403, 'customer blocked from KDS')
  expectStatus(await request('GET', '/customer/cart', { token: staff }), 403, 'staff blocked from customer cart')
  pass('Phân quyền: khách không vào admin/KDS, nhân viên không dùng giỏ khách')

  // 1. DELIVERY + QR
  await fillCart(customer)
  const delivery = expectStatus(await request('POST', '/customer/orders/checkout', { token: customer, body: {
    fulfillmentType: 'DELIVERY', recipientName: 'Lê Hoàng Hùng', recipientPhone: '0923456789',
    shippingAddress: '12 Nguyễn Thị Minh Khai, Quận 1, TP.HCM', paymentMethod: 'BANK_TRANSFER_QR', orderNote: 'E2E giao hàng',
  } }), 201, 'checkout delivery')
  expectEqual(delivery.fulfillmentStatus, 'PENDING', 'delivery initial fulfillment')
  const qr = expectStatus(await request('POST', `/customer/payments/${delivery.orderId}/qr`, { token: customer }), 200, 'generate QR')
  if (!qr.qrImageUrl.includes('img.vietqr.io')) throw new Error('QR image url missing')
  pass(`Checkout giao hàng QR #${delivery.orderId} và sinh VietQR`)

  const boardBefore = expectStatus(await request('GET', '/staff/kitchen/items', { token: staff }), 200, 'kitchen before confirm')
  if (boardBefore.items.some((item) => item.orderId === delivery.orderId)) throw new Error('Unconfirmed online order leaked to KDS')
  pass('KDS ẩn đơn online chưa xác nhận')

  const unsigned = await request('POST', '/webhooks/payment-callback', { body: { orderId: delivery.orderId, amount: delivery.totalAmount } })
  if (![401, 503].includes(unsigned.status)) throw new Error(`Unsigned webhook must be rejected, got ${unsigned.status}`)
  pass(`Webhook không chữ ký bị từ chối (HTTP ${unsigned.status})`)

  const payments = expectStatus(await request('GET', `/admin/payments?keyword=${delivery.orderId}`, { token: admin }), 200, 'admin payment search').items
  const deliveryPayment = payments.find((payment) => payment.orderId === delivery.orderId)
  expectStatus(await request('POST', `/admin/payments/${deliveryPayment.paymentId}/confirm`, { token: admin, body: { transactionCode: uid('FT') } }), 200, 'admin confirm transfer')
  const confirmedDelivery = expectStatus(await request('GET', `/customer/orders/${delivery.orderId}`, { token: customer }), 200, 'customer order after payment')
  expectEqual(confirmedDelivery.status, 'CONFIRMED', 'order confirmed after transfer')
  expectEqual(confirmedDelivery.payment.status, 'PAID', 'delivery payment status')
  pass('Admin xác nhận chuyển khoản → đơn tự xác nhận')

  await advanceKitchenItemsToReady(staff, delivery.orderId)
  let adminOrder = expectStatus(await request('GET', `/admin/orders/${delivery.orderId}`, { token: admin }), 200, 'admin order detail')
  expectEqual(adminOrder.status, 'READY', 'delivery ready after kitchen')
  expectEqual(adminOrder.fulfillmentStatus, 'AWAITING_DRIVER', 'delivery awaiting driver')
  pass('Bếp hoàn tất món trên KDS → đơn READY, chờ tài xế')

  expectStatus(await request('PATCH', `/admin/orders/${delivery.orderId}/status`, { token: admin, body: { targetStatus: 'COMPLETED' } }), [400, 422], 'READY → COMPLETED blocked')
  expectStatus(await request('PATCH', `/admin/orders/${delivery.orderId}/fulfillment-status`, { token: admin, body: { targetStatus: 'OUT_FOR_DELIVERY' } }), 200, 'out for delivery')
  adminOrder = expectStatus(await request('PATCH', `/admin/orders/${delivery.orderId}/fulfillment-status`, { token: admin, body: { targetStatus: 'DELIVERED' } }), 200, 'delivered')
  expectEqual(adminOrder.status, 'COMPLETED', 'delivery completed')
  pass('Giao tài xế → đã giao → hoàn tất (chặn READY → COMPLETED trực tiếp)')

  // 2. PICKUP + CASH, then cancel test on another order
  await fillCart(customer)
  const pickup = expectStatus(await request('POST', '/customer/orders/checkout', { token: customer, body: {
    fulfillmentType: 'PICKUP', recipientName: 'Lê Hoàng Hùng', recipientPhone: '0923456789', scheduledAt: null, paymentMethod: 'CASH',
  } }), 201, 'checkout pickup')
  expectEqual(pickup.shippingAddress, null, 'pickup has no shipping address')
  for (const targetStatus of ['CONFIRMED', 'PREPARING', 'READY']) {
    expectStatus(await request('PATCH', `/admin/orders/${pickup.orderId}/status`, { token: admin, body: { targetStatus } }), 200, `pickup ${targetStatus}`)
  }
  // Bàn giao phải đúng mã nhận hàng khách thấy trên đơn (DLV-07); mã sai bị từ chối.
  const pickupCode = expectStatus(await request('GET', `/customer/orders/${pickup.orderId}`, { token: customer }), 200, 'customer pickup detail').pickupCode
  if (!/^\d{4}$/.test(pickupCode || '')) throw new Error('Pickup code missing on customer order')
  expectStatus(await request('PATCH', `/admin/orders/${pickup.orderId}/fulfillment-status`, { token: admin, body: { targetStatus: 'COLLECTED', pickupCode: pickupCode === '0000' ? '1111' : '0000' } }), 422, 'wrong pickup code rejected')
  const collected = expectStatus(await request('PATCH', `/admin/orders/${pickup.orderId}/fulfillment-status`, { token: admin, body: { targetStatus: 'COLLECTED', pickupCode } }), 200, 'pickup collected')
  expectEqual(collected.payment.status, 'PAID', 'cash settled on collection')
  pass(`Tự đến lấy tiền mặt #${pickup.orderId}: xác nhận → bếp → khách nhận, tiền mặt ghi nhận khi bàn giao`)

  await fillCart(customer)
  const toCancel = expectStatus(await request('POST', '/customer/orders/checkout', { token: customer, body: {
    fulfillmentType: 'PICKUP', recipientName: 'Lê Hoàng Hùng', recipientPhone: '0923456789', paymentMethod: 'CASH',
  } }), 201, 'checkout to cancel')
  expectStatus(await request('POST', `/customer/orders/${toCancel.orderId}/cancel`, { token: customer, body: { cancelReason: 'Đổi kế hoạch' } }), 200, 'customer cancel pending order')
  expectStatus(await request('POST', `/customer/orders/${toCancel.orderId}/cancel`, { token: customer, body: { cancelReason: 'Lần hai' } }), 409, 'second cancel blocked')
  expectStatus(await request('GET', `/customer/orders/${delivery.orderId + 100000}`, { token: customer }), 404, 'unknown order 404')
  pass('Khách hủy đơn chờ xác nhận; hủy lần hai bị chặn; đơn lạ trả 404')

  // 3. Reservation → POS seating → kitchen → invoice → QR → close → cleaning
  // Dùng kh2: kh1 có sẵn lượt tối nay, quy tắc ADR-025 không cho một khách có hai lượt chồng giờ.
  const booker = await login('kh2', 'Password@123')
  const arrival = new Date(Date.now() + 40 * 60000)
  if (arrival.getDate() !== new Date().getDate()) {
    console.log('! Bỏ qua luồng nhận bàn vì 40 phút nữa đã sang ngày mới')
  } else {
    const available = expectStatus(await request('GET', `/customer/tables/available?date=${localDateTime(arrival).slice(0, 10)}&time=${localDateTime(arrival).slice(11, 16)}&guestCount=2`, { token: booker }), 200, 'available tables').items
    const floorBefore = expectStatus(await request('GET', '/staff/pos/tables', { token: staff }), 200, 'floor').items
    const freeTable = available.find((table) => floorBefore.some((floorTable) => floorTable.tableId === table.tableId && ['AVAILABLE', 'RESERVED'].includes(floorTable.status) && !floorTable.upcomingReservation))
    if (!freeTable) throw new Error('No free table for the reservation flow')
    const reservation = expectStatus(await request('POST', '/customer/reservations', { token: booker, body: {
      tableId: freeTable.tableId, reservationTime: localDateTime(arrival), guestCount: 2, note: 'E2E nhận bàn',
    } }), 201, 'create reservation')
    expectEqual(reservation.canModify, false, 'reservation inside 60 minutes cannot be modified')
    expectStatus(await request('PATCH', `/admin/reservations/${reservation.reservationId}/status`, { token: admin, body: { targetStatus: 'CONFIRMED', adminNote: 'Giữ bàn E2E' } }), 200, 'admin confirm reservation')
    let floor = expectStatus(await request('GET', '/staff/pos/tables', { token: staff }), 200, 'floor after confirm').items
    let table = floor.find((item) => item.tableId === freeTable.tableId)
    expectEqual(table.status, 'RESERVED', 'table reserved')
    expectEqual(table.upcomingReservation?.reservationId, reservation.reservationId, 'floor shows reservation')
    pass(`Khách đặt bàn #${reservation.reservationId}, admin xác nhận → ${table.tableName} giữ chỗ trên POS`)

    expectStatus(await request('POST', '/staff/pos/sessions', { token: staff, headers: { 'Idempotency-Key': uid('walkin') }, body: { tableIds: [freeTable.tableId], guestCount: 2 } }), 409, 'walk-in blocked on held table')
    // Khách đến sớm 40 phút (> 30 phút cho phép): nhân viên bị chặn, quản lý nhận khách kèm lý do (ADR-025).
    expectStatus(await request('POST', '/staff/pos/sessions', { token: staff, headers: { 'Idempotency-Key': uid('seat') }, body: { tableIds: [freeTable.tableId], guestCount: 2, reservationId: reservation.reservationId } }), 403, 'staff cannot seat outside window')
    const session = expectStatus(await request('POST', '/staff/pos/sessions', { token: admin, headers: { 'Idempotency-Key': uid('seat') }, body: { tableIds: [freeTable.tableId], guestCount: 2, reservationId: reservation.reservationId, overrideReason: 'E2E: khách đến sớm, bàn đang trống' } }), 201, 'admin seats outside window')
    pass(`Chặn khách vãng lai, nhân viên không nhận sớm ngoài khung; quản lý nhận khách đặt trước → phiên #${session.sessionId}`)

    const order = expectStatus(await request('POST', `/staff/pos/sessions/${session.sessionId}/orders`, { token: staff, body: {} }), [200, 201], 'pos order')
    const dishes = expectStatus(await request('GET', '/customer/dishes?perPage=5&isAvailable=true'), 200, 'dishes').items
    const first = expectStatus(await request('POST', `/staff/pos/orders/${order.orderId}/items`, { token: staff, body: { dishId: dishes[0].dishId, quantity: 1, clientRequestId: uid('item') } }), 201, 'add item')
    expectStatus(await request('PATCH', `/staff/pos/order-items/${first.itemId}`, { token: staff, body: { quantity: 2, note: 'Ít cay' } }), 200, 'update item')
    const removable = expectStatus(await request('POST', `/staff/pos/orders/${order.orderId}/items`, { token: staff, body: { dishId: dishes[1].dishId, quantity: 1, clientRequestId: uid('item') } }), 201, 'add removable')
    expectStatus(await request('DELETE', `/staff/pos/order-items/${removable.itemId}`, { token: staff }), 200, 'remove draft item')
    expectStatus(await request('POST', `/staff/pos/orders/${order.orderId}/send-kitchen`, { token: staff, body: { itemIds: [first.itemId] } }), 200, 'send kitchen')
    expectStatus(await request('PATCH', `/staff/pos/order-items/${first.itemId}`, { token: staff, body: { quantity: 3 } }), 409, 'sent item locked')
    await advanceKitchenItemsToReady(staff, order.orderId)
    pass('POS: thêm/sửa/xóa món nháp, gửi bếp, khóa sửa món đã gửi, bếp báo sẵn sàng')

    const extra = expectStatus(await request('POST', `/staff/pos/orders/${order.orderId}/items`, { token: staff, body: { dishId: dishes[1].dishId, quantity: 1, clientRequestId: uid('item') } }), 201, 'order more after ready')
    expectStatus(await request('POST', `/staff/pos/orders/${order.orderId}/send-kitchen`, { token: staff, body: { itemIds: [extra.itemId] } }), 200, 'send extra')
    await advanceKitchenItemsToReady(staff, order.orderId)
    let invoice = expectStatus(await request('POST', `/staff/pos/sessions/${session.sessionId}/invoices`, { token: staff }), 201, 'invoice')
    expectStatus(await request('POST', `/staff/pos/sessions/${session.sessionId}/reopen`, { token: staff }), 200, 'reopen invoice')
    invoice = expectStatus(await request('POST', `/staff/pos/sessions/${session.sessionId}/invoices`, { token: staff }), 201, 're-invoice')
    if (!invoice.qr?.qrImageUrl) throw new Error('Invoice QR missing')
    pass(`Gọi thêm món trong cùng phiên, lập/mở lại hóa đơn #${invoice.invoiceId} (có VietQR)`)

    // ADR-023: chuyển thiếu được ghi nhận là thanh toán một phần, mã giao dịch ngắn bị từ chối, thu nốt phần còn lại.
    expectStatus(await request('POST', `/staff/invoices/${invoice.invoiceId}/payments`, { token: staff, headers: { 'Idempotency-Key': uid('pay') }, body: { method: 'BANK_TRANSFER_QR', amount: 1000, transactionCode: 'FT1' } }), 422, 'short reference rejected')
    const partial = expectStatus(await request('POST', `/staff/invoices/${invoice.invoiceId}/payments`, { token: staff, headers: { 'Idempotency-Key': uid('pay') }, body: { method: 'BANK_TRANSFER_QR', amount: invoice.totalAmount - 1000, transactionCode: uid('FT') } }), 201, 'partial transfer')
    expectEqual(partial.status, 'OPEN', 'invoice still open after partial payment')
    expectEqual(partial.outstanding, 1000, 'outstanding after partial payment')
    expectStatus(await request('POST', `/staff/pos/sessions/${session.sessionId}/close`, { token: staff, body: { expectedVersion: (await request('GET', `/staff/pos/sessions/${session.sessionId}`, { token: staff })).json.data.version } }), 409, 'close blocked while money outstanding')
    const paid = expectStatus(await request('POST', `/staff/invoices/${invoice.invoiceId}/payments`, { token: staff, headers: { 'Idempotency-Key': uid('pay') }, body: { method: 'CASH', amount: 1000, cashTendered: 2000 } }), 201, 'pay remaining cash')
    expectEqual(paid.status, 'PAID', 'invoice paid')
    const current = expectStatus(await request('GET', `/staff/pos/sessions/${session.sessionId}`, { token: staff }), 200, 'session detail')
    expectStatus(await request('POST', `/staff/pos/sessions/${session.sessionId}/close`, { token: staff, body: { expectedVersion: current.version - 1 } }), 409, 'stale version rejected')
    const closed = expectStatus(await request('POST', `/staff/pos/sessions/${session.sessionId}/close`, { token: staff, body: { expectedVersion: current.version } }), 200, 'close session')
    expectEqual(closed.reservation.status, 'COMPLETED', 'reservation completed')
    expectEqual(closed.tables[0].status, 'CLEANING', 'table cleaning')
    pass('Chuyển khoản thiếu ghi nhận một phần, chặn đóng phiên khi còn thiếu, thu nốt tiền mặt; đóng phiên (chống xung đột phiên bản) → đặt bàn hoàn thành, bàn chờ vệ sinh')

    table = expectStatus(await request('POST', `/staff/pos/tables/${freeTable.tableId}/complete-cleaning`, { token: staff }), 200, 'complete cleaning')
    if (!['AVAILABLE', 'RESERVED'].includes(table.status)) throw new Error(`Unexpected table status after cleaning: ${table.status}`)
    pass(`Nhân viên xác nhận vệ sinh → ${table.tableName} ${table.status}`)
  }

  // 4. Cancelled session flow
  const floor = expectStatus(await request('GET', '/staff/pos/tables', { token: staff }), 200, 'floor').items
  const walkInTable = floor.find((table) => table.status === 'AVAILABLE' && !table.upcomingReservation?.isWithinSeatingWindow)
  if (walkInTable) {
    const mistaken = expectStatus(await request('POST', '/staff/pos/sessions', { token: staff, headers: { 'Idempotency-Key': uid('mistake') }, body: { tableIds: [walkInTable.tableId], guestCount: 1 } }), 201, 'open mistaken session')
    expectStatus(await request('POST', `/staff/pos/sessions/${mistaken.sessionId}/cancel`, { token: staff, body: { reason: 'Mở nhầm bàn (E2E)' } }), 200, 'cancel mistaken session')
    pass(`Hủy phiên mở nhầm tại ${walkInTable.tableName}, bàn trở lại sẵn sàng`)
  }

  const dashboard = expectStatus(await request('GET', '/admin/reports/dashboard', { token: admin }), 200, 'dashboard')
  if (typeof dashboard.attention?.pendingOrders !== 'number') throw new Error('Dashboard attention block missing')
  pass(`Dashboard dữ liệu thật: doanh thu ${dashboard.revenue.totalPaidRevenue.toLocaleString('vi-VN')} ₫, ${dashboard.orders.totalCount} đơn`)

  console.log(JSON.stringify({ passed: true, checks: checks.length }, null, 2))
}

main().catch((error) => {
  console.error(`✗ ${error.message}`)
  process.exitCode = 1
})
