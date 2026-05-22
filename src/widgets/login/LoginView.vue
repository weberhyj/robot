<script setup lang="ts">
import type { FormInstance, FormRules } from 'element-plus'
import type { Component } from 'vue'
import type { LoginFormModel } from './types'
import { Box, Camera, CircleCheck, Lock, Operation, TakeawayBox, User } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { computed, onBeforeUnmount, reactive, shallowRef } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import loginBackground from '@/assets/images/login/login-background.png'
import { loginStatusMetrics } from './data'

const { locale, t } = useI18n()
const router = useRouter()

const loginFormRef = shallowRef<FormInstance>()
const loginLoading = shallowRef(false)
const loginTimer = shallowRef<number>()
const now = shallowRef(new Date())

const iconMap: Record<string, Component> = {
  camera: Camera,
  conveyor: TakeawayBox,
  robot: Operation,
  sorting: Box,
}

const clockTimer = window.setInterval(() => {
  now.value = new Date()
}, 1000)

const formModel = reactive<LoginFormModel>({
  account: 'operator01',
  password: '',
  remember: true,
})

const formRules = computed<FormRules<LoginFormModel>>(() => ({
  account: [{ required: true, message: t('login.validation.accountRequired'), trigger: 'blur' }],
  password: [{ required: true, message: t('login.validation.passwordRequired'), trigger: 'blur' }],
}))

const timeText = computed<string>(() => {
  const timeLocale = locale.value === 'zh-CN' ? 'zh-CN' : 'en-GB'
  return now.value.toLocaleTimeString(timeLocale, { hour12: false })
})

async function submitLogin(): Promise<void> {
  if (!loginFormRef.value)
    return

  const isValid = await loginFormRef.value.validate().catch(() => false)
  if (!isValid)
    return

  loginLoading.value = true

  loginTimer.value = window.setTimeout(() => {
    loginLoading.value = false
    ElMessage.success(t('login.messages.loginSuccess'))
    void router.push('/dashboard')
  }, 420)
}

function showPasswordHelp(): void {
  ElMessage.info(t('login.messages.passwordHelp'))
}

onBeforeUnmount(() => {
  window.clearInterval(clockTimer)

  if (loginTimer.value)
    window.clearTimeout(loginTimer.value)
})
</script>

<template>
  <section class="login-view" :aria-label="t('login.overviewLabel')">
    <img class="login-view__background" :src="loginBackground" :alt="t('login.backgroundAlt')">
    <div class="login-view__wash" aria-hidden="true" />

    <RouterLink class="login-view__brand" to="/dashboard">
      <el-icon :size="34">
        <Operation />
      </el-icon>
      <span>
        <strong>{{ t('app.name') }}</strong>
        <small>{{ t('login.brandSubtitle') }}</small>
      </span>
    </RouterLink>

    <main class="login-view__content">
      <section class="login-view__card">
        <div class="login-view__card-icon">
          <el-icon :size="32">
            <Operation />
          </el-icon>
        </div>

        <header class="login-view__card-heading">
          <h1>{{ t('login.title') }}</h1>
          <p>{{ t('login.subtitle') }}</p>
        </header>

        <el-form
          ref="loginFormRef" class="login-view__form" :model="formModel" :rules="formRules"
          @submit.prevent="submitLogin"
        >
          <el-form-item prop="account">
            <div class="login-view__input-row">
              <el-icon :size="23">
                <User />
              </el-icon>
              <span>{{ t('login.form.account') }}</span>
              <i aria-hidden="true" />
              <el-input
                v-model="formModel.account" autocomplete="username" :aria-label="t('login.form.account')"
                :placeholder="t('login.form.accountPlaceholder')"
              />
            </div>
          </el-form-item>

          <el-form-item prop="password">
            <div class="login-view__input-row">
              <el-icon :size="23">
                <Lock />
              </el-icon>
              <span>{{ t('login.form.password') }}</span>
              <i aria-hidden="true" />
              <el-input
                v-model="formModel.password" autocomplete="current-password"
                :aria-label="t('login.form.password')" :placeholder="t('login.form.passwordPlaceholder')" show-password
                type="password"
              />
            </div>
          </el-form-item>

          <div class="login-view__form-extra">
            <el-checkbox v-model="formModel.remember">
              {{ t('login.form.remember') }}
            </el-checkbox>
            <el-button link type="primary" @click="showPasswordHelp">
              {{ t('login.form.forgotPassword') }}
            </el-button>
          </div>

          <el-button class="login-view__submit" native-type="submit" type="primary" :loading="loginLoading">
            {{ t('login.actions.login') }}
          </el-button>
        </el-form>

        <footer class="login-view__card-footer">
          <div>
            <span class="state-dot" aria-hidden="true" />
            <strong>{{ t('login.systemOnline') }}</strong>
            <span>{{ t('login.productionReady') }}</span>
          </div>
          <time>{{ timeText }}</time>
        </footer>
      </section>
    </main>

    <aside class="login-view__status-layer" :aria-label="t('login.statusLayerLabel')">
      <article
        v-for="metric in loginStatusMetrics" :key="metric.labelKey" class="login-view__status-card"
        :class="`is-${metric.placement}`"
      >
        <el-icon :size="34">
          <component :is="iconMap[metric.icon]" />
        </el-icon>
        <div>
          <strong>{{ t(metric.labelKey) }}</strong>
          <span>
            <i class="state-dot" aria-hidden="true" />
            {{ t('login.metrics.online') }}
          </span>
        </div>
      </article>
    </aside>

    <footer class="login-view__page-footer">
      <span>
        <el-icon :size="18">
          <CircleCheck />
        </el-icon>
        {{ t('login.footer.security') }}
      </span>
      <span>{{ t('login.footer.copyright') }}</span>
    </footer>
  </section>
