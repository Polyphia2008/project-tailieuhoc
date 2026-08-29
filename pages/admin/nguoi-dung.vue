<script setup lang="ts">
import { toast } from 'vue-sonner'

definePageMeta({ layout: 'admin', middleware: 'admin' })

const { money, num, date } = useFormat()

const page = ref(1)
const q = ref('')
const filter = ref('all')

const query = computed(() => {
  const base: Record<string, any> = { page: page.value, limit: 15, q: q.value || undefined }
  if (filter.value === 'blocked') base.blocked = true
  else if (filter.value !== 'all') base.role = filter.value
  return base
})

const { data, pending, refresh } = await useFetch<any>('/api/admin/users', { query })

const counts = computed(() => data.value?.counts || {})
const rows = computed<any[]>(() => data.value?.items || [])

const TABS = [
  { key: 'all', label: 'Tất cả', c: 'all' },
  { key: 'admin', label: 'Quản trị', c: 'admin' },
  { key: 'seller', label: 'Người bán', c: 'seller' },
  { key: 'user', label: 'Thành viên', c: 'user' },
  { key: 'blocked', label: 'Đã khoá', c: 'blocked' }
]

const ROLES = [
  { key: 'admin', label: 'Quản trị viên', desc: 'Toàn quyền quản trị hệ thống', icon: 'solar:shield-user-bold-duotone' },
  { key: 'seller', label: 'Người bán', desc: 'Đăng bán tài liệu và nhận doanh thu', icon: 'solar:hand-money-bold-duotone' },
  { key: 'user', label: 'Thành viên', desc: 'Mua và tải tài liệu', icon: 'solar:user-circle-bold-duotone' }
]

const busy = ref(false)

function rolePill(role: string) {
  if (role === 'admin') return 'pill-red'
  if (role === 'seller') return 'pill-blue'
  return 'pill-slate'
}

function roleLabel(role: string) {
  return ROLES.find((r) => r.key === role)?.label || 'Thành viên'
}

async function act(action: string, ids: string[], extra: Record<string, any> = {}) {
  busy.value = true
  try {
    const r = await $fetch<any>('/api/admin/users', { method: 'POST', body: { action, ids, ...extra } })
    await refresh()
    toast.success(`Đã cập nhật ${r.affected ?? ids.length} người dùng`)
  } catch (e: any) {
    toast.error(e?.data?.statusMessage || 'Không thực hiện được hành động')
  } finally {
    busy.value = false
  }
}

const roleOpen = ref(false)
const target = ref<any>(null)
const newRole = ref('user')

function openRole(u: any) {
  target.value = u
  newRole.value = u.role || 'user'
  roleOpen.value = true
}

async function submitRole() {
  await act('role', [target.value.id], { role: newRole.value })
  roleOpen.value = false
}

const balOpen = ref(false)
const amount = ref(0)
const note = ref('')

function openBalance(u: any) {
  target.value = u
  amount.value = 0
  note.value = ''
  balOpen.value = true
}

async function submitBalance() {
  if (!amount.value) {
    toast.error('Vui lòng nhập số tiền khác 0')
    return
  }
  await act('balance', [target.value.id], { amount: amount.value, note: note.value || undefined })
  balOpen.value = false
}

const delOpen = ref(false)

function openDelete(u: any) {
  target.value = u
  delOpen.value = true
}

async function submitDelete() {
  await act('delete', [target.value.id])
  delOpen.value = false
}

watch(filter, () => {
  page.value = 1
})

useHead({ title: 'Người dùng - MapDocs Admin' })
</script>

