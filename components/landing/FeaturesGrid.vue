<script setup lang="ts">
const FEATURES = [
  { icon: 'solar:gift-bold-duotone', title: 'Chia sẻ miễn phí', desc: 'Hàng nghìn tài liệu miễn phí, tải về không giới hạn và không cần trả phí.', tone: 'from-emerald-500 to-emerald-700' },
  { icon: 'solar:shield-check-bold-duotone', title: 'Mua bán an toàn', desc: 'Thanh toán qua VNPay hoặc ví MapDocs, hoàn tiền nếu tài liệu không đúng mô tả.', tone: 'from-primary-500 to-primary-700' },
  { icon: 'solar:hand-money-bold-duotone', title: 'Đăng bán nhận 85%', desc: 'Ai cũng có thể đăng bán. Bạn giữ 85% doanh thu, rút tiền về ngân hàng dễ dàng.', tone: 'from-accent-400 to-accent-600' }
]
</script>

<template>
  <section class="bg-slate-50 py-16 lg:py-20">
    <div class="container-x">
      <div class="max-w-[620px]">
        <p class="text-[12px] font-bold text-primary-600 uppercase tracking-wider">Vì sao chọn MapDocs</p>
        <h2 class="mt-2.5 text-[28px] sm:text-[36px] font-extrabold text-slate-900 font-ui tracking-tight leading-tight">
          Nền tảng tài liệu học tập minh bạch
        </h2>
        <p class="mt-3 text-[15px] text-slate-500 leading-relaxed">
          Mọi tài liệu đều được kiểm duyệt trước khi hiển thị. Người bán và người mua đều được bảo vệ.
        </p>
      </div>

      <div class="mt-10 grid gap-5 md:grid-cols-3">
        <div
          v-for="(f, i) in FEATURES"
          :key="f.title"
          class="card p-6 hover:shadow-lift transition-shadow"
          v-motion
          :initial="{ opacity: 0, y: 18 }"
          :visible-once="{ opacity: 1, y: 0, transition: { delay: i * 110, duration: 460 } }"
        >
          <span class="w-12 h-12 rounded-xl grid place-items-center text-white bg-gradient-to-br" :class="f.tone">
            <AppIcon :name="f.icon" size="24" />
          </span>
          <h3 class="mt-4 text-[16.5px] font-bold text-slate-900 font-ui">{{ f.title }}</h3>
          <p class="mt-2 text-[13.5px] text-slate-500 leading-relaxed">{{ f.desc }}</p>
        </div>
      </div>
    </div>
  </section>
</template>
