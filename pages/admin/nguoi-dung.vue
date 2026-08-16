<script setup lang="ts">
definePageMeta({ layout: 'admin', middleware: 'admin' })
useSeoMeta({ title: 'Quản lý người dùng - MapDocs' })

const ui = useUiStore()
const auth = useAuthStore()
const { currency, date } = useFormat()

const role = ref('all')
const q = ref('')
const page = ref(1)

const { data, pending, refresh } = await useAsyncData('admin-users',
  () => $fetch<any>('/api/admin/users', { query: { role: role.value, q: q.value, page: page.value, limit: 15 } }),
  { watch: [role, page] })

watch(role, () => (page.value = 1))
let t: any
watch(q, () => { clearTimeout(t); t = setTimeout(() => { page.value = 1; refresh() }, 400) })

const tabs = [
  { key: 'all', label: 'Tất cả' }, { key: 'admin', label: 'Quản trị' },
  { key: 'seller', label: 'Người bán' }, { key: 'user', label: 'Thành viên' }
]
const roleMeta: Record<string, { label: string; cls: string }> = {
  admin: { label: 'Quản trị viên', cls: 'bg-accent-50 text-accent-600' },
  seller: { label: 'Người bán', cls: 'bg-primary-50 text-primary-900' },
  user: { label: 'Thành viên', cls: 'bg-slate-100 text-slate-600' }
}

const busy = ref(false)
async function act(id: string, action: string, roleVal?: string) {
  busy.value = true
  try {
    const res: any = await $fetch('/api/admin/users', { method: 'POST', body: { id, action, role: roleVal } })
    ui.success(res.message)
    refresh()
  } catch (e: any) {
    ui.error(e?.data?.statusMessage || 'Thao tác thất bại')
  } finally { busy.value = false }
}

const roleOpen = ref(false)
const target = ref<any>(null)
const newRole = ref('user')
function askRole(u: any) { target.value = u; newRole.value = u.role; roleOpen.value = true }
async function confirmRole() { await act(target.value.id, 'role', newRole.value); roleOpen.value = false }

const delOpen = ref(false)
function askDelete(u: any) { target.value = u; delOpen.value = true }
async function confirmDelete() { await act(target.value.id, 'delete'); delOpen.value = false }
</script>

