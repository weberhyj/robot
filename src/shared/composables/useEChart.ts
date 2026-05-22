import type { ECharts, EChartsOption } from 'echarts'
import type { Ref } from 'vue'
import * as echarts from 'echarts'
import { onBeforeUnmount, shallowRef, watch } from 'vue'

export function useEChart(chartRef: Ref<HTMLElement | null>, option: () => EChartsOption): void {
  const chart = shallowRef<ECharts>()

  function resize(): void {
    chart.value?.resize()
  }

  watch(
    chartRef,
    (element) => {
      if (!element) {
        return
      }

      chart.value = echarts.init(element)
      chart.value.setOption(option())
      window.addEventListener('resize', resize)
    },
    { immediate: true },
  )

  onBeforeUnmount(() => {
    window.removeEventListener('resize', resize)
    chart.value?.dispose()
  })
}
