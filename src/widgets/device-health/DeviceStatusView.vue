<script setup lang="ts">
import type { EChartsOption } from 'echarts'
import { MoreFilled } from '@element-plus/icons-vue'
import { useTemplateRef } from 'vue'
import { useEChart } from '@/shared/composables'
import { alarms, devices, summaryItems } from './data'

function healthOption(): EChartsOption {
  return {
    color: ['#22c55e', '#2563eb', '#f59e0b', '#ef4444'],
    series: [
      {
        type: 'pie',
        radius: ['62%', '78%'],
        center: ['44%', '50%'],
        avoidLabelOverlap: true,
        label: { show: false },
        data: [
          { value: 8, name: '健康 90-100%' },
          { value: 2, name: '良好 70-89%' },
          { value: 1, name: '一般 50-69%' },
          { value: 1, name: '较差 0-49%' },
        ],
      },
    ],
  }
}

function trendOption(): EChartsOption {
  return {
    color: ['#2563eb', '#22c55e', '#f59e0b', '#64748b'],
    grid: { top: 20, right: 12, bottom: 26, left: 34 },
    tooltip: { trigger: 'axis' },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: ['00:00', '06:00', '12:00', '18:00', '24:00'],
      axisLabel: { color: '#64748b', fontSize: 10 },
    },
    yAxis: {
      type: 'value',
      min: 0,
      max: 100,
      axisLabel: { color: '#64748b', fontSize: 10 },
      splitLine: { lineStyle: { color: '#eef2f7' } },
    },
    series: [
      { name: '速度', type: 'line', smooth: true, data: [82, 76, 88, 84, 90] },
      { name: '温度', type: 'line', smooth: true, data: [62, 60, 65, 68, 64] },
      { name: '负载', type: 'line', smooth: true, data: [48, 54, 51, 57, 53] },
      { name: '标准压力占比', type: 'line', smooth: true, data: [72, 75, 78, 76, 80] },
    ],
  }
}

const healthChart = useTemplateRef<HTMLElement>('healthChart')
const trendChart = useTemplateRef<HTMLElement>('trendChart')

useEChart(healthChart, healthOption)
useEChart(trendChart, trendOption)
</script>

