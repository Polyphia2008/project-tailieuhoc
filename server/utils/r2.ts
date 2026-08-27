export interface R2Config {
  accountId: string
  accessKeyId: string
  secretAccessKey: string
  bucketName: string
  publicUrl: string
}

export interface R2Object {
  key: string
  size: number
  contentType: string
  uploadedAt: string
  url: string
}

export interface R2Client {
  readonly kind: 'r2' | 'memory'
  put(key: string, body: ArrayBuffer | Uint8Array | string, contentType?: string): Promise<R2Object>
  get(key: string): Promise<{ body: Uint8Array; meta: R2Object } | null>
  head(key: string): Promise<R2Object | null>
  list(prefix?: string): Promise<R2Object[]>
  remove(key: string): Promise<void>
  publicUrl(key: string): string
  readJson<T = any>(key: string): Promise<T | null>
  writeJson(key: string, value: any): Promise<R2Object>
}

function readConfig(): R2Config {
  return {
    accountId: process.env.R2_ACCOUNT_ID || '',
    accessKeyId: process.env.R2_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || '',
    bucketName: process.env.R2_BUCKET_NAME || '',
    publicUrl: process.env.R2_PUBLIC_URL || ''
  }
}

export function r2Configured(): boolean {
  const c = readConfig()
  return Boolean(c.accountId && c.accessKeyId && c.secretAccessKey && c.bucketName)
}

const G = globalThis as any

interface MemEntry {
  body: Uint8Array
  meta: R2Object
}

function memStore(): Map<string, MemEntry> {
  if (!G.__mapdocs_r2) G.__mapdocs_r2 = new Map<string, MemEntry>()
  return G.__mapdocs_r2 as Map<string, MemEntry>
}

function toBytes(body: ArrayBuffer | Uint8Array | string): Uint8Array {
  if (typeof body === 'string') return new TextEncoder().encode(body)
  if (body instanceof Uint8Array) return body
  return new Uint8Array(body)
}

class MemoryR2 implements R2Client {
  readonly kind = 'memory' as const

  publicUrl(key: string): string {
    return `/api/files/${encodeURIComponent(key)}`
  }

  async put(key: string, body: ArrayBuffer | Uint8Array | string, contentType = 'application/octet-stream'): Promise<R2Object> {
    const bytes = toBytes(body)
    const meta: R2Object = {
      key,
      size: bytes.byteLength,
      contentType,
      uploadedAt: new Date().toISOString(),
      url: this.publicUrl(key)
    }
    memStore().set(key, { body: bytes, meta })
    return meta
  }

  async get(key: string) {
    const e = memStore().get(key)
    return e ? { body: e.body, meta: e.meta } : null
  }

  async head(key: string) {
    return memStore().get(key)?.meta ?? null
  }

  async list(prefix = ''): Promise<R2Object[]> {
    const out: R2Object[] = []
    for (const [k, v] of memStore()) if (k.startsWith(prefix)) out.push(v.meta)
    return out.sort((a, b) => a.key.localeCompare(b.key))
  }

  async remove(key: string): Promise<void> {
    memStore().delete(key)
  }

  async readJson<T = any>(key: string): Promise<T | null> {
    const e = await this.get(key)
    if (!e) return null
    try {
      return JSON.parse(new TextDecoder().decode(e.body)) as T
    } catch {
      return null
    }
  }

  async writeJson(key: string, value: any): Promise<R2Object> {
    return this.put(key, JSON.stringify(value), 'application/json')
  }
}

