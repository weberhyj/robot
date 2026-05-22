<script setup lang="ts">
import systemBg1366 from '@/assets/images/backgrounds/system-bg-1366.png'
import systemBg1920 from '@/assets/images/backgrounds/system-bg-1920.png'
import AppSidebar from '@/widgets/app-sidebar/AppSidebar.vue'
import BottomSystemBar from '@/widgets/bottom-system-bar/BottomSystemBar.vue'
import TopStatusBar from '@/widgets/top-status-bar/TopStatusBar.vue'
</script>

<template>
  <div
    class="workbench-layout"
    :style="{
      '--workbench-bg-1366': `url(${systemBg1366})`,
      '--workbench-bg-1920': `url(${systemBg1920})`,
    }"
  >
    <AppSidebar class="workbench-layout__sidebar" />

    <div class="workbench-layout__body">
      <TopStatusBar class="workbench-layout__topbar" />

      <main class="workbench-layout__content">
        <RouterView />
      </main>
    </div>

    <BottomSystemBar class="workbench-layout__bottombar" />
  </div>
</template>

<style scoped lang="scss">
.workbench-layout {
  --workbench-bg-image: var(--workbench-bg-1920);

  position: relative;
  isolation: isolate;
  display: grid;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  background:
    var(--workbench-bg-image) center / cover no-repeat,
    var(--rf-color-bg);
  grid-template-columns: clamp(232px, 15.2vw, 292px) minmax(0, 1fr);
  grid-template-rows: minmax(0, 1fr) 42px;

  &::before {
    position: absolute;
    inset: 0;
    z-index: 0;
    background: rgb(248 251 255 / 34%);
    -webkit-backdrop-filter: blur(6px);
    backdrop-filter: blur(6px);
    content: '';
    pointer-events: none;
  }

  &__sidebar {
    min-width: 0;
    min-height: 0;
  }

  &__body {
    display: grid;
    min-width: 0;
    min-height: 0;
    grid-template-rows: 60px minmax(0, 1fr);
  }

  &__topbar,
  &__bottombar {
    min-width: 0;
  }

  &__content {
    min-width: 0;
    min-height: 0;
    padding: 0 24px 16px 0;
    overflow: auto;
  }

  &__bottombar {
    grid-column: 1 / -1;
    min-width: 0;
  }

  &__sidebar,
  &__body,
  &__bottombar {
    position: relative;
    z-index: 1;
  }
}

@media (max-width: 1440px) {
  .workbench-layout {
    --workbench-bg-image: var(--workbench-bg-1366);

    &__content {
      padding: 0 16px 12px 0;
    }
  }
}
</style>
