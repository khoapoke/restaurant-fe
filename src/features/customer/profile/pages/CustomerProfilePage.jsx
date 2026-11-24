import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Save, AlertTriangle, RefreshCw } from 'lucide-react'
import { useAuth } from '../../../../contexts/AuthContext'
import { getProfileApi, updateProfileApi } from '../services/profileService'
import HomeHeader from '../../Home/components/HomeHeader'
import HomeFooter from '../../Home/components/HomeFooter'
import ProfileOverviewCard from '../components/ProfileOverviewCard'
import ProfileInfoTab from '../components/ProfileInfoTab'
import AllergiesPreferencesTab from '../components/AllergiesPreferencesTab'
import SavedAddressesTab from '../components/SavedAddressesTab'
import MyReviewsTab from '../components/MyReviewsTab'
import Button from '../../../../components/ui/Button'
import Alert from '../../../../components/ui/Alert'
import Skeleton from '../../../../components/ui/Skeleton'

/**
 * Trang Hồ Sơ Cá Nhân & Dị Ứng (CustomerProfilePage)
 * - Tinh tế Fine-Dining & Bố cục 2 cột bất đối xứng (4/12 & 8/12)
 * - Đồng bộ Navbar HomeHeader / HomeFooter
 * - Nút Lưu thay đổi thông minh & cảnh báo an toàn ẩm thực
 * - Độ dài < 175 dòng
 */
