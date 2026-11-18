import apiClient from '../../../../lib/axios'

/**
 * Service Màn hình Bếp (Kitchen Display System - KDS)
 * Tham chiếu đặc tả: docs/modules/order.md (KTC-01 -> KTC-03)
 */

/**
 * KTC-01: Lấy danh sách các đơn hàng & món ăn đang chờ chế biến / đang nấu
 * @param {Object} [params] - { status?: string, tableId?: number }
 */
export const getKitchenOrdersApi = async (params = {}) => {
  return await apiClient.get('/kitchen/orders', { params })
}

/**
 * KTC-02: Bếp cập nhật tiến độ món lẻ trong đơn hàng
 * @param {number|string} orderId - Mã đơn hàng
 * @param {number|string} dishId - Mã món ăn
 * @param {'COOKING'|'READY'|'SERVED'} status - Trạng thái mới của món
 */
export const updateKitchenDishStatusApi = async (orderId, dishId, status) => {
  return await apiClient.patch(`/kitchen/orders/${orderId}/dishes/${dishId}/status`, {
    status,
  })
}

/**
 * KTC-03: Bếp cập nhật nhanh trạng thái cả đơn hàng
 * @param {number|string} orderId - Mã đơn hàng
 * @param {'PREPARING'|'READY'} targetStatus - Trạng thái đích của đơn
 */
export const updateKitchenOrderStatusApi = async (orderId, targetStatus) => {
  return await apiClient.patch(`/kitchen/orders/${orderId}/status`, {
    targetStatus,
  })
}

