<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { authState, logout } from '../store/auth'

const router = useRouter()
const user = computed(() => authState.user)

function handleLogout(): void {
  logout()
  router.push('/')
}
</script>

<template>
  <header class="app-header">
    <RouterLink to="/" class="logo">EVote System</RouterLink>

    <nav class="nav-links">
      <RouterLink v-if="!user" to="/login">Войти</RouterLink>
      <RouterLink v-if="!user" to="/register">Регистрация</RouterLink>

      <template v-if="user">
        <RouterLink to="/dashboard">Кабинет</RouterLink>
        <RouterLink to="/elections">Голосования</RouterLink>
        <RouterLink to="/profile">Профиль</RouterLink>
        <RouterLink v-if="user.role === 'ADMIN'" to="/admin">Админка</RouterLink>
        <RouterLink v-if="user.role === 'AUDITOR'" to="/admin/audit">Аудит</RouterLink>
      </template>
    </nav>

    <div v-if="user" class="user-box">
      <span>{{ user.username }} / {{ user.role }}</span>
      <button class="btn btn-light" @click="handleLogout">Выйти</button>
    </div>
  </header>
</template>
