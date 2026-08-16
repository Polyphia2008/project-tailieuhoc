<script setup lang="ts">
definePageMeta({ layout: 'dashboard', middleware: 'auth' })
useSeoMeta({ title: 'Hồ sơ cá nhân - MapDocs' })

const auth = useAuthStore()
const ui = useUiStore()
const { date } = useFormat()

const profile = reactive({
  name: '', phone: '', bio: '', avatar: '', bank_name: '', bank_number: ''
})
const pw = reactive({ old_password: '', new_password: '', confirm: '' })
const savingProfile = ref(false)
const savingPw = ref(false)

function fill() {
  const u: any = auth.user || {}
  profile.name = u.name || ''
  profile.phone = u.phone || ''
  profile.bio = u.bio || ''
  profile.avatar = u.avatar || ''
  profile.bank_name = u.bank_name || ''
  profile.bank_number = u.bank_number || ''
}
onMounted(fill)
watch(() => auth.user, fill)

async function saveProfile() {
  if (profile.name.trim().length < 2) return ui.error('Họ tên phải có ít nhất 2 ký tự')
  savingProfile.value = true
  try {
    const res: any = await $fetch('/api/user/profile', { method: 'PUT', body: { ...profile } })
    auth.setUser(res.data)
    ui.success(res.message || 'Đã cập nhật hồ sơ')
  } catch (e: any) {
    ui.error(e?.data?.statusMessage || 'Không thể cập nhật hồ sơ')
  } finally { savingProfile.value = false }
}

async function changePassword() {
  if (!pw.old_password) return ui.error('Vui lòng nhập mật khẩu hiện tại')
  if (pw.new_password.length < 6) return ui.error('Mật khẩu mới phải từ 6 ký tự')
  if (pw.new_password !== pw.confirm) return ui.error('Xác nhận mật khẩu không khớp')
  savingPw.value = true
  try {
    const res: any = await $fetch('/api/user/profile', {
      method: 'PUT', body: { old_password: pw.old_password, new_password: pw.new_password }
    })
    auth.setUser(res.data)
    ui.success('Đã đổi mật khẩu thành công')
    pw.old_password = pw.new_password = pw.confirm = ''
  } catch (e: any) {
    ui.error(e?.data?.statusMessage || 'Không thể đổi mật khẩu')
  } finally { savingPw.value = false }
}

const roleLabel: Record<string, string> = { admin: 'Quản trị viên', seller: 'Người bán', user: 'Thành viên' }
</script>

