<script setup lang="ts">
import { bins, gripperMetrics, joints, logs, statusCards } from './data'
</script>

<template>
  <section class="realtime-monitor">
    <div class="realtime-monitor__main-card">
      <div class="status-grid">
        <article
          v-for="card in statusCards"
          :key="card.title"
          class="status-card"
          :class="`is-${card.tone}`"
        >
          <div class="status-card__signal">
            <span class="state-dot" :class="`is-${card.tone}`" />
          </div>
          <div class="status-card__content">
            <div class="status-card__header">
              <h3>{{ card.title }}</h3>
              <em>{{ card.state }}</em>
            </div>
            <strong>{{ card.main }}</strong>
            <small>{{ card.sub }}</small>
          </div>
        </article>
      </div>

      <div class="realtime-monitor__grid">
        <section class="panel conveyor-panel">
          <header class="panel__header">
            <div>
              <h2>传送带监控画面</h2>
            </div>
          </header>

          <div class="conveyor-scene">
            <div class="belt">
              <span v-for="index in 11" :key="index" />
            </div>
            <div class="box box-a">
              <strong>A类 · 金属壳体</strong>
              <small>X: 214.6 Y: 128.3</small>
            </div>
            <div class="box box-b">
              <strong>B类 · 塑料端盖</strong>
              <small>X: 386.2 Y: 104.9</small>
            </div>
            <div class="box box-ng">
              <strong>NG · 异形件</strong>
              <small>X: 612.8 Y: 142.7</small>
            </div>
            <div class="box box-c">
              <strong>C类 · 轴承座</strong>
              <small>X: 728.5 Y: 98.4</small>
            </div>
          </div>
        </section>

        <section class="panel log-panel">
          <header class="panel__header">
            <div>
              <h2>机器人实时操作日志</h2>
            </div>
            <el-tag type="success" effect="light" round>
              实时刷新
            </el-tag>
          </header>

          <div class="log-panel__summary">
            <div>
              <span>本批事件</span>
              <strong>286</strong>
            </div>
            <div>
              <span>执行成功</span>
              <strong class="text-green">279</strong>
            </div>
            <div>
              <span>待确认</span>
              <strong class="text-red">2</strong>
            </div>
          </div>

          <div class="log-panel__table">
            <div class="log-panel__head">
              <span>时间</span>
              <span>级别</span>
              <span>模块</span>
              <span>执行动作</span>
              <span>结果</span>
            </div>
            <div
              v-for="row in logs"
              :key="`${row.time}-${row.action}`"
              class="log-panel__row"
            >
              <time>{{ row.time }}</time>
              <strong :class="`text-${row.tone}`">{{ row.level }}</strong>
              <span>{{ row.module }}</span>
              <span>{{ row.action }}</span>
              <em :class="`text-${row.tone}`">{{ row.result }}</em>
            </div>
          </div>
        </section>
      </div>

      <div class="realtime-monitor__bottom">
        <section class="panel robot-panel">
          <header class="panel__header">
            <div>
              <h2>机械臂实时监控</h2>
            </div>
            <el-tag type="success" effect="light" round>
              运行中
            </el-tag>
          </header>

          <div class="robot-panel__body">
            <div class="joint-list">
              <div v-for="[name, value] in joints" :key="name">
                <span>{{ name }}</span>
                <strong>{{ value }}</strong>
              </div>
            </div>
            <div class="robot-figure">
              <span class="robot-figure__base" />
              <span class="robot-figure__arm robot-figure__arm-1" />
              <span class="robot-figure__arm robot-figure__arm-2" />
              <span class="robot-figure__arm robot-figure__arm-3" />
              <span class="robot-figure__joint robot-figure__joint-1" />
              <span class="robot-figure__joint robot-figure__joint-2" />
              <span class="robot-figure__joint robot-figure__joint-3" />
              <span class="robot-figure__tool" />
            </div>
          </div>

          <div class="robot-panel__footer">
            TCP：512.3 / -125.7 / 305.1 mm · 负载 28% · 速度 75%
          </div>
        </section>

        <section class="panel gripper-panel">
          <header class="panel__header">
            <div>
              <h2>夹爪实时监控</h2>
            </div>
            <el-tag type="success" effect="light" round>
              夹持中
            </el-tag>
          </header>

          <div class="gripper-panel__body">
            <div class="gripper-visual">
              <div class="gripper-visual__head" />
              <div class="gripper-visual__body" />
              <span class="gripper-visual__finger gripper-visual__finger-left" />
              <span class="gripper-visual__finger gripper-visual__finger-right" />
            </div>
            <div class="gripper-metrics">
              <div v-for="[label, value, progress] in gripperMetrics" :key="label">
                <div>
                  <span>{{ label }}</span>
                  <strong>{{ value }}</strong>
                </div>
                <el-progress :percentage="Number(progress)" :show-text="false" />
              </div>
            </div>
          </div>
        </section>

        <section class="panel bin-panel">
          <header class="panel__header">
            <div>
              <h2>料盒监控</h2>
            </div>
          </header>

          <div class="bin-panel__items">
            <article
              v-for="bin in bins"
              :key="bin.id"
              :class="`is-${bin.tone}`"
            >
              <div>
                <strong>{{ bin.id }}</strong>
                <span>{{ bin.label }}</span>
                <em>{{ bin.count }} 件</em>
              </div>
              <el-progress :percentage="bin.progress" :show-text="false" />
              <small>{{ bin.progress }}%</small>
            </article>
          </div>

          <div class="bin-panel__target">
            当前投放目标 <strong>A-01 · 预计 12 分钟满箱</strong>
          </div>
        </section>
      </div>
    </div>
  </section>
