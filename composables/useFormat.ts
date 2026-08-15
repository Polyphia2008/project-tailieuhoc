export function useFormat() {
  const currency = (n?: number | null): string =>
    !n || n <= 0 ? 'Miễn phí' : new Intl.NumberFormat('vi-VN').format(n) + 'đ'
  const number = (n?: number | null): string => new Intl.NumberFormat('vi-VN').format(n || 0)
  const compact = (n?: number | null): string => {
    const v = n || 0
    if (v >= 1000000) return (v / 1000000).toFixed(1).replace('.0', '') + 'tr'
    if (v >= 1000) return (v / 1000).toFixed(1).replace('.0', '') + 'k'
    return String(v)
  }
  const fileSize = (bytes?: number | null): string => {
    const b = bytes || 0
    if (b >= 1048576) return (b / 1048576).toFixed(1) + ' MB'
    if (b >= 1024) return (b / 1024).toFixed(0) + ' KB'
    return b + ' B'
  }
  const date = (v?: string | Date | null): string =>
    !v ? '' : new Date(v).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })
  const dateTime = (v?: string | Date | null): string =>
    !v ? '' : new Date(v).toLocaleString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
  const timeAgo = (v?: string | Date | null): string => {
    if (!v) return ''
    const s = Math.floor((Date.now() - new Date(v).getTime()) / 1000)
    if (s < 60) return 'Vừa xong'
    if (s < 3600) return `${Math.floor(s / 60)} phút trước`
    if (s < 86400) return `${Math.floor(s / 3600)} giờ trước`
    if (s < 2592000) return `${Math.floor(s / 86400)} ngày trước`
    if (s < 31536000) return `${Math.floor(s / 2592000)} tháng trước`
    return `${Math.floor(s / 31536000)} năm trước`
  }
  return { currency, number, compact, fileSize, date, dateTime, timeAgo }
}
