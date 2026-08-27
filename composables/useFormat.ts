export function useFormat() {
  function money(v: any, suffix = 'đ'): string {
    const n = Number(v || 0)
    return n.toLocaleString('vi-VN') + suffix
  }

  function moneyShort(v: any): string {
    const n = Math.abs(Number(v || 0))
    const sign = Number(v || 0) < 0 ? '-' : ''
    if (n >= 1e9) return `${sign}${(n / 1e9).toFixed(n >= 1e10 ? 0 : 1)}B`
    if (n >= 1e6) return `${sign}${(n / 1e6).toFixed(n >= 1e7 ? 0 : 1)}M`
    if (n >= 1e3) return `${sign}${(n / 1e3).toFixed(n >= 1e4 ? 0 : 1)}K`
    return `${sign}${n}`
  }

  function price(v: any, isFree?: boolean): string {
    if (isFree || Number(v || 0) === 0) return 'Miễn phí'
    return money(v)
  }

  function num(v: any): string {
    return Number(v || 0).toLocaleString('vi-VN')
  }

  function compact(v: any): string {
    const n = Number(v || 0)
    if (n >= 1e6) return `${(n / 1e6).toFixed(1)}M`
    if (n >= 1e3) return `${(n / 1e3).toFixed(1)}K`
    return String(n)
  }

  function size(bytes: any): string {
    const b = Number(bytes || 0)
    if (b >= 1073741824) return `${(b / 1073741824).toFixed(1)} GB`
    if (b >= 1048576) return `${(b / 1048576).toFixed(1)} MB`
    if (b >= 1024) return `${(b / 1024).toFixed(0)} KB`
    return `${b} B`
  }

  function date(v: any, opts: Intl.DateTimeFormatOptions = {}): string {
    if (!v) return '—'
    const d = new Date(v)
    if (Number.isNaN(d.getTime())) return '—'
    return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', ...opts })
  }

  function dateTime(v: any): string {
    if (!v) return '—'
    const d = new Date(v)
    if (Number.isNaN(d.getTime())) return '—'
    return d.toLocaleString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
  }

  function dayMonth(v: any): string {
    if (!v) return ''
    const d = new Date(v)
    return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}`
  }

  function ago(v: any): string {
    if (!v) return '—'
    const diff = Date.now() - new Date(v).getTime()
    const m = Math.floor(diff / 60000)
    if (m < 1) return 'vừa xong'
    if (m < 60) return `${m} phút trước`
    const h = Math.floor(m / 60)
    if (h < 24) return `${h} giờ trước`
    const d = Math.floor(h / 24)
    if (d < 30) return `${d} ngày trước`
    const mo = Math.floor(d / 30)
    if (mo < 12) return `${mo} tháng trước`
    return `${Math.floor(mo / 12)} năm trước`
  }

  function percent(v: any, digits = 0): string {
    return `${(Number(v || 0) * 100).toFixed(digits)}%`
  }

  function initials(name: any): string {
    const parts = String(name || '?').trim().split(/\s+/)
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
  }

  function truncate(s: any, n = 80): string {
    const str = String(s || '')
    return str.length > n ? str.slice(0, n).trimEnd() + '…' : str
  }

  return { money, moneyShort, price, num, compact, size, date, dateTime, dayMonth, ago, percent, initials, truncate }
}
