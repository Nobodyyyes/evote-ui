<script setup lang="ts">
import {ref} from 'vue'
import {useRouter} from 'vue-router'
import {authState, register} from '../store/auth'

const router = useRouter()
const firstname = ref('')
const name = ref('')
const username = ref('')
const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const error = ref('')

async function submit(): Promise<void> {
  error.value = ''

  if (firstname.value === '') {
    error.value = "Введите фамилию..."
    return
  }

  if (name.value === '') {
    error.value = "Введите имя..."
    return
  }

  if (username.value === '') {
    error.value = "Введите логин..."
    return
  }

  if (password.value !== confirmPassword.value) {
    error.value = 'Пароли не совпадают'
    return
  }

  const success = await register(
      firstname.value,
      name.value,
      username.value,
      email.value,
      password.value,
      confirmPassword.value,
  )
  if (!success) {
    error.value = 'Не удалось зарегистрироваться...'
    return
  }

  router.push('/dashboard')
}
</script>

<template>
  <section class="auth-card card">
    <h1>Регистрация</h1>

    <form @submit.prevent="submit" class="form">
      <label>Фамилия <input v-model="firstname" type="text"/></label>
      <label>Имя <input v-model="name" type="text"/></label>
      <label>Логин <input v-model="username" type="text"/></label>
      <label>Email <input v-model="email" type="email"/></label>
      <label>Пароль <input v-model="password" type="password"/></label>
      <label>Подтверждение пароля <input v-model="confirmPassword" type="password"/></label>

      <p v-if="error" class="error-text">{{ error }}</p>
      <button class="btn btn-primary" type="submit" :disabled="authState.loading">
        {{ authState.loading ? 'Регистрация...' : 'Зарегистрироваться' }}
      </button>
    </form>
  </section>
</template>
