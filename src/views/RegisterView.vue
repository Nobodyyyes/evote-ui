<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { register } from '../store/auth'

const router = useRouter()
const fullName = ref('')
const username = ref('')
const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const error = ref('')

function submit(): void {
  error.value = ''

  if (password.value !== confirmPassword.value) {
    error.value = 'Пароли не совпадают'
    return
  }

  const success = register(fullName.value, username.value, email.value, password.value)
  if (!success) {
    error.value = 'Заполните все поля. Пароль должен быть минимум 4 символа.'
    return
  }

  router.push('/dashboard')
}
</script>

<template>
  <section class="auth-card card">
    <h1>Регистрация</h1>

    <form @submit.prevent="submit" class="form">
      <label>ФИО <input v-model="fullName" type="text" /></label>
      <label>Логин <input v-model="username" type="text" /></label>
      <label>Email <input v-model="email" type="email" /></label>
      <label>Пароль <input v-model="password" type="password" /></label>
      <label>Подтверждение пароля <input v-model="confirmPassword" type="password" /></label>

      <p v-if="error" class="error-text">{{ error }}</p>
      <button class="btn btn-primary" type="submit">Зарегистрироваться</button>
    </form>
  </section>
</template>