<template>
  <section class="device-status-view">
    <div class="device-status-view__main-card">
      <div class="summary-grid">
        <article
          v-for="item in summaryItems"
          :key="item.label"
          class="summary-card"
          :class="`is-${item.tone}`"
        >
          <span>{{ item.label }}</span>
          <strong>{{ item.value }}</strong>
          <small>{{ item.hint }}</small>
        </article>
      </div>

      <div class="device-grid">
        <article
          v-for="device in devices"
          :key="device.serial"
          class="device-card"
          :class="`is-${device.status}`"
        >
          <header>
            <div>
              <span class="state-dot" :class="`is-${device.status}`" />
              <h2>{{ device.name }}</h2>
            </div>
            <el-icon>
              <MoreFilled />
            </el-icon>
          </header>

          <div class="device-card__identity">
            <strong>{{ device.model }}</strong>
            <small>序列号：{{ device.serial }}</small>
          </div>

          <div class="device-card__meta">
            <div>
              <span>运行模式</span>
              <strong>{{ device.mode }}</strong>
            </div>
            <div>
              <span>运行时间</span>
              <strong>{{ device.runtime }}</strong>
            </div>
            <div>
              <span>健康度</span>
              <el-progress :percentage="device.health" :show-text="false" />
              <em>{{ device.health }}%</em>
            </div>
            <div>
              <span>固件版本</span>
              <strong>{{ device.firmware }}</strong>
            </div>
          </div>

          <el-tag v-if="device.badge" class="device-card__badge" type="danger" effect="light">
            {{ device.badge }}
          </el-tag>

          <button class="device-card__link" type="button">
            查看详情 ›
          </button>
        </article>
      </div>

      <div class="device-status-view__bottom">
        <section class="panel health-panel">
          <header class="panel__header">
            <div>
              <h2>设备健康分布</h2>
            </div>
          </header>
          <div class="health-panel__body">
            <div ref="healthChart" class="health-panel__chart" />
            <div class="health-panel__score">
              <strong>92%</strong>
              <span>整体健康度</span>
            </div>
            <div class="health-panel__legend">
              <span><i class="is-green" />健康 90-100% <b>8</b></span>
              <span><i class="is-blue" />良好 70-89% <b>2</b></span>
              <span><i class="is-yellow" />一般 50-69% <b>1</b></span>
              <span><i class="is-red" />较差 0-49% <b>1</b></span>
            </div>
          </div>
        </section>

        <section class="panel state-panel">
          <header class="panel__header">
            <div>
              <h2>设备状态统计</h2>
            </div>
            <el-button size="small">
              最近24小时
            </el-button>
          </header>
          <div class="state-panel__empty">
            <span class="state-dot is-green" />运行中
            <span class="state-dot is-blue" />待机中
            <span class="state-dot is-red" />报警中
            <span class="state-dot is-gray" />离线
          </div>
        </section>

        <section class="panel trend-panel">
          <header class="panel__header">
            <div>
              <h2>关键指标趋势</h2>
            </div>
            <el-button size="small">
              最近24小时
            </el-button>
          </header>
          <div ref="trendChart" class="trend-panel__chart" />
        </section>

        <section class="panel alarm-panel">
          <header class="panel__header">
            <div>
              <h2>近期报警</h2>
            </div>
            <el-button link>
              查看全部 ›
            </el-button>
          </header>
          <div class="alarm-panel__list">
            <article
              v-for="alarm in alarms"
              :key="alarm.code"
              :class="`is-${alarm.tone}`"
            >
              <span>!</span>
              <div>
                <strong>{{ alarm.title }}</strong>
                <small>{{ alarm.code }}</small>
              </div>
              <time>{{ alarm.time }}</time>
              <em>{{ alarm.status }}</em>
            </article>
          </div>
        </section>
      </div>
    </div>
  </section>
</template>

<style scoped lang="scss">
.device-status-view {
  min-width: 0;

  &__main-card {
    display: grid;
    gap: 22px;
    min-height: calc(100vh - 154px);
    border: 1px solid #dde4ee;
    border-radius: var(--rf-radius-shell);
    background: var(--rf-color-surface);
    box-shadow: var(--rf-shadow-raised);
    padding: 24px;
  }

  &__bottom {
    display: grid;
    grid-template-columns: 1fr 1fr 1.1fr 0.9fr;
    gap: 22px;
  }
}

.summary-grid {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 18px;
}

.summary-card {
  position: relative;
  height: 116px;
  border-radius: var(--rf-radius-panel);
  background: #fff;
  box-shadow: var(--rf-shadow-panel);
  padding: 19px 20px;

  span,
  small {
    display: block;
    color: #64748b;
    font-size: 12px;
    line-height: 1.05;
  }

  strong {
    display: block;
    margin-top: 8px;
    color: #2563eb;
    font-size: 30px;
    line-height: 1;
  }

  small {
    margin-top: 6px;
  }

  &.is-green strong {
    color: #16a34a;
  }

  &.is-red strong {
    color: #ef4444;
  }

  &.is-gray strong {
    color: #64748b;
  }
}

.device-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 22px;
}

