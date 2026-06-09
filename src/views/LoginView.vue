<script setup lang="ts">
import {ref} from 'vue'
import {useRouter} from 'vue-router'
import {authState, login} from '../store/auth'
import {getDefaultRoute} from "../api/auth.ts";

const router = useRouter()
const username = ref('voter')
const password = ref('1234')
const error = ref('')

async function submit(): Promise<void> {
  error.value = ''

  const success = await login(username.value, password.value)
  if (!success) {
    error.value = 'Не удалось войти. Проверьте логин/email и пароль.'
    return
  }

  await router.replace(getDefaultRoute())
}
</script>

<template>
  <section class="auth-card card">
    <h1>Вход</h1>
    <p class="muted">Введите логин или email пользователя из backend.</p>

    <form @submit.prevent="submit" class="form">
      <label>
        Логин или email
        <input v-model="username" type="text" placeholder="voter"/>
      </label>

      <label>
        Пароль
        <input v-model="password" type="password" placeholder="Введите пароль"/>
      </label>

      <p v-if="error" class="error-text">{{ error }}</p>

      <button class="btn btn-primary" type="submit" :disabled="authState.loading">
        {{ authState.loading ? 'Вход...' : 'Войти' }}
      </button>
    </form>
  </section>
</template>
