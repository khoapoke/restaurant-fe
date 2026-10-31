import apiClient from '../../../../lib/axios'

/**
 * Service Báo cáo Thống kê Dashboard Quản trị
 * Tham chiếu đặc tả: docs/api/admin-table-report.md (RPT-01 -> RPT-04)
 */

export const getDashboardReportApi = async ({ fromDate, toDate }) => {
  return await apiClient.get('/admin/reports/dashboard', {
    params: {
      fromDate,
      toDate,
    },
  })
}

