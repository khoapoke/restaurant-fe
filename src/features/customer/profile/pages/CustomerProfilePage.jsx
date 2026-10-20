import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  User,
  ShieldAlert,
  MapPin,
  Save,
  RefreshCw,
  AlertTriangle,
} from 'lucide-react'
import { useAuth } from '../../../../contexts/AuthContext'
import { getProfileApi, updateProfileApi } from '../services/profileService'
import ProfileInfoTab from '../components/ProfileInfoTab'
import AllergiesPreferencesTab from '../components/AllergiesPreferencesTab'
import SavedAddressesTab from '../components/SavedAddressesTab'
import Button from '../../../../components/ui/Button'
import Alert from '../../../../components/ui/Alert'
import Skeleton from '../../../../components/ui/Skeleton'
import MocSiteHeader from '../../../../components/navigation/MocSiteHeader'
import MocFooter from '../../../../components/navigation/MocFooter'

export const CustomerProfilePage = () => {
  const navigate = useNavigate()
  const { isAuthenticated, role, updateUserProfile } = useAuth()

  // Điều hướng nếu chưa đăng nhập hoặc không phải CUSTOMER
  useEffect(() => {
    if (!isAuthenticated) navigate('/login')
    else if (role === 'ADMIN') navigate('/admin')
  }, [isAuthenticated, role, navigate])

  const [activeTab, setActiveTab] = useState('info') // 'info' | 'allergies' | 'addresses'
  const [loading, setLoading] = useState(true)
  const [fetchError, setFetchError] = useState(null)
  const [isSaving, setIsSaving] = useState(false)
  const [alertInfo, setAlertInfo] = useState(null) // { type: 'success' | 'error', message }
  const [fieldErrors, setFieldErrors] = useState({})

  // Form State
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    fullName: '',
    phoneNumber: '',
    birthDate: '',
    defaultAddress: '',
  })
  const [savedAddresses, setSavedAddresses] = useState([])
  const [allergies, setAllergies] = useState([])
  const [dietaryPreferences, setDietaryPreferences] = useState([])
  const [isDirty, setIsDirty] = useState(false)

  // Fetch dữ liệu hồ sơ
  const fetchProfile = useCallback(async () => {
    setLoading(true)
    setFetchError(null)
    try {
      const response = await getProfileApi()
      const data = response.data || {}
      setFormData({
        username: data.username || '',
        email: data.email || '',
        fullName: data.fullName || '',
        phoneNumber: data.phoneNumber || '',
        birthDate: data.birthDate || '',
        defaultAddress: data.defaultAddress || '',
      })
      setSavedAddresses(data.savedAddresses || [])
      setAllergies(data.allergies || [])
      setDietaryPreferences(data.dietaryPreferences || [])
      setIsDirty(false)
    } catch (err) {
      setFetchError(
        err.response?.data?.message || 'Không thể tải thông tin hồ sơ. Vui lòng thử lại sau.'
      )
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (isAuthenticated) fetchProfile()
  }, [isAuthenticated, fetchProfile])

  // Handlers cho Tab 1
  const handleInfoChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    setIsDirty(true)
    if (fieldErrors[name]) setFieldErrors((prev) => ({ ...prev, [name]: null }))
  }

  // Handlers cho Tab 2
  const handleToggleAllergy = (val) => {
    setAllergies((prev) =>
      prev.includes(val) ? prev.filter((item) => item !== val) : [...prev, val]
    )
    setIsDirty(true)
  }

  const handleTogglePreference = (val) => {
    setDietaryPreferences((prev) =>
      prev.includes(val) ? prev.filter((item) => item !== val) : [...prev, val]
    )
    setIsDirty(true)
  }

  // Handlers cho Tab 3
  const handleAddAddress = (newAddr) => {
    setSavedAddresses((prev) => {
      let list = [...prev]
      if (newAddr.isDefault) {
        list = list.map((a) => ({ ...a, isDefault: false }))
        setFormData((f) => ({ ...f, defaultAddress: newAddr.fullAddress }))
      }
      return [...list, newAddr]
    })
    setIsDirty(true)
  }

  const handleUpdateAddress = (updatedAddr) => {
    setSavedAddresses((prev) => {
      let list = prev.map((a) => (a.addressId === updatedAddr.addressId ? updatedAddr : a))
      if (updatedAddr.isDefault) {
        list = list.map((a) =>
          a.addressId === updatedAddr.addressId ? a : { ...a, isDefault: false }
        )
        setFormData((f) => ({ ...f, defaultAddress: updatedAddr.fullAddress }))
      }
      return list
    })
    setIsDirty(true)
  }

  const handleDeleteAddress = (addressId) => {
    setSavedAddresses((prev) => prev.filter((a) => a.addressId !== addressId))
    setIsDirty(true)
  }

  const handleSetDefaultAddress = (addressId) => {
    const target = savedAddresses.find((a) => a.addressId === addressId)
    if (!target) return
    setSavedAddresses((prev) =>
      prev.map((a) => ({ ...a, isDefault: a.addressId === addressId }))
    )
    setFormData((f) => ({ ...f, defaultAddress: target.fullAddress }))
    setIsDirty(true)
  }

  // Lưu toàn bộ hồ sơ
  const handleSaveProfile = async () => {
    setAlertInfo(null)
    setFieldErrors({})

    // Client validation nhanh
    const errs = {}
    if (!formData.fullName.trim()) errs.fullName = 'Họ và tên không được để trống'
    if (!formData.email.trim()) errs.email = 'Email không được để trống'
    if (!formData.phoneNumber.trim()) errs.phoneNumber = 'Số điện thoại không được để trống'

    if (Object.keys(errs).length > 0) {
      setFieldErrors(errs)
      setActiveTab('info')
      setAlertInfo({
        type: 'error',
        message: 'Vui lòng kiểm tra lại các trường thông tin cá nhân bắt buộc.',
      })
      return
    }

    setIsSaving(true)
    try {
      const payload = {
        fullName: formData.fullName.trim(),
        birthDate: formData.birthDate || null,
        phoneNumber: formData.phoneNumber.trim(),
        email: formData.email.trim(),
        defaultAddress: formData.defaultAddress.trim() || null,
        savedAddresses,
        allergies,
        dietaryPreferences,
      }

      const response = await updateProfileApi(payload)
      updateUserProfile(response.data)
      setIsDirty(false)
      setAlertInfo({
        type: 'success',
        message: 'Hồ sơ cá nhân và sở thích đã được cập nhật thành công!',
      })
    } catch (err) {
      const data = err.response?.data
      if (err.response?.status === 422 && data?.errors) {
        setFieldErrors(data.errors)
        setActiveTab('info')
        setAlertInfo({
          type: 'error',
          message: data.message || 'Dữ liệu không hợp lệ. Vui lòng kiểm tra lại.',
        })
      } else {
        setAlertInfo({
          type: 'error',
          message: data?.message || 'Có lỗi xảy ra khi lưu hồ sơ. Vui lòng thử lại.',
        })
      }
    } finally {
      setIsSaving(false)
    }
  }

  // UI STATE 1: LOADING
  if (loading) {
    return (
      <div className="moc-page-shell flex flex-col">
        <MocSiteHeader />
        <main className="flex-1 w-full max-w-5xl mx-auto p-6 sm:p-10 space-y-6">
          <Skeleton className="h-14 w-72" />
          <Skeleton className="h-12 w-full rounded-2xl" />
          <div className="space-y-4 p-8 bg-gray-900/40 rounded-2xl border border-gray-800">
            <Skeleton className="h-6 w-1/3" />
            <div className="grid grid-cols-2 gap-4">
              <Skeleton className="h-12" />
              <Skeleton className="h-12" />
              <Skeleton className="h-12" />
              <Skeleton className="h-12" />
            </div>
          </div>
        </main>
      </div>
    )
  }

  // UI STATE 2: ERROR
  if (fetchError) {
    return (
      <div className="moc-page-shell flex flex-col">
        <MocSiteHeader />
        <main className="flex-1 flex flex-col items-center justify-center p-6 text-center">
          <div className="w-14 h-14 rounded-full bg-red-500/10 border border-red-500/20 text-red-500 flex items-center justify-center mb-4">
            <AlertTriangle className="w-7 h-7" />
          </div>
          <h2 className="moc-serif text-3xl font-medium mb-2">Không thể tải hồ sơ</h2>
          <p className="text-sm text-[#766e68] max-w-md mb-6">{fetchError}</p>
          <Button variant="primary" size="md" icon={RefreshCw} onClick={fetchProfile}>Thử lại</Button>
        </main>
      </div>
    )
  }

  // UI STATE 4: SUCCESS / DATA VIEW
  return (
    <div className="moc-page-shell flex flex-col">
      <MocSiteHeader />

      <main className="flex-1 max-w-5xl mx-auto w-full px-5 sm:px-8 py-12 lg:py-16 space-y-8">
        <section className="flex flex-col md:flex-row md:items-end md:justify-between gap-5 border-b border-[var(--moc-line)] pb-8">
          <div>
            <span className="moc-eyebrow">KHÔNG GIAN CỦA BẠN</span>
            <h1 className="moc-section-title mt-4">Hồ sơ cá nhân.</h1>
            <p className="mt-3 text-sm text-[#766e68]">@{formData.username}</p>
          </div>
          <Button
            variant="primary"
            size="md"
            icon={Save}
            onClick={handleSaveProfile}
            isLoading={isSaving}
            disabled={!isDirty || isSaving}
            className={!isDirty ? 'opacity-50' : 'animate-pulse'}
          >
            Lưu toàn bộ hồ sơ
          </Button>
        </section>

        {alertInfo && (
          <Alert
            type={alertInfo.type}
            message={alertInfo.message}
            onClose={() => setAlertInfo(null)}
          />
        )}

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 p-1.5 bg-gray-900/80 border border-gray-800 rounded-2xl overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab('info')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer select-none shrink-0
              ${
                activeTab === 'info'
                  ? 'bg-amber-500 text-gray-950 shadow-md font-bold'
                  : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/50'
              }`}
          >
            <User className="w-4 h-4" />
            <span>Thông tin cá nhân</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('allergies')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer select-none shrink-0
              ${
                activeTab === 'allergies'
                  ? 'bg-amber-500 text-gray-950 shadow-md font-bold'
                  : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/50'
              }`}
          >
            <ShieldAlert className="w-4 h-4" />
            <span>Dị ứng & Dinh dưỡng</span>
            {allergies.length > 0 && (
              <span
                className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                  activeTab === 'allergies'
                    ? 'bg-gray-950 text-amber-400 font-bold'
                    : 'bg-amber-500/20 text-amber-400'
                }`}
              >
                {allergies.length}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('addresses')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer select-none shrink-0
              ${
                activeTab === 'addresses'
                  ? 'bg-amber-500 text-gray-950 shadow-md font-bold'
                  : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/50'
              }`}
          >
            <MapPin className="w-4 h-4" />
            <span>Sổ địa chỉ</span>
            {savedAddresses.length > 0 && (
              <span
                className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                  activeTab === 'addresses'
                    ? 'bg-gray-950 text-amber-400 font-bold'
                    : 'bg-gray-800 text-gray-300'
                }`}
              >
                {savedAddresses.length}
              </span>
            )}
          </button>
        </div>

        {/* Tab Content Card */}
        <div className="bg-gray-900/60 p-6 sm:p-8 rounded-2xl border border-gray-800/80 shadow-xl backdrop-blur-xl">
          {activeTab === 'info' && (
            <ProfileInfoTab
              formData={formData}
              onChange={handleInfoChange}
              errors={fieldErrors}
              disabled={isSaving}
            />
          )}

          {activeTab === 'allergies' && (
            <AllergiesPreferencesTab
              allergies={allergies}
              dietaryPreferences={dietaryPreferences}
              onToggleAllergy={handleToggleAllergy}
              onTogglePreference={handleTogglePreference}
              disabled={isSaving}
            />
          )}

          {activeTab === 'addresses' && (
            <SavedAddressesTab
              addresses={savedAddresses}
              onAddAddress={handleAddAddress}
              onUpdateAddress={handleUpdateAddress}
              onDeleteAddress={handleDeleteAddress}
              onSetDefault={handleSetDefaultAddress}
              disabled={isSaving}
            />
          )}
        </div>
      </main>

      <MocFooter />
    </div>
  )
}

export default CustomerProfilePage
