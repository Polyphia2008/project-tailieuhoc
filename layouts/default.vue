<template>
  <div class="min-h-screen flex flex-col bg-slate-50">
    <LayoutSiteHeader />
    <main class="flex-1"><slot /></main>
    <LayoutSiteFooter />
  </div>
</template>
