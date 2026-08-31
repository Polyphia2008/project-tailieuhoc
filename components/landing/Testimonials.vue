<script setup lang="ts">
const ITEMS = [
  {
    name: 'Ngọc Anh',
    role: 'Học sinh lớp 12',
    text: 'Đề cương trên MapDocs được sắp xếp rất gọn, mình ôn thi nhanh hơn hẳn so với tự tổng hợp tài liệu rời rạc.'
  },
  {
    name: 'Minh Quân',
    role: 'Sinh viên năm 2',
    text: 'Mình đăng bán bộ chuyên đề tự soạn và nhận doanh thu đều mỗi tháng. Quy trình đối soát rõ ràng, không phải làm thủ công.'
  },
  {
    name: 'Cô Thu Hà',
    role: 'Giáo viên Ngữ văn',
    text: 'Tài liệu được kiểm duyệt kỹ nên mình yên tâm giới thiệu cho học sinh. Giao diện dùng cũng rất dễ với cả phụ huynh.'
  }
]
</script>

<template>
  <section id="testimonials" class="bg-muted/40 py-16 lg:py-20">
    <div class="container-x">
      <div class="mx-auto max-w-[620px] text-center">
        <p class="section-eyebrow">Cộng đồng nói gì</p>
        <h2 class="section-title">Được tin dùng mỗi ngày</h2>
        <p class="section-sub">Hàng nghìn học sinh, sinh viên và giáo viên đang học tập cùng MapDocs.</p>
      </div>

      <div class="mt-11 grid gap-4 md:grid-cols-3">
        <figure
          v-for="(t, i) in ITEMS"
          :key="t.name"
          v-motion
          :initial="{ opacity: 0, y: 26 }"
          :visible-once="{ opacity: 1, y: 0, transition: { duration: 520, delay: 70 + i * 90 } }"
          class="feature-v3"
        >
          <AppIcon name="solar:chat-square-2-bold-duotone" size="26" class="text-cmstdev-500/70" />
          <blockquote class="mt-3.5 text-[13.5px] leading-relaxed text-foreground/70">{{ t.text }}</blockquote>
          <figcaption class="mt-5 flex items-center gap-2.5 border-t border-border pt-4">
            <UiAvatar :name="t.name" :size="34" />
            <div>
              <p class="font-ui text-[13.5px] font-bold text-foreground">{{ t.name }}</p>
              <p class="text-[11.5px] text-foreground/50">{{ t.role }}</p>
            </div>
          </figcaption>
        </figure>
      </div>
    </div>
  </section>
</template>