</template>

<style scoped lang="scss">
.login-view {
  position: relative;
  min-width: 1280px;
  min-height: 100vh;
  overflow: hidden;
  background: #edf3fb;

  &__background,
  &__wash {
    position: absolute;
    inset: 0;
  }

  &__background {
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: center;
  }

  &__wash {
    background:
      linear-gradient(
        90deg,
        rgb(246 250 255 / 92%) 0%,
        rgb(246 250 255 / 76%) 32%,
        rgb(246 250 255 / 18%) 68%,
        rgb(246 250 255 / 0%) 100%
      ),
      linear-gradient(180deg, rgb(255 255 255 / 24%) 0%, rgb(255 255 255 / 0%) 48%, rgb(239 245 252 / 78%) 100%);
  }

  &__brand {
    position: absolute;
    z-index: 2;
    top: 48px;
    left: 74px;
    display: inline-flex;
    align-items: center;
    gap: 15px;
    color: #0f243f;
    text-decoration: none;

    .el-icon {
      color: #2878ff;
    }

    strong,
    small {
      display: block;
    }

    strong {
      font-size: 27px;
      font-weight: 900;
      letter-spacing: 2px;
      line-height: 1.02;
    }

    small {
      margin-top: 7px;
      color: #1a3558;
      font-size: 18px;
      font-weight: 800;
      letter-spacing: 4px;
      line-height: 1;
    }
  }

  &__content {
    position: relative;
    z-index: 2;
    display: flex;
    min-height: 100vh;
    align-items: center;
    padding: 118px 0 98px 138px;
  }

  &__card {
    width: 500px;
    overflow: hidden;
    border: 1px solid rgb(255 255 255 / 82%);
    border-radius: 18px;
    background: rgb(255 255 255 / 88%);
    box-shadow: 0 22px 54px rgb(64 89 124 / 13%);
    backdrop-filter: blur(12px);
  }

  &__card-icon {
    display: grid;
    width: 68px;
    height: 68px;
    place-items: center;
    border: 1px solid #edf4ff;
    border-radius: 17px;
    background: rgb(255 255 255 / 88%);
    box-shadow: 0 12px 26px rgb(46 95 166 / 8%);
    color: #2878ff;
    margin: 38px auto 14px;
  }

  &__card-heading {
    text-align: center;

    h1 {
      margin: 0;
      color: #102644;
      font-size: 27px;
      font-weight: 900;
      letter-spacing: 1px;
      line-height: 1.2;
    }

    p {
      margin: 7px 0 0;
      color: #677a92;
      font-size: 14px;
      font-weight: 500;
      letter-spacing: 0;
    }

    &::after {
      display: block;
      width: 34px;
      height: 2px;
      border-radius: 999px;
      background: #2878ff;
      content: '';
      margin: 16px auto 0;
    }
  }

  &__form {
    display: grid;
    gap: 0;
    padding: 24px 40px 22px;

    :deep(.el-form-item) {
      margin-bottom: 16px;
    }

    :deep(.el-form-item__content) {
      display: block;
    }

    :deep(.el-input__wrapper) {
      height: 50px;
      border-radius: 0 8px 8px 0;
      background: transparent;
      box-shadow: none;
      padding: 0 14px 0 16px;
    }

    :deep(.el-input__inner) {
      color: #20344f;
      font-size: 14px;
      font-weight: 700;
    }
  }

  &__input-row {
    display: grid;
    height: 58px;
    grid-template-columns: 28px 40px 1px minmax(0, 1fr);
    align-items: center;
    border: 1px solid #d7e3f2;
    border-radius: 8px;
    background: rgb(255 255 255 / 80%);
    color: #102644;
    padding-left: 17px;
    transition:
      border-color 180ms var(--rf-ease-out),
      box-shadow 180ms var(--rf-ease-out),
      background-color 180ms var(--rf-ease-out);

    &:focus-within {
      border-color: #7fb0ff;
      background: rgb(255 255 255 / 92%);
      box-shadow: 0 0 0 4px rgb(40 120 255 / 9%);
    }

    > .el-icon {
      color: #17375e;
    }

    > span {
      font-size: 15px;
      font-weight: 900;
    }

    > i {
      display: block;
      height: 24px;
    }
  }

  &__form-extra {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin: -1px 0 22px;

    :deep(.el-checkbox__label),
    :deep(.el-button) {
      font-size: 13px;
      font-weight: 800;
    }

    :deep(.el-checkbox__label) {
      color: #6b7e95;
    }
  }

  &__submit {
    width: 100%;
    height: 56px;
    border: 0;
    border-radius: 8px;
    background: #2878ff;
    box-shadow: 0 12px 22px rgb(40 120 255 / 16%);
    font-size: 20px;
    font-weight: 900;
    letter-spacing: 1px;

    &:hover,
    &:focus {
      background: #1f6ef2;
    }
  }

  &__card-footer {
    display: flex;
    height: 62px;
    align-items: center;
    justify-content: space-between;
    border-top: 1px solid #e7eef7;
    color: #64748b;
    padding: 0 40px;

    div {
      display: flex;
      align-items: center;
      gap: 10px;
      min-width: 0;
    }

    .state-dot {
      width: 10px;
      height: 10px;
      flex: 0 0 10px;
      border-radius: 999px;
      background: #18c878;
    }

    strong {
      color: #34445c;
      font-size: 14px;
      font-weight: 900;
    }

    span {
      color: #7a8aa0;
      font-size: 13px;
      font-weight: 700;
    }

    time {
      position: relative;
      color: #53657d;
      font-size: 15px;
      font-weight: 700;
      padding-left: 28px;

      &::before {
        position: absolute;
        top: 50%;
        left: 0;
        width: 1px;
        height: 22px;
        background: #dce5f0;
        content: '';
        transform: translateY(-50%);
      }
    }
  }

  &__status-layer {
    position: absolute;
    inset: 0;
    z-index: 2;
    pointer-events: none;
  }

  &__status-card {
    position: absolute;
    display: flex;
    width: 176px;
    height: 88px;
    align-items: center;
    gap: 17px;
    border: 1px solid rgb(255 255 255 / 82%);
    border-radius: 10px;
    background: rgb(255 255 255 / 72%);
    box-shadow: 0 16px 36px rgb(64 89 124 / 11%);
    color: #2878ff;
    padding: 0 20px;
    backdrop-filter: blur(12px);

    &.is-vision {
      top: 23%;
      left: 47%;
    }

    &.is-robot {
      top: 23%;
      right: 6%;
    }

    &.is-conveyor {
      top: 51%;
      left: 44%;
    }

    &.is-sorting {
      right: 12%;
      bottom: 15%;
    }

    strong,
    span {
      display: block;
      white-space: nowrap;
    }

    strong {
      color: #21344f;
      font-size: 16px;
      font-weight: 900;
      line-height: 1.2;
    }

    span {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-top: 9px;
      color: #243853;
      font-size: 13px;
      font-weight: 700;
    }

    .state-dot {
      width: 9px;
      height: 9px;
      border-radius: 999px;
      background: #18c878;
    }
  }

  &__page-footer {
    position: absolute;
    z-index: 2;
    right: 72px;
    bottom: 34px;
    left: 72px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    color: #6d7f96;
    font-size: 15px;
    font-weight: 700;

    span {
      display: inline-flex;
      align-items: center;
      gap: 10px;
    }

    .el-icon {
      color: #526983;
    }
  }
}

@media (max-width: 1440px) {
  .login-view {
    &__brand {
      top: 34px;
      left: 52px;
    }

    &__content {
      padding: 92px 0 78px 90px;
    }

    &__card {
      width: 456px;
    }

    &__card-icon {
      width: 62px;
      height: 62px;
      margin-top: 32px;
    }

    &__card-heading h1 {
      font-size: 25px;
    }

    &__form {
      padding: 22px 34px 20px;
    }

    &__card-footer {
      padding: 0 34px;
    }

    &__status-card {
      width: 150px;
      height: 78px;
      gap: 12px;
      padding: 0 16px;

      strong {
        font-size: 14px;
      }
    }

    &__page-footer {
      right: 48px;
      bottom: 24px;
      left: 48px;
      font-size: 13px;
    }
  }
}
</style>
