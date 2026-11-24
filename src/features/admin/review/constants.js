/**
 * Cấu hình Kiểm duyệt Ngôn từ Đánh giá Món ăn (Moderation Constants)
 * Tham chiếu đặc tả: docs/modules/review.md (REV-06, REV-10, REV-11)
 */

export const MODERATION_SEVERITY_CONFIG = {
  HIGH: {
    label: 'Nghiêm trọng (HIGH)',
    shortLabel: 'HIGH — Tục tĩu nặng',
    badgeClass: 'bg-status-error/15 text-status-error border-status-error/30',
    boxClass: 'bg-status-error/5 border-status-error/30 text-status-error',
  },
  MEDIUM: {
    label: 'Trung bình (MEDIUM)',
    shortLabel: 'MEDIUM — Xúc phạm',
    badgeClass: 'bg-status-warning/15 text-status-warning border-status-warning/30',
    boxClass: 'bg-status-warning/5 border-status-warning/30 text-status-warning',
  },
  LOW: {
    label: 'Mức nhẹ (LOW)',
    shortLabel: 'LOW — Nghi vấn/Spam',
    badgeClass: 'bg-status-info/15 text-status-info border-status-info/30',
    boxClass: 'bg-status-info/5 border-status-info/30 text-status-info',
  },
  NONE: {
    label: 'Hợp lệ (NONE)',
    shortLabel: 'NONE',
    badgeClass: 'bg-status-success/10 text-status-success border-status-success/25',
    boxClass: 'bg-surface-bg border-border-subtle text-text-muted',
  },
}

export const MODERATION_CATEGORY_CONFIG = {
  PROFANITY: {
    code: 'PROFANITY',
    label: 'Tục tĩu / Chửi thề',
    badgeClass: 'bg-status-error/10 text-status-error border-status-error/25',
  },
  INSULT: {
    code: 'INSULT',
    label: 'Công kích / Xúc phạm',
    badgeClass: 'bg-status-warning/15 text-status-warning border-status-warning/30',
  },
  SPAM: {
    code: 'SPAM',
    label: 'Spam / Link quảng cáo',
    badgeClass: 'bg-status-info/15 text-status-info border-status-info/30',
  },
}

export const AUTO_HIDE_PRESETS = [
  {
    key: 'HIGH_MEDIUM',
    label: 'Mức Nghiêm trọng & Trung bình (HIGH + MEDIUM)',
    severities: ['HIGH', 'MEDIUM'],
  },
  {
    key: 'ALL',
    label: 'Tất cả bình luận vi phạm (HIGH + MEDIUM + LOW)',
    severities: ['HIGH', 'MEDIUM', 'LOW'],
  },
  {
    key: 'HIGH_ONLY',
    label: 'Chỉ mức Nghiêm trọng (HIGH)',
    severities: ['HIGH'],
  },
]
