import type { Subject } from '~/types'

const SUBJECTS: Subject[] = [
  { key: 'toan', name: 'Toán học', icon: 'solar:calculator-bold-duotone', from: '#3b82f6', to: '#1d4ed8', text: '#93c5fd' },
  { key: 'ly', name: 'Vật lý', icon: 'solar:atom-bold-duotone', from: '#8b5cf6', to: '#6d28d9', text: '#c4b5fd' },
  { key: 'hoa', name: 'Hoá học', icon: 'solar:test-tube-bold-duotone', from: '#10b981', to: '#047857', text: '#6ee7b7' },
  { key: 'sinh', name: 'Sinh học', icon: 'solar:leaf-bold-duotone', from: '#22c55e', to: '#15803d', text: '#86efac' },
  { key: 'van', name: 'Ngữ văn', icon: 'solar:book-2-bold-duotone', from: '#f43f5e', to: '#be123c', text: '#fda4af' },
  { key: 'anh', name: 'Tiếng Anh', icon: 'solar:global-bold-duotone', from: '#f97316', to: '#c2410c', text: '#fdba74' },
  { key: 'su', name: 'Lịch sử', icon: 'solar:notebook-bold-duotone', from: '#d97706', to: '#92400e', text: '#fcd34d' },
  { key: 'dia', name: 'Địa lý', icon: 'solar:map-point-wave-bold-duotone', from: '#0ea5e9', to: '#0369a1', text: '#7dd3fc' }
]

const GRADES = [10, 11, 12]

const FILE_ICONS: Record<string, string> = {
  pdf: 'solar:file-text-bold-duotone',
  docx: 'solar:document-text-bold-duotone',
  pptx: 'solar:presentation-graph-bold-duotone',
  xlsx: 'solar:document-add-bold-duotone',
  image: 'solar:gallery-bold-duotone',
  zip: 'solar:folder-with-files-bold-duotone'
}

export function useSubjects() {
  function get(key: any): Subject {
    return SUBJECTS.find((s) => s.key === key) || { key: String(key || ''), name: String(key || 'Khác'), icon: 'solar:book-2-bold-duotone', from: '#64748b', to: '#334155', text: '#cbd5e1' }
  }

  function name(key: any): string {
    return get(key).name
  }

  function gradient(key: any): string {
    const s = get(key)
    return `linear-gradient(135deg, ${s.from}, ${s.to})`
  }

  function fileIcon(type: any): string {
    return FILE_ICONS[String(type || 'pdf')] || FILE_ICONS.pdf
  }

  function statusPill(status: any) {
    if (status === 'approved') return { cls: 'pill-green', label: 'Đã duyệt', icon: 'solar:check-circle-bold' }
    if (status === 'pending') return { cls: 'pill-amber', label: 'Chờ duyệt', icon: 'solar:clock-circle-bold' }
    if (status === 'rejected') return { cls: 'pill-red', label: 'Từ chối', icon: 'solar:close-circle-bold' }
    return { cls: 'pill-slate', label: String(status || '—'), icon: 'solar:info-circle-bold' }
  }

  function orderPill(status: any) {
    if (status === 'paid') return { cls: 'pill-green', label: 'Đã thanh toán' }
    if (status === 'pending') return { cls: 'pill-amber', label: 'Chờ thanh toán' }
    if (status === 'failed') return { cls: 'pill-red', label: 'Thất bại' }
    if (status === 'refunded') return { cls: 'pill-slate', label: 'Đã hoàn tiền' }
    return { cls: 'pill-slate', label: String(status || '—') }
  }

  function txLabel(type: any) {
    const map: Record<string, { label: string; icon: string; positive: boolean }> = {
      topup: { label: 'Nạp tiền', icon: 'solar:card-recive-bold-duotone', positive: true },
      sale: { label: 'Bán tài liệu', icon: 'solar:hand-money-bold-duotone', positive: true },
      purchase: { label: 'Mua tài liệu', icon: 'solar:cart-large-4-bold-duotone', positive: false },
      withdraw: { label: 'Rút tiền', icon: 'solar:card-send-bold-duotone', positive: false },
      commission: { label: 'Hoa hồng', icon: 'solar:sale-square-bold-duotone', positive: false }
    }
    return map[String(type)] || { label: String(type || '—'), icon: 'solar:wallet-bold-duotone', positive: true }
  }

  return { subjects: SUBJECTS, grades: GRADES, get, name, gradient, fileIcon, statusPill, orderPill, txLabel }
}
