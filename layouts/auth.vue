<template>
  <div class="min-h-screen grid lg:grid-cols-2 bg-slate-50">
    <aside class="hidden lg:flex flex-col justify-between bg-gradient-to-br from-primary-900 via-primary-800 to-primary-950 text-white p-12 relative overflow-hidden">
      <div class="absolute -right-20 -top-20 w-80 h-80 rounded-full bg-accent-500/20 blur-3xl" />
      <div class="absolute -left-16 bottom-0 w-72 h-72 rounded-full bg-white/10 blur-3xl" />
      <NuxtLink to="/" class="flex items-center gap-2 relative">
        <span class="w-10 h-10 rounded-xl bg-white text-primary-900 grid place-items-center font-black text-lg">M</span>
        <span class="font-extrabold text-xl">Map<span class="text-accent-500">Docs</span></span>
      </NuxtLink>
      <div class="relative">
        <h2 class="text-4xl font-extrabold leading-tight">Kho tài liệu học tập<br />chất lượng cao</h2>
        <p class="mt-4 text-white/80 leading-relaxed max-w-md">
          Hàng nghìn đề thi, chuyên đề, bài giảng từ giáo viên giỏi trên cả nước. Mua bán an toàn, tải về ngay lập tức.
        </p>
        <ul class="mt-8 space-y-3 text-white/90">
          <li class="flex gap-3"><i class="fa-solid fa-circle-check text-accent-500 mt-1" />Hơn 30.000 tài liệu 10 môn học</li>
          <li class="flex gap-3"><i class="fa-solid fa-circle-check text-accent-500 mt-1" />Thanh toán ví, VNPay, Momo an toàn</li>
          <li class="flex gap-3"><i class="fa-solid fa-circle-check text-accent-500 mt-1" />Đăng bán tài liệu, nhận 85% doanh thu</li>
        </ul>
      </div>
      <p class="relative text-sm text-white/60">© {{ new Date().getFullYear() }} MapDocs. Dự án demo phi thương mại.</p>
    </aside>
    <main class="flex items-center justify-center p-6 sm:p-10">
      <div class="w-full max-w-md">
        <NuxtLink to="/" class="lg:hidden flex items-center justify-center gap-2 mb-8">
          <span class="w-10 h-10 rounded-xl bg-primary-900 text-white grid place-items-center font-black">M</span>
          <span class="font-extrabold text-xl text-primary-900">Map<span class="text-accent-500">Docs</span></span>
        </NuxtLink>
        <slot />
      </div>
    </main>
  </div>
</template>
