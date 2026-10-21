/**
 * Chuẩn hóa thông báo lỗi từ backend Laravel sang tiếng Việt cho giao diện Mộc.
 * Backend trả message tiếng Anh ổn định; frontend dịch các message nghiệp vụ đã biết,
 * các message chưa có bản dịch được giữ nguyên để không làm mất thông tin.
 */
const EXACT_MESSAGES = {
  'Unauthenticated or token is missing/invalid': 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.',
  'Your account has been locked by Administrator': 'Tài khoản của bạn đã bị quản trị viên khóa.',
  'Access denied. You do not have permission to perform this action.': 'Bạn không có quyền thực hiện thao tác này.',
  'Resource not found': 'Không tìm thấy dữ liệu yêu cầu.',
  'Admin cannot lock their own account': 'Không thể tự khóa tài khoản quản trị đang đăng nhập.',
  'Cannot checkout an empty cart': 'Giỏ hàng đang trống, chưa thể đặt món.',
  'Dish is currently unavailable or out of stock': 'Món này hiện tạm hết hoặc ngừng phục vụ.',
  'Dish is currently unavailable.': 'Món này hiện tạm hết hoặc ngừng phục vụ.',
  'Dish not found or unavailable': 'Món ăn không tồn tại hoặc đã ngừng phục vụ.',
  'Order not found': 'Không tìm thấy đơn hàng.',
  'Order has already been cancelled': 'Đơn hàng đã bị hủy.',
  'Order has already been completed': 'Đơn hàng đã hoàn tất.',
  'Order has already been paid': 'Đơn hàng đã được thanh toán.',
  'Order has no payment record': 'Đơn hàng chưa có bản ghi thanh toán.',
  'Order cannot be cancelled because it is already being prepared by the kitchen': 'Nhà hàng đã tiếp nhận đơn nên bạn không thể tự hủy. Vui lòng liên hệ Mộc để được hỗ trợ.',
  'Order must be ready before handoff can be updated': 'Bếp cần hoàn tất món trước khi bàn giao.',
  'This order can no longer be cancelled': 'Đơn hàng không thể hủy ở trạng thái hiện tại.',
  'The driver is already delivering this order. Confirm delivery or contact the driver first.': 'Tài xế đang giao đơn này. Hãy xác nhận giao hàng hoặc liên hệ tài xế trước.',
  'Dine-in fulfillment is managed by the POS service session': 'Đơn ăn tại chỗ được xử lý trong phiên POS.',
  'Dine-in orders are managed by the POS session and kitchen board': 'Đơn ăn tại chỗ được điều phối tại POS và màn hình bếp.',
  'Only paid transactions can be refunded': 'Chỉ hoàn tiền cho giao dịch đã thanh toán.',
  'This payment has already been confirmed': 'Giao dịch này đã được xác nhận trước đó.',
  'A refunded payment cannot be confirmed again': 'Giao dịch đã hoàn tiền không thể xác nhận lại.',
  'Cash payments are settled automatically at handoff': 'Đơn tiền mặt được ghi nhận khi bàn giao cho khách.',
  'Cannot confirm a transfer for a cancelled order': 'Không thể xác nhận chuyển khoản cho đơn đã hủy.',
  'Reservation not found': 'Không tìm thấy lượt đặt bàn.',
  'Reservations require at least 30 minutes advance notice': 'Vui lòng đặt bàn trước giờ đến ít nhất 30 phút.',
  'Special requests require at least 2 hours advance notice': 'Yêu cầu đặc biệt (sinh nhật, trang trí, VIP...) cần đặt trước ít nhất 2 giờ.',
  'Only pending or confirmed reservations can be modified': 'Chỉ lượt đặt đang chờ hoặc đã xác nhận mới có thể thay đổi.',
  'Reservations can only be modified or cancelled at least 60 minutes before arrival': 'Chỉ có thể đổi hoặc hủy lịch trước giờ đến ít nhất 60 phút.',
  'This table already has an overlapping reservation': 'Bàn này đã có lượt đặt trùng khung giờ.',
  'This table has an overlapping confirmed reservation': 'Bàn này đã có lượt đặt được xác nhận trùng khung giờ.',
  'This table is under maintenance': 'Bàn đang bảo trì.',
  'The selected table is under maintenance': 'Bàn được chọn đang bảo trì.',
  'This reservation time has already passed': 'Thời gian của lượt đặt đã qua.',
  'The guests are already seated. Close the POS session instead': 'Khách đã nhận bàn. Hãy hoàn tất phiên POS thay vì đổi lượt đặt.',
  'Capacity cannot be lower than an upcoming reservation guest count': 'Sức chứa không thể nhỏ hơn số khách của lượt đặt sắp tới.',
  'Cannot change the status of a table in an active POS session': 'Bàn đang có phiên phục vụ nên chưa thể đổi trạng thái.',
  'This table has a confirmed reservation today. Cancel or move the reservation before maintenance': 'Bàn có lượt đặt đã xác nhận hôm nay. Hãy hủy hoặc chuyển lượt đặt trước khi bảo trì.',
  'A new table can only start as AVAILABLE or MAINTENANCE': 'Bàn mới chỉ có thể ở trạng thái Sẵn sàng hoặc Bảo trì.',
  'Only a table waiting for cleaning can be marked available.': 'Chỉ bàn đang chờ vệ sinh mới có thể mở lại.',
  'This table still belongs to an active service session.': 'Bàn vẫn thuộc một phiên phục vụ đang mở.',
  'One or more tables already belong to an open service session.': 'Có bàn đang thuộc một phiên phục vụ khác.',
  'Only a confirmed reservation can be seated.': 'Chỉ lượt đặt đã xác nhận mới có thể nhận bàn.',
  'The reservation belongs to a different table.': 'Lượt đặt này thuộc một bàn khác.',
  'Only reservations scheduled for today can be seated.': 'Chỉ nhận khách cho lượt đặt trong hôm nay.',
  'This reservation has already been seated.': 'Lượt đặt này đã được nhận bàn.',
  'Service session is not open for ordering.': 'Phiên đã lập hóa đơn hoặc đã đóng nên không thể gọi thêm món.',
  'This order no longer accepts new items.': 'Order này không nhận thêm món.',
  'An item already sent to the kitchen cannot be edited directly.': 'Món đã gửi bếp không thể sửa trực tiếp.',
  'Only DRAFT items can be sent to the kitchen.': 'Chỉ món chưa gửi mới có thể chuyển xuống bếp.',
  'Send all draft items to the kitchen before creating the invoice.': 'Hãy gửi toàn bộ món nháp xuống bếp trước khi lập hóa đơn.',
  'Cannot create an invoice for an empty session.': 'Phiên chưa có món nào để lập hóa đơn.',
  'This service session cannot be invoiced.': 'Phiên này không thể lập hóa đơn.',
  'Only a session awaiting payment can be reopened for more orders.': 'Chỉ phiên đang chờ thanh toán mới mở lại để gọi thêm.',
  'A paid invoice cannot be reopened.': 'Hóa đơn đã thanh toán không thể mở lại.',
  'This invoice has been voided. Create a new invoice before taking payment.': 'Hóa đơn đã hủy. Hãy lập hóa đơn mới trước khi thu tiền.',
  'The invoice must be fully paid before closing the session.': 'Cần thanh toán đủ hóa đơn trước khi đóng phiên.',
  'All kitchen items must be READY or SERVED before closing.': 'Tất cả món phải sẵn sàng hoặc đã phục vụ trước khi đóng phiên.',
  'Session version conflict. Refresh data and try again.': 'Dữ liệu phiên vừa thay đổi ở thiết bị khác. Hãy làm mới rồi thử lại.',
  'Only an open session without an invoice can be cancelled.': 'Chỉ hủy được phiên đang mở và chưa lập hóa đơn.',
  'Items have already been sent to the kitchen. Settle the bill instead of cancelling.': 'Đã có món gửi xuống bếp nên không thể hủy phiên. Hãy lập hóa đơn và thanh toán.',
  'Online orders must be confirmed before the kitchen can start.': 'Đơn online cần được xác nhận trước khi bếp bắt đầu.',
  'Online orders are handed off from the order fulfillment screen, not the kitchen board.': 'Đơn online được bàn giao tại màn hình điều phối đơn, không xác nhận ở bếp.',
  'This order has been cancelled.': 'Đơn hàng đã bị hủy.',
  'Idempotency key was already used with a different request.': 'Yêu cầu trùng lặp với dữ liệu khác. Vui lòng thử lại.',
  'minPrice cannot be greater than maxPrice': 'Giá thấp nhất không được lớn hơn giá cao nhất.',
}