<template>
  <section id="admin-users">
    <header class="mb-6">
      <h1 class="text-2xl font-extrabold text-slate-800"><AppIcon name="fa-users" class="text-primary-900 mr-2" />Quản lý người dùng</h1>
      <p class="text-slate-500 text-sm mt-1">Khoá tài khoản, đổi vai trò hoặc xoá người dùng khỏi hệ thống.</p>
    </header>

    <div class="card p-4 mb-5 space-y-3">
      <div class="flex flex-wrap gap-2">
        <button v-for="tb in tabs" :key="tb.key" class="tab" :class="role === tb.key ? 'tab-on' : ''" @click="role = tb.key">{{ tb.label }}</button>
      </div>
      <div class="relative">
        <AppIcon name="fa-magnifying-glass" class="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
        <input v-model="q" type="search" class="input pl-10" placeholder="Tìm theo tên hoặc email..." />
      </div>
    </div>

    <UiSpinner v-if="pending" :size="34" label="Đang tải người dùng..." />

    <template v-else-if="data?.data">
      <UiEmpty v-if="!data.data.items.length" icon="fa-user-slash" title="Không tìm thấy người dùng" desc="Thử đổi bộ lọc hoặc từ khoá tìm kiếm." />

      <div v-else class="card overflow-x-auto">
        <table class="w-full text-sm min-w-[760px]">
          <thead><tr class="text-left border-b border-slate-100 bg-slate-50/60">
            <th class="table-th">Người dùng</th><th class="table-th">Vai trò</th><th class="table-th">Số dư</th>
            <th class="table-th">Ngày tham gia</th><th class="table-th">Trạng thái</th><th class="table-th text-right">Thao tác</th>
          </tr></thead>
          <tbody>
            <tr v-for="u in data.data.items" :key="u.id" class="border-b border-slate-50 hover:bg-slate-50/60">
              <td class="table-td">
                <div class="flex items-center gap-3">
                  <UiAvatar :name="u.name" :src="u.avatar" :size="36" />
                  <div class="min-w-0">
                    <p class="font-medium text-slate-800 line-clamp-1">{{ u.name }}</p>
                    <p class="text-xs text-slate-400 line-clamp-1">{{ u.email }}</p>
                  </div>
                </div>
              </td>
              <td class="table-td"><span class="badge" :class="roleMeta[u.role]?.cls">{{ roleMeta[u.role]?.label }}</span></td>
              <td class="table-td font-semibold text-primary-900">{{ currency(u.balance) }}</td>
              <td class="table-td text-slate-500">{{ date(u.created_at) }}</td>
              <td class="table-td">
                <span class="badge" :class="u.blocked ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-700'">
                  {{ u.blocked ? 'Đã khoá' : 'Hoạt động' }}
                </span>
              </td>
              <td class="table-td">
                <div class="flex items-center justify-end gap-1.5">
                  <button class="act" :class="u.blocked ? '!text-green-600 !border-green-300' : 'hover:!text-amber-600 hover:!border-amber-300'"
                    :title="u.blocked ? 'Mở khoá' : 'Khoá'" :disabled="busy || u.id === auth.user?.id" @click="act(u.id, 'block')">
                    <AppIcon :name="u.blocked ? 'fa-lock-open' : 'fa-lock'" />
                  </button>
                  <button class="act" title="Đổi vai trò" :disabled="busy || u.id === auth.user?.id" @click="askRole(u)"><AppIcon name="fa-user-shield" /></button>
                  <button class="act hover:!text-red-600 hover:!border-red-300" title="Xoá" :disabled="busy || u.id === auth.user?.id" @click="askDelete(u)"><AppIcon name="fa-trash" /></button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <UiPagination :page="page" :total-pages="data.data.totalPages" @change="(p:number) => (page = p)" />
    </template>

    <UiModal v-model="roleOpen" title="Đổi vai trò người dùng" width="max-w-md">
      <p class="text-sm text-slate-600 mb-4">Người dùng: <strong class="text-slate-800">{{ target?.name }}</strong></p>
      <div class="space-y-2">
        <label v-for="r in ['user', 'seller', 'admin']" :key="r" class="ropt" :class="newRole === r ? 'ropt-on' : ''">
          <input v-model="newRole" type="radio" :value="r" class="mt-1" />
          <span>
            <span class="block font-semibold text-slate-800">{{ roleMeta[r].label }}</span>
            <span class="text-xs text-slate-500">
              {{ r === 'user' ? 'Chỉ mua và tải tài liệu' : r === 'seller' ? 'Được đăng bán tài liệu' : 'Toàn quyền quản trị hệ thống' }}
            </span>
          </span>
        </label>
      </div>
      <template #footer>
        <button class="btn btn-outline btn-sm" @click="roleOpen = false">Huỷ</button>
        <button class="btn btn-primary btn-sm" :disabled="busy" @click="confirmRole">Cập nhật</button>
      </template>
    </UiModal>

    <UiModal v-model="delOpen" title="Xác nhận xoá người dùng" width="max-w-md">
      <p class="text-sm text-slate-600">Xoá vĩnh viễn tài khoản <strong class="text-slate-800">{{ target?.name }}</strong> ({{ target?.email }})? Hành động này không thể hoàn tác.</p>
      <template #footer>
        <button class="btn btn-outline btn-sm" @click="delOpen = false">Huỷ</button>
        <button class="btn btn-danger btn-sm" :disabled="busy" @click="confirmDelete">Xoá</button>
      </template>
    </UiModal>
  </section>
</template>

<style scoped>
.tab { @apply px-4 py-2 rounded-full text-sm font-medium border border-slate-200 bg-white text-slate-600 hover:border-primary-900 hover:text-primary-900 transition; }
.tab-on { @apply bg-primary-900 border-primary-900 text-white hover:text-white; }
.act { @apply w-8 h-8 rounded-lg border border-slate-200 text-slate-500 hover:text-primary-900 hover:border-primary-900 transition grid place-items-center disabled:opacity-30 disabled:cursor-not-allowed; }
.ropt { @apply flex gap-3 p-3 rounded-xl border border-slate-200 cursor-pointer hover:border-primary-900 transition; }
.ropt-on { @apply border-primary-900 bg-primary-50/60; }
</style>
