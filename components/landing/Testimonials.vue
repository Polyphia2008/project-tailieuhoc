<script setup lang="ts">
const ITEMS = [
  { name: 'Nguyễn Minh Hoàng', role: 'Giáo viên Toán', text: 'Mình đăng bán bộ đề thi thử và thu về hơn 15 triệu trong 3 tháng. Nền tảng minh bạch, rút tiền nhanh.', rating: 5 },
  { name: 'Lê Thu Hà', role: 'Học sinh lớp 12', text: 'Tài liệu chất lượng hơn hẳn những gì mình tải trên mạng. Lời giải chi tiết giúp mình tự học rất hiệu quả.', rating: 5 },
  { name: 'Vũ Thị Kim Ngân', role: 'Giáo viên Ngữ văn', text: 'Bộ NLXH của mình được hơn 300 học sinh mua. Cảm ơn MapDocs đã tạo kênh phân phối tốt cho giáo viên.', rating: 5 }
]
</script>

<template>
  <section class="bg-white py-16 lg:py-20 border-t border-slate-200">
    <div class="container-x">
      <div class="text-center max-w-[560px] mx-auto">
        <p class="text-[12px] font-bold text-accent-600 uppercase tracking-wider">Cộng đồng nói gì</p>
        <h2 class="mt-2.5 text-[28px] sm:text-[36px] font-extrabold text-slate-900 font-ui tracking-tight leading-tight">
          Được tin dùng bởi giáo viên và học sinh
        </h2>
      </div>

      <div class="mt-10 grid gap-5 md:grid-cols-3">
        <div
          v-for="(t, i) in ITEMS"
          :key="t.name"
          class="card p-6 flex flex-col"
          v-motion
          :initial="{ opacity: 0, y: 18 }"
          :visible-once="{ opacity: 1, y: 0, transition: { delay: i * 110, duration: 460 } }"
        >
          <UiRating :value="t.rating" :size="15" />
          <p class="mt-3.5 flex-1 text-[13.5px] text-slate-600 leading-relaxed">“{{ t.text }}”</p>
          <div class="mt-5 pt-4 border-t border-slate-100 flex items-center gap-2.5">
            <UiAvatar :name="t.name" :size="36" />
            <div>
              <p class="text-[13.5px] font-semibold text-slate-800 font-ui">{{ t.name }}</p>
              <p class="text-[11.5px] text-slate-400">{{ t.role }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