export default function CustomerProfilePage() {
  const navigate = useNavigate()
  const { isAuthenticated, role, updateUserProfile } = useAuth()

  useEffect(() => {
    if (!isAuthenticated) navigate('/login')
    else if (role === 'ADMIN') navigate('/admin')
  }, [isAuthenticated, role, navigate])

  const [activeTab, setActiveTab] = useState('info')
  const [loading, setLoading] = useState(true)
  const [fetchError, setFetchError] = useState(null)
  const [isSaving, setIsSaving] = useState(false)
  const [alertInfo, setAlertInfo] = useState(null)
  const [fieldErrors, setFieldErrors] = useState({})
  const [isDirty, setIsDirty] = useState(false)

  const [formData, setFormData] = useState({
    username: '', email: '', fullName: '', phoneNumber: '', birthDate: '', defaultAddress: '',
  })
  const [savedAddresses, setSavedAddresses] = useState([])
  const [allergies, setAllergies] = useState([])
  const [dietaryPreferences, setDietaryPreferences] = useState([])
  const [reviewsCount, setReviewsCount] = useState(0)

  const fetchProfile = useCallback(async () => {
    setLoading(true); setFetchError(null)
    try {
      const res = await getProfileApi()
      const d = res.data?.data || res.data || {}
      setFormData({
        username: d.username || '', email: d.email || '', fullName: d.fullName || '',
        phoneNumber: d.phoneNumber || '', birthDate: d.birthDate || '', defaultAddress: d.defaultAddress || '',
      })
      setSavedAddresses(d.savedAddresses || [])
      setAllergies(d.allergies || [])
      setDietaryPreferences(d.dietaryPreferences || [])
      setIsDirty(false)
    } catch (err) {
      setFetchError(err.response?.data?.message || 'Không thể tải thông tin hồ sơ.')
    } finally { setLoading(false) }
  }, [])

  useEffect(() => {
    if (isAuthenticated) fetchProfile()
  }, [isAuthenticated, fetchProfile])

  const handleInfoChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    setIsDirty(true)
    if (fieldErrors[name]) setFieldErrors((prev) => ({ ...prev, [name]: null }))
  }

  const handleToggleAllergy = (val) => {
    setAllergies((prev) => prev.includes(val) ? prev.filter((i) => i !== val) : [...prev, val])
    setIsDirty(true)
  }

  const handleTogglePreference = (val) => {
    setDietaryPreferences((prev) => prev.includes(val) ? prev.filter((i) => i !== val) : [...prev, val])
    setIsDirty(true)
  }

  const handleAddAddress = (newAddr) => {
    setSavedAddresses((prev) => {
      const list = newAddr.isDefault ? prev.map((a) => ({ ...a, isDefault: false })) : [...prev]
      if (newAddr.isDefault) setFormData((f) => ({ ...f, defaultAddress: newAddr.fullAddress }))
      return [...list, newAddr]
    })
    setIsDirty(true)
  }

  const handleUpdateAddress = (addr) => {
    setSavedAddresses((prev) => prev.map((a) => a.addressId === addr.addressId ? addr : (addr.isDefault ? { ...a, isDefault: false } : a)))
    if (addr.isDefault) setFormData((f) => ({ ...f, defaultAddress: addr.fullAddress }))
    setIsDirty(true)
  }

  const handleDeleteAddress = (id) => {
    setSavedAddresses((prev) => prev.filter((a) => a.addressId !== id))
    setIsDirty(true)
  }

  const handleSetDefaultAddress = (id) => {
    const target = savedAddresses.find((a) => a.addressId === id)
    if (!target) return
    setSavedAddresses((prev) => prev.map((a) => ({ ...a, isDefault: a.addressId === id })))
    setFormData((f) => ({ ...f, defaultAddress: target.fullAddress }))
    setIsDirty(true)
  }

  const handleSaveProfile = async () => {
    setAlertInfo(null); setFieldErrors({})
    const errs = {}
    if (!formData.fullName.trim()) errs.fullName = 'Họ và tên không được để trống'
    if (!formData.email.trim()) errs.email = 'Email không được để trống'
    if (!formData.phoneNumber.trim()) errs.phoneNumber = 'Số điện thoại không được để trống'
    if (Object.keys(errs).length > 0) {
      setFieldErrors(errs); setActiveTab('info')
      setAlertInfo({ type: 'error', message: 'Vui lòng kiểm tra lại các trường thông tin bắt buộc.' })
      return
    }

    setIsSaving(true)
    try {
      const payload = {
        fullName: formData.fullName.trim(), birthDate: formData.birthDate || null,
        phoneNumber: formData.phoneNumber.trim(), email: formData.email.trim(),
        defaultAddress: formData.defaultAddress.trim() || null, savedAddresses, allergies, dietaryPreferences,
      }
      const response = await updateProfileApi(payload)
      updateUserProfile(response.data?.data || response.data)
      setIsDirty(false)
      setAlertInfo({ type: 'success', message: 'Hồ sơ cá nhân và sở thích ẩm thực đã được lưu thành công!' })
    } catch (err) {
      const data = err.response?.data
      if (err.response?.status === 422 && data?.errors) {
        setFieldErrors(data.errors); setActiveTab('info')
        setAlertInfo({ type: 'error', message: data.message || 'Dữ liệu không hợp lệ.' })
      } else {
        setAlertInfo({ type: 'error', message: data?.message || 'Có lỗi xảy ra khi lưu hồ sơ.' })
      }
    } finally { setIsSaving(false) }
  }

  return (
    <div className="min-h-screen bg-surface-bg text-text-main flex flex-col">
      <HomeHeader />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div className="pb-4 border-b border-border-subtle">
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-text-main tracking-tight">Thông tin cá nhân</h1>
          <p className="text-xs text-text-muted mt-1">Quản lý tài khoản, các nguyên liệu dị ứng và sổ địa chỉ nhận hàng của bạn</p>
        </div>

        {alertInfo && <Alert type={alertInfo.type} message={alertInfo.message} onClose={() => setAlertInfo(null)} />}

        {loading ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-4">
            <div className="lg:col-span-4"><Skeleton className="h-96 w-full rounded-2xl" /></div>
            <div className="lg:col-span-8"><Skeleton className="h-96 w-full rounded-2xl" /></div>
          </div>
        ) : fetchError ? (
          <div className="p-12 text-center rounded-2xl border border-status-error/20 bg-status-error/5 space-y-3">
            <AlertTriangle className="w-8 h-8 text-status-error mx-auto" />
            <p className="text-xs text-status-error">{fetchError}</p>
            <Button variant="primary" size="sm" icon={RefreshCw} onClick={fetchProfile}>Thử lại</Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-4 sticky top-24">
              <ProfileOverviewCard
                formData={formData} activeTab={activeTab} onSelectTab={setActiveTab}
                allergiesCount={allergies.length} addressesCount={savedAddresses.length}
                reviewsCount={reviewsCount}
              />
            </div>

            <div className="lg:col-span-8 bg-surface-card p-6 sm:p-8 rounded-2xl border border-border-subtle shadow-sm space-y-6">
              {activeTab === 'info' && <ProfileInfoTab formData={formData} onChange={handleInfoChange} errors={fieldErrors} disabled={isSaving} />}
              {activeTab === 'allergies' && <AllergiesPreferencesTab allergies={allergies} dietaryPreferences={dietaryPreferences} onToggleAllergy={handleToggleAllergy} onTogglePreference={handleTogglePreference} disabled={isSaving} />}
              {activeTab === 'addresses' && <SavedAddressesTab addresses={savedAddresses} onAddAddress={handleAddAddress} onUpdateAddress={handleUpdateAddress} onDeleteAddress={handleDeleteAddress} onSetDefault={handleSetDefaultAddress} disabled={isSaving} />}
              {activeTab === 'reviews' && <MyReviewsTab onCountChange={setReviewsCount} />}

              {activeTab !== 'reviews' && (
                <div className="pt-5 border-t border-border-subtle flex flex-col sm:flex-row items-center justify-between gap-3">
                  <span className="text-xs text-text-muted">
                    {isDirty ? <span className="text-brand-primary font-medium animate-pulse">● Có thay đổi chưa lưu</span> : 'Tất cả thông tin đã được đồng bộ'}
                  </span>
                  <Button variant="primary" size="md" icon={Save} onClick={handleSaveProfile} loading={isSaving} disabled={!isDirty || isSaving} className={!isDirty ? 'opacity-50' : 'shadow-lg shadow-brand-primary/10'}>
                    Lưu thay đổi hồ sơ
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      <HomeFooter />
    </div>
  )
}
