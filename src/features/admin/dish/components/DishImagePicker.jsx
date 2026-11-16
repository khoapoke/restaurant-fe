import { useState, useRef } from 'react'
import { FolderOpen, Link as LinkIcon, Upload, Check, Image as ImageIcon } from 'lucide-react'
import {
  LOCAL_DISH_IMAGES,
  resolveDishImage,
  handleImageError,
} from '../../../../utils/imageUtils'

/**
 * Component chọn hình ảnh món ăn trực quan (2 Tab: Local/Mẫu & URL Online)
 * - 100% Centralized Design Tokens
 * - Độ dài < 170 dòng
 */
export const DishImagePicker = ({ value = '', onChange, dishName = '' }) => {
  const [activeTab, setActiveTab] = useState(() => {
    if (value && (value.startsWith('http://') || value.startsWith('https://'))) {
      return 'url'
    }
    return 'local'
  })
  const fileInputRef = useRef(null)

  const handleFileChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const fileName = file.name.trim()
    onChange(`/img/${fileName}`)
  }

  const isSelected = (imgFile) => {
    if (!value) return false
    return value.endsWith(imgFile) || value === imgFile
  }

  return (
    <div className="space-y-2.5 p-3.5 bg-surface-bg border border-border-subtle rounded-xl">
      {/* Tab Switcher Header */}
      <div className="flex items-center justify-between border-b border-border-subtle pb-2">
        <label className="text-xs font-semibold text-text-muted flex items-center gap-1.5">
          <ImageIcon className="w-3.5 h-3.5 text-brand-primary" />
          Hình ảnh món ăn
        </label>
        <div className="flex bg-surface-card p-0.5 rounded-lg border border-border-subtle">
          <button
            type="button"
            onClick={() => setActiveTab('local')}
            className={`px-2.5 py-1 text-[11px] font-medium rounded-md flex items-center gap-1.5 transition-colors cursor-pointer ${
              activeTab === 'local'
                ? 'bg-brand-primary text-surface-bg font-semibold shadow'
                : 'text-text-muted hover:text-text-main'
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
                ? 'bg-brand-primary text-surface-bg font-semibold shadow'
                : 'text-text-muted hover:text-text-main'
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
              className="px-3 py-1.5 bg-surface-card hover:bg-surface-card-hover border border-dashed border-brand-primary/50 hover:border-brand-primary text-brand-hover text-xs font-medium rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
            >
              <Upload className="w-3.5 h-3.5" />
              Chọn file từ máy tính...
            </button>
            <span className="text-[11px] text-text-muted truncate flex-1 font-mono">
              {value ? value : 'Chưa chọn file nào'}
            </span>
          </div>

          <div>
            <div className="text-[11px] text-text-muted mb-1.5 font-medium">
              Hoặc chọn nhanh 1 trong các ảnh mẫu sẵn có:
            </div>
            <div className="grid grid-cols-5 gap-2">
              {LOCAL_DISH_IMAGES.map((img) => {
                const selected = isSelected(img)
                return (
                  <button
                    key={img}
                    type="button"
                    onClick={() => onChange(img)}
                    className={`relative rounded-lg overflow-hidden border aspect-video group cursor-pointer transition-all ${
                      selected
                        ? 'border-brand-primary ring-2 ring-brand-primary/50'
                        : 'border-border-subtle hover:border-border-strong opacity-80 hover:opacity-100'
                    }`}
                  >
                    <img
                      src={img}
                      alt={img}
                      onError={handleImageError}
                      className="w-full h-full object-cover"
                    />
                    {selected && (
                      <div className="absolute inset-0 bg-brand-primary/30 flex items-center justify-center">
                        <Check className="w-4 h-4 text-white drop-shadow" />
                      </div>
                    )}
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Dán URL hình ảnh */}
      {activeTab === 'url' && (
        <div className="space-y-2 pt-0.5">
          <div className="flex gap-2">
            <input
              type="url"
              placeholder="https://example.com/hinh-anh-mon-an.jpg"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              className="flex-1 px-3 py-1.5 text-xs bg-surface-card border border-border-strong rounded-lg text-text-main placeholder-text-dim focus:outline-none focus:border-brand-primary font-mono"
            />
            {value && (
              <button
                type="button"
                onClick={() => onChange('')}
                className="px-2 py-1 text-xs text-text-muted hover:text-status-error cursor-pointer"
              >
                Xóa URL
              </button>
            )}
          </div>
          <p className="text-[11px] text-text-dim">
            Hỗ trợ link ảnh trực tiếp từ Unsplash, Imgur, Cloudinary...
          </p>
        </div>
      )}

      {/* Preview ảnh hiện tại */}
      {value && (
        <div className="flex items-center gap-3 pt-2 border-t border-border-subtle">
          <span className="text-[11px] text-text-muted">Ảnh đang chọn:</span>
          <img
            src={resolveDishImage(value, { dishName })}
            alt="Preview"
            onError={handleImageError}
            className="w-12 h-12 rounded-lg object-cover border border-border-strong shadow"
          />
        </div>
      )}
    </div>
  )
}

export default DishImagePicker