<template>
  <div>
    <nav class="flex items-center gap-1.5 text-[12px] text-mdk-mute">
      <NuxtLink to="/admin" class="hover:text-mdk-sub">Admin</NuxtLink> / <span class="text-mdk-sub">Người dùng</span>
    </nav>
    <div class="mt-3 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 class="text-[22px] font-bold text-mdk-text font-ui tracking-tight">Quản lý người dùng</h1>
        <p class="mt-1 text-[13px] text-mdk-mute">
          {{ num(counts.all || 0) }} tài khoản · {{ num(counts.seller || 0) }} người bán · {{ num(counts.blocked || 0) }} đã khoá
        </p>
      </div>
      <button class="btn-outline btn-sm" :disabled="pending" @click="refresh()">
        <AppIcon name="solar:refresh-linear" size="15" /> Làm mới
      </button>
    </div>

    <div class="mt-5 tab-row no-scrollbar">
      <button v-for="t in TABS" :key="t.key" class="tab whitespace-nowrap" :class="filter === t.key ? 'tab-on' : ''" @click="filter = t.key">
        {{ t.label }} <span class="text-xs opacity-70">({{ counts[t.c] || 0 }})</span>
      </button>
    </div>

    <div class="mt-4 card overflow-hidden">
      <div class="px-4 py-3 border-b border-mdk-line">
        <div class="relative max-w-[300px]">
          <AppIcon name="solar:magnifer-linear" size="15" class="absolute left-3 top-1/2 -translate-y-1/2 text-mdk-mute" />
          <input v-model="q" type="search" placeholder="Tìm theo tên hoặc email..." class="input h-9 pl-9 text-[13px]" @keyup.enter="page = 1; refresh()" />
        </div>
      </div>

      <div class="overflow-x-auto">
        <table class="tbl">
          <thead>
            <tr>
              <th>Người dùng</th>
              <th>Email</th>
              <th>Vai trò</th>
              <th class="text-right">Số dư</th>
              <th>Trạng thái</th>
              <th class="text-right">Tài liệu</th>
              <th class="text-right">Đã mua</th>
              <th>Ngày tham gia</th>
              <th class="text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="u in rows" :key="u.id">
              <td>
                <div class="flex items-center gap-2.5">
                  <UiAvatar :name="u.name" :src="u.avatar" :size="32" />
                  <div class="min-w-0">
                    <p class="text-[13px] font-medium text-mdk-text truncate max-w-[160px]">{{ u.name }}</p>
                    <p class="text-[11.5px] text-mdk-mute">{{ u.phone || u.id }}</p>
                  </div>
                </div>
              </td>
              <td class="text-[12.5px] text-mdk-sub">{{ u.email }}</td>
              <td><span :class="rolePill(u.role)" class="text-[11px]">{{ roleLabel(u.role) }}</span></td>
              <td class="text-right text-[13px] text-mdk-text font-medium tabular-nums whitespace-nowrap">{{ money(u.balance || 0) }}</td>
              <td>
                <span :class="u.blocked ? 'pill-red' : 'pill-green'" class="text-[11px]">{{ u.blocked ? 'Đã khoá' : 'Hoạt động' }}</span>
              </td>
              <td class="text-right text-[13px] text-mdk-sub tabular-nums">{{ num(u.documents || 0) }}</td>
              <td class="text-right text-[13px] text-mdk-sub tabular-nums">{{ num(u.purchases || 0) }}</td>
              <td class="text-[12.5px] text-mdk-mute whitespace-nowrap">{{ date(u.created_at) }}</td>
              <td>
                <div class="flex items-center justify-end gap-1">
                  <button class="w-7 h-7 grid place-items-center rounded-md text-primary-400 hover:bg-primary-500/15" title="Đổi vai trò" :disabled="busy" @click="openRole(u)">
                    <AppIcon name="solar:shield-user-bold" size="16" />
                  </button>
                  <button class="w-7 h-7 grid place-items-center rounded-md text-emerald-400 hover:bg-emerald-500/15" title="Điều chỉnh số dư" :disabled="busy" @click="openBalance(u)">
                    <AppIcon name="solar:wallet-money-bold" size="16" />
                  </button>
                  <button
                    class="w-7 h-7 grid place-items-center rounded-md hover:bg-mdk-line"
                    :class="u.blocked ? 'text-emerald-400' : 'text-amber-400'"
                    :title="u.blocked ? 'Mở khoá' : 'Khoá tài khoản'"
                    :disabled="busy"
                    @click="act(u.blocked ? 'unblock' : 'block', [u.id])"
                  >
                    <AppIcon :name="u.blocked ? 'solar:lock-keyhole-unlocked-bold' : 'solar:lock-keyhole-bold'" size="16" />
                  </button>
                  <button class="w-7 h-7 grid place-items-center rounded-md text-red-400 hover:bg-red-500/15" title="Xoá" :disabled="busy" @click="openDelete(u)">
                    <AppIcon name="solar:trash-bin-trash-bold" size="16" />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <UiEmpty v-if="!pending && !rows.length" compact icon="solar:users-group-rounded-bold-duotone" title="Không có người dùng nào" description="Thử đổi bộ lọc hoặc từ khoá tìm kiếm khác." />
    </div>

    <div v-if="(data?.pages || 1) > 1" class="mt-6 flex items-center justify-center gap-2">
      <button class="btn-outline btn-sm" :disabled="page <= 1" @click="page--">Trước</button>
      <span class="text-[13px] text-mdk-sub px-2">{{ page }} / {{ data?.pages }}</span>
      <button class="btn-outline btn-sm" :disabled="page >= (data?.pages || 1)" @click="page++">Sau</button>
    </div>

    <UiDialog v-model="roleOpen" title="Đổi vai trò" :description="target ? `Cập nhật quyền hạn cho ${target.name}` : ''">
      <div class="space-y-2">
        <button
          v-for="r in ROLES"
          :key="r.key"
          class="w-full flex items-start gap-3 p-3 rounded-xl border text-left transition"
          :class="newRole === r.key ? 'border-primary-500 bg-primary-500/10' : 'border-mdk-line hover:border-mdk-line2'"
          @click="newRole = r.key"
        >
          <span class="w-9 h-9 shrink-0 rounded-lg grid place-items-center" :class="newRole === r.key ? 'bg-primary-600 text-white' : 'bg-mdk-line text-mdk-sub'">
            <AppIcon :name="r.icon" size="19" />
          </span>
          <span class="min-w-0">
            <span class="block text-[13.5px] font-semibold text-mdk-text">{{ r.label }}</span>
            <span class="block text-[12px] text-mdk-mute mt-0.5">{{ r.desc }}</span>
          </span>
          <AppIcon v-if="newRole === r.key" name="solar:check-circle-bold" size="18" class="ml-auto shrink-0 text-primary-400" />
        </button>
      </div>
      <template #footer>
        <button class="btn-ghost btn-sm" @click="roleOpen = false">Huỷ</button>
        <button class="btn-primary btn-sm" :disabled="busy" @click="submitRole">
          <UiSpinner v-if="busy" :size="14" /> Lưu vai trò
        </button>
      </template>
    </UiDialog>

    <UiDialog v-model="balOpen" title="Điều chỉnh số dư" :description="target ? `Số dư hiện tại: ${money(target.balance || 0)}` : ''" width="max-w-md">
      <div class="space-y-3">
        <div>
          <label class="label">Số tiền (âm để trừ)</label>
          <input v-model.number="amount" type="number" step="10000" class="input" placeholder="Ví dụ: 100000 hoặc -50000" />
        </div>
        <div>
          <label class="label">Ghi chú</label>
          <input v-model="note" class="input" placeholder="Lý do điều chỉnh..." />
        </div>
      </div>
      <template #footer>
        <button class="btn-ghost btn-sm" @click="balOpen = false">Huỷ</button>
        <button class="btn-primary btn-sm" :disabled="busy" @click="submitBalance">
          <UiSpinner v-if="busy" :size="14" /> Xác nhận
        </button>
      </template>
    </UiDialog>

    <UiDialog v-model="delOpen" title="Xoá người dùng" :description="target ? `Bạn sắp xoá tài khoản ${target.email}` : ''" width="max-w-md">
      <p class="text-[13px] text-mdk-sub leading-relaxed">Hành động này không thể hoàn tác. Tài liệu và đơn hàng liên quan vẫn được giữ trong hệ thống.</p>
      <template #footer>
        <button class="btn-ghost btn-sm" @click="delOpen = false">Huỷ</button>
        <button class="btn-danger btn-sm" :disabled="busy" @click="submitDelete">
          <UiSpinner v-if="busy" :size="14" /> Xoá vĩnh viễn
        </button>
      </template>
    </UiDialog>
  </div>
</template>