.device-card {
  position: relative;
  min-height: 216px;
  border-radius: var(--rf-radius-panel);
  background: #fff;
  box-shadow: var(--rf-shadow-panel);
  padding: 22px 24px;

  header {
    display: flex;
    align-items: center;
    justify-content: space-between;

    div {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    h2 {
      margin: 0;
      font-size: 16px;
      line-height: 1;
    }
  }

  &__identity {
    margin: 22px 0 20px 138px;

    strong,
    small {
      display: block;
    }

    strong {
      font-size: 19px;
      font-weight: 500;
    }

    small {
      margin-top: 5px;
      color: #64748b;
      font-size: 12px;
    }
  }

  &__meta {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 22px;

    span {
      display: block;
      margin-bottom: 5px;
      color: #64748b;
      font-size: 11px;
    }

    strong {
      font-size: 12px;
      font-weight: 500;
    }

    em {
      display: block;
      margin-top: 6px;
      color: #16a34a;
      font-style: normal;
      font-size: 11px;
      font-weight: 700;
    }
  }

  &__badge {
    position: absolute;
    right: 34px;
    bottom: 96px;
  }

  &__link {
    display: block;
    border: 0;
    margin: 22px auto 0;
    background: transparent;
    color: #475569;
    cursor: pointer;
    font-size: 12px;
  }
}

.panel {
  min-height: 220px;
  border-radius: var(--rf-radius-panel);
  background: #fff;
  box-shadow: var(--rf-shadow-panel);
  padding: 18px 24px;

  &__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    margin-bottom: 8px;

    h2 {
      margin: 0;
      font-size: 16px;
      line-height: 1;
    }
  }
}

.health-panel {
  position: relative;

  &__body {
    position: relative;
    display: grid;
    grid-template-columns: 170px 1fr;
    min-height: 150px;
    align-items: center;
  }

  &__chart {
    width: 170px;
    height: 150px;
  }

  &__score {
    position: absolute;
    top: 58px;
    left: 42px;
    text-align: center;

    strong,
    span {
      display: block;
    }

    strong {
      font-size: 28px;
    }

    span {
      margin-top: 6px;
      color: #64748b;
      font-size: 11px;
    }
  }

  &__legend {
    display: grid;
    gap: 13px;
    font-size: 12px;

    span {
      display: grid;
      grid-template-columns: 12px 1fr 20px;
      gap: 8px;
      align-items: center;
    }

    i {
      width: 7px;
      height: 7px;
      border-radius: 999px;

      &.is-green {
        background: #22c55e;
      }

      &.is-blue {
        background: #2563eb;
      }

      &.is-yellow {
        background: #f59e0b;
      }

      &.is-red {
        background: #ef4444;
      }
    }
  }
}

.trend-panel__chart {
  height: 150px;
}

.state-panel {
  &__empty {
    display: flex;
    min-height: 146px;
    align-items: flex-start;
    gap: 24px;
    color: #64748b;
    font-size: 12px;
    padding-top: 18px;
  }
}

.alarm-panel {
  &__list {
    display: grid;
    gap: 10px;
  }

  article {
    display: grid;
    min-height: 44px;
    align-items: center;
    border-radius: 8px;
    background: #f8fafd;
    grid-template-columns: 28px 1fr 62px;
    padding: 8px 10px;

    > span {
      display: grid;
      width: 22px;
      height: 22px;
      place-items: center;
      border-radius: 6px;
      background: #fef2f2;
      color: #ef4444;
      font-weight: 800;
    }

    strong,
    small {
      display: block;
    }

    strong {
      font-size: 12px;
    }

    small,
    time {
      color: #64748b;
      font-size: 11px;
    }

    em {
      grid-column: 3;
      color: #ef4444;
      font-style: normal;
      font-size: 11px;
      font-weight: 700;
      text-align: right;
    }
  }
}

.state-dot {
  display: inline-block;
  width: 9px;
  height: 9px;
  border-radius: 999px;

  &.is-green {
    background: #22c55e;
  }

  &.is-blue {
    background: #2563eb;
  }

  &.is-red {
    background: #ef4444;
  }

  &.is-gray {
    background: #94a3b8;
  }
}

@media (max-width: 1440px) {
  .device-status-view {
    &__main-card {
      gap: 16px;
      min-height: calc(100vh - 136px);
      padding: 18px;
    }

    &__bottom {
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 16px;
    }
  }

  .summary-grid,
  .device-grid {
    gap: 14px;
  }

  .summary-card {
    height: 96px;
    padding: 16px;

    strong {
      font-size: 24px;
    }
  }

  .device-card {
    min-height: 198px;
    padding: 18px;

    &__identity {
      margin: 22px 0 20px 96px;
    }

    &__meta {
      gap: 14px;
    }
  }

  .panel {
    min-height: 206px;
    padding: 16px 18px;
  }
}
</style>
