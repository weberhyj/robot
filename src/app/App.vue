<script setup lang="ts">
import enUS from 'element-plus/es/locale/lang/en'
import zhCN from 'element-plus/es/locale/lang/zh-cn'
import { computed } from 'vue'
import { useLocaleStore } from '@/stores/localeStore'

const localeStore = useLocaleStore()

const elementLocale = computed(() => {
  return localeStore.currentLocale === 'zh-CN' ? zhCN : enUS
})
</script>

<template>
  <el-config-provider :locale="elementLocale">
    <RouterView />
  </el-config-provider>
</template>