</template>

<style scoped lang="scss">
.realtime-monitor {
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

  &__grid {
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(360px, 480px);
    gap: 22px;
  }

  &__bottom {
    display: grid;
    grid-template-columns: minmax(360px, 1.2fr) minmax(300px, 0.9fr) minmax(260px, 300px);
    gap: 22px;
  }
}

.panel {
  border-radius: var(--rf-radius-panel);
  background: #fff;
  box-shadow: var(--rf-shadow-panel);
  padding: 18px 24px;

  &__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 14px;
    margin-bottom: 12px;

    h2 {
      margin: 0;
      font-size: 18px;
      line-height: 1;
    }
  }
}

.status-grid {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 14px;
}

.status-card {
  position: relative;
  --status-color: #22c55e;
  --status-soft: #ecfdf5;
  --status-ring: rgba(34, 197, 94, 0.16);
  display: grid;
  grid-template-columns: 34px minmax(0, 1fr);
  gap: 8px;
  min-width: 0;
  min-height: 82px;
  overflow: hidden;
  border-radius: 12px;
  background: linear-gradient(135deg, var(--status-soft), rgba(255, 255, 255, 0) 48%), #ffffff;
  box-shadow: 0 18px 34px -12px rgba(31, 43, 66, 0.08);
  padding: 12px;
  transition:
    box-shadow 160ms ease,
    transform 160ms ease;

  &::before {
    position: absolute;
    inset: 0 auto 0 0;
    width: 3px;
    background: var(--status-color);
    content: '';
  }

  &:hover {
    box-shadow: 0 20px 38px -12px rgba(31, 43, 66, 0.12);
    transform: translateY(-1px);
  }

  &.is-blue {
    --status-color: #2563eb;
    --status-soft: #eff6ff;
    --status-ring: rgba(37, 99, 235, 0.16);
  }

  &.is-yellow {
    --status-color: #f59e0b;
    --status-soft: #fffbeb;
    --status-ring: rgba(245, 158, 11, 0.18);
  }

  &__signal {
    display: grid;
    align-self: start;
    width: 34px;
    height: 34px;
    place-items: center;
    border-radius: 10px;
    background: var(--status-soft);
    box-shadow: inset 0 0 0 1px var(--status-ring);
  }

  &__content {
    display: grid;
    gap: 2px;
    min-width: 0;
  }

  &__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 6px;
    min-width: 0;
  }

  h3 {
    overflow: hidden;
    margin: 0;
    color: #0f172a;
    font-size: 13px;
    font-weight: 800;
    line-height: 1;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  strong {
    overflow: hidden;
    color: #172033;
    font-size: 15px;
    font-weight: 900;
    line-height: 1.15;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  small {
    overflow: hidden;
    color: #64748b;
    font-size: 11px;
    font-weight: 700;
    line-height: 1.2;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  em {
    flex: 0 0 auto;
    border-radius: 999px;
    background: var(--status-soft);
    color: var(--status-color);
    font-size: 10px;
    font-style: normal;
    font-weight: 900;
    line-height: 1;
    padding: 3px 7px;
  }
}

.state-dot {
  display: block;
  width: 11px;
  height: 11px;
  border-radius: 999px;
  background: var(--status-color);
  box-shadow: 0 0 0 5px var(--status-ring);

  &.is-green {
    background: #22c55e;
  }

  &.is-blue {
    background: #2563eb;
  }

  &.is-yellow {
    background: #f59e0b;
  }
}

.conveyor-panel {
  min-height: 350px;
}

.conveyor-scene {
  position: relative;
  height: 250px;
  overflow: hidden;
  border-radius: 10px;
  background: #f6f8fb;
}

.belt {
  position: absolute;
  right: 44px;
  bottom: 58px;
  left: 44px;
  height: 76px;
  border-radius: 24px;
  background: #dfe7f0;

  &::before {
    position: absolute;
    inset: 22px 26px auto;
    height: 4px;
    border-radius: 999px;
    background: #c4cfdd;
    content: '';
  }

  span {
    position: relative;
    display: inline-block;
    width: 40px;
    height: 4px;
    margin: 48px 16px 0;
    border-radius: 999px;
    background: #b8c3d3;
  }
}

.box {
  position: absolute;
  width: 112px;
  height: 78px;
  border: 3px solid;
  border-radius: 6px;

  strong {
    position: absolute;
    top: -30px;
    left: -4px;
    border-radius: 6px;
    color: #fff;
    font-size: 11px;
    padding: 6px 10px;
    white-space: nowrap;
  }

  small {
    position: absolute;
    right: 0;
    bottom: -22px;
    left: 0;
    color: #64748b;
    font-size: 10px;
    text-align: center;
  }
}

.box-a {
  top: 95px;
  left: 17%;
  border-color: #2563eb;

  strong {
    background: #2563eb;
  }
}

.box-b {
  top: 78px;
  left: 39%;
  border-color: #22c55e;

  strong {
    background: #22c55e;
  }
}

.box-ng {
  top: 98px;
  left: 62%;
  border-color: #ef4444;

  strong {
    background: #ef4444;
  }
}

.box-c {
  top: 68px;
  left: 78%;
  border-color: #64748b;

  strong {
    background: #64748b;
  }
}

.log-panel {
  min-height: 350px;

  &__summary {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    border-radius: 10px;
    background: #f8fafd;
    padding: 14px 18px;
    margin-bottom: 18px;

    span {
      display: block;
      color: #64748b;
      font-size: 12px;
    }

    strong {
      display: block;
      margin-top: 6px;
      color: #2563eb;
      font-size: 22px;
    }
  }

  &__head,
  &__row {
    display: grid;
    grid-template-columns: 64px 46px 60px 1fr 46px;
    gap: 12px;
    align-items: center;
    font-size: 11px;
  }

  &__head {
    height: 30px;
    color: #64748b;
    font-weight: 700;
  }

  &__row {
    height: 25px;
    border-radius: 7px;
    padding: 0 8px;

    &:nth-child(odd) {
      background: #f8fafd;
    }

    time {
      color: #64748b;
    }

    em {
      font-style: normal;
      font-weight: 700;
    }
  }
}

.robot-panel,
.gripper-panel,
.bin-panel {
  min-height: 320px;
}

.robot-panel {
  &__body {
    display: grid;
    grid-template-columns: 190px 1fr;
    gap: 24px;
    align-items: center;
  }

  &__footer {
    margin-top: 18px;
    border-radius: 8px;
    background: #f1f6ff;
    color: #334155;
    font-size: 12px;
    font-weight: 700;
    padding: 8px 14px;
  }
}

.joint-list {
  display: grid;
  gap: 14px;
  border-radius: 10px;
  background: #f8fafd;
  padding: 18px;

  div {
    display: flex;
    justify-content: space-between;
    font-size: 13px;
  }
}

.robot-figure {
  position: relative;
  height: 210px;

  span {
    position: absolute;
    display: block;
  }

  &__base {
    bottom: 36px;
    left: 32%;
    width: 44px;
    height: 72px;
    border-radius: 18px;
    background: linear-gradient(#edf2f7, #b8c4d3);
  }

  &__arm {
    height: 26px;
    border-radius: 999px;
    background: linear-gradient(90deg, #f8fafc, #cbd5e1);
    box-shadow: inset 0 0 0 1px #b8c3d3;
    transform-origin: left center;
  }

  &__arm-1 {
    bottom: 112px;
    left: 39%;
    width: 120px;
    transform: rotate(-20deg);
  }

  &__arm-2 {
    bottom: 128px;
    left: 56%;
    width: 88px;
    transform: rotate(34deg);
  }

  &__arm-3 {
    bottom: 76px;
    left: 66%;
    width: 76px;
    transform: rotate(80deg);
  }

  &__joint {
    width: 34px;
    height: 34px;
    border-radius: 999px;
    background: #e2e8f0;
    box-shadow: inset 0 0 0 5px #f8fafc;
  }

  &__joint-1 {
    bottom: 108px;
    left: 38%;
  }

  &__joint-2 {
    bottom: 120px;
    left: 56%;
  }

  &__joint-3 {
    bottom: 70px;
    left: 68%;
  }

  &__tool {
    right: 18%;
    bottom: 44px;
    width: 28px;
    height: 48px;
    border-radius: 12px;
    background: #cbd5e1;
  }
}

.gripper-panel {
  &__body {
    display: grid;
    grid-template-columns: 180px 1fr;
    gap: 26px;
  }
}

.gripper-visual {
  position: relative;
  height: 210px;
  border-radius: 10px;
  background: #f8fafd;

  &__head,
  &__body,
  &__finger {
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
  }

  &__head {
    top: 48px;
    width: 76px;
    height: 28px;
    border-radius: 12px 12px 4px 4px;
    background: linear-gradient(#dbeafe, #94a3b8);
  }

  &__body {
    top: 76px;
    width: 58px;
    height: 80px;
    border-radius: 12px;
    background: linear-gradient(#f8fafc, #cbd5e1);
    box-shadow: inset 0 0 0 1px #94a3b8;
  }

  &__finger {
    bottom: 34px;
    width: 22px;
    height: 72px;
    border-radius: 8px;
    background: #111827;
  }

  &__finger-left {
    margin-left: -26px;
    transform: rotate(10deg);
  }

  &__finger-right {
    margin-left: 26px;
    transform: rotate(-10deg);
  }
}

.gripper-metrics {
  display: grid;
  align-content: center;
  gap: 18px;

  div div {
    display: flex;
    justify-content: space-between;
    margin-bottom: 8px;
    font-size: 12px;
  }
}

.bin-panel {
  &__items {
    display: grid;
    gap: 20px;
  }

  article {
    border-radius: 10px;
    background: #f8fafd;
    padding: 18px;

    div {
      display: grid;
      grid-template-columns: 52px 1fr auto;
      gap: 12px;
      align-items: center;
      margin-bottom: 14px;
      font-size: 12px;
    }

    em {
      font-style: normal;
      font-weight: 800;
    }
  }

  &__target {
    margin-top: 28px;
    border-radius: 10px;
    background: #eaf6ff;
    color: #2563eb;
    font-size: 12px;
    padding: 14px;
    text-align: center;
  }
}

.text-green {
  color: #059669;
}

.text-blue {
  color: #2563eb;
}

.text-yellow {
  color: #b45309;
}

.text-red {
  color: #dc2626;
}

@media (max-width: 1440px) {
  .realtime-monitor {
    &__main-card {
      gap: 16px;
      min-height: calc(100vh - 136px);
      padding: 18px;
    }

    &__grid {
      grid-template-columns: minmax(0, 1fr) minmax(340px, 380px);
      gap: 16px;
    }

    &__bottom {
      grid-template-columns: minmax(340px, 1.1fr) minmax(290px, 0.95fr) minmax(236px, 0.75fr);
      gap: 16px;
    }
  }

  .panel {
    padding: 15px 18px;
  }

  .status-grid {
    gap: 12px;
  }

  .status-card {
    grid-template-columns: 30px minmax(0, 1fr);
    gap: 7px;
    min-height: 76px;
    padding: 11px;

    &__signal {
      width: 30px;
      height: 30px;
      border-radius: 9px;
    }

    h3 {
      font-size: 12px;
    }

    strong {
      font-size: 14px;
    }

    em {
      padding-inline: 7px;
    }
  }

  .conveyor-panel,
  .log-panel {
    min-height: 320px;
  }

  .conveyor-scene {
    height: 226px;
  }

  .robot-panel,
  .gripper-panel,
  .bin-panel {
    min-height: 292px;
  }

  .robot-panel__body,
  .gripper-panel__body {
    gap: 16px;
    grid-template-columns: minmax(150px, 180px) minmax(0, 1fr);
  }
}
</style>
