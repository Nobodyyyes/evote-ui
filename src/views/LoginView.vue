<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { login } from '../store/auth'

const router = useRouter()
const loginValue = ref('voter')
const password = ref('1234')
const error = ref('')

function submit(): void {
  error.value = ''

  const success = login(loginValue.value, password.value)
  if (!success) {
    error.value = 'Введите логин/email и пароль'
    return
  }

  router.push('/dashboard')
}
</script>

<template>
  <section class="auth-card card">
    <h1>Вход</h1>
    <p class="muted">Для демо: voter / admin / auditor, пароль любой непустой.</p>

    <form @submit.prevent="submit" class="form">
      <label>
        Логин или email
        <input v-model="loginValue" type="text" placeholder="voter" />
      </label>

      <label>
        Пароль
        <input v-model="password" type="password" placeholder="Введите пароль" />
      </label>

      <p v-if="error" class="error-text">{{ error }}</p>

      <button class="btn btn-primary" type="submit">Войти</button>
    </form>
  </section>
</template>
