<script setup lang="ts">
const ITEMS = [
  {
    icon: 'solar:lock-keyhole-minimalistic-bold-duotone',
    title: 'Bảo mật tuyệt đối',
    desc: 'Mọi tài liệu được lưu trữ mã hoá, link tải có thời hạn và chống chia sẻ trái phép.'
  },
  {
    icon: 'solar:rocket-2-bold-duotone',
    title: 'Tốc độ vượt trội',
    desc: 'Tải xuống tức thì nhờ hạ tầng phân phối nội dung tối ưu cho người học Việt Nam.'
  },
  {
    icon: 'solar:server-square-cloud-bold-duotone',
    title: 'Kho tài liệu lớn',
    desc: 'Hàng nghìn đề cương, đề thi thử và chuyên đề của 8 môn học được phân loại rõ ràng.'
  },
  {
    icon: 'solar:wallet-money-bold-duotone',
    title: 'Đăng bán nhận doanh thu',
    desc: 'Chia sẻ tài liệu của bạn và nhận tới 85% doanh thu, đối soát tự động minh bạch.'
  },
  {
    icon: 'solar:shield-check-bold-duotone',
    title: 'Kiểm duyệt kỹ lưỡng',
    desc: 'Mỗi tài liệu đều qua vòng thẩm định nội dung trước khi lên kệ công khai.'
  },
  {
    icon: 'solar:headphones-round-sound-bold-duotone',
    title: 'Hỗ trợ tận tâm',
    desc: 'Đội ngũ MapDocs phản hồi nhanh qua chat, email và hotline mỗi ngày làm việc.'
  }
]
</script>

<template>
  <section id="features" class="relative bg-background py-16 lg:py-20">
    <div class="container-x">
      <div class="mx-auto max-w-[620px] text-center">
        <p class="section-eyebrow">Vì sao chọn MapDocs</p>
        <h2 class="section-title">Nền tảng tài liệu học tập toàn diện</h2>
        <p class="section-sub">
          Tất cả những gì bạn cần để học tập hiệu quả và biến tri thức thành thu nhập, gói gọn trong một hệ thống.
        </p>
      </div>

      <div class="mt-11 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <article
          v-for="(f, i) in ITEMS"
          :key="f.title"
          v-motion
          :initial="{ opacity: 0, y: 28 }"
          :visible-once="{ opacity: 1, y: 0, transition: { duration: 520, delay: 60 + i * 70 } }"
          class="feature-v3"
        >
          <span class="hero-card-ic">
            <AppIcon :name="f.icon" size="23" />
          </span>
          <h3 class="mt-4 font-ui text-[16px] font-bold text-foreground">{{ f.title }}</h3>
          <p class="mt-2 text-[13.5px] leading-relaxed text-foreground/58">{{ f.desc }}</p>
        </article>
      </div>
    </div>
  </section>
</template>