<template>
  <section id="profile-page">
    <header class="mb-6">
      <h1 class="text-2xl font-extrabold text-slate-800"><AppIcon name="fa-user-gear" class="text-primary-900 mr-2" />Hồ sơ cá nhân</h1>
      <p class="text-slate-500 text-sm mt-1">Cập nhật thông tin cá nhân, tài khoản ngân hàng và mật khẩu đăng nhập.</p>
    </header>

    <div class="grid gap-6 lg:grid-cols-3">
      <div class="lg:col-span-2 space-y-6">
        <form class="card p-5 space-y-4" @submit.prevent="saveProfile">
          <h2 class="font-bold text-slate-800"><AppIcon name="fa-id-card" class="text-primary-900 mr-2" />Thông tin cá nhân</h2>

          <div class="grid sm:grid-cols-2 gap-4">
            <div>
              <label class="label" for="p-name">Họ và tên <span class="text-red-500">*</span></label>
              <input id="p-name" v-model="profile.name" type="text" class="input" maxlength="60" />
            </div>
            <div>
              <label class="label" for="p-phone">Số điện thoại</label>
              <input id="p-phone" v-model="profile.phone" type="tel" class="input" maxlength="20" placeholder="VD: 0912345678" />
            </div>
          </div>

          <div>
            <label class="label" for="p-email">Email</label>
            <input id="p-email" :value="auth.user?.email" type="email" class="input bg-slate-50" disabled />
            <p class="text-xs text-slate-500 mt-1">Email đăng nhập không thể thay đổi.</p>
          </div>

          <div>
            <label class="label" for="p-avatar">Ảnh đại diện (URL)</label>
            <input id="p-avatar" v-model="profile.avatar" type="url" class="input" placeholder="https://..." />
          </div>

          <div>
            <label class="label" for="p-bio">Giới thiệu bản thân</label>
            <textarea id="p-bio" v-model="profile.bio" rows="4" maxlength="500" class="input" placeholder="VD: Giáo viên Toán 10 năm kinh nghiệm..." />
            <p class="text-xs text-slate-400 text-right mt-1">{{ profile.bio.length }}/500</p>
          </div>

          <h3 class="font-bold text-slate-800 pt-2 border-t border-slate-100"><AppIcon name="fa-building-columns" class="text-accent-500 mr-2" />Tài khoản nhận tiền</h3>
          <div class="grid sm:grid-cols-2 gap-4">
            <div>
              <label class="label" for="p-bank">Ngân hàng</label>
              <input id="p-bank" v-model="profile.bank_name" type="text" class="input" placeholder="VD: Vietcombank" />
            </div>
            <div>
              <label class="label" for="p-banknum">Số tài khoản</label>
              <input id="p-banknum" v-model="profile.bank_number" type="text" class="input" placeholder="VD: 0123456789" />
            </div>
          </div>

          <div class="pt-2">
            <button type="submit" class="btn btn-primary" :disabled="savingProfile">
              <AppIcon :name="savingProfile ? 'fa-spinner fa-spin' : 'fa-floppy-disk'" class="mr-2" />Lưu thay đổi
            </button>
          </div>
        </form>

        <form class="card p-5 space-y-4" @submit.prevent="changePassword">
          <h2 class="font-bold text-slate-800"><AppIcon name="fa-lock" class="text-primary-900 mr-2" />Đổi mật khẩu</h2>
          <div>
            <label class="label" for="p-old">Mật khẩu hiện tại</label>
            <input id="p-old" v-model="pw.old_password" type="password" class="input" autocomplete="current-password" />
          </div>
          <div class="grid sm:grid-cols-2 gap-4">
            <div>
              <label class="label" for="p-new">Mật khẩu mới</label>
              <input id="p-new" v-model="pw.new_password" type="password" class="input" autocomplete="new-password" />
            </div>
            <div>
              <label class="label" for="p-confirm">Xác nhận mật khẩu mới</label>
              <input id="p-confirm" v-model="pw.confirm" type="password" class="input" autocomplete="new-password" />
            </div>
          </div>
          <p class="text-xs text-slate-500"><AppIcon name="fa-circle-info" class="mr-1" />Mật khẩu phải có ít nhất 6 ký tự.</p>
          <div>
            <button type="submit" class="btn btn-outline" :disabled="savingPw">
              <AppIcon :name="savingPw ? 'fa-spinner fa-spin' : 'fa-key'" class="mr-2" />Đổi mật khẩu
            </button>
          </div>
        </form>
      </div>

      <aside>
        <div class="card p-5 text-center lg:sticky lg:top-20">
          <div class="flex justify-center">
            <UiAvatar :name="auth.user?.name" :src="profile.avatar || auth.user?.avatar" :size="96" />
          </div>
          <h3 class="font-bold text-slate-800 mt-4">{{ auth.user?.name }}</h3>
          <p class="text-sm text-slate-500">{{ auth.user?.email }}</p>
          <span class="badge bg-primary-50 text-primary-900 mt-3 inline-block">{{ roleLabel[auth.user?.role || 'user'] }}</span>

          <dl class="mt-5 pt-5 border-t border-slate-100 space-y-3 text-sm text-left">
            <div class="flex justify-between"><dt class="text-slate-500">Ngày tham gia</dt><dd class="font-medium text-slate-700">{{ date(auth.user?.created_at) }}</dd></div>
            <div class="flex justify-between"><dt class="text-slate-500">Xác thực email</dt>
              <dd><span class="badge" :class="auth.user?.email_verified ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'">
                {{ auth.user?.email_verified ? 'Đã xác thực' : 'Chưa xác thực' }}</span></dd>
            </div>
            <div class="flex justify-between"><dt class="text-slate-500">Phương thức</dt>
              <dd class="font-medium text-slate-700">{{ auth.user?.provider === 'google' ? 'Google' : 'Email' }}</dd>
            </div>
          </dl>

          <button class="btn btn-danger btn-sm w-full mt-5" @click="auth.logout()">
            <AppIcon name="fa-right-from-bracket" class="mr-2" />Đăng xuất
          </button>
        </div>
      </aside>
    </div>
  </section>
</template>
