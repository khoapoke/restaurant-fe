import { useState, useRef } from 'react'
import { FolderOpen, Link as LinkIcon, Upload, Check, Image as ImageIcon } from 'lucide-react'
import {
  LOCAL_DISH_IMAGES,
  resolveDishImage,
  handleImageError,
} from '../../../../utils/imageUtils'

/**
 * Component chọn hình ảnh món ăn trực quan (2 Tab: Local/Mẫu & URL Online)
 * Tuân thủ quy chuẩn UI & < 200 dòng.
 */
export const DishImagePicker = ({ value = '', onChange, dishName = '' }) => {
  const [activeTab, setActiveTab] = useState(() => {
    if (value && (value.startsWith('http://') || value.startsWith('https://'))) {
      return 'url'
    }
    return 'local'
  })
  const fileInputRef = useRef(null)

  // Xử lý khi user chọn file từ máy tính
  const handleFileChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Cắt lấy tên file và chuẩn hóa đường dẫn cục bộ /img/<file.name>
    const fileName = file.name.trim()
    const relativePath = `/img/${fileName}`
    onChange(relativePath)
  }

  const isSelected = (imgFile) => {
    if (!value) return false
    return value.endsWith(imgFile) || value === imgFile
  }

  return (
    <div className="space-y-2.5 p-3.5 bg-gray-950 border border-gray-800 rounded-xl">
      {/* Tab Switcher Header */}
      <div className="flex items-center justify-between border-b border-gray-800/80 pb-2">
        <label className="text-xs font-semibold text-gray-300 flex items-center gap-1.5">
          <ImageIcon className="w-3.5 h-3.5 text-amber-400" />
          Hình ảnh món ăn
        </label>
        <div className="flex bg-gray-900 p-0.5 rounded-lg border border-gray-800">
          <button
            type="button"
            onClick={() => setActiveTab('local')}
            className={`px-2.5 py-1 text-[11px] font-medium rounded-md flex items-center gap-1.5 transition-colors cursor-pointer ${
              activeTab === 'local'
                ? 'bg-amber-500 text-gray-950 font-semibold shadow'
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            <FolderOpen className="w-3 h-3" />
            Chọn từ máy / Mẫu
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('url')}
            className={`px-2.5 py-1 text-[11px] font-medium rounded-md flex items-center gap-1.5 transition-colors cursor-pointer ${
              activeTab === 'url'
                ? 'bg-amber-500 text-gray-950 font-semibold shadow'
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            <LinkIcon className="w-3 h-3" />
            Dán URL ngoài
          </button>
        </div>
      </div>

      {/* Tab 1: Chọn từ máy tính / Thư viện ảnh mẫu */}
      {activeTab === 'local' && (
        <div className="space-y-3 pt-0.5">
          <div className="flex items-center gap-2.5">
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-3 py-1.5 bg-gray-900 hover:bg-gray-850 border border-dashed border-amber-500/50 hover:border-amber-400 text-amber-300 text-xs font-medium rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
            >
              <Upload className="w-3.5 h-3.5" />
              Chọn file từ máy tính...
            </button>
            <span className="text-[11px] text-gray-400 truncate flex-1 font-mono">
              {value ? value : 'Chưa chọn file nào'}
            </span>
          </div>

          <div>
            <div className="text-[11px] text-gray-400 mb-1.5 font-medium">
              Hoặc bấm chọn nhanh 1 trong 9 ảnh mẫu sắc nét:
            </div>
            <div className="grid grid-cols-5 sm:grid-cols-9 gap-1.5">
              {LOCAL_DISH_IMAGES.map((img) => {
                const active = isSelected(img.file)
                return (
                  <button
                    key={img.file}
                    type="button"
                    title={img.keywords.join(', ')}
                    onClick={() => onChange(img.file)}
                    className={`relative aspect-square rounded-lg overflow-hidden border transition-all cursor-pointer group ${
                      active
                        ? 'border-amber-500 ring-2 ring-amber-500/80 scale-105 z-10'
                        : 'border-gray-800 hover:border-gray-600 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img
                      src={img.file}
                      alt={img.keywords[0]}
                      onError={(e) => handleImageError(e)}
                      className="w-full h-full object-cover"
                    />
                    {active && (
                      <div className="absolute inset-0 bg-amber-500/30 backdrop-blur-[0.5px] flex items-center justify-center">
                        <Check className="w-4 h-4 text-white drop-shadow-md stroke-[2.5]" />
                      </div>
                    )}
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Dán URL ngoài (Cloudinary, Unsplash, CDN...) */}
      {activeTab === 'url' && (
        <div className="space-y-1.5 pt-0.5">
          <input
            type="text"
            placeholder="Dán link ảnh online (vd: https://images.unsplash.com/...)"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            className="w-full px-3 py-2 text-xs bg-gray-900 border border-gray-800 rounded-xl text-gray-100 placeholder-gray-500 focus:outline-none focus:border-amber-500 transition-colors"
          />
          <p className="text-[10px] text-gray-500">
            Hỗ trợ URL ảnh từ Unsplash, Cloudinary, Imgur hoặc máy chủ CDN bất kỳ.
          </p>
        </div>
      )}

      {/* Preview ảnh hiện tại */}
      <div className="flex items-center gap-3 pt-2.5 border-t border-gray-900">
        <div className="w-12 h-12 rounded-lg border border-gray-800 overflow-hidden bg-gray-900 shrink-0">
          <img
            src={resolveDishImage(value, null, dishName)}
            alt="Preview"
            onError={(e) => handleImageError(e)}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="flex-1 min-w-0 text-[11px]">
          <div className="text-gray-300 font-medium truncate">
            {value ? `Đã chọn: ${value}` : 'Sử dụng ảnh mẫu tự động theo tên món'}
          </div>
          <div className="text-gray-500 text-[10px]">
            Đường dẫn này sẽ được lưu vào CSDL và áp dụng đồng bộ trên toàn hệ thống.
          </div>
        </div>
      </div>
    </div>
  )
}

export default DishImagePicker

