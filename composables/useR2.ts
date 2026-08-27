export function useR2() {
  function fileUrl(key: any): string {
    const k = String(key || '')
    if (!k) return ''
    if (/^https?:\/\//.test(k)) return k
    return `/api/files/${encodeURIComponent(k)}`
  }

  async function download(documentId: string) {
    const res = await $fetch<{ ok: boolean; url: string; filename: string; storage: string }>(
      `/api/documents/${documentId}/download`,
      { method: 'POST' }
    )
    return res
  }

  function triggerDownload(url: string, filename: string) {
    if (import.meta.server) return
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.rel = 'noopener'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }

  return { fileUrl, download, triggerDownload }
}
