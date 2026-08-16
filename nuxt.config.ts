export default defineNuxtConfig({
  compatibilityDate: '2024-10-01',
  devtools: { enabled: false },
  modules: ['@nuxtjs/tailwindcss', '@pinia/nuxt', '@nuxt/icon', '@vueuse/motion/nuxt', 'vue-sonner/nuxt'],

  icon: {
    size: '1em',
    class: 'ms-icon',
    mode: 'svg',
    serverBundle: { collections: ['solar'] }
  },
  css: ['~/assets/css/main.css'],

  runtimeConfig: {
    supabaseServiceKey: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
    jwtSecret: process.env.JWT_SECRET || 'mapdocs-dev-secret-change-me',
    googleClientId: process.env.GOOGLE_CLIENT_ID || '',
    googleClientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    vnpTmnCode: process.env.VNP_TMN_CODE || '',
    vnpHashSecret: process.env.VNP_HASH_SECRET || '',
    vnpUrl: process.env.VNP_URL || 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html',
    commissionRate: process.env.COMMISSION_RATE || '0.15',
    public: {
      siteName: 'MapDocs',
      siteUrl: process.env.SITE_URL || 'http://localhost:3000',
      supabaseUrl: process.env.SUPABASE_URL || '',
      supabaseAnonKey: process.env.SUPABASE_ANON_KEY || '',
      googleClientId: process.env.GOOGLE_CLIENT_ID || ''
    }
  },

  app: {
    head: {
      htmlAttrs: { lang: 'vi' },
      title: 'MapDocs - Thư viện tài liệu học tập THPT',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: 'MapDocs - Nền tảng chia sẻ và mua bán tài liệu học tập THPT: đề thi, chuyên đề, bài giảng Toán, Lý, Hoá, Sinh, Văn, Anh.' },
        { name: 'theme-color', content: '#0b4a8f' },
        { property: 'og:type', content: 'website' },
        { property: 'og:site_name', content: 'MapDocs' }
      ],
      link: [
        { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@300;400;500;600;700;800&display=swap' }
      ]
    },
    pageTransition: { name: 'page', mode: 'out-in' },
    layoutTransition: { name: 'page', mode: 'out-in' }
  },

  nitro: { preset: process.env.NITRO_PRESET || 'node-server' },
  typescript: { strict: false, typeCheck: false },
  experimental: { payloadExtraction: false }
})
