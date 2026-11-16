import { useState, useEffect, Suspense } from 'react'
import { Outlet } from 'react-router-dom'
import AdminSidebar from '../components/AdminSidebar'
import AdminHeader from '../components/AdminHeader'
import Skeleton from '../../../../components/ui/Skeleton'

/**
 * Khung Giao Diện Quản Trị (AdminLayout)
 * - Đồng bộ Centralized Design Tokens (bg-surface-bg, text-text-main)
 * - Tích hợp Suspense Loading Fallback cho Route Code-Splitting
 * - Độ dài < 70 dòng
 */
export const AdminLayout = () => {
  const [isCollapsed, setIsCollapsed] = useState(() => {
    return localStorage.getItem('admin_sidebar_collapsed') === 'true'
  })
  const [isMobileOpen, setIsMobileOpen] = useState(false)

  const handleToggleCollapse = () => {
    setIsCollapsed((prev) => {
      const next = !prev
      localStorage.setItem('admin_sidebar_collapsed', String(next))
      return next
    })
  }

  // Tự động đóng mobile sidebar khi resize lên màn hình lớn
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) setIsMobileOpen(false)
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return (
    <div className="min-h-screen bg-surface-bg text-text-main flex flex-col lg:flex-row antialiased">
      <AdminSidebar
        isCollapsed={isCollapsed}
        onToggleCollapse={handleToggleCollapse}
        isMobileOpen={isMobileOpen}
        onCloseMobile={() => setIsMobileOpen(false)}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <AdminHeader onOpenMobile={() => setIsMobileOpen(true)} />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Suspense
            fallback={
              <div className="space-y-6 animate-pulse">
                <Skeleton className="h-20 w-full rounded-2xl bg-surface-card" />
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <Skeleton className="h-28 rounded-2xl bg-surface-card" />
                  <Skeleton className="h-28 rounded-2xl bg-surface-card" />
                  <Skeleton className="h-28 rounded-2xl bg-surface-card" />
                  <Skeleton className="h-28 rounded-2xl bg-surface-card" />
                </div>
                <Skeleton className="h-72 w-full rounded-2xl bg-surface-card" />
              </div>
            }
          >
            <Outlet />
          </Suspense>
        </main>
      </div>
    </div>
  )
}

export default AdminLayout