async function hmac(key: ArrayBuffer | Uint8Array, msg: string): Promise<ArrayBuffer> {
  const k = await crypto.subtle.importKey('raw', key as any, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'])
  return crypto.subtle.sign('HMAC', k, new TextEncoder().encode(msg))
}

async function sha256Hex(data: string | Uint8Array): Promise<string> {
  const bytes = typeof data === 'string' ? new TextEncoder().encode(data) : data
  const buf = await crypto.subtle.digest('SHA-256', bytes as any)
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('')
}

function hex(buf: ArrayBuffer): string {
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('')
}

class RealR2 implements R2Client {
  readonly kind = 'r2' as const
  private cfg: R2Config

  constructor(cfg: R2Config) {
    this.cfg = cfg
  }

  private endpoint(key: string): string {
    return `https://${this.cfg.accountId}.r2.cloudflarestorage.com/${this.cfg.bucketName}/${key.split('/').map(encodeURIComponent).join('/')}`
  }

  publicUrl(key: string): string {
    if (this.cfg.publicUrl) return `${this.cfg.publicUrl.replace(/\/$/, '')}/${key}`
    return this.endpoint(key)
  }

  private async sign(method: string, key: string, payload: Uint8Array | string, contentType?: string): Promise<Record<string, string>> {
    const url = new URL(this.endpoint(key))
    const now = new Date()
    const amzDate = now.toISOString().replace(/[:-]|\.\d{3}/g, '')
    const dateStamp = amzDate.slice(0, 8)
    const region = 'auto'
    const service = 's3'
    const payloadHash = await sha256Hex(payload)

    const headers: Record<string, string> = {
      host: url.host,
      'x-amz-content-sha256': payloadHash,
      'x-amz-date': amzDate
    }
    if (contentType) headers['content-type'] = contentType

    const sortedKeys = Object.keys(headers).sort()
    const canonicalHeaders = sortedKeys.map((h) => `${h}:${headers[h]}\n`).join('')
    const signedHeaders = sortedKeys.join(';')
    const canonicalRequest = [method, url.pathname, '', canonicalHeaders, signedHeaders, payloadHash].join('\n')

    const scope = `${dateStamp}/${region}/${service}/aws4_request`
    const stringToSign = ['AWS4-HMAC-SHA256', amzDate, scope, await sha256Hex(canonicalRequest)].join('\n')

    let k: ArrayBuffer | Uint8Array = new TextEncoder().encode(`AWS4${this.cfg.secretAccessKey}`)
    k = await hmac(k, dateStamp)
    k = await hmac(k, region)
    k = await hmac(k, service)
    k = await hmac(k, 'aws4_request')
    const signature = hex(await hmac(k, stringToSign))

    return {
      ...headers,
      Authorization: `AWS4-HMAC-SHA256 Credential=${this.cfg.accessKeyId}/${scope}, SignedHeaders=${signedHeaders}, Signature=${signature}`
    }
  }

  async put(key: string, body: ArrayBuffer | Uint8Array | string, contentType = 'application/octet-stream'): Promise<R2Object> {
    const bytes = toBytes(body)
    const headers = await this.sign('PUT', key, bytes, contentType)
    const res = await fetch(this.endpoint(key), { method: 'PUT', headers, body: bytes as any })
    if (!res.ok) throw new Error(`R2 put ${key} failed: ${res.status}`)
    return { key, size: bytes.byteLength, contentType, uploadedAt: new Date().toISOString(), url: this.publicUrl(key) }
  }

  async get(key: string) {
    const headers = await this.sign('GET', key, '')
    const res = await fetch(this.endpoint(key), { method: 'GET', headers })
    if (res.status === 404) return null
    if (!res.ok) throw new Error(`R2 get ${key} failed: ${res.status}`)
    const buf = new Uint8Array(await res.arrayBuffer())
    return {
      body: buf,
      meta: {
        key,
        size: buf.byteLength,
        contentType: res.headers.get('content-type') || 'application/octet-stream',
        uploadedAt: res.headers.get('last-modified') || new Date().toISOString(),
        url: this.publicUrl(key)
      }
    }
  }

  async head(key: string) {
    const headers = await this.sign('HEAD', key, '')
    const res = await fetch(this.endpoint(key), { method: 'HEAD', headers })
    if (!res.ok) return null
    return {
      key,
      size: Number(res.headers.get('content-length') || 0),
      contentType: res.headers.get('content-type') || 'application/octet-stream',
      uploadedAt: res.headers.get('last-modified') || new Date().toISOString(),
      url: this.publicUrl(key)
    }
  }

  async list(prefix = ''): Promise<R2Object[]> {
    const meta = prefix ? await this.head(prefix) : null
    return meta ? [meta] : []
  }

  async remove(key: string): Promise<void> {
    const headers = await this.sign('DELETE', key, '')
    await fetch(this.endpoint(key), { method: 'DELETE', headers })
  }

  async readJson<T = any>(key: string): Promise<T | null> {
    const e = await this.get(key)
    if (!e) return null
    try {
      return JSON.parse(new TextDecoder().decode(e.body)) as T
    } catch {
      return null
    }
  }

  async writeJson(key: string, value: any): Promise<R2Object> {
    return this.put(key, JSON.stringify(value), 'application/json')
  }
}

export function useR2(): R2Client {
  if (!G.__mapdocs_r2_client) {
    G.__mapdocs_r2_client = r2Configured() ? new RealR2(readConfig()) : new MemoryR2()
  }
  return G.__mapdocs_r2_client as R2Client
}

export function r2Status() {
  const c = readConfig()
  return {
    configured: r2Configured(),
    kind: useR2().kind,
    bucket: c.bucketName || null,
    accountId: c.accountId ? `${c.accountId.slice(0, 6)}...` : null
  }
}
