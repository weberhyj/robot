<script setup lang="ts">
import type { AppPagePlaceholderProps } from './types'
import { useI18n } from 'vue-i18n'

defineProps<AppPagePlaceholderProps>()

const { t } = useI18n()
</script>

<template>
  <section class="page-placeholder">
    <div>
      <p class="page-placeholder__eyebrow">
        {{ t('app.consoleSubtitle') }}
      </p>
      <h1>{{ t(titleKey) }}</h1>
      <p>{{ t(descriptionKey) }}</p>
    </div>
  </section>
</template>

<style scoped lang="scss">
.page-placeholder {
  display: flex;
  min-height: 320px;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--rf-color-border);
  border-radius: 8px;
  background: var(--rf-color-panel);
  box-shadow: var(--rf-shadow-panel);
  text-align: center;

  &__eyebrow {
    margin: 0 0 10px;
    color: var(--rf-color-blue);
    font-size: 12px;
    font-weight: 700;
    letter-spacing: 0;
    text-transform: uppercase;
  }

  h1 {
    margin: 0;
    font-size: 26px;
    line-height: 1.2;
  }

  p {
    max-width: 520px;
    margin: 12px auto 0;
    color: var(--rf-color-text-muted);
    font-size: 14px;
    line-height: 1.7;
  }
}
</style>