const PATTERN_MESSAGES = [
  [/^Dish '(.+)' has just sold out$/, (m) => `Món "${m[1]}" vừa hết. Vui lòng bỏ món khỏi giỏ để tiếp tục.`],
  [/^QR bank transfer must be paid before handing the order to the driver$/, () => 'Đơn chuyển khoản QR cần được thanh toán trước khi giao cho tài xế.'],
  [/^QR bank transfer must be paid before completing the order$/, () => 'Đơn chuyển khoản QR cần được thanh toán trước khi hoàn tất bàn giao.'],
  [/^Invalid (status|fulfillment|reservation|kitchen) transition from (\w+) to (\w+)\.?$/, () => 'Trạng thái đã thay đổi hoặc bước chuyển không hợp lệ. Hãy làm mới dữ liệu.'],
  [/^(.+) is held for reservation #(\d+) at (\d{2}:\d{2})\. Seat that reservation or choose another table\.$/, (m) => `${m[1]} đang được giữ cho lượt đặt #${m[2]} lúc ${m[3]}. Hãy nhận khách đặt trước hoặc chọn bàn khác.`],
  [/^(.+) is not available for a new service session\.$/, (m) => `${m[1]} chưa sẵn sàng để mở phiên mới.`],
  [/^Guest count exceeds (?:the selected tables'|this table's) capacity of (\d+)\.?$/, (m) => `Số khách vượt sức chứa tối đa ${m[1]} người.`],
  [/^Payment amount must equal ([\d.]+)\.$/, (m) => `Số tiền thanh toán phải bằng ${Number(m[1]).toLocaleString('vi-VN')} ₫.`],
  [/^(OCCUPIED|RESERVED) is managed automatically by reservations and POS sessions$/, () => 'Trạng thái Đang phục vụ/Đã đặt được hệ thống tự cập nhật theo POS và đặt bàn.'],
]

export const translateApiMessage = (message) => {
  if (!message) return message
  if (EXACT_MESSAGES[message]) return EXACT_MESSAGES[message]
  for (const [pattern, format] of PATTERN_MESSAGES) {
    const match = message.match(pattern)
    if (match) return format(match)
  }
  return message
}

export const apiErrorMessage = (error, fallback = 'Thao tác chưa thành công. Vui lòng thử lại.') => {
  const data = error?.response?.data
  const firstValidationError = Object.values(data?.errors || {}).flat()[0]
  if (error?.response?.status === 422 && firstValidationError) return translateApiMessage(firstValidationError)
  if (data?.message) return translateApiMessage(data.message)
  if (firstValidationError) return translateApiMessage(firstValidationError)
  if (error?.code === 'ECONNABORTED' || (error && !error.response)) {
    return 'Không kết nối được máy chủ. Kiểm tra mạng và thử lại.'
  }
  return fallback
}
